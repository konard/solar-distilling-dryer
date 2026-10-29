// Exercise the actual CAD engine; reject warnings even when OpenSCAD exits zero.
import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const source = resolve('dist/site/downloads/SD-01-rev-A.scad');
mkdirSync('reports/blueprint-cad', { recursive: true });
for (const part of ['01', '05', '07', '10']) {
  const target = resolve(`reports/blueprint-cad/part-${part}.stl`);
  const result = render(['-D', `part="${part}"`, '-o', target, source]);
  if (statSync(target).size < 100 || !/Simple:\s+yes/.test(result)) {
    throw new Error(`Non-manifold or empty CAD export: ${part}`);
  }
  console.log(`Rendered part ${part}: ${statSync(target).size} bytes`);
}
const target = resolve('reports/blueprint-cad/assembly.csg');
render(['-o', target, source]);
if (statSync(target).size < 100) {
  throw new Error('Empty assembly CSG');
}
writeFileSync(
  'reports/blueprint-cad/result.txt',
  'Full assembly compiled; chamber, stand, drain and vessel rendered.\n'
);

function render(args) {
  const result = spawnSync('openscad', ['--hardwarnings', ...args], {
    env: { ...process.env, QT_QPA_PLATFORM: 'offscreen' },
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  const diagnostics = `${result.stdout || ''}${result.stderr || ''}`;
  console.log(diagnostics);
  if (
    result.error ||
    result.status !== 0 ||
    /WARNING|ERROR|Can.t open file/.test(diagnostics)
  ) {
    throw (
      result.error || new Error(`OpenSCAD validation failed: ${result.status}`)
    );
  }
  return diagnostics;
}
