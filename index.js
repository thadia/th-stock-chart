var server = require('express');
var request = require('request');
var port = process.env.PORT || 3500;
var app = server();
app.use(server.static(__dirname + '/public'));
app.use('/bower_components', server.static(__dirname + '/bower_components'));
app.use('/client', server.static(__dirname + '/client'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var mongoose = require('mongoose');
var Promise = require('es6-promise').Promise;
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectID;
 

// API Key: MMk5vnfEYNykynsDCYXy
// https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json
// http://socket.io/get-started/chat/

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
}); 


 

app.listen(port, function(){ 
  console.log('Ready: ' + port);
  });
 
app.get('/find/:stockanme', function(req, res) {
  
  
});


app.get('/', function(req, res) {
        var fileName = path.join(__dirname, '/client/stocks.html');
        res.sendFile(fileName, function (err) {
          if (err) {
            console.log(err);
            res.status(err.status).end();
          }
          else {
            console.log('Sent:', fileName);
          }
        });
}); 


app.get('/stockdata/all', function(req, res) {
 

});



  
  