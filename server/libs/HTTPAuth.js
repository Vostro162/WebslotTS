"use strict";
var __utilities = require("./Utilities");
var __fs = require("fs");
(function (HTTPAuthTypes) {
    HTTPAuthTypes[HTTPAuthTypes["basicType"] = 0] = "basicType";
    HTTPAuthTypes[HTTPAuthTypes["digestType"] = 1] = "digestType";
})(exports.HTTPAuthTypes || (exports.HTTPAuthTypes = {}));
var HTTPAuthTypes = exports.HTTPAuthTypes;
var HTTPAuthComponents = (function () {
    function HTTPAuthComponents() {
    }
    return HTTPAuthComponents;
}());
exports.HTTPAuthComponents = HTTPAuthComponents;
var HTTPAuthType = (function () {
    function HTTPAuthType(type) {
        this.type = type;
    }
    HTTPAuthType.createBasicType = function () {
        return new HTTPAuthType(HTTPAuthTypes.basicType);
    };
    HTTPAuthType.createDigestType = function () {
        return new HTTPAuthType(HTTPAuthTypes.digestType);
    };
    Object.defineProperty(HTTPAuthType.prototype, "isBasicType", {
        get: function () {
            return this.type == HTTPAuthTypes.basicType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPAuthType.prototype, "isDigestType", {
        get: function () {
            return this.type == HTTPAuthTypes.digestType;
        },
        enumerable: true,
        configurable: true
    });
    return HTTPAuthType;
}());
exports.HTTPAuthType = HTTPAuthType;
var HTTPAuth = (function () {
    function HTTPAuth(params) {
        this.request = params.request;
        this.responds = params.responds;
        this.realm = params.realm;
        this.message = params.message;
        this.authType = params.authType;
        this.nonces = (params.nonces) ? params.nonces : {};
    }
    HTTPAuth.prototype.login = function (path, serviceName) {
        var foundedUser = false;
        var folderPath = path;
        path = (serviceName) ? path + serviceName + ".htpasswd" : path + "/" + "users.htpasswd";
        if (__fs.existsSync(path)) {
            if (this.authType.isBasicType && this.request.headers.authorization) {
                var tmp = this.request.headers.authorization.split(' ');
                var buf = new Buffer(tmp[1], 'base64');
                var clientUser = buf.toString("ascii");
                var clientPassword = clientUser.split(":")[1];
                var localUsername = clientUser.split(":")[0];
                var regex = new RegExp("(" + localUsername + "):([^\\n]*)");
                var usersString = __fs.readFileSync(path, "ascii");
                var regexReult = regex.exec(usersString);
                if (regexReult) {
                    var localPassword = regexReult[2];
                    if (__utilities.Utilities.md5(clientPassword) == localPassword) {
                        foundedUser = true;
                    }
                }
            }
            else if (this.authType.isDigestType) {
                var authComponents = this.fetchComponents();
                if (authComponents) {
                    var regex = new RegExp("(" + authComponents.username + "):([^\\n]*)");
                    var usersString = __fs.readFileSync(path, "ascii");
                    var regexReult = regex.exec(usersString);
                    if (regexReult) {
                        if (this.digestCompare(regexReult[2], authComponents)) {
                            foundedUser = true;
                        }
                    }
                }
            }
            if (!foundedUser) {
                this.auth401(folderPath, this.message);
            }
            return foundedUser;
        }
        else {
            return true;
        }
    };
    HTTPAuth.prototype.digestCompare = function (userHash, authComponents) {
        if (userHash) {
            var a2 = __utilities.Utilities.md5(this.request.method + ":" + authComponents.uri);
            var hash = userHash + ":";
            hash += authComponents.nonce + ":";
            hash += authComponents.nc + ":";
            hash += authComponents.cnonce + ":";
            hash += authComponents.qop + ":";
            hash += a2;
            hash = __utilities.Utilities.md5(hash);
            if (hash == authComponents.response) {
                return true;
            }
            return false;
        }
        else {
            return false;
        }
    };
    HTTPAuth.prototype.fetchComponents = function () {
        if (this.request.headers.authorization) {
            var components = new HTTPAuthComponents();
            for (var k in components) {
                var val = new RegExp(k + '="([^"]*)"').exec(this.request.headers.authorization);
                if (val == null) {
                    val = new RegExp(k + '=([^,]*)').exec(this.request.headers.authorization);
                }
                components[k] = val[1];
            }
            return components;
        }
    };
    HTTPAuth.prototype.auth401 = function (uri, message) {
        var authString;
        if (this.authType.isBasicType) {
            console.log("basic auth");
            authString = 'Basic realm="' + this.realm + '",uri="' + uri + '"';
        }
        else if (this.authType.isDigestType) {
            var userAgent = this.request.headers['user-agent'];
            var opaque = __utilities.Utilities.md5(this.realm + userAgent + this.request.connection.remoteAddress);
            authString = 'Digest realm="' + this.realm + '",qop=auth,opaque="' + opaque + '"' + ',uri="' + uri + '"';
        }
        if (authString) {
            this.responds.writeHead(401, {
                'Content-Type': 'text/html',
                'WWW-Authenticate': authString
            });
            this.responds.end('<html><body>' + message + '</body></html>');
        }
    };
    return HTTPAuth;
}());
exports.HTTPAuth = HTTPAuth;
