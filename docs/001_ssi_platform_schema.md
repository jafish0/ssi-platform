# SSI Platform — Database Schema Migration

> **Usage:** Copy everything inside the code block below and paste into the Supabase SQL Editor. Run once against your dev project.

```sql
-- ============================================================
-- SSI PLATFORM — Phase 0 Schema Migration
-- 001_ssi_platform_schema.sql
--
-- Apply via: Supabase Dashboard > SQL Editor, or
--            supabase db push (CLI)
--
-- Tables in dependency order (no FK violations on create):
--   1. interventions
--   2. intervention_versions
--   3. sections
--   4. items
--   5. access_codes
--   6. sessions
--   7. responses
--   8. scheduled_messages
--   9. user_roles (auth support)
-- ============================================================

-- Enable UUID generation (Supabase has this by default, but just in case)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. INTERVENTIONS
-- Top-level intervention definitions.
-- current_version_id is nullable on create (set after first publish).
-- ============================================================

CREATE TABLE interventions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,         -- URL-safe identifier e.g. "ready-set-dedicate"
  description         TEXT,                         -- Internal description for Builder UI
  target_population   TEXT,                         -- e.g. "Youth ages 11-17 in out-of-home care"
  is_active           BOOLEAN NOT NULL DEFAULT false, -- Must be active for participant access
  current_version_id  UUID,                         -- FK added after intervention_versions is created (see below)
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE interventions IS 'Top-level intervention definitions. One row per SSI (e.g. Ready Set Dedicate, Sleep SSI).';
COMMENT ON COLUMN interventions.slug IS 'URL-safe slug used in participant access URLs. Must be unique.';
COMMENT ON COLUMN interventions.current_version_id IS 'Points to the currently active published version. NULL until first publish.';
COMMENT ON COLUMN interventions.is_active IS 'Only active interventions accept new participant sessions.';


-- ============================================================
-- 2. INTERVENTION_VERSIONS
-- Immutable published snapshots — the IRB audit trail.
-- Once created, rows here are NEVER updated (only new rows added).
-- ============================================================

CREATE TABLE intervention_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id  UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  version_number   INTEGER NOT NULL,                -- Monotonically increasing per intervention
  snapshot_json    JSONB NOT NULL,                  -- Full frozen content snapshot at publish time
  published_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes            TEXT,                            -- Optional release notes for IRB / team
  UNIQUE (intervention_id, version_number)          -- No duplicate version numbers per intervention
);

COMMENT ON TABLE intervention_versions IS 'Immutable published snapshots. Never update rows — only insert. Each publish creates a new version.';
COMMENT ON COLUMN intervention_versions.snapshot_json IS 'Complete frozen JSON of all sections and items at publish time. Allows exact reconstruction of what any participant saw.';
COMMENT ON COLUMN intervention_versions.version_number IS 'Monotonically increasing integer per intervention. Application logic must enforce increment.';

-- Add the deferred FK from interventions -> intervention_versions
ALTER TABLE interventions
  ADD CONSTRAINT fk_interventions_current_version
  FOREIGN KEY (current_version_id)
  REFERENCES intervention_versions(id)
  ON DELETE SET NULL;


-- ============================================================
-- 3. SECTIONS
-- Ordered sections within an intervention.
-- Sections are builder-defined and live in the mutable content layer
-- (not in the snapshot — snapshot captures them at publish time).
-- ============================================================

CREATE TABLE sections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id  UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  order_index      INTEGER NOT NULL,               -- Determines display order (0-indexed)
  type             TEXT NOT NULL,                  -- e.g. 'intro', 'activity', 'outro', 'psychometric'
  title            TEXT,                           -- Optional display title
  config_json      JSONB NOT NULL DEFAULT '{}',    -- Section-level configuration
  is_required      BOOLEAN NOT NULL DEFAULT true,  -- Can participant skip this section?
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (intervention_id, order_index)            -- Enforce ordering integrity
);

COMMENT ON TABLE sections IS 'Ordered sections within an intervention. Mutable until published — snapshot captures state at publish time.';
COMMENT ON COLUMN sections.order_index IS 'Zero-indexed display order within the intervention. Must be unique per intervention.';
COMMENT ON COLUMN sections.config_json IS 'Section-level settings (e.g. background color, intro text, skip logic).';


-- ============================================================
-- 4. ITEMS
-- Individual content items within sections.
-- These are the atomic building blocks — each item is one
-- interaction, video, question, or display element.
-- ============================================================

CREATE TABLE items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id   UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  order_index  INTEGER NOT NULL,               -- Display order within section (0-indexed)
  type         TEXT NOT NULL,                  -- See item type enum below
  content_json JSONB NOT NULL DEFAULT '{}',    -- All item configuration (type-specific)
  token_key    TEXT,                           -- Pull-forward identifier e.g. 'both_and_builder'
  is_required  BOOLEAN NOT NULL DEFAULT true,  -- Must participant respond before advancing?
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (section_id, order_index)
);

COMMENT ON TABLE items IS 'Atomic content items within sections. Type determines how delivery app renders and builder configures them.';
COMMENT ON COLUMN items.type IS 'One of: psychometric_scale, video, text_prompt, free_text, action_plan, choice, page_break';
COMMENT ON COLUMN items.content_json IS 'Type-specific config. Schema varies by item type — see Item Type Schemas in platform docs.';
COMMENT ON COLUMN items.token_key IS 'Identifier for pull-forward system. Responses to this item are stored under this key and can be referenced as {{response.token_key}} in other items.';

-- Constrain valid item types at the DB level
ALTER TABLE items ADD CONSTRAINT items_type_check
  CHECK (type IN (
    'psychometric_scale',
    'video',
    'text_prompt',
    'free_text',
    'action_plan',
    'choice',
    'page_break'
  ));


-- ============================================================
-- 5. ACCESS_CODES
-- Participant access codes. One code = one participant (or cohort).
-- No PHI stored here — the caseworker holds the mapping.
-- ============================================================

CREATE TABLE access_codes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id  UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  code             TEXT NOT NULL UNIQUE,            -- The actual code participants enter
  cohort_label     TEXT,                            -- Optional grouping label e.g. "Spring 2026 Wave 1"
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at       TIMESTAMPTZ,                     -- NULL = never expires
  max_uses         INTEGER,                         -- NULL = unlimited uses (for cohort codes)
  use_count        INTEGER NOT NULL DEFAULT 0,      -- Track usage (incremented on session create)
  is_active        BOOLEAN NOT NULL DEFAULT true,   -- Can be deactivated without deletion
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE access_codes IS 'Participant access codes. No PHI stored. Caseworker holds participant<->code mapping externally.';
COMMENT ON COLUMN access_codes.code IS 'The code entered by participant or pre-filled in their URL. Must be unique.';
COMMENT ON COLUMN access_codes.max_uses IS 'NULL = unlimited. Set to 1 for individual participant codes.';
COMMENT ON COLUMN access_codes.cohort_label IS 'Grouping label for researcher/admin UI. Not shown to participants.';


-- ============================================================
-- 6. SESSIONS
-- One row per participant run-through of an intervention.
-- Links the access code to the specific version they ran on.
-- ============================================================

CREATE TABLE sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_id   UUID NOT NULL REFERENCES access_codes(id) ON DELETE RESTRICT, -- RESTRICT: don't delete codes with sessions
  version_id       UUID NOT NULL REFERENCES intervention_versions(id) ON DELETE RESTRICT,
  status           TEXT NOT NULL DEFAULT 'in_progress', -- in_progress | completed | abandoned
  current_section  INTEGER NOT NULL DEFAULT 0,       -- Track resume position (section order_index)
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ,                      -- NULL until status = completed
  last_active_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata_json    JSONB NOT NULL DEFAULT '{}'       -- Browser/device info, session flags, etc.
);

COMMENT ON TABLE sessions IS 'One row per participant run-through. Records which version they ran and their progress.';
COMMENT ON COLUMN sessions.version_id IS 'Frozen at session start. Participant always sees the same content even if intervention is republished mid-session.';
COMMENT ON COLUMN sessions.status IS 'in_progress: active or paused. completed: finished. abandoned: timed out or explicitly exited.';
COMMENT ON COLUMN sessions.current_section IS 'Last section order_index reached. Used for session resume.';

-- Constrain valid session statuses
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('in_progress', 'completed', 'abandoned'));


-- ============================================================
-- 7. RESPONSES
-- All participant responses, keyed by item.
-- This is the primary research data table.
-- ============================================================

CREATE TABLE responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT, -- RESTRICT: preserve data integrity
  response_value  JSONB NOT NULL,                   -- Flexible: text, number, array, object
  responded_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, item_id)                      -- One response per item per session (upsert-safe)
);

COMMENT ON TABLE responses IS 'All participant responses. response_value is JSONB to accommodate all item types (text, scale scores, choice arrays, structured objects).';
COMMENT ON COLUMN responses.response_value IS 'Type varies by item: text string, numeric score, array of choices, or structured object for action plans.';
COMMENT ON COLUMN responses.item_id IS 'References the item responded to. ON DELETE RESTRICT preserves research data if content is later edited.';


-- ============================================================
-- 8. SCHEDULED_MESSAGES
-- Twilio SMS queue for follow-up messages.
-- Phase 3 feature — adult cohorts only.
-- ============================================================

CREATE TABLE scheduled_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  send_at           TIMESTAMPTZ NOT NULL,            -- Scheduled delivery time
  message_template  TEXT NOT NULL,                   -- Template text (no PHI — generic language only)
  status            TEXT NOT NULL DEFAULT 'pending', -- pending | sent | failed | cancelled
  sent_at           TIMESTAMPTZ,                     -- Populated by Edge Function on success
  error_message     TEXT,                            -- Populated on failure for debugging
  twilio_message_id TEXT,                            -- SID returned by Twilio on send
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE scheduled_messages IS 'Twilio SMS queue. Phase 3 feature, adult cohorts only. No PHI in message content.';
COMMENT ON COLUMN scheduled_messages.status IS 'pending: awaiting send. sent: delivered. failed: Twilio error. cancelled: manually stopped.';
COMMENT ON COLUMN scheduled_messages.message_template IS 'Message text. Must not contain PHI. Uses generic language with resource page link only.';

ALTER TABLE scheduled_messages ADD CONSTRAINT scheduled_messages_status_check
  CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'));


-- ============================================================
-- 9. USER_ROLES
-- Role management for researchers and admins.
-- Stored in DB (not JWT) so roles can be changed without re-auth.
-- ============================================================

CREATE TABLE user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,                        -- 'researcher' | 'admin'
  granted_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)                            -- No duplicate roles per user
);

COMMENT ON TABLE user_roles IS 'Role assignments for researchers and admins. Not stored in JWT — checked at query time to allow runtime changes.';

ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('researcher', 'admin'));


-- ============================================================
-- INDEXES
-- Covering the most common query patterns.
-- ============================================================

-- Participant looking up their session by code
CREATE INDEX idx_access_codes_code ON access_codes(code);
CREATE INDEX idx_access_codes_intervention ON access_codes(intervention_id);

-- Session lookups
CREATE INDEX idx_sessions_access_code ON sessions(access_code_id);
CREATE INDEX idx_sessions_version ON sessions(version_id);
CREATE INDEX idx_sessions_status ON sessions(status);

-- Response lookups (very frequent — every page load during a session)
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_responses_session_item ON responses(session_id, item_id);

-- Section and item ordering
CREATE INDEX idx_sections_intervention_order ON sections(intervention_id, order_index);
CREATE INDEX idx_items_section_order ON items(section_id, order_index);

-- Scheduled messages — pg_cron queries by status and send_at
CREATE INDEX idx_scheduled_messages_pending ON scheduled_messages(send_at)
  WHERE status = 'pending';

-- Version history
CREATE INDEX idx_intervention_versions_intervention ON intervention_versions(intervention_id, version_number DESC);

-- Role lookups
CREATE INDEX idx_user_roles_user ON user_roles(user_id);


-- ============================================================
-- UPDATED_AT TRIGGERS
-- Auto-update updated_at on row changes.
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_interventions_updated_at
  BEFORE UPDATE ON interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_responses_updated_at
  BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Policies follow the three user types:
--   - Participants: session_id in sessionStorage (passed via app logic)
--   - Researchers: authenticated, role = 'researcher'
--   - Admins: authenticated, role = 'admin'
--
-- NOTE: Participant access is enforced at the application layer
-- (Edge Function / API route) since participants have no Supabase
-- auth token. RLS here covers the authenticated user roles.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE interventions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_versions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections                ENABLE ROW LEVEL SECURITY;
ALTER TABLE items                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles              ENABLE ROW LEVEL SECURITY;

-- Helper function: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: is the current user a researcher or admin?
CREATE OR REPLACE FUNCTION is_researcher_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('researcher', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- INTERVENTIONS
CREATE POLICY "Admins can do everything on interventions"
  ON interventions FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Researchers can view active interventions"
  ON interventions FOR SELECT TO authenticated
  USING (is_researcher_or_admin());

-- INTERVENTION_VERSIONS (immutable — no update/delete for anyone)
CREATE POLICY "Admins can insert versions"
  ON intervention_versions FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Researchers and admins can view versions"
  ON intervention_versions FOR SELECT TO authenticated
  USING (is_researcher_or_admin());

-- SECTIONS
CREATE POLICY "Admins full access to sections"
  ON sections FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Researchers can view sections"
  ON sections FOR SELECT TO authenticated
  USING (is_researcher_or_admin());

-- ITEMS
CREATE POLICY "Admins full access to items"
  ON items FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Researchers can view items"
  ON items FOR SELECT TO authenticated
  USING (is_researcher_or_admin());

-- ACCESS_CODES
CREATE POLICY "Admins and researchers can manage access codes"
  ON access_codes FOR ALL TO authenticated
  USING (is_researcher_or_admin()) WITH CHECK (is_researcher_or_admin());

-- SESSIONS (participant writes handled via service role in API routes)
CREATE POLICY "Researchers and admins can view sessions"
  ON sessions FOR SELECT TO authenticated
  USING (is_researcher_or_admin());

-- RESPONSES (participant writes handled via service role)
CREATE POLICY "Researchers and admins can view responses"
  ON responses FOR SELECT TO authenticated
  USING (is_researcher_or_admin());

-- SCHEDULED_MESSAGES
CREATE POLICY "Admins can manage scheduled messages"
  ON scheduled_messages FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Researchers can view scheduled messages"
  ON scheduled_messages FOR SELECT TO authenticated
  USING (is_researcher_or_admin());

-- USER_ROLES
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ============================================================
-- SEED DATA
-- Seed the first intervention so Phase 0 is immediately testable.
-- ============================================================

INSERT INTO interventions (name, slug, description, target_population, is_active)
VALUES (
  'Ready! Set! Dedicate!',
  'ready-set-dedicate',
  'Adoption Readiness Belongingness Intervention for Youth (ARBIY). Four-activity SSI targeting youth ages 11-17 in out-of-home care.',
  'Youth ages 11-17 in foster care, kinship care, and adoptive families',
  false  -- Set to true only after first version is published
);


-- ============================================================
-- END OF MIGRATION
-- Next steps:
--   1. Review and confirm item type config_json schemas
--   2. Confirm RLS policies satisfy IRB requirements
--   3. Apply to Supabase dev project
--   4. Scaffold React app and connect Supabase client
-- ============================================================
```
