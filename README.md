# Trivial XML

Simple parsing and building of XML documents, powered by new features only available in ES6.

The goals of this project:
* To make XML parsing require little-to-no error checking. Exploring the node tree should be as forgiving as possible.
* To provide an easy way to open, modify and save an XML document in a single, unified library.
* To be easily installed without any native code compilation.
* To provide a novel and terse API by taking advantage of the latest ES6 metaprogramming features.
* Useful for quick and dirty jobs which don't need fine grained control over every intricacy of XML.
* Prioritising ease-of-use over speed.
* To make you re-think your approach to XML parsing.

Requires a recent version of Node which has **Proxy** support.

## Examples
### Parsing an XML document
```js
var trixml = require('trixml');
var xml = trixml.parseSync(`
    <?xml version="1.0"?>
    <Root an="attribute" another="one">
        <Envelope>
            <Message id="msg1">Hello</Message>
            <Message id="msg2">World</Message>
            <Message id="msg3">!</Message>
        </Envelope>
    </Root>
`);

xml.attr() // {an: "attribute", another: "one"}
xml.name; // "Root"
xml.value; // ""
xml.Envelope.Message.value; // "Hello"
xml.Envelope.Message.map(msg => msg.value).join(' ') // "Hello World !"
xml.Envelope.Message.attr('id') // msg1
xml.Envelope.Message.map(msg => msg.attr('id')).join(',') // "msg1,msg2,msg3"
```

### Building an XML document

```js
var trixml = require('trixml');
var xml = trixml.newDoc('root');

xml.Header("Hello ...");
xml.Body.Message("World", {length: 5});
xml.Body.Message("World!", {length: 6, planet: "Earth"}); // overwrites value & merges attributes
xml.Footer.wibble({a: "b", c: "d"});
xml.Footer.wobble("Easy!");
xml.Footer.addChild("wubble", {e: "f"}, "Simple!");
xml.Footer.addChild("wubble");
xml.Footer.flub("fluub");
xml.Trailer;

console.log(xml.toXML());

// <?xml version="1.0"?>
// <root>
//     <Header>Hello ...</Header>
//     <Body>
//         <Message length="6" planet="Earth">World!</Message>
//     </Body>
//     <Footer>
//         <wibble a="b" c="d" />
//         <wobble>Easy!</wobble>
//         <wubble e="f">Simple</wubble>
//         <wubble />
//         <flub>fluub</flub>
//     </Footer>
//     <Trailer />
// </root>
```


## Gotchas

It's possible for nodes in your XML document to have names which conflict with the names of members of the ```XMLNode``` or ```XMLNodeCollection``` objects.  When this happens, you cannot use the shorthand method for accessing child nodes.

The following XML nodes are affected:
    ```<inspect>```, ```<toJSON>```, ```<toString>```, ```<value>```, ```<children>```, ```<comments>```, ```<attr>```, ```<addChild>```, ```<get>```

In these cases, you must use the longhand method like this:
```js
var root = trixml.parseSync(`
    <?xml version="1.0"?>
    <root>
        <inspect>
            <addChild>gotcha</addChild>
        </inspect>
    </root>
`);

root.get('inspect').get('addChild').value === "gotcha"; // true

// don't do this... (it won't work)
root.inspect.addChild.value; // TypeError: Cannot read property 'addChild' of null
```
