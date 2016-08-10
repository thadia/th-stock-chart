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


var StocksSchema = new Schema({
    stock_symbol : { type: String, required: true, trim: true }
});

var Stock = mongoose.model('Stock',StocksSchema);

mongoose.connect('mongodb://stocks_user:db_user_stocks@ds153735.mlab.com:53735/current_stocks_db');

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


app.get('/add/:stockname', function(req, res) {
  
      Stock.findOne({ stock_symbol: req.params.stockname.toUpperCase()}, function(err, stock){ 
               if(stock){   
                 console.log(stock + " Already in the database.");
               }   
               else{
                   console.log("Adding to the database.");
                   var newStock = new Stock ( {
                       stock_symbol: req.params.stockname.toUpperCase()
                   });
                                                 
                   newStock.save( function(error, data){
                       if(error){
                          console.log(error);
                       }
                       else{
                          res.send(newStock); 
                          console.log(newStock +  " data is saved.");
                       }
                    });
               } 
              
               if (err) { console.log('error on save_update');}
                 
});
  
});


app.get('/remove/:stockname', function(req, res) {
  
      Stock.findOne({ stock_symbol: req.params.stockname.toUpperCase()}, function(err, stock){ 
               if(stock){   
                 console.log(stock + " Already found. Ready to remove.");
                 Stock.remove({stock_symbol: req.params.stockname.toUpperCase() }, function(err) {
                 if (!err) {
                    console.log('Notification removing!');
                    }
                    else {
                    console.log('Error on removing');
                    }
                 });  
                    res.redirect('/');      
               }   
               else{
                   console.log("Not found in the database.");
               } 
              
               if (err) { console.log('error on save_update');}
                 
});
  
});

app.get('/stocks/all', function(req, res) {
  
      Stock.find({}, '-_id',{},function(err, latest_data) {
        if (err) return console.error(err);
        else{
          //console.log("latest_data " + latest_data);
          res.json(latest_data);
        }
});

});



  
  