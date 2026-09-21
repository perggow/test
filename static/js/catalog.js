/* ─────────────────────────────────────────────────────────────
   Клиентская логика каталога:
   - открытие/закрытие модалок
   - фильтры-атрибуты (модалка с чекбоксами)
   - range-слайдеры цены
   - карточка товара + попап покупки с кодом заказа
   ───────────────────────────────────────────────────────────── */

(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const ITEMS = window.__ITEMS__ || [];
  const byId = new Map(ITEMS.map(i => [i.id, i]));

  // ─── Утилиты ──────────────────────────────────────────────
  const fmt = n => n.toLocaleString("ru-RU") + " ₽";

  const buildQuery = (extra = {}) => {
    const u = new URL(location.href);
    // сбросим все фильтры и заново соберём из текущего состояния UI
    ["collection", "model", "backdrop", "symbol"].forEach(k => u.searchParams.delete(k));
    u.searchParams.delete("pmin");
    u.searchParams.delete("pmax");
    u.searchParams.delete("sort");

    $$("#filters .attr-filter").forEach(f => {
      const name = f.dataset.name;
      const selected = f.__selected || [];
      selected.forEach(v => u.searchParams.append(name, v));
    });

    const pmin = $("#price-min-val")?.value;
    const pmax = $("#price-max-val")?.value;
    if (pmin && Number(pmin) > Number(document.body.dataset.minRub || 0))
      u.searchParams.set("pmin", pmin);
    if (pmax && Number(pmax) < Number(document.body.dataset.maxRub || 1e9))
      u.searchParams.set("pmax", pmax);

    const sort = $("#f-sort")?.value;
    if (sort && sort !== "reco") u.searchParams.set("sort", sort);

    Object.entries(extra).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  };

  const applyFilters = () => { location.href = buildQuery(); };

  // ─── Модалки: общее ───────────────────────────────────────
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove("hidden");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal(m) {
    m.classList.add("hidden");
    m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.addEventListener("click", e => {
    const closeBtn = e.target.closest("[data-close]");
    if (closeBtn) {
      const m = closeBtn.closest(".modal");
      if (m) closeModal(m);
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") $$(".modal:not(.hidden)").forEach(closeModal);
  });

  // ─── Фильтры-атрибуты ─────────────────────────────────────
  // Прочитаем текущее выделение из URL
  const url = new URL(location.href);
  $$("#filters .attr-filter").forEach(f => {
    const name = f.dataset.name;
    f.__selected = url.searchParams.getAll(name);
    updateCounter(f);
  });

  function updateCounter(f) {
    const cnt = (f.__selected || []).length;
    const el = f.querySelector(".attr-counter");
    if (!el) return;
    el.textContent = String(cnt);
    el.classList.toggle("hidden", cnt === 0);
  }

  // Открытие модалки атрибутов
  let activeAttrFilter = null;

  function openAttrModal(f) {
    activeAttrFilter = f;
    const name = f.dataset.name;
    const label = f.dataset.label;

    $("#attr-modal-title").textContent = label;

    // Собираем уникальные значения и их количество среди ITEMS текущей категории
    const cat = document.body.dataset.cat;
    const counts = new Map();
    for (const it of ITEMS) {
      if (it.category && it.category !== cat) continue; // на случай, если бэкенд не отфильтровал
      const v = it.attrs?.[name];
      if (!v) continue;
      counts.set(v, (counts.get(v) || 0) + 1);
    }

    const selected = new Set(f.__selected || []);

    // Рисуем список
    renderAttrList(name, label, counts, selected);

    // Сброс поиска и сортировки
    const search = $("#attr-modal-search");
    search.value = "";
    let sort = "price";
    $$("#attr-modal-sort .attr-sort-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.sort === "price");
    });

    // Обработчики внутри модалки
    const onChange = () => {
      updateAttrCount();
    };

    // Подпишемся через атрибут onchange напрямую в renderAttrList

    openModal("attr-modal");
  }

  function renderAttrList(name, label, counts, selected) {
    const q = ($("#attr-modal-search").value || "").toLowerCase().trim();
    let entries = [...counts.entries()].filter(([v]) => !q || v.toLowerCase().includes(q));

    // Сортировка
    const sort = $("#attr-modal-sort .attr-sort-btn.active")?.dataset.sort || "price";
    if (sort === "az") {
      entries.sort((a, b) => a[0].localeCompare(b[0], "ru"));
    } else {
      // по цене: сначала где есть товары, потом по алфавиту (мини-эвристика)
      entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"));
    }

    const list = $("#attr-modal-list");
    list.innerHTML = entries.length
      ? entries.map(([v, c]) => `
        <label class="attr-row">
          <input type="checkbox" value="${escapeAttr(v)}" ${selected.has(v) ? "checked" : ""}>
          <span class="attr-name">${escapeHtml(v)}</span>
          <span class="attr-count">${c}</span>
        </label>`).join("")
      : `<div class="muted" style="padding:20px;text-align:center;">Ничего не найдено</div>`;

    updateAttrCount();
  }

  function updateAttrCount() {
    const cnt = $$("#attr-modal-list input[type=checkbox]:checked").length;
    $("#attr-modal-count").textContent = String(cnt);
  }

  // Клик по кнопке атрибута
  document.addEventListener("click", e => {
    const toggle = e.target.closest(".attr-toggle");
    if (!toggle) return;
    const f = toggle.closest(".attr-filter");
    if (!f) return;
    openAttrModal(f);
  });

  // Поиск внутри модалки атрибутов
  document.addEventListener("input", e => {
    if (e.target.id === "attr-modal-search") {
      const f = activeAttrFilter;
      if (!f) return;
      const name = f.dataset.name;
      const label = f.dataset.label;
      const counts = buildCounts(name);
      const selected = new Set(
        $$("#attr-modal-list input[type=checkbox]:checked").map(x => x.value)
      );
      renderAttrList(name, label, counts, selected);
    }
  });

  function buildCounts(name) {
    const cat = document.body.dataset.cat;
    const counts = new Map();
    for (const it of ITEMS) {
      if (it.category && it.category !== cat) continue;
      const v = it.attrs?.[name];
      if (!v) continue;
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    return counts;
  }

  // Сортировка значений в модалке
  document.addEventListener("click", e => {
    const btn = e.target.closest("#attr-modal-sort .attr-sort-btn");
    if (!btn) return;
    $$("#attr-modal-sort .attr-sort-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = activeAttrFilter;
    if (!f) return;
    const selected = new Set(
      $$("#attr-modal-list input[type=checkbox]:checked").map(x => x.value)
    );
    renderAttrList(f.dataset.name, f.dataset.label, buildCounts(f.dataset.name), selected);
  });

  // "Выбрать все" / "Сбросить"
  $("#attr-modal-selectall")?.addEventListener("click", () => {
    $$("#attr-modal-list input[type=checkbox]").forEach(c => (c.checked = true));
    updateAttrCount();
  });
  $("#attr-modal-clear")?.addEventListener("click", () => {
    $$("#attr-modal-list input[type=checkbox]").forEach(c => (c.checked = false));
    updateAttrCount();
  });

  // Отмена / Применить в модалке атрибутов
  $("#attr-modal-cancel")?.addEventListener("click", () => {
    closeModal($("#attr-modal"));
    activeAttrFilter = null;
  });
  $("#attr-modal-apply")?.addEventListener("click", () => {
    const f = activeAttrFilter;
    if (!f) return;
    f.__selected = $$("#attr-modal-list input[type=checkbox]:checked").map(c => c.value);
    updateCounter(f);
    closeModal($("#attr-modal"));
    activeAttrFilter = null;
    applyFilters();
  });

  // ─── Range-слайдеры цены ──────────────────────────────────
  const minRange = $("#f-price-min");
  const maxRange = $("#f-price-max");
  const minVal   = $("#price-min-val");
  const maxVal   = $("#price-max-val");

  function syncRange() {
    if (!minRange || !maxRange) return;
    let a = Number(minRange.value);
    let b = Number(maxRange.value);
    if (a > b) [a, b] = [b, a];
    minRange.value = String(a);
    maxRange.value = String(b);
    if (minVal) minVal.value = String(a);
    if (maxVal) maxVal.value = String(b);
  }

  minRange?.addEventListener("input", syncRange);
  maxRange?.addEventListener("input", syncRange);
  minVal?.addEventListener("change", () => {
    minRange.value = String(Math.max(0, Number(minVal.value) || 0));
    syncRange();
  });
  maxVal?.addEventListener("change", () => {
    maxRange.value = String(Math.max(0, Number(maxVal.value) || 0));
    syncRange();
  });

  // ─── Кнопки Применить/Сбросить ────────────────────────────
  $("#apply-btn")?.addEventListener("click", applyFilters);
  $("#reset-btn")?.addEventListener("click", () => {
    const u = new URL(location.href);
    ["collection", "model", "backdrop", "symbol", "pmin", "pmax", "sort"].forEach(k =>
      u.searchParams.delete(k)
    );
    location.href = u.toString();
  });

  // ─── Модалка карточки ─────────────────────────────────────
  let currentItem = null;

  function openCard(id) {
    const item = byId.get(Number(id));
    if (!item) return;
    currentItem = item;

    $("#modal-title").textContent = item.name;
    $("#modal-price").textContent = fmt(item.price);

    // Атрибуты
    const attrs = Object.entries(item.attrs || {})
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const label = ({ collection: "Коллекция", model: "Модель", backdrop: "Фон", symbol: "Узор" })[k] || k;
        return `<li><span>${label}</span><span>${escapeHtml(v)}</span></li>`;
      }).join("");
    $("#modal-attrs").innerHTML = attrs;

    // Анимация/эмодзи
    const animBox = $("#modal-anim");
    animBox.innerHTML = "";
    if (item.tgs) {
      const div = document.createElement("div");
      div.className = "tgs";
      div.dataset.tgs = item.tgs;
      animBox.appendChild(div);
      window.TGS?.mount(div, item.tgs);
    } else {
      animBox.textContent = item.emoji || "🎁";
    }

    openModal("gift-modal");
  }

  document.addEventListener("click", e => {
    const openBtn = e.target.closest(".js-open");
    if (!openBtn) return;
    openCard(openBtn.dataset.id);
  });

  $("#modal-buy")?.addEventListener("click", () => {
    if (!currentItem) return;
    closeModal($("#gift-modal"));
    openBuyModal(currentItem);
  });

  // ─── Попап покупки ────────────────────────────────────────
  function genOrderCode(item) {
    // Короткий код: ZG-<id>-<rand4>
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ZG-${item.id}-${rand}`;
  }

  function openBuyModal(item) {
    const code = genOrderCode(item);
    $("#buy-price").textContent = fmt(item.price);
    $("#buy-meta").textContent = item.name;
    const codeInput = $("#buy-code");
    codeInput.value = code;
    $("#buy-code-hint").textContent = `Сумма: ${fmt(item.price)} · Товар: ${item.name}`;
    $("#buy-go").dataset.link = item.link;
    openModal("buy-modal");
  }

  $("#buy-copy")?.addEventListener("click", async () => {
    const input = $("#buy-code");
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input.value);
      const btn = $("#buy-copy");
      const old = btn.textContent;
      btn.textContent = "Скопировано";
      setTimeout(() => (btn.textContent = old), 1500);
    } catch { /* ignore */ }
  });

  $("#buy-go")?.addEventListener("click", e => {
    const link = e.currentTarget.dataset.link;
    if (link) window.open(link, "_blank", "noopener");
  });

  // ─── Утилиты экранирования ────────────────────────────────
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
