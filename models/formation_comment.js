module.exports = (sequelize, type) => {

    return  sequelize.define('formation_comment', {
    
        id: {
          type: type.INTEGER, 
          primaryKey: true,
          autoIncrement: true,
        },
        formation_id: {
            type: type.INTEGER,
            allowNull: false
        },
        user_id: {
            type: type.INTEGER,
            allowNull: false
        },
        comment: {
            type: type.TEXT,
            allowNull: false
        },
        date_update: {
            type: type.DATE,
            defaultValue: sequelize.NOW
        }
       
    });
}