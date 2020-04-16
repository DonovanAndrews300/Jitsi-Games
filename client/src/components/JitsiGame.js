import _ from 'lodash';

import { generateRoomWithoutSeparator } from 'js-utils/random/roomNameGenerator';

/**
 * component function for returning HTML, no used currently
 */
function component() {
    const element = document.createElement('div');

    element.innerHTML = _.join([ 'Hello', 'webpack' ], ' ');

    return element;
}

/**
 * DataClient class, used to access server calls
 */
class DataClient {
    /**
   * creates a new data client with provided configuration
   * @param {Object} config
   */
    constructor(config) {
        this.config = config;
    }

    /**
   * gets game list from backend server
   */
    getGames() {
        return this.getData(this.config.gameUrl);
    }

    /**
   * posts a string to backend server
   * @param {string} string
   */
    postGame(string) {
        return this.postData(this.config.gameUrl, string);

    // returns postData from url
    }

    /**
   * helper function for GET requests
   * @param {string} url
   */
    getData(url) {
        return fetch(url)
      .then(data => data.json())
      .then(resData => {
          console.log(resData);

          return resData;
      })
      .catch(err => {
          console.log(err.message);
      });
    }

    /**
   * helper function for POST requests
   * @param {string} url
   * @param {object} data
   */
    postData(url, data) {
    // sends post request to a passed url
        return fetch(url, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data })
        })
      .then(result => result.json())
      .then(resData => {
          console.log(resData);

          return resData;
      })
      .catch(err => {
          console.log(err.message);
      });
    }

    /**
     * posts a string to the backend server
     * @param  {string} roomName
     * @param  {string} gameState
     */
    postGameState(roomName, gameState) {
        return this.postData(this.config.gameState, { roomName,
            gameState });
    }

    /**
     * gets a list of gamestates from the backend server
     * @param  {string} roomName
     */
    getGameState(roomName) {
        return this.getData(`${this.config.gameUrl}?roomName=${roomName}`);
    }
}

/**
 * Main jitsi game class
 */
class JitsiGame {
    /**
   * generates main jitsi game class with provided data client configuration
   * @param {object} config
   */
    constructor(config) {
        // Need this._roomname
        this.config = config;
        console.log('constructing now');
        this._dataClient = new DataClient(this.config);
        this._api = false;
        this._roomName = false;
    }

    /**
   * Generates a new game window
   * @param {string} selector
   */
    newGame(selector) {
        return new Promise((resolve, reject) => {
            this._api.executeCommand('hangup');
            this._api.dispose();
            this._roomName = generateRoomWithoutSeparator();

            this.startMeeting(this._roomName, selector);
            const result = this._dataClient.postGame(this._roomName);

            if (result) {
                resolve(result);
            } else {
                reject('no results');
            }
        });

    }


    /**
     * Handles the player session in local storage
     */
    handlePlayerSession() {
        let playerSession = window.localStorage.getItem('JitsiGameSession');

        if (!playerSession) {
            playerSession = 'ifeeuiwqfhe';
            window.localStorage.setItem('JitsiGameSession', playerSession);
        }

        return playerSession;
    }

    /**
   * Gets a list of games
   * @param {string} selector
   */
    gameList() {

        // make this return list of roomnames from the db
        return this._dataClient.getGames();
    }

    /**
     * saves the gamestate object to the database
     * @param  {} gameState
     */
    saveGameState(gameState) {
        return this._dataClient.postGameState(this._roomName, gameState);
    }

    /**
     * returns gamestate object
     */
    retriveGameState() {
        return this._dataClient.getGameState(this._roomName);
    }

    /**
   * Starts the gameroom lobby and renders the list of gamerooms from the database into a div
   * @param {string} selector
   * @param {string} selector
   */
    gameRoomLobby(selector, selector2) {


        if (this._api !== false && this._roomName !== 'JitsiGameLobby') {
            this._roomName = 'JitsiGameLobby';
            this._api.executeCommand('hangup');
            this._api.dispose();
            console.log('b');
            document.querySelector('#game--container').innerHTML = ' ';
            this.startMeeting(this._roomName, selector);
            this.handleGameList(selector2);
        }

        if (this._roomName === false) {
            console.log('a');
            this._roomName = 'JitsiGameLobby';
            this.startMeeting(this._roomName, selector);
            this.handleGameList(selector2);
        }

    }

    /**
   * Starts a new jitsi conference based on room name, and adds it to selector
   * @param {string} roomName
   * @param {string} selector
   */
    startMeeting(roomName, selector) {
        const domain = 'meet.jit.si';
        const options = {
            roomName,
            width: 700,
            height: 700,
            parentNode: document.querySelector(selector)
        };

        /* eslint-disable no-undef */
        this._api = new JitsiMeetExternalAPI(domain, options);
        /* eslint-enable no-undef */
        console.log(this._api._url);
    }

    /**
 * this function will make a ul of links using saved urls from db
 *
 **/
    handleGameList(selector) {
        console.log('finished!');
        const gamelist = this.gameList();

        console.log(selector);

        // document.getElementById(elementId).appendChild(gameList);
        gamelist.then(games => {
            document.querySelector(selector).innerHTML = ' ';
            const gameList = document.createElement('ul');

            console.log(games);
            games.forEach(game => {
                const li = document.createElement('li');

                li.appendChild(document.createTextNode(game));
                gameList.appendChild(li);
            });
            document.querySelector(selector).appendChild(gameList);
        });
    }


    /**
   * injects component into DOM at selector
   * @param {string} selector
   */
    testComponent(selector) {
        document.querySelector(selector).appendChild(component());
    }
}

export default JitsiGame;
