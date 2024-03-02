const httpMocks = require('node-mocks-http');
const httpStatus = require('http-status');
const { authController } = require('../../../src/controllers');

describe('Controller: authController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();

    mockReq.logout = jest.fn((x) => x);
    mockNext = jest.fn((x) => x);
    mockRes.status = jest.fn(() => mockRes);
    mockRes.send = jest.fn((x) => x);
  });

  describe('logout method', () => {
    test('should logout when called', async () => {
      await expect(authController.logout(mockReq, mockRes, mockNext)).toBeUndefined();
      await expect(mockReq.logout).toHaveBeenCalled();
      await expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('failure method', () => {
    test('should throw an error when called', async () => {
      await expect(authController.failure(mockReq, mockRes, mockNext)).toBeUndefined();
      await expect(mockNext).toHaveBeenCalled();
      await expect(mockNext.mock.calls[0][0].statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
      await expect(mockNext.mock.calls[0][0].message).toStrictEqual('Please authenticate');
    });
  });

  describe('success method', () => {
    test('should send authenticated message', async () => {
      await expect(authController.success(mockReq, mockRes, mockNext)).toBeUndefined();
      await expect(mockRes.send).toHaveBeenCalled();
      await expect(mockRes.send.mock.calls[0][0]).toStrictEqual('Authentication success');
    });
  });
});
