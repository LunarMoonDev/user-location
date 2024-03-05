const Joi = require('joi');
const { loc } = require('./custom.validation');

const createLocation = {
  body: Joi.object().keys({
    city: Joi.string().required(),
    pop: Joi.number().required(),
    state: Joi.string().required(),
    loc: Joi.array().items(Joi.number()).required().custom(loc),
  }),
};

const getLocations = {
  query: Joi.object().keys({
    city: Joi.string(),
    state: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createLocation,
  getLocations,
};
