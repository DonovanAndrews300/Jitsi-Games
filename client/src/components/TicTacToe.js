/**
     *Tic Tac Toe
   */class TicTacToe {
    /**
     * Properties for each game
     */
    constructor() {
        this.gameState = [ '', '', '', '', '', '', '', '', '' ];
        this.currentPlayer = 'X';
        this.gameActive = true;
        console.log('constructing now');
    }

    /**
     *
     * @param {function} clickedCellEvent
     */
    handleCellClick = clickedCellEvent => {
        // Will save the clcicked element in a variable for use
        const clickedCell = clickedCellEvent.target;

        // Identifies the cells location on the grid
        // eslint-disable-next-line radix
        const clickedCellIndex = parseInt(
            clickedCell.getAttribute('data-cell-index')
        );

        // Checks to see if the cell is played already or if the game is over
        // If so the click is ignored
        if (this.gameState[clickedCellIndex] !== '' || !this.gameActive) {
            return;
        }

        // Once we get the cell index and run our check,
        // We update the gamestate and pass the turn

        this.handleGameStateUpdate(clickedCell, clickedCellIndex);
        this.handleResult();
    }

    /**
     * Updates the gamestate array and the html grid
     * @param  {function} clickedCell
     * @param  {function} clickedCellIndex
     */
    handleGameStateUpdate = (clickedCell, clickedCellIndex) => {
        // With this handler we will update the game state and the UI
        this.gameState[clickedCellIndex] = this.currentPlayer;
        clickedCell.innerHTML = this.currentPlayer;
    }

    /**
     * Changes the player turn
     */
    handlePlayerChange = () => {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    /**
     * Check to see if the game has ended after each turn
     */
    handleResult = () => {
        let roundWon = false;
        const roundDraw = !this.gameState.includes('');
        const winConditions = [
            [ 0, 1, 2 ],
            [ 3, 4, 5 ],
            [ 6, 7, 8 ],
            [ 0, 3, 6 ],
            [ 1, 4, 7 ],
            [ 2, 5, 8 ],
            [ 0, 4, 8 ],
            [ 2, 4, 6 ]
        ];

        for (let i = 0; i <= 7; i++) {
            const winCondition = winConditions[i];
            const a = this.gameState[winCondition[0]];
            const b = this.gameState[winCondition[1]];
            const c = this.gameState[winCondition[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }

            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }
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


    /**
     * Restarts the game
     */
    handleRestartGame = () => {
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.gameState = [ '', '', '', '', '', '', '', '', '' ];
        document.querySelectorAll('.cell')
            .forEach(cell => {
                cell.innerHTML = '';
            });
    }

}


export default TicTacToe;
