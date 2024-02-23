const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

/**
 *  validates loc fields with latitude and longitude inside
 * @param {*} value loc array of length 2
 * @returns boolean
 */
const validateLoc = (value) => {
  if (value.length !== 2) {
    return false;
  }
  return value.every((loc) => loc >= -180 && loc <= 180);
};

const locationSchema = mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    pop: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    loc: {
      type: [Number],
      required: true,
      validate: {
        validator: validateLoc,
        message: 'loc must be an array of 2 containing latitude and longitude, -180 <= angle <= 180',
      },
    },
  },
  {
    timestamps: true,
  },
);

locationSchema.plugin(toJSON);

/**
 * @typedef Location
 */
const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
