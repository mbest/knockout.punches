describe("Interpolation Markup preprocessor", function() {

    it('Should return undefined when there are no bindings', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some text"));
        expect(result).toBeUndefined();
    });

    it('Should return undefined when empty text', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode(""));
        expect(result).toBeUndefined();
    });

    it('Should not parse unclosed binding', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some {{ text"));
        expect(result).toBeUndefined();
    });

    it('Should not parse unopened binding', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some }} text"));
        expect(result).toBeUndefined();
    });

    it('Should replace {{...}} binding with new nodes', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some {{ expr }} text"));
        expect(result).toHaveNodeTypes([3, 8, 8, 3]);   // text, comment, comment, text
    });

    it('Should ignore unmatched delimiters', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some {{ expr }} }} text"));
        expect(result).toHaveNodeTypes([3, 8, 8, 3]);   // text, comment, comment, text
    });

    it('Should replace each binding with new nodes', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some {{ expr1 }} middle {{ expr2 }} text"));
        expect(result).toHaveNodeTypes([3, 8, 8, 3, 8, 8, 3]);   // text, comment, comment, text, comment, comment, text
    });

    it('Should skip nodes if empty', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("{{ expr1 }}{{ expr2 }}"));
        expect(result).toHaveNodeTypes([8, 8, 8, 8]);   // comment, comment, comment, comment
    });
});

describe("Interpolation Markup bindings", function() {
    beforeEach(jasmine.prepareTestNode);

    var savePreprocessNode = ko.bindingProvider.instance.preprocessNode;
    beforeEach(ko.punches.interpolationMarkup.enable);
    afterEach(function() { ko.bindingProvider.instance.preprocessNode = savePreprocessNode; });

    it('Should replace {{...}} binding with virtual text binding', function() {
        testNode.innerHTML = "hello {{'name'}}!";
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello name!");
        expect(testNode).toContainHtml("hello <!--ko text:'name'-->name<!--/ko-->!");
    });

    it('Should replace multiple bindings', function() {
        testNode.innerHTML = "hello {{'name'}}{{'!'}}";
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello name!");
    });

    it('Should support any contents of binding, including functions and {{}}', function() {
        testNode.innerHTML = "hello {{ (function(){return '{{name}}'}()) }}!";
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello {{name}}!");
    });

    it('Should ignore unmatched }} and {{', function() {
        testNode.innerHTML = "hello }}'name'{{'!'}}{{";
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello }}'name'!{{");
    });
});
