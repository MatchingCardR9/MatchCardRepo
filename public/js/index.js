
var socket = io();
var myName ;
var opponentName;
var currentRoom;

socket.on('roominfo',function(data){
    currentRoom = data.roomnumber;
    if(socket.id == data.roomdata.player1.id) opponentName = data.roomdata.player2.name;
    else{
        opponentName = data.roomdata.player1.name;
    }
});
socket.on('initialcardposition',function(data){

});

function submitName(){
//
//        myName = elem.value;
//        var id    = elem.id;
//        if (value === ""){
//            alert("Enter your name!")
//        }else{
//            alert("Welcome "+ myName +"!! to the card matching game.")

    socket.emit('joingame',{name : 'aaaaatest'}); // change player name to playername from login box later
}
