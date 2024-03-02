const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const { locationService } = require('../../../src/services');
const { Location } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');

describe('Service: locationService', () => {
  describe('createLocation method', () => {
    let newLocation;

    beforeEach(() => {
      newLocation = {
        city: faker.location.city(),
        pop: 123,
        state: faker.location.state(),
        loc: [0.21, 23.4],
      };
    });

    test('should create when the given user is valid', async () => {
      const mockCreate = jest.spyOn(Location, 'create').mockImplementationOnce(() => Promise.resolve(newLocation));
      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve(false));
      await expect(locationService.createLocation(newLocation)).resolves.toStrictEqual(newLocation);
      await expect(mockCreate).toHaveBeenCalled();
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockDoesLocationExist.mock.calls[0]).toEqual([newLocation.city, newLocation.state]);
    });

    test('should throw an error when error throws an error', async () => {
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockCreate = jest.spyOn(Location, 'create').mockImplementationOnce(() => Promise.reject(error));
      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve(false));
      await expect(locationService.createLocation(newLocation)).rejects.toStrictEqual(error);
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockCreate).toHaveBeenCalled();
    });

    test('should throw already exist error when location exists in db', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Location already exist');
      const mockCreate = jest.spyOn(Location, 'create').mockImplementationOnce(() => Promise.resolve(newLocation));
      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve(true));
      await expect(locationService.createLocation(newLocation)).rejects.toThrow(error);
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockCreate).not.toHaveBeenCalled();
    });
  });
});
