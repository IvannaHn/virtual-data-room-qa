# N5Deal QA automation

Playwright Test 1.56.1 + TypeScript, isolated from application dependencies. **Four API tests and one browser E2E test have passed.** Latest results: 5 unique cases, 5 PASS. History: 8 attempts — 5 passed, 2 failed E2E attempts and 1 configuration-blocked API attempt; no automatic retries. See [execution evidence](../docs/automation-test-results.md). Earlier failures remain unresolved history, not erased by the later PASS. Existing Jest tests were not executed as part of this QA assessment.

## Environment and setup

Validated runtime: Node.js 22.23.3 / npm 10.9.9. The package requires Node >=22.12.0. Node 22 was installed through user-level nvm; the user's default remained 20.18.0. Chromium and its headless shell revision 1194 were installed and used successfully. The matching browser was installed and used successfully in the recorded environment; verify its availability before reproducing execution. Other machines need the matching browser and OS libraries.

The deployed frontend is `https://virtual-data-room-ten.vercel.app`; the API is `https://virtual-data-room-production.up.railway.app`, as documented in the repository README. Use existing controlled accounts A/B and an actual room UUID owned by A, initially inaccessible to B. No isolated database or storage bucket is assumed. Tests never create accounts or rooms.

For a new environment, after installation approval:

These commands assume nvm and a compatible Node 22 release are already installed.

```sh
source ~/.nvm/nvm.sh
nvm use 22
cd qa/automation
npm ci
# Only if the matching browser is absent and browser installation is approved:
npx playwright install chromium
```

Create `.env` from `.env.example` only if it does not already exist; edit privately and restrict permissions (`chmod 600 .env`). Do not overwrite existing configuration. Variables:

| Variable | Purpose |
|---|---|
| API_BASE_URL | API origin, not frontend URL or endpoint path |
| WEB_BASE_URL | Frontend origin; defaults to the deployed Vercel URL |
| ACCOUNT_A_EMAIL / ACCOUNT_A_PASSWORD | Existing controlled owner account |
| ACCOUNT_B_EMAIL / ACCOUNT_B_PASSWORD | Separate controlled recipient account |
| TEST_ROOM_ID | Existing room UUID owned by A, not a folder ID |
| ALLOW_REMOTE_API | Must be `true` for approved remote execution; setting it is not approval |

The frontend must target the configured API. Shared configuration currently requires both accounts even for scenarios using only A. `.env`, reports, downloads under test output and node_modules are ignored. Never commit credentials or persist authentication state. Browser JWTs and public/signed URLs must not appear in diagnostics.

## Commands and project selection

Each deployed execution requires explicit approval. From `qa/automation/`, under Node 22:

```sh
npm run typecheck
env -u DEBUG -u PWDEBUG npm run test:api -- --list
env -u DEBUG -u PWDEBUG npm run test:e2e -- --list
# Execute only the explicitly approved case:
env -u DEBUG -u PWDEBUG npm run test:api -- --grep API-SEC-02
env -u DEBUG -u PWDEBUG npm run test:e2e -- --grep E2E-01
```

Substitute API-SEC-03, 04 or 05 when specifically approved. `test:api` without a filter selects all four API cases; `test:e2e` selects the single browser case. An unfiltered `playwright test` selects both projects. Listing discovers tests but does not execute them. Do not bypass preconditions or retry failures automatically.

## Framework and coverage

- `playwright.config.ts`: separate `api` and `chromium-e2e` projects; one worker, zero retries, 120-second test timeout. Traces, screenshots and videos disabled.
- `helpers/api.ts`: environment validation, authentication, isolated request contexts and sanitized API errors.
- `helpers/resources.ts`: unique disposable folders, confirmed creation IDs and scoped USER-share cleanup.
- `tests/api/authorization.spec.ts`: API-SEC-02/03/04.
- `tests/api/public-sharing.spec.ts`: API-SEC-05; public token retained only in memory.
- `tests/e2e/document-integrity.spec.ts`: E2E-01; UI login, owner-room precondition, UI folder creation, file-input upload, refresh persistence, viewer shell and browser download.
- `fixtures/pdf.ts`: deterministic one-page ASCII PDF generator, fixed synthetic text and calculated PDF offsets; no personal data or additional library dependency. Actual download bytes are SHA-256 compared with the uploaded buffer; filename must be `qa-integrity.pdf`.

| Case | Verified selected behavior |
|---|---|
| API-SEC-02 | Owner positive controls; anonymous read 401; unrelated B read/rename 404; unchanged folder state |
| API-SEC-03 | Active VIEWER reads 200; viewer rename/delete 404; owner-established state preserved |
| API-SEC-04 | Parent USER grant covers existing/new descendants; fresh B reads return 404 after revocation; owner access retained |
| API-SEC-05 | Anonymous parent/child public reads 200, outside sibling/room-root 404, fresh public reads 410 after revocation |
| E2E-01 | UI workflow and upload completion 201; persistence, file route/shell and actual downloaded byte integrity; latest run PASS |

Testing pyramid: retain the application's existing Jest unit base, add a small security-sensitive API layer and a smaller browser layer. Unit inventory was reviewed, but neither its 42 unit cases nor the health e2e case has a QA execution result here. E2E-02 was not implemented. These are selected checks, not full regression or security coverage.

## Cleanup and diagnostics

Only IDs confirmed by matching creation responses are eligible for cleanup. New names have unique QA prefixes, but cleanup never searches/deletes by name. Folder cleanup is recursive; do not add unrelated content to a disposable tree. Shares are revoked before deleting their resources. Failed/ambiguous share creation or revocation can retain the parent for controlled review; independent unshared siblings can still be cleaned up. Successful explicit revocation is not repeated. Original test failures are preserved when cleanup also fails; safe resource IDs/markers identify manual-review work.

E2E closes its browser before deleting the confirmed folder through the owner API. Its safe upload diagnostics separate file selection, intent request/response and correlation, storage PUT, completion request/response, JSON parsing and file-row visibility. They report booleans, statuses and normalized failure categories, including the actual timed-out operation. Raw URLs, bodies, headers, browser console messages and DOM snapshots are not emitted. Network correlation data stays in memory; do not enable DEBUG/PWDEBUG or attach sensitive reports. The E2E manually manages Chromium/context lifetime and deletes its downloaded artifact after hashing.

## Evidence limits

All recorded cleanup responses were 204; deletion was not independently verified through subsequent reads or physical storage inspection. Hard termination, ambiguous creation and in-flight storage work can leave artifacts. The two earlier E2E failures have no confirmed root cause; diagnostic improvements were not an application fix, and one subsequent PASS does not establish reliability.

Viewer-shell presence is not visual PDF-rendering verification. SHA-256 proves preservation of this fixture's bytes, not every file or post-move/rename combination. Revocation checks cover fresh API requests, not cached documents or previously issued signed URLs. Public sibling isolation has successful controls on the same route; room-root denial has no successful room-link control and does not prove arbitrary-room isolation. Public summary intentionally exposes dataRoomId per its DTO. Email identity assurance, comprehensive mutation/grant combinations, load and cross-browser coverage remain gaps. See [findings](../docs/findings.md) and [final QA report](../docs/final-qa-report.md).
