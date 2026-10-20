# Manual Test Cases & Execution Results — Virtual Data Room

**Execution date:** 2026-10-19  
**Environment:** Deployed Virtual Data Room  
**Browser:** Google Chrome; Incognito mode for AUTH-01–AUTH-03 and REG-01–REG-02, regular mode for LOGIN-01–LOGIN-07  
**Method:** Manual testing  
**Evidence source:** Tester-supplied results described as screenshots or explicit observations, plus a tester-supplied SHA-256 comparison result (FILE-05). Individual screenshot artifacts or paths are not identified here; no screenshots or evidence files were created during documentation. The checksum values are recorded as supplied command-verification evidence. Codex did not execute or independently rerun these tests or the checksum command.

**Reading this record:** Section-level environment and verification limits apply to every case in that section. PASS applies only to the stated checks; OBSERVED preserves an observation without establishing a confirmed defect. These are historical execution records, not necessarily standalone rerun procedures. Missing setup details are not reconstructed. Manual-only NOT TESTED statements do not supersede [separate automated execution results](automation-test-results.md). Source review does not establish runtime behavior.

## Authentication and Registration tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Browser/session | Chrome Incognito for AUTH-01–03 and REG-01–02; Google Chrome with unspecified mode for REG-03; mode unspecified for REG-04–05. |
| Evidence source | Tester-supplied observations; see document evidence provenance. |

**Test Cases & Execution Results**

### AUTH-01 — Login page availability

- **Steps:** Open the Login page.
- **Expected:** Login page displays email and password fields.
- **Actual:** Login page loaded successfully.
- **Status:** **PASS — UI only.** Authentication behavior was not tested.

### REG-01 — Empty registration form validation

- **Steps:** Open Sign up and submit all fields empty.
- **Expected:** Validation errors appear for required fields.
- **Actual:** All four fields were highlighted and displayed appropriate validation messages.
- **Status:** **PASS — UI validation only.** API validation was not verified.

### REG-02 — Successful registration

- **Steps:** Register with valid data and matching passwords.
- **Expected:** Account is created, the user is automatically signed in, and their Data Room opens.
- **Actual:** An “Account created” notification appeared, the user was automatically signed in without a separate login step, and “My Data Room” opened.
- **Status:** **PASS — observed registration journey.** The notification and navigation were observed; database persistence and API behavior were not independently verified.

### REG-03 — Password confirmation mismatch

**Steps:**

1. Open `/register`.
2. Fill in valid Full name and Email fields.
3. Enter two different passwords of at least 8 characters.
4. Click Create account.

- **Expected:** Registration is blocked with a password mismatch validation message, and the form does not navigate to the authenticated area.
- **Actual:** “Passwords do not match” appeared below Confirm password, the field was highlighted red, and the browser remained on `/register`.
- **Status:** **PASS — UI validation only.** Whether an API request was sent or the backend rejected registration was not verified. No personal email addresses or passwords are recorded.

### REG-04 — Registration with an existing email

- **Steps:** Submit the registration form using an email already associated with a test account and matching valid passwords.
- **Expected:** Duplicate registration is rejected.
- **Actual:** “An account with this email already exists” appeared, and the browser remained on `/register`.
- **Status:** **PASS — observed UI behavior.** Network responses and database state were not verified; no personal email addresses or passwords are recorded.

### REG-05 — Registration using a case variation of an existing email

- **Steps:** Change the case of several letters in an existing registered test-account email and submit otherwise valid registration data.
- **Expected:** Email comparison prevents a duplicate account.
- **Actual:** “An account with this email already exists” appeared, and the browser remained on `/register`.
- **Status:** **PASS — observed UI behavior.** The duplicate-email message was observed for the submitted case variation; network responses, database state and backend normalization were not independently verified. No personal email addresses or passwords are recorded.

### AUTH-02 — Logout

- **Steps:** Click Sign out after registration.
- **Expected:** User is redirected to Login.
- **Actual:** `/login` opened with empty email and password fields.
- **Status:** **PASS — UI redirect only.** Token invalidation and protected-route enforcement were not verified.

### AUTH-03 — Browser Back after Logout

- **Steps:** Click browser Back after logout.
- **Expected:** The private Data Room should not become accessible.
- **Actual:** `/register` opened with an empty registration form.
- **Status:** **PASS — for the observed navigation only.** This does not establish that direct access to protected routes is denied.

**Section Verification Limits**

Only the stated UI/navigation observations are established; API, backend and session-security limitations remain attached to individual cases.

## Login tests — regular Google Chrome

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Browser/session | Regular Google Chrome |
| Evidence source | Tester-reported UI observations; personal email addresses and passwords omitted. |

**Test Cases & Execution Results**

### LOGIN-01 — Empty login form

- **Steps:** Open Login, leave email and password empty, and submit.
- **Expected:** Required-field validation messages appear for both fields.
- **Actual:** Both required-field validation messages appeared.
- **Status:** **PASS — UI only.**

### LOGIN-02 — Invalid email format

- **Steps:** Enter an email value with an invalid format and submit the Login form.
- **Expected:** An email-format validation message appears.
- **Actual:** “Enter a valid email” appeared.
- **Status:** **PASS — UI only.**

### LOGIN-03 — Empty password

- **Steps:** Enter an email, leave Password empty, and submit the Login form.
- **Expected:** A required-field validation message appears for Password.
- **Actual:** “Enter your password” appeared.
- **Status:** **PASS — UI only.**

### LOGIN-04 — Incorrect password

- **Steps:** Enter an existing account's email and an incorrect password, then submit Login.
- **Expected:** A generic authentication error appears without identifying which credential is incorrect.
- **Actual:** “Invalid email or password” appeared.
- **Status:** **PASS — UI only.**

### LOGIN-05 — Nonexistent account

- **Steps:** Enter an email for a nonexistent account and a password, then submit Login.
- **Expected:** The same generic authentication error as for an incorrect password appears.
- **Actual:** The same “Invalid email or password” error appeared.
- **Status:** **PASS — UI only.** This verifies displayed message consistency, not API behavior or resistance to account enumeration through other signals.

### LOGIN-06 — Valid credentials

- **Steps:** Enter valid credentials for an existing account and submit Login.
- **Expected:** My Data Room opens with the username and Sign out control visible.
- **Actual:** My Data Room opened with the username and Sign out visible.
- **Status:** **PASS — UI only.**

### LOGIN-07 — Refresh while authenticated

- **Steps:** After successful login, refresh the page while My Data Room is open.
- **Expected:** The authenticated UI and My Data Room remain visible.
- **Actual:** Authentication and My Data Room remained visible after refresh.
- **Status:** **PASS — UI only.** Session/token handling was not independently verified through the API.

**Section Verification Limits**

No API verification was performed for these manual UI checks.

## Logout navigation and browser storage checks

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Browser/session | Mode not explicitly supplied |
| Evidence source | Tester-reported browser observations; no token values or personal credentials recorded. |

**Test Cases & Execution Results**

### AUTH-04 — Direct navigation after logout

- **Steps:** Sign out, then manually navigate to the application root URL.
- **Expected:** An unauthenticated user is redirected to Login and cannot see private room content.
- **Actual:** `/login` was displayed with an empty login form.
- **Status:** **PASS — UI route behavior only.** This check covers the application root, not every protected route or API endpoint.

### AUTH-05 — Local Storage after logout

- **Observation context:** Inspect Local Storage for the application origin after logout.
- **Actual:** Local Storage for the application origin was empty.
- **Status:** **OBSERVED.** Initially there was no before-state comparison, so this observation alone does not prove logout removed a previously stored token. AUTH-08 records a separate before/after check.

### AUTH-06 — Session Storage after logout

- **Observation context:** Inspect Session Storage for the application origin after logout.
- **Actual:** Session Storage for the application origin was empty.
- **Status:** **OBSERVED.** No before-state comparison was reported; this does not establish that logout cleared previously stored data.

### AUTH-07 — Authentication token before logout

- **Steps:** Sign in with valid test credentials and inspect Application > Local Storage for the application origin.
- **Expected:** The client-side authentication token key is present while signed in.
- **Actual:** A key named `dataroom_token` was present.
- **Status:** **PASS — presence verified.** The token value was not disclosed; token validity and server acceptance were not independently tested.

### AUTH-08 — Authentication token removal after logout

- **Steps:** While signed in, confirm `dataroom_token` is present, click Sign out, and inspect Local Storage again.
- **Expected:** The client-side authentication token is removed.
- **Actual:** `dataroom_token` disappeared, and the application redirected to `/login`.
- **Status:** **PASS — client-side removal and UI redirect verified.** This does not prove server-side invalidation of the previously issued JWT or rejection of that JWT after logout.

**Section Verification Limits**

Browser observations do not establish server-side security verification; token-specific limitations remain with each case.

## Folder Management tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Browser/session | Google Chrome; mode not specified |
| Evidence source | Tester-reported UI observations |

**Test Cases & Execution Results**

### FOLDER-01 — Empty folder name

- **Steps:** Open New folder and click Create with an empty name.
- **Expected:** Validation prevents creation.
- **Actual:** “Enter a folder name” appeared, the input was highlighted red, and the dialog remained open.
- **Status:** **PASS — UI validation.**

### FOLDER-02 — Whitespace-only folder name

- **Steps:** Enter five spaces in the New folder name field and click Create.
- **Expected:** A whitespace-only name is rejected.
- **Actual:** “Enter a folder name” appeared, the input was highlighted red, and the dialog remained open.
- **Status:** **PASS — UI validation.**

### FOLDER-03 — Create folder with valid name

- **Steps:** Create a folder named `QA_Test_20261019`.
- **Expected:** The folder appears in My Data Room.
- **Actual:** The folder appeared, the dialog closed, and a “Folder created” notification was displayed.
- **Status:** **PASS — UI.**

### FOLDER-04 — Folder persistence

- **Steps:** Refresh the page after creating the folder.
- **Expected:** The folder remains visible.
- **Actual:** `QA_Test_20261019` was still present with the same name.
- **Status:** **PASS — UI.** Persistence was observed through page refresh; database state was not independently verified.

### FOLDER-05 — Duplicate folder name

- **Steps:** Attempt to create another folder named `QA_Test_20261019` in the same location.
- **Expected:** Duplicate creation is rejected.
- **Actual:** “A folder named 'QA_Test_20261019' already exists here” was displayed.
- **Status:** **PASS — UI.**

### FOLDER-06 — Case-insensitive duplicate

- **Steps:** Attempt to create `qa_test_20261019` in the same location.
- **Expected:** Duplicate creation is rejected regardless of letter case.
- **Actual:** “A folder named 'qa_test_20261019' already exists here” was displayed.
- **Status:** **PASS — UI.**

### FOLDER-07 — Open existing folder

- **Steps:** Open `QA_Test_20261019` from My Data Room.
- **Expected:** Folder contents and breadcrumbs appear.
- **Actual:** The folder opened at `/folder/{id}`, displayed `My Data Room > QA_Test_20261019`, and showed “This folder is empty”.
- **Status:** **PASS — UI.**

### FOLDER-08 — Create nested folder

- **Steps:** Inside `QA_Test_20261019`, create `QA_Child_20261019`.
- **Expected:** The child folder appears inside the parent.
- **Actual:** `QA_Child_20261019` appeared in the parent's contents list.
- **Status:** **PASS — UI.**

### FOLDER-09 — Navigate into nested folder

- **Steps:** Open `QA_Child_20261019`.
- **Expected:** The full folder hierarchy is displayed.
- **Actual:** Breadcrumbs displayed `My Data Room > QA_Test_20261019 > QA_Child_20261019`. The folder was empty.
- **Status:** **PASS — UI.**

### FOLDER-10 — Navigate to parent via breadcrumbs

- **Steps:** Click `QA_Test_20261019` in the breadcrumb trail.
- **Expected:** Navigate to the parent folder with its child folder visible.
- **Actual:** The parent folder opened and `QA_Child_20261019` was visible.
- **Status:** **PASS — UI.**

### FOLDER-11 — Rename nested folder

- **Steps:** Rename a nested folder using its action menu.
- **Expected:** The folder name changes without affecting its parent location.
- **Actual:** The new name appeared under the same parent folder, and the “Folder renamed” notification was displayed.
- **Status:** **PASS — UI.**

### FOLDER-12 — Open renamed folder

- **Steps:** Open the renamed nested folder.
- **Expected:** The folder opens and breadcrumbs display its updated name.
- **Actual:** The folder opened successfully with the updated breadcrumb.
- **Status:** **PASS — UI.**

### FOLDER-13 — Folder ID stability during a controlled rename

- **Steps:** Rename `QA_Child_Renamed_20261019` to `QA_Child_Final_20261019` and reopen it.
- **Expected:** The existing folder keeps its original ID.
- **Actual:** The ID remained `d24e73a7-aa1c-4626-ae62-67e08184ee81`.
- **Status:** **PASS — UI.** ID stability was observed through the UI; no API or database verification is claimed.

### FOLDER-14 — Rename persistence after refresh

- **Steps:** Refresh the renamed folder using Ctrl+R.
- **Expected:** The folder remains accessible with its updated name and unchanged ID.
- **Actual:** The folder opened successfully with the name `QA_Child_Final_20261019`, correct breadcrumbs, and unchanged ID.
- **Status:** **PASS — UI.**

**Clarification:** An earlier suspicion that folder IDs changed after rename resulted from comparing two different folders. It was not a product defect and is not recorded as a bug.

**NOT TESTED:** Preservation of files after folder renaming. The folders used for these rename checks were empty; the results above do not establish preservation of file contents or associations.

### FOLDER-15 — Delete confirmation dialog

- **Case-specific verification limits:** Detailed execution steps and the exact target folder were not supplied; the recorded outcome is preserved without reconstructing a procedure.
- **Expected:** A confirmation dialog identifies the target folder and explains deletion consequences.
- **Actual:** The dialog displayed the folder name, “This folder is empty. This action cannot be undone.”, and Cancel/Delete buttons.
- **Status:** **PASS — UI confirmation only.**

### FOLDER-16 — Cancel folder deletion

- **Case-specific verification limits:** Detailed execution steps and the exact target folder were not supplied; the recorded outcome is preserved without reconstructing a procedure.
- **Expected:** Cancel closes the confirmation dialog without deleting the folder.
- **Actual:** The dialog closed and the folder remained visible.
- **Status:** **PASS — UI.**

### FOLDER-17 — Delete empty folder

- **Expected:** An empty folder can be deleted.
- **Actual:** The tester reported successfully deleting an empty test folder previously.
- **Status:** **PASS — tester-reported manual result.** No screenshot or API evidence was supplied. Detailed execution steps and additional observations were not supplied.

**Section Verification Limits**

No HTTP status codes, API results or database verification are claimed. No confirmed functional bugs were observed in the recorded folder scenarios.

## File Management tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Browser/tools | Chrome download feedback and local opening in FILE-04; tester-performed Linux checksum comparison in FILE-05. Additional file checks used Chrome. |
| Evidence source | Supplied UI/manual observations and command-verification evidence; no personal data or PDF contents recorded. |

**Test Cases & Execution Results**

### FILE-01 — Reject non-PDF file

- **Steps:** Attempt to upload a JPG image.
- **Expected:** Non-PDF upload is rejected.
- **Actual:** The application displayed an error stating the image is not a PDF.
- **Status:** **PASS — UI.**

### FILE-02 — Upload valid PDF

- **Steps:** Upload `3.pdf` into a nested test folder.
- **Expected:** The PDF appears in the selected folder.
- **Actual:** `3.pdf` appeared with a displayed size of 121 KB, and “Uploads complete” was shown.
- **Status:** **PASS — UI.**

### FILE-03 — Preview uploaded PDF

- **Steps:** Open `3.pdf` in the application.
- **Expected:** The PDF renders correctly.
- **Actual:** A one-page PDF opened; text and tables were readable.
- **Status:** **PASS — UI.**

### FILE-04 — Download PDF

- **Steps:** Download `3.pdf` from the application and open it locally.
- **Expected:** The download completes with the correct filename and readable content.
- **Actual:** Chrome showed “Done”, the downloaded file was named `3.pdf`, and it opened successfully.
- **Status:** **PASS — manual.**

### FILE-05 — Verify PDF byte integrity

- **Steps:** Compare SHA-256 checksums of the original and downloaded PDF using `sha256sum` on Linux.
- **Original:** `~/Pictures/3.pdf`.
- **Downloaded:** `~/Downloads/3.pdf`.
- **Expected:** Hashes match.
- **Actual:** Both SHA-256 values matched exactly: `fba710e99e8466ebefd42cd03764a46102a43f24e101649e116561c9f86f71dc`.
- **Status:** **PASS — byte-for-byte integrity verified.**
- **Case-specific verification limits:** Tester-performed command verification with matching checksum values supplied for documentation. No screenshot or command-output file was supplied; the command was not rerun during documentation. This result applies to this original/downloaded pair, not to all files or subsequent operations.

### FILE-06 — Rename PDF

- **Steps:** Rename `3.pdf` to `QA_Test_Renamed.pdf`.
- **Expected:** The file displays its updated name while remaining in the same folder with the same displayed size.
- **Actual:** The application displayed “File renamed”. The file remained in the same folder, and the displayed size remained 121 KB.
- **Status:** **PASS — UI.**

### FILE-07 — PDF Preview After Rename

- **Steps:** Open the PDF after the first rename. Refresh after the preview fallback appears. Repeat the scenario by renaming the file to `QA_Test_Renamed_v2.pdf` and opening it again.
- **Expected:** The renamed PDF opens in preview and retains its file ID.
- **Actual:** After the first rename, opening the PDF initially displayed “This browser can't preview PDFs inline”. Refreshing the page restored normal PDF preview. On retest after renaming to `QA_Test_Renamed_v2.pdf`, the PDF opened immediately without refreshing. The file ID remained unchanged.
- **Status:** **OBSERVED — intermittent preview fallback, not reproduced on retest.**
- **Interpretation:** This is not a confirmed rename defect. The root cause is unknown; investigate if repeated. No API, network or database cause was verified.

### FILE-08 — Move PDF to Parent Folder

- **Steps:** Move `QA_Test_Renamed_v2.pdf` from `QA_Child_Final_20261019` to `QA_Test_20261019`.
- **Expected:** The move succeeds and the file no longer appears in the source folder.
- **Actual:** The application displayed a successful move notification, and the file disappeared from the source folder.
- **Status:** **PASS — UI.** Destination visibility is recorded separately in FILE-09.

### FILE-09 — Verify Destination After Move

- **Steps:** Open the destination folder `QA_Test_20261019`.
- **Expected:** The moved PDF appears with its correct name and displayed size, and the child folder remains present.
- **Actual:** `QA_Test_Renamed_v2.pdf` appeared with the correct name and displayed size of 121 KB. The child folder remained present.
- **Status:** **PASS — UI.**

### FILE-10 — Verify PDF After Move

- **Steps:** Open the moved PDF.
- **Expected:** The PDF renders successfully and retains its original file ID.
- **Actual:** The document rendered successfully with readable text and tables. The file URL retained its original ID: `abf1b14e-67c2-44a2-a789-8fe15ed3a497`.
- **Status:** **PASS — UI.**
- **NOT TESTED:** Byte-for-byte integrity after the move was not separately checked. The earlier checksum comparison in FILE-05 does not establish post-move byte integrity.

**Additional file checks:** Performed manually by the tester on 2026-10-19 in Chrome; documented from supplied observations, not executed by Codex.

### FILE-11 — Multiple PDF Upload

- **Steps:** Select three different PDFs in one Upload operation in `QA_Multiple_Upload_20261019`.
- **Expected:** All selected PDFs appear in the folder.
- **Actual:** All three appeared: `3.pdf` (121 KB), `4.pdf` (61 KB), and `download2.pdf` (181 KB).
- **Status:** **PASS — UI.**

### FILE-12 — Per-file Upload Progress

- **Steps:** Observe the upload panel during the three-file upload.
- **Expected:** Each PDF has its own upload status and progress indicator.
- **Actual:** The panel displayed names, uploading statuses and separate progress indicators for all three PDFs. Actual percentage accuracy and behavior under throttled network conditions were not checked.
- **Status:** **PASS — UI.**

### FILE-13 — Duplicate Filename on Upload

- **Steps:** Upload another local file named `3.pdf` into the same folder.
- **Expected:** The name conflict is resolved without replacing the existing file in the UI.
- **Actual:** The upload automatically created `3 (1).pdf`. The existing `3.pdf` remained unchanged in the UI.
- **Status:** **PASS — UI.**

### FILE-14 — Duplicate Filename via Drag & Drop

- **Steps:** Drag and drop another `3.pdf` into the folder after the preceding duplicate upload.
- **Expected:** The additional conflict is resolved with another unique display name.
- **Actual:** The upload automatically created `3 (2).pdf`. All three named versions were displayed successfully after upload.
- **Status:** **PASS — UI.**

### FILE-15 — Rename to Existing Filename

- **Steps:** Rename `4.pdf` (61 KB) to the occupied name `3.pdf`.
- **Expected:** The conflict is resolved while retaining the existing file and the renamed file's displayed size.
- **Actual:** The file was automatically renamed to `3 (3).pdf`, with an explanatory toast. The original `3.pdf` (121 KB) remained visible, and the renamed file retained its displayed size of 61 KB.
- **Status:** **PASS — UI.**

### FILE-16 — Filename Conflict During Move

- **Steps:** Move another `3.pdf` into `QA_Move_Target_20261019`, which already contains `3.pdf`.
- **Expected:** The move resolves the filename conflict and both files appear at the destination.
- **Actual:** A success toast explained automatic renaming to `3 (1).pdf`. The destination contained `3.pdf` and `3 (1).pdf`, each showing 121 KB. Byte-level integrity after moving was not tested.
- **Status:** **PASS — UI.**

### FILE-17 — Individual PDF Deletion and Cancel

- **Steps:** Open Delete for `3 (1).pdf`; cancel and check both documents. Then confirm Delete for that file.
- **Expected:** The dialog identifies the file and consequences; Cancel preserves both documents, and confirmed deletion removes only the selected file.
- **Actual:** The confirmation displayed the correct filename, an irreversible-action warning, Cancel and Delete. Cancel preserved both documents. A subsequent confirmed Delete removed only `3 (1).pdf`; `3.pdf` remained. Deletion success was shown.
- **Status:** **PASS — UI.**

### FILE-18 — Remaining PDF Preview After Deletion

- **Steps:** Open the remaining `3.pdf` in Preview.
- **Expected:** The remaining PDF is readable.
- **Actual:** The single-page PDF opened successfully; text and table rendered. Byte-level integrity was not checked.
- **Status:** **PASS — UI.**

### FILE-DND-01 — Upload Valid PDF via Drag & Drop

**Steps:**

1. Open an accessible Data Room folder.
2. Drag a valid PDF file from the local file manager into the browser's upload area.
3. Drop the file.
4. Verify that the PDF appears in the folder.

- **Expected:** The PDF uploads successfully and appears in the current folder.
- **Actual:** The tester confirmed that the PDF was successfully uploaded via Drag & Drop and appeared in the folder.
- **Status:** **PASS — tester-reported manual UI observation.**
- **Case-specific verification limits:** Byte integrity, API responses and other Drag & Drop edge cases were not verified. FILE-02 records a valid PDF upload without specifying the input method; this case separately records the explicitly confirmed Drag & Drop interaction. Codex did not execute this test.

**Section Verification Limits**

UI/manual observations and command verification are distinguished per case. No HTTP responses or API test execution are claimed.

## Sharing & Permissions tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Owner | Account A, regular Chrome |
| Recipient | Account B (QA Recipient Test), Chrome Incognito |
| Anonymous session | Unauthenticated Chrome Incognito before recipient registration |
| Evidence source | Tester-supplied observations/screenshots or explicit confirmations; no stored screenshot artifacts or evidence paths are claimed. Codex did not execute these tests. |
| Data handling | Account labels identify roles only; no credentials, authentication/public-sharing tokens, recipient emails or PDF personal data recorded. |

**Test Cases & Execution Results**

### SHARE-01 — Open Share Dialog

- **Steps:** Open the file sharing dialog.
- **Expected:** Public-link sharing, email sharing and current access information are available.
- **Actual:** The dialog displayed Public link, Email sharing, and People with access.
- **Status:** **PASS — UI.**

### SHARE-02 — Create Public Link

- **Steps:** As the owner, create a public link for `QA_Test_Renamed_v2.pdf`.
- **Expected:** The link is created with controls to copy and revoke it.
- **Actual:** The application displayed “Public link created”, a Copy button, and Revoke public link.
- **Status:** **PASS — UI.**

### SHARE-03 — Anonymous Public Link Access

- **Steps:** Open the public link in an unauthenticated Incognito session.
- **Expected:** The PDF is readable without authentication and ownership management controls are absent.
- **Actual:** The PDF rendered successfully. No Rename, Move, Delete, or Share controls appeared.
- **Status:** **PASS — UI.** Hidden controls do not establish API mutation restrictions.

### SHARE-04 — Anonymous Download

- **Steps:** Download the PDF through the public link without authentication and open it locally.
- **Expected:** The download preserves the filename and produces a readable PDF.
- **Actual:** The filename was preserved, and the downloaded PDF opened locally.
- **Status:** **PASS — manual.**
- **NOT TESTED:** Byte-level integrity for this download.

### SHARE-05 — Revoke Public Link

- **Steps:** As the owner, revoke the public link.
- **Expected:** Revocation is confirmed and creating a public link becomes available again.
- **Actual:** The application displayed “Public link revoked”. The Create public link button became available again.
- **Status:** **PASS — UI.**

### SHARE-06 — Access Through Revoked Public Link

- **Steps:** Refresh the previously working public link in Incognito.
- **Expected:** The revoked link no longer displays the document and communicates revocation.
- **Actual:** The application displayed “This link has been revoked”. The document was no longer displayed.
- **Status:** **PASS — UI.** Previously issued download URLs were not separately tested.

### SHARE-07 — Create Recipient Account

- **Steps:** Register a separate recipient test account in Incognito.
- **Expected:** Registration succeeds, automatically signs in the recipient and opens their empty Data Room.
- **Actual:** Registration succeeded, automatic sign-in occurred, and the new user's Data Room was empty.
- **Status:** **PASS — UI.** This records the separate recipient setup execution, not a duplicate entry for REG-02.

### SHARE-08 — Shared With Me Before Sharing

- **Steps:** Check the recipient's Shared with me page before granting access.
- **Expected:** No shared resources are listed.
- **Actual:** The list was empty, displaying “Nothing has been shared with you yet.”
- **Status:** **PASS — UI.**

### SHARE-09 — Share PDF by Email

- **Steps:** As the owner, share one PDF with the registered recipient.
- **Expected:** Sharing is confirmed and the recipient appears in People with access with a revocation control.
- **Actual:** The application confirmed sharing. The recipient appeared in People with access with a Revoke option.
- **Status:** **PASS — UI.**

### SHARE-10 — Verify Shared File Visibility

- **Steps:** Refresh Shared with me as the recipient.
- **Expected:** The shared PDF appears with its correct filename and a download action.
- **Actual:** The PDF appeared with its correct filename and Download action.
- **Status:** **PASS — UI.**

### SHARE-11 — Open Shared PDF

- **Steps:** As the recipient, open the shared PDF and wait for it to load.
- **Expected:** The PDF becomes readable without ownership management controls.
- **Actual:** The viewer initially appeared blank/dark while loading. After waiting, the PDF rendered successfully without refreshing. The document was readable, and ownership management controls were absent.
- **Status:** **PASS — UI.** The initial loading state is not classified as a confirmed defect; no loading duration was supplied.

### SHARE-12 — Unauthorized Folder Access

- **Steps:** As the recipient, open an unshared private folder belonging to the owner using its direct folder URL.
- **Expected:** Private folder contents are not displayed to the recipient.
- **Actual:** The application displayed “Folder not found”. The folder contents were not displayed.
- **Status:** **PASS — UI.** This does not establish comprehensive API authorization security or BOLA/IDOR protection.

### SHARE-13 — Revoke Email Access

- **Steps:** As the owner, revoke the recipient's access to the PDF.
- **Expected:** The operation is confirmed and the recipient is removed from People with access.
- **Actual:** The application confirmed the operation, and People with access became empty.
- **Status:** **PASS — UI.**

### SHARE-14 — Shared With Me After Revocation

- **Steps:** Refresh Shared with me as the recipient.
- **Expected:** The revoked PDF is no longer listed and the empty state appears.
- **Actual:** The previously shared PDF disappeared. The empty-state message was displayed.
- **Status:** **PASS — UI.**

### SHARE-15 — Direct File Access After Revocation

- **Steps:** As the recipient, reopen the previously accessible `/shared-with-me/file/{fileId}` URL.
- **Expected:** The previously shared PDF content is no longer accessible through this UI route.
- **Actual:** The application displayed “File not found” and explained that the file may not exist or the user may lack access. PDF content was not displayed.
- **Status:** **PASS — UI.**

**Section Verification Limits**

No direct API authorization or mutation tests were performed. No HTTP response statuses or backend database changes were independently verified. These UI results do not establish complete BOLA/IDOR protection. Previously issued download URLs were not separately tested after revocation. Anonymous download byte integrity remains NOT TESTED. No screenshots or additional execution artifacts are claimed.

## Folder Sharing & Inherited Permissions tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Owner | Account A, regular Chrome |
| Recipient | Account B (QA Recipient Test), Chrome Incognito |
| Evidence source | Results supplied by the tester, not executed by Codex. |

**Test Cases & Execution Results**

### FOLDER-SHARE-01 — Open Folder Share Dialog

- **Steps:** As Account A, open Share for `QA_Test_20261019`.
- **Expected:** The folder Share dialog opens.
- **Actual:** The owner opened the folder Share dialog.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-02 — Share Parent Folder by Email

- **Steps:** As Account A, share `QA_Test_20261019` with Account B by email.
- **Expected:** The owner can grant the recipient access to the parent folder.
- **Actual:** The owner shared the parent folder with Account B by email.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-03 — Shared Parent Folder Visibility

- **Steps:** As Account B, check Shared with me after the grant.
- **Expected:** The shared parent folder is listed.
- **Actual:** `QA_Test_20261019` appeared in Shared with me.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-04 — View Shared Parent Contents

- **Steps:** As Account B, open the shared parent folder.
- **Expected:** The recipient can see its nested folder and existing PDF.
- **Actual:** The recipient saw `QA_Child_Final_20261019` and `QA_Test_Renamed_v2.pdf`.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-05 — Read-Only PDF Actions

- **Steps:** As Account B, inspect the existing PDF actions in the shared folder.
- **Expected:** Download is available without owner modification actions.
- **Actual:** PDF actions contained Download only; Rename, Move, Delete and Share were absent.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-06 — Open Empty Shared Nested Folder

- **Steps:** As Account B, open `QA_Child_Final_20261019` before the new upload.
- **Expected:** The nested folder is accessible without modification controls.
- **Actual:** The recipient opened the initially empty nested folder without modification controls.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-07 — New Nested File Inherits Access

- **Steps:** As Account A, upload `4.pdf` into the nested folder after sharing; observe the recipient view.
- **Expected:** New nested content is visible through the existing parent-folder grant.
- **Actual:** `4.pdf` automatically appeared for the recipient after the owner uploaded it.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-08 — Preview New Shared Nested PDF

- **Steps:** As Account B, open `4.pdf` and inspect available actions.
- **Expected:** The PDF renders with Download available and no owner modification actions.
- **Actual:** The PDF rendered correctly, with Download available and no owner modification actions.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-09 — Revoke Parent Folder Access

- **Steps:** As Account A, revoke Account B's access to the parent folder.
- **Expected:** The owner can revoke the parent-folder grant.
- **Actual:** The owner revoked recipient access to `QA_Test_20261019`.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-10 — Nested PDF After Revocation

- **Steps:** As Account B, refresh the previously accessible nested PDF after revocation.
- **Expected:** The nested PDF is no longer displayed through the revoked grant.
- **Actual:** The application displayed “File not found”.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-11 — Shared Folder List After Revocation

- **Steps:** As Account B, check Shared with me after revocation.
- **Expected:** The revoked parent folder is no longer listed.
- **Actual:** The parent folder disappeared from Shared with me.
- **Status:** **PASS — UI.**

### FOLDER-SHARE-12 — Direct Nested Folder Access After Revocation

- **Steps:** As Account B, open the nested folder's direct shared-view URL after revocation.
- **Expected:** The nested folder is not accessible through the revoked grant.
- **Actual:** The application displayed “Folder not found”.
- **Status:** **PASS — UI.**

**Section Verification Limits**

These UI/manual observations do not establish backend authorization, HTTP statuses, database/storage deletion or signed URL invalidation; the shared limitation note under Non-Empty Folder Deletion also applies.

## Non-Empty Folder Deletion tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Owner | Account A, regular Chrome |
| Recipient | Account B (QA Recipient Test), Chrome Incognito |
| Evidence source | Results supplied by the tester, not executed by Codex. |

**Test Cases & Execution Results**

### FOLDER-DELETE-01 — Non-Empty Folder Delete Warning

- **Steps:** As Account A, open the delete confirmation for `QA_Test_20261019`.
- **Expected:** The warning identifies the affected contents and explains permanent, irreversible deletion.
- **Actual:** The confirmation correctly warned about 1 subfolder and 2 files (182 KB), permanent deletion and inability to undo.
- **Status:** **PASS — UI.**

### FOLDER-DELETE-02 — Cancel Non-Empty Folder Deletion

- **Steps:** Click Cancel in the parent folder's delete confirmation.
- **Expected:** The dialog closes and the parent folder remains visible.
- **Actual:** The confirmation closed and the parent folder remained visible.
- **Status:** **PASS — UI.**

### FOLDER-DELETE-03 — Contents Preserved After Cancel

- **Steps:** After cancelling deletion, verify the nested folder and files are preserved.
- **Expected:** Cancelling deletion preserves the nested folder and files.
- **Actual:** The tester confirmed that the nested folder and files were preserved after Cancel.
- **Status:** **PASS — tester-reported manual verification.**

### FOLDER-DELETE-04 — Delete Non-Empty Parent Folder

- **Steps:** As Account A, delete the non-empty parent folder.
- **Expected:** Deletion succeeds and the deleted parent no longer appears in the Data Room.
- **Actual:** A success notification appeared and the Data Room became empty.
- **Status:** **PASS — UI.**

### FOLDER-DELETE-05 — Deleted Parent Folder URL

- **Steps:** Open the deleted parent folder's URL.
- **Expected:** The deleted parent folder is no longer accessible through its UI route.
- **Actual:** The application displayed “Folder not found”.
- **Status:** **PASS — UI.**

### FOLDER-DELETE-06 — Deleted Nested Folder URL

- **Steps:** Open the deleted nested folder's URL.
- **Expected:** The deleted nested folder is no longer accessible through its UI route.
- **Actual:** The application displayed “Folder not found”.
- **Status:** **PASS — UI.**

### FOLDER-DELETE-07 — Deleted Existing PDF URL

- **Steps:** Open the direct URL of deleted `QA_Test_Renamed_v2.pdf`.
- **Expected:** The deleted PDF is no longer accessible through its UI route.
- **Actual:** The application displayed “File not found”.
- **Status:** **PASS — UI.**

### FOLDER-DELETE-08 — Deleted Nested PDF URL

- **Steps:** Open the direct URL of deleted `4.pdf`.
- **Expected:** The deleted nested PDF is no longer accessible through its UI route.
- **Actual:** The application displayed “File not found”.
- **Status:** **PASS — UI.**

**Section Verification Limits**

These are UI/manual observations, not proof of complete backend security. API authorization, HTTP statuses, physical database/storage deletion and server-side permission enforcement were not independently verified. Previously issued temporary download URLs were not separately tested after revocation or deletion. No confirmed functional bugs were established in these scenarios. No credentials, sharing tokens, recipient email addresses, PDF personal data or invented evidence paths are recorded.

## Data Room Sharing tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Owner | Account A, regular Chrome |
| Recipient | Account B (QA Recipient Test), Chrome Incognito |
| Evidence source | Tester-supplied observations/screenshots or explicit confirmations; no stored screenshot artifacts or evidence paths are claimed. Codex did not execute these tests. |

**Test Cases & Execution Results**

### ROOM-SHARE-01 — Open Data Room Share Dialog

- **Steps:** As Account A, open Share for My Data Room.
- **Expected:** Room sharing options and existing access information are available.
- **Actual:** Public link, email sharing and People with access were available.
- **Status:** **PASS — UI.**

### ROOM-SHARE-02 — Grant Room Email Access

- **Steps:** As Account A, grant email access to Account B.
- **Expected:** Sharing is confirmed and the recipient is listed.
- **Actual:** Success confirmation appeared and the recipient appeared under People with access.
- **Status:** **PASS — UI.**

### ROOM-SHARE-03 — Shared Room Visibility

- **Steps:** As Account B, check Shared with me.
- **Expected:** The shared room is listed.
- **Actual:** My Data Room appeared in Shared with me.
- **Status:** **PASS — UI.**

### ROOM-SHARE-04 — Open Shared Room

- **Steps:** As Account B, open the shared room.
- **Expected:** Room contents are visible without owner management controls.
- **Actual:** `QA_Multiple_Upload_20261019` was visible. Upload, New Folder, Share and owner mutation controls were absent.
- **Status:** **PASS — UI.**

### ROOM-SHARE-05 — Navigate Shared Folder

- **Steps:** As Account B, open `QA_Multiple_Upload_20261019`.
- **Expected:** Its nested contents are visible without upload/create/share controls.
- **Actual:** The recipient saw nested folder `QA_Move_Target_20261019` and four PDFs. No upload/create/share controls were displayed.
- **Status:** **PASS — UI.**

### ROOM-SHARE-06 — Navigate Second-Level Folder

- **Steps:** As Account B, open the second-level nested folder.
- **Expected:** Inherited read access permits browsing without mutation controls.
- **Actual:** `3.pdf` (121 KB) was visible, with no mutation controls.
- **Status:** **PASS — UI.**

### ROOM-SHARE-07 — Read-Only File Action Menu

- **Steps:** As Account B, inspect the file action menu.
- **Expected:** Download is available without owner actions.
- **Actual:** The menu contained Download only, without Rename, Move, Delete or Share.
- **Status:** **PASS — UI.**

### ROOM-SHARE-08 — Preview Nested PDF Through Room Share

- **Steps:** As Account B, open `3.pdf` from the second-level nested folder.
- **Expected:** The PDF is readable and Download is available.
- **Actual:** Single-page PDF preview rendered successfully and Download was available.
- **Status:** **PASS — UI.**

### ROOM-SHARE-09 — Already Rendered PDF After Reported Revocation

- **Steps:** With the PDF open for Account B, have Account A revoke room access; observe the existing recipient page without refreshing.
- **Expected:** Assess the existing rendered page separately from a fresh access attempt; immediate removal of rendered content is not established as an acceptance requirement.
- **Actual:** The tester reported that the owner revoked Account B's room access while the PDF was open. The already rendered PDF remained visible without refreshing.
- **Status:** **OBSERVED — UI.**
- **Evidence and interpretation:** Tester-reported revocation; no owner-side revocation screenshot was provided for this particular scenario. Continued visibility of an already rendered PDF is not a confirmed defect or evidence of a fresh unauthorized server fetch. No cause or signed URL behavior was independently verified.

### ROOM-SHARE-10 — Refresh PDF After Room Revocation

- **Steps:** As Account B, refresh the previously open shared PDF URL after reported revocation.
- **Expected:** The PDF no longer renders through the revoked room grant.
- **Actual:** “File not found” appeared and content no longer rendered.
- **Status:** **PASS — UI.**

### ROOM-SHARE-11 — Shared List After Room Revocation

- **Steps:** As Account B, check Shared with me after revocation.
- **Expected:** The revoked room is no longer listed.
- **Actual:** “Nothing has been shared with you yet” was displayed.
- **Status:** **PASS — UI.**

### ROOM-SHARE-12 — Nested Folder URL After Room Revocation

- **Steps:** As Account B, open the previously accessible nested folder URL after revocation.
- **Expected:** The nested folder is no longer accessible through the revoked room grant.
- **Actual:** “Folder not found” was displayed.
- **Status:** **PASS — UI.**

### ROOM-SHARE-13 — Room URL After Revocation

- **Steps:** As Account B, open the previously accessible Data Room URL after revocation.
- **Expected:** The revoked room is not accessible through its UI route.
- **Actual:** “Data room not found” was displayed.
- **Status:** **PASS — UI.**

**Section Verification Limits**

These UI observations do not establish server-side authorization security, database deletion, storage access revocation, HTTP status codes or signed URL invalidation. No API tests were performed. Previously issued temporary download URLs were not separately tested. No credentials, sharing tokens, recipient email addresses or PDF personal data are recorded.

## Public Folder Sharing tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Owner | Account A, regular Chrome |
| Anonymous user | Signed-out Chrome Incognito |
| Parent folder | `QA_PublicShare_20261019` |
| Nested folder | `QA_PublicChild_20261019` |
| Test PDF | `download.pdf` (35 KB) |
| Evidence source | Tester-supplied observations/screenshots or explicit confirmations; no stored screenshot artifacts or evidence paths are claimed. Codex did not execute these tests. |

**Test Cases & Execution Results**

### PUBLIC-FOLDER-01 — Create Public-Test Parent Folder

- **Steps:** As Account A, create `QA_PublicShare_20261019`.
- **Expected:** The parent folder is created.
- **Actual:** The tester confirmed creation of `QA_PublicShare_20261019`.
- **Status:** **PASS — tester-reported.**
- **Case-specific verification limits:** Tester confirmation only; no independent backend verification.

### PUBLIC-FOLDER-02 — Upload Public-Test PDF

- **Steps:** As Account A, upload `download.pdf` into the parent folder.
- **Expected:** The PDF appears in the parent folder.
- **Actual:** The owner uploaded `download.pdf` (35 KB). The tester confirmed it was suitable for public testing and contained no confidential information.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-03 — Create Parent Folder Public Link

- **Steps:** As Account A, create a public link for the parent folder.
- **Expected:** The link is created with copy and revoke controls.
- **Actual:** The application displayed “Public link created”, Copy and Revoke public link.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-04 — Anonymous Parent Folder Access

- **Steps:** While signed out in Incognito, open the parent folder public link.
- **Expected:** The parent and PDF are visible without authentication, with Download but no mutation controls.
- **Actual:** The parent folder and `download.pdf` were visible. Download was available and mutation controls were absent.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-05 — Anonymous Parent PDF Preview

- **Steps:** As the anonymous user, open `download.pdf` in Preview.
- **Expected:** The PDF renders without authentication.
- **Actual:** Its one-page PDF content rendered successfully without authentication.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-06 — Anonymous PDF Download

- **Steps:** As the anonymous user, download the PDF and open it locally.
- **Expected:** The downloaded PDF opens locally.
- **Actual:** The tester confirmed that the anonymous download opened successfully locally. Byte-level integrity was not independently checked.
- **Status:** **PASS — tester-reported.**
- **Case-specific verification limits:** Tester confirmation only; byte-level integrity was not independently checked.

### PUBLIC-FOLDER-07 — New Nested Folder Inherits Public Access

- **Steps:** After creating the link, add `QA_PublicChild_20261019` as the owner; refresh the existing anonymous public view.
- **Expected:** The new nested folder is visible through the existing public link.
- **Actual:** The anonymous user saw the new folder after refreshing, without requiring a new public link.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-08 — Open Empty Public Nested Folder

- **Steps:** As the anonymous user, open the newly created nested folder.
- **Expected:** The empty folder is accessible without mutation controls.
- **Actual:** The empty state was shown and mutation controls were absent.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-09 — Upload Nested PDF After Sharing

- **Steps:** As Account A, upload `download.pdf` into the nested folder while public sharing is active.
- **Expected:** The owner can add the PDF to the nested folder.
- **Actual:** The owner uploaded `download.pdf` (35 KB) into the nested folder after public sharing was already active.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-10 — New Nested PDF Inherits Public Access

- **Steps:** As the anonymous user, refresh the nested folder page after the upload.
- **Expected:** The newly added PDF is visible without authentication or a new link.
- **Actual:** The newly added PDF appeared. Authentication and a new sharing link were not required.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-11 — Preview Newly Added Nested PDF

- **Steps:** As the anonymous user, open the newly added nested PDF in Preview.
- **Expected:** The nested PDF renders successfully.
- **Actual:** Its single page, text and chart rendered successfully.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-12 — Revoke Parent Folder Public Link

- **Steps:** As Account A, revoke the parent folder public link.
- **Expected:** The Share dialog returns to the link-creation state.
- **Actual:** The owner revoked the link and the Share dialog returned to “Create public link”.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-13 — Nested PDF After Public Revocation

- **Steps:** As the anonymous user, refresh the previously accessible nested PDF URL after revocation.
- **Expected:** The application reports revocation and no longer displays the PDF.
- **Actual:** The page displayed “This link has been revoked”, and the document was no longer accessible through the application.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-14 — Nested Folder After Public Revocation

- **Steps:** As the anonymous user, revisit the nested folder URL after revocation.
- **Expected:** The application reports revocation and does not display nested folder contents.
- **Actual:** “This link has been revoked” appeared and folder contents were not shown.
- **Status:** **PASS — UI.**

### PUBLIC-FOLDER-15 — Parent Folder After Public Revocation

- **Steps:** As the anonymous user, revisit the original parent folder public link after revocation.
- **Expected:** The application reports revocation and does not display parent folder contents.
- **Actual:** “This link has been revoked” appeared and parent folder contents were not shown.
- **Status:** **PASS — UI.**

**Section Verification Limits**

Manual UI observations only; no independent backend authorization or storage-access verification. Revocation observations do not establish signed storage URL invalidation or storage-level access revocation. Case-specific tester-confirmation and byte-integrity limits remain with the relevant cases. No physical data deletion or HTTP response statuses are claimed. Public-link tokens and signed storage URLs are intentionally omitted. The tester reported a token visible in testing screenshots; the owner subsequently revoked the public link. No confirmed defects were found in these scenarios.

## Concurrent Viewing and Folder Deletion tests

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Owner | Account A, regular Chrome |
| Recipient | Account B (QA Recipient Test), Chrome Incognito |
| Shared parent | `QA_PublicShare_20261019` |
| Deleted nested folder | `QA_PublicChild_20261019` |
| Nested PDF | `download.pdf` (35 KB) |
| Evidence source | Tester-supplied observations/screenshots or explicit confirmations; no stored screenshot artifacts or evidence paths are claimed. Codex did not execute these tests. |

**Test Cases & Execution Results**

### CONCURRENT-01 — Share Test Folder

- **Steps:** As Account A, grant Account B email access to `QA_PublicShare_20261019` and inspect People with access and the public-link state.
- **Expected:** The recipient is listed, while the previously revoked public link stays inactive.
- **Actual:** Account B appeared in People with access. The previously revoked public link remained inactive.
- **Status:** **PASS — UI.**

### CONCURRENT-02 — Recipient Opens PDF

- **Steps:** As Account B, navigate through Shared with me into `QA_PublicChild_20261019` and open `download.pdf` (35 KB).
- **Expected:** The recipient can preview the nested PDF through the parent-folder grant.
- **Actual:** Its single-page PDF preview rendered successfully.
- **Status:** **PASS — UI.**

### CONCURRENT-03 — Delete Folder While PDF Is Open

- **Steps:** Keep the PDF open as Account B. As Account A, select Delete on `QA_PublicChild_20261019`, review the confirmation and confirm deletion.
- **Expected:** The confirmation describes the affected file and permanent deletion; deleting the nested folder leaves its parent and separate PDF intact.
- **Actual:** The confirmation correctly warned about permanent deletion of 1 file (35 KB). After confirmation, the nested folder disappeared, while the parent folder and its separate PDF remained.
- **Status:** **PASS — UI.**

### CONCURRENT-04 — Existing PDF After Folder Deletion

- **Steps:** As Account B, observe the already open PDF page after its containing folder is deleted, without refreshing.
- **Expected:** Observe already rendered content separately from fresh access; immediate removal from the existing page is not established as an acceptance requirement.
- **Actual:** The previously loaded PDF remained visible without refreshing.
- **Status:** **OBSERVED — UI.**
- **Interpretation:** This does not establish a defect or unauthorized server access. The content could have remained loaded in browser memory; that explanation was not independently verified.

### CONCURRENT-05 — PDF After Refresh

- **Steps:** As Account B, refresh the previously open PDF URL after deletion.
- **Expected:** The deleted PDF is no longer accessible through that application route.
- **Actual:** The application displayed “File not found”, and PDF content was no longer accessible through that route.
- **Status:** **PASS — UI.**

### CONCURRENT-06 — Deleted Folder Direct URL

- **Steps:** As Account B, open the previous direct shared-folder URL after deletion.
- **Expected:** The deleted nested folder contents are not displayed.
- **Actual:** The application displayed “Folder not found”, without showing the folder contents.
- **Status:** **PASS — UI.**

**Section Verification Limits**

No API authorization, HTTP statuses, storage-level deletion or invalidation of previously issued signed URLs were independently verified. UI disappearance and not-found messages are not proof of physical database/storage deletion. CONCURRENT-04 is not a confirmed defect. No credentials, email addresses, public-link tokens or personal PDF contents are recorded.

## Boundary Value Analysis — Folder Names and Registration Passwords

**Test Execution Context**

| Field | Details |
|---|---|
| Execution date | 2026-10-19 |
| Environment | Deployed Virtual Data Room |
| Browser/session | Google Chrome; mode and exact version not supplied |
| Evidence source | Tester-reported observations and screenshots supplied during the QA session; screenshots are not claimed to be stored in the repository and no evidence paths are invented. Codex did not execute these checks. |

**Technique:** Targeted 2-value BVA around source-derived input length limits: folder names 1–200 characters after trimming; registration passwords 8–72 characters. This is not comprehensive boundary coverage.

**Test basis:** [Folder frontend schema](../../apps/web/src/features/data-room/schemas.ts), [folder creation DTO](../../apps/api/src/folders/dto/create-folder.dto.ts), [registration frontend schema](../../apps/web/src/features/auth/schemas.ts) and [registration DTO](../../apps/api/src/auth/dto/register.dto.ts). Numeric limits are source-derived, not explicit numeric requirements in task.md.

**Test Cases & Execution Results**

### BVA-01 — Empty folder name

- **Test data:** Empty string; 0 characters.
- **Preconditions:** New folder dialog in an accessible location where the tester can create disposable folders. Exact parent location was not supplied.
- **Steps:** Enter the test data in Folder name (leave empty for 0 characters), select Create and observe the dialog/listing.
- **Expected:** Empty name rejected.
- **Actual:** “Enter a folder name” appeared; the dialog remained open.
- **Status:** **PASS — UI validation.**

### BVA-02 — One-character folder name

- **Test data:** `A`; 1 character.
- **Preconditions:** New folder dialog in an accessible location where the tester can create disposable folders. Exact parent location was not supplied.
- **Steps:** Enter the specified test data in the Folder name field, click Create, and observe the validation message or folder listing.
- **Expected:** Folder created.
- **Actual:** Folder `A` appeared in the listing and “Folder created” appeared.
- **Status:** **PASS — UI.**

### BVA-03 — Maximum-length folder name

- **Test data:** `1234567890` repeated 20 times without separators; 200 characters.
- **Preconditions:** New folder dialog in an accessible location where the tester can create disposable folders. Exact parent location was not supplied.
- **Steps:** Enter the specified test data in the Folder name field, click Create, and observe the validation message or folder listing.
- **Expected:** Folder created.
- **Actual:** The long-named folder appeared in the listing.
- **Status:** **PASS — UI creation.**
- **Case-specific verification limits:** UI observation only; no direct backend boundary testing. Exact persisted character count was not independently verified.

### BVA-04 — Over-limit folder name

- **Test data:** The preceding 200-character string followed by `A`; 201 characters.
- **Preconditions:** New folder dialog in an accessible location where the tester can create disposable folders. Exact parent location was not supplied.
- **Steps:** Enter the specified test data in the Folder name field, click Create, and observe the validation message or folder listing.
- **Expected:** Length validation rejects the name.
- **Actual:** “Name is too long” appeared; the dialog remained open.
- **Status:** **PASS — UI validation.**

### PWD-BVA-01 — Below-minimum registration password

- **Test data:** 7 ASCII `A` characters.
- **Preconditions:** Registration form open with the Password field available. Other field values and the precise validation trigger were not supplied.
- **Steps:** Enter the specified ASCII string in the registration Password field and observe the reported length-validation state. No specific submit, blur or confirmation-field action is claimed.
- **Expected:** Password rejected by client-side length validation.
- **Actual:** “Password must be at least 8 characters” appeared.
- **Status:** **PASS — UI validation.**

### PWD-BVA-02 — Minimum-length registration password

- **Test data:** 8 ASCII `A` characters.
- **Preconditions:** Registration form open with the Password field available. Other field values and the precise validation trigger were not supplied.
- **Steps:** Enter the specified ASCII string in the registration Password field and observe the reported length-validation state. No specific submit, blur or confirmation-field action is claimed.
- **Expected:** Passes client-side length validation.
- **Actual:** The minimum-length validation error disappeared.
- **Status:** **PASS — UI validation only.**

### PWD-BVA-03 — Maximum-length registration password

- **Test data:** 72 ASCII `A` characters.
- **Preconditions:** Registration form open with the Password field available. Other field values and the precise validation trigger were not supplied.
- **Steps:** Enter the specified ASCII string in the registration Password field and observe the reported length-validation state. No specific submit, blur or confirmation-field action is claimed.
- **Expected:** Passes client-side length validation.
- **Actual:** No password-length error was visible.
- **Status:** **PASS — UI validation only.**

### PWD-BVA-04 — Over-limit registration password

- **Test data:** 73 ASCII `A` characters.
- **Preconditions:** Registration form open with the Password field available. Other field values and the precise validation trigger were not supplied.
- **Steps:** Enter the specified ASCII string in the registration Password field and observe the reported length-validation state. No specific submit, blur or confirmation-field action is claimed.
- **Expected:** Password rejected by client-side length validation.
- **Actual:** “Password must be at most 72 characters” appeared.
- **Status:** **PASS — UI validation.**


**UX observation — UX-005:** A 200-character folder name caused horizontal scrolling in the folder listing. This is an improvement candidate, not a confirmed product defect, and adds no separate manual case or OBSERVED outcome. See [findings](findings.md).

**Section Verification Limits**

BVA-01–04 are UI observations only, with no direct backend boundary testing or independent database/persistence verification. PWD-BVA-01–04 establish UI length-validation observations only, not backend enforcement or successful registration; no new user accounts were intentionally created during password BVA. Successful registration was not tested for the 8- or 72-character passwords. Full persistence of the 200-character folder name was not independently verified. The tester reports that BVA test folders were deleted afterward; cleanup was not independently verified and no physical storage cleanup is claimed.

## UX improvement candidates

The following are observations, **not confirmed functional bugs**:

All are low-priority candidates. Impact, recommendations and evidence status are recorded in [findings.md](findings.md).

| ID | Observation |
|---|---|
| UX-001 | Password visibility toggle is missing on Login and Registration. |
| UX-002 | Password requirements are not explained before form submission. |
| UX-003 | Required fields have no visual required indicator or explanation that all fields are mandatory. |
| UX-004 | An empty Password field displays a minimum-length message rather than a specific required-field message. |
| UX-005 | A 200-character folder name caused horizontal scrolling in the folder listing. |

UX-004 concerns message clarity; it does not change REG-01's observed PASS for displaying validation errors.

LOGIN-03 separately records a specific required-field message on Login. UX-004 must not be generalized to that Login result.

## Authentication coverage

**Password recovery:** The tester-observed Login UI has no Forgot Password option, and the reviewed [authentication controller](../../apps/api/src/auth/auth.controller.ts) exposes no password-reset endpoint. See [PG-001 in findings.md](findings.md) for impact, Medium severity / suggested P2 priority and the secure email-reset recommendation. Recovery is not explicitly required by [task.md](../../task.md), so its absence is a product gap, not a confirmed specification defect. No recovery journey or reset API was executed; this adds no test result.

**Google OAuth:** Not a missing requirement. [task.md](../../task.md) permits Google OAuth **or** email/password, and the [README](../../README.md) documents the email/password choice. Google OAuth is not an outstanding acceptance test for the selected authentication approach.

### Not tested yet

- **NOT TESTED:** Additional invalid credential combinations beyond LOGIN-01–LOGIN-05.
- **NOT TESTED:** Direct access to protected routes other than the application root after logout; root navigation was checked in AUTH-04 at the UI level only.
- **NOT TESTED:** API authentication and server-side invalidation of a previously issued JWT, including whether the old JWT is rejected after logout. Client-side token removal was verified separately in AUTH-08.
- **NOT TESTED:** Session persistence beyond the single authenticated refresh observed in LOGIN-07 (for example, browser restart or token expiry).
- **NOT TESTED:** Email ownership enforcement and unauthorized access through email-based sharing (RISK-001 in [findings.md](findings.md)).

Except for the separately recorded recipient registration, anonymous-access observations and four PWD-BVA checks, authentication behavior outside the original twenty authentication/registration checks (AUTH, LOGIN and REG) remains **NOT TESTED** in this record. PWD-BVA-01–04 add UI length-validation evidence only; successful registration at the password boundaries remains NOT TESTED. Password confirmation mismatch has UI validation evidence in REG-03; existing-email and case-variation rejection messages have UI evidence in REG-04 and REG-05. Login, refresh and root navigation have UI evidence; token presence/removal have browser-storage evidence. None establishes server-side JWT invalidation.

## Interpretation and limitations

**Totals: 133 unique recorded cases — 128 PASS, 5 OBSERVED.**

| Functional area | Cases | PASS | OBSERVED |
|---|---:|---:|---:|
| Authentication/registration (AUTH, LOGIN, REG) | 20 | 18 | 2 |
| Folder Management | 17 | 17 | 0 |
| File Management (including FILE-DND-01) | 19 | 18 | 1 |
| Sharing & Permissions | 15 | 15 | 0 |
| Folder Sharing | 12 | 12 | 0 |
| Non-Empty Folder Deletion | 8 | 8 | 0 |
| Data Room Sharing | 13 | 12 | 1 |
| Public Folder Sharing | 15 | 15 | 0 |
| Concurrent Viewing and Folder Deletion | 6 | 5 | 1 |
| BVA (four folder-name, four registration-password) | 8 | 8 | 0 |
| **Total** | **133** | **128** | **5** |

The five **OBSERVED** cases retain their original explanations:

- **AUTH-05 / AUTH-06:** Empty browser storage without a reported before-state comparison; removal of previously stored data is not established.
- **FILE-07:** Intermittent preview fallback, not reproduced on retest; no confirmed rename defect or verified root cause.
- **ROOM-SHARE-09:** Already rendered PDF remained visible after tester-reported revocation; no confirmed defect or fresh unauthorized fetch.
- **CONCURRENT-04:** Already loaded PDF remained visible after folder deletion; no confirmed defect or evidence of unauthorized server access.

PASS applies only within each case's stated limits. FILE-DND-01 records successful Drag & Drop; FILE-14 separately records a Drag & Drop filename conflict. AUTH-08 establishes client-side token removal through a before/after comparison, not server-side JWT invalidation. API validation, server-side JWT invalidation and rejection of an old JWT after logout remain untested in this manual record. See [automation results](automation-test-results.md) for separately executed API coverage.

UI visibility, navigation, refresh persistence and deletion messages do not prove server authorization or physical database/storage state. Revocation does not establish invalidation of previously issued signed URLs or recall previously downloaded copies. FILE-05's supplied checksum evidence applies only to the tested file pair at that point in time. Case-specific untested areas, including folder-rename content preservation, post-move byte integrity and BVA persistence/registration limits, remain documented above.

Browser version and deployed build identifier were not supplied. Evidence provenance and missing artifacts are described at the start of this record; consolidated risk and release-readiness assessment belongs in the [Final QA Report](final-qa-report.md).
