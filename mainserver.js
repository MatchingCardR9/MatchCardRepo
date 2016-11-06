var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');

app.use(express.static(__dirname+'/public'));

var rooms = [];
var roomnumber = 1;


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
            rooms[roomnumber].initialcardposition = randomCardPosition();
            rooms[roomnumber].remainingcards = 36;

            if(Math.random()<0.5){
                rooms[roomnumber].player1.name = data.name;
                rooms[roomnumber].player1.id = socket.id;


                console.log(rooms[roomnumber].player1.name+" joined "+roomnumber);
            }else {
                rooms[roomnumber].player2.name = data.name;
                rooms[roomnumber].player2.id = socket.id;

                console.log(rooms[roomnumber].player2.name+" joined "+roomnumber);
            }
        }else { // 2 players connected to a room already
            if (rooms[roomnumber].player1.id != '') {
                rooms[roomnumber].player1.name = data.name;
                rooms[roomnumber].player1.id = socket.id;

                console.log(rooms[roomnumber].player1.name+" joined "+roomnumber);
            } else {
                rooms[roomnumber].player2.name = data.name;
                rooms[roomnumber].player2.id = socket.id;

                console.log(rooms[roomnumber].player2.name+" joined "+roomnumber);
            }
            io.sockets.in(roomnumber).emit('roominfo', {
                    'roomnumber': roomnumber,
                    'roomdata': rooms[roomnumber]
                }
            );

        }

    });

    socket.on('readytoplay',function(data){
        if(socket.id == rooms[data.roomnumber].player1.id) rooms[data.roomnumber].player1.ready = true;
        else{
            rooms[data.roomnumber].player2.ready = true;
        }
        if(rooms[data.roomnumber].player2.ready && rooms[data.roomnumber].player1.ready){
            //SEND CARD POSITION --> GAME START AT FRONTEND
            io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER1 PLAY FIRST
            });
            io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER@ WAIT FIRST
            });
        }
    });

    socket.on('wrong',function(data) { // wrong card
        if (room[data.roomnumber].player1.id == socket.id) {    //PLAYER1 CHOSE WRONG CARD

        rooms[data.roomnumber].player1.score = data.currentscore;
        io.to(rooms[data.roomnumber].player2.id).emit('updateOpponentScore',{opponentScore : data.currentscore});
        io.to(rooms[data.roomnumber].player2.id).emit('play', {
            wrongposition: data.wrongposition
        });
        }
        else{   //PLAYER2 CHOSE WRONG CARD
            rooms[data.roomnumber].player2.score = data.currentscore;
            io.to(rooms[data.roomnumber].player1.id).emit('updateOpponentScore',{opponentScore : data.currentscore});
            io.to(rooms[data.roomnumber].player1.id).emit('play',{
                wrongposition : data.wrongposition
            });
        }
        //CASE >> time out , let position = 100 --> frontend (index.js) if position = 100 --> do something
    });

    socket.on('correct',function(data) { // correct card

        if (room[data.roomnumber].player1.id == socket.id) {
            rooms[data.roomnumber].player1.score = data.currentscore;
            io.to(rooms[data.roomnumber].player2.id).emit('updateOpponentScore',{opponentScore : data.currentscore});
        }
        else {
            rooms[data.roomnumber].player2.score = data.currentscore;
            io.to(rooms[data.roomnumber].player1.id).emit('updateOpponentScore',{opponentScore : data.currentscore});
        } //UPDATE SCORE ON SERVER SIDE , TELL OPPONENT TO UPDATE SCORE


        room[data.roomnumber].remainingcards--;
        if (room[data.roomnumber].remainingcards == 0) {// REMAINING CARD IS 0 >> GAME ENDED


            if (room[data.roomnumber].player1.score > room[data.roomnumber].player2.score) {
                io.to(rooms[data.roomnumber].player1.id).emit('gameend',{
                    result:'win'
                });
                io.to(rooms[data.roomnumber].player2.id).emit('gameend',{
                    result:'lose'
                });
            }
            else if(room[data.roomnumber].player2.score > room[data.roomnumber].player1.score){
                io.to(rooms[data.roomnumber].player2.id).emit('gameend',{
                    result:'win'
                });
                io.to(rooms[data.roomnumber].player1.id).emit('gameend',{
                    result:'lose'
                });
            }else{
                io.to(rooms[data.roomnumber].player1.id).emit('gameend',{
                    result:'draw'
                });
                io.to(rooms[data.roomnumber].player2.id).emit('gameend',{
                    result:'draw'
                });
            }
        }
        else{ // REMAINING CARD !=0 --> WINNER CHOOSE FIRSTCARD

        if (room[data.roomnumber].player1.id == socket.id) { //PLAYER1 CHOSE CORRECT CARD
           io.to(rooms[data.roomnumber].player2.id).emit('correctposition', {
                correctposition: data.correctposition
            });
            socket.emit('playfirstcard');
            io.to(rooms[data.roomnumber].player2.id).emit('waitfirstcard');

        }
        else {  //PLAYER2 CHOSE CORRECT CARD
            io.to(rooms[data.roomnumber].player1.id).emit('correctposition', {
                correctposition: data.correctposition
            });
            socket.emit('playfirstcard');
            io.to(rooms[data.roomnumber].player1.id).emit('waitfirstcard');

        }
        }

        
    });


    socket.on('continue',function(data){
        if(socket.id == rooms[data.roomnumber].player1.id) rooms[data.roomnumber].player1.continue = true;
        else{
            rooms[data.roomnumber].player2.continue = true;
        }
        if(rooms[data.roomnumber].player2.continue && rooms[data.roomnumber].player1.continue){

            rooms[data.roomnumber].initialcardposition = randomCardPosition();
            rooms[data.roomnumber].remainingcards = 36;

            if (room[data.roomnumber].player1.score > room[data.roomnumber].player2.score){
                io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                    'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER1 PLAY FIRST
                });
                io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                    'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER2 WAIT FIRST
                });
            }
            else if (room[data.roomnumber].player2.score > room[data.roomnumber].player1.score){
                io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                    'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER1 WAIT FIRST
                });
                io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                    'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER2 PLAY FIRST
                });
            }
            else{
                if(Math.random()<0.5){
                    io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                        'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER1 PLAY FIRST
                    });
                    io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                        'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER2 WAIT FIRST
                    });
                }else{
                    io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                        'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER1 wait FIRST
                    });
                    io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                        'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER2 play FIRST
                    });
                }
            }



        }
    });


    socket.on('disconnect',function(){
        console.log('user'+socket.id+'disconnected');
    })
});

function randomCardPosition(){
    var initialcardposition = [];
    for(var i=0;i<18;i++){
        initialcardposition[2*i] ="index:"+(2*i+1)+ " photonumber "+(i+1);
        initialcardposition[(2*i)+1] = "index:"+(2*i+2)+"photonumber "+(i+1);
    }
    // for(var i=0;i<36;i++){
    //     console.log(initialcardposition[i]);
    // }

    var j, x, i;
    for (i = initialcardposition.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = initialcardposition[i - 1];
        initialcardposition[i - 1] = initialcardposition[j];
        initialcardposition[j] = x;
    }

    for(var i=0;i<36;i++){
        console.log(initialcardposition[i]);
    }

    return initialcardposition;
}



http.listen(3000, function(){
    console.log('listening on localhost:3000');
});