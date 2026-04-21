import "./guard.js";

const container = document.getElementById("invitationsContainer");
const addInvitationBtn = document.getElementById("addInvitation");
const saveBtn = document.getElementById("saveInvitations");
const result = document.getElementById("result");
const status = document.getElementById("createStatus");

// ================================
// Utilidades
// ================================
function updateInvitationTitles() {
  [...container.children].forEach((block, index) => {
    const title = block.querySelector(".invitation-title");
    if (title) {
      title.textContent = `Invitación #${index + 1}`;
    }
  });
}

function createCompanionRow(list) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    <input placeholder="Nombre del acompañante" />
    <button type="button" class="danger" aria-label="Eliminar acompañante">❌</button>
  `;

  row.querySelector("button").onclick = () => {
    row.remove();
    const counter = list
      .closest(".companions")
      .querySelector(".companion-count");
    counter.textContent = list.children.length;
  };

  list.appendChild(row);
}

// ================================
// Crear bloque de invitación
// ================================
function createInvitationBlock() {
  const div = document.createElement("div");
  div.className = "invitation";

  div.innerHTML = `
    <div class="invitation-header">
      <strong class="invitation-title"></strong>
    </div>

    <div class="field">
      <label>Invitado principal</label>
      <input class="mainGuest" placeholder="Nombre completo" />
    </div>

    <div class="field">
      <label>Mesa</label>
      <input class="table" placeholder="Ej: Mesa 3, Mesa 12..." />
    </div>

    
<div class="companions">
  <strong>
    Acompañantes (<span class="companion-count">0</span>)
  </strong>

  <div class="companionList"></div>

  <div class="invitation-actions">
    <button
      type="button"
      class="btn btn--danger removeInvitation"
    >
      Eliminar invitación
    </button>

    <button
      type="button"
      class="btn btn--primary-green addCompanion"
    >
      + Agregar acompañante
    </button>
  </div>
</div>

  `;

  const companionList = div.querySelector(".companionList");
  const companionCount = div.querySelector(".companion-count");

  // Agregar acompañante
  div.querySelector(".addCompanion").onclick = () => {
    createCompanionRow(companionList);
    companionCount.textContent = companionList.children.length;
  };

  // Eliminar invitación (con confirmación)
  div.querySelector(".removeInvitation").onclick = () => {
    const confirmDelete = confirm("¿Eliminar esta invitación?");
    if (!confirmDelete) return;

    div.remove();
    updateInvitationTitles();
  };

  container.appendChild(div);
  updateInvitationTitles();
}

// ================================
// Inicialización
// ================================
createInvitationBlock();
addInvitationBtn.onclick = createInvitationBlock;

//Acción cancelar
document.getElementById("cancelCreate")?.addEventListener("click", () => {
  history.back();
});


// CANCELAR / VOLVER sin guardar
document.getElementById("btnBack")?.addEventListener("click", () => {
  history.back();
});


// ================================
// Guardar invitaciones
// ================================
saveBtn.onclick = async () => {
  status.textContent = "";

  const blocks = [...container.children];
  const invitations = [];

  blocks.forEach((block) => {
    const mainGuest = block.querySelector(".mainGuest").value.trim();
    const table = block.querySelector(".table").value.trim();

    if (!mainGuest || !table) return;

    const companions = [...block.querySelectorAll(".companionList input")]
      .map((i) => i.value.trim())
      .filter(Boolean);

    invitations.push({
      mainGuestName: mainGuest,
      tableNumber: table,
      companions,
    });
  });

  if (invitations.length === 0) {
    status.textContent = "Debes ingresar al menos una invitación válida.";
    status.style.color = "red";
    return;
  }

  // Evitar doble envío
  saveBtn.disabled = true;
  saveBtn.textContent = "Guardando...";

  try {
    const res = await fetch("/api/invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitations }),
    });

    if (!res.ok) {
      throw new Error("Error al guardar invitaciones");
    }

    const data = await res.json();

    // Mostrar resultados

    result.innerHTML = "";

    data.invitations.forEach((i, index) => {
    
      const link = `${location.origin}/index.html?token=${i.token}`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
    <td>${index + 1}</td>
    <td>${i.mainGuestName}</td>
    <td>
      <span class="link">${link}</span>
    </td>
  `;

      tr.querySelector(".link").onclick = () => {
        navigator.clipboard.writeText(link);
        status.textContent = "Link copiado al portapapeles";
        status.style.color = "green";
      };

      result.appendChild(tr);
    });

    status.textContent = `${data.created} invitaciones creadas correctamente`;
    status.style.color = "green";

    // Reset formulario
    container.innerHTML = "";
    createInvitationBlock();
  } catch (error) {
    console.error(error);
    status.textContent = "❌ Error al crear las invitaciones";
    status.style.color = "red";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "💾 Guardar todas las invitaciones";
  }
};
