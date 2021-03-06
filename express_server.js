// Express
const express = require('express');
const app = express();
const PORT = 8080;

// Other Dependencies
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

// Helpers
const { lookupIDByEmail, generateRandomString, filterURLs } = require('./helpers');

// Template
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'cookies',
  keys: ['secret'],
}));

// Database
const {urlDatabase, users} = require('./data/data');

/* ----- GET Routes ----- */
// Redirect to URL Table / Main Page from Root
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Login Form
app.get('/login', (req, res) => {
  if (req.session.user_ID) {
    res.redirect('/urls');
  } else res.render('login');
});

// Registration Form
app.get('/register', (req, res) => {
  if (req.session.user_ID) {
    res.redirect('/urls');
  } else res.render('register');
});

// Display URL Table / Main Page
app.get('/urls', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  const templateVars = { urls: urlDatabaseFiltered, user: users[req.session.user_ID] };
  res.render('urls_index.ejs', templateVars);
});

// Display Add URL Form - Validate Login
app.get('/urls/new', (req, res) => {
  if (!req.session.user_ID) {
    res.redirect('/login');
  }
  const templateVars = { user: users[req.session.user_ID] };
  res.render('urls_new', templateVars);
});

// Display Edit URL Form - Validate Login
app.get('/urls/:shorturl', (req, res) => {
  if (urlDatabase[req.params.shorturl]) {
    const urlDatabaseFiltered = filterURLs(urlDatabase, req);
    const templateVars = { shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl].longURL, user: users[req.session.user_ID] };

    if (urlDatabaseFiltered[req.params.shorturl]) {
      res.render('urls_view.ejs', templateVars);
    } else {
      res.render('urls_view_logout', templateVars);
    }

  } else {
    res.status(404).send('Page not found');
  };
});

// Redirect User to External Site Using ShortID to Find longURL
app.get('/u/:shorturl', (req, res) => {
  if (urlDatabase[req.params.shorturl]) {
    res.redirect(urlDatabase[req.params.shorturl].longURL);
  } else {
    res.status(404).send('Page not found');
  }
});

/* ----- POST Routes ----- */
// Login - Authenticate & Set Cookies
app.post('/login', (req, res) => {
  const userID = lookupIDByEmail(req.body.email, users);

  if (!userID || !req.body.password) {
    res.status(403).send('Username or email is invalid');
  }

  if (!bcrypt.compareSync(req.body.password, users[userID].password)) {
    res.status(403).send('Username or email is invalid');
  }

  req.session.user_ID = userID;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Register Validate Input Data & Set Cookies
app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('email or password form is blank');
  }
  else if (lookupIDByEmail(req.body.email, users)) {
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

// Generate New URL ID & Add to urlDatabase - Validate Login
app.post('/urls', (req, res) => {
  if (req.session.user_ID) {
    const urlID = generateRandomString();
    urlDatabase[urlID] = {
      longURL: req.body.longURL,
      userID: req.session.user_ID
    };
    res.redirect(`/urls/${urlID}`);
  } else {
    res.status(403).send('You must be logged in to create urls');
  }
});

/* ----- PUT Routes ----- */
app.put('/urls/:shorturl/edit', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  if (urlDatabaseFiltered[req.params.shorturl]) {
    urlDatabase[req.params.shorturl].longURL = req.body.longURL;
  }
  res.redirect('/urls');
});

/* ----- DELETE Routes ----- */
app.delete('/urls/:shorturl/delete', (req, res) => {
  const urlDatabaseFiltered = filterURLs(urlDatabase, req);
  if (urlDatabaseFiltered[req.params.shorturl]) {
    delete urlDatabase[req.params.shorturl];
  }
  res.redirect('/urls');
});

/* ----- SERVER ----- */
app.listen(PORT, () => {
  console.log(`Server Listening on Port ${PORT}`);
});