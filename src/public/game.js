// Merged content from game.js and game1.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// Load obstacle textures
const woodImage = new Image();
woodImage.src = '/imgs/Wood_01-128x128.png';

const brickImage = new Image();
brickImage.src = '/imgs/Bricks_01-128x128.png';

woodImage.onload = () => console.log('Wood image loaded.');
brickImage.onload = () => console.log('Brick image loaded.');

// Handle missing images
woodImage.onerror = () => console.error('Wood image not found at /imgs/Wood_01-128x128.png');
brickImage.onerror = () => console.error('Brick image not found at /imgs/Bricks_01-128x128.png');

// WebSocket connection
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

// Game State
let score = 0;
let myPlayerId = null;
let gameState = {};
let obstacles = [];
let powerUps = [];
let gameRunning = false;
let gameOver = false;
const players = {};
const keys = {};

// Tank properties for player
const player = {
    x: canvas.width / 2 - 25,
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
};

player.spriteSheet.src = '/imgs/Tanks.png';
player.spriteSheet.onerror = () => console.error('Player sprite sheet not found at /imgs/Tanks.png');

// Initialize game state from server
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'init') {
        myPlayerId = data.playerId;
        Object.assign(players, data.players);
        if (data.gameState) {
            obstacles = data.gameState.obstacles || [];
            powerUps = data.gameState.powerUps || [];
            console.log('Game initialized:', data.gameState);
        } else {
            console.warn('Game state is undefined in init message.');
        }
    } else if (data.type === 'updatePlayers') {
        Object.assign(players, data.players);
    } else if (data.type === 'shoot') {
        const { playerId, bullet } = data;
        if (players[playerId]) {
            players[playerId].bullets.push(bullet);
        }
    } else if (data.type === 'hit') {
        const { playerId } = data;
        if (players[playerId]) {
            players[playerId].health -= 10;
            if (players[playerId].health <= 0) {
                console.log(`Player ${playerId} eliminated.`);
            }
        }
    }
};

function drawObstacles() {
    obstacles.forEach((obstacle) => {
        const img = obstacle.type === 'wood' ? woodImage : brickImage;
        ctx.drawImage(img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawPowerUps() {
    powerUps.forEach((powerUp) => {
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
}


function drawPlayer() {
    const sprite = player.spritePositions[player.direction];
    
    // Draw the health bar above the player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y - 10, (player.health / 100) * player.width, 5);
    
    ctx.drawImage(
        player.spriteSheet,
        sprite.x,
        sprite.y,
        55, // Sprite width
        90, // Sprite height
        player.x,
        player.y,
        player.width,
        player.height
    );
}

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

function drawBullets() {
    player.bullets.forEach((bullet) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function updateBullets() {
    player.bullets.forEach((bullet, index) => {
        if (bullet.direction === 'up') bullet.y -= 7;
        if (bullet.direction === 'down') bullet.y += 7;
        if (bullet.direction === 'left') bullet.x -= 7;
        if (bullet.direction === 'right') bullet.x += 7;

        // Remove bullet if out of bounds
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            player.bullets.splice(index, 1);
        }
    });
}

/// Generate random position within the canvas
function getRandomPosition(width, height) {
    let position, colliding;
    do {
        colliding = false;
        position = {
            x: Math.random() * (canvas.width - width),
            y: Math.random() * (canvas.height - height),
        };
        for (const obstacle of obstacles) {
            if (
                position.x < obstacle.x + obstacle.width &&
                position.x + width > obstacle.x &&
                position.y < obstacle.y + obstacle.height &&
                position.y + height > obstacle.y
            ) {
                colliding = true;
                break;
            }
        }
    } while (colliding);
    return position;
}

// Collision detection
function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

//// Generate Obstacles
function generateObstacles() {

	if (!woodImage.complete || !brickImage.complete) {
        console.error('Obstacle images not loaded yet.');
        return;
    }

  obstacles = [
    // Top Horizontal Walls
    { x: 100, y: 60, width: 400, height: 20, type: 'wood', health: 3 }, // Top-left horizontal
    { x: 700, y: 60, width: 400, height: 20, type: 'wood', health: 3 }, // Top-right horizontal

    // Middle Horizontal Walls
    { x: 100, y: 350, width: 400, height: 20, type: 'wood', health: 3 }, // Middle-left horizontal
    { x: 700, y: 330, width: 400, height: 20, type: brickImage }, // Middle-right horizontal

    // Bottom Horizontal Walls
    { x: 100, y: 650, width: 400, height: 20, type: 'wood', health: 3 }, // Bottom-left horizontal
    { x: 700, y: 650, width: 400, height: 20, type: brickImage }, // Bottom-right horizontal

    // Vertical Walls for Maze Pathways
   { x: 500, y: 70, width: 20, height: 300, type:  brickImage }, // Top vertical center
   { x: 700, y: 370, width: 20, height: 300, type: 'wood', health: 3 }, // Bottom vertical center

    // Short Vertical Walls for Side Openings
    { x: 250, y: 150, width: 20, height: 200, type: brickImage }, // Left vertical top
    { x: 850, y: 130, width: 20, height: 200, type: brickImage }, // Right vertical top

    { x: 250, y: 450, width: 20, height: 200, type: brickImage }, // Left vertical bottom
    { x: 850, y: 450, width: 20, height: 200, type: brickImage }, // Right vertical bottom
  ];
  
   console.log('Obstacles generated:', obstacles);
}

/// Generate Power-Ups
function generatePowerUps() {
  powerUps = [
    { ...getRandomPosition(20, 20), width: 20, height: 20, type: 'health', color: 'green' },
    { ...getRandomPosition(20, 20), width: 20, height: 20, type: 'speed', color: 'blue' },
    { ...getRandomPosition(20, 20), width: 20, height: 20, type: 'invincibility', color: 'yellow' },
  ];
}

// Apply power-up effects
function applyPowerUp(player, powerUp) {
    switch (powerUp.type) {
        case 'health':
            player.health = Math.min(player.health + 20, 100);
            break;
        case 'speed':
            player.speed += 2;
            setTimeout(() => (player.speed -= 2), 5000);
            break;
    }
}

// Handle key events
document.addEventListener('keydown', (e) => (keys[e.key] = true));
document.addEventListener('keyup', (e) => {
    if (e.key === player.keyMap.shoot) {
        fireBullet(player);
    }
    keys[e.key] = false;
});

// Update game state
function update() {
  if (gameOver) return;

  	
    const previousX = player.x;
    const previousY = player.y;

    // Move Player
     if (keys[player.keyMap.left] && player.x > 0) {
    player.x -= player.speed;
    player.direction = 'left';
  }
  if (keys[player.keyMap.right] && player.x + player.width < canvas.width) {
    player.x += player.speed;
    player.direction = 'right';
  }
  if (keys[player.keyMap.up] && player.y > 0) {
    player.y -= player.speed;
    player.direction = 'up';
  }
  if (keys[player.keyMap.down] && player.y + player.height < canvas.height) {
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
        
        if (obstacle.image === brickImage) {
        player.bullets.splice(bulletIndex, 1); // Remove bullet
        return; 
      }
      
         // Reduce health for other obstacles
          obstacle.health -= 1;
          player.bullets.splice(bulletIndex, 1); 
          
           // Remove obstacle if health is zero 
          if (obstacle.health <= 0) {
            obstacles.splice(obstacleIndex, 1); 
            score += 10; // Update score for player
          }
        }
      });



      // Remove Bullet if Off-Screen
      if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
        player.bullets.splice(bulletIndex, 1);
      }
    });
    
     updateBullets();
 
}

// Draw game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Player
    drawPlayer();

    // Draw Bullets
    drawBullets();

    // Draw Obstacles
    drawObstacles();

    // Draw Power-Ups
    drawPowerUps();
    
    // Display Score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    
}


// Game loop
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

startButton.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        generateObstacles();
        generatePowerUps();
        gameLoop();
    }
});

