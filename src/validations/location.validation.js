const Joi = require('joi');
const { loc } = require('./custom.validation');

const createLocation = {
  body: Joi.object()
    .keys({
      city: Joi.string().min(1).max(25).required(),
      pop: Joi.number().max(9999).min(1000).required().messages({
        'number.min': `"body.pop" must have 4 digits only`,
        'number.max': `"body.pop" must have 4 digits only`,
      }),
      state: Joi.string().min(1).max(25).required(),
      loc: Joi.array().items(Joi.number()).required().custom(loc),
    })
    .required(),
};

const getLocations = {
  query: Joi.object()
    .keys({
      city: Joi.string().max(25).min(1),
      state: Joi.string().max(25).min(1),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
    })
    .required(),
};

const queryFilter = {
  query: Joi.object()
    .keys({
      city: Joi.string().max(25).min(1),
      state: Joi.string().max(25).min(1),
    })
    .required(),
};

const updateLocation = {
  body: Joi.object()
    .keys({
      city: Joi.string().min(1).max(25),
      state: Joi.string().min(1).max(25),
      pop: Joi.number().max(9999).min(1000).messages({
        'number.min': `"body.pop" must have 4 digits only`,
        'number.max': `"body.pop" must have 4 digits only`,
      }),
      loc: Joi.array().items(Joi.number()).custom(loc),
    })
    .required()
    .min(1),
};

module.exports = {
  createLocation,
  getLocations,
  queryFilter,
  updateLocation,
};
