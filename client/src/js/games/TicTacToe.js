export default class TicTacToe {
    constructor(dataClient) {
        this.gameState = {
            game: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: 'X', // Add currentPlayer to the gameState
        };
        this._dataClient = dataClient;
        console.log('Constructing now');
        this._dataClient.onGameStateUpdate = (newGameState) => {
            console.log('the new state', newGameState);
            this.gameState = newGameState;
            this.updateGrid();
        };
        this._dataClient.connectWebSocket();
    }

    updateGrid() {
        const gridCells = document.querySelectorAll('.cell');
        gridCells.forEach(cell => {
            const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
            cell.innerHTML = this.gameState.game[cellIndex];
        });
    }

    saveGameState() {
        this._dataClient.sendGameStateUpdate(this.gameState);
    }

    handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (this.gameState.game[clickedCellIndex] !== '') {
            return;
        }

        this.handleGameStateUpdate(clickedCell, clickedCellIndex);
        this.handleResult();
        this.handlePlayerChange();
        this.saveGameState();
    }

    handleGameStateUpdate(clickedCell, clickedCellIndex) {
        this.gameState.game[clickedCellIndex] = this.gameState.currentPlayer;
        clickedCell.innerHTML = this.gameState.currentPlayer;
    }

    handlePlayerChange() {
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
            const a = this.gameState.game[winCondition[0]];
            const b = this.gameState.game[winCondition[1]];
            const c = this.gameState.game[winCondition[2]];

            if (a === b && b === c && a !== '') {
                roundWon = true;
            }
        });

        if (roundWon) {
            setTimeout(() => alert(`${this.gameState.currentPlayer} has won!`), 10);
            return;
        }

        if (roundDraw) {
            setTimeout(() => alert('Draw!'), 10);
            return;
        }
    }

    handleRestartGame() {
        this.gameState.currentPlayer = 'X';
        this.gameState.game = ['', '', '', '', '', '', '', '', ''];
        document.querySelectorAll('.cell').forEach(cell => {
            cell.innerHTML = '';
        });
        this.saveGameState();
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
            this.handleRestartGame(event);
        });
    }
}
