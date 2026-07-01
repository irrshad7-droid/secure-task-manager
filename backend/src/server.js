const mongoose = require('mongoose');
const config = require('./config/env');
const logger = require('./config/logger');
const app = require('./app');

// Handle uncaught exceptions before we even start the server
process.on('uncaughtException', err => {
  logger.fatal({ err }, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

// Database Connection
mongoose
  .connect(config.mongoUri)
  .then(() => logger.info('DB connection successful!'))
  .catch(err => {
    logger.fatal({ err }, 'DB connection error');
    process.exit(1);
  });

// Start Server
const port = config.port || 5000;
const server = app.listen(port, () => {
  logger.info(`App running on port ${port}... in ${config.env} mode`);
});

// Handle unhandled promise rejections (e.g., bad DB password)
process.on('unhandledRejection', err => {
  logger.fatal({ err }, 'UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (e.g., from Render/Heroku)
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(async () => {
    logger.info('💥 HTTP server closed');
    try {
      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error closing MongoDB connection');
      process.exit(1);
    }
  });
});
