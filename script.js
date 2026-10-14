const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let reduceMotion = motionPreference.matches;
const motionEasing = "cubic-bezier(0.22, 1, 0.36, 1)";
const runningUiAnimations = new Map();

function playUiMotion(element, keyframes, { duration = 220, easing = motionEasing } = {}) {
  if (!element || reduceMotion || !element.animate) return null;
  runningUiAnimations.get(element)?.cancel();
  const animation = element.animate(keyframes, { duration, easing });
  runningUiAnimations.set(element, animation);
  animation.finished.catch(() => {}).finally(() => {
    if (runningUiAnimations.get(element) === animation) runningUiAnimations.delete(element);
  });
  return animation;
}

function waitForUiMotion(elements, timeout = 340) {
  if (reduceMotion) return Promise.resolve();
  const animations = elements.flatMap((element) => element?.getAnimations?.() ?? []);
  if (!animations.length) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    let timer;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
    timer = setTimeout(finish, timeout);
    Promise.all(animations.map((animation) => animation.finished.catch(() => {}))).then(finish);
  });
}


const motionScrolls = new Map();

function cancelMotionScroll(scroller) {
  const state = motionScrolls.get(scroller);
  if (!state) return;
  cancelAnimationFrame(state.frame);
  motionScrolls.delete(scroller);
}

function scrollWithMotion(scroller, requestedTop) {
  if (!scroller) return;
  cancelMotionScroll(scroller);
  const from = scroller.scrollTop;
  const top = Math.max(0, Math.min(requestedTop, scroller.scrollHeight - scroller.clientHeight));
  if (reduceMotion || Math.abs(top - from) < 1) {
    scroller.scrollTo({ top, behavior: "instant" });
    return;
  }
  const duration = Math.min(720, Math.max(420, 320 + Math.abs(top - from) * 0.09));
  const start = performance.now();
  const state = { frame: 0 };
  motionScrolls.set(scroller, state);
  const tick = (now) => {
    if (motionScrolls.get(scroller) !== state) return;
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    scroller.scrollTo({ top: from + (top - from) * eased, behavior: "instant" });
    if (progress < 1) state.frame = requestAnimationFrame(tick);
    else motionScrolls.delete(scroller);
  };
  state.frame = requestAnimationFrame(tick);
}

function cancelAllMotionScrolls() {
  motionScrolls.forEach((_, scroller) => cancelMotionScroll(scroller));
}

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href*="#"]');
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || url.hash.length < 2) return;
  let id;
  try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target || caseDialog?.open) return;
  event.preventDefault();
  history.pushState(null, "", url.hash);
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus({ preventScroll: true });
  scrollWithMotion(document.scrollingElement, target.getBoundingClientRect().top + window.scrollY);
});

window.addEventListener("wheel", cancelAllMotionScrolls, { passive: true });
window.addEventListener("touchstart", cancelAllMotionScrolls, { passive: true });
window.addEventListener("pointerdown", cancelAllMotionScrolls, { passive: true });
window.addEventListener("resize", cancelAllMotionScrolls);
window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab", "Escape"].includes(event.key)) cancelAllMotionScrolls();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelAllMotionScrolls();
});

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
    copy: "Я\u00a0собираю знак, упаковку, визуалы и\u00a0правила кампании.",
  },
  {
    company: "Mirai",
    label: "логотип",
    type: "логотип",
    count: "1 логотип",
    companyImage: "./assets/company-mirai.png",
    companyArtwork: true,
    title: "Mirai",
    short: "Mirai",
    copy: "Логотип Mirai.",
  },
  {
    company: "Round",
    label: "логотип",
    type: "логотип",
    count: "1 логотип",
    companyImage: "./assets/company-round.png",
    companyArtwork: true,
    title: "Round",
    short: "Round",
    copy: "Логотип Round.",
  },
  {
    company: "Forma",
    label: "цифровая студия",
    type: "цифровой бренд",
    count: "22 материала",
    image: "./assets/case-forma.png",
    title: "Forma",
    short: "Forma",
    copy: "Я\u00a0задаю интерфейсные правила, анимацию и\u00a0презентационный набор.",
  },
  {
    company: "Kinto",
    label: "линейка объектов",
    type: "упаковка / система",
    count: "16 материалов",
    image: "./assets/case-kinto.png",
    title: "Kinto",
    short: "Kinto",
    copy: "Я\u00a0соединяю знак, материал, тиснение и\u00a0серию носителей.",
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
    copy: "Я\u00a0проектирую визуальный язык, лендинг и\u00a0digital-носители.",
  },
  {
    company: "Pinhead",
    label: "креативная студия",
    type: "мерч",
    count: "1 материал",
    caseImage: "./assets/case-pinhead.png?v=20261010-01",
    companyImage: "./assets/company-pinhead.png",
    companyArtwork: true,
    title: "Pinhead",
    short: "Pinhead",
    copy: "Футболка с\u00a0принтом Forever Sexy Forever Busy.",
  },
  {
    company: "Sensa",
    label: "beauty-бренд",
    type: "упаковка / арт-дирекшн",
    count: "19 материалов",
    image: "./assets/case-kinto.png",
    title: "Sensa",
    short: "Sensa",
    copy: "Я\u00a0веду упаковку, фотостиль и\u00a0визуальную систему запуска.",
  },
  {
    company: "Motto",
    label: "медиа-платформа",
    type: "редакционная система",
    count: "34 материала",
    image: "./assets/case-noire.png",
    title: "Motto",
    short: "Motto",
    copy: "Я\u00a0строю редакционную сетку, типографику и\u00a0промо-набор.",
  },
  {
    company: "Vera",
    label: "культурная серия",
    type: "плакаты / концепция",
    count: "15 материалов",
    image: "./assets/case-cult.png",
    title: "Vera",
    short: "Vera",
    copy: "Я\u00a0собираю постеры, визуальную идею и\u00a0серию кампейн-материалов.",
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

const revealItems = document.querySelectorAll(".reveal");

if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

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
const caseReaderSurface = document.querySelector("[data-case-reader-surface]");
const caseReaderScroll = document.querySelector("[data-case-reader-scroll]");
const caseReaderHeading = document.querySelector("[data-case-reader-heading]");
const caseReaderCover = document.querySelector("[data-case-reader-cover]");
const caseReaderTask = document.querySelector("[data-case-reader-task]");
const caseReaderStages = document.querySelector("[data-case-reader-stages]");
const caseReaderResult = document.querySelector("[data-case-reader-result]");
const caseReaderGallery = document.querySelector("[data-case-reader-gallery]");
const caseReaderSections = Array.from(document.querySelectorAll("[data-case-section]"));
const caseReaderSectionLinks = Array.from(document.querySelectorAll("[data-case-section-link]"));
const caseStackPreviousImage = document.querySelector("[data-case-stack-previous-image]");
const caseStackNextImage = document.querySelector("[data-case-stack-next-image]");
const caseStackPreviousTitle = document.querySelector("[data-case-stack-previous-title]");
const caseStackNextTitle = document.querySelector("[data-case-stack-next-title]");
const caseStackPreviousHint = document.querySelector("[data-case-stack-previous-hint]");
const caseStackNextHint = document.querySelector("[data-case-stack-next-hint]");
const caseImageViewer = document.querySelector("[data-case-image-viewer]");
const caseImageViewerBack = document.querySelector("[data-case-image-viewer-back]");
const caseImageViewerImage = document.querySelector("[data-case-image-viewer-image]");
const caseImageViewerCaption = document.querySelector("[data-case-image-viewer-caption]");
let renderedPairIndex = -1;
let activeCaseDialogIndex = 0;
let caseDialogReturnFocus = null;
let caseDialogAutoWasPaused = false;
let caseDialogSelectionChanged = false;
let caseReaderScrollFrame = 0;
let caseReaderAnchorTarget = null;
let caseImageViewerReturnFocus = null;
let activeCaseCover = null;
const caseDialogCard = document.querySelector(".case-dialog-card");
const caseDialogStack = document.querySelector(".case-dialog-stack");
const caseDialogStackCards = Array.from(document.querySelectorAll(".case-dialog-stack-card"));
let caseClosingPromise = null;
let caseMotionSerial = 0;
let caseSwitchSerial = 0;
let caseCardTransition = null;
let caseViewerMotionSerial = 0;

function clearCaseExitStyles() {
  [caseDialogCard, ...caseDialogStackCards].forEach((element) => {
    element?.style.removeProperty("--case-exit-opacity");
    element?.style.removeProperty("--case-exit-transform");
    element?.style.removeProperty("opacity");
    element?.style.removeProperty("transform");
  });
  caseDialog?.style.removeProperty("--case-backdrop-exit-opacity");
  caseDialog?.style.removeProperty("--case-close-center-delay");
  caseDialog?.style.removeProperty("--case-close-side-duration");
}

function clearCaseTransition(transition = caseCardTransition) {
  if (!transition || caseCardTransition !== transition) return;
  transition.elements.forEach((element) => runningUiAnimations.get(element)?.cancel());
  transition.ghost?.remove();
  caseCardTransition = null;
  caseDialog.classList.remove("is-switching");
  caseDialogCard.style.removeProperty("opacity");
  caseDialogCard.style.removeProperty("transform");
  caseDialogStackCards.forEach((element) => {
    if (transition.closeRequested && caseDialog.open) element.style.opacity = "0";
    else element.style.removeProperty("opacity");
    element.style.removeProperty("transform");
  });
  caseDialogStack.inert = Boolean(caseClosingPromise);
  caseDialogCard.inert = Boolean(caseClosingPromise);
}

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
  const image = pair.caseImage ?? pair.image;
  button.hidden = !image;
  if (image) button.innerHTML = `<img src="${image}" alt="" />`;
  return button;
}

function createCaseLensNode(pair, index) {
  const node = document.createElement("div");
  node.className = "orbit-node case-node lens-node";
  node.dataset.index = String(index);
  const image = pair.caseImage ?? pair.image;
  node.hidden = !image;
  if (image) node.innerHTML = `<img src="${image}" alt="" />`;
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

function getOrbitPosition(angle, lane, { stickToRing = false, centerDrop: alignedCenterDrop, focusX } = {}) {
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

  return { x, y, focus, focusEase };
}

function setNodePosition(node, angle, lane, index, isActive, positionOptions = {}) {
  const { x, y, focus, focusEase } = getOrbitPosition(angle, lane, positionOptions);
  const viewportWidth = window.innerWidth;
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

// Add approved case content in pair.story without changing the reader layout:
// { about: [paragraph], task: { paragraphs: [], items: [] },
//   stages: [{ title, paragraphs: [], media: [{ src, alt, caption }] }],
//   result: { paragraphs: [], media: [{ src, alt, caption }] }, cover: { src, alt } }.
// Existing copy and artwork remain the fallback; missing process details stay explicit.
function getCaseStory(pair) {
  const story = pair.story ?? {};
  const artwork = pair.caseImage ?? pair.image;
  const logo = pair.companyImage;
  const existingMedia = [];
  if (artwork) existingMedia.push({ src: artwork, alt: `Визуал кейса ${pair.title}` });
  if (logo && logo !== artwork) existingMedia.push({ src: logo, alt: `Визуал бренда ${pair.company}` });

  return {
    about: Array.isArray(story.about) && story.about.length ? story.about : [pair.copy],
    task: story.task ?? {},
    stages: Array.isArray(story.stages) ? story.stages : [],
    result: story.result ?? {},
    media: Array.isArray(story.result?.media) ? story.result.media : existingMedia,
    cover: story.cover ?? existingMedia[0] ?? null,
    logoOnly: !artwork && Boolean(logo) && !story.cover,
  };
}

function appendCaseParagraphs(container, paragraphs, emptyText = "") {
  const validParagraphs = Array.isArray(paragraphs)
    ? paragraphs.filter((paragraph) => typeof paragraph === "string" && paragraph.trim())
    : [];
  validParagraphs.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.className = "case-reader-paragraph";
    paragraph.textContent = text;
    container.append(paragraph);
  });
  if (!validParagraphs.length && emptyText) {
    const paragraph = document.createElement("p");
    paragraph.className = "case-reader-empty";
    paragraph.textContent = emptyText;
    container.append(paragraph);
  }
}

function setCaseImage(image, media) {
  image.hidden = !media?.src;
  if (!media?.src) {
    image.removeAttribute("src");
    image.alt = "";
    return;
  }
  image.src = media.src;
  image.alt = media.alt ?? "Материал проекта";
  image.dataset.caseDialogCrop = media.crop ?? caseDialogImageCrop.get(media.src) ?? "none";
}

function appendCaseMedia(container, mediaItems) {
  if (!Array.isArray(mediaItems)) return;
  mediaItems.forEach((media) => {
    if (!media?.src) return;
    const figure = document.createElement("figure");
    figure.className = "case-reader-media";
    const button = document.createElement("button");
    button.className = "case-reader-image-button";
    button.type = "button";
    button.setAttribute("aria-label", `Увеличить: ${media.alt ?? "материал проекта"}`);
    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    setCaseImage(image, media);
    button.append(image);
    button.addEventListener("click", () => openCaseImageViewer(media, button));
    figure.append(button);
    if (media.caption) {
      const caption = document.createElement("figcaption");
      caption.textContent = media.caption;
      figure.append(caption);
    }
    container.append(figure);
  });
}

function setActiveCaseSection(sectionName) {
  caseReaderSectionLinks.forEach((link) => {
    const isActive = link.dataset.caseSectionLink === sectionName;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function updateActiveCaseSection() {
  if (!caseDialog?.open || !caseReaderScroll || !caseReaderSections.length) return;
  if (caseReaderAnchorTarget) {
    setActiveCaseSection(caseReaderAnchorTarget);
    return;
  }
  const threshold = caseReaderScroll.getBoundingClientRect().top + Math.min(140, caseReaderScroll.clientHeight * 0.28);
  let currentSection = caseReaderSections[0];
  caseReaderSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= threshold) currentSection = section;
  });
  if (caseReaderScroll.scrollTop + caseReaderScroll.clientHeight >= caseReaderScroll.scrollHeight - 2) {
    currentSection = caseReaderSections[caseReaderSections.length - 1];
  }
  setActiveCaseSection(currentSection.dataset.caseSection);
}

function closeCaseImageViewer({ returnFocus = true, immediate = false } = {}) {
  if (!caseImageViewer || caseImageViewer.hidden) return Promise.resolve();
  const serial = ++caseViewerMotionSerial;
  const finish = () => {
    if (serial !== caseViewerMotionSerial) return;
    caseImageViewer.hidden = true;
    caseDialog.classList.remove("is-viewing-image");
    caseReaderSurface.inert = false;
    caseReaderSurface.removeAttribute("aria-hidden");
    caseImageViewerImage.removeAttribute("src");
    if (returnFocus && caseImageViewerReturnFocus?.isConnected) {
      caseImageViewerReturnFocus.focus({ preventScroll: true });
    }
    caseImageViewerReturnFocus = null;
    if (!immediate && caseDialog.open && !caseDialog.classList.contains("is-closing")) {
      playUiMotion(caseReaderSurface, [
        { opacity: 0.7, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ]);
    }
  };
  if (immediate || reduceMotion) {
    runningUiAnimations.get(caseImageViewer)?.cancel();
    finish();
    return Promise.resolve();
  }
  const style = getComputedStyle(caseImageViewer);
  const animation = playUiMotion(caseImageViewer, [
    { opacity: style.opacity, transform: style.transform },
    { opacity: 0, transform: "translateY(8px)" },
  ], { duration: 160 });
  return (animation?.finished.catch(() => {}) ?? Promise.resolve()).then(finish);
}

function openCaseImageViewer(media, opener) {
  if (!caseDialog?.open || caseDialog.classList.contains("is-closing") || !media?.src || !caseImageViewer) return;
  ++caseViewerMotionSerial;
  const opacity = caseImageViewer.hidden ? 0 : Number(getComputedStyle(caseImageViewer).opacity);
  caseImageViewerReturnFocus = opener;
  caseImageViewerImage.src = media.src;
  caseImageViewerImage.alt = media.alt ?? "Материал проекта";
  caseImageViewerCaption.textContent = media.caption ?? media.alt ?? "";
  caseImageViewer.hidden = false;
  caseImageViewer.querySelector(".case-image-viewer-frame").scrollTo({ top: 0, left: 0, behavior: "instant" });
  caseDialog.classList.add("is-viewing-image");
  caseReaderSurface.inert = true;
  caseReaderSurface.setAttribute("aria-hidden", "true");
  caseImageViewerBack.focus({ preventScroll: true });
  playUiMotion(caseImageViewer, [
    { opacity, transform: "translateY(8px)" },
    { opacity: 1, transform: "translateY(0)" },
  ]);
}

function renderCaseDialog(index) {
  const normalizedIndex = normalizePairIndex(index);
  const pair = pairs[normalizedIndex];
  const previousPair = pairs[normalizePairIndex(normalizedIndex - 1)];
  const nextPair = pairs[normalizePairIndex(normalizedIndex + 1)];
  const companyImage = pair.companyImage ?? pair.image;
  const story = getCaseStory(pair);

  closeCaseImageViewer({ returnFocus: false, immediate: true });
  activeCaseDialogIndex = normalizedIndex;
  caseDialogTitle.textContent = pair.title;
  caseReaderHeading.textContent = pair.title;
  caseDialogKind.textContent = pair.label;
  caseDialogCopy.replaceChildren();
  appendCaseParagraphs(caseDialogCopy, story.about);
  caseDialogCompany.textContent = pair.company;
  caseDialogType.textContent = pair.type;
  caseDialogCount.textContent = pair.count;
  caseDialogCounter.textContent = `${String(normalizedIndex + 1).padStart(2, "0")} / ${String(pairs.length).padStart(2, "0")}`;
  setCaseImage(caseDialogCompanyImage, companyImage ? { src: companyImage, alt: "" } : null);
  activeCaseCover = story.cover;
  caseReaderCover.hidden = !activeCaseCover?.src;
  caseReaderCover.classList.toggle("case-reader-cover--logo", story.logoOnly);
  caseReaderCover.setAttribute("aria-label", `Увеличить: ${activeCaseCover?.alt ?? pair.title}`);
  setCaseImage(caseDialogCaseImage, activeCaseCover);

  caseReaderTask.replaceChildren();
  const taskItems = Array.isArray(story.task.items)
    ? story.task.items.filter((item) => typeof item === "string" && item.trim())
    : [];
  appendCaseParagraphs(caseReaderTask, story.task.paragraphs, taskItems.length ? "" : "Подробная задача пока не добавлена.");
  if (taskItems.length) {
    const list = document.createElement("ul");
    list.className = "case-reader-task-list";
    taskItems.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.append(item);
    });
    caseReaderTask.append(list);
  }

  caseReaderStages.replaceChildren();
  story.stages.forEach((stage, stageIndex) => {
    const article = document.createElement("article");
    article.className = "case-reader-step";
    const number = document.createElement("span");
    number.className = "case-reader-step-number";
    number.textContent = String(stageIndex + 1).padStart(2, "0");
    const title = document.createElement("h4");
    title.textContent = stage.title ?? `Этап ${stageIndex + 1}`;
    const prose = document.createElement("div");
    prose.className = "case-reader-prose";
    appendCaseParagraphs(prose, stage.paragraphs);
    article.append(number, title, prose);
    const gallery = document.createElement("div");
    gallery.className = "case-reader-gallery";
    appendCaseMedia(gallery, stage.media);
    if (gallery.childElementCount) article.append(gallery);
    caseReaderStages.append(article);
  });
  if (!story.stages.length) appendCaseParagraphs(caseReaderStages, [], "Описание этапов работы пока не добавлено.");

  caseReaderResult.replaceChildren();
  appendCaseParagraphs(caseReaderResult, story.result.paragraphs);
  caseReaderGallery.replaceChildren();
  appendCaseMedia(caseReaderGallery, story.media);
  if (!caseReaderGallery.childElementCount && !caseReaderResult.childElementCount) {
    appendCaseParagraphs(caseReaderResult, [], "Материалы проекта пока не добавлены.");
  }

  setCaseImage(caseStackPreviousImage, { src: previousPair.caseImage ?? previousPair.image ?? previousPair.companyImage, alt: "" });
  setCaseImage(caseStackNextImage, { src: nextPair.caseImage ?? nextPair.image ?? nextPair.companyImage, alt: "" });
  caseStackPreviousTitle.textContent = previousPair.title;
  caseStackNextTitle.textContent = nextPair.title;
  caseStackPreviousHint.textContent = previousPair.title;
  caseStackNextHint.textContent = nextPair.title;
  caseDialogPrevTitle.textContent = previousPair.title;
  caseDialogNextTitle.textContent = nextPair.title;
  caseDialogPrevButton.setAttribute("aria-label", `Предыдущий кейс: ${previousPair.title}`);
  caseDialogNextButton.setAttribute("aria-label", `Следующий кейс: ${nextPair.title}`);
  caseDialogStackCards[0].setAttribute("aria-label", `Открыть предыдущий кейс: ${previousPair.title}`);
  caseDialogStackCards[1].setAttribute("aria-label", `Открыть следующий кейс: ${nextPair.title}`);
  cancelMotionScroll(caseReaderScroll);
  caseReaderScroll.scrollTo({ top: 0, behavior: "instant" });
  caseReaderAnchorTarget = null;
  setActiveCaseSection("about");
}

function openCaseDialog(opener) {
  if (!caseDialog) return;
  if (caseDialog.open) {
    if (caseDialog.classList.contains("is-closing")) {
      ++caseMotionSerial;
      caseClosingPromise = null;
      caseDialog.classList.remove("is-closing");
      caseDialogCard.inert = false;
      caseDialogStack.inert = false;
      clearCaseExitStyles();
    }
    return;
  }
  ++caseMotionSerial;
  caseDialogCard.inert = false;
  caseDialogStack.inert = false;
  caseDialog.classList.remove("has-switched");
  caseDialog.classList.remove("is-closing");
  clearCaseExitStyles();

  caseDialogReturnFocus = opener;
  caseDialogAutoWasPaused = orbitPicker.autoPausedByUser;
  caseDialogSelectionChanged = false;
  orbitPicker.pauseAutoByUser();
  renderCaseDialog(renderedPairIndex < 0 ? 0 : renderedPairIndex);

  const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  document.body.style.setProperty("--case-dialog-scrollbar-gap", `${scrollbarGap}px`);
  document.documentElement.classList.add("case-dialog-is-open");
  document.body.classList.add("case-dialog-is-open");
  caseDialog.showModal();
  caseDialogStack.inert = !reduceMotion && caseDialogStackCards.some((element) => element.offsetWidth > 0 && getComputedStyle(element).animationName.includes("-in"));
  orbitPicker.suspendRendering();
  cancelMotionScroll(caseReaderScroll);
  caseReaderScroll.scrollTo({ top: 0, behavior: "instant" });
  setActiveCaseSection("about");
  requestAnimationFrame(() => caseDialogCloseButton?.focus({ preventScroll: true }));
}

function closeCaseDialog() {
  if (!caseDialog?.open) return Promise.resolve();
  if (caseClosingPromise) return caseClosingPromise;
  cancelMotionScroll(caseReaderScroll);
  const serial = ++caseMotionSerial;
  const transition = caseCardTransition;
  if (transition) transition.closeRequested = true;
  caseDialogCard.inert = true;
  caseDialogStack.inert = true;
  caseClosingPromise = (transition?.ready ?? Promise.resolve()).then(async () => {
    if (serial !== caseMotionSerial || !caseDialog.open) return;
    ++caseSwitchSerial;
    if (reduceMotion) {
      caseDialog.close();
      return;
    }
    const elements = [caseDialogCard, ...caseDialogStackCards];
    const startStyles = elements.map((element) => {
      const style = getComputedStyle(element);
      return { opacity: style.opacity, transform: style.transform, visible: element.offsetWidth > 0 };
    });
    const centerDelay = startStyles.slice(1).some((style) => style.visible && Number(style.opacity) > 0.01) ? 560 : 0;
    const backdropOpacity = getComputedStyle(caseDialog, "::backdrop").opacity;
    elements.forEach((element, index) => {
      runningUiAnimations.get(element)?.cancel();
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      element.style.setProperty("--case-exit-opacity", startStyles[index].opacity);
      element.style.setProperty("--case-exit-transform", startStyles[index].transform);
    });
    caseDialog.style.setProperty("--case-backdrop-exit-opacity", backdropOpacity);
    caseDialog.style.setProperty("--case-close-center-delay", `${centerDelay}ms`);
    caseDialog.style.setProperty("--case-close-side-duration", centerDelay ? "520ms" : "0ms");
    caseDialog.classList.add("is-closing");
    await waitForUiMotion([caseDialog, ...elements], centerDelay + 450);
    if (serial === caseMotionSerial && caseDialog.open) caseDialog.close();
  });
  return caseClosingPromise;
}

function stepCaseDialog(direction) {
  if (!caseDialog?.open || caseClosingPromise) return Promise.resolve();
  if (caseCardTransition) return caseCardTransition.ready;
  const nextIndex = normalizePairIndex(activeCaseDialogIndex + direction);
  const serial = ++caseSwitchSerial;
  caseDialogSelectionChanged = true;
  cancelMotionScroll(caseReaderScroll);
  if (reduceMotion || !caseDialogCard.animate) {
    caseDialog.classList.add("has-switched");
    renderCaseDialog(nextIndex);
    orbitPicker.select(nextIndex);
    caseReaderHeading.focus({ preventScroll: true });
    return Promise.resolve();
  }

  // Read the visible positions before disabling the filled entrance animations.
  const source = caseDialogStackCards[direction < 0 ? 0 : 1];
  const sourceRect = source.getBoundingClientRect();
  const dialogRect = caseDialog.getBoundingClientRect();
  const centerStyle = getComputedStyle(caseDialogCard);
  const centerStart = { opacity: centerStyle.opacity, transform: centerStyle.transform };
  const sideStarts = caseDialogStackCards.map((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, transform: style.transform };
  });
  const target = { left: caseDialogCard.offsetLeft, top: caseDialogCard.offsetTop, width: caseDialogCard.offsetWidth, height: caseDialogCard.offsetHeight };
  const hasSideCards = source.offsetWidth > 0 && source.offsetHeight > 0;
  const transition = { elements: [caseDialogCard, ...caseDialogStackCards], ghost: null, closeRequested: false, ready: null };
  caseCardTransition = transition;
  caseDialog.classList.add("is-switching", "has-switched");
  caseDialogCard.inert = true;
  caseDialogStack.inert = true;
  transition.elements.forEach((element) => runningUiAnimations.get(element)?.cancel());
  caseDialogCard.style.opacity = "0";
  caseDialogStackCards.forEach((element) => { element.style.opacity = "0"; });

  transition.ready = (async () => {
    try {
      let promotion;
      if (hasSideCards) {
        const sourceStyle = sideStarts[direction < 0 ? 0 : 1];
        const matrix = new DOMMatrix(sourceStyle.transform === "none" ? undefined : sourceStyle.transform);
        matrix.e = 0;
        matrix.f = 0;
        const ghost = document.createElement("div");
        ghost.className = "case-dialog-transition-card";
        ghost.inert = true;
        ghost.setAttribute("aria-hidden", "true");
        [source.querySelector("img"), source.querySelector("span")].forEach((element) => {
          const copy = element.cloneNode(true);
          Array.from(copy.attributes).forEach((attribute) => {
            if (attribute.name === "id" || attribute.name.startsWith("data-")) copy.removeAttribute(attribute.name);
          });
          ghost.append(copy);
        });
        Object.assign(ghost.style, { left: `${target.left}px`, top: `${target.top}px`, width: `${target.width}px`, height: `${target.height}px`, transform: "none" });
        transition.ghost = ghost;
        transition.elements.push(ghost, ...ghost.children);
        caseDialog.append(ghost);
        promotion = playUiMotion(ghost, [
          { left: `${sourceRect.left + sourceRect.width / 2 - dialogRect.left - source.offsetWidth / 2}px`, top: `${sourceRect.top + sourceRect.height / 2 - dialogRect.top - source.offsetHeight / 2}px`, width: `${source.offsetWidth}px`, height: `${source.offsetHeight}px`, transform: matrix.toString(), opacity: sourceStyle.opacity },
          { left: `${target.left}px`, top: `${target.top}px`, width: `${target.width}px`, height: `${target.height}px`, transform: "none", opacity: 1 },
        ], { duration: 540 });
        Array.from(ghost.children).forEach((element) => {
          const opacity = getComputedStyle(element).opacity;
          element.style.opacity = "0";
          playUiMotion(element, [{ opacity }, { opacity: 0 }], { duration: 300 });
        });
      }
      const outgoing = playUiMotion(caseDialogCard, [
        centerStart,
        { opacity: 0, transform: `translateX(${-direction * (hasSideCards ? 130 : 24)}px) rotate(${-direction * (hasSideCards ? 2 : 0)}deg) scale(0.97)` },
      ], { duration: hasSideCards ? 420 : 160 });
      caseDialogStackCards.forEach((element, index) => {
        if (element === source) return;
        playUiMotion(element, [sideStarts[index], { opacity: 0, transform: `translateX(${index === 0 ? 80 : -80}px) rotate(${index === 0 ? -3 : 3}deg) scale(0.94)` }], { duration: 360 });
      });
      await ((promotion ?? outgoing)?.finished.catch(() => {}) ?? Promise.resolve());
      if (serial !== caseSwitchSerial || !caseDialog.open) return;
      renderCaseDialog(nextIndex);
      orbitPicker.select(nextIndex);
      const incoming = playUiMotion(caseDialogCard, [
        { opacity: 0, transform: `translateX(${hasSideCards ? 0 : direction * 24}px) scale(0.99)` },
        { opacity: 1, transform: "none" },
      ], { duration: 260 });
      if (transition.ghost) {
        transition.ghost.style.opacity = "0";
        playUiMotion(transition.ghost, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 });
      }
      await (incoming?.finished.catch(() => {}) ?? Promise.resolve());
      if (serial !== caseSwitchSerial || !caseDialog.open) return;
      clearCaseTransition(transition);
      if (!transition.closeRequested) {
        caseDialogStackCards.forEach((element, index) => playUiMotion(element, [
          { opacity: 0, transform: `translateX(${index === 0 ? 80 : -80}px) rotate(${index === 0 ? -3 : 3}deg) scale(0.94)` },
          { opacity: 1, transform: `translateX(${index === 0 ? -12 : 12}px) rotate(${index === 0 ? -8 : 8}deg) scale(0.94)` },
        ], { duration: 650 }));
        caseReaderHeading.focus({ preventScroll: true });
      }
    } finally {
      clearCaseTransition(transition);
    }
  })();
  return transition.ready;
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
  constructor({ surface, values, selectedIndex = 0, lanes, lens, onChange, onPreview }) {
    this.surface = surface;
    this.values = values;
    this.selectedIndex = selectedIndex;
    this.visualIndex = selectedIndex;
    this.lanes = lanes;
    this.lens = lens;
    this.onChange = onChange;
    this.onPreview = onPreview;
    this.step = (Math.PI * 2) / values.length;
    this.angle = this.angleForIndex(selectedIndex);
    this.targetAngle = this.angle;
    this.velocity = 0;
    this.gesture = null;
    this.lastFrameTime = performance.now();
    this.snapAfter = 0;
    this.suppressPointerClick = false;
    this.autoSpeed = reduceMotion ? 0 : 0.00115;
    this.autoPausedByUser = false;
    this.autoInViewport = true;
    this.renderInViewport = true;
    this.frame = 0;
    this.settleUntil = performance.now() + 600;
    this.nodes = [];
    this.lensNodes = [];
    this.decorations = [];

    this.mount();
    this.bind();
    this.update();
    this.wake();
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
        node.addEventListener("click", () => this.select(index));
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
      this.pendingLightPointer = { clientX: event.clientX, clientY: event.clientY };
      this.wake();
    });
    window.addEventListener("pointermove", (event) => this.onPointerMove(event), { passive: false });
    window.addEventListener("pointerup", (event) => this.onPointerUp(event));
    window.addEventListener("pointercancel", (event) => {
      if (event.pointerId === this.gesture?.pointerId) this.cancelGesture();
    });
    window.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" && !event.isPrimary) this.cancelGesture();
    });
    this.surface?.addEventListener("lostpointercapture", (event) => {
      // Ignore a child handing its implicit touch capture to the shared surface.
      if (event.target === this.surface && event.pointerId === this.gesture?.pointerId) this.cancelGesture();
    });
    window.addEventListener("blur", () => this.cancelGesture());
    window.addEventListener("resize", () => {
      this.cancelGesture();
      this.wake();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.suspendRendering();
      else this.wake();
    });
    document.fonts?.ready.then(() => this.wake());
    this.surface?.addEventListener("dragstart", (event) => event.preventDefault());
    this.surface?.addEventListener("click", (event) => {
      // Block the click generated after a swipe, including swipes over the CTA.
      // A new pointerdown clears suppression; keyboard activation stays available.
      if (!this.suppressPointerClick || event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    this.surface?.addEventListener("pointerleave", () => {
      this.pendingLightPointer = null;
      this.lens?.resetPointer();
    });
    this.surface?.addEventListener(
      "wheel",
      (event) => {
        if (event.ctrlKey || this.gesture || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

        event.preventDefault();
        this.pauseAutoByUser();
        const deltaUnit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        const delta = -event.deltaX * deltaUnit * 0.00045;
        this.targetAngle = null;
        this.angle += delta;
        this.velocity = clamp(this.velocity + delta * 0.16, -0.032, 0.032);
        this.snapAfter = performance.now() + 280;
        this.wake();
      },
      { passive: false },
    );
    this.surface?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      const laneIndex = this.lanes.findIndex((lane) => lane.root.contains(event.target));
      if (laneIndex < 0) return;

      event.preventDefault();
      const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
      const currentIndex = this.targetAngle === null ? this.nearestIndex() : this.selectedIndex;
      const nextIndex = (currentIndex + direction + this.values.length) % this.values.length;
      this.select(nextIndex);
      requestAnimationFrame(() => this.nodes[laneIndex]?.[nextIndex]?.focus({ preventScroll: true }));
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
      if (this.canRender()) this.update();
      this.wake();
      return;
    }

    this.targetAngle = target;
    this.wake();
  }

  snapToNearest() {
    this.select(this.nearestIndex());
  }

  pauseAutoByUser() {
    this.autoPausedByUser = true;
  }

  setAutoInViewport(isVisible) {
    this.autoInViewport = isVisible;
    if (!isVisible) this.autoPausedByUser = false;
    this.wake();
  }

  canRender() {
    return this.renderInViewport && !document.hidden && !caseDialog?.open;
  }

  suspendRendering() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pendingLightPointer = null;
  }

  setRenderInViewport(isVisible) {
    this.renderInViewport = isVisible;
    if (isVisible) this.wake();
    else this.suspendRendering();
  }

  wake() {
    this.settleUntil = performance.now() + (reduceMotion ? 0 : 600);
    if (!this.canRender() || this.frame) return;
    this.lastFrameTime = performance.now();
    this.frame = requestAnimationFrame((now) => this.tick(now));
  }

  commit(index) {
    if (index === this.selectedIndex) return;
    this.selectedIndex = index;
    this.onChange?.(this.values[index], index);
  }

  nodeAtPointer(event) {
    if (event.target.closest("[data-spotlight], a, button:not(.orbit-node)")) return null;

    const directNode = event.target.closest?.(".orbit-node");
    const hitSlop = event.pointerType === "touch" ? 12 : 3;
    return this.nodes
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
  }

  onPointerDown(event) {
    if (!event.isPrimary || event.button !== 0 || this.gesture) return;

    this.suppressPointerClick = false;
    const pointerNode = this.nodeAtPointer(event);
    this.gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startAngle: this.angle,
      startIndex: this.targetAngle === null ? this.nearestIndex() : this.selectedIndex,
      pixelsPerStep: clamp(this.surface.clientWidth * 0.24, 88, 160),
      tapIndex: pointerNode ? Number(pointerNode.dataset.index) : null,
      allowVertical: Boolean(event.target.closest(".orbit-lane")),
      axis: null,
    };
  }

  onPointerMove(event) {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (!gesture.axis) {
      if (Math.hypot(deltaX, deltaY) < 10) return;
      this.suppressPointerClick = true;
      const vertical = Math.abs(deltaY) > Math.abs(deltaX);
      // The side lanes own vertical swipes; the middle still scrolls the page.
      if (vertical && !gesture.allowVertical) {
        this.resetGesture();
        return;
      }
      gesture.axis = vertical ? "y" : "x";
      this.pauseAutoByUser();
      this.targetAngle = null;
      this.velocity = 0;
      this.snapAfter = 0;
      this.surface.setPointerCapture(event.pointerId);
    }

    if (event.cancelable) event.preventDefault();
    // One gesture previews at most one neighbouring case, with no release inertia.
    const delta = gesture.axis === "y" ? deltaY : deltaX;
    this.angle = gesture.startAngle + clamp(delta / gesture.pixelsPerStep, -1, 1) * this.step;
    this.wake();
  }

  resetGesture() {
    const gesture = this.gesture;
    this.gesture = null;
    if (gesture && this.surface.hasPointerCapture(gesture.pointerId)) {
      this.surface.releasePointerCapture(gesture.pointerId);
    }
    return gesture;
  }

  cancelGesture() {
    const gesture = this.resetGesture();
    if (!gesture) return;
    this.suppressPointerClick = true;
    if (gesture.axis) this.select(gesture.startIndex);
  }

  onPointerUp(event) {
    if (event.pointerId !== this.gesture?.pointerId) return;
    const gesture = this.resetGesture();

    if (gesture.axis) {
      const delta = gesture.axis === "y" ? event.clientY - gesture.startY : event.clientX - gesture.startX;
      const threshold = Math.max(32, gesture.pixelsPerStep * 0.28);
      const direction = Math.abs(delta) >= threshold ? (delta < 0 ? 1 : -1) : 0;
      this.select((gesture.startIndex + direction + this.values.length) % this.values.length);
    } else if (Number.isInteger(gesture.tapIndex)) {
      this.suppressPointerClick = true;
      this.select(gesture.tapIndex);
    }
  }

  updateRing(lane, positionOptions) {
    if (!lane.ringPath) return;

    const geometryKey = `${window.innerWidth}:${positionOptions.centerDrop}:${positionOptions.focusX}`;
    if (lane.ringGeometryKey === geometryKey) return;

    // Trace the visible half of the actual card route, including the pull
    // toward the glass slot. Rebuild only when the layout changes.
    const points = Array.from({ length: 181 }, (_, index) => {
      const baseAngle = -Math.PI / 2 + (index / 180) * Math.PI;
      const angle = lane.mirror ? Math.PI - baseAngle : baseAngle;
      const { x, y } = getOrbitPosition(angle, lane.id, positionOptions);
      return `${index === 0 ? "M" : "L"}${x.toFixed(3)},${y.toFixed(3)}`;
    });
    lane.ringPath.setAttribute("d", points.join(" "));
    lane.ringGeometryKey = geometryKey;
  }

  update() {
    const nextVisualIndex = this.nearestIndex();
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
    const lanePositions = this.lanes.map((lane, laneIndex) => {
      const frame = lensLaneFrames[laneIndex];
      const position = {
        centerDrop: lensCenterDrops[laneIndex],
        focusX: frame ? ((frame.slotCenter - frame.laneRect.left) / frame.laneRect.width) * 100 : undefined,
      };
      return position;
    });
    const sourceBaseSizes = this.nodes.map((nodes) => nodes[0]?.offsetHeight || 0);
    if (nextVisualIndex !== this.visualIndex) this.onPreview?.(this.values[nextVisualIndex], nextVisualIndex);
    this.visualIndex = nextVisualIndex;
    this.lanes.forEach((lane, index) => this.updateRing(lane, lanePositions[index]));

    this.values.forEach((_, index) => {
      const baseAngle = this.angle + index * this.step;
      const isActive = index === nextVisualIndex;

      this.lanes.forEach((lane, laneIndex) => {
        const orbitAngle = lane.mirror ? Math.PI - baseAngle : baseAngle;
        const node = this.nodes[laneIndex][index];
        const state = setNodePosition(node, orbitAngle, lane.id, index, isActive, lanePositions[laneIndex]);
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
    this.frame = 0;
    if (!this.canRender()) return;
    const previousAngle = this.angle;
    const delta = Math.min(2, (now - this.lastFrameTime) / 16.67 || 1);
    this.lastFrameTime = now;

    if (!this.gesture) {
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

    if (this.angle !== previousAngle || this.gesture) this.settleUntil = now + (reduceMotion ? 0 : 600);
    this.update();
    if (this.pendingLightPointer) {
      this.lens?.trackPointer(this.pendingLightPointer);
      this.pendingLightPointer = null;
    }
    const hasMotion = this.gesture || this.targetAngle !== null || this.snapAfter ||
      Math.abs(this.velocity) > 0.0006 || (this.autoSpeed && this.autoInViewport && !this.autoPausedByUser);
    if (hasMotion || now < this.settleUntil) {
      this.frame = requestAnimationFrame((frameNow) => this.tick(frameNow));
    }
  }
}

const liquidLens = new LiquidGlassLens({
  root: liquidLensRoot,
  magnification: 1.12,
  distortionAmount: 12,
  opacity: 1,
  blurAmount: 14,
});

const orbitPicker = new OrbitalPicker({
  surface: carousel,
  values: orbitPairs,
  selectedIndex: 0,
  lens: liquidLens,
  lanes: [
    {
      id: "left",
      root: companyOrbit,
      ringPath: document.querySelector(".ring-left path"),
      lensRoot: companyLensLayer,
      renderItem: createCompanyNode,
      renderLensItem: createCompanyLensNode,
      decorations: ORBIT_DECORATIONS.left,
    },
    {
      id: "right",
      root: caseOrbit,
      ringPath: document.querySelector(".ring-right path"),
      lensRoot: caseLensLayer,
      renderItem: createCaseNode,
      renderLensItem: createCaseLensNode,
      decorations: ORBIT_DECORATIONS.right,
      mirror: true,
    },
  ],
  onChange: (_, index) => renderPair(index % pairs.length),
  onPreview: (_, index) => renderPair(index % pairs.length),
});

const topSection = document.querySelector("#top");
if (topSection) {
  const autoObserver = new IntersectionObserver(
    ([entry]) => {
      const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.68;
      orbitPicker.setAutoInViewport(isVisible);
      orbitPicker.setRenderInViewport(entry.isIntersecting);
    },
    { threshold: [0, 0.28, 0.68, 0.9] },
  );

  autoObserver.observe(topSection);
}

document.querySelectorAll("[data-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = Number(button.dataset.step);
    const activeIndex = orbitPicker.nearestIndex();
    const nextIndex = (activeIndex + direction + orbitPairs.length) % orbitPairs.length;
    orbitPicker.select(nextIndex);
  });
});

const casesMenuRoot = document.querySelector("[data-cases-menu]");
const casesMenuTrigger = document.querySelector("[data-cases-menu-trigger]");
const casesPopover = document.querySelector("[data-cases-popover]");

motionPreference.addEventListener("change", () => {
  reduceMotion = motionPreference.matches;
  runningUiAnimations.forEach((animation) => animation.cancel());
  cancelAllMotionScrolls();
  orbitPicker.autoSpeed = reduceMotion ? 0 : 0.00115;
  if (reduceMotion) {
    if (caseDialog?.open && !caseClosingPromise && !caseCardTransition) caseDialogStack.inert = false;
    orbitPicker.cancelGesture();
    const index = orbitPicker.targetAngle !== null ? orbitPicker.selectedIndex : orbitPicker.nearestIndex();
    orbitPicker.angle = nearestEquivalentAngle(orbitPicker.angleForIndex(index), orbitPicker.angle);
    orbitPicker.targetAngle = null;
    orbitPicker.velocity = 0;
    orbitPicker.snapAfter = 0;
    orbitPicker.commit(index);
    document.documentElement.classList.remove("motion-ready");
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
  orbitPicker.wake();
});

if (casesMenuRoot && casesMenuTrigger && casesPopover) {
  let menuMotionSerial = 0;
  const setCasesMenuOpen = async (isOpen, { returnFocus = false } = {}) => {
    const serial = ++menuMotionSerial;
    casesMenuTrigger.setAttribute("aria-expanded", String(isOpen));
    if (returnFocus) casesMenuTrigger.focus({ preventScroll: true });
    if (isOpen) {
      const opacity = casesPopover.hidden ? 0 : Number(getComputedStyle(casesPopover).opacity);
      casesPopover.classList.remove("is-closing");
      casesPopover.inert = false;
      casesPopover.hidden = false;
      playUiMotion(casesPopover, [
        { opacity, transform: "translateY(-6px) scale(0.985)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ]);
      return;
    }
    if (casesPopover.hidden) return;
    casesPopover.inert = true;
    const style = getComputedStyle(casesPopover);
    casesPopover.classList.add("is-closing");
    const animation = playUiMotion(casesPopover, [
      { opacity: style.opacity, transform: style.transform },
      { opacity: 0, transform: "translateY(-6px) scale(0.985)" },
    ], { duration: 160 });
    await (animation?.finished.catch(() => {}) ?? Promise.resolve());
    if (serial !== menuMotionSerial) return;
    casesPopover.hidden = true;
    casesPopover.classList.remove("is-closing");
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
  caseDialogOpenButton.addEventListener("click", (event) => {
    openCaseDialog(event.currentTarget);
  });

  caseDialogCloseButton.addEventListener("click", closeCaseDialog);
  caseDialogPrevButton?.addEventListener("click", () => stepCaseDialog(-1));
  caseDialogNextButton?.addEventListener("click", () => stepCaseDialog(1));
  caseDialogStackCards.forEach((button) => button.addEventListener("click", () => stepCaseDialog(Number(button.dataset.caseStackDirection))));
  caseDialogStack.addEventListener("animationstart", (event) => {
    if (event.animationName.startsWith("case-stack-") && event.animationName.endsWith("-in") && !caseClosingPromise && !caseCardTransition) {
      caseDialogStack.inert = false;
    }
  });
  caseReaderCover?.addEventListener("click", () => openCaseImageViewer(activeCaseCover, caseReaderCover));
  caseImageViewerBack?.addEventListener("click", () => closeCaseImageViewer());
  caseImageViewerImage?.addEventListener("load", () => {
    const width = Math.min(900, Math.max(320, caseImageViewerImage.naturalWidth));
    caseImageViewerImage.style.setProperty("--case-image-width", `${width}px`);
  });

  caseReaderSectionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const section = caseReaderSections.find((item) => item.dataset.caseSection === link.dataset.caseSectionLink);
      if (!section || !caseReaderScroll) return;
      const top = section.getBoundingClientRect().top - caseReaderSections[0].getBoundingClientRect().top;
      caseReaderAnchorTarget = section.dataset.caseSection;
      setActiveCaseSection(section.dataset.caseSection);
      scrollWithMotion(caseReaderScroll, top);
      section.focus({ preventScroll: true });
    });
  });

  const queueCaseSectionUpdate = () => {
    if (caseReaderScrollFrame) return;
    caseReaderScrollFrame = requestAnimationFrame(() => {
      caseReaderScrollFrame = 0;
      updateActiveCaseSection();
    });
  };
  caseReaderScroll?.addEventListener("scroll", queueCaseSectionUpdate, { passive: true });
  const releaseCaseAnchor = () => {
    caseReaderAnchorTarget = null;
    cancelMotionScroll(caseReaderScroll);
    queueCaseSectionUpdate();
  };
  caseReaderScroll?.addEventListener("wheel", releaseCaseAnchor, { passive: true });
  caseReaderScroll?.addEventListener("touchstart", releaseCaseAnchor, { passive: true });
  caseReaderScroll?.addEventListener("pointerdown", (event) => {
    if (event.target === caseReaderScroll) releaseCaseAnchor();
  });
  caseReaderScroll?.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(event.key)) releaseCaseAnchor();
  });
  window.addEventListener("resize", () => {
    if (caseDialog.open && caseReaderAnchorTarget) {
      const section = caseReaderSections.find((item) => item.dataset.caseSection === caseReaderAnchorTarget);
      if (section) {
        const top = section.getBoundingClientRect().top - caseReaderSections[0].getBoundingClientRect().top;
        caseReaderScroll.scrollTo({ top, behavior: "instant" });
      }
    }
    queueCaseSectionUpdate();
  });

  caseDialog.addEventListener("click", (event) => {
    if (event.target === caseDialog) closeCaseDialog();
  });

  caseDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!caseImageViewer.hidden) closeCaseImageViewer();
      else closeCaseDialog();
    }
  });

  caseDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (!caseImageViewer.hidden) closeCaseImageViewer();
    else closeCaseDialog();
  });

  caseDialog.addEventListener("close", () => {
    ++caseMotionSerial;
    ++caseSwitchSerial;
    caseClosingPromise = null;
    clearCaseTransition();
    caseDialog.classList.remove("is-closing");
    caseDialog.classList.remove("has-switched");
    caseDialogCard.inert = false;
    caseDialogStack.inert = false;
    clearCaseExitStyles();
    closeCaseImageViewer({ returnFocus: false, immediate: true });
    if (caseReaderScrollFrame) cancelAnimationFrame(caseReaderScrollFrame);
    caseReaderScrollFrame = 0;
    document.documentElement.classList.remove("case-dialog-is-open");
    document.body.classList.remove("case-dialog-is-open");
    document.body.style.removeProperty("--case-dialog-scrollbar-gap");
    orbitPicker.autoPausedByUser = caseDialogSelectionChanged || caseDialogAutoWasPaused;
    caseDialogReturnFocus?.focus({ preventScroll: true });
    caseDialogReturnFocus = null;
    orbitPicker.wake();
  });
}


// Preserve native details behavior while animating the surrounding document flow.
document.querySelectorAll(".pricing-service").forEach((details) => {
  const summary = details.querySelector("summary");
  const content = details.querySelector(".pricing-details");
  if (!summary || !content) return;
  let state = null;
  summary.addEventListener("click", (event) => {
    if (reduceMotion || !details.animate) return;
    event.preventDefault();
    const expanded = !(state ? state.expanded : details.open);
    const from = details.getBoundingClientRect().height;
    const style = getComputedStyle(details);
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const nextState = { expanded };
    state = nextState;
    runningUiAnimations.get(details)?.cancel();
    details.open = true;
    details.style.height = "auto";
    const to = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + border;
    details.style.height = from + "px";
    details.style.overflow = "hidden";
    details.classList.toggle("is-closing", !expanded);
    content.inert = !expanded;
    const animation = playUiMotion(details, [{ height: from + "px" }, { height: to + "px" }], {
      duration: expanded ? 360 : 260,
    });
    (animation?.finished.catch(() => {}) ?? Promise.resolve()).then(() => {
      if (state !== nextState) return;
      details.open = expanded;
      content.inert = false;
      details.classList.remove("is-closing");
      details.style.removeProperty("height");
      details.style.removeProperty("overflow");
      state = null;
    });
  });
});

const processStack = document.querySelector("[data-process-stack]");

if (processStack) {
  const steps = Array.from(processStack.querySelectorAll("[data-process-step]"));
  const buttons = steps.map((step) => step.querySelector("[data-process-step-select]"));
  let activeIndex = -1;
  let hasInteracted = false;
  let processEntryObserver;

  const setActiveStep = (nextIndex) => {
    activeIndex = nextIndex;
    processStack.dataset.activeIndex = String(activeIndex);

    steps.forEach((step, index) => {
      const isActive = index === activeIndex;
      // The final handoff card stays open underneath the accordion.
      const isFinal = step.classList.contains("step--final");
      const isExpanded = isActive || isFinal;
      const panel = step.querySelector(".step-panel");
      step.classList.toggle("is-active", isActive);
      if (isFinal) {
        buttons[index].setAttribute("aria-pressed", String(activeIndex === -1));
      } else {
        buttons[index].setAttribute("aria-expanded", String(isExpanded));
      }
      panel.setAttribute("aria-hidden", String(!isExpanded));
      panel.inert = !isExpanded;
    });
  };

  const selectStepByUser = (nextIndex) => {
    hasInteracted = true;
    processEntryObserver?.disconnect();
    setActiveStep(nextIndex);
  };

  buttons.forEach((button, index) => {
    steps[index].style.setProperty("--step-index", String(index));
    button.addEventListener("click", () => {
      const isFinal = steps[index].classList.contains("step--final");
      selectStepByUser(isFinal || activeIndex === index ? -1 : index);
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        selectStepByUser(-1);
        return;
      }
      let nextIndex = null;
      if (event.key === "ArrowDown") nextIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowUp") nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      buttons[nextIndex].focus();
    });
  });

  setActiveStep(-1);
  processStack.classList.add("is-ready");
  requestAnimationFrame(() => {
    processStack.classList.add("is-animated");
    if (!("IntersectionObserver" in window)) {
      if (!hasInteracted) setActiveStep(0);
      return;
    }

    processEntryObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      if (!hasInteracted) setActiveStep(0);
      processEntryObserver.disconnect();
    }, { threshold: 0.6, rootMargin: "0px 0px -10% 0px" });

    // The stack has zero height on desktop; observe its first visible header.
    processEntryObserver.observe(buttons[0]);
  });
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

  const panel = skills.querySelector(".skill-details");
  let skillMotionSerial = 0;
  const selectSkill = async (button, { animate = true } = {}) => {
    const buttonImage = button.querySelector("img");
    if (!buttonImage) return;
    let tasks;
    try { tasks = JSON.parse(button.dataset.skillTasks || "[]"); } catch { return; }
    if (!Array.isArray(tasks) || !tasks.every((task) => typeof task === "string")) return;
    const serial = ++skillMotionSerial;
    buttons.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
    if (animate) {
      const outgoing = [panel, image].filter(Boolean).map((element) => {
        const style = getComputedStyle(element);
        return playUiMotion(element, [{ opacity: style.opacity }, { opacity: 0 }], { duration: 120 });
      });
      await Promise.all(outgoing.map((animation) => animation?.finished.catch(() => {}) ?? Promise.resolve()));
      if (serial !== skillMotionSerial) return;
    }
    image.src = buttonImage.src;
    image.alt = buttonImage.alt;
    title.textContent = button.dataset.skillName;
    category.textContent = button.dataset.skillCategory;
    taskList.replaceChildren(...tasks.map((task) => {
      const item = document.createElement("li");
      item.textContent = task;
      return item;
    }));
    if (animate) {
      playUiMotion(panel, [{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }]);
      playUiMotion(image, [{ opacity: 0 }, { opacity: 1 }]);
    }
  };

  buttons.forEach((button) => button.addEventListener("click", () => selectSkill(button)));
  selectSkill(buttons.find((button) => button.getAttribute("aria-pressed") === "true") || buttons[0], { animate: false });
})();

(() => {
  const contact = document.querySelector("#contact");
  const decoration = contact?.querySelector(".contact-loupe");
  if (!contact || !decoration) return;

  const mouseAvailable = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const zoom = 1.8;
  // The pointer sits at the centre of the glass, not at the handle.
  const centre = { x: 24 * 1.19, y: 22.7 * 1.19 };
  let cursor;
  let copy;
  let copiedButtons = [];
  let pointer;
  let frame = 0;
  const buttons = Array.from(contact.querySelectorAll(".contact-button"));

  const hide = () => {
    document.documentElement.classList.remove("is-contact-magnifying");
    contact.classList.remove("is-magnifying");
    cursor?.classList.remove("is-visible");
    pointer = null;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const createCursor = () => {
    cursor = document.createElement("div");
    cursor.className = "contact-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.inert = true;

    const view = document.createElement("div");
    view.className = "contact-cursor-view";
    copy = contact.cloneNode(true);
    copy.classList.remove("reveal", "is-visible", "is-magnifying");
    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    copy.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
    copiedButtons = Array.from(copy.querySelectorAll(".contact-button"));
    view.append(copy);

    const rim = decoration.cloneNode();
    rim.className = "contact-cursor-frame";
    cursor.append(view, rim);
    document.body.append(cursor);
  };

  const render = () => {
    frame = 0;
    if (!pointer || !mouseAvailable.matches) return hide();
    const target = document.elementFromPoint(pointer.x, pointer.y);
    if (!target || !contact.contains(target)) return hide();
    if (!cursor) createCursor();

    const rect = contact.getBoundingClientRect();
    const x = pointer.x - rect.left;
    const y = pointer.y - rect.top;
    copy.style.width = `${rect.width}px`;
    copy.style.height = `${rect.height}px`;
    copy.style.transform = `translate(${centre.x - x * zoom}px, ${centre.y - y * zoom}px) scale(${zoom})`;
    cursor.style.transform = `translate3d(${pointer.x - centre.x}px, ${pointer.y - centre.y}px, 0)`;
    buttons.forEach((button, index) => {
      copiedButtons[index].classList.toggle("is-hovered", button.contains(target));
    });
    contact.classList.add("is-magnifying");
    cursor.classList.add("is-visible");
    // Keep the sampling point aligned while the section's reveal is moving.
    if (contact.getAnimations().some((animation) => animation.playState === "running")) {
      frame = requestAnimationFrame(render);
    }
  };

  const schedule = () => {
    if (pointer && !frame) frame = requestAnimationFrame(render);
  };

  const track = (event) => {
    if (event.pointerType !== "mouse" || !mouseAvailable.matches) return hide();
    // Hide the native pointer before the next animation frame, including overlays.
    document.documentElement.classList.add("is-contact-magnifying");
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  };

  contact.addEventListener("pointerenter", track);
  contact.addEventListener("pointermove", track);
  contact.addEventListener("pointerleave", hide);
  contact.addEventListener("pointercancel", hide);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("blur", hide);
  document.addEventListener("visibilitychange", hide);
  document.addEventListener("keydown", hide);
  mouseAvailable.addEventListener("change", hide);
  new ResizeObserver(schedule).observe(contact);
  document.fonts.ready.then(schedule);
})();

renderPair(0, { animate: false });
