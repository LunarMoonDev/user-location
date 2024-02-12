const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));
const roleNames = { ...roles };

module.exports = {
  roles,
  roleRights,
  roleNames,
};
