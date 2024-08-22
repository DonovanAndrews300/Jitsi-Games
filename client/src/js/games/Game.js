export default class Game {
    constructor(dataClient) {
        this._dataClient = dataClient;
        this.gameState = this.initializeGameState();
        console.log('Constructing Game now');

        this._dataClient.onGameStateUpdate = (newGameState) => {
            console.log('Received new game state:', newGameState);
            this.gameState = newGameState;
            this.updateUI();
        };

        this._dataClient.connectWebSocket();
        this.renderGame();
    }

    saveGameState() {
        this._dataClient.sendGameStateUpdate(this.gameState);
    }

    handleRestartGame() {
        this.gameState = this.initializeGameState();
        this.updateUI();
        this.saveGameState();
    }
}
