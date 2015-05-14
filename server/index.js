#!/usr/bin/env node

(function(){
  'use strict';
  require('colors');

  function pad(n) { return n < 10 ? '0' + n : n; }

  var fs       = require('fs');
  var express  = require('express');
  var app      = express();
  var path     = require('path');
  var minimist = require('minimist');
  var argv     = minimist(process.argv.slice(2));
  var now      = new Date();
  var date     = [now.getFullYear(), now.getMonth(), now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join('');

  var port     = argv.port || argv.p || 8081;
  var filename = argv.file || argv.f || path.normalize(path.dirname(process.argv[1])+'/scripts/test_' + date + '.js');

  var fd = fs.openSync(filename, 'ax');
  fs.appendFileSync(filename, getHeaderFile("this is a title", "x-tag1", "x-tag2"));
  process.on('SIGINT', function() {
    console.log('Got SIGINT.  Close test file.');
    fs.appendFileSync(filename, getFooterFile());
    fs.closeSync(fd);
    process.exit(0);
  });

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

  /**
   * Data received are under the form:
   * [
   *   {"namespace":"KEY","date":"2015-05-10T06:47:47.411Z","args":["KEYDOWN",38]},
   *   {"namespace":"SSE","date":"2015-05-10T06:45:32.101Z","args":["player",{"data":{"307":1.0},"signal":"LastChange"}]},
   * ]
   */

  function logConsole(log) {
    var args = (log.namespace==='SCR'?'<screenshot>':prettyprint(log.args));
    return ['[' + log.date.grey + ']', '[' + log.namespace.red + ']', args].join(' ');
  }

  var keys = {
    13:  'browser.Keys.ENTER',       // Enter
    27:  'browser.Keys.ESCAPE',      // Esc       ;
    33:  'browser.Keys.PAGEUP',      // Page Up   ; fn + ↑ = NextProg
    34:  'browser.Keys.PAGEDOWN',    // Page Down ; fn + ↓ = PrevProg
    35:  'browser.Keys.END',         // End       ; fn + → = Vdown
    36:  'browser.Keys.HOME',        // Home      ; fn + ← = Vup
    37:  'browser.Keys.ARROW_LEFT',  // Left      ; ←
    38:  'browser.Keys.ARROW_UP',    // Up        ; ↓
    39:  'browser.Keys.RIGHT_ARROW', // Right     ; →
    40:  'browser.Keys.ARROW_DOWN',  // Down      ; ↓
    46:  'browser.Keys.BACK_SPACE',  // fn + BACKSPACE = Return
    48:  'browser.Keys.NUMPAD0',     // 0
    49:  'browser.Keys.NUMPAD1',     //
    50:  'browser.Keys.NUMPAD2',     // .
    51:  'browser.Keys.NUMPAD3',     // .
    52:  'browser.Keys.NUMPAD4',     // .
    53:  'browser.Keys.NUMPAD5',     // .
    54:  'browser.Keys.NUMPAD6',     // .
    55:  'browser.Keys.NUMPAD7',     //
    56:  'browser.Keys.NUMPAD8',     //
    57:  'browser.Keys.NUMPAD9',     // 9
    112: 'browser.Keys.F1',          // F1  Rewind
    113: 'browser.Keys.F2',          // F2  Play
    114: 'browser.Keys.F3',          // F3  Forward
    115: 'browser.Keys.F4',          // F4  Stop
    116: 'browser.Keys.F5',          // F5  Pause
    117: 'browser.Keys.F6',          // F6  Rec
    118: 'browser.Keys.F7',          // F7  Zoom
    119: 'browser.Keys.F8',          // F8  Mute
    120: 'browser.Keys.F9',          // F9  Menu
    121: 'browser.Keys.F10',         // F10 Guide
    122: 'browser.Keys.F11',         // F11 TV
    123: 'browser.Keys.F12',         // F12 Shutdown
  };

  var lastLogTs = now.getTime();

  function logFile(log) {
    var newTs = new Date(log.date).getTime();
    var output = [];
    if( newTs > lastLogTs) {
      output.push('      .pause(' , (newTs-lastLogTs) , ')\n');
    }
    switch(log.namespace) {
      case "SSE":
        output.push('      .fireEvent(\'', log.args[1], '\', \'', log.args[0],  '\')');
        break;
      case "KEY":
        if(log.args[0] === 'keyup' && keys[log.args[1]]) {
          output.push('      .keys(', keys[log.args[1]],')');
        }
        break;
      case "SCR":
        var base64Data = log.args[0].replace(/^data:image\/png;base64,/,""),
            binaryData = new Buffer(base64Data, 'base64');
        require("fs").writeFile("out.png", binaryData, "binary", function(err) {
          console.log(err); // writes out file without error, but it's not a valid image
        });
        break;
      default:
        break;
    }
    lastLogTs = newTs;
    return output.join('');
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

  function getHeaderFile(title, tag1, tag2, tag3) {
    return [        
        "  module.exports = {",
        "",
        "  tags: ['non-reg', '"+ (tag1 || "tag1") +"', '"+ (tag2 || "tag2") +"', '"+ (tag3 || "tag3") +"', 'auto-generated'],",
        "",
        "  after : function(browser) {",
        "    console.log('Closing down...');",
        "    browser",
        "      .end();",
        "  },",
        "",
        "  '"+title+"' : function (browser) {",
        "    browser",
        "      .url(browser.globals.seahorseUrl)",
        "      .waitForElementVisible('body', 1000)",
        "      .pause(1000)\n"
      ].join('\n');
  }
  function getFooterFile() {
    return [
        "  }",
        "};"
      ].join('\n');
  }
})();
