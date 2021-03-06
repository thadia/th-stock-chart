
var port = process.env.PORT || 3500;
var ip =  process.env.IP || '0.0.0.0';

var express = require('express');  
var app = express();  
var server = require('http').Server(app);  
//var io = require('socket.io')(server);
var io = require('socket.io')(server);
 

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/client', express.static(__dirname + '/client'));
app.use('/socket.io-client', express.static(__dirname + '/socket.io-client'));

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

server.listen(port,ip);

var path = require('path');
var mongoose = require('mongoose');
var Promise = require('es6-promise').Promise;
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectID;
 
// API Key: 
// https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json
// http://socket.io/get-started/chat/

var StocksSchema = new Schema({
    stock_table : { type: String, required: true, trim: true },
    stock_names: { type: Array, required: false, trim: true}
});

var Stock = mongoose.model('Stock',StocksSchema);

mongoose.connect('mongodb://pass:user@db:port/current_stocks_db');
 
 io.on('connection', function(socket) {
      console.log('new connection ' + socket);
    
      socket.on('remove:stock', function(stock_list,stock_name) {
         console.log(' removing ');
             //io.emit('notification', {
             io.emit('notification from server:remove',stock_list,stock_name);
             //{
              // name_list: stock_list
            //});
      });
      
      socket.on('update:stock', function(stock_list) {
         console.log(' refreshing ');
             io.emit('notification from server',stock_list);
      });
      
      socket.on('add:stock', function(stock_list,stock_name) {
         console.log(' adding ');
             io.emit('notification from server:add',stock_list,stock_name);
      });
      
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

app.get('/stocks/:mylist/all/names', function(req, res) {
  
      Stock.find({stock_table: req.params.mylist.toUpperCase()}, '-_id',{},function(err, latest_data) {
        if (err) return console.error(err);
        else{
          //console.log("latest_data " + latest_data);
          res.json(latest_data[0].stock_names);
          //data=latest_data[0].stock_names;
        }
    });

});

app.get('/stocks/showall', function(req, res) {
  
      Stock.find({}, '-_id',{},function(err, latest_data) {
        if (err) return console.error(err);
        else{
          //console.log("latest_data " + latest_data);
          res.json(latest_data);
        }
    });

});

app.get('/add/:mylist/:stockname', function(req, res) {
  
      Stock.find({stock_table: req.params.mylist.toUpperCase()},  {},function(err, latest_data) {
        if (err) return console.error(err);
        else{
          console.log("Found table: " + req.params.mylist.toUpperCase());
          console.log("Searching for "+ req.params.stockname.toUpperCase());
          console.log(latest_data + " object found " +  latest_data[0].stock_names);
          if(latest_data[0].stock_names.lastIndexOf(req.params.stockname.toUpperCase()) == -1){
               console.log("Adding " +req.params.stockname.toUpperCase()+ " to " +req.params.mylist.toUpperCase());
               latest_data[0].stock_names.push(req.params.stockname.toUpperCase());
               latest_data[0].save( function(error, latest_data){
                       if(error){
                          console.log(error);
                       }
                       else{
                          res.send(latest_data); 
                          console.log(req.params.mylist.toUpperCase() +  " data is saved.");
                       }
                });       
          }
          else {
            console.log("Already existing: " +req.params.stockname.toUpperCase()+ " in " +req.params.mylist.toUpperCase());
            res.send(latest_data);   
          }
        }
     });
});

app.get('/remove/:mylist/:stockname', function(req, res) {
  
      Stock.find({stock_table: req.params.mylist.toUpperCase()},  {},function(err, latest_data) {
        if (err) return console.error(err);
        else{
          console.log("Found table: " + req.params.mylist.toUpperCase());
          console.log("Searching for "+ req.params.stockname.toUpperCase());
          console.log(latest_data + " object found " +  latest_data[0].stock_names);
          if(latest_data[0].stock_names.lastIndexOf(req.params.stockname.toUpperCase()) != -1){
               console.log("Removing " +req.params.stockname.toUpperCase()+ " to " +req.params.mylist.toUpperCase());
               latest_data[0].stock_names.splice(latest_data[0].stock_names.indexOf(req.params.stockname.toUpperCase()),1);
               latest_data[0].save( function(error, latest_data){
                       if(error){
                          console.log(error);
                       }
                       else{
                          res.send(latest_data); 
                          console.log(req.params.mylist.toUpperCase() +  " data is saved.");
                       }
                });       
          }
          else {
            console.log("Not found: " +req.params.stockname.toUpperCase()+ " in " +req.params.mylist.toUpperCase());
            res.send(latest_data);   
          }
        }
     });
});
  
app.get('/add/:stockdatabase', function(req, res) {
  
      Stock.findOne({ stock_table: req.params.stockdatabase.toUpperCase()}, function(err, stock){ 
               if(stock){   
                 console.log(stock + " Already in the database.");
               }   
               else{
                   console.log("Adding to the database.");
                   var newStock = new Stock ( {
                       stock_table: req.params.stockdatabase.toUpperCase(),
                       stock_names: []
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

app.get('/remove/:stockdatabase', function(req, res) {
  
      Stock.findOne({ stock_table: req.params.stockdatabase.toUpperCase()}, function(err, stock){ 
               if(stock){   
                 console.log(stock + " Already found. Ready to remove.");
                 Stock.remove({stock_table: req.params.stockdatabase.toUpperCase() }, function(err) {
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