/* ==========================================================================
   GymAI — site navigation

   One hamburger, three lines, top-right of every page. Pressing it drops a
   black panel down from the top of the viewport with the site's pages in it.

   The markup is injected from here rather than copy-pasted into four HTML
   files, so there is exactly one place to add a page to the menu: the LINKS
   array below.

   The panel is always ink-black regardless of the page behind it. The bars
   themselves take their colour from `--nav-ink`, which each page sets (black
   on the beige pages, white on Careers) and which flips to white while the
   panel is open so the close "X" stays legible against it.
   ========================================================================== */

(function () {
  "use strict";

  /* Add a page here and it appears in the menu everywhere.
     `pill: true` gives the item the filled CTA treatment at the end. */
  var LINKS = [
    { label: "Home",    href: "index.html" },
    { label: "Careers",  href: "careers.html" },
    { label: "Join the waitlist", href: "waitlist.html", pill: true }
  ];

  var FOOTNOTE = "Making every workout machine smart.";

  var nav, toggle, panel, scrim;
  var open = false;

  /* The file we are on, so the current page can be marked in the menu.
     "" and "/" both mean index.html. */
  function currentFile() {
    var file = window.location.pathname.split("/").pop();
    return file === "" ? "index.html" : file;
  }

  function build() {
    var here = currentFile();

    nav = document.createElement("div");
    nav.className = "nav";

    var items = LINKS.map(function (link, i) {
      var current = link.href === here;
      return (
        '<li class="nav-item" style="--i:' + i + '">' +
          '<a class="nav-link' + (link.pill ? " nav-link-pill" : "") + '"' +
             ' href="' + link.href + '"' +
             (current ? ' aria-current="page"' : "") + '>' +
            '<span class="nav-link-label">' + link.label + "</span>" +
            (link.pill ? '<span class="cta-dot" aria-hidden="true"></span>' : "") +
          "</a>" +
        "</li>"
      );
    }).join("");

    nav.innerHTML =
      '<button class="nav-toggle" type="button" id="nav-toggle"' +
             ' aria-expanded="false" aria-controls="nav-panel" aria-label="Open menu">' +
        '<span class="nav-bars" aria-hidden="true"><i></i><i></i><i></i></span>' +
      "</button>" +
      '<div class="nav-scrim" hidden></div>' +
      '<nav class="nav-panel" id="nav-panel" aria-label="Main" hidden>' +
        '<ul class="nav-links">' + items + "</ul>" +
        '<p class="nav-foot">' + FOOTNOTE + "</p>" +
      "</nav>";

    document.body.appendChild(nav);

    toggle = nav.querySelector(".nav-toggle");
    panel = nav.querySelector(".nav-panel");
    scrim = nav.querySelector(".nav-scrim");

    toggle.addEventListener("click", function () { setOpen(!open); });
    scrim.addEventListener("click", function () { setOpen(false); });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.focus();
      }
    });

    // A link that points at the page we are already on would otherwise leave
    // the menu hanging open over an unchanged page.
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
  }

  function setOpen(next) {
    open = next;

    // `hidden` comes off before the class goes on so the panel has a frame to
    // lay out in — otherwise it would jump straight to its open position
    // instead of sliding down.
    if (open) {
      panel.hidden = false;
      scrim.hidden = false;
      requestAnimationFrame(function () { nav.setAttribute("data-open", ""); });
    } else {
      nav.removeAttribute("data-open");
    }

    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("nav-locked", open);

    if (open) {
      // Move focus into the panel so the keyboard follows the eye.
      var first = panel.querySelector(".nav-link");
      if (first) first.focus({ preventScroll: true });
    } else {
      // Wait for the slide-up to finish before taking it out of the tree.
      window.setTimeout(function () {
        if (!open) {
          panel.hidden = true;
          scrim.hidden = true;
        }
      }, 320);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
