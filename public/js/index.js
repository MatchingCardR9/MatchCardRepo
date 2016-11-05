/**
 * Created by Poom2 on 11/5/2016.
 */
var socket = io();
var name ;
var opponentName;
var currentRoom;

socket.emit('joingame',{name :'playername'}); // change player name to playername from login box later
socket.on('roominfo',function(data){
    currentRoom = data.roomnumber;
    if(socket.id == data.roomdata.player1.id) opponentName = data.roomdata.player2.name;
    else{
        opponentName = data.roomdata.player1.name;
    }
});
socket.on('initialcardposition',function(data){

});
