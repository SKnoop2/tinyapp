const express = require('express');
const app = express();
const PORT = 8080;

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
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

