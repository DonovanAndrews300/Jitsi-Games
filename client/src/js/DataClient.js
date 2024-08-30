export default class DataClient {
    constructor(apiUrl, wsUrl, playerId) {
        this.apiUrl = apiUrl;
        this.wsUrl = wsUrl;
        this.ws = null;
        this.localStream = null;
        this.gameId = null;
        this.playerId = null;
        this.onGameStateUpdate = null; // Callback function to handle game state updates
        this.peer = null;
    }

    connectWebSocket() {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connection established');
            this.initGameState();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onclose = () => {
            this.peer.destroy();
            console.log('WebSocket connection closed');
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };
    }

    handleMessage(message) {
        if (message.type === 'INCOMING_CALL') {
            const { peerId } = message;
            const call = this.peer.call(peerId, this.localStream);
            call.on('stream', remoteStream => {
            const remoteVideo = document.getElementById("remoteVideo");
            remoteVideo.srcObject = remoteStream;
        });
}
        if (message.gameState) {
            const { gameId, gameState } = message;
            if (this.gameId === gameId && this.onGameStateUpdate) {
                this.onGameStateUpdate(gameState);
            }
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

    async initVideoCall() {
        try {
            const localVideo = document.getElementById("localVideo");
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = this.localStream;

            this.peer = new Peer(undefined, {
                secure:true,
                path:'/peerjs',
                host: 'https://jitsi-game-peer-server.onrender.com',
            });

            this.peer.on('open', id => {
                console.log('Peer connection open with ID:', id);
                this.ws.send(JSON.stringify({ type: "ADD_PEER", peerId: id }))
            });

            this.peer.on('call', (call) =>{
               call.answer(this.localStream)
               call.on('stream', (remoteStream) => {
                const remoteVideo = document.getElementById("remoteVideo");
                remoteVideo.srcObject = remoteStream;
               })
            })

            this.peer.on('error', err => {
                console.error('PeerJS error:', err);
            });

        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    }
}
