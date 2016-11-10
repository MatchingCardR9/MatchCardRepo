var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');
var amountofplayers = 0;
app.use(express.static(__dirname+'/public'));

var rooms = [];
var roomnumber = 1;


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/admin',function(req,res){
    res.sendFile(path.join(__dirname+'/admin.html'));
});


io.on('connection',function(socket){
    console.log('client connected - id :'+socket.id);
    socket.on('joingame',function(data){
        amountofplayers++;
        if(io.sockets.adapter.rooms[roomnumber] &&io.sockets.adapter.rooms[roomnumber].length==2) roomnumber++;
        socket.join(roomnumber);
        if(io.sockets.adapter.rooms[roomnumber].length==1) {
            rooms[roomnumber] = new Object();
            rooms[roomnumber].player1 = new Object();
            rooms[roomnumber].player2 = new Object();

            rooms[roomnumber].player1.notEmpty = false;
            rooms[roomnumber].player2.notEmpty = false;

            rooms[roomnumber].initialcardposition = randomCardPosition();
            //rooms[roomnumber].remainingcards = 36;
            rooms[roomnumber].remainingcards = 3; // USE 10 CARD FOR CORRECT DEBUG

            if(Math.random()<0.5){
                rooms[roomnumber].player1.name = data.name;
                rooms[roomnumber].player1.id = socket.id;
                rooms[roomnumber].player1.notEmpty = true;
                // console.log(rooms[roomnumber]);
                console.log("Room: "+roomnumber+" Player1-"+rooms[roomnumber].player1.name+" joined");
            }else {
                rooms[roomnumber].player2.name = data.name;
                rooms[roomnumber].player2.id = socket.id;
                rooms[roomnumber].player2.notEmpty = true;
                // console.log(rooms[roomnumber]);
                console.log("Room: "+roomnumber+" Player2-"+rooms[roomnumber].player2.name+" joined");
            }
        }else { // 2 players connected to a room already
            if (rooms[roomnumber].player1.id!=null) {
                rooms[roomnumber].player2.name = data.name;
                rooms[roomnumber].player2.id = socket.id;
                rooms[roomnumber].player2.notEmpty = true;
                // console.log(rooms[roomnumber]);
                console.log("Room: "+roomnumber+" Player2-"+rooms[roomnumber].player2.name+" joined");
            } else {
                rooms[roomnumber].player1.name = data.name;
                rooms[roomnumber].player1.id = socket.id;
                rooms[roomnumber].player2.notEmpty = true;
                // console.log(rooms[roomnumber]);
                console.log("Room: "+roomnumber+" Player1-"+rooms[roomnumber].player1.name+" joined");
            }
            console.log("Room : "+roomnumber+"- Both Players joined - wait player to press ready");
            io.sockets.in(roomnumber).emit('roomready', {
                    'roomnumber': roomnumber,
                    'roomdata': rooms[roomnumber]
                }
            );

        }

    });

    socket.on('readytoplay',function(data){
        if(socket.id == rooms[data.roomnumber].player1.id){
            rooms[data.roomnumber].player1.ready = true;
            console.log("Room: "+data.roomnumber+" Player1-"+rooms[data.roomnumber].player1.name+" ready");
        }
        else{
            rooms[data.roomnumber].player2.ready = true;
            console.log("Room: "+data.roomnumber+" Player2-"+rooms[data.roomnumber].player2.name+" ready");
        }
        if(rooms[data.roomnumber].player2.ready && rooms[data.roomnumber].player1.ready){
            //SEND CARD POSITION --> GAME START AT FRONTEND
            io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                'initialcardposition': rooms[data.roomnumber].initialcardposition , turn :'play' //PLAYER1 PLAY FIRST
            });
            io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                'initialcardposition': rooms[data.roomnumber].initialcardposition , turn :'wait' //PLAYER@ WAIT FIRST
            });
            console.log('Room: '+data.roomnumber+' - Game Started');
        }
    });


    socket.on('firstcardselected',function(data){
        var firstcardposition = data.firstcardposition;
        if(rooms[data.roomnumber].player1.id == socket.id) {
            io.to(rooms[data.roomnumber].player2.id).emit('flipfirstcard',{firstcardposition : firstcardposition});
            console.log("Room: "+data.roomnumber+" Player1-"+rooms[data.roomnumber].player1.name+" selected first card");

        }else{
            io.to(rooms[data.roomnumber].player1.id).emit('flipfirstcard',{firstcardposition : firstcardposition});
            console.log("Room: "+data.roomnumber+" Player2-"+rooms[data.roomnumber].player2.name+" selected first card");

        }
    });

    socket.on('wrong',function(data) { // wrong card
        if (rooms[data.roomnumber].player1.id == socket.id) {    //PLAYER1 CHOSE WRONG CARD

        rooms[data.roomnumber].player1.score = data.currentscore;
        io.to(rooms[data.roomnumber].player2.id).emit('updateOpponentScore',{opponentScore : data.currentscore});
        io.to(rooms[data.roomnumber].player2.id).emit('play', {
            wrongposition: data.wrongposition
        });

            console.log("Room: "+data.roomnumber+" Player1-"+rooms[data.roomnumber].player1.name+" pick wrong card - card number :"+data.wrongposition);
        }
        else{   //PLAYER2 CHOSE WRONG CARD
            rooms[data.roomnumber].player2.score = data.currentscore;
            io.to(rooms[data.roomnumber].player1.id).emit('updateOpponentScore',{opponentScore : data.currentscore});
            io.to(rooms[data.roomnumber].player1.id).emit('play',{
                wrongposition : data.wrongposition
            });

            console.log("Room: "+data.roomnumber+" Player2-"+rooms[data.roomnumber].player2.name+" pick wrong card - card number :"+data.wrongposition);

        }
        //CASE >> time out , let position = 100 --> frontend (index.js) if position = 100 --> do something
    });


    // socket.on('timeUpForPick',function(data){
    //     if (rooms[data.roomnumber].player1.id == socket.id) {    //PLAYER1 CHOSE WRONG CARD
    //
    //         rooms[data.roomnumber].player1.score = data.currentscore;
    //         io.to(rooms[data.roomnumber].player2.id).emit('updateOpponentScore',{opponentScore : data.currentscore});
    //         io.to(rooms[data.roomnumber].player2.id).emit('opponentTimeUp', {
    //
    //         });
    //
    //         console.log("Room: "+data.roomnumber+" Player1-"+rooms[data.roomnumber].player1.name+" TIME UP");
    //     }
    //     else{   //PLAYER2 CHOSE WRONG CARD
    //         rooms[data.roomnumber].player2.score = data.currentscore;
    //         io.to(rooms[data.roomnumber].player1.id).emit('updateOpponentScore',{opponentScore : data.currentscore});
    //         io.to(rooms[data.roomnumber].player1.id).emit('opponentTimeUp',{
    //
    //         });
    //
    //         console.log("Room: "+data.roomnumber+" Player2-"+rooms[data.roomnumber].player2.name+"  TIME UP");
    //
    //     }
    // });


    socket.on('correct',function(data) { // correct card

        if (rooms[data.roomnumber].player1.id == socket.id) { // PLAYER 1 PICK CORRECT CARD
            rooms[data.roomnumber].player1.score = data.currentscore;
            io.to(rooms[data.roomnumber].player2.id).emit('updateOpponentScore',{opponentScore : data.currentscore});

            console.log("Room: "+data.roomnumber+" Player1-"+rooms[data.roomnumber].player1.name+" pick CORRECT card - card number :"+data.correctposition);

        }
        else { // PLAYER 2 PICK CORRECT
            rooms[data.roomnumber].player2.score = data.currentscore;
            io.to(rooms[data.roomnumber].player1.id).emit('updateOpponentScore',{opponentScore : data.currentscore});

            console.log("Room: "+data.roomnumber+" Player2-"+rooms[data.roomnumber].player2.name+" pick CORRECT card - card number :"+data.correctposition);

        } //UPDATE SCORE ON SERVER SIDE , TELL OPPONENT TO UPDATE SCORE


        rooms[data.roomnumber].remainingcards--;

        console.log("Room: "+data.roomnumber+" Remaining Cards : "+rooms[data.roomnumber].remainingcards);

        if (rooms[data.roomnumber].remainingcards == 0) {// REMAINING CARD IS 0 >> GAME ENDED

            console.log("Room :"+data.roomnumber+" Game Ended");
            if (rooms[data.roomnumber].player1.score > rooms[data.roomnumber].player2.score) {
                io.to(rooms[data.roomnumber].player1.id).emit('gameend',{
                    result:'win'
                });
                io.to(rooms[data.roomnumber].player2.id).emit('gameend',{
                    result:'lose'
                });
                console.log("Room :"+data.roomnumber+" Player1-"+rooms[data.roomnumber].player1.name+" Win");
            }
            else if(rooms[data.roomnumber].player2.score > rooms[data.roomnumber].player1.score){
                io.to(rooms[data.roomnumber].player2.id).emit('gameend',{
                    result:'win'
                });
                io.to(rooms[data.roomnumber].player1.id).emit('gameend',{
                    result:'lose'
                });
                console.log("Room :"+data.roomnumber+" Player2-"+rooms[data.roomnumber].player2.name+" Win");

            }else{
                io.to(rooms[data.roomnumber].player1.id).emit('gameend',{
                    result:'draw'
                });
                io.to(rooms[data.roomnumber].player2.id).emit('gameend',{
                    result:'draw'
                });
                console.log("Room :"+data.roomnumber+" DRAW");

            }
        }
        else{ // REMAINING CARD !=0 --> WINNER CHOOSE FIRSTCARD

        if (rooms[data.roomnumber].player1.id == socket.id) { //PLAYER1 CHOSE CORRECT CARD
           io.to(rooms[data.roomnumber].player2.id).emit('correctposition', {
                correctposition: data.correctposition
            });
            socket.emit('choosefirstcard');
            io.to(rooms[data.roomnumber].player2.id).emit('waitfirstcard');

        }
        else {  //PLAYER2 CHOSE CORRECT CARD
            io.to(rooms[data.roomnumber].player1.id).emit('correctposition', {
                correctposition: data.correctposition
            });
            socket.emit('choosefirstcard');
            io.to(rooms[data.roomnumber].player1.id).emit('waitfirstcard');

        }
        }

        
    });


    socket.on('continue',function(data){
        if(socket.id == rooms[data.roomnumber].player1.id) { //PLAYER1 CONTINUE
            rooms[data.roomnumber].player1.continue = true;
            console.log("Room: "+data.roomnumber+" Player1-"+rooms[data.roomnumber].player1.name+" CONTINUE");

        }
        else{ //PLAYER2 CONTINUE
            rooms[data.roomnumber].player2.continue = true;
            console.log("Room: "+data.roomnumber+" Player2-"+rooms[data.roomnumber].player2.name+" CONTINUE");

        }
        if(rooms[data.roomnumber].player2.continue && rooms[data.roomnumber].player1.continue){ //BOTH PLAYER CONTINUE , START NEW GAME

            rooms[data.roomnumber].initialcardposition = randomCardPosition();
            rooms[data.roomnumber].remainingcards = 36;
            console.log("Room: "+data.roomnumber+" CONTINUED-->new game started");

            if (rooms[data.roomnumber].player1.score > rooms[data.roomnumber].player2.score){
                io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                    'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER1 PLAY FIRST
                });
                io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                    'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER2 WAIT FIRST
                });

                console.log("Room: "+data.roomnumber+" Player 1-"+rooms[data.roomnumber].player1.name+" Play first");
            }
            else if (rooms[data.roomnumber].player2.score > rooms[data.roomnumber].player1.score){
                io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                    'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER1 WAIT FIRST
                });
                io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                    'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER2 PLAY FIRST
                });

                console.log("Room: "+data.roomnumber+" Player 2-"+rooms[data.roomnumber].player2.name+" Play first");

            }
            else{
                if(Math.random()<0.5){
                    io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                        'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER1 PLAY FIRST
                    });
                    io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                        'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER2 WAIT FIRST
                    });

                    console.log("Room: "+data.roomnumber+" Player 1-"+rooms[data.roomnumber].player1.name+" Play first");

                }else{
                    io.to(rooms[data.roomnumber].player1.id).emit('gamestart',{
                        'initialcardposition': rooms[roomnumber].initialcardposition , turn :'wait' //PLAYER1 wait FIRST
                    });
                    io.to(rooms[data.roomnumber].player2.id).emit('gamestart',{
                        'initialcardposition': rooms[roomnumber].initialcardposition , turn :'play' //PLAYER2 play FIRST
                    });

                    console.log("Room: "+data.roomnumber+" Player 2-"+rooms[data.roomnumber].player2.name+" Play first");

                }
            }



        }
    });


    socket.on('resetFromServer', function(data) {    //reset add by earth not sure by now

        rooms[data.roomnumber].initialcardposition = randomCardPosition();
        rooms[data.roomnumber].remainingcards = 4;
        console.log("Room: " + data.roomnumber + " SERVER RESET-->new game started");

        rooms[data.roomnumber].player1.ready = false;
        rooms[data.roomnumber].player2.ready = false;
        //SEND CARD POSITION --> GAME START AT FRONTEND
        io.to(rooms[data.roomnumber].player1.id).emit('gamereset', {
             //PLAYER1 PLAY FIRST
        });
        io.to(rooms[data.roomnumber].player2.id).emit('gamereset', {
            //PLAYER@ WAIT FIRST
        });
        console.log('Room: ' + data.roomnumber + ' - Game Started');
    } );


    socket.on('disconnect',function(){

        console.log(whoDisconnected(socket.id));
    });

    //ADMIN PAGE
    socket.on('getNumberOfPlayers',function(){
        socket.emit('numberOfPlayers',{numberofplayers:amountofplayers})
    });
});

function randomCardPosition(){
    var initialcardposition = [];
     for(var i=0;i<18;i++){
    //     initialcardposition[2*i] ="index:"+(2*i+1)+ " photonumber "+(i+1);
    //     initialcardposition[(2*i)+1] = "index:"+(2*i+2)+"photonumber "+(i+1);
        initialcardposition[2*i] =(i+1);
        initialcardposition[(2*i)+1] = (i+1);

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

    return initialcardposition;
}

function whoDisconnected(socketid){
    for(i=1;i<=roomnumber;i++){
        var room = rooms[i];
        if(room==null) return ('unknown - socket id : '+socketid+' disconnected');
        if(room.player1.id==socketid) {
            amountofplayers--;
            autoJoinWhenOpponentDisconnected(room.player2.id);
            return ('Room :'+i+' Player1-'+room.player1.name+' disconnected');}

        else if(room.player2.id==socketid) {
            amountofplayers--;
            autoJoinWhenOpponentDisconnected(room.player1.id);
            return ('Room :'+i+' Player2-'+room.player2.name+' disconnected');}
    }
    return ('unknown - socket id : '+socketid+' disconnected');
}

function autoJoinWhenOpponentDisconnected(mysocketid){ //modify
    io.to(mysocketid).emit('opponentDisconnected');

}

http.listen(3000, function(){
    console.log('listening on localhost:3000');
});