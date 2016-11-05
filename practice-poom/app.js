var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendfile('index.html');
});
var clients = 0 ;
var roomno = 1;
io.on('connection', function(socket){
    clients++;
    console.log('A user connected');
    //Increase roomno 2 clients are present in a room.
    if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1)
        roomno++;
    socket.join("room-"+roomno);

    //Send this event to everyone in the room.
    io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
    //Send a message when
    /*
    setTimeout(function(){
        //TEST MESSAGE FUNCTION socket.send("AAAAAA message test");
        socket.emit('testerEvent', { description: 'A custom event named testerEvent!'});
    }, 4000);
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
    */
    /*
    socket.emit('newclientconnect',{description: 'Hey, Welcome!'});
    socket.broadcast.emit('newclientconnect',{ description: clients + ' clients connected!'});
    socket.on('disconnect', function () {
        clients--;
        socket.broadcast.emit('newclientconnect',{ description: clients + ' clients connected!'});
    });
    */

    socket.on('clientEvent',function(data){
            console.log(data);
    });
});

http.listen(3000, function(){
    console.log('listening on localhost:3000');
});