const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Location } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Creates a location in database
 * @param {Location} location
 * @returns {Promise<Location>}
 */
const createLocation = async (location) => {
  const { city, state } = location;
  if (await Location.doesLocationExist(city, state)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Location already exist');
  }

  let createdUser;
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    createdUser = await Location.create(location);
  });

  return createdUser;
};

/**
 * Finds a location in database
 * @param {Object} filter contains city and state
 * @param {boolean} required flag if required
 * @returns {Promise<User>}
 */
const findLocation = async (filter, required = false) => {
  const loc = await Location.findOne({ state: filter.state, city: filter.city });
  if (required && !loc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Location does not exist');
  }
  return loc;
};

/**
 * Query for locations
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

/**
 * Updates a location in the database
 * @param {Object} filter - Mongo filter
 * @param {Location} location - Location object
 * @returns {Promise<Location>}
 */
const updateLocation = async (filter, location) => {
  let { state, city } = location;
  let loc;

  if (!state !== !city) {
    loc = await Location.findOne({ _id: filter.id });
    state = state || loc.state;
    city = city || loc.city;
  }

  if (state && city) {
    loc = await Location.findOne({ _id: { $ne: filter.id }, state, city });
    if (loc) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Given location in the payload already exist');
    }
  }

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    loc = await Location.findOneAndUpdate({ _id: filter.id }, location, { new: true });
  });

  if (!loc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Location does not exist');
  }
  return loc;
};

/**
 * Deletes a list of locations in the database
 * @param {Array<import('mongoose').ObjectId} filter - list of location ids
 * @returns {Object} - containing number of deletes locations
 */
const deleteLocations = async (filter) => {
  filter.ids.map((x) => mongoose.Types.ObjectId(x));
  const session = await mongoose.startSession();

  let delObj;
  await session.withTransaction(async () => {
    delObj = await Location.deleteMany({ _id: { $in: filter.ids }, population: 0 });
  });

  return { count: delObj.deletedCount };
};

module.exports = {
  createLocation,
  findLocation,
  queryLocations,
  updateLocation,
  deleteLocations,
};
