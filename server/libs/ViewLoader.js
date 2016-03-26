"use strict";
var __fs = require("fs");
var ViewLoader = (function () {
    function ViewLoader(params, viewScriptVars) {
        this.viewScriptVars = (viewScriptVars) ? viewScriptVars : {};
        this.controller = params.controller;
        this.getValueFunction = params.getValueFunction;
        this.setValueFunction = params.setValueFunction;
        this.viewFolderPath = params.viewFolderPath;
        this.viewContent = params.viewContent;
        this.orginViewContent = params.orginViewContent;
        this.viewscriptMatches = params.viewscriptMatches;
        this.model = params.model;
        this.params = params;
    }
    ViewLoader.prototype.load = function (viewName) {
        var viewLoaderInstance = this;
        if (this.controller) {
            this.controller.provider.contentType = "text/html";
            this.controller.getValue = function (key) {
                if (!viewLoaderInstance.getValueFunction) {
                    return this.model[key];
                }
                else {
                    return viewLoaderInstance.getValueFunction(key);
                }
            };
            this.controller.setValue = function (key, value) {
                if (!viewLoaderInstance.setValueFunction) {
                    this.model[key] = value;
                }
                else {
                    viewLoaderInstance.setValueFunction(key, value);
                }
            };
            var filePath = this.viewFolderPath + "/" + viewName + ".view";
            if (__fs.existsSync(filePath)) {
                this.orginViewContent = new String(__fs.readFileSync(filePath));
                this.viewContent = this.orginViewContent;
            }
            else {
                throw new Error("View Path is not exists");
            }
            this.findViewScripts();
        }
    };
    ViewLoader.prototype.findViewScripts = function () {
        if (this.orginViewContent) {
            var regex = /<\?vs([\w\W][^\?]*)\?>/g;
            var match;
            this.viewscriptMatches = [];
            while ((match = regex.exec(this.orginViewContent)) !== null) {
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                this.viewscriptMatches.push(match);
            }
        }
    };
    ViewLoader.prototype.parse = function () {
        if (this.viewscriptMatches) {
            if (this.orginViewContent) {
                for (var _i = 0, _a = this.viewscriptMatches; _i < _a.length; _i++) {
                    var match = _a[_i];
                    var script = match[1];
                    var contentString = eval("(function(vars, model, viewLoader){" + script + "}).call(this.controller, this.viewScriptVars, this.model, this);");
                    if (!contentString) {
                        contentString = "";
                    }
                    this.viewContent = this.viewContent.replace(match[0], contentString);
                }
            }
        }
    };
    ViewLoader.prototype.importContent = function (viewName) {
        var viewLoader = new ViewLoader(this.params, this.viewScriptVars);
        viewLoader.load(viewName);
        viewLoader.parse();
        return viewLoader.viewContent;
    };
    return ViewLoader;
}());
exports.ViewLoader = ViewLoader;
