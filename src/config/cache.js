const { createClient } = require('redis');
const { cache } = require('./config');

const redis = createClient(cache);

module.exports = {
  redis,
};
