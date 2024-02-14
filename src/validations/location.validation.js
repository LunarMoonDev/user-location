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

module.exports = {
  createLocation,
};
