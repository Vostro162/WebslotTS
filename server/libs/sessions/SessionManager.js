"use strict";
var __session = require("./Session");
var __objectSaver = require("../ObjectSaver");
var __cookie = require("../cookies/Cookie");
var __fs = require("fs");
var SessionManager = (function () {
    function SessionManager(params) {
        this.sessions = {};
        this.cookieExpire = params.cookieExpire;
        this.sessionExpire = params.sessionExpire;
        this.sessionFolderPath = params.sessionFolderPath;
        this.fileEncoding = params.fileEncoding;
        this.session = params.session;
        this.objectSaver = new __objectSaver.ObjectSaver(this.sessionFolderPath, this.fileEncoding);
        if (params.sessions) {
            this.sessions = params.sessions;
        }
    }
    SessionManager.prototype.startSession = function (cookieManager) {
        this.session = this.createSession();
        cookieManager.addCookie(this.createSessionCookie());
    };
    SessionManager.prototype.save = function () {
        this.objectSaver.save(this.session.sessionId, this.session);
    };
    SessionManager.prototype.createSession = function () {
        var session = new __session.Session({
            expire: this.sessionExpire,
            folderPath: this.sessionFolderPath,
            fileEncoding: this.fileEncoding
        });
        var isOkay = false;
        while (isOkay == false) {
            var sessionFilePath = this.sessionFolderPath + "/" + session.sessionId + ".json";
            if (!__fs.existsSync(sessionFilePath)) {
                isOkay = true;
            }
        }
        return session;
    };
    SessionManager.prototype.createSessionCookie = function () {
        var cookieDate = new Date(Date.now() + eval(this.cookieExpire));
        var dateString = cookieDate.toUTCString();
        var cookie = new __cookie.Cookie({
            cookieName: "NODEJSSESSIONID",
            expire: dateString,
            httpOnly: true,
            values: this.session.sessionId
        });
        return cookie;
    };
    SessionManager.prototype.loadSession = function (provider) {
        var cookie = provider.cookieManager.cookies["NODEJSSESSIONID"];
        if (cookie) {
            var sessionId = cookie;
            var session = this.objectSaver.load(sessionId);
            if (session) {
                if (new Date().getTime() <= new Date(session.expire).getTime()) {
                    this.session = session;
                    this.session.expire = new Date(Date.now() + eval(provider.config.session.sessionExpire)).toUTCString();
                    this.save();
                }
            }
            else {
                this.session = null;
            }
        }
    };
    SessionManager.prototype.startCleaner = function (interval) {
        console.log("Session Cleaner started with Interval ( " + eval(interval) + " )");
        var sessionManagerInstance = this;
        this.intervalID = setInterval(function () {
            var sessions = __fs.readdirSync(sessionManagerInstance.sessionFolderPath);
            for (var _i = 0, sessions_1 = sessions; _i < sessions_1.length; _i++) {
                var sessionName = sessions_1[_i];
                var file = sessionName;
                if (file == "." || file == "..")
                    continue;
                var session = sessionManagerInstance.objectSaver.load(file.split(".")[0]);
                if (new Date(session.expire).getTime() <= new Date().getTime()) {
                    var filePath = sessionManagerInstance.sessionFolderPath + "/" + file;
                    __fs.unlink(filePath);
                    console.log("removed session file ( " + file + " )");
                }
            }
        }, eval(interval));
    };
    SessionManager.prototype.endCleaner = function () {
        clearInterval(this.intervalID);
    };
    return SessionManager;
}());
exports.SessionManager = SessionManager;
