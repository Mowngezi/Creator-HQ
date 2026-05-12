// Template renderer. Returns HTML strings. No template engine.
//
// Design system (locked — Khanyisile media kit reference):
//   Typography: Cormorant Garamond (display/names), Instrument Sans (UI/body)
//   Palette:    --paper #f0ece4, --sand #e6e0d8, --ink #0a0a0a, --white #f8f5f0
//   Layout:     Scrollable web sections — NOT A4 boxes. PDF via html2canvas on fixed 794x1123 div (never html2pdf on body)
//   Rhythm:     Cover (dark) → Bio (light) → Stats (dark) → Audience (sand) → Brands+Rates (light) → Footer (dark)

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fmtNum = (n) => {
  if (!n && n !== 0) return '';
  const num = Number(n);
  if (num >= 1000000) return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
  return num.toLocaleString('en-ZA');
};

const fmtCurrency = (n) => {
  if (!n && n !== 0) return '';
  return 'R' + Number(n).toLocaleString('en-ZA');
};

// ---- shared site header (clickable logo + nav, mounted on every page) ----
// Design: minimal black bar that doesn't fight any of the kit aesthetics.
// Logo links to /. Optional back link for in-creator-flow pages so users always
// have an obvious escape hatch.
//
// Usage:
//   renderSiteHeader({ current: 'landing' })
//   renderSiteHeader({ current: 'form', back: { href: '/', label: 'Home' } })
//   renderSiteHeader({ current: 'kit', back: { href: '/', label: 'Home' }, theme: 'on-dark' })
//
// theme: 'on-light' (default) or 'on-dark' for use over the dark cover.
// renderSiteHeader: opaque black band on EVERY page. Same identity, same
// typography, same affordances. Drops the prior theme switcher because Mongezi
// said: "Maintain black band on all pages." Brand consistency over visual
// blending. Logo in tiny letter-spaced Instrument Sans, paper-coloured.
//
// Right side carries global navigation (About + Get Started). Auto-suppresses
// the link to the page you're already on. Contextual back-links (Cancel,
// Back to my kit) live in each PAGE's body, not in the band.
//
// Usage:
//   renderSiteHeader({ current: 'landing' })
//   renderSiteHeader({ current: 'kit' })
//   renderSiteHeader({ current: 'form' })
function renderSiteHeader({ current = '' } = {}) {
  return `
  <style>
    .chq-nav {
      position: relative; z-index: 5;
      padding: 1.6rem 4rem;
      display: flex; align-items: center; justify-content: space-between;
      background: #0a0a0a;
      border-bottom: 1px solid rgba(248,245,240,0.06);
    }
    .chq-nav__logo {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.35em; text-transform: uppercase;
      color: rgba(248,245,240,0.55);
      text-decoration: none;
      transition: color 0.15s;
    }
    .chq-nav__logo:hover { color: rgba(248,245,240,0.95); }
    .chq-nav__items {
      display: flex; align-items: center; gap: 2rem;
      font-family: 'Instrument Sans', sans-serif;
    }
    .chq-nav__items a {
      font-size: 0.6rem; font-weight: 500;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(248,245,240,0.55); text-decoration: none;
      transition: color 0.15s;
    }
    .chq-nav__items a:hover { color: rgba(248,245,240,0.95); }
    @media (max-width: 720px) {
      .chq-nav { padding: 1.1rem 1.25rem; }
      .chq-nav__items { gap: 1.2rem; }
      .chq-nav__items a { font-size: 0.55rem; letter-spacing: 0.18em; padding: 0.75rem 0; display: inline-block; }
    }
  </style>
  <nav class="chq-nav">
    <a href="/" class="chq-nav__logo" aria-label="CreatorHQ home">CreatorHQ</a>
    <div class="chq-nav__items">
      ${current !== 'about' ? `<a href="/about">About</a>` : ''}
      ${current !== 'form' ? `<a href="/new">Get Started</a>` : ''}
    </div>
  </nav>`;
}

// ---- shared trust testimonial (landing) -----------------------------------
// Replaces the prior four-column box. Single quiet pull-quote in italic
// Cormorant from Khanyi (placeholder voice; refine with her actual words
// before merge to main). Caption below names her, links to her kit, and
// communicates the trust signals (no signup, data stays yours, made in SA)
// as quiet text rather than feature boxes. Editorial, not SaaS.
function renderTrustStrip({ theme = 'dark' } = {}) {
  const onDark = theme === 'dark';
  const fg = onDark ? '#f8f5f0' : '#0a0a0a';
  const fgQuiet = onDark ? 'rgba(248,245,240,0.55)' : 'rgba(10,10,10,0.55)';
  const fgFaint = onDark ? 'rgba(248,245,240,0.32)' : 'rgba(10,10,10,0.42)';
  const ruleColor = onDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,10,0.08)';
  const linkBorder = onDark ? 'rgba(248,245,240,0.18)' : 'rgba(10,10,10,0.2)';
  return `
  <section class="chq-testimonial" style="border-top:1px solid ${ruleColor}; border-bottom:1px solid ${ruleColor}; padding:5rem 2rem;">
    <div style="max-width:780px; margin:0 auto; text-align:center;">
      <blockquote style="font-family:'Cormorant Garamond', serif; font-style:italic; font-weight:300; font-size:clamp(1.5rem, 3.2vw, 2rem); line-height:1.4; color:${fg}; margin:0 0 2rem; letter-spacing:-0.01em;">
        &ldquo;A brand asked for my rates on a Tuesday. By Wednesday I sent them a link. By Friday we were shooting.&rdquo;
      </blockquote>
      <div style="font-family:'Instrument Sans', sans-serif; font-size:0.62rem; letter-spacing:0.22em; text-transform:uppercase; color:${fgQuiet};">
        <a href="/c/KhKumalo" style="color:${fg}; text-decoration:none; border-bottom:1px solid ${linkBorder}; padding-bottom:1px;">Khanyisile Khumalo</a>
        <span style="margin:0 0.6rem; color:${fgFaint};">·</span>
        Tembisa
        <span style="margin:0 0.6rem; color:${fgFaint};">·</span>
        On CreatorHQ since April
      </div>
    </div>
    <div style="max-width:780px; margin:3rem auto 0; padding-top:2rem; border-top:1px solid ${ruleColor}; display:flex; justify-content:center; gap:2.5rem; flex-wrap:wrap; font-family:'Instrument Sans',sans-serif; font-size:0.72rem; color:${fgQuiet}; letter-spacing:0.02em;">
      <span>Built in Johannesburg</span>
      <span>No signup needed</span>
      <span>Your data stays yours</span>
    </div>
  </section>`;
}

// Tiny 404 page that respects the design system + gives the user a way home.
export function renderNotFoundHTML({ what = 'page' } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · Not found</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${localFonts()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Instrument Sans', system-ui, sans-serif; background: #0a0a0a; color: #f8f5f0; min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1.5rem; text-align: center; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(3rem, 8vw, 5rem); font-weight: 300; line-height: 1; margin-bottom: 1.25rem; letter-spacing: -0.02em; color: #f8f5f0; }
    h1 em { font-style: italic; color: rgba(248,245,240,0.4); }
    p { font-size: 1rem; color: rgba(248,245,240,0.5); margin-bottom: 2.5rem; max-width: 32rem; line-height: 1.7; }
    a.back { display: inline-flex; align-items: center; gap: 0.4rem; color: #f8f5f0; text-decoration: none; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; border-bottom: 1px solid rgba(248,245,240,0.4); padding-bottom: 4px; transition: border-color 0.2s; }
    a.back:hover { border-color: #f8f5f0; }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: '404' })}
  <main>
    <h1>Not <em>here.</em></h1>
    <p>The ${esc(what)} you tried to open does not exist or has been moved. The kit owner may have deleted it, or the link was mistyped.</p>
    <a href="/" class="back">Back to CreatorHQ →</a>
  </main>
</body>
</html>`;
}

// Branded error page for /create failures (validation 400s + the catch-all
// 500). Replaces a previous text/plain dead-end. The "Back to /new" link
// returns the user to the form so they can fix and resubmit. The form does
// not currently round-trip values; that is a v1 acceptable trade-off.
export function renderCreateErrorHTML({ message = 'We could not create your kit.', status = 400 } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · ${status === 500 ? 'Something broke' : 'Check your details'}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#0a0a0a">
  <style>
    ${localFonts()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Instrument Sans', system-ui, sans-serif; background: #0a0a0a; color: #f8f5f0; min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1.5rem; text-align: center; }
    .eyebrow { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(248,245,240,0.35); margin-bottom: 1.25rem; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2.4rem, 6vw, 3.6rem); font-weight: 300; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 1.5rem; max-width: 16ch; }
    h1 em { font-style: italic; color: rgba(248,245,240,0.5); }
    p { font-size: 1rem; color: rgba(248,245,240,0.65); line-height: 1.75; margin-bottom: 2.5rem; max-width: 38rem; }
    a.back { display: inline-flex; align-items: center; gap: 0.5rem; color: #f8f5f0; text-decoration: none; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; border-bottom: 1px solid rgba(248,245,240,0.4); padding-bottom: 4px; transition: border-color 0.2s; }
    a.back:hover { border-color: #f8f5f0; }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'error' })}
  <main>
    <div class="eyebrow">${status === 500 ? '500 · Something broke' : '400 · Check your details'}</div>
    <h1>${status === 500 ? `Something <em>broke.</em>` : `One <em>thing</em> off.`}</h1>
    <p>${esc(message)}</p>
    <a href="/new" class="back">Back to the form →</a>
  </main>
</body>
</html>`;
}

// About page. Editorial register, ~150 words, three short paragraphs.
// Mongezi-credited. Single text-link CTA at bottom in same treatment as 404.
export function renderAboutHTML() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · About</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${ogMeta({
    title: 'CreatorHQ · About',
    description: 'A media kit and rate card generator for African creators. Built in Johannesburg by Mongezi Xhoma. No signup, no recurring fee.',
    image: absoluteUrl('/og-default.png'),
    url: absoluteUrl('/about'),
    type: 'website'
  })}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#0a0a0a">
  <style>
    ${localFonts()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Instrument Sans', system-ui, sans-serif; background: #0a0a0a; color: #f8f5f0; min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; max-width: 640px; margin: 0 auto; padding: 5rem 1.75rem 6rem; width: 100%; }
    .eyebrow { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(248,245,240,0.35); margin-bottom: 1.5rem; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2.4rem, 6.5vw, 3.6rem); font-weight: 300; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 3rem; color: #f8f5f0; max-width: 14ch; }
    h1 em { font-style: italic; color: rgba(248,245,240,0.5); }
    p { font-size: 1.02rem; color: rgba(248,245,240,0.7); line-height: 1.85; margin-bottom: 1.5rem; max-width: 56ch; }
    p strong { color: #f8f5f0; font-weight: 500; }
    .rule { width: 32px; height: 1px; background: rgba(248,245,240,0.18); margin: 3rem 0; }
    .cta-row { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; margin-top: 2.5rem; }
    a.cta {
      display: inline-flex; align-items: center; gap: 0.6rem;
      background: #f8f5f0; color: #0a0a0a;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.72rem; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
      text-decoration: none;
      padding: 1rem 1.75rem; border-radius: 100px;
      transition: opacity 0.2s;
    }
    a.cta:hover { opacity: 0.88; }
    a.text-link {
      color: #f8f5f0; text-decoration: underline; text-underline-offset: 4px;
      font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
    }
    a.text-link:hover { color: rgba(248,245,240,0.7); }
    @media (max-width: 480px) {
      main { padding: 3rem 1.5rem 5rem; }
      p { font-size: 0.95rem; line-height: 1.75; }
    }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'about' })}
  <main>
    <div class="eyebrow">About</div>
    <h1>The kit you wish you had <em>last week.</em></h1>

    <p>CreatorHQ is a media kit and rate card generator built for <strong>African creators</strong>. The kind who get asked their rates more than they want to. The kind who answer brand DMs by hunting for last quarter's screenshot. The kind who undercharge because nobody told them what they were worth.</p>

    <p>Build a designed, scrollable kit in five minutes without an account. Share a permanent link. Send a PDF. Let your numbers do the talking instead of you.</p>

    <p>Built in Johannesburg by <strong>Mongezi Xhoma</strong>. No signup, no monthly fee, no enterprise sales call. The kit is yours, the URL is yours, the terms are yours. We get paid later, when the platform earns it.</p>

    <div class="rule"></div>

    <div class="cta-row">
      <a href="/new" class="cta">Build mine →</a>
      <a href="/c/KhKumalo" class="text-link">See an example</a>
    </div>
  </main>
</body>
</html>`;
}

// "This kit belongs to someone else." Rendered when a non-owner hits
// /c/:id/edit. Conversion-friendly: surfaces three text-links (recover access,
// view the kit as a visitor, build your own) instead of a punitive 403.
export function renderNotYoursHTML(creator) {
  const id = esc(creator?.id || '');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · This kit belongs to someone else</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#0a0a0a">
  <style>
    ${localFonts()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Instrument Sans', system-ui, sans-serif; background: #0a0a0a; color: #f8f5f0; min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; max-width: 600px; margin: 0 auto; padding: 5rem 1.75rem 6rem; width: 100%; }
    .eyebrow { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(248,245,240,0.35); margin-bottom: 1.5rem; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2.2rem, 6vw, 3.4rem); font-weight: 300; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 1.5rem; color: #f8f5f0; }
    h1 em { font-style: italic; color: rgba(248,245,240,0.5); }
    p { font-size: 1rem; color: rgba(248,245,240,0.65); line-height: 1.75; margin-bottom: 2.5rem; max-width: 50ch; }
    .links { display: flex; flex-direction: column; gap: 1rem; }
    .links a { color: #f8f5f0; text-decoration: underline; text-underline-offset: 4px; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.4rem 0; }
    .links a:hover { opacity: 0.7; }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'notyours' })}
  <main>
    <div class="eyebrow">403 · Not your kit</div>
    <h1>This kit belongs to <em>someone else.</em></h1>
    <p>If you're trying to edit your own, recover access from this device. If you're a brand, view the kit as it was shared. Or build your own. It takes about five minutes.</p>
    <div class="links">
      <a href="/c/${id}/recover">Recover access to this kit →</a>
      <a href="/c/${id}">View the kit →</a>
      <a href="/new">Build your own →</a>
    </div>
  </main>
</body>
</html>`;
}

// Recovery page: contact + DOB form. POST /c/:id/recover validates the inputs
// against the stored hashes and sets the owner cookie on success.
// `flash` carries an optional error message ('mismatch' | 'rate_limited' | null).
export function renderRecoverHTML(creator, { flash = null } = {}) {
  const id = esc(creator?.id || '');
  const flashMsg = flash === 'mismatch'
    ? 'We could not verify those details. Try again.'
    : flash === 'rate_limited'
      ? 'Too many attempts. Wait an hour and try again.'
      : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · Recover access</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#0a0a0a">
  <style>
    ${localFonts()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Instrument Sans', system-ui, sans-serif; background: #0a0a0a; color: #f8f5f0; min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; max-width: 460px; margin: 0 auto; padding: 4rem 1.75rem 6rem; width: 100%; }
    .eyebrow { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(248,245,240,0.35); margin-bottom: 1.5rem; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2rem, 5.5vw, 2.8rem); font-weight: 300; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 1rem; color: #f8f5f0; }
    h1 em { font-style: italic; color: rgba(248,245,240,0.5); }
    p.lede { font-size: 0.95rem; color: rgba(248,245,240,0.6); line-height: 1.7; margin-bottom: 2.5rem; }
    label { display: block; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(248,245,240,0.5); margin: 18px 0 8px; }
    input { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(248,245,240,0.12); color: #f8f5f0; font-family: 'Instrument Sans', sans-serif; font-size: 16px; border-radius: 4px; }
    input:focus { outline: none; border-color: rgba(248,245,240,0.4); }
    .dob-row { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 8px; }
    .flash { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.3); color: var(--red); padding: 12px 16px; border-radius: 4px; font-size: 0.82rem; margin-bottom: 1.5rem; }
    button { margin-top: 2rem; width: 100%; background: #f8f5f0; color: #0a0a0a; font-family: 'Instrument Sans', sans-serif; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 1.1rem; border: none; border-radius: 100px; cursor: pointer; transition: opacity 0.15s; }
    button:hover { opacity: 0.85; }
    .alt { margin-top: 1.5rem; font-size: 0.7rem; letter-spacing: 0.08em; }
    .alt a { color: rgba(248,245,240,0.55); text-decoration: underline; text-underline-offset: 4px; }
    .alt a:hover { color: #f8f5f0; }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'recover' })}
  <main>
    <div class="eyebrow">Recover</div>
    <h1>Edit access on <em>this device.</em></h1>
    <p class="lede">Confirm the contact and date of birth you set when you built this kit. We never stored the raw values; we hash and compare.</p>
    ${flashMsg ? `<div class="flash">${esc(flashMsg)}</div>` : ''}
    <form method="post" action="/c/${id}/recover">
      <label>Contact <span style="text-transform:none;letter-spacing:0;color:rgba(248,245,240,0.4);">· email or SA cell</span></label>
      <input name="recovery_contact" type="text" inputmode="email" autocomplete="email" placeholder="you@example.com  or  0821234567" required />

      <label style="margin-top:24px;">Date of birth <span style="text-transform:none;letter-spacing:0;color:rgba(248,245,240,0.4);">· DD / MM / YYYY</span></label>
      <div class="dob-row">
        <input name="recovery_dob_d" type="text" inputmode="numeric" pattern="\\d*" maxlength="2" placeholder="DD" required aria-label="Day" />
        <input name="recovery_dob_m" type="text" inputmode="numeric" pattern="\\d*" maxlength="2" placeholder="MM" required aria-label="Month" />
        <input name="recovery_dob_y" type="text" inputmode="numeric" pattern="\\d*" maxlength="4" placeholder="YYYY" required aria-label="Year" />
      </div>

      <button type="submit">Recover access</button>
    </form>
    <div class="alt">
      Wrong kit? <a href="/c/${id}">View it as a visitor</a> · or <a href="/new">build your own</a>.
    </div>
  </main>
  <script>
    (function() {
      var dobInputs = document.querySelectorAll('input[name^="recovery_dob_"]');
      if (!dobInputs.length) return;
      dobInputs.forEach(function(el, i) {
        el.addEventListener('input', function() {
          if (el.value.length >= el.maxLength && i < dobInputs.length - 1) {
            dobInputs[i + 1].focus();
          }
        });
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace' && el.value === '' && i > 0) {
            dobInputs[i - 1].focus();
          }
        });
      });
    })();
  </script>
</body>
</html>`;
}

// Tiny markdown renderer. Headings, paragraphs, bold, italic, links, lists.
// Enough for the Privacy + Terms docs without adding a dependency.
//
// SECURITY: SOURCE MUST BE OPERATOR-CONTROLLED. The link rule (`[txt](url)`)
// will happily emit any href; we filter `javascript:` and `data:` schemes
// here, but the broader fence is "do not feed user input into this
// function". If you ever do, also re-audit escapeHtml against the rest of
// Parse a URL and return a human-readable platform label for display.
// Used in brand evidence links — shows "↗ Instagram" instead of a raw URL.
function platformLabel(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('instagram.com'))  return 'Instagram';
    if (host.includes('tiktok.com'))     return 'TikTok';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
    if (host.includes('twitter.com') || host.includes('x.com'))    return 'X / Twitter';
    if (host.includes('facebook.com'))   return 'Facebook';
    if (host.includes('linkedin.com'))   return 'LinkedIn';
    // Fallback: capitalised root domain (e.g. "bbc.co.uk" → "Bbc")
    const root = host.split('.').slice(-2)[0] || host;
    return root.charAt(0).toUpperCase() + root.slice(1);
  } catch { return 'Link'; }
}

// the rules; bold/italic/link patterns assume already-escaped text and a
// trusted author.
function tinyMarkdown(md) {
  const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inList = false;
  for (let raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      if (inList) { out.push('</ul>'); inList = false; }
      continue;
    }
    const m1 = line.match(/^# (.+)$/);
    const m2 = line.match(/^## (.+)$/);
    const m3 = line.match(/^### (.+)$/);
    const mli = line.match(/^[-*] (.+)$/);
    if (m1) { if (inList) { out.push('</ul>'); inList = false; } out.push(`<h1>${escapeHtml(m1[1])}</h1>`); continue; }
    if (m2) { if (inList) { out.push('</ul>'); inList = false; } out.push(`<h2>${escapeHtml(m2[1])}</h2>`); continue; }
    if (m3) { if (inList) { out.push('</ul>'); inList = false; } out.push(`<h3>${escapeHtml(m3[1])}</h3>`); continue; }
    if (mli) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inlineMd(mli[1])}</li>`);
      continue;
    }
    if (inList) { out.push('</ul>'); inList = false; }
    out.push(`<p>${inlineMd(line)}</p>`);
  }
  if (inList) out.push('</ul>');
  return out.join('\n');

  function inlineMd(s) {
    let txt = escapeHtml(s);
    // Links [text](url) — guard the href scheme. Allow http(s), mailto,
    // anchor, and absolute-path. Reject everything else (notably
    // javascript: and data:) to a plain text span so a future operator
    // pasting a sketchy link doesn't ship an XSS by accident.
    txt = txt.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
      const safe = /^(https?:\/\/|mailto:|\/|#)/i.test(url.trim());
      return safe
        ? `<a href="${url}">${label}</a>`
        : `<span>${label}</span>`;
    });
    // Bold **text**
    txt = txt.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    txt = txt.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return txt;
  }
}

// Shared chrome for Privacy + Terms — same dark register as About.
function renderDocPage({ title, mdBody, ogPath }) {
  const html = tinyMarkdown(mdBody);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · ${esc(title)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${ogMeta({
    title: `CreatorHQ · ${title}`,
    description: `${title} for CreatorHQ.`,
    image: absoluteUrl('/og-default.png'),
    url: absoluteUrl(ogPath),
    type: 'article'
  })}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#0a0a0a">
  <style>
    ${localFonts()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Instrument Sans', system-ui, sans-serif; background: #0a0a0a; color: #f8f5f0; min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; max-width: 640px; margin: 0 auto; padding: 4rem 1.75rem 6rem; width: 100%; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2.4rem, 6vw, 3.4rem); font-weight: 300; line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 2rem; color: #f8f5f0; }
    h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.4rem; font-weight: 500; line-height: 1.2; margin: 2.5rem 0 1rem; color: #f8f5f0; }
    h3 { font-family: 'Instrument Sans', sans-serif; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(248,245,240,0.45); margin: 2rem 0 0.6rem; }
    p { font-size: 1rem; color: rgba(248,245,240,0.7); line-height: 1.85; margin-bottom: 1.4rem; }
    p strong { color: #f8f5f0; font-weight: 500; }
    p em { color: rgba(248,245,240,0.85); }
    p a { color: #f8f5f0; text-decoration: underline; text-underline-offset: 4px; }
    p a:hover { opacity: 0.7; }
    ul { color: rgba(248,245,240,0.7); font-size: 1rem; line-height: 1.85; margin: 0 0 1.4rem 1.25rem; padding-left: 0.5rem; }
    ul li { margin-bottom: 0.4rem; }
    @media (max-width: 480px) { main { padding: 3rem 1.5rem 5rem; } p, ul { font-size: 0.95rem; } }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'doc' })}
  <main>
    ${html}
  </main>
</body>
</html>`;
}

export function renderPrivacyHTML(mdBody) {
  return renderDocPage({ title: 'Privacy', mdBody, ogPath: '/privacy' });
}

export function renderTermsHTML(mdBody) {
  return renderDocPage({ title: 'Terms', mdBody, ogPath: '/terms' });
}

// ---- self-hosted typeface @font-face block --------------------------------
// Replaces the prior @import url(googleapis...) which was render-blocking on
// 3G. All six woff2 files live in public/fonts/ and ship from our domain.
// Cormorant Garamond is variable-weight in the file; we declare it once for
// each style (normal + italic) and let the font-weight CSS pick the axis.
// Instrument Sans is also variable; one declaration covers all weights.
// font-display:swap so text renders immediately in the system fallback then
// re-paints when the woff2 lands.
function localFonts() {
  return /* css */ `
    @font-face {
      font-family: 'Cormorant Garamond';
      font-style: normal;
      font-weight: 300 600;
      font-display: swap;
      src: url('/fonts/cormorant-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Cormorant Garamond';
      font-style: normal;
      font-weight: 300 600;
      font-display: swap;
      src: url('/fonts/cormorant-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    @font-face {
      font-family: 'Cormorant Garamond';
      font-style: italic;
      font-weight: 300 400;
      font-display: swap;
      src: url('/fonts/cormorant-italic-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Cormorant Garamond';
      font-style: italic;
      font-weight: 300 400;
      font-display: swap;
      src: url('/fonts/cormorant-italic-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    @font-face {
      font-family: 'Instrument Sans';
      font-style: normal;
      font-weight: 300 500;
      font-display: swap;
      src: url('/fonts/instrument-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Instrument Sans';
      font-style: normal;
      font-weight: 300 500;
      font-display: swap;
      src: url('/fonts/instrument-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
  `;
}

// ---- Open Graph + Twitter card meta -------------------------------------
// Renders the share-preview metadata for a page. WhatsApp, iMessage, Twitter,
// LinkedIn, Slack all read these tags when a URL is pasted. Without them the
// preview is blank or shows random page text. With them the preview shows
// photo + name + tagline.
//
// Usage:
//   ${ogMeta({ title: '...', description: '...', image: '...', url: '...', type: 'profile' })}
//
// Pass `image` as an absolute URL (https://...) — relative URLs don't work in
// social previews.
function ogMeta({ title, description, image, url, type = 'website' } = {}) {
  const safeTitle = esc(title || 'CreatorHQ');
  const safeDesc = esc(description || 'Designed, shareable media kits for African creators.');
  const safeImage = esc(image || '');
  const safeUrl = esc(url || '');
  return `
  <meta property="og:type" content="${esc(type)}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  ${safeImage ? `<meta property="og:image" content="${safeImage}">` : ''}
  ${safeUrl ? `<meta property="og:url" content="${safeUrl}">` : ''}
  <meta property="og:site_name" content="CreatorHQ">
  <meta name="twitter:card" content="${safeImage ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  ${safeImage ? `<meta name="twitter:image" content="${safeImage}">` : ''}
  <meta name="description" content="${safeDesc}">`;
}

// Build an absolute URL for a path. Honors SITE_URL env (set on Railway) so
// the share previews work on production. Falls back to the production domain
// when running locally. Defensive against SITE_URL being set without a scheme
// (which silently breaks OG / Twitter previews — they require https://...).
function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  let base = process.env.SITE_URL || 'https://creator-hq-production.up.railway.app';
  // Add scheme if SITE_URL was set without one (common Railway config mistake).
  if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
  const baseTrim = base.replace(/\/$/, '');
  const pathPrefixed = pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl;
  return baseTrim + pathPrefixed;
}

// ── Schema.org JSON-LD for creator profile pages ───────────────────────────
// Makes CreatorHQ profiles machine-readable primary sources.
// AI crawlers and search engines can use this structured entity data
// instead of relying on secondhand journalist articles.
// Spec: https://schema.org/Person
function creatorJSONLD(creator) {
  const firstName  = creator.nameDetails?.first || (creator.name || '').trim().split(' ')[0] || '';
  const lastName   = creator.nameDetails?.last  || (creator.name || '').trim().split(' ').slice(1).join(' ') || '';
  const fullName   = [firstName, lastName].filter(Boolean).join(' ');
  const bio        = (creator.bioParagraphs || []).join(' ') || creator.bio || '';
  const role       = creator.niche    || 'Content Creator';
  const location   = creator.location || '';
  const photoUrl   = creator.photo?.url ? absoluteUrl(creator.photo.url) : '';
  const profileUrl = absoluteUrl(`/c/${creator.id}`);
  const email      = creator.email || creator.contact?.email || '';

  // Social profile URLs — strip leading @ from handles
  const ig  = creator.platforms?.instagram || creator.platformsOld?.instagram || {};
  const tt  = creator.platforms?.tiktok    || creator.platformsOld?.tiktok    || {};
  const fb  = creator.platforms?.facebook  || {};
  const sameAs = [
    ig.handle ? `https://www.instagram.com/${ig.handle.replace(/^@/, '')}` : null,
    tt.handle ? `https://www.tiktok.com/@${tt.handle.replace(/^@/, '')}` : null,
    fb.handle ? `https://www.facebook.com/${fb.handle.replace(/^@/, '')}` : null,
  ].filter(Boolean);

  // knowsAbout — content pillars + audience interests
  const pillars   = (creator.bioPillars || []).map(p => p.label || p.text || p).filter(Boolean);
  const interests = creator.audience?.interests || [];
  const knowsAbout = [...new Set([...pillars, ...interests])].filter(Boolean);

  // Brand partnerships as sponsor entities
  const brands = (creator.brands || creator.workPreview || [])
    .filter(b => b.brand || b.name)
    .map(b => ({ '@type': 'Organization', 'name': b.brand || b.name }));

  // Reach stats as interactionStatistic
  const interactions = [];
  const addStat = (platform, count, type) => {
    if (count) interactions.push({
      '@type': 'InteractionCounter',
      'interactionType': { '@type': type },
      'userInteractionCount': Number(String(count).replace(/[^0-9]/g, '')) || 0,
      'name': platform,
    });
  };
  addStat('Instagram', ig.followers, 'FollowAction');
  addStat('TikTok',    tt.followers, 'FollowAction');
  addStat('Facebook',  fb.followers, 'FollowAction');

  const entity = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': profileUrl,
    'name': fullName,
    'givenName': firstName,
    'familyName': lastName,
    'jobTitle': role,
    'description': bio.slice(0, 500) || undefined,
    'url': profileUrl,
    ...(photoUrl  ? { 'image': photoUrl }   : {}),
    ...(location  ? { 'homeLocation': { '@type': 'Place', 'name': location } } : {}),
    ...(email     ? { 'email': email }       : {}),
    ...(sameAs.length    ? { sameAs }        : {}),
    ...(knowsAbout.length ? { knowsAbout }   : {}),
    ...(brands.length    ? { 'sponsor': brands } : {}),
    ...(interactions.length ? { 'interactionStatistic': interactions } : {}),
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': profileUrl,
      'name': `${fullName} · Media Kit`,
      'isPartOf': { '@type': 'WebSite', 'name': 'CreatorHQ', 'url': absoluteUrl('/') },
    },
  };

  // Strip undefined values so JSON stays clean
  const clean = JSON.parse(JSON.stringify(entity));
  return `<script type="application/ld+json">\n${JSON.stringify(clean, null, 2)}\n</script>`;
}

// ---- shared head / fonts / base CSS (used by form + landing) ----

function headCSS() {
  return /* css */ `
    ${localFonts()}

    :root {
      --black: #0a0a0a;
      --white: #ffffff;
      --paper: #ffffff;
      --off:   #f5f5f5;
      --rule:  rgba(10,10,10,0.15);
      --muted: rgba(10,10,10,0.45);
      --red:   #dc2626;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #e0e0e0; color: var(--black); }
    body {
      font-family: 'Instrument Sans', system-ui, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }

    .display {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    /* A4 page — 794 x 1123 px at 96dpi */
    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: var(--white);
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }

    /* ---- COVER ---- */
    .cover {
      display: grid;
      grid-template-columns: 365px 1fr;
      min-height: 1123px;
    }

    /* The photo slot is LOCKED to 365 x 1123 px. This is the spec. */
    .cover__photo {
      width: 365px;
      height: 1123px;
      background: var(--black);
      overflow: hidden;
      position: relative;
    }
    .cover__photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
    .cover__photo--empty::after {
      content: '365 × 1123';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 9pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .cover__body {
      padding: 72px 64px 64px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 1123px;
      background: var(--black);
      color: var(--white);
    }
    .cover__eyebrow {
      font-size: 9pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      font-weight: 500;
      margin-bottom: 36px;
    }
    .cover__name {
      font-size: 58pt;
      line-height: 0.95;
      color: var(--white);
      margin-bottom: 12px;
    }
    .cover__handle {
      font-size: 11pt;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.04em;
    }
    .cover__tagline {
      margin-top: 48px;
      font-size: 18pt;
      line-height: 1.3;
      max-width: 28ch;
      color: rgba(255,255,255,0.85);
    }
    .cover__foot {
      font-size: 8.5pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      display: flex;
      justify-content: space-between;
    }

    /* ---- INTERIOR PAGE ---- */
    .sheet {
      padding: 72px 64px;
    }
    .section + .section { margin-top: 56px; }
    .section__label {
      font-size: 8.5pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--black);
      font-weight: 600;
      margin-bottom: 18px;
    }
    .section__title {
      font-size: 28pt;
      line-height: 1.1;
      margin-bottom: 24px;
    }
    .section__body {
      font-size: 11pt;
      max-width: 62ch;
      color: rgba(10,10,10,0.82);
    }

    .platforms {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0;
      border-top: 1px solid var(--rule);
      border-bottom: 1px solid var(--rule);
    }
    .platform {
      padding: 28px 24px;
      border-right: 1px solid var(--rule);
    }
    .platform:last-child { border-right: none; }
    .platform__name {
      font-size: 9pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--black);
      font-weight: 600;
    }
    .platform__handle {
      font-size: 16pt;
      margin-top: 6px;
    }
    .platform__stats {
      margin-top: 18px;
      display: flex;
      flex-direction: row;
      gap: 24px;
    }
    .stat__n {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 28pt;
      font-weight: 600;
      line-height: 1;
    }
    .stat__l {
      font-size: 8.5pt;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 6px;
    }

    .rates { border-top: 1px solid var(--rule); }
    .rate {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 22px 0;
      border-bottom: 1px solid var(--rule);
    }
    .rate__label { font-size: 13pt; }
    .rate__amount {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 20pt;
      font-weight: 600;
    }

    .work { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 32px; }
    .work__item {
      padding: 20px 22px;
      background: var(--black);
      color: var(--white);
    }
    .work__brand {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 14pt;
      font-weight: 600;
      line-height: 1.2;
    }
    .work__note {
      font-size: 10pt;
      color: rgba(255,255,255,0.55);
      margin-top: 8px;
    }

    .foot {
      margin-top: 72px;
      padding-top: 24px;
      border-top: 1px solid var(--rule);
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }

    /* Screen-only chrome (hidden when Puppeteer renders to PDF) */
    .chrome {
      position: fixed;
      top: 20px; right: 20px;
      display: flex; gap: 10px;
      z-index: 10;
    }
    .chrome a, .chrome button {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 10pt;
      padding: 10px 16px;
      background: var(--black);
      color: var(--white);
      text-decoration: none;
      border-radius: 2px;
      border: none;
      cursor: pointer;
    }
    .chrome a.secondary, .chrome button.secondary {
      background: var(--white);
      color: var(--black);
      border: 1px solid var(--black);
    }
    .for-pdf .chrome { display: none; }

    @media print {
      .chrome { display: none; }
      .page { margin: 0; box-shadow: none; }
    }

    /* Decay-Rule legacy CSS (.is-dated, .dated-badge) was removed in Phase B.
       The freshness signal now lives in the hero-bar via .chq-fresh on kit and
       .rate-fresh on the rate card. See formatFreshness() upstream.            */

    .nudge {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: #ffffff;
      color: #0a0a0a;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      z-index: 999;
      width: clamp(320px, 90vw, 600px);
      border: 1px solid rgba(0,0,0,0.05);
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { transform: translate(-50%, 100%); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    .nudge__content { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
    .nudge__icon { font-size: 1.2rem; }
    .nudge__text { display: flex; flex-direction: column; }
    .nudge__text strong { font-size: 0.85rem; font-weight: 600; letter-spacing: -0.01em; }
    .nudge__text span { font-size: 0.75rem; color: rgba(0,0,0,0.6); line-height: 1.3; }
    .nudge__btn {
      background: #0a0a0a;
      color: #ffffff;
      padding: 0.6rem 1.2rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }

    /* Modal Styles */
    .modal { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal__overlay { position: absolute; inset: 0; background: rgba(10,10,10,0.4); backdrop-filter: blur(2px); }
    .modal__content {
      position: relative;
      background: #ffffff;
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } }
    .modal__close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: rgba(0,0,0,0.3); }
    .modal__header h2 { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 400; margin-bottom: 0.5rem; }
    .modal__header p { font-size: 0.9rem; color: rgba(0,0,0,0.6); line-height: 1.5; margin-bottom: 2rem; }
    
    .auth-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.8rem;
      border-radius: 100px;
      border: 1px solid rgba(0,0,0,0.1);
      background: #ffffff;
      color: #0a0a0a;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .auth-btn:hover { border-color: rgba(0,0,0,0.2); background: rgba(0,0,0,0.02); }
    .auth-btn--primary { background: #0a0a0a; color: #ffffff; border: none; }
    .auth-btn--primary:hover { opacity: 0.88; background: #0a0a0a; }
    
    .auth-divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; font-size: 0.7rem; color: rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 0.1em; }
    .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.08); }
    
    .auth-input {
      width: 100%;
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid rgba(0,0,0,0.1);
      font: inherit;
      margin-bottom: 0.75rem;
    }
    .auth-input:focus { outline: none; border-color: #0a0a0a; }

    @media (max-width: 480px) {
      /* On mobile: nudge sits above the action bar, not at the bottom edge */
      .nudge { bottom: 5rem; left: 1rem; right: 1rem; width: auto; transform: none; border-radius: 12px; border-top: none; }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    }

    /* ---- BRAND EVIDENCE ---- */
    .brand-evidence {
      display: none;
      padding: 0.5rem 0 0.75rem;
    }
    .brand-evidence.visible { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }
    .evidence-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.6rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--dusk);
      text-decoration: none;
      border: 1px solid var(--line);
      padding: 0.3rem 0.75rem;
      border-radius: 100px;
      transition: border-color 0.15s, color 0.15s;
      white-space: nowrap;
    }
    .evidence-link:hover { border-color: var(--dusk); color: var(--ink); }
    .brand-row { cursor: pointer; transition: background 0.1s; }
    .brand-row:hover { background: rgba(0,0,0,0.02); }
  `;
}

// ---- Media Kit Card (Khanyisile scrollable design) ----

// Renders the post-create banner. Shown on first kit view (?created=1).
// User can dismiss; sharing the URL strips the param naturally.
function renderCreatedBanner(creator, productLabel = 'Media kit') {
  return `
  <div id="created-banner" style="position:sticky; top:54px; z-index:40; background:#0a0a0a; color:#fff; padding:0.9rem 1.25rem; font-family:'Instrument Sans',sans-serif; font-size:0.82rem;">
    <div style="max-width:980px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:0.6rem;">
        <span style="display:inline-flex; align-items:center; justify-content:center; width:1.4rem; height:1.4rem; border-radius:50%; background:#22c55e; color:#0a0a0a; font-size:0.7rem; font-weight:700;">✓</span>
        <span><strong>${esc(productLabel)} live.</strong> Copy the link and send it to a brand or a friend.</span>
      </div>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <button onclick="copyShareUrl()" id="created-banner-copy" style="background:#fff; color:#0a0a0a; border:none; padding:0.45rem 0.9rem; border-radius:100px; font-size:0.72rem; font-weight:500; cursor:pointer; letter-spacing:0.04em;">Copy link</button>
        <a href="/c/${esc(creator.id)}/edit" style="color:rgba(255,255,255,0.85); text-decoration:none; font-size:0.72rem; padding:0.45rem 0.7rem; border:1px solid rgba(255,255,255,0.18); border-radius:100px;">Edit</a>
        <button onclick="document.getElementById('created-banner').remove()" aria-label="Dismiss" style="background:none; border:none; color:rgba(255,255,255,0.6); font-size:1.1rem; cursor:pointer; padding:0 0.4rem;">×</button>
      </div>
    </div>
    <script>
      function copyShareUrl(){
        const url = window.location.origin + window.location.pathname;
        navigator.clipboard.writeText(url).then(()=>{
          const b = document.getElementById('created-banner-copy');
          const o = b.textContent; b.textContent = 'Copied'; setTimeout(()=>b.textContent=o, 1800);
        }).catch(()=>{});
      }
    </script>
  </div>`;
}

// Renders the post-save confirmation banner. Quieter than the post-create
// banner because the user is already oriented; this is just acknowledgement.
// Auto-dismisses after 4 seconds. The URL still includes ?saved=1 if the user
// stays on the page, but reload / share strips it naturally.
function renderSavedBanner() {
  return `
  <div id="saved-banner" role="status" aria-live="polite" style="position:fixed; left:50%; top:1.25rem; transform:translateX(-50%); z-index:60; background:#0a0a0a; color:#fff; padding:0.55rem 1.1rem 0.55rem 0.75rem; border-radius:100px; font-family:'Instrument Sans',sans-serif; font-size:0.78rem; display:flex; align-items:center; gap:0.55rem; box-shadow:0 8px 24px rgba(0,0,0,0.18); transition:opacity 0.4s ease, transform 0.4s ease;">
    <span style="display:inline-flex; align-items:center; justify-content:center; width:1.1rem; height:1.1rem; border-radius:50%; background:#22c55e; color:#0a0a0a; font-size:0.6rem; font-weight:700;">✓</span>
    <span>Changes saved.</span>
    <script>
      setTimeout(function(){
        var b = document.getElementById('saved-banner');
        if (b) { b.style.opacity = '0'; b.style.transform = 'translateX(-50%) translateY(-6px)'; setTimeout(function(){ b.remove(); }, 400); }
      }, 4000);
    </script>
  </div>`;
}

// Freshness label shown in the hero-bar slot (where a dim duplicate "CreatorHQ"
// wordmark used to live). Returns { text, stale } where stale=true after 7
// days so callers can render in an "outdated" tone. The 7-day cliff matches
// the existing isDated logic in the kit page; it is the de-facto "live kit"
// guarantee we make to brands.
//   {text:'Edited today',         stale:false}
//   {text:'Edited 3 days ago',    stale:false}
//   {text:'Edited 9 days ago',    stale:true}
//   {text:'Edited Apr 2025',      stale:true}  // > 12 months
function formatFreshness(iso) {
  if (!iso) return null;
  const then = new Date(iso);
  if (isNaN(then.getTime())) return null;
  const days = Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24));
  const stale = days > 7;
  let text;
  if (days < 1) text = 'Edited today';
  else if (days === 1) text = 'Edited yesterday';
  else if (days < 30) text = `Edited ${days} days ago`;
  else if (days < 60) text = 'Edited last month';
  else {
    const months = Math.floor(days / 30);
    if (months < 12) text = `Edited ${months} months ago`;
    else text = `Edited ${then.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}`;
  }
  return { text, stale };
}

export function renderCardHTML(creator, { forPDF = false, justCreated = false, justSaved = false, isOwner = false } = {}) {
  // Decay Rule calculation (7-day visual downgrade) — kept for back-compat,
  // but the visible decay signal now lives in the hero-bar freshness slot
  // (formatFreshness) rather than the old grey-out + .dated-badge band.
  const statsDate = creator.statsUpdatedAt ? new Date(creator.statsUpdatedAt) : null;
  const freshness = formatFreshness(creator.statsUpdatedAt);

  // Platform data — support both old (ig/tt/yt) and new (fb) structure
  const ig  = creator.platforms?.instagram || creator.platformsOld?.instagram || {};
  const tt  = creator.platforms?.tiktok    || creator.platformsOld?.tiktok    || {};
  const yt  = creator.platforms?.youtube   || creator.platformsOld?.youtube   || {};
  const fb  = creator.platforms?.facebook  || {};

  // Name split — first upright, last in italic (Cormorant Garamond).
  // Prefer nameDetails (from dedicated First name + Surname form fields)
  // over the legacy single-string whitespace split, which breaks on
  // compound surnames ("Van Wyk") and single-name entries.
  const firstName = esc(creator.nameDetails?.first || (creator.name || '').trim().split(' ')[0] || 'Your');
  const lastName  = esc(creator.nameDetails?.last  || (creator.name || '').trim().split(' ').slice(1).join(' ') || '');

  // Bio paragraphs — prefer new bioParagraphs[], fallback to bio string split
  const bioParagraphs = creator.bioParagraphs?.length
    ? creator.bioParagraphs
    : (creator.bio || '').split(/\r?\n/).map(p => p.trim()).filter(Boolean);

  // Bio pillars — new field
  const bioPillars = creator.bioPillars || [];

  // Cover reach stats — prefer new reach[], fallback to derived platform stats
  const reachStats = creator.reach?.length
    ? creator.reach
    : (() => {
        const s = [];
        if (fb.followers) s.push({ val: fmtNum(fb.followers) + '+', lbl: 'Facebook Followers' });
        else if (ig.followers) s.push({ val: fmtNum(ig.followers) + '+', lbl: 'Instagram Followers' });
        if (tt.followers) s.push({ val: fmtNum(tt.followers) + '+', lbl: 'TikTok Followers' });
        if (yt.followers) s.push({ val: fmtNum(yt.followers) + '+', lbl: 'YouTube Subscribers' });
        if (!s.length) s.push({ val: '—', lbl: 'Followers' });
        return s;
      })();

  // Active platform cells for stats section — support fb too
  const activePlatforms = [
    fb.followers || fb.handle ? { name: 'Facebook',  handle: fb.handle, big: fmtNum(fb.followers) + '+', unit: 'Followers', sub: fb.monthlyReach || '—', subLbl: 'Monthly Reach' } : null,
    tt.followers || tt.handle ? { name: 'TikTok',    handle: tt.handle, big: fmtNum(tt.followers) + '+', unit: 'Followers', sub: tt.monthlyReach || (tt.engagement ? tt.engagement + '%' : '—'), subLbl: tt.monthlyReach ? 'Monthly Reach' : 'Engagement' } : null,
    ig.followers || ig.handle ? { name: 'Instagram', handle: ig.handle, big: fmtNum(ig.followers) + '+', unit: 'Followers', sub: ig.monthlyReach || (ig.engagement ? ig.engagement + '%' : '—'), subLbl: ig.monthlyReach ? 'Monthly Reach' : 'Engagement' } : null,
    yt.followers || yt.handle ? { name: 'YouTube',   handle: yt.handle, big: fmtNum(yt.followers) + '+', unit: 'Subscribers', sub: yt.avgViews ? fmtNum(yt.avgViews) : '—', subLbl: 'Avg Views' } : null,
  ].filter(Boolean);

  // Audience — new field
  const audience = creator.audience || null;

  // Brands — support new evidence model
  const brands = creator.brands?.length ? creator.brands : (creator.workPreview || []).map(w => ({ name: w.brand, category: w.note, evidence: [] }));

  // Packages — new field
  const packages = creator.packages || [];

  // Rates — new nested structure
  const rateHourly = creator.rates?.hourly || 0;
  const ratePkgs = creator.rates?.packages || {};
  const rates = (creator.customRates || []);

  // Role / descriptor
  const role     = creator.niche    || 'Content Creator';
  const location = creator.location || '';

  const year = new Date(creator.createdAt || Date.now()).getFullYear();

  // Share-preview metadata: photo + name + tagline shown when the URL is
  // pasted into WhatsApp / iMessage / Twitter / Slack / LinkedIn.
  const kitTitle = `${firstName} ${lastName} · Media Kit`;
  const kitDesc = creator.tagline
    || (creator.bio || '').toString().trim().split(/\.\s|\n/)[0].slice(0, 200)
    || `Media kit for ${firstName} ${lastName}.`;
  const kitImage = creator.photo?.url ? absoluteUrl(creator.photo.url) : '';
  const kitUrl = absoluteUrl(`/c/${creator.id}`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(kitTitle)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${ogMeta({ title: kitTitle, description: kitDesc, image: kitImage, url: kitUrl, type: 'profile' })}
  <link rel="canonical" href="${esc(kitUrl)}">
  ${creatorJSONLD(creator)}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#0a0a0a">
  <style>${localFonts()}</style>
  <style>
    :root {
      --paper: #f0ece4;
      --sand:  #e6e0d8;
      --smoke: #c4bdb5;
      --dusk:  #6b6460;
      --deep:  #111111;
      --ink:   #0a0a0a;
      --white: #f8f5f0;
      --line:  #d8d2ca;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; overflow-x: hidden; }
    body {
      background: var(--paper);
      color: var(--deep);
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 300;
      font-size: 15px;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      max-width: 100%;
    }
    .eyebrow-light { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.28); }
    .eyebrow-dark  { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: var(--smoke); }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 2.5rem; }

    /* ── HERO ── */
    .hero { position: relative; height: 100svh; min-height: 560px; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
    .hero-photo-side { position: relative; overflow: hidden; }
    .hero-photo { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
    .hero-photo--empty { background: var(--deep); display: flex; align-items: center; justify-content: center; }
    .hero-text {
      background: var(--ink);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0 3rem 4rem 3.5rem;
      overflow: hidden;
    }
    .hero-text::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.3;
      pointer-events: none;
    }
    .hero-bar { position: absolute; top: 0; left: 0; right: 0; padding: 2rem 3.5rem; display: flex; justify-content: space-between; align-items: center; z-index: 2; }
    .kit-label { font-size: 0.56rem; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.09); padding: 0.32rem 0.75rem; border-radius: 100px; }
    /* Freshness slot — replaces the dim duplicate "CreatorHQ" wordmark.
       White at full opacity to read as a live signal to brands. A 6px dot
       sits left of the text: green for fresh (≤7d), amber when stale.    */
    .chq-fresh { display:inline-flex; align-items:center; gap:0.45rem; font-size: 0.6rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #fff; }
    .chq-fresh__dot { width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.18); }
    .chq-fresh--stale { color: #f59e0b; }
    .chq-fresh--stale .chq-fresh__dot { background:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,0.2); }
    @media print { .chq-fresh__dot { box-shadow:none; } }
    .hero-name { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(3rem, 5vw, 5.5rem); line-height: 0.92; color: var(--white); letter-spacing: -0.01em; position: relative; z-index: 2; }
    .hero-name em { font-style: italic; color: rgba(255,255,255,0.35); }
    .hero-rule { width: 24px; height: 1px; background: rgba(255,255,255,0.25); margin: 2rem 0 1.5rem; position: relative; z-index: 2; }
    .hero-descriptor { font-size: 0.66rem; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.28); line-height: 2; position: relative; z-index: 2; margin-bottom: 3rem; }
    .hero-reach { display: flex; gap: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.07); position: relative; z-index: 2; }
    .reach-num { font-family: 'Cormorant Garamond', serif; font-size: 1.9rem; font-weight: 300; color: var(--white); line-height: 1; }
    .reach-lbl { font-size: 0.54rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.18); margin-top: 0.3rem; }

    /* ── BIO ── */
    .bio-section { padding: 7rem 0; background: var(--paper); }
    .bio-inner { display: grid; grid-template-columns: 240px 1fr; gap: 5.5rem; align-items: start; }
    .bio-sidebar { position: sticky; top: 3rem; }
    .bio-title { font-family: 'Cormorant Garamond', serif; font-size: 2.8rem; font-weight: 300; line-height: 1.1; color: var(--deep); margin-top: 1.2rem; }
    .bio-title em { font-style: italic; color: var(--dusk); }
    .bio-rule { width: 22px; height: 1px; background: var(--deep); opacity: 0.2; margin: 1.8rem 0; }
    .bio-sidebar-sub { font-size: 0.72rem; color: var(--dusk); line-height: 1.9; }
    .bio-body p { font-size: 1rem; color: var(--dusk); line-height: 1.95; margin-bottom: 1.3rem; }

    /* ── STATS ── */
    .stats-section { background: var(--ink); padding: 6rem 0; }
    .stats-head { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .stats-title { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; font-weight: 300; color: var(--white); }
    .stats-title em { font-style: italic; color: rgba(255,255,255,0.25); }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.05); margin-top: 2.5rem; }
    .stats-row--1col { grid-template-columns: 1fr; }
    .stats-row--2col { grid-template-columns: repeat(2, 1fr); }
    .stats-row--3col { grid-template-columns: repeat(3, 1fr); }
    .stat-cell { background: var(--ink); padding: 3rem 2.5rem; }
    .stat-platform { font-size: 0.54rem; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 1.5rem; }
    .stat-handle { font-size: 1rem; color: rgba(255,255,255,0.5); margin-bottom: 1.5rem; }
    .stat-big { font-family: 'Cormorant Garamond', serif; font-size: 4rem; font-weight: 300; color: var(--white); line-height: 1; }
    .stat-unit { font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.18); margin-top: 0.3rem; }
    .stat-sep { width: 16px; height: 1px; background: rgba(255,255,255,0.08); margin: 1.5rem 0; }
    .stat-sub-val { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300; color: rgba(255,255,255,0.35); line-height: 1; }
    .stat-sub-lbl { font-size: 0.52rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.14); margin-top: 0.25rem; }

    /* ── BRANDS + RATES ── */
    /* ── RATES ── */
    .rates-section { padding: 5rem 0; background: var(--sand); }
    .rates-grid { display: grid; gap: 1px; background: var(--smoke); margin-top: 2.5rem; }
    .rates-grid--1col { grid-template-columns: 1fr; }
    .rates-grid--2col { grid-template-columns: repeat(2, 1fr); }
    .rates-grid--3col { grid-template-columns: repeat(3, 1fr); }
    .rates-grid--4col { grid-template-columns: repeat(4, 1fr); }
    .rate-cell { background: var(--sand); padding: 2rem 1.5rem; }
    .rate-type { font-size: 0.58rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dusk); margin-bottom: 1rem; }
    .rate-price { font-family: 'Cormorant Garamond', serif; font-size: 1.9rem; font-weight: 300; color: var(--deep); line-height: 1; }
    .rate-note { font-size: 0.62rem; color: var(--smoke); margin-top: 0.4rem; }

    /* ── AUDIENCE ── */
    .audience-section { padding: 7rem 0; background: var(--sand); }
    .aud-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 4rem; }
    .aud-col { padding-right: 4rem; }
    .aud-col--right { padding-left: 4rem; padding-right: 0; border-left: 1px solid var(--smoke); }
    .aud-label { font-size: 0.58rem; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; color: var(--dusk); margin-bottom: 1.2rem; }
    .aud-big { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 300; color: var(--deep); line-height: 1.2; margin-bottom: 1rem; }
    .aud-locs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 2.5rem; }
    .aud-loc { font-size: 0.67rem; color: var(--dusk); border: 1px solid var(--smoke); padding: 0.25rem 0.75rem; border-radius: 100px; }
    .aud-age { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; font-weight: 300; color: var(--deep); line-height: 1; }
    .aud-age-sub { font-size: 0.72rem; color: var(--dusk); margin-top: 0.5rem; }
    .aud-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 2rem; }
    .aud-tag { font-size: 0.67rem; background: rgba(0,0,0,0.07); color: var(--deep); padding: 0.28rem 0.8rem; border-radius: 100px; }
    .aud-note { font-size: 0.84rem; color: var(--dusk); line-height: 1.85; }

    .brands-section { padding: 7rem 0; background: var(--paper); }
    .brands-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: start; }
    .section-heading { font-family: 'Cormorant Garamond', serif; font-size: 1.9rem; font-weight: 300; color: var(--deep); line-height: 1.2; margin-top: 0.8rem; }
    .section-heading em { font-style: italic; color: var(--dusk); }
    .brands-list { margin-top: 2.5rem; }
    .brand-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-top: 1px solid var(--line); }
    .brand-row:last-child { border-bottom: 1px solid var(--line); }
    .brand-name { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300; color: var(--deep); }
    .brand-type { font-size: 0.58rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--smoke); }
    .rates-stack { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1px; background: var(--line); }
    .rate-pkg { background: var(--paper); padding: 1.8rem; display: grid; grid-template-columns: 1fr auto; align-items: start; gap: 1rem; transition: background 0.15s; }
    .rate-pkg:hover { background: #ede9e1; }
    .rate-pkg.highlight { background: var(--deep); }
    .rate-pkg.highlight:hover { background: #1a1a1a; }
    .rate-pkg__label { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 300; color: var(--deep); margin-bottom: 0.3rem; }
    .rate-pkg.highlight .rate-pkg__label { color: rgba(255,255,255,0.9); }
    .rate-pkg__note { font-size: 0.74rem; color: var(--dusk); }
    .rate-pkg.highlight .rate-pkg__note { color: rgba(255,255,255,0.45); }
    .rate-pkg__price { font-family: 'Cormorant Garamond', serif; font-size: 1.45rem; font-weight: 300; color: var(--deep); white-space: nowrap; text-align: right; }
    .rate-pkg.highlight .rate-pkg__price { color: rgba(255,255,255,0.7); }

    /* ── FOOTER ── */
    .footer { background: var(--ink); padding: 5rem 0 3rem; }
    .footer-inner { display: flex; align-items: flex-end; justify-content: space-between; }
    .footer-name { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 300; color: var(--white); line-height: 1; }
    .footer-name em { font-style: italic; color: rgba(255,255,255,0.22); }
    .footer-desc { font-size: 0.64rem; color: rgba(255,255,255,0.18); letter-spacing: 0.08em; margin-top: 0.8rem; }
    .footer-right { text-align: right; }
    .footer-cta { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-style: italic; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem; }
    .footer-contact { font-size: 0.66rem; color: rgba(255,255,255,0.2); line-height: 1.9; }
    .footer-bottom { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
    .footer-credit { font-size: 0.52rem; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.1); }
    .footer-credit span { color: rgba(255,255,255,0.22); }
    .footer-ts { font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.1); display: flex; align-items: center; gap: 0.5rem; }
    .ts-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.35); flex-shrink: 0; animation: blink 2.5s ease-in-out infinite; }

    /* ── ACTION BAR ── */
    #action-bar { position: fixed; bottom: 2rem; right: 2rem; z-index: 100; display: flex; align-items: center; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 0.5rem 0.75rem; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    #action-bar button { display: flex; align-items: center; gap: 0.45rem; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.7); font-family: 'Instrument Sans', sans-serif; font-size: 0.7rem; font-weight: 400; letter-spacing: 0.06em; padding: 0.3rem 0.6rem; border-radius: 100px; white-space: nowrap; transition: color 0.15s; }
    #action-bar button:hover { color: #fff; }
    .bar-divider { width: 1px; height: 14px; background: rgba(255,255,255,0.12); margin: 0 0.25rem; }

    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.25s; } .d3 { animation-delay: 0.4s; }

    /* ── MOBILE ── */
    @media (max-width: 720px) {
      /* ── Layout ── */
      .wrap { padding: 0 1.25rem; }

      /* ── Hero ── */
      .hero { grid-template-columns: 1fr; min-height: 0; }
      .hero-photo-side { height: auto; aspect-ratio: 4/5; min-height: 0; }
      .hero-text { padding: 2rem 1.5rem 3rem; min-height: auto; }
      .hero-name { font-size: 2.8rem; }
      .hero-reach { gap: 1.5rem; flex-wrap: wrap; }
      .hero-bar { padding: 1.5rem; }

      /* ── Bio ── */
      .bio-section { padding: 3.5rem 0; }
      .bio-inner { grid-template-columns: 1fr; gap: 2rem; }
      .bio-sidebar { position: static; }
      .bio-title { font-size: 2rem; }
      .pillar { grid-template-columns: 1fr; gap: 0.4rem; }

      /* ── Stats ── */
      .stats-section { padding: 3rem 0; }
      .stats-head { flex-direction: column; gap: 0.5rem; }
      .stats-row,
      .stats-row--1col,
      .stats-row--2col,
      .stats-row--3col { grid-template-columns: 1fr !important; }
      .stat-cell { padding: 2rem 1.5rem; }
      .stat-big { font-size: 3rem; }

      /* ── Audience ── */
      .audience-section { padding: 3.5rem 0; }
      .aud-grid { grid-template-columns: 1fr; }
      .aud-col { padding-right: 0; }
      .aud-col--right { padding-left: 0; border-left: none; border-top: 1px solid var(--smoke); padding-top: 2rem; margin-top: 2rem; }

      /* ── Brands + Packages ── */
      .brands-section { padding: 3.5rem 0; }
      .brands-inner { grid-template-columns: 1fr; gap: 2.5rem; }

      /* ── Rates ── */
      .rates-grid { grid-template-columns: 1fr 1fr !important; }
      .rate-cell { padding: 1.2rem 1rem; }
      .rate-price { font-size: 1.3rem; }
      .rate-type { font-size: 0.52rem; }

      /* ── Footer ── */
      .footer { padding: 3rem 0 6rem; }
      .footer-inner { flex-direction: column; align-items: flex-start; gap: 2rem; }
      .footer-right { text-align: left; }
      .footer-bottom { flex-direction: column; align-items: flex-start; gap: 0.8rem; }
      .footer-name { font-size: 1.8rem; }

      /* Footer gets extra bottom padding on mobile so the floating action bar
         doesn't sit on top of the timestamp / credit when the user reaches it. */

      /* ── Action bar mobile ── */
      /* The action bar grew an Edit pill, so on narrow phones we let it
         scroll horizontally inside its container rather than wrap or clip. */
      #action-bar {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        padding: 0.4rem 0.6rem;
        max-width: calc(100vw - 2rem);
        overflow-x: auto;
        scrollbar-width: none;
        justify-content: flex-start;
      }
      #action-bar::-webkit-scrollbar { display: none; }
      #action-bar button, #action-bar a { font-size: 0.68rem; padding: 0.3rem 0.55rem; }

      /* ── Prevent overflow ── */
      .hero, .bio-section, .stats-section, .brands-section, .footer { overflow-x: hidden; }
    }
  </style>
</head>
<body>

${forPDF ? '' : renderSiteHeader({ current: 'kit' })}

${(!forPDF && justCreated) ? renderCreatedBanner(creator, 'Media kit') : ''}
${(!forPDF && justSaved && !justCreated) ? renderSavedBanner() : ''}

<!-- ── HERO / COVER ── -->
<header class="hero">
  <div class="hero-photo-side">
    ${creator.photo?.url
      ? `<img class="hero-photo" src="${esc(creator.photo.url)}" alt="${firstName} ${lastName}">`
      : `<div class="hero-photo--empty"></div>`}
  </div>
  <div class="hero-text">
    <div class="hero-bar">
      <span class="kit-label">Media Kit · ${year}</span>
      ${freshness
        ? `<span class="chq-fresh${freshness.stale ? ' chq-fresh--stale' : ''}" title="${esc(statsDate ? statsDate.toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' }) : '')}">
            <span class="chq-fresh__dot" aria-hidden="true"></span>
            <span>${esc(freshness.stale ? 'Outdated · ' + freshness.text : freshness.text)}</span>
          </span>`
        : `<span class="chq-fresh"><span class="chq-fresh__dot" aria-hidden="true"></span><span>New</span></span>`}
    </div>
    <div class="hero-name fade-up d1">${firstName}<br><em>${lastName}</em></div>
    <div class="hero-rule fade-up d2"></div>
    <div class="hero-descriptor fade-up d2">
      ${esc(role)}${location ? `<br>${esc(location)}` : ''}
    </div>
    ${reachStats.length > 0 ? `
    <div class="hero-reach fade-up d3">
      ${reachStats.slice(0, 3).map(r => `
      <div>
        <div class="reach-num">${esc(r.val)}</div>
        <div class="reach-lbl">${esc(r.lbl)}</div>
      </div>`).join('')}
    </div>` : ''}
  </div>
</header>

<!-- ── BIO ── -->
<section class="bio-section">
  <div class="wrap">
    <div class="bio-inner">
      <div class="bio-sidebar">
        <div class="eyebrow-dark">About</div>
        <div class="bio-title">
          ${creator.tagline
            ? esc(creator.tagline).split(',').map((t, i) => i === 0 ? t.trim() + '.' : `<em>${t.trim()}.</em>`).join('<br>')
            : `${firstName}.<br><em>${lastName}.</em>`}
        </div>
        <div class="bio-rule"></div>
        <div class="bio-sidebar-sub">${esc(role)}${location ? `<br>${esc(location)}` : ''}</div>
      </div>
      <div class="bio-body">
        ${bioParagraphs.length > 0
          ? bioParagraphs.map(p => `<p>${esc(p)}</p>`).join('')
          : `<p>Content creator based in ${esc(location || 'South Africa')}.</p>`}
        ${bioPillars.length > 0 ? `
        <div style="margin-top:3.5rem;">
          ${bioPillars.map((pillar, i) => `
          <div style="padding:1.6rem 0;border-top:1px solid var(--line);${i === bioPillars.length - 1 ? 'border-bottom:1px solid var(--line);' : ''}display:grid;grid-template-columns:160px 1fr;gap:2rem;align-items:start;">
            <div style="font-size:0.64rem;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:var(--smoke);padding-top:0.15rem;">${esc(pillar.label)}</div>
            <div style="font-size:0.84rem;color:var(--dusk);line-height:1.8;">${esc(pillar.text)}</div>
          </div>`).join('')}
        </div>` : ''}
      </div>
    </div>
  </div>
</section>

<!-- ── STATS ── -->
${activePlatforms.length > 0 ? `
<section class="stats-section">
  <div class="wrap">
    <div class="stats-head">
      <div class="eyebrow-light">Social Footprint</div>
      <div class="stats-title">Numbers <em>that move brands.</em></div>
    </div>
    <div class="stats-row stats-row--${activePlatforms.length}col">
      ${activePlatforms.map(p => `
      <div class="stat-cell">
        <div class="stat-platform">${esc(p.name)}</div>
        ${p.handle ? `<div class="stat-handle">${esc(p.handle)}</div>` : ''}
        <div class="stat-big">${esc(p.big)}</div>
        <div class="stat-unit">${esc(p.unit)}</div>
        <div class="stat-sep"></div>
        <div class="stat-sub-val">${esc(p.sub)}</div>
        <div class="stat-sub-lbl">${esc(p.subLbl)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>` : ''}

<!-- ── BRANDS + PACKAGES ── -->
<section class="brands-section">
  <div class="wrap">
    <div class="brands-inner">
      <div>
        <div class="eyebrow-dark">Worked With</div>
        <div class="section-heading">Brands that<br><em>trust the culture.</em></div>
        ${brands.length > 0 ? `
        <div class="brands-list">
          ${brands.map((b, i) => `
          <div class="brand-row" onclick="toggleEvidence(${i})">
            <div>
              <span class="brand-name">${esc(b.name || b.brand)}</span>
              ${b.category || b.note ? `<span class="brand-type" style="margin-left: 0.5rem; color: var(--smoke); font-size: 0.6rem;">${esc(b.category || b.note)}</span>` : ''}
            </div>
            ${b.evidence?.length ? `<span class="eyebrow-dark" style="font-size:0.5rem;opacity:0.5">${b.evidence.length} Clips</span>` : ''}
          </div>
          ${b.evidence?.length ? `
          <div id="evidence-${i}" class="brand-evidence">
            ${b.evidence.map(link => `<a href="${esc(link)}" target="_blank" rel="noopener" class="evidence-link">↗ ${esc(platformLabel(link))}</a>`).join('')}
          </div>` : ''}`).join('')}
        </div>` : `<p style="margin-top:2rem;font-size:0.84rem;color:var(--dusk);">Add brand collaborations when editing your card.</p>`}
      </div>
      <div>
        <div class="eyebrow-dark">Collaboration Packages</div>
        <div class="section-heading">What we can<br><em>build together.</em></div>
        ${packages.length > 0 ? `
        <div class="rates-stack">
          ${packages.map(p => `
          <div class="rate-pkg${p.highlight ? ' highlight' : ''}">
            <div>
              <div class="rate-pkg__label">${esc(p.name)}</div>
              ${p.description ? `<div class="rate-pkg__note">${esc(p.description).replace(/\n/g, ' · ')}</div>` : ''}
            </div>
            <div class="rate-pkg__price">${esc(p.price)}</div>
          </div>`).join('')}
        </div>` : rateHourly || Object.values(ratePkgs).some(v => v > 0) ? `
        <div class="rates-stack">
          ${rateHourly ? `
          <div class="rate-pkg">
            <div><div class="rate-pkg__label">Hourly Rate</div></div>
            <div class="rate-pkg__price">${esc(fmtCurrency(rateHourly))}</div>
          </div>` : ''}
          ${Object.entries(ratePkgs).filter(([_, v]) => v > 0).map(([k, v]) => `
          <div class="rate-pkg ${k === '3h' ? 'highlight' : ''}">
            <div><div class="rate-pkg__label">${k.toUpperCase()} Shoot</div></div>
            <div class="rate-pkg__price">${esc(fmtCurrency(v))}</div>
          </div>`).join('')}
        </div>` : rates.length > 0 ? `
        <div class="rates-stack">
          ${rates.map((r, i) => `
          <div class="rate-pkg${i === 1 ? ' highlight' : ''}">
            <div>
              <div class="rate-pkg__label">${esc(r.label)}</div>
              ${r.note ? `<div class="rate-pkg__note">${esc(r.note)}</div>` : ''}
            </div>
            <div class="rate-pkg__price">${esc(fmtCurrency(r.amount))}</div>
          </div>`).join('')}
        </div>` : `<p style="margin-top:2rem;font-size:0.84rem;color:var(--dusk);">Add your packages when editing your card.</p>`}
      </div>
    </div>
  </div>
</section>

<!-- ── STANDARD RATES ── -->
${rates.length > 0 ? `
<section class="rates-section">
  <div class="wrap">
    <div class="eyebrow-dark">Standard Rates</div>
    <div class="rates-grid rates-grid--${Math.min(rates.length,4)}col">
      ${rates.map(r => `
      <div class="rate-cell">
        <div class="rate-type">${esc(r.label)}</div>
        <div class="rate-price">${esc(fmtCurrency(r.amount))}</div>
        ${r.note ? `<div class="rate-note">${esc(r.note)}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>` : ''}

<!-- ── AUDIENCE ── -->
${audience ? `
<section class="audience-section">
  <div class="wrap">
    <div class="eyebrow-dark">Who's Watching</div>
    <div class="aud-grid">
      <div class="aud-col">
        <div class="aud-label">Primary Region</div>
        <div class="aud-big">${esc(audience.primaryRegion || 'South Africa')}</div>
        ${audience.locations?.length ? `<div class="aud-locs">${audience.locations.map(l => `<span class="aud-loc">${esc(l)}</span>`).join('')}</div>` : ''}
        ${audience.ageGroup ? `
        <div class="aud-label" style="margin-top:1.5rem;">Core Age Group</div>
        <div class="aud-age">${esc(audience.ageGroup)}</div>
        <div class="aud-age-sub">${esc(audience.ageLabel || '')}</div>` : ''}
      </div>
      <div class="aud-col aud-col--right">
        <div class="aud-label">Audience Interests</div>
        ${audience.interests?.length ? `<div class="aud-tags">${audience.interests.map(t => `<span class="aud-tag">${esc(t)}</span>`).join('')}</div>` : ''}
        ${audience.note ? `<div class="aud-note">${esc(audience.note)}</div>` : ''}
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ── FOOTER ── -->
<footer class="footer">
  <div class="wrap">
    <div class="footer-inner">
      <div>
        <div class="footer-name">${firstName} <em>${lastName}</em></div>
        <div class="footer-desc">${esc(role)}${location ? ` · ${esc(location)}, South Africa` : ''}</div>
      </div>
      <div class="footer-right">
        <div class="footer-cta">Let's build something real.</div>
        ${creator.email ? `<div class="footer-contact">${esc(creator.email)}</div>` : ''}
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-credit">Generated by <span>CreatorHQ</span></div>
      <div class="footer-ts">
        <div class="ts-dot"></div>
        <span id="ts-text"></span>
      </div>
    </div>
  </div>
</footer>

<!-- ── FLOATING ACTION BAR ── -->
<!--
  Owner-control affordances are stacked left-to-right in order of share-then-edit
  intent: Copy Link first (you came here to share), Edit second (this is your kit,
  here is how to update it), Rate Card third (cross-nav to the other view),
  Download PDF last (the export). On mobile this scrolls horizontally inside the
  pill if needed; on desktop it sits bottom-right of the viewport.
-->
<div id="action-bar">
  <button id="copy-btn" onclick="copyLink()">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    <span>Copy Link</span>
  </button>
  ${isOwner ? `<div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}/edit" style="display:flex;align-items:center;gap:0.45rem;color:rgba(255,255,255,0.7);text-decoration:none;font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;padding:0.3rem 0.6rem;border-radius:100px;white-space:nowrap;transition:color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    <span>Edit</span>
  </a>
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}?as=visitor" title="See your kit the way a visitor sees it" style="display:flex;align-items:center;gap:0.45rem;color:rgba(255,255,255,0.7);text-decoration:none;font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;padding:0.3rem 0.6rem;border-radius:100px;white-space:nowrap;transition:color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    <span>As Visitor</span>
  </a>
  <div class="bar-divider"></div>
  <form method="post" action="/c/${esc(creator.id)}/signout" style="margin:0;padding:0;display:flex;">
    <button type="submit" title="Stop editing on this device" style="display:flex;align-items:center;gap:0.45rem;color:rgba(255,255,255,0.55);font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;padding:0.3rem 0.6rem;border-radius:100px;white-space:nowrap;transition:color 0.15s;background:none;border:none;cursor:pointer;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.55)'">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      <span>Sign out</span>
    </button>
  </form>` : ''}
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}/rate-card" style="display:flex;align-items:center;gap:0.45rem;color:rgba(255,255,255,0.7);text-decoration:none;font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;padding:0.3rem 0.6rem;border-radius:100px;white-space:nowrap;transition:color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
    Rate Card →
  </a>
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}/pdf" target="_blank" rel="noopener" id="pdf-btn" style="display:flex;align-items:center;gap:0.45rem;color:rgba(255,255,255,0.7);font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;text-decoration:none;padding:0.3rem 0.6rem;border-radius:100px;white-space:nowrap;transition:color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    <span>Download PDF</span>
  </a>
</div>

${renderNudge(creator)}

<script>
  // Timestamp
  function tick() {
    const now = new Date();
    document.getElementById('ts-text').textContent = 'Live · ' + now.toLocaleString('en-ZA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Africa/Johannesburg', timeZoneName: 'short'
    });
  }
  tick();
  setInterval(tick, 60000);

  // Copy link
  function copyLink() {
    const btn = document.getElementById('copy-btn');
    navigator.clipboard.writeText(window.location.href).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 18 4 13"></polyline></svg><span>Copied</span>';
      setTimeout(() => btn.innerHTML = orig, 2000);
    });
  }

  // PDF: opens /c/${esc(creator.id)}/pdf in a new tab.
  // That route serves renderPDFHTML which auto-triggers html2canvas + jsPDF on load.
</script>
</body>
</html>`;
}

// ---- Dedicated PDF Layout (A4, 3-page, Puppeteer-rendered) ----
// This is NOT the web view. Purpose-built for print/email delivery.
// Page 1: Cover — photo + dark panel
// Page 2: Bio + pillars + dark stats strip
// Page 3: Audience + Brands + Packages + Rates + Footer

export function renderPDFHTML(creator, photoBase64 = null) {
  const firstName = esc(creator.nameDetails?.first || (creator.name || '').trim().split(' ')[0] || 'Your');
  const lastName  = esc(creator.nameDetails?.last  || (creator.name || '').trim().split(' ').slice(1).join(' ') || '');
  const role      = creator.niche    || 'Digital Content Creator';
  const subtitle  = creator.subtitle || '';
  const location  = creator.location || '';
  const year      = new Date(creator.createdAt || Date.now()).getFullYear();

  const bioParagraphs = creator.bioParagraphs?.length
    ? creator.bioParagraphs
    : (creator.bio || '').split(/\r?\n/).map(p => p.trim()).filter(Boolean);
  const bioPillars = creator.bioPillars || [];

  const reach = creator.reach || [];

  const fb  = creator.platforms?.facebook  || {};
  const tt  = creator.platforms?.tiktok    || {};
  const ig  = creator.platforms?.instagram || {};

  const statPlatforms = [
    fb.followers ? { name: 'Facebook',  big: fmtNum(fb.followers) + '+', unit: 'Followers', sub: fb.monthlyReach || '—', subLbl: 'Monthly Reach' } : null,
    tt.followers ? { name: 'TikTok',    big: fmtNum(tt.followers) + '+', unit: 'Followers', sub: tt.monthlyReach || '—', subLbl: 'Monthly Reach' } : null,
    ig.followers ? { name: 'Instagram', big: fmtNum(ig.followers) + '+', unit: 'Followers', sub: ig.monthlyReach || '—', subLbl: 'Monthly Reach' } : null,
  ].filter(Boolean);

  const audience = creator.audience || null;
  const brands   = creator.brands?.length
    ? creator.brands.map(b => ({ brand: b.name, note: b.category }))
    : (creator.workPreview || []);
  const packages   = creator.packages   || [];
  const rates      = creator.customRates || []; // customRates is the [{label,amount}] array

  // Tagline display: "From Tembisa. For everyone." →
  //   "From <em>Tembisa.</em><br>For everyone."
  const tagStr = creator.tagline || '';
  let taglineDisplay;
  if (tagStr.startsWith('From ')) {
    const firstDot = tagStr.indexOf('.');
    const locPart  = esc(tagStr.slice(5, firstDot >= 0 ? firstDot : undefined));
    const restPart = firstDot >= 0 ? esc(tagStr.slice(firstDot + 1).trim()) : '';
    taglineDisplay = `From <em>${locPart}.</em>${restPart ? `<br>${restPart}` : ''}`;
  } else {
    const parts = tagStr.split(/\.\s+/);
    taglineDisplay = parts.map((p, i) => {
      const t = esc(p) + (i < parts.length - 1 ? '.' : '');
      return i === 0 ? `<em>${t}</em>` : t;
    }).join('<br>');
  }

  // Role labels: niche + subtitle split on · or -
  const roles = [
    creator.niche,
    ...(creator.subtitle?.split(/[·\-]/).map(s => s.trim()).filter(Boolean) || [])
  ].filter(Boolean);

  // Location tags: audience.locations names + city from creator.location
  const cityFromLocation = location ? location.split(',')[0].trim() : '';
  const locNames = (audience?.locations || []).map(l => typeof l === 'object' ? l.name : String(l));
  const locationTags = [...(cityFromLocation ? [cityFromLocation] : []), ...locNames]
    .filter((v, i, a) => v && a.indexOf(v) === i); // deduplicate

  const photoSrc = photoBase64 || (creator.photo?.url ? esc(creator.photo.url) : '');

  // Paper-first content limits — PDF is a teaser, not a transcript
  const bioShort = (() => {
    const full = bioParagraphs.join(' ');
    return full.length > 200 ? full.slice(0, 200) + '…' : full;
  })();
  const brandsLine    = brands.slice(0, 5).map(b => esc(b.brand)).join(' · ');
  const ratesGrid     = rates.slice(0, 4);
  const packagesShort = packages.slice(0, 2);

  // Contact fields for footer — strip leading @ so we control the prefix
  const igHandle     = (creator.platforms?.instagram?.handle || '').replace(/^@/, '');
  const ttHandle     = (creator.platforms?.tiktok?.handle    || '').replace(/^@/, '');
  const contactEmail = creator.email || creator.contact?.email || '';
  const contactWa    = creator.contact?.whatsapp || creator.contact?.phone || '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    ${localFonts()}

    :root {
      --paper: #f0ece4;
      --sand:  #e6e0d8;
      --smoke: #c4bdb5;
      --dusk:  #6b6460;
      --deep:  #111111;
      --ink:   #0a0a0a;
      --white: #f8f5f0;
      --line:  #d8d2ca;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: #888; }
    body { font-family: 'Instrument Sans', sans-serif; font-weight: 300; color: var(--deep); -webkit-font-smoothing: antialiased; }

    @page { size: A4 portrait; margin: 0; }

    /* ── SINGLE A4 PAGE — 794×1123px ──
       6 horizontal bands summing to exactly 1123px:
       Hero(390) + Bio(155) + Audience(145) + Rates(165) + Packages(165) + Footer(103) = 1123 */
    .page {
      width: 794px;
      height: 1123px;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* ── PLACEHOLDER utility ── */
    .ph {
      font-size: 6.5pt;
      font-style: italic;
      color: var(--smoke);
      border: 1px dashed var(--line);
      padding: 7px 10px;
      border-radius: 2px;
      line-height: 1.4;
    }
    .ph--dark {
      color: rgba(255,255,255,0.18);
      border-color: rgba(255,255,255,0.1);
    }

    /* ═══════════════════════════════════════
       BAND 1 — HERO STRIP (390px)
       Photo left (317px) · Info right (477px)
    ════════════════════════════════════════ */
    .hero-strip {
      height: 390px;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: 317px 1fr;
      overflow: hidden;
    }
    .hero-photo {
      width: 317px;
      height: 390px;
      overflow: hidden;
      background: var(--deep);
      background-size: cover;
      background-position: center top;
      background-repeat: no-repeat;
      position: relative;
    }
    .hero-initials {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cormorant Garamond', serif;
      font-size: 64pt;
      font-weight: 300;
      color: rgba(255,255,255,0.12);
      letter-spacing: -0.02em;
    }
    .hero-panel {
      background: var(--ink);
      display: flex;
      flex-direction: column;
      padding: 26px 32px;
      overflow: hidden;
    }
    .hero-kit-tag {
      font-size: 5.5pt;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 3px 9px;
      border-radius: 100px;
      display: inline-block;
      align-self: flex-start;
    }
    .hero-name {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 40pt;
      line-height: 0.95;
      color: var(--white);
      letter-spacing: -0.01em;
      margin-top: auto;
      margin-bottom: 10px;
    }
    .hero-name em { font-style: italic; color: rgba(255,255,255,0.28); }
    .hero-rule { width: 16px; height: 1px; background: rgba(255,255,255,0.18); margin-bottom: 9px; }
    .hero-descriptor {
      font-size: 5.5pt;
      font-weight: 400;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.22);
      line-height: 2.1;
      margin-bottom: 16px;
    }
    .hero-stats {
      display: flex;
      gap: 20px;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .hero-stat-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16pt;
      font-weight: 300;
      color: var(--white);
      line-height: 1;
    }
    .hero-stat-lbl {
      font-size: 5pt;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.14);
      margin-top: 3px;
    }

    /* ═══════════════════════════════════════
       BAND 2 — BIO (155px, paper)
       Tagline left · Bio text right
    ════════════════════════════════════════ */
    .bio-band {
      height: 155px;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: 42% 58%;
      background: var(--paper);
      border-top: 1px solid var(--line);
      overflow: hidden;
    }
    .bio-band__left {
      padding: 18px 18px 14px 32px;
      border-right: 1px solid var(--line);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .bio-band__right {
      padding: 18px 32px 14px 18px;
      overflow: hidden;
    }
    .band-eyebrow {
      font-size: 5pt;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--smoke);
      margin-bottom: 8px;
    }
    .bio-tagline {
      font-family: 'Cormorant Garamond', serif;
      font-size: 19pt;
      font-weight: 300;
      line-height: 1.06;
      color: var(--deep);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .bio-tagline em { font-style: italic; color: var(--dusk); }
    .bio-text {
      font-size: 7.5pt;
      color: var(--dusk);
      line-height: 1.8;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      margin-bottom: 8px;
    }
    .bio-pillars {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .bio-pillar-tag {
      font-size: 5pt;
      color: var(--dusk);
      border: 1px solid var(--line);
      padding: 2px 7px;
      border-radius: 100px;
    }

    /* ═══════════════════════════════════════
       BAND 3 — AUDIENCE (145px, sand)
       Region + age left · Interests + brands right
    ════════════════════════════════════════ */
    .aud-band {
      height: 145px;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: var(--sand);
      border-top: 1px solid rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .aud-band__left {
      padding: 16px 16px 12px 32px;
      border-right: 1px solid rgba(0,0,0,0.07);
      overflow: hidden;
    }
    .aud-band__right {
      padding: 16px 32px 12px 16px;
      overflow: hidden;
    }
    .aud-region {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17pt;
      font-weight: 300;
      color: var(--deep);
      line-height: 1;
      margin-bottom: 5px;
    }
    .aud-loc-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 7px; }
    .aud-loc-tag {
      font-size: 5pt;
      color: var(--dusk);
      border: 1px solid rgba(0,0,0,0.14);
      padding: 2px 6px;
      border-radius: 100px;
    }
    .aud-age {
      font-family: 'Cormorant Garamond', serif;
      font-size: 19pt;
      font-weight: 300;
      color: var(--deep);
      line-height: 1;
    }
    .aud-age-lbl { font-size: 5.5pt; color: var(--dusk); margin-top: 2px; }
    .aud-interest-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 8px; }
    .aud-interest-tag {
      font-size: 5pt;
      background: rgba(0,0,0,0.07);
      color: var(--deep);
      padding: 2px 6px;
      border-radius: 100px;
    }
    .aud-brands-lbl {
      font-size: 5pt;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--smoke);
      margin-bottom: 3px;
    }
    .aud-brands-names { font-size: 6pt; color: var(--dusk); line-height: 1.65; }

    /* ═══════════════════════════════════════
       BAND 4 — RATES (165px, paper)
       4-column rate menu across full width
    ════════════════════════════════════════ */
    .rates-band {
      height: 165px;
      flex-shrink: 0;
      background: var(--paper);
      border-top: 1px solid var(--line);
      padding: 18px 32px 14px;
      overflow: hidden;
    }
    .rates-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 1px;
      background: var(--line);
      margin-top: 10px;
    }
    .rate-cell {
      background: var(--paper);
      padding: 13px 14px 11px;
    }
    .rate-cell.ph-cell { background: var(--paper); opacity: 0.4; }
    .rate-type {
      font-size: 5pt;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--dusk);
      margin-bottom: 6px;
    }
    .rate-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15pt;
      font-weight: 300;
      color: var(--deep);
      line-height: 1;
    }
    .rate-note { font-size: 4.5pt; color: var(--smoke); margin-top: 2px; }

    /* ═══════════════════════════════════════
       BAND 5 — PACKAGES (165px, dark)
       2-column package cards on dark ground
    ════════════════════════════════════════ */
    .pkg-band {
      height: 165px;
      flex-shrink: 0;
      background: var(--deep);
      border-top: 1px solid rgba(255,255,255,0.05);
      padding: 18px 32px 14px;
      overflow: hidden;
    }
    .pkg-eyebrow {
      font-size: 5pt;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.18);
      margin-bottom: 10px;
    }
    .pkg-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: rgba(255,255,255,0.08);
    }
    .pkg-card {
      background: var(--deep);
      padding: 11px 14px;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: 8px;
      overflow: hidden;
    }
    .pkg-card.highlight { background: rgba(255,255,255,0.05); }
    .pkg__name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10pt;
      font-weight: 300;
      color: rgba(255,255,255,0.82);
      margin-bottom: 3px;
    }
    .pkg__desc { font-size: 5.5pt; color: rgba(255,255,255,0.45); line-height: 1.55; }
    .pkg__price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10pt;
      font-weight: 300;
      color: rgba(255,255,255,0.65);
      white-space: nowrap;
      text-align: right;
    }

    /* ═══════════════════════════════════════
       BAND 6 — FOOTER COLOPHON (103px, darkest)
    ════════════════════════════════════════ */
    .pdf-footer {
      height: 103px;
      flex-shrink: 0;
      background: var(--ink);
      border-top: 1px solid rgba(255,255,255,0.04);
      padding: 16px 32px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
    }
    .pdf-footer__name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14pt;
      font-weight: 300;
      color: var(--white);
      line-height: 1;
    }
    .pdf-footer__name em { font-style: italic; color: rgba(255,255,255,0.2); }
    .pdf-footer__desc { font-size: 5.5pt; color: rgba(255,255,255,0.15); margin-top: 4px; letter-spacing: 0.05em; }
    .pdf-footer__mid { text-align: center; }
    .pdf-footer__cta {
      font-family: 'Cormorant Garamond', serif;
      font-size: 9pt;
      font-style: italic;
      color: rgba(255,255,255,0.35);
      margin-bottom: 6px;
    }
    .pdf-footer__right { text-align: right; }
    .pdf-footer__contact { font-size: 6.5pt; color: rgba(255,255,255,0.70); margin-bottom: 4px; letter-spacing: 0.02em; }
    .pdf-footer__handle  { font-size: 5.5pt; color: rgba(255,255,255,0.45); margin-bottom: 2px; letter-spacing: 0.04em; }
    .pdf-footer__meta { font-size: 4pt; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.08); margin-top: 4px; }
    .pdf-footer__meta span { color: rgba(255,255,255,0.12); }
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════
     SINGLE A4 PAGE — 6 HORIZONTAL BANDS
     Hero(390) + Bio(155) + Audience(145) + Rates(165) + Packages(165) + Footer(103) = 1123px
════════════════════════════════════════ -->
<div class="page" id="page1">

  <!-- ── BAND 1: HERO STRIP (390px) ── -->
  <div class="hero-strip">

    <!-- Photo panel (317px) — background-image so html2canvas respects cover crop -->
    <div class="hero-photo"${photoSrc ? ` style="background-image:url('${photoSrc}')"` : ''}>
      ${!photoSrc
        ? `<div class="hero-initials">${firstName ? firstName[0].toUpperCase() : ''}${lastName ? lastName[0].toUpperCase() : ''}</div>`
        : ''
      }
    </div>

    <!-- Info panel (477px) -->
    <div class="hero-panel">
      <span class="hero-kit-tag">Media Kit · ${year}</span>
      <div class="hero-name">${firstName}${lastName ? `<br><em>${lastName}</em>` : ''}</div>
      <div class="hero-rule"></div>
      <div class="hero-descriptor">${esc(role)}${subtitle ? `<br>${esc(subtitle)}` : ''}${location ? `<br>${esc(location)}` : ''}</div>
      ${reach.length > 0
        ? `<div class="hero-stats">
            ${reach.slice(0, 3).map(r => `
            <div>
              <div class="hero-stat-num">${esc(r.val)}</div>
              <div class="hero-stat-lbl">${esc(r.lbl)}</div>
            </div>`).join('')}
          </div>`
        : `<div class="ph ph--dark">Add platform stats to show your reach.</div>`
      }
    </div>
  </div>

  <!-- ── BAND 2: BIO (155px) ── -->
  <div class="bio-band">
    <div class="bio-band__left">
      <div class="band-eyebrow">About</div>
      ${creator.tagline
        ? `<div class="bio-tagline">${taglineDisplay}</div>`
        : `<div class="ph">Add a tagline — your creative identity in one line.</div>`
      }
    </div>
    <div class="bio-band__right">
      ${bioShort
        ? `<div class="bio-text">${esc(bioShort)}</div>`
        : `<div class="ph">Add a bio to tell brands your story.</div>`
      }
      ${bioPillars.length > 0
        ? `<div class="bio-pillars">
            ${bioPillars.slice(0, 4).map(p => `<span class="bio-pillar-tag">${esc(p.label || p.text || p)}</span>`).join('')}
          </div>`
        : ''
      }
    </div>
  </div>

  <!-- ── BAND 3: AUDIENCE (145px) ── -->
  <div class="aud-band">
    <div class="aud-band__left">
      <div class="band-eyebrow">Audience</div>
      ${audience?.primaryRegion || locationTags.length
        ? `<div class="aud-region">${esc(audience?.primaryRegion || locationTags[0] || 'South Africa')}</div>
           ${locationTags.length
             ? `<div class="aud-loc-tags">${locationTags.slice(0, 3).map(t => `<span class="aud-loc-tag">${esc(t)}</span>`).join('')}</div>`
             : ''
           }
           ${audience?.ageGroup
             ? `<div class="aud-age">${esc(audience.ageGroup)}</div>
                <div class="aud-age-lbl">${esc(audience.ageLabel || 'Core age group')}</div>`
             : ''
           }`
        : `<div class="ph">Add your audience region and demographics.</div>`
      }
    </div>
    <div class="aud-band__right">
      ${audience?.interests?.length
        ? `<div class="band-eyebrow">Interests</div>
           <div class="aud-interest-tags">
             ${audience.interests.slice(0, 5).map(t => `<span class="aud-interest-tag">${esc(t)}</span>`).join('')}
           </div>`
        : `<div class="ph">Add audience interests to attract aligned brands.</div>`
      }
      ${brandsLine
        ? `<div class="aud-brands-lbl">Worked With</div>
           <div class="aud-brands-names">${brandsLine}</div>`
        : `<div class="ph" style="margin-top:8px;">Brands you've worked with will appear here.</div>`
      }
    </div>
  </div>

  <!-- ── BAND 4: RATES (165px) ── -->
  <div class="rates-band">
    <div class="band-eyebrow">Content Rates</div>
    <div class="rates-grid">
      ${ratesGrid.length > 0
        ? ratesGrid.map(r => `
          <div class="rate-cell">
            <div class="rate-type">${esc(r.label)}</div>
            <div class="rate-price">${esc(fmtCurrency(r.amount))}</div>
            ${r.note ? `<div class="rate-note">${esc(r.note)}</div>` : ''}
          </div>`).join('')
        : `<div class="rate-cell ph-cell" style="grid-column:1/-1;">
             <div class="ph">Set your rates — brands need to know your value.</div>
           </div>`
      }
      ${ratesGrid.length > 0 && ratesGrid.length < 4
        ? Array(4 - ratesGrid.length).fill(0).map(() => `
          <div class="rate-cell ph-cell">
            <div class="rate-type" style="opacity:0.4;">—</div>
            <div class="rate-price" style="opacity:0.2;">—</div>
          </div>`).join('')
        : ''
      }
    </div>
  </div>

  <!-- ── BAND 5: PACKAGES (165px) ── -->
  <div class="pkg-band">
    <div class="pkg-eyebrow">Collaboration Packages</div>
    <div class="pkg-grid">
      ${packagesShort.length > 0
        ? packagesShort.map((p, i) => `
          <div class="pkg-card${i === 0 ? ' highlight' : ''}">
            <div>
              <div class="pkg__name">${esc(p.name)}</div>
              ${p.description ? `<div class="pkg__desc">${esc(p.description.replace(/\n/g, ' · ').slice(0, 90))}</div>` : ''}
            </div>
            <div class="pkg__price">${esc(p.price || '—')}</div>
          </div>`).join('')
        : `<div class="pkg-card" style="grid-column:1/-1;">
             <div class="ph ph--dark">Add collaboration packages — give brands ready-made options.</div>
           </div>`
      }
      ${packagesShort.length === 1
        ? `<div class="pkg-card">
             <div><div class="ph ph--dark">Add a second package.</div></div>
           </div>`
        : ''
      }
    </div>
  </div>

  <!-- ── BAND 6: FOOTER COLOPHON (103px) ── -->
  <div class="pdf-footer">
    <div>
      <div class="pdf-footer__name">${firstName}${lastName ? ` <em>${lastName}</em>` : ''}</div>
      <div class="pdf-footer__desc">${esc(role)}${location ? ` · ${esc(location)}` : ''}</div>
    </div>
    <div class="pdf-footer__mid">
      <div class="pdf-footer__cta">Let's build something real.</div>
    </div>
    <div class="pdf-footer__right">
      ${contactEmail
        ? `<div class="pdf-footer__contact">${esc(contactEmail)}</div>`
        : `<div class="ph ph--dark">Add contact email</div>`
      }
      ${contactWa ? `<div class="pdf-footer__handle">WA · ${esc(contactWa)}</div>` : ''}
      ${igHandle  ? `<div class="pdf-footer__handle">IG · @${esc(igHandle)}</div>` : ''}
      ${ttHandle  ? `<div class="pdf-footer__handle">TT · @${esc(ttHandle)}</div>` : ''}
      <div class="pdf-footer__meta">Generated by <span>CreatorHQ</span> · <span id="ts-text"></span></div>
    </div>
  </div>

</div>

<!-- Auto-download: html2canvas + jsPDF captures each fixed A4 .page div individually.
     Per doctrine: fixed A4 divs, NOT html2pdf().from(body). Timestamp baked at download time. -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script>
(async function generatePDF() {
  // Bake timestamp at download time
  const tsEl = document.getElementById('ts-text');
  if (tsEl) {
    tsEl.textContent = new Date().toLocaleString('en-ZA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Africa/Johannesburg'
    });
  }

  // Wait for fonts and images before capture
  await document.fonts.ready;

  const { jsPDF } = window.jspdf;
  const pages = document.querySelectorAll('.page');
  if (!pages.length) return;

  const W = 794, H = 1123;
  const pdf = new jsPDF({ unit: 'px', format: [W, H], orientation: 'portrait', compress: true });

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: W,
      height: H,
      windowWidth: W,
      backgroundColor: '#f0ece4',
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    if (i > 0) pdf.addPage([W, H], 'portrait');
    pdf.addImage(imgData, 'JPEG', 0, 0, W, H);
  }

  const slug = '${(firstName + (lastName ? '-' + lastName : '')).replace(/[^A-Za-z0-9]/g, '-').replace(/-+/g, '-')}';
  pdf.save(slug + '-MediaKit.pdf');
})();
</script>
</body>
</html>`;
}

// ---- Rate Card (clean 1-pager) ----

export function renderRateCardHTML(creator, { justCreated = false, justSaved = false, isOwner = false } = {}) {
  // Freshness signal — same model as the kit page. Stale at >7d.
  const statsDate = creator.statsUpdatedAt ? new Date(creator.statsUpdatedAt) : null;
  const freshness = formatFreshness(creator.statsUpdatedAt);

  // Name — prefer nameDetails (dedicated First name + Surname form fields).
  const firstName = esc(creator.nameDetails?.first || (creator.name || '').trim().split(' ')[0] || 'Your');
  const lastName  = esc(creator.nameDetails?.last  || (creator.name || '').trim().split(' ').slice(1).join(' ') || '');
  const fullName  = [firstName, lastName].filter(Boolean).join(' ');

  const role      = creator.niche    || 'Content Creator';
  const location  = creator.location || '';
  const contactEmail = creator.email || creator.contact?.email || '';
  const rates     = creator.customRates || [];
  const rateHourly = creator.rates?.hourly || 0;
  const ratePkgs  = creator.rates?.packages || {};
  const packages  = creator.packages || [];
  const ig  = creator.platforms?.instagram || creator.platformsOld?.instagram || {};
  const tt  = creator.platforms?.tiktok    || creator.platformsOld?.tiktok    || {};
  const fb  = creator.platforms?.facebook  || {};
  const photoUrl  = creator.photo?.url || '';

  // Top-3 platform stats for the cover panel stats row.
  const coverStats = [
    fb.followers ? { val: fmtNum(fb.followers) + '+', lbl: 'Facebook' }    : null,
    tt.followers ? { val: fmtNum(tt.followers) + '+', lbl: 'TikTok' }      : null,
    ig.followers ? { val: fmtNum(ig.followers) + '+', lbl: 'Instagram' }   : null,
  ].filter(Boolean).slice(0, 3);

  const year = new Date().getFullYear();

  const rcTitle = `${fullName} · Rate Card`;
  const rcDesc  = creator.tagline || `Rates for ${fullName}. ${role}.`;
  const rcImage = photoUrl ? absoluteUrl(photoUrl) : '';
  const rcUrl   = absoluteUrl(`/c/${creator.id}/rate-card`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${esc(rcTitle)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  ${ogMeta({ title: rcTitle, description: rcDesc, image: rcImage, url: rcUrl, type: 'profile' })}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#0a0a0a">
  <style>${localFonts()}</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <style>
    /* ── Reset ── */
    *{margin:0;padding:0;box-sizing:border-box}

    /* ── Document viewer shell ───────────────────────────────────────────
       Dark surround communicates "this is a document, not a webpage."
       The body is the viewer; #rc-page is the paper floating inside it.
       On mobile the surround collapses to black, paper goes full-width. */
    html,body {
      background: #1c1c1c;
      color: #0a0a0a;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 300;
      font-size: 15px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }

    /* ── Viewer wrapper: centres the paper card with padding ── */
    .rc-viewer {
      padding: 2.5rem 1.5rem 6rem;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    /* ── Rate card "paper" ───────────────────────────────────────────────
       Web + mobile: responsive, max 860px, content-height, paper shadow.
       PDF export: JS forces width:794px + min-height:1123px on this div
       before html2canvas capture, then restores. The grid columns are
       also forced to 260px 1fr at export time.                          */
    #rc-page {
      width: 100%;
      max-width: 860px;
      display: grid;
      grid-template-columns: 280px 1fr;
      background: #f0ece4;
      overflow: hidden;
      box-shadow: 0 8px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3);
      border-radius: 2px;
    }

    /* ── Left: photo panel ── */
    .rc-photo-col {
      background: #0a0a0a;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;
      min-height: 480px;
    }
    .rc-photo {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      opacity: 0.75;
    }
    .rc-photo-empty {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
    }
    /* Gradient overlay so text always reads on dark */
    .rc-photo-col::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 55%, transparent 100%);
      pointer-events: none;
      z-index: 1;
    }
    .rc-photo-identity {
      position: relative;
      z-index: 2;
      padding: 1.5rem 1.4rem 1.8rem;
    }
    .rc-photo-name {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.75rem;
      line-height: 1.0;
      color: #f8f5f0;
    }
    .rc-photo-name em { font-style: italic; color: rgba(248,245,240,0.45); }
    .rc-photo-role {
      font-size: 0.54rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(248,245,240,0.38);
      margin-top: 0.55rem;
      line-height: 1.9;
    }
    .rc-stats-col {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .rc-stat {
      padding: 0.55rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .rc-stat .num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.35rem;
      font-weight: 300;
      color: #f8f5f0;
      line-height: 1;
    }
    .rc-stat .lbl {
      font-size: 0.48rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(248,245,240,0.28);
      margin-top: 0.15rem;
    }

    /* ── Right: document column ── */
    .rc-doc-col {
      background: #f0ece4;
      display: flex;
      flex-direction: column;
      padding: 1.8rem 1.6rem 1.6rem;
      min-height: 480px;
    }

    /* Document header */
    .rc-doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1.5px solid #0a0a0a;
      margin-bottom: 1.4rem;
    }
    .rc-doc-title {
      font-size: 0.5rem;
      font-weight: 500;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: rgba(10,10,10,0.35);
    }
    .rc-fresh {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.5rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #0a0a0a;
    }
    .rc-fresh__dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #16a34a;
    }
    .rc-fresh--stale { color: #b45309; }
    .rc-fresh--stale .rc-fresh__dot { background: #f59e0b; }

    /* Section labels */
    .rc-section-label {
      font-size: 0.48rem;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(10,10,10,0.35);
      margin-bottom: 0.6rem;
    }

    /* Rates grid */
    .rc-rates {
      display: grid;
      gap: 1px;
      background: rgba(10,10,10,0.1);
      margin-bottom: 1.2rem;
    }
    .rc-rate-cell {
      background: #f0ece4;
      padding: 0.9rem 0.85rem;
    }
    .rc-rate-type {
      font-size: 0.5rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(10,10,10,0.4);
      margin-bottom: 0.35rem;
    }
    .rc-rate-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.5rem;
      font-weight: 300;
      line-height: 1;
      color: #0a0a0a;
    }
    .rc-rate-note {
      font-size: 0.54rem;
      color: rgba(10,10,10,0.35);
      margin-top: 0.2rem;
      line-height: 1.5;
    }

    /* Packages */
    .rc-packages {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: rgba(10,10,10,0.1);
      margin-bottom: 1.2rem;
    }
    .rc-pkg {
      background: #f0ece4;
      padding: 0.8rem 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .rc-pkg.highlight { background: #0a0a0a; }
    .rc-pkg__name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-weight: 300;
      color: #0a0a0a;
    }
    .rc-pkg.highlight .rc-pkg__name { color: rgba(248,245,240,0.9); }
    .rc-pkg__desc {
      font-size: 0.58rem;
      color: rgba(10,10,10,0.4);
      margin-top: 0.1rem;
      line-height: 1.5;
    }
    .rc-pkg.highlight .rc-pkg__desc { color: rgba(248,245,240,0.38); }
    .rc-pkg__price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-weight: 300;
      white-space: nowrap;
      flex-shrink: 0;
      color: #0a0a0a;
    }
    .rc-pkg.highlight .rc-pkg__price { color: rgba(248,245,240,0.7); }

    /* Footer — pinned to bottom of doc col */
    .rc-doc-footer {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid rgba(10,10,10,0.1);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 1.5rem;
    }
    .rc-contact {
      font-size: 0.58rem;
      color: rgba(10,10,10,0.45);
      line-height: 1.9;
    }
    .rc-credit {
      font-size: 0.44rem;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(10,10,10,0.18);
      text-align: right;
      line-height: 1.8;
    }
    .rc-credit span { color: rgba(10,10,10,0.32); }

    /* ── Action bar ── */
    #action-bar {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 100;
      display: flex;
      align-items: center;
      background: #0a0a0a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 100px;
      padding: 0.5rem 0.75rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    }
    #action-bar button,#action-bar a {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.7);
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.7rem;
      font-weight: 400;
      letter-spacing: 0.06em;
      padding: 0.3rem 0.6rem;
      border-radius: 100px;
      text-decoration: none;
      transition: color 0.15s;
      white-space: nowrap;
    }
    #action-bar button:hover,#action-bar a:hover { color: #fff; }
    .bar-divider { width:1px; height:14px; background:rgba(255,255,255,0.12); margin:0 0.25rem; }

    /* ── Mobile: single column below 640px ── */
    @media (max-width: 640px) {
      .rc-viewer { padding: 0 0 5rem; }
      #rc-page {
        grid-template-columns: 1fr;
        box-shadow: none;
        border-radius: 0;
      }
      .rc-photo-col {
        min-height: 65vw;
        max-height: 420px;
      }
      .rc-photo-identity { padding: 1.1rem 1.2rem 1.4rem; }
      .rc-photo-name { font-size: 1.5rem; }
      .rc-doc-col { padding: 1.4rem 1.2rem 1.4rem; min-height: auto; }
      #action-bar {
        bottom: 0;
        right: 0;
        left: 0;
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-bottom: none;
        overflow-x: auto;
        scrollbar-width: none;
        justify-content: flex-start;
        padding: 0.5rem 0.75rem;
      }
      #action-bar::-webkit-scrollbar { display: none; }
    }
    @media print { #action-bar, .chq-nav, .rc-viewer-pad { display: none; } }
  </style>
</head>
<body>
${renderSiteHeader({ current: 'rate-card' })}
${justCreated ? renderCreatedBanner(creator, 'Rate card') : ''}
${(justSaved && !justCreated) ? renderSavedBanner() : ''}

<div class="rc-viewer">
<div id="rc-page">
  <!-- ── Left: photo + identity ── -->
  <div class="rc-photo-col">
    ${photoUrl
      ? `<img class="rc-photo" src="${esc(photoUrl)}" alt="${esc(fullName)}">`
      : `<div class="rc-photo-empty"></div>`}
    <div class="rc-photo-identity">
      <div class="rc-photo-name">${firstName}<br><em>${lastName}</em></div>
      <div class="rc-photo-role">${esc(role)}${location ? `<br>${esc(location)}` : ''}</div>
      ${coverStats.length > 0 ? `
      <div class="rc-stats-col">
        ${coverStats.map(s => `
        <div class="rc-stat">
          <div class="num">${esc(s.val)}</div>
          <div class="lbl">${esc(s.lbl)}</div>
        </div>`).join('')}
      </div>` : ''}
    </div>
  </div>

  <!-- ── Right: document ── -->
  <div class="rc-doc-col">
    <div class="rc-doc-header">
      <div class="rc-doc-title">Rate Card · ${year}</div>
      ${freshness
        ? `<div class="rc-fresh${freshness.stale ? ' rc-fresh--stale' : ''}" title="${esc(statsDate ? statsDate.toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' }) : '')}">
            <span class="rc-fresh__dot" aria-hidden="true"></span>
            <span>${esc(freshness.stale ? 'Outdated · ' + freshness.text : freshness.text)}</span>
           </div>`
        : `<div class="rc-fresh"><span class="rc-fresh__dot" aria-hidden="true"></span><span>New</span></div>`}
    </div>

    ${rateHourly || Object.values(ratePkgs).some(v => v > 0) ? `
    <div class="rc-section-label">Collaboration Rates</div>
    <div class="rc-rates" style="grid-template-columns:repeat(${1 + Object.values(ratePkgs).filter(v => v > 0).length},1fr)">
      ${rateHourly ? `
      <div class="rc-rate-cell">
        <div class="rc-rate-type">Hourly Rate</div>
        <div class="rc-rate-price">${esc(fmtCurrency(rateHourly))}</div>
      </div>` : ''}
      ${Object.entries(ratePkgs).filter(([_, v]) => v > 0).map(([k, v]) => `
      <div class="rc-rate-cell">
        <div class="rc-rate-type">${esc(k.toUpperCase())} Shoot</div>
        <div class="rc-rate-price">${esc(fmtCurrency(v))}</div>
      </div>`).join('')}
    </div>` : ''}

    ${rates.length > 0 ? `
    <div class="rc-section-label">Standard Rates</div>
    <div class="rc-rates" style="grid-template-columns:repeat(${Math.min(rates.length, 3)},1fr)">
      ${rates.map(r => `
      <div class="rc-rate-cell">
        <div class="rc-rate-type">${esc(r.label)}</div>
        <div class="rc-rate-price">${esc(fmtCurrency(r.amount))}</div>
        ${r.note ? `<div class="rc-rate-note">${esc(r.note)}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    ${packages.length > 0 ? `
    <div class="rc-section-label">Packages</div>
    <div class="rc-packages">
      ${packages.map(p => `
      <div class="rc-pkg${p.highlight ? ' highlight' : ''}">
        <div>
          <div class="rc-pkg__name">${esc(p.name)}</div>
          ${p.description ? `<div class="rc-pkg__desc">${esc(p.description.replace(/\n/g, ' · '))}</div>` : ''}
        </div>
        <div class="rc-pkg__price">${esc(p.price)}</div>
      </div>`).join('')}
    </div>` : ''}

    ${!rateHourly && !Object.values(ratePkgs).some(v => v > 0) && !rates.length && !packages.length ? `
    <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:3rem 0;">
      <p style="font-size:0.8rem;color:rgba(10,10,10,0.3);text-align:center;max-width:24ch;line-height:1.8;">Rates not yet published.<br>Contact for pricing.</p>
    </div>` : ''}

    <div class="rc-doc-footer">
      <div class="rc-contact">
        ${contactEmail ? `<div>${esc(contactEmail)}</div>` : ''}
        ${creator.handle ? `<div>${esc(creator.handle)}</div>` : ''}
      </div>
      <div class="rc-credit">Generated by <span>CreatorHQ</span><br>${new Date().toLocaleDateString('en-ZA', { day:'2-digit', month:'short', year:'numeric', timeZone:'Africa/Johannesburg' })}</div>
         </div>
  </div>
</div>
</div><!-- /.rc-viewer -->

<div id="action-bar">
  <button id="rc-copy-btn" onclick="navigator.clipboard.writeText(window.location.href).then(()=>{const b=document.getElementById('rc-copy-btn');const o=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=o,2000)})">Copy Link</button>
  ${isOwner ? `<div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}/edit?rate-card=1">Edit</a>
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}/rate-card?as=visitor" title="See your rate card the way a visitor sees it">As Visitor</a>
  <div class="bar-divider"></div>
  <form method="post" action="/c/${esc(creator.id)}/signout" style="margin:0;padding:0;display:inline-flex;">
    <button type="submit" title="Stop editing on this device" style="background:none;border:none;color:inherit;font:inherit;cursor:pointer;padding:0;">Sign out</button>
  </form>` : ''}
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}">← Full Kit</a>
  <div class="bar-divider"></div>
  <button id="rc-dl-btn" onclick="downloadRateCardPDF()">Download PDF</button>
</div>

<script>
// Per the export skill: capture the fixed A4 div directly with html2canvas
// + jsPDF. Do NOT use html2pdf().from(document.body) — that slices the full
// scrollable body into arbitrary chunks. We capture #rc-page as one canvas.
async function downloadRateCardPDF() {
  const btn = document.getElementById('rc-dl-btn');
  const bar = document.getElementById('action-bar');
  btn.textContent = 'Generating…';
  btn.disabled = true;
  bar.style.display = 'none';

  const { jsPDF } = window.jspdf;
  const page = document.getElementById('rc-page');

  // Force exact A4 dimensions + two-column grid for capture.
  // Restore everything in the finally block regardless of error.
  const prevW    = page.style.width;
  const prevMinH = page.style.minHeight;
  const prevGrid = page.style.gridTemplateColumns;
  const prevBR   = page.style.borderRadius;
  const prevBS   = page.style.boxShadow;
  page.style.width               = '794px';
  page.style.minHeight           = '1123px';
  page.style.gridTemplateColumns = '260px 1fr';
  page.style.borderRadius        = '0';
  page.style.boxShadow           = 'none';

  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794,
      height: 1123,
      windowWidth: 794,
      backgroundColor: '#f0ece4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.97);
    const pdf = new jsPDF({ unit: 'px', format: [794, 1123], orientation: 'portrait' });
    pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
    pdf.save('${firstName.replace(/[^A-Za-z]/g, '')}-${lastName.replace(/[^A-Za-z]/g, '') || 'Creator'}-RateCard.pdf');
  } finally {
    page.style.width               = prevW;
    page.style.minHeight           = prevMinH;
    page.style.gridTemplateColumns = prevGrid;
    page.style.borderRadius        = prevBR;
    page.style.boxShadow           = prevBS;
    bar.style.display = 'flex';
    btn.textContent = 'Download PDF';
    btn.disabled = false;
  }
}
</script>
</body>
</html>`;
}

// ---- Form ----

export function renderFormHTML(creator = null, opts = {}) {
  const c = creator || {};
  // Pre-fill is shape-tolerant: read from locked shape (Khanyi) or extractor shape.
  const ig = c.platforms?.instagram || c.platformsOld?.instagram || {};
  const tt = c.platforms?.tiktok || c.platformsOld?.tiktok || {};
  const yt = c.platforms?.youtube || c.platformsOld?.youtube || {};
  const isEdit = !!c.id;
  const mode = opts.mode === 'rate-card' ? 'rate-card' : 'kit';
  const isRate = mode === 'rate-card';
  const actionUrl = isEdit ? `/c/${c.id}/update` : '/create';
  const productLabel = isRate ? 'Rate Card' : 'Media Kit';
  const pageTitle = `${isEdit ? 'Edit' : 'New'} ${productLabel}`;
  const submitLabel = isRate ? 'Generate rate card' : 'Generate media kit';

  // shape-tolerant pre-fills (Khanyi's locked shape vs extractor shape)
  const nameStr = typeof c.name === 'string' ? c.name : (c.name?.full || '');
  const bioText = typeof c.bio === 'string' ? c.bio : (c.bio?.text || '');
  const bioParagraphs = c.bioParagraphs || c.bio?.paragraphs || [];
  const bioPillars = c.bioPillars || c.bio?.pillars || [];
  const reachArr = c.reach || [];
  const audience = c.audience || {};
  const audAge = Array.isArray(audience.age) ? audience.age : [];
  const audLocs = Array.isArray(audience.locations) ? audience.locations : [];
  const audGender = audience.gender || {};
  const brandsArr = (c.brands || []).map(b => typeof b === 'string' ? { name: b, category: '' } : (b || {}));
  const packagesArr = c.packages || [];
  const contactNote = c.contact?.note || '';
  const contactEmail = c.contact?.email || c.email || '';
  
  const rateHourly = c.rates?.hourly || '';
  const ratePkgs = c.rates?.packages || {};

  // toggle link href — lets users switch form mode without losing where they are
  const toggleHref = isEdit
    ? (isRate ? `/c/${c.id}/edit` : `/c/${c.id}/edit?rate-card=1`)
    : (isRate ? '/new' : '/new?rate-card=1');
  const toggleLabel = isRate ? 'Need the full media kit? →' : 'Just want a rate card? →';

  if (isEdit) { return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · ${pageTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${headCSS()}
    body { padding: 0 0 96px; background: #ffffff; color: #0a0a0a; }
    .wrap { padding: 32px 24px 0; }
    .wrap { max-width: 720px; margin: 0 auto; }
    h1.display { font-size: 44pt; line-height: 1; margin-bottom: 8px; }
    .lede { color: var(--muted); margin-bottom: 48px; font-size: 12pt; }
    fieldset {
      border: none;
      border-top: 1px solid var(--rule);
      padding: 32px 0;
    }
    legend {
      font-size: 9pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #6b6460;
      padding-right: 12px;
    }
    label { display: block; font-size: 10pt; margin-bottom: 6px; color: var(--muted); }
    input[type=text], input[type=email], input[type=number], textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #d8d2ca;
      background: #ffffff;
      font: inherit;
      font-size: 12pt;
      color: #0a0a0a;
      border-radius: 2px;
      margin-bottom: 16px;
    }
    input[type=file] { margin-bottom: 16px; }
    textarea { min-height: 96px; resize: vertical; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .row-3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; }
    .rate-row, .work-row { display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: start; }
    .work-row { grid-template-columns: 1fr 2fr auto; }
    button {
      font: inherit;
      padding: 10px 14px;
      background: transparent;
      border: 1px solid var(--rule);
      cursor: pointer;
      border-radius: 2px;
    }
    .primary {
      background: var(--black);
      color: var(--paper);
      padding: 16px 28px;
      font-size: 12pt;
      letter-spacing: 0.05em;
      border: none;
    }
    .hint { font-size: 9pt; color: var(--muted); margin-top: -8px; margin-bottom: 16px; }
    .photo-spec {
      padding: 12px 14px;
      background: var(--sand);
      font-size: 9pt;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(10,10,10,0.7);
      margin-bottom: 12px;
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css">
</head>
<body>
  ${renderSiteHeader({ current: 'form' })}
  <div class="wrap">
    <a href="${isEdit ? `/c/${esc(c.id)}` : '/'}" style="display:inline-block;margin-top:24px;margin-bottom:24px;font-size:9pt;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);text-decoration:none;">← ${isEdit ? 'Back to my kit' : 'Cancel'}</a>
    <h1 class="display">${pageTitle}</h1>
    <p class="lede">${isRate
      ? 'A clean one-pager brands can read in 30 seconds. Platforms, rates, contact. Nothing else.'
      : 'The full story. Bio, audience, brands, packages, rates. Designed, shareable, PDF-ready.'}</p>
    <a href="${toggleHref}" style="display:inline-block;margin-bottom:32px;font-size:10pt;color:var(--muted);text-decoration:none;border-bottom:1px solid var(--rule);padding-bottom:2px;">${toggleLabel}</a>

    <form action="${actionUrl}" method="post" enctype="multipart/form-data" id="edit-form">
      <input type="hidden" name="mode" value="${mode}" />
      <fieldset>
        <legend>Identity</legend>
        <div class="row">
          <div>
            <label>First name</label>
            <input name="name_first" type="text" required placeholder="e.g. Khanyisile" value="${esc(c.nameDetails?.first || nameStr.split(' ')[0] || '')}" />
          </div>
          <div>
            <label>Surname</label>
            <input name="name_last" type="text" required placeholder="e.g. Khumalo" value="${esc(c.nameDetails?.last || nameStr.split(' ').slice(1).join(' ') || '')}" />
          </div>
        </div>
        <div class="row">
          <div>
            <label>Niche / Category</label>
            <input name="niche" type="text" placeholder="e.g. Fashion, Beauty, Lifestyle, Food" value="${esc(c.niche)}" />
          </div>
          <div>
            <label>Location</label>
            <input name="location" type="text" placeholder="e.g. Johannesburg, London" value="${esc(c.location)}" />
          </div>
        </div>
        <div class="row">
          <div>
            <label>Primary handle <span style="text-transform:none;letter-spacing:0;font-weight:400;color:rgba(10,10,10,0.35);">(optional)</span></label>
            <input name="handle" type="text" placeholder="@yourname" value="${esc(c.handle)}" />
          </div>
        </div>
        <label>Tagline</label>
        <input name="tagline" type="text" placeholder="One line that describes you" value="${esc(c.tagline)}" />
        ${!isRate ? `
        <label>Short bio</label>
        <textarea name="bio" placeholder="Two or three sentences. Who you are, who you make for.">${esc(bioText)}</textarea>` : ''}
        <label>Email${isRate ? '' : ' <span class="hint">· optional unless you want a media kit later</span>'}</label>
        <input name="email" type="email" value="${esc(contactEmail)}" />
      </fieldset>

      ${!isRate ? `
      <fieldset>
        <legend>Reach Stats</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Top-of-funnel numbers that summarise your reach. Shown at the top of the media kit. Up to 3.</div>
        <div id="reach-list">
          ${(reachArr.length ? reachArr : [{}, {}, {}]).slice(0, 3).map(r => `
          <div class="row" style="margin-bottom:12px;">
            <input name="reach_value" type="text" placeholder="e.g. 20M+" value="${esc(r.val || r.value || '')}" />
            <input name="reach_label" type="text" placeholder="e.g. FB Monthly Reach" value="${esc(r.lbl || r.label || '')}" />
          </div>`).join('')}
        </div>
      </fieldset>

      <fieldset>
        <legend>Bio · the long form</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Paragraphs that tell your story. Add one paragraph per field.</div>
        <div id="bio-paragraphs">
          ${(bioParagraphs.length ? bioParagraphs : ['']).map(p => `
          <textarea name="bio_paragraph" placeholder="A paragraph of your story" style="margin-bottom:12px;">${esc(typeof p === 'string' ? p : '')}</textarea>`).join('')}
        </div>
        <button type="button" onclick="addBioParagraph()">+ Add paragraph</button>

        <div style="margin-top:24px;">
          <label style="font-size:9pt;letter-spacing:0.2em;text-transform:uppercase;color:#6b6460;margin-bottom:12px;">Content Pillars (up to 2)</label>
          <div class="hint" style="margin-top:0;margin-bottom:16px;">What makes your content distinctive. A label + short description each.</div>
          <div id="pillars-list">
            ${(bioPillars.length ? bioPillars : [{}, {}]).slice(0, 2).map(p => `
            <div style="margin-bottom:16px;">
              <input name="pillar_label" type="text" placeholder="Pillar name (e.g. Authentic Storytelling)" value="${esc(typeof p === 'object' ? (p.label || '') : (p || ''))}" />
              <textarea name="pillar_text" placeholder="Why it matters" style="min-height:60px;">${esc(typeof p === 'object' ? (p.text || '') : '')}</textarea>
            </div>`).join('')}
          </div>
        </div>
      </fieldset>
      ` : ''}

      <fieldset>
        <legend>Cover photo</legend>
        <input name="photo" type="file" accept="image/*" id="edit-photo-input" onchange="editPreviewPhoto(this)" />
        <div id="edit-crop-zone" style="display:none;margin-top:14px;">
          <img id="edit-crop-img" src="" alt="Crop preview" style="max-width:100%;display:block;" />
          <p style="font-size:8pt;color:var(--muted);margin-top:6px;">Drag to position · pinch or scroll to zoom</p>
          <button type="button" onclick="editResetPhoto()" style="font-size:9pt;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;font-family:inherit;margin-top:6px;display:block;">Choose different photo</button>
        </div>
        <div class="hint" style="margin-top:8px;">Drag to frame your face — we'll crop it to a tall portrait for your cover.</div>
      </fieldset>

      <fieldset>
        <legend>Instagram</legend>
        <div class="row-3">
          <div>
            <label>Handle</label>
            <input name="ig_handle" type="text" value="${esc(ig.handle)}" />
          </div>
          <div>
            <label>Followers</label>
            <input name="ig_followers" type="number" min="0" value="${ig.followers || ''}" />
          </div>
          <div>
            <label>Engagement %</label>
            <input name="ig_engagement" type="number" step="0.1" min="0" value="${ig.engagement || ''}" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>TikTok</legend>
        <div class="row-3">
          <div>
            <label>Handle</label>
            <input name="tt_handle" type="text" value="${esc(tt.handle)}" />
          </div>
          <div>
            <label>Followers</label>
            <input name="tt_followers" type="number" min="0" value="${tt.followers || ''}" />
          </div>
          <div>
            <label>Engagement %</label>
            <input name="tt_engagement" type="number" step="0.1" min="0" value="${tt.engagement || ''}" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>YouTube</legend>
        <div class="row-3">
          <div>
            <label>Channel handle / URL</label>
            <input name="yt_handle" type="text" placeholder="@yourchannel" value="${esc(yt.handle)}" />
          </div>
          <div>
            <label>Subscribers</label>
            <input name="yt_followers" type="number" min="0" value="${yt.followers || ''}" />
          </div>
          <div>
            <label>Avg views / video</label>
            <input name="yt_avg_views" type="number" min="0" value="${yt.avgViews || ''}" />
          </div>
        </div>
      </fieldset>

      ${!isRate ? `
      <fieldset>
        <legend>Audience</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Who's watching. Gender split, age ranges, top locations. Brands use this to qualify fit.</div>
        <label style="font-size:9pt;letter-spacing:0.2em;text-transform:uppercase;color:#6b6460;">Gender split (%)</label>
        <div class="row" style="margin-top:6px;">
          <div>
            <label>Male</label>
            <input name="audience_male" type="text" placeholder="e.g. 40" value="${esc(audGender.male || '')}" />
          </div>
          <div>
            <label>Female</label>
            <input name="audience_female" type="text" placeholder="e.g. 60" value="${esc(audGender.female || '')}" />
          </div>
        </div>

        <label style="font-size:9pt;letter-spacing:0.2em;text-transform:uppercase;color:#6b6460;margin-top:16px;">Age ranges</label>
        <div id="age-list">
          ${(audAge.length ? audAge : [{}, {}]).slice(0, 4).map(a => `
          <div class="row" style="margin-bottom:8px;">
            <input name="audience_age_range" type="text" placeholder="e.g. 18–24" value="${esc(a.range || '')}" />
            <input name="audience_age_pct" type="text" placeholder="%" value="${esc(a.percentage || '')}" />
          </div>`).join('')}
        </div>
        <button type="button" onclick="addAgeRange()">+ Add age range</button>

        <label style="font-size:9pt;letter-spacing:0.2em;text-transform:uppercase;color:#6b6460;margin-top:16px;">Top locations</label>
        <div id="loc-list">
          ${(audLocs.length ? audLocs : [{}, {}, {}]).slice(0, 5).map(l => {
            const locName = typeof l === 'string' ? l : (l.name || '');
            const locPct = typeof l === 'string' ? '' : (l.percentage || '');
            return `
          <div class="row" style="margin-bottom:8px;">
            <input name="audience_location" type="text" placeholder="e.g. Gauteng" value="${esc(locName)}" />
            <input name="audience_location_pct" type="text" placeholder="% (optional)" value="${esc(locPct)}" />
          </div>`;
          }).join('')}
        </div>
        <button type="button" onclick="addLocation()">+ Add location</button>
      </fieldset>
      ` : ''}

      <fieldset>
        <legend>Rates</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Label each deliverable clearly. Brands will read this line verbatim. Not sure what to charge? <a href="/calculator" target="_blank" rel="noopener" style="color:var(--black);text-decoration:underline;">Try the rate calculator →</a></div>

        <div id="rates">
          <div class="row" style="margin-bottom:1.5rem">
            <div>
              <label>Hourly Rate (R/hr)</label>
              <input name="rate_hourly" type="number" min="0" value="${rateHourly}" placeholder="e.g. 500" />
            </div>
          </div>
          <div class="row" style="margin-bottom:1.5rem">
            <div>
              <label>3hr Package (R)</label>
              <input name="rate_3h" type="number" min="0" value="${ratePkgs['3h'] || ''}" placeholder="e.g. 1200" />
            </div>
            <div>
              <label>4hr Package (R)</label>
              <input name="rate_4h" type="number" min="0" value="${ratePkgs['4h'] || ''}" placeholder="e.g. 1800" />
            </div>
            <div>
              <label>8hr (Full Day) (R)</label>
              <input name="rate_8h" type="number" min="0" value="${ratePkgs['8h'] || ''}" placeholder="e.g. 3500" />
            </div>
          </div>

          <div style="margin-top:2rem; font-size: 0.75rem; color: var(--muted); border-top: 1px dotted var(--rule); padding-top: 1.5rem;">Custom Rates (optional)</div>
          ${(c.customRates || []).map(r => `
          <div class="rate-row">
            <input name="rate_label" type="text" placeholder="e.g. Branded Story" value="${esc(r.label)}" />
            <input name="rate_amount" type="number" min="0" placeholder="Amount" value="${r.amount}" />
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
            <input name="rate_note" type="text" placeholder="Note (optional)" value="${esc(r.note || '')}" style="grid-column:1 / -1; margin-top:-4px;" />
          </div>`).join('')}
        </div>
        <button type="button" onclick="addRate()">+ Add more custom rates</button>
      </fieldset>

      ${!isRate ? `
      <fieldset>
        <legend>Selected Work</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Past brand work. Justifies the rate in a brand meeting.</div>
        <div id="works">
          ${(c.workPreview || []).map(w => `
          <div class="work-row">
            <input name="work_brand" type="text" placeholder="Brand" value="${esc(w.brand)}" />
            <input name="work_note" type="text" placeholder="What you did / the result" value="${esc(w.note)}" />
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
          </div>`).join('')}
          ${(!c.workPreview || c.workPreview.length === 0) ? `
          <div class="work-row">
            <input name="work_brand" type="text" placeholder="Brand" />
            <input name="work_note" type="text" placeholder="What you did / the result" />
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
          </div>` : ''}
        </div>
        <button type="button" onclick="addWork()">+ Add work</button>
      </fieldset>

      <fieldset>
        <legend>Brands & Evidence</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Brands you've worked with. Add up to 3 evidence URLs (refernce clips, campaign links) per brand to build trust.</div>
        <div id="brands-list">
          ${(brandsArr.length ? brandsArr : [{}, {}, {}]).slice(0, 8).map((b, i) => `
          <div style="margin-bottom:24px; padding:16px; border:1px solid var(--rule); border-radius:2px;">
            <div class="row">
              <input name="brand_name" type="text" placeholder="Brand name (e.g. Google)" value="${esc(b.name || '')}" />
              <input name="brand_category" type="text" placeholder="Category (e.g. Tech)" value="${esc(b.category || '')}" />
            </div>
            <div style="margin-top:12px;">
              <label>Evidence / Reference Links (Up to 3)</label>
              <input name="brand_${i}_evidence_0" type="text" placeholder="https://..." value="${esc(b.evidence?.[0] || '')}" style="margin-bottom:8px;" />
              <input name="brand_${i}_evidence_1" type="text" placeholder="https://..." value="${esc(b.evidence?.[1] || '')}" style="margin-bottom:8px;" />
              <input name="brand_${i}_evidence_2" type="text" placeholder="https://..." value="${esc(b.evidence?.[2] || '')}" style="margin-bottom:0;" />
            </div>
            <button type="button" onclick="this.parentElement.remove()" style="margin-top:12px; font-size:0.7rem;">Remove Brand</button>
          </div>`).join('')}
        </div>
        <button type="button" onclick="addBrand()">+ Add brand</button>
      </fieldset>

      <fieldset>
        <legend>Packages</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Structured offerings. Up to 3. Mark one as highlighted to feature it.</div>
        <div id="packages-list">
          ${(packagesArr.length ? packagesArr : [{}, {}, {}]).slice(0, 3).map((p, i) => `
          <div style="margin-bottom:20px;padding:16px;border:1px solid var(--rule);border-radius:2px;">
            <div class="row">
              <div>
                <label>Package name</label>
                <input name="package_name" type="text" placeholder="e.g. Basic Campaign" value="${esc(p.name || '')}" />
              </div>
              <div>
                <label>Price</label>
                <input name="package_price" type="text" placeholder="e.g. R50,000 or POA" value="${esc(p.price || '')}" />
              </div>
            </div>
            <label>Description</label>
            <textarea name="package_desc" placeholder="What's included. One bullet per line.">${esc(p.description || '')}</textarea>
            <label style="display:inline-flex;align-items:center;gap:8px;font-size:10pt;margin-top:4px;">
              <input name="package_highlight" type="checkbox" value="${i}" ${p.highlight ? 'checked' : ''} />
              Highlight this package
            </label>
          </div>`).join('')}
        </div>
      </fieldset>

      <fieldset>
        <legend>Contact</legend>

        <label>Cell number</label>
        <input name="phone" type="tel" placeholder="+27 82 000 0000" value="${esc(creator?.contact?.phone || '')}">

        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:400;margin-top:2px;">
          <input type="checkbox" name="wa_same" id="wa-same"
            onchange="document.getElementById('wa-field').style.display=this.checked?'none':'block'"
            ${(!creator?.contact?.whatsapp || creator?.contact?.whatsapp === creator?.contact?.phone) ? 'checked' : ''}>
          WhatsApp is the same number
        </label>
        <input name="whatsapp" type="tel" id="wa-field" placeholder="+27 82 000 0000"
          value="${esc(creator?.contact?.whatsapp && creator.contact.whatsapp !== creator?.contact?.phone ? creator.contact.whatsapp : '')}"
          style="display:${(!creator?.contact?.whatsapp || creator?.contact?.whatsapp === creator?.contact?.phone) ? 'none' : 'block'}">

        <label>Contact note <span class="hint">· shown next to email on the kit</span></label>
        <textarea name="contact_note" placeholder="e.g. For campaign briefs and partnership proposals reach out to discuss your brand goals">${esc(contactNote)}</textarea>
      </fieldset>
      ` : ''}

      ${!isEdit ? `
      <!-- Soft sign-in section. Recovery contact + DOB so the creator can edit
           this kit later from a different device. We hash both fields server-side
           with a per-record salt, never store the raw values. Honeypot + min-fill
           timestamp included for bot protection. -->
      <fieldset>
        <legend>Recovery</legend>
        <p class="hint" style="margin-top:0;margin-bottom:18px;">So you can edit this kit later from a different phone or laptop. We hash both fields before storing. Your raw details never persist.</p>

        <label>Your contact <span class="hint">· email or SA cell</span></label>
        <input name="recovery_contact" type="text" inputmode="email" autocomplete="email" placeholder="you@example.com  or  0821234567" required />

        <label style="margin-top:18px;">Your date of birth <span class="hint">· DD / MM / YYYY</span></label>
        <div class="dob-row" style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px;">
          <input name="recovery_dob_d" type="text" inputmode="numeric" pattern="\\d*" maxlength="2" placeholder="DD" required aria-label="Day" />
          <input name="recovery_dob_m" type="text" inputmode="numeric" pattern="\\d*" maxlength="2" placeholder="MM" required aria-label="Month" />
          <input name="recovery_dob_y" type="text" inputmode="numeric" pattern="\\d*" maxlength="4" placeholder="YYYY" required aria-label="Year" />
        </div>

        <!-- Honeypot: hidden from humans, irresistible to bots. -->
        <input name="hp_check" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;" />
        <!-- Form-rendered timestamp for the min-fill-time check. Set on render. -->
        <input name="form_rendered_at" type="hidden" value="${Date.now()}" />
      </fieldset>
      ` : ''}

      <div style="margin-top:32px;">
        <button class="primary" type="submit">${submitLabel}</button>
      </div>
    </form>
  </div>

  <script>
    // Auto-advance focus across the DOB split fields. When the user fills DD
    // (2 chars), focus moves to MM. When MM is filled, focus moves to YYYY.
    // Backspace at the start of a field jumps back to the previous one.
    (function() {
      var dobInputs = document.querySelectorAll('input[name^="recovery_dob_"]');
      if (!dobInputs.length) return;
      dobInputs.forEach(function(el, i) {
        el.addEventListener('input', function(e) {
          if (el.value.length >= el.maxLength && i < dobInputs.length - 1) {
            dobInputs[i + 1].focus();
          }
        });
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace' && el.value === '' && i > 0) {
            dobInputs[i - 1].focus();
          }
        });
      });
    })();
  </script>

  <script>
    function addRate(label = '', amount = '') {
      const wrap = document.getElementById('rates');
      const row = document.createElement('div');
      row.className = 'rate-row';
      row.innerHTML = '<input name="rate_label" type="text" placeholder="e.g. TikTok Video" value="' + label + '" />' +
        '<input name="rate_amount" type="number" min="0" placeholder="Amount" value="' + amount + '" />' +
        '<button type="button" onclick="this.parentElement.remove()">Remove</button>' +
        '<input name="rate_note" type="text" placeholder="Note (optional). e.g. incl. usage rights" style="grid-column:1 / -1; margin-top:-4px;" />';
      wrap.appendChild(row);
    }
    function addWork() {
      const wrap = document.getElementById('works');
      const row = document.createElement('div');
      row.className = 'work-row';
      row.innerHTML = '<input name="work_brand" type="text" placeholder="Brand" />' +
        '<input name="work_note" type="text" placeholder="What you did / the result" />' +
        '<button type="button" onclick="this.parentElement.remove()">Remove</button>';
      wrap.appendChild(row);
    }
    function addBioParagraph() {
      const wrap = document.getElementById('bio-paragraphs');
      if (!wrap) return;
      const t = document.createElement('textarea');
      t.name = 'bio_paragraph';
      t.placeholder = 'A paragraph of your story';
      t.style.marginBottom = '12px';
      wrap.appendChild(t);
    }
    function addAgeRange() {
      const wrap = document.getElementById('age-list');
      if (!wrap) return;
      const row = document.createElement('div');
      row.className = 'row';
      row.style.marginBottom = '8px';
      row.innerHTML = '<input name="audience_age_range" type="text" placeholder="e.g. 25–34" />' +
        '<input name="audience_age_pct" type="text" placeholder="%" />';
      wrap.appendChild(row);
    }
    function addLocation() {
      const wrap = document.getElementById('loc-list');
      if (!wrap) return;
      const row = document.createElement('div');
      row.className = 'row';
      row.style.marginBottom = '8px';
      row.innerHTML = '<input name="audience_location" type="text" placeholder="e.g. Cape Town" />' +
        '<input name="audience_location_pct" type="text" placeholder="% (optional)" />';
      wrap.appendChild(row);
    }
    function addBrand() {
      const wrap = document.getElementById('brands-list');
      if (!wrap) return;
      const i = wrap.children.length;
      const div = document.createElement('div');
      div.style.marginBottom = '24px';
      div.style.padding = '16px';
      div.style.border = '1px solid var(--rule)';
      div.style.borderRadius = '2px';
      div.innerHTML = \`
        <div class="row">
          <input name="brand_name" type="text" placeholder="Brand name" />
          <input name="brand_category" type="text" placeholder="Category" />
        </div>
        <div style="margin-top:12px;">
          <label>Evidence / Reference Links (Up to 3)</label>
          <input name="brand_\${i}_evidence_0" type="text" placeholder="https://..." style="margin-bottom:8px;" />
          <input name="brand_\${i}_evidence_1" type="text" placeholder="https://..." style="margin-bottom:8px;" />
          <input name="brand_\${i}_evidence_2" type="text" placeholder="https://..." style="margin-bottom:0;" />
        </div>
        <button type="button" onclick="this.parentElement.remove()" style="margin-top:12px; font-size:0.7rem;">Remove Brand</button>
      \`;
      wrap.appendChild(div);
    }

    function toggleEvidence(i) {
      const el = document.getElementById('evidence-' + i);
      if (el) el.classList.toggle('visible');
    }

    // ── Edit form photo crop ──────────────────────────────────────────────────
    var _editCropper = null;
    function editPreviewPhoto(input) {
      if (!input.files || !input.files[0]) return;
      var url = URL.createObjectURL(input.files[0]);
      var cropImg = document.getElementById('edit-crop-img');
      cropImg.src = url;
      document.getElementById('edit-crop-zone').style.display = 'block';
      if (_editCropper) _editCropper.destroy();
      _editCropper = new Cropper(cropImg, {
        aspectRatio: 317 / 390,
        viewMode: 1,
        guides: false,
        center: false,
        background: false,
        autoCropArea: 0.95,
        movable: true,
        zoomable: true,
        rotatable: false,
      });
    }
    function editResetPhoto() {
      if (_editCropper) { _editCropper.destroy(); _editCropper = null; }
      document.getElementById('edit-photo-input').value = '';
      document.getElementById('edit-crop-img').src = '';
      document.getElementById('edit-crop-zone').style.display = 'none';
    }
    document.getElementById('edit-form').addEventListener('submit', function(e) {
      if (!_editCropper) return;
      e.preventDefault();
      var form = this;
      var canvas = _editCropper.getCroppedCanvas({ width: 634, height: 780, imageSmoothingQuality: 'high' });
      canvas.toBlob(function(blob) {
        try {
          var dt = new DataTransfer();
          dt.items.add(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
          document.getElementById('edit-photo-input').files = dt.files;
        } catch(err) {}
        form.submit();
      }, 'image/jpeg', 0.92);
    });

  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js"></script>
</body>
</html>`; } // end isEdit

  // ── New creation: card-by-card wizard ──────────────────────────────────────
  const totalSteps = isRate ? 5 : 8;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · ${isRate ? 'Get your rate card' : 'Build your media kit'}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${headCSS()}
    body { padding: 0 0 88px; background: #fff; color: #0a0a0a; }

    /* Progress */
    #wiz-progress { height: 3px; background: var(--rule); position: sticky; top: 0; z-index: 10; }
    #wiz-bar { height: 3px; background: var(--black); transition: width 0.25s ease; }
    #wiz-meta { padding: 14px 24px 0; display: flex; justify-content: space-between; align-items: center; }
    #wiz-step-label { font-size: 9pt; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
    #wiz-cancel { font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); text-decoration: none; }

    /* Layout */
    .wiz-wrap { padding: 36px 24px 0; max-width: 480px; margin: 0 auto; }
    .form-step { display: none; }
    .form-step.wiz-active { display: block; }

    /* Typography */
    .step-h { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 34pt; font-weight: 500; line-height: 1.05; margin-bottom: 10px; }
    .step-sub { color: var(--muted); font-size: 11pt; margin-bottom: 32px; line-height: 1.5; }

    /* Fields */
    label { display: block; font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; margin-top: 22px; }
    label:first-of-type { margin-top: 0; }
    input[type=text], input[type=email], input[type=number], textarea {
      width: 100%; padding: 14px 16px; border: 1px solid #d8d2ca;
      background: #fff; font: inherit; font-size: 13pt; color: #0a0a0a;
      border-radius: 2px; -webkit-appearance: none; appearance: none;
    }
    textarea { min-height: 80px; resize: vertical; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .row-2 label { margin-top: 0; }

    /* Photo drop */
    .photo-drop { border: 1px dashed #c0b8b0; border-radius: 2px; padding: 40px 24px; text-align: center; cursor: pointer; background: #faf8f5; position: relative; }
    .photo-drop input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
    .photo-drop-label { font-size: 10pt; color: var(--muted); margin-top: 8px; }
    /* Crop zone */
    #crop-zone { margin-top: 16px; }
    #crop-zone .cropper-container { border-radius: 2px; overflow: hidden; }
    .crop-hint { font-size: 8pt; color: var(--muted); margin-top: 8px; text-align: center; line-height: 1.4; }
    .photo-change-btn { font-size: 9pt; color: var(--muted); background: none; border: none; cursor: pointer; text-decoration: underline; font-family: inherit; display: block; margin: 10px auto 0; }

    /* Platform blocks */
    .platform-block { margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid var(--rule); }
    .platform-block:last-of-type { border-bottom: none; margin-bottom: 0; }
    .platform-name { font-size: 9pt; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; color: var(--black); margin-bottom: 16px; }

    /* Rate preview card */
    #rate-preview { padding: 28px 20px; background: #faf8f5; border-radius: 2px; margin-bottom: 28px; text-align: center; }
    .rate-range { display: flex; align-items: baseline; justify-content: center; gap: 10px; margin-bottom: 8px; }
    .rate-num { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 44pt; font-weight: 500; line-height: 1; }
    .rate-sep { color: var(--muted); font-size: 20pt; }
    .rate-unit { font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
    .rate-caveat { font-size: 8pt; color: var(--muted); }

    /* Bottom nav */
    #wiz-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid var(--rule); padding: 14px 24px; display: flex; gap: 12px; align-items: center; z-index: 20; }
    #btn-wiz-back { flex: 0 0 auto; background: transparent; border: 1px solid var(--rule); color: var(--muted); padding: 13px 18px; font: inherit; font-size: 10pt; border-radius: 2px; cursor: pointer; }
    #btn-wiz-skip { flex: 1; background: transparent; border: none; color: var(--muted); font: inherit; font-size: 10pt; cursor: pointer; text-decoration: underline; text-align: center; }
    #btn-wiz-next { flex: 2; background: var(--black); color: #fff; border: none; padding: 15px; font: inherit; font-size: 12pt; border-radius: 2px; cursor: pointer; letter-spacing: 0.02em; }

    /* Misc */
    .field-hint { font-size: 8pt; color: var(--muted); margin-top: 4px; line-height: 1.4; }
    .add-btn { margin-top: 12px; padding: 10px 14px; background: transparent; border: 1px solid var(--rule); font: inherit; font-size: 9pt; cursor: pointer; border-radius: 2px; width: 100%; }
    .remove-btn { font-size: 8pt; color: var(--muted); background: none; border: none; cursor: pointer; text-decoration: underline; font-family: inherit; margin-top: 6px; }
    .optional-badge { display: inline-block; font-size: 8pt; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--rule); padding: 2px 8px; border-radius: 2px; margin-left: 10px; vertical-align: middle; }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css">
</head>
<body>
  ${renderSiteHeader({ current: 'form' })}

  <div id="wiz-progress"><div id="wiz-bar" style="width:${Math.round(1/totalSteps*100)}%"></div></div>
  <div id="wiz-meta">
    <span id="wiz-step-label">Step 1 of ${totalSteps}</span>
    <a href="/" id="wiz-cancel">Cancel</a>
  </div>

  <div class="wiz-wrap">
    <form action="/create" method="post" enctype="multipart/form-data" id="wiz-form">
      <input type="hidden" name="mode" value="${mode}" />
      <input name="hp_check" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;" />
      <input name="form_rendered_at" type="hidden" value="${Date.now()}" />

      <!-- ── Step 1: Photo + Identity ── -->
      <div class="form-step wiz-active" data-step="1">
        <h2 class="step-h">Start with your photo</h2>
        <p class="step-sub">This goes on your rate card first. A clear headshot works best.</p>

        <div class="photo-drop" id="photo-drop">
          <div style="font-size:28px;margin-bottom:8px;">📷</div>
          <div class="photo-drop-label">Tap to choose a photo</div>
          <input name="photo" type="file" accept="image/*" id="photo-input" onchange="previewPhoto(this)" />
        </div>
        <div id="crop-zone" style="display:none;">
          <img id="crop-img" src="" alt="Crop preview" style="max-width:100%;display:block;" />
          <p class="crop-hint">Drag to position · pinch or scroll to zoom</p>
          <button type="button" class="photo-change-btn" onclick="resetPhoto()">Choose different photo</button>
        </div>

        <label style="margin-top:28px;">First name</label>
        <input name="name_first" type="text" required placeholder="e.g. Khanyisile" value="${esc(c.nameDetails?.first || nameStr.split(' ')[0] || '')}" />

        <label>Surname</label>
        <input name="name_last" type="text" required placeholder="e.g. Khumalo" value="${esc(c.nameDetails?.last || nameStr.split(' ').slice(1).join(' ') || '')}" />

        <label>Handle <span style="text-transform:none;letter-spacing:0;font-weight:400;font-size:8pt;"> optional</span></label>
        <input name="handle" type="text" placeholder="@yourname" value="${esc(c.handle)}" />

        <label>Email</label>
        <input name="email" type="email" required placeholder="you@example.com" value="${esc(contactEmail)}" />
      </div>

      <!-- ── Step 2: Platforms ── -->
      <div class="form-step" data-step="2">
        <h2 class="step-h">Your reach</h2>
        <p class="step-sub">Organic stats only. Paid and boosted content doesn't count here.</p>

        <div class="platform-block">
          <div class="platform-name">Instagram</div>
          <label>Handle</label>
          <input name="ig_handle" type="text" placeholder="@yourhandle" value="${esc(ig.handle)}" />
          <div class="row-2" style="margin-top:14px;">
            <div>
              <label>Followers</label>
              <input name="ig_followers" type="number" min="0" placeholder="0" value="${ig.followers || ''}" oninput="updateRatePreview()" />
            </div>
            <div>
              <label>Engagement %</label>
              <input name="ig_engagement" type="number" step="0.1" min="0" placeholder="0.0" value="${ig.engagement || ''}" oninput="updateRatePreview()" />
            </div>
          </div>
        </div>

        <div class="platform-block">
          <div class="platform-name">TikTok</div>
          <label>Handle</label>
          <input name="tt_handle" type="text" placeholder="@yourhandle" value="${esc(tt.handle)}" />
          <div class="row-2" style="margin-top:14px;">
            <div>
              <label>Followers</label>
              <input name="tt_followers" type="number" min="0" placeholder="0" value="${tt.followers || ''}" oninput="updateRatePreview()" />
            </div>
            <div>
              <label>Engagement %</label>
              <input name="tt_engagement" type="number" step="0.1" min="0" placeholder="0.0" value="${tt.engagement || ''}" oninput="updateRatePreview()" />
            </div>
          </div>
        </div>

        <div class="platform-block">
          <div class="platform-name">YouTube</div>
          <label>Channel handle</label>
          <input name="yt_handle" type="text" placeholder="@yourchannel" value="${esc(yt.handle)}" />
          <div class="row-2" style="margin-top:14px;">
            <div>
              <label>Subscribers</label>
              <input name="yt_followers" type="number" min="0" placeholder="0" value="${yt.followers || ''}" oninput="updateRatePreview()" />
            </div>
            <div>
              <label>Avg views / video</label>
              <input name="yt_avg_views" type="number" min="0" placeholder="0" value="${yt.avgViews || ''}" oninput="updateRatePreview()" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Step 3: Rate preview + context ── -->
      <div class="form-step" data-step="3">
        <h2 class="step-h">What your work is worth</h2>
        <p class="step-sub">Based on your stats. You can set your actual rates in the next step.</p>

        <div id="rate-preview">
          <p style="color:var(--muted);font-size:10pt;text-align:center;padding:20px 0;">Fill in platform stats on the previous step to see your range.</p>
        </div>

        <label>Niche / Category</label>
        <input name="niche" type="text" placeholder="e.g. Fashion, Beauty, Lifestyle" value="${esc(c.niche)}" />

        <label>Location</label>
        <input name="location" type="text" placeholder="e.g. Johannesburg" value="${esc(c.location)}" />

        <label>Tagline</label>
        <input name="tagline" type="text" placeholder="One line that describes you" value="${esc(c.tagline)}" />

        ${!isRate ? `
        <label>Short bio</label>
        <textarea name="bio" placeholder="Two or three sentences. Who you are, who you make for.">${esc(bioText)}</textarea>
        ` : ''}
      </div>

      ${isRate ? `
      <!-- ── Step 4 (rate card): Rates ── -->
      <div class="form-step" data-step="4">
        <h2 class="step-h">Set your rates</h2>
        <p class="step-sub">The range above is a guide. Set what feels right for your work.</p>

        <label>Hourly rate (R/hr)</label>
        <input name="rate_hourly" type="number" min="0" placeholder="e.g. 500" value="${rateHourly}" />

        <label>3hr package (R)</label>
        <input name="rate_3h" type="number" min="0" placeholder="e.g. 1,200" value="${ratePkgs['3h'] || ''}" />

        <label>4hr package (R)</label>
        <input name="rate_4h" type="number" min="0" placeholder="e.g. 1,800" value="${ratePkgs['4h'] || ''}" />

        <label>Full day 8hr (R)</label>
        <input name="rate_8h" type="number" min="0" placeholder="e.g. 3,500" value="${ratePkgs['8h'] || ''}" />

        <div id="rates" style="margin-top:8px;">
          ${(c.customRates || []).map(r => `
          <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:10px;margin-top:10px;align-items:start;">
            <input name="rate_label" type="text" placeholder="e.g. Branded Reel" value="${esc(r.label)}" />
            <input name="rate_amount" type="number" min="0" value="${r.amount}" />
            <button type="button" onclick="this.parentElement.remove()" style="padding:14px 10px;background:transparent;border:1px solid var(--rule);cursor:pointer;border-radius:2px;font:inherit;">×</button>
            <input name="rate_note" type="text" placeholder="Note (optional)" value="${esc(r.note || '')}" style="grid-column:1 / -1;margin-top:-6px;" />
          </div>`).join('')}
        </div>
        <button type="button" class="add-btn" onclick="addRate()">+ Add custom rate</button>
      </div>
      ` : `
      <!-- ── Steps 4-7 (media kit): Optional depth ── -->

      <!-- Step 4: Bio + Reach -->
      <div class="form-step" data-step="4">
        <h2 class="step-h">Tell your story <span class="optional-badge">Optional</span></h2>
        <p class="step-sub">Enriches your media kit. Skip if you're not ready.</p>

        <label>Reach stats <span style="font-size:8pt;letter-spacing:0;text-transform:none;font-weight:400;">Up to 3 headline numbers</span></label>
        <div id="reach-list">
          ${(reachArr.length ? reachArr : [{}, {}, {}]).slice(0, 3).map(r => `
          <div class="row-2" style="margin-bottom:8px;">
            <input name="reach_value" type="text" placeholder="e.g. 20M+" value="${esc(r.val || r.value || '')}" />
            <input name="reach_label" type="text" placeholder="e.g. FB Monthly Reach" value="${esc(r.lbl || r.label || '')}" />
          </div>`).join('')}
        </div>

        <div style="margin-top:24px;">
          <label>Bio paragraphs</label>
          <div id="bio-paragraphs">
            ${(bioParagraphs.length ? bioParagraphs : ['']).map(p => `
            <textarea name="bio_paragraph" placeholder="A paragraph of your story" style="margin-bottom:10px;">${esc(typeof p === 'string' ? p : '')}</textarea>`).join('')}
          </div>
          <button type="button" class="add-btn" onclick="addBioParagraph()">+ Add paragraph</button>
        </div>
      </div>

      <!-- Step 5: Audience -->
      <div class="form-step" data-step="5">
        <h2 class="step-h">Who's watching <span class="optional-badge">Optional</span></h2>
        <p class="step-sub">Brands use this to qualify audience fit. Skip if you don't have the data.</p>

        <label>Gender split</label>
        <div class="row-2">
          <div>
            <label>Male %</label>
            <input name="audience_male" type="text" placeholder="40" value="${esc(audGender.male || '')}" />
          </div>
          <div>
            <label>Female %</label>
            <input name="audience_female" type="text" placeholder="60" value="${esc(audGender.female || '')}" />
          </div>
        </div>

        <div id="age-list" style="margin-top:20px;">
          <label>Age ranges</label>
          ${(audAge.length ? audAge : [{}, {}]).slice(0, 4).map(a => `
          <div class="row-2" style="margin-bottom:8px;">
            <input name="audience_age_range" type="text" placeholder="e.g. 18-24" value="${esc(a.range || '')}" />
            <input name="audience_age_pct" type="text" placeholder="%" value="${esc(a.percentage || '')}" />
          </div>`).join('')}
          <button type="button" class="add-btn" onclick="addAgeRange()">+ Add range</button>
        </div>

        <div id="loc-list" style="margin-top:20px;">
          <label>Top locations</label>
          ${(audLocs.length ? audLocs : [{}, {}, {}]).slice(0, 5).map(l => {
            const locName = typeof l === 'string' ? l : (l.name || '');
            const locPct  = typeof l === 'string' ? '' : (l.percentage || '');
            return `
          <div class="row-2" style="margin-bottom:8px;">
            <input name="audience_location" type="text" placeholder="e.g. Gauteng" value="${esc(locName)}" />
            <input name="audience_location_pct" type="text" placeholder="% (optional)" value="${esc(locPct)}" />
          </div>`;
          }).join('')}
          <button type="button" class="add-btn" onclick="addLocation()">+ Add location</button>
        </div>
      </div>

      <!-- Step 6: Brands + Work -->
      <div class="form-step" data-step="6">
        <h2 class="step-h">Your brand work <span class="optional-badge">Optional</span></h2>
        <p class="step-sub">Justifies your rate in a brand meeting. Skip if you're just starting out.</p>

        <label>Selected work</label>
        <div id="works">
          ${(c.workPreview && c.workPreview.length ? c.workPreview : [{}]).map(w => `
          <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:10px;margin-bottom:8px;align-items:start;">
            <input name="work_brand" type="text" placeholder="Brand" value="${esc(w.brand || '')}" />
            <input name="work_note" type="text" placeholder="What you did / the result" value="${esc(w.note || '')}" />
            <button type="button" onclick="this.parentElement.remove()" style="padding:14px 10px;background:transparent;border:1px solid var(--rule);cursor:pointer;border-radius:2px;font:inherit;">×</button>
          </div>`).join('')}
        </div>
        <button type="button" class="add-btn" onclick="addWork()">+ Add work</button>

        <div id="brands-list" style="margin-top:28px;">
          <label>Brands worked with</label>
          ${(brandsArr.length ? brandsArr : [{}, {}]).slice(0, 8).map((b, i) => `
          <div style="margin-bottom:14px;padding:14px;border:1px solid var(--rule);border-radius:2px;">
            <div class="row-2">
              <input name="brand_name" type="text" placeholder="Brand name" value="${esc(b.name || '')}" />
              <input name="brand_category" type="text" placeholder="Category" value="${esc(b.category || '')}" />
            </div>
            <input name="brand_${i}_evidence_0" type="text" placeholder="Evidence link (optional)" value="${esc(b.evidence?.[0] || '')}" style="margin-top:8px;" />
            <button type="button" onclick="this.parentElement.remove()" class="remove-btn">Remove</button>
          </div>`).join('')}
          <button type="button" class="add-btn" onclick="addBrand()">+ Add brand</button>
        </div>
      </div>

      <!-- Step 7: Packages + Rates + Contact -->
      <div class="form-step" data-step="7">
        <h2 class="step-h">Packages and rates <span class="optional-badge">Optional</span></h2>
        <p class="step-sub">Structured offerings and custom rates. Skip if you prefer to discuss on enquiry.</p>

        <div id="packages-list">
          ${(packagesArr.length ? packagesArr : [{}, {}]).slice(0, 3).map((p, i) => `
          <div style="margin-bottom:14px;padding:14px;border:1px solid var(--rule);border-radius:2px;">
            <div class="row-2">
              <div>
                <label>Package name</label>
                <input name="package_name" type="text" placeholder="e.g. Basic Campaign" value="${esc(p.name || '')}" />
              </div>
              <div>
                <label>Price</label>
                <input name="package_price" type="text" placeholder="e.g. R50,000" value="${esc(p.price || '')}" />
              </div>
            </div>
            <label>Description</label>
            <textarea name="package_desc" placeholder="What's included. One bullet per line." style="min-height:60px;">${esc(p.description || '')}</textarea>
            <label style="display:inline-flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:9pt;margin-top:6px;">
              <input name="package_highlight" type="checkbox" value="${i}" ${p.highlight ? 'checked' : ''} />
              Highlight this package
            </label>
          </div>`).join('')}
        </div>

        <label style="margin-top:24px;">Hourly rate (R/hr)</label>
        <input name="rate_hourly" type="number" min="0" placeholder="e.g. 500" value="${rateHourly}" />

        <div id="rates" style="margin-top:8px;">
          ${(c.customRates || []).map(r => `
          <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:10px;margin-top:10px;align-items:start;">
            <input name="rate_label" type="text" value="${esc(r.label)}" />
            <input name="rate_amount" type="number" min="0" value="${r.amount}" />
            <button type="button" onclick="this.parentElement.remove()" style="padding:14px 10px;background:transparent;border:1px solid var(--rule);cursor:pointer;border-radius:2px;font:inherit;">×</button>
          </div>`).join('')}
          <button type="button" class="add-btn" onclick="addRate()">+ Add custom rate</button>
        </div>

        <label style="margin-top:24px;">Cell number</label>
        <input name="phone" type="tel" placeholder="+27 82 000 0000" value="${esc(creator?.contact?.phone || '')}">

        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:400;margin-top:4px;">
          <input type="checkbox" name="wa_same" id="wa-same"
            onchange="document.getElementById('wa-field').style.display=this.checked?'none':'block'"
            ${(!creator?.contact?.whatsapp || creator?.contact?.whatsapp === creator?.contact?.phone) ? 'checked' : ''}>
          WhatsApp is the same number
        </label>
        <input name="whatsapp" type="tel" id="wa-field" placeholder="+27 82 000 0000"
          value="${esc(creator?.contact?.whatsapp && creator.contact.whatsapp !== creator?.contact?.phone ? creator.contact.whatsapp : '')}"
          style="display:${(!creator?.contact?.whatsapp || creator?.contact?.whatsapp === creator?.contact?.phone) ? 'none' : 'block'}">

        <label style="margin-top:16px;">Contact note</label>
        <textarea name="contact_note" placeholder="For campaign briefs and partnership proposals...">${esc(contactNote)}</textarea>
      </div>
      `}

      <!-- ── Final step: Recovery ── -->
      <div class="form-step" data-step="${totalSteps}">
        <h2 class="step-h">You're almost there.</h2>
        <p class="step-sub">Save your access so you can edit this ${isRate ? 'rate card' : 'kit'} from any device. We hash both fields before storing — your raw details never persist.</p>

        <label>Your contact</label>
        <input name="recovery_contact" type="text" inputmode="email" autocomplete="email" placeholder="you@example.com or 0821234567" required />

        <label style="margin-top:22px;">Date of birth</label>
        <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px;">
          <input name="recovery_dob_d" type="text" inputmode="numeric" pattern="\\d*" maxlength="2" placeholder="DD" required aria-label="Day" />
          <input name="recovery_dob_m" type="text" inputmode="numeric" pattern="\\d*" maxlength="2" placeholder="MM" required aria-label="Month" />
          <input name="recovery_dob_y" type="text" inputmode="numeric" pattern="\\d*" maxlength="4" placeholder="YYYY" required aria-label="Year" />
        </div>

        <button type="submit" style="margin-top:32px;width:100%;background:var(--black);color:#fff;border:none;padding:18px;font:inherit;font-size:13pt;border-radius:2px;cursor:pointer;letter-spacing:0.03em;">${submitLabel} →</button>
      </div>

    </form>
  </div>

  <!-- Fixed bottom nav (hidden on final step — submit is in the step) -->
  <nav id="wiz-nav" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid var(--rule);padding:14px 24px;display:flex;gap:12px;align-items:center;z-index:20;">
    <button id="btn-wiz-back" type="button" onclick="wizBack()" style="flex:0 0 auto;background:transparent;border:1px solid var(--rule);color:var(--muted);padding:13px 18px;font:inherit;font-size:10pt;border-radius:2px;cursor:pointer;display:none;">← Back</button>
    <button id="btn-wiz-skip" type="button" onclick="wizSkip()" style="flex:1;background:transparent;border:none;color:var(--muted);font:inherit;font-size:10pt;cursor:pointer;text-decoration:underline;text-align:center;display:none;">Skip</button>
    <button id="btn-wiz-next" type="button" onclick="wizNext()" style="flex:2;background:var(--black);color:#fff;border:none;padding:15px;font:inherit;font-size:12pt;border-radius:2px;cursor:pointer;">Next →</button>
  </nav>

  <script>
    // ── Wizard state ──────────────────────────────────────────────────────────
    (function() {
      var TOTAL = ${totalSteps};
      var optional = ${isRate ? '[]' : '[4,5,6,7]'};
      var cur = 1;

      function show(n) {
        document.querySelectorAll('.form-step').forEach(function(s) { s.classList.remove('wiz-active'); });
        var step = document.querySelector('.form-step[data-step="' + n + '"]');
        if (step) step.classList.add('wiz-active');
        cur = n;

        // Progress
        document.getElementById('wiz-bar').style.width = (n / TOTAL * 100) + '%';
        document.getElementById('wiz-step-label').textContent = 'Step ' + n + ' of ' + TOTAL;

        // Back button
        var bb = document.getElementById('btn-wiz-back');
        bb.style.display = n > 1 ? '' : 'none';

        // Skip button (optional steps only, not final)
        var bs = document.getElementById('btn-wiz-skip');
        bs.style.display = (optional.indexOf(n) !== -1 && n < TOTAL) ? '' : 'none';

        // Next button (hidden on final step — submit button is inline)
        var bn = document.getElementById('btn-wiz-next');
        bn.style.display = n === TOTAL ? 'none' : '';

        // Whole nav hidden on final step
        var nav = document.getElementById('wiz-nav');
        nav.style.display = n === TOTAL ? 'none' : '';

        if (n === 3) updateRatePreview();
        window.scrollTo(0, 0);
      }

      window.wizNext = function() { if (cur < TOTAL) show(cur + 1); };
      window.wizBack = function() { if (cur > 1) show(cur - 1); };
      window.wizSkip = function() { if (cur < TOTAL) show(cur + 1); };

      show(1);
    })();

    // ── Live rate preview ─────────────────────────────────────────────────────
    function updateRatePreview() {
      var igF = parseInt(document.querySelector('[name=ig_followers]')?.value) || 0;
      var igE = parseFloat(document.querySelector('[name=ig_engagement]')?.value) || 0;
      var ttF = parseInt(document.querySelector('[name=tt_followers]')?.value) || 0;
      var ttE = parseFloat(document.querySelector('[name=tt_engagement]')?.value) || 0;
      var ytV = parseInt(document.querySelector('[name=yt_avg_views]')?.value) || 0;

      function em(e) { return e > 0 && e < 2 ? 0.8 : e >= 4.1 && e < 8 ? 1.2 : e >= 8 ? 1.5 : 1; }
      function snap(n) { return Math.round(Math.max(100, n) / 50) * 50; }
      function fmt(n) { return 'R' + n.toLocaleString('en-ZA'); }

      var pl = [];
      if (igF > 0) { var s = snap((igF/10000)*150*em(igE)); pl.push({ name:'Instagram', unit:'per post', s:s, lo:snap(s*.8), hi:snap(s*1.2) }); }
      if (ttF > 0) { var s = snap((ttF/10000)*150*1.5*em(ttE)); pl.push({ name:'TikTok', unit:'per reel', s:s, lo:snap(s*.8), hi:snap(s*1.2) }); }
      if (ytV > 0) { var s = snap((ytV/10000)*400*2.5); pl.push({ name:'YouTube', unit:'per dedicated video', s:s, lo:snap(s*.8), hi:snap(s*1.2) }); }

      var el = document.getElementById('rate-preview');
      if (!el) return;
      if (!pl.length) {
        el.innerHTML = '<p style="color:var(--muted);font-size:10pt;text-align:center;padding:20px 0;">Go back and fill in your platform stats to see your range.</p>';
        return;
      }
      var lead = pl.reduce(function(b,p) { return p.s > b.s ? p : b; }, pl[0]);
      el.innerHTML =
        '<div class="rate-range"><span class="rate-num">' + fmt(lead.lo) + '</span>' +
        '<span class="rate-sep">–</span>' +
        '<span class="rate-num">' + fmt(lead.hi) + '</span></div>' +
        '<div class="rate-unit">' + lead.unit + ' · ' + lead.name + '</div>' +
        '<div class="rate-caveat">Organic reach only. Paid content excluded.</div>';
    }

    // ── Photo crop (Cropper.js) ───────────────────────────────────────────────
    var _cropper = null;
    function previewPhoto(input) {
      if (!input.files || !input.files[0]) return;
      var url = URL.createObjectURL(input.files[0]);
      var cropImg = document.getElementById('crop-img');
      cropImg.src = url;
      document.getElementById('photo-drop').style.display = 'none';
      document.getElementById('crop-zone').style.display = 'block';
      if (_cropper) _cropper.destroy();
      _cropper = new Cropper(cropImg, {
        aspectRatio: 317 / 390,    // exact hero photo slot ratio (band 1 left panel)
        viewMode: 1,               // crop box stays inside image
        guides: false,
        center: false,
        background: false,
        autoCropArea: 0.95,
        movable: true,
        zoomable: true,
        rotatable: false,
      });
    }
    function resetPhoto() {
      if (_cropper) { _cropper.destroy(); _cropper = null; }
      document.getElementById('photo-input').value = '';
      document.getElementById('crop-img').src = '';
      document.getElementById('photo-drop').style.display = '';
      document.getElementById('crop-zone').style.display = 'none';
    }

    // Intercept submit: export cropped canvas → replace file input → re-submit
    document.getElementById('wiz-form').addEventListener('submit', function(e) {
      if (!_cropper) return; // no photo selected, pass through
      e.preventDefault();
      var form = this;
      var canvas = _cropper.getCroppedCanvas({ width: 634, height: 780, imageSmoothingQuality: 'high' });
      canvas.toBlob(function(blob) {
        try {
          var dt = new DataTransfer();
          dt.items.add(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
          document.getElementById('photo-input').files = dt.files;
        } catch(err) {
          // DataTransfer not supported (rare) — submit without replacement
        }
        form.submit();
      }, 'image/jpeg', 0.92);
    });

    // ── DOB auto-advance ──────────────────────────────────────────────────────
    (function() {
      var dob = document.querySelectorAll('input[name^="recovery_dob_"]');
      dob.forEach(function(el, i) {
        el.addEventListener('input', function() { if (el.value.length >= el.maxLength && i < dob.length-1) dob[i+1].focus(); });
        el.addEventListener('keydown', function(e) { if (e.key === 'Backspace' && el.value === '' && i > 0) dob[i-1].focus(); });
      });
    })();

    // ── Field helpers ─────────────────────────────────────────────────────────
    function addRate() {
      var wrap = document.getElementById('rates');
      var row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr auto;gap:10px;margin-top:10px;align-items:start;';
      row.innerHTML = '<input name="rate_label" type="text" placeholder="e.g. TikTok Reel" />' +
        '<input name="rate_amount" type="number" min="0" placeholder="Amount" />' +
        '<button type="button" onclick="this.parentElement.remove()" style="padding:14px 10px;background:transparent;border:1px solid var(--rule);cursor:pointer;border-radius:2px;font:inherit;">×</button>' +
        '<input name="rate_note" type="text" placeholder="Note (optional)" style="grid-column:1 / -1;margin-top:-6px;" />';
      wrap.insertBefore(row, wrap.querySelector('.add-btn'));
    }
    function addWork() {
      var wrap = document.getElementById('works');
      var row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:1fr 2fr auto;gap:10px;margin-bottom:8px;align-items:start;';
      row.innerHTML = '<input name="work_brand" type="text" placeholder="Brand" />' +
        '<input name="work_note" type="text" placeholder="What you did / the result" />' +
        '<button type="button" onclick="this.parentElement.remove()" style="padding:14px 10px;background:transparent;border:1px solid var(--rule);cursor:pointer;border-radius:2px;font:inherit;">×</button>';
      wrap.appendChild(row);
    }
    function addBioParagraph() {
      var wrap = document.getElementById('bio-paragraphs');
      if (!wrap) return;
      var t = document.createElement('textarea');
      t.name = 'bio_paragraph'; t.placeholder = 'A paragraph of your story';
      t.style.cssText = 'margin-bottom:10px;min-height:80px;';
      wrap.appendChild(t);
    }
    function addAgeRange() {
      var wrap = document.getElementById('age-list');
      if (!wrap) return;
      var row = document.createElement('div');
      row.className = 'row-2'; row.style.marginBottom = '8px';
      row.innerHTML = '<input name="audience_age_range" type="text" placeholder="e.g. 25-34" /><input name="audience_age_pct" type="text" placeholder="%" />';
      wrap.insertBefore(row, wrap.querySelector('.add-btn'));
    }
    function addLocation() {
      var wrap = document.getElementById('loc-list');
      if (!wrap) return;
      var row = document.createElement('div');
      row.className = 'row-2'; row.style.marginBottom = '8px';
      row.innerHTML = '<input name="audience_location" type="text" placeholder="e.g. Cape Town" /><input name="audience_location_pct" type="text" placeholder="% (optional)" />';
      wrap.insertBefore(row, wrap.querySelector('.add-btn'));
    }
    function addBrand() {
      var wrap = document.getElementById('brands-list');
      if (!wrap) return;
      var i = wrap.querySelectorAll('[name=brand_name]').length;
      var div = document.createElement('div');
      div.style.cssText = 'margin-bottom:14px;padding:14px;border:1px solid var(--rule);border-radius:2px;';
      div.innerHTML = '<div class="row-2"><input name="brand_name" type="text" placeholder="Brand name" /><input name="brand_category" type="text" placeholder="Category" /></div>' +
        '<input name="brand_' + i + '_evidence_0" type="text" placeholder="Evidence link (optional)" style="margin-top:8px;" />' +
        '<button type="button" onclick="this.parentElement.remove()" class="remove-btn">Remove</button>';
      wrap.insertBefore(div, wrap.querySelector('.add-btn'));
    }
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js"></script>
</body>
</html>`;
}

function renderNudge(creator) {
  // Only show for profiles that have no ownership block yet (true drafts).
  // creator.ownership is set when the creator has locked the link to an account.
  if (creator.ownership?.owner_token || creator.owner_id) return '';

  return `
    <div class="nudge">
      <div class="nudge__content">
        <div class="nudge__icon">✨</div>
        <div class="nudge__text">
          <strong>Save your profile</strong>
          <span>Lock this link to your account to edit it from anywhere and see who's viewed it.</span>
        </div>
      </div>
      <div class="nudge__actions">
        <button class="nudge__btn" onclick="openAuthModal()">Save Now</button>
      </div>
    </div>
    
    <div id="auth-modal" class="modal" style="display:none;">
      <div class="modal__overlay" onclick="closeAuthModal()"></div>
      <div class="modal__content">
        <button class="modal__close" onclick="closeAuthModal()">×</button>
        <div class="modal__header">
          <h2>Save your profile</h2>
          <p>Choose how you'd like to sign in. We'll link this ${creator.name ? 'to your account' : 'kit to you'}.</p>
        </div>
        
        <div class="modal__body">
          <button class="auth-btn auth-btn--google" onclick="loginWithGoogle()">
            <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="Google">
            Continue with Google
          </button>
          
          <div class="auth-divider"><span>or use email / whatsapp</span></div>
          
          <div class="auth-group">
            <input type="text" id="auth-identifier" placeholder="Email or WhatsApp number" class="auth-input">
            <button class="auth-btn auth-btn--primary" id="auth-submit" onclick="requestOTP()">Send Magic Link / OTP</button>
          </div>
          
          <div id="otp-group" style="display:none; margin-top:20px;">
            <p style="font-size:0.8rem; margin-bottom:12px; color:rgba(0,0,0,0.6);">Check your messages! Enter the 6-digit code below:</p>
            <input type="text" id="auth-otp" placeholder="000 000" class="auth-input" style="text-align:center; letter-spacing:0.5em; font-weight:700;">
            <button class="auth-btn auth-btn--primary" onclick="verifyOTP()">Verify & Save</button>
          </div>
          
          <p id="auth-error" style="display:none; color:#e11d48; font-size:0.8rem; margin-top:12px;"></p>
        </div>
        
        <div class="modal__footer">
          By continuing, you agree to CreatorHQ's terms of service.
        </div>
      </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="/login.js"></script>
  `;
}

// ---- Landing Page ----

export function renderLandingHTML() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · Media Kits for African Creators</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${ogMeta({
    title: 'CreatorHQ · Media Kits for African Creators',
    description: 'Build a designed, data-backed media kit and rate card. Share a permanent link. Download a PDF. No signup needed.',
    image: absoluteUrl('/og-default.png'),
    url: absoluteUrl('/'),
    type: 'website'
  })}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0a0a0a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="CreatorHQ">
  <style>
    ${localFonts()}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      background: #0a0a0a;
      color: #f8f5f0;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 300;
      font-size: 15px;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    /* noise overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.35;
      pointer-events: none;
      z-index: 0;
    }

    .nav {
      position: relative;
      z-index: 1;
      padding: 2.5rem 4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .nav__logo {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }
    .nav__tag {
      font-size: 0.58rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 0.3rem 0.75rem;
      border-radius: 100px;
    }

    /* Hero is a two-column grid: copy left, image-with-phone-frame right.
       On mobile it stacks (image on top, copy below) — image-dominant layout
       per the gallery direction. The photo is Khanyi's locked portrait; the
       phone frame floats over its lower-left, showing the kit's cover crop. */
    .hero {
      position: relative;
      z-index: 1;
      flex: 1;
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 3rem;
      align-items: center;
      padding: 5rem 4rem 5rem;
      max-width: 1180px;
      margin: 0 auto;
      width: 100%;
    }
    .hero__copy { display: flex; flex-direction: column; }
    .hero__visual {
      position: relative;
      aspect-ratio: 4 / 5;
      max-width: 480px;
      width: 100%;
      justify-self: end;
    }
    /* The hero photo is treated transparently — no brightness filter, no
       overlay. Whatever Mow supplies is what renders. The image itself is
       the contrast move; CSS stays out of the way. object-position can be
       tweaked via the inline style attribute on the img tag if a future
       photo needs different framing. */
    .hero__photo {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
      border-radius: 4px;
    }
    /* The phone-shaped card floats over the lower-left of the photo and shows
       Khanyi's cover crop: portrait + name + handle. Generic phone outline
       (no notch, no status bar). Square-on, no tilt. Editorial, not SaaS. */
    .hero__phone {
      position: absolute;
      bottom: -1.5rem;
      left: -1.5rem;
      width: 52%;
      max-width: 220px;
      aspect-ratio: 9 / 19;
      background: #0a0a0a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 22px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .hero__phone-photo {
      width: 100%;
      height: 62%;
      object-fit: cover;
      object-position: center 30%;
    }
    .hero__phone-text {
      flex: 1;
      padding: 0.85rem 0.9rem 1rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      background: linear-gradient(180deg, rgba(10,10,10,0) 0%, #0a0a0a 30%);
      margin-top: -3rem;
      position: relative;
    }
    .hero__phone-eyebrow {
      font-size: 0.42rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      margin-bottom: 0.35rem;
    }
    .hero__phone-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.05rem;
      line-height: 1.05;
      color: #f8f5f0;
      letter-spacing: -0.01em;
    }
    .hero__phone-name em { font-style: italic; color: rgba(248,245,240,0.65); }
    .hero__phone-handle {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.55rem;
      color: rgba(255,255,255,0.4);
      margin-top: 0.35rem;
      letter-spacing: 0.04em;
    }
    .hero__eyebrow {
      font-size: 0.58rem;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
      margin-bottom: 2.5rem;
    }
    .hero__title {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: clamp(3.5rem, 7vw, 7rem);
      line-height: 0.92;
      letter-spacing: -0.02em;
      color: #f8f5f0;
      margin-bottom: 2.5rem;
      max-width: 14ch;
    }
    .hero__title em {
      font-style: italic;
      color: rgba(248,245,240,0.3);
    }
    .hero__rule { width: 32px; height: 1px; background: rgba(255,255,255,0.15); margin-bottom: 2rem; }
    .hero__sub {
      font-size: 1rem;
      color: rgba(255,255,255,0.35);
      max-width: 44ch;
      line-height: 1.8;
      margin-bottom: 3.5rem;
    }
    .hero__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: #f8f5f0;
      color: #0a0a0a;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 1rem 2rem;
      border-radius: 100px;
      transition: opacity 0.2s;
      width: fit-content;
    }
    .hero__cta:hover { opacity: 0.88; }
    .hero__cta svg { flex-shrink: 0; }

    /* CTA cluster: primary (Media Kit) + secondary (Rate Card) + small link (Calculator) */
    .hero__cta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .hero__cta--ghost {
      background: transparent;
      color: rgba(248,245,240,0.9);
      border: 1px solid rgba(255,255,255,0.18);
    }
    .hero__cta--ghost:hover { background: rgba(255,255,255,0.04); opacity: 1; }
    /* "Calculate my rate" tertiary link — Mongezi flagged it as invisible.
       Now: paper-coloured, underlined with offset, same letter-spacing as
       the CTAs. Reads as a deliberate side-door, not a footnote. */
    .hero__calc {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 400;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #f8f5f0;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 5px;
      transition: opacity 0.2s;
    }
    .hero__calc:hover { opacity: 0.7; }

    .proof {
      position: relative;
      z-index: 1;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding: 4rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: rgba(255,255,255,0.04);
      max-width: 1100px;
      margin: 0 auto;
      width: 100%;
    }
    .proof__item {
      background: #0a0a0a;
      padding: 2.5rem 2rem;
    }
    .proof__num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.8rem;
      font-weight: 300;
      color: #f8f5f0;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .proof__num em { font-style: italic; color: rgba(248,245,240,0.25); }
    .proof__label {
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
    }
    .proof__desc {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.3);
      line-height: 1.7;
      margin-top: 1rem;
    }

    .foot {
      position: relative;
      z-index: 1;
      padding: 2.5rem 4rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .foot__credit { font-size: 0.52rem; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.1); }
    .foot__credit span { color: rgba(255,255,255,0.22); }
    .foot__link { font-size: 0.52rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.15); text-decoration: none; }
    .foot__link:hover { color: rgba(255,255,255,0.35); }

    @media (max-width: 860px) {
      /* Mobile-first: image dominant on top, copy below as caption.
         Magazine-cover logic — the photo carries the message. */
      .hero {
        grid-template-columns: 1fr;
        padding: 2.5rem 1.5rem 4rem;
        gap: 2.5rem;
      }
      .hero__visual {
        order: 1;
        max-width: 100%;
        aspect-ratio: 4 / 5;
        justify-self: stretch;
      }
      .hero__copy { order: 2; }
      .hero__phone { width: 44%; max-width: 180px; bottom: -1rem; left: -0.75rem; }
      .hero__title { font-size: clamp(2.6rem, 11vw, 4rem); }
      .hero__sub { font-size: 0.92rem; margin-bottom: 2rem; }
      .proof { grid-template-columns: 1fr; padding: 0; }
      .foot { flex-direction: column; gap: 0.8rem; padding: 2rem 1.5rem; }
    }
    @media (max-width: 480px) {
      .hero__phone { width: 50%; max-width: 160px; }
    }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'landing' })}

  <main class="hero">
    <div class="hero__copy">
      <div class="hero__eyebrow">For African Creators</div>
      <h1 class="hero__title">Your kit.<br><em>Your rate. Your terms.</em></h1>
      <div class="hero__rule"></div>
      <p class="hero__sub">A designed, data-backed media kit you can build in five minutes and share tonight. No signup. No screenshots. No guessing what to charge.</p>
      <div class="hero__cta-row">
        <a href="/new?rate-card=1" class="hero__cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Get my rate card
        </a>
        <a href="/new" class="hero__cta hero__cta--ghost">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Build my media kit
        </a>
      </div>
      <a href="/calculator" class="hero__calc">
        Not sure what to charge? Calculate my rate →
      </a>
    </div>
    <div class="hero__visual">
      <img class="hero__photo" src="/uploads/pnkr6y9NW0.JPG" alt="" loading="eager" fetchpriority="high">
      <div class="hero__phone" aria-hidden="true">
        <img class="hero__phone-photo" src="/uploads/pnkr6y9NW0.JPG" alt="">
        <div class="hero__phone-text">
          <div class="hero__phone-eyebrow">Media Kit · 2026</div>
          <div class="hero__phone-name">Khanyisile<br><em>Khumalo</em></div>
          <div class="hero__phone-handle">@khanyisilekhumalo · Tembisa</div>
        </div>
      </div>
    </div>
  </main>

  <section class="proof">
    <div class="proof__item">
      <div class="proof__num">Media <em>Kit</em></div>
      <div class="proof__label">Not just a rate card</div>
      <div class="proof__desc">A full scrollable page. Your story, your numbers, your brands, your rates. Shareable link. PDF on demand.</div>
    </div>
    <div class="proof__item">
      <div class="proof__num">ZAR <em>Rates</em></div>
      <div class="proof__label">Built for South Africa</div>
      <div class="proof__desc">Built-in calculator uses your actual follower and engagement data to generate baseline SA rates. No guessing.</div>
    </div>
    <div class="proof__item">
      <div class="proof__num">Live <em>Link</em></div>
      <div class="proof__label">Always up to date</div>
      <div class="proof__desc">Your kit lives at a permanent link. Update your numbers any time. Brands always see your latest self.</div>
    </div>
  </section>

  ${renderTrustStrip()}

  <!-- Closing CTA section. Confident closing move after a visitor has read
       the testimonial + proof. Repeats the hero buttons because by the time
       someone reaches here they're warm and ready. Italic Cormorant headline
       in the same register as the rest. -->
  <section class="close-cta" style="padding:6rem 2rem; text-align:center; border-top:1px solid rgba(248,245,240,0.06);">
    <h2 style="font-family:'Cormorant Garamond', serif; font-style:italic; font-weight:300; font-size:clamp(2.2rem, 5vw, 3.4rem); color:#f8f5f0; margin-bottom:2.5rem; letter-spacing:-0.01em; line-height:1.1;">Build yours today. In minutes.</h2>
    <div class="hero__cta-row" style="justify-content:center; margin-bottom:2rem;">
      <a href="/new?rate-card=1" class="hero__cta">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Get my rate card
      </a>
      <a href="/new" class="hero__cta hero__cta--ghost">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Build my media kit
      </a>
    </div>
    <a href="/calculator" class="hero__calc">or calculate my rate →</a>
  </section>

  <footer class="foot">
    <div class="foot__credit">Built in Johannesburg, for African creators.</div>
    <div style="display:flex; gap:1.25rem; font-family:'Instrument Sans',sans-serif; font-size:0.6rem; letter-spacing:0.18em; text-transform:uppercase;">
      <a href="/about" style="color:rgba(248,245,240,0.4); text-decoration:none;">About</a>
      <a href="/privacy" style="color:rgba(248,245,240,0.4); text-decoration:none;">Privacy</a>
      <a href="/terms" style="color:rgba(248,245,240,0.4); text-decoration:none;">Terms</a>
    </div>
  </footer>
</body>
</html>`;
}

// ---- Calculator Page ----

export function renderCalculatorHTML() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · Rate Wizard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${localFonts()}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #f0ece4;
      color: #0a0a0a;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 300;
      font-size: 15px;
      line-height: 1.65;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .wrap { max-width: 640px; margin: 0 auto; padding: 4rem 1.5rem 6rem; }
    .eyebrow { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(10,10,10,0.45); margin-bottom: 1rem; }
    h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2.5rem, 6vw, 4rem); line-height: 1; letter-spacing: -0.02em; margin-bottom: 3rem; }
    h1 em { font-style: italic; color: rgba(10,10,10,0.35); }
    
    .wizard-step { display: none; animation: fadeIn 0.4s ease-out; }
    .wizard-step.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .card { background: #fff; padding: 2.5rem; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    .platform-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #0a0a0a; margin-bottom: 1.5rem; display: block; }
    .stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; color: rgba(10,10,10,0.55); margin-bottom: 0.5rem; }
    input[type="number"], select { width: 100%; padding: 0.85rem 1rem; border: 1px solid rgba(0,0,0,0.1); background: #fff; font: inherit; font-size: 1rem; border-radius: 4px; }
    
    .btn-row { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn { font: inherit; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 1.1rem 2.2rem; border-radius: 100px; cursor: pointer; text-decoration: none; border: none; transition: all 0.2s; }
    .btn--primary { background: #0a0a0a; color: #fff; }
    .btn--ghost { background: transparent; color: #0a0a0a; border: 1px solid rgba(0,0,0,0.15); }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

    .result-panel { background: #0a0a0a; color: #fff; padding: 3rem; border-radius: 4px; }
    .res-head { font-family: 'Cormorant Garamond', serif; font-size: 4rem; line-height: 1; margin-bottom: 0.5rem; }
    .res-sub { font-size: 0.9rem; color: rgba(255,255,255,0.4); margin-bottom: 2rem; }
    .res-breakdown { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
    .break-row { display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .break-l { font-size: 0.85rem; color: rgba(255,255,255,0.6); }
    .break-v { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'calculator' })}
  <div class="wrap">
    <div class="eyebrow">Rate Wizard</div>
    <h1 id="wiz-title">Step 1: <em>Metrics.</em></h1>

    <div id="step-1" class="wizard-step active">
      <div class="card">
        <span class="platform-label">Instagram Baseline</span>
        <div class="stat-row">
          <div><label>Followers</label><input type="number" id="ig_f" placeholder="0"></div>
          <div><label>Engagement %</label><input type="number" id="ig_e" step="0.1" placeholder="0.0"></div>
        </div>
        <span class="platform-label">TikTok Baseline</span>
        <div class="stat-row">
          <div><label>Followers</label><input type="number" id="tt_f" placeholder="0"></div>
          <div><label>Engagement %</label><input type="number" id="tt_e" step="0.1" placeholder="0.0"></div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn--primary" onclick="next(2)">Next Step →</button>
      </div>
    </div>

    <div id="step-2" class="wizard-step">
      <div class="card">
        <span class="platform-label">YouTube & Quality</span>
        <div class="stat-row">
          <div><label>Subscribers</label><input type="number" id="yt_s" placeholder="0"></div>
          <div><label>Avg Views</label><input type="number" id="yt_v" placeholder="0"></div>
        </div>
        <label>Audience Niche Fit</label>
        <select id="niche_fit">
          <option value="standard">Standard / General</option>
          <option value="high">High Affinity / Tight Niche</option>
          <option value="premium">Premium / Luxury / Specialist</option>
        </select>
      </div>
      <div class="btn-row">
        <button class="btn btn--ghost" onclick="next(1)">← Back</button>
        <button class="btn btn--primary" onclick="calculate()">See Results</button>
      </div>
    </div>

    <div id="step-3" class="wizard-step">
      <div class="result-panel">
        <div class="eyebrow" style="color:rgba(255,255,255,0.4)">Defensible Baseline</div>
        <div class="res-head">R<span id="res-val">0</span></div>
        <div class="res-sub">Estimated per branded asset (Lead platform: <span id="res-lead">...</span>)</div>
        
        <div class="res-breakdown" id="res-break"></div>

        <div style="margin-top:2.5rem; display:flex; gap:1rem;">
          <a id="cta-card" href="/new?rate-card=1" class="btn btn--primary" style="background:#fff; color:#000;">Build Rate Card</a>
          <a href="/new" class="btn btn--ghost" style="color:#fff; border-color:rgba(255,255,255,0.2)">Full Kit</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    function next(s) {
      document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
      document.getElementById('step-' + s).classList.add('active');
      const titles = ['Metrics.', 'Niche & Fit.', 'Results.'];
      document.getElementById('wiz-title').innerHTML = 'Step ' + s + ': <em>' + titles[s-1] + '</em>';
    }

    async function calculate() {
      const payload = {
        ig: { followers: Number(document.getElementById('ig_f').value), engagement: Number(document.getElementById('ig_e').value) },
        tt: { followers: Number(document.getElementById('tt_f').value), engagement: Number(document.getElementById('tt_e').value) },
        yt: { subscribers: Number(document.getElementById('yt_s').value), avgViews: Number(document.getElementById('yt_v').value) },
        nicheFit: document.getElementById('niche_fit').value
      };

      const res = await fetch('/api/calculate/overall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.error) { alert(json.error); return; }

      document.getElementById('res-val').textContent = Number(json.baseline).toLocaleString('en-ZA');
      document.getElementById('res-lead').textContent = json.leadPlatform || '...';
      
      const breakEl = document.getElementById('res-break');
      breakEl.innerHTML = '';
      (json.breakdown || []).forEach(b => {
        breakEl.innerHTML += \`<div class="break-row"><div class="break-l">\${b.platform}</div><div class="break-v">R\${Number(b.suggested).toLocaleString('en-ZA')}</div></div>\`;
      });

      const params = new URLSearchParams({ 'rate-card': '1', 'seed_rate': json.baseline });
      document.getElementById('cta-card').href = '/new?' + params.toString();
      
      next(3);
    }
  </script>
</body>
</html>`;
}
