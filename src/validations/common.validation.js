const Joi = require('joi');

const queryFilter = {
  query: Joi.object()
    .keys({
      id: Joi.string().required().hex().length(24),
    })
    .required(),
};

module.exports = {
  queryFilter,
};
