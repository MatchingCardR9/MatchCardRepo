
var socket = io();
var myName ; //link with text box
var opponentName;
var opponentId;
var opponentScore;
var currentRoom;
var initialcardposition = [];
socket.on('roominfo',function(data){
    currentRoom = data.roomnumber;
    if(socket.id == data.roomdata.player1.id) {
        opponentName = data.roomdata.player2.name;
        opponentId = data.roomdata.player2.id;
    }
    else{
        opponentName = data.roomdata.player1.name;
        opponentId = data.roomdata.player1.id;
    }
});
socket.on('initialcardposition',function(data){
    initialcardposition = data.initialcardposition;
});

socket.on('playfirstcard',function(){
    //ACTION WHEN PLAYER ASSIGNED TO PLAY FIRST CARD
});

socket.on('waitfirstcard',function(){
    //ACTION WHEN PLAYER ASSIGNED TO WAIT FIRST CARD
});

function firstcardselected() {
    var cardposition = 5; //change position later
    // ADD FUNCTION FROM FRONTEND TO GET CARD POSITION
    socket.emit('firstcardselected', {cardposition: cardposition} //CHANGE TO VAR SELECTEDPOSITION
    );
}

function ready(){
    socket.emit('readytoplay',{roomnumber : currentRoom});
}
function submitName(){
    // --> after click , disable button
//
//        myName = elem.value;
//        var id    = elem.id;
//        if (value === ""){
//            alert("Enter your name!")
//        }else{
//            alert("Welcome "+ myName +"!! to the card matching game.")

    socket.emit('joingame',{name : 'aaaaatest'}); // change player name to playername from login box later
}

