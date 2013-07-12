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
        try {
            ko.filters.test = function(input) { return input.toUpperCase(); };
            expect(eval(filterPreprocessor('"someText" | test'))).toEqual('SOMETEXT');
        } finally {
            delete ko.filters.test;
        }
    });

    it('Should pass arguments when applying filter', function() {
        try {
            ko.filters.test = function(input, length) { return input.slice(0, length);             };
            expect(eval(filterPreprocessor('"someText" | test:5'))).toEqual('someT');
        } finally {
            delete ko.filters.test;
        }
    });

    it('uppercase filter should convert text to uppercase', function() {
        expect(eval(filterPreprocessor('"someText" | uppercase'))).toEqual('SOMETEXT');
    });

    it('lowercase filter should convert text to lowercase', function() {
        expect(eval(filterPreprocessor('"someText" | lowercase'))).toEqual('sometext');
    });

    it('default filter should convert blank text to default value', function() {
        // non-blank value is not affected
        expect(eval(filterPreprocessor('"someText" | default:"blank"'))).toEqual('someText');
        // blank value is changed
        expect(eval(filterPreprocessor('"" | default:"blank"'))).toEqual('blank');
    });

    it('replace filter should replace found text in input', function() {
        expect(eval(filterPreprocessor('"someText" | replace:"some":"any"'))).toEqual('anyText');
    });

    it('fit filter should truncate text if appropriate', function() {
        // Does nothing if input is shorter than length
        expect(eval(filterPreprocessor('"someText" | fit:8'))).toEqual('someText');
        // Truncates and add ellipses if input is longer than length
        expect(eval(filterPreprocessor('"someText" | fit:7'))).toEqual('some...');
        // Truncates and add custom text if specified
        expect(eval(filterPreprocessor('"someText" | fit:7:"!"'))).toEqual('someTe!');
        // Truncates from the left if specified
        expect(eval(filterPreprocessor('"someText" | fit:7::"left"'))).toEqual('...Text');
        // Truncates in the middle if specified
        expect(eval(filterPreprocessor('"someText" | fit:7::"middle"'))).toEqual('so...xt');
    });

    it('json filter should convert input to JSON text', function() {
        // Converts string
        expect(eval(filterPreprocessor('"someText" | json'))).toEqual('"someText"');
        // Converts array
        expect(eval(filterPreprocessor('[1,2,3] | json'))).toEqual('[1,2,3]');
        // Converts object
        expect(eval(filterPreprocessor('{a:true, b:false, c:null} | json'))).toEqual('{"a":true,"b":false,"c":null}');
        // Accepts space argument
        expect(eval(filterPreprocessor('{a:true, b:false, c:null} | json:" "'))).toEqual('{\n "a": true,\n "b": false,\n "c": null\n}');
    });


});