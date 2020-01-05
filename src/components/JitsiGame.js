import _ from 'lodash';
import 'faker';
function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

class JitsiGame {
    constructor() {
        console.log('constructing now');
    }
    startMeeting(selector) {
        const newAvatar = faker.internet.avatar();
        //How to have it generate a random room name and still share the room?
        const newDisplayName = faker.commerce.productName();
        const domain = 'meet.jit.si';
        const options = {
            roomName: 'JitsiMeetAPIExample',
            width: 700,
            height: 700,
            parentNode: document.querySelector(selector)
        };
        const api = new JitsiMeetExternalAPI(domain, options);
        api.executeCommands({
            displayName:newDisplayName,
            avatarUrl:newAvatar
                })
    }
    toggleVideo(element) {
        document.getElementById(element).addEventListener("click",() => {api.executeCommand('toggleVideo')})
    }
    toggleAudio(element) {
        document.getElementById(element).addEventListener("click",() => {api.executeCommand('toggleAudio')})
    }
    //add button method here with selector
    testComponent(selector) {
        document.querySelector(selector).appendChild(component());
    }
}

export default JitsiGame;