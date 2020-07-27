module.exports = (sequelize, type) => {

  return  sequelize.define('formation', {
  
      id: {
        type: type.INTEGER, 
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: type.STRING,
        allowNull: false,
      },
      video_name: {
        type: type.STRING,
        allowNull: false,
      },
      description: {
        type:type.STRING,
        allowNull: false,
      },
      min_score_cert: {
        type:type.FLOAT,
        allowNull: false,
      },
      path: {
        type: type.STRING,
        allowNull: false
      },
      category_id: {
        type: type.INTEGER,
        allowNull: false
      }
  
    });
  
    
  

}