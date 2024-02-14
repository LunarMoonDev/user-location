const { Location } = require('../models');

/**
 * Creates a location in database
 * @param {Object} location
 * @returns {Promise<Location>}
 */
const createLocation = async (location) => {
  return Location.create(location);
};

module.exports = {
  createLocation,
};
