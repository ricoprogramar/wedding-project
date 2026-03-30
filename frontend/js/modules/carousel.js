// carousel.js
const images = [
  "./assets/images/1.jpg",
  "./assets/images/2.jpg",
  "./assets/images/3.png",
  "./assets/images/4.jpg",
  "./assets/images/5.jpg",
  "./assets/images/6.jpg",
  "./assets/images/7.jpg",
];

export function initHeroCarousel() {
  const imgElement = document.getElementById("heroCarouselImage");

  if (!imgElement) return;

  let currentIndex = 0;
  imgElement.src = images[currentIndex];

  function changeImage() {
    imgElement.classList.add("fade-out");

    setTimeout(() => {

      currentIndex = (currentIndex + 1) % images.length;
      imgElement.src = images[currentIndex];
      imgElement.classList.remove("fade-out");
    }, 300);
  }

  setInterval(changeImage, 2000);
}