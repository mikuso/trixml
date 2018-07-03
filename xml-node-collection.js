const {newXMLNode, XMLNode} = require('./xml-node');

const XMLNodeCollectionProxyHandler = {
    get(xmlNodeCollection, propertyName) {
        // override the .name property so that it doesn't return the function name
        // this unfortunately cannot be implemented as a standard getter
        if (propertyName === "name") {
            if (xmlNodeCollection._members.length > 0) {
                return xmlNodeCollection._members[0].name;
            }
            throw Error("Cannot get name of an empty collection");
        }

        // .length should refer to the number of members in the collection
        if (propertyName === "length") {
            return xmlNodeCollection._members.length;
        }

        // ._parent should refer to the first member's parent node
        if (propertyName === "_parent") {
            return xmlNodeCollection._members[0]._parent;
        }

        // if xmlNodeCollection has this property, or a symbol property is requested,
        // just return that property.
        if (typeof propertyName === 'symbol' || xmlNodeCollection[propertyName] !== undefined) {
            return xmlNodeCollection[propertyName];
        }

        // at this point, we now know that propertyName is not a member of xmlNodeCollection.

        // if propertyName looks like an array index, then return that member
        if (String(parseInt(propertyName, 10)) === propertyName) {
            return xmlNodeCollection._members[parseInt(propertyName, 10)];
        }

        // if propertyName is one of these Array method names, return a function equivalent.
        // each function iteration will operate on each member XMLNode
        // filter() always returns a new XMLNodeCollection
        if (["forEach", "map", "filter", "find", "some", "every"].indexOf(propertyName) !== -1) {
            // console.log('%s is an array method', propertyName);
            return function(iteratee) {
                let result = Array.prototype[propertyName].call(xmlNodeCollection._members, iteratee);

                if (propertyName === "filter") {
                    return newXMLNodeCollection(result);
                }

                return result;
            };
        }

        // else, return the first member's child nodes which have this name
        // this always returns an XMLNodeCollection with at least one XMLNode
        // if a matching XMLNode doesn't exist - it will be created.
        return xmlNodeCollection.get(propertyName);
    },

    apply(xmlNodeCollection, thisArg, argumentsList) {
        let [attrs, value] = argumentsList;
        if (typeof attrs !== 'object') {
            value = attrs;
            attrs = null;
        }
        if (attrs) {
            xmlNodeCollection.attr(attrs);
        }
        if (value) {
            xmlNodeCollection.value = value;
        }
        return xmlNodeCollection;
    }
}

function newXMLNodeCollection(nodes) {
    return new Proxy(new XMLNodeCollection(nodes), XMLNodeCollectionProxyHandler);
}

class XMLNodeCollection extends Function {
    constructor(nodes) {
        super();
        this._members = [];
        if (typeof nodes === 'object' && nodes instanceof Array && nodes.length > 0) {
            this._members.push(...nodes);
        }
    }

    addChild(name, attributes, value) {
        if (this._members.length > 0) {
            return this._members[0].addChild(name, attributes, value);
        }
        throw Error("Cannot add a child to an empty collection");
    }

    // get XMLNodeCollection of children having the given name
    // if no matching child exists, it will be created
    get(name) {
        if (this._members.length > 0) {
            return this._members[0].get(name);
        }
        throw Error("Cannot get a child node from an empty collection");
    }

    attr(attrName, newValue) {
        if (this._members.length > 0) {
            return this._members[0].attr(attrName, newValue);
        }
        throw Error("Cannot set attributes of an empty collection");
    }

    set value(newValue) {
        if (this._members.length > 0) {
            return this._members[0].value = newValue;
        }
        throw Error("Cannot set value of an empty collection");
    }

    get value() {
        if (this._members.length > 0) {
            return this._members[0].value;
        }
        throw Error("Cannot get value of an empty collection");
    }

    toString() {
        if (this._members.length > 0) {
            return this._members[0].toString();
        }
        throw Error("Cannot get string value of an empty collection");
    }

    toXML(options) {
        if (this._members.length > 0) {
            return this._members[0].toXML(options);
        }
        throw Error("Cannot get XML of an empty collection");
    }

    get children() {
        if (this._members.length > 0) {
            return this._members[0].children;
        }
        throw Error("Cannot get children of an empty collection");
    }

    set name(newName) {
        if (this._members.length > 0) {
            return this._members[0].name = newName;
        }
        throw Error("Cannot set name of an empty collection");
    }

    empty() {
        while (this._members.length) {
            let member = this._members.pop();
            member.empty();
        }
    }

    remove() {
        while (this._members.length) {
            let member = this._members.pop();
            member.remove();
        }
    }

    cloneSync() {
        if (this._members.length > 0) {
            return this._members[0].cloneSync();
        }
        throw Error("Cannot clone an empty collection");
    }

    toArray() {
        return this._members;
    }
}

XMLNodeCollection.prototype.inspect = null;
XMLNodeCollection.prototype.toJSON = null;

module.exports = {newXMLNodeCollection, XMLNodeCollection};
