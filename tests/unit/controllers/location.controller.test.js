const httpMocks = require('node-mocks-http');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const { locationController } = require('../../../src/controllers');
const { locationService } = require('../../../src/services');

describe('Controller: locationController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  describe('createLocation method', () => {
    let newLocation;

    beforeEach(() => {
      mockReq = httpMocks.createRequest();
      mockRes = httpMocks.createResponse();

      mockNext = jest.fn((x) => x);
      mockRes.status = jest.fn(() => mockRes);
      mockRes.send = jest.fn((x) => x);

      newLocation = {
        city: faker.location.city(),
        pop: 123,
        state: faker.location.state(),
        loc: [0.21, 23.4],
      };

      mockReq.body = newLocation;
    });

    test('should call createLocation successfully when called with valid payload', async () => {
      const mockCreateLocation = jest
        .spyOn(locationService, 'createLocation')
        .mockImplementationOnce(() => Promise.resolve(newLocation));
      await expect(locationController.createLocation(mockReq, mockRes, mockNext)).toBeUndefined();

      await expect(mockCreateLocation).toHaveBeenCalled();
      await expect(mockRes.status).toHaveBeenCalled();
      await expect(mockRes.send).toHaveBeenCalled();
      await expect(mockCreateLocation.mock.calls[0][0]).toStrictEqual(newLocation);
      await expect(mockRes.send.mock.calls[0][0]).toStrictEqual(newLocation);
      await expect(mockRes.status.mock.calls[0][0]).toStrictEqual(httpStatus.CREATED);
    });
  });

  describe('updateLocation method', () => {
    let newLocation;
    let newFilter;

    beforeEach(() => {
      mockReq = httpMocks.createRequest();
      mockRes = httpMocks.createResponse();

      mockNext = jest.fn((x) => x);
      mockRes.status = jest.fn(() => mockRes);
      mockRes.send = jest.fn((x) => x);

      newLocation = {
        city: faker.location.city(),
        pop: 123,
        state: faker.location.state(),
        loc: [0.21, 23.4],
      };

      newFilter = {
        id: mongoose.Types.ObjectId().toString(),
      };

      mockReq.body = newLocation;
      mockReq.query = newFilter;
    });

    test('should call updateLocation successfully when called with valid payload', async () => {
      const mockUpdateLocation = jest
        .spyOn(locationService, 'updateLocation')
        .mockImplementationOnce(() => Promise.resolve(newLocation));
      await expect(locationController.updateLocation(mockReq, mockRes, mockNext)).toBeUndefined();

      await expect(mockUpdateLocation).toHaveBeenCalled();
      await expect(mockRes.status).toHaveBeenCalled();
      await expect(mockRes.send).toHaveBeenCalled();
      await expect(mockUpdateLocation.mock.calls[0]).toEqual([newFilter, newLocation]);
      await expect(mockRes.send.mock.calls[0][0]).toStrictEqual(newLocation);
      await expect(mockRes.status.mock.calls[0][0]).toStrictEqual(httpStatus.OK);
    });
  });

  describe('queryLocations method', () => {
    let newQuery;

    beforeEach(() => {
      mockReq = httpMocks.createRequest();
      mockRes = httpMocks.createResponse();

      mockNext = jest.fn((x) => x);
      mockRes.status = jest.fn(() => mockRes);
      mockRes.send = jest.fn((x) => x);

      newQuery = {
        city: faker.location.city(),
        state: faker.location.city(),
        sortBy: 'field:asc',
        limit: faker.number.int(),
        page: faker.number.int(),
      };

      mockReq.query = newQuery;
    });

    test('should call queryLocations successfully when called with valid payload', async () => {
      const mockQueryLocations = jest
        .spyOn(locationService, 'queryLocations')
        .mockImplementationOnce(() => Promise.resolve({}));
      await expect(locationController.getLocations(mockReq, mockRes, mockNext)).toBeUndefined();

      await expect(mockQueryLocations).toHaveBeenCalled();
      await expect(mockRes.status).toHaveBeenCalled();
      await expect(mockRes.send).toHaveBeenCalled();
      await expect(mockQueryLocations.mock.calls[0][0]).toHaveProperty('city', newQuery.city);
      await expect(mockQueryLocations.mock.calls[0][0]).toHaveProperty('state', newQuery.state);
      await expect(mockQueryLocations.mock.calls[0][1]).toHaveProperty('sortBy', newQuery.sortBy);
      await expect(mockQueryLocations.mock.calls[0][1]).toHaveProperty('limit', newQuery.limit);
      await expect(mockQueryLocations.mock.calls[0][1]).toHaveProperty('page', newQuery.page);
      await expect(mockRes.send.mock.calls[0][0]).toStrictEqual({});
      await expect(mockRes.status.mock.calls[0][0]).toStrictEqual(httpStatus.OK);
    });
  });
});
