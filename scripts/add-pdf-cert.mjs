/**
 * add-pdf-cert.mjs — Adds a local PDF certificate to the repo and registers it in certGallery.certs
 *
 * Usage:
 *   npm run add-pdf-cert -- <pdf-path> --profile <name> --title "<title>" --issuer "<issuer>" --date "Mon YYYY"
 *                        [--type <type>] [--icon <icon>] [--badge <badge>] [--commit]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const argv = process.argv.slice(2);

const shouldCommit = argv.includes('--commit');

const profileIdx = argv.indexOf('--profile');
const profile = profileIdx !== -1 ? argv[profileIdx + 1] : 'Sergio';

const getArg = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : fallback;
};

// First positional arg = pdf path
const pdfPathRaw = argv.find(a => a.toLowerCase().endsWith('.pdf') && !a.startsWith('--'));
if (!pdfPathRaw) {
  console.error('Usage: npm run add-pdf-cert -- <pdf-path> --profile <name> --title "<title>" --issuer "<issuer>" --date "Mon YYYY" [--commit]');
  process.exit(1);
}

const type = getArg('--type', 'other');

const ICON_BY_TYPE = {
  anthropic: '🤖',
  sitecore: '🏗️',
  scrum: '📋',
  credly: '🏅',
  linkedin: '🧑‍🏫',
  azure: '🟦',
  aws: '🟧',
  gcp: '🟩',
  devops: '⚙️',
  security: '🔐',
  other: '📄',
};

const icon = ICON_BY_TYPE[type] ?? ICON_BY_TYPE.other;

const title = getArg('--title');
const issuer = getArg('--issuer');
const date = getArg('--date');
const badge = getArg('--badge', null);

if (!title || !issuer || !date) {
  console.error('Missing required args: --title, --issuer, --date');
  process.exit(1);
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

// Destination folder
const assetsPdfRelDir = `src/assets/${profile}/pdf`;
const assetsPdfAbsDir = resolve(ROOT, assetsPdfRelDir);
mkdirSync(assetsPdfAbsDir, { recursive: true });

// Copy pdf into repo, preserve base name
const srcPdfAbs = resolve(process.cwd(), pdfPathRaw);
if (!existsSync(srcPdfAbs)) {
  console.error('PDF file not found:', srcPdfAbs);
  process.exit(1);
}

const destFileName = basename(srcPdfAbs); // keep original name
const destPdfAbs = resolve(assetsPdfAbsDir, destFileName);
const destPdfRel = `pdf/${destFileName}`; // how certGallery uses it

const allowedTypes = new Set(Object.keys(ICON_BY_TYPE));
if (!allowedTypes.has(type)) {
  console.error(`Invalid --type: ${type}. Allowed: ${Array.from(allowedTypes).join(', ')}`);
  process.exit(1);
}

if (!existsSync(destPdfAbs)) {
  copyFileSync(srcPdfAbs, destPdfAbs);
  console.log(`Copied PDF -> ${assetsPdfRelDir}/${destFileName}`);
} else {
  console.log(`PDF already exists -> ${assetsPdfRelDir}/${destFileName} (skipping copy)`);
}

// JSON files
const dataRelEn = `src/assets/${profile}/data.json`;
const dataRelEs = `src/assets/${profile}/data.es.json`;
const dataPath = resolve(ROOT, dataRelEn);
const dataEsPath = resolve(ROOT, dataRelEs);

function insertIntoCertGallery(filePath) {
  let content = readFileSync(filePath, 'utf-8');

  if (content.includes(`"file": "${destPdfRel}"`)) {
    console.log(`  Already registered in ${filePath.split('\\').pop()}, skipping.`);
    return false;
  }

  const objParts = [
    `"title": "${esc(title)}"`,
    `"issuer": "${esc(issuer)}"`,
    `"date": "${esc(date)}"`,
    `"file": "${esc(destPdfRel)}"`,
    `"icon": "${esc(icon)}"`,
    `"type": "${esc(type)}"`,
  ];
  if (badge) objParts.push(`"badge": "${esc(badge)}"`);

  const newObj = `{ ${objParts.join(', ')} }`;

  // 1) Encuentra el array certGallery.certs: [...]
  const arrRe = /("certGallery"\s*:\s*\{[\s\S]*?"certs"\s*:\s*\[)([\s\S]*?)(\]\s*)/m;
  const m = content.match(arrRe);
  if (!m) throw new Error(`Could not find certGallery.certs in ${filePath}`);

  const before = m[1];
  let inner = m[2];
  const after = m[3];

  // Detecta indentación tomando la línea donde está "certs": [
  const certsIndent = (before.match(/\n([ \t]*)"certs"\s*:\s*\[$/m)?.[1]) ?? '  ';
  const itemIndent = certsIndent + '  ';

  const hasAnyObject = /\{[\s\S]*\}/m.test(inner);

  if (!hasAnyObject) {
    // Array vacío: inserta un único elemento sin coma
    // Respeta estilo multilínea: abre, item, cierra
    inner = `\n${itemIndent}${newObj}\n${certsIndent}`;
  } else {
    // Asegura que el último objeto existente termine con coma
    // (solo si no la tiene ya)
    inner = inner.replace(/}\s*$/m, (match) => {
      // si ya hay coma al final (caso raro), no duplicar
      if (/,(\s*)$/.test(match)) return match;
      return match.replace(/}\s*$/, '},');
    });

    // Inserta el nuevo al final SIN coma
    // Evita añadir líneas vacías: agrega exactamente 1 newline antes y alinea el cierre
    // Quita trailing spaces para insertar limpio
    inner = inner.replace(/\s*$/m, '');
    inner = `${inner}\n${itemIndent}${newObj}\n${certsIndent}`;
  }

  content = content.replace(arrRe, `${before}${inner}${after}`);
  writeFileSync(filePath, content, 'utf-8');
  return true;
}

console.log(`\nProfile: ${profile}`);
console.log(`Title:   ${title}`);
console.log(`Issuer:  ${issuer}`);
console.log(`Date:    ${date}`);
console.log(`File:    ${destPdfRel}\n`);

const changed = [
  insertIntoCertGallery(dataPath),
  insertIntoCertGallery(dataEsPath),
].some(Boolean);

if (shouldCommit) {
  if (!changed) {
    console.log('Nothing to commit (already registered).');
  } else {
    execSync(`git add "${assetsPdfRelDir}/${destFileName}" "${dataRelEn}" "${dataRelEs}"`, { cwd: ROOT, stdio: 'inherit' });
    execSync(`git commit -m "Add certificate PDF: ${title}"`, { cwd: ROOT, stdio: 'inherit' });
    execSync(`git push`, { cwd: ROOT, stdio: 'inherit' });
  }
}