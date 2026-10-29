import { spec, parts, cutList, glassSize } from './design.js';
import { assembly, plateFaces } from './assembly.js';

const quoted = (value) => `"${String(value).replaceAll('"', '""')}"`;
export function bomCsv() {
  return [
    [
      'Part',
      'Description',
      'Quantity',
      'Material',
      'Dimensions (mm)',
      'Manufacturing / interface',
    ],
    ...parts.map((p) => [
      p.id,
      p.name,
      p.quantity,
      p.material,
      p.size,
      p.process,
    ]),
  ]
    .map((row) => row.map(quoted).join(','))
    .join('\r\n');
}
export function specificationJson() {
  return JSON.stringify(
    { spec, parts, cuts: cutList(), solids: assembly() },
    null,
    2
  );
}
export function drawingSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1540" viewBox="0 0 1400 1540">
  <style>text{font-family:monospace;fill:#172d3a;font-size:16px} .part{fill:#edf1f0;stroke:#244653;stroke-width:2} .dim{fill:none;stroke:#b65d31;stroke-width:1} .small{font-size:12px}</style>
  <rect width="1400" height="1540" fill="#fff"/><text x="50" y="45" font-size="25">SD-01 / A — SOLAR DISTILLING DRYER</text>
  <text x="50" y="72">GENERAL ARRANGEMENT · ALL DIMENSIONS mm · DO NOT SCALE · THIRD ANGLE</text>
  <g transform="translate(80,130) scale(.6)"><text y="-30">PLAN</text><rect class="part" width="1200" height="800"/>
  <rect class="dim" x="-50" y="-50" width="1300" height="900"/><rect class="dim" x="75" y="75" width="1050" height="650"/>
  <circle class="part" cx="600" cy="400" r="25.4"/>
  <path class="dim" d="M0 0L600 400 1200 0M0 800L600 400 1200 800M0 -80H1200M-70 0V800"/>
  <text x="530" y="-95">1200</text><text x="-65" y="400" transform="rotate(-90 -65 400)">800</text>
  <text x="650" y="450">Ø50.8 THROAT</text></g>
  <g transform="translate(900,140) scale(.45)"><text y="-50">RIGHT ELEVATION</text>
  <path class="part" d="M0 420V0L800 220V420Z"/><path class="dim" d="M-50 -24.75L850 222.75M0 420L400 445 800 420"/>
  <path class="part" d="M-15 422H15V1305H-15ZM785 422H815V1305H785Z"/>
  <path class="dim" d="M400 445V575M0 1330H800M870 0V1305"/>
  <text x="325" y="1370">800</text><text x="890" y="600">1305</text><text x="150" y="-35">15.4° CANOPY</text>
  <text x="440" y="540">130 DROP</text></g>
  <g transform="translate(80,1000) scale(.6)"><text y="-360">FRONT ELEVATION</text>
  <path class="part" d="M0 -335H1200V-135L600 -110 0 -135Z"/>
  <path class="part" d="M-15 -133H15V750H-15ZM1185 -133H1215V750H1185Z"/>
  <path class="dim" d="M600 -110V20M-50 -345H1250M-15 800H1215"/>
  <rect class="part" x="510" y="70" width="180" height="250"/><path class="dim" d="M565 70V43H635V70M580 43V28H620V43M450 322H750"/>
  <text x="460" y="-365">1300 GLASS WIDTH</text><text x="530" y="835">1230 CAGE</text></g>
  <rect x="865" y="690" width="480" height="260" fill="white" stroke="#244653"/>
  <text x="885" y="720">FABRICATION NOTES</text>
  <text class="small" x="885" y="749">316L shell 2; flush TIG seams; Ra ≤ 0.8 µm.</text>
  <text class="small" x="885" y="773">Floor: 25 fall, 4 panels; tube Ø53.8 × 1.5.</text>
  <text class="small" x="885" y="797">Glass: 1300 × ${glassSize().length} × 6, edges R10.</text>
  <text class="small" x="885" y="821">Linear ±1; welded envelope ±2; angle ±0.5°.</text>
  <text class="small" x="885" y="845">No chassis brackets, threads or leg welds.</text>
  <text class="small" x="885" y="869">See fabrication.md for joints, seals and QA.</text>
  <text class="small" x="885" y="893">Prototype design; validate before food use.</text>
  <text class="small" x="885" y="927">REV A · general arrangement · sheet 1 of 1</text></svg>`;
}
export function cuttingDxf() {
  const lines = [
    '0',
    'SECTION',
    '2',
    'HEADER',
    '9',
    '$INSUNITS',
    '70',
    '4',
    '0',
    'ENDSEC',
    '0',
    'SECTION',
    '2',
    'ENTITIES',
  ];
  let offset = 0;
  for (const cut of cutList()) {
    const xs = cut.points.map((p) => p[0]);
    const ys = cut.points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const layer = cut.name.replaceAll(' ', '_');
    lines.push(
      '0',
      'TEXT',
      '8',
      layer,
      '10',
      String(offset),
      '20',
      '-40',
      '40',
      '15',
      '1',
      `${cut.name} QTY ${cut.quantity} THK ${cut.thickness}`
    );
    lines.push(
      '0',
      'LWPOLYLINE',
      '8',
      layer,
      '90',
      String(cut.points.length),
      '70',
      '1'
    );
    for (const [x, y] of cut.points) {
      lines.push(
        '10',
        (x - minX + offset).toFixed(4),
        '20',
        (y - minY).toFixed(4)
      );
    }
    for (const hole of cut.holes || []) {
      lines.push(
        '0',
        'CIRCLE',
        '8',
        layer,
        '10',
        (hole.centre[0] - minX + offset).toFixed(4),
        '20',
        (hole.centre[1] - minY).toFixed(4),
        '40',
        String(hole.diameter / 2)
      );
    }
    offset += Math.max(...xs) - minX + 100;
  }
  return [...lines, '0', 'ENDSEC', '0', 'EOF', ''].join('\n');
}
const vector = (value) => `[${value.join(',')}]`;
function scadSolid(solid) {
  const { type, size, position, rotation = [0, 0, 0] } = solid;
  if (type === 'plate') {
    const points = [
      ...solid.points,
      ...solid.points.map((p) => p.map((v, i) => v + solid.vector[i])),
    ];
    const faces = plateFaces(solid).map((face) => face.toReversed());
    return `polyhedron(points=[${points.map(vector)}],faces=[${faces.map(vector)}]);`;
  }
  const transform = `translate(${vector(position)}) rotate(${vector(rotation.map((r) => (r * 180) / Math.PI))})`;
  if (type === 'cap') {
    return `${transform} rotate([90,0,0]) difference(){cylinder(h=3,d=90,center=true);cylinder(h=5,d=50.8,center=true);translate([40,0,0]) cylinder(h=5,d=6,center=true);}`;
  }
  if (type === 'tube') {
    return `${transform} rotate([90,0,0]) difference(){cylinder(h=${solid.length},d=${solid.outer},center=true);${solid.inner ? `cylinder(h=${solid.length + 2},d=${solid.inner},center=true);` : ''}}`;
  }
  if (type === 'throat') {
    return `${transform} difference(){cube(${vector(size)},center=true);rotate([90,0,0]) cylinder(h=4,d=${solid.bore},center=true);}`;
  }
  if (type === 'shs') {
    const axis = size.indexOf(Math.max(...size));
    const inner = size.map((v, i) => (i === axis ? v + 2 : v - 2 * solid.wall));
    return `${transform} difference(){cube(${vector(size)},center=true);cube(${vector(inner)},center=true);}`;
  }
  return `${transform} cube(${vector(size)},center=true);`;
}
export function assemblyScad() {
  return `// SD-01 revision A. Millimetres; X width, Y height, Z depth.\n// Generated from the same solid definitions as the viewer.\n// Purchased perforated tray and vessel are envelope representations.\n$fn=64;\npart="all"; // set to a BOM part ID, e.g. "01"\n${parts
    .map(
      (p) =>
        `if(part=="all"||part=="${p.id}"){\n// ${p.name}\n${assembly()
          .filter((s) => s.part === p.id)
          .map(scadSolid)
          .join('\n')}\n}`
    )
    .join('\n')}`;
}
