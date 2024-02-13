const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, `../../env/.env.${process.env.NODE_ENV}`) });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    OAUTH_CLIENT_ID: Joi.string().required().description('client id of google oauth'),
    OAUTH_CLIENT_SECRET: Joi.string().required().description('client secret of google oauth'),
    OAUTH_CALLBACK_URI: Joi.string().required().description('redirect url after authentication with oauth'),
    OAUTH_REDIRECT_SUCCESS_URI: Joi.string().required().description('redirect url after success authentication'),
    OAUTH_REDIRECT_FAIL_URI: Joi.string().required().description('redirect url after failed authentication'),
    CACHE_HOST: Joi.string().required().required().description('Cache host url'),
    CACHE_PORT: Joi.number().required().description('port of the cacher server'),
    CACHE_SECRET: Joi.string().required().description('secret key for session'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  oauth: {
    clientID: envVars.OAUTH_CLIENT_ID,
    clientSecret: envVars.OAUTH_CLIENT_SECRET,
    callbackURL: envVars.OAUTH_CALLBACK_URI,
    redirectUrls: {
      successRedirect: envVars.OAUTH_REDIRECT_SUCCESS_URI,
      failureRedirect: envVars.OAUTH_REDIRECT_FAIL_URI,
    },
  },
  cache: {
    host: envVars.CACHE_HOST,
    port: envVars.CACHE_PORT,
    secret: envVars.CACHE_SECRET,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
