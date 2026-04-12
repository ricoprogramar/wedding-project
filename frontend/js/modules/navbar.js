// frontend/js/modules/navbar.js
// FIX: se agrega acceso oculto admin sin romper navbar existente

export function initNavbar() {
  const toggle = document.getElementById("navbarToggle");
  const menu = document.getElementById("navbarMenu");
  const links = document.querySelectorAll(".navbar__link");
  const logo = document.querySelector(".navbar__logo");

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add("active");
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    menu.classList.remove("active");
    document.body.classList.remove("menu-open");
  }

  function toggleMenu() {
    menu.classList.contains("active") ? closeMenu() : openMenu();
  }

  // Toggle botón hamburguesa
  toggle.addEventListener("click", toggleMenu);

  // Cerrar al hacer click en un link
  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Cerrar al hacer click fuera del menú
  document.addEventListener("click", (e) => {
    const isClickInsideMenu = menu.contains(e.target);
    const isToggle = toggle.contains(e.target);

    if (!isClickInsideMenu && !isToggle) {
      closeMenu();
    }
  });

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  /* ================================
   * ACCESO ADMIN OCULTO (5 clics)
   ================================= */
  if (logo) {
    let clicks = 0;
    let timer = null;

    logo.addEventListener("click", () => {
      clicks++;

      clearTimeout(timer);
      timer = setTimeout(() => {
        clicks = 0;
      }, 1200);

      if (clicks === 5) {
        clicks = 0;
        window.location.href = "/frontend/admin/index.html";
      }
    });
  }
}