/* Tori in 3D. The logo's keycap (ink body, white face, wink, dot eye, smile) built
   in three.js, with one of three casts:
     "sms"      - speech bubbles on tilted orbits (the SMS shop)
     "features" - the app's features as floating 3D objects (the homepage hero);
                  on a phone Tori stands alone
     "chat"     - one speech bubble with typing dots (the chat launcher)
   Motion runs on springs, so everything overshoots and settles like a real object.
   Loaded on demand: the homepage only pays for three.js once the hero mounts. */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const INK = 0x1b1a1a;
const LIME = 0xbfff51;
const MINT = 0x0cffbe;
const GRASS = 0x6bff85;

/** A damped spring: call with a target every frame. */
function spring(value = 0, stiffness = 120, damping = 14) {
  return { x: value, v: 0, k: stiffness, c: damping };
}
function step(s, target, dt) {
  // two half steps keep stiff springs stable at low frame rates
  for (let i = 0; i < 2; i += 1) {
    const h = dt / 2;
    s.v += ((target - s.x) * s.k - s.v * s.c) * h;
    s.x += s.v * h;
  }
  return s.x;
}

function easeInOut(p) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/* ---------- materials ---------- */
// Tori gets the full clearcoat shader; everything around him uses the standard
// one (about half the per-pixel cost), glossy enough at their size
function makeMaterials() {
  const coat = (color, extra = {}) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1, ...extra });
  const gloss = (color, roughness = 0.2) => new THREE.MeshStandardMaterial({ color, roughness, envMapIntensity: 1.25 });
  return {
    ink: coat(INK, { roughness: 0.3, clearcoatRoughness: 0.12 }),
    face: coat(0xffffff, { roughness: 0.36, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
    feature: coat(0x141313, { roughness: 0.22, clearcoatRoughness: 0.08 }),
    inkSoft: gloss(INK, 0.24),
    white: gloss(0xffffff, 0.26),
    paper: gloss(0xf1f0ee, 0.45),
    lime: gloss(LIME),
    mint: gloss(MINT),
    grass: gloss(GRASS),
    pearlLime: gloss(LIME, 0.16),
    pearlMint: gloss(MINT, 0.16),
  };
}

/* ---------- Tori ---------- */
function buildTori(m) {
  const tori = new THREE.Group();
  tori.add(new THREE.Mesh(new RoundedBoxGeometry(2.2, 2.2, 1.2, 6, 0.44), m.ink));
  const panel = new THREE.Mesh(new RoundedBoxGeometry(1.76, 1.76, 0.24, 6, 0.3), m.face);
  panel.position.z = 0.52;
  tori.add(panel);

  const FZ = 0.645;
  const R = 0.062;
  const cap = new THREE.SphereGeometry(R, 20, 12);
  const stroke = (curve) => {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, R, 12, false), m.feature));
    for (const t of [0, 1]) {
      const end = new THREE.Mesh(cap, m.feature);
      end.position.copy(curve.getPoint(t));
      group.add(end);
    }
    return group;
  };
  const v = (x, y) => new THREE.Vector3(x, y, FZ);
  const wink = new THREE.Group();
  wink.add(stroke(new THREE.LineCurve3(v(-0.4, 0.41), v(-0.12, 0.29))));
  wink.add(stroke(new THREE.LineCurve3(v(-0.4, 0.17), v(-0.12, 0.29))));
  tori.add(wink);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 20), m.feature);
  eye.position.set(0.44, 0.29, FZ - 0.02);
  eye.scale.z = 0.5;
  tori.add(eye);
  // a tiny highlight makes the eye read as looking somewhere
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  glint.position.set(0.05, 0.05, 0.13);
  eye.add(glint);
  const smile = stroke(new THREE.QuadraticBezierCurve3(v(-0.32, -0.27), v(0.12, -0.52), v(0.42, -0.1)));
  tori.add(smile);
  return { tori, eye, smile, eyeHome: eye.position.clone() };
}

/* ---------- the features ---------- */
function calendar(m) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.1, 0.26, 5, 0.14), m.white));
  const head = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.34, 0.3, 4, 0.12), m.pearlLime);
  head.position.y = 0.38;
  g.add(head);
  const ringGeo = new THREE.TorusGeometry(0.09, 0.032, 12, 28);
  for (const x of [-0.26, 0.26]) {
    const ring = new THREE.Mesh(ringGeo, m.inkSoft);
    ring.position.set(x, 0.56, 0);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
  }
  const cell = new RoundedBoxGeometry(0.2, 0.17, 0.06, 2, 0.04);
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      const booked = r === 1 && c === 1;
      const mesh = new THREE.Mesh(cell, booked ? m.mint : m.paper);
      mesh.position.set((c - 1) * 0.29, -0.02 - r * 0.25, 0.14);
      g.add(mesh);
    }
  }
  return g;
}

function bell(m) {
  const g = new THREE.Group();
  const profile = [
    [0, 0.62],
    [0.1, 0.6],
    [0.2, 0.52],
    [0.28, 0.32],
    [0.32, 0.05],
    [0.4, -0.18],
    [0.55, -0.3],
    [0.55, -0.36],
    [0, -0.36],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 48), m.pearlLime));
  const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), m.inkSoft);
  clapper.position.y = -0.44;
  g.add(clapper);
  const knob = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.035, 10, 24), m.inkSoft);
  knob.position.y = 0.68;
  g.add(knob);
  // the notification dot
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), m.mint);
  dot.position.set(0.36, 0.42, 0.12);
  g.add(dot);
  g.userData.swing = clapper;
  return g;
}

function clock(m) {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.16, 56), m.white);
  face.rotation.x = Math.PI / 2;
  g.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.08, 20, 64), m.inkSoft);
  g.add(rim);
  const tick = new RoundedBoxGeometry(0.05, 0.12, 0.04, 1, 0.02);
  for (let i = 0; i < 12; i += 3) {
    const t = new THREE.Mesh(tick, m.inkSoft);
    const a = (i / 12) * Math.PI * 2;
    t.position.set(Math.sin(a) * 0.38, Math.cos(a) * 0.38, 0.09);
    t.rotation.z = -a;
    g.add(t);
  }
  const hand = (len, width, mat) => {
    const pivot = new THREE.Group();
    const bar = new THREE.Mesh(new RoundedBoxGeometry(width, len, 0.05, 1, width / 2.2), mat);
    bar.position.y = len / 2 - 0.04;
    pivot.add(bar);
    pivot.position.z = 0.11;
    g.add(pivot);
    return pivot;
  };
  g.userData.minute = hand(0.36, 0.06, m.inkSoft);
  g.userData.hour = hand(0.24, 0.07, m.mint);
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), m.mint);
  pin.position.z = 0.14;
  g.add(pin);
  return g;
}

function star(m) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? 0.56 : 0.25;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.07,
    bevelSegments: 6,
    curveSegments: 4,
  });
  geo.center();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, m.pearlMint));
  return g;
}

function card(m) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.84, 0.08, 4, 0.08), m.inkSoft));
  const chip = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.18, 0.05, 2, 0.04), m.pearlLime);
  chip.position.set(-0.38, 0.1, 0.05);
  g.add(chip);
  const lineGeo = new RoundedBoxGeometry(0.2, 0.05, 0.03, 1, 0.02);
  for (let i = 0; i < 4; i += 1) {
    const line = new THREE.Mesh(lineGeo, m.white);
    line.position.set(-0.4 + i * 0.25, -0.18, 0.05);
    g.add(line);
  }
  const brand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24), m.mint);
  brand.rotation.x = Math.PI / 2;
  brand.position.set(0.44, 0.24, 0.05);
  g.add(brand);
  return g;
}

function chatBubble(m, mat = m.pearlLime, dotMat = m.inkSoftSoft) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(1, 0.66, 0.22, 5, 0.11), mat));
  const tail = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.26, 0.22, 2, 0.05), mat);
  tail.position.set(-0.3, -0.3, 0);
  tail.rotation.z = Math.PI / 4;
  tail.scale.z = 0.98;
  g.add(tail);
  const dotGeo = new THREE.SphereGeometry(0.065, 16, 10);
  g.userData.dots = [];
  for (let i = 0; i < 3; i += 1) {
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set((i - 1) * 0.22, 0, 0.11);
    dot.scale.z = 0.5;
    g.add(dot);
    g.userData.dots.push(dot);
  }
  return g;
}

function check(m) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.18, 48), m.inkSoft);
  disc.rotation.x = Math.PI / 2;
  g.add(disc);
  const curve = new THREE.CatmullRomCurve3(
    [new THREE.Vector3(-0.18, 0, 0.12), new THREE.Vector3(-0.04, -0.13, 0.12), new THREE.Vector3(0.2, 0.13, 0.12)],
    false,
    "catmullrom",
    0,
  );
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.055, 12, false), m.lime));
  for (const p of [curve.getPoint(0), curve.getPoint(1)]) {
    const end = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), m.lime);
    end.position.copy(p);
    g.add(end);
  }
  return g;
}

function orb(m, mat) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), mat));
  return g;
}

/* where each feature floats, as seen from the front (Tori is ~2.2 units tall) */
const FEATURE_LAYOUT = [
  { make: calendar, pos: [-2.45, 1.35, 0.3], size: 0.95 },
  { make: bell, pos: [2.4, 1.5, -0.2], size: 0.95 },
  { make: clock, pos: [2.55, -0.85, 0.5], size: 0.9 },
  { make: star, pos: [-2.5, -1.15, 0.8], size: 0.85 },
  { make: card, pos: [1.25, -2.1, 1.3], size: 0.8 },
  { make: chatBubble, pos: [-0.55, 2.45, -0.6], size: 0.8 },
  { make: check, pos: [-1.35, -2.2, 1.5], size: 0.62 },
  { make: (m) => orb(m, m.pearlMint), pos: [1.45, 2.4, 0.9], size: 0.34 },
  { make: (m) => orb(m, m.white), pos: [-3.05, 0.15, -1.3], size: 0.3 },
  { make: (m) => orb(m, m.pearlLime), pos: [3.1, 0.45, -1.5], size: 0.24 },
  { make: (m) => orb(m, m.pearlMint), pos: [0.15, -2.7, -0.6], size: 0.18 },
];

export async function createToriScene(host, opts) {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const lite = coarse || window.innerWidth < 640;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const featuresMode = opts.cast === "features";
  const chatMode = opts.cast === "chat";
  const soloQuery = window.matchMedia("(max-width: 560px)");
  let solo = featuresMode && soloQuery.matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  // the chat launcher is tiny: full sharpness costs nothing there
  let pixelRatio = Math.min(window.devicePixelRatio || 1, chatMode ? 3 : lite ? 1.5 : featuresMode ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.domElement.className = "tori3d-canvas";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;

  const frameZ = () => (chatMode ? 8.1 : solo ? 7.4 : featuresMode ? 13.2 : 10);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.35, frameZ());

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 6);
  const rimMint = new THREE.DirectionalLight(MINT, 2.4);
  rimMint.position.set(-5, 1.5, -3);
  const rimLime = new THREE.DirectionalLight(LIME, 2);
  rimLime.position.set(5, -1, -2.5);
  scene.add(key, rimMint, rimLime, new THREE.AmbientLight(0xffffff, 0.25));

  const m = makeMaterials();
  const { tori, eye, smile, eyeHome } = buildTori(m);
  const rig = new THREE.Group(); // drop-in, jump and squash; pointer tilt lives on `tori`
  rig.add(tori);
  scene.add(rig);
  // hover tests hit cheap invisible stand-ins, never the detailed meshes
  const proxyMat = new THREE.MeshBasicMaterial();
  const proxies = [];
  const toriProxy = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.3), proxyMat);
  toriProxy.visible = false;
  toriProxy.userData.hit = "tori";
  tori.add(toriProxy);
  proxies.push(toriProxy);

  /* soft floor shadow */
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext("2d");
  const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(23,22,22,0.55)");
  grad.addColorStop(1, "rgba(23,22,22,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.85;
  shadow.visible = !chatMode;
  scene.add(shadow);

  /* the cast */
  const cloud = new THREE.Group(); // features sway together with the pointer
  scene.add(cloud);
  const actors = [];
  if (featuresMode) {
    FEATURE_LAYOUT.forEach((def, i) => {
      const mesh = def.make(m);
      const holder = new THREE.Group();
      holder.add(mesh);
      holder.position.set(...def.pos);
      cloud.add(holder);
      const actor = {
        i,
        holder,
        mesh,
        home: new THREE.Vector3(...def.pos),
        size: def.size,
        scale: spring(0, 90, 9),
        intro: spring(0, 34, 7),
        ox: spring(0, 60, 8),
        oy: spring(0, 60, 8),
        oz: spring(0, 60, 8),
        twirl: spring(0, 40, 7),
        twirlTarget: 0,
        hover: false,
        appearAt: Infinity,
      };
      const proxy = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 8), proxyMat);
      proxy.visible = false;
      proxy.userData.hit = actor;
      holder.add(proxy);
      proxies.push(proxy);
      actors.push(actor);
    });
  } else if (chatMode) {
    // the speech bubble Tori is "saying": what tells you this button opens a chat
    const mesh = chatBubble(m, m.pearlLime, m.inkSoft);
    mesh.position.set(1.05, 1.3, 0.7);
    mesh.rotation.z = -0.12;
    rig.add(mesh);
    actors.push({ mesh, pop: spring(0, 120, 9) });
  } else {
    [
      { mat: m.lime, radius: 2.3, height: 0.55, tilt: 0.95, phase: 0.3, size: 0.78 },
      { mat: m.mint, radius: 2.45, height: -0.35, tilt: -0.95, phase: 2.4, size: 0.66 },
      { mat: m.white, radius: 2.2, height: 0.3, tilt: 1.15, phase: 4.4, size: 0.56 },
    ].forEach((def) => {
      const mesh = chatBubble(m, def.mat, m.inkSoft);
      scene.add(mesh);
      actors.push({ ...def, mesh });
    });
  }

  /* ---------- input ---------- */
  const pointer = { x: 0, y: 0, inside: false, lastMove: -10, speed: 0 };
  const ndc = new THREE.Vector2(9, 9);
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const pointerWorld = new THREE.Vector3(99, 99, 0);
  let lastPX = 0;
  let lastPY = 0;
  let hovered = null;

  let rect = host.getBoundingClientRect();
  let view = rect;
  function measure() {
    rect = host.getBoundingClientRect();
    view = renderer.domElement.getBoundingClientRect();
  }
  window.addEventListener("scroll", measure, { passive: true });

  function onPointer(event) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    pointer.x = Math.max(-1, Math.min(1, (event.clientX - cx) / (window.innerWidth / 2)));
    pointer.y = Math.max(-1, Math.min(1, (event.clientY - cy) / (window.innerHeight / 2)));
    pointer.inside =
      event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    ndc.set(((event.clientX - view.left) / view.width) * 2 - 1, -((event.clientY - view.top) / view.height) * 2 + 1);
    const dx = event.clientX - lastPX;
    const dy = event.clientY - lastPY;
    lastPX = event.clientX;
    lastPY = event.clientY;
    pointer.speed = Math.min(1, pointer.speed + Math.hypot(dx, dy) / 400);
    pointer.lastMove = clock;
    pointer.dirty = true;
  }
  window.addEventListener("pointermove", onPointer, { passive: true });

  function hitTest() {
    if (!pointer.inside) return null;
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(solo ? [toriProxy] : proxies, false)[0];
    return hit ? hit.object.userData.hit ?? null : null;
  }

  // The canvas may bleed past its box (CSS), so a feature that swells on hover is
  // never cut by the canvas edge. The framing still follows the box: widen the
  // field of view by however much taller the canvas is than the box.
  // sizes come from layout (offsetWidth), not from on-screen rects: a CSS scale
  // animation on a parent must never shrink the drawing buffer
  const PIXEL_BUDGET = 1.3e6;
  function resize() {
    measure();
    const box = { width: host.offsetWidth, height: host.offsetHeight };
    const canvas = renderer.domElement;
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    if (!box.width || !box.height || !cw || !ch) return;
    renderer.setPixelRatio(Math.min(pixelRatio, Math.sqrt(PIXEL_BUDGET / (cw * ch))));
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    const bleed = ch / box.height;
    camera.fov = (2 * Math.atan(bleed * Math.tan((15 * Math.PI) / 180)) * 180) / Math.PI;
    const boxAspect = box.width / box.height;
    baseZ = boxAspect < 1 ? frameZ() / Math.max(boxAspect, 0.62) : frameZ();
    camera.updateProjectionMatrix();
  }
  let baseZ = frameZ();
  const resizer = new ResizeObserver(resize);
  resizer.observe(host);
  function onSolo() {
    solo = featuresMode && soloQuery.matches;
    cloud.visible = !solo;
    resize();
  }
  soloQuery.addEventListener("change", onSolo);
  onSolo();

  /* ---------- state ---------- */
  const s = {
    rotX: spring(0, 70, 9),
    rotY: spring(0, 70, 9),
    lean: spring(1, 160, 12),
    drop: spring(0, 55, 7.5),
    pop: spring(chatMode ? 0 : 1, 150, 11),
    camX: spring(0, 18, 7),
    camY: spring(0, 18, 7),
    cloudY: spring(0, 20, 6),
    cloudX: spring(0, 20, 6),
    spread: spring(1, 30, 5),
    eyeX: spring(0, 140, 14),
    eyeY: spring(0, 140, 14),
    grin: spring(1, 120, 10),
    orbit: 0,
    orbitSpeed: 0.32,
    jumpAt: -10,
    jumpHeight: 0,
    jumpSpin: false,
    shakeAt: -10,
    blinkAt: 2.2,
    wander: { x: 0, y: 0, until: 0 },
  };
  let clock = 0;
  let hitFrame = 0;
  let slowAvg = 1 / 60;
  let lastDrop = 0;
  let lastHit = null;
  let entered = false;
  let nextNudge = 6;
  let last = performance.now() / 1000;
  let running = true;
  let frame = 0;
  const tmp = new THREE.Vector3();

  function tick() {
    frame = 0;
    if (!running) return;
    const now = performance.now() / 1000;
    // cap at ~60fps: on a 120Hz screen every other frame is skipped (half the
    // work, no visible loss); a 60Hz screen's frames are never skipped
    if (now - last < 0.0125) {
      frame = requestAnimationFrame(tick);
      return;
    }
    const raw = now - last;
    const dt = Math.min(0.05, raw);
    last = now;
    // adaptive resolution: if frames keep running long, render fewer pixels
    // only the big hero canvas adapts (a small one gains nothing but blur), and
    // not while the page is still busy loading
    if (featuresMode && entered && clock > 4 && raw < 0.25) {
      slowAvg = slowAvg * 0.95 + raw * 0.05;
      // only a device that is really struggling (under ~40fps, sustained)
      if (slowAvg > 1 / 40 && pixelRatio > 1 && clock - lastDrop > 2) {
        pixelRatio = Math.max(1, pixelRatio - 0.25);
        resize();
        lastDrop = clock;
        slowAvg = 1 / 60;
      }
    }
    clock += dt;
    const t = clock;
    const mood = opts.mood();
    const motion = calm ? 0 : 1;
    pointer.speed = Math.max(0, pointer.speed - dt * 1.6);

    // hover: re-test when the pointer moved, and every few frames as things drift
    hitFrame += 1;
    if (pointer.dirty || hitFrame % 6 === 0) {
      pointer.dirty = false;
      lastHit = hitTest();
    }
    const hit = lastHit;
    const next = hit && hit !== "tori" ? hit : null;
    if (next !== hovered) {
      if (hovered) hovered.hover = false;
      if (next) {
        next.hover = true;
        next.twirlTarget += Math.PI * 2;
      }
      hovered = next;
    }
    const cursor = hit ? "pointer" : "";
    if (host.style.cursor !== cursor) host.style.cursor = cursor;

    // where Tori looks: the pointer, the form while typing, or around when left alone
    const idle = t - pointer.lastMove > 3.5;
    if (idle && t > s.wander.until) {
      s.wander = { x: (Math.random() * 2 - 1) * 0.7, y: (Math.random() * 2 - 1) * 0.4, until: t + 1.6 + Math.random() * 2 };
    }
    let lookX = idle ? s.wander.x : pointer.x;
    let lookY = idle ? s.wander.y : pointer.y;
    if (hovered) {
      // glance at the hovered feature
      tmp.copy(hovered.holder.position).applyMatrix4(cloud.matrixWorld);
      lookX = Math.max(-1, Math.min(1, tmp.x / 3));
      lookY = Math.max(-1, Math.min(1, -tmp.y / 3));
    }
    const looking = mood === "look" || mood === "busy";
    if (looking) {
      lookX = opts.formSide;
      lookY = 0.45;
    }
    const strength = featuresMode ? 0.62 : chatMode ? 0.32 : 0.5;
    step(s.rotY, lookX * strength, dt);
    step(s.rotX, lookY * strength * 0.6, dt);
    step(s.eyeX, lookX * 0.07, dt);
    step(s.eyeY, -lookY * 0.06, dt);
    // over Tori (or anywhere on the chat button): he leans in and grins
    const engaged = hit === "tori" || (chatMode && pointer.inside);
    step(s.lean, engaged ? 1.07 : 1, dt);
    step(s.grin, engaged ? 1.22 : 1, dt);
    // the chat launcher hops now and then to say hello
    if (chatMode && entered && t > nextNudge) {
      nextNudge = t + 7 + Math.random() * 4;
      if (!pointer.inside) cue("hop");
    }
    s.orbitSpeed += ((mood === "busy" ? 1.6 : 0.32) - s.orbitSpeed) * Math.min(1, dt * 3);
    s.orbit += dt * s.orbitSpeed * motion;

    // the camera drifts with the pointer: near and far objects slide apart
    const drift = chatMode ? 0.25 : solo ? 0.35 : featuresMode ? 0.8 : 0.5;
    step(s.camX, pointer.x * drift, dt);
    step(s.camY, -pointer.y * drift * 0.56, dt);
    // the chat frame sits up and to the right, making room for the bubble
    camera.position.set(s.camX.x + (chatMode ? 0.4 : 0), 0.35 + s.camY.x + (chatMode ? 0.6 : 0), baseZ);
    // alone on a phone, the frame drops a little so his shadow stays in the box
    camera.lookAt(chatMode ? 0.4 : 0, chatMode ? 0.62 : solo ? -0.45 : 0.1, 0);

    // jump (happy spins, hop just bounces)
    let lift = 0;
    let spin = 0;
    let squash = 0;
    const jp = (t - s.jumpAt) / (s.jumpSpin ? 0.95 : 0.6);
    if (jp >= 0 && jp < 1) {
      lift = Math.sin(Math.PI * jp) * s.jumpHeight;
      if (s.jumpSpin) spin = easeInOut(jp) * Math.PI * 2;
      squash = jp < 0.12 ? Math.sin((jp / 0.12) * Math.PI) * 0.1 : 0;
    } else if (jp >= 1 && jp < 1.25) {
      squash = Math.sin(((jp - 1) / 0.25) * Math.PI) * 0.12;
    }
    let shake = 0;
    const sp = (t - s.shakeAt) / 0.7;
    if (sp >= 0 && sp < 1) shake = Math.sin(sp * Math.PI * 6) * 0.32 * (1 - sp);

    // drop in on entrance, spinning down and landing with a squash
    const dropY = step(s.drop, 0, dt);
    const pop = step(s.pop, entered ? 1 : 0, dt);
    const introSpin = featuresMode ? Math.max(0, dropY / 7) * Math.PI * 2.5 : 0;
    // the spring overshoots below the floor on landing: read that as a squash
    const landing = Math.max(0, Math.min(0.14, -dropY * 0.6));
    const bob = Math.sin(t * 1.5) * 0.08 * motion;
    // before the entrance Tori waits far above the frame (still rendered, so
    // every shader is compiled while the page loader is up)
    rig.position.y = entered ? 0.05 + bob + lift * motion + (calm ? 0 : dropY) : 40;
    const sq = squash + landing;
    const lean = s.lean.x * (featuresMode && !solo ? 1.12 : 1) * Math.max(0, pop);
    rig.scale.set((1 + sq * 0.6) * lean, (1 - sq) * lean, (1 + sq * 0.6) * lean);
    tori.rotation.y = s.rotY.x + (spin + introSpin) * motion + shake;
    tori.rotation.x = s.rotX.x;
    tori.rotation.z = Math.sin(t * 0.9) * 0.035 * motion - shake * 0.15 - s.rotY.v * 0.02;

    eye.position.set(eyeHome.x + s.eyeX.x, eyeHome.y + s.eyeY.x, eyeHome.z);
    if (t > s.blinkAt) {
      const bp = (t - s.blinkAt) / 0.16;
      eye.scale.y = bp < 1 ? 1 - Math.sin(bp * Math.PI) * 0.88 : 1;
      if (bp >= 1) s.blinkAt = t + 2.2 + Math.random() * 3.2;
    }
    const celebrating = jp >= 0 && jp < 1.2 && s.jumpSpin;
    smile.scale.x = celebrating ? 1.2 : s.grin.x;
    smile.scale.y = celebrating ? 1.2 : 1 + (s.grin.x - 1) * 1.4;

    const height = 1 - Math.min(1, Math.max(lift, dropY) / 1.4);
    shadow.scale.setScalar(0.75 + height * 0.25 + sq);
    shadow.material.opacity = entered ? 0.35 + height * 0.65 : 0;

    if (featuresMode) {
      // the cloud sways on its own and leans toward the pointer
      step(s.cloudY, pointer.x * 0.28 + Math.sin(t * 0.22) * 0.18 * motion, dt);
      step(s.cloudX, pointer.y * 0.16, dt);
      cloud.rotation.y = s.cloudY.x;
      cloud.rotation.x = s.cloudX.x;
      cloud.updateMatrixWorld();
      const spread = step(s.spread, 1, dt);

      // the pointer on the stage plane: features shy away from it
      raycaster.setFromCamera(ndc, camera);
      const onPlane = pointer.inside && raycaster.ray.intersectPlane(plane, pointerWorld);
      actors.forEach((a) => {
        const appear = t > a.appearAt ? 1 : 0;
        step(a.scale, appear * a.size * (a.hover ? 1.28 : 1), dt);
        a.holder.scale.setScalar(Math.max(0, a.scale.x));
        // on entrance they fly in from beyond the frame and settle into place
        const intro = step(a.intro, appear, dt);
        const away = 1 - intro;

        let px = 0;
        let py = 0;
        let pz = 0;
        if (onPlane) {
          tmp.copy(a.home).multiplyScalar(spread).applyMatrix4(cloud.matrixWorld);
          const dx = tmp.x - pointerWorld.x;
          const dy = tmp.y - pointerWorld.y;
          const dist = Math.hypot(dx, dy) || 1;
          // a fast swipe scatters them; a slow approach lets you hover one
          const push = Math.max(0, 1.9 - dist) * pointer.speed * 1.5;
          px = (dx / dist) * push;
          py = (dy / dist) * push;
          pz = push * 0.5;
        }
        step(a.ox, px, dt);
        step(a.oy, py, dt);
        step(a.oz, pz, dt);
        const bobA = Math.sin(t * (0.9 + a.i * 0.07) + a.i * 1.7) * 0.16 * motion;
        a.holder.position.set(
          a.home.x * (spread + away * 1.6) + a.ox.x,
          a.home.y * (spread + away * 1.6) + a.oy.x + bobA,
          a.home.z * spread + a.oz.x + away * 5,
        );
        step(a.twirl, a.twirlTarget, dt);
        // they sway but keep facing front, so each one stays readable; hover spins them
        a.mesh.rotation.y = a.twirl.x + Math.sin(t * 0.6 + a.i) * 0.45 * motion + away * Math.PI * 1.5;
        a.mesh.rotation.x = Math.sin(t * 0.5 + a.i * 2) * 0.18 * motion;
        a.mesh.rotation.z = Math.sin(t * 0.7 + a.i) * 0.1 * motion;

        const { swing, minute, hour, dots } = a.mesh.userData;
        if (swing) swing.position.x = Math.sin(t * 6) * 0.06 * motion * (a.hover ? 2.5 : 1);
        if (minute) minute.rotation.z = -t * 1.2 * (a.hover ? 4 : 1);
        if (hour) hour.rotation.z = -t * 0.1;
        if (dots) dots.forEach((dot, k) => (dot.position.y = Math.max(0, Math.sin(t * 5 - k * 0.7)) * 0.07 * motion));
      });
    } else if (chatMode) {
      const [bubble] = actors;
      const shown = step(bubble.pop, entered ? 1 : 0, dt);
      bubble.mesh.scale.setScalar(Math.max(0, shown) * (pointer.inside ? 1.32 : 1.18));
      bubble.mesh.rotation.y = -tori.rotation.y * 0.4;
      const speed = pointer.inside ? 9 : 5;
      bubble.mesh.userData.dots.forEach((dot, k) => {
        dot.position.y = Math.max(0, Math.sin(t * speed - k * 0.7)) * 0.08 * motion;
      });
    } else {
      const spread = step(s.spread, 1, dt);
      actors.forEach((b, i) => {
        const a = s.orbit + b.phase;
        const r = b.radius * spread;
        b.mesh.position.set(
          Math.cos(a) * r,
          b.height + Math.sin(a) * b.tilt + Math.sin(t * 1.3 + i) * 0.1 * motion,
          Math.sin(a) * r * 0.62,
        );
        b.mesh.lookAt(camera.position);
        b.mesh.rotateZ(Math.sin(t * 1.1 + i * 2) * 0.12 * motion);
        b.mesh.scale.setScalar(b.size);
        b.mesh.userData.dots.forEach((dot, k) => {
          dot.position.y = Math.max(0, Math.sin(t * 5 - k * 0.7 + i)) * 0.07 * motion;
        });
      });
    }

    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }

  function setRunning(next) {
    if (next === running) return;
    running = next;
    if (running) {
      last = performance.now() / 1000;
      if (!frame) frame = requestAnimationFrame(tick);
    }
  }
  const seen = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting && !document.hidden));
  seen.observe(host);
  function onVisibility() {
    setRunning(!document.hidden);
  }
  document.addEventListener("visibilitychange", onVisibility);
  renderer.compile(scene, camera);
  frame = requestAnimationFrame(tick);

  function cue(type) {
    if (type === "happy" || type === "hop") {
      s.jumpAt = clock;
      s.jumpSpin = type === "happy";
      s.jumpHeight = type === "happy" ? 1.1 : 0.45;
      if (type === "happy") s.spread.v += featuresMode ? 2.6 : 1.8;
    } else if (type === "error") {
      s.shakeAt = clock;
    }
  }

  function enter() {
    if (entered) return;
    entered = true;
    if (featuresMode) {
      s.drop.x = calm ? 0 : 7;
      s.drop.v = 0;
      actors.forEach((a) => {
        a.appearAt = clock + 0.55 + a.i * 0.07;
      });
    } else if (opts.cast === "sms") {
      cue("hop");
    }
    nextNudge = clock + 5;
  }

  return {
    cue,
    enter,
    /** a tap or click on the stage: Tori celebrates, a feature spins and Tori hops */
    poke() {
      const hit = hitTest();
      if (hit && hit !== "tori") {
        hit.twirlTarget += Math.PI * 4;
        hit.scale.v += 6;
        cue("hop");
        return;
      }
      cue("happy");
    },
    /** touch has no hover: aim at the touch point first so the hit test sees it */
    aim(event) {
      onPointer(event);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      soloQuery.removeEventListener("change", onSolo);
      window.removeEventListener("scroll", measure);
      document.removeEventListener("visibilitychange", onVisibility);
      resizer.disconnect();
      seen.disconnect();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material?.dispose());
      });
      Object.values(m).forEach((material) => material.dispose());
      proxyMat.dispose();
      shadowTex.dispose();
      scene.environment?.dispose();
      room.dispose?.();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
