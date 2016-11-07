/**
 * Created by veryhotsos on 10/28/2016.
 */
var socket = io();

var memory_array = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H', 'I', 'I', 'J', 'J', 'K', 'K', 'L', 'L', 'M', 'M', 'N', 'N', 'O', 'O', 'P', 'P', 'Q', 'Q', 'R', 'R'];
var memory_values = [];
var memory_tile_ids = [];
var tiles_flipped = 0;
var status_array = ["Waiting for player...", "Player Full. Ready to initiate self-destruct sequence in 5 seconds", "'s Turn"];


////////////////////////////
var myName = ''; //link with text box
var myScore = 0;
var myID = '';
var opponentName = '';
var opponentId = '';
var opponentScore = '';
var currentRoom;
var initialcardposition = [];

////////////////////////////


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

$(function () {
    var $window = $(window);
    var $loginPage = $('.login.page'); //login page
    var $appPage = $('.app.page'); // main game page

    $("body").hide().show("slow");

    Array.prototype.memory_tile_shuffle = function () {
        var i = this.length, j, temp;
        while (--i > 0) {
            j = Math.floor(Math.random() * (i + 1));
            temp = this[j];
            this[j] = this[i];
            this[i] = temp;
        }
    }

    function showCards() {
        for (var i = 0; i < board.length; i++) {
            board[i].face = 'up';
        }
        updateGameBoard();
    }

    function hideCards() {
        for (var i = 0; i < board.length; i++) {
            board[i].face = 'down';
        }
        updateGameBoard();
    }

    function updateGameBoard() {
        var output = '';
        for (var i = 0; i < board.length; i++) {
            if (board[i].face === 'down') {
                output += '<div class="tile" id="' + i + '" onclick="cardSelectedEvent(this,\'' + board[i].id + '\',\'' + i + '\')"></div>';
            } else {
                output += '<div class="tile">' + board[i].id + '</div>';
            }
        }
        document.getElementById('game_board').innerHTML = output;
    }


    function showScore() {
        document.getElementById('my_score').innerHTML = '<h3 class="infoText">' + playerScore + '</h3>' + '<p class="subInfoText">' + playerName + '</p>';
        document.getElementById('opp_score').innerHTML = '<h3 class="infoText">' + opponentScore + '</h3>' + '<p class="subInfoText">' + opponentName + '</p>';
    }

    function setOpponent(opp) {
        opponentName = opp.name;
        opponentID = opp.id;
        showScore();
    }

    function updateOpponentScore(score) {
        opponentScore = score;
        showScore();
    }

    function switchTurn() {
        if (turn === true) {
            turn = false;
            displayTurn = "Opponent's turn";
        } else {
            turn = true;
            displayTurn = "Your turn";
        }
        timer = 10;
        displayTime();
    }

    function displayTime() {
        document.getElementById('time_display').innerHTML = '<h3 class="timeText">' + timer + '</h3>' + '<p class="turnText">' + displayTurn + '</p>';
    }

    //////////////////////////////////////////////////////////////////////////////

    function submitName() {
        // --> after click , disable button
//
//        myName = elem.value;
//        var id    = elem.id;
//        if (value === ""){
//            alert("Enter your name!")
//        }else{
//            alert("Welcome "+ myName +"!! to the card matching game.")

        var name = document.getElementById('username').value;
        socket.emit('joingame', {name: name}); // change player name to playername from login box later
        document.getElementById('submitbutton').disabled = "disabled";
    }

    socket.on('roominfo', function (data) {
        currentRoom = data.roomnumber;
        if (socket.id == data.roomdata.player1.id) {
            opponentName = data.roomdata.player2.name;
            opponentId = data.roomdata.player2.id;
        }
        else {
            opponentName = data.roomdata.player1.name;
            opponentId = data.roomdata.player1.id;
        }
    });

    function readytoplay() {
        // PRESS READY AFTER NAME SUBMISSION
        socket.emit('readytoplay', {roomnumber: currentRoom});
    }

    socket.on('gamestart', function (data) {

        function newBoard() {
            tiles_flipped = 0;
            var output = '';
            memory_array.memory_tile_shuffle();
            for (var i = 0; i < memory_array.length; i++) {
                output += '<div id="tile_' + i + '" onclick="memoryFlipTile(this,\'' + memory_array[i] + '\')"></div>';
            }
            document.getElementById('memory_board').innerHTML = output;
        }

        //////////////////////////////

        initialcardposition = data.initialcardposition;
        var turn = data.turn; // CHECK IF YOU ARE PLAYER 1 or PLAYER 2 ( player1 play first card )
        //CARD POSITION FROM SERVER
        // SHOW ALL CARD 10 SEC
        board = newboard;
        playerScore = 0;
        opponentScore = 0;
        timer = 10;
        $loginPage.fadeOut();
        $appPage.fadeIn();
        showCards();
        showScore();
        displayTime();
        setTimeout(hideCards, 10000);


    });
    if (turn == 'play') {

        //PLAYFIRSTCARD
    }
    if (turn == 'wait') {
        //WAITFIRSTCARD
    }
});

socket.on('playfirstcard', function () {

    //ACTION WHEN PLAYER ASSIGNED TO PLAY FIRST CARD
});

socket.on('waitfirstcard', function () {
    //ACTION WHEN PLAYER ASSIGNED TO WAIT FIRST CARD
});

function firstcardselected() {
    var cardposition = 5; //change position later
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

    socket.emit('wrong', {wrongposition: wrongposition, roomnumber: currentRoom, currentscore: myScore});

}

function correct() {
    var cardposition = 2;
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

})

//////////////////////////////////


function memoryFlipTile(tile, val) {
    if (tile.innerHTML == "" && memory_values.length < 2) {
        tile.style.background = '#FFF';
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


// TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER TURN TIMER
var countTurn = 11;
var counter = setInterval(timer, 1000); //1000 will run it every 1 second
function timer() {
    countTurn = countTurn - 1;
    if (countTurn <= 0) {
        clearInterval(counter);

        //counter ended, do something here
        return;
    }
    document.getElementById("timeTurn").innerHTML = countTurn + " seconds"; // watch for spelling
}