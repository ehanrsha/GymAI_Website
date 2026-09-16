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
     blurb     optional. The role description. It is shown in its own box
               under the Role dropdown on the application form, and swaps
               over (with a rainbow sweep) whenever the dropdown changes,
               so nobody applies without knowing what they applied for.
     link      optional. Where applying happens. Any URL works — a Google
               Form, a Notion page, an Ashby/Greenhouse posting, even a
               "mailto:jobs@..." link. Opens in a new tab.

               LEAVE `link` OUT and the row instead scrolls down to the form
               at the bottom of this page with the role pre-selected.
   -------------------------------------------------------------------------- */

window.GYMAI_CAREERS_ROLES = [
  {
    title: "CMO — Chief of Marketing & Outreach",
    team: "Growth",
    location: "Remote",
    type: "Founding",
    blurb: "You own growth. That means getting GymAI in front of real people: " +
           "partnerships with gyms and studios, deals with influencers and " +
           "creators in the fitness space, and the campaigns that turn all of " +
           "that into signups. Your one number is users — how many we have and " +
           "how fast that is climbing. You will be talking to gym owners one " +
           "day and cutting a creator brief the next, and you will have the " +
           "design team behind you to make it look the part."
    // no `link` — uses the form on the page
  },
  {
    title: "Founding Engineer / CTO",
    team: "Engineering",
    location: "Remote",
    type: "Founding",
    blurb: "You own the tech stack and the app. React Native and Expo on the " +
           "front, the data and analytics layer behind it, and every feature " +
           "in between — shipped, not prototyped. You will make the calls on " +
           "architecture, tooling and what gets built next, and you will be in " +
           "the code every day. The bar is not 'it works': it is a product " +
           "people open without being asked to."
  },
  {
    title: "Computer Vision Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    blurb: "You own what the camera sees. Reading a machine, a plate stack and " +
           "a rep accurately from a phone camera — in bad gym lighting, at odd " +
           "angles, on a cheap device — is the hardest problem we have, and it " +
           "is yours. Accuracy is the priority: the ML and CV models behind " +
           "it, and then how that reading becomes data the app can show " +
           "someone mid-set and trust afterwards."
  },
  {
    title: "Graphic Designer",
    team: "Design",
    location: "Remote",
    type: "Full-time / Contract",
    blurb: "You make everything look like GymAI. Advertising, social, brand " +
           "work and a real share of the app's own surfaces — this is a major " +
           "contributing role, not a request queue. You will work under the " +
           "Chief of Design alongside the CMO, which means your work is what " +
           "most people see of us first."
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
