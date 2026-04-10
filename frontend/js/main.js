// // main.js

// import { initCountdown } from "./modules/countdown.js";
// import { initTipsNavigation } from "./modules/tips.js";
// import { initDresscodeNavigation } from "./modules/dresscode.js";
// import { initBackNavigation } from "./modules/dresscode-detail.js";
// import { goToInformation } from "./modules/plus-information.js";
// import { initCenteredScroll } from "./modules/scroll.js";
// import { initHeroCarousel } from "./modules/carousel.js";
// import { initNavbar } from "./modules/navbar.js";
// import "./modules/attendance.js";

// document.addEventListener("DOMContentLoaded", () => {
//   initNavbar();
//   initHeroCarousel();
//   initCenteredScroll();
//   goToInformation();
//   initBackNavigation();
//   initDresscodeNavigation();
//   initTipsNavigation();
//   initCountdown();
// });


// frontend/js/main.js
// INIT: estado global del token al arrancar la app
import { persistToken, attachTokenToInternalLinks } from "./modules/token.js";

import { initCountdown } from "./modules/countdown.js";
import { initTipsNavigation } from "./modules/tips.js";
import { initDresscodeNavigation } from "./modules/dresscode.js";
import { initBackNavigation } from "./modules/dresscode-detail.js";
import { goToInformation } from "./modules/plus-information.js";
import { initCenteredScroll } from "./modules/scroll.js";
import { initHeroCarousel } from "./modules/carousel.js";
import { initNavbar } from "./modules/navbar.js";
import "./modules/attendance.js";

// ✅ Token global: se ejecuta una sola vez
persistToken();
attachTokenToInternalLinks();

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initHeroCarousel();
  initCenteredScroll();
  goToInformation();
  initBackNavigation();
  initDresscodeNavigation();
  initTipsNavigation();
  initCountdown();
});