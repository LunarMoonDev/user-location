const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { locationService } = require('../services');

const createLocation = catchAsync(async (req, res) => {
  const location = await locationService.createLocation(req.body);
  res.status(httpStatus.CREATED).send(location);
});

module.exports = {
  createLocation,
};
