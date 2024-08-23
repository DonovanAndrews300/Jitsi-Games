import Game from './Game.js';

export default class PingPong extends Game {
    constructor(dataClient) {
        super(dataClient);
        console.log('Constructing Pong now');
        this.renderGame(); // Injects the required HTML into the DOM
        this.initializeGameState(); // Initializes the game state
        this.handleClickEvents(); // Binds the event listeners for paddle movement and game restart
        this.startGameLoop(); // Starts the game loop
    }

    renderGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = ''; // Clear any existing content in the game area
    
        // Create and configure the canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.canvas.id = 'pongCanvas';
        gameArea.appendChild(this.canvas);
    
        // Get the rendering context for the canvas
        this.ctx = this.canvas.getContext('2d');
    
        // Create and configure the restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Game';
        restartButton.className = 'game--restart';
        gameArea.appendChild(restartButton);
    
        // Bind the restart button click event
        restartButton.addEventListener('click', () => this.handleRestartGame());
    }

    initializeGameState() {
        this.gameState = {
            paddle1: { y: 150, height: 100, width: 10 },
            paddle2: { y: 150, height: 100, width: 10 },
            ball: { x: 300, y: 200, dx: 2, dy: 2, size: 10 },
            score1: 0,
            score2: 0,
        };
    }

   

    handleRestartGame() {
        this.initializeGameState(); // Reset the game state
        this.updateUI(); // Re-render the game
    }

    handleClickEvents() {
        document.querySelector('.game--restart').addEventListener('click', () => this.handleRestartGame());
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp': this.movePaddle('paddle2', -10); break;
                case 'ArrowDown': this.movePaddle('paddle2', 10); break;
                case 'w': this.movePaddle('paddle1', -10); break;
                case 's': this.movePaddle('paddle1', 10); break;
            }
        });
    }

    movePaddle(paddleKey, delta) {
        const paddle = this.gameState[paddleKey];
        paddle.y += delta;
        paddle.y = Math.max(0, Math.min(paddle.y, this.canvas.height - paddle.height)); // Keep paddle within canvas bounds
        this.updateUI(); // Update the UI after paddle movement
    }

    startGameLoop() {
        const gameLoop = () => {
            this.updateBall();
            this.updateUI();
            requestAnimationFrame(gameLoop); // Request the next frame to keep the loop going
        };
        gameLoop(); // Start the game loop
    }

    updateBall() {
        const { ball, paddle1, paddle2, width, height } = this.gameState;
    
        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;
    
        // Collision with top and bottom of the canvas
        console.log(ball,this.canvas.scrollHeight)
        if (ball.y <= 0) {
            ball.y = 0; // Correct the position if it slightly moves out of bounds
            ball.dy = -ball.dy; // Reverse the vertical direction
        } else if (ball.y + ball.size >= this.canvas.scrollHeight) {
            ball.y = this.canvas.scrollHeight - ball.size; // Correct the position if it slightly moves out of bounds
            ball.dy = -ball.dy; // Reverse the vertical direction
        }
    
        // Collision with left and right of the canvas (scoring)
        if (ball.x <= 0) {
            this.handleScore('score2'); // Player 2 scores
            this.resetBall();
            return; // Exit the function to avoid further collision checks
        } else if (ball.x + ball.size >= this.canvas.scrollWidth) {
            this.handleScore('score1'); // Player 1 scores
            this.resetBall();
            return; // Exit the function to avoid further collision checks
        }
    
        // Collision with paddles
        if ((ball.dx < 0 && ball.x <= 20 && ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.height) ||
            (ball.dx > 0 && ball.x + ball.size >= this.canvas.scrollWidth - 20 && ball.y >= paddle2.y && ball.y <= paddle2.y + paddle2.height)) {
            ball.dx = -ball.dx; // Reverse the horizontal direction
        }
    
        this.updateUI(); // Ensure this is called to reflect the changes in the UI
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
        this.gameState.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: -this.gameState.ball.dx, // Send the ball in the opposite direction after a score
            dy: 2
        };
    }
}
