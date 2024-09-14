export default class Game {
    constructor(dataClient) {
        this._dataClient = dataClient;
        this.gameState = this.initializeGameState();
        console.log('Constructing Game now');

        this._dataClient.connectWebSocket();
    }

    saveGameState(gameState) {
        this._dataClient.sendGameStateUpdate(gameState);
    }

    handleRestartGame() {
        this.gameState = this.initializeGameState();
        this.updateUI();
        this.saveGameState();
    }

    mergePartialState(partialState) {
        console.log(partialState,this.gameState)
        Object.keys(partialState).forEach((key) => {
            if(Array.isArray(partialState[key])){
                this.gameState[key] = partialState[key];
            }
            else if (typeof partialState[key] === 'object' && this.gameState[key]) {
                this.gameState[key] = { ...this.gameState[key], ...partialState[key] };
            } else {
                this.gameState[key] = partialState[key];
            }
        });
        console.log(partialState,this.gameState)
    }
}
