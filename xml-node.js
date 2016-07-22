var xmlbuilder = require('xmlbuilder');
var XMLNodeCollection = require('./xml-node-collection');

var XMLNodeProxyHandler = {
    get(xmlNode, propertyName) {
        // override the .name property so that it doesn't return the function name
        // this unfortunately cannot be implemented as a standard getter
        if (propertyName === "name") {
            return xmlNode._name;
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

function newXMLNode(name, attributes, value) {
    return new Proxy(new XMLNode(name, attributes, value), XMLNodeProxyHandler);
}

class XMLNode extends Function {
    constructor(name, attributes, value) {
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
    }

    addChild(name, attributes, value) {
        var n = newXMLNode(name, attributes, value);
        this.children.push(n);
        return n;
    }

    // get XMLNodeCollection of children having the given name
    // if no matching child exists, it will be created
    get(name) {
        var children = this.children.filter(c => c._name === name);
        return XMLNodeCollection((children.length > 0) ? children : [this.addChild(name)]);
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
            var attr = this._attributes[attrName];
            return (typeof attr === "string") ? attr : "";
        } else {
            // set single attribute string
            console.log('setting attr(%s, %s)', attrName, newValue);
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
        var end = false;
        if (!root) {
            end = true;
            root = xmlbuilder.create(this._name);
            root.att(this.attr());
            root.txt(this._value);
        }
        this.children.forEach(c => {
            var newEle = root.ele(c._name, c.attr());
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
}

XMLNode.prototype.toJSON = null;
XMLNode.prototype.inspect = null;

module.exports = newXMLNode;
