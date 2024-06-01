import DataClient from './DataClient.js';
import { config } from './config.js';

function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}
const btn = document.getElementById("create-game-button");


btn.addEventListener("click", function () {
    const gameId = generateRandomId();
    const gameSelect = document.getElementById('game-select');
    const selectedGame = gameSelect.value;
    const protoGame = {
        gameId: gameId,
        players: [],
        gameState: {}
    };

    const _dataClient = new DataClient(config.apiUrl, config.wsUrl);
    _dataClient.createGame(protoGame).then(() => {
        window.location.href = `/src/pages/gameContainer.html?id=${gameId}&gameType=${selectedGame}`;
    });
  });
