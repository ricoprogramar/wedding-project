// frontend/js/modules/tips.js
// FIX: navegación preservando token
import { navigateWithToken } from "./token.js";

export function initTipsNavigation() {
  const btn = document.getElementById("open-tips");
  if (!btn) return;

  btn.addEventListener("click", () => {
    navigateWithToken("/tips.html");
  });
}