# Nightwatch test recorder

This module is a Chrome extension that log any key event or server sent events (sse) received by the current page and send them to a server (via ajax POSTs)
All these events are transcripts by the destination server into a nightwatch test script.

## Load the extension

Visit chrome://extensions in your browser.

1. Ensure that the Developer mode checkbox in the top right-hand corner is checked.
2. Click Load unpacked extension… to pop up a file-selection dialog.
3. Navigate to the directory in which your extension files live (top directory that contains the manifest.json), and select it.

## Start the log server

```
% node server/index.js [-p <port>] [-f <testfile.js>]
```

## Record your first test

Open the webapp.local url in Chrome, and navigate in the webapp with the keyboard. 
All events will be saved by the server as a nitghwatch js test script.

## Special Keys

* SPACE : make a screenshot of the visible part of the current tab. To be accurate, the visible part of the screen shall be exactly 1280x720.
* x : get the xpath of the dom element which is hovered by the mouse pointer

# TODO

This is a work in progress, lots of work to do ...

- [x] send keyname to server as defined in nightwatch
- [x] create a nightwatch test file
- [ ] send screenshot orders to check a test step (screenshot are sent as png picture, still have to store them with a correct name and make a comparison in nightwatch)
- [ ] set up options page to setup server url and port, sse event filter, hover mode, ...
- [ ] make an icon to change options
- [ ] give a name to a test with a text field
- [ ] simulate sse from chromelogger
- [ ] specify keywords for nightwatch test
- [ ] start and finish test (then log recording) with a menu button
- [ ] send text label to split texts, in order to define different steps during tests
- [ ] handle throttle for key press (?)
- [ ] check DOM elements (id, has class(es), presence or not, visble or not, value)

