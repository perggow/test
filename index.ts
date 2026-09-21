// ─────────────────────────────────────────────────────────────
//  Bun-сервер: рендер страницы + статика + JSON API
// ─────────────────────────────────────────────────────────────

import { ITEMS, MAX_RUB, MIN_RUB, type Category, type Item } from "./data";
import { renderPage, type Filters } from "./render";

const PORT = Number(process.env.PORT) || 3000;

// ─── Разбор фильтров из URL ───────────────────────────────────

function parseFilters(url: URL): Filters {
  const catRaw = url.searchParams.get("cat") || "buy";
  const cat: Category = (["buy", "rent", "usernames", "usernames-buy"] as const)
    .includes(catRaw as Category) ? (catRaw as Category) : "buy";

  const multi = (k: string) => url.searchParams.getAll(k).filter(Boolean);

  const pmin = Number(url.searchParams.get("pmin"));
  const pmax = Number(url.searchParams.get("pmax"));

  const sortRaw = url.searchParams.get("sort");
  const sort: Filters["sort"] =
    sortRaw === "asc" || sortRaw === "desc" || sortRaw === "reco" ? sortRaw : "reco";

  return {
    cat,
    collections: multi("collection"),
    models: multi("model"),
    backdrops: multi("backdrop"),
    symbols: multi("symbol"),
    priceMin: Number.isFinite(pmin) && pmin > 0 ? pmin : MIN_RUB,
    priceMax: Number.isFinite(pmax) && pmax > 0 ? pmax : MAX_RUB,
    sort,
  };
}

// ─── Фильтрация и сортировка ──────────────────────────────────

function filterItems(items: Item[], f: Filters): Item[] {
  let out = items.filter(i => i.category === f.cat);

  if (f.collections.length) out = out.filter(i => f.collections.includes(i.attrs.collection || ""));
  if (f.models.length)      out = out.filter(i => f.models.includes(i.attrs.model || ""));
  if (f.backdrops.length)   out = out.filter(i => f.backdrops.includes(i.attrs.backdrop || ""));
  if (f.symbols.length)     out = out.filter(i => f.symbols.includes(i.attrs.symbol || ""));

  out = out.filter(i => i.price >= f.priceMin && i.price <= f.priceMax);

  if (f.sort === "asc")  out = [...out].sort((a, b) => a.price - b.price);
  if (f.sort === "desc") out = [...out].sort((a, b) => b.price - a.price);
  // "reco" — оставляем исходный порядок (как в data.ts)

  return out;
}

// ─── Статика ──────────────────────────────────────────────────

async function serveStatic(pathname: string): Promise<Response> {
  // Защита от path traversal: запрещаем "..", "~", абсолютные пути и т.п.
  if (!pathname.startsWith("/static/") || pathname.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  const file = Bun.file("." + pathname);
  if (!(await file.exists())) return new Response("Not found", { status: 404 });

  // MIME — Bun определяет по расширению автоматически, но кэш выставим руками
  return new Response(file, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}

// ─── Сервер ───────────────────────────────────────────────────

const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const { pathname, searchParams } = url;

    // favicon в корне
    if (pathname === "/favicon.ico") {
      const f = Bun.file("./public/favicon.ico");
      if (await f.exists()) return new Response(f);
      return new Response("", { status: 204 });
    }

    // статика
    if (pathname.startsWith("/static/")) {
      return serveStatic(pathname);
    }

    // JSON API для будущего AJAX-фильтра (пока просто отдаёт данные)
    if (pathname === "/api/items") {
      const f = parseFilters(url);
      const items = filterItems(ITEMS, f);
      return Response.json({ ok: true, count: items.length, items });
    }

    // пинг активности (как у конкурента)
    if (pathname === "/api/ping") {
      return new Response(null, { status: 204 });
    }

    // главная (и все категории через ?cat=)
    if (pathname === "/" || pathname === "/buy" || pathname === "/rent" ||
        pathname === "/usernames" || pathname === "/usernames/buy") {

      // Удобные «человеческие» роуты → прокидываем в cat
      if (pathname === "/buy")           searchParams.set("cat", "buy");
      if (pathname === "/rent")          searchParams.set("cat", "rent");
      if (pathname === "/usernames")     searchParams.set("cat", "usernames");
      if (pathname === "/usernames/buy") searchParams.set("cat", "usernames-buy");

      const f = parseFilters(url);
      const items = filterItems(ITEMS, f);
      const html = renderPage(items, ITEMS, f);

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },

  error(err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`🛒 Zabwino Gifts запущен: http://localhost:${server.port}`);
