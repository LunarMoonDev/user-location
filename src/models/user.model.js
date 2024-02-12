const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const accountSchema = require('./account.model');
const { roles, roleNames } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: roles,
      default: roleNames.user,
    },
    account: accountSchema,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
