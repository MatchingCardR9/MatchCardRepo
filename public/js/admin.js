/**
 * Created by Nattapon on 11/9/2016 AD.
 */

function reset() { //AFTER PRESS CONTINUE
    socket.emit('resetFromServer', {roomnumber: currentRoom});

