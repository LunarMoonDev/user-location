const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { redis } = require('./config/cache');

const servers = [];
servers.push(
  new Promise((resolve, reject) => {
    mongoose
      .connect(config.mongoose.url, config.mongoose.options)
      .then(() => {
        logger.info('Connected to MongoDB');
        resolve();
      })
      .catch((error) => {
        logger.error('Could not establish a connection with MongoDB', error);
        reject(error);
      });
  })
);

servers.push(
  new Promise((resolve, reject) => {
    redis
      .connect()
      .then(() => {
        logger.info('Connected to Redis');
        resolve();
      })
      .catch((error) => {
        logger.error('Could not establish a connection with Redis', error);
        reject(error);
      });
  })
);

let server;
Promise.all(servers)
  .then(() => {
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch(() => {
    logger.error('Could not start server');
  });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
