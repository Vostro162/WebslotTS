"use strict";
var __https = require("https");
var __http = require("http");
var __fs = require("fs");
var __url = require("url");
var __cookieManager = require("./cookies/CookieManager");
var __sessionManager = require("./sessions/SessionManager");
var __utilities = require("./Utilities");
var __httpAuth = require("./HTTPAuth");
var HTTPProvider = (function () {
    function HTTPProvider(config) {
        this.config = config;
        this.cookieManager = new __cookieManager.CookieManager();
        this.sessionManager = new __sessionManager.SessionManager({
            sessionFolderPath: config.session.sessionFolderPath,
            cookieExpire: config.session.cookieExpire,
            sessionExpire: config.session.sessionExpire,
            fileEncoding: config.session.fileEncoding
        });
    }
    Object.defineProperty(HTTPProvider, "httpStatusCodes", {
        get: function () {
            return {
                "Continue": 100,
                "SwitchingProtocols": 101,
                "Processing": 102,
                "Checkpoint": 103,
                "OK": 200,
                "Created": 201,
                "Accepted": 202,
                "NonAuthoritative": 203,
                "NoContent": 204,
                "ResetContent": 205,
                "PartialContent": 206,
                "MultiStatus": 207,
                "AlreadyReported": 208,
                "IMUsed": 226,
                "MultipleChoices": 300,
                "MovedPermanently": 301,
                "Found": 302,
                "SeeOther": 303,
                "NotModified": 304,
                "UseProxy": 305,
                "SwitchProxy": 306,
                "TemporaryRedirect": 307,
                "PermanentRedirec": 308,
                "BadRequest": 400,
                "Unauthorized": 401,
                "PaymentRequired": 402,
                "Forbidden": 403,
                "NotFound": 404,
                "MethodNotAllowed": 405,
                "NotAcceptable": 406,
                "ProxyAuthenticationRequired": 407,
                "RequestTimeout": 408,
                "Conflict": 409,
                "Gone": 410,
                "LengthRequired": 411,
                "PreconditionFailed": 412,
                "PayloadTooLarge": 413,
                "URITooLong": 414,
                "UnsupportedMediaType": 415,
                "RangeNotSatisfiable": 416,
                "ExpectationFailed": 417,
                "Teapot": 418,
                "AuthenticationTimeout": 419,
                "MisdirectedRequest": 421,
                "UnprocessableEntity": 422,
                "Locked": 423,
                "FailedDependency": 424,
                "UpgradeRequired": 426,
                "PreconditionRequired": 428,
                "TooManyRequests": 429,
                "RequestHeaderFieldsTooLarge": 431,
                "UnavailableForLegalReasons": 451,
                "InternalServerError": 500,
                "NotImplemented": 501,
                "BadGateway": 502,
                "ServiceUnavailable": 503,
                "GatewayTimeout": 504,
                "HTTPVersionNotSupported": 505,
                "VariantAlsoNegotiates": 506,
                "InsufficientStorage": 507,
                "LoopDetected": 508,
                "NotExtended": 510,
                "NetworkAuthenticationRequired": 511
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPProvider, "serviceMainMethodeName", {
        get: function () {
            return "main";
        },
        enumerable: true,
        configurable: true
    });
    HTTPProvider.loadConfigObject = function (path) {
        try {
            var configPath = (path) ? path : __dirname + "/../config.js";
            __fs.statSync(configPath);
            var configObj = require(configPath);
            return new configObj.Config;
        }
        catch (error) {
            console.log(error);
        }
    };
    Object.defineProperty(HTTPProvider.prototype, "isFileRequest", {
        get: function () {
            var isFile = false;
            var fileResult = this.urlComponents[this.urlComponents.length - 1].indexOf(".");
            if (fileResult > -1)
                isFile = true;
            return isFile;
        },
        enumerable: true,
        configurable: true
    });
    HTTPProvider.prototype.start = function () {
        var _this = this;
        this.sessionManager.startCleaner(this.config.session.cleanerInterval);
        if (this.config.isUsingHTTPS) {
            var options = {
                key: __fs.readFileSync(this.config.https.key),
                cert: __fs.readFileSync(this.config.https.cert)
            };
            __https.createServer(options, function (req, res) {
                _this.toProcess(req, res);
            }).listen(8000);
        }
        else {
            __http.createServer(function (req, res) {
                _this.toProcess(req, res);
            }).listen(this.config.port, this.config.host);
        }
        console.log("Server started");
    };
    HTTPProvider.prototype.createFolderListView = function (folderPath) {
        this.saveOperationHandler(function () {
            return JSON.stringify(__fs.readdirSync(folderPath));
        });
    };
    HTTPProvider.prototype.createPath = function (startIndex, endIndex) {
        if (!endIndex)
            endIndex = this.urlComponents.length;
        var pathArray = this.urlComponents.slice(startIndex, endIndex);
        var path = "";
        pathArray.forEach(function (pathComponent, index, array) {
            path += pathComponent;
            if (index != (array.length - 1)) {
                path += "/";
            }
        });
        return path;
    };
    HTTPProvider.prototype.fetchFileType = function (fileName) {
        if (fileName) {
            var index = fileName.indexOf(".");
            var type = fileName.substr(index + 1, (fileName.length - index));
            var typeObject = this.config.files.extensionTypes[type];
            return typeObject;
        }
        else {
            throw new Error("fileName is undefined or null");
        }
    };
    HTTPProvider.prototype.fileRequest = function () {
        if (this.urlComponents[0] == "" && this.config.callMainService) {
            return false;
        }
        this.httpAuth.realm = this.config.httpAuth.realm;
        var filePath = this.config.resourcesPath + this.createPath(0);
        var isFile = this.isFileRequest;
        if (__fs.existsSync(filePath)) {
            var auth = this.httpAuth.login((isFile) ? this.config.resourcesPath + __utilities.Utilities.fetchFolderPath(this.urlComponents) : filePath);
            if (auth) {
                if (!isFile) {
                    for (var _i = 0, _a = this.config.files.indexTypes; _i < _a.length; _i++) {
                        var type = _a[_i];
                        var indexPath = filePath + "/index." + type;
                        if (__fs.existsSync(indexPath)) {
                            isFile = true;
                            filePath = indexPath;
                            break;
                        }
                        else {
                            this.createFolderListView(filePath);
                            break;
                        }
                    }
                }
                if (isFile) {
                    this.urlComponents = this.fetchPathComponents(filePath);
                    var lastPathComonents = this.urlComponents[this.urlComponents.length - 1];
                    var typeObject = this.fetchFileType(lastPathComonents);
                    if (!typeObject) {
                        throw new Error("Cant find contentType for file ( " + lastPathComonents + " )");
                    }
                    this.contentType = typeObject.contentType;
                    console.log("fetch file content from file == " + filePath);
                    return __fs.readFileSync(filePath);
                }
            }
        }
        if (isFile) {
            throw { code: HTTPProvider.httpStatusCodes.NotFound, message: "Not Found File" };
        }
        return false;
    };
    HTTPProvider.prototype.toProcess = function (req, res) {
        var _this = this;
        this.setup(req, res);
        this.saveOperationHandler(function () {
            _this.startTimeoutTimer();
            var fileResult = _this.fileRequest();
            if (typeof fileResult != "boolean") {
                return fileResult;
            }
            else if (fileResult == false) {
                return _this.serviceRequest();
            }
        });
    };
    HTTPProvider.prototype.serviceRequest = function () {
        this.contentType = this.config.contentType;
        var serviceName = this.urlComponents[0];
        if (serviceName == "" && this.config.callMainService) {
            serviceName = "Main";
        }
        var servicePath = this.config.servicesPath + serviceName + "/" + serviceName + ".js";
        this.httpAuth.realm = this.config.httpAuth.realm + " " + serviceName;
        var auth = this.httpAuth.login(this.config.servicesPath + serviceName + "/", serviceName);
        if (auth) {
            if (__fs.existsSync(servicePath)) {
                return this.callService(serviceName, servicePath);
            }
        }
    };
    HTTPProvider.prototype.startTimeoutTimer = function () {
        console.log("Start timeoutTimer with timeout = " + this.config.timeout);
        var provider = this;
        this.timeoutTimerID = setTimeout(function () {
            provider.responds.end(JSON.stringify({ error: { message: "error", code: 400 } }));
        }, eval(this.config.timeout));
    };
    HTTPProvider.prototype.callService = function (serviceName, servicePath) {
        var params = this.urlComponents.slice(2, this.urlComponents.length);
        console.log("Call Service ( " + servicePath + " ) with Methode " + this.request.method);
        if (!this.config.services.caching) {
            delete require.cache[require.resolve(servicePath)];
        }
        var service = require(servicePath);
        if (typeof service[serviceName] == "function" && service[serviceName]) {
            var obj = new service[serviceName]();
            obj.provider = this;
            if (!__utilities.Utilities.isEmpty(this.urlObject.query)) {
                obj.paramters = this.urlObject.query;
            }
            var isMain = this.config.services.callOnlyMain;
            if (this.config.services.callOnlyMain instanceof Array) {
                isMain = false;
                for (var _i = 0, _a = this.config.services.callOnlyMain; _i < _a.length; _i++) {
                    var mainServiceName = _a[_i];
                    if (mainServiceName == serviceName) {
                        isMain = true;
                        break;
                    }
                }
            }
            if (this.urlComponents[1]) {
                var methodeName = this.urlComponents[1];
                if (isMain) {
                    params = this.urlComponents.slice(1, this.urlComponents.length);
                    methodeName = HTTPProvider.serviceMainMethodeName;
                }
                console.log(methodeName);
                return obj[methodeName].apply(obj, params);
            }
            else {
                return obj[HTTPProvider.serviceMainMethodeName].apply(obj, null);
            }
        }
        else {
            throw new Error("Load Service ( " + servicePath + " ) falled the exports.class Property is not a function or is undefined or is null");
        }
    };
    HTTPProvider.prototype.setup = function (req, res) {
        this.request = req;
        this.responds = res;
        this.urlObject = __url.parse(req.url, true);
        this.urlComponents = this.fetchPathComponents();
        this.cookieManager.setup(this.request.headers.cookie);
        this.sessionManager.loadSession(this);
        this.httpAuth = new __httpAuth.HTTPAuth({
            request: this.request,
            message: this.config.httpAuth.message,
            authType: this.config.httpAuth.authType,
            responds: this.responds
        });
    };
    HTTPProvider.prototype.saveOperationHandler = function (operationBlock) {
        try {
            var content = operationBlock();
            clearTimeout(this.timeoutTimerID);
            this.responds.writeHead(HTTPProvider.httpStatusCodes.OK, this.cookieManager.toHTTPField([
                ['Content-Type', this.contentType]
            ]));
            this.responds.end(content);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Javacript Error");
                console.error(error.stack);
                var errorCode = HTTPProvider.httpStatusCodes.InternalServerError;
                this.responds.writeHead(errorCode, { 'Content-Type': this.config.errorContentType });
                this.responds.end(JSON.stringify({ error: { message: error.message, code: errorCode } }));
            }
            else {
                console.error("OOD Error");
                this.responds.writeHead(error.code, { 'Content-Type': this.config.errorContentType });
                error = JSON.stringify({ error: { message: error.message, code: error.code } });
                console.error(error);
                this.responds.end(error);
            }
        }
    };
    HTTPProvider.prototype.fetchPathComponents = function (pathname) {
        if (!pathname) {
            pathname = this.urlObject.pathname;
        }
        if (pathname.charAt(0) == '/') {
            pathname = pathname.slice(1, pathname.length);
        }
        if (pathname.charAt(pathname.length - 1) == '/') {
            pathname = pathname.slice(0, (pathname.length - 1));
        }
        return pathname.split("/");
    };
    return HTTPProvider;
}());
exports.HTTPProvider = HTTPProvider;
