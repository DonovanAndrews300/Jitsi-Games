/**
 *Tic Tac Toe
 */ class TicTacToe {
    /**
   * Properties for each game
   * !!This should take in a gameroom object that ill be created in jg contructor
   */
    constructor(gameRoom, dataClient) {
        this.gameState = false;
        this.gameRoom = gameRoom;
        this._dataClient = dataClient;
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.initGameState();
        console.log('constructing now');
        dataClient.webSocket.send('Message From Client');

    // console.log('Gamestate is:', this.gameState);
    }

    /**
   * loads in a gamestate from the database
   */
    initGameState() {
        console.log('init tictactoe');
        this.getGameStateWS();
        this.loadGameState(this.gameRoom.name).then(gamestateloaded => {
            if (gamestateloaded) {
                this.gameState = JSON.parse(gamestateloaded).gameState;
                console.log(this.gameState);
                this.updateGrid();
            }
            if (!gamestateloaded) {
                this.gameState = {
                    game: [ '', '', '', '', '', '', '', '', '' ],
                    players: {},
                    turn: this.gameRoom.playerSession
                };

                // this.gameState.players[this.gameRoom.playerSession] = 'X';
                this.saveGameState();
            }
        });
    }

    /**
   * Updates TicTacToe Grid from the database
   * @param {string} selector
   */
    updateGrid() {
        const gridCells = document.querySelectorAll('.cell');

        console.log(gridCells);
        const updateCell = cell => {
            // eslint-disable-next-line radix
            const cellIndex = parseInt(cell.getAttribute('data-cell-index'));

            console.log(this.gameState.game);

            cell.innerHTML = this.gameState.game[cellIndex];

            console.log(cellIndex);
        };

        gridCells.forEach(updateCell);
    }

    /**
   * saves gamestate to the database
   */
    saveGameState() {
        console.log(this.gameRoom);

        return this._dataClient.postGameState(this.gameRoom.name, this.gameState);
    }

    /**
   * Updates game grid after another client has made a move using websockets
   */
    getGameStateWS() {
        this._dataClient.webSocket.then(socket => {
            socket.addEventListener('message', event => {
                this.gameState = JSON.parse(event.data);
                this.updateGrid();
            });
        });
    }

    /**
   * Sends gameState to server using websocket
   */
    sendGameStateWS() {
        this._dataClient.webSocket.send(JSON.stringify(this.gameState));
    }

    /**
   * gets a list of gamestates from the backend server
   * @param  {string} roomName
   */
    loadGameState(roomName) {
        return this._dataClient.getGameState(roomName);
    }

    /**
   *
   * @param {function} clickedCellEvent
   */
    handleCellClick(clickedCellEvent) {
    // Will save the clcicked element in a variable for use
        const clickedCell = clickedCellEvent.target;

        console.log(this.gameState);

        // Identifies the cells location on the grid
        // eslint-disable-next-line radix
        const clickedCellIndex = parseInt(
      clickedCell.getAttribute('data-cell-index')
        );

        // Checks to see if the cell is played already or if the game is over
        // If so the click is ignored
        if (this.gameState.game[clickedCellIndex] !== '' || !this.gameActive) {
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
        this.gameState.game[clickedCellIndex] = this.currentPlayer;
        this.saveGameState();
        this.sendGameStateWS();
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
        const roundDraw = !this.gameState.game.includes('');
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
            const a = this.gameState.game[winCondition[0]];
            const b = this.gameState.game[winCondition[1]];
            const c = this.gameState.game[winCondition[2]];

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
        this.gameState.game = [ '', '', '', '', '', '', '', '', '' ];
        document.querySelectorAll('.cell').forEach(cell => {
            cell.innerHTML = '';
        });
        this.saveGameState();
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
        document.querySelectorAll('.cell').forEach(cell =>
            cell.addEventListener('click', event => {
                this.handleCellClick(event);
            })
        );
        document
      .querySelector('.game--restart')
      .addEventListener('click', event => {
          this.handleRestartGame(event);
      });
    }
}
export default TicTacToe;
