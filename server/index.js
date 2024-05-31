require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 4000;
const client = redis.createClient();
client.connect()
const wss = new WebSocket.Server({ port: 8080 });
const gameRooms = new Map();// Better performance for lotta gamerooms++

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.on('connect', () => {
    console.log('Redis is connected');
});

app.use(bodyParser.json());
app.use(cors());


// Create a new game 
app.post('/game', (req, res) => {
    const gameData = req.body;
    client.lPush('activeGames', JSON.stringify(gameData))
        .then(() => {
            res.status(200).json({ message: 'Game created', gameId: gameData.gameId });
        })
        .catch((err) => {
            console.error('Error saving game data:', err);
            res.status(500).json({ error: 'Failed to create game' });
        });
});


app.post('/joinGame', (req, res) => {
    const { gameId, playerId } = req.body;
    client.lRange('activeGames', 0, -1)
        .then((replies) => {
            const games = replies.map(reply => JSON.parse(reply));
            const gameIndex = games.findIndex(game => game.gameId === gameId);
            const maxPlayers = 2;
            if (gameIndex !== -1) {
                if (games[gameIndex].players.length >= maxPlayers) {
                    throw new Error("Too many players");                    
                }
                games[gameIndex].players.push(playerId);
                return client.lSet('activeGames', gameIndex, JSON.stringify(games[gameIndex]))
                    .then(() => {
                        console.log("Updated game:", games[gameIndex]);
                        res.status(200).json({ message: 'Player joined the game', game: games[gameIndex] });
                    });
            } else {
                res.status(404).json({ error: 'Game not found' });
            }
        })
        .catch((err) => {
            console.error("Error fetching or updating games:", err);
            res.status(500).json({ error: err.message });
        });
});



app.post('/leaveGame', (req, res) => {
    const { gameId, playerId } = req.body;

    client.lRange('activeGames', 0, -1)
        .then((replies) => {
            const games = replies.map(reply => JSON.parse(reply));
            const gameIndex = games.findIndex(game => game.gameId === gameId);

            if (gameIndex !== -1) {
                const playerIndex = games[gameIndex].players.indexOf(playerId);
                if (playerIndex === -1) {
                    res.status(404).json({ error: "Player not found in the game" });
                    return;
                }
                const originalGame = JSON.stringify(games[gameIndex]); // Save the original game state as a string
                games[gameIndex].players.splice(playerIndex, 1);
                if (games[gameIndex].players.length === 0) {
                    // Remove the game if there are no players left
                    return client.lRem('activeGames', 0, originalGame)
                        .then(() => {
                            console.log("Game removed:", gameId);
                            res.status(200).json({ message: 'Player left and game removed since no players are left' });
                        })
                        .catch((err) => {
                            console.error("Error removing game:", err);
                            res.status(500).json({ error: err.message });
                        });
                } else {
                    // Update the game with the remaining players
                    return client.lSet('activeGames', gameIndex, JSON.stringify(games[gameIndex]))
                        .then(() => {
                            console.log("Updated game:", games[gameIndex]);
                            res.status(200).json({ message: 'Player left the game', game: games[gameIndex] });
                        })
                        .catch((err) => {
                            console.error("Error updating game:", err);
                            res.status(500).json({ error: err.message });
                        });
                }
            } else {
                res.status(404).json({ error: 'Game not found' });
            }
        })
        .catch((err) => {
            console.error("Error fetching or updating games:", err);
            res.status(500).json({ error: err.message });
        });
});

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        const { gameId, gameState } = parsedMessage;
        if (!gameRooms.has(gameId)) {
            gameRooms.set(gameId, []);
        }
        const clients = gameRooms.get(gameId);
        if (!clients.includes(ws)) {
            clients.push(ws);
        } 
        client.lRange('activeGames', 0, -1)
            .then(replies => {
                const games = replies.map(reply => JSON.parse(reply)); // List of current games
                const gameIndex = games.findIndex(game => game.gameId === gameId); // Game the request came from

                if (gameIndex === -1) {
                    throw new Error('Game not found');
                }

                let currentState = games[gameIndex].gameState;

                // Update game state with new data
                currentState = { ...currentState, ...gameState };

                // Save updated game state to Redis
                games[gameIndex].gameState = currentState;
                return client.lSet('activeGames', gameIndex, JSON.stringify(games[gameIndex]))
                    .then(() => currentState);
            })
            .then(updatedState => {
                // Broadcast updated game state to all clients in the game room
                broadcastGameState(gameId, updatedState);
            })
            .catch(err => {
                console.error('Redis error:', err);
       });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcastGameState(gameId, gameState) {
    const clients = gameRooms.get(gameId) || [];
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ gameId, gameState }));
        }
    });
};


app.listen(port, () => console.log(`Running on port ${port}`));
