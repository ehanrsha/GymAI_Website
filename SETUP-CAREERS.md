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
download as Excel whenever you like. Five minutes, once:

1. **Make the sheet.** Go to <https://sheets.new>, name it **GymAI
   Applications**. No columns needed — the script creates them.
2. **Extensions → Apps Script.** Select everything in `Code.gs`, delete it, and
   paste in the whole of **`careers-sheet.gs`** from this folder. Save.
3. **Deploy → New deployment.** Gear icon → **Web app**. Then:
   - **Execute as:** *Me*
   - **Who has access:** ***Anyone*** ← this matters. "Anyone with a Google
     account" will **not** work; people visiting the site are not signed in.
4. Authorise it. On the "Google hasn't verified this app" screen click
   **Advanced → Go to (project) (unsafe) → Allow**. That warning is normal for a
   script you wrote yourself — you are granting your own script access to your
   own sheet.
5. Copy the **Web app URL** (it ends in `/exec`) and paste it into `config.js`:

   ```js
   window.GYMAI_CAREERS_ENDPOINT = "https://script.google.com/macros/s/AKfy..../exec";
   ```

**Check it worked:** paste the `/exec` URL straight into a browser tab. It should
print `{"result":"success","message":"GymAI careers endpoint is live."}`. If it
asks you to sign in instead, "Who has access" in step 3 is wrong.

Then submit a test application on the site — a row should appear within a second
or two.

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
- **Email alerts on new applications:** in the sheet, **Tools → Notification
  settings → Edit notifications → "Any changes are made" → "Email — right away"**.
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
