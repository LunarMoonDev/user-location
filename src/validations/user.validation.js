const Joi = require('joi');

const createUser = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required().email(),
    location: Joi.object().required().keys({
      city: Joi.string().required(),
      state: Joi.string().required(),
    }),
  }),
};

module.exports = {
  createUser,
};
