const server = Bun.serve({
  // Railway автоматически передает нужный порт в переменную PORT
  port: process.env.PORT || 3000, 
  fetch(request) {
    // Сервер будет отдавать HTML-страницу с текстом Hello World
    return new Response(
      `<!DOCTYPE html>
      <html lang="ru">
      <head>
          <meta charset="UTF-8">
          <title>Hello World</title>
          <style>
              body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
              h1 { color: #1890ff; font-size: 3rem; }
          </style>
      </head>
      <body>
          <h1>Hello World!</h1>
      </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  },
});

console.log(`Сервер успешно запущен на порту ${server.port}`);
