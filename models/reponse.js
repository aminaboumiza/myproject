module.exports = (sequelize, type) => {

    return  sequelize.define('reponse', {
    
        id: {
          type: type.INTEGER, 
          primaryKey: true,
          autoIncrement: true,
        },
  
        reponse: {
          type: type.STRING,
          allowNull: false,
         },
        valide: {
            type: type.BOOLEAN,
            allowNull: false,
        },
        question_id: {
            type: type.INTEGER,
            allowNull: false
            }
       
    
      });
    
      
    
  
  }