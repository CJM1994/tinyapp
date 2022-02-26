// Lookup user ID by email - return false if no user found with email
const lookupIDByEmail = function (email, userDB) {
  for (const id in userDB) {
    if (userDB[id].email === email) {
      return id;
    }
  }
  return false;
};

// Generate random string used for URL IDs and User IDs
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

// Returns URL object filtered by users session ID to determine ownership
const filterURLs = function (urlDatabase, req) {
  const urlDatabaseFiltered = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === req.session.user_ID) {
      urlDatabaseFiltered[url] = urlDatabase[url];
    }
  }
  return urlDatabaseFiltered;
};

module.exports = { lookupIDByEmail, generateRandomString, filterURLs };