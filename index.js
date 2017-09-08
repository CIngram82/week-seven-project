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
  extended: false,
}));
server.use(express.static('public'));
server.use(session({
  secret: 'HI BEN!53wzcr7bgyhu',
  resave: false,
  saveUninitialized: true,
}));
server.listen(3000, function () {
  console.log('Gabble ready for all the gabs');
});

////// All Schemas
const db = new Sequelize('gabble', 'Chris', '', {
  dialect: 'postgres',
});
const Users = db.define('users', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    required: true,
  },
  password: {
    type: Sequelize.STRING,
    required: true,
  }, // need to add a hash to this ask ben or luke about it.
  displayName: {
    type: Sequelize.STRING,
    unique: true,
    required: true,
  },
});
const Messages = db.define('messages', {
  text: {
    type: Sequelize.STRING(140),
    required: true,
  },
});
const Likes = db.define('likes', {});

// link(not zelda)ing tables
Likes.belongsTo(Users);
Likes.belongsTo(Messages);
Messages.belongsTo(Users);

// N'stncing tables
Likes.sync().then(function () {
  console.log('Likes BD online');
});

Messages.sync().then(function () {
  console.log('Messages BD online');

});

Users.sync().then(function () {
  console.log('Users BD online');
});

//////End of Schemas
//////Start of get and post
// log in and out
server.get('/', function (req, res) {
  res.render('login');
});

server.post('/login', function (req, res) {
  Users.findOne({
      where: {
        username: req.body.username,
        password: req.body.password,
      },
    })
    .then(function (user) {
      req.session.who = user;
      res.redirect('home');
    })
    .catch(function () {
      res.render('login');
    });
});

server.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});

// reg users
server.get('/regNewUser', function (req, res) {
  res.render('regNewUser');
});

server.post('/createNewUser', function (req, res) {
  const newUserName = req.body.username;
  const newUserDisplayName = req.body.displayName;
  const newUserPassword = req.body.password;
  const newUserPasswordConferm = req.body.passwordConferm;
  if (newUserPassword !== newUserPasswordConferm) {
    return res.redirect('/createNewUser', {
      message: 'passwords don\'t match',
    });
  }

  Users.create({
    username: newUserName,
    password: newUserPassword,
    displayName: newUserDisplayName,
  }).then(function () {
    res.render('login', {
      message: 'Please log in with your new account!',
    });
  });
});

server.get('/newGabble', function (req, res) {
  res.render('newGabble');
});

server.post('/newGabbleMessage', function (req, res) {
  Messages.create({
      text: req.body.newGabbleText,
      userId: req.session.who.id,
    })
    .then(function () {
      Messages.findAll({
          order: [
            ['createdAt', 'DESC'],
          ],
        })
        .then(function (messages) {
          res.redirect('home');
        });
    });
});

server.get('/gabInfo', function (req, res) {
  res.render('gabInfo');
});

server.get('/home', function (req, res) {
  Messages.findAll({
    include: [
      {
        model: Users,
      },
    ],
    order: [
        ['createdAt', 'DESC'],
      ],
  })
    .then(function (messages) {
      let promises = [];
      for (let i = 0; i < messages.length; i++) {
        const prom = Likes.findAll({
          where: {
            messageId: messages[i].id,
          },
        }).then(function (num) {
          messages[i].likes = num.length;
        });

        promises.push(prom);
      }

      Promise.all(promises).then(function () {
        res.render('home', {
          userInfo: req.session.who,
          allMessages: messages,
        });
      });
    });
});

server.get('/likesFor/:id', function (req, res) {
  const id = req.params.id;
  Likes.findAll({
      where: {
        messageId: id,
      },
      include: [{
          model: Users,
        },
        {
          model: Messages,
        },
      ],
    })
    .then(function (messageLikes) {
      res.render('gabinfo', {
        usersWhoLike: messageLikes,
        text: messageLikes[0].message.text,
        created: messageLikes[0].message.createdAt,
      });
    });
});

server.post('/likeGabble/:id', function (req, res) {
  const id = parseInt(req.params.id);
  Likes.create({
      messageId: id,
      userId: req.session.who.id,
    })
    .then(function () {
      res.redirect('/home');
    });
});

server.post('/deleteGabble/:id', function (req, res) {
  const id = parseInt(req.params.id);
  Messages.destroy({
    where: {
      id: id,
    },
  }).then(function () {
    Likes.destroy({
      where: {
        messageId: id,
      },
    }).then(function () {
      res.redirect('/home');
    });
  });
});

// Use Express and Sequelize to build a social network for students.
//This network, called 'Gabble,' has users, public messages, and likes.
//
// Users should:
//
// <>have a username and password for logging in
// <>have a display name

// Messages should:
// <>be associated with a user who wrote them
// <>have up to 140 characters of text

// Likes should:
// <>be associated with a user who made the like and a message that was liked

// The application should have ways to do the following:
// <>Sign up as a new user
// <>Log in
// <>Log out
// <>View all messages with the newest first
// <>Create a new message
// Delete one of your own messages
// <>Like a message
// <>See who liked a message
// This will require your knowledge of forms, validation, sessions, middleware,
// and Sequelize. You will likely have to look up some features of these.
//
// You may want to consider running sequelize seed:create and create a new seed
// file that will create several users and gabs.

// https://codepen.io/geoffmuskett/pen/uldmJ use to set characters remaining count.
