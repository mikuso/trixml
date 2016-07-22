Simple parsing and building of XML documents.

Example
-------
Building an XML document
```js
var xml = newDoc('root');
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
```
outputs
```xml
<?xml version="1.0"?>
<root>
    <Header>Hello ...</Header>
    <Body>
        <Message length="6" planet="Earth">World!</Message>
    </Body>
    <Footer>
        <wibble a="b" c="d" />
        <wobble>Easy!</wobble>
        <wubble e="f">Simple</wubble>
        <wubble />
        <flub>fluub</flub>
    </Footer>
    <Trailer />
</root>
```


Gotchas
-------
It's possible for nodes in your XML document to have names which conflict with the names of members of the ```XMLNode``` or ```XMLNodeCollection``` objects.  When this happens, you cannot use the shorthand method for accessing child nodes.

The following XML nodes are affected:
    ```<inspect>```, ```<toJSON>```, ```<toString>```, ```<value>```, ```<children>```, ```<comments>```, ```<attr>```, ```<addChild>```, ```<get>```

In these cases, you must use the longhand method like this:
```js
var root = parse(`
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
