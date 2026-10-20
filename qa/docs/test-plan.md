# N5Deal Practical Assignment — Product QA Test Plan

## 1. Objectives and scope

Assess whether owners can organize and share due-diligence PDFs securely, recipients receive only intended read access, and document operations preserve content. Prioritize confidentiality and data loss over cosmetic issues.

**In scope:** authentication/session handling, cross-account isolation, representative owner/recipient permissions, folder/file lifecycle, public/email sharing and revocation, and PDF upload, preview/download, rename/move and deletion.

**Optional/deferred:** broader permission combinations, recovery, concurrency, deep hierarchies, pagination and non-functional coverage described below. **Out of scope:** search/versioning, folder relocation, editor roles, refresh-token implementation, comprehensive penetration testing and load testing for this assignment. Documented MVP omissions must not automatically be classified as defects.

## 2. Test environment and prerequisites

Target the Vercel frontend and Railway API: React, NestJS, PostgreSQL/Prisma and Supabase Storage. Use Chrome regular/Incognito sessions and Playwright/TypeScript with the framework's compatible Node.js/browser versions. The [README](../../README.md) provides deployment URLs and demo-account information; keep designated owner A and recipient B credentials in private configuration.

Obtain authorization before execution; confirm usable accounts and ownership of the designated test room. Use synthetic PDFs and uniquely identified disposable resources. Track created resource IDs where available, and restrict cleanup to confirmed test-created resources. Never modify pre-existing data. Block dependent checks when prerequisites fail. Suppress credentials, tokens and sensitive bodies; keep traces/screenshots/video disabled by default.

Do not assume an isolated database/storage environment or independently verified infrastructure. Record the deployed build and browser versions where available; disclose missing identifiers.

## 3. Priorities and test approach

- **P0 confidentiality:** cross-account reads, viewer mutation denial, inherited permissions and public-link scope.
- **P0 revocation:** fresh recipient/public requests after access removal; distinguish these from cached content, downloaded copies and previously issued URLs.
- **P0 integrity:** compare original/downloaded bytes, verify lifecycle persistence and scoped deletion effects.
- **P1 reliability:** duplicate names, invalid authentication, upload validation and account switching.

Plan positive owner/recipient journeys, negative credentials and unauthorized operations, and two-session exploratory revocation checks. Apply targeted 2-value BVA to source-derived folder-name lengths after trimming (0, 1, 200, 201) and registration-password lengths (7, 8, 72, 73), using ASCII data. Keep case-variant name checks separate from length BVA. Distinguish client-side validation from backend enforcement and successful registration; do not claim comprehensive boundary coverage.

Derive API requests from actual routes/DTOs; use valid payloads, positive controls, HTTP assertions and resource-state checks. UI procedures should cover business journeys, error feedback and destructive confirmations. Hidden controls do not establish server authorization. Follow upload intent, storage PUT and completion where relevant. Record prerequisites, steps, expected/actual behavior and evidence limits; source inspection alone does not confirm runtime behavior.

## 4. Schedule and automation strategy

The assignment completion window is **24 hours**, with **10 planned active-work hours** and up to **2 additional contingency hours**: setup 1h, exploration 2.5h, reusable automation 4h, targeted reruns 1h and reporting 1.5h. Timebox troubleshooting within these allocations and preserve reporting time.

**Planned pyramid:** assess the existing Jest unit foundation and health test as a potential baseline; add focused API authorization/security automation; target 2–3 representative browser journeys, subject to feasibility. Candidate journeys are owner upload/download integrity, recipient read-only sharing, and public-link revocation. These are planning targets, not implementation or execution claims. Reduce breadth and report gaps if constraints prevent completion.

Use a minimal reusable Playwright/TypeScript framework with environment configuration, auth/API helpers, separate actors, deterministic fixtures, independent tests and scoped cleanup that preserves original failures. Avoid arbitrary waits and automatic retries. Require approval for execution and targeted reruns.

## 5. Risks, assumptions and deferred scope

Source-reviewed characteristics include seven-day JWT lifetimes without server-side token revocation, five-minute signed storage URLs and abandoned-upload cleanup limitations. Previously downloaded copies cannot be recalled. These inform risk assessment, not claims of confirmed runtime vulnerabilities.

Defer identity assurance, broader JWT lifecycle and file/room authorization coverage, overlapping permissions, previously issued URLs after revocation, upload recovery/enforcement, physical storage deletion, performance/scalability, comprehensive accessibility and cross-browser testing. Exhaustive boundaries, deep hierarchies and concurrency combinations are not promised. Environment or tool constraints may further reduce scope; record impact rather than imply a pass.

## 6. Entry, exit and suspension criteria

**Entry:** accessible deployed application, authorized usable accounts, confirmed ownership of designated resources, permission for planned scenarios, and necessary test data/tools.

**Exit:** prioritized scenarios executed or explicitly blocked/deferred; results and significant findings documented; applicable scoped cleanup attempted; outstanding risks and evidence limits reported; risk-based assessment delivered in the Final QA Report. Exit does not establish complete P0 coverage or production readiness.

**Suspend:** authorization/ownership is missing, required accounts/environment are unavailable, unrelated data may be affected, unexpected high-impact behavior requires review, or troubleshooting exceeds its allocated timebox. Resume only after the blocking condition is resolved and execution is authorized.

## 7. Test deliverables and references

Planned deliverables:

- This Test Plan, using [task.md](../../task.md) as the application requirements basis.
- [Manual Test Cases and Execution Results](manual-test-results.md).
- [Prioritized Findings and Risks](findings.md).
- [Reusable API/UI Automation](../automation/README.md) and [Execution History](automation-test-results.md).
- [Final QA Report](final-qa-report.md), including release-readiness limitations and next steps.

Keep execution outcomes in the dedicated records, separate from this plan.
