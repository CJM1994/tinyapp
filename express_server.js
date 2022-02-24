const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.render('register');
});

const emailInUse = function (email) {
  for (const id in users) {
    if (users[id].email === email) {
      return true;
    }
  }
  return false;
};

app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('email or password form is blank');
  }
  if (emailInUse(req.body.email)) {
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
  res.render('login');
});

app.post('/login', (req, res) => {
  // UPDATE NEEDED
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies['user_ID']] };
  console.log(users);
  console.log(templateVars);
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_ID']] };
  res.render('urls_index.ejs', templateVars);
});

app.get('/urls/:shorturl', (req, res) => {
  const templateVars = { shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl], user: users[req.cookies['user_ID']] };
  res.render('urls_view.ejs', templateVars);
});

app.post('/urls/:shorturl/delete', (req, res) => {
  delete urlDatabase[req.params.shorturl];
  res.redirect('/urls');
});

app.post('/urls/:shorturl/edit', (req, res) => {
  urlDatabase[req.params.shorturl] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/u/:shorturl', (req, res) => {
  res.redirect(urlDatabase[req.params.shorturl]);
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