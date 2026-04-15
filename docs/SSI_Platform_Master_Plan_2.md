| **SSI PLATFORM** Master Planning Document Anchor Lab • IFR Component 2 • March 2026 |
| --- |

| **Status** | Active Planning |
| --- | --- |
| **Grant Target** | NIMH R34 (pilot: Anchor Lab IFR) |
| **First Deployment** | Ready! Set! Dedicate! |
|  |  |
| **Dev Approach** | AI-assisted (Claude Code) |

| **SECTION 1: Platform Overview ****&**** Clinical Context** |
| --- |

## **What We Are Building**

The SSI Platform is a dual-mode web application serving two distinct functions:

- SSI Delivery App — the participant-facing interface that administers Single Session Interventions, collecting psychometric data, delivering video content via vimeo, and guiding participants through structured activities.Activities will be fairly complicated 

- SSI Builder — an admin-facing content management system that allows researchers and clinicians (including non-technical users) to create, configure, and publish new interventions without code.

| *Key architectural principle: The Builder and the Delivery App share one Supabase database. The Builder produces the content schema; the Delivery App reads and renders it. This means any intervention built in the Builder just works in the Delivery App automatically.* |
| --- |

## **Tech Stack**

| **Layer** | **Technology** | **Purpose** |
| --- | --- | --- |
| Frontend | React | Participant-facing delivery app + admin builder UI |
| Backend / Database | Supabase (PostgreSQL, Auth, Edge Functions, pg_cron) | Data storage, auth, scheduled tasks |
| Hosting | Vercel Pro | Deployment and CDN |
| Video Delivery | Vimeo (upgraded tier) | Psychoeducation and testimonial video hosting |
| AI Video Production | HeyGen | Animated presenter characters — no on-camera talent |
| AI Imagery | Envato subscription | Supporting graphics and imagery |
| SMS Follow-Up | Twilio (A2P 10DLC) | Post-session follow-up messages for adult participants |
| Dev Tooling | Claude Code | AI-assisted development throughout |

| **SECTION 2: Architecture ****&**** Data Model** |
| --- |

## **Core Architectural Decisions**

### **1. Participant Identity: Study Code System**

Participants enter via a unique access code or assigned link — no email, no password, no account creation. This satisfies both anonymous and study-ID-linked participation models and is IRB-friendlier than a full account system.

- A code is generated per participant (or per cohort) by the researcher

- Entering a valid code creates a session record tied to that code

- The session_id is stored locally in the browser and passed with every response

- Study records can be linked externally (caseworker has the mapping), keeping PHI out of the platform

### **2. Pull-Forward Logic: Token-Based Response References**

Every participant response is stored keyed by item_id. Any content block in the builder can reference a prior response using a simple token syntax:

| *Example: In the Letter Writing step, a text prompt might read: “You mentioned earlier that {{response.self_reflection_1}}. How might you share that with another youth?”The delivery app resolves these tokens at render time from the session’s response store.* |
| --- |

This approach is simple to implement and infinitely flexible. The builder provides a token-insertion UI so non-technical admins never need to type tokens manually.

### **3. IRB Version Locking: Content Snapshots**

This is the most consequential architectural decision. Every time a researcher publishes an intervention in the Builder, the system creates a version_snapshot: a frozen JSON record of all content at that moment.

- In-progress and completed sessions record which snapshot version they ran on

- Content can be freely edited in the builder without affecting any active or completed sessions

- The IRB can always reconstruct exactly what a participant saw, word-for-word

- Snapshots are immutable once created — only new versions can be published

## **Database Schema Design**

The schema is the foundation everything else is built on. Getting this right before writing any application code is the highest-priority task.

### **Core Tables**

| **Table** | **Purpose** | **Key Fields** |
| --- | --- | --- |
| interventions | Top-level intervention definitions | id, name, slug, current_version_id, created_at |
| intervention_versions | Immutable published snapshots (IRB audit trail) | id, intervention_id, version_number, snapshot_json, published_at |
| sections | Ordered sections within an intervention (builder-defined) | id, intervention_id, order_index, type, title, config_json |
| items | Individual content items within sections | id, section_id, order_index, type, content_json, token_key |
| access_codes | Participant access codes / links | id, intervention_id, code, cohort_label, created_by, expires_at |
| sessions | One record per participant run-through | id, access_code_id, version_id, started_at, completed_at, status |
| responses | All participant responses, keyed by item | id, session_id, item_id, response_value, responded_at |
| scheduled_messages | Twilio SMS queue for follow-up messages | id, session_id, send_at, message_template, status, sent_at |

### **Item Types (Builder-Configurable)**

| **Item Type** | **Delivery App Renders** | **Builder Input** |
| --- | --- | --- |
| psychometric_scale | Validated rating scale (Likert, VAS, etc.) | Scale name, items, anchors, scoring direction |
| video | Vimeo embedded player | Vimeo URL, title, required completion flag |
| text_prompt | Instructional or psychoeducation text block | Rich text content with {{token}} support |
| free_text | Multi-line text area for participant writing | Prompt text, min/max word count, token_key for pull-forward |
| action_plan | Structured activity with multiple fields | Field labels, types, token_keys |
| choice | Single or multiple choice question | Options, display style, scoring config |
| page_break | Advance to next screen / section | Optional transition message |

| **SECTION 3: User Roles ****&**** Auth Flows** |
| --- |

## **Three User Types**

| **Role** | **Who They Are** | **What They Can Do** | **Auth Method** |
| --- | --- | --- | --- |
| Participant | Youth or adult completing an SSI | Access and complete their assigned intervention session | Access code or unique link (no account) |
| Researcher / Clinician | Non-technical staff managing interventions and participants | View response data, generate access codes, view session status | Supabase email auth (standard login) |
| Admin / Developer | Technical team member building and publishing SSIs | Full SSI Builder access, publish versions, manage all interventions | Supabase email auth + admin role flag |

## **Auth Flow: Participants**

- Participant receives a code or unique URL from their study coordinator

- They enter the code on the landing page (or the URL pre-fills it)

- System validates the code: checks it exists, is not expired, and the intervention is active

- A session record is created; session_id is stored in browser sessionStorage

- Participant completes the intervention; session is marked complete

- No login, no account, no email required at any point

## **Auth Flow: Researchers and Admins**

- Standard email/password login via Supabase Auth

- Role is stored in a user_roles table (not in the JWT, to allow runtime changes)

- Researchers see a read-only data dashboard and access code management

- Admins see the full SSI Builder, version management, and system settings

| **SECTION 4: Phased Build Plan** |
| --- |

The build is structured in four phases. Each phase produces a usable, testable artifact. The grant timeline (Month 8 full build,

## **Phase 0 — Foundation**

| *Goal: Establish the schema, project infrastructure, and auth. Nothing rendered to participants yet, but everything else will be built on top of this.* |
| --- |

### **Deliverables**

- Supabase project setup: database schema (all tables above), RLS policies, initial seed data

- React app scaffold on Vercel with routing structure for delivery app and admin panel

- Auth implementation: participant code entry flow, researcher/admin login

- Environment configuration: dev, staging, production

### **Key Decision Points in Phase 0**

- Finalize item type config_json schemas for all 7 item types

- Agree on token syntax for pull-forward (e.g., {{response.token_key}})

- Confirm Supabase RLS policies with legal/IRB requirements

## **Phase 2 — Admin Dashboard ****&**** SSI Builder **

| *Goal: Non-technical researchers can build, configure, and publish interventions. Generates the same database records that Phase 0 seeded manually.* |
| --- |

### **Admin Dashboard**

- Session status view: list of access codes, session completion rates

- Access code generator: create individual or batch codes for a cohort

- Basic response data view: export responses to CSV for analysis

### **SSI Builder — Core Features**

- Intervention manager: create new interventions, manage drafts vs. published versions

- Session flow editor: drag-and-drop ordering of sections

- Section editor: add, remove, reorder, and configure items within a section

- Psychometric question builder: select scale type, configure items and anchors

- Video section builder: paste Vimeo URL, add context text, set completion requirements

- Interaction / activity designer: build free-text prompts, action plans, choice items

- Pull-forward token picker: UI to browse available tokens and insert them into text fields

- Publish flow: preview intervention, publish creates a new version snapshot, locked for IRB

## **Phase 3 — Advanced Features **

| *Goal: Production hardening, SMS follow-up, second intervention, accessibility/security audit.* |
| --- |

- SMS follow-up: Twilio A2P 10DLC integration, Supabase Edge Functions + pg_cron scheduled delivery for adult participant cohorts

- Sleep SSI: configured entirely in the Builder — validates that the platform is truly multi-intervention

- Accessibility audit: WCAG 2.1 AA compliance review and remediation

- Security audit: penetration testing, RLS policy review, data handling sign-off

- IRB data export: formatted export matching IRB-specified data structure

- Gusler mini-proposal support: SS-GMI for mothers configured as a third intervention

| **SECTION 7: SMS Follow-Up Architecture** |
| --- |

## **Overview**

Twilio A2P 10DLC is used to send follow-up reminder messages to adult participants approximately two months post-session. This is scoped to Phase 3 and adult cohorts only. Youth participants  are excluded pending parental consent policy resolution.

## **Technical Architecture**

- Supabase Edge Function handles Twilio REST API calls — keeps API credentials server-side

- pg_cron job runs on a schedule (e.g., every hour) to query the scheduled_messages table for messages due to send

- The Edge Function is invoked for each due message, sends via Twilio, and updates the record status

- No PHI in message content — messages use generic language with a link back to a resource page