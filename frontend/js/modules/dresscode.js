// //dresscode.js

// export function initDresscodeNavigation() {
//   const btn = document.getElementById("open-dresscode")

//   btn.addEventListener("click", () => {
//     window.location.href = "/frontend/dresscode.html"
//   })
// }

// frontend/js/modules/dresscode.js
// FIX: navegación preservando token
import { navigateWithToken } from "./token.js";

export function initDresscodeNavigation() {
  const btn = document.getElementById("open-dresscode");
  if (!btn) return;

  btn.addEventListener("click", () => {
    navigateWithToken("/frontend/dresscode.html");
  });
}