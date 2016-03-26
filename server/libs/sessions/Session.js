"use strict";
var __utilities = require("../Utilities");
var Session = (function () {
    function Session(params) {
        this.data = {};
        if (params.expire) {
            this.expire = new Date(Date.now() + eval(params.expire)).toUTCString();
        }
        this.sessionId = this.createSessionId();
        this.folderPath = params.folderPath;
        this.fileEncoding = params.fileEncoding;
        if (params.data) {
            this.data = params.data;
        }
    }
    Session.prototype.addValue = function (key, value) {
        this.data[key] = value;
    };
    Session.prototype.createSessionId = function () {
        return __utilities.Utilities.createUUID(null);
    };
    return Session;
}());
exports.Session = Session;
