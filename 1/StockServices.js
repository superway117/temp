// Generated by CoffeeScript 1.4.0
(function() {
  var $, RequestHandler, StockDict, StockServices, csv, http, sys;

  http = require('follow-redirects').http;

  sys = require('sys');

  csv = require('csv');

  $ = require('jquery');

  StockDict = require('./StockDict').StockDict;

  RequestHandler = require('./RequestHandler').RequestHandler;

  StockServices = (function() {

    function StockServices() {}

    StockServices.init = function() {
      return RequestHandler.appendHandle({
        category: "/stock",
        route: this.route
      });
    };

    StockServices.route = function(req, res, params) {
      var subroute;
      if (!params.api) {
        StockServices.outputError(res, params, "wrong api");
        return;
      }
      subroute = StockServices.handles[params.api];
      if (subroute) {
        if (StockServices[subroute[1]](params)) {
          return StockServices[subroute[0]](req, res, params);
        } else {
          return StockServices.outputError(res, params, "wrong parameters");
        }
      }
    };

    StockServices.handles = {
      gethistory: ["getHistory", "checkHistoryParam"],
      getlast: ["getLast", "checkLastParam"],
      getquotes: ["getQuotes", "checkQuotesParam"],
      getfunds: ["getFunds", "checkFundsParam"]
    };

    StockServices.outputError = function(res, params, message) {
      var result;
      result = {};
      result["status"] = "error";
      result["reason"] = message;
      return res.sendJSONP(params.callback, result);
    };

    StockServices.get = function(res, params, url, callback) {
      return http.get(url, function(response) {
        var pageData;
        pageData = "";
        response.on('data', function(chunk) {
          return pageData += chunk;
        });
        return response.on('end', function() {
          return callback(res, params, pageData);
        });
      }).on('error', function(e) {
        return StockServices.outputError(res, params, e.message);
      });
    };

    StockServices.canonicalYahoo = function(stock) {
      if (stock.lastIndexOf('.') === -1) {
        if (stock.charAt(0) === '6') {
          return stock += ".SS";
        } else {
          return stock += ".SZ";
        }
      } else {
        return stock;
      }
    };

    StockServices.checkHistoryParam = function(params) {
      if (!params.s) {
        return false;
      }
      if (!(params.a && params.b && params.c)) {
        return false;
      }
      if (params.d) {
        if (!(params.e && params.f)) {
          return false;
        }
      }
      params["yahoo"] = this.canonicalYahoo(params.s);
      return true;
    };

    StockServices.getHistory = function(req, res, params) {
      var url;
      if (typeof console !== "undefined" && console !== null) {
        console.log("------------getHistory---------------");
      }
      if (params.d) {
        url = "http://ichart.finance.yahoo.com/table.csv?s=" + params.yahoo + "                    &d=" + params.d + "&e=" + params.e + "&f=" + params.f + "&g=d                    &a=" + params.a + "&b=" + params.b + "&c=" + params.c + "&ignore=.csv";
      } else {
        url = "http://ichart.finance.yahoo.com/table.csv?s=" + params.yahoo + "                    &a=" + params.a + "&b=" + params.b + "&c=" + params.c + "&ignore=.csv";
      }
      return StockServices.get(res, params, url, StockServices.parseHistoryData);
    };

    StockServices.parseHistoryData = function(res, params, pageData) {
      var result,
        _this = this;
      result = {};
      result["status"] = "succ";
      result["list"] = [];
      return csv().from(pageData).transform(function(line) {
        line.unshift(line.pop());
        return line;
      }).on("record", function(line, index) {
        var output;
        if (index > 0) {
          output = {};
          output["adjclose"] = line[0];
          output["date"] = line[1];
          output["open"] = line[2];
          output["high"] = line[3];
          output["low"] = line[4];
          output["close"] = line[5];
          output["volume"] = line[6];
          return result.list.push(output);
        }
      }).on("end", function(count) {
        return res.sendJSONP(params.callback, result);
      }).on("error", function(error) {
        return _this.outputError(res, params, e.message);
      });
    };

    StockServices.canonicalSina = function(stock) {
      var id, site;
      if (stock.length < 6) {
        return;
      }
      id = stock.slice(0, 6);
      if (stock.length === 9) {
        site = stock.slice(7, 9).toLowerCase();
        if (id === '000001' && site === 'ss') {
          return "s_sh000001";
        }
        if (id === '399001') {
          return "s_sz399001";
        }
      }
      if (stock.charAt(0) === '6') {
        return "sh" + id;
      } else {
        return "sz" + id;
      }
    };

    StockServices.canonicalGoog = function(stock) {
      var id, site;
      if (stock.length < 6) {
        return;
      }
      id = stock.slice(0, 6);
      if (stock.length === 9) {
        site = stock.slice(7, 9).toLowerCase();
        if (id === '000001' && site === 'ss') {
          return "SHA:" + id;
        }
      }
      if (stock.charAt(0) === '6') {
        return "SHA:" + id;
      } else {
        return "SHE:" + id;
      }
    };

    StockServices.checkLastParam = function(params) {
      var item, list;
      if (!params.s) {
        return false;
      }
      list = params.s.split(" ");
      params["sina"] = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          item = list[_i];
          _results.push(this.canonicalSina(item));
        }
        return _results;
      }).call(this);
      return true;
    };

    StockServices.getLast = function(req, res, params) {
      var sinaurl;
      if (typeof console !== "undefined" && console !== null) {
        console.log("------------getLast---------------");
      }
      sinaurl = "http://hq.sinajs.cn/list=" + params.sina;
      return StockServices.get(res, params, sinaurl, StockServices.parseSinaLastData);
    };

    StockServices.parseSinaLastData = function(res, params, pageData) {
      var compose_list, index, item, list, origin_id, re, record, result, stockRe, _i, _len;
      result = {};
      result["status"] = "succ";
      result["list"] = [];
      re = /\"(.*)\"/ig;
      list = pageData.match(re);
      stockRe = /(\d{6})$/ig;
      for (index = _i = 0, _len = list.length; _i < _len; index = ++_i) {
        item = list[index];
        record = {};
        item = item.split(",");
        origin_id = params.sina[index];
        record["id"] = origin_id.match(stockRe)[0];
        if (origin_id === "s_sh000001" || origin_id === "s_sz399001") {
          compose_list = {
            "s_sh000001": "上证指数",
            "s_sz399001": "深成指"
          };
          record["name"] = compose_list[origin_id];
          record["price"] = item[1];
          record["chg"] = item[2];
          record["chgPre"] = item[3];
          record["volume"] = item[4];
          if (typeof console !== "undefined" && console !== null) {
            console.log(item[5]);
          }
          record["volMoney"] = item[5];
        } else {
          record["name"] = StockDict[record["id"]];
          record["open"] = item[1];
          record["preclose"] = item[2];
          record["price"] = item[3];
          record["high"] = item[4];
          record["low"] = item[5];
          record["buy1"] = item[6];
          record["sell1"] = item[7];
          record["volume"] = item[8];
          record["volMoney"] = item[9];
          record["buy1Num"] = item[10];
          record["buy2Num"] = item[12];
          record["buy2"] = item[13];
          record["buy3Num"] = item[14];
          record["buy3"] = item[15];
          record["buy4Num"] = item[16];
          record["buy4"] = item[17];
          record["buy5Num"] = item[18];
          record["buy5"] = item[19];
          record["sell1Num"] = item[20];
          record["sell2Num"] = item[22];
          record["sell2"] = item[23];
          record["sell3Num"] = item[24];
          record["sell3"] = item[25];
          record["sell4Num"] = item[26];
          record["sell4"] = item[27];
          record["sell5Num"] = item[28];
          record["sell5"] = item[29];
          record["date"] = item[30];
          record["time"] = item[31];
        }
        result["list"].push(record);
      }
      if (typeof console !== "undefined" && console !== null) {
        console.log("------------parseSinaLastData---------------");
      }
      return res.sendJSONP(params.callback, result);
    };

    StockServices.checkQuotesParam = function(params) {
      var item, list;
      if (!params.s) {
        return false;
      }
      list = params.s.split(" ");
      params["yahoo"] = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          item = list[_i];
          _results.push(this.canonicalYahoo(item));
        }
        return _results;
      }).call(this);
      return true;
    };

    StockServices.getQuotes = function(req, res, params) {
      var stocks, url;
      if (typeof console !== "undefined" && console !== null) {
        console.log("------------getQuotes---------------");
      }
      stocks = params.yahoo.join("+");
      url = "http://finance.yahoo.com/d/quotes.csv?s=" + stocks + "&f=sd1ejkj5j6k4k5m3m4m5m6m7m8rr2";
      return StockServices.get(res, params, url, StockServices.parseYahooQuotesData);
    };

    StockServices.parseYahooQuotesData = function(res, params, pageData) {
      var result,
        _this = this;
      result = {};
      result["status"] = "succ";
      result["list"] = [];
      return csv().from(pageData).transform(function(line) {
        return line;
      }).on("record", function(line, index) {
        var output;
        output = {};
        output["id"] = line[0].slice(0, 6);
        output["name"] = StockDict[output["id"]];
        output["date"] = line[1];
        output["shares"] = line[2];
        output["low52"] = line[3];
        output["high52"] = line[4];
        output["chgLow52"] = line[5];
        output["chgPreLow52"] = line[6];
        output["chgHigh52"] = line[7];
        output["chgPreHigh52"] = line[8];
        output["movAvg50"] = line[9];
        output["movAvg200"] = line[10];
        output["chgMovAvg200"] = line[11];
        output["chgPreMovAvg200"] = line[12];
        output["chgMovAvg50"] = line[13];
        output["chgPreMovAvg50"] = line[14];
        output["pe"] = line[15];
        output["dpe"] = line[16];
        return result.list.push(output);
      }).on("end", function(count) {
        return res.sendJSONP(params.callback, result);
      }).on("error", function(error) {
        return _this.outputError(res, params, e.message);
      });
    };

    StockServices.canonicalIfeng = function(stock) {
      var id;
      if (stock.length < 6) {
        return;
      }
      id = stock.slice(0, 6);
      if (stock.charAt(0) === '6') {
        return "sh" + id;
      } else {
        return "sz" + id;
      }
    };

    StockServices.checkFundsParam = function(params) {
      if (!params.s) {
        return false;
      }
      if (params.a) {
        if (!(params.b && params.c)) {
          return false;
        }
      }
      if (params.d) {
        if (!(params.e && params.f)) {
          return false;
        }
      }
      params["ifeng"] = this.canonicalIfeng(params.s);
      return true;
    };

    StockServices.getFunds = function(req, res, params) {
      var ifengurl;
      if (typeof console !== "undefined" && console !== null) {
        console.log("------------getFunds---------------");
      }
      ifengurl = "http://app.finance.ifeng.com/data/stock/tab_zjlx.php?code=" + params.ifeng;
      if (params.a) {
        ifengurl += "&begin_day=" + params.c + "-" + params.a + "-" + params.b;
      }
      if (params.d) {
        ifengurl += "&end_day=" + params.f + "-" + params.d + "-" + params.e;
      }
      if (typeof console !== "undefined" && console !== null) {
        console.log(ifengurl);
      }
      return StockServices.get(res, params, ifengurl, StockServices.parseIfengFundsData);
    };

    StockServices.parseIfengFundsData = function(res, params, pageData) {
      var $domData, $last, $record, $records, i, index, item, length, result, _i, _ref;
      result = {};
      result["status"] = "succ";
      result["list"] = [];
      $domData = $(pageData);
      $records = $domData.find("table.lable_tab01 tbody tr");
      length = $records.size();
      if (length <= 2) {
        console.log("catch error");
        StockServices.outputError(res, params, "query length cant exceed 120 days");
        return;
      }
      for (index = _i = 1, _ref = length - 2; 1 <= _ref ? _i <= _ref : _i >= _ref; index = 1 <= _ref ? ++_i : --_i) {
        $record = $($records.get(index)).find("td");
        i = 0;
        item = {};
        item["date"] = $($record.get(i++)).text();
        item["total"] = parseFloat($($record.get(i++)).text());
        item["stotal"] = parseFloat($($record.get(i++)).text());
        item["mtotal"] = parseFloat($($record.get(i++)).text());
        item["ltotal"] = parseFloat($($record.get(i++)).text());
        item["sltotal"] = parseFloat($($record.get(i++)).text());
        item["volume"] = parseFloat($($record.get(i++)).text());
        item["growth"] = $($record.get(i++)).text();
        result.list.push(item);
      }
      $last = $($records.get(length - 1)).find("td");
      i = 1;
      result["summary"] = {};
      result.summary["total"] = parseFloat($($last.get(i++)).text());
      result.summary["stotal"] = parseFloat($($last.get(i++)).text());
      result.summary["mtotal"] = parseFloat($($last.get(i++)).text());
      result.summary["ltotal"] = parseFloat($($last.get(i++)).text());
      result.summary["sltotal"] = parseFloat($($last.get(i++)).text());
      return res.sendJSONP(params.callback, result);
    };

    return StockServices;

  }).call(this);

  exports.StockServices = StockServices;

}).call(this);
