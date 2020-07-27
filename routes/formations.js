var bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtOptions = require('../jwt/jwtOptions');
const passport = require('passport');
const { Op } = require("sequelize");

var {Formation,User,Category,Chapitre,UserChapHistory, Question,Reponse,UserChapScore, FormationComment, UserChapitrePlayed} = require('../config/sequelize');
var {transporter} = require('../config/mail');

var videoPath ="https://mjaproject.test/videos/";
var videoPathChapitre ="https://mjaproject.test/videos/chapitre";


module.exports.route = (app) => {

    //Route get formations list
    app.get('/formation', (req, res) => {

       
        console.log('user in session',req.session.user);
        var user_session = req.session.user;
        var test_categories = Category.findAll({
            include: [{model: Formation, limit: 6}],  
            order: [['title', 'ASC']]
                    })
         .then(categories => {
            res.render('formation/list',
            {videoPath:videoPath,
             categories: categories,
             user_session: user_session
            }) 
        })
    })
//Route get formations list
    app.get('/library',function(req, res){       
        if (!req.session.user) {
            console.log("sessionChecker false");
            res.redirect('/login');
            return;
            
        }
        var user_session = req.session.user;
        var user_id = user_session.id;
        // res.json(req.session.user);
        // console.log(req.session.user.id);
        history = 0;
        Formation.findAll({
            // where: {id: req.params.id},
            include: [{model: Chapitre,
                include: [{model: UserChapHistory,required:true, where: {user_id: user_id}, group: ['chapitre_id']}]
                    }]
            })
            .then(formations => {
                res.json(formations)
                // var list_formations = [];
                //     formations.chapitres[0].user_chapitre_histories.forEach(history => {
                //         list_formations.push(formations.id);
                //     });
                //     res.json(list_formations);
                // res.render('formation/list',
                // {videoPath:videoPath,
                // categories: categories,
                // user_session: user_session
                }) 
        // })
    })
    //Route get formation by id and all details 
    app.get('/formation/show/(:id)', function(req, res){
        // res.redirect('/login');
        // return;
        if (!req.session.user) {
            console.log("sessionChecker false");
            res.redirect('/login');
            return;
            
        }
       var user_session = req.session.user;
       var user_id = user_session.id;
       var numbre_chapitre = 0
       Formation.findOne({where: {id: req.params.id},
                    include: [{model: Chapitre,
                        include: [{model: UserChapHistory,required: false, where: {user_id: user_id}}]},
                            {model: Chapitre,
                            include: [{model: UserChapScore,required: false, where: {user_id: user_id}}]},
                            {
                                model: FormationComment,
                                include :[{model: User}]
                            }
                        ],
                        order: [
                            [Chapitre, 'rang', 'asc'],
                            [FormationComment,'date_update','DESC']
                        ]
                    })
                    .then(formations =>{
                    //    res.json(formations);
                    //    return;
                        var list_chap = [];
                        formations.chapitres.forEach(chapitre => {
                            numbre_chapitre = numbre_chapitre + 1;
                            list_chap.push(chapitre.id);
                        });                                 
                        res.render('formation/show',{
                            user_session: user_session,
                            videoPathChapitre:videoPathChapitre,
                            formations: formations,
                            numbre_chapitre: numbre_chapitre
                        })
                        // //console.log(list_chap);
                        // UserChapHistory.findAll({where: {user_id:user_session.id,
                        //                         chapitre_id: {  [Op.in]:list_chap }},
                        //                         })
                        //                         .then(userchaphist =>{
                        //                         res.render('formation/show',{
                        //                             user_session: user_session,
                        //                             videoPathChapitre:videoPathChapitre,
                        //                             formations: formations,
                        //                             userchaphist: userchaphist,
                        //                             numbre_chapitre: numbre_chapitre
                        //                         })
                        // })  
                    });       
    })

    //Route  get formation test
    app.get('/formation/test/(:stat)/(:id)',function(req, res, next){
        if (!req.session.user) {
            console.log("sessionChecker false");
            res.redirect('/login');
            return;
        }
        var user_session = req.session.user;
        console.log(user_session);
        var chap = Chapitre.findOne({where:{id:req.params.id}})
        .then(chapitre =>
            chap = chapitre);
        var question = Question.findAll({   where: {chapitre_id: req.params.id},
                                            include: [{model: Reponse}],
                                            order: [
                                                [ 'rang', 'asc']
                                            ]
                                        })
                                        .then(questions =>{
                                            res.render('formation/test',{
                                                user_session: user_session,
                                                chap:chap,
                                                questions:questions,
                                                stat: req.params.stat
                                            })
                                        })
    })




    //Route for saving video last time stopped
    app.post('/chapitre/history', function(req, res, next){
        if (! req.session.user) {
            return;
        }
        console.log("chapitre history done");
        var user_session = req.session.user;
        var user_id = user_session.id;
        var chapitre_id = req.body.chapitre_id;
        var currentTime = req.body.currentTime;
        
        UserChapHistory.create({
            user_id: user_id,
            chapitre_id: chapitre_id,
            elapsed_video_time: currentTime,
        })
        .then(() => {
      
            console.log('user chapitre created in db');
            res.json({ saved: 'ok' });
        });
    })

    //Route saving score for each chapitre

    app.post('/chapitre/score', function(req, res, next){
        if (! req.session.user) {
            return;
        }
        console.log(req.body);
        var user_session = req.session.user;
        var user_id = user_session.id;
        var chapitre_id = req.body.chapitre_id;
        var score = req.body.score;

        UserChapScore.create({
            user_id: user_id,
            chapitre_id: chapitre_id,
            score: score
        })
        .then(() => {
      
            console.log('user score created in db');
            res.json({ saved: 'ok' });
        });
    })
    /**comment formation save */
    app.post('/formation/comment', function(req, res, next){
        if (! req.session.user) {
            return;
        }
        var user_session = req.session.user;
        var user_id = user_session.id;
        var formation_id = req.body.formation_id;
        var comment = req.body.comment;

            FormationComment.create({
            user_id: user_id,
            formation_id: formation_id,
            comment: comment,
        })
        .then((result) => {
            id_inserted_comment = result.id;
            FormationComment.findOne({where:{id:id_inserted_comment},
                                        include: [{model: User}]
                                    })
                                    .then(inserted_comment =>{
                                        //console.log(inserted_comment)
                                        res.json({ saved: 'ok',  inserted_comment: inserted_comment});
                                    });
            // console.log(result);    
            // console.log('formation comment created in db');
            // res.json({ saved: 'ok' });
            
        });
    })

    //Route for saving video played time
    app.post('/chapitre/played', function(req, res){
        if (! req.session.user) {
            return;
        }
        var user_session = req.session.user;
        var user_id = user_session.id;
        var chapitre_id = req.body.chapitre_id;
        var playedTime = req.body.playedTime;
        console.log(playedTime)
            UserChapitrePlayed.create({
            user_id: user_id,
            chapitre_id: chapitre_id,
            played_video_time: playedTime,
        })
        .then(() => {
      
            console.log('user chapitre played time created in db');
            res.json({ saved: 'ok' });
        });
    })
    //route calculate score for certif result
    app.get('/formation/(:id)/score', (req, res) => {
        if (! req.session.user) {
            return;
        }
        var user_session = req.session.user;
        var user_id = user_session.id;
        var id_formation =  req.params.id;
        var sumDuration = 0;
        var sumPlayedTime = 0;
        var percent = 0;
        var certificat = 0;
       
        Formation.findOne({where: {id: id_formation},
            include: [{model: Chapitre,
                        include: [{model: UserChapitrePlayed,where: {user_id: user_id},
                            include :[{model: User}]
                        }]
                      },
                      {model: Chapitre,
                        include: [{model: UserChapScore,required: false, where: {user_id: user_id}}]
                    }]
            })
            .then(formations =>{
            //    res.json(formations);
            //    return;

            var minScoreCert = formations.min_score_cert;
            user_name = formations.chapitres[0].user_chapitre_playeds[0].user.name;
            user_email = formations.chapitres[0].user_chapitre_playeds[0].user.email;
            formations.chapitres.forEach(Chapitre =>{
                sumDuration = sumDuration + Chapitre.video_duration;
                Chapitre.user_chapitre_playeds.forEach(Chapitrep =>{
                    sumPlayedTime = sumPlayedTime + Chapitrep.played_video_time;
                })
            })
            percent= (sumPlayedTime/ sumDuration)*100;
            formation_name = formations.title;
            if(percent >= minScoreCert){
                certificat = 1;
                // send certificat mail
                var mailOptions = {
                    from: 'minabmza@gmail.com',
                    to: "user_email",
                    subject: 'Certificate congratulations',
                    html: '<h3>CONGRATULATIONS!'+user_name+'</h3><h4>You Got'+formation_name+' certificate</h4><p>The talent of success is nothing more than doing what you can do well; and doing well whatever you do.</p>'
                    
                };
                  
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                });
            }
           res.json({
               minScoreCert: minScoreCert,
               sumDuration: sumDuration,
               sumPlayedTime: sumPlayedTime,
               certificat: certificat,
               percent: percent,
               user_name: user_name,
               user_email: user_email,
               formation_name: formation_name
           })
      });    
    })
}

    




