"use strict";
(function () {
    if (!window.performance) {
        return;
    }

    var propsWeWant = ["connectStart", "connectEnd",
        "domainLookupStart", "domainLookupEnd",
        "fetchStart",
        "redirectStart", "redirectEnd",
        "requestStart",
        "responseStart", "responseEnd",
        "secureConnectionStart"];

    var callbackUrl = window.byuFontMetricsCallbackUrl || 'https://em689ub362.execute-api.us-west-2.amazonaws.com/dev/beacon';

    if (document.readyState === 'complete') {
        console.log('document is ready');
        analyzeTiming()
    } else {
        console.log('adding load event listener');
        document.addEventListener('readystatechange', readyStateChange, false);
    }

    function readyStateChange(event) {
        if (event.target.readyState === 'complete') {
            analyzeTiming();
        }
    }

    function analyzeTiming() {
        document.removeEventListener('readystatechange', readyStateChange, false);

        var fonts = performance.getEntriesByType("resource")
            .filter(function (it) {
                return it.name.indexOf('://cloud.typography.com') >= 0
            });

        if (fonts.length === 0) {
            return;
        }

        var body = getBeaconBody(fonts);

        sendBeaconMessage(callbackUrl, body);
    }

    function sendBeaconMessage(url, body) {
        console.log('Sending font metrics to ' + url + ':\n', body);
        if ('sendBeacon' in navigator) {
            navigator.sendBeacon(url, body);
        } else {
            var client = new XMLHttpRequest();
            client.open("POST", url, false);
            client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            client.send(body);
        }
    }

    function getBeaconBody(entries) {
        return entries.map(beaconBodyForEntry).join('\n');
    }

    function beaconBodyForEntry(entry) {
        return entry.name + '\t' + propsWeWant.map(bodyForValue).join('\t');

        function bodyForValue(prop) {
            var supported = prop in entry;
            var value;
            if (supported) {
                value = entry[prop];
            } else {
                value = '-1'
            }
            return prop + '=' + value;
        }
    }

})();

