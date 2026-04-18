// frontend/js/modules/dresscode.js

import { navigateWithToken } from "./token.js";

export function initDresscodeNavigation() {
  const btn = document.getElementById("open-dresscode");
  if (!btn) return;

  btn.addEventListener("click", () => {
    navigateWithToken("/frontend/dresscode-detail.html");
  });
}