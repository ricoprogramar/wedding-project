import { API_BASE } from "../config.js";
import "./guard.js";
let invitationId;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  invitationId = params.get("id");

  if (!invitationId) {
    alert("Invitación no válida");
    return;
  }

  /* ================================
   * BOTÓN ATRÁS
   ================================= */
  const btnBack = document.getElementById("btnBack");
  if (btnBack) {
    btnBack.addEventListener("click", () => history.back());
  }

  /* ================================
   * CARGAR INVITACIÓN
   ================================= */
  let invitation;

  try {
    const res = await fetch(`${API_BASE}/api/invitation/edit/${invitationId}`);
    if (!res.ok) throw new Error();

    invitation = await res.json();

    document.getElementById("mainGuest").value = invitation.mainGuest.name;

    const status = document.getElementById("invitationStatus");
    status.textContent =
      invitation.mainGuest.attending === true
        ? "Confirmó ✅"
        : invitation.mainGuest.attending === false
          ? "No asiste ❌"
          : "Pendiente";

    status.className =
      invitation.mainGuest.attending === true
        ? "status confirmed"
        : invitation.mainGuest.attending === false
          ? "status not-attending"
          : "status pending";

    document.getElementById("tableNumber").value = invitation.table ?? "";

    const activeCheckbox = document.getElementById("isActive");
    const statusText = document.getElementById("statusText");

    if (activeCheckbox && statusText) {
      activeCheckbox.checked = invitation.isActive === true;
      statusText.textContent = invitation.isActive ? "Activa" : "Inactiva";
      statusText.className =
        "status-text " + (invitation.isActive ? "active" : "inactive");
    }

    document.getElementById("token").value = invitation.token;

    const list = document.getElementById("companionsList");
    list.innerHTML = "";
    invitation.companions.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = `${c.name} ${
        c.attending === true ? "✅" : c.attending === false ? "❌" : ""
      }`;
      list.appendChild(li);
    });
  } catch {
    alert("Error cargando la invitación");
    return;
  }

  /* ================================
   * GUARDAR MESA
   ================================= */
  document
    .getElementById("saveChanges")
    ?.addEventListener("click", async () => {
      const newTable = document.getElementById("tableNumber").value.trim();
      if (!newTable) return alert("La mesa no puede estar vacía");

      try {
        const res = await fetch(
          `${API_BASE}/api/invitation/edit/${invitationId}/table`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tableNumber: newTable }),
          },
        );

        if (!res.ok) throw new Error();
        window.location.href = "/frontend/admin/invitation.html";
      } catch {
        alert("No se pudo actualizar la mesa");
      }
    });

  /* ================================
   * ACTIVAR / DESACTIVAR
   ================================= */
  const isActiveCheckbox = document.getElementById("isActive");
  const statusText = document.getElementById("statusText");

  if (isActiveCheckbox && statusText) {
    isActiveCheckbox.addEventListener("change", async (e) => {
      const newState = e.target.checked;
      const prev = !newState;

      const msg = newState
        ? "¿Activar invitación?"
        : "¿Desactivar invitación?\n\nEl invitado no podrá confirmar asistencia.";

      if (!confirm(msg)) {
        e.target.checked = prev;
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/api/invitation/edit/${invitationId}/active`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: newState }),
          },
        );

        if (!res.ok) throw new Error();

        statusText.textContent = newState ? "Activa" : "Inactiva";
        statusText.className =
          "status-text " + (newState ? "active" : "inactive");
      } catch {
        e.target.checked = prev;
        alert("No se pudo actualizar el estado");
      }
    });
  }

  // CANCELAR = volver sin guardar
  document.getElementById("btnCancel")?.addEventListener("click", () => {
    history.back();
  });
});
