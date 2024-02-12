const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { providers, providerNames } = require('../config/providers');

/**
 * Subdocument for User model
 */
const accountSchema = mongoose.Schema({
  provider: {
    type: String,
    enum: providers,
    default: providerNames.GOOGLE,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  // Note: these are for backup access aside from caching
  accessToken: {
    type: String,
    required: false,
    trim: true,
  },
  refreshToken: {
    type: String,
    required: false,
    trim: true,
  },
  expireDate: {
    type: Number,
    required: false,
  },
});

// add plugin that convers mongoose to json
accountSchema.plugin(toJSON);

module.exports = accountSchema;
