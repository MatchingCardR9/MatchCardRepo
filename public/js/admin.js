/**
 * Created by Nattapon on 11/9/2016 AD.
 */
var currentRoom;
var socket = io();
function reset() { //AFTER PRESS reset
    currentRoom = 1; //SET THIS LATER
    socket.emit('resetFromServer', {roomnumber: currentRoom});

}