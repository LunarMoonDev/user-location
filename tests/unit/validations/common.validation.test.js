const { faker } = require('@faker-js/faker');
const httpMocks = require('node-mocks-http');
const Joi = require('joi');
const mongoose = require('mongoose');
const { commonValidation } = require('../../../src/validations');
const pick = require('../../../src/utils/pick');

describe('Validation: commonValidation', () => {
  describe('queryFilter validate', () => {
    let mockReq;
    let newQuery;

    beforeEach(() => {
      mockReq = httpMocks.createRequest();

      newQuery = {
        id: mongoose.Types.ObjectId().toString(),
      };

      mockReq.query = newQuery;
    });

    test('should pass a valid req query', async () => {
      const object = pick(mockReq, ['query']);
      const { value, error } = Joi.compile(commonValidation.queryFilter).validate(object);
      await expect(error).not.toBeTruthy();
      await expect(value.query).toStrictEqual(newQuery);
    });

    test('should throw error if city has more than 24 chars', async () => {
      const object = pick(mockReq, ['query']);
      newQuery.id = faker.string.hexadecimal({ length: 27, prefix: '' });
      const { value, error } = Joi.compile(commonValidation.queryFilter).validate(object);
      await expect(error).toBeTruthy();
      await expect(error.details[0].message).toStrictEqual('"query.id" length must be 24 characters long');
    });

    test('should throw error if id is empty', async () => {
      const object = pick(mockReq, ['query']);
      newQuery.id = '';
      const { value, error } = Joi.compile(commonValidation.queryFilter).validate(object);
      await expect(error).toBeTruthy();
      await expect(error.details[0].message).toStrictEqual('"query.id" is not allowed to be empty');
    });

    test('should throw error if id is not hex', async () => {
      const object = pick(mockReq, ['query']);
      newQuery.id = '123123asdfae123132adfasdfgwrt234DFasdfgfg2345';
      const { value, error } = Joi.compile(commonValidation.queryFilter).validate(object);
      await expect(error).toBeTruthy();
      await expect(error.details[0].message).toStrictEqual('"query.id" must only contain hexadecimal characters');
    });
  });

  describe('deleteFilter validate', () => {
    let mockReq;
    let newQuery;

    beforeEach(() => {
      mockReq = httpMocks.createRequest();

      newQuery = {
        ids: [mongoose.Types.ObjectId().toString(), mongoose.Types.ObjectId().toString()],
      };

      mockReq.query = newQuery;
    });

    test('should pass a valid req query', async () => {
      const object = pick(mockReq, ['query']);
      const { value, error } = Joi.compile(commonValidation.deleteFilter).validate(object);
      await expect(error).not.toBeTruthy();
      await expect(value.query).toStrictEqual(newQuery);
    });

    test('should pass a valid req query when ids is a single string', async () => {
      newQuery.ids = mongoose.Types.ObjectId().toString();
      const object = pick(mockReq, ['query']);
      const { value, error } = Joi.compile(commonValidation.deleteFilter).validate(object);
      await expect(error).not.toBeTruthy();
      await expect(value.query).toStrictEqual({ ids: [newQuery.ids] });
    });

    test('should throw error if ids is invalid', async () => {
      newQuery.ids = 'invalid';
      const object = pick(mockReq, ['query']);
      const { value, error } = Joi.compile(commonValidation.deleteFilter).validate(object);
      await expect(error).toBeTruthy();
      await expect(error.details[0].message).toStrictEqual('"query.ids" must only contain hexadecimal characters');
    });

    test('should throw error if ids is empty list', async () => {
      newQuery.ids = [];
      const object = pick(mockReq, ['query']);
      const { value, error } = Joi.compile(commonValidation.deleteFilter).validate(object);
      await expect(error).toBeTruthy();
      await expect(error.details[0].message).toStrictEqual('"query.ids" must contain at least 1 items');
    });
  });
});
