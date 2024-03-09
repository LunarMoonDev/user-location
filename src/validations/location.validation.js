const Joi = require('joi');
const { loc } = require('./custom.validation');

const createLocation = {
  body: Joi.object().keys({
    city: Joi.string().min(1).max(25).required(),
    pop: Joi.number().max(9999).min(1000).required().messages({
      'number.min': `"body.pop" must have 4 digits only`,
      'number.max': `"body.pop" must have 4 digits only`,
    }),
    state: Joi.string().min(1).max(25).required(),
    loc: Joi.array().items(Joi.number()).required().custom(loc),
  }),
};

const getLocations = {
  query: Joi.object().keys({
    city: Joi.string().max(25).min(1),
    state: Joi.string().max(25).min(1),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createLocation,
  getLocations,
};
