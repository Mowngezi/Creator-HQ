// Seed a sample creator into data/ so you can eyeball the card without
// going through the form. Run with: `node scripts/seed.js`
//
// Writes data/sample.json. Visit http://localhost:3000/c/sample

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const creator = {
  id: 'sample',
  createdAt: new Date().toISOString(),
  name: 'Ava Linden',
  handle: '@avalinden',
  tagline: 'Slow fashion, fast opinions. Built for brands that care what their audience cares about.',
  bio: 'London-based creator focused on ethical fashion and interiors. Four years making branded content for indie and global labels. Audience is 72% UK, 64% women 25–34, with a measured interest in sustainability that actually converts.',
  email: 'hello@avalinden.co',
  platforms: {
    instagram: { handle: '@avalinden', followers: 84200, engagement: 4.6 },
    tiktok:    { handle: '@avalinden', followers: 121000, engagement: 6.1 },
  },
  rates: [
    { label: 'Instagram Reel',            amount: 1800 },
    { label: 'Instagram Story set (3)',   amount: 650  },
    { label: 'TikTok Video',              amount: 2200 },
    { label: 'Content Bundle (IG + TT)',  amount: 3600 },
  ],
  workPreview: [
    { brand: '& Other Stories', note: 'AW24 campaign — 3-post Reel series' },
    { brand: 'Aesop',           note: 'Store launch — Reel + carousel' },
    { brand: 'Muji UK',         note: 'Interiors series — 4x TikTok' },
    { brand: 'Rowse Jewellery', note: 'Edit launch — dedicated Reel' },
  ],
  photo: null, // Drop an image in uploads/ and point photo.url here to see the cover slot filled.
};

const outDir = path.join(__dirname, '..', 'data');
await fs.mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, 'sample.json');
await fs.writeFile(outFile, JSON.stringify(creator, null, 2), 'utf8');
console.log(`Seeded ${outFile}`);
console.log('Visit http://localhost:3000/c/sample');
