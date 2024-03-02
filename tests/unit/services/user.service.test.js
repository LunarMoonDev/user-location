const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const { userService } = require('../../../src/services');
const { providerNames } = require('../../../src/config/providers');
const { User } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');

describe('Service: userService', () => {
  let newUser;
  let newAccount;
  let condition;

  describe('createUser method', () => {
    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: '104604077708513089592',
        accessToken: faker.string.alphanumeric(),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        account: newAccount,
        email: faker.internet.email(),
      };
    });

    test('should create when the given user is valid', async () => {
      const mockCreateUser = jest.spyOn(User, 'create').mockImplementationOnce(() => Promise.resolve(newUser));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(false));
      await expect(userService.createUser(newUser)).resolves.toStrictEqual(newUser);
      await expect(mockCreateUser).toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockDoesEmailExist.mock.calls[0][0]).toStrictEqual(newUser.email);
    });

    test('should throw an error when error throws an error', async () => {
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockCreateUser = jest.spyOn(User, 'create').mockImplementationOnce(() => Promise.reject(error));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(false));
      await expect(userService.createUser(newUser)).rejects.toStrictEqual(error);
      await expect(mockCreateUser).toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
    });

    test('should email already exist when email exist in db', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
      const mockCreateUser = jest.spyOn(User, 'create').mockImplementationOnce(() => Promise.resolve(newUser));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(true));
      await expect(userService.createUser(newUser)).rejects.toThrow(error);
      await expect(mockCreateUser).not.toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
    });
  });

  describe('getUserByProviderAndSubject method', () => {
    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: '104604077708513089592',
        accessToken: faker.string.alphanumeric(),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        account: newAccount,
        email: faker.internet.email(),
      };

      condition = {
        'account.provider': newAccount.provider,
        'account.subject': newAccount.subject,
      };
    });

    test('should return a user object when it exists in database', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userService.getUserByProviderAndSubject(newAccount.provider, newAccount.subject)).resolves.toStrictEqual(
        newUser
      );
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual(condition);
    });

    test("should return an empty object when it doesn't exists in database", async () => {
      condition['account.provider'] = providerNames.FACEBOOK;
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve([]));
      await expect(
        userService.getUserByProviderAndSubject(providerNames.FACEBOOK, newAccount.subject)
      ).resolves.toStrictEqual([]);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual(condition);
    });

    test('should throw an error when findOne throws an error', async () => {
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.reject(error));
      await expect(userService.getUserByProviderAndSubject(newAccount.provider, newAccount.subject)).rejects.toStrictEqual(
        error
      );
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual(condition);
    });
  });

  describe('findUserAndUpdate method', () => {
    let newFilter;

    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: '104604077708513089592',
        accessToken: faker.string.alphanumeric(),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        account: newAccount,
        email: faker.internet.email(),
      };

      // update step
      newUser.account.accessToken = faker.string.alphanumeric();

      condition = {
        'account.provider': newAccount.provider,
        'account.subject': newAccount.subject,
      };

      newFilter = {
        provider: newAccount.provider,
        subject: newAccount.subject,
        email: newUser.email,
      };
    });

    test('should return the updated user when it exist in database', async () => {
      const mockFindOneAndUpdate = jest
        .spyOn(User, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(true));
      await expect(userService.findUserAndUpdate(newFilter, newUser)).resolves.toStrictEqual(newUser);
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockDoesEmailExist.mock.calls[0][0]).toStrictEqual(newUser.email);
    });

    test("should return empty when it doesn't in database", async () => {
      const mockFindOneAndUpdate = jest.spyOn(User, 'findOneAndUpdate').mockImplementationOnce(() => Promise.resolve([]));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(true));
      await expect(userService.findUserAndUpdate(newFilter, newUser)).resolves.toStrictEqual([]);
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test('should throw an error when findOneAndUpdate throws an error', async () => {
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockFindOneAndUpdate = jest.spyOn(User, 'findOneAndUpdate').mockImplementationOnce(() => Promise.reject(error));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(true));
      await expect(userService.findUserAndUpdate(newFilter, newUser)).rejects.toThrow(error);
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test("should throw missing user when email doesn't exist in db", async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'User does not exist');
      const mockFindOneAndUpdate = jest.spyOn(User, 'findOneAndUpdate').mockImplementationOnce(() => Promise.resolve(null));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(false));
      await expect(userService.findUserAndUpdate(newFilter, newUser)).rejects.toThrow(error);
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});
