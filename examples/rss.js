var trixml = require('..');
var https = require('https');

function getRSSXML(callback) {
    var xmlString = "";
    https.request({
        hostname: 'github.com',
        path: '/mikuso.atom'
    }, res => {
        res.on('data', (d) => {
            xmlString += d;
        });
        res.once('end', () => callback(xmlString));
    }).end();
}

getRSSXML((xmlString) => {
    var doc = trixml.parseSync(xmlString);

    var items = doc.entry.map(e => `${e.published}: ${e.title}`).join("\n");

    console.log(`Title: ${doc.title}\nUpdated: ${doc.updated}\n------\n${items}`);

    // Title: mikuso’s Activity
    // Updated: 2016-07-22T17:21:22Z
    // ------
    // 2016-07-22T17:21:22Z: mikuso pushed to master at mikuso/trixml
    // 2016-07-22T17:19:48Z: mikuso pushed to master at mikuso/trixml
    // 2016-07-22T17:18:00Z: mikuso pushed to master at mikuso/trixml
    // 2016-07-22T17:18:00Z: mikuso created tag v0.0.3 at mikuso/trixml
    // ...
});
