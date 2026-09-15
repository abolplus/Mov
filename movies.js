if (!Auth.guard()) {
  // دسترسی منقضی شده است.
} else {
  const container = document.getElementById("movieContainer");

  // همه فیلم‌های اضافه‌شده توسط مدیر نمایش داده می‌شوند.
  const saved = localStorage.getItem("filmhouse_movies");
  const movieList = saved ? JSON.parse(saved) : (window.MovieData || []);

  if (!movieList.length) {
    container.innerHTML = `<section class="card empty"><h2>هنوز فیلمی اضافه نشده</h2><p class="muted">مدیر سایت هنوز فیلمی اضافه نکرده است.</p></section>`;
  } else {
    container.innerHTML = movieList.map(movie => `
      <section class="card movie-card">
        <div class="video-wrap" oncontextmenu="return false;">
          <video controls playsinline preload="metadata" controlsList="nodownload noplaybackrate" disablePictureInPicture oncontextmenu="return false;">
            <source src="${escapeHtml(movie.videoUrl)}">
            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
          </video>
        </div>
        <h1>${escapeHtml(movie.title)}</h1>
        <div class="cyan-line"></div>
        <p>${escapeHtml(movie.description || "").replace(/\n/g,"<br>")}</p>
      </section>`).join("");
  }

  const timer = document.getElementById("timer");
  const tick = () => {
    if (!Auth.active()) { location.href="index.html"; return; }
    timer.textContent = Auth.format(Auth.remaining());
  };
  tick();
  setInterval(tick,1000);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }
}
