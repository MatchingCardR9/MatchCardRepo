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

    hideAllCard();

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
    },5000);
});

socket.on('choosefirstcard', function () {
    //ACTION WHEN PLAYER ASSIGNED TO CHOOSE FIRST CARD
});

socket.on('waitfirstcard', function () {
    //ACTION WHEN PLAYER ASSIGNED TO WAIT FIRST CARD
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
});

function wrong(wrongposition) {
    var wrongposition = 1; // change this to real position later
    myScore--; //DEBUG WRONG TEST
// if player choose wrong card use this method
    //

    socket.emit('wrong', {wrongposition: wrongposition, roomnumber: currentRoom, currentscore: myScore});

}

function correct() {
    var correctposition = 2;
    myScore++; //DEBUG CORRECT TEST
    //

// if player match correct card use this method
    socket.emit('correct', {correctposition: correctposition, roomnumber: currentRoom, currentscore: myScore});
}

socket.on('correctposition', function (data) {
    //OPPONENT CHOSE CORRECT CARD
    //SHOW CORRECT POSITION
    var opponentcorrectposition = data.correctposition;
});

socket.on('gameend', function (data) {
    $("#debugCorrect").fadeOut(); //DEBUG FUNCTION CORRECT TEST
    $("#debugWrong").fadeOut(); // DEBUG FUNCTION WRONG TEST
    $("#debugContinue").fadeIn();//DEBUG FUNCTION CONTINUE TEST

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
function hideAllCard(){

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
function setAlltoFold(){
    for (var i = 0; i < initialcardposition.length; i++) {
        var tile = 't' + (i+1);
        $('#'+tile).html('FOLD');
        cardstate[tile]='FOLD';
    }
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
function matchCard(firstcardid){
    console.log('matchcard - '+firstcardid);
    console.log(cardposition.length);
    for(var i=0;i<initialcardposition.length;i++){
        var currentid = 't'+(i+1);
        console.log('match card - currentid'+currentid);
        if(currentid==firstcardid){}
        else{
            cardstate[currentid]='CHOOSE';
        }
    }
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
                setAlltoFold();
                flipFirstCard(this.id);
                $("#page_gameState").text('OPPONENT TURN!');
                firstcardselected(this.id);
            }
            if(cardstate[this.id]=='FIRSTCARD'){
                console.log('this is first card');
            }
            if(cardstate[this.id]=='CHOOSE'){
                console.log(this.id+' :card'+cardposition[this.id]+' is CHOSEN');
                var cardIsMatch = isMatch(this.id,temp_firstcard);
                flipCard(this.id);
                if(cardIsMatch){

                    $('#'+this.id).addClass('greenBg');
                    console.log('Correct card');
                    $('#page_matchResult').text('Correct!');
                }
                else{
                    $('#'+this.id).addClass('redBg');
                    console.log('Wrong!');
                    $('#page_matchResult').text('Wrong!');
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

function memoryFlipTile(tile, val) {
    if (tile.innerHTML == "" && memory_values.length < 1) {
        tile.style.background = '#FAB';
        tile.innerHTML = val;
        if (memory_values.length == 0) {
            memory_values.push(val);
            memory_tile_ids.push(tile.id);


        } else if (memory_values.length == 1) {
            memory_values.push(val);
            memory_tile_ids.push(tile.id);
            if (memory_values[0] == memory_values[1]) {
                tiles_flipped += 2;
                // Clear both arrays
                memory_values = [];
                memory_tile_ids = [];
                // Check to see if the whole board is cleared
                if (tiles_flipped == memory_array.length) {
                    alert("Board cleared... generating new board");
                    document.getElementById('memory_board').innerHTML = "";
                    newBoard();
                }
            } else {
                function flip2Back() {
                    // Flip the 2 tiles back over
                    var tile_1 = document.getElementById(memory_tile_ids[0]);
                    var tile_2 = document.getElementById(memory_tile_ids[1]);
                    tile_1.sty
                    le.background = 'url(tile_bg.jpg) no-repeat';
                    tile_1.innerHTML = "";
                    tile_2.style.background = 'url(tile_bg.jpg) no-repeat';
                    tile_2.innerHTML = "";
                    // Clear both arrays
                    memory_values = [];
                    memory_tile_ids = [];
                }

                setTimeout(flip2Back, 700);
            }
        }
    }
}

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
