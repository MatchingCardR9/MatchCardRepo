var socket = io();
var myName; //link with text box
var myScore = 0;
var opponentName;
var opponentId;
var opponentScore;
var currentRoom;
var initialcardposition = [];
var audio = new Audio('/sound/imgay.mp3');
var cardstate = [];
var cardposition =  [];

var temp_firstcard;
var temp_selected;
//TEST ON CLICK
console.log('TESTTTT');

function submitName() {
    // --> after click , disable button
//
//        myName = elem.value;
//        var id    = elem.id;
//        if (value === ""){
//            alert("Enter your name!")
//        }else{
//            alert("Welcome "+ myName +"!! to the card matching game.")

    myName = document.getElementById('username').value;
    if (myName == "") {
        if (confirm("Write your name! or you will be called Gay Retard") == true) {
			myName = "Gay Retard";
			audio.play();
			window.setTimeout(alert(),2000);
			alert("Welcome " + myName + "! to Hatestone; cheap matching card game")
			socket.emit('joingame', {name: myName}); // change player name to playername from login box later
            document.getElementById('submitbutton').disabled = "disabled";
            $("#nameform").fadeOut();
            $("#waitingplayer").fadeIn();
        } else {
        }
    } else {
        alert("Welcome " + myName + "! to Hatestone; cheap matching card game")
        socket.emit('joingame', {name: myName}); // change player name to playername from login box later
        document.getElementById('submitbutton').disabled = "disabled";
        $("#nameform").fadeOut();
        $("#waitingplayer").fadeIn();
    }
}

socket.on('roomready', function (data) { //Receive room info , Assign Opponent name + opponent id
    currentRoom = data.roomnumber;
    if (socket.id == data.roomdata.player1.id) {
        opponentName = data.roomdata.player2.name;
        opponentId = data.roomdata.player2.id;
    }
    else {
        opponentName = data.roomdata.player1.name;
        opponentId = data.roomdata.player1.id;
    }
    //ROOM READY , BOTH PLAYER JOINED THE ROOM --> ARE YOU READY?
    $("#waitingplayer").fadeOut()
    $("#roomReady").fadeIn();


});


function readytoplay() {
    document.getElementById('readyBtn').disabled = "disabled"
    // PRESS READY AFTER NAME SUBMISSION
    socket.emit('readytoplay', {roomnumber: currentRoom});
}

socket.on('gamestart', function (data) {
    $("#roomReady").fadeOut();

    $("#debugCorrect").fadeIn(); //DEBUG--> TEST PICK CORRECT UNTIL GAME END
    $("#debugWrong").fadeIn(); // DEBUG --> TEST PICK WRONG
    $("#page_login").fadeOut();
    $("#page_game").fadeIn();
    initialcardposition = data.initialcardposition;
    copyCardPosition();

    var turn = data.turn; // CHECK IF YOU ARE PLAYER 1 or PLAYER 2 ( player1 play first card )
    myScore = 0;
    opponentScore = 0;
    $("#page_myScore").html('my Score:'+myScore);
    $("#page_opponentScore").html('oppoenent score: '+opponentScore);
    $("#page_myName").html('myname is '+myName);
    $("#page_opponentName").html('Oppoenent is '+opponentName);
    //SCORE = 0 everytime gamestart
    //CARD POSITION FROM SERVBR
    // SHOW ALL CARD 10 SEC
    showInitialCard();

    addOnClick();


    setTimeout(function(){
  //  setTimeout(hideAllCard,5000); //HIDE CARD AFTER 10 SEC

    setAlltoFold();

    if (turn == 'play') {
        console.log('CHOOSE FIRST CARD!');
        chooseFirstCard();
        //CHOOSEFIRSTCARD
    }
    if (turn == 'wait') {
        console.log('WAIT OPPONENT TO CHOOSE FIRST CARD');
        waitFirstCard();
        //WAITFIRSTCARD
    }
    },3000); // EDIT LATER
});

socket.on('choosefirstcard', function () {
    //ACTION WHEN PLAYER ASSIGNED TO CHOOSE FIRST CARD
    console.log('CHOOSE FIRST CARD!');
    chooseFirstCard();
    //CHOOSEFIRSTCARD
});

socket.on('waitfirstcard', function () {
    //ACTION WHEN PLAYER ASSIGNED TO WAIT FIRST CARD
    console.log('WAIT OPPONENT TO CHOOSE FIRST CARD');
    waitFirstCard();
    //WAITFIRSTCARD
});

function firstcardselected(firstcardposition) {
    var firstcardposition = firstcardposition; //CHANGE TO CARD POSITION THAT PLAYER PICKED
    // ADD FUNCTION FROM FRONTEND TO GET CARD POSITION
    socket.emit('firstcardselected', {firstcardposition: firstcardposition, roomnumber: currentRoom} //CHANGE TO VAR SELECTEDPOSITION
    );
}

socket.on('flipfirstcard', function (data) {
    var firstcardposition = data.firstcardposition;
    flipFirstCard(data.firstcardposition);
    $('#page_gameState').html('YOUR TURN');
    //FLIP THE FIRST CARD AND PLAY THE GAME

    //PLAY THE GAME
    matchCard(temp_firstcard);

});

socket.on('play', function (data) {
    // SHOW WHICH POSITION OPPONENT PICKED AND PLAY


    var opponentwrongposition = data.wrongposition;//use this to show which position is opponent picked
    showOpponentWrongAndPlay(opponentwrongposition);

});

function wrong(wrongposition) {
    var wrongposition = wrongposition; // change this to real position later
    myScore--; //DEBUG WRONG TEST
// if player choose wrong card use this method
    //

    socket.emit('wrong', {wrongposition: wrongposition, roomnumber: currentRoom, currentscore: myScore});

}

function correct(correctposition) {
    myScore++; //DEBUG CORRECT TEST
    //
    console.log('CORRECT FUNCTION'+correctposition);
    cardstate[temp_firstcard] = 'MATCHED';
    cardstate[correctposition] = 'MATCHED';

// if player match correct card use this method
    socket.emit('correct', {correctposition: correctposition, roomnumber: currentRoom, currentscore: myScore});
}

socket.on('correctposition', function (data) {
    //OPPONENT CHOSE CORRECT CARD
    //SHOW CORRECT POSITION

    cardstate[temp_firstcard] = 'MATCHED';
    cardstate[data.correctposition] = 'MATCHED';
    console.log
    showCorrectCard(data.correctposition);
});

socket.on('gameend', function (data) {
    $("#debugCorrect").fadeOut(); //DEBUG FUNCTION CORRECT TEST
    $("#debugWrong").fadeOut(); // DEBUG FUNCTION WRONG TEST
    $("#debugContinue").fadeIn();//DEBUG FUNCTION CONTINUE TEST
    $("#memory_board").fadeOut();
    if (data.result == 'win') {
        //DISPLAY YOU'RE WIN
        //SHOW SCORE OF BOTH PLAYER
        console.log("You win");
    }
    if (data.result == 'lose') {
        //DISPLAY OPPONENT WIN
        //SHOW SCORE OF BOTH PLAYER
        console.log(opponentName + "win");
    }
    if (data.result == 'draw') {
        //DISPLAYER DRAW
        //SHOW SCORE OF BOTH PLAYER
        console.log("draw");
    }
}); // GAME END --> DO SOMETHING , SHOW

function continueGame() { //AFTER PRESS CONTINUE
    socket.emit('continue', {roomnumber: currentRoom});
    $("#debugContinue").fadeOut();
}


socket.on('updateOpponentScore', function (data) { //THIS METHOD IS CALLED ON EVERY WRONG,CORRECT CARD SELECTION
    opponentScore = data.opponentScore;
});//FRONTEND --> UPDATE OPPONENTSCORE


function showInitialCard() {

    for (var i = 0; i < initialcardposition.length; i++) {
        var tile = 't' + (i+1);
      //  console.log('show tile:' + tile + ' value:' + initialcardposition[i]);
        showtile(tile, initialcardposition[i]);
        //SHOW TILE OKAY!
    }
    console.log('FINISH SHOW TILE');
}

function showtile(tile, val) {
    $('#'+tile).html(val);
    cardstate[tile] = 'SHOW';
}
function setAlltoFold(){
    for (var i = 0; i < initialcardposition.length; i++) {
        var tile = 't' + (i+1);
        $('#'+tile).html('FOLD');
        cardstate[tile]='FOLD';
    }
}


function chooseFirstCard(){
    console.log('CHOOSE FIRST CARD FUNCTION')
    $("#page_gameState").text('CHOOSE FIRST CARD NOW!');
    for (var i = 0; i < initialcardposition.length; i++) {
        var tile = 't' + (i+1);
        cardstate[tile]='PICKFIRSTCARD';
        //cardposition[tile]=initialcardposition[i];
    }

}
function waitFirstCard(){
    $("#page_gameState").text('WAIT FOR YOUR OPPONENT TO CHOOSE FIRST CARD');
}

function flipFirstCard(cardid){
    $('#'+cardid).addClass('greenBg');
    $('#'+cardid).html(''+cardposition[cardid]);
    cardstate[cardid] = 'FIRSTCARD';
    temp_firstcard = cardid;
}
function flipCard(cardid){

    $('#'+cardid).html(''+cardposition[cardid]);
    cardstate[cardid] = 'FIRSTCARD';
}

function foldCard(cardid){
    $('#'+cardid).text('FOLD');
    $('#'+cardid).removeClass();  // FOLD CARD SET COLOR BACK TO NORMAL
    cardstate[cardid] = 'FOLD';

}

function matchCard(firstcardid){
    console.log('matchcard - '+firstcardid);
   // console.log(cardposition.length);
    for(var i=0;i<initialcardposition.length;i++){
        var currentid = 't'+(i+1);
        //console.log('match card - currentid'+currentid);
        if(currentid==firstcardid){}
        else{
            cardstate[currentid]='CHOOSE';
        }
    }
}

function waitOpponentToMatch(firstcardid){
    console.log('wait opponent to match - '+firstcardid);
   // console.log(cardposition.length);
    $('#page_gameState').text('OPPONENT TURN');
    for(var i=0;i<initialcardposition.length;i++){
        var currentid = 't'+(i+1);
        if(currentid==firstcardid){}
        else{
            cardstate[currentid]='FOLD';
        }
    }
}

function showOpponentWrongAndPlay(position){
    $('#'+position).addClass('redBg');
    $('#'+position).html(cardposition[position]);
    console.log('Opponent pick Wrong!');
    $('#page_matchResult').text('Opponent Picked wrong card');
    setTimeout(function(){
        foldCard(position);
        $('#page_gameState').html('YOUR TURN');
        matchCard(temp_firstcard);


    },3000);

}
function  showCorrectCard(position){
    console.log('SHOWING CORRECT CARD');
    console.log('OPPONENT CORRECTCARD IS '+position);
    $('#'+position).addClass('greenBg');
    $('#'+position).html(cardposition[position]);
    console.log('Opponent Picked Correct card');
    $('#page_matchResult').text('Opponent Picked CORRECT card');
    setTimeout(function(){
        $('#page_matchResult').text('Opponent turn');
    },3000);
}

function addOnClick(){
    for(var i=0;i<initialcardposition.length;i++){
        var tile = 't'+(i+1);
        $('#'+tile).on('click',function(){
            if(cardstate[this.id]=='SHOW'){
                console.log(this.id+' SHOWING');
            }
            if(cardstate[this.id]=='FOLD'){
                console.log(this.id+' is folded');
            }
            if(cardstate[this.id]=='PICKFIRSTCARD'){
                console.log(this.id+' :card'+cardposition[this.id]+' is picked');
                flipFirstCard(this.id);
                $("#page_gameState").text('OPPONENT TURN!');
                firstcardselected(this.id);
            }
            if(cardstate[this.id]=='FIRSTCARD'){
                console.log('this is first card');
            }
            if(cardstate[this.id]=='CHOOSE'){
                console.log(this.id+' :card'+cardposition[this.id]+' is CHOSEN');
                var currentid = this.id;
                var cardIsMatch = isMatch(this.id,temp_firstcard);
                flipCard(this.id);
                if(cardIsMatch){

                    $('#'+this.id).addClass('greenBg');
                    console.log('Correct card');
                    $('#page_matchResult').text('Correct!');
                    correct(this.id);
                }
                else{
                    $('#'+this.id).addClass('redBg');
                    console.log('Wrong!');
                    $('#page_matchResult').text('Wrong!');
                    setTimeout(function(){
                        foldCard(currentid);

                    },3000);
                    waitOpponentToMatch(temp_firstcard);
                    wrong(this.id);
                }
                // if(correcT){
                //
                // }
                //     else{
                //
                // }

            }
          //   console.log(this.id);
          //   console.log(this.innerHTML);
          //   console.log(tile+' is clicked');
        });
    }
}

///AUTO JOIN FEATURE
function askToJoinNewGame(){
    $("#debugAutojoin").fadeIn();
}
function joinNewGame(){ // earth
    socket.emit('joingame',{name: myName});
    $("#nameform").fadeOut();
    $("#waitingplayer").fadeIn();
}

socket.on('opponentDisconnected', function(data) { // Earth
    console.log("Do you want to continue");
    askToJoinNewGame(); //SHOW JOIN NEW GAME BUTTON , CLEAR BOARD

});
//AUToJOIN FEATURE


function isMatch(cardid1,cardid2){
    var value1 = cardposition[cardid1];
    var value2 = cardposition[cardid2];

    if(value1==value2) return true;
    else{
        return false;
    }
}

function copyCardPosition(){
    for(var i=0;i<initialcardposition.length;i++) {
        var id = 't'+(i+1);
        cardposition[id] = initialcardposition[i];

    }
}

//FOR DEBUG ONLY<<<<<<<<<<<<<<<<<<<<,,,,,
function magicHappens(){
    socket.emit('joingame',{name : 'GUMAGIC'});
    myName='GUMAGIC';
    $("#nameform").fadeOut();
}
//>>>>>>>>>>>>>>>>>>>FOR DEBUG ONLY

function wait(sec) {
    var countTurn = sec;
    var counter = setInterval(timer, 1000);

    function timer() {
        console.log(countTurn + "second left");
        countTurn = countTurn - 1;
        if (countTurn <= 0) {
            clearInterval(counter);
            return;
        }
    }
}
