// //tips-detail.js

// export function initBackNavigation() {
//   const btn = document.getElementById("back-home")

//   if (!btn) return

//   btn.addEventListener("click", () => {
//     window.location.href = "/frontend/index.html#tips"
//   })
// }

// initBackNavigation()


// frontend/js/modules/tips-detail.js
// FIX: navegación preservando token
import { navigateWithToken } from "./token.js";

export function initBackNavigation() {
  const btn = document.getElementById("back-home");
  if (!btn) return;

  btn.addEventListener("click", () => {
    navigateWithToken("/frontend/index.html#tips");
  });
}

initBackNavigation();