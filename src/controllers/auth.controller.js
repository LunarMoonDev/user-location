const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// TODO: make these json objects
const logout = catchAsync(async (req, res) => {
  req.logout();
  res.send('Logout success');
});

const failure = catchAsync(async () => {
  throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
});

const success = catchAsync(async (req, res) => {
  res.send('Authentication success');
});

module.exports = {
  logout,
  failure,
  success,
};
