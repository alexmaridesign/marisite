// "Site in development": a thin strip at the top of every page, and a card that slides down
// once per visit, folds back up on its own after a few seconds (paused while hovered or
// focused) and can be folded right away with the cross or Esc. "Подробнее" brings it back.

(() => {
  const SEEN_KEY = "mari-dev-notice-seen";
  const AUTO_DELAY = 600;

  const readSeen = () => {
    try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; }
  };
  const markSeen = () => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode: show again next page */ }
  };

  const strip = document.createElement("div");
  strip.className = "dev-strip";
  strip.innerHTML = `
    <span class="dev-strip-dot" aria-hidden="true"></span>
    <span class="dev-strip-text">Сайт в&nbsp;разработке<span class="dev-strip-note"> — часть разделов ещё наполняется</span></span>
    <button class="dev-strip-more" type="button" aria-expanded="false" aria-controls="dev-notice">Подробнее</button>`;

  const notice = document.createElement("aside");
  notice.className = "dev-notice";
  notice.id = "dev-notice";
  notice.hidden = true;
  notice.setAttribute("aria-label", "Сайт в разработке");
  notice.innerHTML = `
    <img class="dev-notice-art" src="./assets/dev-notice.webp" alt="Сайт в разработке" width="1120" height="718" decoding="async" />
    <div class="dev-notice-bar">
      <p>Часть кейсов и&nbsp;разделов ещё наполняется&nbsp;— загляните чуть позже.</p>
      <button class="dev-notice-close" type="button" aria-label="Свернуть">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </div>
    <span class="dev-notice-timer" aria-hidden="true"></span>`;

  document.body.prepend(strip);
  document.body.append(notice);

  const more = strip.querySelector(".dev-strip-more");
  const close = notice.querySelector(".dev-notice-close");
  const timer = notice.querySelector(".dev-notice-timer");

  const openNotice = ({ auto = false } = {}) => {
    notice.hidden = false;
    notice.classList.toggle("is-timed", auto);
    more.setAttribute("aria-expanded", "true");
    // Next frame, so the slide-down starts from the folded position.
    requestAnimationFrame(() => requestAnimationFrame(() => notice.classList.add("is-open")));
  };

  const foldNotice = () => {
    if (notice.hidden) return;
    notice.classList.remove("is-open", "is-timed");
    more.setAttribute("aria-expanded", "false");
    const finish = () => {
      if (!notice.classList.contains("is-open")) notice.hidden = true;
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else notice.addEventListener("transitionend", finish, { once: true });
  };

  // The progress line under the card is the timer: when it runs out, the card folds.
  timer.addEventListener("animationend", foldNotice);
  close.addEventListener("click", () => {
    foldNotice();
    more.focus({ preventScroll: true });
  });
  more.addEventListener("click", () => {
    if (notice.classList.contains("is-open")) foldNotice();
    else openNotice();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && notice.classList.contains("is-open") && !document.querySelector("dialog[open]")) foldNotice();
  });

  // Once per visit, and not over a case opened from a section page or an open dialog.
  if (!readSeen() && !document.documentElement.classList.contains("case-from-section")) {
    setTimeout(() => {
      if (document.querySelector("dialog[open]")) return;
      markSeen();
      openNotice({ auto: true });
    }, AUTO_DELAY);
  }
})();
