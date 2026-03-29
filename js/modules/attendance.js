document.addEventListener("DOMContentLoaded", async () => {
  // 🔹 Estado global
  let invitation = null;
  let token = null;

  // Obtener token
  function getToken() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "abc123";
  }

  // 🔹 Cargar invitación desde backend
  async function loadInvitation() {
    token = getToken();

    if (!token) {
      console.error("No hay token en la URL");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/invitation/${token}`);

      if (!res.ok) {
        throw new Error("Invitación no encontrada");
      }

      const data = await res.json();

      invitation = {
        mainGuest: data.mainGuest,
        companions: data.companions,
      };
    } catch (error) {
      console.error(error);
      alert("Invitación inválida");
    }
  }

  await loadInvitation();

  if (!invitation) console.warn("Token inválido, usando invitación de prueba.");

  // Cargar modal dinámicamente
  async function loadModal() {
    try {
      const res = await fetch("./modal.html");
      const html = await res.text();
      const container = document.createElement("div");
      container.innerHTML = html;
      document.body.appendChild(container);
      return container;
    } catch (err) {
      console.error("Error cargando modal:", err);
      return null;
    }
  }

  const modalContainer = await loadModal();
  if (!modalContainer) return;

  const modal = modalContainer.querySelector("#confirmationModal");
  const closeBtn = modalContainer.querySelector("#modalClose");
  const form = modalContainer.querySelector("#attendanceForm");
  const confirmNameInput = modalContainer.querySelector("#confirmName");
  const confirmationMessage = modalContainer.querySelector(
    "#confirmationMessage",
  );

  function renderGuests(container) {
    container.innerHTML = "";
    const allGuests = [invitation.mainGuest, ...invitation.companions];
    allGuests.forEach((guest, index) => {
      const div = document.createElement("div");
      div.className = "form-group";
      div.innerHTML = `<label><input type="checkbox" name="guest_${index}" checked> ${guest}</label>`;
      container.appendChild(div);
    });
  }

  // 🔹 Botones que abren modal (Hero y Navbar)
  const confirmButtons = document.querySelectorAll(".btn-confirm");
  confirmButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!invitation) return alert("Invitación inválida");

      const guestList = modalContainer.querySelector("#guestList");
      renderGuests(guestList);
      modal.style.display = "flex";
    });
  });

  // Cerrar modal con X o click afuera
  closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Enviar formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const confirmName = confirmNameInput.value.trim();
    const errorMessage = form.querySelector(".input-error");

    // 🔹 Validaciones
    if (!confirmName) {
      errorMessage.textContent = "Debes escribir tu nombre completo.";
      errorMessage.style.display = "block";
      return;
    }

    if (confirmName !== invitation.mainGuest) {
      errorMessage.textContent = `El nombre debe coincidir con "${invitation.mainGuest}".`;
      errorMessage.style.display = "block";
      return;
    }

    errorMessage.style.display = "none";

    // 🔹 Construir payload
    const guestListContainer = modalContainer.querySelector("#guestList");
    const allGuests = [invitation.mainGuest, ...invitation.companions];

    const attendance = allGuests.map((guest, index) => ({
      name: guest,
      attending: guestListContainer.querySelector(
        `input[name="guest_${index}"]`,
      ).checked,
    }));

    try {
      // 🔹 Enviar al backend
      const res = await fetch("http://localhost:3000/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          confirmName,
          attendance,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar la asistencia");
      }

      const data = await res.json();
      console.log("Respuesta backend:", data);

      // 🔹 Mostrar confirmación
      confirmationMessage.style.display = "flex";

      // 🔹 Cerrar modales
      setTimeout(() => {
        confirmationMessage.style.display = "none";
        modal.style.display = "none";
        form.reset();
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al confirmar la asistencia.");
    }
  });
});
