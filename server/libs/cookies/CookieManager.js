"use strict";
var __cookie = require("./Cookie");
var __utilities = require("../Utilities");
var CookieManager = (function () {
    function CookieManager() {
        this.cookies = {};
        this.setedCookies = {};
    }
    CookieManager.prototype.setup = function (cookies) {
        this.cookies = {};
        this.setedCookies = {};
        if (cookies) {
            for (var _i = 0, _a = cookies.split(";"); _i < _a.length; _i++) {
                var cookie = _a[_i];
                var values = cookie.split("=");
                var cookieValue;
                try {
                    cookieValue = JSON.parse(values[1]);
                }
                catch (e) {
                    cookieValue = values[1];
                }
                var cookieObj = new __cookie.Cookie({
                    cookieName: values[0],
                    values: cookieValue
                });
                this.cookies[values[0]] = cookieObj;
            }
        }
    };
    CookieManager.prototype.toHTTPField = function (field) {
        if (!field)
            field = [];
        if (!__utilities.Utilities.isEmpty(this.setedCookies)) {
            for (var key in this.setedCookies) {
                var cookieHeader = ["Set-Cookie", this.setedCookies[key].toString()];
                field.push(cookieHeader);
            }
        }
        return field;
    };
    CookieManager.prototype.addCookie = function (cookie) {
        this.cookies[cookie.cookieName] = cookie;
        this.setedCookies[cookie.cookieName] = cookie;
    };
    CookieManager.prototype.deleteCookie = function (cookieName) {
        delete this.setedCookies[cookieName];
    };
    CookieManager.prototype.getValue = function (cookieName, key) {
        if (!__utilities.Utilities.isEmpty(this.cookies)) {
            var cookie = this.cookies[cookieName];
            if (cookie) {
                return cookie[key];
            }
        }
    };
    return CookieManager;
}());
exports.CookieManager = CookieManager;
