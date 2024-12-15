const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// WebSocket connection
const ws = new WebSocket(`ws://${window.location.host}`);

// Game State
let myPlayerId = null;
const players = {};
let gameRunning = false;

// Keys state
const keys = {};

// Handle WebSocket messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'init') {
    myPlayerId = data.playerId;
    Object.assign(players, data.players);
  } else if (data.type === 'updatePlayers') {
    // Replace the players object with the updated one from the server
    Object.keys(players).forEach((id) => {
      if (!data.players[id]) {
        console.log(`Player ${id} removed.`);
        delete players[id]; // Remove missing players
      }
    });

    Object.assign(players, data.players);
    console.log('Updated players:', players);
  } else if (data.type === 'updatePlayer') {
    players[data.player.id] = data.player;
  } else if (data.type === 'shoot') {
    const { playerId, bullet } = data;
    if (players[playerId]) {
      players[playerId].bullets.push(bullet);
    }
  }
};


// Reset Game
function resetGame() {
  gameRunning = true;
  startButton.style.display = 'none';
}

// Start Game Button
startButton.addEventListener('click', () => {
  if (!gameRunning) {
    resetGame();
    gameLoop();
  }
});

// Handle Key Events
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Update Game State
function update() {
  if (!gameRunning) return;

  const player = players[myPlayerId];
  if (!player) return;

  const previousX = player.x;
  const previousY = player.y;

  if (keys['ArrowLeft']) player.x -= 5;
  if (keys['ArrowRight']) player.x += 5;
  if (keys['ArrowUp']) player.y -= 5;
  if (keys['ArrowDown']) player.y += 5;

  if (player.x !== previousX || player.y !== previousY) {
    ws.send(
      JSON.stringify({
        type: 'move',
        playerId: myPlayerId,
        x: player.x,
        y: player.y,
      })
    );
  }
}

// Draw Game Elements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  Object.values(players).forEach((player) => {
    // Draw each player as a green rectangle
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, 50, 50);

    // Draw bullets
    player.bullets.forEach((bullet) => {
      ctx.fillStyle = 'red';
      ctx.fillRect(bullet.x, bullet.y, 10, 20);
    });
  });
}


// Game Loop
function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();

