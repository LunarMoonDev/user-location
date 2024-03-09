const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
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
        id: mongoose.Types.ObjectId().toString(),
      };

      newLocation = {
        city: faker.location.city(),
        pop: 123,
        state: faker.location.state(),
        loc: [0.21, 23.4],
      };
    });

    test('should update with valid params', async () => {
      const mockFindOne = jest.spyOn(Location, 'findOne').mockReturnValueOnce(null);
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).resolves.toEqual(['success']);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls.length).toBe(1);
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate.mock.calls[0][0]).toEqual({ _id: newFilter.id });
    });

    test('should update with valid params (no state and city in payload)', async () => {
      delete newLocation.state;
      delete newLocation.city;

      const mockFindOne = jest.spyOn(Location, 'findOne').mockReturnValueOnce(null);
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).resolves.toEqual(['success']);
      await expect(mockFindOne).not.toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test("should throw when given city and state doesn't exist (no city in payload)", async () => {
      const { city } = newLocation;
      delete newLocation.city;

      const mockFindOne = jest.spyOn(Location, 'findOne').mockReturnValueOnce({ city }).mockReturnValueOnce(null);
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).resolves.toEqual(['success']);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls.length).toBe(2);
      await expect(mockFindOne.mock.calls[0][0]).toEqual({ _id: newFilter.id });
      await expect(mockFindOne.mock.calls[1][0]).toEqual({
        _id: { $ne: newFilter.id },
        city,
        state: newLocation.state,
      });
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test("should throw when given city and state doesn't exist (no state in payload)", async () => {
      const { state } = newLocation;
      delete newLocation.state;

      const mockFindOne = jest.spyOn(Location, 'findOne').mockReturnValueOnce({ state }).mockReturnValueOnce(null);
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).resolves.toEqual(['success']);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls.length).toBe(2);
      await expect(mockFindOne.mock.calls[0][0]).toEqual({ _id: newFilter.id });
      await expect(mockFindOne.mock.calls[1][0]).toEqual({
        _id: { $ne: newFilter.id },
        city: newLocation.city,
        state,
      });
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test('should throw when given city and state exist (no city in payload)', async () => {
      delete newLocation.city;

      const mockFindOne = jest
        .spyOn(Location, 'findOne')
        .mockReturnValueOnce({ city: faker.location.city() })
        .mockReturnValueOnce({});
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).rejects.toThrow(
        'Given location in the payload already exist'
      );
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    test('should throw when given city and state exist (no state in payload)', async () => {
      delete newLocation.state;

      const mockFindOne = jest
        .spyOn(Location, 'findOne')
        .mockReturnValueOnce({ state: faker.location.city() })
        .mockReturnValueOnce({});
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(['success']));
      await expect(locationService.updateLocation(newFilter, newLocation)).rejects.toThrow(
        'Given location in the payload already exist'
      );
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    test("should throw when filter doesn't exist in db", async () => {
      const mockFindOne = jest.spyOn(Location, 'findOne').mockReturnValueOnce(null);
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(null));
      await expect(locationService.updateLocation(newFilter, newLocation)).rejects.toThrow('Location does not exist');
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls.length).toBe(1);
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
