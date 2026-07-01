const pino = require('pino');
const config = require('./env');

const logger = pino({
  level: config.env === 'development' ? 'debug' : 'info',
  transport:
    config.env === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      : undefined
});

module.exports = logger;
