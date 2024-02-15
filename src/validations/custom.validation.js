const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};

const loc = (value, helpers) => {
  if (!value) {
    return helpers.message('loc must not be empty.');
  }

  if (value.length !== 2) {
    return helpers.message('loc must be a length of 2 only');
  }

  return value.every((angle) => angle >= -180 && angle <= 180)
    ? value
    : helpers.message('contents must be between -180 and 180, inclusive');
};

module.exports = {
  objectId,
  password,
  loc,
};
