"use strict";
var __cookie = require("../libs/cookies/Cookie");
var __viewLoader = require("../libs/ViewLoader");
function setupController(controller, viewName) {
    controller.model = {};
    var viewLoader = new __viewLoader.ViewLoader({
        controller: controller,
        viewFolderPath: controller.provider.config.viewFolderPath,
        model: {
            key: "Value",
            text: "ich bin cool"
        }
    });
    viewLoader.load(viewName);
    viewLoader.parse();
    return viewLoader.viewContent;
}
var Test = (function () {
    function Test() {
    }
    Test.prototype.test = function (param) {
        return "Jo hdhd log with param " + param;
    };
    Test.prototype.cookieTest = function () {
        if (!this.provider.cookieManager.cookies["user2"]) {
            console.log("create cookie");
            var cookie = new __cookie.Cookie({
                cookieName: "user2",
                expire: new Date(Date.now() + (60000 * 1)).toUTCString(),
                httpOnly: true
            });
            cookie.addValue("username", "Marius");
            cookie.addValue("userid", "44758539339");
            this.provider.cookieManager.addCookie(cookie);
        }
        console.log(this.provider.cookieManager.cookies);
        return this.provider.cookieManager.cookies["user2"].getValue("username");
    };
    Test.prototype.showView = function () {
        return setupController(this, "Test");
    };
    Test.prototype.sessionTest = function () {
    };
    return Test;
}());
exports.Test = Test;
