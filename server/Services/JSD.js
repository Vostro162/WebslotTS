"use strict";
var JSD = (function () {
    function JSD() {
    }
    JSD.prototype.main = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i - 0] = arguments[_i];
        }
        var objName = params[0];
        var globalEval = eval;
        var globalObject = globalEval("this");
        if (objName == "global" || objName == undefined) {
            return Object.getOwnPropertyNames(globalObject).toString();
        }
        else {
            var obj = globalObject[objName];
            for (var _a = 0, params_1 = params; _a < params_1.length; _a++) {
                var propterty = params_1[_a];
                if (propterty != objName) {
                    obj = obj[propterty];
                }
            }
            return Object.getOwnPropertyNames(obj).toString();
        }
    };
    return JSD;
}());
exports.JSD = JSD;
