// All coordinates, drawings and exports use this native JavaScript definition.
export const spec = Object.freeze({
  revision: 'SD-01 / A',
  units: 'mm',
  width: 1200,
  depth: 800,
  wall: 2,
  floor: 860,
  fall: 25,
  front: 1085,
  rear: 1305,
  overhang: 50,
  glass: 6,
  drainBore: 50.8,
  drainWall: 1.5,
  drainLength: 130,
  shellAttachments: 0,
  supportSheets: 2,
  supportAngle: 90,
  trayWidth: 1050,
  trayDepth: 650,
  trayY: 975,
  standBottom: 910,
  tube: 30,
  tubeWall: 2,
  railY: 868,
  legBottom: 20,
  bottleDiameter: 180,
  bottleBase: 430,
  bottleTop: 722,
});
export const slope = (spec.rear - spec.front) / spec.depth;
export const roofAngle = Math.atan(slope);
export function glassSize() {
  return {
    width: spec.width + 2 * spec.overhang,
    length:
      Math.round(
        ((spec.depth + 2 * spec.overhang) / Math.cos(roofAngle)) * 10
      ) / 10,
  };
}
export function roofHeight(z) {
  return (spec.front + spec.rear) / 2 - slope * z;
}
export function floorHeight(x, z) {
  return (
    spec.floor +
    spec.fall *
      Math.max(
        0,
        (Math.abs(x) - 35) / (spec.width / 2 - 35),
        (Math.abs(z) - 35) / (spec.depth / 2 - 35)
      )
  );
}
export const parts = [
  {
    id: '01',
    name: 'Sanitary chamber',
    quantity: 1,
    material: '316L stainless · 2 mm',
    size: '1200 × 800 · 200 / 420 high',
    group: 'chamber',
    process:
      'Four flat walls, four sloped floor panels and a 70 × 70 drain throat. Continuous full-penetration TIG butt seams, ground flush; blend internal corners R3 minimum. No shell mounting holes or external brackets. Wetted finish Ra ≤ 0.8 µm; pickle and passivate after welding.',
  },
  {
    id: '02',
    name: 'Canopy glass',
    quantity: 1,
    material: 'Low-iron tempered glass · 6 mm',
    size: `1300 × ${glassSize().length} × 6 · 15.4°`,
    group: 'lid',
    process:
      'All edges polished, corners R10; no holes. Order final glass after measuring welded rim. Four removable silicone edge shoes and cage-mounted compression bars retain the pane. Overhang 50 mm in plan on all four sides.',
  },
  {
    id: '03',
    name: 'Continuous rim seal',
    quantity: 1,
    material: 'Food-contact silicone · 50 Shore A',
    size: '12 × 10 section · 4059 mm loop',
    group: 'seal',
    process:
      'Moulded or vulcanized closed loop, centreline 1200 × 829.7 on the inclined rim. Removable U-channel with 2 mm slot × 5 mm depth over the wall edge; compress bulb 20% using cage stops. No adhesive in the wetted volume.',
  },
  {
    id: '04',
    name: 'Product tray',
    quantity: 1,
    material: '316L perforated stainless · 1.5 mm',
    size: '1050 × 650 · Ø3 on 5 staggered pitch',
    group: 'tray',
    process:
      'Laser cut purchased perforated sheet, 10 mm solid border; deburr all holes and edges R0.5. Flat removable tray on the L-stand. Holds one layer of sliced tomatoes; condensate falls through into the sloped collector.',
  },
  {
    id: '05',
    name: 'Two-plane L-stand',
    quantity: 1,
    material: '316L stainless · 2 mm',
    size: '1050 × 65 + 648 × 65 · 90°',
    group: 'stand',
    process:
      'Exactly two solid perpendicular vertical sheets, rear and left. Butt weld the single L joint, grind flush and radius R3. Four removable silicone saddle feet raise all sheet edges above the collector; front and right remain open. Tray lifts off.',
  },
  {
    id: '06',
    name: 'Stand saddle feet',
    quantity: 4,
    material: 'Food-contact silicone · 50 Shore A',
    size: 'Ø20 · 37.6 (2) / 36.4 (2), including saddle',
    group: 'stand',
    process:
      'Mould solid round feet with a 2 × 8 mm deep open saddle slot. Locate two on each sheet 30 mm from its ends; cut to the listed local floor heights for a level stand top at Z975. Remove individually for cleaning.',
  },
  {
    id: '07',
    name: 'Straight drop drain',
    quantity: 1,
    material: '316L sanitary tube · 1.5 mm wall',
    size: 'Ø53.8 OD / Ø50.8 bore × 130',
    group: 'drain',
    process:
      'Vertical at chamber centre, top Z860, outlet Z730. Flush full-penetration TIG joint to collector; no interior lip, threads or elbow. Electropolish the bore. A full-bore removable silicone sleeve connects to the bottle cap at Z722.',
  },
  {
    id: '08',
    name: 'Independent lock cage',
    quantity: 1,
    material: '304 stainless SHS · 30 × 30 × 2',
    size: '1230 × 830 footprint · rail top Z883',
    group: 'cage',
    process:
      'Square cut: 4 outer legs × 733; 4 inner 25 × 25 × 2 legs × 500; 2 top rails × 1230, 2 × 770; 2 lower rails × 1170, 2 × 770. TIG weld tube ends, cap and seal all hollow sections. M8 cage-only telescoping joints allow +0 to 200 mm height in 25 mm increments; retain both pins per leg.',
  },
  {
    id: '09',
    name: 'Cage restraints & shoes',
    quantity: 4,
    material: '304 stainless + silicone pads',
    size: '30 × 3 strap · M8 cage-only bolts',
    group: 'cage',
    process:
      'Four removable corner posts bolt only to cage rails; front pair 265 and rear pair 493 mm long. Each has a 60 × 30 × 3 pressure bar and M8 screw with Ø20 silicone tip. Limit stops set 20% gasket compression. 2 mm silicone support strips isolate the shell.',
  },
  {
    id: '10',
    name: 'Sealed collection vessel',
    quantity: 1,
    material: 'Borosilicate glass · nominal 5 L',
    size: 'Ø180 body · 292 high · ≥Ø60 mouth',
    group: 'bottle',
    process:
      'Purchased wide-mouth vessel: connector top Z722 (cap face Z707), base Z430 on a lift-out shelf. Custom 316L lid Ø90 × 3 with Ø50.8 axial port and off-axis Ø6 vent port at radius 40. Silicone face seal and external retaining band; no open funnel.',
  },
  {
    id: '11',
    name: 'Drain seal & filtered vent',
    quantity: 1,
    material: 'Food-contact silicone + PTFE',
    size: 'Ø53.8 sleeve × 40 · 0.2 µm vent',
    group: 'drain',
    process:
      'Removable straight silicone reducer on cap spigot, 15 mm minimum engagement each end, external clamps. Replaceable hydrophobic 0.2 µm vent cartridge at the cap balances pressure; keep dry and inspect before each cycle. No powered fan or pump.',
  },
  {
    id: '12',
    name: 'Bottle shelf & sun shield',
    quantity: 1,
    material: '304 stainless · 2 mm',
    size: '300 × 300 shelf + 3 × 300 × 300 shields',
    group: 'cage',
    process:
      'Shelf top Z430; 20 × 20 × 2 SHS bearers with removable cage-only brackets. Three detachable flat shields shade vessel from front and sides while leaving rear service access. Four M6 bolts per shield attach to cage; all penetrations outside chamber.',
  },
];

// Four planar trapezoids terminate at a flat 70 × 70 drain throat.
export function floorPanel(side) {
  const corners = [
    [-600, -400],
    [600, -400],
    [600, 400],
    [-600, 400],
  ];
  const inner = [
    [-35, -35],
    [35, -35],
    [35, 35],
    [-35, 35],
  ];
  return [
    corners[side],
    corners[(side + 1) % 4],
    inner[(side + 1) % 4],
    inner[side],
  ];
}
export function cutList() {
  const cuts = [
    {
      name: 'Front wall',
      quantity: 1,
      thickness: 2,
      points: [
        [0, 0],
        [1200, 0],
        [1200, 202],
        [0, 202],
      ],
    },
    {
      name: 'Rear wall',
      quantity: 1,
      thickness: 2,
      points: [
        [0, 0],
        [1200, 0],
        [1200, 422],
        [0, 422],
      ],
    },
    {
      name: 'Side wall',
      quantity: 2,
      thickness: 2,
      points: [
        [0, 0],
        [796, 0],
        [796, roofHeight(398) - 883],
        [0, roofHeight(-398) - 883],
      ],
    },
    {
      name: 'Stand rear',
      quantity: 1,
      thickness: 2,
      points: [
        [0, 0],
        [1050, 0],
        [1050, 65],
        [0, 65],
      ],
    },
    {
      name: 'Stand left',
      quantity: 1,
      thickness: 2,
      points: [
        [0, 0],
        [648, 0],
        [648, 65],
        [0, 65],
      ],
    },
  ];
  for (let side = 0; side < 4; side++) {
    const depth = side % 2 === 0 ? 365 : 565;
    const stretch = Math.hypot(depth, spec.fall) / depth;
    cuts.push({
      name: `Floor ${side + 1}`,
      quantity: 1,
      thickness: 2,
      points: floorPanel(side).map(([x, z]) =>
        side % 2 === 0 ? [x, z * stretch] : [z, x * stretch]
      ),
    });
  }
  cuts.push({
    name: 'Drain throat',
    quantity: 1,
    thickness: 2,
    points: [
      [-35, -35],
      [35, -35],
      [35, 35],
      [-35, 35],
    ],
    holes: [{ centre: [0, 0], diameter: spec.drainBore }],
  });
  cuts.push({
    name: 'Tray envelope',
    quantity: 1,
    thickness: 1.5,
    points: [
      [0, 0],
      [1050, 0],
      [1050, 650],
      [0, 650],
    ],
  });
  cuts.push({
    name: 'Bottle shelf',
    quantity: 1,
    thickness: 2,
    points: [
      [0, 0],
      [300, 0],
      [300, 300],
      [0, 300],
    ],
  });
  cuts.push({
    name: 'Bottle shield',
    quantity: 3,
    thickness: 2,
    points: [
      [0, 0],
      [300, 0],
      [300, 300],
      [0, 300],
    ],
  });
  return cuts;
}
export function validateDesign(s) {
  const errors = [];
  if (s.floor - s.drainLength <= s.bottleTop) {
    errors.push('Drain outlet must clear the bottle cap.');
  }
  if (s.drainLength <= 0 || s.drainLength > 150 || s.drainBore < 50) {
    errors.push('Use a short, brushable full-bore vertical drain.');
  }
  if (
    s.supportSheets !== 2 ||
    s.supportAngle !== 90 ||
    s.shellAttachments !== 0
  ) {
    errors.push('Sanitary architecture changed.');
  }
  if (s.overhang < 50 || s.front <= s.trayY || s.rear <= s.front) {
    errors.push('Check canopy and tray clearances.');
  }
  for (const value of Object.values(s).filter((v) => typeof v === 'number')) {
    if (!Number.isFinite(value)) {
      errors.push('Dimensions must be finite.');
    }
  }
  return errors;
}
