# Qualtrics ↔ ctac.app Integration Runbook

**For:** Josh, building the consent survey in Qualtrics (planned 8/20–8/21).
**Written:** 2026-08-15 (Draft 76). Every request/response below was checked
against the deployed edge-function sources on this date: `mint-access-code`
v1, `validate-code` v3, `update-session-progress` v2.

The ctac.app side of this handshake is fully built and smoke-tested (see
`scripts/qualtrics-smoke.mjs`). This document walks the Qualtrics side in
survey-flow order. When you finish section 6, run section 7 together with
the ctac.app function logs open.

**The shape of the whole thing:** a caregiver completes consent in
Qualtrics → Qualtrics mints two single-use access codes from ctac.app
(intervention now, follow-up for later) and emails the intervention link →
the youth completes the program → ctac.app POSTs a completion webhook back
to Qualtrics → Qualtrics marks the record complete, notifies the
caregiver, and schedules the 90-day follow-up email with the pre-minted
follow-up link. Qualtrics is the source of truth for identity; ctac.app
stores no caregiver emails — the two sides meet only on `external_ref`
(= the Qualtrics ResponseID).

---

## 1. Embedded-data fields (Survey Flow)

Add an **Embedded Data** element at the TOP of the survey flow (before any
blocks) declaring these fields, all initially blank:

| Field | Filled by | Used in |
|---|---|---|
| `intervention_code` | mint call #1 response | record-keeping / support lookups |
| `intervention_url` | mint call #1 response | consent-receipt + delivery emails |
| `followup_code` | mint call #2 response | record-keeping |
| `followup_url` | mint call #2 response | the 90-day email (step 5) |
| `delivery_email` | consent form question | where the intervention link is sent |
| `study_completed` | completion-webhook workflow | gating the incentive + follow-up scheduling |
| `followup_completed` | follow-up webhook workflow | second confirmation email |
| `completed_at` | completion-webhook workflow | anchors the 90-day timer |

(`ResponseID` is built into Qualtrics — no field needed; it's piped
directly into the mint calls below.)

## 2. The two mint calls (fired on consent submission)

Add two **Web Service** elements in the survey flow, placed AFTER the
consent block's end-of-survey confirmation logic (they must only fire on a
completed, consented response).

Both calls are identical except for the JSON body:

- **URL:** `https://fflezknnpmbemeqyqxml.supabase.co/functions/v1/mint-access-code`
- **Method:** `POST`
- **Headers:**
  - `Content-Type`: `application/json`
  - `x-partner-key`: the partner key (set as a Qualtrics *credential /
    secure embedded field*, NOT typed into a visible field — the value was
    handed off in chat and lives in Supabase as the
    `PARTNER_API_KEY_QUALTRICS` secret; never print it in the survey or
    this doc)

**Call #1 — intervention code** (body, with Qualtrics piped text for the
ResponseID; set the expiry ~30 days out using Qualtrics date math or omit
`expires_at` and let the team deactivate stale codes manually):

```json
{
  "intervention_slug": "ready-set-dedicate",
  "external_ref": "${e://Field/ResponseID}",
  "max_uses": 1,
  "cohort_label": "beta-2026-08",
  "expires_at": "<ISO 8601, ~30 days out>"
}
```

**Call #2 — follow-up code** (same headers; expiry ~120 days out so it's
alive when the 90-day email lands):

```json
{
  "intervention_slug": "rsd-follow-up-90d",
  "external_ref": "${e://Field/ResponseID}",
  "max_uses": 1,
  "cohort_label": "beta-2026-08",
  "expires_at": "<ISO 8601, ~120 days out>"
}
```

**Response** (both calls; map these in the Web Service element's "Set
Embedded Data" section):

```json
{
  "code": "RSD-XXXX-XXXX",
  "intervention_slug": "ready-set-dedicate",
  "url": "https://ssi.ctac.app/?code=RSD-XXXX-XXXX",
  "expires_at": "2026-09-14T00:00:00.000Z",
  "external_ref": "R_abc123..."
}
```

Map: `code` → `intervention_code`, `url` → `intervention_url` (call #1);
`code` → `followup_code`, `url` → `followup_url` (call #2). The `url`
field is the complete participant link — don't reconstruct it.

**Error cases** (all JSON with an `error` string): `401` bad/missing
partner key; `400` disallowed slug or malformed body; `409`
inactive/unpublished intervention; `404` unknown slug. A `5xx` or timeout
means retry — codes are only created on a `200`.

**Single-use semantics you can rely on:** re-entering a code (or
re-clicking the emailed link) does NOT burn it. `validate-code` v3 returns
the participant's existing session on re-entry — closed-browser resume is
built in. `max_uses: 1` means "one participant."

## 3. The two triggered emails

Fired from the same consent-completion trigger, after the Web Service
elements:

1. **Consent receipt → caregiver's email** — includes the intervention
   link (`${e://Field/intervention_url}`).
2. **Intervention link → `${e://Field/delivery_email}`** — the youth-facing
   invitation.

⚠️ **Outlook button landmine** (from STATE_OF_THE_PLATFORM): "Word's HTML
engine silently strips the entire background property when it sees
`linear-gradient`. Use the table-based solid-background button pattern
from `docs/supabase_invite_email_template.html`." Copy that file's CTA
table verbatim and swap the href for the piped URL. Solid `#00A79D`
button, `#0E1F56` header — no gradients anywhere in email HTML.

Do NOT put the follow-up URL in these emails — it's delivered by the
90-day workflow (section 5).

## 4. The completion-webhook receiver

Create a Qualtrics **Workflow** with a **JSON Event** (inbound web
service) trigger:

1. Workflows → Create → Event-based → "JSON event". Qualtrics displays
   the inbound URL when you create it.
2. **That URL becomes the `QUALTRICS_COMPLETION_WEBHOOK_URL` secret** in
   Supabase (dashboard → Project Settings → Edge Functions → Secrets). If
   the JSON event requires an auth header, put its token in
   `QUALTRICS_API_TOKEN` — ctac.app sends it as `X-API-TOKEN` on every
   webhook POST. If no auth is required, leave `QUALTRICS_API_TOKEN`
   unset (the header is simply omitted).
3. The inbound payload ctac.app sends (exact shape, from
   `update-session-progress` v2 — fired once, on the FIRST transition to
   completed, only for codes that carry an `external_ref`; one retry after
   2s on 5xx/network errors, never on 4xx):

```json
{
  "external_ref": "R_abc123...",
  "code": "RSD-XXXX-XXXX",
  "intervention_slug": "ready-set-dedicate",
  "session_id": "9b1f...uuid",
  "completed_at": "2026-08-28T19:04:11.000Z"
}
```

4. Workflow steps after the trigger:
   - Match the response by `external_ref` (= ResponseID).
   - Branch on `intervention_slug`:
     - `ready-set-dedicate` → set `study_completed` = true, set
       `completed_at`, send the caregiver confirmation email, hand off to
       the incentive workflow (separate), and arm the 90-day timer.
     - `rsd-follow-up-90d` → set `followup_completed` = true, send the
       second confirmation email, hand off to the second incentive.

## 5. The 90-day follow-up email

A scheduled Qualtrics workflow firing **90 days after `completed_at`**:
email to the caregiver containing `${e://Field/followup_url}` (pre-minted
at consent — no new mint call). The follow-up intervention
(`rsd-follow-up-90d`) is live in production as of 2026-08-15 (Draft 75),
so this link works the moment the email sends.

## 6. Secrets checklist

Supabase dashboard → Project Settings → Edge Functions → Secrets:

| Secret | Status (2026-08-15) | Produced by |
|---|---|---|
| `PARTNER_API_KEY_QUALTRICS` | ❌ **NOT SET** — the smoke harness proved mint returns 500 "Server misconfigured" today, despite STATE_OF_THE_PLATFORM's "handed off in chat" note. Set it (reuse the May value if you still have it, or generate a fresh one) BEFORE building the Web Service elements. | Josh, in the Supabase dashboard; the same value goes in the Qualtrics `x-partner-key` header |
| `QUALTRICS_COMPLETION_WEBHOOK_URL` | ❌ TBD | section 4 step 1–2 (Thursday) |
| `QUALTRICS_API_TOKEN` | ❌ TBD (may stay unset) | section 4 step 2, only if the JSON event needs header auth |

After setting the partner key, re-run the harness with it in the env to
green the mint legs end to end:

```bash
PARTNER_API_KEY_QUALTRICS=<the-key> node scripts/qualtrics-smoke.mjs
```

Until the webhook URL is set, completions are safe: the webhook is a
**silent no-op** (verified in source) — sessions still complete and stamp
`completed_at`; Qualtrics just doesn't hear about them.

## 7. Joint end-to-end test script (run Thursday, both sides live)

Work through in order; each step has a pass condition. Keep the Supabase
function logs open (dashboard → Edge Functions → logs) and `/admin/codes`
in another tab.

- [ ] **Fake consent** — submit the consent survey with your own emails.
- [ ] **Codes minted** — both Web Service elements returned 200; the four
      embedded-data fields are populated on the response; `/admin/codes`
      shows both codes with the same `external_ref` (= the ResponseID),
      `max_uses` 1, correct expiries.
- [ ] **Emails arrive** — consent receipt + delivery email, button renders
      in Outlook (no missing background).
- [ ] **Link entry** — click the intervention link; assent screen loads.
- [ ] **Resume check** — answer a few items, close the browser entirely,
      re-click the SAME link → "Welcome back — picking up where you left
      off." at the right spot (not "already been used").
- [ ] **Full completion** — finish the program → celebration screen.
- [ ] **Webhook received** — the Qualtrics JSON event fired once;
      `[qualtrics-webhook try1] ok` in the function logs;
      `study_completed` = true on the response.
- [ ] **Caregiver confirmation email** arrives.
- [ ] **(Optional now / required before real 90-day sends)** — manually
      trigger the follow-up email step, click the follow-up link,
      complete the check-in → second webhook with
      `intervention_slug: "rsd-follow-up-90d"` → `followup_completed` =
      true → second confirmation.
- [ ] **Cleanup** — deactivate the two test codes in `/admin/codes`.

If any webhook step fails: check the function logs for
`[qualtrics-webhook try1] non-ok` (the log line includes Qualtrics's
response status + first 500 chars of its body).
