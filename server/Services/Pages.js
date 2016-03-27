"use strict";
var __viewLoader = require("../libs/ViewLoader");
var Pages = (function () {
    function Pages() {
    }
    Pages.prototype.main = function () {
        var path = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            path[_i - 0] = arguments[_i];
        }
        var viewLoader = new __viewLoader.ViewLoader({
            controller: this,
            viewFolderPath: this.provider.config.viewFolderPath,
            model: this.paramters
        });
        viewLoader.load(path.join("/"));
        viewLoader.parse();
        return viewLoader.viewContent;
    };
    return Pages;
}());
exports.Pages = Pages;
