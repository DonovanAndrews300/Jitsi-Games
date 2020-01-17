import _ from 'lodash';
function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

class DataClient() {
    constructor(config) {
      this.config = config
    }

    getGames() {
      return this.getData(config.gameUrl);
    }

    getAdvertisers() {
      return this.getData(config.adUrl);
    }
  
  
    getData(url) {
        return fetch(url) 
    .then((data) => {
    return data.json();
    }) 
    
    .then((resData)=>{
    console.log(resData)
          return resData;
    })
    .catch((err) => {
    console.log(err.message)
    });
      }  

}

class JitsiGame {
    constructor(config) {
      this.config = config;
        console.log('constructing now');
      this._dataClient = new DataClient(this.config);
    }

  
    listGames() {
      return this._dataClient.getGames();
    }
 

    startMeeting(selector) {
        const domain = 'meet.jit.si';
        const options = {
            roomName: 'JitsiMeetAPIExample',
            width: 700,
            height: 700,
            parentNode: document.querySelector(selector)
        };
        const api = new JitsiMeetExternalAPI(domain, options);
    }

    testComponent(selector) {
        document.querySelector(selector).appendChild(component());
    }
}

export default JitsiGame;
