const redis = require('redis');
const client = redis.createClient();

client.connect();

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.on('connect', () => {
  console.log('Redis is connected');
});

module.exports = client;