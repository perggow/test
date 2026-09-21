// Распаковка .tgs (gzip) → JSON → Lottie
async function loadTgs(url) {
  const buf = await fetch(url).then(r => r.arrayBuffer());
  const json = pako.ungzip(new Uint8Array(buf), { to: "string" });
  return JSON.parse(json);
}

window.renderTgs = async (el, url) => {
  const animData = await loadTgs(url);
  lottie.loadAnimation({
    container: el,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: animData,
  });
};

// Автоинициализация всех .tgs на странице
document.querySelectorAll(".tgs[data-tgs]").forEach(el => {
  window.renderTgs(el, el.dataset.tgs);
});
