export function initCenteredScroll() {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault()

      const targetId = link.getAttribute("href")
      const target = document.querySelector(targetId)

      if (!target) return

      const rect = target.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      const offset = rect.top + scrollTop - (window.innerHeight / 2) + (target.offsetHeight / 2)

      window.scrollTo({
        top: offset,
        behavior: "smooth"
      })
    })
  })
}