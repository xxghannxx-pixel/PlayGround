import {
  WIDTH,
  HEIGHT,
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  HAIR_STYLES,
  BACKDROPS,
  PALETTES,
  TOOL_CATEGORIES,
  TOOLS,
  CHALLENGES,
  DEFAULT_MODEL,
  shade,
  rgba,
} from './data.js';
import {
  geometry,
  renderBase,
  drawBackdrop,
  drawHairBack,
  drawSkinBase,
  drawFeatures,
  drawHairFront,
  drawOverlay,
} from './face.js';
import { SoundKit } from './audio.js';

const STORAGE_KEY = 'glam-studio-v1';
const LAYER_IDS = ['bg', 'hairBack', 'skin', 'underMakeup', 'blush', 'highlight', 'eyeshadow', 'features', 'eyeMakeup', 'lipstick', 'hairFront', 'overlay'];
const PAINT_LAYERS = ['underMakeup', 'blush', 'highlight', 'eyeshadow', 'eyeMakeup', 'lipstick'];
const LAYER_CLIP = {
  underMakeup: geometry.face,
  blush: geometry.cheeks,
  highlight: geometry.highlight,
  eyeshadow: geometry.shadow,
  eyeMakeup: geometry.eye,
  lipstick: geometry.lips,
};
const DEFAULT_COLORS = {
  lipstick: '#d94862',
  gloss: '#fff4ef',
  eyeshadow: '#e8a6b4',
  eyeliner: '#171317',
  mascara: '#171317',
  blush: '#f08a9a',
  highlighter: '#fff0da',
  contour: '#b98263',
  foundation: '#e5b08a',
  freckles: '#a56a45',
  eraser: '#ffffff',
};

const $ = (id) => document.getElementById(id);
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const ICONS = {
  lipstick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12.5V6.7c0-.7.5-1.2 1.2-1.2h3.6c.7 0 1.2.5 1.2 1.2v5.8"/><path d="M8 12.5h8v5.7a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/><path d="m9.5 5.5 2.5-2 2.5 2"/></svg>',
  gloss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.5 4 5.5 6.5 5.5 9.2A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.8C6.5 9.5 8.5 7 12 3Z"/><path d="M9.5 12.5c0 1.4.9 2.4 2.2 2.7"/></svg>',
  eyeshadow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 12.2c2.8-3.7 7-4.5 10.8-3 3.1 1.2 5.9 1.2 7.6.3-2 4-6.2 6-10.2 5.3-3.1-.5-5.9-1.5-8.2-2.6Z"/><path d="M5.5 9.5C7.7 6.3 11.4 5 14.8 6"/></svg>',
  eyeliner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m15.8 3.8 4.4 4.4-9.7 9.7-5.4 1 1-5.4z"/><path d="m13.8 5.8 4.4 4.4"/><path d="M4 21h6"/></svg>',
  mascara: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6"/><path d="M12 21V9"/><path d="M9.5 9h5l-1-5h-3z"/><path d="M8 6 5 4M16 6l3-2M8 9 5 9M16 9l3 0"/></svg>',
  blush: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="4.2"/><path d="M13.5 11.6c2.2.3 4.1 2 5 4.5-2.4.7-4.7.2-6.3-1.2"/><path d="M6.5 16.8c1.2 1.7 3.3 2.5 5.4 2.2"/></svg>',
  highlighter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8 13.8 8l5.2 1.8-5.2 1.8L12 16.8l-1.8-5.2L5 9.8 10.2 8Z"/><path d="M19 16.5v4M17 18.5h4M5 17.5v3M3.5 19h3"/></svg>',
  contour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3.2c3.1 1.7 5 5.1 5 8.8 0 4.8-3.4 8.3-7.8 8.3h-1.2"/><path d="M8 3.8C5.2 5.7 3.5 8.7 3.5 12s1.6 6 4.2 7.8"/><path d="M15.5 7.5c1.4 1.2 2.2 3 2.2 4.9 0 3-2.1 5.2-4.8 5.2"/></svg>',
  foundation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4v4h-4z"/><path d="M9 7h6l1.5 3v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-9z"/><path d="M8.5 12h7"/></svg>',
  freckles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r=".8" fill="currentColor"/><circle cx="13" cy="7" r=".7" fill="currentColor"/><circle cx="16" cy="12" r=".8" fill="currentColor"/><circle cx="6.5" cy="14" r=".6" fill="currentColor"/><circle cx="11" cy="13" r=".7" fill="currentColor"/><circle cx="14" cy="17" r=".6" fill="currentColor"/><circle cx="18" cy="7" r=".6" fill="currentColor"/></svg>',
  eraser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 14 6-6a2.4 2.4 0 0 1 3.4 0l4.6 4.6a2.4 2.4 0 0 1 0 3.4l-2.6 2.6H8.5l-4-4a2.4 2.4 0 0 1 0-3.4Z"/><path d="m10 9 6 6"/><path d="M8.5 20H20"/></svg>',
};

function loadSaved() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

const saved = loadSaved();
const state = {
  mode: 'free',
  challengeId: null,
  model: { ...DEFAULT_MODEL, ...(saved.model || {}) },
  tool: 'lipstick',
  category: 'lips',
  color: DEFAULT_COLORS.lipstick,
  size: 1,
  strength: 1,
  soundOn: saved.soundOn !== false,
  progress: saved.progress || {},
  coins: Number(saved.coins) || 0,
  history: [],
  future: [],
  drawing: false,
  busy: false,
  prepared: [],
  lastPoint: null,
  pointerId: null,
  seenTip: Boolean(saved.seenTip),
};

const sound = new SoundKit(state.soundOn);
const layers = {};
const contexts = {};
const scene = $('faceScene');
const interaction = document.createElement('canvas');
interaction.width = WIDTH;
interaction.height = HEIGHT;
interaction.className = 'interaction';
interaction.setAttribute('aria-label', 'Lienzo de maquillaje. Toca y arrastra para maquillar el rostro.');
interaction.setAttribute('role', 'img');

for (const id of LAYER_IDS) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.className = `layer-${id}`;
  canvas.setAttribute('aria-hidden', 'true');
  scene.appendChild(canvas);
  layers[id] = canvas;
  contexts[id] = canvas.getContext('2d', { willReadFrequently: true });
}
scene.appendChild(interaction);

/* ------------------------------------------------------------------ */
/* Persistence and stats                                               */
/* ------------------------------------------------------------------ */

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      progress: state.progress,
      coins: state.coins,
      soundOn: state.soundOn,
      model: state.model,
      seenTip: state.seenTip,
    }));
  } catch {
    /* Storage can be unavailable in private mode. */
  }
}

function totalStars() {
  return CHALLENGES.reduce((sum, challenge) => sum + (state.progress[challenge.id]?.stars || 0), 0);
}

function completedChallenges() {
  return CHALLENGES.filter((challenge) => (state.progress[challenge.id]?.stars || 0) > 0).length;
}

function updateStats() {
  $('starTotal').textContent = String(totalStars());
  $('coinTotal').textContent = String(state.coins);
  $('challengeProgress').textContent = `${completedChallenges()}/${CHALLENGES.length}`;
}

function updateSoundUI() {
  sound.enabled = state.soundOn;
  for (const id of ['soundBtn', 'soundStageBtn']) {
    const button = $(id);
    button.classList.toggle('muted', !state.soundOn);
    button.setAttribute('aria-label', state.soundOn ? 'Silenciar sonido' : 'Activar sonido');
    button.title = state.soundOn ? 'Silenciar sonido' : 'Activar sonido';
  }
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  updateSoundUI();
  if (state.soundOn) sound.select();
  saveState();
}

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                    */
/* ------------------------------------------------------------------ */

let toastTimer = null;
function showToast(text, duration = 2300) {
  const toast = $('toast');
  toast.textContent = text;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}

function openModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.add('is-open');
  document.body.classList.add('modal-open');
  const focusTarget = modal.querySelector('button:not([disabled])');
  if (focusTarget) setTimeout(() => focusTarget.focus({ preventScroll: true }), 120);
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.remove('is-open');
  if (!document.querySelector('.modal.is-open')) document.body.classList.remove('modal-open');
}

function closeAllModals() {
  document.querySelectorAll('.modal.is-open').forEach((modal) => modal.classList.remove('is-open'));
  document.body.classList.remove('modal-open');
}

function enterStudio() {
  const landing = $('landing');
  if (!landing.classList.contains('is-leaving')) {
    landing.classList.add('is-leaving');
  }
}

function showLanding() {
  closeAllModals();
  const landing = $('landing');
  landing.classList.remove('is-leaving');
  landing.scrollTop = 0;
}

/* ------------------------------------------------------------------ */
/* Tool and palette UI                                                 */
/* ------------------------------------------------------------------ */

function renderToolTabs() {
  $('toolTabs').innerHTML = TOOL_CATEGORIES.map((category) => `
    <button class="tool-tab ${state.category === category.id ? 'is-active' : ''}" role="tab" aria-selected="${state.category === category.id}" data-category="${category.id}">${category.name}</button>
  `).join('');
}

function renderToolGrid() {
  const category = TOOL_CATEGORIES.find((item) => item.id === state.category) || TOOL_CATEGORIES[0];
  $('toolGrid').innerHTML = category.tools.map((id) => {
    const tool = TOOLS[id];
    return `
      <button class="tool-tile ${state.tool === id ? 'is-active' : ''}" data-tool="${id}" aria-pressed="${state.tool === id}" title="${tool.name}">
        <span class="tool-icon" aria-hidden="true">${ICONS[id] || ''}</span>
        <span><span class="tool-name">${tool.name}</span><span class="tool-sub">${tool.stamp ? 'Toques' : tool.id === 'eraser' ? 'Corrige' : 'Pinta'}</span></span>
      </button>
    `;
  }).join('');
}

function renderSwatches() {
  const tool = TOOLS[state.tool];
  const palette = PALETTES[tool.palette] || [];
  $('paletteTitle').textContent = tool.name;
  if (tool.id === 'eraser') {
    $('swatches').innerHTML = '<p class="palette-note">El borrador elimina el maquillaje sin tocar la piel ni las facciones.</p>';
    $('currentColorChip').style.background = 'rgba(255,255,255,0.18)';
    $('currentColorName').textContent = 'Suave';
    return;
  }
  $('swatches').innerHTML = palette.map((entry) => `
    <button class="swatch ${entry.color === state.color ? 'is-active' : ''}" style="--c:${entry.color}" data-color="${entry.color}" aria-label="${entry.name}" title="${entry.name}"></button>
  `).join('');
  const current = palette.find((entry) => entry.color === state.color) || palette[0];
  $('currentColorChip').style.background = state.color;
  $('currentColorName').textContent = current ? current.name : '';
}

function updateToolReadout() {
  const tool = TOOLS[state.tool];
  $('activeToolName').textContent = tool.name;
  $('brushReadout').textContent = `${Math.round(tool.brush * state.size)} px`;
  $('toolHint').textContent = tool.hint;
  interaction.classList.toggle('is-erasing', state.tool === 'eraser');
}

function selectTool(id, options = {}) {
  if (!TOOLS[id]) return;
  const tool = TOOLS[id];
  state.tool = id;
  state.category = tool.category;
  const palette = PALETTES[tool.palette] || [];
  if (options.color) {
    state.color = options.color;
  } else {
    const sameFamily = palette.some((entry) => entry.color === state.color);
    if (!sameFamily) state.color = DEFAULT_COLORS[id] || palette[0]?.color || '#ffffff';
  }
  if (!palette.some((entry) => entry.color === state.color) && !options.color) {
    state.color = palette[0]?.color || state.color;
  }
  if (id === 'foundation') state.color = state.model.skin;
  renderToolTabs();
  renderToolGrid();
  renderSwatches();
  updateToolReadout();
}

function setColor(color) {
  state.color = color;
  renderSwatches();
}

/* ------------------------------------------------------------------ */
/* Model and hero                                                      */
/* ------------------------------------------------------------------ */

function renderStatic() {
  renderBase(contexts, state.model);
}

function compositeLayers(target, sourceLayers, width = WIDTH, height = HEIGHT) {
  const ctx = target.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  for (const id of LAYER_IDS) {
    ctx.drawImage(sourceLayers[id], 0, 0, width, height);
  }
}

function paintClipped(layer, clip, painter) {
  const ctx = layer.getContext('2d');
  ctx.save();
  ctx.clip(clip);
  painter(ctx);
  ctx.restore();
}

function renderHero() {
  const hero = $('heroCanvas');
  if (!hero) return;
  const temp = {};
  const tempContexts = {};
  for (const id of LAYER_IDS) {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    temp[id] = canvas;
    tempContexts[id] = canvas.getContext('2d');
  }
  const heroModel = { ...DEFAULT_MODEL, style: 'waves', backdrop: 'rose' };
  renderBase(tempContexts, heroModel);

  const roseGold = (ctx, x) => {
    const glow = ctx.createRadialGradient(x, 472, 4, x, 486, 100);
    glow.addColorStop(0, 'rgba(212,166,42,0.62)');
    glow.addColorStop(0.32, 'rgba(185,107,63,0.52)');
    glow.addColorStop(0.68, 'rgba(142,60,80,0.28)');
    glow.addColorStop(1, 'rgba(142,60,80,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 115, 400, 230, 160);
  };
  paintClipped(temp.eyeshadow, geometry.shadow, (ctx) => {
    roseGold(ctx, 343);
    roseGold(ctx, 557);
  });
  paintClipped(temp.blush, geometry.cheeks, (ctx) => {
    for (const x of [293, 607]) {
      const glow = ctx.createRadialGradient(x, 650, 6, x, 650, 92);
      glow.addColorStop(0, 'rgba(240,138,154,0.52)');
      glow.addColorStop(1, 'rgba(240,138,154,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 110, 560, 220, 180);
    }
  });
  paintClipped(temp.highlight, geometry.highlight, (ctx) => {
    const glow = ctx.createLinearGradient(0, 300, 0, 880);
    glow.addColorStop(0, 'rgba(255,230,196,0.42)');
    glow.addColorStop(0.5, 'rgba(255,236,210,0.28)');
    glow.addColorStop(1, 'rgba(255,236,210,0.18)');
    ctx.fillStyle = glow;
    ctx.fillRect(180, 260, 540, 650);
  });
  paintClipped(temp.lipstick, geometry.lips, (ctx) => {
    const gloss = ctx.createLinearGradient(0, 715, 0, 825);
    gloss.addColorStop(0, '#c9143f');
    gloss.addColorStop(0.45, '#a60f35');
    gloss.addColorStop(1, '#7b0b28');
    ctx.fillStyle = gloss;
    ctx.fillRect(340, 690, 220, 160);
  });
  paintClipped(temp.eyeMakeup, geometry.eye, (ctx) => {
    ctx.strokeStyle = 'rgba(23,19,23,0.92)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke(geometry.leftUpper);
    ctx.stroke(geometry.rightUpper);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(270, 497);
    ctx.lineTo(250, 481);
    ctx.moveTo(630, 497);
    ctx.lineTo(650, 481);
    ctx.stroke();
  });
  compositeLayers(hero, temp);
}

function renderModelOptions() {
  $('skinSwatches').innerHTML = SKIN_TONES.map((entry) => `
    <button class="model-swatch ${state.model.skin === entry.color ? 'is-active' : ''}" style="--c:${entry.color}" data-skin="${entry.color}" aria-label="${entry.name}" title="${entry.name}"></button>
  `).join('');
  $('hairSwatches').innerHTML = HAIR_COLORS.map((entry) => `
    <button class="model-swatch ${state.model.hair === entry.color ? 'is-active' : ''}" style="--c:${entry.color}" data-hair="${entry.color}" aria-label="${entry.name}" title="${entry.name}"></button>
  `).join('');
  $('eyeSwatches').innerHTML = EYE_COLORS.map((entry) => `
    <button class="model-swatch ${state.model.eye === entry.color ? 'is-active' : ''}" style="--c:${entry.color}" data-eye="${entry.color}" aria-label="${entry.name}" title="${entry.name}"></button>
  `).join('');
  $('styleOptions').innerHTML = HAIR_STYLES.map((style) => `
    <button class="style-option ${state.model.style === style.id ? 'is-active' : ''}" data-style="${style.id}"><b>${style.name}</b><small>${style.hint}</small></button>
  `).join('');
  $('backdropOptions').innerHTML = BACKDROPS.map((entry) => `
    <button class="backdrop-option ${state.model.backdrop === entry.id ? 'is-active' : ''}" data-backdrop="${entry.id}">
      <span class="bd-dots">${entry.colors.map((color) => `<span style="--c:${color}"></span>`).join('')}</span>${entry.name}
    </button>
  `).join('');
}

/* ------------------------------------------------------------------ */
/* Client card and challenge grid                                      */
/* ------------------------------------------------------------------ */

function currentChallenge() {
  return state.mode === 'challenge' ? CHALLENGES.find((challenge) => challenge.id === state.challengeId) || null : null;
}

function clientCardMarkup() {
  const challenge = currentChallenge();
  if (!challenge) {
    return `
      <div class="client-card free-card">
        <div class="client-head">
          <div class="avatar" style="--avatar-a:#ffd2b0;--avatar-b:#a53b63">✦</div>
          <div class="client-meta">
            <span class="mini-label">Modo abierto</span>
            <h3>Estudio libre</h3>
            <p class="client-tagline">Pinta a tu ritmo, sin reloj</p>
          </div>
        </div>
        <p class="client-quote">“No hay reglas: mezcla texturas, prueba colores imposibles y guarda tu look favorito.”</p>
        <div class="free-tips">
          <div class="free-tip"><span>✦</span><p>Las herramientas respetan las zonas del rostro: el labial no se sale de los labios.</p></div>
          <div class="free-tip"><span>◐</span><p>Cambia el tono de piel, el pelo y el fondo desde <b>Modelo</b>.</p></div>
          <div class="free-tip"><span>★</span><p>¿Buscas un objetivo? Elige una clienta y consigue sus tres estrellas.</p></div>
        </div>
        <div class="client-foot">
          <small>Progreso guardado en tu dispositivo</small>
          <button class="mini-button" data-open-gallery>Elegir reto</button>
        </div>
      </div>
    `;
  }

  const record = state.progress[challenge.id];
  const percent = record ? record.best || 0 : 0;
  return `
    <div class="client-card">
      <div class="client-head">
        <div class="avatar" style="--avatar-a:${shade(challenge.accent, 36)};--avatar-b:${shade(challenge.accent, -52)}">${challenge.initials}</div>
        <div class="client-meta">
          <span class="mini-label">Clienta · ${challenge.tagline}</span>
          <h3>${challenge.client}</h3>
          <p class="client-tagline">${challenge.title}</p>
        </div>
        <div class="score-ring" id="scoreRing" style="--p:${percent}" aria-label="Coincidencia ${percent}%"><span id="scoreRingText">${percent}%</span></div>
      </div>
      <p class="client-quote">“${challenge.quote}”</p>
      <div class="req-list" id="reqList">
        ${challenge.reqs.map((req, index) => `
          <button class="req-row" data-req-index="${index}" data-req-tool="${req.tool}" data-req-color="${req.color}" title="Usar ${TOOLS[req.tool].name} · ${req.label}">
            <span class="req-dot" style="--c:${req.color}"></span>
            <span class="req-label">${req.label}</span>
            <span class="req-meter"><i></i></span>
            <span class="req-check">✓</span>
          </button>
        `).join('')}
      </div>
      <div class="client-foot">
        <small>Toca una pista para usar el tono exacto</small>
        <button class="mini-button" data-open-gallery>Cambiar</button>
      </div>
    </div>
  `;
}

function renderClientCard() {
  $('clientCard').innerHTML = clientCardMarkup();
  if (state.mode === 'challenge') updateMeters();
}

function renderChallengeGrid() {
  $('challengeGrid').innerHTML = CHALLENGES.map((challenge) => {
    const record = state.progress[challenge.id];
    const stars = record?.stars || 0;
    const isCurrent = state.mode === 'challenge' && state.challengeId === challenge.id;
    return `
      <button class="challenge-tile ${isCurrent ? 'is-current' : ''}" style="--accent:${challenge.accent}" data-challenge="${challenge.id}">
        <div class="tile-top">
          <div class="tile-client">
            <span class="tile-avatar">${challenge.initials}</span>
            <span><b>${challenge.client}</b><small>${challenge.tagline}</small></span>
          </div>
          <span class="tile-stars">${[1, 2, 3].map((n) => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('')}</span>
        </div>
        <h3>${challenge.title}</h3>
        <p>${challenge.quote}</p>
        <div class="tile-palette">${challenge.reqs.map((req) => `<span style="--c:${req.color}"></span>`).join('')}</div>
        <div class="tile-cta"><span>${isCurrent ? 'En curso' : stars ? 'Repetir reto' : 'Aceptar reto'}</span><span>→</span></div>
      </button>
    `;
  }).join('');
}

function updateMeters() {
  const challenge = currentChallenge();
  if (!challenge) return;
  const measure = measureChallenge(challenge);
  const ring = $('scoreRing');
  if (ring) {
    const percent = Math.round(measure.overall * 100);
    ring.style.setProperty('--p', String(percent));
    ring.setAttribute('aria-label', `Coincidencia ${percent}%`);
    const text = $('scoreRingText');
    if (text) text.textContent = `${percent}%`;
  }
  const rows = document.querySelectorAll('#reqList .req-row');
  rows.forEach((row, index) => {
    const result = measure.reqs[index];
    if (!result) return;
    const meter = row.querySelector('.req-meter i');
    if (meter) meter.style.width = `${Math.round(result.score * 100)}%`;
    row.classList.toggle('is-done', result.score >= 0.72);
  });
}

let meterTimer = null;
function scheduleMeters(delay = 180) {
  clearTimeout(meterTimer);
  if (state.mode !== 'challenge') return;
  meterTimer = setTimeout(updateMeters, delay);
}

/* ------------------------------------------------------------------ */
/* Analysis and scoring                                                */
/* ------------------------------------------------------------------ */

const AW = 300;
const AH = Math.round((HEIGHT / WIDTH) * AW);
const analysisCanvases = {};
const maskSamples = {};
const MASK_PATHS = {
  face: geometry.face,
  lips: geometry.lips,
  eye: geometry.eye,
  shadow: geometry.shadow,
  cheeks: geometry.cheeks,
  highlight: geometry.highlight,
};
const ANALYSIS_STEP = 2;

function analysisCanvasForKey(key) {
  if (!analysisCanvases[key]) {
    const canvas = document.createElement('canvas');
    canvas.width = AW;
    canvas.height = AH;
    analysisCanvases[key] = canvas;
  }
  return analysisCanvases[key];
}

function getMaskSampleCount(clipKey) {
  if (maskSamples[clipKey] != null) return maskSamples[clipKey];
  const canvas = analysisCanvasForKey(`mask-${clipKey}`);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, AW, AH);
  ctx.save();
  ctx.scale(AW / WIDTH, AH / HEIGHT);
  ctx.fillStyle = '#fff';
  ctx.fill(MASK_PATHS[clipKey] || geometry.face);
  ctx.restore();
  const data = ctx.getImageData(0, 0, AW, AH).data;
  let count = 0;
  for (let y = 0; y < AH; y += ANALYSIS_STEP) {
    for (let x = 0; x < AW; x += ANALYSIS_STEP) {
      if (data[(y * AW + x) * 4 + 3] > 12) count += 1;
    }
  }
  maskSamples[clipKey] = Math.max(1, count);
  return maskSamples[clipKey];
}

function parseRgb(hex) {
  const raw = hex.replace('#', '');
  const value = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const num = parseInt(value, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function colorMatch(avg, target) {
  if (!avg) return 0;
  const wanted = parseRgb(target);
  const distance = Math.sqrt(
    (avg.r - wanted.r) ** 2 +
    (avg.g - wanted.g) ** 2 +
    (avg.b - wanted.b) ** 2
  );
  return clamp((168 - distance) / 118);
}

function analyzeRequirement(challenge, req) {
  const tool = TOOLS[req.tool];
  const layerId = tool.layer;
  const clipKey = Object.keys(MASK_PATHS).find((key) => MASK_PATHS[key] === LAYER_CLIP[layerId]) || 'face';
  const canvas = analysisCanvasForKey(layerId);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, AW, AH);
  ctx.drawImage(layers[layerId], 0, 0, AW, AH);
  const data = ctx.getImageData(0, 0, AW, AH).data;
  const total = getMaskSampleCount(clipKey);
  let filled = 0;
  let weight = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let y = 0; y < AH; y += ANALYSIS_STEP) {
    for (let x = 0; x < AW; x += ANALYSIS_STEP) {
      const alpha = data[(y * AW + x) * 4 + 3];
      if (alpha > 18) {
        filled += 1;
        weight += alpha;
        r += data[(y * AW + x) * 4] * alpha;
        g += data[(y * AW + x) * 4 + 1] * alpha;
        b += data[(y * AW + x) * 4 + 2] * alpha;
      }
    }
  }
  const coverage = filled / total;
  const avg = weight > 0 ? { r: r / weight, g: g / weight, b: b / weight } : null;
  const match = colorMatch(avg, req.color);
  const coverageScore = clamp(coverage / Math.max(0.01, req.minCoverage));
  return {
    coverage,
    match,
    score: clamp(0.52 * coverageScore + 0.48 * match),
  };
}

function measureChallenge(challenge) {
  const reqs = challenge.reqs.map((req) => analyzeRequirement(challenge, req));
  const overall = reqs.reduce((sum, req) => sum + req.score, 0) / Math.max(1, reqs.length);
  return { reqs, overall };
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function pointFromEvent(event) {
  const rect = interaction.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: ((event.clientX - rect.left) / rect.width) * WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
  };
}

function stamp(ctx, x, y, radius, color, alpha, softness) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const mid = 0.2 + softness * 0.55;
  gradient.addColorStop(0, rgba(color, alpha));
  gradient.addColorStop(mid, rgba(color, alpha * (0.55 + softness * 0.32)));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawFreckles(ctx, x, y, radius, color, alpha) {
  const count = 4 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius;
    const px = x + Math.cos(angle) * distance;
    const py = y + Math.sin(angle) * distance;
    const size = 0.9 + Math.random() * 1.8;
    ctx.fillStyle = rgba(color, alpha * (0.5 + Math.random() * 0.55));
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSegment(tool, ctx, from, to) {
  const radius = tool.brush * state.size;
  if (tool.id === 'freckles') {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / (radius * 0.45)));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      drawFreckles(ctx, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, radius * 0.52, state.color, tool.alpha * state.strength);
    }
    return;
  }
  const alpha = Math.min(0.95, tool.alpha * state.strength);
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const spacing = Math.max(1.5, radius * 0.18);
  const steps = Math.max(1, Math.ceil(distance / spacing));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    stamp(ctx, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, radius, state.color, alpha, tool.softness);
  }
}

function captureLayers(ids) {
  return ids.map((id) => ({ id, data: layers[id].toDataURL('image/png') }));
}

function pushHistory(ids) {
  state.history.push(captureLayers(ids));
  if (state.history.length > 16) state.history.shift();
  state.future = [];
  updateHistoryButtons();
}

function updateHistoryButtons() {
  $('undoBtn').disabled = state.history.length === 0;
  $('redoBtn').disabled = state.future.length === 0;
}

function restoreEntry(entry) {
  return Promise.all(entry.map((item) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const ctx = contexts[item.id];
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
      resolve();
    };
    image.onerror = () => resolve();
    image.src = item.data;
  })));
}

async function undo() {
  if (state.busy || !state.history.length) return;
  state.busy = true;
  const entry = state.history.pop();
  state.future.push(captureLayers(entry.map((item) => item.id)));
  await restoreEntry(entry);
  state.busy = false;
  updateHistoryButtons();
  updateMeters();
  sound.click();
}

async function redo() {
  if (state.busy || !state.future.length) return;
  state.busy = true;
  const entry = state.future.pop();
  state.history.push(captureLayers(entry.map((item) => item.id)));
  await restoreEntry(entry);
  state.busy = false;
  updateHistoryButtons();
  updateMeters();
  sound.click();
}

function beginStroke(event) {
  if (state.busy || state.drawing) return;
  const point = pointFromEvent(event);
  if (!point) return;
  state.drawing = true;
  state.pointerId = event.pointerId;
  state.lastPoint = point;
  const tool = TOOLS[state.tool];
  const targets = tool.layer ? [tool.layer] : PAINT_LAYERS;
  pushHistory(targets);

  state.prepared = [];
  for (const id of targets) {
    const ctx = contexts[id];
    const clipKey = tool.layer ? tool.clip : (Object.keys(MASK_PATHS).find((key) => MASK_PATHS[key] === LAYER_CLIP[id]) || 'face');
    ctx.save();
    ctx.beginPath();
    ctx.clip(MASK_PATHS[clipKey] || geometry.face);
    ctx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    state.prepared.push({ id, ctx });
  }

  interaction.setPointerCapture?.(event.pointerId);
  const hint = $('canvasHint');
  if (hint) hint.classList.add('is-hidden');
  for (const item of state.prepared) drawSegment(tool, item.ctx, point, point);
  sound.ensure();
  event.preventDefault();
}

function moveStroke(event) {
  if (!state.drawing || event.pointerId !== state.pointerId) return;
  const point = pointFromEvent(event);
  if (!point || !state.lastPoint) return;
  const tool = TOOLS[state.tool];
  for (const item of state.prepared) drawSegment(tool, item.ctx, state.lastPoint, point);
  state.lastPoint = point;
  event.preventDefault();
}

function endStroke(event) {
  if (!state.drawing || (event && event.pointerId !== state.pointerId)) return;
  state.drawing = false;
  state.pointerId = null;
  state.lastPoint = null;
  for (const item of state.prepared) {
    item.ctx.restore();
  }
  state.prepared = [];
  scheduleMeters(80);
  sound.swipe();
}

function clearPaint() {
  for (const id of PAINT_LAYERS) {
    contexts[id].clearRect(0, 0, WIDTH, HEIGHT);
  }
}

function clearMakeup({ record = true, silent = false } = {}) {
  if (record) pushHistory(PAINT_LAYERS);
  clearPaint();
  scheduleMeters(50);
  if (!silent) {
    showToast('Lienzo limpio. La piel sigue intacta.');
    sound.pop();
  }
}

/* ------------------------------------------------------------------ */
/* Random and preset makeup                                            */
/* ------------------------------------------------------------------ */

function paintSoftSpots(layerId, clip, spots) {
  const ctx = contexts[layerId];
  ctx.save();
  ctx.clip(clip);
  for (const spot of spots) {
    const gradient = ctx.createRadialGradient(spot.x, spot.y, spot.inner || 2, spot.x, spot.y, spot.r);
    gradient.addColorStop(0, rgba(spot.color, spot.alpha));
    gradient.addColorStop(0.55, rgba(spot.color, spot.alpha * 0.58));
    gradient.addColorStop(1, rgba(spot.color, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(spot.x - spot.r, spot.y - spot.r, spot.r * 2, spot.r * 2);
  }
  ctx.restore();
}

function applyLip(color) {
  const ctx = contexts.lipstick;
  ctx.save();
  ctx.clip(geometry.lips);
  const gradient = ctx.createLinearGradient(0, 710, 0, 830);
  gradient.addColorStop(0, rgba(shade(color, -20), 0.94));
  gradient.addColorStop(0.45, rgba(color, 0.96));
  gradient.addColorStop(1, rgba(shade(color, -28), 0.9));
  ctx.fillStyle = gradient;
  ctx.fillRect(340, 690, 220, 160);
  ctx.restore();
}

function applyShadow(color) {
  paintSoftSpots('eyeshadow', geometry.shadow, [
    { x: 343, y: 470, r: 96, color, alpha: 0.62 },
    { x: 557, y: 470, r: 96, color, alpha: 0.62 },
    { x: 343, y: 455, r: 50, color: shade(color, 34), alpha: 0.35 },
    { x: 557, y: 455, r: 50, color: shade(color, 34), alpha: 0.35 },
  ]);
}

function applyBlush(color) {
  paintSoftSpots('blush', geometry.cheeks, [
    { x: 293, y: 648, r: 100, color, alpha: 0.48 },
    { x: 607, y: 648, r: 100, color, alpha: 0.48 },
  ]);
}

function applyHighlight(color) {
  const ctx = contexts.highlight;
  const gradient = ctx.createLinearGradient(0, 300, 0, 880);
  gradient.addColorStop(0, rgba(color, 0.55));
  gradient.addColorStop(0.55, rgba(color, 0.42));
  gradient.addColorStop(1, rgba(color, 0.22));
  ctx.save();
  ctx.clip(geometry.highlight);
  ctx.fillStyle = gradient;
  ctx.fillRect(170, 250, 560, 660);
  ctx.restore();
}

function applyLiner(color, thickness = 6) {
  const ctx = contexts.eyeMakeup;
  ctx.save();
  ctx.clip(geometry.eye);
  ctx.strokeStyle = rgba(color, 0.92);
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(geometry.leftUpper);
  ctx.stroke(geometry.rightUpper);
  ctx.lineWidth = Math.max(2, thickness - 3);
  ctx.beginPath();
  ctx.moveTo(270, 497);
  ctx.lineTo(250, 481);
  ctx.moveTo(630, 497);
  ctx.lineTo(650, 481);
  ctx.stroke();
  ctx.restore();
}

function applyMascara(color) {
  const ctx = contexts.eyeMakeup;
  ctx.save();
  ctx.clip(geometry.eye);
  ctx.strokeStyle = rgba(color, 0.82);
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.stroke(geometry.leftUpper);
  ctx.stroke(geometry.rightUpper);
  ctx.restore();
}

function applyFreckles(color) {
  const ctx = contexts.underMakeup;
  ctx.save();
  ctx.clip(geometry.face);
  for (let i = 0; i < 36; i += 1) {
    const centerX = 448 + (Math.random() - 0.5) * 160;
    const centerY = 620 + (Math.random() - 0.5) * 40;
    const x = centerX + (Math.random() - 0.5) * 30;
    const y = centerY + (Math.random() - 0.5) * 22;
    ctx.fillStyle = rgba(color, 0.35 + Math.random() * 0.3);
    ctx.beginPath();
    ctx.arc(x, y, 0.9 + Math.random() * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function applyRequirement(req) {
  switch (req.tool) {
    case 'lipstick':
      applyLip(req.color);
      break;
    case 'gloss':
      paintSoftSpots('lipstick', geometry.lips, [
        { x: 414, y: 782, r: 26, color: '#fff9f4', alpha: 0.2 },
        { x: 486, y: 784, r: 24, color: req.color, alpha: 0.18 },
        { x: 450, y: 804, r: 40, color: '#fff9f4', alpha: 0.12 },
      ]);
      break;
    case 'eyeshadow':
      applyShadow(req.color);
      break;
    case 'eyeliner':
      applyLiner(req.color, 6);
      break;
    case 'mascara':
      applyMascara(req.color);
      break;
    case 'blush':
      applyBlush(req.color);
      break;
    case 'highlighter':
      applyHighlight(req.color);
      break;
    case 'freckles':
      applyFreckles(req.color);
      break;
    case 'foundation': {
      const ctx = contexts.underMakeup;
      ctx.save();
      ctx.clip(geometry.face);
      const gradient = ctx.createLinearGradient(0, 220, 0, 930);
      gradient.addColorStop(0, rgba(req.color, 0.2));
      gradient.addColorStop(1, rgba(req.color, 0.1));
      ctx.fillStyle = gradient;
      ctx.fillRect(180, 180, 540, 780);
      ctx.restore();
      break;
    }
    case 'contour':
      paintSoftSpots('underMakeup', geometry.face, [
        { x: 246, y: 620, r: 90, color: req.color, alpha: 0.16 },
        { x: 654, y: 620, r: 90, color: req.color, alpha: 0.16 },
        { x: 450, y: 900, r: 80, color: req.color, alpha: 0.1 },
      ]);
      break;
    default:
      break;
  }
}

function randomLook() {
  if (state.busy) return;
  pushHistory(PAINT_LAYERS);
  clearPaint();
  const challenge = currentChallenge();
  let reqs;
  if (challenge) {
    reqs = challenge.reqs.map((req) => ({ tool: req.tool, color: req.color }));
    if (Math.random() < 0.75) reqs.push({ tool: 'gloss', color: '#ffd9e6' });
    if (Math.random() < 0.55) reqs.push({ tool: 'freckles', color: '#a56a45' });
  } else {
    reqs = [
      { tool: 'lipstick', color: pick(PALETTES.lipstick).color },
      { tool: 'eyeshadow', color: pick(PALETTES.eyeshadow).color },
      { tool: 'blush', color: pick(PALETTES.blush).color },
      { tool: 'highlighter', color: pick(PALETTES.highlighter).color },
    ];
    if (Math.random() < 0.8) reqs.push({ tool: 'eyeliner', color: pick(PALETTES.eyeliner).color });
    if (Math.random() < 0.45) reqs.push({ tool: 'gloss', color: '#fff4ef' });
    if (Math.random() < 0.35) reqs.push({ tool: 'freckles', color: pick(PALETTES.freckles).color });
  }
  reqs.forEach(applyRequirement);
  selectTool(reqs[0].tool, { color: reqs[0].color });
  scheduleMeters(80);
  showToast(challenge ? 'Propuesta rápida aplicada. Ajústala a tu gusto.' : 'Look sorpresa aplicado ✦');
  sound.select();
  pulseStage();
}

function pulseStage() {
  const shell = $('faceShell');
  shell.animate(
    [
      { filter: 'brightness(1)' },
      { filter: 'brightness(1.14)' },
      { filter: 'brightness(1)' },
    ],
    { duration: 500, easing: 'ease-out' }
  );
}

/* ------------------------------------------------------------------ */
/* Save photo and confetti                                             */
/* ------------------------------------------------------------------ */

function savePhoto() {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = WIDTH;
  exportCanvas.height = HEIGHT + 100;
  const ctx = exportCanvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT + 100);
  bg.addColorStop(0, '#1c0913');
  bg.addColorStop(1, '#0f050a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT + 100);
  for (const id of LAYER_IDS) ctx.drawImage(layers[id], 0, 0);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, HEIGHT, WIDTH, 1);
  ctx.fillStyle = '#fff1ea';
  ctx.font = '500 32px Georgia, serif';
  ctx.fillText('Glam Studio', 42, HEIGHT + 58);
  const challenge = currentChallenge();
  ctx.fillStyle = '#f1c675';
  ctx.font = '600 17px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(challenge ? `Reto · ${challenge.title}` : 'Estudio libre', WIDTH - 42, HEIGHT + 56);
  ctx.fillStyle = 'rgba(255,244,238,0.52)';
  ctx.font = '500 13px Inter, system-ui, sans-serif';
  ctx.fillText('Tu look, tus reglas.', WIDTH - 42, HEIGHT + 78);
  ctx.textAlign = 'left';

  exportCanvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement('a');
    link.download = `glam-studio-${Date.now()}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    showToast('Foto guardada en tu dispositivo ✦');
    sound.pop();
  }, 'image/png');
}

const confettiCanvas = $('confetti');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiFrame = null;

function resizeConfetti() {
  const rect = confettiCanvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (!rect.width || !rect.height) return;
  confettiCanvas.width = Math.round(rect.width * dpr);
  confettiCanvas.height = Math.round(rect.height * dpr);
  confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function burstConfetti(power = 1) {
  resizeConfetti();
  const rect = confettiCanvas.getBoundingClientRect();
  const colors = ['#f1c675', '#ff7b9c', '#ffd8b5', '#b997ff', '#8fe5cf', '#fff4ee'];
  const count = Math.round(70 * power);
  for (let i = 0; i < count; i += 1) {
    confettiParticles.push({
      x: rect.width * (0.2 + Math.random() * 0.6),
      y: rect.height * (0.22 + Math.random() * 0.2),
      vx: (Math.random() - 0.5) * 6.5,
      vy: -2.5 - Math.random() * 5.5,
      size: 3 + Math.random() * 6,
      color: pick(colors),
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.22,
      life: 0,
      maxLife: 90 + Math.random() * 60,
      shape: Math.random() < 0.35 ? 'circle' : 'rect',
    });
  }
  if (!confettiFrame) confettiFrame = requestAnimationFrame(stepConfetti);
}

function stepConfetti() {
  const rect = confettiCanvas.getBoundingClientRect();
  confettiCtx.clearRect(0, 0, rect.width, rect.height);
  const alive = [];
  for (const particle of confettiParticles) {
    particle.life += 1;
    particle.vy += 0.14;
    particle.vx *= 0.995;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.spin;
    const fade = clamp(1 - particle.life / particle.maxLife);
    if (fade <= 0 || particle.y > rect.height + 30) continue;
    alive.push(particle);
    confettiCtx.save();
    confettiCtx.globalAlpha = fade;
    confettiCtx.translate(particle.x, particle.y);
    confettiCtx.rotate(particle.rotation);
    confettiCtx.fillStyle = particle.color;
    if (particle.shape === 'circle') {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    } else {
      confettiCtx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
    }
    confettiCtx.restore();
  }
  confettiParticles = alive;
  if (confettiParticles.length) {
    confettiFrame = requestAnimationFrame(stepConfetti);
  } else {
    confettiFrame = null;
    confettiCtx.clearRect(0, 0, rect.width, rect.height);
  }
}

/* ------------------------------------------------------------------ */
/* Presenting a look                                                   */
/* ------------------------------------------------------------------ */

function starsFor(overall) {
  if (overall >= 0.84) return 3;
  if (overall >= 0.62) return 2;
  if (overall >= 0.36) return 1;
  return 0;
}

const STAR_COPY = {
  3: { title: 'Impecable', feedback: 'Es exactamente lo que imaginaba. ¡Te has superado!', badge: '✦' },
  2: { title: 'Muy bonito', feedback: 'Me encanta cómo ha quedado. Solo un detalle más y sería perfecto.', badge: '✧' },
  1: { title: 'Buen comienzo', feedback: 'Voy por buen camino, pero quiero acercarme un poco más al brief.', badge: '◇' },
  0: { title: 'Casi, casi', feedback: 'Todavía no reconozco el look que te pedí. Prueba con las pistas de color.', badge: '·' },
};

function presentLook() {
  const challenge = currentChallenge();
  if (!challenge) return;
  const measure = measureChallenge(challenge);
  const stars = starsFor(measure.overall);
  const previous = state.progress[challenge.id]?.stars || 0;
  const isNew = !state.progress[challenge.id];
  const improvement = Math.max(0, stars - previous);
  const coins = stars === 0 ? 0 : stars * 10 + improvement * 15 + (isNew ? 20 : 0);
  state.coins += coins;
  state.progress[challenge.id] = {
    stars: Math.max(previous, stars),
    best: Math.max(state.progress[challenge.id]?.best || 0, Math.round(measure.overall * 100)),
  };
  saveState();
  updateStats();
  renderChallengeGrid();
  renderClientCard();
  updateMeters();

  const copy = STAR_COPY[stars];
  const percent = Math.round(measure.overall * 100);
  const nextChallenge = CHALLENGES[(CHALLENGES.findIndex((item) => item.id === challenge.id) + 1) % CHALLENGES.length];
  const allDone = completedChallenges() === CHALLENGES.length;

  $('resultContent').innerHTML = `
    <div class="result-badge" style="animation: starBurst 0.6s cubic-bezier(0.2,1.5,0.4,1) both">${copy.badge}</div>
    <p class="result-kicker">${allDone ? '¡Colección completa!' : `Reto de ${challenge.client}`}</p>
    <h2 class="result-title" id="resultTitle">${copy.title}</h2>
    <p class="result-quote">“${copy.feedback}”</p>
    <div class="result-stars" aria-label="${stars} de 3 estrellas">
      ${[1, 2, 3].map((n) => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('')}
    </div>
    <div class="result-score">Coincidencia con el brief <b>${percent}%</b></div>
    <div class="coin-reward">${coins > 0 ? `<span>G</span> +${coins} monedas de glamour` : '<span>✦</span> Sin monedas esta vez: ¡inténtalo de nuevo!'}</div>
    <div class="result-actions">
      <button class="btn-primary" data-result="next">${allDone ? 'Ver mi colección' : `Siguiente: ${nextChallenge.client}`}</button>
      <button class="btn-ghost" data-result="edit">Seguir editando</button>
      <button class="btn-ghost" data-result="retry">Reintentar</button>
    </div>
    <p class="result-mini"><span>✦</span> ${allDone ? 'Has completado los 6 retos del salón.' : `${completedChallenges()} de ${CHALLENGES.length} retos completados`}</p>
  `;

  openModal('resultModal');
  if (stars >= 2) {
    burstConfetti(stars === 3 ? 1.3 : 0.8);
    sound.success(stars);
  } else {
    sound.softFail();
  }
}

function handleResultAction(action) {
  if (action === 'edit') {
    closeModal('resultModal');
    return;
  }
  if (action === 'retry') {
    closeModal('resultModal');
    clearMakeup({ record: true, silent: true });
    showToast('Lienzo limpio. ¡Ahora sí!');
    return;
  }
  if (action === 'next') {
    const challenge = currentChallenge();
    const index = CHALLENGES.findIndex((item) => item.id === challenge?.id);
    if (completedChallenges() === CHALLENGES.length) {
      closeModal('resultModal');
      renderChallengeGrid();
      openModal('challengeModal');
      burstConfetti(1);
      return;
    }
    const next = CHALLENGES[(index + 1) % CHALLENGES.length];
    closeModal('resultModal');
    selectChallenge(next.id);
  }
}

/* ------------------------------------------------------------------ */
/* Mode switching                                                      */
/* ------------------------------------------------------------------ */

function updateModeUI() {
  const challenge = currentChallenge();
  if (challenge) {
    $('lookLabel').textContent = `${challenge.title} · ${challenge.client}`;
    $('presentBtn').hidden = false;
    $('presentBtn').textContent = 'Presentar look';
  } else {
    $('lookLabel').textContent = 'Estudio libre';
    $('presentBtn').hidden = true;
  }
  renderClientCard();
  updateStats();
}

function selectChallenge(id) {
  const challenge = CHALLENGES.find((item) => item.id === id);
  if (!challenge) return;
  state.mode = 'challenge';
  state.challengeId = id;
  state.model = { ...challenge.model };
  clearPaint();
  state.history = [];
  state.future = [];
  updateHistoryButtons();
  renderStatic();
  renderModelOptions();
  const firstReq = challenge.reqs[0];
  selectTool(firstReq.tool, { color: firstReq.color });
  updateModeUI();
  updateMeters();
  setMobileView('client');
  enterStudio();
  showToast(`Nuevo reto: ${challenge.title} con ${challenge.client}`);
  sound.select();
}

function setFreeMode({ clear = false } = {}) {
  state.mode = 'free';
  state.challengeId = null;
  if (clear) {
    clearPaint();
    state.history = [];
    state.future = [];
    updateHistoryButtons();
  }
  updateModeUI();
  setMobileView('kit');
  enterStudio();
}

function setMobileView(view) {
  const studio = $('studio');
  studio.dataset.mobileView = view;
  document.querySelectorAll('.mobile-tab').forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

/* ------------------------------------------------------------------ */
/* Menu and reset                                                      */
/* ------------------------------------------------------------------ */

function resetProgress() {
  const confirmed = window.confirm('¿Borrar todas las estrellas, monedas y retos guardados?');
  if (!confirmed) return;
  state.progress = {};
  state.coins = 0;
  saveState();
  updateStats();
  renderChallengeGrid();
  updateModeUI();
  closeModal('menuModal');
  showToast('Progreso borrado. Empieza de cero ✦');
}

function handleMenu(action) {
  closeModal('menuModal');
  if (action === 'challenges') {
    renderChallengeGrid();
    openModal('challengeModal');
  } else if (action === 'how') {
    openModal('howModal');
  } else if (action === 'free') {
    setFreeMode();
    enterStudio();
  } else if (action === 'landing') {
    showLanding();
  } else if (action === 'reset') {
    resetProgress();
  }
}

/* ------------------------------------------------------------------ */
/* Event wiring                                                        */
/* ------------------------------------------------------------------ */

function bindEvents() {
  $('playBtn').addEventListener('click', () => {
    sound.ensure();
    sound.pop();
    setFreeMode();
    enterStudio();
  });

  $('landingChallengesBtn').addEventListener('click', () => {
    sound.ensure();
    sound.select();
    enterStudio();
    const first = CHALLENGES.find((challenge) => !(state.progress[challenge.id]?.stars > 0)) || CHALLENGES[0];
    selectChallenge(first.id);
  });

  $('howBtn').addEventListener('click', () => openModal('howModal'));
  $('homeBtn').addEventListener('click', showLanding);
  $('menuBtn').addEventListener('click', () => openModal('menuModal'));

  $('soundBtn').addEventListener('click', toggleSound);
  $('soundStageBtn').addEventListener('click', toggleSound);

  $('toolTabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    const category = TOOL_CATEGORIES.find((item) => item.id === state.category);
    renderToolTabs();
    renderToolGrid();
    if (category?.tools[0]) selectTool(category.tools[0]);
    sound.click();
  });

  $('toolGrid').addEventListener('click', (event) => {
    const button = event.target.closest('[data-tool]');
    if (!button) return;
    selectTool(button.dataset.tool);
    sound.select();
  });

  $('swatches').addEventListener('click', (event) => {
    const button = event.target.closest('[data-color]');
    if (!button) return;
    setColor(button.dataset.color);
    sound.click();
  });

  $('sizeRange').addEventListener('input', (event) => {
    state.size = Number(event.target.value);
    updateToolReadout();
  });

  $('strengthRange').addEventListener('input', (event) => {
    state.strength = Number(event.target.value);
  });

  interaction.addEventListener('pointerdown', beginStroke);
  interaction.addEventListener('pointermove', moveStroke);
  interaction.addEventListener('pointerup', endStroke);
  interaction.addEventListener('pointercancel', endStroke);
  interaction.addEventListener('contextmenu', (event) => event.preventDefault());

  $('undoBtn').addEventListener('click', undo);
  $('redoBtn').addEventListener('click', redo);
  $('clearBtn').addEventListener('click', () => clearMakeup());
  $('randomBtn').addEventListener('click', randomLook);
  $('randomBtn2').addEventListener('click', randomLook);
  $('saveBtn').addEventListener('click', savePhoto);
  $('presentBtn').addEventListener('click', presentLook);
  $('galleryBtn').addEventListener('click', () => {
    renderChallengeGrid();
    openModal('challengeModal');
  });

  $('modelBtn').addEventListener('click', () => {
    renderModelOptions();
    openModal('modelModal');
  });

  $('clientCard').addEventListener('click', (event) => {
    const req = event.target.closest('[data-req-tool]');
    if (req) {
      selectTool(req.dataset.reqTool, { color: req.dataset.reqColor });
      showToast(`${TOOLS[req.dataset.reqTool].name}: tono exacto seleccionado`);
      sound.click();
      return;
    }
    if (event.target.closest('[data-open-gallery]')) {
      renderChallengeGrid();
      openModal('challengeModal');
    }
  });

  $('challengeGrid').addEventListener('click', (event) => {
    const tile = event.target.closest('[data-challenge]');
    if (!tile) return;
    closeModal('challengeModal');
    selectChallenge(tile.dataset.challenge);
  });

  $('skinSwatches').addEventListener('click', (event) => {
    const button = event.target.closest('[data-skin]');
    if (!button) return;
    state.model.skin = button.dataset.skin;
    if (state.tool === 'foundation') state.color = state.model.skin;
    renderStatic();
    renderModelOptions();
    renderSwatches();
    saveState();
    sound.click();
  });

  $('hairSwatches').addEventListener('click', (event) => {
    const button = event.target.closest('[data-hair]');
    if (!button) return;
    state.model.hair = button.dataset.hair;
    renderStatic();
    renderModelOptions();
    saveState();
    sound.click();
  });

  $('eyeSwatches').addEventListener('click', (event) => {
    const button = event.target.closest('[data-eye]');
    if (!button) return;
    state.model.eye = button.dataset.eye;
    renderStatic();
    renderModelOptions();
    saveState();
    sound.click();
  });

  $('styleOptions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-style]');
    if (!button) return;
    state.model.style = button.dataset.style;
    renderStatic();
    renderModelOptions();
    saveState();
    sound.click();
  });

  $('backdropOptions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-backdrop]');
    if (!button) return;
    state.model.backdrop = button.dataset.backdrop;
    renderStatic();
    renderModelOptions();
    saveState();
    sound.click();
  });

  $('resultContent').addEventListener('click', (event) => {
    const button = event.target.closest('[data-result]');
    if (button) handleResultAction(button.dataset.result);
  });

  $('mobileTabs').addEventListener('click', (event) => {
    const tab = event.target.closest('[data-view]');
    if (!tab) return;
    setMobileView(tab.dataset.view);
    sound.click();
  });

  document.querySelectorAll('[data-close]').forEach((element) => {
    element.addEventListener('click', () => closeModal(element.dataset.close));
  });

  $('menuModal').addEventListener('click', (event) => {
    const item = event.target.closest('[data-menu]');
    if (item) handleMenu(item.dataset.menu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllModals();
      return;
    }
    if (state.drawing || document.querySelector('.modal.is-open')) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    }
  });

  window.addEventListener('resize', () => {
    resizeConfetti();
  });
}

/* ------------------------------------------------------------------ */
/* Initialization                                                      */
/* ------------------------------------------------------------------ */

function init() {
  renderStatic();
  renderToolTabs();
  renderToolGrid();
  renderSwatches();
  updateToolReadout();
  renderModelOptions();
  renderChallengeGrid();
  updateModeUI();
  updateStats();
  updateSoundUI();
  updateHistoryButtons();
  renderHero();
  bindEvents();
  requestAnimationFrame(resizeConfetti);

  const savedColor = PALETTES.lipstick.find((entry) => entry.color === state.color);
  if (!savedColor) state.color = DEFAULT_COLORS.lipstick;
  // Keep the initial face clean even if a previous model was restored.
  clearPaint();
  state.history = [];
  state.future = [];
  updateHistoryButtons();

  window.__glam = {
    state,
    selectTool,
    selectChallenge,
    randomLook,
    clearMakeup,
    presentLook,
    setFreeMode,
    measureCurrent: () => {
      const challenge = currentChallenge();
      return challenge ? measureChallenge(challenge) : null;
    },
    applyRequirement,
  };
}

init();
