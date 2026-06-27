// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval; // Countdown timer interval
let score = 0;
let timeLeft = 30; // seconds
let targetScore = 20; // score needed to win (mutable for challenges)
let challengeMode = false;

// Wait for button click to start the game
document.getElementById("reset-btn").addEventListener("click", resetGame);
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("challenge-btn").addEventListener("click", startChallenge);
document.getElementById("reset-btn").addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;

  // Reset score and timer
  score = 0;
  timeLeft = 30;
  updateScoreDisplay();
  updateTimeDisplay();

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

  // Start countdown
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimeDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function startChallenge() {
  // Simple challenge: reach 8 points in 15 seconds
  if (gameRunning) return;
  challengeMode = true;
  targetScore = 8;
  timeLeft = 15;
  // visually indicate challenge (simple alert or banner)
  const banner = document.createElement('div');
  banner.id = 'challenge-banner';
  banner.textContent = 'Challenge: Reach 8 points in 15s!';
  document.querySelector('.game-wrapper').prepend(banner);

  startGame();
  // remove banner after start
  setTimeout(() => {
    const b = document.getElementById('challenge-banner');
    if (b) b.remove();
  }, 3000);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Random chance to spawn a polluted drop (20%)
  const isPolluted = Math.random() < 0.20;
  if (isPolluted) {
    drop.classList.add('polluted');
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  const container = document.getElementById("game-container");
  const gameWidth = container.offsetWidth;
  const gameHeight = container.offsetHeight;
  const safeWidth = Math.max(1, gameWidth - size - 10);
  const xPosition = Math.random() * safeWidth;
  drop.style.left = Math.max(0, xPosition) + "px";
  drop.style.top = "0px";
  drop.style.setProperty("--drop-distance", `${gameHeight + 80}px`);

  // Make drops fall for 4 seconds
  // Polluted drops fall slightly faster
  drop.style.animationDuration = isPolluted ? "3.6s" : "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });

  // Clicking a drop increases score and removes it
  drop.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drop.classList.contains('polluted')) {
      // Polluted drop penalty: lose a point and lose 3 seconds
      score = Math.max(0, score - 1);
      timeLeft = Math.max(0, timeLeft - 3);
      // small disgust effect
      drop.style.transform = 'scale(0.6) rotate(-15deg)';
      setTimeout(() => drop.remove(), 160);
      updateScoreDisplay();
      updateTimeDisplay();
    } else {
      score += 1;
      // small pop effect
      drop.style.transform = 'scale(0.2)';
      setTimeout(() => drop.remove(), 120);
      updateScoreDisplay();
      // Check for win
      if (score >= targetScore) {
        celebrateWin();
      }
    }
  });
}

function updateScoreDisplay() {
  const el = document.getElementById('score');
  if (el) el.textContent = score;
}

function updateTimeDisplay() {
  const el = document.getElementById('time');
  if (el) el.textContent = timeLeft;
}

function endGame() {
  // Stop creating drops
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;
  // Remove remaining drops
  const container = document.getElementById('game-container');
  container.querySelectorAll('.water-drop').forEach(d => d.remove());
}

function celebrateWin() {
  // Stop the game
  endGame();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'celebration-overlay';
  overlay.innerHTML = `
    <div class="celebration-card">
      <h2>🎉 You Win! 🎉</h2>
      <p>Your score: ${score}</p>
      <button id="play-again">Play Again</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Create confetti elements
  for (let i = 0; i < 30; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
    overlay.appendChild(c);
  }

  document.getElementById('play-again').addEventListener('click', () => {
    overlay.remove();
    startGame();
  });
}

function resetGame() {
  // Stop intervals and clear state
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  dropMaker = null;
  timerInterval = null;
  gameRunning = false;

  // Reset score and timer values
  score = 0;
  timeLeft = 30;
  updateScoreDisplay();
  updateTimeDisplay();

  // Remove any remaining drops
  const container = document.getElementById('game-container');
  container.querySelectorAll('.water-drop').forEach(d => d.remove());

  // Remove celebration overlay if present
  const overlay = document.getElementById('celebration-overlay');
  if (overlay) overlay.remove();
}
