# Sergio Parissi Reyes — Online CV

Personal CV website with a futuristic Apple-inspired design, deployed automatically to Netlify via GitHub Actions.

*Sitio web de CV personal con diseño futurista estilo Apple, desplegado automáticamente a Netlify mediante GitHub Actions.*

---

## Live Site / Sitio en vivo

| Platform / Plataforma | URL |
|---|---|
| GitHub Pages | `https://sparissiasap.github.io/cv/` |
| Netlify | See your [Netlify dashboard](https://app.netlify.com) / Ver tu [panel de Netlify](https://app.netlify.com) |

---

## Project Structure / Estructura del Proyecto

```
cv-site/
├── index.html                  # Main document — all CV content lives here
│                               # Documento principal — todo el contenido del CV
├── css/
│   └── styles.css              # All styles: tokens, animations, layout, components
│                               # Todos los estilos: tokens, animaciones, layout
├── js/
│   └── certificates.js         # Certificate gallery data array + modal logic
│                               # Array de datos de la galería + lógica del modal
├── pdf/                        # Local PDF files for the certificate viewer
│                               # Archivos PDF locales para el visor de certificados
│   ├── Sitecore.pdf
│   ├── Professional Scrum Developer I.pdf
│   └── certificate-*.pdf       # Anthropic Academy completions / Completaciones
├── perfil.png                  # Profile photo / Foto de perfil
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: auto-deploys to Netlify on push to master
└── .netlify/
    └── netlify.toml            # Netlify build settings / Configuración de Netlify
```

---

## Architecture Decisions / Decisiones de Arquitectura

### CSS Custom Properties (Design Tokens)

All colors, gradients, radii, and font sizes are defined as variables in `:root` inside `styles.css`. Changing a token propagates everywhere — no hunting through the file.

*Todos los colores, gradientes, radios y tamaños de fuente están definidos como variables en `:root` dentro de `styles.css`. Cambiar un token se propaga a todo el sitio sin tener que buscar en el archivo.*

```css
:root {
  --accent:   #0071e3;
  --accent2:  #5856d6;
  --grad:     linear-gradient(135deg, #0071e3, #5856d6);
  --glass-bg: rgba(255,255,255,0.04);
  --radius:   18px;
}
```

---

### CSS-Only Background Animation / Animación de fondo solo con CSS

The animated background orbs use **no JavaScript and no canvas** — only CSS `@keyframes` + `transform`. This keeps performance high even on low-end devices.

*Los orbs animados del fondo no usan **JavaScript ni canvas** — solo CSS `@keyframes` + `transform`. Esto mantiene el rendimiento alto incluso en dispositivos de gama baja.*

```html
<!-- index.html — right after <body> / justo después de <body> -->
<div class="bg-fx">
  <div class="orb o1"></div>
  <div class="orb o2"></div>
  <div class="orb o3"></div>
  <div class="orb o4"></div>
</div>
```

Each `.orb` has its own `drift` keyframe (`drift1`–`drift4`) so they move independently.

*Cada `.orb` tiene su propio keyframe `drift` (`drift1`–`drift4`) para que se muevan de forma independiente.*

---

### Skill Bar Animation / Animación de barras de habilidad

The proficiency bars are driven by a CSS custom property (`--w`) set inline per bar. They only animate *after* the page has loaded — `body.loaded` triggers the transition.

*Las barras de nivel están controladas por una propiedad CSS personalizada (`--w`) definida inline en cada barra. Solo se animan **después** de que carga la página — la clase `body.loaded` dispara la transición.*

```html
<div class="eb-fill" style="--w:95%"></div>
```

```css
/* Only plays when body has the .loaded class */
/* Solo se activa cuando body tiene la clase .loaded */
body.loaded .eb-fill { width: var(--w); }
```

```js
// certificates.js — fires 200ms after DOMContentLoaded
// Se ejecuta 200ms después de DOMContentLoaded
setTimeout(() => document.body.classList.add('loaded'), 200);
```

---

### Certificate Gallery — Data-Driven / Galería de Certificados — Basada en Datos

All certificates in the bottom gallery are defined as a plain JavaScript array in `certificates.js`. To add a cert you only touch the data, never the HTML.

*Todos los certificados de la galería inferior están definidos como un array de JavaScript en `certificates.js`. Para agregar uno solo se modifica el dato, nunca el HTML.*

```js
const certs = [
  {
    title: 'Certificate Name',
    issuer: 'Issuer',
    date: 'Apr 2026',
    file: 'pdf/filename.pdf',   // local PDF, or '' for URL-only / PDF local, o '' si no hay
    url: '',                    // Credly / external link (optional) / enlace externo (opcional)
    badge: '🎓'
  },
  // ...
];
```

---

### CI/CD (GitHub Actions → Netlify)

Every push to `master` triggers `.github/workflows/deploy.yml`, which runs `netlify-cli deploy --prod`. No manual deploys needed. Secrets (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`) are stored in the GitHub repo under *Settings → Secrets and variables → Actions*.

*Cada push a `master` activa `.github/workflows/deploy.yml`, que ejecuta `netlify-cli deploy --prod`. No se necesitan deploys manuales. Los secretos (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`) están guardados en el repo de GitHub en *Settings → Secrets and variables → Actions*.*

---

## How to Make Common Changes / Cómo Hacer Cambios Frecuentes

---

### Add a new skill pill / Agregar una skill pill

Open `index.html`, find the relevant `skill-group`, and add a `<span>`.

*Abre `index.html`, encuentra el `skill-group` correspondiente y agrega un `<span>`.*

```html
<div class="skill-group">
  <div class="skill-group-label">Cloud &amp; DevOps</div>
  <div class="skill-pills">
    <span class="pill primary">Azure</span>   <!-- .primary = blue highlight / resaltado azul -->
    <span class="pill">Your New Skill</span>  <!-- regular pill / pill estándar -->
  </div>
</div>
```

Use `class="pill primary"` for skills you want to stand out; plain `class="pill"` for the rest.

*Usa `class="pill primary"` para las skills que quieres destacar; `class="pill"` para las demás.*

---

### Add a new proficiency bar / Agregar una barra de nivel

In the `exp-bars` block inside `index.html`, copy an existing bar and adjust `--w`.

*En el bloque `exp-bars` dentro de `index.html`, copia una barra existente y ajusta `--w`.*

```html
<div class="exp-bar">
  <div class="eb-meta">
    <span class="eb-name">Your Skill / Tu Skill</span>
    <span class="eb-tag">Advanced &nbsp;·&nbsp; 3+ yrs</span>
  </div>
  <div class="eb-track">
    <div class="eb-fill" style="--w:70%"></div>  <!-- 0–100% -->
  </div>
</div>
```

---

### Add a certification to the sidebar / Agregar una certificación al sidebar

Find the `<!-- CERTIFICATIONS -->` card in `index.html`.

*Busca la tarjeta `<!-- CERTIFICATIONS -->` en `index.html`.*

```html
<div class="cert-item">
  <div class="cert-dot gold"></div>   <!-- gold = featured / destacado; omitir para estándar -->
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

### Add a certificate to the gallery / Agregar un certificado a la galería

1. Drop the PDF into the `/pdf/` folder. / *Copia el PDF en la carpeta `/pdf/`.*
2. Open `js/certificates.js` and add an entry to the `certs` array. / *Abre `js/certificates.js` y agrega una entrada al array `certs`.*

```js
{
  title: 'Certificate Title',
  issuer: 'Issuing Organization',
  date: 'Jun 2026',
  file: 'pdf/your-file.pdf',      // '' if no local PDF / '' si no hay PDF local
  url: 'https://credly.com/...',  // '' if no external link / '' si no hay enlace externo
  badge: '🏆'
}
```

The gallery rebuilds automatically on every page load — no HTML changes needed.

*La galería se reconstruye automáticamente en cada carga de página — no se necesitan cambios en el HTML.*

---

### Add a new work experience entry / Agregar una entrada de experiencia

Copy this block inside `<div class="timeline">` in `index.html`.

*Copia este bloque dentro de `<div class="timeline">` en `index.html`.*

```html
<div class="timeline-item">
  <div class="timeline-dot-col">
    <div class="timeline-dot current"></div>  <!-- remove "current" if not present job -->
                                              <!-- quitar "current" si no es trabajo actual -->
    <div class="timeline-line"></div>
  </div>
  <div>
    <div class="job-meta">
      <div>
        <div class="job-title-text">Your Title / Tu Título</div>
        <div class="job-company-text">Company Name / Empresa</div>
      </div>
      <div style="text-align:right">
        <div class="job-date-text">Mon YYYY – Present</div>
        <div class="job-location-text">City, Country (Remote)</div>
      </div>
    </div>
    <ul class="job-bullets">
      <li>Achievement or responsibility. / Logro o responsabilidad.</li>
    </ul>
  </div>
</div>
```

---

### Update the hero stats / Actualizar las estadísticas del hero

Find the `.hero-stats` block in `index.html` and edit the numbers and labels directly.

*Busca el bloque `.hero-stats` en `index.html` y edita los números y etiquetas directamente.*

```html
<div class="hero-stats">
  <div class="stat-item">
    <div class="stat-number">10+</div>
    <div class="stat-label">Years .NET</div>
  </div>
  <!-- copy a stat-item to add more / copia un stat-item para agregar más -->
</div>
```

---

### Change the color scheme / Cambiar el esquema de colores

Edit the `:root` block at the top of `css/styles.css`.

*Edita el bloque `:root` al inicio de `css/styles.css`.*

```css
:root {
  --accent:  #0071e3;   /* primary blue / azul principal */
  --accent2: #5856d6;   /* secondary purple / morado secundario */
  --grad:    linear-gradient(135deg, #0071e3, #5856d6);
}
```

Changing `--accent` and `--accent2` updates buttons, bars, glow effects, and links everywhere.

*Cambiar `--accent` y `--accent2` actualiza botones, barras, efectos de brillo y enlaces en todo el sitio.*

---

### Add another background orb / Agregar otro orb al fondo

In `index.html`, add `<div class="orb o5"></div>` inside `.bg-fx`, then define it in `css/styles.css`.

*En `index.html`, agrega `<div class="orb o5"></div>` dentro de `.bg-fx`, luego defínelo en `css/styles.css`.*

```css
.o5 {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(0,200,100,0.18) 0%, transparent 70%);
  top: 60%; left: 70%;
  animation: drift3 28s ease-in-out infinite 3s; /* reuse any drift keyframe / reutiliza cualquier drift */
}
```

---

## Deployment / Despliegue

Any push to `master` deploys automatically. / *Cualquier push a `master` despliega automáticamente.*

```bash
git add .
git commit -m "your message / tu mensaje"
git push origin master
```

Monitor at [app.netlify.com](https://app.netlify.com) or in the **Actions** tab of the GitHub repo.

*Monitorea en [app.netlify.com](https://app.netlify.com) o en la pestaña **Actions** del repositorio de GitHub.*

---

## Tech Stack / Stack Tecnológico

| Tool / Herramienta | Role / Rol |
|---|---|
| Plain HTML/CSS/JS | No framework — full control, zero build step / Sin framework — control total, sin compilación |
| Inter (Google Fonts) | Typography / Tipografía |
| GitHub Actions | CI/CD trigger / Disparador de CI/CD |
| Netlify CLI | Hosting & deployment / Hosting y despliegue |
| GitHub Pages | Alternate mirror / Espejo alternativo |
