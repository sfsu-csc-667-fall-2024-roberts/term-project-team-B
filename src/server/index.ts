import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";
import './db';


import rootRoutes from './routes/root';
import authRoutes from './routes/auth';
import gameRoutes from './routes/others';
import createGame from './routes/others';
import game from './routes/game';
import openGames from './routes/others';
import profile from './routes/others';
import chat from './routes/others';
import login from './routes/others';

//import { json } from "stream/consumers";
//import WebSocket, { Server as WebSocketServer } from 'ws';
import { WebSocket as WS, Server as WebSocketServer } from 'ws';





import connectLiveReload from "connect-livereload";
import livereload from "livereload";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

const staticPath = path.join(process.cwd(), "src", "public");
//const WebSocket = require('ws');
const http = require('http');
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set<WebSocket>(); // To keep track of connected WebSocket clients

let playerIdCounter = 0;


const MAX_PLAYERS = 4;


const players: Record<string, Player> = {};

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(process.cwd(), "src", "public")));

app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

//Routes
app.use("/", rootRoutes);
app.use("/auth", authRoutes);
//app.use("/game", gameRoutes);
app.use("/", gameRoutes);
app.use("/", createGame);
app.use("/", game);
app.use("/", openGames);
app.use("/", profile);
app.use("/", chat);
app.use("/", login);


app.get('/howto', (req, res) => {
  res.render('howto');
});

app.use((_request, _response, next) => {
  next(httpErrors(404));
});

app.use(express.static(staticPath));

if (process.env.NODE_ENV === "development") {
  const reloadServer = livereload.createServer();

  reloadServer.watch(staticPath);
  reloadServer.server.once("connection", () => {
    setTimeout(() => {
      reloadServer.refresh("/");
    }, 100);
  });
  app.use(connectLiveReload());
}


interface Player {
    id: string;
    x: number;
    y: number;
    direction: string;
    width: number;
    height: number;
    bullets: Bullet[];
    health: number; 
}

interface Bullet {
    x: number;
    y: number;
    dx: number;
    dy: number;
}


// Generate unique player IDs
function generateUniquePlayerId(): string {
    return `player-${playerIdCounter++}`;
}


// Periodically broadcast all players' states
setInterval(() => {
    broadcast({
        type: 'updatePlayers',
        players,
    });
}, 100); // Update every 100ms

function getUniquePosition(existingPlayers: Record<string, Player>): { x: number; y: number } {
    const canvasWidth = 120; // Replace with actual canvas width
    const canvasHeight = 800; // Replace with actual canvas height
    const padding = 50; // Ensure players are not too close to the edges

    let position;
    let isColliding;

    do {
        isColliding = false;
        position = {
            x: Math.floor(Math.random() * (canvasWidth - padding * 2) + padding),
            y: Math.floor(Math.random() * (canvasHeight - padding * 2) + padding),
        };

        // Check for collisions with existing players
        for (const player of Object.values(existingPlayers)) {
            if (
                position.x < player.x + player.width &&
                position.x + 55 > player.x && // Assuming default width is 55
                position.y < player.y + player.height &&
                position.y + 90 > player.y // Assuming default height is 90
            ) {
                isColliding = true;
                break;
            }
        }
    } while (isColliding);

    return position;
}



wss.on('connection', (ws: WS) => {
    console.log('New WebSocket connection');

    // Reject connection if game is full
    if (Object.keys(players).length >= MAX_PLAYERS) {
        ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
        ws.close();
        return;
    }

    // Assign a unique ID and initialize player
    const playerId = generateUniquePlayerId();
    const position = getUniquePosition(players);
    
    players[playerId] = {
        id: playerId,
        x: position.x,
        y: position.y,
        width: 55,
        height: 90,
        direction: 'up',
         health: 100,
        bullets: [],
    };

    console.log(`Player ${playerId} connected. (${Object.keys(players).length}/${MAX_PLAYERS})`);

    // Send initialization data to the new player
    ws.send(
        JSON.stringify({
            type: 'init',
            playerId,
            players,
        })
    );

    // Notify all clients about the new player
    broadcast({
        type: 'updatePlayers',
        players,
    });

    // Start the game if the required number of players is connected
    if (Object.keys(players).length === MAX_PLAYERS) {
        console.log('Starting game with players:', players);
        broadcast({ type: 'startGame' });
    }

    // Handle incoming messages
ws.on('message', (message: string) => {
    const data = JSON.parse(message);

    if (data.type === 'move' && players[data.playerId]) {
        // Update player position and direction
        Object.assign(players[data.playerId], {
            x: data.x,
            y: data.y,
            direction: data.direction,
        });

        broadcast({
            type: 'updatePlayers',
            players,
        });
    } else if (data.type === 'shoot' && players[data.playerId]) {
        const bullet = {
            x: players[data.playerId].x + players[data.playerId].width / 2,
            y: players[data.playerId].y,
            dx: 0,
            dy: -5, // Move upward
        };

        players[data.playerId].bullets.push(bullet);

        broadcast({
            type: 'shoot',
            playerId: data.playerId,
            bullet,
        });
    }
    console.log(`Player ${playerId} connected at (${position.x}, ${position.y}).`);
});


    // Handle disconnection
    ws.on('close', () => {
        delete players[playerId];
        console.log(`Player ${playerId} disconnected. (${Object.keys(players).length}/${MAX_PLAYERS})`);

        broadcast({
            type: 'updatePlayers',
            players,
        });
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});


function broadcast(message: any) {
    //console.log('Broadcasting:', message); // Log the message being sent
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}


/*
// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Tank game running at http://localhost:${PORT}`);
});
*/

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
