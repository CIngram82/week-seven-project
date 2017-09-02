const express = require('express');
const mustache = require('mustache-express');
const session = require('express-session');
const server = express();
const Sequelize = require('sequelize');
const bodyparse = require('body-parser');
server.engine('mustache', mustache());
server.set('views', './views');
server.set('view engine', 'mustache');

server.use(bodyparse.urlencoded({
  extended: false
}));

server.use(express.static('public'));

server.use(session({
  secret: '',
  resave: false,
  saveUninitialized: true,
}));

server.listen(3000, function() {
  console.log('Gabble ready for all the gabs');
});
////// All Schemas
const db = new Sequelize('gabble', 'Chris', '', {
  dialect: 'postgres',
});

const User = db.define('user', {
  username: Sequelize.STRING, // Unique?
  password: Sequelize.STRING, // need to add a hash to this ask ben or luke about it.
  displayName: Sequelize.STRING,
});

User.sync().then(function() {
  console.log("User BD online");

  // User.create({
  //   username: 'test',
  //   password: 'test',
  //   displayName: 'Test User',
  // });

  // User.create({
  //   username: 'Cingram',
  //   password: '123qwe',
  //   displayName: 'Chris',
  // });
});

const Messages = db.define('messages', {
  text: Sequelize.STRING,
  userId: Sequelize.INTEGER,
});

Messages.sync().then(function() {
  console.log("Messages BD online");

  // Messages.create({
  // text: 'The first ever gabble!',
  // userId: '1', //check the userId for username: test
  // });
});

const Likes = db.define('likes', {
  messagesId: Sequelize.INTEGER,
  userId: Sequelize.INTEGER,
});

Likes.sync().then(function() {
  console.log("Likes BD online");

  // Likes.create({
  // messagesId: '1', // check the messagesId for the first message.
  // userId: Sequelize.INTEGER, // check the userId for Cingram.
  // });
});

//////


// Use Express and Sequelize to build a social network for students.
//This network, called "Gabble," has users, public messages, and likes.
//
// Users should:
//
// have a username and password for logging in
// have a display name
// Messages should:
//
// be associated with a user who wrote them
// have up to 140 characters of text
// Likes should:
//
// be associated with a user who made the like and a message that was liked
// The application should have ways to do the following:
//
// Sign up as a new user
// Log in
// Log out
// View all messages with the newest first
// Create a new message
// Delete one of your own messages
// Like a message
// See who liked a message
// This will require your knowledge of forms, validation, sessions, middleware,
//and Sequelize. You will likely have to look up some features of these.
//
// You may want to consider running sequelize seed:create and create a new seed
//file that will create several users and gabs.
