require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const redis = require('redis');
const cors = require('cors');
const port = process.env.PORT;

const client = redis.createClient();

client.on('connect', () => {
    console.log('Redis is connected');
});
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    // gets from db
    client.lrange('domains', 0, -1, (err, reply) => {
        res.json(reply);

    });
    console.log(res.body);
});

app.post('/', (req, res) => {
    // adds to db
    const body = req.body.data;

    client.lpush('domains', body, (err, reply) => {
        res.json(reply);
    });
});

app.get('/gameState', (req, res) => {
    // gets gamestate from database
    client.get(`gameStates${req.params.roomName}`, (err, reply) => {
        res.json(reply);
    });
});

app.post('/gameState', (req, res) => {
    const gameData = JSON.stringify(req.body.data);

    console.log(gameData);

    client.set(`gameStates${gameData.roomName}`, gameData.gameState, (err, reply) => {
        console.log(gameData);
    });
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});
