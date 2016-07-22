var should = require('chai').should();
var trixml = require('..');

describe('XMLNodeCollection', function() {

    it('should extend Object, Function, Proxy', function(){
        var xml = trixml.parseSync("<A></A>");
        xml.should.be.instanceof(Object);
        xml.should.be.instanceof(Function);
        xml.should.be.instanceof(Proxy);
    });
    it('contains exactly one member when created from an XML string', function(){
        var xml1 = trixml.parseSync('<?xml version="1.0" encoding="UTF-8"?><A></A><B></B><C></C>');
        xml1.length.should.equal(1);
        xml1.name.should.equal("A");

        should.throw(function(){
            var xml2 = trixml.parseSync('<?xml version="1.0" encoding="UTF-8"?>');
            xml2.hello;
        });
    });

    describe('addNode(name, attributes, value)', function(){
        it('should add a child node to the first member of this collection');
        it('can add multiple child nodes of the same name to the first member of this collection');

    });
    describe('attr(attrName)', function(){});
    describe('get(nodeName)', function(){});

    describe('.nodeName', function(){

        it('always returns a XMLNodeCollection');
        it('always returns a XMLNodeCollection with at least one member SimpleXMLNode');

        it('should not throw when requesting non-existing nodes', function(){
            var xml = trixml.parseSync("<A></A>");
            should.exist(xml.B.C.D.E);
        });
        it('has names for non-existing nodes', function(){
            var xml = trixml.parseSync("<A></A>");
            xml.B.C.D.name.should.equal('D');
        });
        it('has attributes for non-existing nodes', function(){
            var xml = trixml.parseSync("<A></A>");
            xml.B.C.D.attr('attr-of-anon-node').should.equal("");
        });

        it('creates & adds a node to the collection if it doesn\'t already exist', function() {
            var xml = trixml.parseSync("<Root><B>b1</B><A>a1</A><A>a2</A><B>b2</B></Root>");
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
            var xml = trixml.parseSync("<Root><B>b1</B><A>a1</A><A>a2</A><B>b2</B></Root>");
            xml.A.toString().should.equal("a1");
        });
        it('should treat CDATA blocks as values', function() {
            var xml = trixml.parseSync("<Root><A><![CDATA[ok]]></A></Root>");
            xml.A.toString().should.equal("ok");
        });
        it('should concat CDATA blocks with values', function() {
            var xml1 = trixml.parseSync("<Root><A>a-<![CDATA[ok]]>! <![CDATA[yeah!]]></A></Root>");
            xml1.A.toString().should.equal("a-ok! yeah!");
            var xml2 = trixml.parseSync("<Root><A><![CDATA[a-]]>ok<![CDATA[! ]]>yeah!</A></Root>");
            xml2.A.toString().should.equal("a-ok! yeah!");
        });
        it('should ignore comments', function() {
            var xml1 = trixml.parseSync("<Root><A><!-- a comment! --></A></Root>");
            xml1.A.toString().should.equal("");
            var xml2 = trixml.parseSync("<Root><A>1<!-- a comment! -->2</A></Root>");
            xml2.A.toString().should.equal("12");
        });
    });

    describe('.nodeName.children', function(){

        it('should return only children of the first child matching nodeName', function() {
            var xml = trixml.parseSync("<Root><B><A>1</A></B><B><A>2</A></B></Root>");
            xml.B.A.toString().should.equal("1");
            xml.B.children.length.should.equal(1);
        });
        it('should be empty if nodeName is a non-existing node', function() {
            var xml = trixml.parseSync("<Root></Root>");
            xml.A.B.children.length.should.equal(0);
        });
    });

    describe('.map(func)', function(){
        it('returns an Array which is not a XMLNodeCollection');
        it('maps only elements which match the node name', function(){
            var xml = trixml.parseSync("<Root><B>b1</B><A>a1</A><A>a2</A><B>b2</B></Root>");
            xml.A.map(a => a.value).join(',').should.equal('a1,a2');
            xml.B.map(b => b.value).join(',').should.equal('b1,b2');
        });
    });
    describe('.filter(func)', function(){
        it('returns a XMLNodeCollection');
        it('can return an empty XMLNodeCollection');
    });
    describe('.find(func)', function(){
        it('returns a XMLNodeCollection with precisely one SimpleXMLNode');
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
