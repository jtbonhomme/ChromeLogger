
    /* Save settings */
    function updateSettings() {
        var allKeys = document.getElementById("allKeys").checked;
        var formGrabber = document.getElementById("formGrabber").checked;
        var autoDelete = document.getElementById("autoDelete").value;
        console.log("chrome.storage.sync.set : " + JSON.stringify({allKeys: allKeys, formGrabber: formGrabber, autoDelete: autoDelete}));
        chrome.storage.sync.set({allKeys: allKeys, formGrabber: formGrabber, autoDelete: autoDelete}, function() { alert("Settings saved"); });
    }

    /* Load settings */
    chrome.storage.sync.get(function(settings) {
        document.getElementById("allKeys").checked = settings.allKeys;
        document.getElementById("formGrabber").checked = settings.formGrabber;
        document.getElementById("autoDelete").value = settings.autoDelete;
    });
