const express = require('express');
const app = express();
const PORT = 8080;

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

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  res.render("urls_show", templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

