const moment = require('moment');
const httpStatus = require('http-status');
const { authService } = require('../services');
const config = require('./config');
const { providerNames } = require('./providers');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

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
    role: 'user',
    email: profile._json.email,
    account: {
      provider: providerNames.GOOGLE,
      subject: profile.id,
      accessToken,
      refreshToken: refreshTokens,
      expireDate,
    },
  };

  try {
    const filter = pick(user.account, ['provider', 'subject']);
    filter.email = user.email;
    const tokens = { accessToken, refreshTokens };
    await authService.createOrUpdateUserTokens(user, filter, tokens);
  } catch (error) {
    cb(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  cb(null, user);
};

module.exports = {
  verifyFunc,
  oauthConfig,
};
