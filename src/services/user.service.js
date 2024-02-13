const { User } = require('../models');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
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
const findUserAndUpdate = async (provider, subject, user) => {
  return User.findOneAndUpdate({ 'account.provider': provider, 'account.subject': subject }, user);
};

/**
 * Finds a user
 * @param {*} provider - provider for the oauth, default: google
 * @param {*} subject - id of the user given by provider
 * @returns {Promise<User>}
 */
const findUser = async (provider, subject) => {
  return User.findOne({ 'account.provider': provider, 'account.subject': subject });
};

module.exports = {
  createUser,
  getUserByProviderAndSubject,
  findUserAndUpdate,
  findUser,
};
