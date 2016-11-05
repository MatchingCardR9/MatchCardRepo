var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');

app.use(express.static(__dirname+'/public'));

// var rooms = [];
// var roomnumber = 1;


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});


io.on('connection',function(socket){
    console.log('user connected');
    //socket.on('joingame',function(){
/*
        if(io.sockets.adapter.rooms[roomnumber] &&io.sockets.adapter.rooms[roomnumber].length==2) roomnumber++;
        console.log(io.sockets.adapter.rooms[roomnumber]);
        console.log(io.sockets.adapter.rooms[roomnumber].length);

        socket.join(roomnumber);
        console.log(io.sockets.adapter.rooms[roomnumber]);
        console.log(io.sockets.adapter.rooms[roomnumber].length);
*/

       // console.log('player joined at room'+roomnumber);
   // });
});

http.listen(3000, function(){
    console.log('listening on localhost:3000');
});