// Sketchbook page (illustrations.html): a stuffed notebook that turns from its fore-edge
// to its cover, opens and pages through the drawings. Runs on its own, without script.js.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Sketchbook pages in reading order: { src, alt, fit? }. Drawings fill the page;
// fit: "contain" keeps small artwork centered on paper. Files live in assets/sketchbook.
const SKETCHBOOK_PAGES = [
  { src: "./assets/sketchbook/sketch-01-sea-window.webp", alt: "Открытое окно с видом на море" },
  { src: "./assets/sketchbook/sketch-02-swimwear.webp", alt: "Купальники, панама и надувной круг" },
  { src: "./assets/sketchbook/sketch-03-beach-blanket.webp", alt: "Покрывало на пляже с сумкой и панамой" },
  { src: "./assets/sketchbook/sketch-04-gelato-cart.webp", alt: "Тележка с мороженым у моря" },
  { src: "./assets/sketchbook/sketch-05-sea-rocks.webp", alt: "Плед на скалах у моря" },
  { src: "./assets/sketchbook/sketch-06-summer-outfit.webp", alt: "Летний комплект, панама и акварель" },
  { src: "./assets/sketchbook/sketch-07-suitcase.webp", alt: "Раскрытый чемодан с детскими вещами" },
  { src: "./assets/sketchbook/sketch-08-bicycle.webp", alt: "Велосипед и красный летний костюм" },
  { src: "./assets/sketchbook/sketch-09-picnic.webp", alt: "Пикник под розовым зонтом" },
  { src: "./assets/sketchbook/sketch-10-pink-outfit.webp", alt: "Розовая блузка, сандалии и корзина" },
  { src: "./assets/sketchbook/sketch-11-easter-table.webp", alt: "Пасхальный стол с кроликом и вербой" },
  { src: "./assets/sketchbook/sketch-12-field-window.webp", alt: "Окно с видом на поле и деревню" },
  { src: "./assets/sketchbook/sketch-13-autumn-city.webp", alt: "Осенний город с высоткой" },
  { src: "./assets/sketchbook/sketch-14-autumn-table.webp", alt: "Столик с чаем у окна осенью" },
  { src: "./assets/sketchbook/sketch-15-autumn-outfit.webp", alt: "Осенний комплект с зонтом и листьями" },
  { src: "./assets/sketchbook/sketch-16-autumn-pajamas.webp", alt: "Пижама, фотоаппарат и осенние листья" },
  { src: "./assets/sketchbook/sketch-17-book-stack.webp", alt: "Стопка книг на зелёном фоне" },
  { src: "./assets/sketchbook/sketch-18-pajamas-door.webp", alt: "Пижама на дверце шкафа" },
  { src: "./assets/sketchbook/sketch-19-wardrobe.webp", alt: "Шкаф с платьями и плюшевым зайцем" },
];

const SKETCHBOOK_PAPERS = ["#f6f1e3", "#f6f1e3", "#f3ead9", "#f7dfe3", "#e3ecd9", "#dfe7f2", "#f6ecc4"];
const SKETCHBOOK_SHEETS = ["#f6f1e3", "#f2c6d0", "#cfe2c5", "#c9d7ec", "#f2e0a0", "#efe6d2", "#e7c9ea", "#fbf7ee"];
// Loose drawings stuffed between the pages, like on the photo of the closed notebook:
// only their torn edges show above, below and beside the page block.
const SKETCHBOOK_STUFFING = [
  "./assets/sketchbook/sketch-09-picnic.webp",
  "./assets/sketchbook/sketch-05-sea-rocks.webp",
  "./assets/sketchbook/sketch-17-book-stack.webp",
  "./assets/sketchbook/sketch-10-pink-outfit.webp",
];

(() => {
  const root = document.querySelector("[data-sketchbook]");
  const book = root?.querySelector("[data-book]");
  const leavesRoot = root?.querySelector("[data-book-leaves]");
  const stacks = {
    right: root?.querySelector('[data-book-stack="right"]'),
    left: root?.querySelector('[data-book-stack="left"]'),
  };
  const prevButton = root?.querySelector("[data-book-prev]");
  const nextButton = root?.querySelector("[data-book-next]");
  const counter = root?.querySelector("[data-book-counter]");
  if (!book || !leavesRoot || !prevButton || !nextButton || !counter) return;

  const PRELOAD_LEAVES = 3;
  const SIDE = -1; // Fore-edge view: before the cover.
  const STACK_SHEETS = 8;
  let leaves = [];
  let flipped = SIDE;
  let maxFlipped = 0;
  let liftSerial = 0;
  let openSerial = 0;
  let turnTimer = 0;
  let leftStackTimer = 0;

  const element = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html) node.innerHTML = html;
    return node;
  };

  // Small seeded generator: the book looks the same on every visit.
  const seeded = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  // Outline of a hand-torn sheet in % of its box. The spine edge (x = 0) stays straight;
  // `rough` is how ragged the other three are, `corner` tears one off, `bite` rips a chunk out.
  const tornOutline = (rand, { rough = 0.4, corner = null, bite = false } = {}) => {
    const points = [];
    const steps = rough > 1 ? 16 : 9;
    const jitter = () => rand() * rough;
    const top = corner === "top" ? { w: 8 + rand() * 12, h: 6 + rand() * 9 } : null;
    const bottom = corner === "bottom" ? { w: 8 + rand() * 12, h: 6 + rand() * 9 } : null;
    const topEnd = 100 - (top?.w ?? 0);
    const bottomEnd = 100 - (bottom?.w ?? 0);
    const rightStart = top?.h ?? 0;
    const rightEnd = 100 - (bottom?.h ?? 0);
    const biteAt = bite ? 22 + rand() * 46 : -1;
    const biteSize = 7 + rand() * 7;

    for (let i = 0; i <= steps; i += 1) points.push([(topEnd * i) / steps, jitter()]);
    if (top) {
      for (let i = 1; i < 5; i += 1) points.push([topEnd + (top.w * i) / 5 + (rand() - 0.5) * 2, (top.h * i) / 5 + (rand() - 0.5) * 2]);
    }
    for (let i = 0; i <= steps; i += 1) {
      const y = rightStart + ((rightEnd - rightStart) * i) / steps;
      const inBite = bite && Math.abs(y - biteAt) < biteSize;
      const depth = inBite ? Math.cos(((y - biteAt) / biteSize) * (Math.PI / 2)) * (4 + rand() * 3) : 0;
      points.push([100 - jitter() - depth, y]);
    }
    if (bottom) {
      for (let i = 1; i < 5; i += 1) points.push([100 - (bottom.w * i) / 5 + (rand() - 0.5) * 2, rightEnd + (bottom.h * i) / 5 + (rand() - 0.5) * 2]);
    }
    for (let i = 0; i <= steps; i += 1) points.push([bottomEnd - (bottomEnd * i) / steps, 100 - jitter()]);
    return points.map(([x, y]) => [clamp(x, 0, 100), clamp(y, 0, 100)]);
  };

  const clipPath = (points, mirror = false) =>
    `polygon(${points.map(([x, y]) => `${(mirror ? 100 - x : x).toFixed(2)}% ${y.toFixed(2)}%`).join(", ")})`;

  // Most pages are only a little uneven; some are ragged, a few lost a corner or a chunk.
  const wearLeaf = (leaf, index) => {
    const rand = seeded(index * 7919 + 13);
    const roll = rand();
    const rough = roll < 0.55 ? 0.35 : roll < 0.82 ? 0.9 : 1.9;
    const cornerRoll = rand();
    const corner = cornerRoll < 0.12 ? "top" : cornerRoll < 0.26 ? "bottom" : null;
    const outline = tornOutline(rand, { rough, corner, bite: !corner && rand() < 0.16 });
    leaf.style.setProperty("--leaf-clip", clipPath(outline));
    leaf.style.setProperty("--leaf-clip-back", clipPath(outline, true));
    leaf.style.setProperty("--leaf-tilt", `${((rand() - 0.5) * 0.9).toFixed(2)}deg`);
    leaf.style.setProperty("--leaf-width", (1 - rand() * 0.035).toFixed(3));
    leaf.style.setProperty("--leaf-top", `${(rand() * 1.2).toFixed(2)}%`);
    leaf.style.setProperty("--leaf-bottom", `${(rand() * 1.2).toFixed(2)}%`);
    leaf.style.setProperty("--leaf-paper", SKETCHBOOK_PAPERS[Math.floor(rand() * SKETCHBOOK_PAPERS.length)]);
  };

  const buildStack = (stack, seed) => {
    if (!stack) return;
    const rand = seeded(seed);
    const sheets = Array.from({ length: STACK_SHEETS }, (_, index) => {
      const sheet = element("i", "book-sheet");
      const cornerRoll = rand();
      const outline = tornOutline(rand, {
        rough: 1 + rand() * 1.6,
        corner: cornerRoll < 0.25 ? "top" : cornerRoll < 0.5 ? "bottom" : null,
      });
      sheet.style.setProperty("--sheet-clip", clipPath(outline));
      sheet.style.setProperty("--sheet-color", SKETCHBOOK_SHEETS[(index + seed) % SKETCHBOOK_SHEETS.length]);
      // Every other sheet is a drawing; a random patch of it shows where it sticks out.
      if (index % 2 === 0) {
        const drawing = SKETCHBOOK_STUFFING[(index / 2 + seed) % SKETCHBOOK_STUFFING.length];
        sheet.style.setProperty("--sheet-image", `url("${drawing}")`);
        sheet.style.setProperty("--sheet-focus", `${Math.round(rand() * 100)}% ${Math.round(rand() * 100)}%`);
      }
      // Negative insets push the sheet out past the page block, as far as on the photo.
      sheet.style.setProperty("--sheet-top", `${(-1.5 - rand() * 7).toFixed(2)}%`);
      sheet.style.setProperty("--sheet-right", `${(-1 - rand() * 6.5).toFixed(2)}%`);
      sheet.style.setProperty("--sheet-bottom", `${(-1.2 - rand() * 5.5).toFixed(2)}%`);
      sheet.style.setProperty("--sheet-tilt", `${((rand() - 0.5) * 2.6).toFixed(2)}deg`);
      return sheet;
    });
    stack.replaceChildren(...sheets);
  };

  const renderPage = (face, page) => {
    if (!page) return;
    if (page.type === "cover") {
      face.classList.add("book-face--cover");
    } else if (page.type === "intro") {
      face.classList.add("book-face--inside");
      // The elastic band from the front of the cover, seen from inside: it runs top to bottom.
      face.append(element("span", "book-elastic"));
      face.append(element("div", "book-note", "<strong>Рисую для&nbsp;брендов и&nbsp;для&nbsp;себя</strong><p>Здесь наброски, персонажи и&nbsp;иллюстрации разных лет. Листайте по&nbsp;клику, стрелками или свайпом.</p>"));
    } else if (page.type === "end") {
      face.append(element("div", "book-note", '<strong>Нужна иллюстрация или персонаж?</strong><p>Расскажите о&nbsp;задаче&nbsp;— нарисую под&nbsp;ваш бренд.</p><a class="process-button process-button--primary" href="./#brief-illustrations"><span>Заполнить бриф</span></a>'));
    } else if (page.src) {
      const image = document.createElement("img");
      image.alt = page.alt ?? "";
      image.decoding = "async";
      image.draggable = false;
      image.dataset.src = page.src;
      if (page.fit) image.dataset.fit = page.fit;
      face.append(image);
    }
  };

  const loadNearbyImages = () => {
    leaves.forEach((leaf, index) => {
      if (Math.abs(index - flipped) > PRELOAD_LEAVES) return;
      leaf.querySelectorAll("img[data-src]").forEach((image) => {
        image.src = image.dataset.src;
        delete image.dataset.src;
      });
    });
  };

  // The turn length lives in CSS (--motion-page, longer on phones).
  const motionMs = (name, fallback) => parseFloat(getComputedStyle(book).getPropertyValue(name)) || fallback;
  const pageTurnMs = () => motionMs("--motion-page", 900);
  const turnMs = () => motionMs("--motion-turn", 1000);

  // Turned leaves pile up on the left, unturned ones on the right; both loose-sheet stacks lie under them.
  const settle = (leaf, index) => {
    leaf.style.zIndex = String(10 + 2 * (index < flipped ? index : leaves.length - index));
  };

  // The left stack lies under the opened cover: it shows once the cover has landed on it
  // and goes the moment the cover lifts off again.
  const syncLeftStack = (movedIndex) => {
    clearTimeout(leftStackTimer);
    const show = (on) => stacks.left?.classList.toggle("is-hidden", !on);
    if (flipped < 1) show(false);
    else if (movedIndex === 0 && !reduceMotion) leftStackTimer = setTimeout(() => show(true), pageTurnMs() + 40);
    else show(true);
  };

  const sync = (movedIndex = -1) => {
    const serial = ++liftSerial;
    leaves.forEach((leaf, index) => {
      leaf.classList.toggle("is-flipped", index < flipped);
      if (index === movedIndex) {
        // Keep the turning leaf above both stacks until it lands.
        leaf.style.zIndex = String(1000 + (serial % 1000));
        const land = () => {
          if (leaf.dataset.lift !== String(serial)) return;
          delete leaf.dataset.lift;
          settle(leaf, index);
        };
        leaf.dataset.lift = String(serial);
        if (reduceMotion) land();
        else setTimeout(land, pageTurnMs() + 40);
      } else if (!leaf.dataset.lift || reduceMotion) {
        settle(leaf, index);
      }
      // Faces of buried leaves stay out of the tab order and the accessibility tree.
      leaf.inert = index !== flipped && index !== flipped - 1;
    });
    book.classList.toggle("is-side", flipped === SIDE);
    book.classList.toggle("is-closed", flipped <= 0);
    book.classList.toggle("is-open", flipped > 0);
    prevButton.disabled = flipped === SIDE;
    nextButton.disabled = flipped === maxFlipped;
    counter.textContent = flipped === SIDE ? "Блокнот" : flipped === 0 ? "Обложка" : `${flipped} / ${maxFlipped}`;
    syncLeftStack(movedIndex);
    loadNearbyImages();
  };

  // Turning the notebook between its fore-edge and its cover.
  const turnBox = book.querySelector(".book-turn");
  const endTurn = () => {
    clearTimeout(turnTimer);
    book.classList.remove("is-turning");
  };
  const turn = () => {
    book.classList.add("is-turning");
    clearTimeout(turnTimer);
    // The transition's own end is the signal; the timer only covers a transition that never ran.
    turnTimer = setTimeout(endTurn, reduceMotion ? 0 : turnMs() + 600);
  };
  turnBox?.addEventListener("transitionend", (event) => {
    if (event.target === turnBox && event.propertyName === "transform") endTurn();
  });

  const go = (direction) => {
    const serial = ++openSerial;
    const next = clamp(flipped + direction, SIDE, maxFlipped);
    if (next === flipped) return;
    if (flipped === SIDE || next === SIDE) {
      const opening = next > flipped;
      flipped = next;
      turn();
      sync();
      // The first opening carries on by itself: fore-edge, cover, first pages.
      if (opening) {
        setTimeout(() => {
          if (serial === openSerial && flipped === 0) go(1);
        }, reduceMotion ? 0 : turnMs() + 380);
      }
      return;
    }
    const movedIndex = direction > 0 ? flipped : next;
    flipped = next;
    sync(movedIndex);
  };

  const build = () => {
    const pages = [{ type: "cover" }, { type: "intro" }, ...SKETCHBOOK_PAGES];
    // The closing note must land on a right-hand page of the spread.
    if (pages.length % 2) pages.push(null);
    pages.push({ type: "end" });

    const sheets = pages.reduce((list, page, index) => {
      if (index % 2 === 0) list.push([page, pages[index + 1] ?? null]);
      return list;
    }, []);

    leaves = sheets.map(([front, back], index) => {
      const leaf = element("div", `book-leaf${index === 0 ? " book-leaf--cover" : ""}`);
      const frontFace = element("div", "book-face book-face--front");
      const backFace = element("div", "book-face book-face--back");
      renderPage(frontFace, front);
      renderPage(backFace, back);
      if (index > 0) wearLeaf(leaf, index);
      leaf.append(frontFace, backFace);
      return leaf;
    });
    leavesRoot.replaceChildren(...leaves);
    buildStack(stacks.right, 3);
    buildStack(stacks.left, 5);
    openSerial += 1;
    flipped = SIDE;
    maxFlipped = leaves.length - 1;
    sync();
  };

  let pointerStart = null;
  let swiped = false;
  book.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY };
    swiped = false;
  });
  book.addEventListener("pointerup", (event) => {
    const start = pointerStart;
    pointerStart = null;
    if (!start || event.target.closest("a, button")) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    // A horizontal drag turns the page; touch swipes never produce a click.
    if (Math.abs(deltaX) < 28 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    swiped = true;
    go(deltaX < 0 ? 1 : -1);
  });
  book.addEventListener("pointercancel", () => { pointerStart = null; });
  book.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    if (swiped) {
      swiped = false;
      return;
    }
    if (event.detail === 0) return;
    if (flipped <= 0) {
      go(1);
      return;
    }
    // The footprint is the right-hand page: its left edge is the spine of the open spread.
    const rect = book.getBoundingClientRect();
    go(event.clientX > rect.left ? 1 : -1);
  });
  book.addEventListener("keydown", (event) => {
    if (event.target !== book) return;
    if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  });
  prevButton.addEventListener("click", () => go(-1));
  nextButton.addEventListener("click", () => go(1));
  build();
})();
