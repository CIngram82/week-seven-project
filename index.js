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
  secret: 'HI BEN!53wzcr7bgyhu',
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
  username: {type: Sequelize.STRING, unique: true}, // Unique?
  password: Sequelize.STRING, // need to add a hash to this ask ben or luke about it.
  displayName: Sequelize.STRING,
});

User.sync().then(function() {
  console.log("User BD online");
});

const Messages = db.define('messages', {
  text: Sequelize.STRING,
  userId: Sequelize.INTEGER,
});

Messages.sync().then(function() {
  console.log("Messages BD online");

});

const Likes = db.define('likes', {
  messagesId: Sequelize.INTEGER,
  userId: Sequelize.INTEGER,
});

Likes.sync().then(function() {
  console.log("Likes BD online");
});
//////End of Schemas
//////Start of get and post

server.get('/', function(req,res){
  res.render('login');
});

server.get('/newGabble', function(req,res){
  res.render('newGabble');
});

server.get('/gabInfo', function(req,res){
  res.render('gabInfo');
});

server.post('/login', function(req,res){
  User.findOne({ where:{
    username : req.body.username,
    password : req.body.password
  }})
  .then(function(user){
    req.session.who = user;
      res.redirect('home')
      })
  .catch(function(){
    res.render('login');
  });
});

server.get('/home', function(req,res){
  Messages.findAll() // how to limit this to 10 or 20?
  .then(function(messages){
    res.render('home',{
      userInfo : req.session.who,
      allMessages : messages // how to set the userId to be the matching username?
    });
    })
});

server.get('/regNewUser', function(req,res){
  res.render('regNewUser')
});

server.post('/newGabbleMessage', function(req,res){
  Messages.create({
    text: req.body.newGabbleText,
    userId: req.session.who.id
  })
  .then(function(gabble){
    res.render('home',{
      userInfo: req.session.who,
      allMessages : gabble
    })
  })
})
// Use Express and Sequelize to build a social network for students.
//This network, called "Gabble," has users, public messages, and likes.
//
// Users should:
//
// <>have a username and password for logging in
// <>have a display name

// Messages should:
// <>be associated with a user who wrote them
// have up to 140 characters of text

// Likes should:
// <>be associated with a user who made the like and a message that was liked

// The application should have ways to do the following:
// <>Sign up as a new user
// <>Log in
// <>Log out
// <>View all messages with the newest first
// <>Create a new message
// Delete one of your own messages
// Like a message
// See who liked a message
// This will require your knowledge of forms, validation, sessions, middleware,
//and Sequelize. You will likely have to look up some features of these.
//
// You may want to consider running sequelize seed:create and create a new seed
//file that will create several users and gabs.
