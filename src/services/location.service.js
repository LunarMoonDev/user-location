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

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryLocations = async (filter, options) => {
  const locations = await Location.paginate(filter, options);
  return locations;
};

module.exports = {
  createLocation,
  findLocation,
  queryLocations,
};
