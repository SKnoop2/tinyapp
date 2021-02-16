const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');

function generateRandomString() {
  const str = Math.random().toString(36).substring(7);
  // console.log("random", r);
  return str;
}
// console.log(generateRandomString());
app.use(bodyParser.urlencoded({extended: true}));

//tells express app to use EJS ar its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sn5xK": "http://www.google.com"
};

//this will show the word "hello" when going to page "/" (home)
app.get("/", (req, res) => {
  res.send("Hello!");
});

//create page containing database info, in a string JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//creates a page at the path hello, adds some text with one word bold
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//add new route handler. Use res.render to pass the url data to our template (urls_index)
//express knows to look inside a views directory for template file with extension .ejs, thus we don't need to tell the app where to find the files
app.get("/urls", (req, res) => {
  //when we send even one variable, we need to send it inside an object
  const urlsObject = { urls: urlDatabase };
  res.render("urls_index", urlsObject);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) =>{
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  // responds with a redirection to /urls/:shortURL, where shortURL is the random string we generated
  // app.get("/urls/:shortURL", callback); //callback is not defined
  res.redirect(`/urls/${shortURL}`) // Failed to lookup view "/urls/:shortURL" in views directory
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  //first find your longURL
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//define a route that will match a post request
// We need to save the longURL and shortURL to our urlDatabase in format {shortUrl:longURL} 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

