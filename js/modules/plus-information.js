export function goToInformation() {
  const btn = document.getElementById("goToInformation")

  if (!btn) return

  btn.addEventListener("click", () => {
    window.location.href = "/index.html#evento"
  })
}