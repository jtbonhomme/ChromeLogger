# ChromeLogger

## Load the extension

Visit chrome://extensions in your browser.

1. Ensure that the Developer mode checkbox in the top right-hand corner is checked.

2. Click Load unpacked extension… to pop up a file-selection dialog.

3. Navigate to the directory in which your extension files live (top directory that contains the manifest.json), and select it.

## Start the log server

```
% node server/index.js
```

## Go

Open the webapp.local url in Chrome, and use the webapp. Logs will be saved in the server/logs directory.

# TODO

* make an icon to change options
* set up options page to setup server url and port, sse event filter, ... (+ no need of angular, ...)
* send keyname to server as defined in nightwatch
* handle throttle for key press
* create a nightwatch test file
* give a name to a test with a text field
* specify keywords for nightwatch test
* start and finish test (then log recording) with a menu button
* allow define steps in tests
* send text label to split texts
* send screenshot orders to check a test step