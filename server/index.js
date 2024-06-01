// server/index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');

const websocket = require('./websocket');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);

const server = http.createServer(app);
websocket.attach(server);

server.listen(port, () => {
  console.log(`Running on port ${port}`);
});
