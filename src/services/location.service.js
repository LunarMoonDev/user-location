const httpStatus = require('http-status');
const { Location } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Creates a location in database
 * @param {Object} location
 * @returns {Promise<Location>}
 */
const createLocation = async (location) => {
  const { city, state } = location;
  if (await Location.doesLocationExist(city, state)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Location already exist');
  }
  return Location.create(location);
};

/**
 * Finds a location in database
 * @param {Object} location contains city and state
 * @param {boolean} required flag if required
 * @returns {Promise<User>}
 */
const findLocation = async (location, required = false) => {
  const loc = await Location.findOne({ state: location.state, city: location.city });
  if (required && !loc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Location does not exist');
  }
  return loc;
};

module.exports = {
  createLocation,
  findLocation,
};
