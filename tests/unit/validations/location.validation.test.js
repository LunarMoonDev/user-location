const { faker } = require('@faker-js/faker');
const httpMocks = require('node-mocks-http');
const Joi = require('joi');
const { locationValidation } = require('../../../src/validations');
const pick = require('../../../src/utils/pick');

describe('Validation: locationValidation', () => {
  let mockReq;
  let newLocation;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();

    newLocation = {
      city: faker.location.city(),
      pop: 123,
      state: faker.location.state(),
      loc: [0.21, 23.4],
    };

    mockReq.body = newLocation;
  });

  test('should pass a valid req body', async () => {
    const object = pick(mockReq, ['body']);
    const { value, error } = Joi.compile(locationValidation.createLocation).validate(object);
    await expect(error).not.toBeTruthy();
    await expect(value.body).toStrictEqual(newLocation);
  });

  test('should throw error if city is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newLocation.city;
    const { value, error } = Joi.compile(locationValidation.createLocation).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.city" is required');
  });

  test('should throw error if pop is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newLocation.pop;
    const { value, error } = Joi.compile(locationValidation.createLocation).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.pop" is required');
  });

  test('should throw error if state is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newLocation.state;
    const { value, error } = Joi.compile(locationValidation.createLocation).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.state" is required');
  });

  test('should throw error if loc is missing', async () => {
    const object = pick(mockReq, ['body']);
    delete newLocation.loc;
    const { value, error } = Joi.compile(locationValidation.createLocation).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.loc" is required');
  });

  test('should throw error if loc has less length', async () => {
    const object = pick(mockReq, ['body']);
    newLocation.loc = [];
    const { value, error } = Joi.compile(locationValidation.createLocation).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.loc" must be a length of 2 only');
  });

  test('should throw error if loc invalid value', async () => {
    const object = pick(mockReq, ['body']);
    newLocation.loc = [1222, 2221];
    const { value, error } = Joi.compile(locationValidation.createLocation).validate(object);
    await expect(error).toBeTruthy();
    await expect(error.details[0].message).toStrictEqual('"body.loc" must be between -180 and 180, inclusive');
  });
});
