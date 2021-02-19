# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
Individual URL pages can be accessed while logged in, however master list of shortened URLS are only visible to the logged in user.
Passwords are hashed, and cookies are encrypted.
This project was made during week 3 of coding bootcamp with Lighthouse Labs

## Final Product

!["Simple Login Page"](https://github.com/SilkyCin/tinyapp/blob/master/docs/Registration%20Page.png?raw=true)
!["User' Master URLs List"](https://github.com/SilkyCin/tinyapp/blob/master/docs/My%20URLs%20Page.png?raw=true)
!["Edit URLS"](https://github.com/SilkyCin/tinyapp/blob/master/docs/Short%20URLs%20Page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- PORT may be changed to any open port on your system.