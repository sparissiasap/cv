import sharp from 'sharp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const images = [
  { src: 'src/assets/Sergio/perfil.png',   out: 'src/assets/Sergio/perfil.webp',   quality: 85, width: 150 },
  { src: 'src/assets/Sergio/og-image.png', out: 'src/assets/Sergio/og-image.webp', quality: 85, width: 1200 },
  { src: 'src/assets/Dafne/perfil.jpg',    out: 'src/assets/Dafne/perfil.webp',    quality: 85, width: 150 },
  { src: 'src/assets/Giovanna/perfil.png', out: 'src/assets/Giovanna/perfil.webp', quality: 85, width: 150 },
  { src: 'src/assets/Teresina/perfil.png', out: 'src/assets/Teresina/perfil.webp', quality: 85, width: 150 },
];

for (const { src, out, quality, width } of images) {
  let pipeline = sharp(join(root, src));
  if (width) {
    pipeline = pipeline.resize({ width, withoutEnlargement: true });
  }
  const info = await pipeline.webp({ quality }).toFile(join(root, out));
  const kb = Math.round(info.size / 1024);
  console.log(`✓ ${out} (${kb} KB)`);
}

