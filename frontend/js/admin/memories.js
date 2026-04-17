import "./guard.js";
import { API_BASE } from "../config.js";

const enabled = document.getElementById("enabled");
const startAt = document.getElementById("start_at");
const endAt = document.getElementById("end_at");
const status = document.getElementById("status");
const saveBtn = document.getElementById("save");

/**
 * Convierte 'YYYY-MM-DDTHH:mm' (datetime-local)
 * a 'YYYY-MM-DD HH:mm:ss' (TIMESTAMP WITHOUT TIME ZONE)
 */
function toLocalTimestamp(value) {
  if (!value) return null;
  return value.replace("T", " ") + ":00";
}

/**
 * Convierte 'YYYY-MM-DD HH:mm:ss'
 * a 'YYYY-MM-DDTHH:mm' para datetime-local
 */
function fromLocalTimestamp(value) {
  if (!value) return "";
  return value.replace(" ", "T").slice(0, 16);
}

// =====================
// Cargar configuración
// =====================
fetch(`${API_BASE}/api/memories/config`)
  .then((r) => r.json())
  .then((cfg) => {
    enabled.checked = !!cfg.enabled;
    startAt.value = fromLocalTimestamp(cfg.start_at);
    endAt.value = fromLocalTimestamp(cfg.end_at);
  })
  .catch(() => {
    status.textContent = "Error cargando configuración";
    status.style.color = "red";
  });

// =====================
// Guardar configuración
// =====================
saveBtn.addEventListener("click", async () => {
  status.textContent = "";

  const res = await fetch(`${API_BASE}/api/memories/config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      enabled: enabled.checked,
      start_at: toLocalTimestamp(startAt.value),
      end_at: toLocalTimestamp(endAt.value),
    }),
  });

  if (!res.ok) {
    status.textContent = "Error al guardar";
    status.style.color = "red";
    return;
  }

  status.textContent = "Configuración guardada";
  status.style.color = "green";
});
