// Conteúdo animado (idle) das telas dos 3 monitores, desenhado em canvas.
import { makeCanvas, toTexture } from './textures.js';

const W = 640, H = 480;

function crtPost(g, color, t) {
  // scanlines
  g.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
  // faixa de varredura que desce
  const by = (t * 90) % (H + 120) - 60;
  const grd = g.createLinearGradient(0, by - 40, 0, by + 40);
  grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.5, 'rgba(255,255,255,0.05)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, by - 40, W, 80);
  // vinheta
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}

function bootLine(g, p) {
  // efeito de ligar do CRT: linha horizontal que abre
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (p < 0.35) {
    const k = p / 0.35;
    g.fillStyle = '#fff';
    g.fillRect(W / 2 - (W / 2) * k, H / 2 - 1, W * k, 3);
  } else {
    const k = (p - 0.35) / 0.65;
    const h = Math.max(3, H * k * k);
    g.fillStyle = `rgba(230,240,255,${1 - k * 0.85})`;
    g.fillRect(0, H / 2 - h / 2, W, h);
  }
}

class Screen {
  constructor(drawFn) {
    this.canvas = makeCanvas(W, H);
    this.g = this.canvas.getContext('2d');
    this.texture = toTexture(this.canvas, { aniso: 4 });
    this.drawFn = drawFn;
    this.power = 'off'; // off | boot | on
    this.bootT = 0;
    this.hover = 0;
    this.last = -1;
    this.clear();
  }
  clear() {
    this.g.fillStyle = '#0b0d0c'; this.g.fillRect(0, 0, W, H);
    this.texture.needsUpdate = true;
  }
  turnOn(now) { this.power = 'boot'; this.bootT = now; }
  update(now) {
    if (this.power === 'off') return;
    if (now - this.last < 1 / 20) return; // ~20 fps é bem "CRT"
    this.last = now;
    if (this.power === 'boot') {
      const p = (now - this.bootT) / 0.9;
      if (p >= 1) { this.power = 'on'; this.onT = now; }
      else { bootLine(this.g, p); this.texture.needsUpdate = true; return; }
    }
    this.drawFn(this.g, now - this.onT, this);
    this.texture.needsUpdate = true;
  }
}

function glowText(g, txt, x, y, color, size, font = 'VT323') {
  g.font = `${size}px "${font}"`;
  g.shadowColor = color; g.shadowBlur = 10; g.fillStyle = color;
  g.fillText(txt, x, y); g.shadowBlur = 0;
}

// ---------------- MONITOR 1 — SOBRE (âmbar) ----------------
export function aboutScreen(perfil) {
  const A = '#ffb43a';
  const lines = [
    'GHIRRO-DOS  v6.22   (c) 1996-2026',
    '',
    'C:\\> sobre.exe',
    'carregando perfil ......... OK',
    'carregando metas .......... OK',
    'carregando conquistas ..... OK',
    '',
  ];
  return new Screen((g, t, s) => {
    g.fillStyle = '#140b02'; g.fillRect(0, 0, W, H);
    const shown = Math.floor(t * 9);
    let y = 44; let count = 0;
    for (const l of lines) {
      const vis = l.slice(0, Math.max(0, shown - count));
      glowText(g, vis, 28, y, A, 30);
      count += l.length || 1; y += 32;
    }
    if (shown > count) {
      glowText(g, perfil.nome.toUpperCase(), 28, y + 26, '#ffd27a', 26, 'Press Start 2P');
      glowText(g, perfil.cargo, 28, y + 66, A, 32);
      const blink = Math.floor(t * 2) % 2 === 0;
      glowText(g, '> CLIQUE PARA ABRIR' + (blink ? '_' : ''), 28, H - 36, s.hover > 0.5 ? '#fff1c4' : A, 34);
    }
    if (t > 14) s.onT += 14; // reinicia o ciclo
    crtPost(g, A, t);
  });
}

// ---------------- MONITOR 2 — FERRAMENTAS (verde) ----------------
export function toolsScreen(ferramentas) {
  const G = '#3cff7a';
  const items = ferramentas.flatMap(f => [`== ${f.grupo.toUpperCase()} ==`, ...f.itens]);
  return new Screen((g, t, s) => {
    g.fillStyle = '#021006'; g.fillRect(0, 0, W, H);
    glowText(g, 'C:\\> ferramentas /lista', 24, 40, G, 30);
    g.fillStyle = 'rgba(60,255,122,0.4)'; g.fillRect(24, 54, W - 48, 2);
    const off = t * 1.6;
    const first = Math.floor(off);
    const frac = off - first;
    g.save(); g.beginPath(); g.rect(0, 64, W, H - 140); g.clip();
    for (let i = 0; i < 12; i++) {
      const it = items[(first + i) % items.length];
      const y = 96 + (i - frac) * 30;
      if (it.startsWith('==')) glowText(g, it, 24, y, '#b8ffcf', 28);
      else {
        const dots = '.'.repeat(Math.max(2, 26 - it.length));
        glowText(g, `  ${it} ${dots} [OK]`, 24, y, G, 28);
      }
    }
    g.restore();
    // barra "carregando"
    const p = (t * 0.25) % 1;
    g.strokeStyle = G; g.lineWidth = 2; g.strokeRect(24, H - 70, W - 48, 22);
    g.fillStyle = G; g.shadowColor = G; g.shadowBlur = 8;
    for (let x = 0; x < (W - 56) * p; x += 14) g.fillRect(28 + x, H - 66, 10, 14);
    g.shadowBlur = 0;
    const blink = Math.floor(t * 2) % 2 === 0;
    glowText(g, '> CLIQUE PARA ABRIR' + (blink ? '_' : ''), 24, H - 18, s.hover > 0.5 ? '#e4ffe9' : G, 30);
    crtPost(g, G, t);
  });
}

// ---------------- MONITOR 3 — PROJETOS (desktop retrô) ----------------
export function projectsScreen(projects) {
  const covers = projects.map(p => { const im = new Image(); im.src = p.cover; return im; });
  return new Screen((g, t, s) => {
    // área de trabalho
    g.fillStyle = '#0f7c7c'; g.fillRect(0, 0, W, H);
    // janela
    const wx = 40, wy = 34, ww = W - 80, wh = H - 110;
    bevel(g, wx, wy, ww, wh);
    const tg = g.createLinearGradient(wx, 0, wx + ww, 0);
    tg.addColorStop(0, '#0a1f7a'); tg.addColorStop(1, '#1f86d6');
    g.fillStyle = tg; g.fillRect(wx + 4, wy + 4, ww - 8, 30);
    g.font = '24px "VT323"'; g.fillStyle = '#fff'; g.fillText('C:\\PROJETOS', wx + 14, wy + 27);
    ['_', '□', 'x'].forEach((c, i) => { bevel(g, wx + ww - 32 - i * 28, wy + 8, 24, 22); g.fillStyle = '#000'; g.fillText(c, wx + ww - 25 - i * 28, wy + 26); });
    g.fillStyle = '#fff'; g.fillRect(wx + 8, wy + 40, ww - 16, wh - 48);
    // ícones dos projetos
    projects.forEach((p, i) => {
      const cx = wx + 40 + i * 185, cy = wy + 70;
      const im = covers[i];
      g.fillStyle = '#e8c547'; g.fillRect(cx, cy + 6, 140, 100); g.fillRect(cx, cy, 56, 12);
      if (im.complete && im.naturalWidth) {
        g.drawImage(im, cx + 8, cy + 16, 124, 82);
      }
      g.strokeStyle = '#8a6d14'; g.lineWidth = 2; g.strokeRect(cx, cy + 6, 140, 100);
      g.font = '22px "VT323"'; g.fillStyle = '#000';
      const name = p.title.split('—')[0].trim();
      g.fillText(name.length > 14 ? name.slice(0, 13) + '…' : name, cx, cy + 132);
      const sel = Math.floor(t / 1.6) % projects.length === i;
      if (sel) { g.strokeStyle = '#0a1f7a'; g.setLineDash([4, 3]); g.strokeRect(cx - 6, cy - 6, 152, 148); g.setLineDash([]); }
    });
    g.font = '24px "VT323"'; g.fillStyle = '#333';
    g.fillText(`${projects.length} objeto(s)   •   duplo clique p/ abrir`, wx + 20, wy + wh - 22);
    // barra de tarefas
    g.fillStyle = '#c3c3c3'; g.fillRect(0, H - 40, W, 40);
    g.fillStyle = '#fff'; g.fillRect(0, H - 40, W, 2);
    bevel(g, 6, H - 35, 104, 30); g.font = 'bold 24px "VT323"'; g.fillStyle = '#000'; g.fillText('▶ Iniciar', 16, H - 12);
    const d = new Date(); const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
    g.fillStyle = '#c3c3c3'; g.strokeStyle = '#7b7b7b'; g.strokeRect(W - 96, H - 34, 88, 28);
    g.fillStyle = '#000'; g.fillText(`${hh}:${mm}`, W - 82, H - 12);
    const blink = Math.floor(t * 2) % 2 === 0;
    if (s.hover > 0.5 || blink) { g.font = '26px "VT323"'; g.fillStyle = '#fff'; g.fillText('CLIQUE PARA ABRIR', 140, H - 12); }
    // cursor que passeia
    const mx = W / 2 + Math.sin(t * 0.7) * 220, my = H / 2 + Math.sin(t * 1.1) * 110;
    g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(mx, my); g.lineTo(mx, my + 22); g.lineTo(mx + 6, my + 17); g.lineTo(mx + 11, my + 26); g.lineTo(mx + 14, my + 24); g.lineTo(mx + 10, my + 15); g.lineTo(mx + 17, my + 15); g.closePath(); g.fill(); g.stroke();
    crtPost(g, '#fff', t);
  });
}

function bevel(g, x, y, w, h) {
  g.fillStyle = '#c3c3c3'; g.fillRect(x, y, w, h);
  g.fillStyle = '#fff'; g.fillRect(x, y, w, 2); g.fillRect(x, y, 2, h);
  g.fillStyle = '#7b7b7b'; g.fillRect(x, y + h - 2, w, 2); g.fillRect(x + w - 2, y, 2, h);
}
