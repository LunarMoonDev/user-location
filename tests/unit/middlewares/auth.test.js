const { faker } = require('@faker-js/faker');
const httpMocks = require('node-mocks-http');
const httpStatus = require('http-status');
const moment = require('moment');
const { providerNames } = require('../../../src/config/providers');
const { auth, refresh, refreshCallback } = require('../../../src/middlewares/auth');
const { authService } = require('../../../src/services');

jest.mock('googleapis', () => {
  const googleApisMock = {
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => {
          return {
            setCredentials: jest.fn((x) => x),
            refreshAccessToken: jest.fn((x) =>
              x(null, {
                access_token: 'klasdjfhasldkgj',
                expire_date: 2145435264,
              })
            ),
          };
        }),
      },
    },
  };
  return googleApisMock;
});

describe('Middleware: auth', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let newUser;
  let newAccount;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
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

    mockNext = jest.fn((x) => x);
    mockReq.user = newUser;
  });

  describe('auth method', () => {
    test('should call next when user has authorization rights', async () => {
      newUser.role = 'admin';
      await expect(auth('manageUsers')(mockReq, mockRes, mockNext)).resolves.toBeUndefined();
      await expect(mockNext).toHaveBeenCalled();
      await expect(mockNext.mock.calls[0].length).toStrictEqual(0);
    });

    test('should throw when user does not exist', async () => {
      delete mockReq.user;
      await expect(auth('manageUsers')(mockReq, mockRes, mockNext)).resolves.toThrow();
      await expect(mockNext).toHaveBeenCalled();
      await expect(mockNext.mock.calls[0].length).toStrictEqual(1);
      await expect(mockNext.mock.calls[0][0].statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    });

    test('should throw when user is not authorized', async () => {
      await expect(auth('deleteUsers')(mockReq, mockRes, mockNext)).resolves.toThrow();
      await expect(mockNext).toHaveBeenCalled();
      await expect(mockNext.mock.calls[0].length).toStrictEqual(1);
      await expect(mockNext.mock.calls[0][0].statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    });
  });

  describe('refresh method', () => {
    test('should pass when expireDate is within duration', async () => {
      newUser.account.expireDate = moment().format('X');
      await expect(refresh(mockReq, mockRes, mockNext)).resolves.toBeUndefined();
      await expect(mockNext).toHaveBeenCalled();
      await expect(mockNext.mock.calls[0].length).toStrictEqual(0);
    });

    test('should throw when user is missing', async () => {
      delete mockReq.user;
      await expect(refresh(mockReq, mockRes, mockNext)).resolves.toThrow();
      await expect(mockNext).toHaveBeenCalled();
      await expect(mockNext.mock.calls[0].length).toStrictEqual(1);
      await expect(mockNext.mock.calls[0][0].statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    });

    test('should call oauth to restart access tokens', async () => {
      const mockUpdateUserTokens = jest.spyOn(authService, 'updateUserTokens').mockImplementation(() => Promise.resolve());
      newUser.account.expireDate = 1710013285;
      await expect(refresh(mockReq, mockRes, mockNext)).resolves.toBeUndefined();
      await expect(mockNext).toHaveBeenCalled();
      await expect(mockNext.mock.calls[0].length).toStrictEqual(0);
      await expect(mockUpdateUserTokens).toHaveBeenCalled();
    });
  });

  describe('refreshCallback method', () => {
    test('should throw when given error is not empty', async () => {
      const mockResolve = jest.fn((x) => x);
      const mockReject = jest.fn((x) => x);
      const err = { error: 'message here' };
      const tokens = { access_token: 'asdfasdf', expire_date: 2145435264 };

      await expect(refreshCallback(mockReq, mockResolve, mockReject)(err, tokens)).resolves.toThrow();
      await expect(mockReject).toHaveBeenCalled();
      await expect(mockReject.mock.calls[0][0].statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    });
  });
});
