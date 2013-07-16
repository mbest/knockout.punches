// Support dynamically-created, namespaced bindings. The binding key syntax is
// "namespace.binding". Within a certain namespace, we can dynamically create the
// handler for any binding. This is particularly useful for bindings that work
// the same way, but just set a different named value, such as for element
// attributes or CSS classes.
var namespacedBindingMatch = /([^\.]+)\.(.+)/, namespaceDivider = '.';
function createNamespacedBindingHandler(bindingKey) {
    var match = bindingKey.match(namespacedBindingMatch);
    if (match) {
        var namespace = match[1],
            namespaceHandler = ko.bindingHandlers[namespace];
        if (namespaceHandler) {
            var bindingName = match[2],
                handlerFn = namespaceHandler.getNamespacedHandler || defaultGetNamespacedHandler,
                handler = handlerFn.call(namespaceHandler, bindingName, namespace, bindingKey);
            ko.bindingHandlers[bindingKey] = handler;
            return handler;
        }
    }
}

// Knockout's built-in bindings "attr", "event", "css" and "style" include the idea of
// namespaces, representing it using a single binding that takes an object map of names
// to values. This default handler translates a binding of "namespacedName: value"
// to "namespace: {name: value}" to automatically support those built-in bindings.
function defaultGetNamespacedHandler(name, namespace, namespacedName) {
    var handler = ko.utils.extend({}, this);
    function setHandlerFunction(funcName) {
        if (handler[funcName]) {
            handler[funcName] = function(element, valueAccessor) {
                function subValueAccessor() {
                    var result = {};
                    result[name] = valueAccessor();
                    return result;
                }
                var args = Array.prototype.slice.call(arguments, 0);
                args[1] = subValueAccessor;
                return ko.bindingHandlers[namespace][funcName].apply(this, args);
            };
        }
    }
    // Set new init and update functions that wrap the originals
    setHandlerFunction('init');
    setHandlerFunction('update');
    // Clear any preprocess function since preprocessing of the new binding would need to be different
    if (handler.preprocess)
        handler.preprocess = null;
    if (ko.virtualElements.allowedBindings[namespace])
        ko.virtualElements.allowedBindings[namespacedName] = true;
    return handler;
}

// Sets a preprocess function for every generated bindingKey.x binding. This can
// be called multiple times for the same binding, and the preprocess functions will
// be chained. If the binding has a custom getNamespacedHandler method, make sure that's
// set before this function is used.
function setDefaultNamespacedBindingPreprocessor(bindingKey, preprocessFn) {
    var handler = ko.getBindingHandler(bindingKey);
    if (handler) {
        var previousHandlerFn = handler.getNamespacedHandler || defaultGetNamespacedHandler;
        handler.getNamespacedHandler = function() {
            return setBindingPreprocessor(previousHandlerFn.apply(this, arguments), preprocessFn);
        };
    }
}

// ko.getBindingHandler will dynmically create namespaced bindings
var oldGetHandler = ko.getBindingHandler;
ko.getBindingHandler = function(bindingKey) {
    return oldGetHandler(bindingKey) || createNamespacedBindingHandler(bindingKey);
};

function autoNamespacedPreprocessor(value, binding, addBinding) {
    if (value.charAt(0) !== "{")
        return value;

    // Handle two-level binding specified as "binding: {key: value}" by parsing inner
    // object and converting to "binding.key: value"
    var subBindings = ko.expressionRewriting.parseObjectLiteral(value);
    ko.utils.arrayForEach(subBindings, function(keyValue) {
        addBinding(binding + namespaceDivider + keyValue.key, keyValue.value);
    });
}

// Set the namespaced preprocessor for a specific binding
function enableAutoNamespacedSyntax(bindingKey) {
    setBindingPreprocessor(bindingKey, autoNamespacedPreprocess);
}

// Export the preprocessor functions
ko.punches.namespacedBinding = {
    defaultGetHandler: defaultGetNamespacedHandler,
    //setDefaultBindingPreprocessor: setDefaultNamespacedBindingPreprocessor,
    preprocessor: autoNamespacedPreprocessor,
    enableForBinding: enableAutoNamespacedSyntax
};
