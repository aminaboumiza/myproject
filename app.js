var express = require('express');
var mysql = require('mysql');
var path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
var bodyParser = require("body-parser");
var createError = require('http-errors');
var path = require('path');
var logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
var cookieParser = require('cookie-parser');
const jwtOptions = require('./jwt/jwtOptions');
const jwtStrategy = require('./jwt/jwtStrategy');
const passportConfig = require('./jwt/passportConfig');
var PORT = process.env.PORT || 3000;
//configuring the jwt passport strategy
passport.use(jwtStrategy);
passport.serializeUser(passportConfig.serializeUser);
passport.deserializeUser(passportConfig.deserializeUser);
/*video path on laravel*/
const videoPath = "https://mjaproject.test/videos/";
var app = express();
app.use(cors())
app.use(logger('dev'));
app.use(bodyParser.json());
//urlencoded -> giving data from forms
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({  
  secret: jwtOptions.secretOrKey,  
  resave: true,
  saveUninitialized: true,
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms 
	activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
  //cookie: { httpOnly: false } 
}))
// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});
// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      res.redirect('/home');
  } else {
      next();
  }    
};
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.locals.moment = require('moment');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Include controllers
fs.readdirSync('routes').forEach(function (file) {
	if(file.substr(-3) == '.js') {
	  const route = require('./routes/' + file)
	  route.route(app)
} 
})

//app.use('/', index)
// app.use('/users', users)
// app.use('/videos',videos)
// app.use('/uploads', express.static(process.cwd() + '/uploads'));
// app.get('/', function(req, res) {    
// 	res.send('Welcome to Passport with Sequelize and without HandleBars');
// });
// require("./routes/html-routes.js")(app);
// require("./routes/api-routes.js")(app);

// db.sequelize.sync().then(function() {
// 	app.listen(PORT, function() {
// 	  console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
// 	});
//   });

var server = app.listen(3000, function(){
	console.log('Server running at port 3000: http://127.0.0.1:3000')
})
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
  console.log('Un client est connecté !');
  socket.emit('message', 'Vous êtes bien connecté !');

  socket.on('video_seeked', function(data) {
    console.log(data);
    io.sockets.emit('to_admin_notif', data);
    
  });
  socket.on('new_formation_comment', function(data) {
    console.log("new_formation_comment");
    console.log(data);
    io.sockets.emit('formation_comment_notif', data);
    
  });
});
module.exports = app;
