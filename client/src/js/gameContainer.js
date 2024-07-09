import DataClient from './DataClient.js';
import { config } from './config.js';

const _dataClient = new DataClient(config.apiUrl,config.wsUrl);

window.copyURL = function() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('URL copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

window.goHome= function() {
    window.location.href = `https://jitsi-games.netlify.app/`;
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
    _dataClient.joinGame(gameId, userId).then(() => {
        injectGame(gameId, userId,gameType,_dataClient);
    }).catch((err) => alert(err));
    
    window.addEventListener('beforeunload', (event) => {
        _dataClient.leaveGame(gameId, userId).then(() => {
            console.log("Game left successfully");
        }).catch((err) => console.error("Error leaving game:", err));
    });
}

function injectGame(gameId, userId,gameType, dataClient) {
    const link = document.createElement('link');
    import(`../js/games/${gameType}.js`)
        .then(module => {
            const Game = module.default;
            const game = new Game(dataClient);
            game.renderGame(game);
        });
    link.rel = 'stylesheet';
    link.href =`../css/${gameType}.css` ;
    document.head.appendChild(link);
}

// Call joinGame when the script loads
joinGame();
_dataClient.initVideoCall()
