/* ============================================================
   PORTFOLIO SCRIPT
   Structure:
     1. Custom Cursor
     2. Nav — Scroll State
     3. Nav — Active Link Highlighting
     4. Nav — Mobile Hamburger Menu
     5. Scroll Reveal Animation
     6. Skill Bar Animations
     7. Contact Form Validation
     8. Keyboard Accessibility — Project Cards
============================================================ */


/* ============================================================
   1. CUSTOM CURSOR
   Two elements: #cursorDot tracks the mouse exactly (snaps).
   #cursorRing lags behind using linear interpolation (lerp)
   inside a requestAnimationFrame loop for a smooth trailing
   effect. Both are hidden on mobile via CSS.

   The ring also expands when hovering interactive elements
   (links, buttons, cards) to signal clickability.
============================================================ */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

// Current mouse position (updated instantly on every mousemove)
let mx = 0, my = 0;

// Ring's smoothed position (catches up to mx/my each frame)
let rx = 0, ry = 0;

// Track the real mouse position
document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

// Animate the ring toward the mouse each frame using lerp
(function animateCursor() {
  // lerp: move 12% of the remaining distance each frame
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;

  // Dot snaps directly to mouse
  if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }

  // Ring follows with a lag
  if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }

  requestAnimationFrame(animateCursor);
})();

// Expand the ring when hovering interactive elements, shrink on leave
document.querySelectorAll('a, button, .project-card, .skill-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (ring) { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.opacity = '0.25'; }
  });
  el.addEventListener('mouseleave', () => {
    if (ring) { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '0.5'; }
  });
});


/* ============================================================
   2. NAV — SCROLL STATE
   Adds .scrolled to #nav once the user scrolls past 50px,
   triggering the frosted-glass background defined in CSS.
   Uses { passive: true } to avoid blocking the scroll thread.
============================================================ */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  // Toggle .scrolled based on scroll position
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });


/* ============================================================
   3. NAV — ACTIVE LINK HIGHLIGHTING
   Uses IntersectionObserver to watch each section. When a
   section is ≥ 5% visible in the middle of the viewport,
   the corresponding nav link gets the .active class.

   rootMargin: '-40% 0px -55% 0px' means the trigger zone is
   a horizontal band 40–45% from the top of the viewport,
   so the active link updates as sections scroll into focus.
============================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Remove .active from all links, then add it to the matching one
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(section => sectionObserver.observe(section));


/* ============================================================
   4. NAV — MOBILE HAMBURGER MENU
   Clicking the hamburger toggles .open on both the button
   (animates it into an ×) and the mobile-menu (shows it).
   aria-expanded is kept in sync for screen readers.
   Clicking any menu link closes the menu immediately.
============================================================ */
const ham  = document.getElementById('hamburger');
const menu = document.getElementById('mobileMenu');

ham.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open'); // returns the new state
  ham.classList.toggle('open', isOpen);
  ham.setAttribute('aria-expanded', isOpen); // keep accessible state in sync
});

// Close menu when any mobile nav link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    ham.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
  });
});


/* ============================================================
   5. SCROLL REVEAL ANIMATION
   Elements with the .reveal class start opacity:0 / offset.
   This observer adds .visible when ≥ 12% of the element is
   in the viewport, triggering the CSS transition defined in
   styles.css. unobserve() ensures it only fires once.
============================================================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // only animate once
    }
  });
}, { threshold: 0.12 }); // trigger when 12% of the element is visible

revealEls.forEach(el => revealObserver.observe(el));


/* ============================================================
   6. SKILL BAR ANIMATIONS
   Each .skill-bar has a data-width attribute (0–1 scale).
   When the bar enters the viewport, its CSS transform is set
   to scaleX(data-width), filling the bar to the target width.
   The smooth transition is defined in styles.css.
============================================================ */
const skillBars = document.querySelectorAll('.skill-bar');

const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const targetWidth = entry.target.dataset.width; // e.g. "0.95"
      entry.target.style.transform = `scaleX(${targetWidth})`;
      entry.target.classList.add('animate'); // used in CSS as a hook if needed
      barObserver.unobserve(entry.target);   // only animate once
    }
  });
}, { threshold: 0.3 }); // trigger when 30% of the bar's container is visible

skillBars.forEach(bar => barObserver.observe(bar));


/* ============================================================
   7. CONTACT FORM VALIDATION
   Client-side only — validates that name, email, and message
   are filled before showing a success message. In production,
   replace the success block with a real API call (e.g.
   Formspree, Resend, or your own backend endpoint).
============================================================ */
document.getElementById('sendBtn').addEventListener('click', () => {
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const feedbackEl = document.getElementById('formMsg');

  // Validation: require name, email, and message
  if (!name || !email || !message) {
    feedbackEl.style.display  = 'block';
    feedbackEl.style.color    = '#FF4B1F'; // red for errors
    feedbackEl.textContent    = '⚠ Please fill in your name, email, and message.';
    return; // stop here — don't submit
  }

  // TODO: replace this block with a real API call to send the email
  feedbackEl.style.display = 'block';
  feedbackEl.style.color   = '#2DCE89'; // green for success
  feedbackEl.textContent   = '✓ Message sent — I\'ll be in touch shortly!';

  // Clear all form fields after a successful (mock) submission
  ['name', 'email', 'subject', 'message'].forEach(id => {
    document.getElementById(id).value = '';
  });

  // Hide the feedback message after 5 seconds
  setTimeout(() => { feedbackEl.style.display = 'none'; }, 5000);
});


/* ============================================================
   8. KEYBOARD ACCESSIBILITY — PROJECT CARDS
   Project cards use role="button" and tabindex="0" so keyboard
   users can navigate to them. This listener fires click() when
   Enter or Space is pressed, matching native button behaviour.
============================================================ */
document.querySelectorAll('.project-card[role="button"]').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // prevent Space from scrolling the page
      card.click();
    }
  });
});
