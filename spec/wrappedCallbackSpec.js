describe("Wrapped callback preprocessor", function() {
    var wrappedCallbackPreprocessor = ko.punches.wrappedCallback.preprocessor;

    it('Should convert plain identifier into function literal', function() {
        expect(wrappedCallbackPreprocessor('input'))
            .toEqual("function(_x,_y,_z){return(input)(_x,_y,_z);}");
    });

    it('Should convert property accessor dot operator into function literal', function() {
        expect(wrappedCallbackPreprocessor('obj.prop'))
            .toEqual("function(_x,_y,_z){return(obj.prop)(_x,_y,_z);}");
    });

    it('Should convert property accessor using brackets into function literal', function() {
        expect(wrappedCallbackPreprocessor('obj[prop]'))
            .toEqual("function(_x,_y,_z){return(obj[prop])(_x,_y,_z);}");
    });

    it('Should do nothing with expression containing other operators', function() {
        expect(wrappedCallbackPreprocessor('a+a')).toEqual("a+a");
        expect(wrappedCallbackPreprocessor('(1+2)')).toEqual("(1+2)");
        expect(wrappedCallbackPreprocessor('(null)')).toEqual("(null)");
        expect(wrappedCallbackPreprocessor('abc(1,2,3)')).toEqual("abc(1,2,3)");
    });

    it('Should do nothing with function literals', function() {
        expect(wrappedCallbackPreprocessor('function(){return true;}'))
            .toEqual("function(){return true;}");
    });
});

describe("Wrapped callback bindings", function() {
    beforeEach(jasmine.prepareTestNode);

    it('Should set correct \'this\' in called function', function() {
        try {
            ko.punches.wrappedCallback.enableForBinding('click');
            var model = { subModel: { wasCalled: false, clickFunc: function() {this.wasCalled = true} } };
            testNode.innerHTML = "<button data-bind='click: subModel.clickFunc'>hey</button>";
            ko.applyBindings(model, testNode);
            ko.utils.triggerEvent(testNode.childNodes[0], "click");
            expect(model.subModel.wasCalled).toEqual(true);
        } finally {
            ko.bindingHandlers.click.preprocess = null;
        }
    });
});
