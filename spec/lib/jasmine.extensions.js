jasmine.Matchers.prototype.toEqualOneOf = function (expectedPossibilities) {
    for (var i = 0; i < expectedPossibilities.length; i++) {
        if (this.env.equals_(this.actual, expectedPossibilities[i])) {
            return true;
        }
    }
    return false;
};

function cleanedHtml(node) {
    var cleanedHtml = node.innerHTML.toLowerCase().replace(/\r\n/g, "");
    // IE < 9 strips whitespace immediately following comment nodes. Normalize by doing the same on all browsers.
    cleanedHtml = cleanedHtml.replace(/(<!--.*?-->)\s*/g, "$1");
    // Also remove __ko__ expando properties (for DOM data) - most browsers hide these anyway but IE < 9 includes them in innerHTML
    cleanedHtml = cleanedHtml.replace(/ __ko__\d+=\"(ko\d+|null)\"/g, "");
    return cleanedHtml;
}

jasmine.Matchers.prototype.toContainHtml = function (expectedHtml) {
    this.actual = cleanedHtml(this.actual); // Fix explanatory message
    return this.actual === expectedHtml;
};

jasmine.Matchers.prototype.toContainHtmlElementsAndText = function (expectedHtml) {
    this.actual = cleanedHtml(this.actual).replace(/<!--.+?-->/g, "");  // remove comments
    return this.actual === expectedHtml;
};

jasmine.nodeText = function(node) {
    return 'textContent' in node ? node.textContent : node.innerText;
}

jasmine.setNodeText = function(node, text) {
    'textContent' in node ? node.textContent = text : node.innerText = text;
}

jasmine.Matchers.prototype.toContainText = function (expectedText) {
    var actualText = jasmine.nodeText(this.actual);
    var cleanedActualText = actualText.replace(/\r\n/g, "\n");
    this.actual = cleanedActualText;    // Fix explanatory message
    return cleanedActualText === expectedText;
};

jasmine.Matchers.prototype.toHaveOwnProperties = function (expectedProperties) {
    var ownProperties = [];
    for (var prop in this.actual) {
        if (this.actual.hasOwnProperty(prop)) {
            ownProperties.push(prop);
        }
    }
    return this.env.equals_(ownProperties, expectedProperties);
};

jasmine.Matchers.prototype.toHaveTexts = function (expectedTexts) {
    var texts = ko.utils.arrayMap(this.actual.childNodes, jasmine.nodeText);
    this.actual = texts;   // Fix explanatory message
    return this.env.equals_(texts, expectedTexts);
};

jasmine.Matchers.prototype.toHaveValues = function (expectedValues) {
    var values = ko.utils.arrayMap(this.actual.childNodes, function (node) { return node.value; });
    this.actual = values;   // Fix explanatory message
    return this.env.equals_(values, expectedValues);
};

jasmine.Matchers.prototype.toHaveSelectedValues = function (expectedValues) {
    var selectedNodes = ko.utils.arrayFilter(this.actual.childNodes, function (node) { return node.selected; }),
        selectedValues = ko.utils.arrayMap(selectedNodes, function (node) { return ko.selectExtensions.readValue(node); });
    this.actual = selectedValues;   // Fix explanatory message
    return this.env.equals_(selectedValues, expectedValues);
};

jasmine.Matchers.prototype.toHaveNodeTypes = function (expectedTypes) {
    var values = ko.utils.arrayMap(this.actual, function (node) { return node.nodeType; });
    this.actual = values;   // Fix explanatory message
    return this.env.equals_(values, expectedTypes);
};

jasmine.prepareTestNode = function() {
    // The bindings specs make frequent use of this utility function to set up
    // a clean new DOM node they can execute code against
    var existingNode = document.getElementById("testNode");
    if (existingNode != null)
        existingNode.parentNode.removeChild(existingNode);
    testNode = document.createElement("div");
    testNode.id = "testNode";
    document.body.appendChild(testNode);
};
