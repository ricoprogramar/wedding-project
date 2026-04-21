// frontend/js/modules/navbar.js

export function initNavbar() {
  const navbar = document.querySelector(".navbar");
  const toggle = document.getElementById("navbarToggle");
  const menu = document.getElementById("navbarMenu");
  const links = document.querySelectorAll(".navbar__link");
  const logo = document.querySelector(".navbar__logo");

  if (!navbar || !menu) return;

  /* =========================
     MENÚ MOBILE
  ========================= */
  function openMenu() {
    menu.classList.add("active");
    document.body.classList.add("menu-open");
    navbar.classList.remove("navbar--hidden");
  }

  function closeMenu() {
    menu.classList.remove("active");
    document.body.classList.remove("menu-open");
  }

  toggle?.addEventListener("click", (e) => {
    e.stopPropagation(); // 👈 evita que el click burbujee al documento
    menu.classList.contains("active") ? closeMenu() : openMenu();
  });

  links.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* =========================
     CLICK FUERA DEL MENÚ (FIX)
  ========================= */
  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("active")) return;

    const clickedInsideMenu = menu.contains(e.target);
    const clickedToggle = toggle?.contains(e.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu();
    }
  });

  /* =========================
     NAVBAR INTELIGENTE
     ↓ oculta | ↑ muestra
  ========================= */
  let lastScrollY = window.scrollY;
  let accumulatedUpScroll = 0;
  const SHOW_THRESHOLD = 60;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const diff = lastScrollY - currentScrollY;

    // nunca ocultar si:
    if (document.body.classList.contains("menu-open") || currentScrollY < 80) {
      navbar.classList.remove("navbar--hidden");
      accumulatedUpScroll = 0;
      lastScrollY = currentScrollY;
      return;
    }

    // scroll hacia abajo
    if (diff < 0) {
      navbar.classList.add("navbar--hidden");
      accumulatedUpScroll = 0;
    }

    // scroll hacia arriba
    if (diff > 0) {
      accumulatedUpScroll += diff;
      if (accumulatedUpScroll > SHOW_THRESHOLD) {
        navbar.classList.remove("navbar--hidden");
        accumulatedUpScroll = 0;
      }
    }

    lastScrollY = currentScrollY;
  });

  /* =========================
     ESTADO ACTIVO POR SCROLL
  ========================= */
  const hashLinks = Array.from(links).filter((link) =>
    link.getAttribute("href")?.startsWith("#"),
  );

  const sections = hashLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const hash = `#${entry.target.id}`;
        hashLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === hash,
          );
        });
      });
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );

  sections.forEach((section) => observer.observe(section));

  /* =========================
     ACCESO ADMIN OCULTO
     (5 clics en el logo)
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
        window.location.href = "/admin/login.html";
      }
    });
  }
}

