require('dotenv').config();
const express = require('express');
const { ExpressPeerServer } = require('peer');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');

const { attach } = require('./websocket');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server
attach(server);

// Start main server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Set up PeerJS server on a separate Express app
const peerApp = express();
peerApp.use(cors());

const peerServer = http.createServer(peerApp);
const peerPort = 4000;
const options = { debug: true };

peerApp.use('/peerjs', ExpressPeerServer(peerServer, options));

// Start PeerJS server
peerServer.listen(peerPort, () => {
  console.log(`PeerJS server is running on port ${peerPort}`);
});
