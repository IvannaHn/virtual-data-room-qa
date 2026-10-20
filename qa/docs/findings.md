# QA Findings — N5Deal Virtual Data Room

**Recorded:** 2026-10-19  
**Manual environment:** Deployed Virtual Data Room; Google Chrome regular and Incognito sessions, as specified per case.  
**Sources:** Tester-supplied observations and the earlier static repository review. No tests or exploitation were performed while preparing this document. No individual screenshot artifacts or request traces are attached to these findings; manual evidence provenance is recorded in the manual results. Later automated runner evidence is recorded separately.

Observed test results and their limits are recorded in [manual-test-results.md](manual-test-results.md). The entries below are **UX improvement candidates, a product gap and an unverified security concern**, not confirmed functional bugs against the original specification or confirmed vulnerabilities. Proposed UX behavior is a recommendation, not an established acceptance requirement.

## UX improvement candidates

### UX-001 — No Show/Hide password toggle

- **Classification/status:** UX improvement candidate; observed, open for consideration.
- **Severity:** Low (usability). **Priority:** Low.
- **Actual:** Login and Registration have no password visibility toggle.
- **Expected/recommended:** Offer an accessible Show/Hide control while keeping passwords masked by default.
- **User/business impact:** Users cannot visually check their input, potentially increasing typing errors and repeated submissions.
- **Evidence status:** Tester-reported UI observation; no screenshot or independent reproduction. No authentication failure is established.

### UX-002 — Password requirements are not explained before submission

- **Classification/status:** UX improvement candidate; observed, open for consideration.
- **Severity:** Low (usability). **Priority:** Low.
- **Actual:** Password requirements are not explained before form submission.
- **Expected/recommended:** Show concise guidance near the registration Password field before submission, consistent with enforced rules.
- **User/business impact:** Users may need avoidable failed attempts to discover requirements, adding friction to account creation.
- **Evidence status:** Tester-reported UI observation; no screenshot or independent reproduction. Backend rule enforcement was not tested.

### UX-003 — Mandatory fields are not identified in advance

- **Classification/status:** UX improvement candidate; observed, open for consideration.
- **Severity:** Low (usability). **Priority:** Low.
- **Actual:** Required fields have no visible required indicators or explanation that all fields are mandatory.
- **Expected/recommended:** Use consistent required indicators with an explanation, or state clearly that all fields are required.
- **User/business impact:** Users may discover mandatory inputs only after submission, causing avoidable correction effort.
- **Evidence status:** Tester-reported UI observation; no screenshot or independent reproduction. Empty registration submission did display validation messages (REG-01).

### UX-004 — Empty Password field shows minimum-length guidance

- **Classification/status:** UX improvement candidate; observed, open for consideration.
- **Severity:** Low (message clarity). **Priority:** Low.
- **Actual:** An empty Password field displays a minimum-length validation message rather than a specific required-field message.
- **Expected/recommended:** Show a required-field message for empty input; use minimum-length guidance for nonempty input below the required length.
- **User/business impact:** The message is less specific to the user's omission and may make the correction less clear. No blocked journey or acceptance of invalid input was reported.
- **Evidence status:** Tester-reported validation-message observation; exact message text and screenshot were not supplied. This does not invalidate REG-01's UI-validation PASS.

### UX-005 — Long folder name causes horizontal scrolling

- **Classification/status:** UX improvement candidate; not a confirmed product defect.
- **Severity / priority:** Low (suggested usability impact / improvement priority).
- **Actual:** During BVA-03 on 2026-10-19, a 200-character folder name caused horizontal scrolling in the folder listing.
- **Expected/recommended:** Consider containing long names within the listing layout while preserving access to the full name, for example through wrapping or accessible truncation. This is a recommendation, not an established acceptance requirement.
- **User/business impact:** Horizontal scrolling may make folder browsing less convenient; no blocked workflow or data loss was reported.
- **Evidence status:** Tester-reported observation and session screenshots; no repository screenshot artifact is claimed. Viewport dimensions, exact persisted name length and behavior on other browsers were not independently verified. BVA-03 remains PASS for observed UI creation.

## Product gaps

### PG-001 — No password recovery flow available

- **Category:** Product Gap / Missing Functionality.
- **Severity:** Medium. **Suggested priority:** P2.
- **Observation/actual:** The observed Login UI has no Forgot Password option; the reviewed authentication controller exposes no password-reset endpoint.
- **Expected/recommended:** Add a secure email-based password reset flow so users can recover access after losing their password.
- **Business impact:** Users who lose their passwords cannot recover access to their Data Room through a self-service process.
- **Requirement status:** Password recovery is not explicitly required by [task.md](../../task.md). This is a product gap for consideration, **not a confirmed functional bug against the original specification**.
- **Evidence status:** Tester-observed Login UI and source review of [auth.controller.ts](../../apps/api/src/auth/auth.controller.ts), which exposes registration, login and current-user lookup. No password-reset API execution or recovery journey was performed; no screenshots or execution artifacts are claimed.

### Authentication requirement clarification

**Google OAuth is not a missing requirement.** [task.md](../../task.md) explicitly permits either Google social authentication **or** email/password. The [README](../../README.md) documents the deliberate choice of email/password. Absence of Google OAuth is therefore not recorded as a defect or product gap against the assignment.

## Unverified security investigation

### RISK-001 — Email ownership assurance for email-based sharing

- **Classification/status:** Source-level security concern; **NOT TESTED**, investigation required. **Not a confirmed vulnerability.**
- **Severity:** Potentially High if unauthorized access to confidential documents is demonstrated; final severity is unconfirmed. **Priority:** High for investigation.
- **Observed source behavior:** The reviewed registration service creates an account and issues a token without an apparent email ownership verification step. The access resolver matches active email-based shares to the account's email address.
- **Expected security behavior:** Access granted to a recipient email should require reliable proof that the account holder controls that address, or an equivalent trusted identity mechanism.
- **Potential business impact:** If someone can register an unclaimed recipient address and obtain its grants without proving ownership, confidential due-diligence documents could become accessible to an unintended person. This is a hypothesis, not an observed access event.
- **Evidence status:** Earlier static review of [auth.service.ts](../../apps/api/src/auth/auth.service.ts), [resolve-access.ts](../../apps/api/src/common/access/resolve-access.ts) and [shares.service.ts](../../apps/api/src/shares/shares.service.ts). Deployed enforcement, compensating controls and exploitability have not been verified. No unauthorized-access reproduction or execution evidence exists in this assessment.
- **Recommended investigation:** Review identity requirements and deployed controls first. If runtime validation is subsequently authorized, use only tester-controlled email addresses, synthetic documents and explicitly permitted test resources. Do not create accounts using third-party addresses or access other users' documents.
- **Potential mitigation:** If the concern is validated, require verified email ownership before honoring email-based grants, or use an equivalent trusted identity flow. Confirm the chosen behavior with the product owner before defining acceptance tests.

## Reporting limits

Authentication checks not performed during manual testing remain marked NOT TESTED in the historical manual record. Later automated authorization checks are documented separately in `automation-test-results.md` and do not retroactively change manual execution statuses. Neither UI redirects nor registration notifications establish API validation, token invalidation, protected-route enforcement or email ownership security. No confirmed functional defect or security vulnerability is asserted by this document.


## Consolidated priorities and coverage gaps

No confirmed functional defect or security vulnerability has been established in this assessment. A failed automation run is not automatically a product defect. The original entries above retain their classifications and evidence; priorities below describe investigation/testing order, not newly assigned defect severities.

| Follow-up order | Item / classification | Evidence and next action |
|---|---|---|
| First — confidentiality | RISK-001, unverified security concern; existing High investigation priority | Email ownership assurance remains untested. Successful controlled-account sharing tests do not resolve this identity risk. Review requirements/controls and test only controlled addresses after approval. |
| First — security coverage gaps | JWT behavior after logout/expiry; signed file URLs after revocation; file/room mutation matrix and overlapping grants | No comprehensive execution evidence. Selected folder API denials and fresh-link revocation passed; extend only with controlled data. These are gaps, not defects. |
| Next — reliability | E2E-01 two failed upload-stage attempts followed by PASS | Root cause unknown; diagnostic changes were made, not an application fix. Investigate repeatability with approved safe diagnostics before relying on this as a stable regression gate. |
| Next — data integrity / lifecycle gaps | Post-move/rename byte integrity across combinations, interrupted uploads and abandoned objects, independent deletion consistency | One synthetic E2E upload/download checksum passed; cleanup HTTP 204 is not proof of physical storage deletion. Prioritize controlled recovery and deletion checks. |
| Next — product decision | PG-001, existing Medium / P2 product gap | Self-service password recovery absent; not an explicit original requirement. Obtain a product decision. |
| Lower — usability | UX-001–UX-005, Low improvement candidates | Preserve as recommendations, not confirmed functional failures. |
| Deferred breadth | Scale/pagination boundaries, deeper concurrency, cross-browser/accessibility, additional E2E flows and existing Jest baseline | Not established by the selected automation. Timeboxed scope does not imply these pass. |

The five manual OBSERVED cases—AUTH-05 and AUTH-06 (empty browser storage), FILE-07 (intermittent preview fallback not reproduced on retest), ROOM-SHARE-09 and CONCURRENT-04 (already-rendered content remained visible)—are not confirmed security defects. Later fresh API revocation checks passed for selected scenarios, without establishing cached-content eviction or invalidation of previously issued signed storage URLs.

Historical manual NOT TESTED statuses remain unchanged by [later automation](automation-test-results.md). Public sibling isolation has a valid positive control; room-root denial lacks a successful room-link control and does not establish arbitrary-room isolation. Google OAuth is an allowed alternative, not a missing requirement; search/versioning and other documented MVP exclusions are not automatically bugs. See the [final report](final-qa-report.md) for the readiness recommendation.
