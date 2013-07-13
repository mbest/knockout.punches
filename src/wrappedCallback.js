function isIdentifierOrProperty(expression) {
    // Matches either an isolated identifier or something ending with a property accessor
    return /^([$_a-z][$\w]*|.+(\.\s*[$_a-z][$\w]*|\[.+\]))$/i.test(expression);
}

function isFunctionLiteral(expression) {
    // Match a function literal, which start with "function" end with a parenthesis
    return /^[\(\s]*function\s*\(.*}[\)\s]*$/.test(expression);
}

function wrappedCallbackPreprocessor(val) {
    if (!isFunctionLiteral(val) && isIdentifierOrProperty(val)) {
        // call function literal in an anonymous function so that it is called
        // with appropriate "this" value
        return 'function(_x,_y,_z){return(' + val + ')(_x,_y,_z);}';
    } else {
        return val;
    }
}

// Set the wrappedCallback preprocessor for a specific binding
function enableWrappedCallback(bindingKey) {
    setBindingPreprocessor(bindingKey, wrappedCallbackPreprocessor);
}

// Export the preprocessor functions
ko.punches.wrappedCallback = {
    preprocessor: wrappedCallbackPreprocessor,
    enableForBinding: enableWrappedCallback
};
