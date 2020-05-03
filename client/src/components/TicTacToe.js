/**
     *Tic Tac Toe
   */class TicTacToe {
    /**
     * Properties for each game
     * !!This should take in a gamerooM object that ill be created in jg contructor
     */
    constructor(dataClient) {
        this.gameState = false;
        this.gameRoom = false;
        this._dataClient = dataClient;
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.initGameState();
        console.log('constructing now');

        // console.log('Gamestate is:', this.gameState);
    }

    /**
     * loads in a gamestate from the database
     */
    initGameState() {
        console.log('running');

        // this.gameState = this.loadGameState();
        if (!this.gameState) {
            this.gameState = {
                game: [ '', '', '', '', '', '', '', '', '' ],
                players: {},
                turn: this.gameRoom.playerSession
            };

            // this.gameState.players[this.gameRoom.playerSession] = 'X';
            console.log(this.gameState);
            this.setGameState();
        }

    }

    /**
     * set gameRoom object in the constructor
     * @param {object} gameRoom
     */
    setGameRoom(gameRoom) {
        this.gameRoom = gameRoom;
    }

    /**
     * saves gamestate to the database
     */
    setGameState() {
        console.log(this.gameRoom);

        return this._dataClient.postGameState(this.gameRoom.name, this.gameState);
    }

    /**
     * gets a list of gamestates from the backend server
     * @param  {string} roomName
     */
    loadGameState(roomName) {
        return this._dataClient.getGameState(`${this._dataClient.config.gameUrl}?roomName=${roomName}`);
    }

    /**
     * This will render the tictactoe grid in the Dom
     * @param  {Element} root
     */
    /* renderGame(root) {

    }*/

    /**
     *
     * @param {function} clickedCellEvent
     */
    handleCellClick(clickedCellEvent) {
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
        console.log(this.gameState);
    }

    /**
     * Updates the gamestate array and the html grid
     * @param  {function} clickedCell
     * @param  {function} clickedCellIndex
     */
    handleGameStateUpdate(clickedCell, clickedCellIndex) {
        // With this handler we will update the game state and the UI
        this.gameState[clickedCellIndex] = this.currentPlayer;
        clickedCell.innerHTML = this.currentPlayer;
    }

    /**
     * Changes the player turn
     */
    handlePlayerChange() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    /**
     * Check to see if the game has ended after each turn
     */
    handleResult() {
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

        winConditions.forEach(winCondition => {
            const a = this.gameState[winCondition[0]];
            const b = this.gameState[winCondition[1]];
            const c = this.gameState[winCondition[2]];


            if (a === b && b === c) {

                if (a !== '' || b !== '' || c !== '') {
                    roundWon = true;

                }
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


    /**
     * Restarts the game
     */
    handleRestartGame() {
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.gameState = [ '', '', '', '', '', '', '', '', '' ];
        document.querySelectorAll('.cell')
            .forEach(cell => {
                cell.innerHTML = '';
            });
    }

    /**
     * renders tictactoe grid to the dom
     * @param  {string} selector
     */
    renderGame() {
        document.querySelector('#game--container').innerHTML = `
        <div data-cell-index="0" class="cell"></div>
        <div data-cell-index="1" class="cell"></div>
        <div data-cell-index="2" class="cell"></div>
        <div data-cell-index="3" class="cell"></div>
        <div data-cell-index="4" class="cell"></div>
        <div data-cell-index="5" class="cell"></div>
        <div data-cell-index="6" class="cell"></div>
        <div data-cell-index="7" class="cell"></div>
        <div data-cell-index="8" class="cell"></div>
        <button class="game--restart">Restart Game</button>  
    `;
        this.handleClickEvents();
    }

    /**
     */
    handleClickEvents() {
        document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', event => {
            this.handleCellClick(event);
        }));
        document.querySelector('.game--restart').addEventListener('click', event => {
            this.handleRestartGame(event);
        });
    }
}


export default TicTacToe;
