const { faker } = require('@faker-js/faker');
const { User } = require('../../../src/models');
const { providerNames } = require('../../../src/config/providers');

describe('Model: User', () => {
  describe('User validation', () => {
    let newUser;
    let newAccount;

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
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new User(newUser).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if role is invalid', async () => {
      newUser.role = 'invalid';
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
});
