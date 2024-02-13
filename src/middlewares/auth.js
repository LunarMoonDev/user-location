const passport = require('passport');
const httpStatus = require('http-status');
const moment = require('moment');
const { google } = require('googleapis');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const { oauth } = require('../config/config');
const { authService } = require('../services');

const oauth2Client = new google.auth.OAuth2(oauth.clientID, oauth.clientSecret, oauth.callbackURL);

const refreshCallback = (req, resolve, reject) => async (err, tokens) => {
  if (err) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  req.user.account = {
    ...req.user.account,
    accessToken: tokens.access_token,
    expireDate: tokens.expiry_date,
  };
  const { account } = req.user;
  await authService.updateUserTokens(req.user, account.provider, account.subject);

  resolve();
};

const refresh = async (req, res, next) => {
  // session expire is the master lifespan of an authentication flow
  const isAuthenticated = !req.user || !req.session || !req.session.passport || !req.session.passport.user;
  if (isAuthenticated) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  if (moment().subtract(req.user.account.expireDate, 's').format('X') > -300) {
    oauth2Client.setCredentials({
      access_token: req.user.account.accessToken,
      refresh_token: req.user.account.refreshToken,
    });

    return new Promise((resolve, reject) => {
      oauth2Client.refreshAccessToken(refreshCallback(req, resolve, reject));
    })
      .then(() => next())
      .catch((err) => next(err));
  }

  next();
};

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = {
  auth,
  refresh,
};
