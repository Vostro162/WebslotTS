"use strict";
var __fs = require("fs");
var ObjectSaver = (function () {
    function ObjectSaver(folderPath, fileEncoding) {
        this.folderPath = folderPath;
        this.fileEncoding = fileEncoding;
    }
    ObjectSaver.prototype.save = function (objectName, object, callback) {
        if (__fs.existsSync(this.folderPath)) {
            var filePath = this.folderPath + "/" + objectName + ".json";
            __fs.writeFile(filePath, JSON.stringify(object), this.fileEncoding, callback);
        }
        else {
            throw new Error("Folder ist not existing");
        }
    };
    ObjectSaver.prototype.load = function (objectName) {
        var filePath = this.folderPath + "/" + objectName + ".json";
        if (__fs.existsSync(filePath)) {
            var fileContentData = __fs.readFileSync(filePath, this.fileEncoding);
            var jsonObject;
            try {
                jsonObject = JSON.parse(fileContentData);
            }
            catch (e) {
            }
            return jsonObject;
        }
    };
    return ObjectSaver;
}());
exports.ObjectSaver = ObjectSaver;
