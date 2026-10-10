import fs from 'fs';
import { createRng } from './engine/rng.js';
import { renderText } from './render/text.js';
import { createSession, GENERATORS } from './session.js';

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    const chunks = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(chunks.join('')));
  });
}

function parseArgs(argv) {
  const args = { type: '', seed: null, text: null };
  const rest = argv.slice(2);
  args.type = rest[0] && !rest[0].startsWith('--') ? rest.shift() : '';
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--seed') {
      args.seed = Number(rest[i + 1]);
      i += 1;
    } else if (rest[i] === '--text') {
      args.text = rest[i + 1] ?? '';
      i += 1;
    }
  }
  return args;
}

const dictionaryUrl = new URL('./data/dictionary.json', import.meta.url);
const raw = JSON.parse(fs.readFileSync(dictionaryUrl, 'utf8'));
const args = parseArgs(process.argv);

if (!GENERATORS.includes(args.type)) {
  console.error(`usage: npm run generate -- <${GENERATORS.join('|')}> [--seed n] [--text "..."]`);
  process.exit(1);
}

const rng = Number.isFinite(args.seed) ? createRng(args.seed) : Math.random;
const session = createSession(raw, rng);
let data;
if (args.type === 'translate') {
  const text = args.text === null ? await readStdin() : args.text;
  data = session.translate.translate(text);
} else {
  data = session[args.type].generate();
}
process.stdout.write(`${renderText(args.type, data)}\n`);
