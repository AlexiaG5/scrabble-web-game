// Help Popup

// Get elements
const modal = document.getElementById("rulesPopup");
const btn = document.getElementById("help");
const closeBtn = document.querySelector(".close");

// Open modal when button is clicked
btn.addEventListener("click", function () {
    modal.style.display = "flex"; // Show the modal
});

// Close modal
closeBtn.addEventListener("click", function () {
    modal.style.display = "none"; // Hide the modal
});

// Close modal if user clicks outside of the modal content
window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Audio setup
const tilePlacedSound = new Audio('sounds/tileDrop.wav');
const backgroundMusic = new Audio('sounds/backgroundMusic.wav');

// Loop the background music
backgroundMusic.loop = true;

// Play the music
export function startGameMusic() {
    backgroundMusic.volume = 0.7; // Set initial volume to 70%
    backgroundMusic.play();
}

// Play sound on tile placed
export function playTilePlacedSound() {
    tilePlacedSound.volume = 0.5; // Set initial volume to 50%
    tilePlacedSound.play();  // Play the sound from the start
}

// Get references to the sliders and their values
const musicSlider = document.getElementById('music-slider');
const soundSlider = document.getElementById('sound-slider');
const musicVolumeValue = document.getElementById('music-volume-value');
const soundVolumeValue = document.getElementById('sound-volume-value');

// Set the slider's value and text to 70%
musicSlider.value = 70;
musicVolumeValue.textContent = `70%`;

// Update the music volume
musicSlider.addEventListener('input', (event) => {
  const musicVolume = event.target.value / 100;
  backgroundMusic.volume = musicVolume;
  musicVolumeValue.textContent = `${event.target.value}%`;  // Update displayed volume percentage
});

const toggleMusicButton = document.getElementById('music-btn')

// Add event listener to the button to toggle music
toggleMusicButton.addEventListener('click', () => {
    if (backgroundMusic.paused) {
      // If music is paused, play it
      backgroundMusic.play();
      toggleMusicButton.style.backgroundColor = '#043487cf'
    } else {
      // If music is playing, pause it
      backgroundMusic.pause();
      toggleMusicButton.style.backgroundColor = "#f1626e";
    }
});

// Add sound button and slider

// Set the slider's value and text to 50%
soundSlider.value = 50;
musicVolumeValue.textContent = `50%`;

// Update the music volume
soundSlider.addEventListener('input', (event) => {
    const soundVolume = event.target.value / 100;
    tilePlacedSound.volume = soundVolume;
    soundVolumeValue.textContent = `${event.target.value}%`;  // Update displayed volume percentage
  });