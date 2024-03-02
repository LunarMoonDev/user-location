const userService = require('./user.service');

/**
 * Creates a user if it doesn't exist or updates its token, otherwise
 * @param {*} user - user object with new tokens
 * @param {*} provider - provider for the oauth, default: google
 * @param {*} subject - id of the user given by provider
 * @param {*} tokens - new tokens
 */
const createOrUpdateUserTokens = async (user, filter, tokens) => {
  const { provider, subject } = filter;
  const { accessToken } = tokens;
  const currUser = await userService.getUserByProviderAndSubject(provider, subject);
  if (!currUser) {
    await userService.createUser(user);
  } else if (currUser.account.accessToken !== accessToken) {
    currUser.account = user.account;
    await userService.findUserAndUpdate(filter, currUser);
  }
};

/**
 * Updates user's tokens for oauth
 * @param {*} user - user object with tokens
 * @param {*} provider - provider for the oauth, default: google
 * @param {*} subject - id of the user given by the provider
 */
const updateUserTokens = async (filter, user) => {
  await userService.findUserAndUpdate(filter, user);
};

module.exports = {
  createOrUpdateUserTokens,
  updateUserTokens,
};
