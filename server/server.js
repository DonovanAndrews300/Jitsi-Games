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
        res.json(reply.toString());
    });
    console.log(res.body);
});

app.post('/', (req, res) => {
    // adds to db
    const body = req.body.data;

    client.lpush('domains', body, (err, reply) => {
        console.log(reply);
        res.json(reply);
    });
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});
