// frontend/js/modules/dresscode-detail.js

import { navigateWithToken } from "./token.js";

export function initBackNavigation() {
  const btn = document.getElementById("back-home");
  if (!btn) return;

  btn.addEventListener("click", () => {
    navigateWithToken("/frontend/index.html#vestimenta");
  });
}