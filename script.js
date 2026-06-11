/* ============================================================
   PORTFOLIO SCRIPT
   Structure:
     1. Custom Cursor
     2. Nav — Scroll State
     3. Nav — Active Link Highlighting
     4. Nav — Mobile Hamburger Menu
     5. Scroll Reveal Animation
     6. Skill Bar Animations
     7. Contact Form (Formspree)
     8. Keyboard Accessibility — Project Cards
     9. AI Chatbot Widget
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
  if (dot)  { dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'; }

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
   section is visible in the middle of the viewport, the
   corresponding nav link gets the .active class.
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
   This observer adds .visible when 12% of the element is
   in the viewport, triggering the CSS transition in styles.css.
   unobserve() ensures it only fires once.
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
   7. CONTACT FORM (FORMSPREE)
   Validates that name, email, and message are filled, then
   submits to Formspree which delivers to slbruner2@gmail.com.
   Endpoint: https://formspree.io/f/xgoblwyr
============================================================ */
document.getElementById('sendBtn').addEventListener('click', async () => {
  const name       = document.getElementById('name').value.trim();
  const email      = document.getElementById('email').value.trim();
  const subject    = document.getElementById('subject').value.trim();
  const message    = document.getElementById('message').value.trim();
  const feedbackEl = document.getElementById('formMsg');

  // Validation: require name, email, and message
  if (!name || !email || !message) {
    feedbackEl.style.display = 'block';
    feedbackEl.style.color   = '#FF4B1F';
    feedbackEl.textContent   = '⚠ Please fill in your name, email, and message.';
    return;
  }

  // Disable button while sending
  const btn = document.getElementById('sendBtn');
  btn.textContent = 'Sending...';
  btn.disabled    = true;

  try {
    const response = await fetch('https://formspree.io/f/xgoblwyr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, _replyto: email, subject, message })
    });

    if (response.ok) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.color   = '#2DCE89';
      feedbackEl.textContent   = '✓ Message sent — I\'ll be in touch shortly!';
      // Clear all form fields after successful submission
      ['name', 'email', 'subject', 'message'].forEach(id => {
        document.getElementById(id).value = '';
      });
    } else {
      throw new Error('Send failed');
    }
  } catch {
    feedbackEl.style.display = 'block';
    feedbackEl.style.color   = '#FF4B1F';
    feedbackEl.textContent   = '⚠ Something went wrong. Please email me directly at slbruner2@gmail.com';
  }

  btn.textContent = 'Send message →';
  btn.disabled    = false;
  setTimeout(() => { feedbackEl.style.display = 'none'; }, 6000);
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


/* ============================================================
   9. AI CHATBOT WIDGET
   A floating chat bubble (bottom-right) that expands into a
   full panel. Messages are sent to the Anthropic API with a
   system prompt containing Sara's full background so the bot
   can answer visitor questions accurately.

   The conversation history is kept in the `chatHistory` array
   and sent with every request so the bot maintains context.

   NOTE: Replace the fetch URL with your Cloudflare Worker URL
   once set up (see setup email for instructions).
   Example: 'https://portfolio-chatbot.YOUR-SUBDOMAIN.workers.dev'
============================================================ */

/* ── Sara's background — fed to the AI as a system prompt ── */
const SARA_SYSTEM_PROMPT = `You are a friendly and professional AI assistant on Sara Sunny's portfolio website. Your job is to answer questions from visitors (recruiters, hiring managers, potential clients) about Sara's background, skills, experience, and availability.

Here is Sara's full background:

NAME: Sara Sunny
LOCATION: Middleburg, FL
EMAIL: slbruner2@gmail.com
LINKEDIN: https://www.linkedin.com/in/sara-sunny-ba2075230
GITHUB: https://github.com/ssunny264

OBJECTIVE: Results-driven Data Analyst with a solid foundation in data analysis, modeling, and visualization. Strong organizational skills and attention to detail. Committed to leveraging data integrity to support informed business decisions.

EXPERIENCE:
1. Warranty Data Analyst / Customer Service Representative — Utilimaster, Bristol IN (Remote), Feb 2022–Present
   - Transformed and analyzed high-volume warranty claim data to pinpoint inefficiencies and cost-saving opportunities
   - Developed custom VBA macros reducing data processing time by 90% and increasing reporting accuracy
   - Engineered and maintained Power BI dashboards (DAX) for real-time visibility to internal and external stakeholders
   - Managed logistics and scheduling for field technicians
   - Drove $700K in financial recovery in a single recall campaign by auditing complex technician expense datasets
   - Maintained weekly reporting for warranty project stakeholder visibility

2. Program Coordinator — Oaklawn Psychiatric Center, Mishawaka IN, Mar 2016–Mar 2022
   - Directed payroll processing and attendance tracking for a 20-person team with 100% compliance
   - Co-designed a Microsoft Access database to track 90–110 residents' progress
   - Designed training materials and led monthly staff training sessions

3. Independent Living Clerical Assistant — Youth Opportunity Center, Muncie IN, Jun 2013–Feb 2016
   - Monitored and audited Independent Living documentation for youth 15+, ensuring 100% DCS compliance
   - Developed Microsoft Access database to track youth requirements
   - Administered high-priority DCS reporting schedules

EDUCATION:
Indiana University of South Bend — Bachelor of Science in Informatics, Jan 2020–May 2023, GPA 3.74

SKILLS:
- Data Visualization: Power BI, DAX, Dashboard Development, Trend Analysis, Reporting, PowerPoint
- Technical: Microsoft Office, VBA, Power BI, Microsoft Access, SQL, Salesforce, Python, HTML, CSS, Java
  (Note: Python, SQL, Java are educational experience)
- Professional: Attention to Detail, Database Management, Crisis Management, Quantitative Auditing, Cross-Functional Collaboration, Shipping Logistics

AVAILABILITY: Sara is actively seeking new opportunities and open to data analyst, BI analyst, and related roles.

Guidelines:
- Be warm, concise, and professional
- Always speak about Sara in the third person
- If asked something you don't know, say you're not sure and suggest contacting Sara directly at slbruner2@gmail.com
- Keep answers to 2–4 sentences unless more detail is clearly needed
- Never make up facts not listed above`;

/* ── State ── */
const chatHistory = []; // stores { role, content } pairs for multi-turn context
let chatOpen = false;
let greeted  = false;

/* ── DOM refs ── */
const chatBubble   = document.getElementById('chatBubble');
const chatPanel    = document.getElementById('chatPanel');
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const chatSendBtn  = document.getElementById('chatSendBtn');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatBadge    = document.getElementById('chatBadge');
const chatChips    = document.getElementById('chatChips');

/* ── Open / close the panel ── */
function openChat() {
  chatOpen = true;
  chatPanel.classList.add('open');
  chatPanel.setAttribute('aria-hidden', 'false');
  chatBubble.classList.add('open');
  chatBadge.classList.add('hidden'); // hide the notification dot
  chatInput.focus();

  // Show the greeting message once
  if (!greeted) {
    greeted = true;
    appendMessage('bot', "Hi! 👋 I'm Sara's AI assistant. Ask me anything about her skills, experience, or availability — I'm happy to help!");
  }
}

function closeChat() {
  chatOpen = false;
  chatPanel.classList.remove('open');
  chatPanel.setAttribute('aria-hidden', 'true');
  chatBubble.classList.remove('open');
}

chatBubble.addEventListener('click', () => chatOpen ? closeChat() : openChat());
chatCloseBtn.addEventListener('click', closeChat);

/* ── Append a message bubble to the thread ── */
function appendMessage(role, text) {
  const el = document.createElement('div');
  el.classList.add('chat-msg', role);
  el.textContent = text;
  chatMessages.appendChild(el);
  // Scroll to the latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return el;
}

/* ── Show animated typing indicator while waiting for API ── */
function showTyping() {
  const el = document.createElement('div');
  el.classList.add('chat-msg', 'typing');
  el.id = 'typingIndicator';
  el.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

/* ── Send a message to the Anthropic API ── */
async function sendMessage(userText) {
  if (!userText.trim()) return;

  // Hide chips after first message
  chatChips.style.display = 'none';

  // Show user bubble
  appendMessage('user', userText);

  // Add to history for multi-turn context
  chatHistory.push({ role: 'user', content: userText });

  // Clear input and disable send while waiting
  chatInput.value = '';
  chatSendBtn.disabled = true;
  showTyping();

  try {
    // TODO: Replace URL below with your Cloudflare Worker URL after setup
    // e.g. 'https://portfolio-chatbot.YOUR-SUBDOMAIN.workers.dev'
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SARA_SYSTEM_PROMPT,
        messages: chatHistory  // full history keeps conversation context
      })
    });

    const data = await response.json();
    const replyText = data.content?.[0]?.text || "Sorry, I couldn't get a response. Please try again or email Sara directly at slbruner2@gmail.com";

    // Add bot reply to history and display it
    chatHistory.push({ role: 'assistant', content: replyText });
    hideTyping();
    appendMessage('bot', replyText);

  } catch {
    hideTyping();
    appendMessage('bot', "Something went wrong. You can reach Sara directly at slbruner2@gmail.com");
  }

  chatSendBtn.disabled = false;
  chatInput.focus();
}

/* ── Send on button click ── */
chatSendBtn.addEventListener('click', () => sendMessage(chatInput.value));

/* ── Send on Enter key ── */
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(chatInput.value);
  }
});

/* ── Quick-reply chip clicks ── */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => sendMessage(chip.dataset.msg));
});
