const redis = require('redis');
client = redis.createClient({
  url: process.env.REDIS_URL
});
  
client.connect();

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.on('connect', () => {
  console.log('Redis is connected');
});

module.exports = client;