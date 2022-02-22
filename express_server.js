const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls_new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index.ejs', templateVars);
});

app.get('/urls/:shorturl', (req, res) => {
  const templateVars = { shortURL: req.params.shorturl, longURL: urlDatabase[req.params.shorturl] };
  res.render('urls_view.ejs', templateVars);
});

app.get('/', (req, res) => {
  res.end('Hello');
});

app.get('/hello', (req, res) => {
  res.send('<html><head><title>Example</title></head><body>Hello <b>World</b></body></html>')
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Server Listening on Port ${PORT}`);
});