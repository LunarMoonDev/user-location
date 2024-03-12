const Joi = require('joi');
const { roles } = require('../config/roles');

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

const updateUser = {
  body: Joi.object()
    .keys({
      firstName: Joi.string().min(1).max(25),
      lastName: Joi.string().min(1).max(25),
      email: Joi.string().max(40).email(),
      role: Joi.string().valid(...roles),
      location: Joi.object().keys({
        city: Joi.string().min(1).max(25).required(),
        state: Joi.string().min(1).max(25).required(),
      }),
    })
    .required()
    .min(1),
};

module.exports = {
  createUser,
  updateUser,
};
