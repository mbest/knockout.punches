// Add a preprocess function to a binding handler.
function addBindingPreprocessor(bindingKeyOrHandler, preprocessFn) {
    return chainPreprocessor(getOrCreateHandler(bindingKeyOrHandler), 'preprocess', preprocessFn);
}

// These utility functions are separated out because they're also used by
// preprocessBindingProperty

// Get the binding handler or create a new, empty one
function getOrCreateHandler(bindingKeyOrHandler) {
    return typeof bindingKeyOrHandler === 'object' ? bindingKeyOrHandler :
        (ko.getBindingHandler(bindingKeyOrHandler) || (ko.bindingHandlers[bindingKeyOrHandler] = {}));
}
// Add a preprocess function
function chainPreprocessor(obj, prop, fn) {
    if (obj[prop]) {
        // If the handler already has a preprocess function, chain the new
        // one after the existing one. If the previous function in the chain
        // returns a falsy value (to remove the binding), the chain ends. This
        // method allows each function to modify and return the binding value.
        var previousFn = obj[prop];
        obj[prop] = function(value, binding, addBinding) {
            value = previousFn.call(this, value, binding, addBinding);
            if (value)
                return fn.call(this, value, binding, addBinding);
        };
    } else {
        obj[prop] = fn;
    }
    return obj;
}

// Add a preprocessNode function to the binding provider. If a
// function already exists, chain the new one after it. This calls
// each function in the chain until one modifies the node. This
// method allows only one function to modify the node.
function addNodePreprocessor(preprocessFn) {
    var provider = ko.bindingProvider.instance;
    if (provider.preprocessNode) {
        var previousPreprocessFn = provider.preprocessNode;
        provider.preprocessNode = function(node) {
            var newNodes = previousPreprocessFn.call(this, node);
            if (!newNodes)
                newNodes = preprocessFn.call(this, node);
            return newNodes;
        };
    } else {
        provider.preprocessNode = preprocessFn;
    }
}

function addBindingHandlerCreator(matchRegex, callbackFn) {
    var oldGetHandler = ko.getBindingHandler;
    ko.getBindingHandler = function(bindingKey) {
        var match;
        return oldGetHandler(bindingKey) || ((match = bindingKey.match(matchRegex)) && callbackFn(match, bindingKey));
    };
}

// Create shortcuts to commonly used ko functions
var ko_unwrap = ko.unwrap;

// Create "punches" object and export utility functions
var ko_punches = ko.punches = {
    utils: {
        addBindingPreprocessor: addBindingPreprocessor,
        addNodePreprocessor: addNodePreprocessor,
        addBindingHandlerCreator: addBindingHandlerCreator,

        // previous names retained for backwards compitibility
        setBindingPreprocessor: addBindingPreprocessor,
        setNodePreprocessor: addNodePreprocessor
    }
};

ko_punches.enableAll = function () {
    // Enable interpolation markup
    enableInterpolationMarkup();
    enableAttributeInterpolationMarkup();

    // Enable auto-namspacing of attr, css, event, and style
    enableAutoNamespacedSyntax('attr');
    enableAutoNamespacedSyntax('css');
    enableAutoNamespacedSyntax('event');
    enableAutoNamespacedSyntax('style');

    // Make sure that Knockout knows to bind checked after attr.value (see #40)
    ko.bindingHandlers.checked.after.push('attr.value');

    // Enable filter syntax for text, html, and attr
    enableTextFilter('text');
    enableTextFilter('html');
    addDefaultNamespacedBindingPreprocessor('attr', filterPreprocessor);
    addDefaultNamespacedBindingPreprocessor('css', filterPreprocessor);
    addDefaultNamespacedBindingPreprocessor('style', filterPreprocessor);

    // Enable wrapped callbacks for click, submit, event, optionsAfterRender, and template options
    enableWrappedCallback('click');
    enableWrappedCallback('submit');
    enableWrappedCallback('optionsAfterRender');
    addDefaultNamespacedBindingPreprocessor('event', wrappedCallbackPreprocessor);
    addBindingPropertyPreprocessor('template', 'beforeRemove', wrappedCallbackPreprocessor);
    addBindingPropertyPreprocessor('template', 'afterAdd', wrappedCallbackPreprocessor);
    addBindingPropertyPreprocessor('template', 'afterRender', wrappedCallbackPreprocessor);
};
