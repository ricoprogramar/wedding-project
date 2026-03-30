export function initDresscodeNavigation() {
  const btn = document.getElementById("open-dresscode")

  btn.addEventListener("click", () => {
    window.location.href = "/dresscode.html"
  })
}