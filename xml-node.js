const sax = require('sax');
const xmlbuilder = require('xmlbuilder');
const {newXMLNodeCollection, XMLNodeCollection} = require('./xml-node-collection');

const XMLNodeProxyHandler = {
    get(xmlNode, propertyName) {
        // override the .name property so that it doesn't return the function name
        // this unfortunately cannot be implemented as a standard getter
        if (propertyName === "name") {
            return xmlNode._name;
        }
        if (propertyName === "_parent") {
            return xmlNode._parent;
        }

        // if xmlNode has this property, or a symbol property is requested,
        // just return that property.
        if (typeof propertyName === 'symbol' || xmlNode[propertyName] !== undefined) {
            return xmlNode[propertyName];
        }

        // else, return the child nodes which have this name
        // this always returns an XMLNodeCollection with at least one XMLNode
        // if a matching XMLNode doesn't exist - it will be created.
        return xmlNode.get(propertyName);
    },

    apply(xmlNode, thisArg, argumentsList) {
        let [attrs, value] = argumentsList;
        if (typeof attrs !== 'object') {
            value = attrs;
            attrs = null;
        }
        if (attrs) {
            xmlNode.attr(attrs);
        }
        if (value) {
            xmlNode.value = value;
        }
        return xmlNode;
    }
}

function newXMLNode(name, attributes, value, parent) {
    return new Proxy(new XMLNode(name, attributes, value, parent), XMLNodeProxyHandler);
}

class XMLNode extends Function {
    constructor(name, attributes, value, parent) {
        super();
        if (typeof attributes !== 'object') {
            value = attributes;
            attributes = null;
        }
        this._name = String(name || "");
        this._attributes = attributes || {};
        // ensure all attributes are strings
        Object.keys(this._attributes).forEach(k => {
            this._attributes[k] = String(this._attributes[k]);
        });
        this._value = String(value || "");
        this.children = [];
        this._parent = parent;
    }

    addChild(name, attributes, value) {
        let n = newXMLNode(name, attributes, value, this);
        this.children.push(n);
        return n;
    }

    // get XMLNodeCollection of children having the given name
    // if no matching child exists, it will be created
    get(name) {
        let children = this.children.filter(c => c._name === name);
        return newXMLNodeCollection((children.length > 0) ? children : [this.addChild(name)]);
    }

    attr(attrName, newValue) {
        if (attrName === undefined) {
            // get all attributes
            return this._attributes;
        } else if (typeof attrName === 'object') {
            // set many attributes
            Object.keys(attrName).forEach(k => {
                this._attributes[String(k)] = String(attrName[k]);
            });
            return this;
        } else if (newValue === undefined) {
            // get single attribute string
            let attr = this._attributes[attrName];
            return (typeof attr === "string") ? attr : "";
        } else {
            // set single attribute string
            // console.log('setting attr(%s, %s)', attrName, newValue);
            this._attributes[String(attrName)] = String(newValue);
            return this;
        }
    }

    set value(newValue) {
        this._value = String(newValue);
    }

    get value() {
        return this._value;
    }

    toString() {
        return this.value;
    }

    toXML(options, root) {
        let end = false;
        if (!root) {
            end = true;
            root = xmlbuilder.create(this._name);
            root.att(this.attr());
            root.txt(this._value);
        }
        this.children.forEach(c => {
            let newEle = root.ele(c._name, c.attr());
            if (c.value) {
                newEle.txt(c.value);
            }
            c.toXML(options, newEle);
            return c;
        });
        if (end) {
            return root.end(options);
        }
    }

    remove() {
        let parent = this._parent;
        let idx = parent.children.indexOf(this);
        if (idx === -1) {
            throw Error("Cannot remove node without parent");
        }
        parent.children.splice(idx, 1);
        this._parent = null;
    }

    empty() {
        while (this.children.length) {
            let child = this.children.pop();
            child._parent = null;
        }
    }

    cloneSync() {
        return XMLNode.parseSync(this.toXML());
    }

    static parseSync(xml) {
        let nodeCollection = newXMLNodeCollection();
        let parser = sax.parser(true);
        let openXMLNodes = [];
        let error = null;
        parser.onerror = (err) => {error = err;};
        parser.onopentag = (tag) => {
            let xNode = newXMLNode(tag.name, tag.attributes, undefined, openXMLNodes[openXMLNodes.length-1]);
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
}

XMLNode.prototype.toJSON = null;
XMLNode.prototype.inspect = null;

module.exports = {newXMLNode, XMLNode};
