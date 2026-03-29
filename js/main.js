import { initCountdown } from "./modules/countdown.js";
import { initTipsNavigation } from "./modules/tips.js";
import { initDresscodeNavigation } from "./modules/dresscode.js";
import { initBackNavigation } from "./modules/dresscode-detail.js";
import { goToInformation } from "./modules/plus-information.js";
import { initCenteredScroll } from "./modules/scroll.js";
import { initHeroCarousel } from "./modules/carousel.js";
import { initNavbar } from "./modules/navbar.js";
import "./modules/attendance.js";

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
