const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const { authService } = require('../../../src/services');
const auth = require('../../../src/config/oauth.google');
const { User } = require('../../../src/models');
const { providerNames } = require('../../../src/config/providers');
const ApiError = require('../../../src/utils/ApiError');

describe('Config: oauth.google', () => {
  describe('verifyFunc method', () => {
    let tokens;
    let params;
    let profile;
    let cb;

    beforeEach(() => {
      tokens = {
        accessToken: faker.string.alphanumeric({ length: 70 }),
        refreshTokens: faker.string.alphanumeric({ length: 70 }),
      };

      params = {
        expires_in: 3599,
      };

      profile = {
        name: {
          givenName: faker.person.firstName(),
          familyName: faker.person.lastName(),
        },
        _json: {
          email: faker.internet.email(),
        },
        id: faker.string.alphanumeric({ length: 24 }),
      };
      cb = jest.fn(() => {});
    });

    test('should call createOrUpdateUserTokens with valid params', async () => {
      const mockCreateOrUpdateUserTokens = jest
        .spyOn(authService, 'createOrUpdateUserTokens')
        .mockImplementationOnce(() => Promise.resolve());

      await expect(
        auth.verifyFunc(null, tokens.accessToken, tokens.refreshTokens, params, profile, cb)
      ).resolves.toBeUndefined();
      await expect(mockCreateOrUpdateUserTokens).toHaveBeenCalled();
      await expect(cb).toHaveBeenCalled();
      await expect(new User(mockCreateOrUpdateUserTokens.mock.calls[0][0]).validate()).resolves.toBeUndefined();
      await expect(mockCreateOrUpdateUserTokens.mock.calls[0][1]).toStrictEqual({
        email: profile._json.email,
        provider: providerNames.GOOGLE,
        subject: profile.id,
      });
      await expect(mockCreateOrUpdateUserTokens.mock.calls[0][2]).toStrictEqual(tokens);
      await expect(cb.mock.calls[0].length).toStrictEqual(2);
    });

    test('should call cb with the error when createOrUpdateUserTokens throws error', async () => {
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockCreateOrUpdateUserTokens = jest
        .spyOn(authService, 'createOrUpdateUserTokens')
        .mockImplementationOnce(() => Promise.reject(error));

      await expect(
        auth.verifyFunc(null, tokens.accessToken, tokens.refreshTokens, params, profile, cb)
      ).resolves.toBeUndefined();
      await expect(mockCreateOrUpdateUserTokens).toHaveBeenCalled();
      await expect(cb).toHaveBeenCalled();
      await expect(new User(mockCreateOrUpdateUserTokens.mock.calls[0][0]).validate()).resolves.toBeUndefined();
      await expect(mockCreateOrUpdateUserTokens.mock.calls[0][1]).toStrictEqual({
        email: profile._json.email,
        provider: providerNames.GOOGLE,
        subject: profile.id,
      });
      await expect(mockCreateOrUpdateUserTokens.mock.calls[0][2]).toStrictEqual(tokens);
      await expect(cb.mock.calls[0].length).toStrictEqual(1);
      await expect(cb.mock.calls[0][0].statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    });
  });
});
