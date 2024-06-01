export default class DataClient {
    constructor(apiUrl, wsUrl, playerId) {
        this.apiUrl = apiUrl;
        this.wsUrl = wsUrl;
        this.ws = null;
        this.gameId = null;
        this.playerId = playerId;
        this.onGameStateUpdate = null; // Callback function to handle game state updates. This can vary depending on the game being played
    }

    connectWebSocket() {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connection established');
            this.initGameState();
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };
    }

    handleMessage(message) {
        const { gameId, gameState } = message;
        console.log(`Received game state update ${gameId}:`, gameState);
        if (this.gameId === gameId && this.onGameStateUpdate) {
            this.onGameStateUpdate(gameState);
        }
    }

    async createGame(gameData) {
        try {
            const response = await fetch(`${this.apiUrl}game`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameData)
            });
            const result = await response.json();
            this.gameId = result.gameId;
            console.log('Game created:', result);
            return result;
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    }

    async leaveGame(gameId, playerId) {
        try {
            const response = await fetch(`${this.apiUrl}leaveGame`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gameId, playerId })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const result = await response.json();
            if (this.gameId === gameId) {
                this.gameId = null; // Clear the gameId if the player leaves the game they are currently in
            }
            console.log('Player left the game:', result);
            return result;
        } catch (error) {
            console.error('Error leaving game:', error);
            throw error;
        }
    }
    
    async joinGame(gameId, playerId) {
        try {
            const response = await fetch(`${this.apiUrl}joinGame`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gameId, playerId })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const result = await response.json();
            this.gameId = gameId;
            this.initGameState(); // Initialize game state after joining a game
            return result;
        } catch (error) {
            console.error('Error joining game:', error);
            throw error;
        }
    }

    sendGameStateUpdate(gameState) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type: 'UPDATE_GAME_STATE', gameId: this.gameId, playerId: this.playerId, gameState });
            this.ws.send(message);
        } else {
            console.error('WebSocket is not open');
        }
    }

    initGameState() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type: 'JOIN_GAME', gameId: this.gameId, playerId: this.playerId });
            this.ws.send(message);
        } else {
            console.error('WebSocket is not open');
        }
    }
}
