const httpMocks = require('node-mocks-http');
const httpStatus = require('http-status');
const { faker } = require('@faker-js/faker');
const { locationController } = require('../../../src/controllers');
const { locationService } = require('../../../src/services');

describe('Controller: locationController', () => {
  let mockReq;
  let mockRes;
  let mockNext;
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

  describe('createLocation method', () => {
    test('should createLocation when called with valid payload', async () => {
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
});
