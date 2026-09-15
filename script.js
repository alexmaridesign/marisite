const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pairs = [
  {
    company: "МеренКофе",
    label: "кофейный бренд",
    type: "айдентика / упаковка",
    count: "24 материала",
    companyImage: "./assets/company-meren-coffee.png",
    caseImage: "./assets/case-meren-coffee.png",
    companyArtwork: true,
    title: "МеренКофе",
    short: "МеренКофе",
    copy: "Я собираю знак, упаковку, визуалы и правила кампании.",
  },
  {
    company: "Noire",
    label: "редакционный бренд",
    type: "редакционная айдентика",
    count: "18 материалов",
    image: "./assets/case-noire.png",
    title: "Noire",
    short: "Noire",
    copy: "Я выстраиваю сетку, типографику, печатные и цифровые носители.",
  },
  {
    company: "Cult",
    label: "музыкальная платформа",
    type: "кампания / арт-дирекшн",
    count: "31 материал",
    image: "./assets/case-cult.png",
    title: "Cult",
    short: "Cult",
    copy: "Я веду наружку, соцсети и драматургию запуска.",
  },
  {
    company: "Forma",
    label: "цифровая студия",
    type: "цифровой бренд",
    count: "22 материала",
    image: "./assets/case-forma.png",
    title: "Forma",
    short: "Forma",
    copy: "Я задаю интерфейсные правила, анимацию и презентационный набор.",
  },
  {
    company: "Kinto",
    label: "линейка объектов",
    type: "упаковка / система",
    count: "16 материалов",
    image: "./assets/case-kinto.png",
    title: "Kinto",
    short: "Kinto",
    copy: "Я соединяю знак, материал, тиснение и серию носителей.",
  },
  {
    company: "Sofacinic",
    label: "бренд ухода",
    type: "бренд / digital",
    count: "20 материалов",
    image: "./assets/case-card-aurora.png",
    companyImage: "./assets/company-sofacinic.png",
    companyArtwork: true,
    title: "Luma",
    short: "Luma",
    copy: "Я проектирую визуальный язык, лендинг и digital-носители.",
  },
  {
    company: "Pinhead",
    label: "креативная студия",
    type: "кампания / навигация",
    count: "27 материалов",
    image: "./assets/case-forma.png",
    companyImage: "./assets/company-pinhead.png",
    companyArtwork: true,
    title: "Atlas",
    short: "Atlas",
    copy: "Я собираю кампанию, знаки, модульную сетку и городские носители.",
  },
  {
    company: "Sensa",
    label: "beauty-бренд",
    type: "упаковка / арт-дирекшн",
    count: "19 материалов",
    image: "./assets/case-kinto.png",
    title: "Sensa",
    short: "Sensa",
    copy: "Я веду упаковку, фотостиль и визуальную систему запуска.",
  },
  {
    company: "Motto",
    label: "медиа-платформа",
    type: "редакционная система",
    count: "34 материала",
    image: "./assets/case-noire.png",
    title: "Motto",
    short: "Motto",
    copy: "Я строю редакционную сетку, типографику и промо-набор.",
  },
  {
    company: "Vera",
    label: "культурная серия",
    type: "плакаты / концепция",
    count: "15 материалов",
    image: "./assets/case-cult.png",
    title: "Vera",
    short: "Vera",
    copy: "Я собираю постеры, визуальную идею и серию кампейн-материалов.",
  },
];

const ORBIT_DENSITY = 2;
const caseDialogImageCrop = new Map([
  ["./assets/company-sofacinic.png", "deep"],
  ["./assets/company-pinhead.png", "medium"],
  ["./assets/case-noire.png", "frame"],
  ["./assets/case-cult.png", "frame"],
  ["./assets/case-forma.png", "frame"],
  ["./assets/case-kinto.png", "frame"],
  ["./assets/case-card-aurora.png", "frame"],
]);
const orbitPairs = Array.from({ length: pairs.length * ORBIT_DENSITY }, (_, index) => pairs[index % pairs.length]);
const ORBIT_STEP = (Math.PI * 2) / orbitPairs.length;
const ORBIT_DECORATIONS = {
  left: [
    { id: "finger", image: "./assets/icon-finger.svg", offset: ORBIT_STEP * -1.5 },
  ],
  right: [
    { id: "heart", image: "./assets/icon-heart.svg", offset: ORBIT_STEP * -0.5 },
    { id: "lightning", image: "./assets/icon-lightning.svg", offset: ORBIT_STEP * 1.5 },
  ],
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.18 },
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const carousel = document.querySelector("[data-carousel]");
const companyOrbit = document.querySelector("[data-company-orbit]");
const caseOrbit = document.querySelector("[data-case-orbit]");
const liquidLensRoot = document.querySelector("[data-liquid-lens]");
const companyLensLayer = document.querySelector("[data-company-lens]");
const caseLensLayer = document.querySelector("[data-case-lens]");
const titleNode = document.querySelector("[data-case-title]");
const copyNode = document.querySelector("[data-case-copy]");
const companyNode = document.querySelector("[data-company-name]");
const typeNode = document.querySelector("[data-case-type]");
const countNode = document.querySelector("[data-case-count]");
const spotlightNode = document.querySelector("[data-spotlight]");
const caseDialogOpenButton = document.querySelector("[data-case-dialog-open]");
const caseDialog = document.querySelector("[data-case-dialog]");
const caseDialogCloseButton = document.querySelector("[data-case-dialog-close]");
const caseDialogTitle = document.querySelector("[data-case-dialog-title]");
const caseDialogKind = document.querySelector("[data-case-dialog-kind]");
const caseDialogCopy = document.querySelector("[data-case-dialog-copy]");
const caseDialogCompany = document.querySelector("[data-case-dialog-company]");
const caseDialogType = document.querySelector("[data-case-dialog-type]");
const caseDialogCount = document.querySelector("[data-case-dialog-count]");
const caseDialogCounter = document.querySelector("[data-case-dialog-counter]");
const caseDialogCompanyImage = document.querySelector("[data-case-dialog-company-image]");
const caseDialogCaseImage = document.querySelector("[data-case-dialog-case-image]");
const caseDialogPrevButton = document.querySelector("[data-case-dialog-prev]");
const caseDialogNextButton = document.querySelector("[data-case-dialog-next]");
const caseDialogPrevTitle = document.querySelector("[data-case-dialog-prev-title]");
const caseDialogNextTitle = document.querySelector("[data-case-dialog-next-title]");
let renderedPairIndex = -1;
let activeCaseDialogIndex = 0;
let caseDialogReturnFocus = null;
let caseDialogAutoWasPaused = { company: false, case: false };
let caseDialogSelectionChanged = false;

function createCompanyNode(pair, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `orbit-node company-node${pair.companyArtwork ? " company-node--artwork" : ""}`;
  button.dataset.index = String(index);
  button.setAttribute("aria-label", `Компания ${pair.company}`);
  button.innerHTML = `<img src="${pair.companyImage ?? pair.image}" alt="" />`;
  return button;
}

function createCompanyLensNode(pair, index) {
  const node = document.createElement("div");
  node.className = `orbit-node company-node lens-node${pair.companyArtwork ? " company-node--artwork" : ""}`;
  node.dataset.index = String(index);
  node.innerHTML = `<img src="${pair.companyImage ?? pair.image}" alt="" />`;
  return node;
}

function createCaseNode(pair, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "orbit-node case-node";
  button.dataset.index = String(index);
  button.setAttribute("aria-label", `Кейс ${pair.title}`);
  button.innerHTML = `<img src="${pair.caseImage ?? pair.image}" alt="" />`;
  return button;
}

function createCaseLensNode(pair, index) {
  const node = document.createElement("div");
  node.className = "orbit-node case-node lens-node";
  node.dataset.index = String(index);
  node.innerHTML = `<img src="${pair.caseImage ?? pair.image}" alt="" />`;
  return node;
}

function createOrbitDecorationNode(decoration, { lens = false } = {}) {
  const node = document.createElement("div");
  node.className = `orbit-decoration${lens ? " lens-node" : ""}`;
  node.dataset.decoration = decoration.id;
  node.setAttribute("aria-hidden", "true");
  node.innerHTML = `<img src="${decoration.image}" alt="" />`;
  return node;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeAngle(value) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function wrapDecorationAngle(value) {
  const period = Math.PI / ORBIT_DENSITY;
  const halfPeriod = period / 2;
  return ((value + halfPeriod) % period + period) % period - halfPeriod;
}

function nearestEquivalentAngle(target, current) {
  return current + normalizeAngle(target - current);
}

function setNodePosition(node, angle, lane, index, isActive, { stickToRing = false, centerDrop: alignedCenterDrop, focusX } = {}) {
  const viewportWidth = window.innerWidth;
  const radius = stickToRing && viewportWidth > 820 ? 50 : viewportWidth <= 520 ? 44 : 48;
  const activeAngle = lane === "right" ? Math.PI : 0;
  const distance = Math.abs(normalizeAngle(angle - activeAngle));
  const focus = Math.max(0, 1 - distance / (Math.PI * 0.72));
  const focusEase = focus * focus;
  const centerPull = stickToRing ? 0 : viewportWidth <= 520 ? 3.8 : 6;
  const centerDrop = stickToRing
    ? 0
    : Number.isFinite(alignedCenterDrop)
      ? alignedCenterDrop
      : viewportWidth <= 820
        ? 0.45
        : 1;
  const direction = lane === "left" ? 1 : -1;
  const alignedPull = Number.isFinite(focusX) ? focusX - (50 + direction * radius) : direction * centerPull;
  const x = 50 + Math.cos(angle) * radius + alignedPull * focusEase;
  const y = 50 + Math.sin(angle) * radius + centerDrop * focusEase;
  const depth = 0.45 + focus * 0.55;
  const minScale = viewportWidth <= 520 ? 0.34 : viewportWidth <= 820 ? 0.38 : 0.42;
  const maxScale = viewportWidth <= 520 ? 0.72 : viewportWidth <= 820 ? 0.8 : 0.86;
  const scale = minScale + focusEase * (maxScale - minScale);
  const opacity = 0.22 + focus * 0.78;
  const z = Math.round(4 + depth * 22);
  const baseTilt = -12 + Math.sin(angle) * 10;
  const tilt = baseTilt * (1 - focus);

  node.style.left = `${x}%`;
  node.style.top = `${y}%`;
  node.style.opacity = opacity.toFixed(3);
  node.style.zIndex = String(z);
  node.style.transform = `translate(-50%, -50%) rotate(${tilt}deg) scale(${scale.toFixed(3)})`;

  return { x, y, opacity, z, tilt, scale, focus };
}

function renderPair(index, { animate = true } = {}) {
  if (index === renderedPairIndex) return;

  const pair = pairs[index];
  renderedPairIndex = index;
  titleNode.textContent = pair.title;
  titleNode.classList.toggle("is-compact", pair.title.length > 8);
  copyNode.textContent = pair.copy;
  companyNode.textContent = pair.company;
  typeNode.textContent = pair.type;
  countNode.textContent = pair.count;

  if (!animate || reduceMotion || !spotlightNode) return;

  spotlightNode.classList.remove("is-switching");
  void spotlightNode.offsetWidth;
  spotlightNode.classList.add("is-switching");
}

function normalizePairIndex(index) {
  return (index + pairs.length) % pairs.length;
}

function renderCaseDialog(index) {
  const normalizedIndex = normalizePairIndex(index);
  const pair = pairs[normalizedIndex];
  const previousPair = pairs[normalizePairIndex(normalizedIndex - 1)];
  const nextPair = pairs[normalizePairIndex(normalizedIndex + 1)];
  const companyImage = pair.companyImage ?? pair.image;
  const caseImage = pair.caseImage ?? pair.image;

  activeCaseDialogIndex = normalizedIndex;
  caseDialogTitle.textContent = pair.title;
  caseDialogKind.textContent = pair.label;
  caseDialogCopy.textContent = pair.copy;
  caseDialogCompany.textContent = pair.company;
  caseDialogType.textContent = pair.type;
  caseDialogCount.textContent = pair.count;
  caseDialogCounter.textContent = `${String(normalizedIndex + 1).padStart(2, "0")} / ${String(pairs.length).padStart(2, "0")}`;
  caseDialogCompanyImage.src = companyImage;
  caseDialogCompanyImage.alt = `Визуал бренда ${pair.company}`;
  caseDialogCompanyImage.dataset.caseDialogCrop = caseDialogImageCrop.get(companyImage) ?? "none";
  caseDialogCaseImage.src = caseImage;
  caseDialogCaseImage.alt = `Визуал кейса ${pair.title}`;
  caseDialogCaseImage.dataset.caseDialogCrop = caseDialogImageCrop.get(caseImage) ?? "none";
  caseDialogPrevTitle.textContent = previousPair.title;
  caseDialogNextTitle.textContent = nextPair.title;
  caseDialogPrevButton.setAttribute("aria-label", `Предыдущий кейс: ${previousPair.title}`);
  caseDialogNextButton.setAttribute("aria-label", `Следующий кейс: ${nextPair.title}`);
}

function openCaseDialog(opener) {
  if (!caseDialog || caseDialog.open) return;

  caseDialogReturnFocus = opener;
  caseDialogAutoWasPaused = {
    company: companyPicker.autoPausedByUser,
    case: casePicker.autoPausedByUser,
  };
  caseDialogSelectionChanged = false;
  pauseOrbitalAutoplay();
  renderCaseDialog(renderedPairIndex < 0 ? 0 : renderedPairIndex);

  const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  document.body.style.setProperty("--case-dialog-scrollbar-gap", `${scrollbarGap}px`);
  document.documentElement.classList.add("case-dialog-is-open");
  document.body.classList.add("case-dialog-is-open");
  caseDialog.showModal();
  requestAnimationFrame(() => caseDialogCloseButton?.focus({ preventScroll: true }));
}

function closeCaseDialog() {
  if (caseDialog?.open) caseDialog.close();
}

function stepCaseDialog(direction) {
  const nextIndex = normalizePairIndex(activeCaseDialogIndex + direction);
  caseDialogSelectionChanged = true;
  renderCaseDialog(nextIndex);
  casePicker.select(nextIndex);
}

class LiquidGlassLens {
  constructor({
    root,
    magnification = 1.12,
    distortionAmount = 12,
    opacity = 1,
    blurAmount = 14,
    borderRadius = "clamp(24px, 2.6vw, 34px)",
  } = {}) {
    this.root = root;
    this.magnification = magnification;
    this.distortionAmount = distortionAmount;
    this.nodeMotion = new WeakMap();

    if (!this.root) return;

    this.root.style.setProperty("--lens-opacity", String(opacity));
    this.root.style.setProperty("--lens-blur", `${blurAmount}px`);
    this.root.style.setProperty("--lens-radius", borderRadius);
  }

  readFrame() {
    if (!this.root) return null;

    const lensRect = this.root.getBoundingClientRect();
    if (!lensRect.width || !lensRect.height) return null;

    return { lensRect, spotlightRect: spotlightNode?.getBoundingClientRect() };
  }

  readLane(laneRoot, frame) {
    if (!laneRoot || !frame) return null;

    const laneRect = laneRoot.getBoundingClientRect();
    if (!laneRect.width || !laneRect.height) return null;

    const { lensRect, spotlightRect } = frame;
    const isLeft = laneRect.left + laneRect.width / 2 < lensRect.left + lensRect.width / 2;
    const slotLeft = isLeft ? lensRect.left : spotlightRect?.right;
    const slotRight = isLeft ? spotlightRect?.left : lensRect.right;
    const slotWidth = slotRight - slotLeft;
    const slotCenter = slotLeft + slotWidth / 2;

    return { ...frame, laneRect, slotWidth, slotCenter };
  }

  maskSourceNode(node, state, frame, baseSize) {
    if (!node || !frame || !baseSize) return;

    const { laneRect, lensRect } = frame;
    const sourceX = laneRect.left + (state.x / 100) * laneRect.width;
    const sourceY = laneRect.top + (state.y / 100) * laneRect.height;
    const tilt = (state.tilt * Math.PI) / 180;
    const transformedSize = baseSize * state.scale * (Math.abs(Math.cos(tilt)) + Math.abs(Math.sin(tilt)));
    const halfSize = transformedSize / 2;
    const sourceLeft = sourceX - halfSize;
    const sourceRight = sourceX + halfSize;
    const sourceTop = sourceY - halfSize;
    const sourceBottom = sourceY + halfSize;
    const overlapsLens =
      sourceRight > lensRect.left &&
      sourceLeft < lensRect.right &&
      sourceBottom > lensRect.top &&
      sourceTop < lensRect.bottom;
    let clipPath = "";

    if (overlapsLens) {
      if (sourceTop >= lensRect.top && sourceBottom <= lensRect.bottom) {
        clipPath = "inset(50% 0 50% 0)";
      } else if (sourceTop < lensRect.top && sourceBottom <= lensRect.bottom) {
        const visibleFraction = clamp((lensRect.top - sourceTop) / transformedSize, 0, 1);
        // Only cut at the lens edge; leave room for the card's outer shadow.
        clipPath = `inset(-200% -200% ${((1 - visibleFraction) * 100).toFixed(2)}% -200%)`;
      } else if (sourceTop >= lensRect.top && sourceBottom > lensRect.bottom) {
        const hiddenFraction = clamp((lensRect.bottom - sourceTop) / transformedSize, 0, 1);
        clipPath = `inset(${(hiddenFraction * 100).toFixed(2)}% -200% -200% -200%)`;
      } else {
        clipPath = "inset(50% 0 50% 0)";
      }
    }

    node.style.clipPath = clipPath;
    node.style.webkitClipPath = clipPath;
  }

  syncNode(node, state, frame, isActive, baseSize) {
    if (!node || !frame) return;

    const { laneRect, lensRect } = frame;
    const sourceX = laneRect.left + (state.x / 100) * laneRect.width;
    const sourceY = laneRect.top + (state.y / 100) * laneRect.height;
    const rawX = sourceX - lensRect.left;
    const rawY = sourceY - lensRect.top;
    const centerX = lensRect.width / 2;
    const centerY = lensRect.height / 2;
    const normalX = (rawX - centerX) / centerX;
    const rawNormalY = (rawY - centerY) / centerY;
    const rawDistance = Math.sqrt(normalX * normalX * 0.58 + rawNormalY * rawNormalY * 1.52);
    const focus = clamp(1 - rawDistance, 0, 1);
    const glassEase = focus * focus * (3 - 2 * focus);
    const edgeBand = 16 * focus * focus * (1 - focus) * (1 - focus);
    const centerLock = glassEase * 0.16;
    const opticalRawY = rawY + (centerY - rawY) * centerLock;
    const normalY = (opticalRawY - centerY) / centerY;
    // Keep the focused card centered in its window beside the text panel.
    const orbitFocus = Math.pow(state.focus, 6);
    const refractedX = rawX + (
      -normalX * edgeBand * this.distortionAmount +
      Math.sin(normalY * Math.PI) * edgeBand * 2.4
    ) * (baseSize ? 1 - orbitFocus : 1);
    const refractedY =
      opticalRawY -
      normalY * edgeBand * this.distortionAmount * 0.65 +
      Math.cos(normalX * Math.PI) * edgeBand * 1.2;
    const tilt = state.tilt * (1 - glassEase * 0.68);
    const lensGrowth = Math.max(glassEase, orbitFocus);
    const magnification = baseSize && frame.slotWidth > 0
      ? Math.min(this.magnification, Math.max(0, frame.slotWidth - 12) / baseSize)
      : this.magnification;
    const baseScale = clamp(
      state.scale + (magnification - state.scale) * lensGrowth,
      state.scale,
      magnification,
    );
    const stretchX = 1 + edgeBand * (0.02 + Math.abs(normalX) * 0.05);
    const stretchY = 1 + edgeBand * (0.02 + Math.abs(normalY) * 0.05);
    const compensatedScale = baseScale / Math.max(stretchX, stretchY);
    const opacity = clamp(state.opacity + (1 - state.opacity) * glassEase, state.opacity, 1);
    const previous =
      this.nodeMotion.get(node) || {
        x: refractedX,
        y: refractedY,
        tilt,
        scale: compensatedScale,
        stretchX,
        stretchY,
        opacity,
        focus,
      };
    const ease = reduceMotion ? 1 : 0.24;
    const motion = {
      x: refractedX,
      y: refractedY,
      tilt: previous.tilt + (tilt - previous.tilt) * ease,
      scale: previous.scale + (compensatedScale - previous.scale) * ease,
      stretchX: previous.stretchX + (stretchX - previous.stretchX) * ease,
      stretchY: previous.stretchY + (stretchY - previous.stretchY) * ease,
      opacity: previous.opacity + (opacity - previous.opacity) * ease,
      focus: previous.focus + (focus - previous.focus) * ease,
    };
    this.nodeMotion.set(node, motion);

    node.style.left = `${motion.x.toFixed(2)}px`;
    node.style.top = `${motion.y.toFixed(2)}px`;
    node.style.opacity = motion.opacity.toFixed(3);
    node.style.zIndex = String(state.z + 20);
    node.style.transform = `translate(-50%, -50%) rotate(${motion.tilt.toFixed(2)}deg) scale(${motion.scale.toFixed(3)}) scaleX(${motion.stretchX.toFixed(3)}) scaleY(${motion.stretchY.toFixed(3)})`;
    node.style.filter = `saturate(${(1.04 + motion.focus * 0.07).toFixed(3)}) brightness(${(1.01 + motion.focus * 0.02).toFixed(3)}) contrast(1.02)`;
    node.classList.toggle("is-active", isActive);
  }

  trackPointer(event) {
    if (!this.root) return;

    const rect = this.root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    this.root.style.setProperty("--lens-light-x", `${(x * 100).toFixed(1)}%`);
    this.root.style.setProperty("--lens-light-y", `${(y * 100).toFixed(1)}%`);
    this.root.style.setProperty("--lens-shift-x", `${((x - 0.5) * 8).toFixed(2)}px`);
    this.root.style.setProperty("--lens-shift-y", `${((y - 0.5) * 5).toFixed(2)}px`);
  }

  resetPointer() {
    if (!this.root) return;

    this.root.style.setProperty("--lens-light-x", "50%");
    this.root.style.setProperty("--lens-light-y", "0%");
    this.root.style.setProperty("--lens-shift-x", "0px");
    this.root.style.setProperty("--lens-shift-y", "0px");
  }
}

class OrbitalPicker {
  constructor({ surface, values, selectedIndex = 0, lanes, lens, onChange, onPreview, onInteract }) {
    this.surface = surface;
    this.values = values;
    this.selectedIndex = selectedIndex;
    this.visualIndex = selectedIndex;
    this.lanes = lanes;
    this.lens = lens;
    this.onChange = onChange;
    this.onPreview = onPreview;
    this.onInteract = onInteract;
    this.step = (Math.PI * 2) / values.length;
    this.angle = this.angleForIndex(selectedIndex);
    this.targetAngle = this.angle;
    this.velocity = 0;
    this.dragging = false;
    this.pointerMoved = false;
    this.activePointerId = null;
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastMoveTime = performance.now();
    this.lastFrameTime = performance.now();
    this.snapAfter = 0;
    this.suppressClickUntil = 0;
    this.pointerCaptureTarget = null;
    this.pointerDownIndex = null;
    this.autoSpeed = reduceMotion ? 0 : 0.00115;
    this.autoPausedByUser = false;
    this.autoInViewport = true;
    this.nodes = [];
    this.lensNodes = [];
    this.decorations = [];

    this.mount();
    this.bind();
    this.update();
    requestAnimationFrame((now) => this.tick(now));
  }

  mount() {
    this.nodes = [];
    this.lensNodes = [];
    this.decorations = [];

    this.lanes.forEach((lane, laneIndex) => {
      lane.root.innerHTML = "";
      lane.lensRoot?.replaceChildren();
      this.nodes[laneIndex] = [];
      this.lensNodes[laneIndex] = [];
      this.decorations[laneIndex] = [];

      this.values.forEach((value, index) => {
        const node = lane.renderItem(value, index);
        node.addEventListener("click", (event) => {
          if (event.detail > 0 && performance.now() < this.suppressClickUntil) return;
          this.select(index);
        });
        lane.root.append(node);
        this.nodes[laneIndex][index] = node;

        if (lane.lensRoot && lane.renderLensItem) {
          const lensNode = lane.renderLensItem(value, index);
          lane.lensRoot.append(lensNode);
          this.lensNodes[laneIndex][index] = lensNode;
        }
      });

      lane.decorations?.forEach((decoration) => {
        const node = createOrbitDecorationNode(decoration);
        lane.root.append(node);

        const lensNode = lane.lensRoot ? createOrbitDecorationNode(decoration, { lens: true }) : null;
        if (lensNode) lane.lensRoot.append(lensNode);

        this.decorations[laneIndex].push({ node, lensNode, offset: decoration.offset });
      });
    });
  }

  bind() {
    this.surface?.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.surface?.addEventListener("pointermove", (event) => {
      this.lens?.trackPointer(event);
      this.onPointerMove(event);
    });
    this.surface?.addEventListener("pointerup", (event) => this.onPointerUp(event));
    this.surface?.addEventListener("pointercancel", (event) => this.onPointerUp(event, { cancelled: true }));
    this.surface?.addEventListener("pointerleave", () => this.lens?.resetPointer());
    this.surface?.addEventListener(
      "wheel",
      (event) => {
        if (event.ctrlKey) return;

        const axisDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (!axisDelta) return;

        event.preventDefault();
        this.pauseAutoByUser();
        const deltaUnit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        const delta = axisDelta * deltaUnit * 0.00045;
        this.targetAngle = null;
        this.angle += delta;
        this.velocity = clamp(this.velocity + delta * 0.16, -0.032, 0.032);
        this.snapAfter = performance.now() + 280;
        this.update();
      },
      { passive: false },
    );
    this.surface?.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (this.nearestIndex() + direction + this.values.length) % this.values.length;
      this.select(nextIndex);
      requestAnimationFrame(() => this.nodes[0]?.[nextIndex]?.focus({ preventScroll: true }));
    });
  }

  angleForIndex(index) {
    return -index * this.step;
  }

  nearestIndex(angle = this.angle) {
    let active = 0;
    let best = Infinity;

    this.values.forEach((_, index) => {
      const distance = Math.abs(normalizeAngle(angle + index * this.step));
      if (distance < best) {
        best = distance;
        active = index;
      }
    });

    return active;
  }

  select(index, { immediate = false } = {}) {
    this.pauseAutoByUser();
    const target = nearestEquivalentAngle(this.angleForIndex(index), this.angle);
    this.velocity = 0;
    this.snapAfter = 0;
    this.commit(index);

    if (immediate || reduceMotion) {
      this.angle = target;
      this.targetAngle = null;
      this.update();
      return;
    }

    this.targetAngle = target;
  }

  snapToNearest() {
    this.select(this.nearestIndex());
  }

  pauseAutoByUser() {
    this.autoPausedByUser = true;
    this.onInteract?.(this);
  }

  setAutoInViewport(isVisible) {
    this.autoInViewport = isVisible;
    if (!isVisible) {
      this.autoPausedByUser = false;
    }
  }

  commit(index) {
    if (index === this.selectedIndex) return;
    this.selectedIndex = index;
    this.onChange?.(this.values[index], index);
  }

  onPointerDown(event) {
    if (this.activePointerId !== null) return;

    this.pauseAutoByUser();
    this.dragging = true;
    this.pointerMoved = false;
    this.activePointerId = event.pointerId;
    this.targetAngle = null;
    this.velocity = 0;
    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.lastMoveTime = performance.now();
    const directNode = event.target.closest?.(".orbit-node");
    const hitSlop = event.pointerType === "touch" ? 12 : 3;
    const pointerNode = this.nodes
      .flat()
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        const opacity = Number.parseFloat(getComputedStyle(node).opacity);

        return (
          opacity > 0.35 &&
          rect.width > 0 &&
          rect.height > 0 &&
          event.clientX >= rect.left - hitSlop &&
          event.clientX <= rect.right + hitSlop &&
          event.clientY >= rect.top - hitSlop &&
          event.clientY <= rect.bottom + hitSlop
        );
      })
      .sort((first, second) => {
        const firstRect = first.getBoundingClientRect();
        const secondRect = second.getBoundingClientRect();
        const firstDistance = Math.hypot(
          event.clientX - (firstRect.left + firstRect.width / 2),
          event.clientY - (firstRect.top + firstRect.height / 2),
        );
        const secondDistance = Math.hypot(
          event.clientX - (secondRect.left + secondRect.width / 2),
          event.clientY - (secondRect.top + secondRect.height / 2),
        );

        return firstDistance - secondDistance;
      })[0] ?? (directNode && this.surface.contains(directNode) ? directNode : null);
    this.pointerDownIndex = pointerNode ? Number(pointerNode.dataset.index) : null;
    this.pointerCaptureTarget = pointerNode ?? this.surface;
    this.pointerCaptureTarget.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    if (!this.dragging || event.pointerId !== this.activePointerId) return;

    const now = performance.now();
    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;
    const elapsed = Math.max(8, now - this.lastMoveTime);
    const deltaAngle = deltaX * 0.0032 + deltaY * 0.0006;

    if (Math.hypot(event.clientX - this.pointerStartX, event.clientY - this.pointerStartY) > 4) {
      this.pointerMoved = true;
    }

    this.angle += deltaAngle;
    this.velocity = clamp(deltaAngle / (elapsed / 16.67), -0.055, 0.055);
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.lastMoveTime = now;
    this.update();
  }

  onPointerUp(event, { cancelled = false } = {}) {
    if (!this.dragging || event.pointerId !== this.activePointerId) return;

    const tappedIndex = this.pointerDownIndex;
    this.pointerDownIndex = null;
    this.dragging = false;
    this.activePointerId = null;
    if (this.pointerCaptureTarget?.hasPointerCapture?.(event.pointerId)) {
      this.pointerCaptureTarget.releasePointerCapture(event.pointerId);
    }
    this.pointerCaptureTarget = null;

    if (cancelled) {
      this.velocity = 0;
      this.snapToNearest();
      return;
    }

    if (this.pointerMoved) {
      this.suppressClickUntil = performance.now() + 260;
    } else if (Number.isInteger(tappedIndex)) {
      this.suppressClickUntil = performance.now() + 260;
      this.select(tappedIndex);
      return;
    }

    if (reduceMotion || Math.abs(this.velocity) < 0.01) {
      this.snapToNearest();
      return;
    }

    this.snapAfter = performance.now() + 320;
  }

  update() {
    const nextVisualIndex = this.nearestIndex();
    if (nextVisualIndex !== this.visualIndex) {
      this.onPreview?.(this.values[nextVisualIndex], nextVisualIndex);
    }

    this.visualIndex = nextVisualIndex;
    const lensFrame = this.lens?.readFrame();
    const lensLaneFrames = this.lanes.map((lane) =>
      lane.lensRoot && lensFrame ? this.lens.readLane(lane.root, lensFrame) : null,
    );
    const lensCenterDrops = lensLaneFrames.map((frame) => {
      if (!frame) return null;

      const laneCenter = frame.laneRect.top + frame.laneRect.height / 2;
      const lensCenter = frame.lensRect.top + frame.lensRect.height / 2;
      return ((lensCenter - laneCenter) / frame.laneRect.height) * 100;
    });
    const sourceBaseSizes = this.nodes.map((nodes) => nodes[0]?.offsetHeight || 0);

    this.values.forEach((_, index) => {
      const baseAngle = this.angle + index * this.step;
      const isActive = index === nextVisualIndex;

      this.lanes.forEach((lane, laneIndex) => {
        const orbitAngle = lane.mirror ? Math.PI - baseAngle : baseAngle;
        const node = this.nodes[laneIndex][index];
        const state = setNodePosition(node, orbitAngle, lane.id, index, isActive, {
          centerDrop: lensCenterDrops[laneIndex],
          focusX: lensLaneFrames[laneIndex]
            ? ((lensLaneFrames[laneIndex].slotCenter - lensLaneFrames[laneIndex].laneRect.left) / lensLaneFrames[laneIndex].laneRect.width) * 100
            : undefined,
        });
        const lensNode = this.lensNodes[laneIndex]?.[index];
        this.lens?.maskSourceNode(node, state, lensLaneFrames[laneIndex], sourceBaseSizes[laneIndex]);
        node.classList.toggle("is-active", isActive);
        node.setAttribute("aria-pressed", String(isActive));
        node.tabIndex = isActive ? 0 : -1;

        if (lensNode) {
          this.lens?.syncNode(lensNode, state, lensLaneFrames[laneIndex], isActive, sourceBaseSizes[laneIndex]);
        }
      });
    });

    this.lanes.forEach((lane, laneIndex) => {
      this.decorations[laneIndex]?.forEach(({ node, lensNode, offset }) => {
        const decorationAngle = wrapDecorationAngle(this.angle + offset);
        const orbitAngle = lane.mirror ? Math.PI - decorationAngle : decorationAngle;
        const state = setNodePosition(node, orbitAngle, lane.id, -1, false, { stickToRing: true });

        if (lensNode) {
          this.lens?.syncNode(lensNode, state, lensLaneFrames[laneIndex], false);
        }
      });
    });
  }

  tick(now) {
    const delta = Math.min(2, (now - this.lastFrameTime) / 16.67 || 1);
    this.lastFrameTime = now;

    if (!this.dragging) {
      if (this.targetAngle !== null) {
        const diff = this.targetAngle - this.angle;
        this.angle += diff * Math.min(1, 0.09 * delta);
        this.velocity *= 0.74;

        if (Math.abs(diff) < 0.002) {
          this.angle = this.targetAngle;
          this.targetAngle = null;
          this.velocity = 0;
          this.commit(this.nearestIndex());
        }
      } else if (this.snapAfter && now > this.snapAfter && Math.abs(this.velocity) < 0.018) {
        this.snapAfter = 0;
        this.snapToNearest();
      } else if (!reduceMotion && Math.abs(this.velocity) > 0.0006) {
        this.angle += this.velocity * delta;
        this.velocity *= Math.pow(0.84, delta);
      } else if (this.autoSpeed && this.autoInViewport && !this.autoPausedByUser) {
        this.angle += this.autoSpeed * delta;
        this.velocity = 0;
      } else if (this.snapAfter && now > this.snapAfter) {
        this.snapAfter = 0;
        this.snapToNearest();
      }
    }

    this.update();
    requestAnimationFrame((frameNow) => this.tick(frameNow));
  }
}

const liquidLens = new LiquidGlassLens({
  root: liquidLensRoot,
  magnification: 1.12,
  distortionAmount: 12,
  opacity: 1,
  blurAmount: 14,
});

let companyPicker;
let casePicker;
let synchronizingOrbitPickers = false;

function pauseOrbitalAutoplay() {
  if (companyPicker) companyPicker.autoPausedByUser = true;
  if (casePicker) casePicker.autoPausedByUser = true;
}

function synchronizeOrbitPicker(targetPicker, index) {
  renderPair(index % pairs.length);
  if (!targetPicker || synchronizingOrbitPickers) return;

  synchronizingOrbitPickers = true;
  targetPicker.select(index, { immediate: true });
  synchronizingOrbitPickers = false;
}

companyPicker = new OrbitalPicker({
  surface: companyOrbit,
  values: orbitPairs,
  selectedIndex: 0,
  lens: liquidLens,
  lanes: [
    {
      id: "left",
      root: companyOrbit,
      lensRoot: companyLensLayer,
      renderItem: createCompanyNode,
      renderLensItem: createCompanyLensNode,
      decorations: ORBIT_DECORATIONS.left,
    },
  ],
  onChange: (_, index) => synchronizeOrbitPicker(casePicker, index),
  onPreview: (_, index) => {
    if (companyPicker.autoPausedByUser) renderPair(index % pairs.length);
  },
  onInteract: pauseOrbitalAutoplay,
});

casePicker = new OrbitalPicker({
  surface: caseOrbit,
  values: orbitPairs,
  selectedIndex: 0,
  lens: liquidLens,
  lanes: [
    {
      id: "right",
      root: caseOrbit,
      lensRoot: caseLensLayer,
      renderItem: createCaseNode,
      renderLensItem: createCaseLensNode,
      decorations: ORBIT_DECORATIONS.right,
      mirror: true,
    },
  ],
  onChange: (_, index) => synchronizeOrbitPicker(companyPicker, index),
  onPreview: (_, index) => renderPair(index % pairs.length),
  onInteract: pauseOrbitalAutoplay,
});

const topSection = document.querySelector("#top");
if (topSection) {
  const autoObserver = new IntersectionObserver(
    ([entry]) => {
      const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.68;
      companyPicker.setAutoInViewport(isVisible);
      casePicker.setAutoInViewport(isVisible);
    },
    { threshold: [0, 0.28, 0.68, 0.9] },
  );

  autoObserver.observe(topSection);
}

document.querySelectorAll("[data-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = Number(button.dataset.step);
    const activeIndex = casePicker.nearestIndex();
    const nextIndex = (activeIndex + direction + orbitPairs.length) % orbitPairs.length;
    casePicker.select(nextIndex);
  });
});

const casesMenuRoot = document.querySelector("[data-cases-menu]");
const casesMenuTrigger = document.querySelector("[data-cases-menu-trigger]");
const casesPopover = document.querySelector("[data-cases-popover]");

if (casesMenuRoot && casesMenuTrigger && casesPopover) {
  const setCasesMenuOpen = (isOpen, { returnFocus = false } = {}) => {
    casesMenuTrigger.setAttribute("aria-expanded", String(isOpen));
    casesPopover.hidden = !isOpen;

    if (!isOpen && returnFocus) casesMenuTrigger.focus();
  };

  casesMenuTrigger.addEventListener("click", () => {
    const isOpen = casesMenuTrigger.getAttribute("aria-expanded") === "true";
    setCasesMenuOpen(!isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!casesMenuRoot.contains(event.target)) setCasesMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && casesMenuTrigger.getAttribute("aria-expanded") === "true") {
      setCasesMenuOpen(false, { returnFocus: true });
    }
  });

  document.querySelectorAll(".screen-nav a").forEach((link) => {
    link.addEventListener("click", () => setCasesMenuOpen(false));
  });
}

if (caseDialogOpenButton && caseDialog && caseDialogCloseButton) {
  caseDialogOpenButton.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  caseDialogOpenButton.addEventListener("click", (event) => {
    openCaseDialog(event.currentTarget);
  });

  caseDialogCloseButton.addEventListener("click", closeCaseDialog);
  caseDialogPrevButton?.addEventListener("click", () => stepCaseDialog(-1));
  caseDialogNextButton?.addEventListener("click", () => stepCaseDialog(1));

  caseDialog.addEventListener("click", (event) => {
    if (event.target === caseDialog) closeCaseDialog();
  });

  caseDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeCaseDialog();
    }
  });

  caseDialog.addEventListener("close", () => {
    document.documentElement.classList.remove("case-dialog-is-open");
    document.body.classList.remove("case-dialog-is-open");
    document.body.style.removeProperty("--case-dialog-scrollbar-gap");
    companyPicker.autoPausedByUser = caseDialogSelectionChanged || caseDialogAutoWasPaused.company;
    casePicker.autoPausedByUser = caseDialogSelectionChanged || caseDialogAutoWasPaused.case;
    caseDialogReturnFocus?.focus({ preventScroll: true });
    caseDialogReturnFocus = null;
  });
}

const processCarousel = document.querySelector("[data-process-carousel]");
const processSteps = Array.from(document.querySelectorAll("[data-process-step]"));

if (processCarousel && processSteps.length) {
  const processStack = processCarousel.querySelector("[data-process-stack]");
  const processStepButtons = processSteps.map((step) => step.querySelector("[data-process-step-select]"));
  let activeProcessIndex = 0;
  let processDrag = null;
  let suppressProcessClick = false;

  const resetProcessDrag = () => {
    const drag = processDrag;
    processDrag = null;
    processStack?.classList.remove("is-dragging");
    drag?.card.style.removeProperty("--step-drag-x");
    drag?.card.style.removeProperty("--step-drag-rotation");
    if (drag && processStack?.hasPointerCapture(drag.pointerId)) {
      processStack.releasePointerCapture(drag.pointerId);
    }
  };

  const setActiveProcessStep = (nextIndex, { focus = null } = {}) => {
    const hadCardFocus = processStepButtons.includes(document.activeElement);
    resetProcessDrag();
    activeProcessIndex = (nextIndex + processSteps.length) % processSteps.length;
    processStack?.setAttribute("data-active-index", String(activeProcessIndex));

    processSteps.forEach((step, index) => {
      const isActive = index === activeProcessIndex;
      const selectButton = processStepButtons[index];

      // Slots describe depth in the deck, not the permanent step number.
      step.dataset.stackSlot = String((index - activeProcessIndex + processSteps.length) % processSteps.length);
      step.classList.toggle("is-active", isActive);
      step.classList.toggle("is-under", !isActive);
      selectButton?.setAttribute("aria-pressed", String(isActive));
      if (selectButton) selectButton.tabIndex = isActive ? 0 : -1;
    });

    if (focus === "card" || (focus === null && hadCardFocus)) {
      processStepButtons[activeProcessIndex]?.focus({ preventScroll: true });
    }
  };

  const handleProcessNavigation = (event, index, focus) => {
    let nextIndex = null;

    if (event.key === "ArrowRight") nextIndex = index + 1;
    if (event.key === "ArrowLeft") nextIndex = index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = processSteps.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    setActiveProcessStep(nextIndex, { focus });
  };

  processStepButtons.forEach((button, index) => {
    button?.addEventListener("click", () => setActiveProcessStep(index));
    button?.addEventListener("keydown", (event) => handleProcessNavigation(event, index, "card"));
  });

  processStack?.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || !event.target.closest("[data-process-step]")) return;
    resetProcessDrag();
    suppressProcessClick = false;
    const card = processSteps[activeProcessIndex];
    processDrag = {
      pointerId: event.pointerId,
      card,
      width: card.offsetWidth,
      startX: event.clientX,
      startY: event.clientY,
      horizontal: false,
    };
  });

  // A second finger anywhere on the page leaves pinch/scroll to the browser.
  window.addEventListener("pointerdown", (event) => {
    if (processDrag && !event.isPrimary && event.pointerType === "touch") {
      suppressProcessClick = true;
      resetProcessDrag();
    }
  });

  window.addEventListener("pointermove", (event) => {
    const drag = processDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.horizontal) {
      if (Math.hypot(deltaX, deltaY) < 10) return;
      suppressProcessClick = true;
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        resetProcessDrag();
        return;
      }
      drag.horizontal = true;
      processStack.setPointerCapture(drag.pointerId);
      processStack.classList.add("is-dragging");
    }

    if (event.cancelable) event.preventDefault();
    drag.card.style.setProperty("--step-drag-x", `${deltaX}px`);
    drag.card.style.setProperty("--step-drag-rotation", `${Math.max(-12, Math.min(12, deltaX / drag.width * 12))}deg`);
  }, { passive: false });

  window.addEventListener("pointerup", (event) => {
    const drag = processDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const threshold = Math.max(32, Math.min(80, drag.width * 0.18));
    const direction = drag.horizontal && Math.abs(deltaX) >= threshold
      ? (deltaX < 0 ? 1 : -1)
      : 0;
    resetProcessDrag();
    if (direction) setActiveProcessStep(activeProcessIndex + direction);
  });

  const cancelProcessDrag = (event) => {
    if (processDrag?.pointerId !== event.pointerId) return;
    suppressProcessClick = true;
    resetProcessDrag();
  };
  window.addEventListener("pointercancel", cancelProcessDrag);
  processStack?.addEventListener("lostpointercapture", (event) => {
    // Ignore a child button releasing its implicit touch capture to the stack.
    if (event.target === processStack) cancelProcessDrag(event);
  });
  window.addEventListener("resize", () => {
    if (processDrag) suppressProcessClick = true;
    resetProcessDrag();
  });

  processStack?.addEventListener("click", (event) => {
    // Keyboard clicks have detail 0; the next pointerdown clears suppression.
    if (!suppressProcessClick || event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
    suppressProcessClick = false;
  }, true);

  setActiveProcessStep(0);
}

(() => {
  const skills = document.querySelector("[data-skills]");
  if (!skills) return;

  const buttons = Array.from(skills.querySelectorAll("[data-skill-select]"));
  const image = skills.querySelector("[data-skill-image]");
  const title = skills.querySelector("[data-skill-title]");
  const category = skills.querySelector("[data-skill-category-label]");
  const taskList = skills.querySelector("[data-skill-tasks]");
  if (!buttons.length || !image || !title || !category || !taskList) return;

  const selectSkill = (button) => {
    const buttonImage = button.querySelector("img");
    if (!buttonImage) return;

    let tasks;
    try {
      tasks = JSON.parse(button.dataset.skillTasks || "[]");
    } catch {
      return;
    }
    if (!Array.isArray(tasks) || !tasks.every((task) => typeof task === "string")) return;

    image.src = buttonImage.src;
    image.alt = buttonImage.alt;
    title.textContent = button.dataset.skillName;
    category.textContent = button.dataset.skillCategory;
    taskList.replaceChildren(...tasks.map((task) => {
      const item = document.createElement("li");
      item.textContent = task;
      return item;
    }));
    buttons.forEach((candidate) => {
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });
  };

  buttons.forEach((button) => button.addEventListener("click", () => selectSkill(button)));
  selectSkill(buttons.find((button) => button.getAttribute("aria-pressed") === "true") || buttons[0]);
})();

renderPair(0, { animate: false });
