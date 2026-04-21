// frontend/js/modules/attendance.js
// FIX: token centralizado usando token.js
import { API_BASE } from "../config.js";
import { getToken } from "./token.js";

document.addEventListener("DOMContentLoaded", async () => {
  let invitation = null;
  let token = getToken();
  let modalContainer = null;

  /* ================================
   * CARGAR LA INVITACIÓN
   ================================= */
  async function loadInvitation() {
    if (!token) return;

    const res = await fetch(`${API_BASE}/api/invitation/${token}`);

    if (res.status === 403) {
      showInactiveInvitation();
      invitation = "__INACTIVE__";
      return;
    }

    if (res.status === 404) {
      invitation = null;
      return;
    }

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }

    const data = await res.json();

    invitation = {
      mainGuest: data.mainGuest,
      companions: data.companions,
      tableNumber: data.table,
    };
  }

  await loadInvitation();

  if (!invitation || invitation === "__INACTIVE__") return;

  /* ================================
   * LOAD MODAL
   ================================= */
  async function loadModal() {
    const res = await fetch("./modal.html");
    const html = await res.text();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    return container;
  }

  modalContainer = await loadModal();

  /* ================================
   * RENDER GUESTS
   ================================= */
  function renderGuests(container) {
    container.innerHTML = "";
    const guests = [invitation.mainGuest, ...invitation.companions];

    guests.forEach((guest, i) => {
      const div = document.createElement("div");
      div.className = "form-group";
      div.innerHTML = `
        <label>
          <input type="checkbox" name="guest_${i}" checked />
          ${guest}
        </label>
      `;
      container.appendChild(div);
    });
  }

  /* ================================
   * BOTÓN CONFIRMAR
   ================================= */
  document.addEventListener("click", async (e) => {
    if (!e.target.closest(".btn-confirm")) return;

    const res = await fetch(`${API_BASE}/api/attendance/${token}`);

    if (res.status === 204) {
      const modal1 = modalContainer.querySelector("#confirmationModal");
      renderGuests(modal1.querySelector("#guestList"));
      fillNameAutocomplete(); 
      modal1.style.display = "flex";
      return;
    }

    if (res.status === 200) {
      await showFinalConfirmation();
    }
  });

  /* ================================
   * AUTO COMPLETADO DEL NOMBRE
   ================================= */

  function fillNameAutocomplete() {
    const datalist = modalContainer.querySelector("#guestNames");
    if (!datalist) return;

    const guests = [invitation.mainGuest, ...invitation.companions];

    datalist.innerHTML = "";
    guests.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });
  }

  /* ================================
   * MODAL 1 → REVIEW
   ================================= */
  document.addEventListener("click", (e) => {
    if (e.target.id !== "btnReview") return;

    const modal1 = modalContainer.querySelector("#confirmationModal");
    const modal2 = modalContainer.querySelector("#confirmationReviewModal");
    const nameInput = modal1.querySelector("#confirmName");
    const error = modal1.querySelector(".input-error");

    if (nameInput.value.trim() !== invitation.mainGuest) {
      error.textContent = `Escribe tu nombre como aparece en la invitación: ${invitation.mainGuest}`;
      error.style.display = "block";
      return;
    }

    error.style.display = "none";

    const guests = [invitation.mainGuest, ...invitation.companions];
    const guestList = modal1.querySelector("#guestList");
    const confirmed = guests.filter(
      (_, i) => guestList.querySelector(`input[name="guest_${i}"]`).checked,
    );

    const reviewList = modal2.querySelector("#reviewGuestList");
    const reviewTable = modal2.querySelector("#reviewTable");

    reviewTable.textContent =
      invitation.tableNumber ?? "La podrás ver cuando confirmes asistencia";

    reviewList.innerHTML = "";
    confirmed.forEach((g) => {
      const li = document.createElement("li");
      li.textContent = g;
      reviewList.appendChild(li);
    });

    modal1.style.display = "none";
    modal2.style.display = "flex";
  });

  /* ================================
   * Volver del modal review al modal inicial
   ================================= */
  document.addEventListener("click", (e) => {
    if (e.target.id !== "btnBackToEdit") return;

    const modal1 = modalContainer.querySelector("#confirmationModal");
    const modal2 = modalContainer.querySelector("#confirmationReviewModal");

    modal2.style.display = "none";
    modal1.style.display = "flex";
  });

  /* ================================
   * CONFIRMAR FINAL
   ================================= */
  document.addEventListener("click", async (e) => {
    if (e.target.id !== "btnConfirmFinal") return;

    const modal1 = modalContainer.querySelector("#confirmationModal");
    const guestList = modal1.querySelector("#guestList");
    const nameInput = modal1.querySelector("#confirmName");

    const guests = [invitation.mainGuest, ...invitation.companions];
    const attendance = guests.map((g, i) => ({
      name: g,
      attending: guestList.querySelector(`input[name="guest_${i}"]`).checked,
    }));

    const res = await fetch(`${API_BASE}/api/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        confirmName: nameInput.value.trim(),
        attendance,
      }),
    });

    if (!res.ok) throw new Error("Error confirmando asistencia");

    modalContainer.querySelector("#confirmationReviewModal").style.display =
      "none";
    await showFinalConfirmation();
  });

  /* ================================
   * MODAL FINAL
   ================================= */
  async function showFinalConfirmation() {
    const modal3 = modalContainer.querySelector("#confirmationMessage");
    const list = modal3.querySelector("#finalGuestList");
    const table = modal3.querySelector("#finalTable");

    const res = await fetch(`${API_BASE}/api/attendance/${token}`);
    if (!res.ok) return;

    const data = await res.json();

    list.innerHTML = "";
    data.attendance
      .filter((g) => g.attending)
      .forEach((g) => {
        const li = document.createElement("li");
        li.textContent = g.name;
        list.appendChild(li);
      });

    table.textContent = data.table;
    invitation.tableNumber = data.table;
    modal3.style.display = "flex";
  }

  /* ================================
   * CIERRE MODALES
   ================================= */
  document.addEventListener("click", (e) => {
    if (
      e.target.id === "modalClose" ||
      e.target.id === "btnCloseFinal" ||
      e.target.classList.contains("modal__close")
    ) {
      modalContainer.querySelectorAll(".modal").forEach((m) => {
        m.style.display = "none";
      });
    }

    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });
});

/* ================================
 * INVITACIÓN INACTIVA
 ================================= */
function showInactiveInvitation() {
  document.querySelectorAll(".btn-confirm").forEach((btn) => {
    btn.disabled = true;
    btn.textContent = "Invitación desactivada";
    btn.classList.add("btn-disabled");
    btn.setAttribute("aria-disabled", "true");
  });

  if (document.querySelector(".inactive-invitation")) return;

  const msg = document.createElement("div");
  msg.className = "inactive-invitation";
  msg.innerHTML = `
    <h3>Invitación desactivada</h3>
    <p>
      Esta invitación no está activa.<br />
      Contacta al administrador del evento.
    </p>
  `;

  document.querySelector(".confirm-container")?.appendChild(msg);
}
