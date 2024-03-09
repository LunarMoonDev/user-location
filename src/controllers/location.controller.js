const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { locationService } = require('../services');
const pick = require('../utils/pick');

const createLocation = catchAsync(async (req, res) => {
  const location = await locationService.createLocation(req.body);
  res.status(httpStatus.CREATED).send(location);
});

const getLocations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['city', 'state']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await locationService.queryLocations(filter, options);
  res.status(httpStatus.OK).send(result);
});

const updateLocation = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['id']);
  const result = await locationService.updateLocation(filter, req.body);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createLocation,
  getLocations,
  updateLocation,
};
