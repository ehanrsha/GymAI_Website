/* ==========================================================================
   GymAI — waitlist configuration

   Paste the Google Apps Script Web App URL between the quotes below. You get
   it from step 5 of SETUP-WAITLIST.md. It looks like:

     https://script.google.com/macros/s/AKfy...long-id.../exec

   Until this is filled in, the waitlist form will refuse to submit and show
   a message saying sign-ups are not connected yet — deliberately, so that no
   email is ever silently dropped.
   ========================================================================== */

window.GYMAI_WAITLIST_ENDPOINT = "https://script.google.com/macros/s/AKfycbwcW9ctFTRdKx-W7_fEdPS-jAhcNQgQd8PIgPa7iXQlM7dCZPJOiYPo0iNriBw2keY0/exec";


/* ==========================================================================
   GymAI — careers configuration (careers.html)

   Three independent knobs. Full walkthrough in SETUP-CAREERS.md.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. OPEN ROLES

   This array *is* the "Open roles" list on the page. Add an object, save,
   refresh — the row appears. Delete them all and the page shows a "nothing
   posted right now, tell us what you'd build" message instead.

     title     required. The job title.
     team      optional. Engineering, Design, Ops...
     location  optional. "San Francisco", "Remote (US)"...
     type      optional. "Full-time", "Internship", "Contract"...
     link      optional. Where applying happens. Any URL works — a Google
               Form, a Notion page, an Ashby/Greenhouse posting, even a
               "mailto:jobs@..." link. Opens in a new tab.

               LEAVE `link` OUT and the row instead scrolls down to the form
               at the bottom of this page with the role pre-selected.
   -------------------------------------------------------------------------- */

window.GYMAI_CAREERS_ROLES = [
  {
    title: "Founding Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time"
    // no `link` — uses the form on the page
  },
  {
    title: "Computer Vision Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time"
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote",
    type: "Contract"
  }
];

/* --------------------------------------------------------------------------
   2. WHERE APPLICATIONS GO

   Same mechanism as the waitlist: an Apps Script Web App that appends a row
   to your Google Sheet (which downloads as Excel any time you like). Paste
   the /exec URL here — steps in SETUP-CAREERS.md.

   Left empty, the form refuses to submit and says so, rather than pretending
   to send an application and dropping it.
   -------------------------------------------------------------------------- */

window.GYMAI_CAREERS_ENDPOINT = "";

/* --------------------------------------------------------------------------
   3. GOOGLE FORM INSTEAD (optional)

   If you would rather not run the sheet script at all, paste a Google Form
   URL here and it gets embedded on the page in place of our own form. The
   responses land in that form's own linked sheet.

   This WINS over the endpoint above — set it only if you want the Google
   Form, and leave it as "" to use the built-in form.

     window.GYMAI_CAREERS_FORM_EMBED = "https://docs.google.com/forms/d/e/XXXX/viewform";
   -------------------------------------------------------------------------- */

window.GYMAI_CAREERS_FORM_EMBED = "";

/* --------------------------------------------------------------------------
   4. CONTACT EMAIL (optional)

   Shown next to the form as a "prefer email?" line. Leave "" to hide it.
   -------------------------------------------------------------------------- */

window.GYMAI_CAREERS_EMAIL = "";
