// // /frontend/config.js
// // FIX: eliminar || y definir base única
// export const API_BASE =
//   location.hostname === "localhost" ? "http://localhost:3000" : "";


// /frontend/config.js
// FIX: unificar host con el navegador
export const API_BASE =
  location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000"
    : "";