var express = require('express')
var app = express()
var {Formation,Category} = require('../config/sequelize');
var videoPath ="https://mjaproject.test/videos/";

module.exports.route = (app) => {
    
app.get('/home', function(req, res) {
	var user_session = req.session.user;
	// render to views/index.ejs template file
	// res.render('home', {user_session: user_session});
	console.log('user in session',req.session.user);
	var user_session = req.session.user;
	var test_categories = Category.findAll({
		include: [{model: Formation, limit: 6}],  
		order: [['title', 'ASC']]
				})
	 .then(categories => {
		//  res.json(categories);
		res.render('home',
		{videoPath:videoPath,
		 categories: categories,
		 user_session: user_session
		}) 
	})
})
app.get('/contact', function(req, res) {
	var user_session = req.session.user;
	// render to views/index.ejs template file
	res.render('contact', {user_session: user_session});
})

app.get('/about', function(req, res) {
	var user_session = req.session.user;
	// render to views/index.ejs template file
	res.render('about', {user_session: user_session});
})
/** 
 * We assign app object to module.exports
 * 
 * module.exports exposes the app object as a module
 * 
 * module.exports should be used to return the object 
 * when this file is required in another module like app.js
 */ 
}
// module.exports = app;
