const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userID"
  }
};

const users = {
  'userID': {
    id: 'userID',
    email: 'user@email.com',
    password: 'pass123'
  }
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.cookies['user_ID']) {
    res.redirect('/urls');
  }
  else res.render('register');
});

const lookupIDByEmail = function (email) {
  for (const id in users) {
    if (users[id].email === email) {
      return id;
    };
  };
  return false;
};

app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('email or password form is blank');
  }
  if (lookupIDByEmail(req.body.email)) {
    res.status(400);
    res.send('email is in use');
  }
  else {
    const { email, password } = req.body;
    const userID = generateRandomString();

    users[userID] = {
      id: userID,
      email: email,
      password: password
    };

    res.cookie('user_ID', userID);

    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  if (req.cookies['user_ID']) {
    res.redirect('/urls');
  }
  else res.render('login');
});

app.post('/login', (req, res) => {

  const userID = lookupIDByEmail(req.body.email);

  if (!userID) {
    res.status(403);
    res.send('Username or email is invalid');
    console.log('Email Invalid');
  };

  if (users[userID].password !== req.body.password) {
    res.status(403);
    res.send('Username or email is invalid');
    console.log('Password Invalid');
  };

  res.cookie('user_ID', userID);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies['user_ID']) {
    res.redirect('/urls');
  };
  const templateVars = { user: users[req.cookies['user_ID']] };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  if (req.cookies['user_ID']) {
    const urlID = generateRandomString();
    urlDatabase[urlID] = {
      longURL: req.body.longURL,
      userID: req.cookies['user_ID']
    };
  };
  res.redirect('/urls');
});

const filterURLs = function (urlDatabase, req) {
  const urlDatabaseFiltered = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === req.cookies['user_ID']) {
      urlDatabaseFiltered[url] = urlDatabase[url];
    };
  };
  return urlDatabaseFiltered;
};

app.get('/urls', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  const templateVars = { urls: urlDatabaseFiltered, user: users[req.cookies['user_ID']] };
  res.render('urls_index.ejs', templateVars);
});

app.get('/urls/:shorturl', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  const templateVars = { shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl].longURL, user: users[req.cookies['user_ID']] };
  if (urlDatabaseFiltered[req.params.shorturl]) {
    res.render('urls_view.ejs', templateVars);
  }
  else res.render('urls_view_logout', templateVars);
});

app.post('/urls/:shorturl/delete', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  if (urlDatabaseFiltered[req.params.shorturl]) {
    delete urlDatabase[req.params.shorturl];
  };
  res.redirect('/urls');
});

app.post('/urls/:shorturl/edit', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  if (urlDatabaseFiltered[req.params.shorturl]) {
    urlDatabase[req.params.shorturl].longURL = req.body.longURL;
  };
  res.redirect('/urls');
});

app.get('/u/:shorturl', (req, res) => {
  res.redirect(urlDatabase[req.params.shorturl].longURL);
});

app.listen(PORT, () => {
  console.log(`Server Listening on Port ${PORT}`);
});

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