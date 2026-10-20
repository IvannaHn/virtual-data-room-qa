# Automated test execution results

Latest results: **5 unique automated cases — 5 PASS** (API-SEC-02 through API-SEC-05 and E2E-01). Execution history includes **8 invocations: 5 successful runs, 2 failed E2E-01 runs and 1 earlier configuration-blocked API-SEC-02 attempt**. Each rerun was separately approved; no automatic retries occurred. The five successful single-test runs total **61.5 seconds** of reported runner time. Earlier failures remain part of the execution history and are not converted to PASS.

## Automation Execution Summary

| Test ID    | Test type   | Scenario                                  | Latest result |
| ---------- | ----------- | ----------------------------------------- | ------------- |
| API-SEC-02 | API         | Cross-account folder authorization        | PASS          |
| API-SEC-03 | API         | Viewer cannot mutate shared folder        | PASS          |
| API-SEC-04 | API         | Folder sharing inheritance and revocation | PASS          |
| API-SEC-05 | API         | Public link scope and revocation          | PASS          |
| E2E-01     | Browser E2E | Owner uploads and retrieves an intact PDF | PASS          |

Latest results describe individual scenarios, not overall suite reliability or complete security coverage. Evidence consists of observed runner output and successful execution of the documented code assertions; implementation alone is not execution evidence. No tests were rerun during this documentation cleanup.

Manual execution is recorded separately in [Manual Test Cases & Execution Results](manual-test-results.md): the original 125 results are preserved, with eight later BVA checks bringing the total to 133 (128 PASS, 5 OBSERVED).

## Execution History

Attempts are numbered within each test; table order does not imply undocumented timestamps. Each rerun was separately approved; no automatic retries occurred. Missing durations remain unreported.

| Test ID    | Attempt                          | Outcome                 | Duration     | Evidence / interpretation                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | -------------------------------- | ----------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API-SEC-02 | 1                                | BLOCKED — configuration | Not reported | Local `TEST_ROOM_ID` UUID validation blocked execution before application requests. Configuration was corrected privately before the successful run.                                                                                                                                                                                                                                                                                               |
| API-SEC-02 | 2                                | PASS                    | 5.3 s        | Observed `1 passed (5.3s)`, exit code 0; assertions and cleanup HTTP 204 passed.                                                                                                                                                                                                                                                                                                                                                                   |
| API-SEC-03 | 1                                | PASS                    | 12.5 s       | Typecheck PASS; observed `1 passed (12.5s)`, exit code 0; assertions, share revocation and folder cleanup passed.                                                                                                                                                                                                                                                                                                                                  |
| API-SEC-04 | 1                                | PASS                    | 20.0 s       | Typecheck PASS; observed `1 passed (20.0s)`, exit code 0; inheritance, fresh-read revocation and cleanup assertions passed.                                                                                                                                                                                                                                                                                                                        |
| API-SEC-05 | 1                                | PASS                    | 11.7 s       | Typecheck PASS; observed `1 passed (11.7s)`, exit code 0; public-scope, revocation and cleanup assertions passed.                                                                                                                                                                                                                                                                                                                                  |
| E2E-01     | 1 — initial E2E run              | FAIL                    | Not reported | Typecheck passed. UI login, ownership and folder creation passed. Generic failure during the broad PDF-upload stage; exact operation unknown. No confirmed application defect. Cleanup returned the required 204. Exact duration was not reported.                                                                                                                                                                                                 |
| E2E-01     | 2 — first safe-diagnostics rerun | FAIL                    | Not reported | Typecheck passed. File selection completed. Intent response was not recorded as matched; storage PUT and completion were not observed by diagnostics. Output labeled upload-intent as timed out, but later code review established that the actual wait was for upload completion and payload filtering could hide intent responses. No proof that no intent request occurred. Cleanup returned the required 204. Exact duration was not reported. |
| E2E-01     | 3 — corrected-diagnostics rerun  | PASS                    | 12.0 s       | Typecheck passed; one test, no retries, 12.0 seconds. Workflow and byte-integrity assertions above passed; cleanup returned 204.                                                                                                                                                                                                                                                                                                                   |

The five successful runs total **61.5 seconds**; this is not the duration of all eight invocations. Terminal color-setting warnings were recorded for the successful API-SEC-02–05 runs and did not affect their results.

## API-SEC-02 — Cross-Account Folder Authorization

- **Latest result:** PASS — one test passed; no automatic retries.
- **Environment:** Deployed Railway API.
- **Runner:** Playwright Test 1.56.1 / TypeScript; Node.js 22.23.3, npm 10.9.9.
- **Duration:** 5.3 seconds, as reported by Playwright for this single-test run.
- **Evidence:** Observed runner output (`1 passed (5.3s)`, exit code 0) and the assertions in `qa/automation/tests/api/authorization.spec.ts`. No raw response bodies, credentials or tokens are recorded.

**Verified operations**

| Verified operation                                         | HTTP status |
| ---------------------------------------------------------- | ----------: |
| Account A and B authentication and identity checks         |         200 |
| Owner reads designated room                                |         200 |
| Account B attempts room access                             |         404 |
| Owner creates disposable folder                            |         201 |
| Owner reads folder and performs positive-control rename    |         200 |
| Owner confirms rename through fresh breadcrumbs            |         200 |
| Anonymous reads private folder                             |         401 |
| Account B attempts folder read and rename                  |         404 |
| Owner verifies unchanged state after denied rename         |         200 |
| Owner deletes confirmed test-created folder during cleanup |         204 |

**Key assertions and verification limits**

The passing assertions verified distinct account identities, room ownership, the denied rename, unchanged owner-established folder name and identity, and absence of known private metadata in denial responses. Cleanup succeeded according to its 204 response; deletion was **not independently checked with a subsequent GET**. These results establish the tested behavior, not comprehensive authorization security.

See [Execution History](#execution-history) for the earlier configuration-blocked attempt.

## API-SEC-03 — Viewer Cannot Mutate Shared Folder

- **Latest result:** PASS — executed exactly once, no retries.
- **Environment:** Deployed Railway API.
- **Runner:** Playwright Test 1.56.1 / TypeScript.
- **Duration:** 12.5 seconds, reported by Playwright for the single-test run.
- **TypeScript typecheck:** PASS.
- **Evidence:** Observed runner output (`1 passed (12.5s)`, exit code 0) and passing test assertions; no sensitive responses or credentials recorded.

**Verified operations**

| Verified operation                           | HTTP status |
| -------------------------------------------- | ----------: |
| Authentication and identity checks           |         200 |
| Owner room read                              |         200 |
| Unauthorized room/folder read before sharing |         404 |
| Disposable folder creation                   |         201 |
| Existing share list read                     |         200 |
| USER share creation                          |         201 |
| Viewer contents and breadcrumbs              |         200 |
| Owner rename                                 |         200 |
| Viewer rename                                |         404 |
| Viewer delete                                |         404 |
| Owner state verification                     |         200 |
| Share revocation                             |         204 |
| Folder deletion cleanup                      |         204 |

**Key assertions and verification limits**

Active VIEWER access was verified before each mutation attempt. Both mutations were rejected, and owner reads verified the unchanged owner-established name, folder identity, room ownership and empty contents. Denial metadata assertions passed. Revocation and deletion cleanup were **not independently verified by subsequent reads**. No assertions failed. This is evidence for the specific scenario, not comprehensive authorization security.

## API-SEC-04 — Folder Sharing Inheritance and Revocation

- **Latest result:** PASS — 1 test executed, no retries.
- **Environment:** Deployed Railway API.
- **Runner:** Playwright Test 1.56.1 / TypeScript.
- **TypeScript typecheck:** PASS.
- **Duration:** 20.0 seconds, reported by Playwright for the single-test run.
- **Evidence:** Observed runner output (`1 passed (20.0s)`, exit code 0) and passing test assertions. No credentials, tokens or sensitive response bodies are recorded.

**Verified operations**

| Verified operation                                                                               | HTTP status |
| ------------------------------------------------------------------------------------------------ | ----------: |
| A/B authentication and identity checks                                                           |         200 |
| Owner room access                                                                                |         200 |
| B room access denied                                                                             |         404 |
| Parent and both child folder creations                                                           |         201 |
| Owner reads initial folder tree                                                                  |         200 |
| B parent/original child reads before sharing denied                                              |         404 |
| Parent existing share list, confirmed empty                                                      |         200 |
| Parent USER share creation                                                                       |         201 |
| B inherited VIEWER contents/breadcrumbs access to parent, existing child and newly created child |         200 |
| Child direct-share lists, confirmed empty                                                        |         200 |
| Parent share revocation                                                                          |         204 |
| B fresh contents/breadcrumbs requests to all three folders after revocation denied               |         404 |
| Owner retained access and unchanged tree                                                         |         200 |
| Disposable parent-subtree cleanup                                                                |         204 |

**Key assertions and verification limits**

B inherited access to children created both before and after parent sharing, without separate child grants. The effect of share revocation was **independently verified through fresh authenticated reads** returning 404 for the parent and both children. Owner reads continued to confirm OWNER access, expected identities, names and tree contents.

Cleanup returned 204, but physical folder deletion after cleanup was **not independently verified**, including by subsequent reads or database/storage inspection. No assertions failed. These results cover the tested API behavior, not cached content, signed storage URLs or comprehensive authorization security.

## API-SEC-05 — Public Link Scope and Revocation

- **Latest result:** PASS — one test executed, no retries.
- **Environment:** Deployed Railway API.
- **Runner:** Playwright Test 1.56.1 / TypeScript.
- **TypeScript typecheck:** PASS.
- **Duration:** 11.7 seconds, reported by Playwright for the single-test run.
- **Evidence:** Observed runner output (`1 passed (11.7s)`, exit code 0) and passing assertions. No credentials, public tokens or sensitive response bodies are recorded.

**Verified operations**

| Verified operation                                              | HTTP status |
| --------------------------------------------------------------- | ----------: |
| Owner login, identity and room access                           |         200 |
| Disposable parent, child and sibling creation                   |         201 |
| Owner reads all disposable folders                              |         200 |
| Anonymous private-folder access before sharing                  |         401 |
| Initial parent share list, confirmed empty                      |         200 |
| Parent PUBLIC_LINK creation                                     |         201 |
| Anonymous public summary and shared parent/child access         |         200 |
| Public link access to outside sibling                           |         404 |
| Folder link access to room root                                 |         404 |
| Exact public-share revocation                                   |         204 |
| Fresh public summary and parent/child requests after revocation |         410 |
| Owner access retained with unchanged folder state               |         200 |
| Parent-subtree cleanup                                          |         204 |
| Separate sibling cleanup                                        |         204 |

**Key assertions and verification limits**

Sibling isolation has valid positive controls: successful parent/child reads use the same public-folder route. Known metadata-disclosure checks passed. Room-root denial lacks a successful room-link positive control and **does not prove arbitrary-room isolation**. Revocation's effect was verified through fresh anonymous requests. Cached content, previously issued file URLs and physical deletion verification are outside scope; cleanup deletion was **not independently checked**. No assertions failed.

## E2E-01 — Owner Uploads and Retrieves an Intact PDF

- **Latest result:** PASS — one test executed, no retries.
- **Environment:** Deployed Vercel frontend and Railway API, designated QA owner account and room.
- **Runner:** Playwright Test 1.56.1 / TypeScript, Chromium revision 1194; Node.js 22.23.3.
- **TypeScript typecheck:** PASS.
- **Duration:** 12.0 seconds for the successful single-test run.
- **Evidence:** Observed runner output (`1 passed (12.0s)`, exit code 0) and passing assertions. No screenshots, raw responses, credentials or signed URLs are included.

**Verified operations**

| Verified operation in successful run        | Result                                                                      |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| UI login                                    | PASS; login HTTP 200                                                        |
| Designated room ownership                   | PASS; HTTP 200 and OWNER access                                             |
| Disposable folder creation through UI       | PASS; HTTP 201 and matching creation metadata                               |
| PDF upload to the disposable folder         | PASS                                                                        |
| Upload completion                           | HTTP 201; correlated with the intended file ID                              |
| File listing and persistence after refresh  | PASS                                                                        |
| Exact file route, filename and viewer shell | PASS                                                                        |
| Downloaded filename                         | `qa-integrity.pdf`                                                          |
| Download integrity                          | Actual downloaded bytes' SHA-256 matched the original deterministic fixture |
| Confirmed test-folder cleanup               | HTTP 204; no cleanup error reported                                         |

**Key assertions and verification limits**

Successful-run output did not emit individual upload-intent/storage HTTP statuses or diagnostic observation flags. They are not claimed here. The viewer-shell assertion does **not independently verify visual PDF rendering**. Cleanup deletion was not checked with subsequent reads; **physical storage deletion was not independently verified**.

See [Execution History](#execution-history) for both earlier failures and the successful rerun.

The intervening changes improved test diagnostics; no application fix was made. The successful run does not establish the root cause of either earlier failure or prove repeated-run reliability. Refresh, viewer and download checks were not reached in the failed attempts. All three runs used a disposable test setup and targeted the same synthetic PDF fixture; the failed attempts did not complete the upload workflow. Manual results remain unchanged.
