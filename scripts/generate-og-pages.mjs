import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist', 'cv-site', 'browser');
const BASE_URL = 'https://sergioparissi.is-a.dev';

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

const profiles = [
  {
    slug: 'sergio',
    title: 'Sergio Parissi Reyes — Senior .NET & Sitecore Specialist',
    description: '10+ years in .NET & C#, 7+ in Sitecore. Azure cloud, AI-assisted development. Senior Software Developer at EPAM Systems.',
    image: `${BASE_URL}/assets/Sergio/og-image.webp`,
    hreflangs: [
      { lang: 'es',        href: `${BASE_URL}/sergio` },
      { lang: 'en',        href: `${BASE_URL}/sergio?lang=en` },
      { lang: 'x-default', href: `${BASE_URL}/sergio` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Sergio Parissi Reyes',
      jobTitle: 'Senior Software Developer',
      description: '10+ years in .NET & C#, 7+ in Sitecore. Azure cloud, AI-assisted development.',
      url: `${BASE_URL}/sergio`,
      image: `${BASE_URL}/assets/Sergio/og-image.webp`,
    },
  },
  {
    slug: 'dafne',
    title: 'Dafne Cuevas — Coordinadora de Operaciones & Logística',
    description: 'Profesional con 9+ años en administración, logística operativa y manejo de personal. Liderazgo de equipos hasta 35 personas · Grupo Xcaret · Cancún, MX.',
    image: `${BASE_URL}/assets/Dafne/perfil.webp`,
    hreflangs: [
      { lang: 'es',        href: `${BASE_URL}/dafne` },
      { lang: 'en',        href: `${BASE_URL}/dafne?lang=en` },
      { lang: 'x-default', href: `${BASE_URL}/dafne` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Dafne Cuevas',
      jobTitle: 'Coordinadora de Operaciones',
      description: 'Profesional con 9+ años en administración, logística operativa y manejo de personal.',
      url: `${BASE_URL}/dafne`,
      image: `${BASE_URL}/assets/Dafne/perfil.webp`,
    },
  },
  {
    slug: 'giovanna',
    title: 'Giovanna Parissi Reyes — Ingeniera Civil · Supervisora de Obra',
    description: 'Ingeniera Civil con más de 6 años en supervisión y residencia de obras hoteleras de gran escala en Cancún. Grand Hyatt, Emporio, ZIVALAM.',
    image: `${BASE_URL}/assets/Giovanna/perfil.webp`,
    hreflangs: [
      { lang: 'es',        href: `${BASE_URL}/giovanna` },
      { lang: 'en',        href: `${BASE_URL}/giovanna?lang=en` },
      { lang: 'x-default', href: `${BASE_URL}/giovanna` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Giovanna Parissi Reyes',
      jobTitle: 'Ingeniera Civil',
      description: 'Ingeniera Civil con más de 6 años en supervisión y residencia de obras hoteleras de gran escala.',
      url: `${BASE_URL}/giovanna`,
      image: `${BASE_URL}/assets/Giovanna/perfil.webp`,
    },
  },
  {
    slug: 'teresina',
    title: 'Teresina Parissi Reyes — Administración · Alta Gerencia',
    description: 'Licenciada en Administración con Maestría en Alta Gerencia e Inteligencia Estratégica. Especialista en control financiero, Aspel SAE/NOI y gestión operativa en Cancún.',
    image: `${BASE_URL}/assets/Teresina/perfil.webp`,
    hreflangs: [
      { lang: 'es',        href: `${BASE_URL}/teresina` },
      { lang: 'en',        href: `${BASE_URL}/teresina?lang=en` },
      { lang: 'x-default', href: `${BASE_URL}/teresina` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Teresina Parissi Reyes',
      jobTitle: 'Administradora',
      description: 'Licenciada en Administración con Maestría en Alta Gerencia e Inteligencia Estratégica.',
      url: `${BASE_URL}/teresina`,
      image: `${BASE_URL}/assets/Teresina/perfil.webp`,
    },
  },
];

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

for (const p of profiles) {
  const url = `${BASE_URL}/${p.slug}`;
  const title = esc(p.title);
  const desc = esc(p.description);

  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:image" content=")[^"]*"/, `$1${p.image}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
    .replace('</head>', [
      p.hreflangs.map(h => `  <link rel="alternate" hreflang="${h.lang}" href="${h.href}">`).join('\n'),
      `  <script type="application/ld+json">${JSON.stringify(p.jsonld)}</script>`,
      '</head>',
    ].join('\n'));

  // Write lowercase and capitalized variants (GitHub Pages is case-sensitive)
  const variants = [p.slug, p.slug[0].toUpperCase() + p.slug.slice(1)];
  for (const dir of variants) {
    const out = join(distDir, dir);
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'index.html'), html);
    console.log(`✓ ${dir}/index.html`);
  }
}

// menu route — copy default index.html
const menuDir = join(distDir, 'menu');
mkdirSync(menuDir, { recursive: true });
writeFileSync(join(menuDir, 'index.html'), template);
console.log('✓ menu/index.html');
