/* Maison Miroir — interaction, UI and game flow */
import {
  W, H, SKINS, HAIRS, EYES, BLUSHES, SHADOWS, LIPS, LINERS, BROWS,
  BRUSH_COLORS, AURAS, PRESETS, CLIENTS, ROUND_TIME,
  emptyLook, studioLook, presetLook, normalizeLook,
  shadowOf, lipOf, blushOf
} from './data.js';
import { createFaceRenderer, isOnFace } from './face.js';

const $ = id => document.getElementById(id);
const LOOK_KEY = 'mm.look.v1';
const BEST_KEY = 'mm.best.v1';
const MUTE_KEY = 'mm.muted.v1';

const canvas = $('faceCanvas');
const paintCanvas = document.createElement('canvas');
const renderer = createFaceRenderer(canvas, paintCanvas);

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}

const savedLook = loadJSON(LOOK_KEY);
let look = savedLook ? normalizeLook(savedLook) : studioLook();
let history = [];
let mode = 'free';
let modalClosable = false;
let saveTimer = null;
let toastTimer = null;
let activeStroke = null;

const ui = {
  tab: 'skin',
  sticker: 'gem',
  brushColor: '#b04463',
  brushMode: 'draw',
  brushSize: 8,
  brushOpacity: 80,
  muted: !!loadJSON(MUTE_KEY)
};

const game = {
  round: 0,
  score: 0,
  stars: [],
  timeLeft: ROUND_TIME,
  timerId: null,
  started: false,
  awaitingNext: false,
  finished: false
};

/* ---------------- sound ---------------- */

let audioCtx = null;
function ensureAudio() {
  if (ui.muted) return null;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch { return null; }
}
function tone(freq, delay, duration, type = 'sine', volume = .04) {
  const ac = ensureAudio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + .03);
}
function playTap() {
  tone(680, 0, .055, 'sine', .025);
}
function playApply() {
  tone(520, 0, .07, 'sine', .02);
  tone(780, .045, .08, 'sine', .018);
}
function playSuccess(level = 3) {
  const notes = level >= 3 ? [523, 659, 784, 1047] : level === 2 ? [523, 659, 784] : [392, 523];
  notes.forEach((n, i) => tone(n, i * .09, .28, 'sine', .035));
}
function playMiss() {
  tone(300, 0, .12, 'triangle', .022);
  tone(250, .1, .16, 'triangle', .018);
}

/* ---------------- swatch / UI construction ---------------- */

const SWATCH_SETS = {
  skin: SKINS.map(item => ({ id: item.id, hex: item.base, name: item.name })),
  blush: BLUSHES.map(item => ({ id: item.id, hex: item.hex, name: item.name })),
  shadow: SHADOWS.map(item => ({ id: item.id, hex: item.hex, name: item.name })),
  lips: LIPS.map(item => ({ id: item.id, hex: item.hex, name: item.name })),
  hairColor: HAIRS.map(item => ({ id: item.id, hex: item.base, name: item.name })),
  eyeColor: EYES.map(item => ({ id: item.id, hex: item.base, name: item.name })),
  linerColor: LINERS.map(item => ({ id: item.id, hex: item.hex, name: item.name })),
  browColor: BROWS.map(item => ({ id: item.id, hex: item.hex, name: item.name })),
  brushColor: BRUSH_COLORS.map((hex, i) => ({ id: hex, hex, name: `Color ${i + 1}` }))
};

function buildSwatches() {
  document.querySelectorAll('[data-swatches]').forEach(container => {
    const key = container.dataset.swatches;
    if (key === 'aura') {
      AURAS.forEach(aura => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'aura-swatch';
        button.dataset.action = 'set-aura';
        button.dataset.id = aura.id;
        button.setAttribute('aria-label', `Atmósfera ${aura.name}`);
        button.title = aura.name;
        button.style.setProperty('--c', `linear-gradient(155deg, ${aura.top}, ${aura.mid} 54%, ${aura.bottom})`);
        container.appendChild(button);
      });
      return;
    }
    const items = SWATCH_SETS[key] || [];
    items.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch';
      button.dataset.id = item.id;
      button.dataset.action = `set-${key}`;
      button.dataset.swatchKey = key;
      button.style.setProperty('--c', item.hex);
      button.setAttribute('aria-label', item.name);
      button.title = item.name;
      container.appendChild(button);
    });
  });
}

function buildPresetRow() {
  const row = $('presetRow');
  Object.entries(PRESETS).forEach(([key, preset]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-chip';
    button.dataset.preset = key;
    button.textContent = preset.label;
    row.appendChild(button);
  });
}

/* ---------------- look changes ---------------- */

function cloneLook() {
  return typeof structuredClone === 'function'
    ? structuredClone(look)
    : JSON.parse(JSON.stringify(look));
}

function pushHistory() {
  history.push(cloneLook());
  if (history.length > 45) history.shift();
}

function scheduleSave() {
  if (mode !== 'free') return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveJSON(LOOK_KEY, look), 250);
}

let rafId = null;
function requestRender() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    renderer.render(look);
  });
}

function afterChange({ save = true, play = false } = {}) {
  if (save) scheduleSave();
  syncUI();
  requestRender();
  if (play) playApply();
}

function commit(mutator, { play = true } = {}) {
  pushHistory();
  mutator();
  afterChange({ play });
}

function undo() {
  if (!history.length) return;
  look = history.pop();
  afterChange({ save: true });
  playTap();
}

function cleanFace() {
  pushHistory();
  look = normalizeLook({
    ...emptyLook(),
    skin: look.skin,
    hairColor: look.hairColor,
    hairstyle: look.hairstyle,
    eyeColor: look.eyeColor,
    aura: look.aura,
    earrings: look.earrings,
    necklace: look.necklace
  });
  afterChange({ play: true });
  showToast('Rostro limpio, lista para empezar ✦');
}

const RANDOM_LINERS = ['none', 'soft', 'wing', 'bold'];
const RANDOM_FINISHES = ['matte', 'satin', 'gloss'];
const RANDOM_SHADOW_FINISHES = ['matte', 'satin', 'glitter'];
const RANDOM_STYLES = ['loose', 'updo', 'bob'];
const RANDOM_EARRINGS = ['none', 'hoops', 'pearl', 'drop'];
const RANDOM_NECKLACES = ['none', 'none', 'chain', 'pearls'];
const pick = list => list[Math.floor(Math.random() * list.length)];

function randomLook() {
  pushHistory();
  look = normalizeLook({
    ...look,
    skin: pick(SKINS).id,
    hairColor: pick(HAIRS).id,
    hairstyle: pick(RANDOM_STYLES),
    eyeColor: pick(EYES).id,
    blushColor: pick(BLUSHES).id,
    blushIntensity: .2 + Math.random() * .5,
    contour: .1 + Math.random() * .5,
    highlight: .28 + Math.random() * .5,
    freckles: Math.random() < .24,
    mole: Math.random() < .16,
    shadowColor: pick(SHADOWS).id,
    shadowIntensity: .34 + Math.random() * .62,
    shadowFinish: pick(RANDOM_SHADOW_FINISHES),
    liner: pick(RANDOM_LINERS),
    linerColor: pick(LINERS).id,
    lashes: pick(['natural', 'natural', 'glam']),
    brows: pick(['natural', 'arched', 'straight']),
    browColor: pick(BROWS).id,
    lips: pick(LIPS).id,
    lipIntensity: .46 + Math.random() * .5,
    lipFinish: pick(RANDOM_FINISHES),
    lipLiner: Math.random() < .35,
    glitter: Math.random() < .28,
    earrings: pick(RANDOM_EARRINGS),
    necklace: pick(RANDOM_NECKLACES),
    aura: pick(AURAS).id,
    stickers: Math.random() < .22 ? [
      { type: 'star', x: 345 + Math.random() * 20, y: 390 + Math.random() * 30, scale: .7, rot: Math.random() - .5 },
      { type: 'gem', x: 545 + Math.random() * 20, y: 400 + Math.random() * 30, scale: .7, rot: Math.random() - .5 }
    ] : [],
    strokes: []
  });
  afterChange({ play: true });
  showToast('Look sorpresa ✦');
}

function applyPreset(name) {
  if (!PRESETS[name]) return;
  pushHistory();
  look = presetLook(name);
  afterChange({ play: true });
  showToast(`Look «${PRESETS[name].label}» aplicado`);
}

/* ---------------- UI sync ---------------- */

const FINISH_LABELS = { matte: 'Mate', satin: 'Satín', gloss: 'Brillo' };
const LINER_LABELS = { none: 'Sin delinear', soft: 'Suave', wing: 'Alas', bold: 'Intenso' };
const BROW_LABELS = { natural: 'Naturales', arched: 'Arqueadas', straight: 'Rectas' };
const HAIR_LABELS = { loose: 'Suelto', updo: 'Recogido', bob: 'Bob' };
const BRUSH_LABELS = { draw: 'Trazo', glitter: 'Glitter', erase: 'Borrar' };
const STICKER_LABELS = { gem: 'una gema', star: 'una estrella', heart: 'un corazón', flower: 'una flor', pearl: 'una perla' };

function setLabel(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function setRangeVisual(id, percent) {
  const el = $(id);
  if (!el) return;
  el.value = String(percent);
  el.style.setProperty('--p', `${percent}%`);
}

function syncUI() {
  // Tabs
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('is-active', tab.dataset.tab === ui.tab));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.toggle('is-active', pane.dataset.pane === ui.tab));

  // Mode chrome
  const inChallenge = mode === 'challenge';
  setLabel('modeKicker', inChallenge ? `CLIENTA ${game.round + 1} DE ${CLIENTS.length}` : 'ESTUDIO LIBRE');
  setLabel('modeTitle', inChallenge ? 'El encargo' : 'Tu lienzo');
  $('freeIntro').classList.toggle('hidden', inChallenge);
  $('clientCard').classList.toggle('hidden', !inChallenge);
  $('hud').classList.toggle('hidden', !inChallenge || !game.started);
  setLabel('presentLabel', inChallenge ? 'Presentar look' : 'Guardar foto');
  setLabel('hudRound', `Reto ${Math.min(game.round + 1, CLIENTS.length)} / ${CLIENTS.length}`);
  setLabel('hudScore', `${game.score} pts`);
  renderRoundDots();

  // Swatches
  const swatchValues = {
    skin: look.skin,
    blush: look.blushColor,
    shadow: look.shadowColor,
    lips: look.lips,
    hairColor: look.hairColor,
    eyeColor: look.eyeColor,
    linerColor: look.linerColor,
    browColor: look.browColor,
    brushColor: ui.brushColor
  };
  document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.classList.toggle('is-active', swatchValues[swatch.dataset.swatchKey] === swatch.dataset.id);
  });
  document.querySelectorAll('.aura-swatch').forEach(swatch => swatch.classList.toggle('is-active', swatch.dataset.id === look.aura));

  // Segmented controls
  const segments = {
    shadowFinish: look.shadowFinish,
    liner: look.liner,
    lashes: look.lashes,
    brows: look.brows,
    lipFinish: look.lipFinish,
    hairstyle: look.hairstyle,
    earrings: look.earrings,
    necklace: look.necklace,
    brushMode: ui.brushMode
  };
  document.querySelectorAll('[data-segment]').forEach(segment => {
    const value = segments[segment.dataset.segment];
    segment.querySelectorAll('button').forEach(button => button.classList.toggle('is-active', button.dataset.id === value));
  });

  // Toggles
  const setToggle = (id, on) => {
    const el = $(id);
    if (!el) return;
    el.classList.toggle('is-on', !!on);
    el.setAttribute('aria-pressed', String(!!on));
  };
  setToggle('frecklesToggle', look.freckles);
  setToggle('moleToggle', look.mole);
  setToggle('moleToggle2', look.mole);
  setToggle('lipLinerToggle', look.lipLiner);
  setToggle('glitterToggle', look.glitter);

  // Sliders + values
  const blushPct = Math.round(look.blushIntensity * 100);
  const contourPct = Math.round(look.contour * 100);
  const highlightPct = Math.round(look.highlight * 100);
  const shadowPct = Math.round(look.shadowIntensity * 100);
  const lipPct = Math.round(look.lipIntensity * 100);
  setRangeVisual('blushRange', blushPct);
  setRangeVisual('contourRange', contourPct);
  setRangeVisual('highlightRange', highlightPct);
  setRangeVisual('shadowRange', shadowPct);
  setRangeVisual('lipRange', lipPct);
  setRangeVisual('brushSizeRange', ui.brushSize);
  setRangeVisual('brushOpacityRange', ui.brushOpacity);
  setLabel('blushVal', `${blushPct}%`);
  setLabel('contourVal', `${contourPct}%`);
  setLabel('highlightVal', `${highlightPct}%`);
  setLabel('shadowName', shadowOf(look).name);
  setLabel('lipName', lipOf(look).name);
  setLabel('lipFinishName', FINISH_LABELS[look.lipFinish]);
  setLabel('linerName', LINER_LABELS[look.liner]);
  setLabel('browName', BROW_LABELS[look.brows]);
  setLabel('hairStyleName', HAIR_LABELS[look.hairstyle]);
  setLabel('brushModeName', BRUSH_LABELS[ui.brushMode]);
  setLabel('brushSizeVal', `${ui.brushSize} px`);
  setLabel('brushOpacityVal', `${ui.brushOpacity}%`);

  // Sticker picker
  document.querySelectorAll('.sticker-btn').forEach(button => button.classList.toggle('is-active', button.dataset.id === ui.sticker));

  // Brush preview
  const preview = $('brushPreview');
  if (preview) {
    preview.style.setProperty('--brush', ui.brushMode === 'erase' ? 'rgba(255,255,255,.14)' : ui.brushColor);
    const size = Math.max(18, Math.min(42, ui.brushSize + 12));
    preview.style.width = `${size}px`;
    preview.style.height = `${size}px`;
  }

  // Buttons / captions
  $('undoBtn').disabled = history.length === 0;
  const paintTab = ui.tab === 'brush';
  const stickerTab = ui.tab === 'details';
  canvas.classList.toggle('can-paint', paintTab);
  canvas.classList.toggle('can-sticker', stickerTab);
  const caption = $('mirrorCaption');
  if (paintTab) {
    caption.textContent = ui.brushMode === 'erase'
      ? 'Arrastra sobre el rostro para borrar el trazo'
      : ui.brushMode === 'glitter'
        ? 'Arrastra para dibujar con destellos'
        : 'Arrastra sobre el rostro para pintar';
  } else if (stickerTab) {
    caption.textContent = ui.sticker === 'erase'
      ? 'Toca una pegatina para quitarla'
      : 'Toca la cara para colocar el detalle';
  }
  caption.classList.toggle('is-visible', paintTab || stickerTab);

  updateChecklist();
  updateSoundButton();
}

function renderRoundDots() {
  const wrap = $('roundDots');
  wrap.innerHTML = '';
  wrap.classList.toggle('hidden', mode !== 'challenge');
  if (mode !== 'challenge') return;
  for (let i = 0; i < CLIENTS.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'round-dot';
    if (game.stars[i] > 0) dot.classList.add('is-done');
    if (i === game.round && !game.finished) dot.classList.add('is-active');
    wrap.appendChild(dot);
  }
}

function renderChecklist() {
  const list = $('checklist');
  list.innerHTML = '';
  if (mode !== 'challenge') return;
  const client = CLIENTS[game.round];
  client.reqs.forEach((req, index) => {
    const chip = document.createElement('span');
    chip.className = 'check';
    chip.dataset.index = String(index);
    chip.textContent = req.label;
    list.appendChild(chip);
  });
}

function updateChecklist() {
  if (mode !== 'challenge') return;
  const client = CLIENTS[game.round];
  if (!client) return;
  document.querySelectorAll('#checklist .check').forEach(chip => {
    const req = client.reqs[Number(chip.dataset.index)];
    if (req) chip.classList.toggle('is-ok', !!req.test(look));
  });
}

/* ---------------- tabs + panel handlers ---------------- */

function setTab(tab) {
  if (ui.tab === tab) return;
  ui.tab = tab;
  syncUI();
  const body = $('panelBody');
  if (body) body.scrollTop = 0;
  playTap();
}

function handlePanelClick(event) {
  const tabButton = event.target.closest('[data-tab]');
  if (tabButton) { setTab(tabButton.dataset.tab); return; }
  const jump = event.target.closest('[data-tab-jump]');
  if (jump) { setTab(jump.dataset.tabJump); return; }
  const preset = event.target.closest('[data-preset]');
  if (preset) { applyPreset(preset.dataset.preset); return; }

  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  switch (button.dataset.action) {
    case 'toggle-freckles': commit(() => { look.freckles = !look.freckles; }); break;
    case 'toggle-mole': commit(() => { look.mole = !look.mole; }); break;
    case 'toggle-lipLiner': commit(() => { look.lipLiner = !look.lipLiner; }); break;
    case 'toggle-glitter': commit(() => { look.glitter = !look.glitter; }); break;
    case 'set-skin': commit(() => { look.skin = id; }); break;
    case 'set-blush': commit(() => { look.blushColor = id; }); break;
    case 'set-shadow': commit(() => { look.shadowColor = id; }); break;
    case 'set-lips': commit(() => { look.lips = id; }); break;
    case 'set-hairColor': commit(() => { look.hairColor = id; }); break;
    case 'set-eyeColor': commit(() => { look.eyeColor = id; }); break;
    case 'set-linerColor': commit(() => { look.linerColor = id; }); break;
    case 'set-browColor': commit(() => { look.browColor = id; }); break;
    case 'set-shadowFinish': commit(() => { look.shadowFinish = id; }); break;
    case 'set-liner': commit(() => { look.liner = id; }); break;
    case 'set-lashes': commit(() => { look.lashes = id; }); break;
    case 'set-brows': commit(() => { look.brows = id; }); break;
    case 'set-lipFinish': commit(() => { look.lipFinish = id; }); break;
    case 'set-hairstyle': commit(() => { look.hairstyle = id; }); break;
    case 'set-earrings': commit(() => { look.earrings = id; }); break;
    case 'set-necklace': commit(() => { look.necklace = id; }); break;
    case 'set-aura': commit(() => { look.aura = id; }); break;
    case 'set-sticker':
      ui.sticker = id;
      syncUI();
      if (id === 'erase') showToast('Toca una pegatina para quitarla');
      else showToast(`Toca la cara para colocar ${STICKER_LABELS[id] || 'el detalle'}`);
      playTap();
      break;
    case 'set-brushColor':
      ui.brushColor = id;
      syncUI();
      playTap();
      break;
    case 'set-brushMode':
      ui.brushMode = id;
      syncUI();
      playTap();
      break;
    case 'undo-stroke':
      if (look.strokes.length) {
        pushHistory();
        look.strokes.pop();
        afterChange({ play: true });
      } else {
        showToast('No hay trazos que deshacer');
      }
      break;
    case 'clear-strokes':
      if (look.strokes.length) {
        pushHistory();
        look.strokes = [];
        afterChange({ play: true });
        showToast('Pincel limpio');
      } else {
        showToast('El pincel ya está limpio');
      }
      break;
  }
}

function handleSliderInput(event) {
  const slider = event.target.closest('input[type="range"]');
  if (!slider) return;
  const key = slider.dataset.slider;
  const value = Number(slider.value);
  if (key === 'brushSize') {
    ui.brushSize = value;
    syncUI();
    return;
  }
  if (key === 'brushOpacity') {
    ui.brushOpacity = value;
    syncUI();
    return;
  }
  if (key in look) {
    look[key] = value / 100;
    syncUI();
    requestRender();
    scheduleSave();
  }
}

function handleRangeStart(event) {
  const slider = event.target.closest('input[type="range"]');
  if (!slider) return;
  if (slider.dataset.slider === 'brushSize' || slider.dataset.slider === 'brushOpacity') return;
  pushHistory();
}

/* ---------------- canvas interaction ---------------- */

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H
  };
}

function beginStroke(event) {
  if (ui.tab !== 'brush') return false;
  event.preventDefault();
  const point = canvasPoint(event);
  pushHistory();
  const stroke = {
    color: ui.brushColor,
    size: ui.brushSize,
    opacity: ui.brushOpacity / 100,
    mode: ui.brushMode,
    points: [point]
  };
  look.strokes.push(stroke);
  activeStroke = stroke;
  if (canvas.setPointerCapture) {
    try { canvas.setPointerCapture(event.pointerId); } catch { /* noop */ }
  }
  requestRender();
  return true;
}

function continueStroke(event) {
  if (!activeStroke) return;
  event.preventDefault();
  const point = canvasPoint(event);
  const points = activeStroke.points;
  const last = points[points.length - 1];
  if (Math.hypot(point.x - last.x, point.y - last.y) > 1.4) {
    if (points.length < 900) points.push(point);
    requestRender();
  }
}

function finishStroke() {
  if (!activeStroke) return;
  activeStroke = null;
  afterChange({ save: true });
  playApply();
}

function placeSticker(point) {
  if (!isOnFace(point.x, point.y)) {
    showToast('Toca la cara o el cuello para colocar el detalle');
    playMiss();
    return;
  }
  if (look.stickers.length >= 80) {
    showToast('Ya hay muchos detalles. Quita alguno para seguir.');
    return;
  }
  if (ui.sticker === 'erase') {
    let bestIndex = -1;
    let bestDistance = 42 * 42;
    look.stickers.forEach((sticker, index) => {
      const d = (sticker.x - point.x) ** 2 + (sticker.y - point.y) ** 2;
      if (d < bestDistance) { bestDistance = d; bestIndex = index; }
    });
    if (bestIndex >= 0) {
      pushHistory();
      look.stickers.splice(bestIndex, 1);
      afterChange({ play: true });
      showToast('Detalle retirado');
    } else {
      showToast('No hay ninguna pegatina ahí');
      playMiss();
    }
    return;
  }
  pushHistory();
  const type = ui.sticker;
  const scale = type === 'pearl' ? 1.35 : type === 'flower' ? 1.7 : 1.55;
  look.stickers.push({
    type,
    x: point.x,
    y: point.y,
    scale,
    rot: (Math.random() - .5) * .7
  });
  afterChange({ play: true });
}

canvas.addEventListener('pointerdown', event => {
  if (ui.tab === 'brush') {
    beginStroke(event);
    return;
  }
  if (ui.tab === 'details') {
    event.preventDefault();
    const point = canvasPoint(event);
    placeSticker(point);
  }
});
canvas.addEventListener('pointermove', continueStroke);
canvas.addEventListener('pointerup', finishStroke);
canvas.addEventListener('pointercancel', finishStroke);
canvas.addEventListener('lostpointercapture', finishStroke);

/* ---------------- game flow ---------------- */

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateTimerUI() {
  setLabel('timeLeft', formatTime(game.timeLeft));
  const timer = $('timer');
  if (timer) timer.classList.toggle('is-low', game.timeLeft <= 30);
}

function stopTimer() {
  if (game.timerId) {
    clearInterval(game.timerId);
    game.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  game.timeLeft = ROUND_TIME;
  updateTimerUI();
  game.timerId = setInterval(() => {
    if (!game.started || mode !== 'challenge') return;
    game.timeLeft = Math.max(0, game.timeLeft - 1);
    updateTimerUI();
    if (game.timeLeft === 0) {
      stopTimer();
      showToast('¡Se acabó el tiempo! Puedes presentar igualmente.');
      playMiss();
    }
  }, 1000);
}

function updateBestNote() {
  const best = Number(loadJSON(BEST_KEY)) || 0;
  const note = $('bestScoreNote');
  if (note) note.textContent = best > 0 ? `Récord del desafío: ${best} pts` : 'Aún no hay récord guardado';
}

function startGame(nextMode) {
  closeModal();
  $('startScreen').classList.add('hidden');
  stopTimer();
  history = [];
  activeStroke = null;
  mode = nextMode;
  game.finished = false;
  game.awaitingNext = false;

  if (mode === 'challenge') {
    game.round = 0;
    game.score = 0;
    game.stars = [];
    game.started = true;
    loadClient(0);
    showToast('Lee el encargo y cumple cada deseo ✦', 2600);
  } else {
    game.started = false;
    const stored = loadJSON(LOOK_KEY);
    look = stored ? normalizeLook(stored) : studioLook();
    ui.tab = 'skin';
    afterChange({ save: false });
    showToast('Estudio libre: crea, pinta y descarga tu retrato', 2600);
  }
}

function loadClient(index) {
  const client = CLIENTS[index];
  const carry = index > 0 ? {
    skin: look.skin,
    hairColor: look.hairColor,
    hairstyle: look.hairstyle,
    eyeColor: look.eyeColor,
    aura: look.aura
  } : {};
  look = normalizeLook({ ...emptyLook(), ...carry });
  history = [];
  activeStroke = null;
  ui.tab = 'skin';
  game.round = index;
  game.started = true;
  game.awaitingNext = false;
  game.timeLeft = ROUND_TIME;

  setLabel('clientRound', String(index + 1));
  setLabel('clientName', client.name);
  setLabel('clientBrief', client.brief);
  $('clientAvatar').textContent = client.initial;
  renderChecklist();
  startTimer();
  afterChange({ save: false });
  playApply();
}

function advanceClient() {
  if (game.round >= CLIENTS.length - 1) {
    showResults();
    return;
  }
  loadClient(game.round + 1);
  showToast(`Clienta ${game.round + 1} de ${CLIENTS.length}: ${CLIENTS[game.round].name}`, 1800);
}

function presentLook() {
  if (mode === 'free') {
    exportPhoto();
    return;
  }
  if (!game.started || game.awaitingNext) return;
  stopTimer();
  game.awaitingNext = true;
  const client = CLIENTS[game.round];
  const results = client.reqs.map(req => ({ label: req.label, ok: !!req.test(look) }));
  const matched = results.filter(result => result.ok).length;
  const timeBonus = matched > 0 ? Math.round((Math.max(0, game.timeLeft) / ROUND_TIME) * 20) : 0;
  const roundScore = matched * 20 + timeBonus;
  const stars = matched === 5 ? 3 : matched >= 4 ? 2 : matched >= 3 ? 1 : 0;
  game.score += roundScore;
  game.stars[game.round] = stars;
  const isLast = game.round >= CLIENTS.length - 1;
  syncUI();
  playSuccess(stars);
  if (stars === 0) playMiss();
  showScoreModal({ client, results, matched, timeBonus, roundScore, stars, isLast });
}

function showScoreModal({ client, results, matched, timeBonus, roundScore, stars, isLast }) {
  const messages = matched === 5
    ? `${client.name} está enamorada del resultado. Has cumplido cada deseo, sin dejar ni un detalle al azar.`
    : matched === 4
      ? `Casi perfecto. ${client.name} se va contenta, aunque un deseo se ha quedado en el aire.`
      : matched === 3
        ? `Hay un look precioso aquí, pero ${client.name} esperaba otra dirección en algunos detalles.`
        : `${client.name} sonríe por el esfuerzo, aunque el encargo pedía algo bastante distinto.`;
  const rows = results.map(result => `
    <div class="result-row ${result.ok ? 'is-ok' : 'is-miss'}">
      <span class="r-icon">${result.ok ? '✓' : '×'}</span>
      <span>${result.label}</span>
      <span class="result-points ${result.ok ? '' : 'dim'}">${result.ok ? '+20' : '0'}</span>
    </div>`).join('');
  const starsHTML = [1, 2, 3].map(index => `<span class="star ${index <= stars ? 'is-on' : ''}">★</span>`).join('');
  const confetti = stars === 3 ? confettiMarkup(34) : '';
  openModal(`
    ${confetti}
    <span class="modal-kicker">${isLast ? 'ÚLTIMO ENCARGO' : `ENCARGO ${game.round + 1} DE ${CLIENTS.length}`}</span>
    <h2 id="modalTitle">${matched === 5 ? '¡Impecable!' : matched >= 3 ? '¡Buen trabajo!' : 'Se puede mejorar'}</h2>
    <p class="modal-lede">${messages}</p>
    <div class="stars-row">${starsHTML}</div>
    <div class="score-big">+${roundScore}<small>puntos</small></div>
    <div class="result-list">${rows}</div>
    <div class="time-bonus"><span>Bonus de tiempo</span><strong>+${timeBonus} pts</strong></div>
    <div class="modal-actions">
      <button class="modal-btn primary" data-modal-action="${isLast ? 'finish' : 'next'}">${isLast ? 'Ver resultados' : 'Siguiente clienta'}</button>
    </div>
  `, { closable: false });
}

function showResults() {
  stopTimer();
  game.finished = true;
  game.started = false;
  game.awaitingNext = false;
  const totalStars = game.stars.reduce((sum, stars) => sum + (stars || 0), 0);
  const previousBest = Number(loadJSON(BEST_KEY)) || 0;
  const best = Math.max(previousBest, game.score);
  saveJSON(BEST_KEY, best);
  updateBestNote();
  syncUI();

  const message = totalStars >= 13
    ? 'Eres la artista estrella de Maison Miroir. Las cinco clientas se han ido con una sonrisa y el espejo lo ha visto todo.'
    : totalStars >= 9
      ? 'Un gran día en el atelier. Algunos deseos se escaparon, pero tu estilo ha dejado huella.'
      : totalStars >= 5
        ? 'Buen comienzo: ya dominas las bases. Vuelve a intentarlo y afina los detalles que pedían las clientas.'
        : 'Todo artista empieza con un lienzo. Prueba de nuevo, lee bien cada encargo y deja volar el pincel.';

  const rows = CLIENTS.map((client, index) => {
    const stars = game.stars[index] || 0;
    return `
      <div class="result-row ${stars > 0 ? 'is-ok' : 'is-miss'}">
        <span class="r-icon">${client.initial}</span>
        <span>${client.name}</span>
        <span class="result-points ${stars > 0 ? '' : 'dim'}">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
      </div>`;
  }).join('');
  const overallStars = Math.round(totalStars / CLIENTS.length);
  const starsHTML = [1, 2, 3].map(index => `<span class="star ${index <= overallStars ? 'is-on' : ''}">★</span>`).join('');

  openModal(`
    ${totalStars >= 9 ? confettiMarkup(44) : ''}
    <span class="modal-kicker">FIN DEL DESAFÍO</span>
    <h2 id="modalTitle">${totalStars >= 13 ? '¡Estrella del atelier!' : totalStars >= 9 ? 'El salón brilla' : 'Hasta aquí el día'}</h2>
    <p class="modal-lede">${message}</p>
    <div class="stars-row">${starsHTML}</div>
    <div class="score-big">${game.score}<small>${totalStars} de 15 estrellas · puntos totales</small></div>
    <div class="result-list">${rows}</div>
    <div class="time-bonus"><span>Récord personal</span><strong>${best} pts</strong></div>
    <div class="modal-actions">
      <button class="modal-btn primary" data-modal-action="restart">Jugar otra vez</button>
      <button class="modal-btn ghost" data-modal-action="free">Estudio libre</button>
      <button class="modal-btn ghost" data-modal-action="home">Inicio</button>
    </div>
  `, { closable: false });
}

function goHome() {
  stopTimer();
  game.started = false;
  game.awaitingNext = false;
  closeModal();
  $('startScreen').classList.remove('hidden');
  updateBestNote();
  syncUI();
}

function requestHome() {
  if (mode === 'challenge' && game.started && !game.awaitingNext) {
    openModal(`
      <span class="modal-kicker">SALIR DEL DESAFÍO</span>
      <h2 id="modalTitle">¿Volver al inicio?</h2>
      <p class="modal-lede">Si sales ahora perderás el progreso de este desafío. Tu look del estudio libre sigue guardado.</p>
      <div class="modal-actions">
        <button class="modal-btn primary" data-modal-close>Continuar maquillando</button>
        <button class="modal-btn ghost" data-modal-action="exit-home">Salir al inicio</button>
      </div>
    `, { closable: true });
  } else {
    goHome();
  }
}

/* ---------------- modal + toast ---------------- */

function confettiMarkup(count) {
  const colors = ['#e9c391', '#e7a0b5', '#f3d9b2', '#cf879e', '#b7d3bd'];
  let out = '<div class="confetti" aria-hidden="true">';
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const dx = (Math.random() - .5) * 140;
    const rot = Math.random() * 720 - 360;
    const delay = Math.random() * .5;
    const color = colors[i % colors.length];
    out += `<i style="left:${left.toFixed(1)}%;--dx:${dx.toFixed(0)}px;--rot:${rot.toFixed(0)}deg;background:${color};animation-delay:${delay.toFixed(2)}s"></i>`;
  }
  return out + '</div>';
}

function openModal(html, { closable = false } = {}) {
  modalClosable = closable;
  const close = closable
    ? '<button type="button" class="modal-close" data-modal-close aria-label="Cerrar">×</button>'
    : '';
  $('modalCard').innerHTML = close + html;
  $('modal').classList.remove('hidden');
}

function closeModal() {
  $('modal').classList.add('hidden');
  $('modalCard').innerHTML = '';
  modalClosable = false;
}

function showToast(message, duration = 2200) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  const live = $('live');
  if (live) live.textContent = message;
}

function exportPhoto() {
  try {
    const link = document.createElement('a');
    link.download = `maison-miroir-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Retrato guardado en tu galería ✦');
    playSuccess(2);
  } catch {
    showToast('No se pudo guardar la foto');
  }
}

/* ---------------- help + sound ---------------- */

function showHelp() {
  openModal(`
    <span class="modal-kicker">MAISON MIROIR</span>
    <h2 id="modalTitle">Cómo jugar</h2>
    <p class="modal-lede">Un espejo, una cara y todos los productos que quieras. No hay forma incorrecta de maquillar… salvo no escuchar a la clienta.</p>
    <div class="help-steps">
      <div class="help-step"><span class="help-num">1</span><div><h4>Elige un producto</h4><p>Cambia de pestaña y toca los colores, texturas y acabados. Todo se aplica al instante sobre el rostro.</p></div></div>
      <div class="help-step"><span class="help-num">2</span><div><h4>Cumple el encargo</h4><p>En el desafío, cada clienta tiene cinco deseos. Las etiquetas del encargo se iluminan cuando tu look los cumple.</p></div></div>
      <div class="help-step"><span class="help-num">3</span><div><h4>Juega con el pincel</h4><p>Dibuja delineados, sombras o pecas a mano. También puedes colocar gemas, flores y estrellas en «Detalles».</p></div></div>
      <div class="help-step"><span class="help-num">4</span><div><h4>Presenta o guarda</h4><p>Cuando estés lista, presenta el look para recibir estrellas. En el estudio libre puedes descargar tu retrato en PNG.</p></div></div>
    </div>
    <p class="help-foot">Consejo: usa «Deshacer» sin miedo y prueba «Aleatorio» para descubrir combinaciones inesperadas.<br>Atajos: Ctrl/⌘ + Z para deshacer · Esc para cerrar ventanas.</p>
    <div class="modal-actions">
      <button class="modal-btn primary" data-modal-close>Entendido, al espejo</button>
    </div>
  `, { closable: true });
}

function updateSoundButton() {
  const button = $('soundBtn');
  if (!button) return;
  button.classList.toggle('is-muted', ui.muted);
  button.setAttribute('aria-label', ui.muted ? 'Activar sonido' : 'Silenciar sonido');
  button.title = ui.muted ? 'Activar sonido' : 'Silenciar sonido';
}

function toggleSound() {
  ui.muted = !ui.muted;
  saveJSON(MUTE_KEY, ui.muted);
  updateSoundButton();
  if (!ui.muted) playApply();
  showToast(ui.muted ? 'Sonido silenciado' : 'Sonido activado');
}

/* ---------------- general events ---------------- */

$('panel').addEventListener('click', handlePanelClick);
$('panel').addEventListener('input', handleSliderInput);
$('panel').addEventListener('pointerdown', handleRangeStart);

document.addEventListener('click', event => {
  const start = event.target.closest('[data-start]');
  if (start) {
    startGame(start.dataset.start);
    return;
  }
  if (event.target.closest('#panel')) return;
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  switch (actionButton.dataset.action) {
    case 'home': requestHome(); break;
    case 'help': showHelp(); break;
    case 'sound': toggleSound(); break;
    case 'undo': undo(); break;
    case 'random': randomLook(); break;
    case 'reset': cleanFace(); break;
    case 'present': presentLook(); break;
  }
});

$('modal').addEventListener('click', event => {
  if (event.target === $('modal') && modalClosable) {
    closeModal();
    return;
  }
  if (event.target.closest('[data-modal-close]')) {
    closeModal();
    return;
  }
  const actionButton = event.target.closest('[data-modal-action]');
  if (!actionButton) return;
  switch (actionButton.dataset.modalAction) {
    case 'next':
      closeModal();
      advanceClient();
      break;
    case 'finish':
      showResults();
      break;
    case 'restart':
      closeModal();
      startGame('challenge');
      break;
    case 'free':
      closeModal();
      startGame('free');
      break;
    case 'home':
    case 'exit-home':
      closeModal();
      goHome();
      break;
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modalClosable) closeModal();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    undo();
  }
});

window.addEventListener('resize', () => {
  clearTimeout(window.__mmResizeTimer);
  window.__mmResizeTimer = setTimeout(() => {
    renderer.resize();
    renderer.render(look);
  }, 180);
});

/* ---------------- boot ---------------- */

buildSwatches();
buildPresetRow();
updateBestNote();
updateSoundButton();
updateTimerUI();
syncUI();
renderer.render(look);
