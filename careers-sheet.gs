/**
 * GymAI — application collector
 * =========================================================================
 * Paste this into the Apps Script editor attached to your Google Sheet
 * (Extensions -> Apps Script), then deploy it as a Web App. Full walkthrough
 * in SETUP-CAREERS.md.
 *
 * It appends one row per application to the sheet named below, saves the
 * attached resume into a Drive folder and links it from the row, and emails
 * you the moment either happens. The sheet downloads as a real .xlsx any time
 * via File -> Download -> Microsoft Excel.
 */

var SHEET_NAME = 'Applications';
var HEADERS = ['Applied', 'Name', 'Email', 'Role', 'Resume', 'Link', 'Equity asked (%)', 'Why GymAI', 'Source', 'Referrer'];

/**
 * Where to email every new application. Put your own address here — leave it
 * as '' and the script simply skips the email and still writes the row.
 */
var NOTIFY_EMAIL = '';

/** Drive folder the resumes are filed into. Created on first use. */
var RESUME_FOLDER = 'GymAI Resumes';

/** Refuse anything larger, in bytes. Matches the 5MB cap on the form. */
var MAX_RESUME_BYTES = 5 * 1024 * 1024;

/** Entry point for the form POST. */
function doPost(e) {
  // Two people submitting at the same instant would otherwise race for the
  // same row. The lock serialises them; 30s is far longer than ever needed.
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var params = (e && e.parameter) || {};

    // Honeypot: only a bot fills a field that is positioned off-screen.
    // Answer "success" so it has no signal to retry against.
    if (String(params.company || '').trim() !== '') {
      return json({ result: 'success' });
    }

    var email = String(params.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return json({ result: 'error', message: 'Invalid email address' });
    }

    var name = String(params.name || '').trim();
    if (!name) {
      return json({ result: 'error', message: 'Name is required' });
    }

    var role = String(params.role || '').trim();
    var sheet = getSheet();

    // The page retries a submission whose response it could not read, which is
    // routine with Apps Script's redirect. Matching on email + role means that
    // retry lands on the row it already wrote instead of beside it — while the
    // same person applying for a *different* role still gets their own row.
    // Returning early also keeps the retry from filing a second copy of the
    // resume into Drive and sending a second email.
    if (isDuplicate(sheet, email, role)) {
      return json({ result: 'success' });
    }

    var link = String(params.link || '').trim();
    var note = String(params.note || '').trim();

    // Plenty of people leave this blank, so it stays text rather than becoming
    // a 0 that would read as "asked for none".
    var equity = String(params.equity || '').trim();

    var resumeUrl = saveResume(params, name, role);

    sheet.appendRow([
      new Date(),
      name,
      email,
      role,
      resumeUrl,
      link,
      equity,
      note,
      String(params.source || ''),
      String(params.ref || '')
    ]);

    notify(name, email, role, resumeUrl, link, equity, note);

    return json({ result: 'success' });

  } catch (err) {
    return json({ result: 'error', message: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/** Visiting the deployed URL in a browser confirms it is live. */
function doGet() {
  return json({ result: 'success', message: 'GymAI careers endpoint is live.' });
}

/**
 * The resume arrives base64-encoded in the form body, because a POST that
 * Apps Script can read without a CORS preflight cannot carry multipart data.
 * Decode it back into a real file in Drive and hand back its URL.
 *
 * A resume that fails to save must never cost us the application, so every
 * failure here degrades to a note in the cell instead of throwing.
 */
function saveResume(params, name, role) {
  var data = String(params.resumeData || '');
  if (!data) return '(none attached)';

  try {
    var bytes = Utilities.base64Decode(data);
    if (bytes.length > MAX_RESUME_BYTES) return '(rejected — over 5MB)';

    var original = String(params.resumeName || 'resume');
    var dot = original.lastIndexOf('.');
    var extension = dot > 0 ? original.slice(dot) : '';

    // Named so the folder reads on its own and sorts by date.
    var filename = [
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      scrub(name),
      scrub(role)
    ].join(' - ') + extension;

    var blob = Utilities.newBlob(
      bytes,
      String(params.resumeType || 'application/octet-stream'),
      filename
    );

    var file = getResumeFolder().createFile(blob);

    // Anyone holding the link can open it — otherwise the URL sitting in the
    // sheet is dead to everyone but the account that owns the script.
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();

  } catch (err) {
    return '(upload failed: ' + String(err && err.message || err) + ')';
  }
}

/** The Drive folder for resumes, created on first use. */
function getResumeFolder() {
  var found = DriveApp.getFoldersByName(RESUME_FOLDER);
  return found.hasNext() ? found.next() : DriveApp.createFolder(RESUME_FOLDER);
}

/** Strip anything that makes for an awkward filename. */
function scrub(value) {
  return String(value).replace(/[\\\/:*?"<>|]/g, '-').trim() || 'unknown';
}

/**
 * Email on every new application. Wrapped because a mail quota that has run
 * out is not a reason to lose a row that is already written.
 */
function notify(name, email, role, resumeUrl, link, equity, note) {
  if (!NOTIFY_EMAIL) return;

  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var body =
      'New application — GymAI\n\n' +
      'Name:   ' + name + '\n' +
      'Email:  ' + email + '\n' +
      'Role:   ' + (role || 'General') + '\n' +
      'Resume: ' + resumeUrl + '\n' +
      'Link:   ' + (link || '-') + '\n' +
      'Equity: ' + (equity ? equity + '%' : '-') + '\n\n' +
      'Why GymAI:\n' + (note || '-') + '\n\n' +
      'Sheet: ' + book.getUrl() + '\n';

    // replyTo means hitting Reply in your inbox writes to the applicant.
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'GymAI application — ' + name + ' (' + (role || 'General') + ')',
      body: body,
      replyTo: email
    });
  } catch (err) {
    // Deliberately swallowed. The row is what matters.
  }
}

/** The target sheet, created with headers on first use. */
function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 150); // Applied
    sheet.setColumnWidth(5, 260); // Resume
    sheet.setColumnWidth(6, 240); // Link
    sheet.setColumnWidth(8, 420); // Why GymAI
  }

  return sheet;
}

/** True if this address has already applied for this role. */
function isDuplicate(sheet, email, role) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  // Columns C (email) and D (role), every data row.
  var rows = sheet.getRange(2, 3, lastRow - 1, 2).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toLowerCase() === email &&
        String(rows[i][1]).trim() === role) {
      return true;
    }
  }
  return false;
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
