// //plus-informations.js

// export function goToInformation() {
//   const btn = document.getElementById("goToInformation")

//   if (!btn) return

//   btn.addEventListener("click", () => {
//     window.location.href = "/frontend/index.html#evento"
//   })
// }


// frontend/js/modules/plus-information.js
// FIX: navegación preservando token
import { navigateWithToken } from "./token.js";

export function goToInformation() {
  const btn = document.getElementById("goToInformation");
  if (!btn) return;

  btn.addEventListener("click", () => {
    navigateWithToken("/frontend/index.html#evento");
  });
}