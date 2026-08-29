# Connecting the waitlist to a Google Sheet

Everything on the site is built and working except one thing: the form does not
know *where* to send emails yet. That takes about five minutes and only you can
do it, because it has to happen inside your own Google account.

Until it is done the form deliberately refuses to submit and shows
"Sign-ups aren't connected yet" — better than pretending to save an address
and losing it.

---

## 1. Make the sheet

Go to <https://sheets.new> and name it something like **GymAI Waitlist**.
You do not need to add any columns — the script creates them.

## 2. Open the script editor

In that sheet: **Extensions → Apps Script**. A new tab opens with an empty
`Code.gs` and a couple of lines of placeholder text.

## 3. Paste the script

Select everything in `Code.gs`, delete it, and paste in the entire contents of
**`waitlist-sheet.gs`** from this project folder. Save (the disk icon, or
Ctrl+S).

## 4. Deploy it

1. Top right: **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** anything, e.g. `waitlist v1`
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone** ← this matters. "Anyone with Google account"
     will *not* work; visitors to the site are not signed in.
4. **Deploy**.
5. Google asks you to authorise it. Pick your account, then on the
   "Google hasn't verified this app" screen click **Advanced → Go to
   (project name) (unsafe)** → **Allow**. That warning is normal for a script
   you wrote yourself; you are granting your own script access to your own
   sheet.

## 5. Copy the URL

After deploying you get a **Web app URL** ending in `/exec`, like:

```
https://script.google.com/macros/s/AKfycbx...../exec
```

Paste that URL between the quotes in **`config.js`** in this project:

```js
window.GYMAI_WAITLIST_ENDPOINT = "https://script.google.com/macros/s/AKfycbx...../exec";
```

Save the file. That is the whole integration.

## 6. Test it

Open the site, click **Join The Waitlist**, enter an address, press **Enter**.
You should land on the thank-you page, and a new row should appear in the sheet
within a second or two.

A quick sanity check before that: paste the `/exec` URL straight into a browser
tab. It should print `{"result":"success","message":"GymAI waitlist endpoint is
live."}`. If it asks you to sign in, "Who has access" in step 4 is wrong.

---

## Things worth knowing

- **Re-deploying after edits.** If you ever change `waitlist-sheet.gs`, use
  **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**.
  That keeps the same URL. Using "New deployment" instead gives you a *different*
  URL and you would have to update `config.js` again.
- **Duplicates** are skipped — the same address submitted twice writes one row.
- **Bots** are handled by a hidden field. If a submission fills it, the script
  quietly discards it and reports success so the bot gets no feedback.
- **Export to Excel** any time: **File → Download → Microsoft Excel (.xlsx)**.
- **Email alerts on new signups:** in the sheet, **Tools → Notification settings
  → Edit notifications → "Any changes are made" → "Email — right away"**.
- **The endpoint URL is public** — it is visible in `config.js` to anyone who
  views the page source. That is inherent to a form with no server, and it is
  fine: the script only ever appends a row and never reads data back out. The
  worst someone can do is add junk rows.
