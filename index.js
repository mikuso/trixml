"use strict";

// Inspired by PHP's SimpleXMLElement and a little bit of jQuery (no sizzle though)

const {newXMLNode, XMLNode} = require('./xml-node');
const {newXMLNodeCollection, XMLNodeCollection} = require('./xml-node-collection');

function newDoc(name, attrs, value) {
    let node = newXMLNode(name, attrs, value);
    return newXMLNodeCollection([node]);
}

module.exports = {
    XMLNode: XMLNode,
    XMLNodeCollection: XMLNodeCollection,
    newDoc: newDoc,
    parseSync: XMLNode.parseSync
}
