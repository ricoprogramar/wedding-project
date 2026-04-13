import "./guard.js";
import { API_BASE } from "../config.js";

const enabled = document.getElementById("enabled");
const startAt = document.getElementById("start_at");
const endAt = document.getElementById("end_at");
const status = document.getElementById("status");
const saveBtn = document.getElementById("save");

// Cargar config actual
fetch(`${API_BASE}/api/memories/config`)
  .then((r) => r.json())
  .then((cfg) => {
    enabled.checked = cfg.enabled;
    startAt.value = cfg.start_at ? cfg.start_at.slice(0, 16) : "";
    endAt.value = cfg.end_at ? cfg.end_at.slice(0, 16) : "";
  });

// Guardar
saveBtn.addEventListener("click", async () => {
  status.textContent = "";

  const res = await fetch(`${API_BASE}/api/memories/config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      enabled: enabled.checked,
      start_at: startAt.value || null,
      end_at: endAt.value || null,
    }),
  });

  if (!res.ok) {
    status.textContent = "❌ Error al guardar";
    status.style.color = "red";
    return;
  }

  status.textContent = "✅ Configuración guardada";
  status.style.color = "green";
});
