import sharp from 'sharp';
import { join } from 'path';

const OUT = 'C:\\Users\\spr_1\\AppData\\Local\\Temp\\claude\\C--Users-spr-1-source-repos-cv\\702f45de-a151-4ebe-873d-39aaf55fe153\\scratchpad';
const file = process.argv[2];
const top = Number(process.argv[3]);
const height = Number(process.argv[4]);
const left = Number(process.argv[5] || 0);
const width = Number(process.argv[6] || 0);
const src = join(OUT, file);
const meta = await sharp(src).metadata();
const w = width || meta.width;
await sharp(src).extract({ left, top, width: Math.min(w, meta.width - left), height: Math.min(height, meta.height - top) }).toFile(join(OUT, 'crop-check.png'));
console.log('saved crop-check.png, dims', meta.width, meta.height);
