// Regenerates web/src/styles/_variables.scss from the shared design tokens.
// Run with `npm run tokens` (Node strips the TypeScript types natively).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tokens, toScssVariables } from '../src/tokens.ts';

const target = fileURLToPath(new URL('../../../web/src/styles/_variables.scss', import.meta.url));

writeFileSync(target, toScssVariables(tokens));
process.stdout.write(`Wrote ${target}\n`);
