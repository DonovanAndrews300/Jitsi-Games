import Game from './Game.js';

export default class PingPong extends Game {
        constructor(dataClient) {
        super(dataClient); // Pass the WebSocket client to the parent class
        console.log('Constructing Pong now');
        this.player = null;
        this.gameStarted = false;
        this.animationFrameId = null;
        this.initializeGameState();
        this.handleClickEvents();
        this._dataClient = dataClient;

        // Listen for WebSocket updates
        this._dataClient.onGameStateUpdate = (newGameState) => {
            this.mergePartialState(newGameState);
            if (newGameState.gameStarted && !this.gameStarted) {
                this.handleStartGameFromSync();
            }
            this.updateUI();
        };
    }
    

    renderGame(gameInfo) {
        this.players = gameInfo?.players;
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = ''; 
    
        // Create and configure the canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.canvas.id = 'pongCanvas';
        gameArea.appendChild(this.canvas);
    
        this.ctx = this.canvas.getContext('2d');
       
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Game';
        startButton.className = 'game--start';
        gameArea.appendChild(startButton);
    
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Game';
        restartButton.className = 'game--restart';
        gameArea.appendChild(restartButton);
        restartButton.style.display = 'none';
    
        startButton.addEventListener('click', () => this.handleStartGame(startButton, restartButton));
        restartButton.addEventListener('click', () => this.handleRestartGame());
        this.assignPlayerPaddle();
        // Check if the game has already started on another client
        if (gameInfo?.gameStarted) {
            this.gameStarted = true;
            startButton.style.display = 'none';
            restartButton.style.display = 'inline';
            this.startGameLoop(); // Start the game loop for this client too
        }
    }

    handleStartGame(startButton, restartButton) {
        if (!this.gameStarted) {
            this.gameStarted = true;
            // Broadcast the game started state to all clients
            this.saveGameState({ gameStarted: true });
            startButton.style.display = 'none'; 
            restartButton.style.display = 'inline'; 
            this.startGameLoop(); 
        }
    }

    handleStartGameFromSync() {
        // Sync the game start for clients receiving the start state
        if(!this.gameStarted) {
              this.gameStarted = true;
        const startButton = document.querySelector('.game--start');
        const restartButton = document.querySelector('.game--restart');

        if (startButton && restartButton) {
            startButton.style.display = 'none';
            restartButton.style.display = 'inline';
        }

        // Start the game loop when synced
        this.startGameLoop();
        }
      
    }

    handleRestartGame() {

        this.initializeGameState(); // Reset the game state
        this.gameStarted = false; // Reset the gameStarted flag
        this.updateUI(); // Update the UI to reflect the reset
        this.saveGameState({ gameStarted: false, isRestarted: true }); // Broadcast the reset state
    }

    assignPlayerPaddle() {
        if (!this.player && this.players) {
            const playerCount = this.players.length;
            this.player = playerCount === 1 ? 'paddle1' : 'paddle2';
        }
    }

    initializeGameState() {
        this.gameState = {
            paddle1: { y: 150, height: 100, width: 10 },
            paddle2: { y: 150, height: 100, width: 10 },
            ball: { x: 300, y: 200, dx: 1, dy: 1, size: 10 },
            score1: 0,
            score2: 0,
            gameStarted: false, // Initialize as false
            isRestarted: false,
        };
        this.saveGameState(this.gameState);
    }

    handleClickEvents() {
        document.addEventListener('keydown', (event) => {
            if (this.player === 'paddle1' || this.player === 'paddle2') {
                switch (event.key) {
                    case 'w':
                    case 'ArrowUp':
                        this.movePaddle(this.player, -10);
                        break;
                    case 's':
                    case 'ArrowDown':
                        this.movePaddle(this.player, 10);
                        break;
                }
            }
        });
    }

    movePaddle(paddleKey, delta) {
        const paddle = this.gameState[paddleKey];
        // Update paddle position based on key press
        paddle.y += delta;
        // Prevent the paddle from going out of bounds
        paddle.y = Math.max(0, Math.min(paddle.y, this.canvas.height - paddle.height));
    
        // Save only the paddle's state (do not update the entire game state)
        const updatedPaddleState = {
            [paddleKey]: { y: paddle.y, height: paddle.height, width: paddle.width }
        };
    
        // Send only the updated paddle state to the server (or save it locally)
        this.saveGameState(updatedPaddleState);
    }
    

    startGameLoop() {
        const gameLoop = () => {
            this.updateBall(); 
            this.updateUI();
            this.animationFrameId = requestAnimationFrame(gameLoop); 
        };
        this.animationFrameId = requestAnimationFrame(gameLoop);
    }

    updateBall() {
        const { ball } = this.gameState;
    
        // Move the ball
        ball.x += ball.dx;
        ball.y += ball.dy;
    
        // Top and bottom boundary collision
        if (ball.y <= 0 || ball.y + ball.size >= this.canvas.height) {
            ball.dy = -ball.dy;
            // Save only the ball state on collision
            this.saveGameState({ ball: { ...ball } });
        }
    
        // Paddle collision (left and right)
        if ((ball.dx < 0 && ball.x <= 20 && ball.y >= this.gameState.paddle1.y && ball.y <= this.gameState.paddle1.y + this.gameState.paddle1.height) ||
            (ball.dx > 0 && ball.x + ball.size >= this.canvas.width - 20 && ball.y >= this.gameState.paddle2.y && ball.y <= this.gameState.paddle2.y + this.gameState.paddle2.height)) {
            ball.dx = -ball.dx;
            // Save only the ball state on collision
            this.saveGameState({ ball: { ...ball } });
        }
    
        // Scoring
        if (ball.x <= 0) {
            this.handleScore('score2');
            this.resetBall(); // Reset the ball only on scoring
            this.saveGameState({ score2: this.gameState.score2 });
        } else if (ball.x + ball.size >= this.canvas.width) {
            this.handleScore('score1');
            this.resetBall(); // Reset the ball only on scoring
            this.saveGameState({ score1: this.gameState.score1 });
        }
    }
    
    

    updateUI() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(10, this.gameState.paddle1.y, this.gameState.paddle1.width, this.gameState.paddle1.height);
        this.ctx.fillRect(this.canvas.width - 20, this.gameState.paddle2.y, this.gameState.paddle2.width, this.gameState.paddle2.height);

        this.ctx.fillRect(this.gameState.ball.x, this.gameState.ball.y, this.gameState.ball.size, this.gameState.ball.size);

        this.ctx.font = '20px Arial';
        this.ctx.fillText(this.gameState.score1, 50, 30);
        this.ctx.fillText(this.gameState.score2, this.canvas.width - 70, 30);
    }

    handleScore(player) {
        this.gameState[player]++;
        this.updateUI();
    }

    resetBall() {
        this.gameState.ball = { x: 300, y: 200, dx: 1, dy: 1, size: 10 };
        console.log(this.gameState.ball);
        this.saveGameState({ ball: this.gameState.ball });
    }
}