## Knockout.punches

Using the new APIs in [Knockout 3.0.0](https://github.com/knockout/knockout/releases/tag/v3.0.0beta), this plugin provides a set of enhanced binding syntaxes.

### Embedded text bindings

Rather than using the [`text`](http://knockoutjs.com/documentation/text-binding.html) binding, you can use double curly-brace syntax to insert dynamic text content. For example:

```html
<div>Hello {{ name }}.</div>
```

This method works by converting `{{expression}}` markup to `<!--ko text:expression--><!--/ko-->` before binding.

To enable this syntax, call `ko.punches.interpolationMarkup.enable();`. 

### Text filters

Rather than directly calling a function or using a computed observable to format output, you can use the filtering syntax. For example:

```html
<span data-bind="text: name | fit:20 | uppercase"></span>
```

This method works by converting `expression|filter[:arg1...]` to `ko.filters.filter(expression, arg1 ...)` before binding. A matching filter function must exist in `ko.filters`. 

To enable this syntax, call `ko.punches.textFilter.enableForBinding(<binding>);` for each binding that you want to use with filters.

#### Built-in filters

*Knockout.punches* includes the following filters:

1. `default:<defaultValue>` - If the value is blank or null, replace it with the given *default value*.
2. `fit:<length>[:<replacement>][:<where>]` - Trim the value if it’s longer than the given *length*. The trimmed portion is replaced with  `...` or the *replacement* value, if given. By default, the value is trimmed on the right but can be changed to `left` or `middle` through the *where* option. For example: `name | fit:10::'middle'` will convert `Shakespeare` to `Shak...are`.
3. `json[:space]` - Convert the value to a JSON string using `ko.toJSON`. You can give a *space* value to format the JSON output.
4. `lowercase` - Convert the value to lowercase.
5. `number` - Format the value using `toLocaleString`.
6. `replace:<search>:<replace>` - Perform a search and replace on the value using `String#replace`.
7. `uppercase` - Convert the value to uppercase.

#### Custom filters

You can create your own filters by adding them to `ko.filters`. Here is an example:

```javascript
// Custom filter can be used like "| append: 'xyz'"
ko.filters.append = function(value, arg1) {
    return '' + value + arg1;
};
```

### Namespaced dynamic bindings

When you have a set of bindings with the same functionality, the namespacing syntax allows you to dynamically create the handlers for those bindings based on which ones are used. For example, if you want to bind to arbitrary *data* attributes, you could create a `data` namespace, which you would then bind as follows:

```html
<div data-bind="data.color: color"></div>
```

Here’s how you would define the handler for the *data* namespace:

```javascript
ko.bindingHandlers.data = {
    getNamespacedHandler: function(binding) {
        return {
            update: function(element, valueAccessor) {
                element.setAttribute('data-' + binding, ko.unwrap(valueAccessor()));
            }
        };
    }
};
```

As the bindings in your documents are processed, *Knockout.punches* looks for bindings with the format `x.y: value` that don’t already have a binding handler. It then creates an `x.y` handler using the `x` namespace handler, or if none is found, it uses a default handler that calls the `x` binding with the value `{y: value}`. This default behavior allows you to use the namespace syntax to bind events, attributes, styles, and classes using the `event`, `attr`, `style`, and `css` namespaces respectively. For example:

```html
<div data-bind="style.color: currentProfit() < 0 ? 'red' : 'black'"></div>
```

#### Automatic namespacing



### Wrapped event callbacks

When binding functions in your model to events, it’s easy to simply provide the function reference to the binding such as `click: $parent.removePlace`. When bound this way, though, the reference to `$parent` is lost; the `removePlace` method will be called with a default `this` value (the current model object). (See this [Github issue](https://github.com/knockout/knockout/issues/378) for more information.)

By wrapping the method call in an anonymous function, like `click: function() {$parent.removePlace($data)}`, the `this` value is set correctly. The wrapped callback preprocessor in *Knockout.punches* does this for you, so you can use the simple reference syntax and know that `this` is the correct object in your method.

To enable this preprocessor, call `ko.punches.wrappedCallback.enableForBinding(<binding>);` for each binding that you want to use it with. If you want this functionality for a binding parameter, such as `template/afterRender`, call `ko.punches.preprocessBindingProperty.setPreprocessor('template', 'afterRender', ko.punches.wrappedCallback.preprocessor);`.

### Expression-based event handling






Knockout 3.0 includes three new APIs to extend the binding system with new syntaxes. Here’s a quick summary of the three methods:

1. Extend `ko.getBindingHandler` to dynamically create binding handlers.
2. Implement `ko.bindingProvider.instance.preprocessNode` to modify or replace DOM nodes before bindings are processed.
3. Implement `<bindingHandler>.preprocess` to modify the binding value before it is evaluated.


### License and Contact

**License:** MIT (http://www.opensource.org/licenses/mit-license.php)

Michael Best<br>
https://github.com/mbest<br>
mbest@dasya.com
