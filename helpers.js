const lookupIDByEmail = function (email, userDB) {
  for (const id in userDB) {
    if (userDB[id].email === email) {
      return id;
    }
  }
  return false;
};

module.exports = lookupIDByEmail;