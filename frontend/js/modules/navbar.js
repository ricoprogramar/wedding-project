// // frontend/js/modules/navbar.js
// // Navbar + estado activo por SCROLL + acceso admin oculto

// export function initNavbar() {
//   const toggle = document.getElementById("navbarToggle");
//   const menu = document.getElementById("navbarMenu");
//   const links = document.querySelectorAll(".navbar__link");
//   const logo = document.querySelector(".navbar__logo");

//   if (!menu || !links.length) return;

//   /* =========================
//      Menú mobile
//   ========================= */
//   function openMenu() {
//     menu.classList.add("active");
//     document.body.classList.add("menu-open");
//   }

//   function closeMenu() {
//     menu.classList.remove("active");
//     document.body.classList.remove("menu-open");
//   }

//   function toggleMenu() {
//     menu.classList.contains("active") ? closeMenu() : openMenu();
//   }

//   toggle?.addEventListener("click", toggleMenu);

//   links.forEach((link) => {
//     link.addEventListener("click", closeMenu);
//   });

//   document.addEventListener("click", (e) => {
//     if (!menu.contains(e.target) && !toggle?.contains(e.target)) {
//       closeMenu();
//     }
//   });

//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape") closeMenu();
//   });

//   /* =========================
//      Estado activo por SCROLL (FIX DEFINITIVO)
//   ========================= */

//   // ✅ Solo links con hash (#)
//   const hashLinks = Array.from(links).filter((link) =>
//     link.getAttribute("href")?.startsWith("#"),
//   );

//   // ✅ Solo secciones que existen en el DOM
//   const sections = hashLinks
//     .map((link) => document.querySelector(link.getAttribute("href")))
//     .filter(Boolean);

//   const observer = new IntersectionObserver(
//     (entries) => {
//       entries.forEach((entry) => {
//         if (!entry.isIntersecting) return;

//         const id = entry.target.getAttribute("id");
//         const hash = `#${id}`;

//         hashLinks.forEach((link) => {
//           link.classList.toggle(
//             "is-active",
//             link.getAttribute("href") === hash,
//           );
//         });
//       });
//     },
//     {
//       rootMargin: "-50% 0px -50% 0px",
//       threshold: 0,
//     },
//   );

//   sections.forEach((section) => observer.observe(section));

//   /* =========================
//      Acceso admin oculto (5 clics)
//   ========================= */
//   if (logo) {
//     let clicks = 0;
//     let timer = null;

//     logo.addEventListener("click", () => {
//       clicks++;
//       clearTimeout(timer);

//       timer = setTimeout(() => {
//         clicks = 0;
//       }, 1200);

//       if (clicks === 5) {
//         clicks = 0;
//         window.location.href = "/admin/login.html";
//       }
//     });
//   }
// }


// frontend/js/modules/navbar.js
// Navbar + estado activo por SCROLL + hide/show por dirección + acceso admin oculto

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

  toggle?.addEventListener("click", () => {
    menu.classList.contains("active") ? closeMenu() : openMenu();
  });

  links.forEach(link => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });

  /* =========================
     NAVBAR INTELIGENTE (FIX REAL)
  ========================= */

  let lastScrollY = window.scrollY;
  let accumulatedUpScroll = 0;
  const SHOW_THRESHOLD = 60; // píxeles reales de intención

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const diff = lastScrollY - currentScrollY;

    // 🔒 nunca ocultar si:
    if (
      document.body.classList.contains("menu-open") ||
      currentScrollY < 80
    ) {
      navbar.classList.remove("navbar--hidden");
      accumulatedUpScroll = 0;
      lastScrollY = currentScrollY;
      return;
    }

    // Scroll hacia abajo
    if (diff < 0) {
      navbar.classList.add("navbar--hidden");
      accumulatedUpScroll = 0;
    }

    // Scroll hacia arriba
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
  const hashLinks = Array.from(links).filter(link =>
    link.getAttribute("href")?.startsWith("#")
  );

  const sections = hashLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const hash = `#${entry.target.id}`;
        hashLinks.forEach(link => {
          link.classList.toggle("is-active", link.getAttribute("href") === hash);
        });
      });
    },
    { rootMargin: "-50% 0px -50% 0px" }
  );

  sections.forEach(section => observer.observe(section));

  /* =========================
     ACCESO ADMIN (5 clics)
  ========================= */
  if (logo) {
    let clicks = 0;
    let timer = null;

    logo.addEventListener("click", () => {
      clicks++;
      clearTimeout(timer);

      timer = setTimeout(() => (clicks = 0), 1200);

      if (clicks === 5) {
        clicks = 0;
        window.location.href = "/admin/login.html";
      }
    });
  }
}