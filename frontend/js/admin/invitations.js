// ✅ Función reutilizable para cargar invitaciones
async function loadInvitations() {
  const tableBody = document.getElementById("invitationsTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch("http://localhost:3000/api/invitations");

    if (!res.ok) {
      throw new Error("Error cargando invitaciones");
    }

    const invitations = await res.json();
    tableBody.innerHTML = "";

    invitations.forEach((invitation, index) => {
      const tr = document.createElement("tr");

      // Acompañantes
      const companionsHtml =
        invitation.companions.length > 0
          ? invitation.companions
              .map(
                (c) => `
          • ${c.name}
          ${c.attending === true ? " ✅" : c.attending === false ? " ❌" : ""}
        `
              )
              .join("<br>")
          : "<em>Sin acompañantes</em>";

      // Estado
      const statusHtml = invitation.confirmed
        ? `<span class="status confirmed">Confirmó</span>`
        : `<span class="status pending">Pendiente</span>`;

      const link = `${window.location.origin}/frontend/index.html?token=${invitation.token}`;

      tr.innerHTML = `
        <td>${index + 1}</td>

        <td>
          ${invitation.mainGuest.name}
          ${
            invitation.mainGuest.attending === true
              ? " ✅"
              : invitation.mainGuest.attending === false
              ? " ❌"
              : ""
          }
        </td>

        <td>${companionsHtml}</td>

        <td>
          ${invitation.table ? invitation.table : "<em>—</em>"}
        </td>

        <td>${statusHtml}</td>

        <td>
          <button class="btn-link" data-link="${link}">
            Copiar
          </button>
        </td>

        <td>
          <input type="checkbox" checked disabled />
        </td>

        <td>
          <button
            class="icon-button edit-invitation"
            title="Editar invitación"
            data-id="${invitation.id}">
            ✏️
          </button>
        </td>
      `;

      // Copiar link
      tr.querySelector(".btn-link").addEventListener("click", () => {
        navigator.clipboard.writeText(link);
        alert("Link copiado ✅");
      });

      // Ir a editar
      tr.querySelector(".edit-invitation").addEventListener("click", () => {
        window.location.href = `/frontend/admin/edit-invitation.html?id=${invitation.id}`;
      });

      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">Error cargando invitaciones</td>
      </tr>
    `;
  }
}

// ✅ Carga normal al entrar
document.addEventListener("DOMContentLoaded", loadInvitations);

// ✅ Recarga automática al volver desde editar (sin F5)
window.addEventListener("pageshow", () => {
  loadInvitations();
});
