// Vista para administrar las imagenes que se muestran en la galería

import "./guard.js";
import { API_BASE } from "../config.js";

const list = document.getElementById("list");

fetch(`${API_BASE}/api/memories/admin/list`)
  .then((r) => r.json())
  .then((items) => {
    items.forEach((m) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "1rem";
      row.style.marginBottom = "0.75rem";

      const img = document.createElement("img");
      img.src = `${API_BASE}/${m.file_path}`;
      img.style.width = "80px";
      img.style.borderRadius = "8px";

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.checked = m.is_visible;

      toggle.addEventListener("change", async () => {
        await fetch(`${API_BASE}/api/memories/admin/${m.id}/visibility`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_visible: toggle.checked }),
        });
      });

      row.append(img, toggle);
      list.appendChild(row);
    });
  });
