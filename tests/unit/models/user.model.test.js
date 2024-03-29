const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { User } = require('../../../src/models');
const { providerNames } = require('../../../src/config/providers');
const ApiError = require('../../../src/utils/ApiError');
const setupTestDB = require('../../utils/setupTestDB');

setupTestDB();

describe('Model: User', () => {
  describe('User validation', () => {
    let newUser;
    let newAccount;

    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: '104604077708513089592',
        accessToken: faker.string.alphanumeric({ length: 218 }),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        email: faker.internet.email(),
        location: mongoose.Types.ObjectId(),
        account: newAccount,
        isDisabled: true,
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new User(newUser).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if role is invalid', async () => {
      newUser.role = 'invalid';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if email is invalid', async () => {
      newUser.email = 'invalid';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if location is invalid', async () => {
      newUser.location = 'invalid';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if firstName is beyond max length', async () => {
      newUser.firstName = faker.string.alphanumeric({ length: 26 });
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if firstName is below min length', async () => {
      newUser.firstName = '';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if lastName is beyond max length', async () => {
      newUser.lastName = faker.string.alphanumeric({ length: 26 });
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if lastName is below min length', async () => {
      newUser.lastName = '';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if email is beyond max length', async () => {
      newUser.email = `${faker.string.alphanumeric({ length: 80 })}@gmail.com`;
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if isDisabled is invalid', async () => {
      newUser.isDisabled = `slakfghglasfjhg`;
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
  });

  describe('User toJSON()', () => {
    test('should not return user with createdAt/ updatedAt when toJSON is called', () => {
      const newUser2 = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        account: {
          provider: providerNames.GOOGLE,
          subject: '104604077708513089592',
          accessToken: faker.string.alphanumeric({ length: 218 }),
          refreshToken: faker.string.alphanumeric({ length: 218 }),
          expireData: 1707912638,
        },
        createdAt: '02-01-2023',
        updatedAt: '02-01-2024',
      };

      expect(new User(newUser2).toJSON()).not.toHaveProperty('createdAt');
      expect(new User(newUser2).toJSON()).not.toHaveProperty('updatedAt');
    });
  });

  describe('User doesEmailExist()', () => {
    let newUser;
    let newAccount;

    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: '104604077708513089592',
        accessToken: faker.string.alphanumeric({ length: 218 }),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        email: faker.internet.email(),
        location: mongoose.Types.ObjectId(),
        account: newAccount,
      };
    });

    test('should return true when email exist in db', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(User.doesEmailExist(newUser.email, ['user1', 'user2'])).resolves.toEqual(true);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual({ email: newUser.email, _id: { $ne: ['user1', 'user2'] } });
    });

    test('should return false when email exist in db', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(null));
      await expect(User.doesEmailExist(newUser.email, ['user1', 'user2'])).resolves.toEqual(false);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual({ email: newUser.email, _id: { $ne: ['user1', 'user2'] } });
    });

    test('should throw error when findOne throws an error', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'something happened');
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.reject(error));
      await expect(User.doesEmailExist(newUser.email, ['user1', 'user2'])).rejects.toThrow(error);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual({ email: newUser.email, _id: { $ne: ['user1', 'user2'] } });
    });
  });

  describe('Account encryption', () => {
    let newUser;
    let newAccount;

    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: '104604077708513089592',
        accessToken: faker.string.alphanumeric({ length: 218 }),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        email: faker.internet.email(),
        location: mongoose.Types.ObjectId(),
        account: newAccount,
      };
    });

    test('should encrypt accessToken and refreshToken', async () => {
      const user = await User.create(newUser);
      await expect(user.account.accessToken).not.toEqual(newUser.account.accessToken);
      await expect(user.account.refreshToken).not.toEqual(newUser.account.refreshToken);
      await expect(user.account).toHaveProperty('__enc_accessToken', true);
      await expect(user.account).toHaveProperty('__enc_refreshToken', true);
    });
  });
});
