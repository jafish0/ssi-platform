# SSI App Platform — Capabilities Overview with the Ready for Roots Intervention

The **SSI App Platform** is a custom web application developed by the University of Kentucky Center on Trauma and Children to deliver single-session interventions (SSIs) to research participants. Hosted at **ctac.app**, it is built on the Vercel and Supabase infrastructure stack and is designed specifically for the structured, secure, and trauma-informed delivery of behavioral and psychoeducational interventions in research settings. The platform is built to host multiple SSIs over time; this overview uses the Ready for Roots belongingness intervention as the primary example. (Ready for Roots was formerly named *Ready! Set! Dedicate!* / RSD — renamed 2026-05-13.)

## What the platform can host

- **Branching, video-based interventions** with embedded interactive activities — for example, the Ready for Roots belongingness intervention for youth in out-of-home care.
- **Pre-, post-, and follow-up assessment surveys** built from standard psychometric item types: Likert scales, sliders, single- and multi-choice questions, and open-ended text.
- **Six custom-built activity types**: structured reflection, allies/safety-net mapping, drag-and-drop skill sorts, decision-strategy exercises, personalized poem builders, and pull-forward letter compositions.
- **Trauma-informed design system** applied consistently across all content — pacing, language, palette, accessibility.
- **Admin dashboards** for researchers to manage interventions, generate participant access codes, monitor session progress in real time, and export data.
- **SPSS-ready data exports** in three formats (Wide, Summary, Long), each shipped with an auto-generated codebook that documents every variable's prompt, response anchors, allowed values, and reverse-scoring flag.
- **Row-level security and audit logging** so only authorized research staff can access participant data.

## Communication with Qualtrics

The platform is designed to work alongside Qualtrics rather than replace it. For each participant, the workflow can begin with caregiver consent in Qualtrics — capturing the e-signature, identifiable information, and gift-card request data — and then hand off seamlessly to the SSI App for the intervention itself. When the participant finishes, the App notifies Qualtrics that the session is complete, which triggers participant-facing emails (confirmations, follow-up reminders, gift-card delivery instructions) and updates the saved views the business manager uses to process incentives through UK Treasury. Identifiable contact data stays in Qualtrics, intervention response data stays in the SSI App, and the two are joined at analysis time using a shared participant identifier.

## How it works

At consent submission, Qualtrics makes an **API call** to the SSI App to **mint** a unique access code for that participant. The code is embedded in a URL Qualtrics emails to the caregiver, who shares the link with the youth. When the youth finishes the intervention, the SSI App sends a **webhook** back to Qualtrics, which updates the participant's record and fires the next email — a completion confirmation immediately, then a follow-up reminder 90 days later. Each system holds the data it is best at: Qualtrics for identity and standardized survey data, the SSI App for intervention engagement and custom activity content. No additional platforms are required.

## Glossary

- **API call** — A request from one system asking another to do something specific. In this platform, Qualtrics asks the SSI App to *create a new access code*; the App responds with the code. Like calling a service desk and getting a quick answer back.
- **Webhook** — An automatic notification sent from one system to another when something happens. When a participant finishes the intervention, the SSI App sends a webhook to Qualtrics — similar to how a delivery service texts you when your package arrives.
- **Mint** — To generate a new, unique, single-use code. The SSI App mints an access code for each participant, the way a print-on-demand kiosk produces a unique ticket number.
- **Vercel and Supabase** — The hosting infrastructure the platform runs on. Vercel handles web traffic; Supabase manages the secure database that stores intervention responses. Researchers and participants don't interact with these directly.
