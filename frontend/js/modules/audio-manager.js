// frontend/js/modules/audio-manager.js
export function initAudioManager() {
  const audio = document.getElementById("bg-music");
  const toggleBtn = document.getElementById("music-toggle");
  const volumeInput = document.getElementById("music-volume");

  if (!audio || !toggleBtn || !volumeInput) return;

  // ===== Estado persistente =====
  const savedEnabled = localStorage.getItem("music_enabled") === "true";
  const savedVolume = parseFloat(localStorage.getItem("music_volume") ?? "0.5");

  audio.volume = savedVolume;
  volumeInput.value = savedVolume;

  let isPlaying = false;

  // ===== Lucide icons =====
  function updateIcon() {
    toggleBtn.innerHTML = `<i data-lucide="${
      isPlaying ? "volume-2" : "volume-x"
    }"></i>`;
    lucide.createIcons();
  }

  // ===== Reproducir / pausar =====
  async function playMusic() {
    try {
      await audio.play();
      isPlaying = true;
      localStorage.setItem("music_enabled", "true");
      updateIcon();
    } catch {
      // El navegador bloqueó autoplay sin interacción
    }
  }

  function pauseMusic() {
    audio.pause();
    isPlaying = false;
    localStorage.setItem("music_enabled", "false");
    updateIcon();
  }

  // ===== Toggle =====
  toggleBtn.addEventListener("click", () => {
    isPlaying ? pauseMusic() : playMusic();
  });

  // ===== Volumen =====
  volumeInput.addEventListener("input", () => {
    audio.volume = volumeInput.value;
    localStorage.setItem("music_volume", volumeInput.value);
  });

  //   // ===== Restaurar estado =====
  //   if (savedEnabled) {
  //     // Solo intenta reproducir tras interacción previa del usuario
  //     document.addEventListener(
  //       "click",
  //       () => {
  //         playMusic();
  //       },
  //       { once: true },
  //     );
  //   }

  // ===== Restaurar estado guardado =====
  if (savedEnabled) {
    // Esperar la primera interacción del usuario
    const resumeOnInteraction = () => {
      audio
        .play()
        .then(() => {
          isPlaying = true;
          updateIcon();
        })
        .catch(() => {
          // navegador bloqueó, no hacemos nada
        });

      document.removeEventListener("click", resumeOnInteraction);
      document.removeEventListener("touchstart", resumeOnInteraction);
    };

    document.addEventListener("click", resumeOnInteraction);
    document.addEventListener("touchstart", resumeOnInteraction);
  }

  updateIcon();
}
