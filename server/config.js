"use strict";
var __httpAuth = require("./libs/HTTPAuth");
var Config = (function () {
    function Config() {
        this.port = 8080;
        this.host = '127.0.0.1';
        this.contentType = "text/plain";
        this.errorContentType = "text/plain";
        this.timeout = "0";
        this.callMainService = true;
        this.isUsingHTTPS = false;
        this.https = {
            key: "key.pem",
            cert: "cert.pem"
        };
        this.services = {
            caching: false,
            callOnlyMain: [
                "JSD"
            ]
        };
        this.servicesPath = __dirname + "/Services/";
        this.resourcesPath = __dirname + "/Resources/";
        this.viewFolderPath = __dirname + "/Views";
        this.session = {
            sessionFolderPath: __dirname + "/Sessions",
            cookieExpire: "",
            sessionExpire: "60000 * 5",
            fileEncoding: "utf8",
            cleanerInterval: "600"
        };
        this.files = {
            indexTypes: [
                "html"
            ],
            extensionTypes: {
                txt: {
                    contentType: "text/plain"
                },
                html: {
                    contentType: "text/html"
                },
                css: {
                    contentType: "text/css"
                },
                ico: {
                    contentType: "image/x-icon"
                },
                png: {
                    contentType: "image/png"
                }
            }
        };
        this.httpAuth = {
            realm: "Secure Area",
            message: "Please Login",
            authType: __httpAuth.HTTPAuthType.createBasicType()
        };
    }
    return Config;
}());
exports.Config = Config;
