const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
      maxLength: 25,
      minLength: 1,
    },
    pop: {
      type: Number,
      required: true,
      min: [1000, 'must have 4 digits only'],
      max: [9999, 'must have 4 digits only'],
    },
    state: {
      type: String,
      required: true,
      maxLength: 25,
      minLength: 1,
    },
    loc: {
      type: [Number],
      required: true,
      validate: {
        validator: validateLoc,
        message: 'loc must be an array of 2 containing latitude and longitude, -180 <= angle <= 180',
      },
    },
    population: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

locationSchema.plugin(toJSON);
locationSchema.plugin(paginate);

/**
 * Check if location already exist
 * @param {string} city city of the location
 * @param {string} state state of the location
 * @returns {Promise<boolean>}
 */
locationSchema.statics.doesLocationExist = async function (city, state) {
  const loc = await this.findOne({ city, state });
  return !!loc;
};

/**
 * @typedef Location
 */
const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
