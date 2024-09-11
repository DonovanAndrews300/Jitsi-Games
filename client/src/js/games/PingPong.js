import Game from './Game.js';

export default class PingPong extends Game {
    constructor(dataClient) {
        super(dataClient); // Pass the WebSocket client to the parent class
        console.log('Constructing Pong now');
        this.player = null;
        this.gameStarted = false; // Track whether the game has started
        this.animationFrameId = null; // Track the animation frame ID
        this.initializeGameState(); // Initializes the game state
        this.handleClickEvents(); // Binds the event listeners for paddle movement and game restart
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
    
        // Get the rendering context for the canvas
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
    }

    handleStartGame(startButton, restartButton) {
        if (!this.gameStarted) {
            this.gameStarted = true; 
            startButton.style.display = 'none'; 
            restartButton.style.display = 'inline'; 
            this.startGameLoop(); 
            this.saveGameState({ gameStarted: true }); // Broadcast the game start state
        }
    }

    assignPlayerPaddle() {
        if (!this.player && this.players) {
            const playerCount = this.players.length; 
            console.log(this.player, playerCount);
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
            isRestarted: false
        };
        this.saveGameState(this.gameState);
    }

    handleRestartGame() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId); // Stop the previous game loop
        }
        this.initializeGameState(); // Reset the game state
        this.gameStarted = false;
        this.gameState.isRestarted = true; 
        this.saveGameState(this.gameState); // Broadcast the reset state with the isRestarted flag
        this.handleStartGame(document.querySelector('.game--start'), document.querySelector('.game--restart'));
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
        paddle.y += delta;
        paddle.y = Math.max(0, Math.min(paddle.y, this.canvas.height - paddle.height)); // Keep paddle within canvas bounds
        this.saveGameState({ [paddleKey]: paddle.y }); // Broadcast only the paddle's new position
    }

    startGameLoop() {
        const gameLoop = () => {
            this.updateBall(); // Update only the ball in the game loop
            this.updateUI();
            this.animationFrameId = requestAnimationFrame(gameLoop); 
        };
        this.animationFrameId = requestAnimationFrame(gameLoop); // Start the game loop
    }

    updateBall() {
        const { ball } = this.gameState;
    
        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;
    
        // Collision with top and bottom of the canvas
        if (ball.y <= 0 || ball.y + ball.size >= this.canvas.height) {
            ball.dy = -ball.dy; // Reverse the vertical direction
            this.saveGameState({ ball: this.gameState.ball }); // Broadcast only the ball's state
        }
    
        // Collision with paddles
        if ((ball.dx < 0 && ball.x <= 20 && ball.y >= this.gameState.paddle1.y && ball.y <= this.gameState.paddle1.y + this.gameState.paddle1.height) ||
            (ball.dx > 0 && ball.x + ball.size >= this.canvas.width - 20 && ball.y >= this.gameState.paddle2.y && ball.y <= this.gameState.paddle2.y + this.gameState.paddle2.height)) {
            ball.dx = -ball.dx; // Reverse the horizontal direction
            this.saveGameState({ ball: this.gameState.ball }); // Broadcast only the ball's state
        }
    
        // Scoring
        if (ball.x <= 0) {
            this.handleScore('score2'); // Player 2 scores
            this.saveGameState({ score2: this.gameState.score2, ball: this.gameState.ball }); // Broadcast the score and ball state
            this.resetBall();
        } else if (ball.x + ball.size >= this.canvas.width) {
            this.handleScore('score1'); // Player 1 scores
            this.saveGameState({ score1: this.gameState.score1, ball: this.gameState.ball }); // Broadcast the score and ball state
            this.resetBall();
        }
    }

    updateUI() {
        // Clear the previous frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw paddles
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(10, this.gameState.paddle1.y, this.gameState.paddle1.width, this.gameState.paddle1.height);
        this.ctx.fillRect(this.canvas.width - 20, this.gameState.paddle2.y, this.gameState.paddle2.width, this.gameState.paddle2.height);
    
        // Draw ball
        this.ctx.fillRect(this.gameState.ball.x, this.gameState.ball.y, this.gameState.ball.size, this.gameState.ball.size);
    
        // Draw scores
        this.ctx.font = '20px Arial';
        this.ctx.fillText(this.gameState.score1, 50, 30);
        this.ctx.fillText(this.gameState.score2, this.canvas.width - 70, 30);
    }

    handleScore(player) {
        this.gameState[player]++;
        this.updateUI(); // Update the score display after scoring
    }

    resetBall() {
        // Reset the ball's position and speed to the initial state
        this.gameState.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: 1, // Reset dx to initial value
            dy: 1  // Reset dy to initial value
        };
        this.saveGameState({ ball: this.gameState.ball }); // Broadcast the reset ball state
    }
}