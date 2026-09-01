import sharp from 'sharp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assetsDir = join(root, 'src', 'assets', 'MisFinanzas');

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_SIZE = 260;
const LOGO_X = 90;
const LOGO_Y = Math.round((HEIGHT - LOGO_SIZE) / 2);

// Fondo con el mismo lenguaje visual que el resto del sitio (orbes difuminados
// sobre un degradado oscuro), pero en verde/dinero en vez del azul/morado de
// los CVs, para que se lea como un producto propio, no como otro perfil.
const background = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06140f"/>
      <stop offset="45%" stop-color="#0b2318"/>
      <stop offset="100%" stop-color="#081018"/>
    </linearGradient>
    <radialGradient id="orb1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0071e3" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0071e3" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#8af0b8"/>
      <stop offset="100%" stop-color="#5dbfde"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <circle cx="960" cy="90" r="360" fill="url(#orb1)"/>
  <circle cx="120" cy="560" r="300" fill="url(#orb2)"/>
  <rect x="${LOGO_X - 24}" y="${LOGO_Y - 24}" width="${LOGO_SIZE + 48}" height="${LOGO_SIZE + 48}" rx="48"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
  <text x="410" y="255" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="72" font-weight="800"
        letter-spacing="-1.5" fill="url(#titleGrad)">MisFinanzas</text>
  <text x="412" y="310" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="27" font-weight="500"
        fill="rgba(255,255,255,0.80)">Escanea tickets. Controla tus gastos. Ahorra.</text>
  <text x="412" y="360" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="20" font-weight="500"
        fill="rgba(255,255,255,0.55)">App gratuita para Android · Sin hojas de cálculo</text>
  <g transform="translate(412, 400)">
    <rect x="0" y="0" width="207" height="46" rx="23" fill="rgba(34,197,94,0.16)" stroke="rgba(34,197,94,0.45)"/>
    <text x="24" y="30" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="18" font-weight="600"
          fill="#8af0b8">Disponible en Google Play</text>
  </g>
</svg>`;

const logoRounded = await sharp(join(assetsDir, 'logo-source.png'))
  .resize(LOGO_SIZE, LOGO_SIZE)
  .composite([{
    input: Buffer.from(
      `<svg width="${LOGO_SIZE}" height="${LOGO_SIZE}"><rect width="${LOGO_SIZE}" height="${LOGO_SIZE}" rx="52" fill="#fff"/></svg>`
    ),
    blend: 'dest-in',
  }])
  .png()
  .toBuffer();

const info = await sharp(Buffer.from(background))
  .composite([{ input: logoRounded, left: LOGO_X, top: LOGO_Y }])
  .webp({ quality: 88 })
  .toFile(join(assetsDir, 'og-image.webp'));

console.log(`✓ src/assets/MisFinanzas/og-image.webp (${Math.round(info.size / 1024)} KB)`);
