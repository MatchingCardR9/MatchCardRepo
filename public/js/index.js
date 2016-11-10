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

var countTurn = 0;

var myAvatar = 'avatar_Trump';
var opponentAvatar;
setTimeout(function(){
    $('#avatar_Trump').css('opacity',1.0);
},500);

//SET AVATAR TRUMP AS DEFAULT

var temp_firstcard;
var temp_selected;


//TEST ON CLICK
console.log('TESTTTT');

function submitName() {
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
        socket.emit('joingame', {name: myName , avatar:myAvatar }); // change player name to playername from login box later
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
        opponentAvatar = data.roomdata.player2.avatar;
    }
    else {
        opponentName = data.roomdata.player1.name;
        opponentId = data.roomdata.player1.id;
        opponentAvatar = data.roomdata.player1.avatar;

    }
    //ROOM READY , BOTH PLAYER JOINED THE ROOM --> ARE YOU READY?
    $("#waitingplayer").fadeOut()
    $("#roomReady").fadeIn();
});


function readytoplay() {
    document.getElementById('readyBtn').disabled = "disabled"
    $('#readyBtnAfterReset').prop('disabled',true);
    // PRESS READY AFTER NAME SUBMISSION
    socket.emit('readytoplay', {roomnumber: currentRoom});
}

socket.on('gamestart', function (data) {
    $("#debugCorrect").fadeIn(); //DEBUG--> TEST PICK CORRECT UNTIL GAME END
    $("#debugWrong").fadeIn(); // DEBUG --> TEST PICK WRONG
    console.log('GAME STARTED');


    $("#roomReady").fadeOut();
    $("#page_login").fadeOut();
    $('#page_gameState').text('REMEMBER THE CARDS!');
    $("#page_game").fadeIn();
    $("#memory_board").fadeIn();

    initialcardposition = data.initialcardposition;
    copyCardPosition();

    myScore = 0;
    opponentScore = 0;
    var turn = data.turn; // CHECK IF YOU ARE PLAYER 1 or PLAYER 2 ( player1 play first card )

    $("#page_myScore").html('Score: '+myScore);
    $("#page_opponentScore").html('Score: '+opponentScore);
    $("#page_myName").html(''+myName);
    $("#page_opponentName").html(''+opponentName);

    if(opponentAvatar=='avatar_Trump'){

        $('#gameAvatar_right').attr('src',"images/trump.png");

    }else if(opponentAvatar=='avatar_Clinton'){

        $('#gameAvatar_right').attr('src',"images/hillary.png");


    }else if(opponentAvatar=='avatar_Putin'){

        $('#gameAvatar_right').attr('src',"images/putin.png");

    }

    //SCORE = 0 everytime gamestart
    //CARD POSITION FROM SERVBR
    // SHOW ALL CARD 10 SEC
    showAllCard();
    addOnClick();


    setTimeout(function(){
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
    },10000); // EDIT LATER
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
    $('#page_matchResult').text('Match A Card');
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
    console.log('WRONG FUNCTION to Server'+wrongposition);
    //countTurn = 9999;
// if player choose wrong card use this method
    //

    socket.emit('wrong', {wrongposition: wrongposition, roomnumber: currentRoom, currentscore: myScore});

}

function correct(correctposition) {
    //countTurn = 9999;
    console.log('CORRECT FUNCTION to server : '+correctposition);

// if player match correct card use this method
    socket.emit('correct', {correctposition: correctposition, roomnumber: currentRoom, currentscore: myScore});
}

// function timeUpForPick(){
//     myScore--;
//     console.log('TIME UP!!!');
//     for(var i=0;i<initialcardposition.length;i++){
//         var currentid = 't'+(i+1);
//         //console.log('match card - currentid'+currentid);
//         if(cardstate[currentid]=='CHOOSE') {
//             cardstate[currentid]=='FOLD';
//         }
//     }
//
//     $('#page_gameState').text('OPPONENT TURN');
//
//     socket.emit('timeUpForPick',{roomnumber : currentRoom , currentscore:myScore});
// }

// socket.on('opponentTimeUp',function(){
//
//     showOpponentWrongAndPlay('TIMEUP');
//
// });

socket.on('correctposition', function (data) {
    //OPPONENT CHOSE CORRECT CARD
    //SHOW CORRECT POSITION

    cardstate[temp_firstcard] = 'MATCHED';
    cardstate[data.correctposition] = 'MATCHED';

    $('#'+temp_firstcard).addClass('whiteBg');
    $('#'+data.correctposition).addClass('whiteBg');

    showCorrectCard(data.correctposition);
});

socket.on('gameend', function (data) {
    $("#debugCorrect").fadeOut(); //DEBUG FUNCTION CORRECT TEST
    $("#debugWrong").fadeOut(); // DEBUG FUNCTION WRONG TEST
    $("#debugContinue").fadeIn();//DEBUG FUNCTION CONTINUE TEST
    $("#page_game").fadeOut();
    $("#memory_board").fadeOut();
    setAlltoFold();
    if (data.result == 'win') {
        //DISPLAY YOU'RE WIN
        //SHOW SCORE OF BOTH PLAYER
		$("#gameEndBox").fadeIn();
		$("#gameEndStat").html("Win");
        console.log("You win");
    }
    if (data.result == 'lose') {
        //DISPLAY OPPONENT WIN
        //SHOW SCORE OF BOTH PLAYER
		$("#gameEndBox").fadeIn();
		$("#gameEndStat").html("Lose");
        console.log(opponentName + "win");
    }
    if (data.result == 'draw') {
        //DISPLAYER DRAW
        //SHOW SCORE OF BOTH PLAYER
		$("#gameEndBox").fadeIn();
		$("#you").fadeOut();
		$("#gameEndStat").html("Draw");
        console.log("draw");
    }
}); // GAME END --> DO SOMETHING , SHOW

function continueGame() { //AFTER PRESS CONTINUE
    socket.emit('continue', {roomnumber: currentRoom});
    $("#debugContinue").fadeOut();
    myScore = 0;
    opponentScore = 0;
}


socket.on('updateOpponentScore', function (data) { //THIS METHOD IS CALLED ON EVERY WRONG,CORRECT CARD SELECTION
    opponentScore = data.opponentScore;
    $('#page_opponentScore').text(opponentScore);
});//FRONTEND --> UPDATE OPPONENTSCORE


function showAllCard() {
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
        $('#'+tile).removeClass();  // FOLD CARD SET COLOR BACK TO NORMAL
    }
}

function foldOtherCard(firstcardid){
    for (var i = 0; i < initialcardposition.length; i++) {
        var tile = 't' + (i+1);
        if(tile==firstcardid){}
        else {
            //$('#' + tile).html('FOLD');
            cardstate[tile] = 'FOLD';
        }
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

function matchCard(firstcardid){ //CLOCK ACTIVATE HERE
    console.log('matchcard - '+firstcardid);

    timerCountDown(5);
    for(var i=0;i<initialcardposition.length;i++){
        var currentid = 't'+(i+1);
        //console.log('match card - currentid'+currentid);
        if(cardstate[currentid]=='FIRSTCARD'){

        } else if(cardstate[currentid]=='MATCHED'){

        }
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

        if(cardstate[currentid]=='FIRSTCARD'){

        } else if(cardstate[currentid]=='MATCHED'){

        }
        else{
            cardstate[currentid]='FOLD';
        }
    }
}

function showOpponentWrongAndPlay(position){
    if(position=='TIMEOUT'){ //OPPONENT TIME OUT
        console.log('Opponent Time Up!');

        $('#page_matchResult').text('Opponent Time Out');
        setTimeout(function () {
            foldCard(position);
            $('#page_gameState').html('YOUR TURN');
            $('#page_matchResult').text('Match A Card');

            matchCard(temp_firstcard);


        }, 3000);

    }
    else { //OPPONENT PICKED WRONG CARD
        console.log('Opponent pick Wrong!');

        $('#' + position).addClass('redBg');
        $('#' + position).html(cardposition[position]);

        $('#page_matchResult').text('Opponent Pick Wrong');

        setTimeout(function () {
            foldCard(position);
            $('#page_gameState').html('YOUR TURN');
            $('#page_matchResult').text('Match A Card');

            matchCard(temp_firstcard);


        }, 3000);
    }

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

                $("#page_gameState").text('OPPONENT TURN!');
                flipFirstCard(this.id);
                foldOtherCard(this.id);
                firstcardselected(this.id);
            }
            if(cardstate[this.id]=='FIRSTCARD'){
                console.log('this is first card');
            }
            if(cardstate[this.id]=='MATCHED'){
                console.log('ALREADY MATCHED!');
            }
            if(cardstate[this.id]=='CHOOSE'){
                console.log(this.id+' :card'+cardposition[this.id]+' is CHOSEN');
                countTurn = 150;
                var currentid = this.id;
                var cardIsMatch = isMatch(this.id,temp_firstcard);
                flipCard(this.id);
                if(cardIsMatch){ //CORRECT CARD!!!
                    console.log('Clicked Correct card');
                    myScore++;

                    $('#'+this.id).addClass('whiteBg');
                    $('#'+temp_firstcard).addClass('whiteBg');
                    cardstate[this.id] = 'MATCHED';
                    cardstate[temp_firstcard] = 'MATCHED';

                    $('#page_matchResult').text('Correct!');
                    $('#page_myScore').text(myScore);
                    correct(this.id);
                }
                else{ //WRONG CARD!!
                    console.log('Click Wrong! Card');

                    myScore--;

                    $('#'+this.id).addClass('redBg');

                    $('#page_matchResult').text('Wrong!');
                    $('#page_myScore').text(myScore);
                    setTimeout(function(){
                        foldCard(currentid);

                    },3000);
                    waitOpponentToMatch(temp_firstcard);
                    wrong(this.id); //EMIT TO SERVER
                }

            }

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
    console.log('Copy Card Position from initial to cardpos');
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


socket.on('gamereset', function (data) {
    console.log('GAME RESET BY SERVER');
    $("#debugCorrect").fadeIn(); //DEBUG--> TEST PICK CORRECT UNTIL GAME END
    $("#debugWrong").fadeIn(); // DEBUG --> TEST PICK WRONG

    $('#readyBtnAfterReset').fadeIn();
    $("#roomReset").fadeIn();
    $("#page_login").fadeIn();
    // $("#page_game").fadeIn();
    // $("#memory_board").fadeIn()

    myScore=0;
    opponentScore=0;

    resetCardState();




    $("#page_myScore").html('Score:'+myScore);
    $("#page_opponentScore").html('Score: '+opponentScore);
    $("#page_myName").html(''+myName);
    $("#page_opponentName").html(''+opponentName);
    //SCORE = 0 everytime gamestart

    $('#readyBtn').prop('disabled',false);

});


function timerCountDown(sec){
    countTurn = parseInt(sec);
    var counter = setInterval(timer,1000);
    function timer(){
        console.log(countTurn+" second left");
        if(countTurn>100){
            $('#timeLeftThisTurn').text('');
        } else if(countTurn>=0){

            $('#timeLeftThisTurn').text(countTurn);
        }
        countTurn = countTurn-1;
        if(countTurn <=-2){
            console.log('TIME OUT');

            $('#timeLeftThisTurn').text('Time Out!');
            timeOut();
            clearInterval(counter);
            return;
        }else if(countTurn >100){
            console.log('CARD CHOSEN BEFORE TIME OUT');
            clearInterval(counter);
            return;
        }
    }
}

function timeOut(){
    myScore--;

    $('#page_myScore').text(myScore);

    waitOpponentToMatch(temp_firstcard);
    wrong('TIMEOUT'); //EMIT TO SERVER
}

function resetCardState(){
    console.log('reset card state');
    for(var i=0;i<initialcardposition.length;i++){ // FIX RESET AND CARD STILL HAVE COLOR OF PREVIOUS CORRECT POSITION
        var id = 't'+(i+1);
        $('#'+id).removeClass();
        $('#'+id).text('FOLD');
        cardstate[id] = 'BeforeGameStart';
    }
}

var selectedAvatar;
function setAvatar(avatarchoice) {
    selectedAvatar = avatarchoice;
    console.log(avatarchoice);

    var trumpAvatar = $('#avatar_Trump');
    var clintonAvatar = $('#avatar_Clinton');
    var putinAvatar = $('#avatar_Putin');

    if(selectedAvatar=='Trump'){
        trumpAvatar.css('opacity',1.0);

        clintonAvatar.css('opacity',0.5);
        putinAvatar.css('opacity',0.5);

        $('#gameAvatar_left').attr('src',"images/trump.png");
        myAvatar = 'avatar_Trump'
    }else if(selectedAvatar=='Clinton'){
        clintonAvatar.css('opacity',1.0);

        trumpAvatar.css('opacity',0.5);
        putinAvatar.css('opacity',0.5);
        $('#gameAvatar_left').attr('src',"images/hillary.png");
        myAvatar = 'avatar_Clinton'
    }
    else if(selectedAvatar=='Putin'){
        putinAvatar.css('opacity',1.0);

        trumpAvatar.css('opacity',0.5);
        clintonAvatar.css('opacity',0.5);

        $('#gameAvatar_left').attr('src',"images/putin.png");
        myAvatar = 'avatar_Putin'
    }
}
function testAV(click) {
    alert("You chose " + selectedAvatar);
}

function bgToThai(){
    document.body.style.backgroundColor = "#f3f3f3";
    document.body.style.backgroundImage = "url('images/bg_thai.jpg')";
}
function bgToUS(){
    document.body.style.backgroundColor = "#f3f3f3";
    document.body.style.backgroundImage = "url('images/bg_usa.svg')";
}
function bgToRussia(){
    document.body.style.backgroundColor = "#f3f3f3";
    document.body.style.backgroundImage = "url('images/bg_russia.svg')";
}