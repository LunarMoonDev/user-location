const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { User, Location } = require('../models');
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

  let createdUser;
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    if (userBody.location) {
      const { city, state } = userBody.location;
      await Location.findOneAndUpdate({ city, state }, { $inc: { population: 1 } });
    }

    createdUser = User.create(userBody);
  });

  return createdUser;
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

  let updatedUser;
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    updatedUser = await User.findOneAndUpdate({ 'account.provider': provider, 'account.subject': subject, email }, user);
  });

  return updatedUser;
};

/**
 * Updates location in the database
 * @param {Object} filter - Mongo filter
 * @param {User} user - User object
 * @returns {Promise<User>}
 */
const updateUser = async (filter, user) => {
  if (user.email) {
    const doesUserExist = await User.findOne({ _id: { $ne: filter.id }, email: user.email });
    if (doesUserExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }

  if (user.isDisabled) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please use the DELETE /users API instead');
  }

  let updatedUser;
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    if (user.isDisabled === false && !!user.location) {
      const { city, state } = user.location;
      const loc = await Location.findOneAndUpdate({ city, state }, { $inc: { population: 1 } }, { new: true });

      if (!loc) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Location does not exist');
      }
    }

    updatedUser = await User.findOneAndUpdate({ _id: filter.id }, user, { new: true });
  });

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
  const users = await User.paginate({ ...filter, isDisabled: false }, { ...options, populate: 'location' });
  return users;
};

/**
 * Soft deletes the user and decrements the population
 * @param {Array<import('mongoose').ObjectId} filter - list of user ids
 * @returns {Object} - containing number of deletes users
 */
const deleteUsers = async (filter) => {
  let result;

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    result = await User.updateMany({ _id: { $in: filter.ids } }, { isDisabled: true });
    const deletedUsers = await User.find({ _id: { $in: filter.ids }, isDisabled: true }).populate('location');

    const locs = [];

    deletedUsers.forEach((user) => {
      if (user.location) {
        const { city, state } = user.location;
        locs.push({ city, state });
      }
    });

    if (locs.length > 0) {
      const bulkPopUpdate = Location.collection.initializeUnorderedBulkOp();
      locs.forEach((condition) => {
        bulkPopUpdate.find(condition).update({ $inc: { population: -1 } });
      });

      await bulkPopUpdate.execute();
    }
  });

  return { count: result.nModified };
};

module.exports = {
  createUser,
  getUserByProviderAndSubject,
  findUserAndUpdate,
  updateUser,
  queryUsers,
  deleteUsers,
};
