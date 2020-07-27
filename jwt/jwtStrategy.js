const jwt = require('jsonwebtoken'); 
const passportJWT = require('passport-jwt'); 
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = require('./jwtOptions');
var User = require('../config/sequelize');

module.exports = new JwtStrategy(jwtOptions, function(jwt_payload, done) {
    User.findOne({where:{id: jwt_payload.id} }).then( (user)=>{
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    })
  })