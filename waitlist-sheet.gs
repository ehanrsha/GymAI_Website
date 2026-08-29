/**
 * GymAI — waitlist collector
 * =========================================================================
 * Paste this into the Apps Script editor attached to your Google Sheet
 * (Extensions -> Apps Script), then deploy it as a Web App. Full walkthrough
 * in SETUP-WAITLIST.md.
 *
 * It appends one row per signup to the sheet named below, skipping addresses
 * that are already on the list.
 */

var SHEET_NAME = 'Waitlist';
var HEADERS = ['Email', 'Signed up', 'Source', 'Referrer'];

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

    var sheet = getSheet();

    if (!isKnown(sheet, email)) {
      sheet.appendRow([
        email,
        new Date(),
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
  return json({ result: 'success', message: 'GymAI waitlist endpoint is live.' });
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
  }

  return sheet;
}

/** True if the address is already in column A. */
function isKnown(sheet, email) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  var column = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < column.length; i++) {
    if (String(column[i][0]).trim().toLowerCase() === email) return true;
  }
  return false;
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
