export type Category = "buy" | "rent" | "usernames" | "usernames-buy";

export type Item = {
  id: number;
  name: string;          // "Sky Stilettos #29237"
  price: number;         // в рублях, число
  link: string;
  category: Category;
  attrs: {
    collection?: string; // "Sky Stilettos"
    model?: string;      // "Ruby"
    backdrop?: string;   // "Onyx"
    symbol?: string;     // "Star"
  };
  tgs?: string;          // путь к .tgs-анимации (или эмодзи для MVP)
  emoji?: string;        // fallback, пока нет tgs
};

export const ITEMS: Item[] = [
  {
    id: 1,
    name: "Sky Stilettos #29237",
    price: 4031,
    link: "https://funpay.com/lots/...",
    category: "buy",
    emoji: "👠",
    attrs: { collection: "Sky Stilettos", model: "Ruby", backdrop: "Onyx", symbol: "Star" },
  },
  // ...
];

export const MARKUP = 45;        // % наценки
export const MIN_RUB = 7;
export const MAX_RUB = 50000;
