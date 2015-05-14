(function(){
  'use strict';

  /* set dimensions to 1280x720 */
  /*chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, {left: 0, top: 0, width: 1280, height: 720}, function() {
    console.log("[content] resized window");
  });*/

  var screenshot = {
    tab: 0,
    canvas: document.createElement("canvas"),
    screenLog: LOGGER('SCR'),
    domLog: LOGGER('DOM'),
    /**
    * Receive messages from content_script, and then decide what to do next
    */
    addMessageListener: function() {
      chrome.extension.onMessage.addListener(function(request, sender, cb) {
        var obj = request;
        if(obj.msg === "screenshot") {
          chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
            screenshot.screenLog(dataUrl);
            alert("SCREENSHOT");
            cb({ resp: "[background] screenshot ok !", screenshotUrl: dataUrl });
          });
        }
        else if(obj.msg === "dom") {
          screenshot.domLog(obj.element);
          alert("HOVER");
          cb({ resp: "[background] XPATH selection " + obj.element.xpath, data: null});
        }
        else {
          cb({resp: "[background] unknown message "+obj.msg, data: null});
        }
      });
    },
    init: function() {
      screenshot.addMessageListener();
    }
  };

  screenshot.init();

  var global = {
    "LOGGER_NAME": "remote",
    "LOGGER_OPTIONS": {
      "url": "http://127.0.0.1:8081",
      "batchInterval": 300
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

})();