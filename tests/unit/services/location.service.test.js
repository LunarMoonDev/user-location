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

  describe('updateLocation method', () => {
    let newFilter;
    let newLocation;

    beforeEach(() => {
      newFilter = {
        city: faker.location.city(),
        state: faker.location.state(),
      };

      newLocation = {
        city: faker.location.city(),
        pop: 123,
        state: faker.location.state(),
        loc: [0.21, 23.4],
      };
    });

    test('should update with valid params', async () => {
      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve(null));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).resolves.toEqual(['success']);
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test('should update with valid params where cities and states are the same', async () => {
      newLocation.city = newFilter.city;
      newLocation.state = newFilter.state;

      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve(null));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).resolves.toEqual(['success']);
      await expect(mockDoesLocationExist).not.toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test('should update with valid params where cities are the same', async () => {
      newLocation.city = newFilter.city;

      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve(null));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).resolves.toEqual(['success']);
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test('should update with valid params where states are the same', async () => {
      newLocation.state = newFilter.state;

      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve(null));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).resolves.toEqual(['success']);
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test('should throw when given update has existing location with same city', async () => {
      newLocation.city = newFilter.city;

      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).rejects.toThrow(
        'Given location in the payload already exist'
      );
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    test('should throw when given update has existing location with same state', async () => {
      newLocation.state = newFilter.state;

      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).rejects.toThrow(
        'Given location in the payload already exist'
      );
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    test('should throw when given update has existing location', async () => {
      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).rejects.toThrow(
        'Given location in the payload already exist'
      );
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    test("should throw when filter doesn't exist in db", async () => {
      const mockDoesLocationExist = jest
        .spyOn(Location, 'doesLocationExist')
        .mockImplementationOnce(() => Promise.resolve(null));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(null));
      await expect(locationService.updateLocation(newFilter, newLocation)).rejects.toThrow('Location does not exist');
      await expect(mockDoesLocationExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('queryLocation method', () => {
    let newFilter;
    let newOptions;

    beforeEach(() => {
      newFilter = {
        city: faker.location.city(),
        state: faker.location.state(),
      };

      newOptions = {
        sortBy: 'field:asc',
        limit: faker.number.int(),
        page: faker.number.int(),
      };
    });

    test('should paginate with valid params', async () => {
      const mockPaginate = jest.spyOn(Location, 'paginate').mockImplementationOnce(() => Promise.resolve([]));
      await expect(locationService.queryLocations(newFilter, newOptions)).resolves.toEqual([]);
      await expect(mockPaginate).toHaveBeenCalled();
    });
  });
});
