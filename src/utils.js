
// Add a preprocess funtion to a binding handler.
function setBindingPreprocessFunction(bindingKey, preprocessFn) {
    // Get the binding handler or create a new, empty one
    var handler = ko.getBindingHandler(bindingKey) || (ko.bindingHandlers[bindingKey] = {});
    if (handler.preprocess) {
        // If the handler already has a preprocess function, chain the new
        // one after the existing one. If the previous function in the chain
        // returns a falsy value (to remove the binding), the chain ends. This
        // method allows each function to modify and return the binding value.
        var previousPreprocessFn = handler.preprocess;
        handler.preprocess = function(value, key, addBinding) {
            value = previousPreprocessFn.call(this, value, key, addBinding);
            if (value)
                return preprocessFn.call(this, value, key, addBinding);
        };
    } else {
        handler.preprocess = preprocessFn;
    }
}


// Add a preprocess funtion to a binding handler.
function setBindingPreprocessFunction2(bindingKey, preprocessFn) {
    // Get the binding handler or create a new, empty one
    var handler = ko.getBindingHandler(bindingKey) || (ko.bindingHandlers[bindingKey] = {});
    if (handler._preprocessList) {
        // Add the new preprocess function to the list
        preprocessList.push(preprocessFn);
    } else if (handler.preprocess) {
        // If the handler already has a preprocess function, chain the new
        // one after the existing one.
        var preprocessList = handler._preprocessList = [handler.preprocess, preprocessFn];
        handler.preprocess = function(value, key, addBinding) {
            for (var i=0, n=preprocessList.length; value && i < n; i++) {
                value = preprocessList[i].call(this, value, key, addBinding);
            }
            return value;
        };
    } else {
        // If there isn't already a preprocess function, just set it
        handler.preprocess = preprocessFn;
    }
}


// Add a preprocessNode function to the binding provider. If a
// function already exists, chain the new one after it. This calls
// each function in the chain until one modifies the node. This
// method allows only one function to modify the node.
function setNodePreprocessFunction(preprocessFn) {
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
