import { describe, it, expect } from 'test-anywhere';
import {
  readFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import { buildBlueprint } from '../scripts/build-blueprint.mjs';
import { assembly, plateFaces } from '../assets/assembly.js';
import {
  spec,
  parts,
  floorHeight,
  glassSize,
  cutList,
  validateDesign,
} from '../assets/design.js';
import {
  bomCsv,
  drawingSvg,
  cuttingDxf,
  assemblyScad,
} from '../assets/exports.js';

describe('manufacturing blueprint acceptance', () => {
  it('defines a valid millimetre assembly and rejects unsafe height changes', () => {
    expect(spec.units).toBe('mm');
    expect(validateDesign(spec)).toEqual([]);
    expect(validateDesign({ ...spec, floor: 600 }).length > 0).toBe(true);
    expect(validateDesign({ ...spec, drainLength: 0 }).length > 0).toBe(true);
  });
  it('retains all five architectural constraints as geometric invariants', () => {
    expect(spec.shellAttachments).toBe(0);
    expect(spec.supportSheets).toBe(2);
    expect(spec.supportAngle).toBe(90);
    expect(spec.drainBore).toBeGreaterThanOrEqual(50);
    expect(spec.drainLength).toBeLessThanOrEqual(150);
    expect(spec.overhang).toBeGreaterThanOrEqual(50);
    expect(floorHeight(0, 0)).toBe(spec.floor);
    expect(floorHeight(spec.width / 2, 0)).toBe(spec.floor + spec.fall);
    expect(floorHeight(0, spec.depth / 2)).toBe(spec.floor + spec.fall);
    expect(glassSize().length).toBeGreaterThan(spec.depth + spec.overhang * 2);
  });
  it('provides a traceable material, quantity and manufacturing definition for every part', () => {
    expect(parts.length).toBeGreaterThanOrEqual(12);
    expect(new Set(parts.map((p) => p.id)).size).toBe(parts.length);
    for (const part of parts) {
      expect(part.quantity > 0).toBe(true);
      expect(part.material.length > 5).toBe(true);
      expect(part.size.length > 5).toBe(true);
      expect(part.process.length > 30).toBe(true);
    }
    expect(
      cutList().every((cut) => cut.points.length >= 3 && cut.quantity > 0)
    ).toBe(true);
  });
  it('exports real fabrication data, without external services', () => {
    const csv = bomCsv();
    for (const part of parts) {
      expect(csv.includes(part.id)).toBe(true);
    }
    expect(drawingSvg().includes('1200')).toBe(true);
    expect(drawingSvg().includes('<svg')).toBe(true);
    expect(cuttingDxf().includes('LWPOLYLINE')).toBe(true);
    expect(cuttingDxf().includes('$INSUNITS\n70\n4')).toBe(true);
    expect(assemblyScad().includes('difference()')).toBe(true);
    expect(assemblyScad().includes('1200')).toBe(true);
  });
  it('ships the interactive workspace at a repository-relative Pages entry point', () => {
    const html = readFileSync(
      new globalThis.URL('../index.html', import.meta.url),
      'utf8'
    );
    expect(html.includes('name="viewport"')).toBe(true);
    expect(html.includes('./assets/app.js')).toBe(true);
    expect(html.includes('https://cdnjs')).toBe(false);
    expect(html.includes('id="viewport"')).toBe(true);
  });
});

describe('shared assembly geometry and public artifact', () => {
  it('inclines the glass in the same direction as the chamber rim', () => {
    const pane = assembly().find((s) => s.part === '02');
    const angle = pane.rotation[0];
    const front = pane.position[1] - (Math.tan(angle) * spec.depth) / 2;
    const rear = pane.position[1] + (Math.tan(angle) * spec.depth) / 2;
    expect(Math.abs(front - (spec.front + 11)) < 0.001).toBe(true);
    expect(Math.abs(rear - (spec.rear + 11)) < 0.001).toBe(true);
  });
  it('defines two perpendicular sheets and a flush, open drain throat', () => {
    const stand = assembly().filter((s) => s.part === '05');
    expect(stand.length).toBe(2);
    expect(stand[0].size[2]).toBe(2);
    expect(stand[1].size[0]).toBe(2);
    const drain = assembly().find((s) => s.part === '07');
    const throat = assembly().find((s) => s.type === 'throat');
    expect(drain.position[1] + drain.length / 2).toBe(spec.floor);
    expect(throat.position[1] + throat.size[1] / 2).toBe(spec.floor);
    expect(throat.bore).toBe(drain.inner);
    const sleeve = assembly().find((s) => s.part === '11');
    const spigot = assembly().find((s) => s.part === '10' && s.outer === 53.8);
    expect(spigot.position[1] + spigot.length / 2).toBe(spec.bottleTop);
    expect(
      sleeve.position[1] - sleeve.length / 2 <=
        spigot.position[1] - spigot.length / 2
    ).toBe(true);
    expect(
      sleeve.position[1] + sleeve.length / 2 >=
        drain.position[1] - drain.length / 2 + 15
    ).toBe(true);
  });
  it('fits all eight cage locking pins through the specified M8 drillings', () => {
    const pins = assembly().filter(
      (s) => s.part === '08' && s.type === 'tube' && s.length === 40
    );
    expect(pins.length).toBe(8);
    expect(pins.every((p) => p.outer === 8 && p.outer < 8.5)).toBe(true);
  });
  it('exports developed panels with the actual sloping edge lengths', () => {
    const floors = cutList().filter((c) => c.name.startsWith('Floor'));
    expect(floors.length).toBe(4);
    for (const cut of floors) {
      const solid = assembly().filter(
        (s) => s.part === '01' && s.type === 'plate'
      )[floors.indexOf(cut) + 2];
      const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        expect(
          Math.abs(
            distance(cut.points[i], cut.points[j]) -
              distance(solid.points[i], solid.points[j])
          ) < 0.001
        ).toBe(true);
      }
    }
  });
  it('includes the collector weld land in every wall cutting blank', () => {
    const cuts = cutList();
    expect(cuts.find((c) => c.name === 'Front wall').points[2][1]).toBe(202);
    expect(cuts.find((c) => c.name === 'Rear wall').points[2][1]).toBe(422);
    const side = cuts.find((c) => c.name === 'Side wall');
    const solid = assembly().find((s) => s.part === '01' && s.type === 'plate');
    expect(side.points[2][1]).toBe(solid.points[2][1] - solid.points[1][1]);
    expect(side.points[3][1]).toBe(solid.points[3][1] - solid.points[0][1]);
    expect(solid.points[0][1]).toBe(spec.floor + spec.fall - spec.wall);
  });
  it('keeps every plate manifold with positive outward signed volume', () => {
    for (const solid of assembly().filter((s) => s.type === 'plate')) {
      const vertices = [
        ...solid.points,
        ...solid.points.map((p) => p.map((v, i) => v + solid.vector[i])),
      ];
      const faces = plateFaces(solid);
      const edges = new Map();
      let volume = 0;
      for (const face of faces) {
        for (let i = 0; i < face.length; i++) {
          const a = face[i],
            b = face[(i + 1) % face.length];
          const key = [a, b].sort((x, y) => x - y).join('-');
          edges.set(key, (edges.get(key) || 0) + 1);
        }
        for (let i = 1; i < face.length - 1; i++) {
          const [a, b, c] = [
            vertices[face[0]],
            vertices[face[i]],
            vertices[face[i + 1]],
          ];
          volume +=
            (a[0] * (b[1] * c[2] - b[2] * c[1]) +
              a[1] * (b[2] * c[0] - b[0] * c[2]) +
              a[2] * (b[0] * c[1] - b[1] * c[0])) /
            6;
        }
      }
      expect([...edges.values()].every((count) => count === 2)).toBe(true);
      expect(volume > 0).toBe(true);
    }
  });
  it('stages a complete site with relative assets and five static exports', async () => {
    mkdirSync('dist', { recursive: true });
    const dir = mkdtempSync(resolve('dist/blueprint-test-'));
    try {
      await buildBlueprint(dir);
      for (const path of [
        'index.html',
        'assets/app.js',
        'assets/vendor/three-r128.min.js',
        'docs/fabrication.md',
        '.nojekyll',
      ]) {
        expect(existsSync(join(dir, path))).toBe(true);
      }
      for (const ext of ['svg', 'csv', 'dxf', 'scad', 'json']) {
        expect(
          readFileSync(join(dir, `downloads/SD-01-rev-A.${ext}`), 'utf8')
            .length > 100
        ).toBe(true);
      }
      expect(existsSync(join(dir, 'node_modules'))).toBe(false);
      expect(existsSync(join(dir, '.git'))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
