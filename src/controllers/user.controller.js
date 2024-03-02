const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, locationService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const location = await locationService.findLocation(req.body.location, true);
  req.body.location = location._id;
  const user = await userService.createUser(req.body);
  user.location = location;
  res.status(httpStatus.CREATED).send(user);
});

module.exports = {
  createUser,
};
