const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch(request) {
    // Массив с вашими товарами (NFT/Подарками). Сюда вы будете добавлять свои лоты.
    const items = [
      { id: 1, name: "Sky Stilettos #29237", price: "4 031 ₽", img: "👠", link: "https://funpay.com" },
      { id: 2, name: "Light Sword #33290", price: "2 078 ₽", img: "⚔️", link: "https://funpay.com" },
      { id: 3, name: "Clover Pin #233623", price: "1 428 ₽", img: "🍀", link: "https://funpay.com" },
      { id: 4, name: "Vice Cream #6561", price: "881 ₽", img: "🍦", link: "https://funpay.com" },
      { id: 5, name: "Diamond Ring #6686", price: "6 428 ₽", img: "💍", link: "https://funpay.com" },
      { id: 6, name: "Jingle Bells #93425", price: "1 800 ₽", img: "🔔", link: "https://funpay.com" },
    ];

    // Генерируем HTML-код карточек из массива данных
    const cardsHtml = items.map(item => `
      <div class="card">
        <div class="card-image">${item.img}</div>
        <div class="card-info">
          <div class="card-title">${item.name}</div>
          <div class="card-footer">
            <span class="card-price">${item.price}</span>
            <a href="${item.link}" target="_blank" class="buy-btn">Купить</a>
          </div>
        </div>
      </div>
    `).join('');

    return new Response(
      `<!DOCTYPE html>
      <html lang="ru">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Каталог NFT Подарков</title>
          <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #0e1118; color: #ffffff; padding: 20px; }
              
              /* Шапка и категории */
              header { max-width: 1200px; margin: 0 auto 30px auto; display: flex; gap: 15px; flex-wrap: wrap; }
              .nav-btn { background: #1f2633; color: #fff; padding: 10px 20px; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 500; transition: 0.2s; }
              .nav-btn.active { background: #00cc66; }
              .nav-btn:hover { opacity: 0.9; }

              /* Сетка товаров */
              .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
              
              /* Карточка товара */
              .card { background-color: #171c26; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid #232b3d; transition: transform 0.2s; }
              .card:hover { transform: translateY(-5px); }
              .card-image { height: 180px; display: flex; justify-content: center; align-items: center; font-size: 64px; background: radial-gradient(circle, #252f44 0%, #171c26 100%); }
              .card-info { padding: 15px; display: flex; flex-direction: column; gap: 12px; }
              .card-title { font-size: 14px; font-weight: 600; color: #f3f4f6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
              
              /* Цена и Кнопка */
              .card-footer { display: flex; justify-content: space-between; align-items: center; background: #121620; margin: 0 -15px -15px -15px; padding: 12px 15px; border-top: 1px solid #232b3d; }
              .card-price { font-weight: bold; color: #00cc66; font-size: 15px; }
              .buy-btn { background-color: #0099ff; color: white; text-decoration: none; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; transition: 0.2s; }
              .buy-btn:hover { background-color: #0077cc; }
          </style>
      </head>
      <body>
          <header>
              <a href="#" class="nav-btn active">Купить подарки</a>
              <a href="#" class="nav-btn">Аренда подарков</a>
              <a href="#" class="nav-btn">Купить юзернеймы</a>
          </header>

          <main class="grid">
              ${cardsHtml}
          </main>
      </body>
      </html>`,
      {
          headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  },
});

console.log(`Витрина запущена на порту ${server.port}`);
