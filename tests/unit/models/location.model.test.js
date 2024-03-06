const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const { Location } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');

describe('Model: Location', () => {
  describe('Location validation', () => {
    let newLocation;

    beforeEach(() => {
      newLocation = {
        city: faker.location.city(),
        pop: 1234,
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

    test('should throw validation error if city is more than 25 chars', async () => {
      newLocation.city = faker.string.alphanumeric({ length: 26 });
      await expect(new Location(newLocation).validate()).rejects.toThrow();
    });

    test('should throw validation error if city is blank', async () => {
      newLocation.city = '';
      await expect(new Location(newLocation).validate()).rejects.toThrow();
    });

    test('should throw validation error if state is more than 25 chars', async () => {
      newLocation.state = faker.string.alphanumeric({ length: 26 });
      await expect(new Location(newLocation).validate()).rejects.toThrow();
    });

    test('should throw validation error if state is blank', async () => {
      newLocation.state = '';
      await expect(new Location(newLocation).validate()).rejects.toThrow();
    });

    test('should throw validation error if pop is below 4 digits', async () => {
      newLocation.pop = 123;
      await expect(new Location(newLocation).validate()).rejects.toThrow(
        'Location validation failed: pop: must have 4 digits only'
      );
    });

    test('should throw validation error if pop is above 4 digits', async () => {
      newLocation.pop = 12345;
      await expect(new Location(newLocation).validate()).rejects.toThrow(
        'Location validation failed: pop: must have 4 digits only'
      );
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

  describe('Location doesLocationExist', () => {
    let city;
    let state;
    let newLocation;

    beforeEach(() => {
      city = faker.location.city;
      state = faker.location.state;

      newLocation = {
        city,
        pop: 123,
        state,
        loc: [0.21, 23.4],
      };
    });

    test('should return true when location exist', async () => {
      const mockFindOne = jest.spyOn(Location, 'findOne').mockImplementationOnce(() => Promise.resolve(newLocation));
      await expect(Location.doesLocationExist(city, state)).resolves.toEqual(true);
      await expect(mockFindOne).toHaveBeenCalled();
    });

    test('should return false when location exist', async () => {
      const mockFindOne = jest.spyOn(Location, 'findOne').mockImplementationOnce(() => Promise.resolve(null));
      await expect(Location.doesLocationExist(city, state)).resolves.toEqual(false);
      await expect(mockFindOne).toHaveBeenCalled();
    });

    test('should throw error when findOne throws an error', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'something happened');
      const mockFindOne = jest.spyOn(Location, 'findOne').mockImplementationOnce(() => Promise.reject(error));
      await expect(Location.doesLocationExist(city, state)).rejects.toThrow(error);
      await expect(mockFindOne).toHaveBeenCalled();
    });
  });
});
