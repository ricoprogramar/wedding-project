import { API_BASE } from "../config.js";
// frontend/photos/upload.js
// Subida múltiple con preview + UX correcto (máx 10)

const input = document.getElementById("files");
const btnSelect = document.getElementById("btnSelectFiles");
const btnUpload = document.getElementById("btnUpload");
const preview = document.getElementById("preview");
const backBtn = document.getElementById("back-home");

const MAX_FILES = 10;

// FIX: asegurar token global (URL o sessionStorage)
function getToken() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("token") || sessionStorage.getItem("invitation_token") || ""
  );
}

// Abrir selector
btnSelect?.addEventListener("click", () => input?.click());

// Render preview
function renderPreview(files) {
  preview.innerHTML = "";

  [...files].forEach((file) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    const el = document.createElement(isVideo ? "video" : "img");
    el.src = url;
    if (isVideo) el.controls = true;
    preview.appendChild(el);
  });
}

// ✅ UX correcto: recortar a 10 SIN resetear todo
input?.addEventListener("change", () => {
  const filesArr = Array.from(input.files);

  if (filesArr.length > MAX_FILES) {
    alert(`Máximo ${MAX_FILES} archivos. Se usarán los primeros ${MAX_FILES}.`);
  }

  const kept = filesArr.slice(0, MAX_FILES);
  const dt = new DataTransfer();
  kept.forEach((f) => dt.items.add(f));
  input.files = dt.files;

  renderPreview(input.files);
});

// Subir real (robusto)
btnUpload?.addEventListener("click", async () => {
  const files = input.files;
  if (!files || files.length === 0) {
    alert("Selecciona al menos un archivo");
    return;
  }

  const form = new FormData();
  [...files].forEach((f) => form.append("files", f));
  form.append("token", getToken());

  try {
    const res = await fetch(`${API_BASE}/api/memories/upload`, {
      method: "POST",
      body: form,
    });

    const text = await res.text(); // ✅ lee texto primero
    if (!res.ok) {
      // intenta JSON; si falla, muestra texto
      try {
        const err = JSON.parse(text);
        throw new Error(err.error || "Error al subir");
      } catch {
        throw new Error(text || "Error al subir");
      }
    }

    const data = JSON.parse(text); // ✅ parsea solo si OK
    alert(`✅ ${data.count} archivos subidos`);
    input.value = "";
    preview.innerHTML = "";
  } catch (e) {
    alert(e.message || "Error al subir");
  }
});

// Volver a la sección Fotos
backBtn?.addEventListener("click", () => {
  window.location.href = "/frontend/index.html#photos";
});

const {
  rows: [cfg],
} = await pool.query(
  "SELECT enabled, start_at, end_at FROM memories_config WHERE id=1",
);
const now = new Date();
if (!cfg.enabled) return res.status(403).json({ error: "Subidas cerradas" });
if (cfg.start_at && now < cfg.start_at)
  return res.status(403).json({ error: "Aún no inicia" });
if (cfg.end_at && now > cfg.end_at)
  return res.status(403).json({ error: "Subidas finalizadas" });
