const { faker } = require('@faker-js/faker');
const { Location } = require('../../../src/models');

describe('Model: Location', () => {
  describe('Location validation', () => {
    let newLocation;

    beforeEach(() => {
      newLocation = {
        city: faker.location.city(),
        pop: 123,
        state: faker.location.state(),
        loc: [0.21, 23.4],
      };
    });

    test('should correctly validate a valid location', async () => {
      await expect(new Location(newLocation).validate()).resolves.toBeUndefined();
    });

    test('should throw validation error if loc is invalid in length', async () => {
      newLocation.loc = [];
      await expect(new Location(newLocation).validate()).rejects.toThrow();
    });

    test('should throw validation error if loc is invalid in values', async () => {
      newLocation.loc = [123, 1234];
      await expect(new Location(newLocation).validate()).rejects.toThrow();
    });
  });

  describe('Location toJSON()', () => {
    test('should not return account with createdAt/ updatedAt when toJSON is called', () => {
      const newLocation2 = {
        city: faker.location.city(),
        pop: 123,
        state: faker.location.state(),
        loc: [0.21, 23.4],
        createdAt: '02-01-2023',
        updatedAt: '02-01-2024',
      };

      expect(new Location(newLocation2).toJSON()).not.toHaveProperty('createdAt');
      expect(new Location(newLocation2).toJSON()).not.toHaveProperty('updatedAt');
    });
  });
});
