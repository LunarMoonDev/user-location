const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON } = require('./plugins');
const accountSchema = require('./account.model');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'Location',
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    account: {
      type: accountSchema,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

/**
 * Check if email is taken
 * @param {string} email
 * @param {import('mongoose').ObjectId} excludeUserId
 * @returns {Promise<boolean>}
 */
userSchema.statics.doesEmailExist = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
