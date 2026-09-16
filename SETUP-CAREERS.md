# The Careers page

`careers.html` is live and reachable from the ☰ menu in the top-right corner of
every page. Three things on it are yours to fill in, all of them in **`config.js`**.

---

## 1. Posting a job (30 seconds)

Open `config.js` and find `GYMAI_CAREERS_ROLES`. Each `{ ... }` block is one
row on the page. Add one, save, refresh:

```js
{
  title: "iOS Engineer",
  team: "Engineering",
  location: "San Francisco",
  type: "Full-time",
  link: "https://forms.gle/your-form-here"
}
```

Only `title` is required. `team`, `location` and `type` are the small grey line
underneath it — leave any of them out and it just isn't shown.

**`link` is the important one.** It is where pressing the row takes someone, and
it can be anything:

| What you have | What to paste |
|---|---|
| A Google Form for that role | `"https://forms.gle/abc123"` |
| A Notion / Coda job page | `"https://notion.so/..."` |
| Greenhouse, Lever, Ashby, Workable | the posting URL |
| Nothing yet, just email | `"mailto:jobs@gymai.com?subject=iOS Engineer"` |
| **Nothing — use the form on the page** | **leave `link` out entirely** |

That last one is the nice default: with no `link`, pressing the row scrolls down
to the application form at the bottom of the page and pre-selects that role in
the dropdown. No second system to maintain.

Delete every role and the page shows a "nothing posted right now" message
instead — it never looks broken.

---

## 2. Where applications land

Pick **one** of these two. You do not need both.

### Option A — the form on the page, into your own Google Sheet

Same mechanism as the waitlist, so the data lands in a sheet you own and can
download as Excel whenever you like. Ten minutes, once. Follow these in order.

**1. Make the sheet.**
Go to <https://sheets.new>. Rename it **GymAI Applications** (click "Untitled
spreadsheet" at the top left and type). Do *not* add any columns — the script
writes its own header row the first time an application arrives.

**2. Open the script editor.**
In that sheet: **Extensions → Apps Script**. A new tab opens with a file called
`Code.gs` containing a stub `myFunction`.

**3. Paste the script in.**
Click inside `Code.gs`, select all (**Ctrl+A**), delete it, then paste in the
entire contents of **`careers-sheet.gs`** from this folder. Save
(**Ctrl+S**).

**4. Put your email address in.**
Near the top of what you just pasted, find this line:

```js
var NOTIFY_EMAIL = '';
```

Put your address between the quotes:

```js
var NOTIFY_EMAIL = 'you@gmail.com';
```

That is the whole email setup — every application sends you a mail with the
applicant's name, role, equity number, resume link and answers, and hitting
**Reply** in your inbox writes straight to the applicant. Save again.

**5. Deploy it as a web app.**
Top right: **Deploy → New deployment**. Click the gear icon beside "Select
type" and choose **Web app**. Then:

- **Description:** anything, e.g. `careers v1`
- **Execute as:** **Me**
- **Who has access:** **Anyone** ← this one matters. "Anyone with a Google
  account" will **not** work; people visiting your site are not signed in.

Press **Deploy**.

**6. Authorise it.**
Google asks for permission the first time. Click **Authorize access**, pick your
account, then on the "Google hasn't verified this app" screen click
**Advanced → Go to (project name) (unsafe) → Allow**. That warning is normal for
a script you pasted in yourself — you are granting your own script access to
your own sheet, Drive folder and mail.

It asks for three things, and each one is used for exactly one job: the
spreadsheet (writing the row), Drive (saving the resume file), and sending mail
as you (the alert).

**7. Copy the URL into `config.js`.**
The deploy dialog shows a **Web app URL** ending in `/exec`. Copy it, open
`config.js` in this folder, and paste it here:

```js
window.GYMAI_CAREERS_ENDPOINT = "https://script.google.com/macros/s/AKfy..../exec";
```

Save. That is it — the form is live.

**8. Check it worked.**
Paste the `/exec` URL straight into a browser tab. It should print
`{"result":"success","message":"GymAI careers endpoint is live."}`. If it asks
you to sign in instead, "Who has access" in step 5 is wrong — fix it and
re-deploy (see "Re-deploying" below).

Then submit a real test application on your own site with a small PDF attached.
Within a second or two you should get **all three**: a new row in the sheet, a
file in a Drive folder called **GymAI Resumes**, and an email in your inbox.

#### What lands in the sheet

One row per application, these columns:

| Applied | Name | Email | Role | Resume | Link | Equity asked (%) | Why GymAI | Source | Referrer |
|---|---|---|---|---|---|---|---|---|---|

**Resume** is a clickable Drive link. The file itself is saved to a Drive folder
named **GymAI Resumes**, created automatically the first time, named
`2026-09-15 - Alex Rivera - Computer Vision Engineer.pdf` so the folder sorts and
reads on its own. Each file is set to "anyone with the link can view" — without
that, the link in the sheet would be dead to everyone except the account that
owns the script.

**To get it as Excel:** **File → Download → Microsoft Excel (.xlsx)** in the
sheet, any time. The resume column comes across as links, and the files stay in
Drive.

#### If you would rather not have the script send the mail

Leave `NOTIFY_EMAIL` as `''` and use Google's own alerting instead: in the sheet,
**Tools → Notification settings → Edit notifications → "Any changes are made" →
"Email — right away"**. It is one click, but the email only says the sheet
changed — it does not contain the application. The script's own email is better;
this is the fallback.

### Option B — embed a Google Form instead

If you would rather not touch Apps Script at all:

1. Build your form at <https://forms.new>.
2. **Send → `< >` (embed)** and copy the `src="..."` URL out of the snippet.
   It looks like `https://docs.google.com/forms/d/e/1FAIpQL.../viewform?embedded=true`.
3. Paste it into `config.js`:

   ```js
   window.GYMAI_CAREERS_FORM_EMBED = "https://docs.google.com/forms/d/e/1FAIpQL.../viewform";
   ```

That's it. The Google Form replaces the built-in form on the page, inside a
white card, and responses go to that form's own linked sheet (**Responses →
green sheet icon**).

`GYMAI_CAREERS_FORM_EMBED` **wins over** `GYMAI_CAREERS_ENDPOINT`, so leave it
as `""` if you want Option A.

---

## 3. Contact email (optional)

```js
window.GYMAI_CAREERS_EMAIL = "jobs@gymai.com";
```

Adds a "Prefer email? jobs@gymai.com" line beside the form. Leave it `""` to
hide it.

---

## Things worth knowing

- **Until it's connected**, the form deliberately refuses to submit and says so,
  rather than pretending to send an application and dropping it.
- **Export to Excel** any time: **File → Download → Microsoft Excel (.xlsx)**.
- **Email alerts** come from the script itself — set `NOTIFY_EMAIL` in
  `careers-sheet.gs` (step 4 above). Gmail allows around 100 of these a day on a
  free account, far more than you will get; if it ever runs out, the row is still
  written and only the email is skipped.
- **Resumes are required** on the form: one page, any of PDF / Word / an image,
  up to 5 MB. We cannot actually count the pages in a browser, so the one-page
  ask is made in the wording under the field rather than enforced.
- **A resume that fails to upload never costs you the application.** The row is
  still written and the Resume cell says what went wrong instead of a link.
- **Duplicates are skipped** on email + role, so a double-press writes one row.
  The same person applying for a *different* role still gets their own row.
- **Re-deploying after edits to the script:** **Deploy → Manage deployments →
  pencil → Version: New version → Deploy**. That keeps the same URL. Using "New
  deployment" instead gives you a *different* URL and you'd have to update
  `config.js` again.
- **Two separate sheets.** The waitlist and applications each get their own
  spreadsheet and their own deployment. Don't paste `careers-sheet.gs` over the
  waitlist script — they both define `doPost`, and the second one would silently
  take over.
- **The endpoint URL is public**, visible in `config.js` to anyone viewing the
  page source. That's inherent to a form with no server, and it's fine: the
  script only ever appends a row and never reads data back out. The worst
  someone can do is add junk rows.

---

## Adding another page to the menu

The ☰ menu is built from one list at the top of **`nav.js`**:

```js
var LINKS = [
  { label: "Home",    href: "index.html" },
  { label: "Careers",  href: "careers.html" },
  { label: "Join the waitlist", href: "waitlist.html", pill: true }
];
```

Add a line, and it appears in the menu on every page at once.
