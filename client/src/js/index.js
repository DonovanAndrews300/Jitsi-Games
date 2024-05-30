function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}

function createGame() {
    const gameSelect = document.getElementById('game-select');
    const selectedGame = gameSelect.value;
    const gameId = generateRandomId();
    window.location.href = `./src/pages/gameContainer.html?id=${gameId}`;
}