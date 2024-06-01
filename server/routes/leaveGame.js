const express = require('express');
const redisClient = require('../redisClient');


const router = express.Router();

router.post('/leaveGame', (req, res) => {
    const { gameId, playerId } = req.body;

    redisClient.lRange('activeGames', 0, -1)
        .then((replies) => {
            const games = replies.map(reply => JSON.parse(reply));
            const gameIndex = games.findIndex(game => game.gameId === gameId);

            if (gameIndex !== -1) {
                const playerIndex = games[gameIndex].players.indexOf(playerId);
                if (playerIndex === -1) {
                    res.status(404).json({ error: "Player not found in the game" });
                    return;
                }
                const originalGame = JSON.stringify(games[gameIndex]);
                games[gameIndex].players.splice(playerIndex, 1);
                if (games[gameIndex].players.length === 0) {
                    return redisClient.lRem('activeGames', 0, originalGame)
                        .then(() => {
                            console.log("Game removed:", gameId);
                            res.status(200).json({ message: 'Player left and game removed since no players are left' });
                        })
                        .catch((err) => {
                            console.error("Error removing game:", err);
                            res.status(500).json({ error: err.message });
                        });
                } else {
                    return redisClient.lSet('activeGames', gameIndex, JSON.stringify(games[gameIndex]))
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

module.exports = router;
