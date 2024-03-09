const { faker } = require('@faker-js/faker');
const httpMocks = require('node-mocks-http');
const Joi = require('joi');
const { userValidation } = require('../../../src/validations');
const pick = require('../../../src/utils/pick');

describe('Validation: userValidation', () => {
  let mockReq;
  let newUser;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();

    newUser = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      location: {
        city: faker.location.city(),
        state: faker.location.state(),
      },
    };

    mockReq.body = newUser;
  });

  test('should pass a valida req body', async () => {
    const object = pick(mockReq, ['body']);
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).not.toBeTruthy();
    await expect(value.body).toStrictEqual(newUser);
  });

  test('should throw error if firstName is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newUser.firstName;
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.firstName" is required');
  });

  test('should throw error if lastName is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newUser.lastName;
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.lastName" is required');
  });

  test('should throw error if email is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newUser.email;
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.email" is required');
  });

  test('should throw error if email is invalid', async () => {
    const object = pick(mockReq, ['body']);
    newUser.email = 'email';
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.email" must be a valid email');
  });

  test('should throw error if location is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newUser.location;
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.location" is required');
  });

  test('should throw error if location is invalid', async () => {
    const object = pick(mockReq, ['body']);
    newUser.location = 'location';
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.location" must be of type object');
  });

  test('should throw error if location.city is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newUser.location.city;
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.location.city" is required');
  });

  test('should throw error if location.state is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newUser.location.state;
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.location.state" is required');
  });

  test('should throw error if user.firstName is beyond max length', async () => {
    const object = pick(mockReq, ['body']);
    newUser.firstName = faker.string.alphanumeric({ length: 50 });
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual(
      '"body.firstName" length must be less than or equal to 25 characters long'
    );
  });

  test('should throw error if user.firstName is empty', async () => {
    const object = pick(mockReq, ['body']);
    newUser.firstName = '';
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.firstName" is not allowed to be empty');
  });

  test('should throw error if user.lastName is beyond max length', async () => {
    const object = pick(mockReq, ['body']);
    newUser.lastName = faker.string.alphanumeric({ length: 50 });
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual(
      '"body.lastName" length must be less than or equal to 25 characters long'
    );
  });

  test('should throw error if user.lastName is empty', async () => {
    const object = pick(mockReq, ['body']);
    newUser.lastName = '';
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.lastName" is not allowed to be empty');
  });

  test('should throw error if user.email is beyond max length', async () => {
    const object = pick(mockReq, ['body']);
    newUser.email = `${faker.string.alphanumeric({ length: 80 })}@gmail.com`;
    const { value, error } = Joi.compile(userValidation.createUser).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual(
      '"body.email" length must be less than or equal to 40 characters long'
    );
  });
});
