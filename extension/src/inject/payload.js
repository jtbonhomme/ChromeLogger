(function(){
    'use strict';

    /* SSE listener */
    var _events = ["subtitle", "pushvod", "pdl", "player", "eit", "records", "cas", "prm", "network", "storage", "system", "scanning", "avio", "hls"/*, "respawn", "open", "error"*/];
    var source = new window.EventSource('/stream');

    _events.forEach(function(_event) {
        source.addEventListener(_event, function(e) {
          sseLog(_event, e.data);
      }, false);
    });

    /* Keydown listener */
    document.addEventListener('keydown', function (e) {
        keyLog('KEYDOWN' , e.keyCode);
    });

    /* Keyup listener */
    document.addEventListener('keyup', function (e) {
        keyLog('KEYUP' , e.keyCode);
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (var key in changes) {
          var storageChange = changes[key];
          console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      namespace,
                      storageChange.oldValue,
                      storageChange.newValue);
        }
    });

    chrome.storage.sync.get(null, function(settings) {
        console.log("chrome.storage.sync.get : " + JSON.stringify(settings));
    });

    var global = {
      "LOGGER_NAME": "remote",
      "LOGGER_OPTIONS": {
        "url": "http://127.0.0.1:8081"
      }
    };

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
        
        return function(args, namespace) {
            if (!url) { return; }
            var log = {
                namespace: namespace,
                date: new Date(),
                args: args
            };
            if (flush.push(log) === 1) {
                setTimeout(send, interval);
            }
        };
    }

    var list = {
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
          args && loggers.forEach(function(l) {
            l(args, namespace);
        });
      };
      return logger;
    }

    var keyLog = LOGGER('KEY');
    var sseLog = LOGGER('SSE');
})();