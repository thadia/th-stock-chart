
var myApp = angular.module('myApp',[]);
//var socket = io();

myApp.controller('mainController', function($scope, $http, $window) {
    
    
        
    var seriesOptions = [],
        seriesCounter = 0,
        names = ['MSFT', 'AAPL', 'GOOG'];

    /**
     * Create the chart when all data is loaded
     * @returns {undefined}
     */
    function createChart() {

        $('#container').highcharts('StockChart', {

            rangeSelector: {
                selected: 4
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

    $.each(names, function (i, name) {
        //   https://www.quandl.com/api/v3/datasets/WIKI/AAPL.json?order=asc&column_index=4&collapse=daily&transformation=rdiff

        $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?order=asc&column_index=4&collapse=daily&transformation=rdiff',    function (data) {

            seriesOptions[i] = {
                name: name,
                data: data.dataset.data
            };
            
            console.log(data.dataset.data + " Data format.");
            console.log(JSON.parse(seriesOptions[0]) + " Data format 2.");

            // https://www.highcharts.com/samples/data/jsonp.php?filename=msft-c.json&callback=jQuery31006323779385139796_1470527146017&_=1470527146018

            // As we're loading the data asynchronously, we don't know what order it will arrive. So
            // we keep a counter and create the chart when all the data is loaded.
            seriesCounter += 1;

            if (seriesCounter === names.length) {
                createChart();
            }
        });
    });
     
    
    
    
    
     $scope.getPeopleList = function(barName){
        
         
          
     } 
     
    
     $scope.searchMyLocation = function(){
                
        
     }
     
     $scope.getAll = function(){
           
        
     }
         
      
     
     
      
    
}); 


 window.onload=function(){
     $(function(){
         if(window.location.protocol==="https:")
             window.location.protocol="http";
     });
 }



 






