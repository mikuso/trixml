var should = require('chai').should();
var simplexml = require('..');

describe('SimpleXMLElement', function() {

    it('should extend Object, Array, Proxy', function(){
        var xml = simplexml("<A></A>");
        xml.should.be.instanceof(Object);
        xml.should.be.instanceof(Array);
        xml.should.be.instanceof(Proxy);
    });
    it('contains no more than one member when created from an XML string', function(){
        var xml1 = simplexml('<?xml version="1.0" encoding="UTF-8"?><A></A><B></B><C></C>');
        xml1.should.have.length(1);
        var xml2 = simplexml('<?xml version="1.0" encoding="UTF-8"?>');
        xml2.should.have.length(0);
    });

    describe('addNode(name, attributes, value)', function(){
        it('should add a child node to the first member of this collection');
        it('can add multiple child nodes of the same name to the first member of this collection');

    });
    describe('attr(attrName)', function(){});
    describe('get(nodeName)', function(){});

    describe('.nodeName', function(){

        it('always returns a SimpleXMLElement');
        it('always returns a SimpleXMLElement with at least one member SimpleXMLNode');

        it('should not throw when requesting non-existing nodes', function(){
            var xml = simplexml("<A></A>");
            should.exist(xml.B.C.D.E);
        });
        it('has names for non-existing nodes', function(){
            var xml = simplexml("<A></A>");
            xml.B.C.D.name.should.equal('D');
        });
        it('has attributes for non-existing nodes', function(){
            var xml = simplexml("<A></A>");
            xml.B.C.D.attr('attr-of-anon-node').should.equal("");
        });

        it('creates & adds a node to the collection if it doesn\'t already exist', function() {
            var xml = simplexml("<Root><B>b1</B><A>a1</A><A>a2</A><B>b2</B></Root>");
            xml.B; // adds nothing
            xml.children.should.have.length(4);
            xml.children.filter(b => b.name === "B").should.have.length(2);
            xml.C; // adds the node <C/>
            should.exist(xml.children.find(c => c.name === "C"));
            xml.children.should.have.length(5);
            xml.B; // adds nothing
            xml.children.should.have.length(5);
            xml.children.filter(b => b.name === "B").should.have.length(2);
        });
    });

    describe('.nodeName.toString()', function(){
        it('should return the value of first child matching nodeName', function() {
            var xml = simplexml("<Root><B>b1</B><A>a1</A><A>a2</A><B>b2</B></Root>");
            xml.A.toString().should.equal("a1");
        });
        it('should treat CDATA blocks as values', function() {
            var xml = simplexml("<Root><A><![CDATA[ok]]></A></Root>");
            xml.A.toString().should.equal("ok");
        });
        it('should concat CDATA blocks with values', function() {
            var xml1 = simplexml("<Root><A>a-<![CDATA[ok]]>! <![CDATA[yeah!]]></A></Root>");
            xml1.A.toString().should.equal("a-ok! yeah!");
            var xml2 = simplexml("<Root><A><![CDATA[a-]]>ok<![CDATA[! ]]>yeah!</A></Root>");
            xml2.A.toString().should.equal("a-ok! yeah!");
        });
        it('should ignore comments', function() {
            var xml1 = simplexml("<Root><A><!-- a comment! --></A></Root>");
            xml1.A.toString().should.equal("");
            var xml2 = simplexml("<Root><A>1<!-- a comment! -->2</A></Root>");
            xml2.A.toString().should.equal("12");
        });
    });

    describe('.nodeName.children', function(){

        it('should return only children of the first child matching nodeName', function() {
            var xml = simplexml("<Root><B><A>1</A></B><B><A>2</A></B></Root>");
            xml.B.A.toString().should.equal("1");
            xml.B.children.length.should.equal(1);
        });
        it('should be empty if nodeName is a non-existing node', function() {
            var xml = simplexml("<Root></Root>");
            xml.A.B.children.length.should.equal(0);
        });
    });

    describe('.map(func)', function(){
        it('returns an Array which is not a SimpleXMLElement');
        it('maps only elements which match the node name', function(){
            var xml = simplexml("<Root><B>b1</B><A>a1</A><A>a2</A><B>b2</B></Root>");
            xml.A.map(a => a.value).join(',').should.equal('a1,a2');
            xml.B.map(b => b.value).join(',').should.equal('b1,b2');
        });
    });
    describe('.filter(func)', function(){
        it('returns a SimpleXMLElement');
        it('can return an empty SimpleXMLElement');
    });
    describe('.find(func)', function(){
        it('returns a SimpleXMLElement with precisely one SimpleXMLNode');
    });
    describe('.forEach(func)', function(){
        it('returns nothing');
    });
    describe('.some(func)', function(){
        it('returns a boolean');
    });
    describe('.every(func)', function(){
        it('returns a boolean');
    });
});
