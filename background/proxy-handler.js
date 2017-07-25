// Location of the proxy script, relative to manifest.json
const proxyScriptURL = "proxy/proxy-script.js";

function onBeforeSendHeadersListener(info) {
    console.log('on Before Send Headers fired for URL ', info.url)
}

function onCompletedListener(info) {
    console.log('on Completed fired for URL ', info.url)
}

// Default settings. If there is nothing in storage, use these values.
const defaultSettings = {
   blockedHosts: ["example.com", "example.org"]
 }

// Register the proxy script
browser.proxy.registerProxyScript(proxyScriptURL);

// Log any errors from the proxy script
browser.proxy.onProxyError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});

// Initialize the proxy
function handleInit() {
  // update the proxy whenever stored settings change
  browser.storage.onChanged.addListener((newSettings) => {
    browser.runtime.sendMessage(newSettings.blockedHosts.newValue, {toProxyScript: true});
  });

  // get the current settings, then...
  browser.storage.local.get()
    .then((storedSettings) => {
      // if there are stored settings, update the proxy with them...
      if (storedSettings.blockedHosts) {
        browser.runtime.sendMessage(storedSettings.blockedHosts, {toProxyScript: true});
      // ...otherwise, initialize storage with the default values
      } else {
        browser.storage.local.set(defaultSettings);
      }

    })
    .catch(()=> {
      console.log("Error retrieving stored settings");
    });
}

function handleMessage(message, sender) {
  // only handle messages from the proxy script
  if (sender.url !=  browser.extension.getURL(proxyScriptURL)) {
    return;
  }

  if (message === "init") {
    handleInit(message);
  } else {
    // after the init message the only other messages are status messages
    console.log(message);
  }
}

browser.runtime.onMessage.addListener(handleMessage);

!browser.webRequest.onCompleted.hasListener(onCompletedListener) && browser.webRequest.onCompleted.addListener(
    onCompletedListener,
    { urls: ["<all_urls>"] }
)

!browser.webRequest.onBeforeSendHeaders.hasListener(onBeforeSendHeadersListener) &&
    browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersListener, {urls: ["<all_urls>"]},
    ["requestHeaders"]);
