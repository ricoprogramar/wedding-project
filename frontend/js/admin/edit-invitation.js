import { API_BASE } from "../config.js";

let invitationId; 

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  invitationId = params.get("id");

  if (!invitationId) {
    alert("Invitación no válida");
    return;
  }

  // Botón atrás
  document.getElementById("btnBack").addEventListener("click", () => {
    history.back();
  });

  try {
    const res = await fetch(`${API_BASE}/api/invitations/edit/${invitationId}`);

    if (!res.ok) {
      throw new Error("No se pudo cargar la invitación");
    }

    const invitation = await res.json();

    // Invitado principal
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

    // Mesa
    document.getElementById("tableNumber").value =
      invitation.table ?? "";

    // Token
    document.getElementById("token").value = invitation.token;

    // Acompañantes
    const list = document.getElementById("companionsList");
    list.innerHTML = "";

    invitation.companions.forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.name} ${
        c.attending === true
          ? "✅"
          : c.attending === false
          ? "❌"
          : ""
      }`;
      list.appendChild(li);
    });

  } catch (error) {
    console.error(error);
    alert("Error cargando la invitación");
  }
});

// Guardar cambios (solo mesa por ahora)
document.getElementById("saveChanges").addEventListener("click", async () => {
  const tableInput = document.getElementById("tableNumber");
  const newTable = tableInput.value.trim();

  if (!newTable) {
    alert("La mesa no puede estar vacía");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/invitations/edit/${invitationId}/table`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tableNumber: newTable
      })
    });

    if (!res.ok) {
      throw new Error("Error guardando la mesa");
    }

    alert("✅ Mesa actualizada correctamente");
    window.location.href = "/frontend/admin/invitations.html";
  } catch (error) {
    console.error(error);
    alert("❌ No se pudo actualizar la mesa");
  }
});