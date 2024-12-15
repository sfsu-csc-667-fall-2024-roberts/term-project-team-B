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



const MAX_PLAYERS = 4;

// Store player data
interface Player {
  id: number;
  x: number;
  y: number;
  direction: string;
  bullets: any[];
}

const players: Record<number, Player> = {};

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

// WebSocket handling
wss.on('connection', (ws: WS) => {
console.log('New WebSocket connection');
  if (Object.keys(players).length >= MAX_PLAYERS) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
    ws.close();
    return;
  }

  const playerId = Date.now();
  players[playerId] = { id: playerId, x: 100, y: 100, direction: 'up', bullets: [] };
  
  console.log(`Player ${playerId} connected. (${Object.keys(players).length}/${MAX_PLAYERS})`);

  // Notify the new player about their ID and all players
  ws.send(
    JSON.stringify({
      type: 'init',
      playerId,
      players,
    })
  );

  

  // Broadcast the updated player list to all clients
  broadcast({
    type: 'updatePlayers',
    players,
  });
  console.log('Broadcasted players:', players); // Debug log
  
  // Start the game if 4 players are connected
  if (Object.keys(players).length === MAX_PLAYERS) {
    console.log('Starting game...');
    broadcast({ type: 'startGame' });
  }

  // Handle incoming messages
  ws.on('message', (message: string) => {
console.log('Received message:', message);
    const data: { type: string; playerId?: number; [key: string]: any } = JSON.parse(message);
console.log('Received data:', data);
    if (data.type === 'move' && data.playerId && players[data.playerId]) {
      players[data.playerId].x = data.x;
      players[data.playerId].y = data.y;
      players[data.playerId].direction = data.direction;
        
	console.log('Broadcasting players:', players);
        broadcast({
          type: 'updatePlayer',
          player: players[data.playerId],
        });
      
    } 
    /*
    else if (data.type === 'shoot') {
      if (players[data.playerId]) {
        players[data.playerId].bullets.push(data.bullet);

        broadcast({
          type: 'shoot',
          playerId: data.playerId,
          bullet: data.bullet,
        });
      }
    }
    */
  });

  // Handle disconnection
  ws.on('close', () => {
  console.log('WebSocket closed');
    // Remove the disconnected player
    delete players[playerId];
    console.log(`Player ${playerId} disconnected. (${Object.keys(players).length}/${MAX_PLAYERS})`);
	console.log('Broadcasting players:', players);
    // Broadcast updated player list to all clients
    broadcast({
      type: 'updatePlayers',
      players,
    });
     console.log('Broadcasted players:', players); // Debug log
  });
});

// Broadcast a message to all clients
function broadcast(data: any) {
  wss.clients.forEach((client: WS) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
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
