module.exports = (sequelize, type) => {

    return  sequelize.define('question', {
    
        id: {
          type: type.INTEGER, 
          primaryKey: true,
          autoIncrement: true,
        },
  
        title: {
          type: type.STRING,
          allowNull: false,
         },
        rang: {
          type: type.INTEGER,
          allowNull: false,
         }
       
    
      });
    
      
    
  
  }