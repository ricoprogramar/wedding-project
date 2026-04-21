// // carousel.js
// const images = [
//   "./assets/images/1.jpg",
//   "./assets/images/2.jpg",
//   "./assets/images/3.png",
//   "./assets/images/4.jpg",
//   "./assets/images/5.jpg",
//   "./assets/images/6.jpg",
//   "./assets/images/7.jpg",
// ];

// export function initHeroCarousel() {
//   const imgElement = document.getElementById("heroCarouselImage");

//   if (!imgElement) return;

//   let currentIndex = 0;
//   imgElement.src = images[currentIndex];

//   function changeImage() {
//     imgElement.classList.add("fade-out");

//     setTimeout(() => {

//       currentIndex = (currentIndex + 1) % images.length;
//       imgElement.src = images[currentIndex];
//       imgElement.classList.remove("fade-out");
//     }, 300);
//   }

//   setInterval(changeImage, 2000);
// }

const slides = [
  {
    type: "video",
    src: "./assets/videos/hero.mp4",
    poster: "./assets/images/1.jpg",
  },
  { type: "image", src: "./assets/images/2.jpg", duration: 2000 },
  { type: "image", src: "./assets/images/3.png", duration: 2000 },
  { type: "image", src: "./assets/images/4.jpg", duration: 2000 },
  { type: "image", src: "./assets/images/5.jpg", duration: 2000 },
  { type: "image", src: "./assets/images/6.jpg", duration: 2000 },
  { type: "image", src: "./assets/images/7.jpg", duration: 2000 },
];

let index = 0;
let timer = null;

export function initHeroCarousel() {
  const img = document.getElementById("heroCarouselImage");
  const video = document.querySelector(".hero__video");
  if (!img || !video) return;

  function next() {
    index = (index + 1) % slides.length;
    show();
  }

  function show() {
    clearTimeout(timer);
    video.pause();
    video.onended = null;

    img.style.opacity = "0";
    video.style.opacity = "0";

    const slide = slides[index];

    setTimeout(() => {
      if (slide.type === "video") {
        video.src = slide.src;
        video.poster = slide.poster;
        video.currentTime = 0;
        video.style.opacity = "1";
        video.play();
        video.onended = next;
      } else {
        img.src = slide.src;
        img.style.opacity = "1";
        timer = setTimeout(next, slide.duration);
      }
    }, 300);
  }

  show(); // arranca SIEMPRE con video
}
