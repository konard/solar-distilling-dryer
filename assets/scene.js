import { assembly, explodeOffsets, plateFaces } from './assembly.js';
import { parts } from './design.js';
const T = globalThis.THREE;

function prismGeometry(points, vector) {
  const vertices = [
    ...points.flat(),
    ...points.flatMap((p) => p.map((v, i) => v + vector[i])),
  ];
  const indices = [];
  for (const face of plateFaces({ points, vector })) {
    for (let i = 1; i < face.length - 1; i++) {
      indices.push(face[0], face[i], face[i + 1]);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
function tubeGeometry(outer, inner, length, vent) {
  const shape = new T.Shape();
  shape.absarc(0, 0, outer / 2, 0, Math.PI * 2, false);
  if (inner) {
    const hole = new T.Path();
    hole.absarc(0, 0, inner / 2, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  if (vent) {
    const hole = new T.Path();
    hole.absarc(vent, 0, 3, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geometry = new T.ExtrudeGeometry(shape, {
    depth: length,
    bevelEnabled: false,
    curveSegments: 32,
  });
  geometry.translate(0, 0, -length / 2);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}
function shsGeometry(size, wall) {
  const axis = size.indexOf(Math.max(...size));
  const cross = size.filter((_, i) => i !== axis);
  const shape = new T.Shape();
  const rectangle = (path, a, b) => {
    path.moveTo(-a / 2, -b / 2);
    path.lineTo(a / 2, -b / 2);
    path.lineTo(a / 2, b / 2);
    path.lineTo(-a / 2, b / 2);
    path.closePath();
  };
  rectangle(shape, ...cross);
  const hole = new T.Path();
  rectangle(hole, cross[0] - 2 * wall, cross[1] - 2 * wall);
  shape.holes.push(hole);
  const geometry = new T.ExtrudeGeometry(shape, {
    depth: size[axis],
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -size[axis] / 2);
  if (axis === 0) {
    geometry.rotateY(Math.PI / 2);
  }
  if (axis === 1) {
    geometry.rotateX(Math.PI / 2);
  }
  return geometry;
}
function perforationTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(16, 16, 9.6, 0, Math.PI * 2);
  ctx.fill();
  const texture = new T.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(210, 130);
  texture.minFilter = T.NearestFilter;
  return texture;
}
function environment(renderer) {
  const room = new T.Scene();
  room.background = new T.Color('#d9e6ec');
  const material = new T.MeshBasicMaterial({
    color: '#758a8e',
    side: T.BackSide,
  });
  room.add(new T.Mesh(new T.BoxGeometry(10, 10, 10), material));
  for (const [x, y, z] of [
    [-4, 2, 0],
    [3, 3, -3],
    [0, 4, 0],
  ]) {
    const light = new T.Mesh(
      new T.BoxGeometry(2, 1, 4),
      new T.MeshBasicMaterial({ color: '#ffffff' })
    );
    light.position.set(x, y, z);
    room.add(light);
  }
  const generator = new T.PMREMGenerator(renderer);
  const result = generator.fromScene(room);
  generator.dispose();
  return result.texture;
}
function makeMaterials(env) {
  const metal = (color, roughness = 0.33) =>
    new T.MeshStandardMaterial({
      color,
      metalness: 0.75,
      roughness,
      envMap: env,
      side: T.DoubleSide,
    });
  return {
    '01': metal('#8f9fa7'),
    '02': new T.MeshPhysicalMaterial({
      color: '#bedcdd',
      transparent: true,
      opacity: 0.21,
      roughness: 0.08,
      metalness: 0.1,
      envMap: env,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    '03': new T.MeshStandardMaterial({ color: '#394f51', roughness: 0.8 }),
    '04': new T.MeshStandardMaterial({
      color: '#9aadb5',
      metalness: 0.6,
      roughness: 0.4,
      envMap: env,
      alphaMap: perforationTexture(),
      alphaTest: 0.5,
      side: T.DoubleSide,
    }),
    '05': metal('#bbc9cc'),
    '06': new T.MeshStandardMaterial({ color: '#e8d6b4' }),
    '07': metal('#d1e1e7', 0.2),
    '08': metal('#213e3a', 0.5),
    '09': metal('#566f72'),
    10: new T.MeshPhysicalMaterial({
      color: '#91cbd3',
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      envMap: env,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    11: new T.MeshStandardMaterial({
      color: '#e9e0c9',
      transparent: true,
      opacity: 0.8,
    }),
    12: metal('#6b8388', 0.6),
  };
}
function addProduce(group) {
  const flesh = new T.MeshStandardMaterial({
    color: '#b34627',
    roughness: 0.77,
  });
  const core = new T.MeshStandardMaterial({ color: '#e1964a', roughness: 0.9 });
  for (let x = -420; x <= 420; x += 105) {
    for (let z = -235; z <= 235; z += 95) {
      const slice = new T.Mesh(new T.CylinderGeometry(37, 37, 7, 24), flesh);
      slice.position.set(x, 981, z);
      group.add(slice);
      const seed = new T.Mesh(new T.TorusGeometry(22, 2, 6, 16), core);
      seed.rotation.x = Math.PI / 2;
      seed.position.set(x, 985, z);
      group.add(seed);
    }
  }
}
function dimensionLayer(scene, host) {
  const group = new T.Group();
  scene.add(group);
  const labels = [];
  const material = new T.LineBasicMaterial({ color: '#9d6441' });
  const dim = (start, end, text, label) => {
    const geometry = new T.BufferGeometry().setFromPoints([
      new T.Vector3(...start),
      new T.Vector3(...end),
    ]);
    group.add(new T.Line(geometry, material));
    for (const p of [start, end]) {
      const tick = new T.BufferGeometry().setFromPoints([
        new T.Vector3(p[0] - 8, p[1] - 8, p[2] - 8),
        new T.Vector3(p[0] + 8, p[1] + 8, p[2] + 8),
      ]);
      group.add(new T.Line(tick, material));
    }
    const element = document.createElement('span');
    element.className = 'dimension-label';
    element.textContent = text;
    host.appendChild(element);
    labels.push({ element, point: new T.Vector3(...label) });
  };
  dim([-600, 900, 490], [600, 900, 490], '1200 mm', [0, 900, 505]);
  dim([710, 900, -400], [710, 900, 400], '800 mm', [735, 900, 0]);
  dim([-730, 0, -400], [-730, 1305, -400], '1305 mm', [-755, 650, -400]);
  return { group, labels };
}

function createScene(host) {
  const scene = new T.Scene();
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.5));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.domElement.setAttribute(
    'aria-label',
    'Interactive solar distiller assembly. Drag to orbit, scroll to zoom, right drag to pan. Use the view buttons for keyboard navigation.'
  );
  renderer.domElement.tabIndex = 0;
  host.prepend(renderer.domElement);
  const camera = new T.OrthographicCamera(-1300, 1300, 1100, -1100, 1, 20000);
  camera.position.set(2100, 1850, 2400);
  const controls = new T.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 700, 0);
  controls.enableDamping = true;
  controls.minZoom = 0.45;
  controls.maxZoom = 5;
  controls.maxPolarAngle = Math.PI * 0.87;
  const materials = makeMaterials(environment(renderer));
  scene.add(new T.HemisphereLight(0xf8f6e9, 0xa5b8c3, 0.6));
  const sun = new T.DirectionalLight(0xffffff, 0.85);
  sun.position.set(-1300, 3000, 1800);
  scene.add(sun);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -2000,
    right: 2000,
    top: 2000,
    bottom: -2000,
    far: 7000,
  });
  sun.shadow.bias = -0.0003;
  return { scene, renderer, camera, controls, materials };
}

function createParts(scene, materials) {
  const groups = Object.fromEntries(parts.map((p) => [p.id, new T.Group()]));
  Object.values(groups).forEach((g) => scene.add(g));
  const pickable = [];
  for (const solid of assembly()) {
    let geometry;
    if (solid.type === 'plate') {
      geometry = prismGeometry(solid.points, solid.vector);
    } else if (['tube', 'cap'].includes(solid.type)) {
      geometry = tubeGeometry(
        solid.outer,
        solid.inner,
        solid.length,
        solid.vent
      );
    } else if (solid.type === 'throat') {
      const shape = new T.Shape();
      shape.moveTo(-35, -35);
      shape.lineTo(35, -35);
      shape.lineTo(35, 35);
      shape.lineTo(-35, 35);
      shape.closePath();
      const hole = new T.Path();
      hole.absarc(0, 0, solid.bore / 2, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      geometry = new T.ExtrudeGeometry(shape, {
        depth: 2,
        bevelEnabled: false,
        curveSegments: 32,
      });
      geometry.translate(0, 0, -1);
      geometry.rotateX(Math.PI / 2);
    } else if (solid.type === 'shs') {
      geometry = shsGeometry(solid.size, solid.wall);
    } else {
      geometry = new T.BoxGeometry(...solid.size);
    }
    const mesh = new T.Mesh(geometry, materials[solid.part]);
    if (solid.position) {
      mesh.position.set(...solid.position);
    }
    if (solid.rotation) {
      mesh.rotation.set(...solid.rotation);
    }
    mesh.userData.part = solid.part;
    mesh.castShadow = !['02', '10'].includes(solid.part);
    mesh.receiveShadow = true;
    groups[solid.part].add(mesh);
    pickable.push(mesh);
    // Panel subdivision edges are omitted so the continuous collector reads as sheet metal.
    if (solid.type !== 'plate' && !['02', '10', '06'].includes(solid.part)) {
      const edges = new T.LineSegments(
        new T.EdgesGeometry(geometry, 28),
        new T.LineBasicMaterial({
          color: '#3e5b65',
          transparent: true,
          opacity: 0.24,
        })
      );
      mesh.add(edges);
    }
  }
  const produce = new T.Group();
  groups['04'].add(produce);
  addProduce(produce);
  const ground = new T.Mesh(
    new T.PlaneGeometry(12000, 12000),
    new T.ShadowMaterial({ opacity: 0.12 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new T.GridHelper(6000, 60, 0xced9d9, 0xe0e7e5);
  grid.material.transparent = true;
  grid.material.opacity = 0.5;
  scene.add(grid);
  return { groups, pickable, produce };
}

function bindPicking(renderer, camera, pickable, onSelect) {
  const raycaster = new T.Raycaster();
  const pointer = new T.Vector2();
  let pointerStart;
  renderer.domElement.addEventListener('pointerdown', (event) => {
    pointerStart = [event.clientX, event.clientY];
  });
  renderer.domElement.addEventListener('pointerup', (event) => {
    if (
      !pointerStart ||
      Math.hypot(
        event.clientX - pointerStart[0],
        event.clientY - pointerStart[1]
      ) > 5
    ) {
      return;
    }
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster
      .intersectObjects(pickable)
      .find((item) => item.object.parent.visible && item.object.visible);
    if (hit) {
      onSelect(hit.object.userData.part);
    }
  });
}

function observeSize(host, camera, renderer) {
  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    const halfHeight = Math.max(1020, 1050 / (width / height));
    camera.left = (-halfHeight * width) / height;
    camera.right = -camera.left;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  const observer = new globalThis.ResizeObserver(resize);
  observer.observe(host);
  resize();
  return observer;
}

export function createViewer(host, onSelect) {
  const { scene, renderer, camera, controls, materials } = createScene(host);
  const { groups, pickable, produce } = createParts(scene, materials);
  bindPicking(renderer, camera, pickable, onSelect);
  const dimensions = dimensionLayer(scene, host);
  const highlight = new T.BoxHelper(groups['01'], 0xc57843);
  highlight.visible = false;
  scene.add(highlight);
  let selected = '01';
  let exploded = false;
  let section = false;
  let showDimensions = true;
  let disposed = false;
  let frame;
  const updateLabels = () => {
    for (const { element, point } of dimensions.labels) {
      const p = point.clone().project(camera);
      element.hidden = !showDimensions || exploded || p.z > 1;
      element.style.left = `${((p.x + 1) / 2) * host.clientWidth}px`;
      element.style.top = `${((1 - p.y) / 2) * host.clientHeight}px`;
    }
  };
  const render = () => {
    if (disposed) {
      return;
    }
    controls.update();
    highlight.update();
    updateLabels();
    renderer.render(scene, camera);
    frame = globalThis.requestAnimationFrame(render);
  };
  const observer = observeSize(host, camera, renderer);
  const select = (id) => {
    selected = id;
    highlight.setFromObject(groups[id]);
    highlight.visible = true;
    renderer.domElement.dataset.selectedPart = id;
  };
  const setMode = (mode, value) => {
    if (mode === 'explode') {
      exploded = value;
      camera.zoom = exploded ? 0.8 : 1;
      controls.target.y = exploded ? 850 : 700;
      camera.updateProjectionMatrix();
      controls.update();
    }
    if (mode === 'section') {
      section = value;
    }
    if (mode === 'dimensions') {
      showDimensions = value;
    }
    if (mode === 'produce') {
      produce.visible = value;
    }
    for (const [id, group] of Object.entries(groups)) {
      group.position.set(...(exploded ? explodeOffsets[id] : [0, 0, 0]));
      group.visible = !(section && ['02', '03', '09'].includes(id));
    }
    // Section removes the front wall, not the entire sanitary collector.
    groups['01'].children[0].visible = !section;
    groups['12'].children[3].visible = !section;
    groups['12'].children[2].visible = !section;
    dimensions.group.visible = showDimensions && !exploded;
    highlight.setFromObject(groups[selected]);
    renderer.domElement.dataset.exploded = String(exploded);
    renderer.domElement.dataset.section = String(section);
  };
  const view = (name) => {
    const positions = {
      iso: [2100, 1850, 2400],
      front: [0, 700, 4000],
      right: [4000, 700, 0],
      top: [0, 4700, 0.01],
    };
    controls.target.set(0, exploded ? 850 : 700, 0);
    camera.position.set(...positions[name]);
    camera.zoom = exploded ? 0.8 : 1;
    camera.up.set(0, 1, 0);
    camera.updateProjectionMatrix();
    controls.update();
  };
  render();
  globalThis.addEventListener(
    'pagehide',
    (event) => {
      if (event.persisted) {
        return;
      }
      disposed = true;
      globalThis.cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
    },
    { once: true }
  );
  return {
    select,
    setMode,
    view,
    reset() {
      exploded = false;
      section = false;
      setMode('dimensions', true);
      setMode('produce', true);
      highlight.visible = false;
      view('iso');
    },
  };
}
