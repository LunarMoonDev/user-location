const { cache } = require('./config');
const logger = require('./logger');

const cacheConfig = { ...cache };

const cacheFailCallback = (error) => {
  logger.error('Could not establish a connection with Redis', error);
};

const cacheSuccCallback = () => {
  logger.info('Connected to Redis');
};

module.exports = {
  cacheConfig,
  cacheFailCallback,
  cacheSuccCallback,
};
