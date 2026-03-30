export function initTipsNavigation() {
  const btn = document.getElementById("open-tips")

  btn.addEventListener("click", () => {
    window.location.href = "/frontend/tips.html"
  })
}