const Joi = require('joi');

const queryFilter = {
  query: Joi.object()
    .keys({
      id: Joi.string().required().hex().length(24),
    })
    .required(),
};

const deleteFilter = {
  query: Joi.object()
    .keys({
      ids: Joi.array().min(1).items(Joi.string().hex().length(24)).single().required(),
    })
    .required(),
};

module.exports = {
  queryFilter,
  deleteFilter,
};
