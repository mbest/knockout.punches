// Wrap an expression in an anonymous function so that it is called when the event happens
function makeExpressionCallbackPreprocessor(args) {
    return function expressionCallbackPreprocessor(val) {
        return 'function('+args+'){return(' + val + ');}';
    };
}

var eventExpressionPreprocessor = makeExpressionCallbackPreprocessor("$data,$event");

// Set the expressionCallback preprocessor for a specific binding
function enableExpressionCallback(bindingKeyOrHandler, args) {
    var args = Array.prototype.slice.call(arguments, 1).join();
    addBindingPreprocessor(bindingKeyOrHandler, makeExpressionCallbackPreprocessor(args));
}

// Export the preprocessor functions
ko_punches.expressionCallback = {
    makePreprocessor: makeExpressionCallbackPreprocessor,
    eventPreprocessor: eventExpressionPreprocessor,
    enableForBinding: enableExpressionCallback
};

// Create an "on" namespace for events to use the expression method
ko.bindingHandlers.on = {
    getNamespacedHandler: function(eventName) {
        var handler = ko.getBindingHandler('event' + namespaceDivider + eventName);
        return addBindingPreprocessor(handler, eventExpressionPreprocessor);
    }
};
