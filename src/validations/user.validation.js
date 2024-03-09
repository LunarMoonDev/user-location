const Joi = require('joi');

const createUser = {
  body: Joi.object().keys({
    firstName: Joi.string().min(1).max(25).required(),
    lastName: Joi.string().min(1).max(25).required(),
    email: Joi.string().max(40).required().email(),
    location: Joi.object()
      .required()
      .keys({
        city: Joi.string().min(1).max(25).required(),
        state: Joi.string().min(1).max(25).required(),
      }),
  }),
};

module.exports = {
  createUser,
};
