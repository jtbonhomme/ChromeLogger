(function(){
  'use strict';
  require('colors');

  function pad(n) { return n < 10 ? '0' + n : n; }

  var fs       = require('fs');
  var express  = require('express');
  var app      = express();
  var port     = parseInt(process.argv[2], 10) || 8081;
  var path     = require('path');

  var now      = new Date();
  var date     = [now.getFullYear(), now.getMonth(), now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join('');
  var filename = path.normalize(path.dirname(process.argv[1])+'/logs/logs_' + date + '.log');

  fs.openSync(filename, 'ax');

  function cors(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Max-Age', '1728000');
    next();
  }

  function prettyprint(args) {
    return args.map(function(log) {
      return (typeof log === 'object') ? JSON.stringify(log) : '' + log;
    }).join(' ');
  }

  var colors = {
    debug:   'grey',
    info:    'blue',
    warning: 'yellow',
    error:   'red',
    fatal:   'rainbow'
  };

  function logConsole(log) {
    return ['[' + log.date.grey + ']', '[' + log.namespace[colors[log.level]] + ']', prettyprint(log.args)].join(' ');
  }
  function logFile(log) {
    return ['[' + log.date + ']', '[' + log.namespace + ']', prettyprint(log.args)].join(' ');
  }

  app.configure(function() {
    app.use(express.bodyParser());
    app.use(cors);
  });

  app.options('/', function(req, res) {
    res.send(200);
  });

  app.post('/', function(req, res) {
    var body = req.body;
    var logs2Console = (Array.isArray(body) ? body : [body]).map(logConsole).join('\n');
    var logs2File    = (Array.isArray(body) ? body : [body]).map(logFile).join('\n');

    // not optimized nor secure but who cares...
    console.log(logs2Console);
    fs.appendFileSync(filename, logs2File+'\n');
    res.send(200);
  });

  console.log('Listening on port ' + port);
  app.listen(port);
})();