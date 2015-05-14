/* Keyboard listeners */
document.addEventListener('keyup', function (e) {
    console.log('[context] keyup : ' + e.keyCode);
    if( e.keyCode === 32 /* <SPACE>*/) {
	  console.log("[content] extension sendMessage screenshot");
      chrome.extension.sendMessage({ msg: 'screenshot'},
   	    function(msg) {
   	      console.log("[content] extension received response from bckg");
   	    });
    }
    else if( e.keyCode === 88 /* x */) {
	  console.log("[content] extension sendMessage dom");
      var hover = document.querySelectorAll( ":hover" );
      var xpath = '//*[@id="'+hover[2].id+'"]';
      var currentElt = hover[hover.length-1];
      for(var i = 3 ; i < hover.length; i++) {
        xpath+='/'+hover[i].nodeName.toLowerCase();
      }
      console.log("xpath : " + xpath);
      chrome.extension.sendMessage({
          msg: 'dom',
          element: {
          	xpath: xpath,
            classes: currentElt.classList,
            innerText: currentElt.innerText
          }
        },
   	    function(msg) {
   		  console.log("[content] extension received response from bckg " + msg.resp);
   	    });
    }
});

var hover = {
  currentElt: null,
  lastElt: null,
  bgColor: null,
  getCurrentHoverElt: function() {
    var fullSelection = document.querySelectorAll( ":hover" );
    if( fullSelection.length > 1 ) {
      hover.currentElt = fullSelection[fullSelection.length-1];
      if( hover.currentElt !== hover.lastElt) {
	    if( hover.lastElt ) {
	      hover.lastElt.style.backgroundColor = hover.bgColor;
	    }
        hover.bgColor = hover.currentElt.style.backgroundColor;
        hover.currentElt.style.backgroundColor = "#4DA1EA";
        hover.lastElt = hover.currentElt;
      }
    }
    hover.startMouseListen();
  },
  startMouseListen: function() {
    window.setTimeout(function() {
      hover.getCurrentHoverElt(true);
    }, 300);
  },
  init: function() {
    hover.startMouseListen();
  }
};
hover.init();

