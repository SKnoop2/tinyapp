const bcrypt = require('bcrypt');


const generateRandomString = function() {
  const str = Math.random().toString(36).substring(7);
  return str;
}

// check whether a given email matches one in a database
const emailExists = function(email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return true;
    }
  }
  return false;
}

// check whether the given user login info matches any in database.
const emailMatchesPass = function(email, password, users) {
  for (const key in users) {
    const hashedPassword = users[key].password;
    // compares hashed given password against hashed database password
    if (bcrypt.compareSync(password, hashedPassword) && users[key].email === email) {
      return true;
    }
  }
  return false;
}

const findUserID = function(email, password, users) {
  for (const key in users) {
    const hashedPassword = users[key].password;
    if (bcrypt.compareSync(password, hashedPassword) && users[key].email === email) {
      return key;
    }
  }
  return false;
}

//compare the userID from database with the logged-in user's ID, then only show the URLS if matched
const showUserUrls = function(id, urlDatabase) {
  let urls = {}
  for (const key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      urls[key] = urlDatabase[key]
    }
  }
  return urls;
}


module.exports = {
  generateRandomString,
  emailExists,
  emailMatchesPass,
  findUserID,
  showUserUrls,
}