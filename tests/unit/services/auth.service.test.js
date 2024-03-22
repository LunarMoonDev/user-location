const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const { authService, userService } = require('../../../src/services');
const { providerNames } = require('../../../src/config/providers');
const ApiError = require('../../../src/utils/ApiError');

describe('Service: authService', () => {
  let newUser;
  let newAccount;

  describe('createOrUpdateUserTokens method', () => {
    let filter;
    let tokens;

    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: faker.string.alphanumeric({ length: 21 }),
        accessToken: faker.string.alphanumeric({ length: 218 }),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        account: newAccount,
        isDisabled: false,
      };

      tokens = {
        accessToken: faker.string.alphanumeric({ length: 218 }),
        refreshTokens: faker.string.alphanumeric({ length: 218 }),
      };

      filter = {
        provider: providerNames.GOOGLE,
        subject: newAccount.subject,
      };
    });

    test("should create when the user doesn't exist in database", async () => {
      const mockGetUserByProviderAndSubject = jest
        .spyOn(userService, 'getUserByProviderAndSubject')
        .mockImplementationOnce(() => Promise.resolve(null));
      const mockCreateUser = jest.spyOn(userService, 'createUser').mockImplementationOnce(() => Promise.resolve());
      const mockFindUserAndUpdate = jest
        .spyOn(userService, 'findUserAndUpdate')
        .mockImplementationOnce(() => Promise.resolve());

      await expect(authService.createOrUpdateUserTokens(newUser, filter, tokens)).resolves.toBeUndefined();
      await expect(mockGetUserByProviderAndSubject).toHaveBeenCalled();
      await expect(mockCreateUser).toHaveBeenCalled();
      await expect(mockFindUserAndUpdate).not.toHaveBeenCalled();
    });

    test('should update when access token is different', async () => {
      const mockGetUserByProviderAndSubject = jest
        .spyOn(userService, 'getUserByProviderAndSubject')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      const mockCreateUser = jest.spyOn(userService, 'createUser').mockImplementationOnce(() => Promise.resolve());
      const mockFindUserAndUpdate = jest
        .spyOn(userService, 'findUserAndUpdate')
        .mockImplementationOnce(() => Promise.resolve());

      tokens.accessToken = faker.string.alphanumeric({ length: 218 });

      await expect(authService.createOrUpdateUserTokens(newUser, filter, tokens)).resolves.toBeUndefined();
      await expect(mockGetUserByProviderAndSubject).toHaveBeenCalled();
      await expect(mockCreateUser).not.toHaveBeenCalled();
      await expect(mockFindUserAndUpdate).toHaveBeenCalled();
    });

    test('should update only the tokens of the user', async () => {
      const userDup = JSON.parse(JSON.stringify(newUser));
      const mockGetUserByProviderAndSubject = jest
        .spyOn(userService, 'getUserByProviderAndSubject')
        .mockImplementationOnce(() => Promise.resolve(userDup));
      const mockCreateUser = jest.spyOn(userService, 'createUser').mockImplementationOnce(() => Promise.resolve());
      const mockFindUserAndUpdate = jest
        .spyOn(userService, 'findUserAndUpdate')
        .mockImplementationOnce(() => Promise.resolve());

      // creating new user with new access token
      tokens.accessToken = faker.string.alphanumeric({ length: 218 });
      newUser.account.accessToken = tokens.accessToken;

      // changing newUser attribute
      newUser.role = 'admin';

      // creating expected
      const expected = JSON.parse(JSON.stringify(userDup));
      expected.account = newUser.account;
      expected.isDisabled = false;

      await expect(authService.createOrUpdateUserTokens(newUser, filter, tokens)).resolves.toBeUndefined();
      await expect(mockGetUserByProviderAndSubject).toHaveBeenCalled();
      await expect(mockCreateUser).not.toHaveBeenCalled();
      await expect(mockFindUserAndUpdate).toHaveBeenCalled();
      await expect(mockFindUserAndUpdate.mock.calls[0][1]).toStrictEqual(expected);
    });

    test('should not do anything when user exist and accessToken is the same', async () => {
      const mockGetUserByProviderAndSubject = jest
        .spyOn(userService, 'getUserByProviderAndSubject')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      const mockCreateUser = jest.spyOn(userService, 'createUser').mockImplementationOnce(() => Promise.resolve());
      const mockFindUserAndUpdate = jest
        .spyOn(userService, 'findUserAndUpdate')
        .mockImplementationOnce(() => Promise.resolve());

      tokens.accessToken = newAccount.accessToken;

      await expect(authService.createOrUpdateUserTokens(newUser, filter, tokens)).resolves.toBeUndefined();
      await expect(mockGetUserByProviderAndSubject).toHaveBeenCalled();
      await expect(mockCreateUser).not.toHaveBeenCalled();
      await expect(mockFindUserAndUpdate).not.toHaveBeenCalled();
    });

    test('should updating when user exist and accessToken is the same but disabled', async () => {
      const mockGetUserByProviderAndSubject = jest
        .spyOn(userService, 'getUserByProviderAndSubject')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      const mockCreateUser = jest.spyOn(userService, 'createUser').mockImplementationOnce(() => Promise.resolve());
      const mockFindUserAndUpdate = jest
        .spyOn(userService, 'findUserAndUpdate')
        .mockImplementationOnce(() => Promise.resolve());

      newUser.isDisabled = true;
      tokens.accessToken = newAccount.accessToken;

      await expect(authService.createOrUpdateUserTokens(newUser, filter, tokens)).resolves.toBeUndefined();
      await expect(mockGetUserByProviderAndSubject).toHaveBeenCalled();
      await expect(mockCreateUser).not.toHaveBeenCalled();
      await expect(mockFindUserAndUpdate).toHaveBeenCalled();
      await expect(mockFindUserAndUpdate.mock.calls[0][1].isDisabled).not.toBeTruthy();
    });
  });

  describe('updateUserTokens method', () => {
    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: faker.string.alphanumeric({ length: 21 }),
        accessToken: faker.string.alphanumeric({ length: 218 }),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        account: newAccount,
      };
    });

    test('should update when given params are valid', async () => {
      const mockFindUserAndUpdate = jest
        .spyOn(userService, 'findUserAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(authService.updateUserTokens(newUser, newAccount.provider, newAccount.subject)).resolves.toBeUndefined();
      await expect(mockFindUserAndUpdate).toHaveBeenCalled();
    });

    test('should throw an error when findUserAndUpdate throws an error', async () => {
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockFindUserAndUpdate = jest
        .spyOn(userService, 'findUserAndUpdate')
        .mockImplementationOnce(() => Promise.reject(error));
      await expect(authService.updateUserTokens(newUser, newAccount.provider, newAccount.subject)).rejects.toStrictEqual(
        error
      );
      await expect(mockFindUserAndUpdate).toHaveBeenCalled();
    });
  });
});
