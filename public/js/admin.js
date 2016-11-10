/**
 * Created by Nattapon on 11/9/2016 AD.
 */
var currentRoom;
var socket = io();
function reset() { //AFTER PRESS reset
    currentRoom = 1; //SET THIS LATER
    socket.emit('resetFromServer', {roomnumber: currentRoom});

}

function showPlayers(){
    socket.emit('getNumberOfPlayers');
}
socket.on('numberOfPlayers',function(data){
    console.log('recieve number of players');
    $('#playerAmount').text('Number Of Connected Player :'+data.numberofplayers);



});
