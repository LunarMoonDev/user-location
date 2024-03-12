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
  const filter = {
    email: req.user.email,
    subject: account.subject,
    provider: account.provider,
  };

  await authService.updateUserTokens(filter, req.user);

  resolve();
};

const refresh = async (req, res, next) => {
  // session expire is the master lifespan of an authentication flow
  const isNotAuthenticated = !req.user;
  if (isNotAuthenticated) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  if (moment().subtract(req.user.account.expireDate, 's').format('X') > 300) {
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

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    const isNotAuthenticated = !req.user;

    if (isNotAuthenticated) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    const { user } = req;
    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
      if (!hasRequiredRights) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    next();
  };

module.exports = {
  auth,
  refresh,
  refreshCallback,
};
