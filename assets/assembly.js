import {
  spec as s,
  floorPanel,
  floorHeight,
  roofHeight,
  roofAngle,
  glassSize,
} from './design.js';

// Shared solid primitives for both the WebGL model and the OpenSCAD export.
// World axes: X width, Y height, Z depth; the front faces +Z.
export function assembly() {
  const solids = [];
  const add = (part, type, data) => solids.push({ part, type, ...data });
  const box = (part, size, position, extra = {}) =>
    add(part, 'box', { size, position, ...extra });
  const tube = (part, outer, inner, length, position) =>
    add(part, 'tube', { outer, inner, length, position });
  const plate = (part, points, vector) =>
    add(part, 'plate', { points, vector });
  addChamber({ add, box, tube, plate });
  addCanopy({ add, box, tube, plate });
  addProductSupport({ add, box, tube, plate });
  addExoskeleton({ add, box, tube, plate });
  addCollection({ add, box, tube, plate });
  return solids;
}

function addChamber({ add, box, plate }) {
  const base = s.floor + s.fall;
  box('01', [1200, 202, 2], [0, base + 99, 399]);
  box('01', [1200, 422, 2], [0, base + 209, -399]);
  for (const x of [-600, 598]) {
    plate(
      '01',
      [
        [x, base - 2, -398],
        [x, base - 2, 398],
        [x, roofHeight(398), 398],
        [x, roofHeight(-398), -398],
      ],
      [2, 0, 0]
    );
  }
  for (let side = 0; side < 4; side++) {
    plate(
      '01',
      floorPanel(side).map(([x, z]) => [x, floorHeight(x, z), z]),
      [0, -2, 0]
    );
  }
  add('01', 'throat', {
    size: [70, 2, 70],
    position: [0, 859, 0],
    bore: s.drainBore,
  });
}

function addCanopy({ box }) {
  const centreRoof = roofHeight(0);
  box(
    '02',
    [glassSize().width, 6, glassSize().length],
    [0, centreRoof + 11, 0],
    { rotation: [roofAngle, 0, 0] }
  );
  for (const x of [-600, 600]) {
    box('03', [12, 8, s.depth / Math.cos(roofAngle)], [x, centreRoof + 4, 0], {
      rotation: [roofAngle, 0, 0],
    });
  }
  for (const z of [-400, 400]) {
    box('03', [1200, 8, 12], [0, roofHeight(z) + 4, z], {
      rotation: [roofAngle, 0, 0],
    });
  }
}

function addProductSupport({ box, tube }) {
  box('04', [1050, 1.5, 650], [0, 975.75, 0], { perforated: true });
  box('05', [1050, 65, 2], [0, 942.5, -324]);
  box('05', [2, 65, 648], [-524, 942.5, 1]);
  const feet = [
    [-495, -324],
    [495, -324],
    [-524, -294],
    [-524, 295],
  ];
  feet.forEach(([x, z]) => {
    const y = floorHeight(x, z);
    tube('06', 20, 0, 918 - y, [x, (918 + y) / 2, z]);
  });
  tube('07', s.drainBore + s.drainWall * 2, s.drainBore, s.drainLength, [
    0,
    s.floor - s.drainLength / 2,
    0,
  ]);
}

function addExoskeleton({ add, box, tube }) {
  for (const x of [-600, 600]) {
    for (const z of [-400, 400]) {
      add('08', 'shs', {
        size: [30, 733, 30],
        position: [x, 486.5, z],
        wall: 2,
      });
      add('08', 'shs', { size: [25, 500, 25], position: [x, 270, z], wall: 2 });
      for (const y of [170, 195]) {
        add('08', 'tube', {
          outer: 12,
          inner: 0,
          length: 40,
          position: [x, y, z],
          rotation: [0, 0, Math.PI / 2],
        });
      }
      tube('08', 44, 0, 12, [x, 6, z]);
      tube('08', 12, 0, 14, [x, 19, z]);
    }
    add('08', 'shs', { size: [30, 30, 770], position: [x, 868, 0], wall: 2 });
    add('08', 'shs', { size: [30, 30, 770], position: [x, 230, 0], wall: 2 });
    box('09', [30, 2, 770], [x, 884, 0]);
  }
  for (const z of [-400, 400]) {
    add('08', 'shs', { size: [1230, 30, 30], position: [0, 868, z], wall: 2 });
    add('08', 'shs', { size: [1170, 30, 30], position: [0, 230, z], wall: 2 });
    box('09', [1200, 2, 30], [0, 884, z]);
  }
  for (const x of [-615, 615]) {
    for (const z of [-415, 415]) {
      const top = roofHeight(z) + 52;
      box('09', [3, top - 868, 30], [x, (top + 868) / 2, z]);
      box('09', [60, 3, 30], [x > 0 ? x - 25 : x + 25, top, z]);
      tube('09', 8, 0, 30, [x > 0 ? x - 40 : x + 40, top - 16, z]);
      tube('09', 20, 0, 6, [x > 0 ? x - 40 : x + 40, top - 35, z]);
    }
  }
}

function addCollection({ add, box, tube }) {
  tube('10', 180, 174, 250, [0, 555, 0]);
  tube('10', 174, 0, 3, [0, 431.5, 0]);
  tube('10', 180, 70, 3, [0, 681.5, 0]);
  tube('10', 76, 70, 24, [0, 692, 0]);
  add('10', 'cap', {
    outer: 90,
    inner: 50.8,
    length: 3,
    position: [0, 705.5, 0],
    vent: 40,
  });
  tube('10', 53.8, 50.8, 15, [0, 714.5, 0]);
  tube('11', 62, 53.8, 40, [0, 727, 0]);
  tube('11', 8, 6, 57, [40, 735.5, 0]);
  tube('11', 20, 6, 8, [40, 768, 0]);
  box('12', [300, 2, 300], [0, 429, 0]);
  for (const x of [-151, 151]) {
    box('12', [2, 300, 300], [x, 580, 0]);
  }
  box('12', [300, 300, 2], [0, 580, 151]);
  for (const x of [-140, 140]) {
    add('12', 'shs', { size: [20, 20, 780], position: [x, 418, 0], wall: 2 });
  }
  for (const z of [-400, 400]) {
    add('12', 'shs', { size: [1170, 20, 20], position: [0, 418, z], wall: 2 });
  }
}

export const explodeOffsets = {
  '01': [0, 0, 0],
  '02': [0, 450, 0],
  '03': [0, 320, 0],
  '04': [0, 240, 0],
  '05': [-180, 100, 0],
  '06': [-180, 100, 0],
  '07': [0, -40, 200],
  '08': [0, -120, 0],
  '09': [130, 40, 0],
  10: [0, -70, 300],
  11: [0, -40, 250],
  12: [0, -120, -250],
};

// Right-hand outward winding; reverse for OpenSCAD's left-hand convention.
export function plateFaces(solid) {
  const n = solid.points.length;
  const [a, b, c] = solid.points;
  const u = b.map((v, i) => v - a[i]),
    v = c.map((v, i) => v - a[i]);
  const normal = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  const faces = [
    Array.from({ length: n }, (_, i) => n - i - 1),
    Array.from({ length: n }, (_, i) => n + i),
    ...Array.from({ length: n }, (_, i) => [
      i,
      (i + 1) % n,
      ((i + 1) % n) + n,
      i + n,
    ]),
  ];
  return normal.reduce((sum, value, i) => sum + value * solid.vector[i], 0) > 0
    ? faces
    : faces.map((face) => face.toReversed());
}
