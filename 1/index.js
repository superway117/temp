// Generated by CoffeeScript 1.4.0
(function() {
  var Server, StockServices;

  Server = require('./Server').Server;

  StockServices = require('./StockServices').StockServices;

  StockServices.init();

  Server.start();

}).call(this);
