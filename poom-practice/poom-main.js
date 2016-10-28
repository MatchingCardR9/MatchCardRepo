/**
 * Created by Poom2 on 10/21/2016.
 */
var http = require("http");
var express = require("express");
var app = express();
var path = require('path');

app.get('/',function(req,res){
 //   res.sendFile(path.join(__dirname+'/moomin.png'));
  res.sendFile(path.join(__dirname+'/poom-test001.html'));
});
app.use(express.static(__dirname+'/public'));

app.listen(8081);
// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');