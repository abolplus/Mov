const Admin = (() => {
  const MOVIES_KEY = "filmhouse_movies";
  const adminLogin = document.getElementById("adminLogin");
  const adminPanel = document.getElementById("adminPanel");

  function movies() {
    const saved = localStorage.getItem(MOVIES_KEY);
    if (saved) return JSON.parse(saved);
    const initial = window.MovieData || [];
    saveMovies(initial);
    return initial;
  }
  function saveMovies(list) {
    localStorage.setItem(MOVIES_KEY, JSON.stringify(list));
  }

  function showPanel() {
    adminLogin.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    renderCodes();
    renderMovies();
  }

  function renderCodes() {
    const list = document.getElementById("codesList");
    const codes = Auth.loadCodes().filter(c => !c.used && !c.revoked);
    if (!codes.length) {
      list.innerHTML = `<div class="empty-row">کد استفاده‌نشده‌ای وجود ندارد.</div>`;
      return;
    }

    list.innerHTML = codes.slice().reverse().map(c => `
      <div class="list-row code-row">
        <div><strong>${escapeHtml(c.code)}</strong><small>قابل استفاده</small></div>
        <div class="code-actions">
          <button class="mini" data-copy-code="${escapeHtml(c.code)}">کپی</button>
          <button class="mini danger" data-revoke="${escapeHtml(c.code)}">باطل کردن</button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll("[data-copy-code]").forEach(btn => btn.onclick = async () => {
      const code = btn.dataset.copyCode;
      try {
        await navigator.clipboard.writeText(code);
        const old = btn.textContent;
        btn.textContent = "کپی شد ✓";
        setTimeout(() => btn.textContent = old, 1200);
      } catch (err) {
        const input = document.createElement("textarea");
        input.value = code;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
        const old = btn.textContent;
        btn.textContent = "کپی شد ✓";
        setTimeout(() => btn.textContent = old, 1200);
      }
    });

    list.querySelectorAll("[data-revoke]").forEach(btn => btn.onclick = () => {
      const code = btn.dataset.revoke;
      const codes = Auth.loadCodes();
      const item = codes.find(x => x.code === code);
      if (item) {
        item.used = true;
        item.revoked = true;
        Auth.saveCodes(codes);
        renderCodes();
      }
    });
  }

  function renderMovies() {
    const list = document.getElementById("moviesList");
    const data = movies();

    list.innerHTML = data.map((m,i) => {
      return `<div class="list-row">
        <div>
          <strong>${escapeHtml(m.title)}</strong>
          <small><a href="${escapeHtml(m.videoUrl)}" target="_blank" rel="noopener">${escapeHtml(m.videoUrl)}</a></small>
        </div>
        <button class="mini danger" data-delete="${i}">حذف</button>
      </div>`;
    }).join("") || `<div class="empty-row">فیلمی وجود ندارد.</div>`;

    list.querySelectorAll("[data-delete]").forEach(btn => btn.onclick = () => {
      const data = movies();
      const index = Number(btn.dataset.delete);
      if (!data[index]) return;
      data.splice(index, 1);
      saveMovies(data);
      renderMovies();
    });
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }

  document.getElementById("adminLoginForm").addEventListener("submit", e => {
    e.preventDefault();
    const password = document.getElementById("adminPassword").value;
    const msg = document.getElementById("adminMessage");
    if (password === Auth.ADMIN_PASSWORD) {
      sessionStorage.setItem(Auth.ADMIN_KEY, "1");
      msg.className = "message success";
      msg.textContent = "ورود موفق بود.";
      showPanel();
    } else {
      msg.className = "message error";
      msg.textContent = "رمز عبور اشتباه است.";
      document.getElementById("adminPassword").value = "";
    }
  });

  document.getElementById("createCode").addEventListener("click", () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for(let i=0;i<10;i++) code += chars[Math.floor(Math.random()*chars.length)];
    const codes = Auth.loadCodes();
    codes.push({code,used:false,createdAt:Date.now()});
    Auth.saveCodes(codes);
    const box = document.getElementById("newCode");
    box.textContent = code;
    box.classList.remove("hidden");
    renderCodes();
  });

  document.getElementById("movieForm").addEventListener("submit", e => {
    e.preventDefault();
    const data = movies();
    data.push({
      id: Date.now(),
      title: document.getElementById("movieTitle").value.trim(),
      description: document.getElementById("movieDescription").value.trim(),
      videoUrl: document.getElementById("movieUrl").value.trim()
    });
    saveMovies(data);
    e.target.reset();
    renderMovies();
    alert("فیلم اضافه شد.");
  });

  document.getElementById("logoutAdmin").onclick = () => {
    sessionStorage.removeItem(Auth.ADMIN_KEY);
    location.reload();
  };

  if (sessionStorage.getItem(Auth.ADMIN_KEY) === "1") showPanel();
})();
