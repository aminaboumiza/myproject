module.exports = (sequelize, type) => {

    return  sequelize.define('category', {
    
        id: {
          type: type.INTEGER, 
          primaryKey: true,
          autoIncrement: true,
        },
  
        title: {
               type: type.STRING,
               allowNull: false,},

    
      });
    
      
    
  
  }