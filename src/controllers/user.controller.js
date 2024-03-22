const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, locationService } = require('../services');
const pick = require('../utils/pick');

const createUser = catchAsync(async (req, res) => {
  const location = await locationService.findLocation(req.body.location, true);
  req.body.location = location;
  const user = await userService.createUser(req.body);
  user.location = location;
  res.status(httpStatus.CREATED).send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['id']);
  const result = await userService.updateUser(filter, req.body);
  res.status(httpStatus.OK).send(result);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['firstName', 'lastName', 'email']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).send(result);
});

const deleteUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['ids']);
  const result = await userService.deleteUsers(filter);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createUser,
  updateUser,
  getUsers,
  deleteUsers,
};
