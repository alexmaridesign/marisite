// "Site in development": a thin strip at the top of every page, and a top sheet (full width,
// about a third of the screen) that slides down once per visit over a blurred, dimmed page.
// Like a native sheet it follows the finger: drag it up to put it away, a short drag springs
// back. It also folds by itself after a few seconds, with the cross, Esc or a click on the page.
// "Подробнее" in the strip brings it back.

(() => {
  const SEEN_KEY = "mari-dev-notice-seen";
  const AUTO_DELAY = 600;
  const AUTO_FOLD = 7000;
  const DRAG_CLOSE_SHARE = 0.25; // of the sheet height
  const FLICK_SPEED = 0.5; // px per ms, upwards

  const readSeen = () => {
    try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; }
  };
  const markSeen = () => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode: show again next page */ }
  };
  const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const strip = document.createElement("div");
  strip.className = "dev-strip";
  strip.innerHTML = `
    <span class="dev-strip-dot" aria-hidden="true"></span>
    <span class="dev-strip-text">Сайт в&nbsp;разработке<span class="dev-strip-note"> — часть разделов ещё наполняется</span></span>
    <button class="dev-strip-more" type="button" aria-expanded="false" aria-controls="dev-notice">Подробнее</button>`;

  const backdrop = document.createElement("div");
  backdrop.className = "dev-notice-backdrop";
  backdrop.hidden = true;

  const notice = document.createElement("aside");
  notice.className = "dev-notice";
  notice.id = "dev-notice";
  notice.hidden = true;
  notice.setAttribute("aria-label", "Сайт в разработке");
  notice.innerHTML = `
    <div class="dev-notice-body">
      <img class="dev-notice-art" src="./assets/dev-tools.webp" alt="" width="640" height="640" decoding="async" draggable="false" />
      <div class="dev-notice-text">
        <p class="dev-notice-title">Сайт в&nbsp;разработке</p>
        <p class="dev-notice-caption">Часть кейсов и&nbsp;разделов ещё наполняется&nbsp;— загляните чуть позже.</p>
      </div>
    </div>
    <button class="dev-notice-close" type="button" aria-label="Свернуть">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" /></svg>
    </button>
    <span class="dev-notice-grabber" aria-hidden="true"></span>`;

  document.body.prepend(strip);
  document.body.append(backdrop, notice);

  const more = strip.querySelector(".dev-strip-more");
  const close = notice.querySelector(".dev-notice-close");
  let foldTimer = 0;

  const setOpen = (open) => {
    notice.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("dev-notice-open", open);
    more.setAttribute("aria-expanded", String(open));
  };

  const openNotice = ({ auto = false } = {}) => {
    clearTimeout(foldTimer);
    notice.hidden = false;
    backdrop.hidden = false;
    if (auto) foldTimer = setTimeout(foldNotice, AUTO_FOLD);
    // Two frames, so the slide starts from the folded position.
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  };

  function foldNotice() {
    if (notice.hidden) return;
    clearTimeout(foldTimer);
    notice.style.removeProperty("--dev-drag");
    notice.classList.remove("is-dragging");
    setOpen(false);
    const finish = () => {
      if (notice.classList.contains("is-open")) return;
      notice.hidden = true;
      backdrop.hidden = true;
    };
    if (reducedMotion()) finish();
    else setTimeout(finish, 460);
  }

  close.addEventListener("click", () => {
    foldNotice();
    more.focus({ preventScroll: true });
  });
  backdrop.addEventListener("click", foldNotice);
  more.addEventListener("click", () => {
    if (notice.classList.contains("is-open")) foldNotice();
    else openNotice();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && notice.classList.contains("is-open") && !document.querySelector("dialog[open]")) foldNotice();
  });

  // Drag: the sheet follows the pointer upwards 1:1, downwards only a little (rubber band).
  let drag = null;
  notice.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("button, a")) return;
    clearTimeout(foldTimer);
    drag = { id: event.pointerId, startY: event.clientY, lastY: event.clientY, lastT: event.timeStamp, speed: 0 };
    notice.setPointerCapture(event.pointerId);
    notice.classList.add("is-dragging");
  });
  notice.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dy = event.clientY - drag.startY;
    const shift = dy < 0 ? dy : Math.sqrt(dy) * 4;
    notice.style.setProperty("--dev-drag", `${shift}px`);
    const dt = Math.max(1, event.timeStamp - drag.lastT);
    drag.speed = (drag.lastY - event.clientY) / dt;
    drag.lastY = event.clientY;
    drag.lastT = event.timeStamp;
  });
  const endDrag = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dy = event.clientY - drag.startY;
    const flick = drag.speed > FLICK_SPEED && dy < -10;
    drag = null;
    notice.classList.remove("is-dragging");
    if (flick || -dy > notice.offsetHeight * DRAG_CLOSE_SHARE) {
      foldNotice();
    } else {
      notice.style.removeProperty("--dev-drag");
    }
  };
  notice.addEventListener("pointerup", endDrag);
  notice.addEventListener("pointercancel", endDrag);

  // Once per visit, and not over a case opened from a section page or an open dialog.
  if (!readSeen() && !document.documentElement.classList.contains("case-from-section")) {
    setTimeout(() => {
      if (document.querySelector("dialog[open]")) return;
      markSeen();
      openNotice({ auto: true });
    }, AUTO_DELAY);
  }
})();
