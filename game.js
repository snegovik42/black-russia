'use strict';

/*
  BLACK RUSSIA — 2D mini open-world
  Фанатская браузерная мини-игра по мотивам мобильной Black Russia.
  Не связана с оригинальной игрой. Все совпадения случайны.
*/

(() => {
  // ============================================================
  //  DOM
  // ============================================================

  const $ = (id) => document.getElementById(id);

  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const minimap = $('minimap');
  const mctx = minimap.getContext('2d');

  const ui = {
    hud: $('hud'),
    healthFill: $('healthFill'),
    healthText: $('healthText'),
    armorFill: $('armorFill'),
    armorText: $('armorText'),
    money: $('money'),
    stars: $('stars'),
    clock: $('clock'),
    daylabel: $('daylabel'),
    rank: $('rank'),
    objective: $('objective'),
    objectiveKicker: $('objectiveKicker'),
    objectiveTitle: $('objectiveTitle'),
    objectiveSub: $('objectiveSub'),
    objectiveProgress: $('objectiveProgress'),
    hint: $('hint'),
    speedo: $('speedo'),
    speedValue: $('speedValue'),
    speedRing: document.querySelector('.speed-ring'),
    carHpFill: $('carHpFill'),
    toastWrap: $('toastWrap'),
    screenTitle: $('screenTitle'),
    screenHelp: $('screenHelp'),
    screenPause: $('screenPause'),
    screenBusted: $('screenBusted'),
    bustedKicker: $('bustedKicker'),
    bustedTitle: $('bustedTitle'),
    bustedText: $('bustedText'),
    bustedTimer: $('bustedTimer'),
    btnContinue: $('btnContinue'),
    btnSound: $('btnSound'),
    btnSoundTitle: $('btnSoundTitle'),
    touchControls: $('touchControls'),
    joystick: $('joystick'),
    joyKnob: $('joyKnob'),
    pauseMoney: $('pauseMoney'),
    pauseJobs: $('pauseJobs'),
    pauseRank: $('pauseRank'),
    pauseWanted: $('pauseWanted'),
    saveNote: $('saveNote'),
  };

  // ============================================================
  //  CONSTANTS
  // ============================================================

  const TAU = Math.PI * 2;
  const WORLD = { w: 3200, h: 2400 };
  const ROAD_W = 136;
  const SIDEWALK = 32;
  const ROAD_X = [360, 1000, 1640, 2280, 2920];
  const ROAD_Y = [360, 1000, 1640, 2280];
  const SPAWN = { x: 1725, y: 1108 };

  const TAXI = { x: 1778, y: 1152, label: 'ТАКСИ', letter: 'Т', color: '#53a7ff' };
  const THEFT = { x: 2012, y: 1152, label: 'УГОН', letter: 'У', color: '#ff9b42' };
  const GARAGE = { x: 1920, y: 1370, label: 'ГАРАЖ', letter: 'Г', color: '#57e389' };
  const HOSPITAL = { x: 1725, y: 1108 };

  const SAVE_KEY = 'black-russia-save-v1';
  const MUTE_KEY = 'black-russia-muted-v1';

  const ROAD_NAMES_V = ['ЛЕНИНГРАДСКИЙ', 'ТВЕРСКАЯ', 'АРБАТ', 'САДОВАЯ', 'НИКОЛЬСКАЯ'];
  const ROAD_NAMES_H = ['СОВЕТСКАЯ', 'ПУШКИНСКАЯ', 'ГОГОЛЯ', 'ЛЕСНАЯ'];

  const PLACES = [
    'Аэропорт', 'Восточный вокзал', 'ТЦ «Галактика»', 'Стадион «Динамо»',
    'Приморский бульвар', 'Бизнес-центр «Высота»', 'Ночной клуб «Плаза»',
    'Рынок «Садовая»', 'Университет', 'Набережная', 'Автовокзал', 'Парк Победы',
  ];

  const CAR_COLORS = [
    { hex: '#15181d', name: 'чёрный' },
    { hex: '#d9dde3', name: 'белый' },
    { hex: '#565f6b', name: 'серый' },
    { hex: '#7e1d27', name: 'бордовый' },
    { hex: '#1f3c68', name: 'синий' },
    { hex: '#c39524', name: 'жёлтый' },
    { hex: '#29372f', name: 'тёмно-зелёный' },
    { hex: '#412b52', name: 'фиолетовый' },
  ];

  const CAR_MODELS = [
    { name: 'Лада Гранта', type: 'sedan', w: 29, l: 54 },
    { name: 'ВАЗ-2114', type: 'hatch', w: 28, l: 49 },
    { name: 'Тойота Камри', type: 'sedan', w: 30, l: 58 },
    { name: 'БМВ 5', type: 'sedan', w: 30, l: 58 },
    { name: 'Мерседес E', type: 'sedan', w: 31, l: 59 },
    { name: 'Ауди A6', type: 'sedan', w: 30, l: 58 },
    { name: 'Киа Рио', type: 'hatch', w: 28, l: 51 },
    { name: 'Хендай Солярис', type: 'sedan', w: 29, l: 54 },
    { name: 'УАЗ Патриот', type: 'suv', w: 33, l: 60 },
    { name: 'ГАЗель', type: 'van', w: 34, l: 66 },
  ];

  const RANKS = [
    { name: 'Новичок', min: 0 },
    { name: 'Бегунок', min: 3 },
    { name: 'Бродяга', min: 7 },
    { name: 'Авторитет', min: 12 },
    { name: 'Вор в законе', min: 20 },
    { name: 'Легенда района', min: 30 },
  ];

  const NEON_COLORS = ['#ff4d8d', '#52d7ff', '#ffc400', '#b47cff', '#ff7a3d'];

  // ============================================================
  //  HELPERS
  // ============================================================

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a = 1, b = 0) => b + Math.random() * (a - b);
  const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  const distObj = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const angleWrap = (a) => {
    while (a > Math.PI) a -= TAU;
    while (a < -Math.PI) a += TAU;
    return a;
  };

  const fmtMoney = (n) => Math.round(n).toLocaleString('ru-RU').replace(/\u00A0/g, ' ');

  const fmtTime = (minutes) => {
    const m = ((minutes % 1440) + 1440) % 1440;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
  };

  const fmtDist = (px) => {
    const meters = px * 0.5;
    if (meters >= 950) return `${(meters / 1000).toFixed(1).replace('.', ',')} км`;
    return `${Math.max(10, Math.round(meters / 10) * 10)} м`;
  };

  const rankFor = (jobs) => {
    let out = RANKS[0].name;
    for (const r of RANKS) if (jobs >= r.min) out = r.name;
    return out;
  };

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rgba(hex, alpha) {
    if (hex.startsWith('rgb')) return hex;
    const h = hex.replace('#', '');
    const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const num = parseInt(v, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function shade(hex, factor) {
    const h = hex.replace('#', '');
    const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const num = parseInt(v, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    if (factor > 0) {
      r = Math.round(lerp(r, 255, factor));
      g = Math.round(lerp(g, 255, factor));
      b = Math.round(lerp(b, 255, factor));
    } else {
      r = Math.round(r * (1 + factor));
      g = Math.round(g * (1 + factor));
      b = Math.round(b * (1 + factor));
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  function rr(g, x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    g.beginPath();
    g.moveTo(x + radius, y);
    g.arcTo(x + w, y, x + w, y + h, radius);
    g.arcTo(x + w, y + h, x, y + h, radius);
    g.arcTo(x, y + h, x, y, radius);
    g.arcTo(x, y, x + w, y, radius);
    g.closePath();
  }

  // ============================================================
  //  STATE
  // ============================================================

  const view = { w: window.innerWidth, h: window.innerHeight, dpr: 1, zoom: 1 };
  const cam = { x: SPAWN.x, y: SPAWN.y };

  const player = {
    x: SPAWN.x,
    y: SPAWN.y,
    angle: Math.PI / 2,
    inCar: null,
    walkPhase: 0,
    moving: false,
    breath: 0,
  };

  const state = {
    mode: 'title',
    money: 2500,
    health: 100,
    armor: 0,
    wanted: 0,
    crimeTimer: 0,
    bestWanted: 0,
    jobs: 0,
    day: 1,
    time: 21 * 60 + 20,
    shake: 0,
    hudTimer: 0,
    hintText: '',
    saveTimer: 0,
    playSeconds: 0,
    lastRank: 'Новичок',
    startedAt: 0,
  };

  const world = {
    canvas: null,
    minimapBase: null,
    solids: [],
    lights: [],
    neons: [],
    rng: mulberry32(0xb1acc0de),
  };

  let cars = [];
  let peds = [];
  let pickups = [];
  let cops = [];
  let wrecks = [];
  let particles = [];
  let floaters = [];
  let mission = null;
  let passenger = null;
  let copSpawnTimer = 0;
  let carId = 1;
  let elapsed = 0;
  let lastFrame = performance.now();
  let helpReturn = 'title';

  let lightCanvas = null;
  let lightCtx = null;

  const keys = Object.create(null);
  const touchInput = { x: 0, y: 0, active: false, brake: false };

  // ============================================================
  //  AUDIO
  // ============================================================

  const audio = {
    ctx: null,
    master: null,
    engineOsc: null,
    engineGain: null,
    engineFilter: null,
    sirenOsc: null,
    sirenGain: null,
    sirenLfo: null,
    noiseBuffer: null,
    muted: false,
    ready: false,
  };

  try {
    audio.muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch (e) {
    audio.muted = false;
  }

  function initAudio() {
    if (audio.ctx) {
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    audio.ctx = new AC();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = audio.muted ? 0 : 0.55;
    audio.master.connect(audio.ctx.destination);

    // engine
    audio.engineOsc = audio.ctx.createOscillator();
    audio.engineOsc.type = 'sawtooth';
    audio.engineOsc.frequency.value = 48;
    audio.engineFilter = audio.ctx.createBiquadFilter();
    audio.engineFilter.type = 'lowpass';
    audio.engineFilter.frequency.value = 320;
    audio.engineGain = audio.ctx.createGain();
    audio.engineGain.gain.value = 0;
    audio.engineOsc.connect(audio.engineFilter);
    audio.engineFilter.connect(audio.engineGain);
    audio.engineGain.connect(audio.master);
    audio.engineOsc.start();

    // siren
    audio.sirenOsc = audio.ctx.createOscillator();
    audio.sirenOsc.type = 'triangle';
    audio.sirenOsc.frequency.value = 680;
    audio.sirenLfo = audio.ctx.createOscillator();
    audio.sirenLfo.type = 'sawtooth';
    audio.sirenLfo.frequency.value = 0.65;
    const lfoGain = audio.ctx.createGain();
    lfoGain.gain.value = 170;
    audio.sirenLfo.connect(lfoGain);
    lfoGain.connect(audio.sirenOsc.frequency);
    audio.sirenGain = audio.ctx.createGain();
    audio.sirenGain.gain.value = 0;
    audio.sirenOsc.connect(audio.sirenGain);
    audio.sirenGain.connect(audio.master);
    audio.sirenOsc.start();
    audio.sirenLfo.start();

    // noise for crashes
    const len = Math.floor(audio.ctx.sampleRate * 0.8);
    audio.noiseBuffer = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate);
    const data = audio.noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;

    audio.ready = true;
  }

  function ensureAudio() {
    initAudio();
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  }

  function setMuted(value) {
    audio.muted = !!value;
    if (audio.master) audio.master.gain.setTargetAtTime(audio.muted ? 0 : 0.55, audio.ctx.currentTime, 0.05);
    try {
      localStorage.setItem(MUTE_KEY, audio.muted ? '1' : '0');
    } catch (e) { /* ignore */ }
    [ui.btnSound, ui.btnSoundTitle].forEach((btn) => {
      if (!btn) return;
      btn.classList.toggle('muted', audio.muted);
      btn.title = audio.muted ? 'Включить звук' : 'Выключить звук';
    });
  }

  function toggleMute() {
    ensureAudio();
    setMuted(!audio.muted);
    tone(audio.muted ? 220 : 660, 0.08, 'square', 0.04);
  }

  function tone(freq, duration = 0.12, type = 'sine', volume = 0.06, slideTo = null) {
    if (!audio.ctx || !audio.master) return;
    const t = audio.ctx.currentTime;
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(t);
    osc.stop(t + duration + 0.03);
  }

  function cashSound() {
    tone(880, 0.09, 'sine', 0.05);
    setTimeout(() => tone(1320, 0.14, 'sine', 0.045), 70);
  }

  function crashSound(power = 1) {
    if (!audio.ctx || !audio.noiseBuffer) return;
    const t = audio.ctx.currentTime;
    const src = audio.ctx.createBufferSource();
    const filter = audio.ctx.createBiquadFilter();
    const gain = audio.ctx.createGain();
    src.buffer = audio.noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.value = 900 + Math.random() * 900;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(Math.min(0.17, 0.035 + power * 0.11), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(audio.master);
    src.start(t);
    src.stop(t + 0.35);
  }

  function updateAudio() {
    if (!audio.ready) return;
    const t = audio.ctx.currentTime;
    const active = state.mode === 'playing' && player.inCar;
    const speed = player.inCar ? Math.abs(player.inCar.speed) : 0;
    const engineGain = active ? 0.025 + Math.min(0.055, (speed / 440) * 0.05) : 0;
    audio.engineGain.gain.setTargetAtTime(engineGain, t, 0.09);
    audio.engineOsc.frequency.setTargetAtTime(44 + speed * 0.31, t, 0.08);
    audio.engineFilter.frequency.setTargetAtTime(260 + speed * 1.3, t, 0.08);
    const sirenOn = state.mode === 'playing' && state.wanted > 0 && cops.length > 0;
    audio.sirenGain.gain.setTargetAtTime(sirenOn ? 0.022 : 0, t, 0.25);
  }

  // ============================================================
  //  SAVE
  // ============================================================

  function readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data.money !== 'number') return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function hasSave() {
    return !!readSave();
  }

  function refreshContinueButton() {
    const save = readSave();
    if (!ui.btnContinue) return;
    if (!save) {
      ui.btnContinue.classList.add('hidden');
      return;
    }
    ui.btnContinue.classList.remove('hidden');
    const label = ui.btnContinue.querySelector('span');
    if (label) label.textContent = `Продолжить · ${fmtMoney(save.money)} ₽`;
  }

  function saveGame(silent = false) {
    const data = {
      money: Math.round(state.money),
      jobs: state.jobs,
      bestWanted: state.bestWanted,
      day: state.day,
      time: state.time,
      savedAt: Date.now(),
      version: 1,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      refreshContinueButton();
      if (!silent) {
        toast('Прогресс сохранён', 'pay');
        if (ui.saveNote) ui.saveNote.textContent = 'Сохранено только что. Можно закрывать вкладку.';
      }
      return true;
    } catch (e) {
      if (!silent) toast('Не удалось сохранить прогресс', 'warn');
      return false;
    }
  }

  // ============================================================
  //  RESIZE / INPUT
  // ============================================================

  function resize() {
    view.w = window.innerWidth;
    view.h = window.innerHeight;
    view.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(view.w * view.dpr);
    canvas.height = Math.round(view.h * view.dpr);
    canvas.style.width = `${view.w}px`;
    canvas.style.height = `${view.h}px`;
    view.zoom = clamp(Math.min(view.w, view.h) / 830, 0.66, 1.05);

    if (!lightCanvas) {
      lightCanvas = document.createElement('canvas');
      lightCtx = lightCanvas.getContext('2d');
    }
    lightCanvas.width = canvas.width;
    lightCanvas.height = canvas.height;

    minimap.width = 440;
    minimap.height = 330;
    if (world.minimapBase) buildMinimapBase();
  }

  function getInput() {
    const k = keys;
    let x = 0;
    let y = 0;
    if (k.KeyA || k.ArrowLeft) x -= 1;
    if (k.KeyD || k.ArrowRight) x += 1;
    if (k.KeyW || k.ArrowUp) y -= 1;
    if (k.KeyS || k.ArrowDown) y += 1;
    if (touchInput.active) {
      x += touchInput.x;
      y += touchInput.y;
    }
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return {
      x,
      y,
      sprint: !!(k.ShiftLeft || k.ShiftRight),
      brake: !!(k.Space || touchInput.brake),
    };
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();

    if (e.code === 'Escape' && !e.repeat) {
      if (state.mode === 'playing') pauseGame();
      else if (state.mode === 'paused') resumeGame();
      else if (state.mode === 'help') closeHelp();
      return;
    }
    if (e.code === 'KeyE' && !e.repeat && state.mode === 'playing') {
      interact();
      return;
    }
    if (e.code === 'KeyM' && !e.repeat) {
      toggleMute();
      return;
    }
    if (e.code === 'KeyP' && !e.repeat) {
      if (state.mode === 'playing') pauseGame();
      else if (state.mode === 'paused') resumeGame();
      return;
    }
    keys[e.code] = true;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  window.addEventListener('blur', () => {
    for (const k of Object.keys(keys)) keys[k] = false;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.mode === 'playing') pauseGame();
  });

  document.addEventListener('pointerdown', ensureAudio, { passive: true });
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));

  // ============================================================
  //  TOUCH JOYSTICK
  // ============================================================

  let joyPointer = null;

  function updateJoystick(e) {
    const rect = ui.joystick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = rect.width * 0.31;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    touchInput.x = dx / max;
    touchInput.y = dy / max;
    touchInput.active = true;
    ui.joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function resetJoystick() {
    joyPointer = null;
    touchInput.x = 0;
    touchInput.y = 0;
    touchInput.active = false;
    ui.joyKnob.style.transform = 'translate(0, 0)';
  }

  if (ui.joystick) {
    ui.joystick.addEventListener('pointerdown', (e) => {
      joyPointer = e.pointerId;
      ui.joystick.setPointerCapture(e.pointerId);
      updateJoystick(e);
      e.preventDefault();
    });
    ui.joystick.addEventListener('pointermove', (e) => {
      if (joyPointer !== e.pointerId) return;
      updateJoystick(e);
      e.preventDefault();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => {
      ui.joystick.addEventListener(name, (e) => {
        if (joyPointer !== null && e.pointerId !== joyPointer) return;
        resetJoystick();
      });
    });
  }

  function isTouchDevice() {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    return coarse || (navigator.maxTouchPoints > 0 && noHover);
  }

  // ============================================================
  //  COLLISION
  // ============================================================

  function circleHitsSolid(x, y, r) {
    if (x - r < 4 || y - r < 4 || x + r > WORLD.w - 4 || y + r > WORLD.h - 4) return true;
    for (let i = 0; i < world.solids.length; i += 1) {
      const b = world.solids[i];
      const cx = clamp(x, b.x, b.x + b.w);
      const cy = clamp(y, b.y, b.y + b.h);
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy < r * r) return true;
    }
    return false;
  }

  function carCollides(x, y, angle, car) {
    const half = car.l / 2 - 8;
    for (let i = -1; i <= 1; i += 1) {
      const px = x + Math.cos(angle) * half * i;
      const py = y + Math.sin(angle) * half * i;
      if (circleHitsSolid(px, py, car.w * 0.44)) return true;
    }
    return false;
  }

  function movePlayer(dx, dy) {
    if (!circleHitsSolid(player.x + dx, player.y, 10)) player.x += dx;
    if (!circleHitsSolid(player.x, player.y + dy, 10)) player.y += dy;
    player.x = clamp(player.x, 14, WORLD.w - 14);
    player.y = clamp(player.y, 14, WORLD.h - 14);
  }


  // ============================================================
  //  CITY GENERATION
  // ============================================================

  function getBlockRects() {
    const xs = [];
    const ys = [];
    let start = 0;
    for (const x of ROAD_X) {
      xs.push([start, x - ROAD_W / 2]);
      start = x + ROAD_W / 2;
    }
    xs.push([start, WORLD.w]);
    start = 0;
    for (const y of ROAD_Y) {
      ys.push([start, y - ROAD_W / 2]);
      start = y + ROAD_W / 2;
    }
    ys.push([start, WORLD.h]);

    const out = [];
    for (const yr of ys) {
      for (const xr of xs) {
        const w = xr[1] - xr[0];
        const h = yr[1] - yr[0];
        if (w < 60 || h < 60) continue;
        out.push({ x: xr[0], y: yr[0], w, h });
      }
    }
    return out;
  }

  function isGarageBlock(b) {
    return GARAGE.x > b.x && GARAGE.x < b.x + b.w && GARAGE.y > b.y && GARAGE.y < b.y + b.h;
  }

  function nearIntersection(x, y, margin = 105) {
    for (const ix of ROAD_X) {
      for (const iy of ROAD_Y) {
        if (Math.abs(x - ix) < margin && Math.abs(y - iy) < margin) return true;
      }
    }
    return false;
  }

  function buildCity() {
    world.canvas = document.createElement('canvas');
    world.canvas.width = WORLD.w;
    world.canvas.height = WORLD.h;
    const g = world.canvas.getContext('2d');
    const R = world.rng;
    world.solids = [];
    world.lights = [];
    world.neons = [];

    // ----- base ground -----
    g.fillStyle = '#0e1217';
    g.fillRect(0, 0, WORLD.w, WORLD.h);
    const baseGrad = g.createLinearGradient(0, 0, WORLD.w, WORLD.h);
    baseGrad.addColorStop(0, 'rgba(30, 37, 43, 0.22)');
    baseGrad.addColorStop(0.5, 'rgba(9, 12, 16, 0)');
    baseGrad.addColorStop(1, 'rgba(19, 27, 34, 0.24)');
    g.fillStyle = baseGrad;
    g.fillRect(0, 0, WORLD.w, WORLD.h);

    for (let i = 0; i < 4200; i += 1) {
      const px = R() * WORLD.w;
      const py = R() * WORLD.h;
      g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.022)' : 'rgba(0,0,0,0.06)';
      g.fillRect(px, py, R() * 3 + 1, R() * 2 + 1);
    }

    const blocks = getBlockRects();

    // ----- city blocks ground -----
    for (const b of blocks) {
      const tone = 0.055 + R() * 0.035;
      g.fillStyle = `rgba(28, 34, 41, ${tone})`;
      g.fillRect(b.x, b.y, b.w, b.h);
    }

    // ----- sidewalks -----
    for (const x of ROAD_X) {
      g.fillStyle = '#20252c';
      g.fillRect(x - ROAD_W / 2 - SIDEWALK, 0, ROAD_W + SIDEWALK * 2, WORLD.h);
      g.fillStyle = 'rgba(255,255,255,0.022)';
      g.fillRect(x - ROAD_W / 2 - SIDEWALK, 0, SIDEWALK, WORLD.h);
      g.fillRect(x + ROAD_W / 2, 0, SIDEWALK, WORLD.h);
    }
    for (const y of ROAD_Y) {
      g.fillStyle = '#20252c';
      g.fillRect(0, y - ROAD_W / 2 - SIDEWALK, WORLD.w, ROAD_W + SIDEWALK * 2);
      g.fillStyle = 'rgba(255,255,255,0.022)';
      g.fillRect(0, y - ROAD_W / 2 - SIDEWALK, WORLD.w, SIDEWALK);
      g.fillRect(0, y + ROAD_W / 2, WORLD.w, SIDEWALK);
    }

    // sidewalk joints
    g.strokeStyle = 'rgba(0,0,0,0.16)';
    g.lineWidth = 1;
    for (const x of ROAD_X) {
      for (let y = 0; y < WORLD.h; y += 34) {
        g.beginPath();
        g.moveTo(x - ROAD_W / 2 - SIDEWALK, y);
        g.lineTo(x - ROAD_W / 2, y);
        g.moveTo(x + ROAD_W / 2, y);
        g.lineTo(x + ROAD_W / 2 + SIDEWALK, y);
        g.stroke();
      }
    }
    for (const y of ROAD_Y) {
      for (let x = 0; x < WORLD.w; x += 34) {
        g.beginPath();
        g.moveTo(x, y - ROAD_W / 2 - SIDEWALK);
        g.lineTo(x, y - ROAD_W / 2);
        g.moveTo(x, y + ROAD_W / 2);
        g.lineTo(x, y + ROAD_W / 2 + SIDEWALK);
        g.stroke();
      }
    }

    // ----- asphalt -----
    g.fillStyle = '#161a20';
    for (const x of ROAD_X) g.fillRect(x - ROAD_W / 2, 0, ROAD_W, WORLD.h);
    for (const y of ROAD_Y) g.fillRect(0, y - ROAD_W / 2, WORLD.w, ROAD_W);

    // asphalt texture / patches
    for (let i = 0; i < 480; i += 1) {
      const vertical = R() < 0.52;
      let px;
      let py;
      if (vertical) {
        px = pick(ROAD_X) + rand(ROAD_W / 2 - 8, -ROAD_W / 2 + 8);
        py = R() * WORLD.h;
      } else {
        px = R() * WORLD.w;
        py = pick(ROAD_Y) + rand(ROAD_W / 2 - 8, -ROAD_W / 2 + 8);
      }
      g.fillStyle = R() < 0.55 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.02)';
      g.beginPath();
      g.ellipse(px, py, R() * 22 + 5, R() * 8 + 2, R() * Math.PI, 0, TAU);
      g.fill();
    }

    // curbs
    g.strokeStyle = '#2b323b';
    g.lineWidth = 2;
    for (const x of ROAD_X) {
      g.beginPath();
      g.moveTo(x - ROAD_W / 2, 0);
      g.lineTo(x - ROAD_W / 2, WORLD.h);
      g.moveTo(x + ROAD_W / 2, 0);
      g.lineTo(x + ROAD_W / 2, WORLD.h);
      g.stroke();
    }
    for (const y of ROAD_Y) {
      g.beginPath();
      g.moveTo(0, y - ROAD_W / 2);
      g.lineTo(WORLD.w, y - ROAD_W / 2);
      g.moveTo(0, y + ROAD_W / 2);
      g.lineTo(WORLD.w, y + ROAD_W / 2);
      g.stroke();
    }

    // ----- road markings -----
    drawRoadMarkings(g);
    drawCrosswalks(g);

    // ----- block content -----
    for (const b of blocks) {
      if (isGarageBlock(b)) {
        drawGarageBlock(g, b);
      } else {
        generateBlock(g, b);
      }
    }

    // ----- roadside lamps & trees -----
    for (const x of ROAD_X) {
      for (let y = 170; y < WORLD.h - 80; y += 330) {
        for (const side of [-1, 1]) {
          const ly = y + (side === 1 ? 165 : 0);
          if (ly > WORLD.h - 40) continue;
          if (nearIntersection(x, ly, 92)) continue;
          const lx = x + side * (ROAD_W / 2 + 19);
          drawLampBase(g, lx, ly);
          world.lights.push({ x: lx, y: ly });
          if (R() < 0.28) {
            const tx = x + side * (ROAD_W / 2 + 23);
            const ty = ly + 76;
            if (!nearIntersection(tx, ty, 80)) drawTree(g, tx, ty, 10 + R() * 5);
          }
        }
      }
    }
    for (const y of ROAD_Y) {
      for (let x = 170; x < WORLD.w - 80; x += 330) {
        for (const side of [-1, 1]) {
          const lx = x + (side === 1 ? 165 : 0);
          if (lx > WORLD.w - 40) continue;
          if (nearIntersection(lx, y, 92)) continue;
          const ly = y + side * (ROAD_W / 2 + 19);
          drawLampBase(g, lx, ly);
          world.lights.push({ x: lx, y: ly });
          if (R() < 0.28) {
            const tx = lx + 76;
            const ty = y + side * (ROAD_W / 2 + 23);
            if (!nearIntersection(tx, ty, 80)) drawTree(g, tx, ty, 10 + R() * 5);
          }
        }
      }
    }

    // ----- road names -----
    const labelSpotsV = [640, 1330, 1960];
    ROAD_X.forEach((x, i) => {
      labelSpotsV.forEach((y) => {
        if (nearIntersection(x - 52, y, 95)) return;
        g.save();
        g.translate(x - ROAD_W / 2 + 15, y);
        g.rotate(-Math.PI / 2);
        g.fillStyle = 'rgba(220, 230, 240, 0.16)';
        g.font = '700 9px "Segoe UI", sans-serif';
        g.fillText(ROAD_NAMES_V[i], 0, 0);
        g.restore();
      });
    });
    const labelSpotsH = [700, 1390, 2100];
    ROAD_Y.forEach((y, i) => {
      labelSpotsH.forEach((x) => {
        if (nearIntersection(x, y + 52, 95)) return;
        g.fillStyle = 'rgba(220, 230, 240, 0.16)';
        g.font = '700 9px "Segoe UI", sans-serif';
        g.fillText(ROAD_NAMES_H[i], x, y + ROAD_W / 2 - 11);
      });
    });

    // ----- world border -----
    g.strokeStyle = '#090c10';
    g.lineWidth = 24;
    g.strokeRect(8, 8, WORLD.w - 16, WORLD.h - 16);
    g.strokeStyle = 'rgba(255,196,0,0.13)';
    g.lineWidth = 2;
    g.strokeRect(20, 20, WORLD.w - 40, WORLD.h - 40);

    buildMinimapBase();
  }

  function drawRoadMarkings(g) {
    const ranges = (centers, length) => {
      const out = [];
      let start = 0;
      for (const c of centers) {
        const a = c - 106;
        const b = c + 106;
        if (a > start) out.push([start, a]);
        start = b;
      }
      if (start < length) out.push([start, length]);
      return out;
    };

    g.save();
    g.strokeStyle = 'rgba(255, 199, 64, 0.22)';
    g.lineWidth = 2;
    g.setLineDash([22, 20]);
    for (const x of ROAD_X) {
      for (const [a, b] of ranges(ROAD_Y, WORLD.h)) {
        if (b - a < 40) continue;
        g.beginPath();
        g.moveTo(x, a + 8);
        g.lineTo(x, b - 8);
        g.stroke();
      }
    }
    for (const y of ROAD_Y) {
      for (const [a, b] of ranges(ROAD_X, WORLD.w)) {
        if (b - a < 40) continue;
        g.beginPath();
        g.moveTo(a + 8, y);
        g.lineTo(b - 8, y);
        g.stroke();
      }
    }
    g.setLineDash([]);
    g.strokeStyle = 'rgba(255,255,255,0.075)';
    g.lineWidth = 1.5;
    for (const x of ROAD_X) {
      g.beginPath();
      g.moveTo(x - ROAD_W / 2 + 5, 0);
      g.lineTo(x - ROAD_W / 2 + 5, WORLD.h);
      g.moveTo(x + ROAD_W / 2 - 5, 0);
      g.lineTo(x + ROAD_W / 2 - 5, WORLD.h);
      g.stroke();
    }
    for (const y of ROAD_Y) {
      g.beginPath();
      g.moveTo(0, y - ROAD_W / 2 + 5);
      g.lineTo(WORLD.w, y - ROAD_W / 2 + 5);
      g.moveTo(0, y + ROAD_W / 2 - 5);
      g.lineTo(WORLD.w, y + ROAD_W / 2 - 5);
      g.stroke();
    }
    g.restore();
  }

  function drawCrosswalks(g) {
    g.save();
    g.fillStyle = 'rgba(255,255,255,0.14)';
    for (const ix of ROAD_X) {
      for (const iy of ROAD_Y) {
        // across the horizontal road
        for (const side of [-1, 1]) {
          const cx = ix + side * 101;
          for (let y = iy - ROAD_W / 2 + 12; y < iy + ROAD_W / 2 - 10; y += 15) {
            g.fillRect(cx - 29, y, 58, 6);
          }
        }
        // across the vertical road
        for (const side of [-1, 1]) {
          const cy = iy + side * 101;
          for (let x = ix - ROAD_W / 2 + 12; x < ix + ROAD_W / 2 - 10; x += 15) {
            g.fillRect(x, cy - 29, 6, 58);
          }
        }
      }
    }
    g.restore();
  }

  function generateBlock(g, b) {
    const inner = { x: b.x + 44, y: b.y + 44, w: b.w - 88, h: b.h - 88 };
    if (inner.w < 90 || inner.h < 80) {
      g.fillStyle = 'rgba(15,20,25,0.7)';
      g.fillRect(b.x + 30, b.y + 30, b.w - 60, b.h - 60);
      return;
    }
    const roll = world.rng();
    if (roll < 0.15) {
      drawPark(g, inner);
    } else if (roll < 0.28) {
      drawParkingLot(g, inner);
    } else {
      drawBuildings(g, inner);
    }
  }

  function drawTree(g, x, y, r = 14) {
    const R = world.rng;
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.beginPath();
    g.ellipse(x + r * 0.28, y + r * 0.5, r * 0.95, r * 0.55, 0, 0, TAU);
    g.fill();
    g.fillStyle = '#3a2e22';
    g.fillRect(x - 1.5, y - 1, 3, r * 0.55);
    const green = ['#1d3a29', '#234632', '#2c543b', '#1a3324'];
    for (let i = 0; i < 4; i += 1) {
      const ox = rand(r * 0.55, -r * 0.55);
      const oy = rand(r * 0.4, -r * 0.5);
      g.fillStyle = green[Math.floor(R() * green.length)];
      g.beginPath();
      g.arc(x + ox, y + oy - r * 0.25, r * (0.55 + R() * 0.3), 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(140,190,120,0.13)';
    g.beginPath();
    g.arc(x - r * 0.25, y - r * 0.5, r * 0.34, 0, TAU);
    g.fill();
    g.restore();
  }

  function drawLampBase(g, x, y) {
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath();
    g.ellipse(x + 2, y + 3, 5, 3, 0, 0, TAU);
    g.fill();
    g.fillStyle = '#313841';
    g.beginPath();
    g.arc(x, y, 3.2, 0, TAU);
    g.fill();
    g.fillStyle = '#ffd48b';
    g.beginPath();
    g.arc(x, y, 1.8, 0, TAU);
    g.fill();
    g.restore();
  }

  function drawPark(g, inner) {
    const R = world.rng;
    g.save();
    g.fillStyle = '#17251c';
    g.fillRect(inner.x, inner.y, inner.w, inner.h);
    const grad = g.createRadialGradient(
      inner.x + inner.w * 0.45, inner.y + inner.h * 0.45, 10,
      inner.x + inner.w * 0.5, inner.y + inner.h * 0.5, Math.max(inner.w, inner.h) * 0.7,
    );
    grad.addColorStop(0, 'rgba(53,84,55,0.35)');
    grad.addColorStop(1, 'rgba(9,17,12,0.2)');
    g.fillStyle = grad;
    g.fillRect(inner.x, inner.y, inner.w, inner.h);

    // paths
    g.strokeStyle = 'rgba(154,146,123,0.22)';
    g.lineWidth = 17;
    g.beginPath();
    g.moveTo(inner.x, inner.y + inner.h * 0.55);
    g.bezierCurveTo(
      inner.x + inner.w * 0.35, inner.y + inner.h * 0.35,
      inner.x + inner.w * 0.62, inner.y + inner.h * 0.72,
      inner.x + inner.w, inner.y + inner.h * 0.45,
    );
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.035)';
    g.lineWidth = 2;
    g.stroke();

    // pond
    if (inner.w > 240 && inner.h > 220) {
      const px = inner.x + inner.w * (0.3 + R() * 0.4);
      const py = inner.y + inner.h * (0.3 + R() * 0.38);
      const rx = Math.min(inner.w * 0.2, 70);
      const ry = rx * 0.62;
      const pond = g.createRadialGradient(px - rx * 0.3, py - ry * 0.3, 2, px, py, rx);
      pond.addColorStop(0, '#24515c');
      pond.addColorStop(0.7, '#173541');
      pond.addColorStop(1, '#102630');
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.beginPath();
      g.ellipse(px + 4, py + 6, rx + 2, ry + 2, 0, 0, TAU);
      g.fill();
      g.fillStyle = pond;
      g.beginPath();
      g.ellipse(px, py, rx, ry, 0, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(110,190,200,0.18)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.ellipse(px - rx * 0.15, py - ry * 0.15, rx * 0.55, ry * 0.5, 0, 0, TAU);
      g.stroke();
    }

    const treeCount = Math.floor((inner.w * inner.h) / 9000);
    for (let i = 0; i < treeCount; i += 1) {
      const tx = inner.x + 18 + R() * (inner.w - 36);
      const ty = inner.y + 18 + R() * (inner.h - 36);
      drawTree(g, tx, ty, 10 + R() * 12);
    }

    // benches
    for (let i = 0; i < 4; i += 1) {
      const bx = inner.x + 30 + R() * (inner.w - 60);
      const by = inner.y + 30 + R() * (inner.h - 60);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(bx + 2, by + 3, 24, 7);
      g.fillStyle = '#4a3827';
      g.fillRect(bx, by, 24, 7);
      g.fillStyle = 'rgba(255,255,255,0.08)';
      g.fillRect(bx + 2, by + 1, 20, 2);
    }
    g.restore();
  }

  function drawParkingLot(g, inner) {
    const R = world.rng;
    g.save();
    g.fillStyle = '#191d23';
    g.fillRect(inner.x, inner.y, inner.w, inner.h);
    g.strokeStyle = 'rgba(255,255,255,0.07)';
    g.lineWidth = 2;
    g.strokeRect(inner.x + 1, inner.y + 1, inner.w - 2, inner.h - 2);

    g.strokeStyle = 'rgba(255,255,255,0.13)';
    g.lineWidth = 1.5;
    const slots = Math.floor((inner.w - 30) / 52);
    for (let row = 0; row < 2; row += 1) {
      const baseY = inner.y + 48 + row * (inner.h - 110);
      for (let i = 0; i <= slots; i += 1) {
        const x = inner.x + 18 + i * 52;
        g.beginPath();
        g.moveTo(x, baseY);
        g.lineTo(x, baseY + (row === 0 ? 44 : -44));
        g.stroke();
      }
    }

    // kiosk
    if (inner.w > 220) {
      const kx = inner.x + inner.w - 92;
      const ky = inner.y + 22;
      g.fillStyle = 'rgba(0,0,0,0.4)';
      g.fillRect(kx + 6, ky + 6, 62, 38);
      g.fillStyle = '#2a3038';
      g.fillRect(kx, ky, 62, 38);
      g.fillStyle = '#3b424b';
      g.fillRect(kx + 4, ky + 4, 54, 8);
      g.fillStyle = 'rgba(255,196,0,0.55)';
      g.fillRect(kx + 8, ky + 16, 16, 6);
      g.fillStyle = 'rgba(255,255,255,0.1)';
      g.fillRect(kx + 28, ky + 16, 26, 15);
      world.solids.push({ x: kx, y: ky, w: 62, h: 38, type: 'kiosk' });
    }

    for (let i = 0; i < 5; i += 1) {
      drawTree(
        g,
        inner.x + 15 + R() * (inner.w - 30),
        inner.y + inner.h - 10 - R() * 16,
        7 + R() * 6,
      );
    }
    g.restore();
  }

  function drawBuildings(g, inner) {
    const R = world.rng;
    const lots = [];
    const splitX = inner.x + inner.w * (0.44 + R() * 0.12);
    const splitY = inner.y + inner.h * (0.44 + R() * 0.12);

    if (inner.w > 350 && inner.h > 320) {
      lots.push(
        { x: inner.x, y: inner.y, w: splitX - inner.x, h: splitY - inner.y },
        { x: splitX, y: inner.y, w: inner.x + inner.w - splitX, h: splitY - inner.y },
        { x: inner.x, y: splitY, w: splitX - inner.x, h: inner.y + inner.h - splitY },
        { x: splitX, y: splitY, w: inner.x + inner.w - splitX, h: inner.y + inner.h - splitY },
      );
    } else if (inner.w > 290) {
      lots.push(
        { x: inner.x, y: inner.y, w: splitX - inner.x, h: inner.h },
        { x: splitX, y: inner.y, w: inner.x + inner.w - splitX, h: inner.h },
      );
    } else if (inner.h > 280) {
      lots.push(
        { x: inner.x, y: inner.y, w: inner.w, h: splitY - inner.y },
        { x: inner.x, y: splitY, w: inner.w, h: inner.y + inner.h - splitY },
      );
    } else {
      lots.push({ x: inner.x, y: inner.y, w: inner.w, h: inner.h });
    }

    for (const lot of lots) {
      if (R() < 0.09) {
        // small courtyard
        g.fillStyle = 'rgba(18,26,21,0.65)';
        g.fillRect(lot.x + 6, lot.y + 6, lot.w - 12, lot.h - 12);
        drawTree(g, lot.x + lot.w * 0.4, lot.y + lot.h * 0.5, 13 + R() * 10);
        drawTree(g, lot.x + lot.w * 0.68, lot.y + lot.h * 0.32, 9 + R() * 6);
        continue;
      }
      const m = 9 + R() * 15;
      const bx = lot.x + m;
      const by = lot.y + m;
      const bw = lot.w - m * 2 - R() * 10;
      const bh = lot.h - m * 2 - R() * 10;
      if (bw < 62 || bh < 55) continue;
      drawBuilding(g, bx, by, bw, bh);
    }
  }

  function drawBuilding(g, x, y, w, h) {
    const R = world.rng;
    const palette = ['#252b34', '#2b3039', '#30333a', '#332f2e', '#29333b', '#2d2b33'];
    const base = pick(palette);
    const lit = ['#ffc46b', '#ffe0a0', '#ffad55', '#9fd5ff', '#ffefc9'];

    // shadow
    g.fillStyle = 'rgba(0,0,0,0.4)';
    g.fillRect(x + 13, y + 16, w, h);

    // ledge
    g.fillStyle = '#161b22';
    g.fillRect(x - 3, y - 3, w + 6, h + 6);

    const roof = g.createLinearGradient(x, y, x + w, y + h);
    roof.addColorStop(0, shade(base, 0.1));
    roof.addColorStop(0.6, base);
    roof.addColorStop(1, shade(base, -0.28));
    g.fillStyle = roof;
    rr(g, x, y, w, h, 3);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.1)';
    g.lineWidth = 1.5;
    g.stroke();

    // roof panel
    g.fillStyle = shade(base, -0.1);
    rr(g, x + 7, y + 7, w - 14, h - 14, 2);
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.18)';
    g.lineWidth = 1;
    g.stroke();

    // roof seams
    g.strokeStyle = 'rgba(255,255,255,0.035)';
    for (let sx = x + 24; sx < x + w - 12; sx += 32) {
      g.beginPath();
      g.moveTo(sx, y + 9);
      g.lineTo(sx, y + h - 9);
      g.stroke();
    }

    // windows along the bottom edge
    const wc = Math.max(2, Math.floor((w - 22) / 27));
    for (let i = 0; i < wc; i += 1) {
      const isLit = R() < 0.45;
      g.fillStyle = isLit ? lit[Math.floor(R() * lit.length)] : 'rgba(10,15,20,0.85)';
      if (isLit) {
        g.shadowColor = g.fillStyle;
        g.shadowBlur = 7;
      }
      g.fillRect(x + 12 + i * 27, y + h - 12, 8, 3.5);
      g.shadowBlur = 0;
    }
    for (let i = 0; i < Math.floor(h / 34); i += 1) {
      const isLit = R() < 0.3;
      g.fillStyle = isLit ? lit[Math.floor(R() * lit.length)] : 'rgba(10,15,20,0.7)';
      g.fillRect(x + w - 12, y + 14 + i * 34, 3.5, 8);
    }

    // rooftop equipment
    const eq = Math.floor(1 + R() * 3);
    for (let i = 0; i < eq; i += 1) {
      const bw = 10 + R() * 18;
      const bh = 8 + R() * 14;
      const ex = x + 14 + R() * Math.max(1, w - bw - 28);
      const ey = y + 14 + R() * Math.max(1, h - bh - 32);
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.fillRect(ex + 2, ey + 3, bw, bh);
      g.fillStyle = R() < 0.5 ? '#3b424b' : '#313941';
      g.fillRect(ex, ey, bw, bh);
      g.fillStyle = 'rgba(255,255,255,0.09)';
      g.fillRect(ex + 2, ey + 2, bw - 4, 2);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      for (let v = 0; v < 3; v += 1) g.fillRect(ex + 3, ey + 4 + v * 3, bw - 6, 1);
    }

    // water tank
    if (w > 120 && h > 100 && R() < 0.28) {
      const tx = x + w * 0.65;
      const ty = y + h * 0.32;
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.beginPath();
      g.ellipse(tx + 3, ty + 4, 13, 8, 0, 0, TAU);
      g.fill();
      g.fillStyle = '#3b3a37';
      g.beginPath();
      g.arc(tx, ty, 11, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.12)';
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.06)';
      g.beginPath();
      g.arc(tx - 3, ty - 3, 5, 0, TAU);
      g.fill();
    }

    // helipad on big roofs
    if (w > 190 && h > 160 && R() < 0.2) {
      const cx = x + w * 0.42;
      const cy = y + h * 0.48;
      const rad = Math.min(w, h) * 0.17;
      g.strokeStyle = 'rgba(255,196,0,0.25)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, rad, 0, TAU);
      g.stroke();
      g.fillStyle = 'rgba(255,196,0,0.22)';
      g.font = `800 ${Math.max(9, rad * 0.75)}px "Segoe UI", sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('H', cx, cy + 1);
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
    }

    // neon sign
    if (w > 95 && R() < 0.3) {
      const sign = pick(['БАР', '24', 'ОТЕЛЬ', 'LUX', 'АВТО', 'БАНК', 'КЛУБ', 'КАЗИНО', 'COFFEE', 'SUSHI']);
      const color = pick(NEON_COLORS);
      g.save();
      g.font = '800 11px "Segoe UI", sans-serif';
      g.fillStyle = color;
      g.shadowColor = color;
      g.shadowBlur = 14;
      g.fillText(sign, x + 15, y + 25);
      g.restore();
      g.fillStyle = 'rgba(0,0,0,0.4)';
      g.fillRect(x + 11, y + 33, Math.min(w - 22, g.measureText(sign).width + 10), 1);
      world.neons.push({ x: x + 20, y: y + 20, color });
    }

    world.solids.push({ x, y, w, h, type: 'building' });
  }

  function drawGarageBlock(g, b) {
    const R = world.rng;
    const lot = { x: b.x + 38, y: b.y + 38, w: b.w - 76, h: b.h - 76 };

    g.fillStyle = '#191d22';
    g.fillRect(lot.x, lot.y, lot.w, lot.h);
    g.strokeStyle = 'rgba(255,196,0,0.2)';
    g.lineWidth = 2;
    g.strokeRect(lot.x + 1, lot.y + 1, lot.w - 2, lot.h - 2);

    // asphalt patches
    for (let i = 0; i < 30; i += 1) {
      g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.02)';
      g.beginPath();
      g.ellipse(lot.x + R() * lot.w, lot.y + R() * lot.h, R() * 20 + 3, R() * 7 + 2, R() * 3, 0, TAU);
      g.fill();
    }

    // parking lines (top left)
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 4; i += 1) {
      const x = lot.x + 24 + i * 50;
      g.beginPath();
      g.moveTo(x, lot.y + 180);
      g.lineTo(x, lot.y + 230);
      g.stroke();
    }

    // delivery zone
    g.save();
    g.strokeStyle = 'rgba(255,196,0,0.28)';
    g.lineWidth = 2;
    g.setLineDash([10, 8]);
    g.strokeRect(GARAGE.x - 68, GARAGE.y - 58, 136, 116);
    g.setLineDash([]);
    g.fillStyle = 'rgba(255,196,0,0.55)';
    g.font = '800 10px "Segoe UI", sans-serif';
    g.textAlign = 'center';
    g.fillText('ДОСТАВКА', GARAGE.x, GARAGE.y + 4);
    g.textAlign = 'left';
    g.restore();

    // garage building
    const gx = 2050;
    const gy = 1352;
    const gw = 122;
    const gh = 178;
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.fillRect(gx + 12, gy + 14, gw, gh);
    g.fillStyle = '#1b2027';
    g.fillRect(gx - 4, gy - 4, gw + 8, gh + 8);
    const roof = g.createLinearGradient(gx, gy, gx + gw, gy + gh);
    roof.addColorStop(0, '#353a35');
    roof.addColorStop(1, '#22261f');
    g.fillStyle = roof;
    g.fillRect(gx, gy, gw, gh);
    g.strokeStyle = 'rgba(255,255,255,0.08)';
    g.strokeRect(gx + 3, gy + 3, gw - 6, gh - 6);

    // garage door (west side)
    g.fillStyle = '#13171b';
    g.fillRect(gx - 7, gy + 48, 16, 92);
    g.fillStyle = '#ffc400';
    for (let i = 0; i < 4; i += 1) g.fillRect(gx - 7, gy + 52 + i * 22, 16, 4);
    g.save();
    g.translate(gx + gw / 2, gy + 30);
    g.textAlign = 'center';
    g.fillStyle = '#ffc400';
    g.shadowColor = 'rgba(255,196,0,0.5)';
    g.shadowBlur = 12;
    g.font = '800 15px "Segoe UI", sans-serif';
    g.fillText('GARAGE', 0, 0);
    g.shadowBlur = 0;
    g.font = '700 9px "Segoe UI", sans-serif';
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.fillText('24 · ТЮНИНГ', 0, 15);
    g.restore();

    // roof vents
    for (let i = 0; i < 3; i += 1) {
      g.fillStyle = '#454a44';
      g.fillRect(gx + 20 + i * 32, gy + 68, 16, 10);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(gx + 22 + i * 32, gy + 70, 12, 2);
    }

    world.solids.push({ x: gx, y: gy, w: gw, h: gh, type: 'garage' });
    world.neons.push({ x: gx + gw / 2, y: gy + 26, color: '#ffc400', big: true });

    // taxi stand
    const tx = 1738;
    const ty = 1088;
    g.fillStyle = 'rgba(0,0,0,0.4)';
    g.fillRect(tx + 4, ty + 6, 80, 30);
    g.fillStyle = '#202730';
    g.fillRect(tx, ty, 80, 30);
    g.fillStyle = '#53a7ff';
    g.fillRect(tx + 4, ty + 4, 72, 5);
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.font = '800 8px "Segoe UI", sans-serif';
    g.fillText('ТАКСИ', tx + 8, ty + 21);
    g.fillStyle = '#2c3239';
    g.fillRect(tx + 7, ty + 25, 3, 20);
    g.fillRect(tx + 70, ty + 25, 3, 20);
    // bench
    g.fillStyle = '#4a3827';
    g.fillRect(tx + 18, ty + 40, 44, 7);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.fillRect(tx + 20, ty + 47, 3, 8);
    g.fillRect(tx + 57, ty + 47, 3, 8);

    // theft board
    const hx = 1985;
    const hy = 1090;
    g.fillStyle = 'rgba(0,0,0,0.4)';
    g.fillRect(hx + 4, hy + 6, 72, 34);
    g.fillStyle = '#202730';
    g.fillRect(hx, hy, 72, 34);
    g.fillStyle = '#ff9b42';
    g.fillRect(hx + 4, hy + 4, 64, 4);
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.font = '800 8px "Segoe UI", sans-serif';
    g.fillText('УГОН', hx + 8, hy + 21);
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.font = '600 6px "Segoe UI", sans-serif';
    g.fillText('БЫСТРО · ДОРОГО', hx + 8, hy + 29);

    // props
    for (let i = 0; i < 3; i += 1) {
      g.fillStyle = '#1d2024';
      g.beginPath();
      g.arc(lot.x + lot.w - 70 + i * 13, lot.y + 200 + i * 4, 8, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.12)';
      g.lineWidth = 2;
      g.stroke();
    }
    g.fillStyle = '#b5431c';
    g.beginPath();
    g.moveTo(GARAGE.x + 92, GARAGE.y - 96);
    g.lineTo(GARAGE.x + 102, GARAGE.y - 78);
    g.lineTo(GARAGE.x + 82, GARAGE.y - 78);
    g.closePath();
    g.fill();

    // lot lamps
    world.lights.push({ x: 1760, y: 1400 });
    world.lights.push({ x: 2130, y: 1190 });
    world.lights.push({ x: 1870, y: 1110 });
    drawLampBase(g, 1760, 1400);
    drawLampBase(g, 2130, 1190);
    drawLampBase(g, 1870, 1110);

    // trees in the corners
    drawTree(g, lot.x + 12, lot.y + lot.h - 12, 11);
    drawTree(g, lot.x + lot.w - 14, lot.y + lot.h - 14, 9);
  }

  function buildMinimapBase() {
    const c = document.createElement('canvas');
    c.width = 440;
    c.height = 330;
    const g = c.getContext('2d');
    const pad = 16;
    const s = Math.min((c.width - pad * 2) / WORLD.w, (c.height - pad * 2) / WORLD.h);
    const ox = (c.width - WORLD.w * s) / 2;
    const oy = (c.height - WORLD.h * s) / 2;
    const mx = (x) => ox + x * s;
    const my = (y) => oy + y * s;

    g.fillStyle = '#0a0e13';
    g.fillRect(0, 0, c.width, c.height);

    // city base
    g.fillStyle = '#11161c';
    g.fillRect(mx(0), my(0), WORLD.w * s, WORLD.h * s);

    // roads
    g.strokeStyle = '#2c333d';
    g.lineCap = 'butt';
    g.lineWidth = ROAD_W * s;
    for (const x of ROAD_X) {
      g.beginPath();
      g.moveTo(mx(x), my(0));
      g.lineTo(mx(x), my(WORLD.h));
      g.stroke();
    }
    for (const y of ROAD_Y) {
      g.beginPath();
      g.moveTo(mx(0), my(y));
      g.lineTo(mx(WORLD.w), my(y));
      g.stroke();
    }

    g.strokeStyle = 'rgba(255,199,64,0.18)';
    g.lineWidth = 1;
    g.setLineDash([5, 4]);
    for (const x of ROAD_X) {
      g.beginPath();
      g.moveTo(mx(x), my(0));
      g.lineTo(mx(x), my(WORLD.h));
      g.stroke();
    }
    for (const y of ROAD_Y) {
      g.beginPath();
      g.moveTo(mx(0), my(y));
      g.lineTo(mx(WORLD.w), my(y));
      g.stroke();
    }
    g.setLineDash([]);

    // buildings
    for (const b of world.solids) {
      if (b.type === 'garage') {
        g.fillStyle = '#5b4a17';
      } else if (b.type === 'kiosk') {
        g.fillStyle = '#202830';
      } else {
        g.fillStyle = '#1b222b';
      }
      g.fillRect(mx(b.x), my(b.y), Math.max(1, b.w * s), Math.max(1, b.h * s));
    }

    // garage lot
    g.fillStyle = 'rgba(87,227,137,0.07)';
    g.fillRect(mx(1746), my(1106), 428 * s, 428 * s);

    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 1;
    g.strokeRect(mx(0), my(0), WORLD.w * s, WORLD.h * s);

    // vignette
    const grad = g.createRadialGradient(c.width / 2, c.height / 2, 40, c.width / 2, c.height / 2, c.width * 0.62);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);

    world.minimapBase = c;
  }

  // ============================================================
  //  ROAD POINTS
  // ============================================================

  function randomRoadPoint(minDist = 450, from = null) {
    const origin = from || player;
    for (let i = 0; i < 90; i += 1) {
      const vertical = Math.random() < 0.5;
      let x;
      let y;
      if (vertical) {
        x = pick(ROAD_X);
        y = rand(WORLD.h - 140, 140);
      } else {
        x = rand(WORLD.w - 140, 140);
        y = pick(ROAD_Y);
      }
      if (dist(x, y, origin.x, origin.y) < minDist) continue;
      if (dist(x, y, GARAGE.x, GARAGE.y) < 150) continue;
      return { x, y };
    }
    return { x: ROAD_X[2], y: ROAD_Y[1] + 300 };
  }

  function randomSidewalkPoint(avoidMarkers = true) {
    for (let i = 0; i < 100; i += 1) {
      const vertical = Math.random() < 0.5;
      let x;
      let y;
      if (vertical) {
        x = pick(ROAD_X) + (Math.random() < 0.5 ? -1 : 1) * (ROAD_W / 2 + 16);
        y = rand(WORLD.h - 80, 80);
      } else {
        x = rand(WORLD.w - 80, 80);
        y = pick(ROAD_Y) + (Math.random() < 0.5 ? -1 : 1) * (ROAD_W / 2 + 16);
      }
      if (circleHitsSolid(x, y, 9)) continue;
      if (avoidMarkers && (
        dist(x, y, TAXI.x, TAXI.y) < 90 ||
        dist(x, y, THEFT.x, THEFT.y) < 90 ||
        dist(x, y, GARAGE.x, GARAGE.y) < 140 ||
        dist(x, y, SPAWN.x, SPAWN.y) < 120
      )) continue;
      return { x, y };
    }
    return { x: SPAWN.x + 100, y: SPAWN.y + 100 };
  }


  // ============================================================
  //  ENTITIES
  // ============================================================

  function makeCar(x, y, angle, colorHex, colorName, model, extra = {}) {
    return {
      id: carId++,
      x,
      y,
      angle,
      w: model.w,
      l: model.l,
      model: model.name,
      type: model.type,
      color: colorHex,
      colorName,
      health: 100,
      speed: 0,
      isTraffic: false,
      axis: null,
      dir: 1,
      lane: 0,
      baseSpeed: 0,
      theft: false,
      hitCooldown: 0,
      smokeTimer: 0,
      ...extra,
    };
  }

  function carRoadSpot(vertical, along, side, angle) {
    if (vertical) {
      const x = pick(ROAD_X) + side * (ROAD_W / 2 - 18);
      return { x, y: along, angle: angle ?? (side > 0 ? -Math.PI / 2 : Math.PI / 2), vertical };
    }
    const y = pick(ROAD_Y) + side * (ROAD_W / 2 - 18);
    return { x: along, y, angle: angle ?? (side > 0 ? Math.PI : 0), vertical };
  }

  function addParkedCarAtRandom() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const vertical = Math.random() < 0.5;
      const along = rand((vertical ? WORLD.h : WORLD.w) - 130, 130);
      if (nearIntersection(vertical ? pick(ROAD_X) : along, vertical ? along : pick(ROAD_Y), 120)) continue;
      const side = Math.random() < 0.5 ? -1 : 1;
      const spot = carRoadSpot(vertical, along, side);
      if (nearIntersection(spot.x, spot.y, 105)) continue;
      if (circleHitsSolid(spot.x, spot.y, 22)) continue;
      if (dist(spot.x, spot.y, SPAWN.x, SPAWN.y) < 95) continue;
      if (dist(spot.x, spot.y, TAXI.x, TAXI.y) < 120) continue;
      if (dist(spot.x, spot.y, THEFT.x, THEFT.y) < 120) continue;
      if (dist(spot.x, spot.y, GARAGE.x, GARAGE.y) < 120) continue;
      if (cars.some((c) => dist(c.x, c.y, spot.x, spot.y) < 74)) continue;
      const color = pick(CAR_COLORS);
      const model = pick(CAR_MODELS.filter((m) => m.type !== 'van'));
      cars.push(makeCar(spot.x, spot.y, spot.angle, color.hex, color.name, model));
      return true;
    }
    return false;
  }

  function setupCars() {
    cars = [];
    carId = 1;

    // starter car, right next to the spawn point
    const starterModel = CAR_MODELS.find((m) => m.name === 'Тойота Камри');
    const starterColor = CAR_COLORS[0];
    cars.push(makeCar(1660, 1112, Math.PI / 2, starterColor.hex, starterColor.name, starterModel));

    // cars parked at the garage
    const camry = CAR_MODELS[1];
    const suv = CAR_MODELS.find((m) => m.type === 'suv');
    const c1 = CAR_COLORS.find((c) => c.name === 'белый');
    const c2 = CAR_COLORS.find((c) => c.name === 'серый');
    cars.push(makeCar(2156, 1288, Math.PI / 2, c1.hex, c1.name, CAR_MODELS[2]));
    cars.push(makeCar(1832, 1502, 0, c2.hex, c2.name, camry));
    cars.push(makeCar(2172, 1596, Math.PI / 2, CAR_COLORS[4].hex, CAR_COLORS[4].name, suv));

    for (let i = 0; i < 13; i += 1) addParkedCarAtRandom();

    // traffic
    for (let i = 0; i < 12; i += 1) {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const vertical = Math.random() < 0.5;
        const along = rand((vertical ? WORLD.h : WORLD.w) - 160, 160);
        const dir = Math.random() < 0.5 ? -1 : 1;
        const road = vertical ? pick(ROAD_X) : pick(ROAD_Y);
        const lane = 20;
        const x = vertical ? road + (dir > 0 ? -lane : lane) : along;
        const y = vertical ? along : road + (dir > 0 ? lane : -lane);
        if (cars.some((c) => dist(c.x, c.y, x, y) < 80)) continue;
        const angle = vertical ? (dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (dir > 0 ? 0 : Math.PI);
        const color = pick(CAR_COLORS);
        const model = pick(CAR_MODELS);
        const car = makeCar(x, y, angle, color.hex, color.name, model, {
          isTraffic: true,
          axis: vertical ? 'v' : 'h',
          dir,
          lane,
          speed: 95 + Math.random() * 55,
          baseSpeed: 95 + Math.random() * 55,
        });
        cars.push(car);
        break;
      }
    }
  }

  function makePed(x, y) {
    const shirts = ['#8a3b3b', '#3b5f8a', '#4f7a52', '#7d6a3f', '#61467a', '#2d3037', '#a46a3b'];
    return {
      x,
      y,
      angle: rand(TAU),
      speed: 14 + Math.random() * 20,
      phase: rand(TAU),
      shirt: pick(shirts),
      down: 0,
      flee: 0,
      idle: 0,
    };
  }

  function placePed() {
    const p = randomSidewalkPoint(true);
    return makePed(p.x, p.y);
  }

  function setupPeds() {
    peds = [];
    for (let i = 0; i < 32; i += 1) peds.push(placePed());
  }

  function makePickup(type, x, y) {
    return {
      type,
      x,
      y,
      active: true,
      cooldown: 0,
      bob: rand(TAU),
      value: type === 'cash' ? 60 + Math.floor(Math.random() * 24) * 10 : 0,
    };
  }

  function setupPickups() {
    pickups = [];
    for (let i = 0; i < 18; i += 1) {
      const p = randomSidewalkPoint(false);
      pickups.push(makePickup('cash', p.x, p.y));
    }
    for (let i = 0; i < 5; i += 1) {
      const p = randomSidewalkPoint(false);
      pickups.push(makePickup('health', p.x, p.y));
    }
    for (let i = 0; i < 4; i += 1) {
      const p = randomSidewalkPoint(false);
      pickups.push(makePickup('armor', p.x, p.y));
    }
    pickups.push(makePickup('cash', 1810, 1245));
    pickups.push(makePickup('health', 1945, 1490));
  }

  function resetWorld() {
    cars = [];
    peds = [];
    pickups = [];
    cops = [];
    wrecks = [];
    particles = [];
    floaters = [];
    mission = null;
    passenger = null;
    copSpawnTimer = 0;

    state.health = 100;
    state.armor = 0;
    state.wanted = 0;
    state.crimeTimer = 0;
    state.shake = 0;
    state.hintText = '';
    state.lastStars = 0;

    player.x = SPAWN.x;
    player.y = SPAWN.y;
    player.angle = Math.PI / 2;
    player.inCar = null;
    player.moving = false;
    player.walkPhase = 0;

    cam.x = SPAWN.x;
    cam.y = SPAWN.y;

    setupCars();
    setupPeds();
    setupPickups();
  }

  function spawnParticles(x, y, count, color, speed = 110, life = 0.55, size = 2.2) {
    for (let i = 0; i < count; i += 1) {
      const a = rand(TAU);
      const s = rand(speed, speed * 0.2);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(life, life * 0.4),
        maxLife: life,
        size: rand(size, 0.7),
        color,
        drag: 2.4,
        gravity: 0,
      });
    }
  }

  function floatText(x, y, text, color = '#ffd84d', size = 12) {
    floaters.push({ x, y, text, color, size, life: 1.7, maxLife: 1.7 });
  }

  // ============================================================
  //  UI HELPERS
  // ============================================================

  function toast(text, kind = 'info', ms = 3300) {
    if (!ui.toastWrap) return;
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
    ui.toastWrap.appendChild(el);
    while (ui.toastWrap.children.length > 3) ui.toastWrap.removeChild(ui.toastWrap.firstChild);
    window.setTimeout(() => {
      el.classList.add('out');
      window.setTimeout(() => el.remove(), 380);
    }, ms);
  }

  function getRank() {
    return rankFor(state.jobs);
  }

  function registerJob() {
    state.jobs += 1;
    const newRank = rankFor(state.jobs);
    if (newRank !== state.lastRank) {
      state.lastRank = newRank;
      window.setTimeout(() => toast(`Новый ранг: ${newRank}`, 'job', 4200), 900);
      tone(740, 0.12, 'triangle', 0.05);
      window.setTimeout(() => tone(980, 0.18, 'triangle', 0.05), 130);
    }
  }

  function commitCrime(amount, message = '') {
    if (state.mode !== 'playing') return;
    state.wanted = clamp(state.wanted + amount, 0, 5.5);
    state.crimeTimer = 9;
    state.bestWanted = Math.max(state.bestWanted, Math.ceil(state.wanted));
    if (message) toast(message, 'warn');
    tone(180, 0.18, 'square', 0.028, 120);
  }

  // ============================================================
  //  START / RESTART
  // ============================================================

  function startGame(loadSave = false) {
    const save = loadSave ? readSave() : null;
    resetWorld();

    if (save) {
      state.money = save.money;
      state.jobs = save.jobs || 0;
      state.bestWanted = save.bestWanted || 0;
      state.day = save.day || 1;
      state.time = typeof save.time === 'number' ? save.time : 21 * 60 + 20;
    } else {
      state.money = 2500;
      state.jobs = 0;
      state.bestWanted = 0;
      state.day = 1;
      state.time = 21 * 60 + 20;
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch (e) { /* ignore */ }
      refreshContinueButton();
    }

    state.lastRank = rankFor(state.jobs);
    state.playSeconds = 0;
    state.mode = 'playing';
    state.hudTimer = 0;
    state.saveTimer = 70;

    ui.screenTitle.classList.add('hidden');
    ui.screenHelp.classList.add('hidden');
    ui.screenPause.classList.add('hidden');
    ui.screenBusted.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    ui.toastWrap.classList.remove('hidden');
    ui.toastWrap.innerHTML = '';

    if (isTouchDevice()) ui.touchControls.classList.remove('hidden');
    else ui.touchControls.classList.add('hidden');

    ensureAudio();
    setMuted(audio.muted);
    resetJoystick();
    updateHUD(true);
    updateObjectiveUI(true);
    updateHint(true);

    window.setTimeout(() => {
      if (state.mode === 'playing') toast('Ты в городе. Возьми заказ у гаража или просто покатайся.', 'job', 4600);
    }, 700);
    if (save) {
      window.setTimeout(() => {
        if (state.mode === 'playing') toast(`Сохранение загружено · ${fmtMoney(save.money)} ₽`, 'pay', 3600);
      }, 1600);
    }

    window.setTimeout(() => {
      if (state.mode === 'playing') {
        toast('Маркер «Т» — такси. «У» — угон. «Г» — гараж.', 'info', 5000);
      }
    }, save ? 2900 : 2500);
  }

  // ============================================================
  //  PLAYER ACTIONS
  // ============================================================

  function nearestEnterableCar() {
    let best = null;
    let bestDist = Infinity;
    for (const car of cars) {
      if (car === player.inCar) continue;
      const d = dist(player.x, player.y, car.x, car.y);
      if (d < bestDist) {
        bestDist = d;
        best = car;
      }
    }
    return { car: best, dist: bestDist };
  }

  function enterCar(car) {
    if (!car || player.inCar) return;
    const wasTraffic = car.isTraffic;
    car.isTraffic = false;
    car.speed = wasTraffic ? 0 : car.speed;
    player.inCar = car;
    player.x = car.x;
    player.y = car.y;
    player.angle = car.angle;

    if (wasTraffic) {
      commitCrime(1.35, 'Угнан автомобиль! Полиция уже в курсе.');
      spawnPedNear(car.x - Math.cos(car.angle) * 20, car.y - Math.sin(car.angle) * 20, true);
    }

    if (mission && mission.type === 'theft' && car === mission.car && mission.stage === 'pickup') {
      mission.stage = 'deliver';
      commitCrime(1.1, 'Машина по заказу у тебя. Вези её в гараж.');
    }

    tone(130, 0.22, 'sawtooth', 0.035, 210);
    updateObjectiveUI(true);
    updateHint(true);
  }

  function spawnPedNear(x, y, flee = false) {
    const p = makePed(x, y);
    p.flee = flee ? 4 : 0;
    p.speed = 38;
    peds.push(p);
    return p;
  }

  function exitCar() {
    if (!player.inCar) return;
    const car = player.inCar;
    const side = car.angle + Math.PI / 2;
    const candidates = [
      { x: car.x + Math.cos(side) * (car.w / 2 + 15), y: car.y + Math.sin(side) * (car.w / 2 + 15), a: side },
      { x: car.x - Math.cos(side) * (car.w / 2 + 15), y: car.y - Math.sin(side) * (car.w / 2 + 15), a: side + Math.PI },
      { x: car.x - Math.cos(car.angle) * (car.l / 2 + 18), y: car.y - Math.sin(car.angle) * (car.l / 2 + 18), a: car.angle },
      { x: car.x + Math.cos(car.angle) * (car.l / 2 + 18), y: car.y + Math.sin(car.angle) * (car.l / 2 + 18), a: car.angle },
    ];
    let chosen = candidates[0];
    for (const c of candidates) {
      if (!circleHitsSolid(c.x, c.y, 10)) {
        chosen = c;
        break;
      }
    }
    player.x = clamp(chosen.x, 14, WORLD.w - 14);
    player.y = clamp(chosen.y, 14, WORLD.h - 14);
    player.angle = car.angle;
    player.inCar = null;
    car.speed = 0;
    tone(110, 0.08, 'sine', 0.02);
    updateHint(true);
  }

  function interact() {
    if (state.mode !== 'playing') return;

    if (!mission) {
      if (dist(player.x, player.y, TAXI.x, TAXI.y) < 82) {
        startTaxi();
        return;
      }
      if (dist(player.x, player.y, THEFT.x, THEFT.y) < 82) {
        startTheft();
        return;
      }
    }

    if (player.inCar) {
      exitCar();
      return;
    }

    const near = nearestEnterableCar();
    if (near.car && near.dist < 100) {
      enterCar(near.car);
      return;
    }

    toast('Рядом ничего нет. Ищи тачку или маркер заказа.', 'info', 2200);
  }

  // ============================================================
  //  MISSIONS
  // ============================================================

  function startTaxi() {
    if (mission || state.mode !== 'playing') return;
    const pickup = randomRoadPoint(480, player);
    const drop = randomRoadPoint(760, pickup);
    const trip = dist(pickup.x, pickup.y, drop.x, drop.y);
    const place = pick(PLACES);
    mission = {
      type: 'taxi',
      stage: 'pickup',
      pickup,
      drop,
      place,
      reward: Math.round(620 + trip * 0.34 + rand(180, 40) * 2),
      startedAt: elapsed,
    };
    passenger = {
      x: pickup.x,
      y: pickup.y,
      angle: rand(TAU),
      phase: 0,
    };
    toast(`Заказ такси: клиент ждёт на улице. Точка уже на карте.`, 'job', 3800);
    tone(620, 0.12, 'sine', 0.05);
    window.setTimeout(() => tone(830, 0.15, 'sine', 0.04), 110);
    updateObjectiveUI(true);
    updateHint(true);
  }

  function startTheft() {
    if (mission || state.mode !== 'playing') return;
    let candidates = cars.filter((c) => (
      !c.isTraffic &&
      c !== player.inCar &&
      !c.theft &&
      dist(c.x, c.y, GARAGE.x, GARAGE.y) > 420 &&
      dist(c.x, c.y, player.x, player.y) > 120
    ));
    if (!candidates.length) {
      candidates = cars.filter((c) => !c.isTraffic && c !== player.inCar);
    }
    if (!candidates.length) {
      toast('Нет свободных машин для заказа. Попробуй позже.', 'warn');
      return;
    }
    const target = pick(candidates);
    target.theft = true;
    const value = Math.round(1250 + target.health * 4 + rand(400, 0));
    mission = {
      type: 'theft',
      stage: 'pickup',
      car: target,
      reward: value,
      startedAt: elapsed,
    };
    toast(`Заказ на угон: найди ${target.colorName} ${target.model}.`, 'job', 4000);
    tone(520, 0.1, 'square', 0.04);
    window.setTimeout(() => tone(700, 0.14, 'square', 0.035), 100);
    updateObjectiveUI(true);
    updateHint(true);
  }

  function completeTaxi() {
    if (!mission || mission.type !== 'taxi') return;
    const reward = mission.reward;
    const place = mission.place;
    const drop = { ...mission.drop };
    registerJob();
    moneyBurst(reward, place);
    mission = null;
    passenger = null;
    if (Math.random() < 0.6) spawnPedNear(drop.x + rand(30, -30), drop.y + rand(30, -30), false);
    updateObjectiveUI(true);
    updateHint(true);
    saveGame(true);
  }

  function completeTheft() {
    if (!mission || mission.type !== 'theft') return;
    const condition = mission.car ? clamp(mission.car.health / 100, 0, 1) : 1;
    const reward = Math.round(mission.reward * (0.6 + condition * 0.4));
    if (mission.car) mission.car.theft = false;
    registerJob();
    moneyBurst(reward, 'автоугон');
    mission = null;
    tone(880, 0.1, 'sine', 0.05);
    window.setTimeout(() => tone(1170, 0.18, 'sine', 0.045), 90);
    updateObjectiveUI(true);
    updateHint(true);
    saveGame(true);
  }

  function moneyBurst(amount, label = '') {
    state.money += amount;
    cashSound();
    const pos = player.inCar || player;
    floatText(pos.x, pos.y - 24, `+${fmtMoney(amount)} ₽`, '#7dff9b', 15);
    toast(`${label ? `${label} · ` : ''}+${fmtMoney(amount)} ₽`, 'pay', 3600);
    updateHUD(true);
  }

  function failMission(reason = 'Заказ провален') {
    if (!mission) return;
    if (mission.type === 'theft' && mission.car) mission.car.theft = false;
    mission = null;
    passenger = null;
    toast(reason, 'warn', 3600);
    updateObjectiveUI(true);
    updateHint(true);
  }

  function currentTarget() {
    if (!mission) return null;
    if (mission.type === 'taxi') {
      return mission.stage === 'pickup' ? mission.pickup : mission.drop;
    }
    if (mission.type === 'theft') {
      if (mission.stage === 'pickup') {
        if (!mission.car) return null;
        return { x: mission.car.x, y: mission.car.y };
      }
      return GARAGE;
    }
    return null;
  }

  function updateMission(dt) {
    if (!mission) return;

    if (mission.type === 'taxi') {
      if (mission.stage === 'pickup') {
        if (player.inCar && passenger) {
          const d = dist(player.inCar.x, player.inCar.y, passenger.x, passenger.y);
          if (d < 74 && Math.abs(player.inCar.speed) < 32) {
            mission.stage = 'deliver';
            passenger = null;
            toast(`Клиент в машине. Вези: ${mission.place}.`, 'job', 3800);
            tone(560, 0.1, 'sine', 0.04);
            window.setTimeout(() => tone(740, 0.14, 'sine', 0.035), 80);
            updateObjectiveUI(true);
          }
        }
      } else if (player.inCar) {
        const d = dist(player.inCar.x, player.inCar.y, mission.drop.x, mission.drop.y);
        if (d < 82 && Math.abs(player.inCar.speed) < 34) {
          completeTaxi();
        }
      }
      return;
    }

    if (mission.type === 'theft') {
      if (!mission.car) {
        failMission('Машина по заказу пропала.');
        return;
      }
      if (mission.stage === 'pickup') {
        if (player.inCar === mission.car) {
          mission.stage = 'deliver';
          commitCrime(1.1, 'Машина по заказу у тебя. Вези её в гараж.');
          updateObjectiveUI(true);
        }
      } else if (player.inCar === mission.car) {
        const d = dist(mission.car.x, mission.car.y, GARAGE.x, GARAGE.y);
        if (d < 88 && Math.abs(mission.car.speed) < 38) {
          completeTheft();
        }
      }
      return;
    }
  }


  // ============================================================
  //  UPDATE: PLAYER
  // ============================================================

  function damagePlayer(amount) {
    if (state.health <= 0 || state.mode !== 'playing') return;
    let dmg = amount;
    if (state.armor > 0) {
      const absorb = Math.min(state.armor, dmg * 0.65);
      state.armor -= absorb;
      dmg -= absorb;
    }
    state.health = Math.max(0, state.health - dmg);
    state.shake = Math.max(state.shake, Math.min(9, amount * 0.35));
    if (state.health <= 0) {
      busted('Вы потеряли сознание');
    }
  }

  function damageCar(car, amount) {
    if (!car || car.dead) return;
    car.health = Math.max(0, car.health - amount);
    if (car.health < 32 && !car.smoked && car === player.inCar) {
      car.smoked = true;
      toast('Машина дымится — скоро взорвётся. Выходи!', 'warn', 3600);
    }
    if (car.health <= 0) explodeCar(car);
  }

  function explodeCar(car) {
    if (!car || car.dead) return;
    car.dead = true;
    const wasPlayer = player.inCar === car;
    spawnParticles(car.x, car.y, 34, '#ff9b42', 230, 0.95, 3.6);
    spawnParticles(car.x, car.y, 16, '#ffd84d', 160, 0.65, 2.2);
    spawnParticles(car.x, car.y, 22, '#262626', 90, 1.3, 4.5);
    wrecks.push({ x: car.x, y: car.y, angle: car.angle, w: car.w, l: car.l, age: 0 });
    state.shake = Math.max(state.shake, 22);
    crashSound(1.6);

    if (wasPlayer) {
      exitCar();
      damagePlayer(30);
      if (state.mode === 'playing') toast('Машина взорвалась!', 'warn', 3200);
    } else if (dist(car.x, car.y, player.x, player.y) < 100) {
      damagePlayer(8);
    }

    if (mission && mission.type === 'theft' && mission.car === car) {
      failMission('Машина по заказу уничтожена.');
    }
    if (car.theft) car.theft = false;
  }

  function updatePlayer(dt) {
    const input = getInput();

    if (player.inCar) {
      const car = player.inCar;
      const throttle = -input.y;
      const steer = input.x;
      let speed = car.speed;

      if (throttle > 0.05) {
        speed += 340 * throttle * dt;
      } else if (throttle < -0.05) {
        if (speed > 2) speed -= 560 * Math.abs(throttle) * dt;
        else speed += 220 * throttle * dt;
      } else {
        speed *= Math.exp(-0.75 * dt);
        if (Math.abs(speed) < 2) speed = 0;
      }

      if (input.brake) {
        speed *= Math.exp(-5.4 * dt);
        if (Math.abs(speed) < 3) speed = 0;
      }

      speed = clamp(speed, -170, 445);
      car.speed = speed;

      if (Math.abs(speed) > 7) {
        const grip = 0.35 + clamp(Math.abs(speed) / 220, 0, 1) * 0.65;
        car.angle += steer * 2.25 * dt * grip * Math.sign(speed);
      }

      const nx = car.x + Math.cos(car.angle) * speed * dt;
      const ny = car.y + Math.sin(car.angle) * speed * dt;

      if (carCollides(nx, ny, car.angle, car)) {
        const impact = Math.abs(speed);
        if (impact > 55) {
          damageCar(car, Math.min(38, impact * 0.055));
          damagePlayer(Math.min(10, impact * 0.012));
          state.shake = Math.max(state.shake, Math.min(15, impact * 0.035));
          spawnParticles(
            car.x + Math.cos(car.angle) * (car.l / 2),
            car.y + Math.sin(car.angle) * (car.l / 2),
            8 + Math.floor(impact / 55),
            '#ffcf6b',
            140,
            0.5,
            1.8,
          );
          crashSound(Math.min(1.5, impact / 280));
        }
        car.speed *= -0.16;
      } else {
        car.x = nx;
        car.y = ny;
      }

      car.x = clamp(car.x, 20, WORLD.w - 20);
      car.y = clamp(car.y, 20, WORLD.h - 20);
      player.x = car.x;
      player.y = car.y;
      player.angle = car.angle;
      player.moving = Math.abs(car.speed) > 5;

      // collisions with other cars
      for (const other of cars) {
        if (other === car || other.dead) continue;
        const d = dist(car.x, car.y, other.x, other.y);
        if (d < 44 && car.hitCooldown <= 0) {
          const impact = Math.abs(car.speed) + Math.abs(other.speed);
          if (impact > 35) {
            damageCar(car, Math.min(10, impact * 0.04));
            damageCar(other, Math.min(8, impact * 0.03));
            if (other.isTraffic) {
              other.speed *= 0.35;
              other.x += Math.cos(other.angle) * 8;
              other.y += Math.sin(other.angle) * 8;
            }
            car.speed *= 0.55;
            car.hitCooldown = 0.7;
            other.hitCooldown = 0.7;
            spawnParticles((car.x + other.x) / 2, (car.y + other.y) / 2, 8, '#ffd58b', 120, 0.45, 1.8);
            state.shake = Math.max(state.shake, 5);
            crashSound(0.7);
          }
        }
      }
      if (car.hitCooldown > 0) car.hitCooldown -= dt;

      // pedestrians under wheels
      if (Math.abs(car.speed) > 55) {
        for (const p of peds) {
          if (p.down > 0) continue;
          if (dist(car.x, car.y, p.x, p.y) < 24) {
            p.down = 6.5;
            commitCrime(1.05, 'Наезд на пешехода!');
            spawnParticles(p.x, p.y, 6, '#8a2630', 70, 0.5, 1.7);
            state.shake = Math.max(state.shake, 5);
            crashSound(0.5);
          }
        }
      }

      if (state.health <= 0 || state.mode !== 'playing') return;
    } else {
      player.moving = Math.hypot(input.x, input.y) > 0.08;
      if (player.moving) {
        const sprint = input.sprint;
        const speed = sprint ? 258 : 158;
        movePlayer(input.x * speed * dt, input.y * speed * dt);
        player.angle = Math.atan2(input.y, input.x);
        player.walkPhase += dt * (sprint ? 15 : 9.5);
      } else {
        player.walkPhase += dt * 2;
      }

      // being hit by traffic
      for (const c of cars) {
        if (!c.isTraffic || c.dead) continue;
        if (dist(c.x, c.y, player.x, player.y) < 30 && Math.abs(c.speed) > 45 && c.hitCooldown <= 0) {
          c.hitCooldown = 1.4;
          damagePlayer(13);
          const push = c.angle + (Math.random() < 0.5 ? 0.6 : -0.6);
          movePlayer(Math.cos(push) * 22, Math.sin(push) * 22);
          state.shake = Math.max(state.shake, 10);
          spawnParticles(player.x, player.y, 6, '#d7d7d7', 70, 0.4, 1.5);
          crashSound(0.6);
          toast('Смотри по сторонам!', 'warn', 1800);
          break;
        }
      }
      for (const c of cars) if (c.hitCooldown > 0) c.hitCooldown -= dt;

      if (state.health <= 0 || state.mode !== 'playing') return;
    }

    // pickups are handled in updatePickups
  }

  // ============================================================
  //  UPDATE: TRAFFIC / PEDS
  // ============================================================

  function updateTraffic(dt) {
    for (const car of cars) {
      if (!car.isTraffic || car.dead) continue;

      // slow down behind the player on the same lane, mostly to avoid ugly overlaps
      let target = car.baseSpeed;
      if (player.inCar && player.inCar !== car) {
        const d = dist(player.inCar.x, player.inCar.y, car.x, car.y);
        if (d < 95) {
          const toPlayer = Math.atan2(player.inCar.y - car.y, player.inCar.x - car.x);
          if (Math.abs(angleWrap(toPlayer - car.angle)) < 0.7) target *= 0.55;
        }
      }
      car.speed += (target - car.speed) * Math.min(1, dt * 1.5);
      car.x += Math.cos(car.angle) * car.speed * dt;
      car.y += Math.sin(car.angle) * car.speed * dt;

      if (car.axis === 'v') {
        if (car.y < -100) car.y = WORLD.h + 100;
        if (car.y > WORLD.h + 100) car.y = -100;
      } else {
        if (car.x < -100) car.x = WORLD.w + 100;
        if (car.x > WORLD.w + 100) car.x = -100;
      }
    }
  }

  function updatePeds(dt) {
    for (const p of peds) {
      if (p.down > 0) {
        p.down -= dt;
        if (p.down <= 0) {
          const spot = randomSidewalkPoint(false);
          p.x = spot.x;
          p.y = spot.y;
          p.down = 0;
          p.idle = rand(2, 0.5);
        }
        continue;
      }

      p.phase += dt * (p.flee > 0 ? 16 : 7);
      if (p.flee > 0) {
        p.flee -= dt;
        const away = Math.atan2(p.y - player.y, p.x - player.x);
        p.angle = away + Math.sin(p.phase * 0.3) * 0.3;
        p.speed = 55;
      } else {
        p.idle -= dt;
        if (p.idle <= 0) {
          p.idle = rand(5.5, 1.4);
          p.angle = rand(TAU);
          if (Math.random() < 0.35) p.speed = 0;
          else p.speed = 12 + Math.random() * 24;
        }
      }

      const nx = p.x + Math.cos(p.angle) * p.speed * dt;
      const ny = p.y + Math.sin(p.angle) * p.speed * dt;
      if (circleHitsSolid(nx, ny, 7)) {
        p.angle += Math.PI / 2 + rand(0.8, -0.8);
        p.idle = rand(1.2, 0.2);
      } else {
        p.x = nx;
        p.y = ny;
      }
    }
  }

  // ============================================================
  //  UPDATE: POLICE
  // ============================================================

  function spawnCopNear() {
    if (cops.length >= 3) return;
    const p = randomRoadPoint(620, player);
    if (dist(p.x, p.y, player.x, player.y) < 420) return;
    cops.push({
      x: p.x,
      y: p.y,
      angle: Math.atan2(player.y - p.y, player.x - p.x),
      w: 31,
      l: 62,
      color: '#e6edf5',
      type: 'sedan',
      speed: 170,
      health: 120,
      stuck: 0,
      hitCooldown: 0,
      phase: rand(TAU),
      dead: false,
    });
    tone(880, 0.22, 'triangle', 0.025, 540);
    window.setTimeout(() => tone(610, 0.22, 'triangle', 0.02, 850), 220);
  }

  function updatePolice(dt) {
    if (state.wanted <= 0) {
      cops = [];
      return;
    }

    const desired = state.wanted >= 4 ? 3 : state.wanted >= 1.8 ? 2 : 1;
    copSpawnTimer -= dt;
    if (cops.length < desired && copSpawnTimer <= 0) {
      spawnCopNear();
      copSpawnTimer = 3 + Math.random() * 2.5;
    }

    const target = player.inCar || player;

    for (const cop of cops) {
      if (cop.dead) continue;

      const dx = target.x - cop.x;
      const dy = target.y - cop.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const desiredAngle = Math.atan2(dy, dx);
      const diff = angleWrap(desiredAngle - cop.angle);
      const turn = 2.15 * dt;
      cop.angle += clamp(diff, -turn, turn);

      const targetSpeed = 235 + state.wanted * 23;
      cop.speed += clamp(targetSpeed - cop.speed, -260 * dt, 150 * dt);

      const nx = cop.x + Math.cos(cop.angle) * cop.speed * dt;
      const ny = cop.y + Math.sin(cop.angle) * cop.speed * dt;

      if (carCollides(nx, ny, cop.angle, cop)) {
        cop.stuck += dt;
        cop.speed *= 0.75;
        cop.angle += (Math.sin(elapsed * 2 + cop.phase) > 0 ? 1 : -1) * 1.3 * dt;
        if (cop.stuck > 2.1) {
          const p = randomRoadPoint(280, player);
          cop.x = p.x;
          cop.y = p.y;
          cop.angle = Math.atan2(player.y - p.y, player.x - p.x);
          cop.stuck = 0;
        }
      } else {
        cop.x = nx;
        cop.y = ny;
        cop.stuck = Math.max(0, cop.stuck - dt * 0.4);
      }

      if (cop.hitCooldown > 0) cop.hitCooldown -= dt;

      const dPlayer = dist(cop.x, cop.y, player.x, player.y);
      if (dPlayer < 52) {
        if (player.inCar) {
          damageCar(player.inCar, 24 * dt);
          damagePlayer(7 * dt);
          if (cop.hitCooldown <= 0) {
            damageCar(player.inCar, 4);
            cop.hitCooldown = 0.8;
            state.shake = Math.max(state.shake, 7);
            spawnParticles((cop.x + player.x) / 2, (cop.y + player.y) / 2, 6, '#b8d8ff', 100, 0.4, 1.6);
            crashSound(0.45);
          }
        } else {
          damagePlayer(24 * dt);
          if (cop.hitCooldown <= 0) {
            cop.hitCooldown = 0.9;
            spawnParticles(player.x, player.y, 5, '#ff6a6a', 80, 0.35, 1.4);
            state.shake = Math.max(state.shake, 5);
          }
        }
      }

      // player can ram police cars
      if (player.inCar && dPlayer < 50 && player.inCar.hitCooldown <= 0 && Math.abs(player.inCar.speed) > 60) {
        cop.health -= 18;
        cop.hitCooldown = 0.8;
        player.inCar.hitCooldown = 0.8;
        player.inCar.speed *= 0.7;
        state.shake = Math.max(state.shake, 8);
        spawnParticles(cop.x, cop.y, 7, '#ffd58b', 110, 0.45, 1.7);
        crashSound(0.8);
        commitCrime(0.18, '');
        if (cop.health <= 0) {
          cop.dead = true;
          spawnParticles(cop.x, cop.y, 12, '#ff9b42', 140, 0.7, 2.6);
        }
      }

      if (state.health <= 0 || state.mode !== 'playing') return;
    }

    cops = cops.filter((c) => !c.dead);
  }

  function updateWanted(dt) {
    if (state.crimeTimer > 0) state.crimeTimer -= dt;

    let previousStars = Math.ceil(state.wanted);
    if (state.wanted > 0) {
      let nearest = Infinity;
      for (const c of cops) nearest = Math.min(nearest, dist(c.x, c.y, player.x, player.y));
      if (state.crimeTimer <= 0 && nearest > 430) {
        state.wanted = Math.max(0, state.wanted - dt * 0.06);
      }
    }

    const stars = Math.min(5, Math.ceil(state.wanted));
    if (stars < Math.min(5, previousStars)) {
      if (stars === 0) toast('Погоня прекращена. Полиция потеряла след.', 'info', 3000);
      else toast(`Розыск снижен: ${stars} ★`, 'info', 2200);
    }
    state.lastStars = stars;
  }

  // ============================================================
  //  UPDATE: PICKUPS / FX
  // ============================================================

  function updatePickups(dt) {
    const px = player.x;
    const py = player.y;

    for (const p of pickups) {
      if (!p.active) {
        p.cooldown -= dt;
        if (p.cooldown <= 0) {
          const spot = randomSidewalkPoint(false);
          p.x = spot.x;
          p.y = spot.y;
          p.active = true;
          p.bob = rand(TAU);
        }
        continue;
      }

      p.bob += dt * 2.2;
      const d = dist(px, py, p.x, p.y);
      if (d > 30) continue;

      p.active = false;
      p.cooldown = 85 + Math.random() * 30;

      if (p.type === 'cash') {
        state.money += p.value;
        floatText(p.x, p.y - 16, `+${fmtMoney(p.value)} ₽`, '#7dff9b', 12);
        cashSound();
      } else if (p.type === 'health') {
        state.health = Math.min(100, state.health + 38);
        floatText(p.x, p.y - 16, '+38 ♥', '#ff7474', 12);
        tone(520, 0.12, 'sine', 0.04, 760);
      } else if (p.type === 'armor') {
        state.armor = Math.min(100, state.armor + 45);
        floatText(p.x, p.y - 16, '+45 ◆', '#7dbdff', 12);
        tone(420, 0.16, 'triangle', 0.04, 620);
      }
      updateHUD(true);
    }
  }

  function updateParticles(dt) {
    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.exp(-p.drag * dt);
      p.vy *= Math.exp(-p.drag * dt);
      p.vy += p.gravity * dt;
    }
    particles = particles.filter((p) => p.life > 0);

    for (const f of floaters) {
      f.life -= dt;
      f.y -= 26 * dt;
    }
    floaters = floaters.filter((f) => f.life > 0);

    for (const w of wrecks) w.age += dt;
  }

  // ============================================================
  //  UPDATE: CAMERA / TIME / MAIN LOOP
  // ============================================================

  function updateCamera(dt) {
    let tx = player.x;
    let ty = player.y;

    if (player.inCar) {
      const car = player.inCar;
      const lead = clamp(car.speed * 0.28, -80, 100);
      tx = car.x + Math.cos(car.angle) * lead;
      ty = car.y + Math.sin(car.angle) * lead;
    }

    const k = 1 - Math.exp(-6.5 * dt);
    cam.x = lerp(cam.x, tx, k);
    cam.y = lerp(cam.y, ty, k);

    const hw = view.w / (2 * view.zoom);
    const hh = view.h / (2 * view.zoom);
    if (hw * 2 >= WORLD.w) cam.x = WORLD.w / 2;
    else cam.x = clamp(cam.x, hw, WORLD.w - hw);
    if (hh * 2 >= WORLD.h) cam.y = WORLD.h / 2;
    else cam.y = clamp(cam.y, hh, WORLD.h - hh);

    state.shake = Math.max(0, state.shake - dt * 26);
  }

  function updateTitleCamera() {
    cam.x = 1950 + Math.sin(elapsed * 0.07) * 400;
    cam.y = 1280 + Math.cos(elapsed * 0.055) * 250;
  }

  function update(dt) {
    state.playSeconds += dt;
    state.time += dt * 0.9;
    if (state.time >= 1440) {
      state.time -= 1440;
      state.day += 1;
      toast(`Новый день · День ${state.day}`, 'info', 2600);
    }

    updatePlayer(dt);
    if (state.mode !== 'playing') return;
    updateTraffic(dt);
    updatePolice(dt);
    if (state.mode !== 'playing') return;
    updatePeds(dt);
    updatePickups(dt);
    updateMission(dt);
    updateWanted(dt);
    updateParticles(dt);
    updateCamera(dt);
    updateAudio();

    if (mission && mission.type === 'theft' && mission.car && mission.car.dead) {
      failMission('Машина по заказу уничтожена.');
    }
    cars = cars.filter((c) => !c.dead);

    state.hudTimer -= dt;
    if (state.hudTimer <= 0) {
      updateHUD();
      updateObjectiveUI();
      updateHint();
      state.hudTimer = 0.12;
    }

    state.saveTimer -= dt;
    if (state.saveTimer <= 0) {
      state.saveTimer = 70;
      saveGame(true);
    }
  }

  // ============================================================
  //  BUSTED
  // ============================================================

  function busted(reason = 'Вас задержали') {
    if (state.mode !== 'playing') return;
    state.mode = 'busted';
    state.health = 0;
    state.wanted = 0;
    state.crimeTimer = 0;
    state.lastStars = 0;
    cops = [];

    if (player.inCar) {
      player.inCar.speed = 0;
      player.inCar = null;
    }
    if (mission) {
      if (mission.type === 'theft' && mission.car) mission.car.theft = false;
      mission = null;
      passenger = null;
    }

    const loss = Math.min(state.money, Math.round(300 + state.money * 0.14));
    state.money = Math.max(0, state.money - loss);

    ui.bustedKicker.textContent = 'ВАС ЗАДЕРЖАЛИ';
    ui.bustedTitle.textContent = reason;
    ui.bustedText.textContent = loss > 0
      ? `Полиция доставила вас в участок. Штраф: ${fmtMoney(loss)} ₽.`
      : 'Полиция доставила вас в участок. На этот раз обошлось без штрафа.';
    ui.screenBusted.classList.remove('hidden');
    ui.hud.classList.add('hidden');
    ui.toastWrap.innerHTML = '';

    const bar = ui.bustedTimer;
    bar.style.transition = 'none';
    bar.style.width = '100%';
    void bar.offsetWidth;
    bar.style.transition = 'width 4s linear';
    bar.style.width = '0%';

    tone(180, 0.5, 'sawtooth', 0.04, 90);
    window.setTimeout(() => {
      if (state.mode !== 'busted') return;
      state.mode = 'playing';
      state.health = 100;
      state.armor = 0;
      player.inCar = null;
      player.x = HOSPITAL.x;
      player.y = HOSPITAL.y;
      player.angle = Math.PI / 2;
      cam.x = HOSPITAL.x;
      cam.y = HOSPITAL.y;
      ui.screenBusted.classList.add('hidden');
      ui.hud.classList.remove('hidden');
      updateHUD(true);
      updateObjectiveUI(true);
      updateHint(true);
      saveGame(true);
      toast('Вы на свободе. Машина осталась там, где вы её бросили.', 'info', 4000);
    }, 4200);
  }

  // ============================================================
  //  HUD
  // ============================================================

  function updateHUD(force = false) {
    const hp = clamp(state.health, 0, 100);
    const armor = clamp(state.armor, 0, 100);
    ui.healthFill.style.transform = `scaleX(${hp / 100})`;
    ui.armorFill.style.transform = `scaleX(${armor / 100})`;
    ui.healthText.textContent = Math.round(hp);
    ui.armorText.textContent = Math.round(armor);

    ui.money.innerHTML = `${fmtMoney(state.money)} <span>₽</span>`;
    ui.clock.textContent = fmtTime(state.time);
    ui.daylabel.textContent = `День ${state.day}`;
    ui.rank.textContent = getRank();

    const stars = Math.min(5, Math.ceil(state.wanted));
    let html = '';
    for (let i = 0; i < 5; i += 1) {
      html += `<span class="${i < stars ? 'on' : ''}">★</span>`;
    }
    ui.stars.innerHTML = html;

    if (player.inCar) {
      ui.speedo.classList.remove('hidden');
      const kmh = Math.round(Math.abs(player.inCar.speed) * 0.36);
      ui.speedValue.textContent = kmh;
      const deg = clamp(kmh * 1.75, 0, 300);
      ui.speedRing.style.background = `radial-gradient(circle at 50% 50%, rgba(8,11,16,.95) 54%, transparent 56%), conic-gradient(var(--yellow) 0deg, var(--yellow) ${deg}deg, rgba(255,255,255,.09) ${deg}deg)`;
      ui.carHpFill.style.transform = `scaleX(${clamp(player.inCar.health / 100, 0, 1)})`;
    } else {
      ui.speedo.classList.add('hidden');
    }
  }

  function updateObjectiveUI(force = false) {
    if (!mission) {
      ui.objective.classList.add('hidden');
      return;
    }
    const target = currentTarget();
    if (!target) {
      ui.objective.classList.add('hidden');
      return;
    }
    const d = dist(player.x, player.y, target.x, target.y);
    let kicker = 'ЗАДАНИЕ';
    let title = '';
    let sub = '';
    let progress = 30;

    if (mission.type === 'taxi') {
      kicker = 'ЗАКАЗ ТАКСИ';
      if (mission.stage === 'pickup') {
        title = 'Заберите клиента';
        sub = `Клиент ждёт · ${fmtDist(d)}`;
        progress = 28;
      } else {
        title = `Отвезите клиента: ${mission.place}`;
        sub = `Клиент в машине · ${fmtDist(d)}`;
        progress = 68;
      }
    } else {
      kicker = 'ЗАКАЗ НА УГОН';
      if (mission.stage === 'pickup') {
        const carName = mission.car ? `${mission.car.colorName} ${mission.car.model}` : 'машину';
        title = `Угоните ${carName}`;
        sub = `Машина отмечена на карте · ${fmtDist(d)}`;
        progress = 30;
      } else {
        title = 'Доставьте машину в гараж';
        sub = `Не разбейте её · ${fmtDist(d)}`;
        progress = 72;
      }
    }

    ui.objective.classList.remove('hidden');
    ui.objectiveKicker.textContent = kicker;
    ui.objectiveTitle.textContent = title;
    ui.objectiveSub.textContent = sub;
    ui.objectiveProgress.style.width = `${progress}%`;
  }

  function computeHint() {
    if (state.mode !== 'playing') return '';

    if (mission) {
      if (mission.type === 'taxi') {
        if (mission.stage === 'pickup') {
          if (player.inCar && passenger) {
            const d = dist(player.inCar.x, player.inCar.y, passenger.x, passenger.y);
            if (d < 120) {
              if (d > 74) return 'Подъедьте ближе к клиенту';
              return Math.abs(player.inCar.speed) < 32
                ? 'Клиент садится в машину…'
                : 'Сбросьте скорость возле клиента';
            }
          } else if (!player.inCar && passenger) {
            const d = dist(player.x, player.y, passenger.x, passenger.y);
            if (d < 100) return 'Клиенту нужна машина. Вернитесь за руль.';
          }
        } else if (player.inCar) {
          const d = dist(player.inCar.x, player.inCar.y, mission.drop.x, mission.drop.y);
          if (d < 130) {
            if (d > 82) return 'Подъедьте ближе к маркеру';
            return Math.abs(player.inCar.speed) < 34
              ? 'Остановитесь, чтобы высадить клиента'
              : 'Сбросьте скорость у маркера';
          }
        } else {
          return 'Клиент ждёт в машине. Вернитесь за руль.';
        }
        return '';
      }

      if (mission.type === 'theft') {
        if (mission.stage === 'pickup' && mission.car) {
          const d = dist(player.x, player.y, mission.car.x, mission.car.y);
          if (!player.inCar && d < 110) return '<kbd>E</kbd> — угнать машину по заказу';
          if (player.inCar && player.inCar !== mission.car) return 'Это не та машина. Найдите отмеченное авто.';
          return '';
        }
        if (mission.stage === 'deliver') {
          if (player.inCar === mission.car) {
            const d = dist(player.x, player.y, GARAGE.x, GARAGE.y);
            if (d < 140) {
              if (d > 88) return 'Заезжайте в зону доставки';
              return Math.abs(player.inCar.speed) < 38
                ? 'Остановитесь в зоне доставки'
                : 'Сбросьте скорость в гараже';
            }
            return '';
          }
          return 'Заказ ждёт свою машину. Вернитесь за руль.';
        }
      }
      return '';
    }

    if (dist(player.x, player.y, TAXI.x, TAXI.y) < 82) {
      return '<kbd>E</kbd> — взять заказ «Такси»';
    }
    if (dist(player.x, player.y, THEFT.x, THEFT.y) < 82) {
      return '<kbd>E</kbd> — взять заказ на угон';
    }
    if (dist(player.x, player.y, GARAGE.x, GARAGE.y) < 88) {
      return 'Здесь принимают машины по заказу';
    }

    if (player.inCar) {
      if (Math.abs(player.inCar.speed) < 14) return '<kbd>E</kbd> — выйти из машины';
      return '';
    }

    const near = nearestEnterableCar();
    if (near.car && near.dist < 100) {
      return near.car.isTraffic
        ? '<kbd>E</kbd> — угнать машину'
        : '<kbd>E</kbd> — сесть в машину';
    }
    return '';
  }

  function updateHint(force = false) {
    const text = computeHint();
    if (!force && text === state.hintText) return;
    state.hintText = text;
    if (!text) {
      ui.hint.classList.add('hidden');
      return;
    }
    ui.hint.innerHTML = text;
    ui.hint.classList.remove('hidden');
  }


  // ============================================================
  //  RENDER: VEHICLES / PEOPLE / PICKUPS / MARKERS
  // ============================================================

  function inView(x, y, margin = 140, rcx = cam.x, rcy = cam.y) {
    return Math.abs(x - rcx) < view.w / (2 * view.zoom) + margin &&
      Math.abs(y - rcy) < view.h / (2 * view.zoom) + margin;
  }

  function drawVehicle(car, options = {}) {
    const c = ctx;
    const w = car.w;
    const l = car.l;
    const color = car.color || '#22262d';
    const wrecked = !!options.wrecked;

    c.save();
    c.translate(car.x, car.y);
    c.rotate(car.angle);

    // shadow
    c.fillStyle = 'rgba(0,0,0,0.4)';
    rr(c, -l / 2 + 3, -w / 2 + 6, l, w, 9);
    c.fill();

    if (wrecked) {
      c.fillStyle = '#101114';
      rr(c, -l / 2, -w / 2, l, w, 8);
      c.fill();
      c.strokeStyle = 'rgba(255,120,40,0.13)';
      c.lineWidth = 1.5;
      c.stroke();
      c.fillStyle = '#1c1d20';
      rr(c, -l * 0.12, -w / 2 + 4, l * 0.34, w - 8, 4);
      c.fill();
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.beginPath();
      c.arc(l * 0.1, -w * 0.12, 3, 0, TAU);
      c.fill();
      c.restore();
      return;
    }

    // wheels
    c.fillStyle = '#070809';
    for (const wx of [-l * 0.31, l * 0.31]) {
      for (const wy of [-w / 2 + 1, w / 2 - 1]) {
        rr(c, wx - 6, wy - 2.5, 12, 5, 2);
        c.fill();
      }
    }

    // body
    const grad = c.createLinearGradient(0, -w / 2, 0, w / 2);
    grad.addColorStop(0, shade(color, 0.23));
    grad.addColorStop(0.42, color);
    grad.addColorStop(1, shade(color, -0.38));
    c.fillStyle = grad;
    rr(c, -l / 2, -w / 2, l, w, 8);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.12)';
    c.lineWidth = 1;
    c.stroke();

    // cabin
    const cabinL = l * 0.44;
    const cabinX = -l * 0.05;
    c.fillStyle = shade(color, -0.28);
    rr(c, cabinX - cabinL / 2, -w / 2 + 3.5, cabinL, w - 7, 5);
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.28)';
    c.stroke();

    // windshield + rear window
    c.fillStyle = 'rgba(122,168,196,0.34)';
    rr(c, cabinX + cabinL * 0.23, -w / 2 + 5, cabinL * 0.17, w - 10, 2.5);
    c.fill();
    c.fillStyle = 'rgba(100,142,168,0.25)';
    rr(c, cabinX - cabinL * 0.4, -w / 2 + 5, cabinL * 0.14, w - 10, 2.5);
    c.fill();

    // side windows
    c.fillStyle = 'rgba(140,190,215,0.17)';
    c.fillRect(cabinX - cabinL * 0.19, -w / 2 + 3.5, cabinL * 0.38, 2);
    c.fillRect(cabinX - cabinL * 0.19, w / 2 - 5.5, cabinL * 0.38, 2);

    // hood & trunk seams
    c.strokeStyle = 'rgba(0,0,0,0.25)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(l * 0.24, -w / 2 + 4);
    c.lineTo(l * 0.24, w / 2 - 4);
    c.moveTo(-l * 0.4, -w / 2 + 4);
    c.lineTo(-l * 0.4, w / 2 - 4);
    c.stroke();

    // mirrors
    c.fillStyle = shade(color, -0.2);
    c.fillRect(cabinX + cabinL * 0.48, -w / 2 - 2, 5, 3);
    c.fillRect(cabinX + cabinL * 0.48, w / 2 - 1, 5, 3);

    // lights
    c.fillStyle = '#ffe6a3';
    c.fillRect(l / 2 - 4, -w / 2 + 4, 3, 5);
    c.fillRect(l / 2 - 4, w / 2 - 9, 3, 5);
    c.fillStyle = '#d83939';
    c.fillRect(-l / 2 + 1, -w / 2 + 5, 2.5, 4);
    c.fillRect(-l / 2 + 1, w / 2 - 9, 2.5, 4);

    if (car.type === 'van') {
      c.fillStyle = 'rgba(255,255,255,0.06)';
      c.fillRect(-l * 0.3, -w / 2 + 3, l * 0.15, w - 6);
    }

    if (options.taxi) {
      c.fillStyle = 'rgba(255,196,0,0.8)';
      c.fillRect(-l * 0.25, -w / 2 + 2, l * 0.5, 2);
    }

    // police livery
    if (options.police) {
      c.fillStyle = 'rgba(30,72,138,0.68)';
      c.fillRect(-l * 0.38, -w / 2 + 2, l * 0.76, 4);
      c.fillRect(-l * 0.38, w / 2 - 6, l * 0.76, 4);
      c.fillStyle = '#dce7f2';
      c.fillRect(-l * 0.16, -w / 2 + 3, l * 0.32, w - 6);

      const on = Math.sin(elapsed * 15 + (car.phase || 0)) > 0;
      c.save();
      c.shadowBlur = 10;
      c.shadowColor = on ? '#ff3535' : '#3d8bff';
      c.fillStyle = on ? '#ff3535' : '#3d8bff';
      rr(c, -4, -w / 2 + 4, 8, w - 8, 2);
      c.fill();
      c.restore();
    }

    c.restore();
  }

  function drawWreck(w) {
    drawVehicle(w, { wrecked: true });
    const c = ctx;
    const age = w.age || 0;
    if (age < 20) {
      c.save();
      c.globalAlpha = clamp(1 - age / 20, 0, 0.5);
      c.fillStyle = '#25272a';
      for (let i = 0; i < 3; i += 1) {
        const yy = w.y - 8 - i * 9 - ((age * 8 + i * 14) % 24);
        c.beginPath();
        c.arc(w.x + Math.sin(age * 1.5 + i) * 6, yy, 5 + i * 2, 0, TAU);
        c.fill();
      }
      c.restore();
    }
  }

  function drawPerson(x, y, angle, phase, shirt, options = {}) {
    const c = ctx;
    const down = !!options.down;
    const isPlayer = !!options.player;
    const scale = options.scale || 1;

    c.save();
    c.translate(x, y);

    // shadow
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath();
    c.ellipse(2, 4, 9 * scale, 5 * scale, 0, 0, TAU);
    c.fill();

    if (down) {
      c.rotate(1.1);
      c.fillStyle = shirt;
      rr(c, -9 * scale, -4 * scale, 18 * scale, 8 * scale, 4 * scale);
      c.fill();
      c.fillStyle = '#c99c78';
      c.beginPath();
      c.arc(11 * scale, 0, 4 * scale, 0, TAU);
      c.fill();
      c.fillStyle = '#24272c';
      c.fillRect(-8 * scale, 3 * scale, 6 * scale, 2.5 * scale);
      c.restore();
      return;
    }

    const fx = Math.cos(angle);
    const fy = Math.sin(angle);
    const px = -fy;
    const py = fx;
    const swing = Math.sin(phase) * (isPlayer ? 3.2 : 2);

    // legs
    c.fillStyle = isPlayer ? '#11151b' : '#22262c';
    c.beginPath();
    c.ellipse(fx * 1.5 + px * 3 + fx * swing, fy * 1.5 + py * 3 + fy * swing, 2.6 * scale, 2.1 * scale, angle, 0, TAU);
    c.fill();
    c.beginPath();
    c.ellipse(fx * 1.5 - px * 3 - fx * swing, fy * 1.5 - py * 3 - fy * swing, 2.6 * scale, 2.1 * scale, angle, 0, TAU);
    c.fill();

    // arms
    c.strokeStyle = isPlayer ? '#1d222a' : shirt;
    c.lineWidth = 2.2 * scale;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(px * 5, py * 5);
    c.lineTo(px * 8 - fx * 2 + fx * swing * 0.3, py * 8 - fy * 2 + fy * swing * 0.3);
    c.moveTo(-px * 5, -py * 5);
    c.lineTo(-px * 8 - fx * 2 - fx * swing * 0.3, -py * 8 - fy * 2 - fy * swing * 0.3);
    c.stroke();

    // torso
    c.fillStyle = isPlayer ? '#181c23' : shirt;
    c.beginPath();
    c.ellipse(0, 0, 7.2 * scale, 6.2 * scale, angle, 0, TAU);
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.32)';
    c.lineWidth = 1;
    c.stroke();

    if (isPlayer) {
      c.strokeStyle = '#ffc400';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, 0, 6.4 * scale, angle + 0.5, angle + 1.9);
      c.stroke();
      c.fillStyle = '#ffc400';
      c.beginPath();
      c.arc(-fx * 2 + px * 4.2, -fy * 2 + py * 4.2, 1.2, 0, TAU);
      c.fill();
    }

    // head
    const hx = fx * 5.2 * scale;
    const hy = fy * 5.2 * scale;
    c.fillStyle = '#c99c78';
    c.beginPath();
    c.arc(hx, hy, 4.4 * scale, 0, TAU);
    c.fill();
    c.fillStyle = isPlayer ? '#181a1e' : '#2a2420';
    c.beginPath();
    c.arc(hx - fx * 1.1, hy - fy * 1.1, 3.9 * scale, angle + Math.PI * 0.55, angle + Math.PI * 1.5);
    c.fill();

    if (options.suitcase) {
      c.fillStyle = '#6d4f32';
      rr(c, -6 * scale, 7 * scale, 8 * scale, 6 * scale, 2);
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.18)';
      c.stroke();
    }

    c.restore();
  }

  function drawPickup(p) {
    const t = elapsed;
    const bob = Math.sin(t * 2.4 + p.bob) * 2.5;
    const inv = 1 / view.zoom;

    ctx.save();
    ctx.translate(p.x, p.y);

    // ground glow
    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 24 * inv);
    const glowColor = p.type === 'cash' ? '87,255,150' : p.type === 'health' ? '255,90,90' : '100,170,255';
    glow.addColorStop(0, `rgba(${glowColor},0.22)`);
    glow.addColorStop(1, `rgba(${glowColor},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 24 * inv, 0, TAU);
    ctx.fill();

    ctx.translate(0, -9 + bob);
    ctx.scale(inv, inv);
    ctx.shadowBlur = 12;

    if (p.type === 'cash') {
      ctx.shadowColor = 'rgba(87,255,150,0.55)';
      ctx.fillStyle = '#173d28';
      ctx.strokeStyle = 'rgba(120,255,170,0.8)';
      ctx.lineWidth = 1.2;
      rr(ctx, -9, -6, 18, 12, 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#8dffb0';
      ctx.font = '800 9px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₽', 0, 1);
    } else if (p.type === 'health') {
      ctx.shadowColor = 'rgba(255,90,90,0.55)';
      ctx.fillStyle = '#f3f4f5';
      rr(ctx, -8, -8, 16, 16, 3);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#e63946';
      ctx.fillRect(-2, -5.5, 4, 11);
      ctx.fillRect(-5.5, -2, 11, 4);
    } else {
      ctx.shadowColor = 'rgba(100,170,255,0.55)';
      ctx.fillStyle = '#19365c';
      ctx.strokeStyle = 'rgba(120,190,255,0.85)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(8, -2);
      ctx.lineTo(6, 7);
      ctx.lineTo(0, 10);
      ctx.lineTo(-6, 7);
      ctx.lineTo(-8, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '800 8px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◆', 0, 1);
    }

    ctx.restore();
  }

  function drawWorldMarker(x, y, color, letter, label = '', big = false) {
    const inv = 1 / view.zoom;
    const pulse = (Math.sin(elapsed * 3.4) + 1) / 2;
    const c = ctx;

    c.save();
    c.translate(x, y);

    // ground rings
    c.strokeStyle = rgba(color, 0.25 + pulse * 0.4);
    c.lineWidth = 2.2 * inv;
    c.beginPath();
    c.arc(0, 0, (big ? 34 : 25) * inv + pulse * 6 * inv, 0, TAU);
    c.stroke();

    c.fillStyle = rgba(color, 0.07 + pulse * 0.05);
    c.beginPath();
    c.arc(0, 0, (big ? 28 : 21) * inv, 0, TAU);
    c.fill();

    // icon
    const bob = Math.sin(elapsed * 2.6) * 3;
    c.translate(0, -(46 + bob) * inv);
    c.scale(inv, inv);

    c.fillStyle = color;
    c.strokeStyle = 'rgba(4,7,11,0.85)';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, 13, 0, TAU);
    c.fill();
    c.stroke();

    c.beginPath();
    c.moveTo(-5, 10);
    c.lineTo(0, 18);
    c.lineTo(5, 10);
    c.closePath();
    c.fill();

    c.fillStyle = '#080b10';
    c.font = '800 11px "Segoe UI", sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(letter, 0, 0);

    if (label) {
      c.font = '700 7px "Segoe UI", sans-serif';
      c.fillStyle = 'rgba(255,255,255,0.8)';
      c.textBaseline = 'alphabetic';
      c.fillText(label, 0, -20);
    }

    c.restore();
  }

  function drawMarkers() {
    if (mission) {
      const target = currentTarget();
      if (!target) return;
      let letter = 'Ц';
      let label = 'ЦЕЛЬ';
      let color = '#ffc400';
      if (mission.type === 'taxi') {
        letter = mission.stage === 'pickup' ? 'К' : 'Ф';
        label = mission.stage === 'pickup' ? 'КЛИЕНТ' : mission.place.toUpperCase();
      } else {
        letter = mission.stage === 'pickup' ? 'У' : 'Г';
        label = mission.stage === 'pickup' ? 'УГНАТЬ' : 'ГАРАЖ';
      }
      drawWorldMarker(target.x, target.y, color, letter, label, true);
      return;
    }

    drawWorldMarker(TAXI.x, TAXI.y, TAXI.color, TAXI.letter, TAXI.label);
    drawWorldMarker(THEFT.x, THEFT.y, THEFT.color, THEFT.letter, THEFT.label);
    drawWorldMarker(GARAGE.x, GARAGE.y, GARAGE.color, GARAGE.letter, GARAGE.label);
  }

  function drawEntities() {
    const items = [];

    for (const car of cars) {
      if (car.dead) continue;
      if (!inView(car.x, car.y, 130)) continue;
      items.push({ y: car.y, draw: () => drawVehicle(car) });
    }

    for (const p of peds) {
      if (!inView(p.x, p.y, 60)) continue;
      items.push({
        y: p.y,
        draw: () => drawPerson(p.x, p.y, p.angle, p.phase, p.shirt, { down: p.down > 0, scale: 0.92 }),
      });
    }

    for (const cop of cops) {
      if (!inView(cop.x, cop.y, 120)) continue;
      items.push({ y: cop.y, draw: () => drawVehicle(cop, { police: true }) });
    }

    if (passenger && mission && mission.stage === 'pickup' && mission.type === 'taxi') {
      items.push({
        y: passenger.y,
        draw: () => drawPerson(passenger.x, passenger.y, passenger.angle, elapsed * 2, '#46566a', { suitcase: true }),
      });
    }

    if (!player.inCar) {
      items.push({
        y: player.y,
        draw: () => drawPerson(player.x, player.y, player.angle, player.walkPhase, '#181c23', { player: true }),
      });
    }

    items.sort((a, b) => a.y - b.y);
    for (const item of items) item.draw();
  }

  function drawParticles() {
    const c = ctx;
    c.save();
    for (const p of particles) {
      if (!inView(p.x, p.y, 50)) continue;
      c.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, p.size, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;
    c.restore();
  }

  function drawFloaters() {
    const c = ctx;
    c.save();
    c.textAlign = 'center';
    for (const f of floaters) {
      const alpha = clamp(f.life / f.maxLife, 0, 1);
      c.globalAlpha = alpha;
      c.font = `800 ${f.size / view.zoom}px "Segoe UI", sans-serif`;
      c.lineWidth = 3 / view.zoom;
      c.strokeStyle = 'rgba(0,0,0,0.7)';
      c.strokeText(f.text, f.x, f.y);
      c.fillStyle = f.color;
      c.fillText(f.text, f.x, f.y);
    }
    c.globalAlpha = 1;
    c.restore();
  }


  // ============================================================
  //  LIGHTING
  // ============================================================

  function getDarkness(minutes) {
    const h = (((minutes % 1440) + 1440) % 1440) / 60;
    if (h < 4) return 0.58;
    if (h < 7) return lerp(0.58, 0.04, (h - 4) / 3);
    if (h < 18.2) return 0.04;
    if (h < 21) return lerp(0.04, 0.58, (h - 18.2) / 2.8);
    return 0.58;
  }

  function w2s(x, y, rcx, rcy) {
    return {
      x: (x - rcx) * view.zoom + view.w / 2,
      y: (y - rcy) * view.zoom + view.h / 2,
    };
  }

  function cutCircle(g, x, y, r, strength = 1) {
    if (r <= 0) return;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(0,0,0,${strength})`);
    grad.addColorStop(0.45, `rgba(0,0,0,${strength * 0.55})`);
    grad.addColorStop(0.78, `rgba(0,0,0,${strength * 0.15})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }

  function glowCircle(g, x, y, r, color, strength) {
    if (r <= 0) return;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, rgba(color, strength));
    grad.addColorStop(0.5, rgba(color, strength * 0.35));
    grad.addColorStop(1, rgba(color, 0));
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }

  function drawHeadlightCone(g, car, mode, rcx, rcy) {
    const s = w2s(car.x, car.y, rcx, rcy);
    const angle = car.angle;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const zoom = view.zoom;
    const frontX = s.x + cosA * car.l * 0.43 * zoom;
    const frontY = s.y + sinA * car.l * 0.43 * zoom;
    const isPlayerCar = car === player.inCar;
    const len = (isPlayerCar ? 320 : 245) * zoom;
    const farX = frontX + cosA * len;
    const farY = frontY + sinA * len;
    const px = -sinA;
    const py = cosA;
    const srcHalf = 9 * zoom;
    const farHalf = (isPlayerCar ? 88 : 72) * zoom;

    const grad = g.createLinearGradient(frontX, frontY, farX, farY);
    if (mode === 'cut') {
      grad.addColorStop(0, 'rgba(0,0,0,0.95)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.55)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      grad.addColorStop(0, 'rgba(255,240,195,0.17)');
      grad.addColorStop(0.35, 'rgba(255,228,160,0.08)');
      grad.addColorStop(1, 'rgba(255,228,160,0)');
    }
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(frontX + px * srcHalf, frontY + py * srcHalf);
    g.lineTo(farX + px * farHalf, farY + py * farHalf);
    g.lineTo(farX - px * farHalf, farY - py * farHalf);
    g.lineTo(frontX - px * srcHalf, frontY - py * srcHalf);
    g.closePath();
    g.fill();

    if (mode === 'add') {
      for (const side of [-1, 1]) {
        const hx = frontX + px * side * 7 * zoom;
        const hy = frontY + py * side * 7 * zoom;
        const core = g.createRadialGradient(hx, hy, 0, hx, hy, 22 * zoom);
        core.addColorStop(0, 'rgba(255,248,220,0.5)');
        core.addColorStop(1, 'rgba(255,230,160,0)');
        g.fillStyle = core;
        g.beginPath();
        g.arc(hx, hy, 22 * zoom, 0, TAU);
        g.fill();
      }
    }
  }

  function drawLighting(rcx, rcy) {
    const darkness = getDarkness(state.time);
    const lc = lightCtx;

    if (!lc) return;

    if (darkness > 0.015) {
      lc.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      lc.clearRect(0, 0, view.w, view.h);
      lc.fillStyle = `rgba(3, 7, 14, ${darkness})`;
      lc.fillRect(0, 0, view.w, view.h);
      lc.globalCompositeOperation = 'destination-out';

      // ambient light around the player
      const focus = player.inCar || player;
      const fp = w2s(focus.x, focus.y, rcx, rcy);
      cutCircle(lc, fp.x, fp.y, (player.inCar ? 128 : 92) * view.zoom, 0.92);

      // street lamps
      for (const l of world.lights) {
        if (!inView(l.x, l.y, 210, rcx, rcy)) continue;
        const s = w2s(l.x, l.y, rcx, rcy);
        cutCircle(lc, s.x, s.y, 158 * view.zoom, 0.92);
      }

      // neon signs
      for (const n of world.neons) {
        if (!inView(n.x, n.y, 160, rcx, rcy)) continue;
        const s = w2s(n.x, n.y, rcx, rcy);
        cutCircle(lc, s.x, s.y, (n.big ? 95 : 55) * view.zoom, 0.5);
      }

      // headlights
      for (const car of cars) {
        if (car.dead) continue;
        if (!car.isTraffic && car !== player.inCar) continue;
        if (!inView(car.x, car.y, 360, rcx, rcy)) continue;
        drawHeadlightCone(lc, car, 'cut', rcx, rcy);
      }
      for (const cop of cops) {
        if (!inView(cop.x, cop.y, 300, rcx, rcy)) continue;
        drawHeadlightCone(lc, cop, 'cut', rcx, rcy);
        const s = w2s(cop.x, cop.y, rcx, rcy);
        cutCircle(lc, s.x, s.y, 66 * view.zoom, 0.55);
      }

      lc.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(lightCanvas, 0, 0);
      ctx.restore();
    }

    if (darkness < 0.08) return;

    ctx.save();
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';

    // warm lamp pools
    for (const l of world.lights) {
      if (!inView(l.x, l.y, 190, rcx, rcy)) continue;
      const s = w2s(l.x, l.y, rcx, rcy);
      const r = 148 * view.zoom;
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
      grad.addColorStop(0, `rgba(255,190,110,${0.1 * (darkness / 0.58)})`);
      grad.addColorStop(0.45, `rgba(255,176,90,${0.045 * (darkness / 0.58)})`);
      grad.addColorStop(1, 'rgba(255,176,90,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,226,164,0.55)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.8 * view.zoom, 0, TAU);
      ctx.fill();
    }

    // neon
    for (const n of world.neons) {
      if (!inView(n.x, n.y, 160, rcx, rcy)) continue;
      const s = w2s(n.x, n.y, rcx, rcy);
      const r = (n.big ? 82 : 48) * view.zoom;
      glowCircle(ctx, s.x, s.y, r, n.color, 0.12 * (darkness / 0.58));
    }

    // headlights and tail lights
    for (const car of cars) {
      if (car.dead) continue;
      if (!car.isTraffic && car !== player.inCar) continue;
      if (!inView(car.x, car.y, 360, rcx, rcy)) continue;
      drawHeadlightCone(ctx, car, 'add', rcx, rcy);
    }
    for (const cop of cops) {
      if (!inView(cop.x, cop.y, 300, rcx, rcy)) continue;
      drawHeadlightCone(ctx, cop, 'add', rcx, rcy);

      const s = w2s(cop.x, cop.y, rcx, rcy);
      const phase = Math.sin(elapsed * 13 + cop.phase);
      const col = phase > 0 ? '#ff3838' : '#3d8bff';
      glowCircle(ctx, s.x - 5 * view.zoom, s.y - 3 * view.zoom, 46 * view.zoom, col, 0.22);
    }

    // faint halo around the hero
    const focus = player.inCar || player;
    const fp = w2s(focus.x, focus.y, rcx, rcy);
    glowCircle(ctx, fp.x, fp.y, 62 * view.zoom, '#ffd9a0', 0.035);

    ctx.restore();
  }

  // ============================================================
  //  RENDER: MINIMAP / SCREEN
  // ============================================================

  function drawMinimap(rcx, rcy) {
    if (!world.minimapBase) return;
    const W = minimap.width;
    const H = minimap.height;
    const pad = 16;
    const s = Math.min((W - pad * 2) / WORLD.w, (H - pad * 2) / WORLD.h);
    const ox = (W - WORLD.w * s) / 2;
    const oy = (H - WORLD.h * s) / 2;
    const mx = (x) => ox + x * s;
    const my = (y) => oy + y * s;

    mctx.clearRect(0, 0, W, H);
    mctx.drawImage(world.minimapBase, 0, 0);

    // viewport
    const vw = view.w / view.zoom;
    const vh = view.h / view.zoom;
    mctx.strokeStyle = 'rgba(255,255,255,0.16)';
    mctx.lineWidth = 1;
    mctx.strokeRect(mx(rcx - vw / 2), my(rcy - vh / 2), vw * s, vh * s);

    const dot = (x, y, color, r = 4) => {
      mctx.save();
      mctx.shadowColor = color;
      mctx.shadowBlur = 7;
      mctx.fillStyle = color;
      mctx.beginPath();
      mctx.arc(mx(x), my(y), r, 0, TAU);
      mctx.fill();
      mctx.restore();
    };

    const badge = (x, y, color, letter) => {
      mctx.save();
      mctx.translate(mx(x), my(y));
      mctx.fillStyle = 'rgba(6,9,13,0.92)';
      mctx.strokeStyle = color;
      mctx.lineWidth = 1.7;
      mctx.beginPath();
      mctx.arc(0, 0, 8, 0, TAU);
      mctx.fill();
      mctx.stroke();
      mctx.fillStyle = color;
      mctx.font = '800 8px "Segoe UI", sans-serif';
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      mctx.fillText(letter, 0, 0.5);
      mctx.restore();
    };

    if (mission) {
      const target = currentTarget();
      if (target) {
        const pulse = (Math.sin(elapsed * 4) + 1) / 2;
        mctx.strokeStyle = `rgba(255,196,0,${0.25 + pulse * 0.45})`;
        mctx.lineWidth = 2;
        mctx.beginPath();
        mctx.arc(mx(target.x), my(target.y), 8 + pulse * 5, 0, TAU);
        mctx.stroke();
        dot(target.x, target.y, '#ffc400', 4.2);
      }
    } else {
      badge(TAXI.x, TAXI.y, TAXI.color, 'Т');
      badge(THEFT.x, THEFT.y, THEFT.color, 'У');
      badge(GARAGE.x, GARAGE.y, GARAGE.color, 'Г');
    }

    for (const cop of cops) dot(cop.x, cop.y, '#ff4d4d', 3.2);

    const p = player.inCar || player;
    mctx.save();
    mctx.translate(mx(p.x), my(p.y));
    mctx.rotate(player.inCar ? player.inCar.angle : player.angle);
    mctx.shadowColor = 'rgba(255,196,0,0.7)';
    mctx.shadowBlur = 8;
    mctx.fillStyle = '#ffc400';
    mctx.strokeStyle = '#0a0d12';
    mctx.lineWidth = 1.5;
    mctx.beginPath();
    mctx.moveTo(7, 0);
    mctx.lineTo(-5, 5);
    mctx.lineTo(-2.5, 0);
    mctx.lineTo(-5, -5);
    mctx.closePath();
    mctx.fill();
    mctx.stroke();
    mctx.restore();

    if (state.wanted > 0) {
      const a = 0.12 + (Math.sin(elapsed * 6) + 1) * 0.08;
      mctx.strokeStyle = `rgba(255,77,77,${a})`;
      mctx.lineWidth = 3;
      mctx.strokeRect(1.5, 1.5, W - 3, H - 3);
    }
  }

  function drawScreenEffects() {
    const c = ctx;
    const w = view.w;
    const h = view.h;
    c.save();
    c.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);

    const low = 1 - clamp(state.health / 50, 0, 1);
    if (low > 0.01 && state.mode === 'playing') {
      const pulse = 0.72 + Math.sin(elapsed * 4.5) * 0.28;
      const grad = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.24, w / 2, h / 2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, 'rgba(120,0,8,0)');
      grad.addColorStop(1, `rgba(150,8,14,${low * 0.34 * pulse})`);
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);
    }

    if (state.mode === 'playing' && state.wanted > 0 && cops.length > 0) {
      const phase = (Math.sin(elapsed * 6) + 1) / 2;
      const grad = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.75);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, phase > 0.5 ? 'rgba(255,30,30,0.035)' : 'rgba(40,100,255,0.04)');
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);
    }

    c.restore();
  }

  // ============================================================
  //  RENDER: SCENE
  // ============================================================

  function render() {
    const dpr = view.dpr;
    const zoom = view.zoom;
    const shake = state.shake;
    const rcx = cam.x + Math.sin(elapsed * 61) * shake * 0.45;
    const rcy = cam.y + Math.cos(elapsed * 53) * shake * 0.45;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, view.w, view.h);
    ctx.fillStyle = '#070a0e';
    ctx.fillRect(0, 0, view.w, view.h);

    ctx.save();
    ctx.translate(view.w / 2, view.h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-rcx, -rcy);

    if (world.canvas) {
      const vw = view.w / zoom;
      const vh = view.h / zoom;
      const x0 = Math.max(0, Math.floor(rcx - vw / 2 - 6));
      const y0 = Math.max(0, Math.floor(rcy - vh / 2 - 6));
      const x1 = Math.min(WORLD.w, Math.ceil(rcx + vw / 2 + 6));
      const y1 = Math.min(WORLD.h, Math.ceil(rcy + vh / 2 + 6));
      if (x1 > x0 && y1 > y0) {
        ctx.drawImage(world.canvas, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
      }
    }

    for (const w of wrecks) {
      if (!inView(w.x, w.y, 100, rcx, rcy)) continue;
      drawWreck(w);
    }

    drawEntities();
    ctx.restore();

    drawLighting(rcx, rcy);

    // foreground layer: always readable
    ctx.save();
    ctx.translate(view.w / 2, view.h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-rcx, -rcy);
    drawMarkers();
    for (const p of pickups) {
      if (p.active && inView(p.x, p.y, 50, rcx, rcy)) drawPickup(p);
    }
    drawParticles();
    drawFloaters();
    ctx.restore();

    drawScreenEffects();
    drawMinimap(rcx, rcy);
  }

  // ============================================================
  //  SCREENS
  // ============================================================

  function fillPauseStats() {
    ui.pauseMoney.textContent = `${fmtMoney(state.money)} ₽`;
    ui.pauseJobs.textContent = String(state.jobs);
    ui.pauseRank.textContent = getRank();
    ui.pauseWanted.textContent = `${state.bestWanted} ★`;
    if (ui.saveNote) ui.saveNote.textContent = 'Прогресс сохраняется в браузере.';
  }

  function pauseGame() {
    if (state.mode !== 'playing') return;
    state.mode = 'paused';
    fillPauseStats();
    ui.screenPause.classList.remove('hidden');
    if (ui.toastWrap) ui.toastWrap.classList.add('hidden');
    updateAudio();
    if (audio.ready) {
      audio.engineGain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.05);
      audio.sirenGain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.1);
    }
    document.activeElement?.blur?.();
  }

  function resumeGame() {
    if (state.mode === 'help') {
      closeHelp();
      return;
    }
    if (state.mode !== 'paused') return;
    state.mode = 'playing';
    ui.screenPause.classList.add('hidden');
    if (ui.toastWrap) ui.toastWrap.classList.remove('hidden');
    ensureAudio();
    document.activeElement?.blur?.();
    lastFrame = performance.now();
    updateHint(true);
  }

  function openHelp() {
    if (state.mode !== 'title' && state.mode !== 'paused') return;
    helpReturn = state.mode;
    if (state.mode === 'paused') ui.screenPause.classList.add('hidden');
    if (state.mode === 'title') ui.screenTitle.classList.add('hidden');
    state.mode = 'help';
    ui.screenHelp.classList.remove('hidden');
    document.activeElement?.blur?.();
  }

  function closeHelp() {
    if (state.mode !== 'help') return;
    ui.screenHelp.classList.add('hidden');
    if (helpReturn === 'paused') {
      state.mode = 'paused';
      ui.screenPause.classList.remove('hidden');
    } else {
      state.mode = 'title';
      ui.screenTitle.classList.remove('hidden');
    }
    document.activeElement?.blur?.();
  }

  // ============================================================
  //  EVENTS
  // ============================================================

  function bindUI() {
    $('btnNew').addEventListener('click', () => {
      ensureAudio();
      startGame(false);
    });

    $('btnContinue').addEventListener('click', () => {
      ensureAudio();
      startGame(true);
    });

    $('btnHelp').addEventListener('click', () => openHelp());
    $('btnHelpClose').addEventListener('click', () => closeHelp());
    $('btnHelpClose2').addEventListener('click', () => closeHelp());
    $('btnPauseHelp').addEventListener('click', () => openHelp());
    $('btnPause').addEventListener('click', () => {
      if (state.mode === 'playing') pauseGame();
      else if (state.mode === 'paused') resumeGame();
    });
    $('btnPauseClose').addEventListener('click', () => resumeGame());
    $('btnResume').addEventListener('click', () => resumeGame());
    $('btnSave').addEventListener('click', () => {
      ensureAudio();
      saveGame(false);
      fillPauseStats();
    });
    $('btnRestart').addEventListener('click', () => {
      ensureAudio();
      startGame(false);
    });

    [ui.btnSound, ui.btnSoundTitle].forEach((btn) => {
      if (btn) btn.addEventListener('click', () => toggleMute());
    });

    $('btnActionTouch').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      interact();
    });

    const brakeBtn = $('btnBrakeTouch');
    brakeBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      touchInput.brake = true;
      brakeBtn.classList.add('active');
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => {
      brakeBtn.addEventListener(name, () => {
        touchInput.brake = false;
        brakeBtn.classList.remove('active');
      });
    });
  }

  // ============================================================
  //  DEBUG (only with ?debug=1)
  // ============================================================

  function setupDebug() {
    if (!new URLSearchParams(window.location.search).has('debug')) return;
    window.__BR = {
      get state() { return state; },
      get player() { return player; },
      get cars() { return cars; },
      get cops() { return cops; },
      get peds() { return peds; },
      get pickups() { return pickups; },
      get wrecks() { return wrecks; },
      get mission() { return mission; },
      get passenger() { return passenger; },
      get cam() { return cam; },
      get view() { return view; },
      get world() { return world; },
      startGame,
      startTaxi,
      startTheft,
      interact,
      pauseGame,
      resumeGame,
      enterNearest() {
        const n = nearestEnterableCar();
        if (n.car) enterCar(n.car);
        return !!n.car;
      },
      teleport(x, y) {
        player.inCar = null;
        player.x = x;
        player.y = y;
        cam.x = x;
        cam.y = y;
      },
      setWanted(n) {
        state.wanted = clamp(n, 0, 5.5);
        state.crimeTimer = 9;
      },
      setMoney(n) {
        state.money = n;
        updateHUD(true);
      },
      completeMission() {
        if (!mission) return false;
        if (mission.type === 'taxi') completeTaxi();
        else completeTheft();
        return true;
      },
      damageCar,
      damagePlayer,
      explodeCar,
      busted,
      updateHUD,
      updateHint,
      updateObjectiveUI,
      render,
      toast,
    };
  }

  // ============================================================
  //  BOOT
  // ============================================================

  function boot() {
    setupDebug();
    resize();
    buildCity();
    resetWorld();
    refreshContinueButton();
    setMuted(audio.muted);
    bindUI();

    if (!ui.btnContinue || !readSave()) ui.btnContinue?.classList.add('hidden');

    state.mode = 'title';
    state.time = 21 * 60 + 20;
    updateTitleCamera();
    updateHUD(true);

    lastFrame = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    elapsed += dt;

    if (state.mode === 'playing') {
      update(dt);
    } else if (state.mode === 'title') {
      updateTitleCamera();
      updateTraffic(dt * 0.8);
      updatePeds(dt * 0.8);
      updateParticles(dt);
      updateAudio();
    }

    render();
    requestAnimationFrame(frame);
  }

  boot();
})();

