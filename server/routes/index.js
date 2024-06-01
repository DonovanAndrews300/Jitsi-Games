// server/routes/index.js
const express = require('express');
const gameRoutes = require('./game');
const joinGameRoutes = require('./joinGame');
const leaveGameRoutes = require('./leaveGame');

const router = express.Router();

router.use(gameRoutes);
router.use(joinGameRoutes);
router.use(leaveGameRoutes);

module.exports = router;
