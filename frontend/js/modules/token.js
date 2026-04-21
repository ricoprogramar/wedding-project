// frontend/js/modules/token.js
// FIX: navegación interna preservando token global

export function getToken() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token") || sessionStorage.getItem("invitation_token");
}

export function persistToken() {
  const token = getToken();
  if (!token) return;
  sessionStorage.setItem("invitation_token", token);
}

export function attachTokenToInternalLinks() {
  const token = getToken();
  if (!token) return;

  document.querySelectorAll("a[href]").forEach((link) => {
    const url = new URL(link.href, window.location.origin);

    if (url.origin !== window.location.origin) return;

    if (!url.searchParams.get("token")) {
      url.searchParams.set("token", token);
      link.href = url.toString();
    }
  });
}

// ✅ Redirección segura
export function navigateWithToken(path) {
  const token = getToken();

  if (!token) {
    window.location.href = path;
    return;
  }

  const url = new URL(path, window.location.origin);
  url.searchParams.set("token", token);

  window.location.href = url.toString();
}
