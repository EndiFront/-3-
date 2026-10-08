// --- СЛОВАРЬ ЛОКАЛИЗАЦИИ ---
const TRANSLATIONS = {
  ru: {
    level: "УРОВЕНЬ",
    reset: "🔄 СБРОС",
    adBolt: "🎬 +1 СТЕРЖЕНЬ (РЕКЛАМА)",
    pauseTitle: "ПАУЗА",
    pauseText: "Игра приостановлена.",
    resume: "ПРОДОЛЖИТЬ",
    winTitle: "ОТЛИЧНО!",
    winText: "Головоломка решена!",
    nextLvl: "СЛЕДУЮЩИЙ УРОВЕНЬ",
    loseTitle: "ВРЕМЯ ВЫШЛО!",
    loseText: "Не успели открутить все гайки.",
    timeAd: "🎬 +60 СЕК (РЕКЛАМА)",
    restart: "🔄 НАЧАТЬ ЗАНОВО",
  },
  en: {
    level: "LEVEL",
    reset: "🔄 RESET",
    adBolt: "🎬 +1 BOLT (AD)",
    pauseTitle: "PAUSE",
    pauseText: "Game paused.",
    resume: "CONTINUE",
    winTitle: "GREAT!",
    winText: "Puzzle solved!",
    nextLvl: "NEXT LEVEL",
    loseTitle: "TIME'S UP!",
    loseText: "Out of time.",
    timeAd: "🎬 +60 SEC (AD)",
    restart: "🔄 RESTART",
  },
  tr: {
    level: "SEVİYE",
    reset: "🔄 SIFIRLA",
    adBolt: "🎬 +1 CİVATA (REKLAM)",
    pauseTitle: "DURAKLAT",
    pauseText: "Oyun durduruldu.",
    resume: "DEVAM ET",
    winTitle: "HARİKA!",
    winText: "Bulmaca çözüldü!",
    nextLvl: "SONRAKİ SEVİYE",
    loseTitle: "SÜRE BİTTİ!",
    loseText: "Yetişemediniz.",
    timeAd: "🎬 +60 SN (REKLAM)",
    restart: "YENİDEN BAŞLAT",
  },
};

let currentLang = "ru";

function detectLanguage() {
  const navLang = (navigator.language || "ru").slice(0, 2).toLowerCase();
  return TRANSLATIONS[navLang] ? navLang : "ru";
}

function applyLocalization() {
  currentLang = detectLanguage();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.ru;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) {
      if (key === "level") {
        el.innerText = `${t[key]} ${currentLevel}`;
      } else {
        el.innerText = t[key];
      }
    }
  });
}

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmTimer = null;
    this.step = 0;
  }
  pause() {
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend();
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended" && this.enabled) {
      this.ctx.resume();
    }
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      800,
      this.ctx.currentTime + 0.05,
    );
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playMove() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      150,
      this.ctx.currentTime + 0.12,
    );
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playWin() {
    if (!this.enabled || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + index * 0.08);
      gain.gain.linearRampToValueAtTime(
        0.01,
        this.ctx.currentTime + index * 0.08 + 0.25,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + index * 0.08);
      osc.stop(this.ctx.currentTime + index * 0.08 + 0.25);
    });
  }

  startBGM() {
    if (this.bgmTimer) return;
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0];
    this.bgmTimer = setInterval(() => {
      if (!this.enabled || !this.ctx || isGamePaused) return;
      if (this.step % 2 === 0) {
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
      }
      this.step++;
    }, 400);
  }
}
const audioEngine = new SoundEngine();

let currentLevel = 1;
let extraBoltUnlocked = false;
let initialLevelState = null;
let isGamePaused = false;

let levelTimer = null;
let timeRemaining = 0;
let timerEndTime = 0;
let remainingOnPause = 0;

const MATERIAL_STYLES = {
  gold: { color: 0xf59e0b, metalness: 0.6, roughness: 0.2 },
  blue: { color: 0x0284c7, metalness: 0.5, roughness: 0.25 },
  red: { color: 0xe11d48, metalness: 0.5, roughness: 0.25 },
  green: { color: 0x10b981, metalness: 0.5, roughness: 0.25 },
  purple: { color: 0x8b5cf6, metalness: 0.6, roughness: 0.2 },
  orange: { color: 0xea580c, metalness: 0.5, roughness: 0.25 },
  locked: { color: 0x475569, metalness: 0.2, roughness: 0.7 },
};
const COLOR_KEYS = ["gold", "blue", "red", "green", "purple", "orange"];

let container, scene, camera, renderer, ambientLight, dirLight, fillLight;
let nutHexGeom, nutGearGeom;

let boltsData = [];
let selectedBoltIndex = null;
let animatingNutData = null;
let interactiveMeshes = [];

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-100, -100);

function initThreeEngine() {
  container = document.getElementById("webgl-container");
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(12, 22, 15);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);

  nutHexGeom = createNutGeometry("hex");
  nutGearGeom = createNutGeometry("gear");

  updateCameraAspect();
  setupEventListeners();
  animate();
}

function updateCameraAspect() {
  if (!camera) return;
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  if (aspect < 1) {
    camera.position.set(0, 18, 24);
  } else {
    camera.position.set(0, 14, 19);
  }
  camera.lookAt(0, 1, 0);
  camera.updateProjectionMatrix();
}

function createNutGeometry(type = "hex") {
  const shape = new THREE.Shape();
  if (type === "gear") {
    const teeth = 10;
    const outerR = 0.92;
    const innerR = 0.75;
    for (let i = 0; i < teeth * 2; i++) {
      const angle = (i / (teeth * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
  } else {
    const sides = 6;
    const radius = 0.88;
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
  }
  shape.closePath();

  const holePath = new THREE.Path();
  holePath.absarc(0, 0, 0.44, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  const extrudeSettings = {
    depth: 0.46,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  geom.rotateX(Math.PI / 2);
  return geom;
}

function createBoltGroup(index) {
  const group = new THREE.Group();

  const baseGeom = new THREE.CylinderGeometry(1.05, 1.2, 0.28, 24);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.3,
  });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.14;
  base.receiveShadow = true;
  group.add(base);

  const ringGeom = new THREE.TorusGeometry(0.82, 0.06, 16, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    visible: false,
  });
  const glowRing = new THREE.Mesh(ringGeom, ringMat);
  glowRing.rotation.x = Math.PI / 2;
  glowRing.position.y = 0.3;
  group.add(glowRing);

  const shaftGroup = new THREE.Group();
  const mainShaftGeom = new THREE.CylinderGeometry(0.36, 0.36, 2.75, 24);
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.8,
    roughness: 0.3,
  });
  const mainShaft = new THREE.Mesh(mainShaftGeom, shaftMat);
  mainShaft.position.y = 1.52;
  mainShaft.castShadow = true;
  shaftGroup.add(mainShaft);

  for (let i = 0; i < 9; i++) {
    const threadGeom = new THREE.TorusGeometry(0.38, 0.03, 8, 24);
    const thread = new THREE.Mesh(threadGeom, shaftMat);
    thread.rotation.x = Math.PI / 2;
    thread.position.y = 0.35 + i * 0.27;
    shaftGroup.add(thread);
  }
  group.add(shaftGroup);

  const hitGeom = new THREE.CylinderGeometry(1.15, 1.15, 3.1, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitBox = new THREE.Mesh(hitGeom, hitMat);
  hitBox.position.y = 1.55;
  hitBox.userData = { boltIndex: index };
  group.add(hitBox);

  return { group, hitBox, glowRing };
}

function getLevelTimeLimit(lvl) {
  if (lvl <= 2) return 90;
  if (lvl <= 5) return 120;
  if (lvl <= 10) return 180;
  return 240;
}

function startTimer(seconds) {
  stopTimer();
  timeRemaining = seconds;
  remainingOnPause = seconds;
  timerEndTime = Date.now() + seconds * 1000;
  updateTimerUI();

  levelTimer = setInterval(() => {
    if (isGamePaused) return;

    const diff = Math.ceil((timerEndTime - Date.now()) / 1000);
    timeRemaining = Math.max(0, diff);
    updateTimerUI();

    if (timeRemaining <= 0) {
      stopTimer();
      handleTimeOut();
    }
  }, 250);
}

function stopTimer() {
  if (levelTimer) {
    clearInterval(levelTimer);
    levelTimer = null;
  }
}

function updateTimerUI() {
  const display = document.getElementById("timer-display");
  if (!display) return;
  const m = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");
  const s = (timeRemaining % 60).toString().padStart(2, "0");
  display.innerText = `⏳ ${m}:${s}`;

  if (timeRemaining <= 10) {
    display.style.borderColor = "#ef4444";
    display.style.color = "#ef4444";
  } else {
    display.style.borderColor = "#f59e0b";
    display.style.color = "#f59e0b";
  }
}

function handleTimeOut() {
  audioEngine.playClick();
  pauseGameplay();
  document.getElementById("lose-modal").classList.add("active");
}

function updateAdButtonVisibility() {
  const adBtn = document.getElementById("ad-bolt-btn");
  if (adBtn) {
    adBtn.style.display = extraBoltUnlocked ? "none" : "block";
  }
}

function clearScene() {
  boltsData.forEach((b) => {
    if (b.group) scene.remove(b.group);
    if (b.stack) b.stack.forEach((n) => scene.remove(n.mesh));
  });
  interactiveMeshes = [];
  boltsData = [];
  selectedBoltIndex = null;
  animatingNutData = null;
}

function getLevelConfig(levelNumber) {
  const colorsCount = Math.min(
    2 + Math.floor((levelNumber - 1) / 3),
    COLOR_KEYS.length,
  );
  const emptyBolts = levelNumber <= 3 ? 2 : 1;
  const boltsCount = colorsCount + emptyBolts;
  const capacity = 4;
  const lockedCount =
    levelNumber <= 2 ? 0 : Math.min(Math.floor((levelNumber - 1) / 2), 2);

  return {
    colorsCount,
    capacity,
    boltsCount,
    lockedCount,
  };
}

function isLevelSolveable(levelData, config) {
  const capacity = config.capacity;

  function serializeState(state) {
    return state
      .map((b) => b.map((n) => `${n.colorKey}:${n.isLocked ? 1 : 0}`).join(","))
      .join("|");
  }

  function isWin(state) {
    let correctCount = 0;
    let totalNuts = 0;
    for (let b of state) {
      totalNuts += b.length;
      if (b.length === 0) continue;
      if (b.length === capacity) {
        const c = b[0].colorKey;
        if (b.every((n) => n.colorKey === c && !n.isLocked)) {
          correctCount += capacity;
        }
      }
    }
    return totalNuts > 0 && correctCount === totalNuts;
  }

  const queue = [levelData];
  const visited = new Set([serializeState(levelData)]);

  let steps = 0;
  const MAX_STEPS = 3000;

  while (queue.length > 0) {
    const currentState = queue.shift();
    steps++;
    if (steps > MAX_STEPS) return false;

    if (isWin(currentState)) return true;

    for (let i = 0; i < currentState.length; i++) {
      const fromStack = currentState[i];
      if (fromStack.length === 0) continue;

      const topColor = fromStack[fromStack.length - 1].colorKey;
      let groupSize = 0;
      for (let k = fromStack.length - 1; k >= 0; k--) {
        if (fromStack[k].colorKey === topColor && !fromStack[k].isLocked) {
          groupSize++;
        } else {
          break;
        }
      }

      if (groupSize === 0) continue;

      for (let j = 0; j < currentState.length; j++) {
        if (i === j) continue;
        const toStack = currentState[j];

        if (toStack.length + groupSize > capacity) continue;

        if (toStack.length > 0) {
          const targetTop = toStack[toStack.length - 1];
          if (targetTop.colorKey !== topColor) continue;
        }

        const nextState = currentState.map((b) => b.map((n) => ({ ...n })));

        const movedNuts = nextState[i].splice(
          nextState[i].length - groupSize,
          groupSize,
        );

        if (nextState[i].length > 0) {
          const lowerNut = nextState[i][nextState[i].length - 1];
          if (lowerNut.isLocked) {
            lowerNut.isLocked = false;
          }
        }

        nextState[j].push(...movedNuts);

        const key = serializeState(nextState);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(nextState);
        }
      }
    }
  }

  return false;
}

function generateValidLevelData(config) {
  let attempts = 0;
  const MAX_ATTEMPTS = 500;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    let pool = [];
    for (let c = 0; c < config.colorsCount; c++) {
      for (let i = 0; i < config.capacity; i++) pool.push(COLOR_KEYS[c]);
    }

    pool.sort(() => Math.random() - 0.5);

    let levelData = [];
    for (let i = 0; i < config.boltsCount; i++) {
      let boltStack = [];
      if (i < config.colorsCount) {
        for (let j = 0; j < config.capacity; j++) {
          const colorKey = pool.pop();
          const isLocked = j === 0 && i < config.lockedCount;
          boltStack.push({ colorKey, isLocked });
        }
      }
      levelData.push(boltStack);
    }

    if (isLevelSolveable(levelData, config)) {
      return levelData;
    }
  }

  let fallbackData = [];
  for (let c = 0; c < config.colorsCount; c++) {
    let boltStack = [];
    for (let j = 0; j < config.capacity; j++) {
      boltStack.push({ colorKey: COLOR_KEYS[c], isLocked: false });
    }
    fallbackData.push(boltStack);
  }
  for (let c = 0; c < config.colorsCount; c++) {
    const swapTarget = (c + 1) % config.colorsCount;
    const temp = fallbackData[c][config.capacity - 1].colorKey;
    fallbackData[c][config.capacity - 1].colorKey =
      fallbackData[swapTarget][config.capacity - 1].colorKey;
    fallbackData[swapTarget][config.capacity - 1].colorKey = temp;
  }
  for (let e = 0; e < config.boltsCount - config.colorsCount; e++) {
    fallbackData.push([]);
  }
  return fallbackData;
}

function initLevel3D(lvl, isRestart = false) {
  clearScene();
  const config = getLevelConfig(lvl);
  let levelData = [];

  if (!isRestart) {
    extraBoltUnlocked = false;
    levelData = generateValidLevelData(config);
    initialLevelState = JSON.parse(JSON.stringify(levelData));
  } else {
    levelData = JSON.parse(JSON.stringify(initialLevelState));
  }

  buildLevelGrid(levelData);

  if (isRestart && extraBoltUnlocked) {
    applyExtraBolt(true);
  } else {
    updateAdButtonVisibility();
  }

  applyLocalization();
  resumeGameplay();
  startTimer(getLevelTimeLimit(lvl));
}

function rearrangeGrid() {
  const total = boltsData.length;
  if (total === 0) return;

  const isMobile = window.innerWidth < 600;
  const spacingX = isMobile ? 2.2 : 2.5;

  let useTwoRows = isMobile && total > 4;
  let row1Count = useTwoRows ? Math.ceil(total / 2) : total;
  let row2Count = useTwoRows ? Math.floor(total / 2) : 0;

  for (let i = 0; i < total; i++) {
    const isRow2 = useTwoRows && i >= row1Count;
    const rowIndex = isRow2 ? i - row1Count : i;
    const rowTotal = isRow2 ? row2Count : row1Count;

    const startX = -((rowTotal - 1) * spacingX) / 2;
    const posX = startX + rowIndex * spacingX;
    const posZ = isRow2 ? 2.0 : -2.0;

    boltsData[i].posX = posX;
    boltsData[i].posZ = posZ;
    boltsData[i].group.position.set(posX, 0, posZ);

    boltsData[i].stack.forEach((nut, j) => {
      nut.mesh.position.set(posX, 0.42 + j * 0.56, posZ);
    });
  }
}

function buildLevelGrid(levelData) {
  const totalBoltsOnBoard = levelData.length;

  for (let i = 0; i < totalBoltsOnBoard; i++) {
    const boltIndex = boltsData.length;
    const { group: boltGroup, hitBox, glowRing } = createBoltGroup(boltIndex);
    scene.add(boltGroup);
    interactiveMeshes.push(hitBox);

    let stack = [];
    const stackData = levelData[i] || [];

    stackData.forEach((item, j) => {
      const matStyle = item.isLocked
        ? MATERIAL_STYLES.locked
        : MATERIAL_STYLES[item.colorKey];
      const mat = new THREE.MeshStandardMaterial({
        color: matStyle.color,
        metalness: matStyle.metalness,
        roughness: matStyle.roughness,
      });

      const geom = j % 2 === 0 ? nutHexGeom : nutGearGeom;
      const nutMesh = new THREE.Mesh(geom, mat);
      nutMesh.castShadow = true;
      scene.add(nutMesh);

      stack.push({
        mesh: nutMesh,
        colorKey: item.colorKey,
        isLocked: item.isLocked,
      });
    });

    boltsData.push({
      group: boltGroup,
      posX: 0,
      posZ: 0,
      stack,
      glowRing,
    });
  }

  rearrangeGrid();
}

function applyExtraBolt(isRestoring = false) {
  extraBoltUnlocked = true;
  updateAdButtonVisibility();

  if (selectedBoltIndex !== null) {
    boltsData[selectedBoltIndex].glowRing.material.visible = false;
  }
  selectedBoltIndex = null;

  const newIndex = boltsData.length;
  const { group: boltGroup, hitBox, glowRing } = createBoltGroup(newIndex);
  scene.add(boltGroup);

  interactiveMeshes.push(hitBox);
  boltsData.push({
    group: boltGroup,
    posX: 0,
    posZ: 0,
    stack: [],
    glowRing,
  });

  rearrangeGrid();
}

// Реклама за вознаграждение (Rewarded AD) через VK Bridge
function unlockExtraBoltAd() {
  if (extraBoltUnlocked) return;

  pauseGameplay();
  audioEngine.pause();

  if (typeof vkBridge !== "undefined") {
    vkBridge
      .send("VKWebAppShowNativeAds", { ad_format: "reward" })
      .then((data) => {
        if (data.result) {
          applyExtraBolt();
        }
      })
      .catch((err) => console.log("Ошибка вызова рекламы:", err))
      .finally(() => {
        audioEngine.resume();
        resumeGameplay();
      });
  } else {
    applyExtraBolt();
    audioEngine.resume();
    resumeGameplay();
  }
}

function getTopMatchingNuts(boltIndex) {
  const stack = boltsData[boltIndex].stack;
  if (stack.length === 0) return [];

  const topColor = stack[stack.length - 1].colorKey;
  const group = [];

  for (let i = stack.length - 1; i >= 0; i--) {
    const nut = stack[i];
    if (nut.colorKey === topColor && !nut.isLocked) {
      group.unshift(nut);
    } else {
      break;
    }
  }
  return group;
}

function onBoltSelect(index) {
  audioEngine.init();
  audioEngine.startBGM();

  if (selectedBoltIndex === null) {
    const stack = boltsData[index].stack;
    if (stack.length > 0) {
      const topNut = stack[stack.length - 1];
      if (!topNut.isLocked) {
        audioEngine.playClick();
        selectedBoltIndex = index;
        boltsData[index].glowRing.material.visible = true;

        const group = getTopMatchingNuts(index);

        group.forEach((nut, idx) => {
          nut.startY = nut.mesh.position.y;
          nut.targetY = 3.4 + idx * 0.56;
        });

        animatingNutData = {
          type: "unscrew",
          nutsGroup: group,
          progress: 0,
          boltIndex: index,
        };
      }
    }
  } else {
    const from = selectedBoltIndex;
    const to = index;
    boltsData[from].glowRing.material.visible = false;

    if (from === to) {
      resetSelectedNut(from);
    } else if (canMove3D(from, to)) {
      audioEngine.playMove();
      animateNutMove(from, to);
    } else {
      resetSelectedNut(from);
    }
    selectedBoltIndex = null;
  }
}

function resetSelectedNut(boltIndex) {
  const group = getTopMatchingNuts(boltIndex);
  if (group.length > 0) {
    const stack = boltsData[boltIndex].stack;
    const baseIndex = stack.length - group.length;

    group.forEach((nut, idx) => {
      nut.startY = nut.mesh.position.y;
      nut.targetY = 0.42 + (baseIndex + idx) * 0.56;
    });

    animatingNutData = {
      type: "screw_back",
      nutsGroup: group,
      progress: 0,
      posX: boltsData[boltIndex].posX,
      posZ: boltsData[boltIndex].posZ,
    };
  }
}

function canMove3D(from, to) {
  const fromStack = boltsData[from].stack;
  const toStack = boltsData[to].stack;

  if (fromStack.length === 0) return false;

  const group = getTopMatchingNuts(from);
  if (group.length === 0) return false;

  if (toStack.length + group.length > 4) return false;

  if (toStack.length === 0) return true;

  const targetTopNut = toStack[toStack.length - 1];
  return targetTopNut.colorKey === group[0].colorKey;
}

function animateNutMove(from, to) {
  const group = getTopMatchingNuts(from);
  const groupCount = group.length;

  boltsData[from].stack.splice(
    boltsData[from].stack.length - groupCount,
    groupCount,
  );

  if (boltsData[from].stack.length > 0) {
    const lower = boltsData[from].stack[boltsData[from].stack.length - 1];
    if (lower.isLocked) {
      lower.isLocked = false;
      lower.mesh.material = new THREE.MeshStandardMaterial({
        color: MATERIAL_STYLES[lower.colorKey].color,
        metalness: MATERIAL_STYLES[lower.colorKey].metalness,
        roughness: MATERIAL_STYLES[lower.colorKey].roughness,
      });
    }
  }

  const startP = new THREE.Vector3(
    boltsData[from].posX,
    3.4,
    boltsData[from].posZ,
  );
  const endP = new THREE.Vector3(boltsData[to].posX, 3.4, boltsData[to].posZ);
  const midP = new THREE.Vector3(
    (startP.x + endP.x) / 2,
    4.8,
    (startP.z + endP.z) / 2,
  );

  const curve = new THREE.QuadraticBezierCurve3(startP, midP, endP);
  const baseTargetY = 0.42 + boltsData[to].stack.length * 0.56;

  animatingNutData = {
    type: "flight_and_screw",
    nutsGroup: group,
    to,
    curve,
    progress: 0,
    baseTargetY,
  };
}

function animate() {
  requestAnimationFrame(animate);
  if (!isGamePaused && animatingNutData) {
    const a = animatingNutData;
    if (a.type === "unscrew") {
      a.progress += 0.08;
      if (a.progress >= 1) {
        a.nutsGroup.forEach((nut) => {
          nut.mesh.position.y = nut.targetY;
        });
        animatingNutData = null;
      } else {
        a.nutsGroup.forEach((nut) => {
          nut.mesh.position.y = THREE.MathUtils.lerp(
            nut.startY,
            nut.targetY,
            a.progress,
          );
          nut.mesh.rotation.y += 0.3;
        });
      }
    } else if (a.type === "screw_back") {
      a.progress += 0.08;
      if (a.progress >= 1) {
        a.nutsGroup.forEach((nut) => {
          nut.mesh.position.set(a.posX, nut.targetY, a.posZ);
          nut.mesh.rotation.set(0, 0, 0);
        });
        animatingNutData = null;
      } else {
        a.nutsGroup.forEach((nut) => {
          nut.mesh.position.y = THREE.MathUtils.lerp(
            nut.startY,
            nut.targetY,
            a.progress,
          );
          nut.mesh.rotation.y -= 0.3;
        });
      }
    } else if (a.type === "flight_and_screw") {
      a.progress += 0.045;
      if (a.progress < 0.6) {
        const flightProgress = a.progress / 0.6;
        const pos = a.curve.getPoint(flightProgress);

        a.nutsGroup.forEach((nut, idx) => {
          nut.mesh.position.set(pos.x, pos.y + idx * 0.56, pos.z);
          nut.mesh.rotation.y += 0.2;
        });
      } else {
        const screwProgress = (a.progress - 0.6) / 0.4;
        a.nutsGroup.forEach((nut, idx) => {
          const nutTargetY = a.baseTargetY + idx * 0.56;
          nut.mesh.position.x = boltsData[a.to].posX;
          nut.mesh.position.z = boltsData[a.to].posZ;
          nut.mesh.position.y = THREE.MathUtils.lerp(
            3.4 + idx * 0.56,
            nutTargetY,
            screwProgress,
          );
          nut.mesh.rotation.y -= 0.3;
        });
      }
      if (a.progress >= 1) {
        const { nutsGroup, to, baseTargetY } = a;
        nutsGroup.forEach((nut, idx) => {
          const nutTargetY = baseTargetY + idx * 0.56;
          nut.mesh.position.set(
            boltsData[to].posX,
            nutTargetY,
            boltsData[to].posZ,
          );
          nut.mesh.rotation.set(0, 0, 0);
          boltsData[to].stack.push(nut);
        });
        animatingNutData = null;

        checkWinStrict();
      }
    }
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function checkWinStrict() {
  if (animatingNutData !== null || selectedBoltIndex !== null) return;

  let totalNutsInGame = 0;
  let correctlyPlacedNuts = 0;

  for (let i = 0; i < boltsData.length; i++) {
    const stack = boltsData[i].stack;
    totalNutsInGame += stack.length;

    if (stack.length === 0) continue;
    if (stack.length !== 4) continue;

    const firstColor = stack[0].colorKey;
    const isUniform = stack.every(
      (n) => n.colorKey === firstColor && !n.isLocked,
    );

    if (isUniform) {
      correctlyPlacedNuts += 4;
    }
  }

  const config = getLevelConfig(currentLevel);
  const expectedTotalNuts = config.colorsCount * config.capacity;

  if (
    totalNutsInGame === expectedTotalNuts &&
    correctlyPlacedNuts === expectedTotalNuts
  ) {
    stopTimer();
    audioEngine.playWin();
    pauseGameplay();

    currentLevel += 1;
    saveProgress(currentLevel);

    setTimeout(() => {
      document.getElementById("win-modal").classList.add("active");
    }, 200);
  }
}

// Сохранение прогресса через VK Bridge / localStorage
function saveProgress(lvl) {
  localStorage.setItem("bolts_level", lvl);
  if (typeof vkBridge !== "undefined") {
    vkBridge.send("VKWebAppStorageSet", {
      key: "bolts_level",
      value: String(lvl),
    });
  }
}

// Загрузка прогресса
function loadProgressAndStart() {
  if (typeof vkBridge !== "undefined") {
    vkBridge
      .send("VKWebAppStorageGet", { keys: ["bolts_level"] })
      .then((data) => {
        if (data.keys && data.keys[0] && data.keys[0].value) {
          const remoteLvl = parseInt(data.keys[0].value, 10);
          if (!isNaN(remoteLvl) && remoteLvl > 0) {
            currentLevel = remoteLvl;
          }
        } else {
          const localLvl = parseInt(localStorage.getItem("bolts_level"), 10);
          if (!isNaN(localLvl) && localLvl > 0) currentLevel = localLvl;
        }
        initLevel3D(currentLevel);
      })
      .catch(() => {
        const localLvl = parseInt(localStorage.getItem("bolts_level"), 10);
        if (!isNaN(localLvl) && localLvl > 0) currentLevel = localLvl;
        initLevel3D(currentLevel);
      });
  } else {
    const localLvl = parseInt(localStorage.getItem("bolts_level"), 10);
    if (!isNaN(localLvl) && localLvl > 0) currentLevel = localLvl;
    initLevel3D(currentLevel);
  }
}

function pauseGameplay() {
  if (!isGamePaused) {
    isGamePaused = true;
    remainingOnPause = Math.max(
      0,
      Math.ceil((timerEndTime - Date.now()) / 1000),
    );
  }
}

function resumeGameplay() {
  if (isGamePaused) {
    isGamePaused = false;
    timerEndTime = Date.now() + remainingOnPause * 1000;
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

function setupEventListeners() {
  window.addEventListener("resize", () => {
    updateCameraAspect();
    if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
    rearrangeGrid();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseGameplay();
      audioEngine.pause();
    } else {
      const winModal = document.getElementById("win-modal");
      const pauseModal = document.getElementById("pause-modal");
      const loseModal = document.getElementById("lose-modal");

      const isAnyModalOpen =
        (winModal && winModal.classList.contains("active")) ||
        (pauseModal && pauseModal.classList.contains("active")) ||
        (loseModal && loseModal.classList.contains("active"));

      if (!isAnyModalOpen) {
        resumeGameplay();
        audioEngine.resume();
      }
    }
  });

  window.addEventListener("pointerdown", (e) => {
    if (isGamePaused) return;
    const winModal = document.getElementById("win-modal");
    const pauseModal = document.getElementById("pause-modal");
    const loseModal = document.getElementById("lose-modal");

    if (
      (winModal && winModal.classList.contains("active")) ||
      (pauseModal && pauseModal.classList.contains("active")) ||
      (loseModal && loseModal.classList.contains("active"))
    ) {
      return;
    }

    if (
      e.target.closest("#header") ||
      e.target.closest("#bottom-bar") ||
      e.target.closest(".modal") ||
      e.target.tagName === "BUTTON"
    ) {
      return;
    }

    if (animatingNutData) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes);
    if (intersects.length > 0) {
      const userData = intersects[0].object.userData;
      if (userData.boltIndex !== undefined) {
        onBoltSelect(userData.boltIndex);
      }
    }
  });

  document.getElementById("pause-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    audioEngine.playClick();
    pauseGameplay();
    document.getElementById("pause-modal").classList.add("active");
  });

  document.getElementById("audio-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    audioEngine.init();
    audioEngine.enabled = !audioEngine.enabled;
    const icon = document.getElementById("audio-icon");
    if (icon) icon.innerText = audioEngine.enabled ? "🔊" : "🔇";
  });

  document.getElementById("resume-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    audioEngine.playClick();
    hideModal("pause-modal");
    updateAdButtonVisibility();
    resumeGameplay();
  });

  document.getElementById("next-lvl-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const winModal = document.getElementById("win-modal");
    if (winModal && !winModal.classList.contains("active")) return;

    audioEngine.playClick();
    hideModal("win-modal");

    const startNext = () => {
      initLevel3D(currentLevel);
    };

    pauseGameplay();
    audioEngine.pause();

    // Межстраничная полноэкранная реклама (Interstitial) VK Bridge
    if (typeof vkBridge !== "undefined") {
      vkBridge
        .send("VKWebAppShowNativeAds", { ad_format: "interstitial" })
        .then(() => {
          audioEngine.resume();
          startNext();
        })
        .catch((err) => {
          console.log("Ошибка рекламы:", err);
          audioEngine.resume();
          startNext();
        });
    } else {
      audioEngine.resume();
      startNext();
    }
  });

  document.getElementById("lose-restart-btn")?.addEventListener("click", () => {
    audioEngine.playClick();
    hideModal("lose-modal");
    initLevel3D(currentLevel, true);
  });

  document.getElementById("time-ad-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    audioEngine.playClick();

    const grantExtraTime = () => {
      hideModal("lose-modal");
      resumeGameplay();
      startTimer(60);
    };

    pauseGameplay();
    audioEngine.pause();

    if (typeof vkBridge !== "undefined") {
      vkBridge
        .send("VKWebAppShowNativeAds", { ad_format: "reward" })
        .then((data) => {
          if (data.result) {
            grantExtraTime();
          } else {
            resumeGameplay();
          }
        })
        .catch(() => resumeGameplay())
        .finally(() => audioEngine.resume());
    } else {
      grantExtraTime();
      audioEngine.resume();
    }
  });

  document.getElementById("restart-btn")?.addEventListener("click", () => {
    audioEngine.playClick();
    initLevel3D(currentLevel, true);
  });

  document.getElementById("ad-bolt-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    audioEngine.playClick();
    unlockExtraBoltAd();
  });
}

// Инициализация VK Bridge
document.addEventListener("DOMContentLoaded", () => {
  if (typeof THREE === "undefined") {
    console.error("Критическая ошибка: Three.js не подключен!");
    return;
  }

  initThreeEngine();
  applyLocalization();

  if (typeof vkBridge !== "undefined") {
    vkBridge
      .send("VKWebAppInit")
      .then(() => {
        loadProgressAndStart();
      })
      .catch((err) => {
        console.warn("Ошибка инициализации VK Bridge:", err);
        loadProgressAndStart();
      });
  } else {
    console.warn("VK Bridge SDK не обнаружен. Локальный запуск.");
    loadProgressAndStart();
  }
});