# firefox-proxy-bug

## What it does

This add-on registers a [PAC script](https://developer.mozilla.org/en-US/docs/Web/HTTP/Proxy_servers_and_tunneling/Proxy_Auto-Configuration_%28PAC%29_file) using the proxy API.

It also registers listeners for `onBeforeSendHeaders` event and `onCompleted` and logs the requests details

The PAC script is initialized with a list of hostnames: it blocks requests to any hosts that are in the list.

The list is given the following default values: `["example.com", "example.org"]`, but the user can add and remove hosts using the add-on's options page.

Note that the hostname-matching is very simple: hostnames must exactly match an entry in the list if they are to be blocked. So with the default settings, "example.org" would be blocked but "www.example.org" would be permitted.

To try it out:
* install it
* try visiting `http://example.com`, and see it is blocked
* visit `about:addons`, open the add-on's preferences, and try changing the hostnames in the text box
* try visiting some different pages, to see the effect of your changes.
* open developer console and check output of the listeners

##### To see the bug:
* just open new tab and start typing anything in the address bar. You will see that request are being processed
by PAC script but do not fire webRequest events.

Some of the URLs that do not fire `webRequest` events:

https://www.google.com

http://clients1.google.com

https://safebrowsing.google.com

http://detectportal.firefox.com

http://ocsp.digicert.com

https://shavar.services.mozilla.com

etc

## What it shows
* `onBeforeSendHeaders` and `onCompleted` listeners are not fired for all requests. In the developer console you will see that PAC script consumes more requests than listeners log
* This causes the bug, because when proxy server requires authentication it is impossible to provide any neither in
request headers, neither using `onAuthRequired`

#### Other
Besides `onBeforeSendHeaders` and `onCompleted` checked also `onAuthRequired` in other extension, and it is not fired also.
