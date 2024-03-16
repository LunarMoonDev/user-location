const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const accountSchema = require('./account.model');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxLength: 25,
      minLength: 1,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxLength: 25,
      minLength: 1,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxLength: 40,
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

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

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
