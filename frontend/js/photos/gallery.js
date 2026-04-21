const API_BASE =
  location.hostname === "127.0.0.1" ? "http://127.0.0.1:3000" : "";

/* =========================
   DOM
========================= */
const list = document.getElementById("list");

const countText = document.querySelector(".pagination__count");
const pageInput = document.getElementById("currentPage");
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
   Estado (SERVER SIDE)
========================= */
let page = 1;
let pageSize = parseInt(itemsSelect.value, 10);
let total = 0;
let totalPages = 1;

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

/* =========================
   Cargar datos (BACKEND)
========================= */
async function loadGallery() {
  const res = await fetch(
    `${API_BASE}/api/memories/list?page=${page}&pageSize=${pageSize}`,
  );

  if (!res.ok) throw new Error("Error HTTP " + res.status);

  const json = await res.json();

  const items = json.data ?? [];
  total = json.total ?? 0;

  totalPages = Math.max(1, Math.ceil(total / pageSize));

  renderMemories(items);
  updatePaginationUI();
}

/* =========================
   Paginación UI
========================= */
function updatePaginationUI() {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  countText.innerHTML = `Mostrando <strong>${from}–${to}</strong> de <strong>${total}</strong> recuerdos`;

  pageInput.value = page;
  pageTotalText.textContent = `de ${totalPages}`;

  btnFirst.disabled = page === 1;
  btnPrev.disabled = page === 1;
  btnNext.disabled = page === totalPages;
  btnLast.disabled = page === totalPages;
}

/* =========================
   Eventos
========================= */
btnFirst.onclick = () => {
  page = 1;
  loadGallery();
};

btnPrev.onclick = () => {
  if (page > 1) {
    page--;
    loadGallery();
  }
};

btnNext.onclick = () => {
  if (page < totalPages) {
    page++;
    loadGallery();
  }
};

btnLast.onclick = () => {
  page = totalPages;
  loadGallery();
};

pageInput.onchange = () => {
  const p = parseInt(pageInput.value, 10);
  if (!Number.isNaN(p) && p >= 1 && p <= totalPages) {
    page = p;
    loadGallery();
  }
};

itemsSelect.onchange = () => {
  pageSize = parseInt(itemsSelect.value, 10);
  page = 1;
  loadGallery();
};

/* =========================
   Init
========================= */
loadGallery();