var User = require('../config/sequelize');

module.exports.serializeUser = (user, done) => {
    done(null, user.id);
}

module.exports.deserializeUser = (id, done) => {
    User.findOne({where:{id} }).then( (user)=>{
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    })
}