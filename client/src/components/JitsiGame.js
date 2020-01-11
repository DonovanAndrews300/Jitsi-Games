import _ from 'lodash';
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