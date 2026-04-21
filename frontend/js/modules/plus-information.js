// frontend/js/modules/plus-information.js

import { navigateWithToken } from "./token.js";

export function goToInformation() {
  const btn = document.getElementById("goToInformation");
  if (!btn) return;

  btn.addEventListener("click", () => {
    navigateWithToken("/index.html#evento");
  });
}