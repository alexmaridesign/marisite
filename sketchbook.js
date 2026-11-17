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

  // Outline of a worn sheet in % of its box. The spine edge (x = 0) stays straight.
  // rough: fine jitter of the torn fibres; wave: slow waviness of a crumpled edge;
  // steps: how many points per edge (more = finer tears); corner: a corner torn off ("top" / "bottom"),
  // cornerSize scales it; bite: a chunk ripped out of the outer edge, biteDepth scales it;
  // dogEar: a corner folded over ("top" / "bottom") — cut straight, the flap is drawn separately.
  const tornOutline = (rand, { rough = 0.4, wave = 0, steps: stepCount, corner = null, cornerSize = 1, bite = false, biteDepth = 1, dogEar = null } = {}) => {
    const points = [];
    const steps = stepCount ?? (rough > 1 ? 16 : 9);
    const jitter = () => rand() * rough;
    // Two slow sine waves per edge: a crumpled sheet never has a straight line.
    const waviness = () => {
      const [p1, p2, f1, f2] = [rand() * Math.PI * 2, rand() * Math.PI * 2, 0.8 + rand() * 1.6, 2.5 + rand() * 3];
      return (t) => (wave * ((Math.sin(p1 + t * f1 * Math.PI * 2) + 1) * 0.6 + (Math.sin(p2 + t * f2 * Math.PI * 2) + 1) * 0.4)) / 2;
    };
    const [topWave, rightWave, bottomWave] = [waviness(), waviness(), waviness()];
    const tear = () => ({ w: (8 + rand() * 12) * cornerSize, h: (6 + rand() * 9) * cornerSize });
    const fold = () => ({ w: 11 + rand() * 9, h: 8 + rand() * 8 });
    const top = corner === "top" ? tear() : dogEar === "top" ? fold() : null;
    const bottom = corner === "bottom" ? tear() : dogEar === "bottom" ? fold() : null;
    const topEnd = 100 - (top?.w ?? 0);
    const bottomEnd = 100 - (bottom?.w ?? 0);
    const rightStart = top?.h ?? 0;
    const rightEnd = 100 - (bottom?.h ?? 0);
    const biteAt = bite ? 22 + rand() * 46 : -1;
    const biteSize = (7 + rand() * 7) * Math.sqrt(biteDepth);
    // A torn-off corner is a ragged diagonal; a folded one is a clean crease.
    const cornerPoints = (from, to, folded) => {
      const out = [];
      for (let i = 1; i < 6; i += 1) {
        const t = i / 6;
        const noise = folded ? 0 : (rand() - 0.5) * 2.4 * cornerSize;
        out.push([from[0] + (to[0] - from[0]) * t + noise, from[1] + (to[1] - from[1]) * t + noise]);
      }
      return out;
    };

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      points.push([topEnd * t, jitter() + topWave(t)]);
    }
    if (top) points.push(...cornerPoints([topEnd, 0], [100, top.h], dogEar === "top"));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const y = rightStart + (rightEnd - rightStart) * t;
      const inBite = bite && Math.abs(y - biteAt) < biteSize;
      const depth = inBite ? Math.cos(((y - biteAt) / biteSize) * (Math.PI / 2)) * (4 + rand() * 3) * biteDepth : 0;
      points.push([100 - jitter() - rightWave(t) - depth, y]);
    }
    if (bottom) points.push(...cornerPoints([100, rightEnd], [bottomEnd, 100], dogEar === "bottom"));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      points.push([bottomEnd - bottomEnd * t, 100 - jitter() - bottomWave(t)]);
    }
    const outline = points.map(([x, y]) => [clamp(x, 0, 100), clamp(y, 0, 100)]);
    if (dogEar) outline.fold = { side: dogEar, ...(dogEar === "top" ? top : bottom) };
    return outline;
  };

  const clipPath = (points, mirror = false) =>
    `polygon(${points.map(([x, y]) => `${(mirror ? 100 - x : x).toFixed(2)}% ${y.toFixed(2)}%`).join(", ")})`;

  // The folded-over corner: the cut-off triangle mirrored across the crease, in % of the leaf.
  // The leaf is about 1.16 times taller than wide, so the mirroring is done in real proportions.
  const LEAF_RATIO = 1.16;
  const foldFlap = ({ side, w, h }) => {
    const sy = side === "top" ? 1 : -1;
    const y0 = side === "top" ? 0 : 100;
    const a = [100 - w, y0];
    const b = [100, y0 + sy * h];
    const corner = [100, y0];
    const toUnits = ([x, y]) => [x / 100, (y / 100) * LEAF_RATIO];
    const [ax, ay] = toUnits(a);
    const [bx, by] = toUnits(b);
    const [px, py] = toUnits(corner);
    const [dx, dy] = [bx - ax, by - ay];
    const k = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    const [fx, fy] = [ax + k * dx, ay + k * dy];
    const reflected = [(2 * fx - px) * 100, ((2 * fy - py) / LEAF_RATIO) * 100];
    return [a, b, reflected];
  };

  // Every page of this old diary is worn its own way, and no two neighbours the same way:
  // crumpled (wavy edges, creases), torn (ragged fibres), a corner torn off, a chunk ripped out,
  // or a dog-eared corner.
  const WEAR = {
    crumpled: (rand) => ({ rough: 0.7, wave: 2.4, steps: 14, creases: 4 + Math.floor(rand() * 3), blotches: 3 }),
    torn: () => ({ rough: 2.6, wave: 0.9, steps: 26, creases: 1 }),
    corner: (rand) => ({ rough: 1.4, wave: 1.1, steps: 18, corner: rand() < 0.5 ? "top" : "bottom", cornerSize: 1.6, creases: 2 }),
    bite: () => ({ rough: 1.2, wave: 1, steps: 18, bite: true, biteDepth: 1.6, creases: 1 }),
    dogEar: (rand) => ({ rough: 0.9, wave: 1.3, steps: 14, dogEar: rand() < 0.6 ? "top" : "bottom", creases: 2 }),
  };
  const WEAR_KINDS = Object.keys(WEAR);
  let lastWear = "";

  // Creases and soft rubbed patches over the paper (and over the drawing, as on a real worn page).
  const creaseLayers = (rand, creases, blotches = 0) => {
    const layers = [];
    for (let i = 0; i < creases; i += 1) {
      const angle = Math.round(rand() * 180);
      const at = 15 + rand() * 70;
      const dark = (0.05 + rand() * 0.06).toFixed(3);
      const light = (0.1 + rand() * 0.1).toFixed(3);
      layers.push(`linear-gradient(${angle}deg, transparent ${(at - 1.4).toFixed(1)}%, rgba(61, 58, 51, ${dark}) ${at.toFixed(1)}%, rgba(255, 255, 255, ${light}) ${(at + 0.5).toFixed(1)}%, transparent ${(at + 1.8).toFixed(1)}%)`);
    }
    for (let i = 0; i < blotches; i += 1) {
      layers.push(`radial-gradient(ellipse at ${Math.round(rand() * 100)}% ${Math.round(rand() * 100)}%, rgba(61, 58, 51, 0.07), transparent ${Math.round(18 + rand() * 18)}%)`);
    }
    return layers.join(", ");
  };

  const wearLeaf = (leaf, index) => {
    const rand = seeded(index * 7919 + 13);
    const choices = WEAR_KINDS.filter((kind) => kind !== lastWear);
    const kind = choices[Math.floor(rand() * choices.length)];
    lastWear = kind;
    const wear = WEAR[kind](rand);
    const outline = tornOutline(rand, wear);
    leaf.dataset.wear = kind;
    leaf.style.setProperty("--leaf-clip", clipPath(outline));
    leaf.style.setProperty("--leaf-clip-back", clipPath(outline, true));
    leaf.style.setProperty("--leaf-creases", creaseLayers(rand, wear.creases, wear.blotches));
    leaf.style.setProperty("--leaf-tilt", `${((rand() - 0.5) * 0.9).toFixed(2)}deg`);
    leaf.style.setProperty("--leaf-width", (1 - rand() * 0.035).toFixed(3));
    leaf.style.setProperty("--leaf-top", `${(rand() * 1.2).toFixed(2)}%`);
    leaf.style.setProperty("--leaf-bottom", `${(rand() * 1.2).toFixed(2)}%`);
    leaf.style.setProperty("--leaf-paper", SKETCHBOOK_PAPERS[Math.floor(rand() * SKETCHBOOK_PAPERS.length)]);
    if (outline.fold) {
      const flap = foldFlap(outline.fold);
      leaf.querySelectorAll(".book-face").forEach((face) => {
        const node = element("span", "book-fold");
        node.style.setProperty("--fold-clip", clipPath(flap, face.classList.contains("book-face--back")));
        face.append(node);
      });
    }
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

  // On the first spread only the cover lies on the left, and nothing sticks out from behind it.
  // The loose sheets on the left belong to turned pages: they fade in while the first page turns
  // over (CSS transition) and fade out as it turns back.
  const syncLeftStack = () => {
    stacks.left?.classList.toggle("is-hidden", flipped < 2);
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
    syncLeftStack();
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

    lastWear = "";
    leaves = sheets.map(([front, back], index) => {
      const leaf = element("div", `book-leaf${index === 0 ? " book-leaf--cover" : ""}`);
      const frontFace = element("div", "book-face book-face--front");
      const backFace = element("div", "book-face book-face--back");
      renderPage(frontFace, front);
      renderPage(backFace, back);
      leaf.append(frontFace, backFace);
      if (index > 0) wearLeaf(leaf, index);
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
