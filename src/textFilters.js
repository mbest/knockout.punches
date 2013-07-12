var filters = {};

filters.uppercase = function(input) {
    return String.prototype.toUpperCase.call(input);
};

filters.lowercase = function(input) {
    return String.prototype.toUpperCase.call(input);
};

// Export the filters object for general access
ko.filters = filters;

// Convert input in the form of `expression | filter1 | filter2:arg1:arg2` to a function call format
// with filters accessed as ko.filters.filter1, etc.
function filterPreprocessor(input) {
    // Check if the input contains any | characters; if not, just return
    if (input.indexOf('|') === -1)
        return input;

    // Split the input into tokens, in which | and : are individual tokens, quoted strings are ignored, and all tokens are space-trimmed
    var tokens = input.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|[|:]+|[^\s|:"'][^|:"']*[^\s|:"']|[^\s|:"']/g);
    if (tokens && tokens.length > 1) {
        // Append a line so that we don't need a separate code block to deal with the last item
        tokens.push('|');
        input = tokens[0];
        var token, inFilters = false, nextIsFilter = false;
        for (var i = 1, token; token = tokens[i]; ++i) {
            if (token === '|') {
                if (inFilters)
                    input += ')';
                nextIsFilter = true;
                inFilters = true;
            } else if (!inFilters) {
                input += token;
            } else if (token === ':') {
                nextIsFilter = false;
            } else if (nextIsFilter) {
                input = "ko.filters." + token + "(" + input;
            } else {
                input += "," + token;
            }
        }
    }
    return input;
}

// Set the filter preprocessor for a specific binding
function enableTextFilter(bindingKey) {
    setBindingPreprocessFunction(bindingKey, filterPreprocessor);
}
