import TicTacToe from '../js/games/TicTacToe';
import DataClient from './DataClient';
import { config } from './config';

window.copyURL = function() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('URL copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function getUrlParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gameId = urlParams.get("id");
    const gameType = urlParams.get("gameType");
    return {gameId, gameType};
}

function joinGame() {
    const { gameId, gameType } = getUrlParams(); 
    console.log(gameId);
    const userId = Math.random().toString(36).substr(2, 9);
    const _dataClient = new DataClient(config.apiUrl,config.wsUrl);
    _dataClient.joinGame(gameId, userId).then(() => {
        alert("Game joined successfully");
        injectGame(gameId, userId,gameType,_dataClient);
    }).catch((err) => alert(err));
    
    window.addEventListener('beforeunload', (event) => {
        _dataClient.leaveGame(gameId, userId).then(() => {
            console.log("Game left successfully");
        }).catch((err) => console.error("Error leaving game:", err));
    });
}

function injectGame(gameId, userId,gameType, dataClient) {
    const gameRoom = { name: gameId, playerSession: userId };
    const ticTacToeGame = new TicTacToe(gameRoom, dataClient);
    const link = document.createElement('link');
    import(`../js/games/${gameType}`)
        .then(module => {
            const Game = module.default;
            const game = new Game();
            game.renderGame(game);
        });
    link.rel = 'stylesheet';
    link.href =`../css/${gameType}.css` ;
    document.head.appendChild(link);
}

// Call joinGame when the script loads
joinGame();
