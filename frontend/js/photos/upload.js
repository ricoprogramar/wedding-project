import { API_BASE } from "../config.js";

const modal = document.getElementById("upload-modal");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

const statusMsg = document.getElementById("upload-status");

const input = document.getElementById("files");
const btnSelect = document.getElementById("btnSelectFiles");
const btnUpload = document.getElementById("btnUpload");
const preview = document.getElementById("preview");
const backBtn = document.getElementById("back-home");

const MAX_FILES = 10;

/* =====================
   Habilitar / Deshabilitar
===================== */
function disableUpload(message) {
  btnUpload.disabled = true;
  btnSelect.disabled = true;
  btnUpload.classList.add("btn-disabled");
  btnSelect.classList.add("btn-disabled");
  statusMsg.textContent = message;
}

function enableUpload() {
  btnUpload.disabled = false;
  btnSelect.disabled = false;
  btnUpload.classList.remove("btn-disabled");
  btnSelect.classList.remove("btn-disabled");
  statusMsg.textContent = "";
}

/* =====================
   Modal
===================== */
function showModal(message) {
  modalMessage.textContent = message;
  modal.classList.remove("hidden");
}

modalClose?.addEventListener("click", () => {
  modal.classList.add("hidden");
});

/* =====================
   Token
===================== */
function getToken() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("token") || sessionStorage.getItem("invitation_token") || ""
  );
}

/* =====================
   Selector
===================== */
btnSelect?.addEventListener("click", () => {
  if (!btnSelect.disabled) input?.click();
});

/* =====================
   Preview
===================== */
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

input?.addEventListener("change", () => {
  const filesArr = Array.from(input.files);
  if (filesArr.length > MAX_FILES) {
    alert(`Máximo ${MAX_FILES} archivos. Se usarán los primeros.`);
  }
  const kept = filesArr.slice(0, MAX_FILES);
  const dt = new DataTransfer();
  kept.forEach((f) => dt.items.add(f));
  input.files = dt.files;
  renderPreview(input.files);
});

/* =====================
   Subir archivos
===================== */
btnUpload?.addEventListener("click", async () => {
  if (btnUpload.disabled) return;

  const files = input.files;
  if (!files || files.length === 0) {
    showModal("Selecciona al menos un archivo.");
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

    const text = await res.text();

    if (!res.ok) {
      let message = "Error al subir archivos";
      try {
        const err = JSON.parse(text);
        message = err.error || message;
      } catch {}

      if (res.status === 403) {
        showModal(message);
        return;
      }

      showModal(message);
      return;
    }

    const data = JSON.parse(text);
    showModal(`✅ ${data.count} archivos subidos correctamente`);
    input.value = "";
    preview.innerHTML = "";
  } catch {
    showModal("No se pudo subir los archivos. Intenta nuevamente.");
  }
});

/* =====================
   Volver
===================== */
backBtn?.addEventListener("click", () => {
  window.location.href = "/frontend/index.html#photos";
});

/* =====================
   Verificar disponibilidad
===================== */
(async function checkUploadAvailability() {
  try {
    const res = await fetch(`${API_BASE}/api/memories/config`);
    const cfg = await res.json();

    const now = new Date();
    const startAt = cfg.start_at ? new Date(cfg.start_at) : null;
    const endAt = cfg.end_at ? new Date(cfg.end_at) : null;

    if (!cfg.enabled) {
      disableUpload("Las subidas de recuerdos están desactivadas.");
      return;
    }

    if (startAt && now < startAt) {
      disableUpload(
        `Podrás subir archivos a partir del ${startAt.toLocaleString()}`,
      );
      return;
    }

    if (endAt && now > endAt) {
      disableUpload("El período para subir recuerdos ya finalizó.");
      return;
    }

    enableUpload();
  } catch {
    disableUpload("No se pudo verificar el estado de las subidas.");
  }
})();
