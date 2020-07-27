module.exports = (sequelize, type) => {

    return  sequelize.define('user_chapitre_played', {
    
        id: {
          type: type.INTEGER, 
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
            type: type.INTEGER,
            allowNull: false
        },
        chapitre_id: {
            type: type.INTEGER,
            allowNull: false
        },
        played_video_time: {
          type: type.FLOAT,
          allowNull: false,
        }
       
    });
}