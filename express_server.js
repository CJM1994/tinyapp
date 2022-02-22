const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  urlDatabase[generateShortURL()] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index.ejs', templateVars);
});

app.get('/urls/:shorturl', (req, res) => {
  const templateVars = { shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl] };
  res.render('urls_view.ejs', templateVars);
});

app.post('/urls/:shorturl/delete', (req, res) => {
  delete urlDatabase[req.params.shorturl];
  res.redirect('/urls');
})

app.get('/u/:shorturl', (req, res) => {
  res.redirect(urlDatabase[req.params.shorturl]);
});

app.listen(PORT, () => {
  console.log(`Server Listening on Port ${PORT}`);
});

const generateShortURL = function () {
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