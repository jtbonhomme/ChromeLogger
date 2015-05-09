/* jshint node:true */
'use strict';
require('colors');

function pad(n) { return n < 10 ? '0' + n : n; }

var fs = require('fs');
var express = require('express');
var app = express();
var port = parseInt(process.argv[2], 10) || 8081;

var now = new Date();
var date = [now.getFullYear(), now.getMonth(), now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join('');
var file = './logs/logs_' + date + '.log';
fs.openSync(file, 'ax');

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

function logprinter(log) {
  return ['[' + log.date.grey + ']', '[' + log.namespace[colors[log.level]] + ']', prettyprint(log.args)].join(' ');
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
  var logs = (Array.isArray(body) ? body : [body]).map(logprinter).join('\n');

  // not optimized nor secure but who cares...
  console.log(logs);
  fs.appendFileSync(file, logs);
  res.send(200);
});

console.log('Listening on port ' + port);
app.listen(port);
