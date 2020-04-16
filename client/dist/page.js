
/**
 * this function will make a ul of links using saved urls from db
 *
 **/
/* \ function finishedWithNewGame() {
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
}*/

/**
 * This function handles the new game button event
 *
 **/
document.addEventListener('DOMContentLoaded', () => {


    console.log('document is ready. I can start now');
    const jg = new JitsiGame(config);
    const playerSession = jg.handlePlayerSession();
    const ttt = new TicTacToe(jg, playerSession);

    /**
     * handler for newGame
     */
    function handleNewGame() {
        p = jg.newGame('#meet');
        p.then(() => {
            console.log(' a new game!!!');
        })
        .catch(() => {
            alert('it failed!');
        })
        .finally(() => {
            console.log('runs no matter what');
        });
    }

    jg.gameRoomLobby('#meet', '#gamelist');
    //ttt.handleClickEvents('.cell', '.game--restart');
    document.getElementById('btnNewGame').addEventListener('click', () => {
        handleNewGame();
        ttt.renderGameGrid('#gamelist', '#game--container');
    });
    document.getElementById('lobby').addEventListener('click', () => jg.gameRoomLobby('#meet', '#gamelist'));


    //    jg.testComponent('#webpack');

});


