require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { attach } = require('./websocket');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(process.env.PORT, () => console.log(`Listening on ${process.env.PORT}`));

attach(server);

