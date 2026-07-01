const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/error.middleware');

const app = express();

// Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 1. GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Request logging (Pino)
app.use(
  pinoHttp({
    logger,
    autoLogging: process.env.NODE_ENV !== 'test', // disable auto logging during tests
  })
);

// Global Rate Limiting
const limiter = rateLimit({
  max: 100, // 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Implement CORS
app.use(cors());

const v1Routes = require('./routes/v1');

// 2. ROUTES
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// v1 routes
app.use('/api/v1', v1Routes);

// Handle unhandled routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
