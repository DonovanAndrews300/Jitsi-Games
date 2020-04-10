
/**
 * this function will make a ul of links using saved urls from db
 *
 **/
function finishedWithNewGame() {
    console.log('finished!');
    gamelist = jg.gameList();

    // document.getElementById(elementId).appendChild(gameList);
    gamelist.then(data => {
        document.querySelector(selector).innerHTML = ' ';
        const gameList = document.createElement('ul');
        const currentGames = data;

        console.log(currentGames);
        currentGames.forEach(game => {
            const li = document.createElement('li');

            li.onClick = li.appendChild(document.createTextNode(game));
            gameList.appendChild(li);
        });
        document.querySelector(selector).appendChild(gameList);
    });
}

/**
 * This function handles the new game button event
 *
 **/
function handleNewGame(selector) {
    p = jg.newGame('#meet');
    p.then(() => {
        console.log(' a new game!!!');
        finishedWithNewGame(jg);
    })
    .catch(() => {
        alert('it failed!');
    })
    .finally(() => {
        console.log('runs no matter what');
    });
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('document is ready. I can start now');
    const game1 = [ '', '', '', '', '', '', '', '', '' ];

    let playerSession = window.localStorage.getItem('JitsiGameSession');

    if (!playerSession) {
        playerSession = ';lkajskdfj';
        window.localStorage.setItem('JitsiGameSession', playerSession);
    }

    jg = new JitsiGame(config);
    ttt = new TicTacToe(jg, playerSession);
    jg.gameRoomLobby('#meet');

    //    jg.testComponent('#webpack');
    document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', event => {
        ttt.handleCellClick(event);
    }));
    document.querySelector('.game--restart').addEventListener('click', event => {
        ttt.handleRestartGame();
    });
    document.getElementById('btnNewGame').onclick = handleNewGame;

});
