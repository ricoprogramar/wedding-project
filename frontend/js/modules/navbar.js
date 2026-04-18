// frontend/js/modules/navbar.js
// Navbar + estado activo por SCROLL + acceso admin oculto

export function initNavbar() {
  const toggle = document.getElementById("navbarToggle");
  const menu = document.getElementById("navbarMenu");
  const links = document.querySelectorAll(".navbar__link");
  const logo = document.querySelector(".navbar__logo");

  if (!menu || !links.length) return;

  /* =========================
     Menú mobile
  ========================= */
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

  toggle?.addEventListener("click", toggleMenu);

  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !toggle?.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* =========================
     Estado activo por SCROLL (FIX DEFINITIVO)
  ========================= */

  // ✅ Solo links con hash (#)
  const hashLinks = Array.from(links).filter((link) =>
    link.getAttribute("href")?.startsWith("#"),
  );

  // ✅ Solo secciones que existen en el DOM
  const sections = hashLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute("id");
        const hash = `#${id}`;

        hashLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === hash,
          );
        });
      });
    },
    {
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    },
  );

  sections.forEach((section) => observer.observe(section));

  /* =========================
     Acceso admin oculto (5 clics)
  ========================= */
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
        window.location.href = "/frontend/admin/login.html";
      }
    });
  }
}
