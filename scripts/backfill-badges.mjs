/**
 * backfill-badges.mjs — One-time script to download and optimize all
 * existing Credly badge images referenced in every profile's data.json /
 * data.es.json, replacing the remote Credly URL with a local optimized path.
 *
 * Usage:
 *   node scripts/backfill-badges.mjs
 *
 * Review the changes with `git diff` before committing — this rewrites the
 * `imageUrl` fields in place and adds new files under src/assets/<profile>/badges/.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { downloadAndOptimizeBadge } from './badge-image-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const assetsDir = resolve(ROOT, 'src/assets');

const profiles = readdirSync(assetsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let totalDownloaded = 0;

for (const profile of profiles) {
  for (const fileName of ['data.json', 'data.es.json']) {
    const filePath = resolve(assetsDir, profile, fileName);
    if (!existsSync(filePath)) continue;

    let content = readFileSync(filePath, 'utf-8');
    const urls = [...content.matchAll(/"imageUrl"\s*:\s*"(https:\/\/images\.credly\.com\/[^"]+)"/g)].map(
      (m) => m[1]
    );
    const uniqueUrls = [...new Set(urls)];

    if (uniqueUrls.length === 0) continue;

    console.log(`\n${profile}/${fileName}: ${uniqueUrls.length} remote badge image(s) found`);

    for (const url of uniqueUrls) {
      try {
        const localPath = await downloadAndOptimizeBadge(url, profile, ROOT);
        content = content.split(url).join(localPath);
        totalDownloaded++;
        console.log(`  \u2713 ${url} \u2192 ${localPath}`);
      } catch (err) {
        console.error(`  \u2717 Failed: ${url}\n    ${err.message}`);
      }
    }

    writeFileSync(filePath, content, 'utf-8');
  }
}

console.log(`\nDone. ${totalDownloaded} badge image(s) processed. Review with \`git diff\` before committing.`);
