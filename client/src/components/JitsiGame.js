import _ from 'lodash';

// import { generateRoomWithoutSeparator } from 'js-utils/random/roomNameGenerator';

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
     */
    postGame() {
        const test = 'test';


        return this.postData(this.config.gameUrl, test);

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
        this.config = config;
        console.log('constructing now');
        this._dataClient = new DataClient(this.config);
        this._api = false;
    }

    /**
     * Generates a new game window
     */
    newGame() {
    // This will close the current iframe,open a new one using a random string, then saves that string to the db.
        this._api.executeCommand('hangup');

    // const randomRoomName = generateRoomWithoutSeparator();
    // this.startMeeting(randomRoomName,selector)
    // console.log(randomRoomName)
    // return this._dataClient.postGame(randomRoomName);
    }

    /**
     * Gets a list of games
     */
    gameList() {
    // make this return list of roomnames from the db
    // this function will make a ul of links using saved urls from db
        return this._dataClient.getGames();
    }

    /**
     * Generates a meeting and places it in the DOM at selector
     * @param {string} selector
     */
    gameRoomLobby(selector) {
        const lobby = 'lobby';

        this.startMeeting(lobby, selector);
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
     * injects component into DOM at selector
     * @param {string} selector
     */
    testComponent(selector) {
        document.querySelector(selector).appendChild(component());
    }
}

export default JitsiGame;
