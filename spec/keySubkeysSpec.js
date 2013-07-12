describe('Key.Subkey Bindings', function() {
    beforeEach(jasmine.prepareTestNode);

    it('Should be able to set and use binding handlers with x.y syntax', function() {
        try {
            var initCalls = 0;
            ko.bindingHandlers['a.b'] = {
                init: function(element, valueAccessor) { if (valueAccessor()) initCalls++; }
            };
            testNode.innerHTML = "<div data-bind='a.b: true'></div>";
            ko.applyBindings(null, testNode);
            expect(initCalls).toEqual(1);
        } finally {
            delete ko.bindingHandlers['a.b'];
        }
    });

    it('Should be able to use x.y binding syntax to call \'x\' handler with \'y\' as object key', function() {
        try {
            var observable = ko.observable(), lastSubKey;
            ko.bindingHandlers['a'] = {
                update: function(element, valueAccessor) {
                    var value = valueAccessor();
                    for (var key in value)
                        if (ko.utils.unwrapObservable(value[key]))
                            lastSubKey = key;
                }
            };
            testNode.innerHTML = "<div data-bind='a.b: true, a.c: myObservable'></div>";
            ko.applyBindings({ myObservable: observable }, testNode);
            expect(lastSubKey).toEqual("b");

            // update observable to true so a.c binding gets updated
            observable(true);
            expect(lastSubKey).toEqual("c");
        } finally {
            delete ko.bindingHandlers['a'];
            delete ko.bindingHandlers['a.b'];
            delete ko.bindingHandlers['a.c'];
        }
    });

    it('Should be able to define a custom handler for x.y binding syntax', function() {
        try {
            var observable = ko.observable(), lastSubKey;
            ko.bindingHandlers['a'] = {
                makeSubkeyHandler: function(baseKey, subKey) {
                    return {
                        update: function(element, valueAccessor) {
                            if (ko.utils.unwrapObservable(valueAccessor()))
                                lastSubKey = subKey;
                        }
                    };
                }
            };
            testNode.innerHTML = "<div data-bind='a.b: true, a.c: myObservable'></div>";
            ko.applyBindings({ myObservable: observable }, testNode);
            expect(lastSubKey).toEqual("b");

            // update observable to true so a.c binding gets updated
            observable(true);
            expect(lastSubKey).toEqual("c");
        } finally {
            delete ko.bindingHandlers['a'];
            delete ko.bindingHandlers['a.b'];
            delete ko.bindingHandlers['a.c'];
        }
    });

    it('Should be able to use x.y binding syntax in virtual elements if \'x\' binding supports it', function() {
        try {
            var lastSubKey;
            ko.bindingHandlers['a'] = {
                update: function(element, valueAccessor) {
                    var value = valueAccessor();
                    for (var key in value)
                        if (ko.utils.unwrapObservable(value[key]))
                            lastSubKey = key;
                }
            };
            ko.virtualElements.allowedBindings.a = true;

            testNode.innerHTML = "x <!-- ko a.b: true --><!--/ko-->";
            ko.applyBindings(null, testNode);
            expect(lastSubKey).toEqual("b");
        } finally {
            delete ko.bindingHandlers['a'];
            delete ko.bindingHandlers['a.b'];
        }
    });

    it('Should be able use x.y through ko.applyBindingsToNode', function() {
        try {
            var lastSubKey;
            ko.bindingHandlers['a'] = {
                update: function(element, valueAccessor) {
                    var value = valueAccessor();
                    for (var key in value)
                        if (ko.utils.unwrapObservable(value[key]))
                            lastSubKey = key;
                }
            };

            testNode.innerHTML = "<div></div>";
            ko.applyBindingsToNode(testNode.childNodes[0], {'a.b': true}, null);
            ko.applyBindings(null, testNode);
            expect(lastSubKey).toEqual("b");
        } finally {
            delete ko.bindingHandlers['a'];
            delete ko.bindingHandlers['a.b'];
        }
    });

    it('Should not run updates for all x.y bindings if only one needs to run', function() {
        try {
            var observable = ko.observable('A'), updateCounts = [0,0,0];
            ko.bindingHandlers.test = {
                update: function(element, valueAccessor) {
                    var value = valueAccessor();
                    for (var key in value)
                        if (ko.utils.unwrapObservable(value[key]))
                            updateCounts[key]++;
                }
            };
            testNode.innerHTML = "<div data-bind='test.1: myObservable, test.2: true'></div>";

            ko.applyBindings({ myObservable: observable }, testNode);
            expect(updateCounts[1]).toEqual(1);
            expect(updateCounts[2]).toEqual(1);

            // update the observable and check that only the first binding was updated
            observable('B');
            expect(updateCounts[1]).toEqual(2);
            expect(updateCounts[2]).toEqual(1);
        } finally {
            delete ko.bindingHandlers['test'];
            delete ko.bindingHandlers['test.1'];
            delete ko.bindingHandlers['test.2'];
        }
    });

    it('Should be able to supply event type as event.type', function() {
        try {
            var model = { clickCalled: false };
            testNode.innerHTML = "<button data-bind='event.click: function() { clickCalled = true; }'>hey</button>";
            ko.applyBindings(model, testNode);
            ko.utils.triggerEvent(testNode.childNodes[0], "click");
            expect(model.clickCalled).toEqual(true);
        } finally {
            delete ko.bindingHandlers['event.click'];
        }
    });

    it('Should be able to set CSS class as css.classname', function() {
        try {
            var observable1 = new ko.observable();
            testNode.innerHTML = "<div data-bind='css.myRule: someModelProperty'>Hallo</div>";
            ko.applyBindings({ someModelProperty: observable1 }, testNode);

            expect(testNode.childNodes[0].className).toEqual("");
            observable1(true);
            expect(testNode.childNodes[0].className).toEqual("myRule");
        } finally {
            delete ko.bindingHandlers['css.myRule'];
        }
    });

    it('Should be able to set CSS style as style.stylename', function() {
        try {
            var myObservable = new ko.observable("red");
            testNode.innerHTML = "<div data-bind='style.backgroundColor: colorValue'>Hallo</div>";
            ko.applyBindings({ colorValue: myObservable }, testNode);

            expect(testNode.childNodes[0].style.backgroundColor).toEqualOneOf(["red", "#ff0000"]); // Opera returns style color values in #rrggbb notation, unlike other browsers
            myObservable("green");
            expect(testNode.childNodes[0].style.backgroundColor).toEqualOneOf(["green", "#008000"]);
            myObservable(undefined);
            expect(testNode.childNodes[0].style.backgroundColor).toEqual("");
        } finally {
            delete ko.bindingHandlers['style.backgroundColor'];
        }
    });

    it('Should be able to set attribute as attr.name', function() {
        try {
            var model = { myprop : ko.observable("initial value") };
            testNode.innerHTML = "<div data-bind='attr.someAttrib: myprop'></div>";
            ko.applyBindings(model, testNode);
            expect(testNode.childNodes[0].getAttribute("someAttrib")).toEqual("initial value");

            // Change the observable; observe it reflected in the DOM
            model.myprop("new value");
            expect(testNode.childNodes[0].getAttribute("someAttrib")).toEqual("new value");
        } finally {
            delete ko.bindingHandlers['attr.someAttrib'];
        }
    });
});
