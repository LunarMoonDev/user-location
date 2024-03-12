const httpMocks = require('node-mocks-http');
const httpStatus = require('http-status');
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const { userController } = require('../../../src/controllers');
const { locationService, userService } = require('../../../src/services');

describe('Controller: userController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  describe('createUser method', () => {
    let newLocation;
    let newUser;

    beforeEach(() => {
      mockReq = httpMocks.createRequest();
      mockRes = httpMocks.createResponse();
      mockNext = jest.fn((x) => x);
      mockRes.status = jest.fn(() => mockRes);
      mockRes.send = jest.fn((x) => mockRes);

      newLocation = {
        city: faker.location.city(),
        pop: 123,
        state: faker.location.state(),
        loc: [0.21, 23.4],
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        email: faker.internet.email(),
        location: mongoose.Types.ObjectId(),
      };

      mockReq.body = newUser;
    });

    test('should send CREATED status when params are valid', async () => {
      const mockFindLocation = jest
        .spyOn(locationService, 'findLocation')
        .mockImplementationOnce(() => Promise.resolve(newLocation));

      const expectedUser = JSON.parse(JSON.stringify(newUser));
      const expectedLoc = JSON.parse(JSON.stringify(newLocation));
      expectedUser.location = expectedLoc;

      const mockCreateUser = jest.spyOn(userService, 'createUser').mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userController.createUser(mockReq, mockRes, mockNext)).toBeUndefined();
      await expect(mockFindLocation).toHaveBeenCalled();
      await expect(mockCreateUser).toHaveBeenCalled();
      await expect(mockRes.send).toHaveBeenCalled();
      await expect(mockRes.status.mock.calls[0][0]).toEqual(httpStatus.CREATED);
      await expect(mockFindLocation.mock.calls[0][1]).toEqual(true); // error handling must be active here
      await expect(mockRes.send.mock.calls[0][0]).toEqual(expectedUser);
    });
  });

  describe('updateUser method', () => {
    let newLocation;
    let newUser;
    let newFilter;

    beforeEach(() => {
      mockReq = httpMocks.createRequest();
      mockRes = httpMocks.createResponse();
      mockNext = jest.fn((x) => x);
      mockRes.status = jest.fn(() => mockRes);
      mockRes.send = jest.fn((x) => mockRes);

      newLocation = {
        city: faker.location.city(),
        state: faker.location.state(),
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        email: faker.internet.email(),
        location: newLocation,
      };

      newFilter = {
        id: mongoose.Types.ObjectId().toString(),
      };

      mockReq.body = newUser;
      mockReq.query = newFilter;
    });

    test('should send OK status when params are valid', async () => {
      const mockUpdateUser = jest.spyOn(userService, 'updateUser').mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userController.updateUser(mockReq, mockRes, mockNext)).toBeUndefined();
      await expect(mockUpdateUser).toHaveBeenCalled();
      await expect(mockRes.send).toHaveBeenCalled();
      await expect(mockRes.status.mock.calls[0][0]).toEqual(httpStatus.OK);
      await expect(mockUpdateUser.mock.calls[0][0]).toEqual(newFilter);
      await expect(mockUpdateUser.mock.calls[0][1]).toEqual(newUser);
      await expect(mockRes.send.mock.calls[0][0]).toEqual(newUser);
    });
  });
});
