const allRoles = {
  user: ['getUsers', 'getLocs'],
  admin: ['getUsers', 'getLocs', 'manageUsers', 'manageLocs'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
