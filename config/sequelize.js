var Sequelize = require('sequelize');
var UserModel = require('../models/user');
var FormationModel = require('../models/formation');
var CategoryModel = require('../models/category');
var ChapitreModel = require('../models/Chapitre');
var UserChapitreHistoryModel = require('../models/user_chapitre_history');
var UserChapitrePlayedModel = require('../models/user_chapitre_played');
var FormationCommentModel = require('../models/formation_comment');
var UserChapScoreModel = require('../models/user_chapitre_score');
var QuestionModel = require('../models/question');;
var ReponseModel = require('../models/reponse');

const sequelize = new Sequelize('laravel-node', 'root', '', {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    define: {
        paranoid: false,
        timestamps: false
    }
  });
  

  const User = UserModel(sequelize, Sequelize);
  const Formation = FormationModel(sequelize, Sequelize);
  const Category = CategoryModel(sequelize, Sequelize);
  const Chapitre = ChapitreModel(sequelize, Sequelize);
  const UserChapHistory = UserChapitreHistoryModel(sequelize, Sequelize);
  const UserChapitrePlayed = UserChapitrePlayedModel(sequelize, Sequelize);
  const FormationComment = FormationCommentModel(sequelize, Sequelize);
  const UserChapScore = UserChapScoreModel(sequelize,Sequelize);
  const Question = QuestionModel(sequelize,Sequelize);
  const Reponse = ReponseModel(sequelize,Sequelize)

  /**Formation-category relation */
  Category.hasMany(Formation, {foreignKey: 'category_id'});
  Formation.belongsTo(Category, {foreignKey: 'category_id'});

  /**Formation-chapitre relation */
  Formation.hasMany(Chapitre, {foreignKey: 'formation_id'});
  Chapitre.belongsTo(Formation, {foreignKey: 'formation_id'});

  /**Question Reponse relation*/
  Question.hasMany(Reponse, {foreignKey: 'question_id'});
  Reponse.belongsTo(Question, {foreignKey: 'question_id'});

  /**user-chapitre history relation */
  UserChapHistory.belongsTo(User,{foreignKey:'user_id'});
  UserChapHistory.belongsTo(Chapitre,{foreignKey:'chapitre_id'});
  User.hasMany(UserChapHistory,{foreignKey:'user_id'});
  Chapitre.hasMany(UserChapHistory,{foreignKey:'chapitre_id'});

  /**user-chapitre played time relation */
  UserChapitrePlayed.belongsTo(User,{foreignKey:'user_id'});
  UserChapitrePlayed.belongsTo(Chapitre,{foreignKey:'chapitre_id'});
  User.hasMany(UserChapitrePlayed,{foreignKey:'user_id'});
  Chapitre.hasMany(UserChapitrePlayed,{foreignKey:'chapitre_id'});
  
   /**user-chapitre score relation */
   UserChapScore.belongsTo(User,{foreignKey:'user_id'});
   UserChapScore.belongsTo(Chapitre,{foreignKey:'chapitre_id'});
   User.hasMany(UserChapScore,{foreignKey:'user_id'});
   Chapitre.hasMany(UserChapScore,{foreignKey:'chapitre_id'});

   /**formation_comment relation */
   FormationComment.belongsTo(User,{foreignKey:'user_id'});
   FormationComment.belongsTo(Formation,{foreignKey:'formation_id'});
   User.hasMany(FormationComment,{foreignKey:'user_id'});
   Formation.hasMany(FormationComment,{foreignKey:'formation_id'});

  /**Export Models */
  module.exports = {
    User,
    Formation,
    Category,
    Chapitre,
    UserChapHistory,
    UserChapScore,
    Question,
    Reponse,
    FormationComment,
    UserChapitrePlayed
 }