const loc = (value, helpers) => {
  if (!value) {
    return helpers.message('"body.loc" must not be empty.');
  }

  if (value.length !== 2) {
    return helpers.message('"body.loc" must be a length of 2 only');
  }

  return value.every((angle) => angle >= -180 && angle <= 180)
    ? value
    : helpers.message('"body.loc" must be between -180 and 180, inclusive');
};

module.exports = {
  loc,
};
