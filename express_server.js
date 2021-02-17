const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

function generateRandomString() {
  const str = Math.random().toString(36).substring(7);
  return str;
}
// console.log(generateRandomString());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

//tells express app to use EJS ar its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sn5xK": "http://www.google.com"
};

// #

//this will show the word "hello" when going to page "/" (home)
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// //create page containing database info, in a string JSON format
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// //creates a page at the path hello, adds some text with one word bold
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//res.render to pass the url data to our template (urls_index)
app.get("/urls", (req, res) => {
  //when we send even one variable, we need to send it inside an object
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  console.log("templateVars: ", templateVars);
  console.log("req.cookies: ", req.cookies)
  //express knows to look inside a views directory for template file with extension .ejs, thus we don't need to add a path to file
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

//creates a path to a page holding all of our short & long URLs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] }
  res.render("urls_show", templateVars);
})

//redirects users to longURL
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  res.render("urls_show", templateVars);
});

// #SUBMIT URLS
//pushes form submission data & newly created short url into our database object, then redirects user to shortURL page
app.post("/urls", (req, res) =>{
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //creates new key/value pair
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// #DELETE URLS
//handle a delete request via POST method
app.post("/urls/:shortURL/delete", (req, res) =>{
  //js delete operator removes property (longURL) from object
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// #UPDATE URLS
app.post("/urls/:shortURL", (req, res) =>{
  //shortURL stays the same, so we obtain it from the params key in object
  const shortURL = req.params.shortURL;
  //longURL is a new one, so we obtain it from the body key in our object
  const longURL = req.body.longURL;
  //creates new key/value pair
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// #USERNAME ENTRY
app.post("/login", (req, res) =>{
  const username = req.body.username;
  // console.log(username);
  res.cookie("username", username);
  // console.log("set cookie: ", res.cookie())
  res.redirect("/urls");  
});

// #LOGOUT
app.post("/logout", (req, res) =>{
  // const username = req.body.username;
  // console.log(username);
  res.clearCookie("username");
  // console.log("set cookie: ", res.cookie())
  res.redirect("/urls");  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

