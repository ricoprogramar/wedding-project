// frontend/photos/gallery.js
import { API_BASE } from "../config.js";

const container = document.getElementById("gallery");

fetch(`${API_BASE}/api/memories/list`)
  .then((res) => res.json())
  .then((items) => {
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = "<p>No hay recuerdos aún.</p>";
      return;
    }

    items.forEach((m) => {
      const el = document.createElement(m.is_video ? "video" : "img");

      // ✅ USAR file_path DIRECTO, sin prefijos ni concatenaciones raras
      el.src = `${API_BASE}/${m.file_path}?v=${m.id}`;

      if (m.is_video) el.controls = true;
      container.appendChild(el);
    });
  })
  .catch(() => {
    container.innerHTML = "<p>Error cargando la galería.</p>";
  });
