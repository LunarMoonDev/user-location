const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const locationService = require('./location.service');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.doesEmailExist(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for oauth
 * @param {enum} provider - provider for the oauth, default: google
 * @param {string} subject - id of the user given by provider
 * @returns {Promise<User>}
 */
const getUserByProviderAndSubject = async (provider, subject) => {
  return User.findOne({ 'account.provider': provider, 'account.subject': subject });
};

/**
 * Finds a user and updates attributes
 * @param {*} provider - provider for the oauth, default: google
 * @param {*} subject - id of the user given by provider
 * @param {*} user - user object
 * @returns {Promise<User>}
 */
const findUserAndUpdate = async (filter, user) => {
  const { provider, subject, email } = filter;
  if (!(await User.doesEmailExist(email))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist');
  }
  return User.findOneAndUpdate({ 'account.provider': provider, 'account.subject': subject, email }, user);
};

/**
 * Updates location in the database
 * @param {Object} filter - Mongo filter
 * @param {User} user - User object
 * @returns {Promise<User>}
 */
const updateUser = async (filter, user) => {
  const userBody = user;

  if (user.location) {
    const { city, state } = user.location;
    const loc = await locationService.findLocation({ city, state }, true);
    userBody.location = loc;
  }

  if (user.email) {
    const doesUserExist = await User.findOne({ _id: { $ne: filter.id }, email: user.email });
    if (doesUserExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }

  const updatedUser = await User.findOneAndUpdate({ _id: filter.id }, userBody, { new: true });
  return updatedUser;
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
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, { ...options, populate: 'location' });
  return users;
};

module.exports = {
  createUser,
  getUserByProviderAndSubject,
  findUserAndUpdate,
  updateUser,
  queryUsers,
};
