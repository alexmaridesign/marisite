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

  // Card in the manner of a portfolio feed: the picture, then who it is for
  // (logo, company, what they are), then one line about the work.
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

    const author = element("span", "case-card-author");
    const avatar = document.createElement("img");
    avatar.className = "case-card-avatar";
    avatar.src = item.companyImage;
    avatar.alt = "";
    avatar.loading = "lazy";
    avatar.decoding = "async";
    const who = element("span", "case-card-who");
    who.append(element("span", "case-card-company", item.company), element("span", "case-card-meta", item.label));
    author.append(avatar, who);

    const title = element("span", "case-card-title", item.copy.replace(/\.$/, ""));
    title.title = title.textContent;

    link.append(media, author, title);
    return link;
  };

  grids.forEach((grid) => {
    const category = grid.dataset.category || "all";
    const items = pairs.filter((item) => category === "all" || (item.categories ?? []).includes(category));
    if (!items.length) {
      const empty = element("div", "case-grid-empty");
      empty.append(element("p", "", "Кейсы в этом разделе скоро появятся."));
      const all = element("a", "subpage-back", "Смотреть все кейсы");
      all.href = "./cases";
      empty.append(all);
      grid.replaceChildren(empty);
      return;
    }
    grid.replaceChildren(...items.map(card));
  });
})();
