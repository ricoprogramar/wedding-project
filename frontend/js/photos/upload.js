import { API_BASE } from "../config.js";

const modal = document.getElementById("upload-modal");
const modalMessage = document.getElementById("modal-message");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");

const statusMsg = document.getElementById("upload-status");

const input = document.getElementById("files");
const btnSelect = document.getElementById("btnSelectFiles");
const btnUpload = document.getElementById("btnUpload");
const preview = document.getElementById("preview");
const backBtn = document.getElementById("back-home");

const MAX_FILES = 10;
const MAX_PHOTO_MB = 10;
const MAX_VIDEO_MB = 100;

let modalTimer = null;

/* =====================
   MODAL
===================== */
function showModal(message, autoCloseMs = 6000, title = "Aviso") {
  modalTitle.textContent = title;
  modalMessage.textContent = message;

  modal.classList.remove("hidden");
  modal.style.display = "flex";
  modal.style.opacity = "1";
  modal.style.visibility = "visible";

  if (modalTimer) clearTimeout(modalTimer);

  modalTimer = setTimeout(() => {
    closeModal();
  }, autoCloseMs);
}

function closeModal() {
  if (modalTimer) clearTimeout(modalTimer);
  modal.classList.add("hidden");
  modal.style.display = "";
  modal.style.opacity = "";
  modal.style.visibility = "";
}

modalClose?.addEventListener("click", closeModal);

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

/* =====================
   Validación
===================== */
function validateFiles(files) {
  for (const file of files) {
    const sizeMB = file.size / (1024 * 1024);

    if (file.type.startsWith("image/") && sizeMB > MAX_PHOTO_MB) {
      showModal(
        `La foto "${file.name}" pesa ${sizeMB.toFixed(1)}MB. Máximo ${MAX_PHOTO_MB}MB.`,
        8000,
        "Archivo muy grande",
      );
      return false;
    }

    if (file.type.startsWith("video/") && sizeMB > MAX_VIDEO_MB) {
      showModal(
        `El video "${file.name}" pesa ${sizeMB.toFixed(1)}MB. Máximo ${MAX_VIDEO_MB}MB. Reduce la duración o calidad.`,
        10000,
        "Archivo muy grande",
      );
      return false;
    }
  }
  return true;
}

input?.addEventListener("change", () => {
  const filesArr = Array.from(input.files);
  const kept = filesArr.slice(0, MAX_FILES);

  if (!validateFiles(kept)) {
    input.value = "";
    preview.innerHTML = "";
    return;
  }

  const dt = new DataTransfer();
  kept.forEach((f) => dt.items.add(f));
  input.files = dt.files;

  renderPreview(input.files);
});

/* =====================
   Subir archivos
===================== */
btnUpload?.addEventListener("click", async (e) => {
  e.preventDefault();

  const files = input.files;
  if (!files || files.length === 0) {
    showModal("Selecciona al menos un archivo.", 6000, "Aviso");
    return;
  }

  if (!validateFiles(files)) return;

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
      let message = "No se pudieron subir los archivos.";
      try {
        const err = JSON.parse(text);
        message = err.error || message;
      } catch {}
      showModal(message, 8000, "Error");
      return;
    }

    const data = JSON.parse(text);

    showModal(
      `${data.count} archivo(s) subidos correctamente. ¡Ya puedes verlos en la galería!`,
      3000,
      "¡Listo!",
    );

    input.value = "";
    preview.innerHTML = "";
  } catch {
    showModal("Error de conexión. Intenta nuevamente.", 8000, "Error");
  }
});

/* =====================
   Volver
===================== */
backBtn?.addEventListener("click", () => {
  window.location.href = "/frontend/index.html#photos";
});
