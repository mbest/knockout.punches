// Performance comparison at http://jsperf.com/markup-interpolation-comparison
function parseInterpolationMarkup(textToParse, outerTextCallback, expressionCallback) {
    function innerParse(text) {
        var innerMatch = text.match(/^([\s\S]*?)}}([\s\S]*)\{\{([\s\S]*)$/);
        if (innerMatch) {
            expressionCallback(innerMatch[1]);
            outerParse(innerMatch[2]);
            expressionCallback(innerMatch[3]);
        } else {
            expressionCallback(text);
        }
    }
    function outerParse(text) {
        var outerMatch = text.match(/^([\s\S]*?)\{\{([\s\S]*)}}([\s\S]*)$/);
        if (outerMatch) {
            outerTextCallback(outerMatch[1]);
            innerParse(outerMatch[2]);
            outerTextCallback(outerMatch[3]);
        } else {
            outerTextCallback(text);
        }
    }
    outerParse(textToParse);
}

function interpolationMarkupPreprocessor(node) {
    // only needs to work with text nodes
    if (node.nodeType === 3 && node.nodeValue && node.nodeValue.indexOf('{{') !== -1) {
        var nodes = [];
        function addTextNode(text) {
            if (text)
                nodes.push(document.createTextNode(text));
        }
        function wrapExpr(expressionText) {
            if (expressionText)
                nodes.push.apply(nodes, ko_punches_interpolationMarkup.wrapExpresssion(expressionText));
        }
        parseInterpolationMarkup(node.nodeValue, addTextNode, wrapExpr)

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
var ko_punches_interpolationMarkup = ko_punches.interpolationMarkup = {
    preprocessor: interpolationMarkupPreprocessor,
    enable: enableInterpolationMarkup,
    wrapExpresssion: wrapExpresssion
};


function attributeInterpolationMarkerPreprocessor(node) {
    if (node.nodeType === 1 && node.attributes.length) {
        var dataBindAttribute = node.getAttribute('data-bind');
        for (var attrs = node.attributes, i = attrs.length-1; i >= 0; --i) {
            var attr = attrs[i];
            if (attr.specified && attr.name != 'data-bind' && attr.value.indexOf('{{') !== -1) {
                var parts = [], attrBinding = 0;
                function addText(text) {
                    if (text)
                        parts.push('"' + text.replace(/"/g, '\\"') + '"');
                }
                function addExpr(expressionText) {
                    if (expressionText) {
                        attrBinding = expressionText;
                        parts.push('ko.unwrap(' + expressionText + ')');
                    }
                }
                parseInterpolationMarkup(attr.value, addText, addExpr);

                if (parts.length > 1) {
                    attrBinding = '""+' + parts.join('+');
                }

                if (attrBinding) {
                    attrBinding = 'attr.' + attr.name + ':' + attrBinding;
                    if (!dataBindAttribute) {
                        dataBindAttribute = attrBinding
                    } else {
                        dataBindAttribute += ',' + attrBinding;
                    }
                    node.setAttribute('data-bind', dataBindAttribute);
                    node.removeAttributeNode(attr);
                }
            }
        }
    }
}

function enableAttributeInterpolationMarkup() {
    setNodePreprocessor(attributeInterpolationMarkerPreprocessor);
}

var ko_punches_attributeInterpolationMarkup = ko_punches.attributeInterpolationMarkup = {
    preprocessor: attributeInterpolationMarkerPreprocessor,
    enable: enableAttributeInterpolationMarkup
};
