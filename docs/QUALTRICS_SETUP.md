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

> **⚠️ CORRECTED 2026-08-15 — use a Workflow, not Survey Flow web service
> elements.** Survey Flow **Web Service elements do not execute** on real
> submissions here: two live anonymous-link submissions with consent = Yes
> were recorded and `mint-access-code` received **zero** requests — not a
> 401, not a 500; Qualtrics never opened the connection. Placement, config,
> and publish state were all verified correct; the Survey Flow gives no
> execution logs, which is why it went unnoticed for weeks. Minting is
> therefore built as a **Qualtrics Workflow** (`WF_lFfvg4FT5Ltm9SA`), which
> does have per-run history and error detail: event = survey response
> (newly created only) → decision = consent `QID10` is `Yes` → task =
> authenticated WebService POST. **The two dead Survey Flow elements must
> be deleted** — if they ever start firing alongside the Workflow, every
> consent would mint four codes instead of two. The request/response
> contracts below are unchanged and still authoritative; only the mechanism
> that sends them changed.

- **URL:** `https://fflezknnpmbemeqyqxml.supabase.co/functions/v1/mint-access-code`
- **Method:** `POST`
- **Headers:**
  - `Content-Type`: `application/json`
  - The partner key, sent **either** way — the function accepts both
    (Draft 84):
    - `Authorization: <token>` — what a **Workflow** WebService task's
      stored "API key" credential sends. Its credential editor exposes only
      Name / API Token / mTLS, so the header name can't be changed; the
      function reads it there (a `Bearer ` prefix is tolerated).
    - `x-partner-key: <token>` — the documented primary, still preferred
      wherever the header name *can* be set. Wins if both are present.
  - Either way the key must live in the Qualtrics **credential store**, not
    typed into a visible field or a plaintext custom header. It lives in
    Supabase as the `PARTNER_API_KEY_QUALTRICS` secret (confirmed set —
    see §8.5); never print it in the survey or this doc.
  - **Prefer `x-partner-key` wherever the header name can be set.** The
    Supabase gateway logs the first 10 characters of an unrecognized
    `Authorization` value into `function_edge_logs`; `x-partner-key` is
    never captured. `Authorization` exists so the Workflow — which cannot
    rename its header — works at all. Treat the key as lower-trust material
    on a rotation schedule for as long as it travels that way.

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
   `update-session-progress` v3 — fired once, on the FIRST transition to
   completed, only for codes that carry an `external_ref`; up to 3 attempts
   with 2s/4s backoff on 5xx/network errors, never on 4xx; runs in the
   background so it never delays the participant's completion screen; the
   outcome is recorded on the session — see "Delivery records" below):

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
   - **Recommended guard:** condition the email/incentive steps on the
     flag NOT already being set. Flag-setting is naturally idempotent, but
     a duplicate delivery (e.g. a manual re-fire after a delivery that
     failed to record) would otherwise re-send the confirmation email.

### Delivery records + recovery (Draft 82)

Every completion's webhook outcome is persisted to
`sessions.metadata_json.webhook`:
`{ status: 'delivered'|'failed'|'skipped', at, attempts, reason?,
last_error?, last_http_status? }` — `skipped` means there was nothing to
send (`no_external_ref` on QA/admin codes, or `webhook_not_configured`
while the URL secret is unset). Recovery at study scale is one query plus
one script — no queue, no admin UI:

```sql
SELECT s.id, s.completed_at, ac.code, ac.external_ref,
       s.metadata_json->'webhook' AS webhook
FROM sessions s
JOIN access_codes ac ON ac.id = s.access_code_id
WHERE s.status = 'completed'
  AND ac.external_ref IS NOT NULL
  AND (s.metadata_json->'webhook'->>'status' IS DISTINCT FROM 'delivered');
```

then, per session id it returns:

```bash
SUPABASE_SERVICE_ROLE_KEY=... QUALTRICS_COMPLETION_WEBHOOK_URL=... node scripts/refire-webhook.mjs <session_id>
```

(`--dry-run` prints the rebuilt payload without sending; see the script
header for the idempotency notes.)

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
| `PARTNER_API_KEY_QUALTRICS` | ✅ **SET** (was ❌ when Draft 76's harness ran; Josh set it 2026-08-15 — see the fuller note in the later checklist). Confirmed live: wrong keys now return 401 "Invalid partner key" rather than the 500 "Server misconfigured" branch. | Josh, in the Supabase dashboard; the same value goes in the Qualtrics credential used by the mint Workflow |
| `QUALTRICS_COMPLETION_WEBHOOK_URL` | ❌ TBD | section 4 step 1–2 (Thursday) |
| `QUALTRICS_API_TOKEN` | ❌ TBD (may stay unset) | section 4 step 2, only if the JSON event needs header auth |

After setting the partner key, re-run the harness with it in the env to
green the mint legs end to end:

```bash
PARTNER_API_KEY_QUALTRICS=<the-key> node scripts/qualtrics-smoke.mjs
```

Until the webhook URL is set, completions are safe: sessions still
complete and stamp `completed_at`; Qualtrics just doesn't hear about
them. As of `update-session-progress` v3 this is no longer silent — the
session records `webhook: { status: 'skipped', reason:
'webhook_not_configured' }`, so these are queryable later (and
recoverable with `scripts/refire-webhook.mjs` once the URL is set).

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
      `[qualtrics-webhook] delivered` in the function logs;
      `study_completed` = true on the response.
- [ ] **Delivery record** — the session row shows
      `metadata_json->'webhook'` = `{"status":"delivered","attempts":1,…}`
      (SQL editor:
      `SELECT metadata_json->'webhook' FROM sessions WHERE id = '<session_id>';`).
- [ ] **Caregiver confirmation email** arrives.
- [ ] **(Optional now / required before real 90-day sends)** — manually
      trigger the follow-up email step, click the follow-up link,
      complete the check-in → second webhook with
      `intervention_slug: "rsd-follow-up-90d"` → `followup_completed` =
      true → second confirmation.
- [ ] **Cleanup** — deactivate the two test codes in `/admin/codes`.

If any webhook step fails: check the function logs for
`[qualtrics-webhook] non-ok` (the log line includes Qualtrics's response
status + the first 300 chars of its body), and the session's
`metadata_json->'webhook'` record for the persisted outcome
(`failed` + `last_error`/`last_http_status`). Recover with
`scripts/refire-webhook.mjs` once the receiver side is fixed.

---

## 8. BUILD LOG — what is actually built (updated 2026-08-16)

> **Read §9 and §10 first if you are debugging.** They are dated a day
> earlier but SUPERSEDE parts of this section: §9 records that the Survey
> Flow web service elements never execute, and §10 covers the Workflow
> rebuild that replaced them. §8.2 and §8.3 below are retained as history
> only.

Sections 1 and 2 are **DONE and verified live** in the "Ready for Roots
Guardian Consent" survey (`SV_9YaOS43TzaqOjOK`). This section records what
exists, what differs from the plan above, and what is left.

### 8.1 Status at a glance

| Runbook section | Status |
|---|---|
| 1. Embedded-data fields | ✅ Built |
| 2. Two mint calls | 🟡 **Endpoint proven, delivery NOT.** The two real codes were minted by clicking **Test** in the builder — that proved `mint-access-code` works, not that the integration fires. On real submissions the Survey Flow elements sent **zero** requests (§9). Rebuilt as Workflow `WF_lFfvg4FT5Ltm9SA` (§2 banner); its own Test run reached Supabase and now authorizes since Draft 84. Still to do: the second (follow-up) task, embedded-data write-back, deleting the two dead elements, and publish/enable. |
| 3. Two triggered emails | ⬜ Not started (Workflows tab) |
| 4. Completion-webhook receiver | ⬜ Not started (Workflows tab) |
| 5. 90-day scheduled email | ⬜ Not started (Workflows tab) |
| 6. Secrets | 🟡 2 of 3 done — see 8.5 |
| 7. Joint end-to-end test | ⬜ Blocked until 3–5 exist |

**The survey is in Draft.** Everything below is saved to the flow but NOT
published. "Changes won't be live until you publish."

### 8.2 The credential-header trap (HISTORICAL — resolved by Draft 84)

> **⚠️ This section describes the DEAD Survey Flow mechanism and is kept
> only as history. Do not follow it as instructions.** As of
> `mint-access-code` **v3** (Draft 84, deployed 2026-08-16) the function
> accepts the shared secret from **`Authorization` as well as
> `x-partner-key`**, so the header no longer has to be renamed — which
> matters because the *Workflow* credential editor (the mechanism actually
> in use, see §2's banner) exposes only Name / API Token / mTLS and offers
> no rename at all. **If you are debugging a 401 `Invalid partner key` from
> the Workflow, the cause is the key VALUE, not the header name.** See §2.

What was true of the Survey Flow web service element, for the record:

**A Qualtrics "API key" credential sends the token as `Authorization: %s`
by default.** `mint-access-code` v1/v2 read only **`x-partner-key`**, so
the default produced `401 {"error":"Invalid partner key"}` with nothing in
the UI hinting at why. The workaround was: on the Web Service element,
`…` next to the credential → **Configure credential parameters** →
Parameter format `Header`, Parameter name `x-partner-key`, Parameter
template `%s`.

That workaround is still the *preferred* configuration anywhere the header
name CAN be set: the Supabase gateway logs the first 10 characters of an
unrecognized `Authorization` value into `function_edge_logs`, while
`x-partner-key` is never captured. Use `x-partner-key` when you can;
`Authorization` exists so the Workflow, which cannot, still works.

The credential itself is named **`ctac-app-partner-key`** (type: API key).
Note that credentials in this UK Qualtrics tenant appear as **Shared** —
i.e. potentially visible org-wide, not just to Josh. Acceptable here: the
key only permits minting codes for two allow-listed interventions and is
rate-limited to 1000/day (Draft 77).

### 8.3 Exact built configuration (both Web Service elements) — HISTORICAL

> **⚠️ These are the two Survey Flow elements that never fire** (§2 banner,
> §9). They are recorded here because the request/response contract they
> encode is still correct and the Workflow reuses it — but **the elements
> themselves must be DELETED**: if they ever started firing alongside the
> Workflow, every consent would mint four codes instead of two.

Both live at the END of the survey flow, after all four question blocks and
after the pre-existing `Signature date` embedded-data element.

Common to both:

- **URL:** `https://fflezknnpmbemeqyqxml.supabase.co/functions/v1/mint-access-code`
- **Method:** `POST`
- **Credential:** `ctac-app-partner-key`, header name `x-partner-key`, template `%s`
- **Body Parameters** content type: **`application/json`** (defaults to
  `application/x-www-form-urlencoded` — must be changed)
- **Fire and Forget:** unchecked

Body parameters (note the per-row **type** dropdown — `max_uses` must be
`Number`, not the default `String`):

| Parameter | Type | Call #1 value | Call #2 value |
|---|---|---|---|
| `intervention_slug` | String | `ready-set-dedicate` | `rsd-follow-up-90d` |
| `external_ref` | String | `${e://Field/ResponseID}` | `${e://Field/ResponseID}` |
| `max_uses` | **Number** | `1` | `1` |
| `cohort_label` | String | `beta-2026-08` | `beta-2026-08` |

Response mapping (Set Embedded Data on the element):

| Call | Mapping |
|---|---|
| #1 | `intervention_code` = `code` · `intervention_url` = `url` |
| #2 | `followup_code` = `code` · `followup_url` = `url` |

**Build tip:** build call #1 completely, Apply, then use the element's
**Duplicate** link and change only the slug + the two mapping names. Much
faster than building the second from scratch.

**Response-mapping tip:** click **Test** and use the resulting "Select
fields to include as embedded data" dialog — check `code` and `url`, click
**Add Embedded Data**, then rename the left-hand chips from `code`/`url` to
the target field names. This is more reliable than hand-entering paths.
**Each Test mints a REAL code** — deactivate them afterward (see 8.6).

### 8.4 Deliberate deviation: no `expires_at`

§2 above suggests ~30-day and ~120-day expiries. **We send no `expires_at`
on either call.** Verified in the deployed function source: `expires_at`
defaults to `null`, meaning codes never expire unless explicitly set.

Rationale: a 30-day intervention expiry risks a family losing access after
a delay, and the follow-up code MUST still be alive when the 90-day email
fires. Tradeoff accepted: stale codes remain technically valid, but they
are single-use and bound to one consent record.

### 8.5 Secrets status

| Secret | Status |
|---|---|
| `PARTNER_API_KEY_QUALTRICS` | ✅ **Set 2026-08-16.** It was never actually set before this (the May "handed off in chat" note in STATE_OF_THE_PLATFORM was wrong — Draft 76's harness proved mint returned 500 "Server misconfigured"). A fresh key was generated and set at Project Settings → Edge Functions → Secrets (real URL: `/project/<ref>/functions/secrets`). |
| `QUALTRICS_COMPLETION_WEBHOOK_URL` | ✅ **Set 2026-08-16.** The inbound URL from the JSON trigger on workflow `WF_JFIOeoc0oOU3G4T` ("Completion webhook receiver (from ctac.app)"), copied via that trigger's **Copy URL** button. |
| `QUALTRICS_API_TOKEN` | ✅ **Set 2026-08-16.** Josh's Qualtrics API token (Account Settings → Qualtrics IDs → API). Required because the JSON trigger has **"Require authentication by Qualtrics" ON** — which is the right setting, and conveniently `update-session-progress` already sends the token as `X-API-TOKEN`, matching what Qualtrics expects. |

**All three secrets are now set.** The ctac.app half of the integration is
fully configured. What remains is Qualtrics-side workflow building (§3,
§4 downstream tasks, §5) and the joint test (§7).

Also done 2026-08-16: `mint-access-code` v2 (the rate-limited Draft 77
source) deployed via `npx supabase functions deploy mint-access-code
--no-verify-jwt`. The Supabase CLI was not installed; `npx supabase` works
without a global install (needs `npx supabase login` + `npx supabase link
--project-ref fflezknnpmbemeqyqxml` first).

### 8.6 Test residue cleanup

Every **Test** click mints a real row in `access_codes`. Codes minted
during this build (`RSD-QVFZ-XWUJ`, `RSD-C4BN-TYTG`) have been deactivated.
To clean up future test codes:

```sql
UPDATE access_codes
SET is_active = false, cohort_label = 'qualtrics-setup-test (spent)'
WHERE code IN ('RSD-XXXX-XXXX');
```

### 8.7 ⚠️ STILL OPEN — preview mode does not exercise the Web Service

**Do not trust preview for this test.** On 2026-08-16 two full runs were
completed through **Preview** — one answering No to consent, one answering
Yes all the way to "Your response has been recorded." In BOTH cases:

- zero new rows in `access_codes`
- zero `mint-access-code` entries in the Supabase edge-function logs
  (the only hits are the 2026-08-15 build tests at 20:23 / 20:39 / 20:42)

Because the **Yes** path also produced nothing, the null result on the No
path proves nothing about the skip logic. Qualtrics preview appears not to
execute Survey Flow Web Service elements at all.

The flow itself was re-inspected in the builder and is correct and
**Published**: both Web Service elements sit at the top level of the flow,
after all four Show Block elements, with the right URL, credential,
body params, and response mappings.

**The real test must go through the live anonymous link:**

`https://uky.az1.qualtrics.com/jfe/form/SV_9YaOS43TzaqOjOK`

Run it twice — once answering **No** to "Do you consent for your child to
participate in this research study?", once answering **Yes** through to
submission — then check:

```sql
SELECT ac.code, i.slug, ac.cohort_label, ac.external_ref,
       ac.max_uses, ac.use_count, ac.expires_at, ac.is_active, ac.created_at
FROM access_codes ac
LEFT JOIN interventions i ON i.id = ac.intervention_id
WHERE ac.cohort_label = 'beta-2026-08'
ORDER BY ac.created_at DESC;
```

Expected: the No run produces nothing; the Yes run produces exactly two
rows (`ready-set-dedicate` + `rsd-follow-up-90d`) sharing one
`external_ref` (the Qualtrics ResponseID). Also open the response in
Data & Analysis and confirm `intervention_code`, `intervention_url`,
`followup_code`, and `followup_url` are populated.

If the No run DOES mint, wrap both Web Service elements in a Branch
conditioned on the consent question = Yes before any real participant
touches the link.

Deactivate the test codes afterward per 8.6.

### 8.8 Two other things spotted 2026-08-16

- **Three empty embedded-data rows** in the second Set Embedded Data
  element, showing as `Create New Field or Choose From Dropdown...` with no
  name. Residue from the 2026-08-15 typing race. Harmless but should be
  deleted so the flow reads clean.
- **Consent copy says "about 500 people with the United States."** Two
  issues: the participant count doesn't match the N=20 in the IRB
  parameters we have on file, and "with" should be "within". The IRB
  application is already submitted, so this is a question for Jessica
  rather than a unilateral edit.

### 8.8 Survey structure reference (as built by Jessica)

- **Default Question Block (3q):** consent narrative · future-contact
  permission · signature preamble
- **Block 1 (1q):** *Do you consent…* Yes/No — **skip-to-end on No**
- **Block 2 (6q):** child name · consenter name · relationship · signature
  · **consenter email ×2** ("this consent will be emailed to this address")
- **Block 3 (6q):** daily-caregiver name · **daily-caregiver email ×2**
  ("used to send the weblink for the program, the e-gift card(s), and the
  90 day follow-up survey") · placement type · state · county

**Two different emails, two different jobs** (confirmed by Josh
2026-08-16): consent receipt → **Block 2** (consenter's own email);
intervention link, gift cards, and 90-day follow-up → **Block 3** (daily
caregiver's email). The `delivery_email` embedded field should be populated
from the Block 3 address. The team needs to be told this explicitly — when
the two addresses differ, the person who signs consent is NOT the person
who receives the program link.

Note also: **placement type and county are already collected** (Block 3),
which answers the collection half of the covariate question pending with
Dr. Sprang — only the pass-through-to-ctac.app decision remains.

---

## 9. 2026-08-15 evening — BLOCKER: Web Service never executes

### 9.1 What was tested

| Route | Consent | Result |
|---|---|---|
| Preview (Claude) | Yes, full submit | no mint request |
| Preview (Josh) | No | no mint request |
| **Anonymous link (Josh) 7:02 PM** | **Yes, completed** | **no mint request** |
| **Anonymous link (Josh) 7:03 PM** | **Yes, completed, 57s** | **no mint request** |

Both live-link runs recorded normally in Qualtrics (Distributions →
Anonymous link "surveys finished" went 2 → 4; Data & Analysis shows both
rows with QID10 = Yes).

### 9.2 What the evidence says

`mint-access-code` has received **zero** requests since the 2026-08-15
build tests at 20:23 / 20:39 / 20:42 UTC. Not a 401, not a 500 — nothing.
Qualtrics never opened the connection. `access_codes` has no new rows.

This is not a consent-branch problem and not a credential problem. **The
Survey Flow Web Service elements are not executing at all on real
submissions.**

### 9.3 What was ruled out

- **Element placement.** Flow order re-read directly from the builder:
  4 × Show Block → 2 × Set Embedded Data → Web Service (+mappings) →
  Web Service (+mappings). All top level. **No End of Survey element**
  anywhere in the flow, so nothing short-circuits before them.
- **Element config.** URL, POST, credential `ctac-app-partner-key`,
  `application/json`, all four body params, both response mappings —
  all still correct on screen.
- **Respondent didn't finish.** Both runs are recorded as finished.
- **Credential/auth.** A failed auth would still produce a Supabase log
  entry (yesterday's 401s did). There is nothing.

### 9.4 Live hypotheses, cheapest first

1. **Three malformed embedded-data rows abort the flow.** The second Set
   Embedded Data element contains three unnamed rows rendering as
   `Create New Field or Choose From Dropdown...` (residue from the
   2026-08-15 typing race). A malformed element can halt flow execution
   before later elements run. Cheap to test: delete them, Apply, re-run.
2. **Flow edits saved but never published.** The builder shows "Published"
   with Publish greyed, which normally means no pending changes — but the
   survey belongs to Jessica and was shared with Josh. If Josh's role
   can Apply but not Publish, the live link would serve the older
   published flow, which has no Web Service elements. Worth confirming
   with Jessica.
3. **Datacenter mismatch.** The admin console is `uky.pdx1.qualtrics.com`
   but the anonymous link is `uky.az1.qualtrics.com`. Unusual. Responses
   do land, so it is the same survey, but worth raising if 1 and 2 fail.

### 9.5 Recommended fallback — move minting into a Workflow

If the flow-level Web Service can't be made to fire, rebuild it as a
**Qualtrics Workflow**: trigger = survey response (completed), task =
Web Service POST to `mint-access-code`, then write `code` / `url` back to
embedded data.

The decisive advantage is observability: Workflows keep a **run history
with per-run status and error detail**. Survey Flow Web Service elements
log nothing, which is why this failure was invisible until we checked
Supabase from the other side. We already know Workflows function in this
account — `WF_JFIOeoc0oOU3G4T` was built there yesterday.

### 9.6 Test residue to clean up

Recorded responses from this session, all junk, safe to delete once the
integration is working: 2026-08-15 6:11 PM, 6:23 PM, 7:02 PM, 7:03 PM.
No access codes were created by any of them.

---

## 10. Workflow rebuild — in progress, blocked in the editor

### 10.1 What exists now

A second workflow was created on `SV_9YaOS43TzaqOjOK`:

- **Name:** New Workflow (rename it)
- **Workflow ID:** `WF_lFfvg4FT5Ltm9SA`
- **Container:** `OC_WlXX1glFtgz1QWf`
- **State:** Draft, Disabled, unpublished

Built so far:

1. **Event —** Survey response → "Newly created responses" only
   (imported and incomplete responses excluded).
2. **Decision —** Branch 1 if Question `QID10 Do you consent for your child
   to participate in this research study?` → `Yes` → `is selected`.
3. **Task (unsaved) —** WebService, Authenticated, account
   `ctac-app-partner-key`.
   - `POST https://fflezknnpmbemeqyqxml.supabase.co/functions/v1/mint-access-code`
   - Header `Content-Type: application/json`
   - Body (JSON, key-value pairs):
     | Key | Value | Data type |
     |---|---|---|
     | `intervention_slug` | `ready-set-dedicate` | System Default |
     | `external_ref` | `${rm://Field/ResponseID}` | System Default |
     | `max_uses` | `1` | **Number** |
     | `cohort_label` | `beta-2026-08` | System Default |

### 10.2 Where it stopped

**Both "Run test" and "Save" are greyed out**, with the inline message
*"Complete the request, headers, and body section if necessary to perform
a test."* No field shows a validation error, and every visible required
field is populated. Cause not yet identified.

Things worth trying next, roughly in order:

1. Set an explicit **Data type** (String) on the three System Default rows
   instead of leaving them defaulted.
2. Re-enter the `external_ref` value by hand as literal text rather than
   through the `{a}` picker, in case the inserted token leaves the field
   in an invalid state.
3. Use **Import cURL** at the top of the task editor to populate method,
   URL, headers and body in one shot — auth is configured separately, so
   it should survive. Equivalent cURL:
   ```
   curl -X POST https://fflezknnpmbemeqyqxml.supabase.co/functions/v1/mint-access-code \
     -H 'Content-Type: application/json' \
     -d '{"intervention_slug":"ready-set-dedicate","external_ref":"PLACEHOLDER","max_uses":1,"cohort_label":"beta-2026-08"}'
   ```
   then swap `PLACEHOLDER` for the ResponseID token.

### 10.3 Still to build after the task saves

- Duplicate the task for `rsd-follow-up-90d`.
- Decide where the codes go. Two options:
  - **(a)** Write them back to embedded data, then let the existing
    Qualtrics email machinery send them. Keeps the response record
    complete for export.
  - **(b)** Skip embedded data and put the codes straight into Email tasks
    inside this same workflow, piping from the WebService responses.
    Fewer moving parts; the response record then has no copy of the code.
    **(a) is probably right** — Jessica will want the codes on the
    response row for linking, per the SPSS export requirements.
- Two emails: consent receipt → Block 2 address; program link → Block 3
  daily-caregiver address.
- **Delete the two Web Service elements from the Survey Flow.** They are
  inert today, but if they ever start firing alongside a working Workflow
  every consent would mint four codes instead of two.
- Publish the workflow AND flip the Enabled toggle. Note that the older
  `WF_JFIOeoc0oOU3G4T` completion-webhook workflow is also still Draft /
  Disabled / never published — it needs the same treatment.

### 10.4 Environment notes for whoever picks this up

- The workflow task editor renders in a **cross-origin iframe**
  (`xm-apps-static.com`), so it can only be driven by coordinate clicks —
  no DOM scripting. The classic Survey Flow editor is same-origin but
  exposes no delete control for embedded-data rows.
- The Survey Flow page reflows at different zoom levels between actions,
  which makes coordinate clicks unreliable there; take a fresh screenshot
  immediately before each click.
