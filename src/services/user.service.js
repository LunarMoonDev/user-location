const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

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

module.exports = {
  createUser,
  getUserByProviderAndSubject,
  findUserAndUpdate,
};
