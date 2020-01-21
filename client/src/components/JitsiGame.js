import _ from 'lodash';
function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

class DataClient {
    constructor(config) {
      this.config = config;
    }

    getGames() {
      return this.getData(config.gameUrl);
    }

    getAdvertisers() {
      return this.getData(config.adUrl);
    }

    getData(url) {
        return fetch(url) 
    .then((res) => {
    return res.json();
    }) 
    
    .then((data)=>{
    console.log(data)
          return data;
    })
    .catch((err) => {
    console.log(err.message)
    });
      }

    postGameURL(body) {
      return this.postData(config.gameUrl,body)
    }
    postData(url,body){
      return fetch(url, {
            method: 'POST',
            headers : new Headers(),
            body:JSON.stringify({body:body})
        })
        .then((res) => {
          console.log(res.body)
          return res;
        })
        .then((data) =>{
          console.log(data.body)
          return data
        })
        .catch((err)=>console.log(err))
    }

}



class JitsiGame {
    constructor(config) {
      this.config = config;
        console.log('constructing now');
      this._dataClient = new DataClient(this.config);
    }

  
    listGames() {
      console.log(this._dataClient.getGames()) ;
    }

    saveGameUrl(body){
      this._dataClient.postGameURL()
    }

    logUrl(url){
      console.log(url);
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
        this.saveGameUrl(api._url)
    }
    
    testComponent(selector) {
        document.querySelector(selector).appendChild(component());
    }
}

export default JitsiGame;
