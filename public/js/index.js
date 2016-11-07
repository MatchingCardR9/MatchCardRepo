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

    myName = document.getElementById('username').value;
    var nameform = document.getElementById('nameform').value;
    socket.emit('joingame',{name : name} ); // change player name to playername from login box later

    
	if(name==""){
		if(confirm("Write your name! or you will be called Gay Retard")==true){
			name = "Gay Retard";
				alert("Welcome " + name+ "! to Hatestone; cheap matching card game")
		socket.emit('joingame',{name : name} ); // change player name to playername from login box later
		document.getElementById('submitbutton').disabled = "disabled";
		$("#nameform").fadeOut();
		}else{}
		$("#waitingplayer").fadeIn();
	}else{
	alert("Welcome " + name+ "! to Hatestone; cheap matching card game")
	socket.emit('joingame',{name : name} ); // change player name to playername from login box later

	if(myName==""){
		if(confirm("Write your name! or you will be called Gay")==true){
			myName = "Gay";
				alert("Welcome " + myName+ "! to Hatestone; cheap matching card game")
	socket.emit('joingame',{name : myName} ); // change player name to playername from login box later
    document.getElementById('submitbutton').disabled = "disabled";
	$("#nameform").fadeOut();
		}else{
			
	}
		}else{
	alert("Welcome " + myName+ "! to Hatestone; cheap matching card game")
	socket.emit('joingame',{name : myName} ); // change player name to playername from login box later

    document.getElementById('submitbutton').disabled = "disabled";
	$("#nameform").fadeOut();
	$("#waitingplayer").fadeIn();
	}
}

socket.on('roomready',function(data){ //Receive room info , Assign Opponent name + opponent id
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
    myScore = 0;
    opponentScore = 0;
    //SCORE = 0 everytime gamestart
    //CARD POSITION FROM SERVBR
    // SHOW ALL CARD 10 SEC
    if(turn=='play'){
        //CHOOSEFIRSTCARD
    }
    if(turn=='wait'){
        //WAITFIRSTCARD
    }
});

socket.on('choosefirstcard',function(){
    //ACTION WHEN PLAYER ASSIGNED TO CHOOSE FIRST CARD
});

socket.on('waitfirstcard',function(){
    //ACTION WHEN PLAYER ASSIGNED TO WAIT FIRST CARD
});

function firstcardselected() {
    var firstcardposition = 5; //CHANGE TO CARD POSITION THAT PLAYER PICKED
    // ADD FUNCTION FROM FRONTEND TO GET CARD POSITION
    socket.emit('firstcardselected', {firstcardposition: firstcardposition , roomnumber : currentRoom} //CHANGE TO VAR SELECTEDPOSITION
    );
}

socket.on('flipfirstcard',function(data){
    var firstcardposition = data.firstcardposition;
    //FLIP THE FIRST CARD AND PLAY THE GAME

});

socket.on('play',function(data){
    // SHOW WHICH POSITION OPPONENT PICKED AND PLAY
    var opponentwrongposition = data.wrongposition;//use this to show which position is opponent picked
});

function wrong(){
    var wrongposition = 1; // change this to real position later
// if player choose wrong card use this method
    //

    socket.emit('wrong',{wrongposition: wrongposition , roomnumber : currentRoom , currentscore : myScore});

}

function correct(){
    var correctposition = 2;
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

function continueGame(){ //AFTER PRESS CONTINUE
    socket.emit('continue', {roomnumber : currentRoom});
}



socket.on('updateOpponentScore',function(data){ //THIS METHOD IS CALLED ON EVERY WRONG,CORRECT CARD SELECTION
       opponentScore = data.opponentScore;
});//FRONTEND --> UPDATE OPPONENTSCORE



