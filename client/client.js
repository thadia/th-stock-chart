
var myApp = angular.module('myApp',[]);
myApp.factory('names_list', function($http){
   return $http.get("/stocks/mylist/all/names");
});    
    
//var socket = io();

myApp.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});


myApp.controller('mainController', function($scope, $http, $window,names_list, socket) {
        
    names_list.success(function(data) {
       $scope.name_list=data;
       $scope.name_list_2=data;    

       console.log(data + " Data");
       var seriesOptions = [],
           seriesCounter = 0,
           names=data; 
        
    function createChart() {

        $('#container').highcharts('StockChart', {
            rangeSelector: {
                selected: 4
            },
            title: {
                text: 'STOCKS'
            },
            yAxis: {
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: {
                    compare: 'percent'
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2
            },
            series: seriesOptions
        });
    }

    if(names.length <=0){
         createChart();
    }
    
    else {
        $.each(names, function (i, name) {
       //https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?order=asc&column_index=4&collapse=daily&transformation=none&start_date=2014-01-01&api_key=MMk5vnfEYNykynsDCYXy
       
       var start_date=new Date();
       start_date.setFullYear(start_date.getFullYear() - 1);
    
        $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?order=asc&column_index=4&collapse=daily&transformation=none&api_key=MMk5vnfEYNykynsDCYXy&start_date='+start_date.toISOString().slice(0, 10), function (data) {
         console.log(name+ " Reading from database;");   
            for(var j=0;j<data.dataset.data.length;j++){
                data.dataset.data[j][0]=Date.parse(data.dataset.data[j][0]);
            }
            seriesOptions[i] = {
                name: name,
                data: data.dataset.data
            };
            // https://www.highcharts.com/samples/data/jsonp.php?filename=msft-c.json&callback=jQuery31006323779385139796_1470527146017&_=1470527146018
            // As we're loading the data asynchronously, we don't know what order it will arrive. So
            // we keep a counter and create the chart when all the data is loaded.
            seriesCounter += 1;
            if (seriesCounter === names.length) {
                createChart();
            }
        });
    });
    } 
    
    });    
    /**
     * Create the chart when all data is loaded
     * @returns {undefined}
     */
     
     
    socket.on('add:stock', function (data) {
        $scope.addStock(data.stock_name);
     });
     
     
     $scope.changeName = function () {
            socket.emit('add:stock', {
              name: $scope.stock_name
            }, function (result) {
              if (!result) {
                alert('There was an error changing your name');
              } else {
                $scope.addStock($scope.stock_name);
              }
            });
     };

     
     
     
     $scope.addStock = function(stock_name){
         
         
         //check if valid code
       $scope.getAll();
       console.log($scope.name_list  +" LOG ADD " +$scope.name_list);
        
       if($scope.name_list.length !== 0 && $scope.name_list.lastIndexOf(stock_name.toUpperCase()) != -1){
                 alert("You have submitted a duplicate code.");
               //   $('li').filter(function() { return $.text([this]) === stock_name.toUpperCase(); }).remove();
                     
         }   
        
        
        else {  //
                 var url_check="https://www.quandl.com/api/v3/datasets/WIKI/"+stock_name+"/metadata.json?api_key=MMk5vnfEYNykynsDCYXy";
                 $.getJSON(url_check, function(data) {

                   $http.get("/add/mylist/"+ stock_name)
                    .then(function (response) {
                           var chart = $('#container').highcharts();
                           if (chart.series.length >= 0) {
                               
                               var start_date=new Date();
                               start_date.setFullYear(start_date.getFullYear() - 1);
                               var url = 'https://www.quandl.com/api/v3/datasets/WIKI/'+stock_name.toUpperCase()+'.json?order=asc&column_index=4&collapse=daily&transformation=none&api_key=MMk5vnfEYNykynsDCYXy&start_date='+start_date.toISOString().slice(0, 10);
                               $.getJSON(url, function (data)  {
  
                                    for(var j=0;j<data.dataset.data.length;j++){
                                         data.dataset.data[j][0]=Date.parse(data.dataset.data[j][0]);
                                         }
                                           
                                    chart.addSeries({
                                        name: stock_name.toUpperCase(),
                                        data: data.dataset.data
                                    });
                                     
                                    console.log(stock_name + " STOCK ADDED TO CHART");
                                    $scope.getAll();
                                   
                                   
                               });
                            }
                    });
                    
                    }).fail(function(jqXHR) {
                        if (jqXHR.status == 404) {
                            alert("You have submitted an incorrect stock code. Please check your stock codes and try again.");
                            $('li').filter(function() { return $.text([this]) === stock_name.toUpperCase(); }).remove();
                            $scope.getAll();

                        } else {
                            alert("Other non-handled error type");
                        }
                    });
                    
                
        // else {
         //   alert("You have submitted an duplicate. The code is already on the chart.");
          //   $('li').filter(function() { return $.text([this]) === stock_name; }).remove();   
       //  }     
         
         }  //
         
           
         //}    
            
      }         
      
     $scope.getAll = function(){
         $http.get("/stocks/mylist/all/names")
            .then(function (response) {
            $scope.name_list = response.data;

         });
           
     }
     
     $scope.getAll2 = function(){
         $http.get("/stocks/mylist/all/names")
            .then(function (response) {
            $scope.name_list_2 = response.data

         });
           
     }
      
     $scope.removeOne = function(stock_name){
         $scope.getAll();
         console.log("REMOVING");
         
         $http.get("/remove/mylist/"+ stock_name)
            .then(function (response) {
                var chart = $('#container').highcharts();
                    if (chart.series.length) {
                        for(var i=0;i<chart.series.length;i++){
                            if(chart.series[i].name == stock_name){
                                console.log(chart.series[i].name+ " was removed ");
                                chart.series[i].remove();
                            }
                        }
                    }
         });
        $scope.getAll();
        console.log($scope.name_list  +" LOG DELETE " +$scope.name_list);
     }    
}); 


 window.onload=function(){
     $(function(){
         if(window.location.protocol==="https:")
             window.location.protocol="http";
     });
 }



 






