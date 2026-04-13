
// import { API_BASE } from "../config.js";


// const btnLogin = document.getElementById("btnLogin");
// const btnCancel = document.getElementById("btnCancel");
// const error = document.getElementById("error");

// btnCancel.addEventListener("click", () => {
//   window.location.href = "/frontend/";
// });

// btnLogin.addEventListener("click", async () => {
//   const email = document.getElementById("email").value.trim();
//   const password = document.getElementById("password").value.trim();

//   if (!email || !password) {
//     error.textContent = "Completa todos los campos";
//     return;
//   }

//   const res = await fetch(`${API_BASE}/api/admin/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });

//   if (!res.ok) {
//     error.textContent = "Credenciales incorrectas";
//     return;
//   }

//   sessionStorage.setItem("admin_auth", "true");
//   window.location.href = "/frontend/admin/invitation.html";
// });





// frontend/js/admin/login.js
// FIX: permitir login con tecla Enter

import { API_BASE } from "../config.js";

const btnLogin = document.getElementById("btnLogin");
const btnCancel = document.getElementById("btnCancel");
const error = document.getElementById("error");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

btnCancel.addEventListener("click", () => {
  window.location.href = "/frontend/";
});

async function handleLogin() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    error.textContent = "Completa todos los campos";
    return;
  }

  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    error.textContent = "Credenciales incorrectas";
    return;
  }

  sessionStorage.setItem("admin_auth", "true");
  window.location.href = "/frontend/admin/index.html";
}

// Click normal
btnLogin.addEventListener("click", handleLogin);

// ✅ Enter = login
[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  });
});