// server/routes/game.js
const express = require('express');
const redisClient = require('../redisClient');

const router = express.Router();

router.post('/game', (req, res) => {
    const gameData = req.body;
    redisClient.lPush('activeGames', JSON.stringify(gameData))
        .then(() => {
            res.status(200).json({ message: 'Game created', gameId: gameData.gameId });
        })
        .catch((err) => {
            console.error('Error saving game data:', err);
            res.status(500).json({ error: 'Failed to create game' });
        });
});

module.exports = router;
