import _ from "lodash";
import { generateRoomWithoutSeparator } from "js-utils/random/roomNameGenerator";
function component() {
  const element = document.createElement("div");

  element.innerHTML = _.join(["Hello", "webpack"], " ");

  return element;
}

class DataClient {
  constructor(config) {
    this.config = config;
  }

  getGames() {
    return this.getData(config.gameUrl);
  }

  postGame() {
    const test = "test";
    return this.postData(config.gameUrl, test);
    //returns postData from url
  }

  getData(url) {
    return fetch(url)
      .then(data => {
        return data.json();
      })
      .then(resData => {
        console.log(resData);
        return resData;
      })
      .catch(err => {
        console.log(err.message);
      });
  }

  postData(url, data) {
    //sends post request to a passed url
    return fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data })
    })
      .then(data => {
        return data.json();
      })
      .then(resData => {
        console.log(resData);
        return resData;
      })
      .catch(err => {
        console.log(err.message);
      });
  }
}

class JitsiGame {
  constructor(config) {
    this.config = config;
    console.log("constructing now");
    this._dataClient = new DataClient(this.config);
  }

  newGame(selector) {
    //This will close the current iframe,open a new one using a random string, then saves that string to the db.
  }

  gameList(data) {
    //make return list of  from the db
    //this function will make a ul of links using saved urls from db
    return this._dataClient.getGames();
  }

  gameRoomLobby(selector){
    const lobby = "lobby";
    this.startMeeting(lobby,selector)
  }

  startMeeting(roomName, selector) {
    const domain = "meet.jit.si";
    const options = {
      roomName: roomName,
      width: 700,
      height: 700,
      parentNode: document.querySelector(selector)
    };


    const api = new JitsiMeetExternalAPI(domain, options);
    console.log(api._url)
  }

  testComponent(selector) {
    document.querySelector(selector).appendChild(component());
  }
}

export default JitsiGame;
