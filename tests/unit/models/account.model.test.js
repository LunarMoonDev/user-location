const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const { Account } = require('../../../src/models');
const { providerNames } = require('../../../src/config/providers');

describe('Model: Account', () => {
  const AccountModel = mongoose.model('Account', Account);

  describe('Account validation', () => {
    let newAccount;

    beforeEach(() => {
      newAccount = {
        provider: providerNames.GOOGLE,
        subject: '104604077708513089592',
        accessToken: faker.string.alphanumeric(),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireDate: 1707912638,
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new AccountModel(newAccount).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if provider is invalid', async () => {
      newAccount.provider = 'invalid';
      await expect(new AccountModel(newAccount).validate()).rejects.toThrow();
    });

    test('should throw a validation error if expiredDate is invalid', async () => {
      newAccount.expireDate = 'invalid';
      await expect(new AccountModel(newAccount).validate()).rejects.toThrow();
    });
  });

  describe('Account toJSON()', () => {
    test('should not return account with createdAt/ updatedAt when toJSON is called', () => {
      const newAccount2 = {
        provider: providerNames.GOOGLE,
        subject: '104604077708513089592',
        accessToken: faker.string.alphanumeric({ length: 218 }),
        refreshToken: faker.string.alphanumeric({ length: 218 }),
        expireData: 1707912638,
        createdAt: '02-01-2023',
        updatedAt: '02-01-2024',
      };

      expect(new AccountModel(newAccount2).toJSON()).not.toHaveProperty('createdAt');
      expect(new AccountModel(newAccount2).toJSON()).not.toHaveProperty('updatedAt');
    });
  });
});
