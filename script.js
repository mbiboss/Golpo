const songSelect = document.getElementById("songSelect");
const playPauseBtn = document.getElementById("playPauseBtn");
const themeToggle = document.getElementById("themeToggle");
const ytPlayer = document.getElementById("ytPlayer");
const currentSong = document.getElementById("currentSong");

let isPlaying = false;

// Change song
songSelect.addEventListener("change", () => {
  let url = songSelect.value;
  let videoId = url.split("v=")[1];
  let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  ytPlayer.src = embedUrl;
  currentSong.textContent = "🎶 এখন চলছে: " + songSelect.options[songSelect.selectedIndex].text;
  isPlaying = true;
  playPauseBtn.textContent = "⏸️";
});

// Play / Pause
playPauseBtn.addEventListener("click", () => {
  if (!ytPlayer.src) return;
  if (isPlaying) {
    ytPlayer.src = ytPlayer.src.replace("?autoplay=1", "?autoplay=0");
    playPauseBtn.textContent = "▶️";
    isPlaying = false;
  } else {
    ytPlayer.src = ytPlayer.src.replace("?autoplay=0", "?autoplay=1");
    playPauseBtn.textContent = "⏸️";
    isPlaying = true;
  }
});

// Theme Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  themeToggle.textContent = document.body.classList.contains("light-theme") ? "☀️" : "🌙";
});
