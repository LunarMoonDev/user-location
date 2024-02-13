const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const GoogleStrategy = require('passport-google-oauth20');
const session = require('express-session');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;
const config = require('./config/config');
const morgan = require('./config/morgan');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const { verifyFunc, oauthConfig } = require('./config/oauth.google');
const ApiError = require('./utils/ApiError');
const { cacheConfig, cacheSuccCallback, cacheFailCallback } = require('./config/cache');
const { userService } = require('./services');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

const redisClient = createClient({ ...cacheConfig });
redisClient.connect().then(cacheSuccCallback).catch(cacheFailCallback);
const redisStore = new RedisStore({ client: redisClient, prefix: 'sess:' });

// enables the sessions
app.use(
  session({
    store: redisStore,
    secret: cacheConfig.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 10,
    },
  })
);

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({ ...oauthConfig }, verifyFunc));

passport.serializeUser((user, done) => {
  const condition = { provider: user.account.provider, subject: user.account.subject };
  done(null, condition);
});

passport.deserializeUser((condition, done) => {
  userService
    .findUser(condition.provider, condition.subject)
    .then((user) => done(null, user))
    .catch((error) => done(error));
});

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
