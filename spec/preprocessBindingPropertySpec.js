describe('Preprocess binding properties', function() {
    beforeEach(jasmine.prepareTestNode);

    it('Should preprocess the specified binding property', function() {
        try {
            var value;
            ko.bindingHandlers['a'] = {
                init: function(element, valueAccessor) {
                    value = valueAccessor();
                }
            };
            ko.punches.preprocessBindingProperty.setPreprocessor('a', 'b', function() {
                return '"new value"';
            });
            testNode.innerHTML = "<div data-bind='a: {b: \"old value\", c: \"unrelated value\"}'></div>";
            ko.applyBindings(null, testNode);
            expect(value).toEqual({ b : 'new value', c : 'unrelated value' });
        } finally {
            delete ko.bindingHandlers['a'];
        }
    });
});
