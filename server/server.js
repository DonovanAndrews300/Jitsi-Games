require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const redis = require('redis');
const cors = require('cors');
const port = process.env.PORT || 8080;

const client = redis.createClient();

client.on('connect', () => {
    console.log('Redis is connected');
});
app.use(bodyParser.json());
app.use(express.static(__dirname + "/dist"));
app.use(cors());

app.get('/gameRoom', (req, res) => {
    // gets list of gameRoom objects from the database
    client.lrange('gameRooms', 0, -1, (err, reply) => res.json(reply));
});


app.post('/gameRoom', (req, res) => {
    // adds to db
    const body = JSON.stringify(req.body.data);

    client.lpush('gameRooms', body, (err, reply) => console.log(`Posted ${body}`));
}
);

app.get('/gameState', (req, res) => {
    // gets gamestate from database
    client.get(`gameStates${req.query.roomName}`, (err, reply) => res.json(reply));
});

app.post('/gameState', (req, res) => {
    const gameData = req.body.data;
    const roomName = gameData.roomName;
    const gameState = JSON.stringify(gameData);

    client.set(`gameStates${roomName}`, gameState, (err, reply) => console.log(gameState));
});

app.listen(port, () => console.log(`Running on port ${port}`));
