const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// Tank properties for both players
const players = [
  {
    x: canvas.width / 3 - 25,
    y: canvas.height - 150,
    width: 55,
    height: 90,
    speed: 5,
    direction: 'up',
    spriteSheet: new Image(),
    bullets: [],
    health: 100,
    invincible: false,
    spritePositions: {
      up: { x: 205, y: 30 },
      down: { x: 55, y: 193 },
      left: { x: 350, y: 185 },
      right: { x: 205, y: 185 },
    },
    keyMap: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', shoot: ' ' },
  },
  {
    x: (canvas.width * 2) / 3 - 25,
    y: canvas.height - 150,
    width: 55,
    height: 90,
    speed: 5,
    direction: 'up',
    spriteSheet: new Image(),
    bullets: [],
    health: 100,
    invincible: false,
    spritePositions: {
      up: { x: 205, y: 30 },
      down: { x: 55, y: 193 },
      left: { x: 350, y: 185 },
      right: { x: 205, y: 185 },
    },
    keyMap: { up: 'w', down: 's', left: 'a', right: 'd', shoot: 'k' },
  },
];

// Load sprite sheets for both players
players[0].spriteSheet.src = '/Tanks.png';
players[1].spriteSheet.src = '/Tanks.png';

// Obstacles and Power-Ups
let obstacles = [];
let powerUps = [];
let gameMode = 'Free-for-All'; // Modes: 'Free-for-All', 'Team Deathmatch'

// Game State
let score = [0, 0];
let gameOver = false;
let gameRunning = false;

// Player Input
const keys = {};
document.addEventListener('keydown', (e) => (keys[e.key] = true));
document.addEventListener('keyup', (e) => (keys[e.key] = false));

// Collision Detection
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Generate Obstacles
function generateObstacles() {
  obstacles = [
    { x: 50, y: 150, width: 300, height: 20, color: 'gray', health: 3 },
    { x: 450, y: 150, width: 300, height: 20, color: 'gray', health: 3 },
    { x: 50, y: 400, width: 300, height: 20, color: 'gray', health: 3 },
    { x: 450, y: 400, width: 300, height: 20, color: 'gray', health: 3 },
  ];
}

// Generate Power-Ups
function generatePowerUps() {
  powerUps = [
    { x: 200, y: 200, width: 20, height: 20, type: 'health', color: 'green' },
    { x: 400, y: 300, width: 20, height: 20, type: 'speed', color: 'blue' },
    { x: 300, y: 100, width: 20, height: 20, type: 'invincibility', color: 'yellow' },
  ];
}

// Apply Power-Up Effect
function applyPowerUp(player, powerUp) {
  switch (powerUp.type) {
    case 'health':
      player.health = Math.min(player.health + 20, 100); // Cap at 100
      break;
    case 'speed':
      player.speed += 2;
      setTimeout(() => (player.speed -= 2), 5000); // Speed boost lasts 5 seconds
      break;
    case 'invincibility':
      player.invincible = true;
      setTimeout(() => (player.invincible = false), 5000); // Invincibility lasts 5 seconds
      break;
  }
}

// Reset Game
function resetGame() {
  players.forEach((player) => {
    player.x = canvas.width / 3 - 25;
    player.y = canvas.height - 150;
    player.direction = 'up';
    player.bullets = [];
    player.health = 100;
    player.invincible = false;
  });

  generateObstacles();
  generatePowerUps();
  score = [0, 0];
  gameOver = false;
  gameRunning = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Start Game
startButton.addEventListener('click', () => {
  if (!gameRunning) {
    resetGame();
    gameRunning = true;
    startButton.style.display = 'none';
    gameLoop();
  }
});

// Fire Bullets
function fireBullet(player) {
  const bulletWidth = 10;
  const bulletHeight = 20;
  let bulletX = player.x + player.width / 2 - bulletWidth / 2;
  let bulletY = player.y;

  if (player.direction === 'up') {
    bulletY -= bulletHeight;
  } else if (player.direction === 'down') {
    bulletY += player.height;
  } else if (player.direction === 'left') {
    bulletX -= bulletWidth;
    bulletY = player.y + player.height / 2 - bulletHeight / 2;
  } else if (player.direction === 'right') {
    bulletX += player.width;
    bulletY = player.y + player.height / 2 - bulletHeight / 2;
  }

  player.bullets.push({
    x: bulletX,
    y: bulletY,
    width: bulletWidth,
    height: bulletHeight,
    direction: player.direction,
  });
}

// Update Game State
function update() {
  if (gameOver) return;

  players.forEach((player, playerIndex) => {
    const previousX = player.x;
    const previousY = player.y;

    // Move Player
    if (keys[player.keyMap.left]) {
      player.x -= player.speed;
      player.direction = 'left';
    }
    if (keys[player.keyMap.right]) {
      player.x += player.speed;
      player.direction = 'right';
    }
    if (keys[player.keyMap.up]) {
      player.y -= player.speed;
      player.direction = 'up';
    }
    if (keys[player.keyMap.down]) {
      player.y += player.speed;
      player.direction = 'down';
    }

    // Handle Collisions with Obstacles
    for (const obstacle of obstacles) {
      if (isColliding(player, obstacle)) {
        player.x = previousX;
        player.y = previousY;
        break;
      }
    }

    // Handle Collisions with Power-Ups
    for (let i = 0; i < powerUps.length; i++) {
      if (isColliding(player, powerUps[i])) {
        applyPowerUp(player, powerUps[i]);
        powerUps.splice(i, 1); // Remove power-up after collection
        break;
      }
    }

    // Fire Bullets
    if (keys[player.keyMap.shoot] && player.bullets.length < 5) {
      fireBullet(player);
      keys[player.keyMap.shoot] = false; // Prevent continuous shooting
    }

    // Move Bullets
    player.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.direction === 'up') bullet.y -= 7;
      if (bullet.direction === 'down') bullet.y += 7;
      if (bullet.direction === 'left') bullet.x -= 7;
      if (bullet.direction === 'right') bullet.x += 7;

      // Check for Bullet Collisions with Obstacles
      obstacles.forEach((obstacle, obstacleIndex) => {
        if (isColliding(bullet, obstacle)) {
          obstacle.health -= 1;
          player.bullets.splice(bulletIndex, 1); // Remove bullet
          if (obstacle.health <= 0) {
            obstacles.splice(obstacleIndex, 1); // Remove obstacle
            score[playerIndex] += 10; // Update score for player
          }
        }
      });

      // Check for Bullet Collisions with Other Players
      players.forEach((opponent, opponentIndex) => {
        if (playerIndex !== opponentIndex && isColliding(bullet, opponent)) {
          if (!opponent.invincible) {
            opponent.health -= 10; // Reduce health
            if (opponent.health <= 0) {
              opponent.health = 0; // Ensure health doesn't go below 0
              gameOver = true; // End game if a player is defeated
              alert(`Player ${opponentIndex + 1} has been defeated!`);
            }
          }
          player.bullets.splice(bulletIndex, 1); // Remove bullet
        }
      });

      // Remove Bullet if Off-Screen
      if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
        player.bullets.splice(bulletIndex, 1);
      }
    });
  });
}

// Draw Game Elements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Players
  players.forEach((player) => {
    const sprite = player.spritePositions[player.direction];
    ctx.drawImage(player.spriteSheet, sprite.x, sprite.y, player.width, player.height, player.x, player.y, player.width, player.height);

    // Draw Health Bar
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y - 10, (player.health / 100) * player.width, 5);

    // Draw Bullets
    player.bullets.forEach((bullet) => {
      ctx.fillStyle = 'red';
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  });

  // Draw Obstacles
  obstacles.forEach((obstacle) => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // Draw Obstacle Health
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`HP: ${obstacle.health}`, obstacle.x + 10, obstacle.y - 5);
  });

  // Draw Power-Ups
  powerUps.forEach((powerUp) => {
    ctx.fillStyle = powerUp.color;
    ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
  });

  // Draw Scores
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Player 1 Score: ${score[0]}`, 10, 20);
  ctx.fillText(`Player 2 Score: ${score[1]}`, canvas.width - 200, 20);
}

// Game Loop
function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

