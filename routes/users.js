var bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtOptions = require('../jwt/jwtOptions');
const passport = require('passport');
const LocalStorage = require('node-localstorage').LocalStorage;
const BCRYPT_SALT_ROUNDS = 12;
var {User} = require('../config/sequelize');
const { readSync } = require('fs');
var sessionChecker = (req, res, next) => {
  if (req.session.user) {
      console.log("sessionChecker true");
      res.redirect('/formation');
  } else {
      console.log("sessionChecker false")
      next();
  }    
};





module.exports.route = (app) => {



  // app.get('/users', (req, res) => {
  //   User.findAll()
    
  //   .then(users => res.json(users))
  // })



	app.get('/register', sessionChecker, function(req,res,next){
		res.render('login/register',{
			name:'',
			email:'',
			password:''

		})
	})
    app.post('/register', sessionChecker, (req, res, next) => {

        const data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          };
        
          // if (data.password === '' || data.name === '') {
          //   res.json('username and password required');
          // }
        
          User.findOne({
            where: {
              email: data.email,
            },
          })
            .then(user => {
              if (user != null) {

                console.log('username already taken');
                res.json('username already taken');

              } else {

                bcrypt
                  .hash(data.password, BCRYPT_SALT_ROUNDS)
                  .then(function(hashedPassword) {

                    User.create({
                      name: data.name,
                      email: data.email,
                      password: hashedPassword,

                    }).then(() => {
      
                      console.log('user created in db');
                      res.redirect('/login'); 
                      //res.status(200).send({ message: 'user created' });
                    });
                  });
              }
      
            })
            .catch(err => {
              console.log('problem communicating with db');
              res.status(500).json(err);
            });
    })

	
	app.get('/login', sessionChecker, function(req,res,next){

    
		res.render('login/login',{
			email:'',
			password:''

		});
  })
  
  app.post('/login', (req,res) => {
        const data = {
            email: req.body.email,
            password: req.body.password,
        };
        
        User.findOne({
            where: {
              email: data.email,
            },
        })
        .then(user => {
          console.log()
            if(!user){
              res.render('login/login',{
                login_errors:['Invalid Email or Password!']
              });
            }
            else {
                bcrypt.compare(data.password, user.password).then(response => {
                  console.log(response);
                    if (response === true){
                        const payload = { id: user.id };
                        const token = jwt.sign(payload, jwtOptions.secretOrKey);
                        //res.json({ message: 'ok', token });
                        //save token on local storage
                        console.log(user.email);
                        console.log(user.password);
                        console.log(user.name);
                        console.log('hiiiii');

                        /*
                        if (typeof localStorage === "undefined" || localStorage === null) {
                          var LocalStorage = require('node-localstorage').LocalStorage;
                          localStorage = new LocalStorage('./scratch');
                        }
                        var UserStorage = {
                          'userId':user.id,
                          'userName':user.name,
                          'userEmail':user.email
                        }
                        var UserStorageItem = JSON.stringify(UserStorage);
                        localStorage.setItem('UserStorage',UserStorageItem);
                        */
                        
                        // save user in session
                        req.session.user = user.dataValues;

                        console.log('user in session',req.session.user);
                        res.redirect('/formation'); 
                        //  res.redirect('/formation',{data: user,
                        //   UserStorage:UserStorage
                        //  });
                        // res.render('index',{data: user,
                        //                     UserStorage:UserStorage})
                    }else{
                            //res.status(401).json({ message: 'The password is incorrect!' });
                            res.render('login/login',{
                              login_errors:['Invalid Email or Password!']
                            });
                          }
                })
			  }
    })
  })
    /**profile route */

    app.get('/profile', function(req, res){
      if (!req.session.user) {
        console.log("sessionChecker false");
        res.redirect('/login');
        return;
      }
      var user_session = req.session.user;
      User.findOne({where: {id: user_session.id
                            }
                  }).then(user=>{
                    // res.json(user);
                    res.render('user/show',{
                    user_session: user_session,
                    user:user});
                  })

      
    })
    /**update user profile */
    app.post('/profile/edit', function(req, res){
      if (! req.session.user) {
        return;
      } 
      // res.json(req.data);
      const data = {
        name: req.body.name,
        id: req.session.user.id,
        password: req.body.password,
      };

      User.findOne({
        where: {
            id: data.id,
        },
      }).then(user => {
          if(data.password ==''){
            user.update({
              name: data.name
            })
            .then(function () {
              res.json({saved : 'ok'});
            })
          }
            bcrypt
              .hash(data.password, BCRYPT_SALT_ROUNDS)
              .then(function(hashedPassword) {
                  user.update({
                    name: data.name,
                    password: hashedPassword
                  })
                  .then(function () {
                    res.json({saved : 'ok'});
                  })
                })
            })
      
        
    })
    // route for user logout
    app.get('/logout', (req, res) => {
      req.session.destroy(function(err) {
 
        res.redirect('/home');
 
      });
     
    });


}


// var express = require('express')
// var app = express()

// // SHOW LIST OF USERS
// app.get('/', function(req, res, next) {
// 	req.getConnection(function(error, conn) {
// 		conn.query('SELECT * FROM users ORDER BY id DESC',function(err, rows, fields) {
// 			//if(err) throw err
// 			if (err) {
// 				req.flash('error', err)
// 				res.render('user/list', {
// 					title: 'User List', 
// 					data: ''
// 				})
// 			} else {
// 				// render to views/user/list.ejs template file
// 				res.render('user/list', {
// 					title: 'User List', 
// 					data: rows
// 				})
// 			}
// 		})
// 	})
// })

// // SHOW ADD USER FORM
//

// // ADD NEW USER POST ACTION
// app.post('/ad app.get('/add', function(req, res, next){	
// 	// render to views/user/add.ejs
// 	res.render('user/add', {
// 		title: 'Add New User',
// 		name: '',
// 		age: '',
// 		email: ''		
// 	})
// })d', function(req, res, next){	
// 	req.assert('name', 'Name is required').notEmpty()           //Validate name
// 	req.assert('age', 'Age is required').notEmpty()             //Validate age
//     req.assert('email', 'A valid email is required').isEmail()  //Validate email

//     var errors = req.validationErrors()
    
//     if( !errors ) {   //No errors were found.  Passed Validation!
		
// 		/********************************************
// 		 * Express-validator module
		 
// 		req.body.comment = 'a <span>comment</span>';
// 		req.body.username = '   a user    ';

// 		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
// 		req.sanitize('username').trim(); // returns 'a user'
// 		********************************************/
// 		var user = {
// 			name: req.sanitize('name').escape().trim(),
// 			age: req.sanitize('age').escape().trim(),
// 			email: req.sanitize('email').escape().trim()
// 		}
		
// 		req.getConnection(function(error, conn) {
// 			conn.query('INSERT INTO users SET ?', user, function(err, result) {
// 				//if(err) throw err
// 				if (err) {
// 					req.flash('error', err)
					
// 					// render to views/user/add.ejs
// 					res.render('user/add', {
// 						title: 'Add New User',
// 						name: user.name,
// 						age: user.age,
// 						email: user.email					
// 					})
// 				} else {				
// 					req.flash('success', 'Data added successfully!')
					
// 					// render to views/user/add.ejs
// 					res.render('user/add', {
// 						title: 'Add New User',
// 						name: '',
// 						age: '',
// 						email: ''					
// 					})
// 				}
// 			})
// 		})
// 	}
// 	else {   //Display errors to user
// 		var error_msg = ''
// 		errors.forEach(function(error) {
// 			error_msg += error.msg + '<br>'
// 		})				
// 		req.flash('error', error_msg)		
		
// 		/**
// 		 * Using req.body.name 
// 		 * because req.param('name') is deprecated
// 		 */ 
//         res.render('user/add', { 
//             title: 'Add New User',
//             name: req.body.name,
//             age: req.body.age,
//             email: req.body.email
//         })
//     }
// })

// // SHOW EDIT USER FORM
// app.get('/edit/(:id)', function(req, res, next){
// 	req.getConnection(function(error, conn) {
// 		conn.query('SELECT * FROM users WHERE id = ?', [req.params.id], function(err, rows, fields) {
// 			if(err) throw err
			
// 			// if user not found
// 			if (rows.length <= 0) {
// 				req.flash('error', 'User not found with id = ' + req.params.id)
// 				res.redirect('/users')
// 			}
// 			else { // if user found
// 				// render to views/user/edit.ejs template file
// 				res.render('user/edit', {
// 					title: 'Edit User', 
// 					//data: rows[0],
// 					id: rows[0].id,
// 					name: rows[0].name,
// 					age: rows[0].age,
// 					email: rows[0].email					
// 				})
// 			}			
// 		})
// 	})
// })

// // EDIT USER POST ACTION
// app.put('/edit/(:id)', function(req, res, next) {
// 	req.assert('name', 'Name is required').notEmpty()           //Validate name
// 	req.assert('age', 'Age is required').notEmpty()             //Validate age
//     req.assert('email', 'A valid email is required').isEmail()  //Validate email

//     var errors = req.validationErrors()
    
//     if( !errors ) {   //No errors were found.  Passed Validation!
		
// 		/********************************************
// 		 * Express-validator module
		 
// 		req.body.comment = 'a <span>comment</span>';
// 		req.body.username = '   a user    ';

// 		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
// 		req.sanitize('username').trim(); // returns 'a user'
// 		********************************************/
// 		var user = {
// 			name: req.sanitize('name').escape().trim(),
// 			age: req.sanitize('age').escape().trim(),
// 			email: req.sanitize('email').escape().trim()
// 		}
		
// 		req.getConnection(function(error, conn) {
// 			conn.query('UPDATE users SET ? WHERE id = ' + req.params.id, user, function(err, result) {
// 				//if(err) throw err
// 				if (err) {
// 					req.flash('error', err)
					
// 					// render to views/user/add.ejs
// 					res.render('user/edit', {
// 						title: 'Edit User',
// 						id: req.params.id,
// 						name: req.body.name,
// 						age: req.body.age,
// 						email: req.body.email
// 					})
// 				} else {
// 					req.flash('success', 'Data updated successfully!')
					
// 					// render to views/user/add.ejs
// 					res.render('user/edit', {
// 						title: 'Edit User',
// 						id: req.params.id,
// 						name: req.body.name,
// 						age: req.body.age,
// 						email: req.body.email
// 					})
// 				}
// 			})
// 		})
// 	}
// 	else {   //Display errors to user
// 		var error_msg = ''
// 		errors.forEach(function(error) {
// 			error_msg += error.msg + '<br>'
// 		})
// 		req.flash('error', error_msg)
		
// 		/**
// 		 * Using req.body.name 
// 		 * because req.param('name') is deprecated
// 		 */ 
//         res.render('user/edit', { 
//             title: 'Edit User',            
// 			id: req.params.id, 
// 			name: req.body.name,
// 			age: req.body.age,
// 			email: req.body.email
//         })
//     }
// })

// // DELETE USER
// app.delete('/delete/(:id)', function(req, res, next) {
// 	var user = { id: req.params.id }
	
// 	req.getConnection(function(error, conn) {
// 		conn.query('DELETE FROM users WHERE id = ' + req.params.id, user, function(err, result) {
// 			//if(err) throw err
// 			if (err) {
// 				req.flash('error', err)
// 				// redirect to users list page
// 				res.redirect('/users')
// 			} else {
// 				req.flash('success', 'User deleted successfully! id = ' + req.params.id)
// 				// redirect to users list page
// 				res.redirect('/users')
// 			}
// 		})
// 	})
// })

// module.exports = app
