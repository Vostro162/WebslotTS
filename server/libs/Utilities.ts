import __crypto = require('crypto');

export class Utilities {

    static isEmpty(obj: any): boolean {

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false
        }

        return true
    }

    static replaceAll(string: string, search: string, replacement: string): string {
        var target = string;
        return target.replace(new RegExp(search, 'g'), replacement);
    }

    static fetchFolderPath(fileComponents: string[]): string {

        let folderPath = ""

        fileComponents.forEach((value: string, index: number, array: string[]) => {
            if (index != fileComponents.length - 1) {
                var seperator = "";
                if (index != fileComponents.length - 2) {
                    seperator = "/"
                }
                folderPath += fileComponents[index] + seperator;
            }
        })

        return folderPath;
    }

    static parseAuthStringToMD5(string: string): string {
        var components = string.split(":")
        components[1] = __crypto.createHash('md5').update(components[1]).digest('hex')
        return components.join(":")
    }

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min
    }

    static parseObjectToArray(object: {}): any[] {

        let array = []

        for (let key in object) {
            array.push(object[key])
        }

        return array

    }

    static createUUID(patternString: string): string {

        if (!patternString) patternString = "#####################";

        let chars = "qwertzuiopasdfghjklyxcvbnm";
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        var resultString = "";

        for (let char of patternString.split("")) {

            let isUppercase = Utilities.getRandomInt(0, 2);
            let isChar = Utilities.getRandomInt(0, 2);

            if (char == "#") {
                if (isChar == 1) {

                    var randomChar = chars[Utilities.getRandomInt(0, chars.length)];

                    if (isUppercase == 1) {
                        randomChar = randomChar.toUpperCase();
                    }

                    resultString += randomChar;

                } else {

                    var randomCharInt = "";
                    randomCharInt += numbers[Utilities.getRandomInt(0, numbers.length)];
                    resultString += randomCharInt;
                }
            } else {
                resultString += "-";
            }
        }

        return resultString;

    }

    static md5(s): string {
        return __crypto.createHash('md5').update(s).digest('hex');
    }

}
