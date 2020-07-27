const passportJWT = require('passport-jwt'); 
const ExtractJwt = passportJWT.ExtractJwt;

module.exports = {
    secretOrKey: 'itsayssecretkey',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  };