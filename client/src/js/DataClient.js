export default class DataClient {
    constructor(apiUrl, wsUrl) {
        this.apiUrl = apiUrl;
        this.wsUrl = wsUrl;
        this.ws = null;
        this.gameId = null;
    }

    connectWebSocket() {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connection established');
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
        const { gameId, data } = message;
        console.log(`Received game state update for game ${gameId}:`, data);
        // Handle the received game state update
    }

    async createGame(gameData) {
        try {
            const response = await fetch(`${this.apiUrl}/game`, {
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
            const response = await fetch(`${this.apiUrl}/leaveGame`, {
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
            const response = await fetch(`${this.apiUrl}/joinGame`, {
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
            return result;
        } catch (error) {
            console.error('Error joining game:', error);
            throw error;
        }
    }

    sendGameStateUpdate(gameState) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ gameId: this.gameId, gameState });
            this.ws.send(message);
        } else {
            console.error('WebSocket is not open');
        }
    }
}
