const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, locationService } = require('../services');
const pick = require('../utils/pick');

const createUser = catchAsync(async (req, res) => {
  const location = await locationService.findLocation(req.body.location, true);
  req.body.location = location._id;
  const user = await userService.createUser(req.body);
  user.location = location;
  res.status(httpStatus.CREATED).send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['id']);
  const result = await userService.updateUser(filter, req.body);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createUser,
  updateUser,
};
