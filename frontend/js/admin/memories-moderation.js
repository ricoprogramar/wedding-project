// src/js/memories/admin.js
import "./guard.js";
import { API_BASE } from "../config.js";

/* =========================
   DOM
========================= */
const list = document.getElementById("list");

const rowsSelect = document.getElementById("rowsPerPage");
const countText = document.querySelector(".pagination__count");
const pageInput = document.getElementById("currentPage");
const pageTotalText = pageInput ? pageInput.nextElementSibling : null;

const btnFirst = document.querySelector('[data-page="first"]');
const btnPrev  = document.querySelector('[data-page="prev"]');
const btnNext  = document.querySelector('[data-page="next"]');
const btnLast  = document.querySelector('[data-page="last"]');

const btnDownload = document.getElementById("downloadSelected");
const btnDelete   = document.getElementById("deleteSelected");

const deleteModal = document.getElementById("delete-modal");
const deleteModalText = document.getElementById("deleteModalText");
const btnConfirmDelete = document.getElementById("confirmDelete");
const btnCancelDelete  = document.getElementById("cancelDelete");

/* =========================
   Estado
========================= */
const selectedIds = new Set();
let page = 1;
const itemsSelect = document.getElementById("itemsPerPage");
let pageSize = parseInt(itemsSelect?.value || 12, 10);
let totalPages = 1;

/* =========================
   Acciones globales
========================= */
function updateActionsState() {
  const has = selectedIds.size > 0;
  btnDownload && (btnDownload.disabled = !has);
  btnDelete   && (btnDelete.disabled   = !has);
}

/* =========================
   Descarga / Eliminar
========================= */
// btnDownload?.addEventListener("click", () => {
//   if (!selectedIds.size) return;
//   const ids = [...selectedIds].join(",");
//   window.location.href = `${API_BASE}/api/memories/admin/download?ids=${ids}`;
// });

btnDownload?.addEventListener("click", () => {
  if (!selectedIds.size) return;

  const ids = [...selectedIds].join(",");

  // Inicia la descarga
  window.location.href = `${API_BASE}/api/memories/admin/download?ids=${ids}`;

  // ✅ LIMPIAR SELECCIÓN
  selectedIds.clear();

  // Desmarcar checkboxes y quitar estado visual
  document.querySelectorAll(".memory-select").forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.closest(".memory-card")?.classList.remove("is-selected");
  });

  // Actualizar estado de acciones globales
  updateActionsState();
});

btnDelete?.addEventListener("click", () => {
  if (!selectedIds.size) return;
  deleteModalText.textContent =
    `¿Eliminar ${selectedIds.size} recuerdo(s)? Esta acción no se puede deshacer.`;
  deleteModal.classList.remove("hidden");
});

btnCancelDelete?.addEventListener("click", () => {
  deleteModal.classList.add("hidden");
});

btnConfirmDelete?.addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_BASE}/api/memories/admin/batch`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selectedIds] }),
    });
    if (!res.ok) throw new Error();
    selectedIds.clear();
    deleteModal.classList.add("hidden");
    loadPage(page);
  } catch {
    alert("Error eliminando recuerdos");
  }
});

/* =========================
   Render
========================= */
function renderMemories(memories) {
  list.innerHTML = "";

  memories.forEach((m) => {
    const card = document.createElement("div");
    card.className = `memory-card ${!m.is_visible ? "is-hidden" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "memory-select";
    checkbox.checked = selectedIds.has(m.id);

    checkbox.addEventListener("change", () => {
      checkbox.checked ? selectedIds.add(m.id) : selectedIds.delete(m.id);
      card.classList.toggle("is-selected", checkbox.checked);
      updateActionsState();
    });

    card.appendChild(checkbox);

    const isVideo = /\.(mp4|webm|mov)$/i.test(m.file_path);
    const mediaEl = document.createElement(isVideo ? "video" : "img");
    mediaEl.src = `${API_BASE}/${m.file_path}`;
    if (isVideo) mediaEl.controls = true;
    else mediaEl.alt = "Recuerdo";

    card.appendChild(mediaEl);

    const actions = document.createElement("div");
    actions.className = "memory-actions";

    const btnToggle = document.createElement("button");
    btnToggle.className = "btn btn--ghost";
    btnToggle.textContent = m.is_visible ? "Ocultar" : "Mostrar";

    btnToggle.addEventListener("click", async () => {
      await fetch(`${API_BASE}/api/memories/admin/${m.id}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !m.is_visible }),
      });
      loadPage(page);
    });

    actions.appendChild(btnToggle);
    card.appendChild(actions);
    list.appendChild(card);
  });

  updateActionsState();
}

/* =========================
   Data / Paginación
========================= */
async function loadPage(newPage) {
  page = Math.max(newPage, 1);

  const res = await fetch(
    `${API_BASE}/api/memories/admin/list?page=${page}&pageSize=${pageSize}`,
  );
  const json = await res.json();

  const meta = json.meta ?? {
    total: json.total ?? json.data.length,
    page,
    totalPages: Math.ceil((json.total ?? json.data.length) / pageSize),
    from: (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, json.total ?? json.data.length),
  };

  totalPages = meta.totalPages;
  renderMemories(json.data ?? json);

  countText && (countText.innerHTML =
    `Mostrando <strong>${meta.from}–${meta.to}</strong> de <strong>${meta.total}</strong> recuerdos`
  );

  pageInput && (pageInput.value = meta.page);
  pageTotalText && (pageTotalText.textContent = `de ${totalPages}`);

  btnFirst && (btnFirst.disabled = page === 1);
  btnPrev  && (btnPrev.disabled  = page === 1);
  btnNext  && (btnNext.disabled  = page === totalPages);
  btnLast  && (btnLast.disabled  = page === totalPages);
}

/* =========================
   Eventos
========================= */
btnFirst?.addEventListener("click", () => loadPage(1));
btnPrev?.addEventListener("click",  () => loadPage(page - 1));
btnNext?.addEventListener("click",  () => loadPage(page + 1));
btnLast?.addEventListener("click",  () => loadPage(totalPages));

pageInput?.addEventListener("change", () => {
  const p = parseInt(pageInput.value, 10);
  if (!Number.isNaN(p)) loadPage(p);
});

itemsSelect?.addEventListener("change", () => {
  pageSize = parseInt(itemsSelect.value, 10);
  loadPage(1);
});

/* =========================
   Init
========================= */
loadPage(1);