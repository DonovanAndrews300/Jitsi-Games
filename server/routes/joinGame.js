// server/routes/joinGame.js
const express = require('express');

const redisClient = require('../redisClient');

const router = express.Router();

router.post('/joinGame', (req, res) => {
  const { gameId, playerId } = req.body;
  redisClient.lRange('activeGames', 0, -1)
    .then((replies) => {
      const games = replies.map(reply => JSON.parse(reply));
      const gameIndex = games.findIndex(game => game.gameId === gameId);
      const maxPlayers = 2;
      if (gameIndex !== -1) {
        if (games[gameIndex].players.length > maxPlayers) {
          throw new Error("Too many players");
        }
        games[gameIndex].players.push(playerId);
        return redisClient.lSet('activeGames', gameIndex, JSON.stringify(games[gameIndex]))
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

module.exports = router;
