module.exports = (sequelize, type) => {

  return  sequelize.define('chapitre', {
  
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
      video_duration:{
            type: type.FLOAT,
            allowNull: false
            },
        path: {
              type: type.STRING,
              allowNull: false
              },
        rang: {
              type: type.INTEGER,
              allowNull: false
              },
        formation_id: {
              type: type.INTEGER,
              allowNull: false
              }
  
    });
  
    
  

}