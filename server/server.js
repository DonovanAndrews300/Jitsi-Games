require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const redis = require("redis");
const cors = require("cors");
const port = process.env.PORT;

let client = redis.createClient();
client.on("connect", function() {
  console.log("Redis is connected");
});
app.use(bodyParser.json());
app.use(cors());

app.get("/", function(req, res) {
  //gets from db
  client.lrange("domains", 0, -1, function(err, reply) {
    res.json(reply.toString());
  });
  console.log(res.body);
});

app.post("/", function(req, res) {
  //adds to db
  const body = req.body.data;
  client.lpush("domains", body, function(err, reply) {
    console.log(reply);
    res.json(reply);
  });
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
