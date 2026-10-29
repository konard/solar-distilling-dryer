#!/usr/bin/env node
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  bomCsv,
  drawingSvg,
  cuttingDxf,
  assemblyScad,
  specificationJson,
} from '../assets/exports.js';

// Copy only public site inputs. Never publish the working checkout or node_modules.
export async function buildBlueprint(output, exampleDist) {
  const root = resolve(
    fileURLToPath(new globalThis.URL('..', import.meta.url))
  );
  const target = resolve(output);
  if (!relative(root, target).startsWith(`dist${sep}`)) {
    throw new Error('Site output must be inside dist/.');
  }
  await mkdir(`${target}/docs`, { recursive: true });
  await cp(`${root}/index.html`, `${target}/index.html`);
  await cp(`${root}/assets`, `${target}/assets`, { recursive: true });
  await cp(`${root}/docs/fabrication.md`, `${target}/docs/fabrication.md`);
  await writeFile(`${target}/.nojekyll`, '');
  await mkdir(`${target}/downloads`, { recursive: true });
  for (const [extension, generate] of Object.entries({
    csv: bomCsv,
    svg: drawingSvg,
    dxf: cuttingDxf,
    scad: assemblyScad,
    json: specificationJson,
  })) {
    await writeFile(`${target}/downloads/SD-01-rev-A.${extension}`, generate());
  }
  if (exampleDist) {
    await cp(resolve(exampleDist), `${target}/demo`, { recursive: true });
  }
  console.log(
    `Blueprint site staged at ${target}${exampleDist ? ' (universal example preserved at /demo/)' : ''}`
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await buildBlueprint(process.argv[2] || 'dist/site', process.argv[3]);
}
