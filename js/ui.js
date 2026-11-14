// Camada HTML por cima do 3D: conteúdo dos monitores, papéis, galeria e HUD.
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const overlay = $('#overlay');
const inner = $('#overlay-inner');
const backBtn = $('#back');
const tip = $('#tip');
const pinsBox = $('#pins');
const lb = $('#lightbox');

let current = null;   // 'about' | 'tools' | 'projects' | 'paper'
let lbState = null;   // { photos, i }
let data = null;

// -------------------------------------------------------------- monitores
function about(p) {
  let i = 0; const L = () => `style="--i:${i++}"`;
  return `
  <div class="term">
    <p class="cmd" ${L()}>C:\\&gt; whoami</p>
    <div class="whoami" ${L()}>
      <img class="avatar" src="${esc(p.foto)}" alt="Foto de ${esc(p.nome)}" onerror="this.style.display='none'">
      <div><h1>${esc(p.nome)}</h1><p class="role">${esc(p.cargo)}</p></div>
    </div>
    <p class="cmd" ${L()}>C:\\&gt; type LEMA.TXT</p>
    <blockquote ${L()}>“${esc(p.lema)}”</blockquote>
    <p class="cmd" ${L()}>C:\\&gt; type SOBRE.TXT</p>
    ${p.sobre.map(s => `<p ${L()}>${esc(s)}</p>`).join('')}
    <p class="cmd" ${L()}>C:\\&gt; type CONQUISTAS.LOG</p>
    <ul class="log" ${L()}>${p.conquistas.map(c => `<li><span>${esc(c.quando)}</span>${esc(c.texto)}</li>`).join('')}</ul>
    <p class="cmd" ${L()}>C:\\&gt; type FRASES.TXT</p>
    ${p.frases.map(f => `<p class="frase" ${L()}>» ${esc(f)}</p>`).join('')}
    <p class="cmd" ${L()}>C:\\&gt; contato.bat</p>
    <div class="links" ${L()}>${p.contatos.map(c => `<a href="${esc(c.url)}" target="_blank" rel="noopener">[ ${esc(c.rotulo)} ]</a>`).join('')}</div>
    <p class="cmd" ${L()}>C:\\&gt; <span class="cursor"></span></p>
  </div>`;
}

function tools(groups) {
  let i = 0; const L = () => `style="--i:${i++}"`;
  const total = groups.reduce((n, g) => n + g.itens.length, 0);
  return `
  <div class="term">
    <p class="cmd" ${L()}>C:\\&gt; ferramentas /lista /detalhado</p>
    <p class="dim" ${L()}>Varrendo HD... ${total} módulos encontrados.</p>
    ${groups.map(g => `
      <h2 ${L()}>╔═ ${esc(g.grupo.toUpperCase())} ═╗</h2>
      <ul class="mods" ${L()}>${g.itens.map(it => `<li><span class="name">${esc(it)}</span><span class="dots"></span><b>[ OK ]</b></li>`).join('')}</ul>
    `).join('')}
    <p class="dim" ${L()}>${total} módulo(s) carregado(s) sem erros. Memória livre: 640K (deve bastar pra qualquer um).</p>
    <p class="cmd" ${L()}>C:\\&gt; <span class="cursor"></span></p>
  </div>`;
}

function projectsGrid(list) {
  return `
  <div class="os">
    <div class="win">
      <div class="titlebar"><span>📁 C:\\PROJETOS</span><div class="tb"><button tabindex="-1">_</button><button tabindex="-1">□</button><button class="x" data-act="close">×</button></div></div>
      <div class="menubar"><span>Arquivo</span><span>Editar</span><span>Exibir</span><span>Ajuda</span></div>
      <div class="toolbar"><button class="bv" data-act="home" disabled>◄ Voltar</button><div class="path">C:\\PROJETOS\\</div></div>
      <div class="win-body" id="win-body">${gridHTML(list)}</div>
      <div class="status"><span id="status-l">${list.length} objeto(s)</span><span>Clique duas vezes... ou uma, tanto faz :)</span></div>
    </div>
  </div>`;
}
function gridHTML(list) {
  return `<div class="grid">${list.map((p, i) => `
    <button class="file" data-proj="${i}">
      <div class="thumb"><img src="${esc(p.cover)}" alt="" loading="lazy" onerror="this.remove()"></div>
      <strong>${esc(p.title)}</strong>
      <span>${esc(p.summary)}</span>
    </button>`).join('')}</div>`;
}
function detailHTML(p) {
  return `
  <article class="detail">
    <button class="cover" data-photo="0"><img src="${esc(p.cover)}" alt="${esc(p.title)}" onerror="this.remove()"><span>🔍 ampliar</span></button>
    <h1>${esc(p.title)}</h1>
    <div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    <p>${esc(p.description)}</p>
    <h2>Galeria — ${p.photos.length} tela(s)</h2>
    <div class="gallery">${p.photos.map((ph, i) => `
      <button data-photo="${i}"><img src="${esc(ph.src)}" alt="" loading="lazy" onerror="this.remove()"><span>${esc(ph.title)}</span></button>`).join('')}
    </div>
  </article>`;
}

function wireProjects(list) {
  const body = $('#win-body'), back = inner.querySelector('[data-act="home"]'), path = inner.querySelector('.path'), status = $('#status-l');
  let openIdx = -1;
  inner.querySelector('.os').addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') { backCb && backCb(); return; }
    if (act === 'home') { body.innerHTML = gridHTML(list); back.disabled = true; path.textContent = 'C:\\PROJETOS\\'; status.textContent = `${list.length} objeto(s)`; openIdx = -1; body.scrollTop = 0; return; }
    const f = e.target.closest('[data-proj]');
    if (f) {
      openIdx = +f.dataset.proj; const p = list[openIdx];
      body.innerHTML = detailHTML(p); back.disabled = false; body.scrollTop = 0;
      path.textContent = `C:\\PROJETOS\\${p.slug.toUpperCase()}\\`;
      status.textContent = `${p.photos.length} imagem(ns)`;
      return;
    }
    const ph = e.target.closest('[data-photo]');
    if (ph && openIdx >= 0) openLightbox(list[openIdx].photos, +ph.dataset.photo);
  });
}

// -------------------------------------------------------------- papel
function paperHTML(it) {
  return `
  <div class="sheet" style="--cor:${esc(it.cor)}">
    <div class="tape"></div>
    <div class="stamp">EM ANDAMENTO</div>
    <h1>${esc(it.titulo)}</h1>
    <h2>${esc(it.subtitulo)}</h2>
    <p class="typed">${esc(it.texto)}</p>
    <div class="prog"><span>progresso</span><div class="bar"><i style="--p:${+it.progresso || 0}%"></i></div><b>${+it.progresso || 0}%</b></div>
    <h3>stack</h3>
    <div class="labels">${it.stack.map(s => `<span>${esc(s)}</span>`).join('')}</div>
    <h3>próximos passos</h3>
    <ul class="todo">${it.proximos.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    <p class="hint">clique fora do papel ou ESC para devolver à mesa</p>
  </div>`;
}

// -------------------------------------------------------------- lightbox
function openLightbox(photos, i) {
  lbState = { photos, i };
  lb.hidden = false; requestAnimationFrame(() => lb.classList.add('on'));
  renderLb();
}
function renderLb() {
  const { photos, i } = lbState, ph = photos[i];
  lb.querySelector('.lb-img').innerHTML = `<img src="${esc(ph.src)}" alt="${esc(ph.title)}">`;
  lb.querySelector('.lb-text').innerHTML = `
    <span class="lb-count">${i + 1} / ${photos.length}</span>
    <h2>${esc(ph.title)}</h2>
    <p>${esc(ph.description)}</p>
    ${ph.highlights?.length ? `<ul>${ph.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}`;
}
function closeLightbox() { lb.classList.remove('on'); setTimeout(() => { lb.hidden = true; }, 250); lbState = null; }
lb.addEventListener('click', e => {
  if (e.target.closest('.lb-prev')) { lbState.i = (lbState.i - 1 + lbState.photos.length) % lbState.photos.length; renderLb(); return; }
  if (e.target.closest('.lb-next')) { lbState.i = (lbState.i + 1) % lbState.photos.length; renderLb(); return; }
  if (e.target.closest('.lb-close') || e.target === lb) closeLightbox();
});
addEventListener('keydown', e => {
  if (!lbState) return;
  if (e.key === 'ArrowLeft') lb.querySelector('.lb-prev').click();
  if (e.key === 'ArrowRight') lb.querySelector('.lb-next').click();
});

// -------------------------------------------------------------- API
let backCb = null;
export const UI = {
  openMonitor(id, d, rect) {
    data = d; current = id;
    overlay.className = `overlay crt theme-${id}`;
    inner.innerHTML = id === 'about' ? about(d.perfil) : id === 'tools' ? tools(d.ferramentas) : projectsGrid(d.projects);
    if (id === 'projects') wireProjects(d.projects);
    this.position(rect);
    overlay.hidden = false; inner.scrollTop = 0;
    requestAnimationFrame(() => overlay.classList.add('on'));
    backBtn.hidden = false;
  },
  openPaper(item, rect) {
    current = 'paper';
    overlay.className = 'overlay paper';
    inner.innerHTML = paperHTML(item);
    this.position(rect);
    overlay.hidden = false; inner.scrollTop = 0;
    requestAnimationFrame(() => overlay.classList.add('on'));
    backBtn.hidden = false;
  },
  position(r) {
    const small = r.w < 360 || r.h < 300;
    overlay.classList.toggle('full', small);
    if (small) { overlay.style.cssText = ''; return; }
    overlay.style.left = r.x + 'px'; overlay.style.top = r.y + 'px';
    overlay.style.width = r.w + 'px'; overlay.style.height = r.h + 'px';
    overlay.style.setProperty('--s', Math.min(1.25, Math.max(0.72, r.w / 760)));
  },
  close() {
    overlay.classList.remove('on');
    backBtn.hidden = true;
    if (lbState) closeLightbox();
    setTimeout(() => { if (!overlay.classList.contains('on')) { overlay.hidden = true; inner.innerHTML = ''; } }, 300);
    current = null;
  },
  handleEscape() { if (lbState) { closeLightbox(); return true; } return false; },
  isTyping() { return !!current; },
  onBack(cb) { backCb = cb; backBtn.addEventListener('click', cb); overlay.addEventListener('pointerdown', e => e.stopPropagation()); },
  onTimeToggle(cb) { $('#btn-time').addEventListener('click', cb); },
  onSoundToggle(cb) {
    $('#btn-sound').addEventListener('click', cb);
    document.addEventListener('sound', e => { $('#btn-sound').textContent = e.detail ? '♪ SOM: ON' : '♪ SOM: OFF'; });
  },
  setTimeLabel(mode, p) {
    const fase = p.day > 0.6 ? 'dia' : p.dusk > 0.35 ? (new Date().getHours() < 12 ? 'amanhecer' : 'entardecer') : 'noite';
    const icon = { dia: '☀', amanhecer: '◐', entardecer: '◐', noite: '☾' }[fase];
    const hh = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    $('#btn-time').textContent = mode === 'auto' ? `${icon} ${hh} • AUTO` : `${icon} ${mode.toUpperCase()}`;
  },
  showTip(t) { tip.textContent = t; tip.hidden = false; },
  hideTip() { tip.hidden = true; },
  moveTip(x, y) {
    const w = tip.offsetWidth, h = tip.offsetHeight;
    const tx = x + 16 + w > innerWidth - 8 ? x - w - 12 : x + 16;
    const ty = y + 18 + h > innerHeight - 8 ? y - h - 12 : y + 18;
    tip.style.transform = `translate(${tx}px, ${ty}px)`;
  },
  createPins(list, onClick) {
    pinsBox.innerHTML = list.map(p => `<button class="pin${p.disabled ? ' disabled' : ''}" data-pin="${p.id}"${p.disabled ? ' aria-disabled="true" title="Em breve"' : ''}><i></i><span>${esc(p.label)}</span></button>`).join('');
    pinsBox.addEventListener('click', e => { const b = e.target.closest('[data-pin]'); if (b) onClick(b.dataset.pin); });
  },
  placePin(id, x, y, vis) {
    const el = pinsBox.querySelector(`[data-pin="${id}"]`);
    if (!el) return;
    el.style.transform = `translate(${x}px, ${y}px)`; el.style.opacity = vis ? '' : '0';
  },
  hidePins() { pinsBox.classList.remove('on'); },
  showPins() { pinsBox.classList.add('on'); },
  showHud() { document.body.classList.add('ready'); },
  bootReady(cb) {
    const boot = $('#boot'), press = $('#boot-press');
    press.hidden = false;
    let done = false;
    const go = () => {
      if (done) return; done = true;
      removeEventListener('keydown', go); boot.removeEventListener('click', go);
      boot.classList.add('off');
      setTimeout(() => boot.remove(), 900);
      cb();
    };
    boot.addEventListener('click', go); addEventListener('keydown', go);
  },
};
