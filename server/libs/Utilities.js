"use strict";
var __crypto = require('crypto');
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.isEmpty = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    };
    Utilities.replaceAll = function (string, search, replacement) {
        var target = string;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    Utilities.fetchFolderPath = function (fileComponents) {
        var folderPath = "";
        fileComponents.forEach(function (value, index, array) {
            if (index != fileComponents.length - 1) {
                var seperator = "";
                if (index != fileComponents.length - 2) {
                    seperator = "/";
                }
                folderPath += fileComponents[index] + seperator;
            }
        });
        return folderPath;
    };
    Utilities.parseAuthStringToMD5 = function (string) {
        var components = string.split(":");
        components[1] = __crypto.createHash('md5').update(components[1]).digest('hex');
        return components.join(":");
    };
    Utilities.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };
    Utilities.parseObjectToArray = function (object) {
        var array = [];
        for (var key in object) {
            array.push(object[key]);
        }
        return array;
    };
    Utilities.createUUID = function (patternString) {
        if (!patternString)
            patternString = "#####################";
        var chars = "qwertzuiopasdfghjklyxcvbnm";
        var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        var resultString = "";
        for (var _i = 0, _a = patternString.split(""); _i < _a.length; _i++) {
            var char = _a[_i];
            var isUppercase = Utilities.getRandomInt(0, 2);
            var isChar = Utilities.getRandomInt(0, 2);
            if (char == "#") {
                if (isChar == 1) {
                    var randomChar = chars[Utilities.getRandomInt(0, chars.length)];
                    if (isUppercase == 1) {
                        randomChar = randomChar.toUpperCase();
                    }
                    resultString += randomChar;
                }
                else {
                    var randomCharInt = "";
                    randomCharInt += numbers[Utilities.getRandomInt(0, numbers.length)];
                    resultString += randomCharInt;
                }
            }
            else {
                resultString += "-";
            }
        }
        return resultString;
    };
    Utilities.md5 = function (s) {
        return __crypto.createHash('md5').update(s).digest('hex');
    };
    return Utilities;
}());
exports.Utilities = Utilities;
