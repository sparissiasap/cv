/**
 * add-badge.mjs — Scrapes a Credly badge page and inserts it into the CV data files.
 *
 * Usage:
 *   npm run add-badge-credly -- <credly-badge-url> --profile <name> [--commit]
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

if (!rawUrl) {
  console.error('Usage: npm run add-badge-credly -- <credly-badge-url> --profile <name> [--commit]');
  process.exit(1);
}

const badgeUrl = rawUrl.endsWith('/public_url') ? rawUrl : rawUrl.replace(/\/$/, '') + '/public_url';
const badgeId = badgeUrl.match(/badges\/([a-f0-9-]+)/)?.[1];

if (!badgeId) {
  console.error('Could not extract badge ID from URL:', rawUrl);
  process.exit(1);
}

const MONTHS_EN = { January:'Jan', February:'Feb', March:'Mar', April:'Apr', May:'May', June:'Jun', July:'Jul', August:'Aug', September:'Sep', October:'Oct', November:'Nov', December:'Dec' };
const MONTHS_ES = { January:'Ene', February:'Feb', March:'Mar', April:'Abr', May:'May', June:'Jun', July:'Jul', August:'Ago', September:'Sep', October:'Oct', November:'Nov', December:'Dic' };

console.log('Fetching badge from Credly...');

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

await browser.close();

if (!name || !issuer) {
  console.error('Could not extract badge info from the page.');
  console.error('  name:', name);
  console.error('  issuer:', issuer);
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

const verifyUrl = `https://www.credly.com/badges/${badgeId}/public_url`;

const lineEn = `        { "name": "${name}", "meta": "${metaEn}", "verifyUrl": "${verifyUrl}", "dot": "default" },`;
const lineEs = `        { "name": "${name}", "meta": "${metaEs}", "verifyUrl": "${verifyUrl}", "dot": "default" },`;

function insertBadge(filePath, newLine) {
  let content = readFileSync(filePath, 'utf-8');

  if (content.includes(verifyUrl)) {
    console.log(`  Already present in ${filePath.split('\\').pop()}, skipping.`);
    return false;
  }

  // Insert the new line right before the PSD I line (last item in Certifications)
  const psdPattern = /^( *\{ "name": "Professional Scrum Developer)/m;
  if (!psdPattern.test(content)) {
    throw new Error(`Could not find insertion point in ${filePath}`);
  }

  content = content.replace(psdPattern, newLine + '\n$1');
  writeFileSync(filePath, content, 'utf-8');
  return true;
}

const dataRelEn = `src/assets/${profile}/data.json`;
const dataRelEs = `src/assets/${profile}/data.es.json`;
const dataPath   = resolve(ROOT, dataRelEn);
const dataEsPath = resolve(ROOT, dataRelEs);

console.log(`  Profile: ${profile}\n`);

insertBadge(dataPath, lineEn);
insertBadge(dataEsPath, lineEs);

console.log('\nBadge added:');
console.log(`  Name:   ${name}`);
console.log(`  Issuer: ${issuer}`);
console.log(`  Date:   ${metaEn.split(' · ')[1]}`);
console.log(`  URL:    ${verifyUrl}\n`);

if (shouldCommit) {
  execSync(`git add "${dataRelEn}" "${dataRelEs}"`, { cwd: ROOT, stdio: 'inherit' });
  execSync(`git commit -m "Add Credly badge: ${name}"`, { cwd: ROOT, stdio: 'inherit' });
  execSync(`git push`, { cwd: ROOT, stdio: 'inherit' });
  console.log('Committed and pushed! GitHub Pages deploy triggered.');
}
