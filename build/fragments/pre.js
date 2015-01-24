/**
 * @license Knockout.Punches
 * Enhanced binding syntaxes for Knockout 3+
 * (c) Michael Best
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 * Version 0.5.1
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['knockout'], factory);
    } else if (typeof module === "object") {
        // CommonJS module
        var ko = require("knockout");
        factory(ko);
    } else {
        // Browser globals
        factory(window.ko);
    }
}(function(ko) {

