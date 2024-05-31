export default class TicTacToe {
    constructor(gameRoom, dataClient) {
        this.gameState = {
            game: ['', '', '', '', '', '', '', '', '']
        };
        this.gameRoom = gameRoom;
        this._dataClient = dataClient;
        this.currentPlayer = 'X';
        this.gameActive = true;
        console.log('Constructing now');
        this._dataClient.onGameStateUpdate = (newGameState) => {
            console.log('the new state',newGameState);
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

        if (this.gameState.game[clickedCellIndex] !== '' || !this.gameActive) {
            return;
        }

        this.handleGameStateUpdate(clickedCell, clickedCellIndex);
        this.handleResult();
    }

    handleGameStateUpdate(clickedCell, clickedCellIndex) {
        this.gameState.game[clickedCellIndex] = this.currentPlayer;
        this.saveGameState();
        clickedCell.innerHTML = this.currentPlayer;
    }

    handlePlayerChange() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
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
            this.gameActive = false;
            return;
        }

        if (roundDraw) {
            this.gameActive = false;
            return;
        }

        this.handlePlayerChange();
    }

    handleRestartGame() {
        this.gameActive = true;
        this.currentPlayer = 'X';
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
