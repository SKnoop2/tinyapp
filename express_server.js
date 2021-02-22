// Run server: npm start
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');


// Middleware
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'superDuperCoolCookies',
  keys: ['key1', 'key2'],
}));

app.set('view engine', 'ejs'); // tells express to use EJS as its templating engine


// Helper functions
const {
  emailExists,
  generateRandomString,
  emailMatchesPass,
  findUserID,
  showUserUrls,
} = require('./helpers');


// Global Variables
const urlDatabase = {};
const users = {};


// ### REGISTER NEW USERS ###
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  res.render('register', templateVars); // express doesn't require directory path to ejs pages when stored in views folder
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) { // show user an error when no email or password entered
    return res.status(400).send('Email and password fields cannot be empty');
  } // show user an error when registering with email that already exists in database
  if (emailExists(email, users)) {
    return res.status(400).send('This email is already registered');
  }
  // create new user object when new account successfully started
  const id = generateRandomString();
  const newUserObj = {
    id,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  // add new user to database & redirect to URLs page
  users[id] = newUserObj;
  req.session.user_id = id;
  res.redirect('/urls');
});


// ### LOGIN ###
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = findUserID(email, password, users);
  
  // show error message when no email or password entered
  if (!email || !password) {
    return res.status(400).send('Email and password fields cannot be empty');
  }
  // show error message when email or password are entered incorrectly
  if (!emailExists(email, users) || !emailMatchesPass(email, password, users)) {
    return res.status(403).send('Email or password are incorrect');
  }
  // redirect user to urls page when both email & password match that in user database
  req.session.user_id = id;
  res.redirect('/urls');
});


// ### HOMEPAGE ###
// Shows all urls created by user
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const data = showUserUrls(userID, urlDatabase);
  const templateVars = { 
    user: users[userID],
    urls: data,
  };
  res.render('urls_index', templateVars);
});

// redirect users away from "/" page
app.get('/', (req, res) => {
  const userID = req.session.user_id;
  
  if (userID) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});


// ### CREATE NEW URLS ###
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[userID],
      longURL: req.body.longURL,
      shortURL: req.body.shortURL,
    };
    res.render('urls_new', templateVars);
  }
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  
  // show user an error when not logged in
  if (!userID) {
    return res.status(401).send('Must be logged in to create new url');
  }
  // when logged into an account create new URL database object
  urlDatabase[shortURL] = {
    longURL,
    userID,
  };
  res.redirect(`/urls/${shortURL}`);
});


// ### RENDER PAGES FOR SHORTENED URLS ###
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = {
    longURL,
    shortURL,
    user: users[userID],
  };

  // render page when logged into correct account
  if (Object.keys(showUserUrls(userID, urlDatabase)).includes(shortURL)) { 
    urlDatabase[shortURL] = { longURL, userID };
    res.render('urls_show', templateVars);
    return;
  }
  // show user an error when not logged in
  if (!userID) {
    return res.status(401).send('Must be logged in to view this resource');
  }
  // show user an error when trying to view URL page belonging to another user
  res.status(403).send('This page does not belong to you');
});

app.get('/u/:shortURL', (req, res) => {
  // this page will redirect any user to long url, even if not logged in
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});


// ### UPDATE SHORTENED URL PAGES ###
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  // redirect user to their homepage when new short URL created
  if (Object.keys(showUserUrls(userID, urlDatabase)).includes(req.params.shortURL)) {
    urlDatabase[shortURL] = { longURL, userID };
    res.redirect('/urls');
    return;
  }
  // show user an error when not logged in
  if (!userID) {
    return res.status(401).send('Must be logged in');
  } // show user an error when trying to view URL page belonging to another user
  res.status(403).send('This url does not belong to you');
});


// ### DELETE SHORTENED URL PAGES ###
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;

  // when user is logged into their own account they may delete URL
  if (Object.keys(showUserUrls(userID, urlDatabase)).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
    return;
  }
  // show user an error when not logged in
  if (!userID) {
    return res.status(401).send('Must be logged in');
  }
  // show user an error when trying to view URL page belonging to another user
  res.status(403).send('This url does not belong to you');
});


// ### LOGOUT ###
app.post('/logout', (req, res) => {
  // cookie is cleared upon logout
  req.session = null;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Pair coded with Gavin Swan