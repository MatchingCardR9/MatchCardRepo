
var socket = io();
var myName ; //link with text box
var myScore = 0;
var opponentName;
var opponentId;
var opponentScore;
var currentRoom;
var initialcardposition = [];



function submitName(){
    // --> after click , disable button
//
//        myName = elem.value;
//        var id    = elem.id;
//        if (value === ""){
//            alert("Enter your name!")
//        }else{
//            alert("Welcome "+ myName +"!! to the card matching game.")

    var name = document.getElementById('username').value;
    var nameform = document.getElementById('nameform').value;
    socket.emit('joingame',{name : name} ); // change player name to playername from login box later
    document.getElementById('submitbutton').disabled = "disabled";
    $("#nameform").fadeOut();

	if(name==""){
		if(confirm("Write your name! or you will be called Gay")==true){
			name = "Gay";
				alert("Welcome " + name+ "! to Hatestone; cheap matching card game")
	socket.emit('joingame',{name : name} ); // change player name to playername from login box later
    document.getElementById('submitbutton').disabled = "disabled";
		}
		}else{
	alert("Welcome " + name+ "! to Hatestone; cheap matching card game")
	socket.emit('joingame',{name : name} ); // change player name to playername from login box later
    document.getElementById('submitbutton').disabled = "disabled";
	
	}


}

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

function readytoplay(){
    // PRESS READY AFTER NAME SUBMISSION
    socket.emit('readytoplay',{roomnumber : currentRoom});
}

socket.on('gamestart',function(data){
    initialcardposition = data.initialcardposition;
    var turn = data.turn; // CHECK IF YOU ARE PLAYER 1 or PLAYER 2 ( player1 play first card )
    //CARD POSITION FROM SERVBR
    // SHOW ALL CARD 10 SEC
    if(turn=='play'){
        //PLAYFIRSTCARD
    }
    if(turn=='wait'){
        //WAITFIRSTCARD
    }
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
socket.on('play',function(data){
    // PLAY
    var opponentwrongposition = data.wrongposition; //USE THIS TO SHOW WHICH POSITION OPPONENT PICKED
});
function wrong(){
    var cardposition = 1; // change this to real position later
// if player choose wrong card use this method
    //

    socket.emit('wrong',{wrongposition: wrongposition , roomnumber : currentRoom , currentscore : myScore});

}

function correct(){
    var cardposition = 2;
// if player match correct card use this method
    socket.emit('correct',{correctposition:correctposition, roomnumber : currentRoom , currentscore : myScore});
}

socket.on('correntposition',function(data){
    //OPPONENT CHOSE CORRECT CARD
    //SHOW CORRECT POSITION
    var opponentcorrectposition = data.correctposition;
});

socket.on('gameend',function(data){
    if(data.result =='win'){
        //DISPLAY YOU'RE WIN
        //SHOW SCORE OF BOTH PLAYER
    }
    if(data.result =='lose'){
        //DISPLAY OPPONENT WIN
        //SHOW SCORE OF BOTH PLAYER
    }
    if(data.result =='draw'){
        //DISPLAYER DRAW
        //SHOW SCORE OF BOTH PLAYER
    }
}); // GAME END --> DO SOMETHING , SHOW

function continueGame(){ //AFTER
    socket.emit('continue', {roomnumber : currentRoom});
}



socket.on('updateOpponentScore',function(data){ //THIS METHOD IS CALLED ON EVERY WRONG,CORRECT CARD SELECTION
       opponentScore = data.opponentScore;
});//FRONTEND --> UPDATE OPPONENTSCORE



