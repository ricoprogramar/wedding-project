document.addEventListener("DOMContentLoaded", async () => {
  let invitation = null;
  let token = null;
  let modalContainer = null;

  /* ================================
   * TOKEN
   ================================= */
  function getToken() {
    const urlToken = new URLSearchParams(window.location.search).get("token");

    if (urlToken) {
      // Guardar token por primera vez
      sessionStorage.setItem("invitation_token", urlToken);
      return urlToken;
    }

    // Recuperar token guardado
    return sessionStorage.getItem("invitation_token");
  }

  /* ================================
   * LOAD INVITATION
   ================================= */

  async function loadInvitation() {
    token = getToken();

    // GUARDIA DE SEGURIDAD
    if (!token) {
      console.warn("No hay token de invitación");
      invitation = null;
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/invitations/${token}`);

      // Invitación no existe (caso normal, no error técnico)
      if (res.status === 404) {
        console.warn("Invitación no encontrada");
        invitation = null;
        return;
      }

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log("INVITATION API RESPONSE:", data);

      invitation = {
        mainGuest: data.mainGuest,
        companions: data.companions,
        tableNumber: data.table, // Mapeado de mesa
      };
    } catch (error) {
      console.error("Error cargando invitación:", error);
      invitation = null;
    }
  }

  await loadInvitation();

  if (!invitation) {
    console.warn("No hay invitación válida cargada");
    return;
  }

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

  document.addEventListener("click", async (e) => {
    if (!e.target.closest(".btn-confirm")) return;

    const res = await fetch(`http://localhost:3000/api/attendance/${token}`);

    // ✅ CASO 1: NO ha confirmado → abrir Modal 1
    if (res.status === 204) {
      const modal1 = modalContainer.querySelector("#confirmationModal");
      const list = modal1.querySelector("#guestList");

      renderGuests(list);
      modal1.style.display = "flex";
      return;
    }

    // ✅ CASO 2: YA confirmó → mostrar resumen (Modal 3)
    if (res.status === 200) {
      await showFinalConfirmation();
      return;
    }

    console.error("Estado inesperado de asistencia:", res.status);
  });

  /* ================================
   * MODAL 1 → MODAL 2 (REVIEW)
   ================================= */
  document.addEventListener("click", (e) => {
    if (e.target.id !== "btnReview") return;

    const modal1 = modalContainer.querySelector("#confirmationModal");
    const modal2 = modalContainer.querySelector("#confirmationReviewModal");

    const nameInput = modal1.querySelector("#confirmName");
    const guestList = modal1.querySelector("#guestList");
    const error = modal1.querySelector(".input-error");

    // if (nameInput.value.trim() !== invitation.mainGuest) {
    //   error.style.display = "block";
    //   return;
    // }

    const expectedName =
      typeof invitation.mainGuest === "string"
        ? invitation.mainGuest
        : invitation.mainGuest.name;

    if (nameInput.value.trim() !== expectedName) {
      error.textContent = `Escribe tu nombre como aparece en la invitación: ${expectedName}`;
      error.style.display = "block";
      return;
    }

    error.style.display = "none";

    const guests = [invitation.mainGuest, ...invitation.companions];
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

    // reviewTable.textContent = invitation.tableNumber;

    modal1.style.display = "none";
    modal2.style.display = "flex";
  });

  /* ================================
   * MODAL 2 ACTIONS
   ================================= */
  document.addEventListener("click", async (e) => {
    const modal1 = modalContainer.querySelector("#confirmationModal");
    const modal2 = modalContainer.querySelector("#confirmationReviewModal");

    if (e.target.id === "btnBackToEdit") {
      modal2.style.display = "none";
      modal1.style.display = "flex";
      return;
    }

    if (e.target.id === "btnConfirmFinal") {
      const guestList = modal1.querySelector("#guestList");
      const nameInput = modal1.querySelector("#confirmName");

      const guests = [invitation.mainGuest, ...invitation.companions];
      const attendance = guests.map((g, i) => ({
        name: g,
        attending: guestList.querySelector(`input[name="guest_${i}"]`).checked,
      }));

      const res = await fetch("http://localhost:3000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          confirmName: nameInput.value.trim(),
          attendance,
        }),
      });

      if (!res.ok) {
        const data = await res.json();

        if (data.message === "already_confirmed") {
          //  Mostrar datos ya confirmados
          modal2.style.display = "none";
          await showFinalConfirmation();
          return;
        }

        throw new Error("Error confirmando asistencia");
      }

      modal2.style.display = "none";
      await showFinalConfirmation();
    }
  });

  /* ================================
   * MODAL 3
   ================================= */
  async function showFinalConfirmation() {
    const modal3 = modalContainer.querySelector("#confirmationMessage");
    const list = modal3.querySelector("#finalGuestList");
    const table = modal3.querySelector("#finalTable");

    const res = await fetch(`http://localhost:3000/api/attendance/${token}`);

    // CASO 1: aún NO ha confirmado (204)
    if (res.status === 204) {
      console.warn("Aún no hay confirmación registrada");
      return;
    }

    // CASO 2: error real
    if (!res.ok) {
      console.error("Error consultando asistencia");
      return;
    }

    // ✅ CASO 3: ya confirmó → SÍ hay JSON
    const data = await res.json();

    list.innerHTML = "";

    data.attendance
      .filter((g) => g.attending)
      .forEach((g) => {
        const li = document.createElement("li");
        li.textContent = g.name;
        list.appendChild(li);
      });

    // PINTAR MESA INMEDIATAMENTE
    table.textContent = data.table;

    // ACTUALIZAR ESTADO FRONTEND
    invitation.tableNumber = data.table; //Estado sincronizado

    modal3.style.display = "flex";
  }

  document.addEventListener("click", (e) => {
    if (e.target.id === "btnCloseFinal") {
      const modal3 = modalContainer.querySelector("#confirmationMessage");
      modal3.style.display = "none";
    }
  });

  // ================================
  // CIERRE GENERICO DE MODALES
  // ================================
  document.addEventListener("click", (e) => {
    // Cerrar al hacer clic en la X
    if (
      e.target.id === "modalClose" ||
      e.target.id === "btnCloseFinal" ||
      e.target.classList.contains("modal__close")
    ) {
      const modals = modalContainer.querySelectorAll(".modal");
      modals.forEach((modal) => {
        modal.style.display = "none";
      });
      return;
    }

    // Cerrar al hacer clic en el fondo oscuro
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });
});
