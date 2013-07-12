describe("Text Filters", function() {
    it('Should convert basic input|filter syntax into function calls', function() {
        expect(filterPreprocessor('input|filter1|filter2:arg|filter3:arg1:arg2'))
            .toEqual("ko.filters['filter3'](ko.filters['filter2'](ko.filters['filter1'](input),arg),arg1,arg2)");
    });

    it('Should not be confused by | in quotes, or : or || in input', function() {
        expect(filterPreprocessor('input1||(input2?a:b)||"A|B"|filter'))
            .toEqual("ko.filters['filter'](input1||(input2?a:b)||\"A|B\")");
    });

    it('Should tolerate spaces or newlines in the input', function() {
        expect(filterPreprocessor('input \n| filter\n | filter2'))
            .toEqual("ko.filters['filter2'](ko.filters['filter'](input))");
    });

    it('Should be able to run filter output and apply filters to input', function() {
        expect(eval(filterPreprocessor('"someText" | uppercase')))
            .toEqual('SOMETEXT');
    });

    it('Should pass arguments when applying filter', function() {
        try {
            ko.filters.test = function(input, length) {
                return input.slice(0, length);
            };
            expect(eval(filterPreprocessor('"someText" | test:5')))
                .toEqual('someT');
        } finally {
            delete ko.filters.test;
        }
    });

});