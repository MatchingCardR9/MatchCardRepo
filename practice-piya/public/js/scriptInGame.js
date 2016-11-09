/**
 * Created by veryhotsos on 10/28/2016.
 */
var socket = io();

var memory_array = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H', 'I', 'I', 'J', 'J', 'K', 'K', 'L', 'L', 'M', 'M', 'N', 'N', 'O', 'O', 'P', 'P', 'Q', 'Q', 'R', 'R'];
var memory_value1 = '';
var memory_value2 = '';
var memory_tile_ids = [];
//var memory_tile_id2;
var tiles_flipped = 0;
var status_array = ["Waiting for player...", "Player Full. Ready to initiate self-destruct sequence in 5 seconds", "'s Turn"];

var myName; //link with text box
var myScore = 0;
var opponentName;
var opponentId;
var opponentScore;
var currentRoom;
var initialcardposition = [];

/////////////////////////////

// var room = '';
// var roomJoined = false;
var board = [];
// var cardSelectedIndex = [];
// var cardSelected = [];
// var turn = false;
// var displayTurn = "Opponent's turn";
// var timer = 10;

/////////////////////////////////////


// function initializeGame(){
//     score_a = 0;
//     score_b = 0;
// }


function getScore() {
    document.getElementById('myScore').innerHTML = '<h3 class="infoText">' + playerScore + '</h3>' + '<p class="subInfoText">' + myName + '</p>';
    document.getElementById('opponentScore').innerHTML = '<h3 class="infoText">' + opponentScore + '</h3>' + '<p class="subInfoText">' + opponentName + '</p>';
}

// function setOpponent(opp) {
//     opponentName = opp.name;
//     opponentID = opp.id;
//     getScore();
// }

// function updateOpponentScore(score) {
//     opponentScore = score;
//     getScore();
// }
//
// function switchTurn() {
//     if (turn === true) {
//         turn = false;
//         displayTurn = "Opponent's turn";
//     } else {
//         turn = true;
//         displayTurn = "Your turn";
//     }
//     timer = 10;
//     displayTime();
// }

function displayTime() {
    document.getElementById('time_display').innerHTML = '<h3 class="timeText">' + timer + '</h3>' + '<p class="turnText">' + displayTurn + '</p>';
}

//////////////////////////////////////////////////////////////////////////////

var $window = $(window);
var $loginPage = $('.login_page'); //login page
var $appPage = $('.app_page'); // main game page

//$("body").hide().show("slow");

Array.prototype.memory_tile_shuffle = function () {
    var i = this.length, j, temp;
    while (--i > 0) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[j];
        this[j] = this[i];
        this[i] = temp;
    }
}



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
    var nameform = document.getElementById('nameform').value;

    if (name == "") {
        if (confirm("Write your name! or you will be called Gay Retard") == true) {
            name = "Gay Retard";
            alert("Welcome " + name + "! to Hatestone; cheap matching card game")
            socket.emit('joingame', {name: name}); // change player name to playername from login box later
            document.getElementById('submitbutton').disabled = "disabled";
            $("#nameform").fadeOut();
            $("#waitingplayer").fadeIn();
        } else {
        }
    } else {
        alert("Welcome " + name + "! to Hatestone; cheap matching card game")
        socket.emit('joingame', {name: name}); // change player name to playername from login box later
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
    $("#waitingplayer").fadeOut()
    $("#roomReady").fadeIn();
});

function readytoplay() {
    document.getElementById('readyBtn').disabled = "disabled"
    // PRESS READY AFTER NAME SUBMISSION
    socket.emit('readytoplay', {roomnumber: currentRoom});
}

function magicHappens(){
    socket.emit('joingame',{name : 'GUMAGIC'});
}
function showInitialCard() {
    var output = '';
    for (var i = 0; i < memory_array.length; i++) {
        //output += '<div id="tile_'+i+'" onclick="memoryFlipTile(this,\''+memory_array[i]+'\')"></div>';
        //output += '<div id ="tile_'+i+'" memory_array[i]"></div>';
        // output += '<div id="tile">'+memory_array[i].id+'</div>';
    }
    //console.log(output);
    //document.getElementById('memory_board').innerHTML = output;

    for (var i = 0; i < memory_array.length; i++) {
        var tile = 't' + (i+1);
        console.log('show tile:' + tile + ' value:' + memory_array[i]);
        showtile(tile, memory_array[i]);
    }
    console.log('FINISH SHOW TILE');
}
socket.on('gamestart', function (data) {
        $("#roomReady").fadeOut();

        // $("#debugCorrect").fadeIn(); //DEBUG--> TEST PICK CORRECT UNTIL GAME END
        //   $("#debugWrong").fadeIn(); // DEBUG --> TEST PICK WRONG

        $loginPage.fadeOut();
        $appPage.fadeIn();
        initialcardposition = data.initialcardposition;
        var turn = data.turn; // CHECK IF YOU ARE PLAYER 1 or PLAYER 2 ( player1 play first card )
        myScore = 0;
        opponentScore = 0;
        //SCORE = 0 everytime gamestart
        //CARD POSITION FROM SERVER
        //////////////////////////////

        var turn = data.turn; // CHECK IF YOU ARE PLAYER 1 or PLAYER 2 ( player1 play first card )
        //CARD POSITION FROM SERVER
        // SHOW ALL CARD 10 SEC

        //board = newboard;
       // showInitialCard();
        //getScore();
        //displayTime();
        console.log('before memory title shuffle');
        memory_array.memory_tile_shuffle();
        console.log('after memory title shuffle');
        showInitialCard();
        ///////////////////////

       // setTimeout(function(){console.log('timeoutperiod');},5000);
        //wait(5);
        console.log('before call newboard   ()');
        console.log('5 sec to show initial card');
        //setTimeout(newBoard,5000);

        function newBoard() {
            console.log('newboard called');

            tiles_flipped = 0;



            // for (var i = 0; i < memory_array.length; i++) {
            //     output += '<div id="tile_' + i + '" onclick="memoryFlipTile(this,\'' + memory_array[i] + '\')"></div>';
            //     console.log(output);
            // }
            // document.getElementById('memory_board').innerHTML = output;
        }


        if (turn == 'play') {
            function memoryFlipTile(tile, val) {
                if (tile.innerHTML == "" && memory_values.length < 1) {
                    tile.style.background = '#FAB';
                    tile.innerHTML = val;
                    if (memory_value1.length == 0) {
                        memory_value1.push(val);
                        //memory_tile_id1.push(tile.id);
                        memory_tile_ids.push(tile.id);
                    }
                    firstcardselected();
                }
            }

            //CHOOSEFIRSTCARD
        }
        if (turn == 'wait') {
            function memoryFlipTile(tile, val) {
                if (memory_value2.length == 0) {
                    memory_value2.push(val);
                    memory_tile_ids.push(tile.id);
                    if (memory_value1 == memory_value2) {
                        correct();
                    } else {
                        wrong();
                    }
                }
            }
        }
    }
);//WAITFIRSTCARD

function showtile(tile, val) {
    $('#'+tile).html(val);
  //  document.getElementById(tile).innerHTML = val;


}

socket.on('playfirstcard', function () {
    function memoryFlipTile(tile, val) {
        if (tile.innerHTML == "" && memory_values.length < 1) {
            tile.style.background = '#FAB';
            tile.innerHTML = val;
            if (memory_value1.length == 0) {
                memory_value1.push(val);
                //memory_tile_id1.push(tile.id);
                memory_tile_ids.push(tile.id);
            }
            firstcardselected();
        }
    } // just like 'play' in 'gamestart'
    //ACTION WHEN PLAYER ASSIGNED TO PLAY FIRST CARD
});

socket.on('waitfirstcard', function () {
    function memoryFlipTile(tile, val) {
        if (memory_value2.length == 0) {
            memory_value2.push(val);
            memory_tile_ids.push(tile.id);
            if (memory_value1 == memory_value2) {
                correct();
            } else {
                wrong();
            }
        }
    } // just like 'wait' in 'gamestart'
});
//ACTION WHEN PLAYER ASSIGNED TO WAIT FIRST CARD

function firstcardselected() {
    var cardposition = memory_tile_ids[0]; //change position later
    // ADD FUNCTION FROM FRONTEND TO GET CARD POSITION
    socket.emit('firstcardselected', {cardposition: cardposition} //CHANGE TO VAR SELECTEDPOSITION
    );
}

socket.on('play', function (data) {
    // PLAY
    var opponentwrongposition = data.wrongposition; //USE THIS TO SHOW WHICH POSITION OPPONENT PICKED
});
function wrong() {
    var cardposition = 1; // change this to real position later
// if player choose wrong card use this method
    //
    function flip2Back() {
        // Flip the 2 tiles back over
        //var tile_1 = document.getElementById(memory_tile_id1);
        var tile_2 = document.getElementById(memory_tile_id2);
        tile_1.sty
        le.background = 'url(tile_bg.jpg) no-repeat';
        // tile_1.innerHTML = "";
        tile_2.style.background = 'url(tile_bg.jpg) no-repeat';
        tile_2.innerHTML = "";
        // Clear both arrays
        memory_value2 = '';
        memory_tile_ids[i + 1] = [];
    }

    setTimeout(flip2Back, 700);

    socket.emit('wrong', {wrongposition: wrongposition, roomnumber: currentRoom, currentscore: myScore});

}

function correct() {
    var cardposition = 2;
    if (memory_value1 == memory_value2) {
        tiles_flipped += 2;
        // Clear both arrays
        memory_value1 = '';
        memory_value2 = '';
        correctposition = memory_tile_ids;
        memory_tile_ids = [];
    }
// if player match correct card use this method
    socket.emit('correct', {correctposition: correctposition, roomnumber: currentRoom, currentscore: myScore});
}

socket.on('correntposition', function (data) {
    //OPPONENT CHOSE CORRECT CARD
    //SHOW CORRECT POSITION
    var opponentcorrectposition = data.correctposition;
});

socket.on('gameend', function (data) {
    if (data.result == 'win') {
        //DISPLAY YOU'RE WIN
        //SHOW SCORE OF BOTH PLAYER
    }
    if (data.result == 'lose') {
        //DISPLAY OPPONENT WIN
        //SHOW SCORE OF BOTH PLAYER
    }
    if (data.result == 'draw') {
        //DISPLAYER DRAW
        //SHOW SCORE OF BOTH PLAYER
    }
}); // GAME END --> DO SOMETHING , SHOW

function continueGame() { //AFTER
    socket.emit('continue', {roomnumber: currentRoom});
}


socket.on('updateOpponentScore', function (data) { //THIS METHOD IS CALLED ON EVERY WRONG,CORRECT CARD SELECTION
    opponentScore = data.opponentScore;
});
//FRONTEND --> UPDATE OPPONENTSCORE


//////////////////////////////////

function wait(sec){
    var countTurn = sec;
    var counter = setInterval(timer,1000);
    function timer(){
        console.log(countTurn+"second left");
        countTurn = countTurn-1;
        if(countTurn<=0){
            clearInterval(counter);
            return;
        }
    }
}
// // TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER
// var countTurn = 11;
// var counter = setInterval(timer, 1000); //1000 will run it every 1 second
// function timer() {
//     countTurn = countTurn - 1;
//     if (countTurn <= 0) {
//         clearInterval(counter);
//
//         //counter ended, do something here
//         return;
//     }
//     document.getElementById("timeTurn").innerHTML = countTurn + " seconds"; // watch for spelling
// }