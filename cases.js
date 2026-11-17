// Case pages (cases.html, identity.html, merch.html, illustrations.html, social.html):
// renders the cases of one category from cases-data.js into every [data-case-grid].
// data-category="all" shows every case. A card opens the case reader on the main page.

(() => {
  const grids = document.querySelectorAll("[data-case-grid]");
  if (!grids.length || typeof pairs === "undefined") return;

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const card = (item) => {
    const link = element("a", "case-card");
    link.href = `./#case/${encodeURIComponent(item.slug)}`;
    const media = element("span", "case-card-media");
    const image = document.createElement("img");
    image.src = item.caseImage || item.companyImage;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
    const body = element("span", "case-card-body");
    body.append(element("span", "case-card-type", item.type), element("span", "case-card-title", item.title), element("span", "case-card-copy", item.copy));
    link.append(media, body);
    return link;
  };

  grids.forEach((grid) => {
    const category = grid.dataset.category || "all";
    const items = pairs.filter((item) => category === "all" || (item.categories ?? []).includes(category));
    if (!items.length) {
      const empty = element("div", "case-grid-empty");
      empty.append(element("p", "", "Кейсы в этом разделе скоро появятся."));
      const all = element("a", "subpage-back", "Смотреть все кейсы");
      all.href = "./cases.html";
      empty.append(all);
      grid.replaceChildren(empty);
      return;
    }
    grid.replaceChildren(...items.map(card));
  });
})();
