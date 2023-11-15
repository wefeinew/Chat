
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 80 port
//server.listen(3000);//for local test
server.listen(process.env.PORT || 3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);
//handle the socket


function sendSponsorAd() {
    // Здесь добавьте логику для отправки рекламы спонсоров
    // Используйте io.sockets.emit для отправки сообщения о рекламе всем клиентам
    // Пример:
   var sponsorsAdOptions = [
  "Это рекламное сообщение от спонсоров 1!",
  "Это рекламное сообщение от спонсоров 2!"
];

var randomIndex = Math.floor(Math.random() * sponsorsAdOptions.length);
var sponsorsAd = sponsorsAdOptions[randomIndex];
    io.sockets.emit('sponsorAd', sponsorsAd);
}

// Запуск отправки рекламы каждые 30 секунд
setInterval(sendSponsorAd, 60000);
io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //user leaves
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            //users.splice(socket.userIndex, 1);
            users.splice(users.indexOf(socket.nickname), 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });
    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});
