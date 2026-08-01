import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Downloads a remote badge image (e.g. from images.credly.com), resizes it to
 * a small optimized WebP (52px wide = 2x of the 26px displayed size), and
 * saves it under src/assets/<profile>/badges/<id>.webp.
 *
 * Returns the app-relative path to use as the new `imageUrl` in data.json
 * (e.g. "assets/Sergio/badges/<id>.webp"). If the file was already
 * downloaded previously, skips the network call and returns the same path.
 */
export async function downloadAndOptimizeBadge(imageUrl, profile, root) {
  const idMatch = imageUrl.match(/images\/([a-f0-9-]+)/i);
  const id = idMatch ? idMatch[1] : imageUrl.split('/').filter(Boolean).pop().replace(/\W+/g, '');

  const outDir = join(root, 'src', 'assets', profile, 'badges');
  const outPath = join(outDir, `${id}.webp`);
  const relPath = `assets/${profile}/badges/${id}.webp`;

  if (existsSync(outPath)) {
    return relPath;
  }

  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to download badge image: ${imageUrl} (HTTP ${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());

  mkdirSync(outDir, { recursive: true });

  await sharp(buffer)
    .resize({ width: 52, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outPath);

  return relPath;
}
