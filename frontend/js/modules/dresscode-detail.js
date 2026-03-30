export function initBackNavigation() {
  const btn = document.getElementById("back-home")

  if (!btn) return

  btn.addEventListener("click", () => {
    window.location.href = "/index.html#vestimenta"
  })
}