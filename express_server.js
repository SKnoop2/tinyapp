// Run server: npm start
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')


// Middleware
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "superDuperCoolCookies",
  keys: ["key1", "key2"]
}));

app.set("view engine", "ejs"); //tells express to use EJS as its templating engine


// Helper functions
const { emailExists, generateRandomString, emailMatchesPass, findUserID, showUserUrls } = require('./helpers')


// Global Variables
const urlDatabase = {};
const users = {}


// ### REGISTER NEW USERS ###
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  res.render("register", templateVars); //express doesn't require directory path to ejs pages when stored in views folder
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) { //return error when no email or password entered
    return res.status(400).send("400 Email and password fields cannot be empty");
  } 
  if (emailExists(email, users)) { //return error when registering with email that already exists in database
    return res.status(400).send("400 This email is already registered");
  } else { //when new account successfully started:
    let id = generateRandomString(); //create new user object 
    newUserObj = {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    }
    users[id] = newUserObj; // add new user to database & redirect to URLs page
    req.session.user_id = id;
    res.redirect("/urls")
  }
});


// ### LOGIN ###
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = findUserID(email, password, users);

  if (!email || !password) {//show error message when no email or password entered
    return res.status(400).send("400 Email and password fields cannot be empty");
  }
  if (!emailExists(email, users) || !emailMatchesPass(email, password, users)) {//show error message when email or password are entered incorrectly
    res.status(403).send("403 Email or password are incorrect");
  } else { //redirect user to urls page when both email & password match that in user database
    req.session.user_id = id;
    res.redirect("/urls");  
  } 
});


// ### HOMEPAGE ### 
// Shows all urls created by user
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const data = showUserUrls(userID, urlDatabase);
  const templateVars = { 
      user: users[userID],
      urls: data
  }
  res.render("urls_index", templateVars);
});

// redirect away from "/" to home or login page
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  
  if (userID) {
    res.redirect("/urls");
    return;
  } 
  res.redirect("/login");
});


// ### CREATE NEW URLS ###
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.redirect("/login")
  } else {
    const templateVars = { 
      user: users[userID],
      longURL: req.body.longURL,
      shortURL: req.body.shortURL
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  if (!userID) { // return error when not logged in
    return res.status(401).send("Must be logged in to create new url");
  } else { // create new URL database object when logged in
    urlDatabase[shortURL] = {
      longURL, 
      userID
    };
    res.redirect(`/urls/${shortURL}`);
  } 
});


// ### RENDER PAGES FOR SHORTENED URLS ###
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { 
    longURL,
    shortURL,
    user: users[userID],
  }

  if (Object.keys(showUserUrls(userID, urlDatabase)).includes(shortURL)) { //render page when logged into correct account
    urlDatabase[shortURL] = { longURL, userID };
    res.render("urls_show", templateVars);
    return;
  } 
  if (!userID) { // return error when not logged in
    return res.status(401).send("Must be logged in to view this resource");
  } 
  else { // return error when trying to view URL page belonging to another user
    res.status(403).send("This page does not belong to you");
  }
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL); // this page will redirect any user to long url, even if not logged in
});


// ### UPDATE SHORTENED URL PAGES ###
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; 
  const longURL = req.body.longURL; 
  const userID = req.session.user_id;

  if (Object.keys(showUserUrls(userID, urlDatabase)).includes(req.params.shortURL)) { //redirect user to their homepage when new short URL created
    urlDatabase[shortURL] = { longURL, userID };
    res.redirect("/urls");
    return;
  } 
  if (!userID) {// return error when not logged in
    return res.status(401).send("Must be logged in");
  } else { // return error when trying to view URL page belonging to another user
    res.status(403).send("This url does not belong to you");
  }
});


// ### DELETE SHORTENED URL PAGES ###
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;

  if (Object.keys(showUserUrls(userID, urlDatabase)).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
    return;
  } 
  if (!userID) { // return error when not logged in
    return res.status(401).send("Must be logged in");
  } else { // return error when trying to view URL page belonging to another user
    res.status(403).send("This url does not belong to you");
  }
});


// ### LOGOUT ###
app.post("/logout", (req, res) => {
  req.session = null;// cookie is cleared upon logout
  res.redirect("/urls");  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

//Pair coded with Gavin Swan