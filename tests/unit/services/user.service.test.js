const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { userService } = require('../../../src/services');
const { providerNames } = require('../../../src/config/providers');
const { User, Location } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');
const setupTestDB = require('../../utils/setupTestDB');

setupTestDB();

describe('Service: userService', () => {
  let newUser;
  let newAccount;
  let condition;

  describe('createUser method', () => {
    beforeEach(() => {
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
        email: faker.internet.email(),
      };
    });

    test('should create when the given user is valid', async () => {
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(false));
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockCreateUser = jest.spyOn(User, 'create').mockImplementationOnce(() => Promise.resolve(newUser));

      await expect(userService.createUser(newUser)).resolves.toStrictEqual(newUser);
      await expect(mockCreateUser).toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
      await expect(mockDoesEmailExist.mock.calls[0][0]).toStrictEqual(newUser.email);
    });

    test('should create when the given user is valid with location', async () => {
      const location = {
        city: faker.location.city(),
        state: faker.location.state(),
      };
      newUser.location = location;

      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockCreateUser = jest.spyOn(User, 'create').mockImplementationOnce(() => Promise.resolve(newUser));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(false));
      await expect(userService.createUser(newUser)).resolves.toStrictEqual(newUser);
      await expect(mockCreateUser).toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate.mock.calls[0][0]).toEqual(location);
      await expect(mockFindOneAndUpdate.mock.calls[0][1]).toEqual({ $inc: { population: 1 } });
      await expect(mockDoesEmailExist.mock.calls[0][0]).toStrictEqual(newUser.email);
    });

    test('should throw an error when create throws an error', async () => {
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockCreateUser = jest.spyOn(User, 'create').mockImplementationOnce(() => Promise.reject(error));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(false));
      await expect(userService.createUser(newUser)).rejects.toStrictEqual(error);
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
      await expect(mockCreateUser).toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
    });

    test('should throw email already exist when email exist in db', async () => {
      const mockFindOneAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
      const mockCreateUser = jest.spyOn(User, 'create').mockImplementationOnce(() => Promise.resolve(newUser));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(true));
      await expect(userService.createUser(newUser)).rejects.toThrow(error);
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
      await expect(mockCreateUser).not.toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
    });
  });

  describe('getUserByProviderAndSubject method', () => {
    beforeEach(() => {
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
        email: faker.internet.email(),
      };

      condition = {
        'account.provider': newAccount.provider,
        'account.subject': newAccount.subject,
      };
    });

    test('should return a user object when it exists in database', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userService.getUserByProviderAndSubject(newAccount.provider, newAccount.subject)).resolves.toStrictEqual(
        newUser
      );
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual(condition);
    });

    test("should return an empty object when it doesn't exists in database", async () => {
      condition['account.provider'] = providerNames.FACEBOOK;
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve([]));
      await expect(
        userService.getUserByProviderAndSubject(providerNames.FACEBOOK, newAccount.subject)
      ).resolves.toStrictEqual([]);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual(condition);
    });

    test('should throw an error when findOne throws an error', async () => {
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.reject(error));
      await expect(userService.getUserByProviderAndSubject(newAccount.provider, newAccount.subject)).rejects.toStrictEqual(
        error
      );
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual(condition);
    });
  });

  describe('findUserAndUpdate method', () => {
    let newFilter;

    beforeEach(() => {
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
        email: faker.internet.email(),
      };

      // update step
      newUser.account.accessToken = faker.string.alphanumeric();

      condition = {
        'account.provider': newAccount.provider,
        'account.subject': newAccount.subject,
      };

      newFilter = {
        provider: newAccount.provider,
        subject: newAccount.subject,
        email: newUser.email,
      };
    });

    test('should return the updated user when it exist in database', async () => {
      const mockFindOneAndUpdate = jest
        .spyOn(User, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(true));
      await expect(userService.findUserAndUpdate(newFilter, newUser)).resolves.toStrictEqual(newUser);
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockDoesEmailExist.mock.calls[0][0]).toStrictEqual(newUser.email);
    });

    test("should return empty when it doesn't in database", async () => {
      const mockFindOneAndUpdate = jest.spyOn(User, 'findOneAndUpdate').mockImplementationOnce(() => Promise.resolve([]));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(true));
      await expect(userService.findUserAndUpdate(newFilter, newUser)).resolves.toStrictEqual([]);
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test('should throw an error when findOneAndUpdate throws an error', async () => {
      const error = new ApiError(httpStatus.NOT_ACCEPTABLE, 'unacceptable');
      const mockFindOneAndUpdate = jest.spyOn(User, 'findOneAndUpdate').mockImplementationOnce(() => Promise.reject(error));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(true));
      await expect(userService.findUserAndUpdate(newFilter, newUser)).rejects.toThrow(error);
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    test("should throw missing user when email doesn't exist in db", async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'User does not exist');
      const mockFindOneAndUpdate = jest.spyOn(User, 'findOneAndUpdate').mockImplementationOnce(() => Promise.resolve(null));
      const mockDoesEmailExist = jest.spyOn(User, 'doesEmailExist').mockImplementationOnce(() => Promise.resolve(false));
      await expect(userService.findUserAndUpdate(newFilter, newUser)).rejects.toThrow(error);
      await expect(mockDoesEmailExist).toHaveBeenCalled();
      await expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('updateUser method', () => {
    let newFilter;
    let newLocation;

    beforeEach(() => {
      newLocation = {
        city: faker.location.city(),
        state: faker.location.city(),
      };

      newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user',
        email: faker.internet.email(),
        location: newLocation,
        isDisabled: false,
      };

      newFilter = {
        id: mongoose.Types.ObjectId().toString(),
      };
    });

    test('should update with valid params', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(null));
      const mockLocFindAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockFineOneAndUpdate = jest
        .spyOn(User, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userService.updateUser(newFilter, newUser)).resolves.toEqual(newUser);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockFineOneAndUpdate).toHaveBeenCalled();
      await expect(mockLocFindAndUpdate).toHaveBeenCalled();
      await expect(mockLocFindAndUpdate.mock.calls[0][1]).toStrictEqual({ $inc: { population: 1 } });
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual({ _id: { $ne: newFilter.id }, email: newUser.email });
      await expect(mockFineOneAndUpdate.mock.calls[0][0]).toStrictEqual({ _id: newFilter.id });
      await expect(mockFineOneAndUpdate.mock.calls[0][1]).toStrictEqual(newUser);
      await expect(mockFineOneAndUpdate.mock.calls[0][2]).toStrictEqual({ new: true });
    });

    test('should update with valid params but without location', async () => {
      delete newUser.location;

      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(null));
      const mockLocFindAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockFineOneAndUpdate = jest
        .spyOn(User, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userService.updateUser(newFilter, newUser)).resolves.toEqual(newUser);
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockLocFindAndUpdate).not.toHaveBeenCalled();
      await expect(mockFineOneAndUpdate).toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual({ _id: { $ne: newFilter.id }, email: newUser.email });
      await expect(mockFineOneAndUpdate.mock.calls[0][0]).toStrictEqual({ _id: newFilter.id });
      await expect(mockFineOneAndUpdate.mock.calls[0][1]).toStrictEqual(newUser);
      await expect(mockFineOneAndUpdate.mock.calls[0][2]).toStrictEqual({ new: true });
    });

    test('should update with valid params but without email', async () => {
      delete newUser.email;
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(null));
      const mockLocFindAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockFineOneAndUpdate = jest
        .spyOn(User, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userService.updateUser(newFilter, newUser)).resolves.toEqual(newUser);
      await expect(mockFindOne).not.toHaveBeenCalled();
      await expect(mockLocFindAndUpdate).toHaveBeenCalled();
      await expect(mockFineOneAndUpdate).toHaveBeenCalled();
      await expect(mockFineOneAndUpdate.mock.calls[0][0]).toStrictEqual({ _id: newFilter.id });
      await expect(mockFineOneAndUpdate.mock.calls[0][1]).toStrictEqual(newUser);
      await expect(mockFineOneAndUpdate.mock.calls[0][2]).toStrictEqual({ new: true });
    });

    test('should throw when email exist', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(['success']));
      const mockLocFindAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockFineOneAndUpdate = jest
        .spyOn(User, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userService.updateUser(newFilter, newUser)).rejects.toThrow('Email already taken');
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockLocFindAndUpdate).not.toHaveBeenCalled();
      await expect(mockFineOneAndUpdate).not.toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual({ _id: { $ne: newFilter.id }, email: newUser.email });
    });

    test('should throw when isDisabled is true', async () => {
      newUser.isDisabled = true;
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(null));
      const mockLocFindAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve([]));
      const mockFineOneAndUpdate = jest
        .spyOn(User, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userService.updateUser(newFilter, newUser)).rejects.toThrow('Please use the DELETE /users API instead');
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockLocFindAndUpdate).not.toHaveBeenCalled();
      await expect(mockFineOneAndUpdate).not.toHaveBeenCalled();
      await expect(mockFindOne.mock.calls[0][0]).toStrictEqual({ _id: { $ne: newFilter.id }, email: newUser.email });
    });

    test("should throw when user.location doesn't exist in db", async () => {
      const mockFindOne = jest.spyOn(User, 'findOne').mockImplementationOnce(() => Promise.resolve(null));
      const mockLocFindAndUpdate = jest
        .spyOn(Location, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(null));
      const mockFineOneAndUpdate = jest
        .spyOn(User, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.resolve(newUser));
      await expect(userService.updateUser(newFilter, newUser)).rejects.toThrow('Location does not exist');
      await expect(mockFindOne).toHaveBeenCalled();
      await expect(mockLocFindAndUpdate).toHaveBeenCalled();
      await expect(mockFineOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('queryUsers method', () => {
    let newFilter;
    let newOptions;

    beforeEach(() => {
      newFilter = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      };
    });

    test('should paginate with valid params', async () => {
      const mockPaginate = jest.spyOn(User, 'paginate').mockImplementationOnce(() => Promise.resolve([]));
      await expect(userService.queryUsers(newFilter, newOptions)).resolves.toEqual([]);
      await expect(mockPaginate).toHaveBeenCalled();
    });
  });

  describe('deleteUsers method', () => {
    let user1;
    let user2;
    let loc1;

    beforeEach(() => {
      loc1 = {
        city: faker.location.city(),
        state: faker.location.state(),
        pop: 1234,
        loc: [0.21, 23.4],
        population: 2,
      };

      user1 = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        account: {
          provider: providerNames.GOOGLE,
          subject: '104604077708513089592',
          accessToken: faker.string.alphanumeric(),
          refreshToken: faker.string.alphanumeric({ length: 218 }),
          expireDate: 1707912638,
        },
      };

      user2 = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        account: {
          provider: providerNames.GOOGLE,
          subject: '104604077708513089592',
          accessToken: faker.string.alphanumeric(),
          refreshToken: faker.string.alphanumeric({ length: 218 }),
          expireDate: 1707912638,
        },
      };
    });

    test('should delete with valid params', async () => {
      const loc = await Location.create(loc1);
      user1.location = loc;
      user2.location = loc;
      const userOne = await User.create(user1);
      const userTwo = await User.create(user2);

      const filter = {
        ids: [userOne._id.toString(), userTwo._id.toString()],
      };

      await expect(userService.deleteUsers(filter)).resolves.toStrictEqual({ count: 2 });
      await expect(Location.findOne({ _id: loc._id })).resolves.toHaveProperty('population', 0);
      await expect(User.findOne({ _id: userOne._id })).resolves.toHaveProperty('isDisabled', true);
      await expect(User.findOne({ _id: userTwo._id })).resolves.toHaveProperty('isDisabled', true);
    });

    test('should return 0 counts when users do not exist', async () => {
      const loc = await Location.create(loc1);
      user1.location = loc;
      user2.location = loc;
      const userOne = await User.create(user1);
      const userTwo = await User.create(user2);

      const filter = {
        ids: [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()],
      };

      await expect(userService.deleteUsers(filter)).resolves.toStrictEqual({ count: 0 });
      await expect(Location.findOne({ _id: loc._id })).resolves.toHaveProperty('population', 2);
      await expect(User.findOne({ _id: userOne._id })).resolves.toHaveProperty('isDisabled', false);
      await expect(User.findOne({ _id: userTwo._id })).resolves.toHaveProperty('isDisabled', false);
    });
  });
});
