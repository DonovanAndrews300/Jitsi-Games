
require('dotenv').config();
const express = require('express');
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

