"use strict";
var Cookie = (function () {
    function Cookie(params) {
        this.cookieName = params.cookieName;
        this.values = (params.values) ? params.values : {};
        this.expire = params.expire;
        this.domain = params.domain;
        this.httpOnly = params.httpOnly;
        this.security = params.security;
    }
    Cookie.prototype.addValue = function (key, value) {
        this.values[key] = value;
    };
    Cookie.prototype.getValue = function (key) {
        return this.values[key];
    };
    Cookie.prototype.toString = function () {
        var param = "";
        var valuesString = (typeof this.values == "object") ? JSON.stringify(this.values) : this.values;
        if (!valuesString)
            valuesString = "";
        param = this.cookieName + "=" + valuesString + ";";
        param += "Expires=" + this.expire + ";";
        param += "Path=" + this.path + ";";
        param += "Security=" + this.security + ";";
        if (this.httpOnly)
            param += "HttpOnly=" + this.httpOnly + ";";
        if (this.domain)
            param += "Domain=" + this.domain + ";";
        return param;
    };
    return Cookie;
}());
exports.Cookie = Cookie;
