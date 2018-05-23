"use strict";
(function () {
    if (!window.performance) {
        return;
    }

    var propsWeWant = ["duration", "connectStart", "connectEnd",
        "domainLookupStart", "domainLookupEnd",
        "fetchStart",
        "redirectStart", "redirectEnd",
        "requestStart",
        "responseStart", "responseEnd",
        "secureConnectionStart"];

    var callbackUrl = window.byuFontMetricsCallbackUrl || 'https://font-metrics-dev.cdn.byu.edu/beacon';

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

        var navEntries = window.performance.getEntriesByType('navigation');

        if (fonts.length === 0) {
            return;
        }

        var body = getBeaconBody(fonts, navEntries);

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

    function getBeaconBody(entries, nav) {
        var navLines = nav.map(function(entry) {
            var value;
            if ('responseEnd' in entry) {
                value = String(entry.responseEnd)
            } else {
                value = '-1';
            }
            return 'nav\tresponseEnd=' + value;
        });

        var fontLines = entries.map(beaconBodyForEntry);

        return navLines.concat(fontLines).join('\n');
    }

    function beaconBodyForEntry(entry) {
        return entry.name + '\t' + propsWeWant
            .map(bodyForValue)
            .filter(pair => pair[1] !== 0)
            .map(pair => pair.join('='))
            .join('\t');

        function bodyForValue(prop) {
            var supported = prop in entry;
            var value;
            if (supported) {
                value = entry[prop];
            } else {
                value = '-1'
            }
            return [prop, value];
        }
    }

})();


