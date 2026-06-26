# Sergio Parissi Reyes — Online CV

> 🇲🇽 [Leer en Español](README.es.md)

Personal CV website with a futuristic Apple-inspired design, deployed automatically to Netlify via GitHub Actions.

---

## Live Site

| Platform | URL |
|---|---|
| GitHub Pages | `https://sparissiasap.github.io/cv/` |
| Netlify | See your [Netlify dashboard](https://app.netlify.com) |

---

## Project Structure

```
cv-site/
├── index.html                  # Main document — all CV content lives here
├── css/
│   └── styles.css              # All styles: tokens, animations, layout, components
├── js/
│   └── certificates.js         # Certificate gallery data array + modal logic
├── pdf/                        # Local PDF files for the certificate viewer
│   ├── Sitecore.pdf
│   ├── Professional Scrum Developer I.pdf
│   └── certificate-*.pdf       # Anthropic Academy completions
├── perfil.png                  # Profile photo used in the hero section
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: auto-deploys to Netlify on push to master
└── .netlify/
    └── netlify.toml            # Netlify build settings
```

---

## Architecture Decisions

### CSS Custom Properties (Design Tokens)

All colors, gradients, radii, and font sizes are defined as variables in `:root` inside `styles.css`. Changing a token propagates everywhere — no hunting through the file.

```css
:root {
  --accent:   #0071e3;
  --accent2:  #5856d6;
  --grad:     linear-gradient(135deg, #0071e3, #5856d6);
  --glass-bg: rgba(255,255,255,0.04);
  --radius:   18px;
}
```

### CSS-Only Background Animation

The animated background orbs use **no JavaScript and no canvas** — only CSS `@keyframes` + `transform`. This keeps performance high even on low-end devices.

```html
<!-- index.html — right after <body> -->
<div class="bg-fx">
  <div class="orb o1"></div>
  <div class="orb o2"></div>
  <div class="orb o3"></div>
  <div class="orb o4"></div>
</div>
```

Each `.orb` has its own `drift` keyframe (`drift1`–`drift4`) so they move independently.

### Skill Bar Animation (CSS + 1 JS Line)

The proficiency bars are driven by a CSS custom property (`--w`) set inline per bar. They only animate *after* the page has loaded — `body.loaded` triggers the transition.

```html
<div class="eb-fill" style="--w:95%"></div>
```

```css
/* Only plays when body has the .loaded class */
body.loaded .eb-fill { width: var(--w); }
```

```js
// certificates.js — fires 200ms after DOMContentLoaded
setTimeout(() => document.body.classList.add('loaded'), 200);
```

### Certificate Gallery (Data-Driven)

All certificates in the bottom gallery are defined as a plain JavaScript array in `certificates.js`. To add a cert you only touch the data, never the HTML.

```js
const certs = [
  {
    title: 'Certificate Name',
    issuer: 'Issuer',
    date: 'Apr 2026',
    file: 'pdf/filename.pdf',   // local PDF, or '' for URL-only
    url: '',                    // Credly / external link (optional)
    badge: '🎓'
  },
];
```

### CI/CD (GitHub Actions → Netlify)

Every push to `master` triggers `.github/workflows/deploy.yml`, which runs `netlify-cli deploy --prod`. No manual deploys needed. Secrets (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`) are stored in the GitHub repo under *Settings → Secrets and variables → Actions*.

---

## How to Make Common Changes

### Add a new skill pill

Open `index.html`, find the relevant `skill-group`, and add a `<span>`:

```html
<div class="skill-group">
  <div class="skill-group-label">Cloud &amp; DevOps</div>
  <div class="skill-pills">
    <span class="pill primary">Azure</span>   <!-- .primary = blue highlight -->
    <span class="pill">Your New Skill</span>  <!-- regular pill -->
  </div>
</div>
```

Use `class="pill primary"` for skills you want to stand out; plain `class="pill"` for the rest.

---

### Add a new proficiency bar

In the `exp-bars` block inside `index.html`, copy an existing bar and adjust `--w`:

```html
<div class="exp-bar">
  <div class="eb-meta">
    <span class="eb-name">Your Skill</span>
    <span class="eb-tag">Advanced &nbsp;·&nbsp; 3+ yrs</span>
  </div>
  <div class="eb-track">
    <div class="eb-fill" style="--w:70%"></div>  <!-- 0–100% -->
  </div>
</div>
```

---

### Add a certification to the sidebar

Find the `<!-- CERTIFICATIONS -->` card in `index.html`:

```html
<div class="cert-item">
  <div class="cert-dot gold"></div>   <!-- gold = featured; omit for standard -->
  <div class="cert-body">
    <div class="cert-name-text">Cert Title Here</div>
    <div class="cert-meta">
      Issuer &nbsp;·&nbsp; Month Year &nbsp;·&nbsp;
      <a href="https://credly.com/..." target="_blank">Verify ↗</a>
    </div>
  </div>
</div>
```

---

### Add a certificate to the gallery (bottom section)

1. Drop the PDF into the `/pdf/` folder.
2. Open `js/certificates.js` and add an entry to the `certs` array:

```js
{
  title: 'Certificate Title',
  issuer: 'Issuing Organization',
  date: 'Jun 2026',
  file: 'pdf/your-file.pdf',      // '' if no local PDF
  url: 'https://credly.com/...',  // '' if no external link
  badge: '🏆'
}
```

The gallery rebuilds automatically on every page load — no HTML changes needed.

---

### Add a new work experience entry

Copy this block inside `<div class="timeline">` in `index.html`:

```html
<div class="timeline-item">
  <div class="timeline-dot-col">
    <div class="timeline-dot current"></div>  <!-- remove "current" if not present job -->
    <div class="timeline-line"></div>
  </div>
  <div>
    <div class="job-meta">
      <div>
        <div class="job-title-text">Your Title</div>
        <div class="job-company-text">Company Name</div>
      </div>
      <div style="text-align:right">
        <div class="job-date-text">Mon YYYY – Present</div>
        <div class="job-location-text">City, Country (Remote)</div>
      </div>
    </div>
    <ul class="job-bullets">
      <li>Achievement or responsibility.</li>
    </ul>
  </div>
</div>
```

---

### Update the hero stats bar

Find the `.hero-stats` block in `index.html` and edit the numbers and labels directly:

```html
<div class="hero-stats">
  <div class="stat-item">
    <div class="stat-number">10+</div>
    <div class="stat-label">Years .NET</div>
  </div>
  <!-- copy a stat-item to add more -->
</div>
```

---

### Change the color scheme

Edit the `:root` block at the top of `css/styles.css`:

```css
:root {
  --accent:  #0071e3;   /* primary blue */
  --accent2: #5856d6;   /* secondary purple */
  --grad:    linear-gradient(135deg, #0071e3, #5856d6);
}
```

Changing `--accent` and `--accent2` updates buttons, bars, glow effects, and links everywhere.

---

### Add another background orb

In `index.html`, add `<div class="orb o5"></div>` inside `.bg-fx`, then in `css/styles.css`:

```css
.o5 {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(0,200,100,0.18) 0%, transparent 70%);
  top: 60%; left: 70%;
  animation: drift3 28s ease-in-out infinite 3s;  /* reuse any drift keyframe */
}
```

---

## Deployment

```bash
# Any push to master deploys automatically via GitHub Actions → Netlify

git add .
git commit -m "your message"
git push origin master
```

Monitor deploy status at [app.netlify.com](https://app.netlify.com) or in the **Actions** tab of the GitHub repo.

---

## Tech Stack

| Tool | Role |
|---|---|
| Plain HTML/CSS/JS | No framework — full control, zero build step |
| Inter (Google Fonts) | Typography |
| GitHub Actions | CI/CD trigger |
| Netlify CLI | Hosting & deployment |
| GitHub Pages | Alternate mirror |
