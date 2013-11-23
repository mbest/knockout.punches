// Performance comparison at http://jsperf.com/markup-interpolation-comparison
function interpolationMarkupPreprocessor(node) {
    // only needs to work with text nodes
    if (node.nodeType === 3 && node.nodeValue && node.nodeValue.indexOf('{{') !== -1) {
        var nodes = [];
        function addTextNode(text) {
            if (text)
                nodes.push(document.createTextNode(text));
        }
        function wrapExpr(expressionText) {
            nodes.push.apply(nodes, ko.punches.interpolationMarkup.wrapExpresssion(expressionText));
        }
        function innerParse(text) {
            var innerMatch = text.match(/^([\s\S]*?)}}([\s\S]*)\{\{([\s\S]*)$/);
            if (innerMatch) {
                wrapExpr(innerMatch[1]);
                outerParse(innerMatch[2]);
                wrapExpr(innerMatch[3]);
            } else {
                wrapExpr(text);
            }
        }
        function outerParse(text) {
            var outerMatch = text.match(/^([\s\S]*?)\{\{([\s\S]*)}}([\s\S]*)$/);
            if (outerMatch) {
                addTextNode(outerMatch[1]);
                innerParse(outerMatch[2]);
                addTextNode(outerMatch[3]);
            } else {
                addTextNode(text);
            }
        }
        outerParse(node.nodeValue);
        if (nodes.length > 1) {
            if (node.parentNode) {
                for (var i = 0; i < nodes.length; i++) {
                    node.parentNode.insertBefore(nodes[i], node);
                }
                node.parentNode.removeChild(node);
            }
            return nodes;
        }
    }
}

function wrapExpresssion(expressionText) {
    return [
        document.createComment("ko text:" + expressionText),
        document.createComment("/ko")
    ];
};

function enableInterpolationMarkup() {
    setNodePreprocessor(interpolationMarkupPreprocessor);
}

// Export the preprocessor functions
ko.punches.interpolationMarkup = {
    preprocessor: interpolationMarkupPreprocessor,
    enable: enableInterpolationMarkup,
    wrapExpresssion: wrapExpresssion
};
