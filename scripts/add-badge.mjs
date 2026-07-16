/**
 * add-badge.mjs — Scrapes a Credly badge page and inserts it into the CV data files.
 *
 * Usage:
 *   npm run add-badge-credly -- <credly-badge-url> --profile <name> [--dot default|gold] [--commit]
 *
 * Examples:
 *   npm run add-badge-credly -- https://www.credly.com/badges/b7112cd2-b124-4c29-a9ff-48690d623dfa/public_url --profile Sergio
 *   npm run add-badge-credly -- https://www.credly.com/badges/b7112cd2-b124-4c29-a9ff-48690d623dfa/public_url --profile Sergio --commit
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const argv = process.argv.slice(2);
const rawUrl = argv.find(a => a.includes('credly.com/badges'));
const shouldCommit = argv.includes('--commit');
const profileIdx = argv.indexOf('--profile');
const profile = profileIdx !== -1 ? argv[profileIdx + 1] : 'Sergio';

const dotIdx = argv.indexOf('--dot');
const dot = dotIdx !== -1 ? argv[dotIdx + 1] : 'default';

const allowedDots = new Set(['default', 'gold', 'silver', 'bronze', 'platinum', 'blue']);
if (!allowedDots.has(dot)) {
  console.error(`Invalid --dot value: ${dot}. Allowed: ${Array.from(allowedDots).join(', ')}`);
  process.exit(1);
}

if (!rawUrl) {
  console.error('Usage: npm run add-badge-credly -- <credly-badge-url> --profile <name> [--dot default|gold] [--commit]');
  process.exit(1);
}

const badgeUrl = rawUrl.endsWith('/public_url') ? rawUrl : rawUrl.replace(/\/$/, '') + '/public_url';
const badgeId = badgeUrl.match(/badges\/([a-f0-9-]+)/)?.[1];

if (!badgeId) {
  console.error('Could not extract badge ID from URL:', rawUrl);
  process.exit(1);
}

const verifyUrl = `https://www.credly.com/badges/${badgeId}/public_url`;

const dataRelEn = `src/assets/${profile}/data.json`;
const dataRelEs = `src/assets/${profile}/data.es.json`;
const dataPath   = resolve(ROOT, dataRelEn);
const dataEsPath = resolve(ROOT, dataRelEs);

function alreadyInFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.includes(verifyUrl);
  } catch {
    return false;
  }
}

const existsEn = alreadyInFile(dataPath);
const existsEs = alreadyInFile(dataEsPath);

if (existsEn && existsEs) {
  console.log(`Badge already present in both files. Skipping fetch.\n  ${verifyUrl}`);
  process.exit(0);
}
// --------------------------------------

const MONTHS_EN = { January:'Jan', February:'Feb', March:'Mar', April:'Apr', May:'May', June:'Jun', July:'Jul', August:'Aug', September:'Sep', October:'Oct', November:'Nov', December:'Dec' };
const MONTHS_ES = { January:'Ene', February:'Feb', March:'Mar', April:'Abr', May:'May', June:'Jun', July:'Jul', August:'Ago', September:'Sep', October:'Oct', November:'Nov', December:'Dic' };

console.log('Fetching badge from Credly...');
console.log(`  Profile: ${profile}\n`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(badgeUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
} catch {
  await page.waitForTimeout(2000);
}

const bodyText = await page.evaluate(() => document.body.innerText);

const name       = await page.$eval('h1', el => el.innerText.trim()).catch(() => null);
const issuer     = bodyText.match(/Issued by\s+([^\n]+)/)?.[1]?.trim() ?? null;
const dateIssued = bodyText.match(/Date issued:\s+([^\n]+)/)?.[1]?.trim() ?? null;

const imageUrl =
  await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null)
  ?? await page.$eval('meta[name="twitter:image"]', el => el.content).catch(() => null)
  ?? await page.$$eval('img', imgs => {
      const cand = imgs
        .map(i => i.getAttribute('src') || '')
        .find(src =>
          src &&
          !src.startsWith('data:') &&
          (src.includes('images.credly.com') || src.includes('credly'))
        );
      return cand || null;
    }).catch(() => null);

await browser.close();

if (!name || !issuer || !imageUrl) {
  console.error('Could not extract badge info from the page.');
  console.error('  name:', name);
  console.error('  issuer:', issuer);
  console.error('  imageUrl:', imageUrl);
  process.exit(1);
}

let metaEn = `${issuer} · ???`;
let metaEs = metaEn;

if (dateIssued) {
  const m = dateIssued.match(/(\w+)\s+\d+,?\s+(\d{4})/);
  if (m) {
    metaEn = `${issuer} · ${MONTHS_EN[m[1]] ?? m[1]} ${m[2]}`;
    metaEs = `${issuer} · ${MONTHS_ES[m[1]] ?? m[1]} ${m[2]}`;
  }
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const badgeObjEn = `{ "name": "${esc(name)}", "meta": "${esc(metaEn)}", "verifyUrl": "${esc(verifyUrl)}", "imageUrl": "${esc(imageUrl)}", "dot": "${dot}" }`;
const badgeObjEs = `{ "name": "${esc(name)}", "meta": "${esc(metaEs)}", "verifyUrl": "${esc(verifyUrl)}", "imageUrl": "${esc(imageUrl)}", "dot": "${dot}" }`;

function insertBadge(filePath, newObjLine) {
  let content = readFileSync(filePath, 'utf-8');

  if (content.includes(verifyUrl)) {
    console.log(`  Already present in ${filePath.split('\\').pop()}, skipping.`);
    return false;
  }

  const blockRe = /("type"\s*:\s*"certifications"[\s\S]*?"id"\s*:\s*"credly"[\s\S]*?"items"\s*:\s*\[)([\s\S]*?)(\]\s*)/m;

  const m = content.match(blockRe);
  if (!m) throw new Error(`Could not find certifications block with id="credly" in ${filePath}`);

  const before = m[1];
  const inner  = m[2];
  const after  = m[3];

  const itemsIndent = (before.match(/\n([ \t]*)"items"\s*:\s*\[$/m)?.[1]) ?? '      ';
  const itemIndent = itemsIndent + '  ';

  const oneLine = (s) =>
    String(s)
      .replace(/\r?\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/,\s*$/, '');

  // Extraer objetos existentes y normalizarlos a 1 línea
  const existingObjects = (inner.match(/\{[\s\S]*?\}/g) ?? [])
    .map(oneLine)
    .filter(Boolean);

  const newObj = oneLine(newObjLine);

  // Inserta arriba (o usa push si lo quieres al final)
  const all = [...existingObjects, newObj]; 

  // Reconstruye: una línea por objeto, sin líneas vacías
  const rebuiltLines = all.map((obj, idx) => {
    const comma = idx < all.length - 1 ? ',' : '';
    return `${itemIndent}${obj}${comma}`;
  });

  const rebuilt = `\n${rebuiltLines.join('\n')}\n${itemsIndent}`;

  content = content.replace(blockRe, `${before}${rebuilt}${after}`);
  writeFileSync(filePath, content, 'utf-8');
  return true;
}

const changed = [
  insertBadge(dataPath, badgeObjEn),
  insertBadge(dataEsPath, badgeObjEs),
].some(Boolean);

console.log('\nBadge added:');
console.log(`  Name:   ${name}`);
console.log(`  Issuer: ${issuer}`);
console.log(`  Date:   ${metaEn.split(' · ')[1]}`);
console.log(`  URL:    ${verifyUrl}\n`);

if (shouldCommit) {
  if (!changed) {
    console.log('Nothing to commit (badge already present in all files).');
  } else {
    execSync(`git add "${dataRelEn}" "${dataRelEs}"`, { cwd: ROOT, stdio: 'inherit' });
    execSync(`git commit -m "Add Credly badge: ${name}"`, { cwd: ROOT, stdio: 'inherit' });
    execSync(`git push`, { cwd: ROOT, stdio: 'inherit' });
    console.log('Committed and pushed! GitHub Pages deploy triggered.');
  }
}