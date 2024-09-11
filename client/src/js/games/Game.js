export default class Game {
    constructor(dataClient) {
        this._dataClient = dataClient;
        this.gameState = this.initializeGameState();
        console.log('Constructing Game now');

        this._dataClient.onGameStateUpdate = (newGameState) => {
            console.log('Received new game state:', newGameState);
            this.mergePartialState(newGameState); // Merge the partial game state update
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

    mergePartialState(partialState) {
        // Iterate over the keys in the partial state and merge them into the existing game state
        console.log(partialState,this.gameState)
        Object.keys(partialState).forEach((key) => {
            if(Array.isArray(partialState[key])){
                this.gameState[key] = partialState[key];
            }
            else if (typeof partialState[key] === 'object' && this.gameState[key]) {
                // For objects (like paddles, ball), perform a shallow merge
                this.gameState[key] = { ...this.gameState[key], ...partialState[key] };
            } else {
                // For primitive values (like scores), simply overwrite them
                this.gameState[key] = partialState[key];
            }
        });
        console.log(partialState,this.gameState)

    }
}
