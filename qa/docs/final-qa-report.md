# N5Deal Virtual Data Room — Final QA Report

## Decision

**Insufficient evidence for an unconditional production release handling confidential due-diligence documents.** The selected core workflows have positive evidence and no confirmed functional defect or security vulnerability was established. A controlled evaluation using synthetic data is reasonable, subject to explicit acceptance of the gaps below. This is not production security certification: email identity assurance remains an unverified high-priority concern, and two E2E upload-stage failures remain unexplained despite a later PASS.

## Scope and approach

The product organizes PDF documents into owner-controlled rooms and nested folders, with public and per-user read-only sharing and revocation. Assessment covered registration/login, folder/file lifecycle, sharing, selected concurrency observations and document integrity on the deployed Vercel frontend/Railway API. Manual testing used Chrome regular/Incognito sessions; automation used Playwright 1.56.1/TypeScript, Node 22.23.3 and Chromium revision 1194. No dedicated database/storage infrastructure or identified deployed build is claimed.

Risk-based exploration prioritized confidentiality, unauthorized mutation, fresh-request revocation and document preservation. The testing pyramid retained the existing Jest unit base by inspection, added four direct API scenarios and one browser journey. **The existing Jest unit suite and health e2e were not executed as part of QA.** The original 2–3 browser target was reduced to one; remaining effort was deliberately directed to evidence, scoped diagnostics and reporting. The 24-hour window and 10–12 focused-hour budget were planning targets, not measured actual effort.

## Results and verified coverage

| Evidence set | Result |
|---|---|
| Manual | **133 unique cases: 128 PASS, 5 OBSERVED** |
| Automation, latest result per case | **5 unique cases: 5 PASS** — four API, one E2E |
| Automation execution history | **8 attempts: 5 passed, 2 failed, 1 configuration-blocked; no automatic retries** |
| Successful-run duration total | 61.5 seconds; not total assessment time |

- API-SEC-02: owner controls succeeded; anonymous folder read returned 401; unrelated B read/rename returned 404; state remained unchanged.
- API-SEC-03: active viewers could read but could not rename/delete the shared folder; owner state remained intact.
- API-SEC-04: parent sharing covered existing and newly created children; revocation denied fresh B reads while A retained access.
- API-SEC-05: public parent/child access succeeded, outside-sibling access was denied, and fresh public requests returned 410 after revocation.
- E2E-01: UI login, owner-room verification, UI folder creation, PDF upload/persistence and file-viewer shell passed; downloaded `qa-integrity.pdf` matched the synthetic fixture's SHA-256. Latest run: 12.0 seconds, typecheck PASS.

Cleanup requests for confirmed test-created resources returned HTTP 204; subsequent deletion checks and physical storage removal were not independently verified. The two earlier E2E attempts remain FAIL in history; the earlier API-SEC-02 prerequisite attempt remains configuration-blocked. No application fix or established root cause explains the later E2E PASS. Successful cases are not a suite-wide repeated-run reliability result.

Targeted manual boundary-value analysis added eight PASS UI checks: folder-name lengths of 0, 1, 200 and 201 characters, and registration-password lengths of 7, 8, 72 and 73 characters. Backend boundaries and registration success at 8/72 characters were not tested. Exact persistence of the 200-character folder name and tester-reported folder cleanup were not independently verified.

## Findings and residual risk

| Priority | Item | Classification / decision relevance |
|---|---|---|
| High investigation | RISK-001: email ownership assurance for email-based access | Source-level concern, not a confirmed vulnerability. Controlled-account sharing passes do not establish identity ownership. Resolve deployed controls before confidential production use. |
| High-value testing | JWT lifecycle, signed URLs after revocation, broader file/room authorization and overlapping grants | Coverage gaps, not defects; selected folder tests do not prove comprehensive BOLA/IDOR protection. |
| Reliability follow-up | Two unexplained E2E upload-stage failures | Automation/environment/product cause unresolved. A passing rerun does not erase failures. |
| P2 product consideration | PG-001: no self-service password recovery | Existing Medium product gap, not explicitly required by the original specification. |
| Low improvements | UX-001–005: password visibility/guidance, required-field presentation and long-name horizontal scrolling | Observed usability candidates, not confirmed functional bugs. |

The five manual OBSERVED cases are browser-storage observations, one non-reproduced preview fallback and two already-rendered-content observations. They do not establish unauthorized server access. Google OAuth is an allowed alternative to email/password, not a missing requirement; optional search/versioning and documented MVP omissions are not automatically bugs.

## Evidence limitations and next actions

Manual evidence is tester-supplied observations and a supplied checksum comparison; individual screenshot artifacts, exact Chrome version and deployed build identity are unavailable. Automated results derive from actual runner output and assertions, with secrets suppressed. Visual PDF rendering and physical storage deletion were not independently verified. Public room-root denial lacks a successful room-link control and does not prove arbitrary-room isolation. Cached content, previously issued storage URLs, exhaustive boundaries, recovery, scale and accessibility remain outside established coverage.

Highest-value next activities, subject to approval:

1. Resolve RISK-001 through identity/control review and controlled-address validation; confirm the intended security requirement.
2. Run the existing Jest/health baseline, identify the deployed build, and extend critical file/room authorization, overlapping-grant and signed-URL checks.
3. Assess E2E upload repeatability using safe diagnostics; investigate failures before claiming a stable regression gate. Check interruption/recovery and deletion consistency using only disposable resources.
4. Add the deferred recipient-sharing browser journey, followed by visual PDF and targeted accessibility/cross-browser checks as time permits.

## How I Used AI

I used ChatGPT and Codex during this QA assignment.

**My role:** I defined testing priorities and constraints, supplied manual testing observations, selected high-risk scenarios for automation, evaluated reported results, requested corrections, and decided when the testing scope was sufficient.

**What I delegated to Codex:** Repository inspection, Playwright automation framework and test implementation, technical diagnostics, execution of approved commands, and drafting and updating QA documentation.

The final QA assessment was prepared with AI assistance based on the documented testing results and identified risks.

I reviewed the AI-assisted outputs against the available test evidence and retained responsibility for the testing decisions, findings classifications, and final release recommendation.

## Deliverable traceability

[Plan](test-plan.md), [findings and gaps](findings.md), [manual evidence](manual-test-results.md), [automation execution history](automation-test-results.md), and [framework/setup](../automation/README.md) address the supplied Product QA deliverable checklist. Repository [task.md](../../task.md) is the original application-building specification, not a separate QA hiring brief; no additional unseen QA rubric is claimed to have been verified.
