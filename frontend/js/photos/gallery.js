// import { API_BASE } from "../config.js";

const API_BASE =
  location.hostname === "127.0.0.1" ? "http://127.0.0.1:3000" : "";

/* =========================
   DOM
========================= */
const list = document.getElementById("list");

const countText = document.querySelector(".pagination__count");
const pageInput = document.getElementById("currentPage");
// const pageTotalText = pageInput?.nextElementSibling;
const pageTotalText = document.querySelector(".pagination__page span");

const btnFirst = document.querySelector('[data-page="first"]');
const btnPrev = document.querySelector('[data-page="prev"]');
const btnNext = document.querySelector('[data-page="next"]');
const btnLast = document.querySelector('[data-page="last"]');
const itemsSelect = document.getElementById("itemsPerPage");
const closeBtn = document.querySelector(".viewer-close");

/* Viewer */
const viewerModal = document.getElementById("viewer-modal");
const viewerImg = document.getElementById("viewer-img");
const viewerVideo = document.getElementById("viewer-video");

/* =========================
   Estado
========================= */
let page = 1;
let pageSize = parseInt(itemsSelect.value, 10);
let totalPages = 1;
let allItems = []; // ✅ TODOS los recuerdos visibles

closeBtn?.addEventListener("click", closeViewer);

/* =========================
   Render
========================= */
function renderMemories(items) {
  list.innerHTML = "";

  items.forEach((m) => {
    const card = document.createElement("div");
    card.className = "memory-card";

    const isVideo = /\.(mp4|webm|mov)$/i.test(m.file_path);
    const el = document.createElement(isVideo ? "video" : "img");

    el.src = `${API_BASE}/${m.file_path}?v=${m.id}`;
    el.loading = "lazy";

    if (isVideo) {
      el.muted = true;
      el.playsInline = true;
    }

    card.addEventListener("dblclick", () => openViewer(m, isVideo));
    card.appendChild(el);
    list.appendChild(card);
  });
}

/* =========================
   Viewer
========================= */
function openViewer(m, isVideo) {
  viewerImg.style.display = "none";
  viewerVideo.style.display = "none";

  if (isVideo) {
    viewerVideo.src = `${API_BASE}/${m.file_path}`;
    viewerVideo.currentTime = 0;
    viewerVideo.style.display = "block";
    viewerVideo.play();
  } else {
    viewerImg.src = `${API_BASE}/${m.file_path}`;
    viewerImg.style.display = "block";
  }

  viewerModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeViewer() {
  viewerModal.classList.add("hidden");
  viewerVideo.pause();
  viewerVideo.src = "";
  viewerImg.src = "";
  document.body.style.overflow = "";
}

viewerModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) {
    closeViewer();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !viewerModal.classList.contains("hidden")) {
    closeViewer();
  }
});

/* =========================
   Paginación FRONTEND
========================= */
function updatePage(newPage) {
  page = Math.max(newPage, 1);

  totalPages = Math.max(1, Math.ceil(allItems.length / pageSize));

  if (page > totalPages) page = totalPages;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = allItems.slice(start, end);

  renderMemories(pageItems);

  countText.innerHTML = `Mostrando <strong>${start + 1}–${Math.min(end, allItems.length)}</strong> de <strong>${allItems.length}</strong> recuerdos`;

  // pageInput.value = page;
  // pageTotalText.textContent = `de ${totalPages}`;

  pageInput.value = page;
  if (pageTotalText) {
    pageTotalText.textContent = `de ${totalPages}`;
  }

  btnFirst.disabled = page === 1;
  btnPrev.disabled = page === 1;
  btnNext.disabled = page === totalPages;
  btnLast.disabled = page === totalPages;
}

/* =========================
   Cargar datos
========================= */

async function loadGallery() {
  const res = await fetch(`${API_BASE}/api/memories/list`);

  if (!res.ok) {
    throw new Error("Error HTTP " + res.status);
  }

  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    const text = await res.text();
    console.error("RESPUESTA NO JSON:", text);
    return;
  }

  const json = await res.json();
  allItems = json.data ?? [];
  updatePage(1);
}

/* =========================
   Eventos
========================= */
btnFirst.onclick = () => updatePage(1);
btnPrev.onclick = () => updatePage(page - 1);
btnNext.onclick = () => updatePage(page + 1);
btnLast.onclick = () => updatePage(totalPages);

pageInput.onchange = () => {
  const p = parseInt(pageInput.value, 10);
  if (!Number.isNaN(p)) updatePage(p);
};

itemsSelect.onchange = () => {
  pageSize = parseInt(itemsSelect.value, 10);
  updatePage(1);
};

/* =========================
   Init
========================= */
loadGallery();
