var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');

app.use(express.static(__dirname+'/public'));

var rooms = [];
var roomnumber = 1;
var initialcardposition;

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});


io.on('connection',function(socket){
    console.log('user connected');
    socket.on('joingame',function(data){

        if(io.sockets.adapter.rooms[roomnumber] &&io.sockets.adapter.rooms[roomnumber].length==2) roomnumber++;
        socket.join(roomnumber);
        if(io.sockets.adapter.rooms[roomnumber].length==1) {
            rooms[roomnumber] = new Object();
            rooms[roomnumber].player1 = new Object();
            rooms[roomnumber].player2 = new Object();
            if(Math.random()<0.5){
                rooms[roomnumber].player1.name = data.name;
                rooms[roomnumber].player1.id = socket.id;

                console.log(rooms[roomnumber].player1.name+" joined "+roomnumber);
            }else {
                rooms[roomnumber].player2.name = data.name;
                rooms[roomnumber].player2.id = socket.id;

                console.log(rooms[roomnumber].player2.name+" joined "+roomnumber);
            }
        }else{ // 2 players connected to a room already
            if(rooms[roomnumber].player1.id !=''){
                rooms[roomnumber].player1.name = data.name;
                rooms[roomnumber].player1.id = socket.id;
            }else{
                rooms[roomnumber].player2.name = data.name;
                rooms[roomnumber].player2.id = socket.id;
            }
            io.sockets.in(roomnumber).emit('roominfo',{
                'roomnumber' : roomnumber,
                'roomdata' : rooms[roomnumber]
                }
            );
            io.sockets.in(roomnumber).emit('initialcardposition' , {
                'initialcardposition' : initialcardposition
            });
        }


    });
    socket.on('disconnect',function(){
        console.log('user'+socket.id+'disconnected');
    })
});

http.listen(3000, function(){
    console.log('listening on localhost:3000');
});