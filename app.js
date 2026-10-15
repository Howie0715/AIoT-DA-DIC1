// ===== Data — edit these to personalize the page =====
const SKILLS = [
  { name: "Python", icon: "🐍", level: 80 },
  { name: "C / C++", icon: "⚙️", level: 65 },
  { name: "IoT & Sensors", icon: "📡", level: 70 },
  { name: "Data Analysis", icon: "📊", level: 70 },
  { name: "Machine Learning", icon: "🤖", level: 55 },
  { name: "Web Development", icon: "🌐", level: 60 },
];

const PROJECTS = [
  {
    name: "DIC1 Personal Page",
    status: "done",
    description: "This site: a responsive personal page with a live clock, editable profile, theme switcher and an animated IoT-network background.",
    tech: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    link: "https://github.com/Howie0715/AIoT-DA-DIC1",
  },
  {
    name: "Smart Environment Monitor",
    status: "planned",
    description: "Semester project: collect temperature & humidity from an ESP32 sensor node, store the data, and visualize trends with simple anomaly detection.",
    tech: ["ESP32", "MQTT", "Python", "Pandas", "Chart.js"],
    link: "https://github.com/Howie0715",
  },
];

const STORAGE_KEY = "dic1-personal-page";

// ===== Settings (localStorage) =====
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSettings(patch) {
  const next = { ...loadSettings(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — settings just won't persist */
  }
  return next;
}

let settings = loadSettings();

// ===== Toast =====
const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

// ===== Theme =====
const themeToggle = document.getElementById("themeToggle");
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}
applyTheme(settings.theme || "dark");
themeToggle.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  settings = saveSettings({ theme });
});

// ===== Profile (editable) =====
const fields = document.querySelectorAll("[data-field]");
const avatar = document.getElementById("avatar");
const editToggle = document.getElementById("editToggle");

function initialsAvatar(name) {
  const initials = name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3ef2c4"/><stop offset="1" stop-color="#5aa8ff"/></linearGradient></defs>
    <rect width="160" height="160" fill="#0d1424"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
      font-family="Space Grotesk, sans-serif" font-size="64" font-weight="700" fill="url(#g)">${initials}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function renderAvatar() {
  const name = document.querySelector('[data-field="name"]').textContent;
  avatar.src = settings.avatarUrl || initialsAvatar(name);
}

// Restore saved profile text
fields.forEach((el) => {
  const saved = settings.profile?.[el.dataset.field];
  if (saved) el.textContent = saved;
});
renderAvatar();

editToggle.addEventListener("click", () => {
  const editing = document.body.classList.toggle("editing");
  fields.forEach((el) => (el.contentEditable = editing));
  editToggle.textContent = editing ? "💾 Save Profile" : "✏️ Edit Profile";

  if (editing) {
    fields[0].focus();
    showToast("Click the text to edit it");
    return;
  }

  const profile = {};
  fields.forEach((el) => (profile[el.dataset.field] = el.textContent.trim()));
  const url = prompt("Avatar image URL (leave blank for initials):", settings.avatarUrl || "");
  settings = saveSettings({ profile, avatarUrl: url?.trim() || "" });
  renderAvatar();
  showToast("Profile saved ✓");
});

// ===== Skills =====
const skillsGrid = document.getElementById("skillsGrid");
skillsGrid.innerHTML = SKILLS.map(
  (s) => `
  <div class="card skill">
    <div class="skill-head"><span class="skill-name">${s.name}</span><span class="skill-icon">${s.icon}</span></div>
    <div class="bar"><span data-level="${s.level}"></span></div>
    <div class="skill-level">${s.level}%</div>
  </div>`
).join("");

// ===== Projects =====
const projectsGrid = document.getElementById("projectsGrid");
projectsGrid.innerHTML = PROJECTS.map(
  (p) => `
  <article class="card project">
    <span class="project-status ${p.status}">${p.status === "done" ? "● completed" : "◌ planned"}</span>
    <h3>${p.name}</h3>
    <p>${p.description}</p>
    <div class="tags">${p.tech.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    <a href="${p.link}" target="_blank" rel="noopener">View on GitHub →</a>
  </article>`
).join("");

// ===== Live Clock =====
const pad = (n) => String(n).padStart(2, "0");
const $ = (id) => document.getElementById(id);
const formatToggle = $("formatToggle");
let use24h = settings.use24h ?? true;

function greetingFor(hour) {
  if (hour < 5) return "🌙 Good Night";
  if (hour < 12) return "🌅 Good Morning";
  if (hour < 18) return "☀️ Good Afternoon";
  return "🌆 Good Evening";
}

function tick() {
  const now = new Date();
  const h = now.getHours();
  const displayHour = use24h ? h : h % 12 || 12;

  $("hh").textContent = pad(displayHour);
  $("mm").textContent = pad(now.getMinutes());
  $("ss").textContent = pad(now.getSeconds());
  $("ampm").textContent = use24h ? "" : h < 12 ? "AM" : "PM";
  $("dateDisplay").textContent = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  $("greeting").textContent = `${greetingFor(h)}, I'm`;
}

function updateFormatButton() {
  formatToggle.textContent = use24h ? "Switch to 12H" : "Switch to 24H";
}

formatToggle.addEventListener("click", () => {
  use24h = !use24h;
  settings = saveSettings({ use24h });
  updateFormatButton();
  tick();
});

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const offset = -new Date().getTimezoneOffset() / 60;
$("tzDisplay").textContent = `${tz} (UTC${offset >= 0 ? "+" : ""}${offset})`;

$("copyBtn").addEventListener("click", async () => {
  const stamp = new Date().toISOString();
  try {
    await navigator.clipboard.writeText(stamp);
    showToast(`Copied ${stamp}`);
  } catch {
    showToast("Clipboard unavailable");
  }
});

updateFormatButton();
tick();
setInterval(tick, 1000);
$("year").textContent = new Date().getFullYear();

// ===== Scroll reveal =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll(".bar > span").forEach((bar) => {
        bar.style.width = bar.dataset.level + "%";
      });
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== IoT network particle background =====
const canvas = $("network");
const ctx = canvas.getContext("2d");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let nodes = [];
const mouse = { x: -9999, y: -9999 };

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const count = Math.min(90, Math.floor((innerWidth * innerHeight) / 16000));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
  }));
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const linkDist = 130;

  for (const n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > innerWidth) n.vx *= -1;
    if (n.y < 0 || n.y > innerHeight) n.vy *= -1;
  }

  ctx.strokeStyle = color;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < linkDist) {
        ctx.globalAlpha = (1 - d / linkDist) * 0.25;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
    const md = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
    if (md < 180) {
      ctx.globalAlpha = (1 - md / 180) * 0.5;
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
  }

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (!reduceMotion) requestAnimationFrame(draw);
}

addEventListener("resize", resize);
addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });
resize();
draw();
