// Shared auth across 3 pages. Demo storage only (localStorage) — use a real backend in production.
const DB_KEY = "ra_users", SESSION_KEY = "ra_session", DRAFT_KEY = "ra_draft";
const load = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const emailOk = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const wait = ms => new Promise(r => setTimeout(r, ms));
const page = document.body.dataset.page;

const toastEl = document.getElementById("toast");
let toastT;
function toast(msg, kind = "") {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.className = "toast " + kind;
  toastEl.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => (toastEl.hidden = true), 3200);
}

function setErr(form, name, msg) {
  const wrap = form.querySelector(`[data-field="${name}"]`);
  if (!wrap) return !msg;
  const small = wrap.querySelector(".msg");
  const bad = !!msg;
  wrap.classList.toggle("invalid", bad);
  small.hidden = !bad;
  small.textContent = msg || "";
  if (bad) {
    wrap.classList.remove("shake"); void wrap.offsetWidth; wrap.classList.add("shake");
    wrap.querySelector("input,select")?.focus({ preventScroll: false });
  }
  return !bad;
}
const clearErrs = f => f.querySelectorAll(".field").forEach(w => { w.classList.remove("invalid"); w.querySelector(".msg").hidden = true; });
function setLoading(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  btn.querySelector(".spinner").hidden = !on;
  btn.querySelector(".label").style.opacity = on ? ".6" : "1";
}
function showWelcome(suffix, name, email, profile) {
  const sec = document.getElementById("welcome" + suffix);
  const form = suffix === "1" ? document.getElementById("page1") : document.getElementById("form3");
  if (!sec) return;
  if (form) form.hidden = true;
  sec.hidden = false;
  document.getElementById("doneName" + suffix).textContent = name ? `, ${name.split(" ")[0]}` : "";
  document.getElementById("doneSub" + suffix).textContent = `Signed in as ${email}.`;
  const dl = document.getElementById("summary" + suffix);
  if (dl) dl.innerHTML = Object.entries(profile || {}).filter(([, v]) => v)
    .map(([k, v]) => `<dt>${k[0].toUpperCase() + k.slice(1)}</dt><dd>${v}</dd>`).join("");
}
function wireLogout(id) {
  document.getElementById(id)?.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(DRAFT_KEY);
    location.href = "index.html";
  });
}
function wireStart(id) {
  document.getElementById(id)?.addEventListener("click", () => toast("Dashboard coming next — auth is wired and ready.", "ok"));
}

// ---- Page 1: Name + Email only ----
if (page === "1") {
  const form = document.getElementById("form1");
  form.name.value = load(DRAFT_KEY, {}).name || "";
  form.email.value = load(DRAFT_KEY, {}).email || "";

  const valid = () => {
    clearErrs(form);
    let ok = true;
    if (form.name.value.trim().length < 2) { setErr(form, "name", "Enter your full name."); ok = false; }
    if (!emailOk(form.email.value.trim())) { setErr(form, "email", "Enter a valid email address."); ok = false; }
    return ok;
  };

  // Log in: must match a stored account, then welcome on this page
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!valid()) return;
    const btn = document.getElementById("loginBtn");
    setLoading(btn, true); await wait(600); setLoading(btn, false);
    const users = load(DB_KEY, {});
    const email = form.email.value.trim().toLowerCase();
    const u = users[email];
    if (!u || u.name.toLowerCase() !== form.name.value.trim().toLowerCase()) {
      setErr(form, "email", "No account found for this name + email. Hit Sign Up instead.");
      toast("No account found — sign up to create one.", "bad");
      return;
    }
    save(SESSION_KEY, { email });
    toast(`Welcome back, ${u.name.split(" ")[0]}.`, "ok");
    showWelcome("1", u.name, email, u.profile || {});
  });

  // Sign Up: save draft, go to page 2
  document.getElementById("signupBtn").addEventListener("click", async e => {
    if (!valid()) return;
    const btn = e.currentTarget;
    const users = load(DB_KEY, {});
    if (users[form.email.value.trim().toLowerCase()]) {
      setErr(form, "email", "Account already exists. Hit Log in instead.");
      toast("Email already registered — please log in.", "bad");
      return;
    }
    setLoading(btn, true); await wait(400); setLoading(btn, false);
    save(DRAFT_KEY, { name: form.name.value.trim(), email: form.email.value.trim() });
    location.href = "step2.html";
  });

  // returning session with full profile -> show welcome
  const s = load(SESSION_KEY, null), users = load(DB_KEY, {});
  if (s?.email && users[s.email]) showWelcome("1", users[s.email].name, s.email, users[s.email].profile || {});
  wireLogout("logoutBtn1"); wireStart("startBtn1");
}

// ---- Page 2: Name, Email, Number, Gender ----
if (page === "2") {
  const form = document.getElementById("form2");
  const draft = load(DRAFT_KEY, {});
  if (!draft.name || !draft.email) { location.href = "index.html"; }
  form.name.value = draft.name || "";
  form.email.value = draft.email || "";
  form.phone.value = draft.phone || "";
  form.gender.value = draft.gender || "";

  ["name", "email", "phone", "gender"].forEach(n => {
    form[n]?.addEventListener("input", () => {
      const d = load(DRAFT_KEY, {});
      d[n] = form[n].value.trim();
      save(DRAFT_KEY, d);
    });
  });

  document.getElementById("to3").addEventListener("click", e => {
    e.preventDefault();
    clearErrs(form);
    let ok = true;
    if (form.name.value.trim().length < 2) { setErr(form, "name", "Enter your full name."); ok = false; }
    if (!emailOk(form.email.value.trim())) { setErr(form, "email", "Enter a valid email."); ok = false; }
    if (form.phone.value.trim().replace(/\D/g, "").length < 8) { setErr(form, "phone", "Enter a valid phone, e.g. +20 1X XXX XXXX."); ok = false; }
    if (!form.gender.value) { setErr(form, "gender", "Select a gender."); ok = false; }
    if (!ok) return;
    save(DRAFT_KEY, { name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(), gender: form.gender.value });
    location.href = "step3.html";
  });
}

// ---- Page 3: Educational System, Grade, School, City ----
if (page === "3") {
  const form = document.getElementById("form3");
  const draft = load(DRAFT_KEY, {});
  if (!draft.phone || !draft.gender) { location.href = "step2.html"; }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    clearErrs(form);
    let ok = true;
    if (!form.system.value) { setErr(form, "system", "Choose your educational system."); ok = false; }
    if (!form.grade.value) { setErr(form, "grade", "Choose your grade."); ok = false; }
    if (form.school.value.trim().length < 2) { setErr(form, "school", "Enter your school / university."); ok = false; }
    if (form.city.value.trim().length < 2) { setErr(form, "city", "Enter your governorate / city."); ok = false; }
    if (!ok) return;
    const btn = document.getElementById("finishBtn");
    setLoading(btn, true); await wait(800); setLoading(btn, false);
    const d = load(DRAFT_KEY, {});
    const users = load(DB_KEY, {});
    const email = d.email.toLowerCase();
    const profile = { phone: d.phone, gender: d.gender, system: form.system.value, grade: form.grade.value, school: form.school.value.trim(), city: form.city.value.trim() };
    users[email] = { name: d.name, profile };
    save(DB_KEY, users);
    save(SESSION_KEY, { email });
    save(DRAFT_KEY, { ...d, ...profile });
    toast("Account created successfully.", "ok");
    showWelcome("3", d.name, email, profile);
  });
  wireLogout("logoutBtn3"); wireStart("startBtn3");
}
