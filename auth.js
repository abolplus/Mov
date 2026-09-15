const Auth = (() => {
  const CODE_KEY = "filmhouse_codes";
  const SESSION_KEY = "filmhouse_session";
  const ADMIN_KEY = "filmhouse_admin";
  const ADMIN_PASSWORD = "abolkos";
  const HOUR = 60 * 60 * 1000;

  const loadCodes = () => JSON.parse(localStorage.getItem(CODE_KEY) || "[]");
  const saveCodes = codes => localStorage.setItem(CODE_KEY, JSON.stringify(codes));

  function seed() {
    if (!localStorage.getItem(CODE_KEY)) {
      // چند کد نمونه برای تست. از پنل می‌توانید کدهای جدید بسازید.
      const now = Date.now();
      saveCodes([
        { code: "ABCD123456", used: false, createdAt: now }
      ]);
    }
  }

  function login(code) {
    seed();
    code = code.trim().toUpperCase();
    const codes = loadCodes();
    const item = codes.find(x => x.code === code);

    if (!item) return {ok:false, message:"کد اشتباه است."};
    if (item.used) return {ok:false, message:"این کد قبلاً استفاده شده است."};

    // تایمر دقیقاً در اولین ورود شروع می‌شود.
    const startedAt = Date.now();
    item.used = true;
    item.usedAt = startedAt;
    saveCodes(codes);

    localStorage.setItem(SESSION_KEY, JSON.stringify({
      startedAt,
      expiresAt: startedAt + HOUR
    }));

    return {ok:true};
  }

  function session() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  }

  function active() {
    const s = session();
    return !!(s && Date.now() < s.expiresAt);
  }

  function remaining() {
    const s = session();
    if (!s) return 0;
    return Math.max(0, s.expiresAt - Date.now());
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function format(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2,"0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2,"0");
    const s = String(total % 60).padStart(2,"0");
    return `${h}:${m}:${s}`;
  }

  function guard() {
    if (!active()) {
      logout();
      location.href = "index.html";
      return false;
    }
    return true;
  }

  function renderProfile() {
    const status = document.getElementById("profileStatus");
    const timer = document.getElementById("profileTimer");
    const update = () => {
      if (!active()) {
        status.textContent = "اشتراک فعال نیست";
        status.className = "status";
        timer.textContent = "--:--:--";
        return;
      }
      status.textContent = "اشتراک فعال است";
      status.className = "status success";
      timer.textContent = format(remaining());
    };
    update();
    setInterval(update,1000);
  }

  seed();

  return {login, active, remaining, format, guard, logout, renderProfile, loadCodes, saveCodes, ADMIN_KEY, ADMIN_PASSWORD};
})();

document.getElementById("loginForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const result = Auth.login(document.getElementById("accessCode").value);
  const box = document.getElementById("loginMessage");
  box.className = "message " + (result.ok ? "success" : "error");
  box.textContent = result.ok ? "ورود موفق بود." : result.message;
  if (result.ok) setTimeout(() => location.href="home.html", 250);
});
