describe("Expression callback bindings", function() {
    beforeEach(jasmine.prepareTestNode);

    it('Should call given expression when using \'on\' namespace', function() {
        var model = {
            subModel: {
                eventType: null,
                clickFunc: function(event) {
                    this.eventType = event.type;
                }
            }
        };
        testNode.innerHTML = "<button data-bind='on.click: subModel.clickFunc($event)'>hey</button>";
        ko.applyBindings(model, testNode);
        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        expect(model.subModel.eventType).toEqual("click");
    });
});
