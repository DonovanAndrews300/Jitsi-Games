const WebSocket = require('ws');
const redisClient = require('./redisClient');

const gameRooms = new Map();

function attach(server) {
  const wss = new WebSocket.Server({ server });
  console.log("WebSocket server attached");

  wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', async (message) => {
      const parsedMessage = JSON.parse(message);
      const { type, gameId, playerId, gameState } = parsedMessage;
      if (type === 'ADD_PEER') {
        ws.peerId = parsedMessage.peerId;

        wss.clients.forEach((client) => {
          if (client !== ws && client.peerId && ws.gameId === client.gameId) {
            client.send(JSON.stringify({ type: 'INCOMING_CALL', peerId: ws.peerId }));
          }
        });
      }

      if (playerId) {
        ws.playerId = playerId;
      }

      if (gameId) {  
        ws.gameId = gameId;
      }

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

    ws.on('close', async () => {
      console.log('Client disconnected');
      gameRooms.forEach((clients, gameId) => {
        const index = clients.indexOf(ws);
        if (index !== -1) {
          clients.splice(index, 1);
          if (clients.length===0) {
            gameRooms.delete(gameId);
          }
        }
      });
      if (ws.playerId) {
        try {
          const replies = await redisClient.lRange('activeGames', 0, -1);
          const games = replies.map(reply => JSON.parse(reply));
          const gameIndex = games.findIndex(game => game.gameId === ws.gameId);
          if (gameIndex !== -1) {
            const game = games[gameIndex];
            const playerIndex = game.players.indexOf(ws.playerId);
            if (playerIndex !== -1) {
              game.players.splice(playerIndex, 1);
            }
            games[gameIndex] = game;
            await redisClient.lSet('activeGames', gameIndex, JSON.stringify(games[gameIndex]));
            broadcastGameState(ws.gameId, game.gameState);
          }
        } catch (err) {
          console.error('Redis error:', err);
        }
      }
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

  return wss;
}

module.exports = { attach };
