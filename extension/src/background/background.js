

chrome.extension.onMessage.addListener(function(request, sender, cb) {
  var obj = request;
  if(obj.msg === "screenshot") {
    
    cb("extension background received message and handled it!")
  }
  cb("extension background received message but did not handle it !")
});