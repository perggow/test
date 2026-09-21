// ─────────────────────────────────────────────────────────────
//  HTML-шаблоны страницы, карточек и модалок
// ─────────────────────────────────────────────────────────────

import {
  ATTRS,
  CATEGORIES,
  MARKUP,
  MAX_RUB,
  MIN_RUB,
  fmtPrice,
  esc,
  type AttrKey,
  type Category,
  type Item,
} from "./data";

export type Filters = {
  cat: Category;
  collections: string[];
  models: string[];
  backdrops: string[];
  symbols: string[];
  priceMin: number;
  priceMax: number;
  sort: "asc" | "desc" | "reco";
};

const ATTR_SELECTED: Record<AttrKey, keyof Filters> = {
  collection: "collections",
  model: "models",
  backdrop: "backdrops",
  symbol: "symbols",
};

// ─── Карточка товара ──────────────────────────────────────────

function renderCard(item: Item): string {
  const badge = item.badge
    ? `<span class="badge" style="background:${esc(item.badge.color)}">${esc(item.badge.text)}</span>`
    : "";

  const media = item.tgs
    ? `<div class="tgs" data-tgs="${esc(item.tgs)}"></div>`
    : `<div class="card-emoji">${esc(item.emoji || "🎁")}</div>`;

  const attrChips = (["model", "backdrop", "symbol"] as AttrKey[])
    .map(k => item.attrs[k])
    .filter(Boolean)
    .map(v => `<span>${esc(v!)}</span>`)
    .join("");

  const stock = item.stock
    ? `<span class="stock">${item.stock} шт.</span>`
    : "";

  return `
    <article class="card" data-id="${item.id}">
      ${badge}
      <div class="card-media">${media}</div>
      <div class="card-body">
        <div class="card-title" title="${esc(item.name)}">${esc(item.name)}</div>
        ${attrChips ? `<div class="card-attrs">${attrChips}</div>` : ""}
        <div class="card-footer">
          <span class="price">${fmtPrice(item.price)}</span>
          ${stock}
        </div>
        <button type="button" class="btn primary full js-open" data-id="${item.id}">
          Купить
        </button>
      </div>
    </article>`;
}

// ─── Фильтр-атрибут (кнопка, открывающая модалку) ─────────────

function renderAttrFilter(
  key: AttrKey,
  label: string,
  values: string[],
  selected: string[]
): string {
  const counter = selected.length;
  const disabled = values.length === 0 ? "disabled" : "";
  return `
    <div class="attr-filter" data-name="${key}" data-label="${label}" ${disabled}>
      <button type="button" class="attr-toggle" ${disabled}>
        <span class="attr-label">${label}</span>
        <span class="attr-counter ${counter ? "" : "hidden"}">${counter}</span>
        <span class="attr-arrow">▾</span>
      </button>
    </div>`;
}

// ─── Вкладки (topbar) ─────────────────────────────────────────

function renderTabs(active: Category): string {
  return CATEGORIES.map(c =>
    `<a class="tab ${c.key === active ? "active" : ""}" href="${c.href}">${c.label}</a>`
  ).join("");
}

function renderBottomBar(active: Category): string {
  return CATEGORIES.map(c => `
    <a class="${c.key === active ? "active" : ""}" href="${c.href}">
      <span class="ico">${c.icon}</span>
      <span>${c.short}</span>
    </a>`).join("");
}

// ─── Модалки ──────────────────────────────────────────────────

function renderModals(): string {
  return `
  <!-- Модалка выбора атрибутов -->
  <div id="attr-modal" class="modal hidden" aria-hidden="true">
    <div class="modal-backdrop" data-close></div>
    <div class="modal-content attr-modal-content">
      <header class="attr-modal-head">
        <h3 id="attr-modal-title">Атрибут</h3>
        <button class="modal-close" data-close>&times;</button>
      </header>
      <div class="attr-modal-search">
        <input id="attr-modal-search" type="text" placeholder="Поиск…" autocomplete="off" spellcheck="false">
      </div>
      <div class="attr-modal-actions">
        <span class="muted">Выбрано: <span id="attr-modal-count">0</span></span>
        <span class="attr-modal-actions-right">
          <span id="attr-modal-sort" class="attr-sort hidden">
            <button type="button" class="attr-sort-btn active" data-sort="price">По цене</button>
            <button type="button" class="attr-sort-btn" data-sort="az">A-Z</button>
          </span>
          <button id="attr-modal-selectall" type="button" class="link-btn">Выбрать все</button>
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
          <button id="modal-buy" class="btn primary full" type="button">Купить</button>
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
      <div class="buy-meta" id="buy-meta"></div>
      <label class="buy-code-label">Код заказа (отправьте продавцу)
        <div class="buy-code-row">
          <input type="text" id="buy-code" readonly>
          <button id="buy-copy" class="btn ghost" type="button">Копировать</button>
        </div>
        <small id="buy-code-hint" class="muted">—</small>
      </label>
      <div class="buy-actions">
        <button id="buy-go" class="btn primary full" type="button">Перейти к покупке</button>
      </div>
      <div id="buy-error" class="alert error hidden"></div>
    </div>
  </div>`;
}

// ─── Полная страница ──────────────────────────────────────────

export function renderPage(items: Item[], allItems: Item[], f: Filters): string {
  // Собираем уникальные значения атрибутов ТОЛЬКО по текущей категории
  const uniqAttr = (key: AttrKey): string[] => {
    const set = new Set<string>();
    for (const it of allItems) {
      const v = it.attrs[key];
      if (v) set.add(v);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "ru"));
  };

  const cards = items.length
    ? items.map(renderCard).join("")
    : `<div class="empty">Ничего не найдено. Попробуйте сбросить фильтры.</div>`;

  const filtersHtml = ATTRS.map(({ key, label }) => {
    const sel = f[ATTR_SELECTED[key]] as string[];
    return renderAttrFilter(key, label, uniqAttr(key), sel);
  }).join("");

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#0e1118">
  <meta name="description" content="Купить и арендовать NFT-подарки Telegram. Быстро, безопасно, через FunPay.">
  <title>${getTitle(f.cat)} — Zabwino Gifts</title>
  <link rel="icon" href="/static/favicon.ico">
  <link rel="stylesheet" href="/static/css/style.css">
</head>
<body data-cat="${f.cat}"
      data-markup="${MARKUP}"
      data-min-rub="${MIN_RUB}"
      data-max-rub="${MAX_RUB}">

<header class="topbar">
  <nav class="tabs">${renderTabs(f.cat)}</nav>
</header>

<main class="content">
  <div class="layout">

    <aside class="filters" id="filters">
      ${filtersHtml}

      <div class="filter-block">
        <label class="lbl">Цена</label>
        <div class="range">
          <input type="range" id="f-price-min" min="${MIN_RUB}" max="${MAX_RUB}" step="1" value="${f.priceMin}">
          <input type="range" id="f-price-max" min="${MIN_RUB}" max="${MAX_RUB}" step="1" value="${f.priceMax}">
        </div>
        <div class="range-vals">
          <input type="number" id="price-min-val" class="price-input" min="0" step="1" inputmode="numeric" value="${f.priceMin}" placeholder="от ₽">
          <span>—</span>
          <input type="number" id="price-max-val" class="price-input" min="0" step="1" inputmode="numeric" value="${f.priceMax}" placeholder="до ₽">
        </div>
      </div>

      <div class="filter-block">
        <label class="lbl">Сортировка</label>
        <select id="f-sort" autocomplete="off">
          <option value="reco" ${f.sort === "reco" ? "selected" : ""}>Наши рекомендации</option>
          <option value="asc"  ${f.sort === "asc"  ? "selected" : ""}>Дешёвые</option>
          <option value="desc" ${f.sort === "desc" ? "selected" : ""}>Дорогие</option>
        </select>
      </div>

      <span class="spacer"></span>
      <button id="apply-btn" class="btn primary" type="button">Применить</button>
      <button id="reset-btn" class="btn ghost" type="button">Сбросить</button>
    </aside>

    <section class="grid-wrap">
      <div id="grid" class="grid">${cards}</div>
      <div id="grid-status" class="grid-status"></div>
    </section>

  </div>
</main>

<nav class="bottombar">${renderBottomBar(f.cat)}</nav>

${renderModals()}

<script>window.__ITEMS__ = ${JSON.stringify(
    allItems.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      link: i.link,
      emoji: i.emoji ?? null,
      tgs: i.tgs ?? null,
      attrs: i.attrs,
      badge: i.badge ?? null,
      stock: i.stock ?? null,
    }))
  )};</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js"></script>
<script src="/static/js/tgs.js"></script>
<script src="/static/js/catalog.js"></script>
</body>
</html>`;
}

function getTitle(cat: Category): string {
  switch (cat) {
    case "buy":           return "Купить подарки";
    case "rent":          return "Аренда подарков";
    case "usernames":     return "Аренда юзернеймов";
    case "usernames-buy": return "Купить юзернеймы";
  }
}
