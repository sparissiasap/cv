# Sergio Parissi Reyes — CV en línea

> 🇺🇸 [Read in English](README.md)

Sitio web de CV personal con diseño futurista estilo Apple, desplegado automáticamente a Netlify mediante GitHub Actions.

---

## Sitio en vivo

| Plataforma | URL |
|---|---|
| GitHub Pages | `https://sparissiasap.github.io/cv/` |
| Netlify | Ver tu [panel de Netlify](https://app.netlify.com) |

---

## Estructura del Proyecto

```
cv-site/
├── index.html                  # Documento principal — todo el contenido del CV
├── css/
│   └── styles.css              # Todos los estilos: tokens, animaciones, layout, componentes
├── js/
│   └── certificates.js         # Array de datos de la galería de certificados + lógica del modal
├── pdf/                        # Archivos PDF locales para el visor de certificados
│   ├── Sitecore.pdf
│   ├── Professional Scrum Developer I.pdf
│   └── certificate-*.pdf       # Completaciones de Anthropic Academy
├── perfil.png                  # Foto de perfil usada en la sección hero
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: despliega automáticamente a Netlify en cada push a master
└── .netlify/
    └── netlify.toml            # Configuración de Netlify
```

---

## Decisiones de Arquitectura

### CSS Custom Properties (Design Tokens)

Todos los colores, gradientes, radios y tamaños de fuente están definidos como variables en `:root` dentro de `styles.css`. Cambiar un token se propaga a todo el sitio sin tener que buscar por el archivo.

```css
:root {
  --accent:   #0071e3;
  --accent2:  #5856d6;
  --grad:     linear-gradient(135deg, #0071e3, #5856d6);
  --glass-bg: rgba(255,255,255,0.04);
  --radius:   18px;
}
```

### Animación de fondo solo con CSS

Los orbs animados del fondo no usan **JavaScript ni canvas** — solo CSS `@keyframes` + `transform`. Esto mantiene el rendimiento alto incluso en dispositivos de gama baja.

```html
<!-- index.html — justo después de <body> -->
<div class="bg-fx">
  <div class="orb o1"></div>
  <div class="orb o2"></div>
  <div class="orb o3"></div>
  <div class="orb o4"></div>
</div>
```

Cada `.orb` tiene su propio keyframe `drift` (`drift1`–`drift4`) para que se muevan de forma independiente.

### Animación de barras de habilidad (CSS + 1 línea de JS)

Las barras de nivel están controladas por una propiedad CSS personalizada (`--w`) definida inline en cada barra. Solo se animan *después* de que carga la página — la clase `body.loaded` dispara la transición.

```html
<div class="eb-fill" style="--w:95%"></div>
```

```css
/* Solo se activa cuando body tiene la clase .loaded */
body.loaded .eb-fill { width: var(--w); }
```

```js
// certificates.js — se ejecuta 200ms después de DOMContentLoaded
setTimeout(() => document.body.classList.add('loaded'), 200);
```

### Galería de Certificados — Basada en Datos

Todos los certificados de la galería inferior están definidos como un array de JavaScript en `certificates.js`. Para agregar uno solo se modifica el dato, nunca el HTML.

```js
const certs = [
  {
    title: 'Nombre del Certificado',
    issuer: 'Emisor',
    date: 'Apr 2026',
    file: 'pdf/archivo.pdf',  // PDF local, o '' si no hay
    url: '',                  // Enlace externo (Credly, etc.) — opcional
    badge: '🎓'
  },
];
```

### CI/CD (GitHub Actions → Netlify)

Cada push a `master` activa `.github/workflows/deploy.yml`, que ejecuta `netlify-cli deploy --prod`. No se necesitan deploys manuales. Los secretos (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`) están guardados en el repo de GitHub en *Settings → Secrets and variables → Actions*.

---

## Cómo Hacer Cambios Frecuentes

### Agregar una skill pill

Abre `index.html`, encuentra el `skill-group` correspondiente y agrega un `<span>`:

```html
<div class="skill-group">
  <div class="skill-group-label">Cloud &amp; DevOps</div>
  <div class="skill-pills">
    <span class="pill primary">Azure</span>   <!-- .primary = resaltado azul -->
    <span class="pill">Tu Nueva Skill</span>  <!-- pill estándar -->
  </div>
</div>
```

Usa `class="pill primary"` para las skills que quieres destacar; `class="pill"` para las demás.

---

### Agregar una barra de nivel

En el bloque `exp-bars` dentro de `index.html`, copia una barra existente y ajusta `--w`:

```html
<div class="exp-bar">
  <div class="eb-meta">
    <span class="eb-name">Tu Skill</span>
    <span class="eb-tag">Avanzado &nbsp;·&nbsp; 3+ años</span>
  </div>
  <div class="eb-track">
    <div class="eb-fill" style="--w:70%"></div>  <!-- 0–100% -->
  </div>
</div>
```

---

### Agregar una certificación al sidebar

Busca la tarjeta `<!-- CERTIFICATIONS -->` en `index.html`:

```html
<div class="cert-item">
  <div class="cert-dot gold"></div>   <!-- gold = destacado; omitir para estándar -->
  <div class="cert-body">
    <div class="cert-name-text">Nombre del Certificado</div>
    <div class="cert-meta">
      Emisor &nbsp;·&nbsp; Mes Año &nbsp;·&nbsp;
      <a href="https://credly.com/..." target="_blank">Verificar ↗</a>
    </div>
  </div>
</div>
```

---

### Agregar un certificado a la galería (sección inferior)

1. Copia el PDF en la carpeta `/pdf/`.
2. Abre `js/certificates.js` y agrega una entrada al array `certs`:

```js
{
  title: 'Título del Certificado',
  issuer: 'Organización Emisora',
  date: 'Jun 2026',
  file: 'pdf/tu-archivo.pdf',     // '' si no hay PDF local
  url: 'https://credly.com/...',  // '' si no hay enlace externo
  badge: '🏆'
}
```

La galería se reconstruye automáticamente en cada carga de página — no se necesitan cambios en el HTML.

---

### Agregar una entrada de experiencia

Copia este bloque dentro de `<div class="timeline">` en `index.html`:

```html
<div class="timeline-item">
  <div class="timeline-dot-col">
    <div class="timeline-dot current"></div>  <!-- quitar "current" si no es trabajo actual -->
    <div class="timeline-line"></div>
  </div>
  <div>
    <div class="job-meta">
      <div>
        <div class="job-title-text">Tu Título</div>
        <div class="job-company-text">Nombre de la Empresa</div>
      </div>
      <div style="text-align:right">
        <div class="job-date-text">Mes AAAA – Presente</div>
        <div class="job-location-text">Ciudad, País (Remoto)</div>
      </div>
    </div>
    <ul class="job-bullets">
      <li>Logro o responsabilidad.</li>
    </ul>
  </div>
</div>
```

---

### Actualizar las estadísticas del hero

Busca el bloque `.hero-stats` en `index.html` y edita los números y etiquetas directamente:

```html
<div class="hero-stats">
  <div class="stat-item">
    <div class="stat-number">10+</div>
    <div class="stat-label">Años en .NET</div>
  </div>
  <!-- copia un stat-item para agregar más -->
</div>
```

---

### Cambiar el esquema de colores

Edita el bloque `:root` al inicio de `css/styles.css`:

```css
:root {
  --accent:  #0071e3;   /* azul principal */
  --accent2: #5856d6;   /* morado secundario */
  --grad:    linear-gradient(135deg, #0071e3, #5856d6);
}
```

Cambiar `--accent` y `--accent2` actualiza botones, barras, efectos de brillo y enlaces en todo el sitio.

---

### Agregar otro orb al fondo

En `index.html`, agrega `<div class="orb o5"></div>` dentro de `.bg-fx`, luego defínelo en `css/styles.css`:

```css
.o5 {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(0,200,100,0.18) 0%, transparent 70%);
  top: 60%; left: 70%;
  animation: drift3 28s ease-in-out infinite 3s;  /* reutiliza cualquier keyframe drift */
}
```

---

## Despliegue

```bash
# Cualquier push a master despliega automáticamente vía GitHub Actions → Netlify

git add .
git commit -m "tu mensaje"
git push origin master
```

Monitorea el estado en [app.netlify.com](https://app.netlify.com) o en la pestaña **Actions** del repositorio de GitHub.

---

## Stack Tecnológico

| Herramienta | Rol |
|---|---|
| HTML/CSS/JS puro | Sin framework — control total, sin paso de compilación |
| Inter (Google Fonts) | Tipografía |
| GitHub Actions | Disparador de CI/CD |
| Netlify CLI | Hosting y despliegue |
| GitHub Pages | Espejo alternativo |
