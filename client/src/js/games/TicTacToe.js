import Game from './Game.js';

export default class TicTacToe extends Game {
    constructor(dataClient) {
        super(dataClient);
        console.log('Constructing TicTacToe now');

        this._dataClient.onGameStateUpdate = (newGameState) => {
            this.mergePartialState(newGameState); 
            this.updateUI(); 
        };
    }

    initializeGameState() {
        return {
            game: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: 'X'
        };
    }

    updateUI() {
        this.updateGrid();
    }

    updateGrid() {
        const gridCells = document.querySelectorAll('.cell');
        gridCells.forEach(cell => {
            const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
            if (cell.innerHTML !== this.gameState.game[cellIndex]) {
                cell.innerHTML = this.gameState.game[cellIndex]; // Update only changed cells
            }
        });
    }

    handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (this.gameState.game[clickedCellIndex] !== '') {
            return;
        }

        this.gameState.game[clickedCellIndex] = this.gameState.currentPlayer;
        this.handleResult();
        this.handlePlayerChange();

        this.updateGrid();
        this.saveGameState({
            game: this.gameState.game,
            currentPlayer: this.gameState.currentPlayer
        });
    }

    handlePlayerChange() {
        // Alternate between players 'X' and 'O'
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
    }

    handleResult() {
        let roundWon = false;
        const roundDraw = !this.gameState.game.includes('');
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        winConditions.forEach(winCondition => {
            const [a, b, c] = winCondition.map(index => this.gameState.game[index]);
            if (a === b && b === c && a !== '') {
                roundWon = true;
            }
        });

        if (roundWon) {
            setTimeout(() => alert(`${this.gameState.currentPlayer==="X"? "O": "X"} has won!`), 10);
            this.saveGameState({ result: `${this.gameState.currentPlayer} wins!` });
            return;
        }

        if (roundDraw) {
            setTimeout(() => alert('Draw!'), 10);
            this.saveGameState({ result: 'Draw!' });
            return;
        }
    }

    renderGame() {
        document.querySelector('#gameArea').innerHTML = `
            <div class="grid">
                <div data-cell-index="0" class="cell"></div>
                <div data-cell-index="1" class="cell"></div>
                <div data-cell-index="2" class="cell"></div>
                <div data-cell-index="3" class="cell"></div>
                <div data-cell-index="4" class="cell"></div>
                <div data-cell-index="5" class="cell"></div>
                <div data-cell-index="6" class="cell"></div>
                <div data-cell-index="7" class="cell"></div>
                <div data-cell-index="8" class="cell"></div>
            </div>
            <div class="buttons">
                <button class="game--restart">Restart Game</button>
            </div>
        `;
        this.updateGrid();
        this.handleClickEvents();
    }

    handleClickEvents() {
        document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', event => {
            this.handleCellClick(event);
        }));

        document.querySelector('.game--restart').addEventListener('click', event => {
            this.handleRestartGame(); // Use inherited method to restart the game
        });
    }

    handleRestartGame() {
        super.handleRestartGame(); 
        this.saveGameState({ game: this.gameState.game, currentPlayer: this.gameState.currentPlayer }); // Broadcast the reset state
    }
}
