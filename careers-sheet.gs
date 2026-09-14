/**
 * GymAI — application collector
 * =========================================================================
 * Paste this into the Apps Script editor attached to your Google Sheet
 * (Extensions -> Apps Script), then deploy it as a Web App. Full walkthrough
 * in SETUP-CAREERS.md.
 *
 * It appends one row per application to the sheet named below. The sheet
 * downloads as a real .xlsx any time via File -> Download -> Microsoft Excel.
 */

var SHEET_NAME = 'Applications';
var HEADERS = ['Applied', 'Name', 'Email', 'Role', 'Link', 'Why GymAI', 'Source', 'Referrer'];

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
    if (!isDuplicate(sheet, email, role)) {
      sheet.appendRow([
        new Date(),
        name,
        email,
        role,
        String(params.link || '').trim(),
        String(params.note || '').trim(),
        String(params.source || ''),
        String(params.ref || '')
      ]);
    }

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
    sheet.setColumnWidth(5, 240); // Link
    sheet.setColumnWidth(6, 420); // Why GymAI
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
