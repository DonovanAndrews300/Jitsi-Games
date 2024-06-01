// server/websocket.js
const WebSocket = require('ws');
const redis = require('redis');
const redisClient = redis.createClient();

const gameRooms = new Map();

function attach(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', async (message) => {
      const parsedMessage = JSON.parse(message);
      const { type, gameId, playerId, gameState } = parsedMessage;

      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, []);
      }

      const clients = gameRooms.get(gameId);
      if (!clients.includes(ws)) {
        clients.push(ws);
      }

      try {
        const replies = await redisClient.lRange('activeGames', 0, -1);
        const games = replies.map(reply => JSON.parse(reply));
        const gameIndex = games.findIndex(game => game.gameId === gameId);

        if (gameIndex === -1) {
          throw new Error('Game not found');
        }

        let currentState = games[gameIndex].gameState;

        if (type === 'JOIN_GAME' && currentState && Object.keys(currentState).length > 0) {
          ws.send(JSON.stringify({ gameId, gameState: currentState }));
        } else if (type === 'UPDATE_GAME_STATE') {
          currentState = { ...currentState, ...gameState };
          games[gameIndex].gameState = currentState;

          await redisClient.lSet('activeGames', gameIndex, JSON.stringify(games[gameIndex]));
          broadcastGameState(gameId, currentState);
        }
      } catch (err) {
        console.error('Redis error:', err);
      }
    });

    ws.on('close', () => {
      console.log('client disconnected');
      gameRooms.forEach((clients, gameId) => {
        const index = clients.indexOf(ws);
        if (index !== -1) {
          clients.splice(index, 1);
          if (clients.length === 0) {
            gameRooms.delete(gameId);
          }
        }
      });
    });
  });

  function broadcastGameState(gameId, gameState) {
    const clients = gameRooms.get(gameId) || [];
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ gameId, gameState }));
      }
    });
  }
}

module.exports = { attach };
