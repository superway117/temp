// Generated by CoffeeScript 1.4.0
(function() {
  var RequestHandler;

  RequestHandler = (function() {

    function RequestHandler() {}

    RequestHandler.appendHandle = function(handle) {
      var _ref;
      if ((_ref = this.handlers) == null) {
        this.handlers = [];
      }
      return this.handlers.push(handle);
    };

    RequestHandler.getHandlers = function() {
      return this.handlers;
    };

    return RequestHandler;

  })();

  exports.RequestHandler = RequestHandler;

}).call(this);