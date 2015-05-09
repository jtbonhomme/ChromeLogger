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