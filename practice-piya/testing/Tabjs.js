$(document).ready(function () {
    $('.TreeTable tr').click(function (e) {
        var cell = $(e.target).get(0);
        var tr = $(this);
//$('#out').empty();
        $('td', tr).each(function (i, td) {
//$('#out').html($('#out').html()+'<br>'+i+': '+$(td).text() + (td===cell?' [clicked]':'') );
            cell.append('<label id=i>5</label>')
            console.log("LOL");
        });

    });
});

var table = document.getElementsByClassName("TreeTable");
for (var i = 0, row; row = table.rows[i]; i++) {
//iterate through rows
//rows would be accessed using the "row" variable assigned in the for loop
    for (var j = 0, col; col = row.cells[j]; j++) {
//iterate through columns
//columns would be accessed using the "col" variable assigned in the for loop
    }
}
/**
 * Created by veryhotsos on 11/2/2016.
 */
