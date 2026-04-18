export function initPhotosQR() {
  const qrContainer = document.getElementById("qr-container");
  if (!qrContainer) return;

  const qrUrl = `${window.location.origin}/frontend/photos/upload.html`;

  // Generar QR usando Google Charts API (solo necesita internet básico)
  const img = document.createElement("img");
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}`;
  img.alt = "Código QR";
  img.width = 180;
  img.height = 180;

  qrContainer.innerHTML = "";
  qrContainer.appendChild(img);
}

