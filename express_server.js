const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;

// HELPERS
const { lookupIDByEmail, generateRandomString, filterURLs } = require('./helpers');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'cookies',
  keys: ['secret'],
}));

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
    password: '$2a$10$IIRVCgO5NS6s3mVXd0E1Ju6j4H.PK7bNFWiEBn1/zmaOB.L2aTHlS'
  }
};

app.get('/', (req, res) => {
    res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.session.user_ID) {
    res.redirect('/urls');
  } else res.render('register');
});

app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('email or password form is blank');
  }
  if (lookupIDByEmail(req.body.email, users)) {
    res.status(400);
    res.send('email is in use');
  } else {
    const { email, password } = req.body;
    const userID = generateRandomString();

    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };

    req.session.user_ID = userID;

    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  if (req.session.user_ID) {
    res.redirect('/urls');
  } else res.render('login');
});

app.post('/login', (req, res) => {

  const userID = lookupIDByEmail(req.body.email, users);

  if (!userID) {
    res.status(403).res.send('Username or email is invalid');
  }

  if (!bcrypt.compareSync(req.body.password, users[userID].password)) {
    res.status(403).res.send('Username or email is invalid');
  }

  req.session.user_ID = userID;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_ID) {
    res.redirect('/login');
  }
  const templateVars = { user: users[req.session.user_ID] };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  if (req.session.user_ID) {
    const urlID = generateRandomString();
    urlDatabase[urlID] = {
      longURL: req.body.longURL,
      userID: req.session.user_ID
    };
    res.redirect(`/urls/${urlID}`)
  } else { res.status(403).send('You must be logged in to create urls') };
});

app.get('/urls', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  const templateVars = { urls: urlDatabaseFiltered, user: users[req.session.user_ID] };
  res.render('urls_index.ejs', templateVars);
});

app.get('/urls/:shorturl', (req, res) => {

  if (urlDatabase[req.params.shorturl]) {
    const urlDatabaseFiltered = filterURLs(urlDatabase, req);
    const templateVars = { shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl].longURL, user: users[req.session.user_ID] };
    if (urlDatabaseFiltered[req.params.shorturl]) {
      res.render('urls_view.ejs', templateVars);
    } else res.render('urls_view_logout', templateVars);
  }
  else { res.status(404).send('Page not found') }

});

app.delete('/urls/:shorturl/delete', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  if (urlDatabaseFiltered[req.params.shorturl]) {
    delete urlDatabase[req.params.shorturl];
  }
  res.redirect('/urls');
});

app.put('/urls/:shorturl/edit', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  if (urlDatabaseFiltered[req.params.shorturl]) {
    urlDatabase[req.params.shorturl].longURL = req.body.longURL;
  }
  res.redirect('/urls');
});

app.get('/u/:shorturl', (req, res) => {
  if (urlDatabase[req.params.shorturl]) {
    res.redirect(urlDatabase[req.params.shorturl].longURL);
  }
  else { res.status(404).send('Page not found') };
});

app.listen(PORT, () => {
  console.log(`Server Listening on Port ${PORT}`);
});