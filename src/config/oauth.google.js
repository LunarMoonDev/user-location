const moment = require('moment');
const httpStatus = require('http-status');
const { authService } = require('../services');
const config = require('./config');
const { providerNames } = require('./providers');
const { roleNames } = require('./roles');
const ApiError = require('../utils/ApiError');

const oauthConfig = {
  ...config.oauth,
  passReqToCallback: true,
  scope: ['profile', 'email'],
};

const verifyFunc = async (req, accessToken, refreshTokens, params, profile, cb) => {
  const expireDate = moment().add(params.expires_in, 's').format('X');
  const user = {
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    role: roleNames.user,
    account: {
      provider: providerNames.GOOGLE,
      subject: profile.id,
      accessToken,
      refreshToken: refreshTokens,
      expireDate,
    },
  };

  try {
    await authService.createOrUpdateUserTokens(user, providerNames.GOOGLE, profile.id, { accessToken, refreshTokens });
  } catch (error) {
    cb(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  cb(null, user);
};

module.exports = {
  verifyFunc,
  oauthConfig,
};
