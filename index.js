// var http = require('http').Server(app);
// var server = http.createServer(app);
// server = app.listen(app.get('port'), function(){
//   console.log('server listen on port' + server.address().port);
// })
// var io = require('socket.io')(server);

// //chargement du fichier inde.html affiché au client
// app.get("/",function(req,res){
//     res.sendFile(__dirname + '/index.html');
//   })
//   io.on('connection', function(socket){
//   console.log('a user is connected');
//   socket.on('disconnected',function(){
//     console.log('a user is disconnected');
//   })
//   socket.on('chat message',function(msg){
//     console.log('message reçu' + msg);
//   })
//   }) c bon


var http = require('http');
var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
    socket.emit('message', 'Vous êtes bien connecté !');
    socket.on('new_client', function(data) {
        console.log(data);
        socket.emit('to_admin_notif', 'Vous êtes bien connecté !');
    });
});



server.listen(3000);