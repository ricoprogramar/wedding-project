import "./guard.js";
import { API_BASE } from "../config.js";

// Función reutilizable para cargar invitaciones
async function loadInvitations() {
  const tableBody = document.getElementById("invitationsTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_BASE}/api/invitation`);

    if (res.status === 403) {
      alert("Esta invitación no está activa. Contacta al administrador.");
      return;
    }
    const invitations = await res.json();
    tableBody.innerHTML = "";

    invitations.forEach((invitation, index) => {
      const tr = document.createElement("tr");

      const companionsHtml =
        invitation.companions.length > 0
          ? invitation.companions
              .map((c) => {
                const state =
                  c.attending === true
                    ? "status-dot status-dot--yes"
                    : c.attending === false
                      ? "status-dot status-dot--no"
                      : "status-dot status-dot--pending";

                return `
            <div class="companion-item">
              <span class="${state}"></span>
              <span class="companion-name">${c.name}</span>
            </div>
          `;
              })
              .join("")
          : `<em>Sin acompañantes</em>`;

      // Estado
      const statusHtml = invitation.confirmed
        ? `<span class="status confirmed">Confirmó</span>`
        : `<span class="status pending">Pendiente</span>`;

      const link = `${window.location.origin}/index.html?token=${invitation.token}`;

      tr.innerHTML = `
        <td>${index + 1}</td>

        <td>
          ${(() => {
            const state =
              invitation.mainGuest.attending === true
                ? "status-dot status-dot--yes"
                : invitation.mainGuest.attending === false
                  ? "status-dot status-dot--no"
                  : "status-dot status-dot--pending";

            return `
              <div class="companion-item">
                <span class="${state}"></span>
                <span class="companion-name">${invitation.mainGuest.name}</span>
              </div>
            `;
          })()}
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
          <label class="status-toggle">
            <input
              type="checkbox"
              class="toggle-active"
              ${invitation.isActive ? "checked" : ""}
            />
            <span class="toggle-ui"></span>
          </label>
        </td>


        <td>
          <button
            class="btn-icon btn-icon--md edit-invitation"
            title="Editar invitación"
            data-id="${invitation.id}">
            <i data-lucide="pencil"></i>
          </button>

          
        <button
          class="btn-icon btn-icon--md btn-delete"
          title="Eliminar"
          data-id="${invitation.id}">
          <i data-lucide="trash-2"></i>
        </button>

        </td>
      `;

      // Activar desactivar invitación
      tr.querySelector(".toggle-active").addEventListener(
        "change",
        async (e) => {
          const checkbox = e.target;
          const newState = checkbox.checked;
          const prevState = !newState;

          // Mensaje según la acción
          const message = newState
            ? "¿Estás seguro de ACTIVAR esta invitación nuevamente?"
            : "¿Estás seguro de DESACTIVAR esta invitación?\n\nEl invitado no podrá confirmar asistencia.";

          const confirmed = confirm(message);

          // Si cancela, volver al estado anterior
          if (!confirmed) {
            checkbox.checked = prevState;
            return;
          }

          try {
            const res = await fetch(
              `${API_BASE}/api/invitation/edit/${invitation.id}/active`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: newState }),
              },
            );

            if (!res.ok) {
              throw new Error("Error en backend");
            }
          } catch (error) {
            alert("No se pudo actualizar el estado de la invitación");
            checkbox.checked = prevState; // rollback visual
          }
        },
      );

      // Feedback no bloqueante al copiar link
      tr.querySelector(".btn-link").addEventListener("click", async () => {
        await navigator.clipboard.writeText(link);
        showToast("✅ Link copiado");
      });

      // Ir a editar
      tr.querySelector(".edit-invitation").addEventListener("click", () => {
        window.location.href = `/admin/invitation/edit-invitation.html?id=${invitation.id}`;
      });

      tableBody.appendChild(tr);
    });

    lucide.createIcons(); //Esta línea hace visible el ícono de eliminar

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

  document
    .getElementById("btnCreateInvitation")
    ?.addEventListener("click", () => {
      window.location.href = "/admin/invitation/invitation-form.html";
    });
});

// Toast simple temporal
function showToast(message, duration = 1500) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #323232;
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      opacity: 0;
      transition: opacity .3s ease;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, duration);
}

// lógica logout ir atrás
document.getElementById("btnLogout")?.addEventListener("click", () => {  
  window.location.href = "/admin/index.html";
});

//Eliminar invitación
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-delete");
  if (!btn) return;

  const id = btn.dataset.id;

  const ok = confirm(
    "¿Eliminar esta invitación?\n\nEsta acción no se puede deshacer.",
  );

  if (!ok) return;

  const res = await fetch(`${API_BASE}/api/invitation/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    btn.closest("tr").remove();
  } else {
    alert("Error eliminando invitación");
  }
});
