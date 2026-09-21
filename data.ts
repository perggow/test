// ─────────────────────────────────────────────────────────────
//  Типы и данные каталога
// ─────────────────────────────────────────────────────────────

export type Category = "buy" | "rent" | "usernames" | "usernames-buy";

export type AttrKey = "collection" | "model" | "backdrop" | "symbol";

export type Item = {
  id: number;
  name: string;           // "Sky Stilettos #29237"
  price: number;          // цена в рублях (число, для сортировки)
  link: string;           // ссылка на лот FunPay
  category: Category;
  emoji?: string;         // fallback-иконка, если нет .tgs
  tgs?: string;           // путь к .tgs-анимации: "/static/tgs/sky-stilettos.tgs"
  attrs: Partial<Record<AttrKey, string>>;
  badge?: { text: string; color: string };  // "🔥 Хит", "−20%"
  stock?: number;         // сколько в наличии
};

// ─────────────────────────────────────────────────────────────
//  Настройки витрины
// ─────────────────────────────────────────────────────────────

export const MARKUP = 45;         // % наценки (data-markup)
export const MIN_RUB = 7;         // минимальная цена
export const MAX_RUB = 50000;     // максимальная цена

export const CATEGORIES: { key: Category; label: string; short: string; icon: string; href: string }[] = [
  { key: "buy",           label: "Купить подарки",     short: "Купить",     icon: "🛒", href: "/?cat=buy" },
  { key: "rent",          label: "Аренда подарков",    short: "Аренда",     icon: "⏱",  href: "/?cat=rent" },
  { key: "usernames",     label: "Аренда юзернеймов",  short: "Юзернеймы",  icon: "@",  href: "/?cat=usernames" },
  { key: "usernames-buy", label: "Купить юзернеймы",   short: "Купить юз",  icon: "🛍", href: "/?cat=usernames-buy" },
];

// Порядок и подписи атрибутов в фильтрах
export const ATTRS: { key: AttrKey; label: string }[] = [
  { key: "collection", label: "Коллекция" },
  { key: "model",      label: "Модель" },
  { key: "backdrop",   label: "Фон" },
  { key: "symbol",     label: "Узор" },
];

// ─────────────────────────────────────────────────────────────
//  Товары
//  Заполняй руками. price — число (без пробелов, без ₽).
//  link — прямая ссылка на лот FunPay.
// ─────────────────────────────────────────────────────────────

export const ITEMS: Item[] = [
  {
    id: 1,
    name: "Sky Stilettos #29237",
    price: 4031,
    link: "https://funpay.com/lots/offer?id=0000001",
    category: "buy",
    emoji: "👠",
    attrs: { collection: "Sky Stilettos", model: "Ruby", backdrop: "Onyx", symbol: "Star" },
    badge: { text: "🔥 Хит", color: "#ff6b00" },
    stock: 3,
  },
  {
    id: 2,
    name: "Light Sword #33290",
    price: 2078,
    link: "https://funpay.com/lots/offer?id=0000002",
    category: "buy",
    emoji: "⚔️",
    attrs: { collection: "Light Sword", model: "Neon", backdrop: "Night", symbol: "Bolt" },
    stock: 5,
  },
  {
    id: 3,
    name: "Clover Pin #233623",
    price: 1428,
    link: "https://funpay.com/lots/offer?id=0000003",
    category: "buy",
    emoji: "🍀",
    attrs: { collection: "Clover Pin", model: "Lucky", backdrop: "Green", symbol: "Leaf" },
    stock: 1,
  },
  {
    id: 4,
    name: "Vice Cream #6561",
    price: 881,
    link: "https://funpay.com/lots/offer?id=0000004",
    category: "buy",
    emoji: "🍦",
    attrs: { collection: "Vice Cream", model: "Strawberry", backdrop: "Pink", symbol: "Swirl" },
    stock: 12,
  },
  {
    id: 5,
    name: "Diamond Ring #6686",
    price: 6428,
    link: "https://funpay.com/lots/offer?id=0000005",
    category: "buy",
    emoji: "💍",
    attrs: { collection: "Diamond Ring", model: "Gold", backdrop: "Velvet", symbol: "Crown" },
    badge: { text: "💎 Luxury", color: "#7c3aed" },
    stock: 2,
  },
  {
    id: 6,
    name: "Jingle Bells #93425",
    price: 1800,
    link: "https://funpay.com/lots/offer?id=0000006",
    category: "buy",
    emoji: "🔔",
    attrs: { collection: "Jingle Bells", model: "Silver", backdrop: "Snow", symbol: "Holly" },
    stock: 7,
  },
  // Пример аренды — чтобы вкладка не была пустой
  {
    id: 101,
    name: "Sky Stilettos #29237 (аренда 7 дней)",
    price: 450,
    link: "https://funpay.com/lots/offer?id=0000101",
    category: "rent",
    emoji: "👠",
    attrs: { collection: "Sky Stilettos", model: "Ruby", backdrop: "Onyx" },
  },
  {
    id: 102,
    name: "Light Sword #33290 (аренда 7 дней)",
    price: 250,
    link: "https://funpay.com/lots/offer?id=0000102",
    category: "rent",
    emoji: "⚔️",
    attrs: { collection: "Light Sword", model: "Neon" },
  },
  // Пример юзернейма
  {
    id: 201,
    name: "@coolname (аренда 30 дней)",
    price: 1200,
    link: "https://funpay.com/lots/offer?id=0000201",
    category: "usernames",
    emoji: "@",
    attrs: { collection: "Usernames" },
  },
  {
    id: 202,
    name: "@premium (продажа)",
    price: 15000,
    link: "https://funpay.com/lots/offer?id=0000202",
    category: "usernames-buy",
    emoji: "@",
    attrs: { collection: "Usernames" },
  },
];

// ─────────────────────────────────────────────────────────────
//  Хелперы
// ─────────────────────────────────────────────────────────────

export const fmtPrice = (n: number): string =>
  n.toLocaleString("ru-RU") + " ₽";

export const esc = (s: string): string =>
  s.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

export const getCategoryLabel = (cat: Category): string =>
  CATEGORIES.find(c => c.key === cat)?.label ?? "Каталог";
