import { ITEMS, MARKUP, MIN_RUB, MAX_RUB, type Category } from "./data";

const PORT = Number(process.env.PORT) || 3000;

const fmtPrice = (n: number) => n.toLocaleString("ru-RU") + " ₽";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]!));

type Filters = {
  cat: Category;
  collections: string[];
  models: string[];
  backdrops: string[];
  symbols: string[];
  priceMin: number;
  priceMax: number;
  sort: "asc" | "desc" | "reco";
};

function parseFilters(url: URL): Filters {
  const cat = (url.searchParams.get("cat") || "buy") as Category;
  const multi = (k: string) => url.searchParams.getAll(k).filter(Boolean);
  return {
    cat,
    collections: multi("collection"),
    models: multi("model"),
    backdrops: multi("backdrop"),
    symbols: multi("symbol"),
    priceMin: Number(url.searchParams.get("pmin") || MIN_RUB),
    priceMax: Number(url.searchParams.get("pmax") || MAX_RUB),
    sort: (url.searchParams.get("sort") as Filters["sort"]) || "reco",
  };
}

function applyFilters(items: typeof ITEMS, f: Filters) {
  let out = items.filter(i => i.category === f.cat);
  if (f.collections.length) out = out.filter(i => f.collections.includes(i.attrs.collection || ""));
  if (f.models.length)      out = out.filter(i => f.models.includes(i.attrs.model || ""));
  if (f.backdrops.length)   out = out.filter(i => f.backdrops.includes(i.attrs.backdrop || ""));
  if (f.symbols.length)     out = out.filter(i => f.symbols.includes(i.attrs.symbol || ""));
  out = out.filter(i => i.price >= f.priceMin && i.price <= f.priceMax);

  if (f.sort === "asc")  out.sort((a, b) => a.price - b.price);
  if (f.sort === "desc") out.sort((a, b) => b.price - a.price);

  return out;
}

function renderCard(item: typeof ITEMS[number]) {
  return `
    <article class="card" data-id="${item.id}">
      <div class="card-media">
        ${item.tgs
          ? `<div class="tgs" data-tgs="${esc(item.tgs)}"></div>`
          : `<div class="card-emoji">${esc(item.emoji || "🎁")}</div>`}
      </div>
      <div class="card-body">
        <div class="card-title" title="${esc(item.name)}">${esc(item.name)}</div>
        <div class="card-attrs">
          ${item.attrs.model ? `<span>${esc(item.attrs.model)}</span>` : ""}
          ${item.attrs.backdrop ? `<span>${esc(item.attrs.backdrop)}</span>` : ""}
        </div>
        <div class="card-footer">
          <span class="price">${fmtPrice(item.price)}</span>
          <button class="btn primary js-open" data-id="${item.id}">Купить</button>
        </div>
      </div>
    </article>`;
}

function renderAttrFilter(
  name: string, label: string, values: string[], selected: string[]
) {
  const counter = selected.length;
  return `
    <div class="attr-filter" data-name="${name}" data-label="${label}">
      <button type="button" class="attr-toggle">
        <span class="attr-label">${label}</span>
        <span class="attr-counter ${counter ? "" : "hidden"}">${counter}</span>
        <span class="attr-arrow">▾</span>
      </button>
    </div>`;
}

function renderPage(items: typeof ITEMS, f: Filters) {
  const all = ITEMS.filter(i => i.category === f.cat);
  const uniq = (key: keyof typeof ITEMS[number]["attrs"]) =>
    [...new Set(all.map(i => i.attrs[key]).filter(Boolean) as string[])].sort();

  const cards = items.length
    ? items.map(renderCard).join("")
    : `<div class="empty">Ничего не найдено</div>`;

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Купить — Zabwino Gifts</title>
<link rel="stylesheet" href="/static/css/style.css">
</head>
<body data-cat="${f.cat}" data-markup="${MARKUP}" data-min-rub="${MIN_RUB}" data-max-rub="${MAX_RUB}">

<header class="topbar">
  <nav class="tabs">
    <a class="tab ${f.cat==="buy"?"active":""}" href="/?cat=buy">Купить подарки</a>
    <a class="tab ${f.cat==="rent"?"active":""}" href="/?cat=rent">Аренда подарков</a>
    <a class="tab ${f.cat==="usernames"?"active":""}" href="/?cat=usernames">Аренда юзернеймов</a>
    <a class="tab ${f.cat==="usernames-buy"?"active":""}" href="/?cat=usernames-buy">Купить юзернеймы</a>
  </nav>
</header>

<main class="content">
  <div class="layout">
    <aside class="filters" id="filters">
      ${renderAttrFilter("collection", "Коллекция", uniq("collection"), f.collections)}
      ${renderAttrFilter("model", "Модель", uniq("model"), f.models)}
      ${renderAttrFilter("backdrop", "Фон", uniq("backdrop"), f.backdrops)}
      ${renderAttrFilter("symbol", "Узор", uniq("symbol"), f.symbols)}

      <div class="filter-block">
        <label class="lbl">Цена</label>
        <div class="range">
          <input type="range" id="f-price-min" min="${MIN_RUB}" max="${MAX_RUB}" value="${f.priceMin}">
          <input type="range" id="f-price-max" min="${MIN_RUB}" max="${MAX_RUB}" value="${f.priceMax}">
        </div>
        <div class="range-vals">
          <input type="number" id="price-min-val" value="${f.priceMin}" placeholder="от ₽">
          <span>—</span>
          <input type="number" id="price-max-val" value="${f.priceMax}" placeholder="до ₽">
        </div>
      </div>

      <div class="filter-block">
        <label class="lbl">Сортировка</label>
        <select id="f-sort">
          <option value="reco" ${f.sort==="reco"?"selected":""}>Наши рекомендации</option>
          <option value="asc"  ${f.sort==="asc"?"selected":""}>Дешёвые</option>
          <option value="desc" ${f.sort==="desc"?"selected":""}>Дорогие</option>
        </select>
      </div>

      <span class="spacer"></span>
      <button id="apply-btn" class="btn primary">Применить</button>
      <button id="reset-btn" class="btn ghost">Сбросить</button>
    </aside>

    <section class="grid-wrap">
      <div id="grid" class="grid">${cards}</div>
      <div id="grid-status" class="grid-status"></div>
    </section>
  </div>
</main>

<!-- Модалка атрибутов -->
<div id="attr-modal" class="modal hidden" aria-hidden="true">
  <div class="modal-backdrop" data-close></div>
  <div class="modal-content attr-modal-content">
    <header class="attr-modal-head">
      <h3 id="attr-modal-title">Атрибут</h3>
      <button class="modal-close" data-close>&times;</button>
    </header>
    <div class="attr-modal-search">
      <input id="attr-modal-search" type="text" placeholder="Поиск…" autocomplete="off">
    </div>
    <div class="attr-modal-actions">
      <span class="muted">Выбрано: <span id="attr-modal-count">0</span></span>
      <span class="attr-modal-actions-right">
        <button id="attr-modal-clear" type="button" class="link-btn">Сбросить</button>
      </span>
    </div>
    <div id="attr-modal-list" class="attr-modal-list"></div>
    <footer class="attr-modal-foot">
      <button id="attr-modal-cancel" type="button" class="btn ghost full">Отмена</button>
      <button id="attr-modal-apply"  type="button" class="btn primary full">Применить</button>
    </footer>
  </div>
</div>

<!-- Модалка карточки -->
<div id="gift-modal" class="modal hidden" aria-hidden="true">
  <div class="modal-backdrop" data-close></div>
  <div class="modal-content">
    <button class="modal-close" data-close>&times;</button>
    <div class="modal-grid">
      <div class="modal-anim" id="modal-anim"></div>
      <div class="modal-info">
        <h2 id="modal-title"></h2>
        <ul class="attrs" id="modal-attrs"></ul>
        <div class="price-line"><span id="modal-price" class="price"></span></div>
        <button id="modal-buy" class="btn primary full">Купить</button>
      </div>
    </div>
  </div>
</div>

<!-- Попап покупки -->
<div id="buy-modal" class="modal hidden" aria-hidden="true">
  <div class="modal-backdrop" data-close></div>
  <div class="modal-content narrow">
    <button class="modal-close" data-close>&times;</button>
    <h3>Покупка</h3>
    <div class="buy-price" id="buy-price"></div>
    <label class="buy-code-label">Код заказа
      <div class="buy-code-row">
        <input type="text" id="buy-code" readonly>
        <button id="buy-copy" class="btn ghost" type="button">Копировать</button>
      </div>
    </label>
    <div class="buy-actions">
      <button id="buy-go" class="btn primary full">Перейти к покупке</button>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js"></script>
<script src="/static/js/tgs.js"></script>
<script src="/static/js/catalog.js"></script>
</body>
</html>`;
}

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") {
      const f = parseFilters(url);
      const items = applyFilters(ITEMS, f);
      return new Response(renderPage(items, f), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    // статика
    if (url.pathname.startsWith("/static/")) {
      const file = Bun.file("." + url.pathname);
      return new Response(file);
    }
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Сервер на http://localhost:${PORT}`);
