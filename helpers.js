const lookupIDByEmail = function (email, userDB) {
  for (const id in userDB) {
    if (userDB[id].email === email) {
      return id;
    }
  }
  return false;
};

const generateRandomString = function () {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const stringLength = 6;
  let shortURL = '';
  let $n = 0;
  for (let i = 0; i < stringLength; i++) {
    $n = Math.floor(Math.random() * charset.length);
    shortURL += charset[$n];
  }
  return shortURL;
};

module.exports = { lookupIDByEmail, generateRandomString };