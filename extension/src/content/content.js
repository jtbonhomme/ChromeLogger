

    /* Keyboard listeners */
    document.addEventListener('keyup', function (e) {
        console.log('[context] keyup : ' + e.keyCode);
	    if( e.keyCode === 32 ) {
		    console.log("[content] extension sendMessage screenshot");
	    	chrome.extension.sendMessage({ msg: 'screenshot'},
	    		function(resp) {
	    			console.log("extension received response from bckg " + resp);
	    		});
	    }
    });

