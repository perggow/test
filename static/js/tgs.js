/* ─────────────────────────────────────────────────────────────
   Плеер .tgs-анимаций Telegram (gzipped Lottie JSON).
   Требует подключённые lottie-web и pako (см. render.ts).
   ───────────────────────────────────────────────────────────── */

(() => {
  if (typeof lottie === "undefined" || typeof pako === "undefined") {
    console.warn("[tgs] lottie или pako не загружены");
    return;
  }

  const cache = new Map();   // url -> animationData
  const instances = new WeakMap(); // el -> animation instance

  async function fetchTgs(url) {
    if (cache.has(url)) return cache.get(url);

    const buf = await fetch(url).then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.arrayBuffer();
    });

    // .tgs — это gzip от Lottie JSON
    const jsonText = pako.ungzip(new Uint8Array(buf), { to: "string" });
    const data = JSON.parse(jsonText);

    cache.set(url, data);
    return data;
  }

  async function mount(el, url) {
    if (!el || el.dataset.tgsMounted === "1") return;
    el.dataset.tgsMounted = "1";
    try {
      const animationData = await fetchTgs(url);
      const anim = lottie.loadAnimation({
        container: el,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData,
      });
      instances.set(el, anim);
    } catch (e) {
      console.warn("[tgs] не удалось загрузить", url, e);
      el.textContent = "🎁"; // fallback
    }
  }

  function unmount(el) {
    const anim = instances.get(el);
    if (anim) {
      anim.destroy();
      instances.delete(el);
    }
    delete el.dataset.tgsMounted;
  }

  window.TGS = {
    mount,
    unmount,
    mountAll(root = document) {
      root.querySelectorAll(".tgs[data-tgs]").forEach(el => {
        mount(el, el.dataset.tgs);
      });
    },
  };

  // Автомонтирование при загрузке
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.TGS.mountAll());
  } else {
    window.TGS.mountAll();
  }
})();
