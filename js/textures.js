// Texturas desenhadas em <canvas> — nada de imagens externas pesadas.
import * as THREE from 'three';

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function toTexture(canvas, { repeat = null, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

// pseudo-aleatório com semente (mesma mesa toda vez)
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------- madeira da mesa ----------
export function woodTexture() {
  const c = makeCanvas(1024, 512), g = c.getContext('2d'), r = rng(7);
  g.fillStyle = '#6b4226'; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 260; i++) {
    const y = r() * 512, amp = 2 + r() * 6, f = 0.004 + r() * 0.01;
    g.strokeStyle = `rgba(${40 + r() * 40},${20 + r() * 20},${10},${0.08 + r() * 0.18})`;
    g.lineWidth = 0.6 + r() * 2.4;
    g.beginPath();
    for (let x = 0; x <= 1024; x += 8) {
      const yy = y + Math.sin(x * f + i) * amp + Math.sin(x * f * 3.1) * amp * 0.3;
      x ? g.lineTo(x, yy) : g.moveTo(x, yy);
    }
    g.stroke();
  }
  // nós da madeira
  for (let k = 0; k < 4; k++) {
    const x = r() * 1024, y = r() * 512;
    for (let j = 0; j < 9; j++) {
      g.strokeStyle = `rgba(40,20,8,${0.25 - j * 0.02})`;
      g.beginPath(); g.ellipse(x, y, 6 + j * 5, 3 + j * 2, 0, 0, Math.PI * 2); g.stroke();
    }
  }
  // desgaste
  const grd = g.createRadialGradient(512, 300, 50, 512, 300, 600);
  grd.addColorStop(0, 'rgba(255,220,170,0.07)'); grd.addColorStop(1, 'rgba(0,0,0,0.18)');
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 512);
  return toTexture(c);
}

// ---------- assoalho ----------
export function floorTexture() {
  const c = makeCanvas(1024, 1024), g = c.getContext('2d'), r = rng(3);
  const pw = 128;
  for (let x = 0; x < 1024; x += pw) {
    let y = -r() * 400;
    while (y < 1024) {
      const len = 300 + r() * 400, l = 28 + r() * 10;
      g.fillStyle = `hsl(25, 38%, ${l}%)`;
      g.fillRect(x, y, pw, len);
      for (let i = 0; i < 18; i++) {
        g.strokeStyle = `rgba(30,15,5,${0.05 + r() * 0.1})`;
        g.beginPath(); const xx = x + r() * pw;
        g.moveTo(xx, y); g.bezierCurveTo(xx + 6, y + len * 0.3, xx - 6, y + len * 0.6, xx + 2, y + len); g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x, y, pw, 2);
      y += len;
    }
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x, 0, 2, 1024);
  }
  return toTexture(c, { repeat: [3, 3] });
}

// ---------- papel de parede anos 90 ----------
export function wallpaperTexture() {
  const c = makeCanvas(512, 512), g = c.getContext('2d');
  g.fillStyle = '#5e7d70'; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) {
    g.fillStyle = 'rgba(255,255,255,0.035)'; g.fillRect(x, 0, 30, 512);
    g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(x + 30, 0, 2, 512);
  }
  g.fillStyle = 'rgba(230,200,140,0.10)';
  for (let y = 16; y < 512; y += 64) for (let x = 15; x < 512; x += 64) {
    g.save(); g.translate(x, y + ((x / 64) % 2) * 32); g.rotate(Math.PI / 4);
    g.fillRect(-4, -4, 8, 8); g.restore();
  }
  return toTexture(c, { repeat: [6, 3] });
}

// ---------- céu da janela (muda com o horário) ----------
const skyRand = rng(42);
const STARS = Array.from({ length: 120 }, () => [skyRand(), skyRand() * 0.75, skyRand()]);
const BUILDINGS = (() => {
  const out = []; let x = -10; const r = rng(9);
  while (x < 520) {
    const w = 30 + r() * 50, h = 60 + r() * 170;
    const wins = [];
    for (let wy = 8; wy < h - 6; wy += 14) for (let wx = 6; wx < w - 6; wx += 11) wins.push([wx, wy, r()]);
    out.push({ x, w, h, wins, shade: r() });
    x += w + r() * 6;
  }
  return out;
})();

function mixHex(a, b, t) {
  const ca = new THREE.Color(a), cb = new THREE.Color(b);
  return '#' + ca.lerp(cb, t).getHexString();
}

export function drawSky(canvas, s, time = 0) {
  const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  const day = s.day, dusk = s.dusk;
  const top = mixHex(mixHex('#050816', '#3d7fd1', day), '#4b3b78', dusk * 0.6);
  const bot = mixHex(mixHex('#141a3a', '#a9d4f5', day), '#ff8a4c', dusk * 0.85);
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, top); grd.addColorStop(1, bot);
  g.fillStyle = grd; g.fillRect(0, 0, W, H);

  // estrelas
  const sa = Math.max(0, 1 - day * 1.6 - dusk * 0.5);
  if (sa > 0) for (const [x, y, p] of STARS) {
    const tw = 0.55 + 0.45 * Math.sin(time * 2 + p * 30);
    g.fillStyle = `rgba(255,255,240,${sa * tw * (0.4 + p * 0.6)})`;
    g.fillRect(x * W, y * H, p > 0.85 ? 2.5 : 1.5, p > 0.85 ? 2.5 : 1.5);
  }

  // sol / lua
  const arc = s.sunArc; // 0..1 posição na trajetória
  const sx = W * (0.1 + arc * 0.8), sy = H * (0.72 - Math.sin(arc * Math.PI) * 0.55);
  if (day + dusk > 0.05) {
    const sunCol = mixHex('#fff4c2', '#ff7a3d', dusk);
    const halo = g.createRadialGradient(sx, sy, 4, sx, sy, 110);
    halo.addColorStop(0, sunCol + 'cc'); halo.addColorStop(1, sunCol + '00');
    g.fillStyle = halo; g.fillRect(0, 0, W, H);
    g.fillStyle = sunCol; g.beginPath(); g.arc(sx, sy, 22, 0, Math.PI * 2); g.fill();
  }
  if (day < 0.5) {
    const mx = W * 0.72, my = H * 0.2, ma = 1 - day * 2;
    const halo = g.createRadialGradient(mx, my, 10, mx, my, 90);
    halo.addColorStop(0, `rgba(200,215,255,${0.35 * ma})`); halo.addColorStop(1, 'rgba(200,215,255,0)');
    g.fillStyle = halo; g.fillRect(0, 0, W, H);
    g.fillStyle = `rgba(235,238,255,${ma})`; g.beginPath(); g.arc(mx, my, 20, 0, Math.PI * 2); g.fill();
    g.fillStyle = top; g.globalAlpha = ma; g.beginPath(); g.arc(mx + 9, my - 5, 18, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  }

  // nuvens
  const cloudA = 0.25 + day * 0.55;
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 137 + time * (6 + i * 2)) % (W + 200)) - 100, cy = 40 + i * 32;
    g.fillStyle = day > 0.3 ? `rgba(255,255,255,${cloudA * 0.8})` : `rgba(120,110,160,${cloudA * 0.5})`;
    if (dusk > 0.3) g.fillStyle = `rgba(255,170,140,${0.45})`;
    for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(cx + k * 18, cy + Math.sin(k) * 5, 26, 11, 0, 0, Math.PI * 2); g.fill(); }
  }

  // cidade
  const night = 1 - day;
  for (const b of BUILDINGS) {
    const l = 8 + b.shade * 8 + day * 30;
    g.fillStyle = `hsl(225, 18%, ${l}%)`;
    g.fillRect(b.x, H - b.h, b.w, b.h);
    for (const [wx, wy, p] of b.wins) {
      if (p < 0.55 - night * 0.2) continue;
      const lit = night > 0.35 && p > 0.62;
      g.fillStyle = lit ? `rgba(255,${200 + p * 40},120,${0.85})` : `rgba(20,30,50,${0.35 + day * 0.2})`;
      g.fillRect(b.x + wx, H - b.h + wy, 5, 7);
    }
  }
}

// ---------- pôster synthwave (arte original) ----------
export function posterTexture() {
  const c = makeCanvas(512, 720), g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 720);
  grd.addColorStop(0, '#1a0633'); grd.addColorStop(0.55, '#6b1b6e'); grd.addColorStop(0.56, '#130522'); grd.addColorStop(1, '#05010d');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 720);
  // sol listrado
  const sg = g.createLinearGradient(0, 180, 0, 400);
  sg.addColorStop(0, '#ffe66b'); sg.addColorStop(1, '#ff2e88');
  g.save(); g.beginPath(); g.arc(256, 400, 150, Math.PI, 0); g.clip();
  g.fillStyle = sg; g.fillRect(0, 240, 512, 160);
  g.fillStyle = '#3a0d4f';
  for (let i = 0; i < 7; i++) g.fillRect(0, 330 + i * 11, 512, 2 + i * 1.3);
  g.restore();
  // grade
  g.strokeStyle = '#ff3fd2'; g.lineWidth = 2; g.shadowColor = '#ff3fd2'; g.shadowBlur = 8;
  for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(256 + i * 10, 404); g.lineTo(256 + i * 70, 720); g.stroke(); }
  for (let y = 410, d = 6; y < 720; y += d, d *= 1.35) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  g.shadowBlur = 0;
  // montanhas
  g.fillStyle = '#12052a';
  g.beginPath(); g.moveTo(0, 404);
  [[60, 330], [120, 380], [170, 320], [230, 404]].forEach(([x, y]) => g.lineTo(x, y));
  g.lineTo(0, 404); g.fill();
  g.beginPath(); g.moveTo(300, 404); [[350, 340], [400, 370], [460, 300], [512, 360], [512, 404]].forEach(([x, y]) => g.lineTo(x, y)); g.fill();
  // título
  g.textAlign = 'center';
  g.font = '40px "Press Start 2P"';
  g.fillStyle = '#00f0ff'; g.shadowColor = '#00f0ff'; g.shadowBlur = 16;
  g.fillText('GHIRRO', 256, 110);
  g.font = '16px "Press Start 2P"'; g.fillStyle = '#ffd6ff'; g.shadowColor = '#ff3fd2';
  g.fillText('DEV  •  ARTE  •  JOGOS', 256, 152);
  g.shadowBlur = 0;
  g.font = '22px "VT323"'; g.fillStyle = '#ff9be8';
  g.fillText('TOUR MUNDIAL 1996 — 2026', 256, 690);
  // desgaste do papel
  g.fillStyle = 'rgba(255,240,220,0.06)';
  for (let i = 0; i < 600; i++) g.fillRect(Math.random() * 512, Math.random() * 720, 1, 1);
  return toTexture(c);
}

// ---------- papel (projeto em andamento) ----------
export function paperTexture(item, idx, oculto = false) {
  const W = 620, H = 877;
  const c = makeCanvas(W, H), g = c.getContext('2d'), r = rng(100 + idx);
  g.fillStyle = '#f3ecd9'; g.fillRect(0, 0, W, H);
  // fibras / manchas
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(120,90,50,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
  // linhas de caderno
  g.strokeStyle = 'rgba(70,110,170,0.28)'; g.lineWidth = 2;
  for (let y = 170; y < H - 30; y += 38) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.strokeStyle = 'rgba(200,60,60,0.45)'; g.beginPath(); g.moveTo(70, 0); g.lineTo(70, H); g.stroke();
  // furos
  g.fillStyle = 'rgba(60,40,20,0.25)';
  [140, 440, 740].forEach(y => { g.beginPath(); g.arc(30, y, 11, 0, Math.PI * 2); g.fill(); });
  if (oculto) {
    g.fillStyle = '#1f2a44'; g.font = 'bold 66px "Caveat"';
    g.fillText('Em breve...', 92, 110);
    g.save(); g.translate(W - 175, H - 120); g.rotate(-0.22);
    g.strokeStyle = 'rgba(190,30,30,0.75)'; g.lineWidth = 6; g.strokeRect(-140, -42, 280, 84);
    g.font = '34px "Special Elite"'; g.fillStyle = 'rgba(190,30,30,0.8)'; g.textAlign = 'center';
    g.fillText('CONFIDENCIAL', 0, 12); g.restore();
    g.fillStyle = item.cor; g.globalAlpha = 0.85; g.fillRect(W / 2 - 60, 0, 120, 26); g.globalAlpha = 1;
    return toTexture(c);
  }
  // título
  g.fillStyle = '#1f2a44'; g.font = 'bold 66px "Caveat"';
  g.fillText(item.titulo, 92, 110);
  g.font = '34px "Caveat"'; g.fillStyle = '#3a4a6b';
  g.fillText(item.subtitulo, 92, 156);
  // texto "à mão"
  g.font = '30px "Caveat"'; g.fillStyle = '#2b3550';
  const words = item.texto.split(' '); let line = '', y = 205;
  for (const w of words) {
    if (g.measureText(line + w).width > W - 130) { g.fillText(line, 92, y); line = ''; y += 38; if (y > 560) break; }
    line += w + ' ';
  }
  if (y <= 560) g.fillText(line, 92, y);
  // barra de progresso desenhada
  y = Math.min(y + 70, 640);
  g.font = '30px "Caveat"'; g.fillStyle = '#2b3550'; g.fillText('progresso:', 92, y);
  g.strokeStyle = '#2b3550'; g.lineWidth = 3; g.strokeRect(230, y - 26, 300, 32);
  g.fillStyle = item.cor; g.globalAlpha = 0.75;
  for (let x = 0; x < 300 * item.progresso / 100; x += 7) g.fillRect(232 + x, y - 24 + r() * 2, 5, 28);
  g.globalAlpha = 1;
  // carimbo
  g.save(); g.translate(W - 175, H - 120); g.rotate(-0.22);
  g.strokeStyle = 'rgba(190,30,30,0.75)'; g.lineWidth = 6; g.strokeRect(-140, -42, 280, 84);
  g.font = '34px "Special Elite"'; g.fillStyle = 'rgba(190,30,30,0.8)'; g.textAlign = 'center';
  g.fillText('EM ANDAMENTO', 0, 12); g.restore();
  // mancha de café em um dos papéis
  if (idx % 2 === 0) {
    g.strokeStyle = 'rgba(120,70,30,0.22)'; g.lineWidth = 9;
    g.beginPath(); g.arc(W - 120, 120 + idx * 30, 62, 0.3, Math.PI * 1.8); g.stroke();
  }
  // fita / clipe colorido no topo
  g.fillStyle = item.cor; g.globalAlpha = 0.85; g.fillRect(W / 2 - 60, 0, 120, 26); g.globalAlpha = 1;
  return toTexture(c);
}

// ---------- disquete ----------
export function floppyLabel(text, color) {
  const c = makeCanvas(256, 200), g = c.getContext('2d');
  g.fillStyle = '#f5f2e8'; g.fillRect(0, 0, 256, 200);
  g.fillStyle = color; g.fillRect(0, 0, 256, 34);
  g.strokeStyle = 'rgba(0,0,80,0.25)';
  for (let y = 70; y < 200; y += 28) { g.beginPath(); g.moveTo(10, y); g.lineTo(246, y); g.stroke(); }
  g.fillStyle = '#1b2a8a'; g.font = '40px "Caveat"'; g.fillText(text, 16, 92);
  return toTexture(c);
}

// ---------- calendário ----------
export function calendarTexture(date = new Date()) {
  const c = makeCanvas(400, 520), g = c.getContext('2d');
  g.fillStyle = '#fbf7ec'; g.fillRect(0, 0, 400, 520);
  g.fillStyle = '#b8322a'; g.fillRect(0, 0, 400, 120);
  const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '30px "Press Start 2P"';
  g.fillText(meses[date.getMonth()].slice(0, 8), 200, 62);
  g.font = '26px "VT323"'; g.fillText(String(date.getFullYear()), 200, 100);
  const first = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  g.font = '22px "VT323"'; g.fillStyle = '#555';
  'DSTQQSS'.split('').forEach((d, i) => g.fillText(d, 40 + i * 53, 155));
  g.font = '30px "VT323"';
  for (let d = 1; d <= days; d++) {
    const p = first + d - 1, x = 40 + (p % 7) * 53, y = 200 + Math.floor(p / 7) * 58;
    g.fillStyle = p % 7 === 0 ? '#b8322a' : '#222';
    g.fillText(String(d), x, y);
    if (d === date.getDate()) {
      g.strokeStyle = '#d4231b'; g.lineWidth = 4;
      g.beginPath(); g.ellipse(x, y - 9, 24, 20, 0.2, 0, Math.PI * 2); g.stroke();
    }
  }
  return toTexture(c);
}

// ---------- brilho do vidro do CRT ----------
export function glassSheen() {
  const c = makeCanvas(256, 256), g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 256, 256);
  grd.addColorStop(0, 'rgba(255,255,255,0.22)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.04)');
  grd.addColorStop(0.6, 'rgba(255,255,255,0)');
  grd.addColorStop(1, 'rgba(255,255,255,0.05)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const v = g.createRadialGradient(128, 128, 60, 128, 128, 190);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.0)');
  g.fillStyle = v; g.fillRect(0, 0, 256, 256);
  return toTexture(c);
}

// ---------- partícula macia (poeira / vapor) ----------
export function softDot() {
  const c = makeCanvas(64, 64), g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return toTexture(c);
}

// ---------- mousepad ----------
export function mousepadTexture() {
  const c = makeCanvas(512, 420), g = c.getContext('2d'), r = rng(5);
  g.fillStyle = '#1d1f3b'; g.fillRect(0, 0, 512, 420);
  const cols = ['#ff4fa3', '#20d6c7', '#ffd23f', '#8c6cff'];
  for (let i = 0; i < 40; i++) {
    g.save(); g.translate(r() * 512, r() * 420); g.rotate(r() * 6);
    g.fillStyle = cols[i % 4]; g.strokeStyle = cols[(i + 1) % 4]; g.lineWidth = 4;
    const k = i % 4;
    if (k === 0) { g.beginPath(); g.moveTo(-12, 10); g.lineTo(0, -12); g.lineTo(12, 10); g.closePath(); g.fill(); }
    else if (k === 1) { g.beginPath(); for (let x = -20; x <= 20; x += 4) g.lineTo(x, Math.sin(x / 3) * 6); g.stroke(); }
    else if (k === 2) { g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill(); }
    else { g.fillRect(-2, -14, 4, 28); g.fillRect(-14, -2, 28, 4); }
    g.restore();
  }
  return toTexture(c);
}
