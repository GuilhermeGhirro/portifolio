// =====================================================================
//  Mesa dos anos 90 — cena 3D do portfólio (Three.js)
// =====================================================================
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { perfil, ferramentas, emAndamento, emAndamentoLiberado, projects } from './data.js';
import * as TX from './textures.js';
import { aboutScreen, toolsScreen, projectsScreen } from './screens.js';
import { UI } from './ui.js';
import { Sfx } from './audio.js';

// ---------------------------------------------------------------------
// fontes precisam estar carregadas antes de desenhar nos canvas
// ---------------------------------------------------------------------
const bootLog = document.getElementById('boot-log');
const bootBar = document.getElementById('boot-bar');
function logBoot(t) { if (bootLog) bootLog.textContent += t + '\n'; }

try {
  await Promise.race([
    Promise.all(['30px VT323', '20px "Press Start 2P"', '30px Caveat', 'bold 30px Caveat', '30px "Special Elite"'].map(f => document.fonts.load(f))),
    new Promise(r => setTimeout(r, 3500)),
  ]);
} catch (e) { /* segue com fontes padrão */ }

// ---------------------------------------------------------------------
// renderer / cena / câmera
// ---------------------------------------------------------------------
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  document.body.classList.add('no-webgl');
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b0a10');
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.02, 40);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.4, 0.55, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const DESK_Y = 0; // topo da mesa
const FLOOR_Y = -0.76;

// ---------------------------------------------------------------------
// materiais
// ---------------------------------------------------------------------
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...o });
const M = {
  beige: std('#d6cbb0', { roughness: 0.55 }),
  beigeDark: std('#b9ad90', { roughness: 0.6 }),
  darkPlastic: std('#222326', { roughness: 0.45 }),
  black: std('#0c0c0d', { roughness: 0.35 }),
  metal: std('#8f9196', { roughness: 0.5, metalness: 0.7 }),
  wood: std('#ffffff', { map: TX.woodTexture(), roughness: 0.55 }),
  woodDark: std('#5a371f', { roughness: 0.7 }),
  wall: std('#ffffff', { map: TX.wallpaperTexture(), roughness: 0.95 }),
  floor: std('#ffffff', { map: TX.floorTexture(), roughness: 0.75 }),
  trim: std('#e9e1cc', { roughness: 0.5 }),
};

const shadow = (o, cast = true, receive = true) => { o.traverse(c => { if (c.isMesh) { c.castShadow = cast; c.receiveShadow = receive; } }); return o; };
const add = (o, parent = scene) => { parent.add(o); return o; };
const box = (w, h, d, mat, r = 0) => new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d), mat);

// ---------------------------------------------------------------------
// quarto
// ---------------------------------------------------------------------
const WALL_Z = -0.8;
{
  const back = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.2), M.wall);
  back.position.set(0, FLOOR_Y + 2.1, WALL_Z); back.receiveShadow = true; add(back);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.2), M.wall);
    side.position.set(2.15 * s, FLOOR_Y + 2.1, 2.2); side.rotation.y = -s * Math.PI / 2; side.receiveShadow = true; add(side);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 8), M.floor);
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, FLOOR_Y, 2); floor.receiveShadow = true; add(floor);
  const base = box(9, 0.1, 0.02, M.trim); base.position.set(0, FLOOR_Y + 0.05, WALL_Z + 0.01); add(base);
}

// ---------------------------------------------------------------------
// mesa
// ---------------------------------------------------------------------
{
  const top = box(3.5, 0.06, 1.32, M.wood, 0.012);
  top.position.set(0, DESK_Y - 0.03, -0.1); add(shadow(top));
  const edge = box(3.5, 0.02, 0.02, M.woodDark); edge.position.set(0, DESK_Y - 0.05, 0.565); add(edge);
  for (const [x, z] of [[-1.68, -0.68], [-1.68, 0.48], [1.68, -0.68], [1.68, 0.48]]) {
    const leg = box(0.06, 0.72, 0.06, M.woodDark); leg.position.set(x, FLOOR_Y + 0.36, z); add(shadow(leg));
  }
  // gaveteiro
  const drawers = box(0.6, 0.66, 1.1, M.woodDark, 0.01); drawers.position.set(1.32, FLOOR_Y + 0.36, -0.12); add(shadow(drawers));
  for (let i = 0; i < 3; i++) {
    const f = box(0.56, 0.19, 0.01, M.wood); f.position.set(1.32, DESK_Y - 0.17 - i * 0.205, 0.435); add(f);
    const h = box(0.12, 0.015, 0.02, M.metal); h.position.set(1.32, DESK_Y - 0.13 - i * 0.205, 0.445); add(h);
  }
}

// ---------------------------------------------------------------------
// interatividade: registro de objetos clicáveis
// ---------------------------------------------------------------------
const interactive = []; // meshes alvo do raycaster
function makeInteractive(root, info) {
  root.userData.info = info;
  root.userData.hover = 0;
  root.traverse(c => { if (c.isMesh) { c.userData.root = root; interactive.push(c); } });
}

// ---------------------------------------------------------------------
// monitores de tubo (CRT)
// ---------------------------------------------------------------------
const sheenTex = TX.glassSheen();

function postIt(text, color = '#ffe873') {
  const c = TX.makeCanvas(200, 200), g = c.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, 200, 200);
  g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 0, 200, 30);
  g.fillStyle = '#233'; g.font = '44px Caveat'; g.textAlign = 'center';
  text.split('\n').forEach((l, i) => g.fillText(l, 100, 90 + i * 46));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.075), std('#fff', { map: TX.toTexture(c), roughness: 0.9 }));
  return m;
}

function makeCRT({ w, screen, label }) {
  const h = w * 0.86, d = 0.1;
  const g = new THREE.Group();
  const body = new THREE.Group(); g.add(body);
  const lift = 0.035;
  body.position.y = lift + h / 2;

  const bezel = box(w, h, d, M.beige, 0.028); body.add(bezel);
  // traseira em tronco de pirâmide
  const depth = w * 0.82;
  const bg = new THREE.BoxGeometry(w * 0.94, h * 0.92, depth);
  const p = bg.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getZ(i) < 0) { p.setX(i, p.getX(i) * 0.6); p.setY(i, p.getY(i) * 0.62 - h * 0.05); }
  bg.computeVertexNormals();
  const back = new THREE.Mesh(bg, M.beigeDark); back.position.z = -d / 2 - depth / 2 + 0.01; body.add(back);
  // grade de ventilação
  for (let i = 0; i < 6; i++) {
    const v = box(w * 0.3, 0.004, 0.01, M.black); v.position.set(0, h * 0.18 - i * 0.02, -d / 2 - depth * 0.5); v.rotation.x = -0.2; body.add(v);
  }
  // tela
  const sw = w * 0.76, sh = sw * 0.75, sy = h * 0.06;
  const rim = box(sw * 1.09, sh * 1.12, 0.01, M.black, 0.01); rim.position.set(0, sy, d / 2 - 0.002); body.add(rim);
  const sg = new THREE.PlaneGeometry(sw, sh, 24, 18);
  const sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i) / (sw / 2), y = sp.getY(i) / (sh / 2);
    sp.setZ(i, (1 - (x * x) * 0.5 - (y * y) * 0.5) * 0.012);
  }
  sg.computeVertexNormals();
  const smat = new THREE.MeshBasicMaterial({ map: screen.texture });
  smat.color.setScalar(1.35);
  const scr = new THREE.Mesh(sg, smat); scr.position.set(0, sy, d / 2 + 0.004); body.add(scr);
  const sheen = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sheen.position.copy(scr.position); sheen.position.z += 0.001; body.add(sheen);
  // queixo: botão, LED e plaquinha
  const btn = box(0.03, 0.018, 0.01, M.beigeDark, 0.004); btn.position.set(w * 0.36, -h * 0.42, d / 2 + 0.004); body.add(btn);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 10, 8), new THREE.MeshBasicMaterial({ color: '#203320' }));
  led.position.set(w * 0.29, -h * 0.42, d / 2 + 0.006); body.add(led);
  const badge = box(0.07, 0.012, 0.004, M.metal); badge.position.set(0, -h * 0.42, d / 2 + 0.002); body.add(badge);
  for (let i = 0; i < 3; i++) { const k = box(0.012, 0.012, 0.008, M.beigeDark, 0.003); k.position.set(-w * 0.36 + i * 0.022, -h * 0.42, d / 2 + 0.004); body.add(k); }
  // base giratória
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.3, w * 0.34, lift, 32), M.beigeDark);
  foot.position.y = lift / 2; g.add(foot);

  shadow(g);
  scr.castShadow = false; sheen.castShadow = false;
  g.userData.crt = { screenMesh: scr, sw, sh, led, screen, bezel, label };
  return g;
}

const screens = {
  about: aboutScreen(perfil),
  tools: toolsScreen(ferramentas),
  projects: projectsScreen(projects),
};

// gabinete "desktop" sob o monitor central
const pcCase = new THREE.Group();
{
  const c = box(0.66, 0.13, 0.5, M.beige, 0.012); c.position.y = 0.065; pcCase.add(c);
  const face = box(0.64, 0.11, 0.005, M.beigeDark); face.position.set(0, 0.065, 0.251); pcCase.add(face);
  const slot1 = box(0.12, 0.012, 0.006, M.black); slot1.position.set(0.17, 0.085, 0.255); pcCase.add(slot1);
  const slot2 = box(0.17, 0.035, 0.006, M.beige); slot2.position.set(-0.12, 0.075, 0.255); pcCase.add(slot2);
  const s2b = box(0.1, 0.004, 0.003, M.black); s2b.position.set(-0.12, 0.075, 0.259); pcCase.add(s2b);
  const pw = box(0.035, 0.035, 0.012, M.darkPlastic, 0.006); pw.position.set(0.27, 0.06, 0.256); pcCase.add(pw);
  const turbo = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), new THREE.MeshBasicMaterial({ color: '#ff5533' }));
  turbo.material.color.setScalar(1); turbo.position.set(0.225, 0.04, 0.256); pcCase.add(turbo);
  pcCase.userData.turbo = turbo;
  const hdd = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), new THREE.MeshBasicMaterial({ color: '#33ff66' }));
  hdd.position.set(0.205, 0.04, 0.256); pcCase.add(hdd); pcCase.userData.hdd = hdd;
  pcCase.position.set(0.12, DESK_Y, -0.42);
  add(shadow(pcCase));
}

const monitors = {};
{
  const defs = [
    { id: 'about', w: 0.44, pos: [-1.2, DESK_Y, -0.36], rotY: 0.42, label: 'SOBRE MIM', glow: '#ffb43a' },
    { id: 'tools', w: 0.44, pos: [-0.62, DESK_Y, -0.42], rotY: 0.2, label: 'FERRAMENTAS', glow: '#3cff7a' },
    { id: 'projects', w: 0.54, pos: [0.12, DESK_Y + 0.13, -0.38], rotY: 0, label: 'PROJETOS', glow: '#9fd8ff' },
  ];
  for (const d of defs) {
    const crt = makeCRT({ w: d.w, screen: screens[d.id], label: d.label });
    crt.position.set(...d.pos); crt.rotation.y = d.rotY;
    add(crt);
    const glow = new THREE.PointLight(d.glow, 0, 1.4, 2);
    glow.position.set(0, 0.04 + d.w * 0.4, 0.42); crt.add(glow);
    crt.userData.glow = glow;
    makeInteractive(crt, { kind: 'monitor', id: d.id, label: d.label });
    monitors[d.id] = crt;
  }
  // post-its
  const p1 = postIt('café\n+ código'); p1.position.set(0.17, 0.43, 0.052); p1.rotation.z = -0.12; monitors.about.add(p1);
  const p2 = postIt('deploy\nsexta?', '#9cf0ff'); p2.position.set(-0.24, 0.47, 0.052); p2.rotation.z = 0.1; monitors.projects.add(p2);
  const p3 = postIt('git push\n:)', '#ffb3d9'); p3.position.set(0.17, 0.08, 0.052); p3.rotation.z = 0.08; monitors.tools.add(p3);
}

// ---------------------------------------------------------------------
// teclado
// ---------------------------------------------------------------------
const keyboard = new THREE.Group();
let keyMesh, keyCount = 0, keyBase = [], keyPress;
{
  const base = box(0.62, 0.03, 0.21, M.beige, 0.01); base.position.y = 0.015; keyboard.add(base);
  const keyGeo = new RoundedBoxGeometry(0.03, 0.02, 0.03, 2, 0.005);
  const rows = 5, cols = 15, pitch = 0.0365;
  const total = rows * cols + 1;
  keyMesh = new THREE.InstancedMesh(keyGeo, std('#ffffff', { roughness: 0.5 }), total);
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (r === 4 && c > 3 && c < 11) continue; // espaço p/ barra
    const x = -0.255 + c * pitch + (r % 2) * 0.008, z = -0.072 + r * pitch;
    keyBase.push([x, 0.038, z]);
    m4.makeTranslation(x, 0.038, z); keyMesh.setMatrixAt(keyCount, m4);
    const special = c === 0 || c === cols - 1 || r === 0;
    keyMesh.setColorAt(keyCount, col.set(special ? '#9c9584' : '#e4dcc6'));
    keyCount++;
  }
  // barra de espaço
  keyMesh.count = keyCount;
  keyMesh.instanceMatrix.needsUpdate = true;
  keyboard.add(keyMesh);
  const space = box(0.25, 0.02, 0.03, M.beige, 0.005); space.position.set(0.015, 0.038, -0.072 + 4 * pitch); keyboard.add(space);
  keyboard.userData.space = space;
  keyPress = new Float32Array(keyCount);
  // LEDs
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.0025, 6, 6), new THREE.MeshBasicMaterial({ color: i === 1 ? '#5f5' : '#232' }));
    l.position.set(0.22 + i * 0.016, 0.031, -0.09); keyboard.add(l);
  }
  keyboard.position.set(0.1, DESK_Y, 0.2); keyboard.rotation.x = 0.04;
  add(shadow(keyboard));
  makeInteractive(keyboard, { kind: 'prop', id: 'keyboard', label: 'teclado — digite algo!' });
}
function pressRandomKey() {
  const i = Math.floor(Math.random() * keyCount); keyPress[i] = 1;
}

// ---------------------------------------------------------------------
// mouse + mousepad + fio
// ---------------------------------------------------------------------
const mouse3d = new THREE.Group();
{
  const pad = new THREE.Mesh(new RoundedBoxGeometry(0.27, 0.004, 0.22, 2, 0.002), std('#fff', { map: TX.mousepadTexture(), roughness: 0.9 }));
  pad.position.set(0.66, DESK_Y + 0.002, 0.24); add(pad); pad.receiveShadow = true;
  const bodyGeo = new THREE.SphereGeometry(1, 24, 16);
  const body = new THREE.Mesh(bodyGeo, M.beige); body.scale.set(0.032, 0.02, 0.052); body.position.y = 0.006; mouse3d.add(body);
  const split = box(0.002, 0.004, 0.035, M.beigeDark); split.position.set(0, 0.024, -0.025); mouse3d.add(split);
  mouse3d.position.set(0.66, DESK_Y + 0.004, 0.25);
  add(shadow(mouse3d));
  makeInteractive(mouse3d, { kind: 'prop', id: 'mouse', label: 'mouse de bolinha' });
}
let cable;
function updateCable() {
  if (cable) { scene.remove(cable); cable.geometry.dispose(); }
  const a = mouse3d.position.clone().add(new THREE.Vector3(0, 0.008, -0.05));
  const curve = new THREE.CatmullRomCurve3([
    a, a.clone().add(new THREE.Vector3(0.02, -0.003, -0.08)),
    new THREE.Vector3(0.55, 0.004, -0.05), new THREE.Vector3(0.45, 0.004, -0.2), new THREE.Vector3(0.38, 0.03, -0.45),
  ]);
  cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.0028, 6), M.beigeDark); cable.castShadow = true;
  add(cable);
}
updateCable();

// ---------------------------------------------------------------------
// papéis — projetos em andamento
// ---------------------------------------------------------------------
const papers = [];
{
  const places = [
    [0.96, -0.1, 0.22], [1.24, -0.2, -0.16], [1.5, -0.02, 0.3], [1.05, 0.26, -0.08], [1.36, 0.31, 0.14],
  ];
  const PW = 0.21, PH = 0.297;
  const geo = new THREE.PlaneGeometry(PW, PH, 10, 14);
  const gp = geo.attributes.position;
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i); gp.setZ(i, (x * x) * 0.35 + Math.sin(gp.getY(i) * 9) * 0.0015); }
  geo.computeVertexNormals();
  emAndamento.forEach((item, i) => {
    const pl = places[i % places.length];
    const mat = std('#ffffff', { map: TX.paperTexture(item, i, !emAndamentoLiberado), roughness: 0.92, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    const g = new THREE.Group(); g.add(mesh);
    const rest = {
      pos: new THREE.Vector3(pl[0], DESK_Y + 0.003 + i * 0.0018, pl[1]),
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, pl[2], 'XYZ')),
    };
    g.position.copy(rest.pos); g.quaternion.copy(rest.quat);
    g.userData.rest = rest; g.userData.item = item; g.userData.size = [PW, PH];
    add(g);
    g.userData.hover = 0;
    if (emAndamentoLiberado) makeInteractive(g, { kind: 'paper', id: item.id, label: `EM ANDAMENTO — ${item.titulo}` });
    papers.push(g);
  });
  // lápis
  const pencil = new THREE.Group();
  const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 6), std('#f2c230'));
  pb.rotation.z = Math.PI / 2; pencil.add(pb);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.018, 6), std('#e8c9a0')); tip.rotation.z = -Math.PI / 2; tip.position.x = 0.089; pencil.add(tip);
  const er = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.012, 8), std('#e88a9a')); er.rotation.z = Math.PI / 2; er.position.x = -0.086; pencil.add(er);
  pencil.position.set(1.15, DESK_Y + 0.006, 0.05); pencil.rotation.y = 0.6;
  add(shadow(pencil));
}

// ---------------------------------------------------------------------
// luminária articulada
// ---------------------------------------------------------------------
const lamp = new THREE.Group();
let lampLight, bulb;
{
  const lampMat = std('#2c4f7c', { roughness: 0.35, metalness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 32), lampMat); base.position.y = 0.01; lamp.add(base);
  const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 10), lampMat);
  a1.position.set(0.04, 0.17, 0); a1.rotation.z = -0.25; lamp.add(a1);
  const j = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 10), M.metal); j.position.set(0.085, 0.345, 0); lamp.add(j);
  const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 10), lampMat);
  a2.position.set(-0.04, 0.4, 0); a2.rotation.z = 1.15; lamp.add(a2);
  const head = new THREE.Group(); head.position.set(-0.17, 0.44, 0); head.rotation.z = 0.9; lamp.add(head);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.11, 32, 1, true), std('#2c4f7c', { roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide }));
  head.add(shade);
  bulb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 12), new THREE.MeshBasicMaterial({ color: '#3a3328' }));
  bulb.position.y = -0.035; head.add(bulb);
  lampLight = new THREE.SpotLight('#ffcf8a', 0, 3.2, 0.75, 0.55, 1.6);
  lampLight.position.set(0, -0.03, 0); head.add(lampLight);
  lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -0.0008;
  lampLight.shadow.camera.near = 0.05;
  const tgt = new THREE.Object3D(); tgt.position.set(1.0, 0, 0.1); scene.add(tgt); lampLight.target = tgt;
  lamp.position.set(1.52, DESK_Y, -0.5); lamp.rotation.y = 0.5;
  add(shadow(lamp));
  shade.castShadow = false; bulb.castShadow = false;
  makeInteractive(lamp, { kind: 'prop', id: 'lamp', label: 'luminária — clique p/ ligar/desligar' });
}

// ---------------------------------------------------------------------
// relógio digital (hora real)
// ---------------------------------------------------------------------
const clockCanvas = TX.makeCanvas(256, 110);
const clockTex = TX.toTexture(clockCanvas);
const clock3d = new THREE.Group();
{
  const b = box(0.15, 0.065, 0.06, M.darkPlastic, 0.01); b.position.y = 0.032; b.rotation.x = -0.15; clock3d.add(b);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.05), new THREE.MeshBasicMaterial({ map: clockTex }));
  face.material.color.setScalar(1.4);
  face.position.set(0, 0.034, 0.031); face.rotation.x = -0.15; clock3d.add(face);
  clock3d.position.set(0.82, DESK_Y, -0.42); clock3d.rotation.y = -0.25;
  add(shadow(clock3d));
  makeInteractive(clock3d, { kind: 'prop', id: 'clock', label: 'relógio — clique p/ mudar dia/noite' });
}
let lastClock = '';
function drawClock() {
  const d = new Date();
  const s = `${String(d.getHours()).padStart(2, '0')}${d.getSeconds() % 2 ? ':' : ' '}${String(d.getMinutes()).padStart(2, '0')}`;
  if (s === lastClock) return; lastClock = s;
  const g = clockCanvas.getContext('2d');
  g.fillStyle = '#120403'; g.fillRect(0, 0, 256, 110);
  g.font = '92px VT323'; g.textAlign = 'center';
  g.fillStyle = 'rgba(255,40,30,0.08)'; g.fillText('88:88', 128, 86);
  g.shadowColor = '#ff2a1a'; g.shadowBlur = 14; g.fillStyle = '#ff3b2a'; g.fillText(s, 128, 86); g.shadowBlur = 0;
  clockTex.needsUpdate = true;
}

// ---------------------------------------------------------------------
// caneca com vapor
// ---------------------------------------------------------------------
const mug = new THREE.Group();
const steam = [];
{
  const mm = std('#2a8c8c', { roughness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.037, 0.1, 28, 1, true), new THREE.MeshStandardMaterial({ color: '#2a8c8c', roughness: 0.3, side: THREE.DoubleSide }));
  body.position.y = 0.05; mug.add(body);
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.006, 28), mm); bottom.position.y = 0.003; mug.add(bottom);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.038, 28), std('#2b170b', { roughness: 0.15 }));
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.085; mug.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.007, 10, 20, Math.PI * 1.2), mm);
  handle.position.set(0.043, 0.05, 0); handle.rotation.z = -Math.PI * 0.6; mug.add(handle);
  // faixa
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0405, 0.0395, 0.015, 28, 1, true), std('#f4e9cf')); band.position.y = 0.07; mug.add(band);
  mug.position.set(-1.05, DESK_Y, 0.28);
  add(shadow(mug));
  const dot = TX.softDot();
  for (let i = 0; i < 10; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, transparent: true, depthWrite: false, opacity: 0 }));
    sp.userData.t = i / 10; sp.scale.setScalar(0.03); mug.add(sp); steam.push(sp);
  }
  makeInteractive(mug, { kind: 'prop', id: 'mug', label: 'café — combustível de dev' });
}

// ---------------------------------------------------------------------
// disquetes, fita cassete, cubo mágico
// ---------------------------------------------------------------------
{
  const fl = [['PROJETOS', '#1d1d22', '#e33'], ['BACKUP 96', '#1b3c8c', '#2b8'], ['JOGOS!!', '#9b1d1d', '#fb2']];
  fl.forEach(([t, c, lc], i) => {
    const f = new THREE.Group();
    const b = box(0.09, 0.0034, 0.094, std(c, { roughness: 0.4 }), 0.002); f.add(b);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.05), std('#fff', { map: TX.floppyLabel(t, lc), roughness: 0.9 }));
    lab.rotation.x = -Math.PI / 2; lab.position.set(0, 0.0018, 0.016); f.add(lab);
    const sh = box(0.05, 0.0037, 0.03, M.metal); sh.position.set(0.006, 0, -0.03); f.add(sh);
    f.position.set(-0.46 + i * 0.012, DESK_Y + 0.0018 + i * 0.0036, 0.36 - i * 0.008); f.rotation.y = 0.25 - i * 0.18;
    add(shadow(f));
  });
  // cassete
  const cas = new THREE.Group();
  const cb = box(0.1, 0.014, 0.064, std('#1c1c1f', { roughness: 0.3 }), 0.003); cas.add(cb);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(0.084, 0.034), std('#fff', { map: TX.floppyLabel('mixtape 97', '#e6a' ), roughness: 0.9 }));
  cl.rotation.x = -Math.PI / 2; cl.position.y = 0.0075; cas.add(cl);
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.016, 12), std('#eee')); r.position.set(0.02 * s, 0, 0.004); cas.add(r); }
  cas.position.set(-0.78, DESK_Y + 0.007, 0.16); cas.rotation.y = -0.4;
  add(shadow(cas));
}

const rubik = new THREE.Group();
const cubies = [];
{
  const s = 0.019;
  const C = { px: '#c41e3a', nx: '#ff6a00', py: '#f4f4f4', ny: '#ffd500', pz: '#009e60', nz: '#0051ba' };
  const inner = std('#111', { roughness: 0.5 });
  const geo = new RoundedBoxGeometry(s * 0.96, s * 0.96, s * 0.96, 2, 0.002);
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const mats = [
      x === 1 ? std(C.px, { roughness: 0.3 }) : inner, x === -1 ? std(C.nx, { roughness: 0.3 }) : inner,
      y === 1 ? std(C.py, { roughness: 0.3 }) : inner, y === -1 ? std(C.ny, { roughness: 0.3 }) : inner,
      z === 1 ? std(C.pz, { roughness: 0.3 }) : inner, z === -1 ? std(C.nz, { roughness: 0.3 }) : inner,
    ];
    const m = new THREE.Mesh(geo, mats); m.position.set(x * s, y * s, z * s); rubik.add(m); cubies.push(m);
  }
  rubik.position.set(-1.5, DESK_Y + s * 1.5, 0.12); rubik.rotation.y = 0.5;
  add(shadow(rubik));
  rubik.userData.s = s;
  makeInteractive(rubik, { kind: 'prop', id: 'rubik', label: 'cubo mágico — gire!' });
}
let rubikTurn = null;
function turnRubik() {
  if (rubikTurn) return;
  const axes = ['x', 'y', 'z'], axis = axes[Math.floor(Math.random() * 3)];
  const layer = Math.floor(Math.random() * 3) - 1, s = rubik.userData.s;
  const pivot = new THREE.Object3D(); rubik.add(pivot);
  cubies.filter(c => Math.round(c.position[axis] / s) === layer).forEach(c => pivot.attach(c));
  rubikTurn = { pivot, axis, t: 0, dir: Math.random() < 0.5 ? 1 : -1 };
}

// ---------------------------------------------------------------------
// parede: janela, prateleira, pôster, calendário
// ---------------------------------------------------------------------
const skyCanvas = TX.makeCanvas(512, 420);
const skyTex = TX.toTexture(skyCanvas);
let skyMat;
{
  const win = new THREE.Group();
  const W = 0.98, H = 0.8;
  skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(W, H), skyMat); win.add(sky);
  const fm = M.trim;
  const t = 0.045;
  [[0, H / 2 + t / 2, W + t * 2, t], [0, -H / 2 - t / 2, W + t * 2, t], [-W / 2 - t / 2, 0, t, H], [W / 2 + t / 2, 0, t, H], [0, 0, 0.022, H], [0, 0.05, W, 0.022]].forEach(([x, y, w, h]) => {
    const b = box(w, h, 0.05, fm); b.position.set(x, y, 0.02); win.add(b);
  });
  const sill = box(W + 0.16, 0.025, 0.12, fm); sill.position.set(0, -H / 2 - 0.05, 0.06); win.add(sill);
  // cortina
  const cm = std('#7c2b2b', { roughness: 0.95, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const cg = new THREE.PlaneGeometry(0.22, 1.05, 12, 1);
    const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 60) * 0.012);
    cg.computeVertexNormals();
    const c = new THREE.Mesh(cg, cm); c.position.set(s * (W / 2 + 0.13), -0.06, 0.08); win.add(c);
  }
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, W + 0.6, 8), M.woodDark); rod.rotation.z = Math.PI / 2; rod.position.set(0, H / 2 + 0.07, 0.09); win.add(rod);
  win.position.set(0.98, 1.08, WALL_Z + 0.002);
  add(win);
  win.traverse(c => { if (c.isMesh) c.receiveShadow = true; });
}
{
  // prateleira com livros e planta
  const sh = new THREE.Group();
  const board = box(1.0, 0.025, 0.2, M.woodDark); sh.add(board);
  for (const x of [-0.4, 0.4]) { const br = box(0.015, 0.08, 0.12, M.metal); br.position.set(x, -0.05, -0.03); sh.add(br); }
  const cols = ['#8e2b2b', '#2b4f8e', '#c9a227', '#2f6b3a', '#5b2b6b', '#d9d2c0', '#8e5a2b', '#1f1f2a', '#b3402e', '#3c7a8a'];
  let x = -0.47; const r = TX.rng(11);
  cols.forEach((c, i) => {
    const w = 0.025 + r() * 0.025, h = 0.16 + r() * 0.08;
    const b = box(w, h, 0.14 + r() * 0.03, std(c, { roughness: 0.8 }), 0.003);
    b.position.set(x + w / 2, h / 2 + 0.0125, 0); if (i === cols.length - 1) { b.rotation.z = -0.35; b.position.x += 0.04; b.position.y -= 0.01; }
    sh.add(b); x += w + 0.003;
  });
  // planta
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.08, 20), std('#b5562f', { roughness: 0.9 })); pot.position.set(0.36, 0.0525, 0); sh.add(pot);
  const leafM = std('#3f8a3a', { roughness: 0.7, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const lg = new THREE.SphereGeometry(1, 10, 8); const l = new THREE.Mesh(lg, leafM);
    l.scale.set(0.012, 0.07, 0.025); const a = (i / 9) * Math.PI * 2;
    l.position.set(0.36 + Math.cos(a) * 0.03, 0.15, Math.sin(a) * 0.03); l.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6);
    sh.add(l);
  }
  // fita VHS deitada
  const vhs = box(0.19, 0.025, 0.1, std('#151515', { roughness: 0.4 })); vhs.position.set(0.12, 0.025, 0); sh.add(vhs);
  const vl = box(0.15, 0.002, 0.06, std('#f0e6d0')); vl.position.set(0.12, 0.039, 0); sh.add(vl);
  sh.position.set(-1.05, 0.95, WALL_Z + 0.11);
  add(shadow(sh));
}
{
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.59), std('#fff', { map: TX.posterTexture(), roughness: 0.7 }));
  poster.position.set(-0.05, 1.12, WALL_Z + 0.004); poster.rotation.z = 0.015; poster.receiveShadow = true; add(poster);
  for (const [x, y] of [[-0.25, 1.4], [0.15, 1.41]]) { const pin = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), std('#d22')); pin.position.set(x, y, WALL_Z + 0.008); add(pin); }
  const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.22), std('#fff', { map: TX.calendarTexture(), roughness: 0.8 }));
  cal.position.set(0.33, 1.05, WALL_Z + 0.004); cal.rotation.z = -0.03; cal.receiveShadow = true; add(cal);
}

// poeira no ar
const dust = (() => {
  const n = 260, pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 3.4; pos[i * 3 + 1] = Math.random() * 1.6; pos[i * 3 + 2] = -0.7 + Math.random() * 1.6; seed[i] = Math.random() * 100; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ size: 0.008, map: TX.softDot(), transparent: true, depthWrite: false, opacity: 0.4, color: '#fff3d6', blending: THREE.AdditiveBlending });
  const p = new THREE.Points(g, m); p.userData.seed = seed; add(p);
  return p;
})();

// ---------------------------------------------------------------------
// iluminação + ciclo dia/noite pelo relógio de quem visita
// ---------------------------------------------------------------------
const hemi = new THREE.HemisphereLight('#cfe3ff', '#3a2a1c', 0.6); add(hemi);
const sun = new THREE.DirectionalLight('#fff1dc', 2.5);
sun.position.set(2.2, 3.2, -3.0); sun.target.position.set(0, 0, 0); add(sun.target); add(sun);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -2.3, right: 2.3, top: 1.8, bottom: -1.8, near: 0.5, far: 9 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
const fill = new THREE.DirectionalLight('#ffe9cf', 0.4); fill.position.set(-1, 2.2, 3); add(fill);
const nightAmb = new THREE.PointLight('#5a6cff', 0, 6, 1.5); nightAmb.position.set(0.98, 1.1, -0.4); add(nightAmb);

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const gauss = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
function paramsForHour(h) {
  const day = sstep(5.6, 7.6, h) * (1 - sstep(17.4, 19.3, h));
  const dusk = Math.min(1, gauss(h, 6.3, 0.6) + gauss(h, 18.2, 0.75));
  const sunArc = Math.min(1, Math.max(0, (h - 6) / 13));
  return { day, dusk, sunArc };
}
const MODES = ['auto', 'dia', 'tarde', 'noite'];
const MODE_HOURS = { dia: 11.5, tarde: 18.1, noite: 22.5 };
const timeState = { mode: 'auto', cur: null, from: null, to: null, t: 1, lampOverride: null };
function nowHour() { const d = new Date(); return d.getHours() + d.getMinutes() / 60; }
function targetParams() { return paramsForHour(timeState.mode === 'auto' ? nowHour() : MODE_HOURS[timeState.mode]); }
timeState.cur = targetParams();

const cA = new THREE.Color(), cB = new THREE.Color();
function lerpColor(a, b, t) { return cA.set(a).lerp(cB.set(b), t); }
let skyDirty = true;
function applyTime(p, elapsed) {
  const { day, dusk } = p, night = 1 - day;
  sun.color.copy(lerpColor('#8193dd', '#fff1dc', day)).lerp(cB.set('#ff8a4a'), dusk * 0.75);
  sun.intensity = 0.45 + 2.5 * day + 0.6 * dusk;
  hemi.color.copy(lerpColor('#2b3766', '#d5e6ff', day));
  hemi.groundColor.copy(lerpColor('#120d0a', '#4a3524', day));
  hemi.intensity = 0.35 + 0.65 * day;
  fill.intensity = 0.12 + 0.45 * day;
  nightAmb.intensity = night * 0.6;
  const lampOn = timeState.lampOverride ?? (day < 0.45);
  lampLight.intensity += ((lampOn ? 7 : 0) - lampLight.intensity) * 0.12;
  bulb.material.color.copy(lerpColor('#3a3328', '#ffe7b0', Math.min(1, lampLight.intensity / 7))).multiplyScalar(1 + lampLight.intensity / 4);
  for (const k in monitors) {
    const m = monitors[k], on = screens[k].power !== 'off';
    m.userData.glow.intensity = on ? 0.05 + night * 0.32 : 0;
  }
  renderer.toneMappingExposure = 1.0 - night * 0.12;
  bloom.strength = 0.3 + night * 0.18;
  dust.material.opacity = 0.12 + day * 0.4;
  scene.background.copy(lerpColor('#07070c', '#1a1a20', day));
  if (skyDirty || Math.floor(elapsed * 4) !== applyTime._lastSky) {
    TX.drawSky(skyCanvas, p, elapsed); skyTex.needsUpdate = true; skyDirty = false; applyTime._lastSky = Math.floor(elapsed * 4);
  }
  skyMat.color.setScalar(0.9 + day * 0.5);
}
function setTimeMode(mode) {
  timeState.mode = mode; timeState.from = { ...timeState.cur }; timeState.to = targetParams(); timeState.t = 0;
  timeState.lampOverride = null;
  UI.setTimeLabel(mode, timeState.to);
}
function cycleTimeMode() { setTimeMode(MODES[(MODES.indexOf(timeState.mode) + 1) % MODES.length]); Sfx.blip(); }

// ---------------------------------------------------------------------
// câmera: visão geral, zoom no monitor, papel na mão
// ---------------------------------------------------------------------
const OV_TARGET = new THREE.Vector3(0, 0.3, -0.2);
const OV_DIR = new THREE.Vector3(0, 0.95, 2.4).normalize();
let panX = 0;
function overviewPose() {
  const aspect = camera.aspect, tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const halfW = aspect < 1.1 ? 1.05 : 1.95;
  const d = Math.max(2.6, halfW / (tanH * aspect));
  const t = OV_TARGET.clone(); t.x += panX;
  if (aspect < 1.1) t.y += 0.16;
  return { pos: t.clone().addScaledVector(OV_DIR, Math.min(d, 5.2)), tgt: t };
}
const cam = { pos: new THREE.Vector3(0, 1.5, 4.6), tgt: OV_TARGET.clone() };
let camTween = null;
function tweenCamera(pos, tgt, dur = 1.3, done) {
  camTween = { fromP: cam.pos.clone(), fromT: cam.tgt.clone(), toP: pos.clone(), toT: tgt.clone(), t: 0, dur, done };
}
const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let mode = 'boot'; // boot | overview | monitor | paper | moving
let focused = null;
let parallax = new THREE.Vector2(), pointerNDC = new THREE.Vector2(0, 0), parallaxW = 0;

function monitorPose(crt) {
  const { screenMesh, sw, sh } = crt.userData.crt;
  const c = new THREE.Vector3(); screenMesh.getWorldPosition(c);
  const q = new THREE.Quaternion(); screenMesh.getWorldQuaternion(q);
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const reserve = innerHeight < 700 ? 0.76 : 0.8;
  const d = Math.max((sh / 2) / (tanH * reserve), (sw / 2) / (tanH * camera.aspect * 0.92)) + 0.012;
  return { pos: c.clone().addScaledVector(n, d), tgt: c };
}

function openMonitor(crt) {
  mode = 'moving'; focused = crt;
  UI.hidePins(); UI.hideTip();
  Sfx.whoosh();
  const p = monitorPose(crt);
  tweenCamera(p.pos, p.tgt, 1.25, () => {
    mode = 'monitor';
    Sfx.thunk();
    UI.openMonitor(crt.userData.info.id, { perfil, ferramentas, projects }, screenRect(crt));
  });
}

let paperAnim = null;
function paperHoldPose(paper) {
  const [PW, PH] = paper.userData.size;
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const d = Math.max((PH / 2) / (tanH * 0.8), (PW / 2) / (tanH * camera.aspect * 0.9));
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  const pos = camera.position.clone().addScaledVector(dir, d);
  const quat = camera.quaternion.clone();
  return { pos, quat };
}
function openPaper(paper) {
  mode = 'moving'; focused = paper;
  UI.hidePins(); UI.hideTip();
  Sfx.paper();
  // freia o parallax para a pose ficar estável
  parallaxW = 0; parallax.set(0, 0);
  const ov = overviewPose(); cam.pos.copy(ov.pos); cam.tgt.copy(ov.tgt); applyCamera();
  const hold = paperHoldPose(paper);
  paperAnim = { paper, from: { pos: paper.position.clone(), quat: paper.quaternion.clone() }, to: hold, t: 0, dur: 0.9, done: () => {
    mode = 'paper';
    UI.openPaper(paper.userData.item, paperRect(paper));
  } };
}

function closeFocus() {
  if (mode !== 'monitor' && mode !== 'paper') return;
  UI.close();
  Sfx.whoosh();
  const wasPaper = mode === 'paper';
  mode = 'moving';
  if (wasPaper) {
    const p = focused;
    paperAnim = { paper: p, from: { pos: p.position.clone(), quat: p.quaternion.clone() }, to: { pos: p.userData.rest.pos, quat: p.userData.rest.quat }, t: 0, dur: 0.8, done: () => { mode = 'overview'; focused = null; UI.showPins(); } };
  } else {
    const ov = overviewPose();
    tweenCamera(ov.pos, ov.tgt, 1.15, () => { mode = 'overview'; focused = null; UI.showPins(); });
  }
}

// projeção de um retângulo 3D para pixels da tela
const _v = new THREE.Vector3();
function projectRect(obj, w, h, z = 0) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]) {
    _v.set(x, y, z); obj.localToWorld(_v); _v.project(camera);
    const px = (_v.x + 1) / 2 * innerWidth, py = (1 - _v.y) / 2 * innerHeight;
    minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
const screenRect = crt => { const c = crt.userData.crt; return projectRect(c.screenMesh, c.sw, c.sh, 0.008); };
const paperRect = p => projectRect(p.children[0], p.userData.size[0], p.userData.size[1]);

function applyCamera() {
  camera.position.copy(cam.pos);
  camera.lookAt(cam.tgt);
}

// ---------------------------------------------------------------------
// raycast / hover / clique
// ---------------------------------------------------------------------
const ray = new THREE.Raycaster();
let hovered = null, pointerDirty = false, lastPointer = { x: 0, y: 0 };
let drag = null;

canvas.addEventListener('pointermove', e => {
  pointerNDC.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  lastPointer = { x: e.clientX, y: e.clientY };
  pointerDirty = true;
  if (drag && mode === 'overview' && camera.aspect < 1.1) {
    panX = THREE.MathUtils.clamp(drag.pan - (e.clientX - drag.x) / innerWidth * 2.2, -0.95, 0.95);
    if (Math.abs(e.clientX - drag.x) > 6) drag.moved = true;
    const ov = overviewPose(); cam.pos.copy(ov.pos); cam.tgt.copy(ov.tgt);
  }
});
canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, pan: panX, moved: false }; });
canvas.addEventListener('pointerup', e => {
  const moved = drag?.moved; drag = null;
  if (moved) return;
  pointerNDC.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (mode === 'monitor' || mode === 'paper') { closeFocus(); return; }
  if (mode !== 'overview') return;
  const hit = pick();
  if (!hit) return;
  const info = hit.userData.info;
  if (info.kind === 'monitor') openMonitor(hit);
  else if (info.kind === 'paper') { if (emAndamentoLiberado) openPaper(hit); }
  else propClick(info.id, hit);
});
canvas.addEventListener('pointerleave', () => { pointerNDC.set(0, 0); setHovered(null); });

function pick() {
  ray.setFromCamera(pointerNDC, camera);
  const hits = ray.intersectObjects(interactive, false);
  return hits.length ? hits[0].object.userData.root : null;
}
function setHovered(h) {
  if (h === hovered) return;
  hovered = h;
  document.body.style.cursor = h ? 'pointer' : '';
  if (h) { UI.showTip(h.userData.info.label); Sfx.tick(); } else UI.hideTip();
}

function propClick(id, obj) {
  if (id === 'lamp') {
    const on = lampLight.intensity > 3.5;
    timeState.lampOverride = !on; Sfx.click(); return;
  }
  if (id === 'clock') { cycleTimeMode(); return; }
  if (id === 'rubik') { turnRubik(); Sfx.click(); return; }
  if (id === 'keyboard') { for (let i = 0; i < 6; i++) setTimeout(() => { pressRandomKey(); Sfx.key(); }, i * 70); return; }
  obj.userData.bump = 1; Sfx.blip();
}

addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (UI.handleEscape()) return;
    closeFocus(); return;
  }
  if (mode === 'boot') return;
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !UI.isTyping()) { pressRandomKey(); Sfx.key(); }
});
UI.onBack(() => closeFocus());
UI.onTimeToggle(() => cycleTimeMode());
UI.onSoundToggle(() => Sfx.toggle());

// ---------------------------------------------------------------------
// marcadores flutuantes (dicas) sobre os objetos principais
// ---------------------------------------------------------------------
const pinAnchors = [
  { id: 'about', label: '01 SOBRE', obj: monitors.about, off: new THREE.Vector3(0, 0.5, 0) },
  { id: 'tools', label: '02 FERRAMENTAS', obj: monitors.tools, off: new THREE.Vector3(0, 0.5, 0) },
  { id: 'projects', label: '03 PROJETOS', obj: monitors.projects, off: new THREE.Vector3(0, 0.56, 0) },
  { id: 'papers', label: 'PROJETOS EM ANDAMENTO', disabled: !emAndamentoLiberado, obj: papers[1] ?? papers[0], off: new THREE.Vector3(0, 0, 0), world: new THREE.Vector3(1.2, 0.12, 0.05) },
];
UI.createPins(pinAnchors.map(p => ({ id: p.id, label: p.label, disabled: p.disabled })), id => {
  if (mode !== 'overview') return;
  if (id === 'papers' && !emAndamentoLiberado) return;
  if (id === 'papers') openPaper(papers[0]); else openMonitor(monitors[id]);
});
function updatePins() {
  pinAnchors.forEach(p => {
    if (p.world) _v.copy(p.world); else { p.obj.getWorldPosition(_v); _v.add(p.off); }
    _v.project(camera);
    UI.placePin(p.id, (_v.x + 1) / 2 * innerWidth, (1 - _v.y) / 2 * innerHeight, _v.z < 1);
  });
}

// ---------------------------------------------------------------------
// boot / introdução
// ---------------------------------------------------------------------
UI.setTimeLabel('auto', timeState.cur);
logBoot('Texturas procedurais ........ OK');
logBoot('Monitores CRT ............... 3 detectados');
logBoot(`Projetos em andamento ....... ${emAndamento.length} papéis na mesa`);
logBoot(`Horário do visitante ........ ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
if (bootBar) bootBar.style.width = '100%';
// compila os shaders antes de liberar
renderer.compile(scene, camera);
UI.bootReady(() => start());

function start() {
  Sfx.init();
  Sfx.thunk();
  mode = 'moving';
  const ov = overviewPose();
  cam.pos.set(0.3, 1.25, 4.4); cam.tgt.set(0, 0.35, -0.3);
  tweenCamera(ov.pos, ov.tgt, 2.8, () => { mode = 'overview'; UI.showHud(); UI.showPins(); });
  const t0 = clock.getElapsedTime();
  ['projects', 'tools', 'about'].forEach((k, i) => setTimeout(() => {
    screens[k].turnOn(clock.getElapsedTime());
    monitors[k].userData.crt.led.material.color.set('#55ff66');
    Sfx.degauss();
  }, 900 + i * 450));
  Sfx.humStart();
}

// ---------------------------------------------------------------------
// loop
// ---------------------------------------------------------------------
const clock = new THREE.Clock();
const TIME_SCALE = +new URLSearchParams(location.search).get('ts') || 1; // só p/ testes
const tmpQ = new THREE.Quaternion();
let fpsCount = 0;
function frame() {
  requestAnimationFrame(frame);
  fpsCount++;
  const dt = Math.min(clock.getDelta(), 0.1) * TIME_SCALE, t = clock.getElapsedTime() * TIME_SCALE;

  // dia/noite
  if (timeState.t < 1) {
    timeState.t = Math.min(1, timeState.t + dt / 1.6);
    const k = easeIO(timeState.t);
    for (const key of ['day', 'dusk', 'sunArc']) timeState.cur[key] = timeState.from[key] + (timeState.to[key] - timeState.from[key]) * k;
  } else if (timeState.mode === 'auto' && Math.floor(t) % 30 === 0) {
    timeState.cur = targetParams();
  }
  applyTime(timeState.cur, t);

  // câmera
  if (camTween) {
    camTween.t = Math.min(1, camTween.t + dt / camTween.dur);
    const k = easeIO(camTween.t);
    cam.pos.lerpVectors(camTween.fromP, camTween.toP, k);
    cam.tgt.lerpVectors(camTween.fromT, camTween.toT, k);
    if (camTween.t >= 1) { const d = camTween.done; camTween = null; d && d(); }
  }
  const wantPar = mode === 'overview' && !drag ? 1 : 0;
  parallaxW += (wantPar - parallaxW) * Math.min(1, dt * 3);
  parallax.lerp(pointerNDC, Math.min(1, dt * 2.5));
  camera.position.copy(cam.pos);
  camera.position.x += parallax.x * 0.14 * parallaxW;
  camera.position.y += parallax.y * 0.07 * parallaxW;
  camera.lookAt(cam.tgt);

  // papel na mão
  if (paperAnim) {
    paperAnim.t = Math.min(1, paperAnim.t + dt / paperAnim.dur);
    const k = easeIO(paperAnim.t), p = paperAnim.paper;
    p.position.lerpVectors(paperAnim.from.pos, paperAnim.to.pos, k);
    p.position.y += Math.sin(k * Math.PI) * 0.12;
    p.quaternion.slerpQuaternions(paperAnim.from.quat, paperAnim.to.quat, k);
    if (paperAnim.t >= 1) { const d = paperAnim.done; paperAnim = null; d && d(); }
  }

  // hover
  if (pointerDirty && mode === 'overview') { pointerDirty = false; setHovered(pick()); }
  else if (mode !== 'overview' && hovered) setHovered(null);
  if (hovered) UI.moveTip(lastPointer.x, lastPointer.y);

  for (const k in monitors) {
    const m = monitors[k], target = hovered === m ? 1 : 0;
    m.userData.hover += (target - m.userData.hover) * Math.min(1, dt * 8);
    screens[k].hover = m.userData.hover;
    m.userData.crt.bezel.material = m.userData.hover > 0.5 ? M.beigeHover || (M.beigeHover = std('#e9dfc4', { roughness: 0.5, emissive: '#2a2416' })) : M.beige;
    const s = m.userData.crt.screenMesh.material; s.color.setScalar(1.35 + m.userData.hover * 0.35);
    screens[k].update(t);
  }
  papers.forEach(p => {
    if (paperAnim?.paper === p || (focused === p && mode === 'paper')) return;
    const target = hovered === p ? 1 : 0;
    p.userData.hover += (target - p.userData.hover) * Math.min(1, dt * 10);
    p.position.y = p.userData.rest.pos.y + p.userData.hover * 0.035;
    tmpQ.setFromEuler(new THREE.Euler(p.userData.hover * 0.12, 0, 0));
    p.quaternion.copy(p.userData.rest.quat).multiply(tmpQ);
  });
  for (const o of [mug, lamp, clock3d, rubik, mouse3d, keyboard]) {
    const target = hovered === o ? 1 : 0;
    o.userData.hover += (target - o.userData.hover) * Math.min(1, dt * 10);
    o.userData.bump = Math.max(0, (o.userData.bump || 0) - dt * 2.5);
    const s = 1 + o.userData.hover * 0.04 + Math.sin((1 - o.userData.bump) * Math.PI * 3) * o.userData.bump * 0.08;
    o.scale.setScalar(s);
  }

  // teclas
  let kDirty = false; const m4 = new THREE.Matrix4();
  for (let i = 0; i < keyCount; i++) if (keyPress[i] > 0) {
    keyPress[i] = Math.max(0, keyPress[i] - dt * 7); kDirty = true;
    const [x, y, z] = keyBase[i]; m4.makeTranslation(x, y - keyPress[i] * 0.008, z); keyMesh.setMatrixAt(i, m4);
  }
  if (kDirty) keyMesh.instanceMatrix.needsUpdate = true;

  // mouse 3D acompanha o ponteiro
  if (mode === 'overview') {
    const tx = 0.66 + pointerNDC.x * 0.05, tz = 0.25 - pointerNDC.y * 0.04;
    const ox = mouse3d.position.x, oz = mouse3d.position.z;
    mouse3d.position.x += (tx - ox) * Math.min(1, dt * 6); mouse3d.position.z += (tz - oz) * Math.min(1, dt * 6);
    if (Math.abs(tx - ox) + Math.abs(tz - oz) > 0.002 && Math.floor(t * 10) % 2 === 0) updateCable();
  }

  // cubo mágico
  if (rubikTurn) {
    rubikTurn.t = Math.min(1, rubikTurn.t + dt * 3.2);
    rubikTurn.pivot.rotation[rubikTurn.axis] = easeIO(rubikTurn.t) * Math.PI / 2 * rubikTurn.dir;
    if (rubikTurn.t >= 1) {
      const s = rubik.userData.s;
      [...rubikTurn.pivot.children].forEach(c => { rubik.attach(c); c.position.set(Math.round(c.position.x / s) * s, Math.round(c.position.y / s) * s, Math.round(c.position.z / s) * s); });
      rubik.remove(rubikTurn.pivot); rubikTurn = null;
    }
  }

  // vapor
  steam.forEach((sp, i) => {
    sp.userData.t = (sp.userData.t + dt * 0.28) % 1;
    const k = sp.userData.t;
    sp.position.set(Math.sin(t * 1.3 + i) * 0.012 * k, 0.09 + k * 0.17, Math.cos(t + i * 2) * 0.01 * k);
    sp.scale.setScalar(0.02 + k * 0.06);
    sp.material.opacity = Math.sin(k * Math.PI) * 0.22;
  });

  // poeira
  const dp = dust.geometry.attributes.position, seed = dust.userData.seed;
  for (let i = 0; i < seed.length; i++) {
    let y = dp.getY(i) + dt * 0.012; if (y > 1.7) y = 0;
    dp.setY(i, y); dp.setX(i, dp.getX(i) + Math.sin(t * 0.3 + seed[i]) * dt * 0.01);
  }
  dp.needsUpdate = true;

  // leds do gabinete
  pcCase.userData.hdd.material.color.set(Math.random() < 0.15 ? '#66ff88' : '#113311');

  drawClock();
  if (mode === 'overview') updatePins();
  if (mode === 'monitor' && focused) UI.position(screenRect(focused));
  if (mode === 'paper' && focused) UI.position(paperRect(focused));

  composer.render();
}
frame();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  if (mode === 'overview') { const ov = overviewPose(); cam.pos.copy(ov.pos); cam.tgt.copy(ov.tgt); }
  if (mode === 'monitor' && focused) { const p = monitorPose(focused); cam.pos.copy(p.pos); cam.tgt.copy(p.tgt); }
});
camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
applyCamera();

// expõe para depuração no console
window.__desk = { scene, camera, setTimeMode, openMonitor: id => openMonitor(monitors[id]), openPaper: i => emAndamentoLiberado && openPaper(papers[i]), closeFocus, get mode() { return mode; }, get tween() { return camTween && camTween.t; }, get fps() { return fpsCount; } };
