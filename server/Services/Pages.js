"use strict";
var __viewLoader = require("../libs/ViewLoader");
var Pages = (function () {
    function Pages() {
    }
    Pages.prototype.main = function (name) {
        var viewLoader = new __viewLoader.ViewLoader({
            controller: this,
            viewFolderPath: this.provider.config.viewFolderPath,
            model: this.paramters
        });
        viewLoader.load(name);
        viewLoader.parse();
        return viewLoader.viewContent;
    };
    return Pages;
}());
exports.Pages = Pages;
