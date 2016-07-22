"use strict";

// Inspired by PHP's SimpleXMLElement and a little bit of jQuery (no sizzle though)

var sax = require('sax');
var XMLNode = require('./xml-node');
var XMLNodeCollection = require('./xml-node-collection');

function newDoc(name, attrs, value) {
    var node = XMLNode(name, attrs, value);
    return XMLNodeCollection([node]);
}

function parseSync(xml) {
    var nodeCollection = XMLNodeCollection();
    var parser = sax.parser(true);
    var openXMLNodes = [];
    var error = null;
    parser.onerror = (err) => {error = err;};
    parser.onopentag = (tag) => {
        var xNode = XMLNode(tag.name, tag.attributes);
        if (nodeCollection.length === 0) {
            // first node should be the root.
            // the returned XMLNodeCollection should contain only the root node
            nodeCollection._members.push(xNode);
        }
        if (openXMLNodes.length) {
            openXMLNodes[openXMLNodes.length-1].children.push(xNode);
        }
        openXMLNodes.push(xNode);
    };
    parser.onclosetag = () => {
        openXMLNodes.pop();
    };
    parser.ontext = (text) => {
        if (!text || !text.trim() || !openXMLNodes.length) return;
        openXMLNodes[openXMLNodes.length-1].value += text;
    };
    parser.oncdata = (cdata) => {
        openXMLNodes[openXMLNodes.length-1].value += cdata;
    };
    parser.write(xml);
    parser.close();
    if (error) {
        throw error;
    }
    return nodeCollection;
}

module.exports = {
    newDoc: newDoc,
    parseSync: parseSync,
    XMLNode: XMLNode,
    XMLNodeCollection: XMLNodeCollection
}
