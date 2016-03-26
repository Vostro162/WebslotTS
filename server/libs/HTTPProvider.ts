// node modules
import __https = require("https")
import __http = require("http")
import __fs = require("fs")
import __url = require("url")

// webslot modules
import __cookieManager = require("./cookies/CookieManager")
import __sessionManager = require("./sessions/SessionManager")
import __utilities = require("./Utilities")
import __httpAuth = require("./HTTPAuth")
import __configInterface = require("../ConfigInterface")
import __serviceInterface = require("./ServiceInterface")

export interface HTTPStatusCodes {
    // 100
    Continue: number
    SwitchingProtocols: number
    Processing: number
    Checkpoint: number
    // 200
    OK: number
    Created: number
    Accepted: number
    NonAuthoritative: number
    NoContent: number
    ResetContent: number
    PartialContent: number
    MultiStatus: number
    AlreadyReported: number
    IMUsed: number
    // 300
    MultipleChoices: number
    MovedPermanently: number
    Found: number
    SeeOther: number
    NotModified: number
    UseProxy: number
    SwitchProxy: number
    TemporaryRedirect: number
    PermanentRedirec: number
    //400
    BadRequest: number
    Unauthorized: number
    PaymentRequired: number
    Forbidden: number
    NotFound: number
    MethodNotAllowed: number
    NotAcceptable: number
    ProxyAuthenticationRequired: number
    RequestTimeout: number
    Conflict: number
    Gone: number
    LengthRequired: number
    PreconditionFailed: number
    PayloadTooLarge: number
    URITooLong: number
    UnsupportedMediaType: number
    RangeNotSatisfiable: number
    ExpectationFailed: number
    Teapot: number
    AuthenticationTimeout: number
    MisdirectedRequest: number
    UnprocessableEntity: number
    Locked: number
    FailedDependency: number
    UpgradeRequired: number
    PreconditionRequired: number
    TooManyRequests: number
    RequestHeaderFieldsTooLarge: number
    UnavailableForLegalReasons: number
    // 500
    InternalServerError: number
    NotImplemented: number
    BadGateway: number
    ServiceUnavailable: number
    GatewayTimeout: number
    HTTPVersionNotSupported: number
    VariantAlsoNegotiates: number
    InsufficientStorage: number
    LoopDetected: number
    NotExtended: number
    NetworkAuthenticationRequired: number
}

export class HTTPProvider {

    urlObject: __url.Url
    urlComponents: string[]
    request: __http.IncomingMessage
    responds: __http.ServerResponse
    config: __configInterface.Config

    cookieManager: __cookieManager.CookieManager
    sessionManager: __sessionManager.SessionManager

    protected httpAuth: __httpAuth.HTTPAuth
    protected timeoutTimerID: number
    protected contentType: string

    constructor(config: __configInterface.Config) {
        this.config = config
        this.cookieManager = new __cookieManager.CookieManager()
        this.sessionManager = new __sessionManager.SessionManager({
            sessionFolderPath: config.session.sessionFolderPath,
            cookieExpire: config.session.cookieExpire,
            sessionExpire: config.session.sessionExpire,
            fileEncoding: config.session.fileEncoding
        })
    }

    static get httpStatusCodes(): HTTPStatusCodes {
        return {
            // 100
            "Continue": 100,
            "SwitchingProtocols": 101,
            "Processing": 102,
            "Checkpoint": 103,
            // 200
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
            // 300
            "MultipleChoices": 300,
            "MovedPermanently": 301,
            "Found": 302,
            "SeeOther": 303,
            "NotModified": 304,
            "UseProxy": 305,
            "SwitchProxy": 306,
            "TemporaryRedirect": 307,
            "PermanentRedirec": 308,
            //400
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
            // 500
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

        }
    }

    static get serviceMainMethodeName(): string {
        return "main"
    }

    static loadConfigObject(path: string): __configInterface.Config {
        try {
            var configPath = (path) ? path : __dirname + "/../config.js"
            __fs.statSync(configPath)
            let configObj = require(configPath)
            return new configObj.Config
        } catch (error) {
            console.log(error)
        }
    }

    get isFileRequest(): boolean {

        var isFile = false
        let fileResult = this.urlComponents[this.urlComponents.length - 1].indexOf(".")

        if (fileResult > -1) isFile = true

        return isFile
    }

    start(): void {

        this.sessionManager.startCleaner(this.config.session.cleanerInterval)

        if (this.config.isUsingHTTPS) {

            //HTTPS

            let options = {
                key: __fs.readFileSync(this.config.https.key),
                cert: __fs.readFileSync(this.config.https.cert)
            }

            __https.createServer(options, (req, res) => {
                this.toProcess(req, res)
            }).listen(8000)

        } else {

            // HTTP
            __http.createServer((req, res) => {
                this.toProcess(req, res)
            }).listen(this.config.port, this.config.host)

        }

        console.log("Server started")
    }

    createFolderListView(folderPath: string): void {
        this.saveOperationHandler(() => {
            return JSON.stringify(__fs.readdirSync(folderPath))
        })
    }

    createPath(startIndex: number, endIndex?: number): string {

        if (!endIndex) endIndex = this.urlComponents.length

        var pathArray = this.urlComponents.slice(startIndex, endIndex)
        var path = ""

        pathArray.forEach((pathComponent, index, array) => {
            path += pathComponent
            if (index != (array.length - 1)) {
                path += "/"
            }
        })

        return path
    }


    fetchFileType(fileName): { contentType: string } {

        if (fileName) {
            let index = fileName.indexOf(".");
            let type = fileName.substr(index + 1, (fileName.length - index));
            let typeObject = this.config.files.extensionTypes[type];
            return typeObject;
        } else {
            throw new Error("fileName is undefined or null");
        }

    }

    fileRequest(): any {

        if (this.urlComponents[0] == "" && this.config.callMainService) {
            return false;
        }

        this.httpAuth.realm = this.config.httpAuth.realm;

        // create file path
        var filePath = this.config.resourcesPath + this.createPath(0);
        var isFile = this.isFileRequest;

        if (__fs.existsSync(filePath)) {
            // request to a file or to a folder

            let auth = this.httpAuth.login((isFile) ? this.config.resourcesPath + __utilities.Utilities.fetchFolderPath(this.urlComponents) : filePath)
            if (auth) {
                if (!isFile) {
                    // this is a folder request
                    // search to a index file
                    for (let type of this.config.files.indexTypes) {
                        var indexPath = filePath + "/index." + type
                        if (__fs.existsSync(indexPath)) {
                            // founded index file
                            isFile = true
                            filePath = indexPath
                            break
                        } else {
                            this.createFolderListView(filePath)
                            break
                        }
                    }
                }

                if (isFile) {

                    // this is a file request
                    this.urlComponents = this.fetchPathComponents(filePath)
                    var lastPathComonents = this.urlComponents[this.urlComponents.length - 1]
                    var typeObject = this.fetchFileType(lastPathComonents)

                    if (!typeObject) {
                        throw new Error("Cant find contentType for file ( " + lastPathComonents + " )")
                    }

                    this.contentType = typeObject.contentType

                    console.log("fetch file content from file == " + filePath)
                    return __fs.readFileSync(filePath)
                }
            }

        }

        if (isFile) {
            throw { code: HTTPProvider.httpStatusCodes.NotFound, message: "Not Found File" }
            //return true //TODO: fixing return bug
        }

        return false
    }

    toProcess(req: __http.IncomingMessage, res: __http.ServerResponse): void {

        this.setup(req, res)

        this.saveOperationHandler(() => {

            this.startTimeoutTimer()
            let fileResult = this.fileRequest()

            if (typeof fileResult != "boolean") {
                return fileResult
            } else if (fileResult == false) {
                return this.serviceRequest()
            }

        })
    }

    serviceRequest(): string {
        // request to a Service
        this.contentType = this.config.contentType
        let serviceName = this.urlComponents[0]

        if (serviceName == "" && this.config.callMainService) {
            serviceName = "Main"
        }

        var servicePath = this.config.servicesPath + serviceName + ".js"

        this.httpAuth.realm = this.config.httpAuth.realm + " " + serviceName
        let auth = this.httpAuth.login(this.config.servicesPath, serviceName)

        if (auth) {
            if (__fs.existsSync(servicePath)) {
                return this.callService(serviceName)
            }
        }
    }

    startTimeoutTimer(): void {
        console.log("Start timeoutTimer with timeout = " + this.config.timeout)
        let provider = this
        this.timeoutTimerID = setTimeout(function() {
            provider.responds.end(JSON.stringify({ error: { message: "error", code: 400 } }))
        }, eval(this.config.timeout))
    }

    callService(serviceName: string): string {

        var params = this.urlComponents.slice(2, this.urlComponents.length)
        let servicePath = this.config.servicesPath + serviceName + ".js"

        console.log("Call Service ( " + servicePath + " ) with Methode " + this.request.method)

        // clean cache for the require service
        if (!this.config.services.caching) {
            delete require.cache[require.resolve(servicePath)]
        }

        let service = require(servicePath)

        if (typeof service[serviceName] == "function" && service[serviceName]) {

            var obj = new service[serviceName]() as __serviceInterface.ServiceInterface

            obj.provider = this
            if (!__utilities.Utilities.isEmpty(this.urlObject.query)) {
                obj.paramters = this.urlObject.query
            }

            var isMain = this.config.services.callOnlyMain

            if (this.config.services.callOnlyMain instanceof Array) {
                isMain = false
                for (let mainServiceName of this.config.services.callOnlyMain) {
                    if (mainServiceName == serviceName) {
                        isMain = true
                        break
                    }
                }
            }

            if (this.urlComponents[1]) {

                var methodeName = this.urlComponents[1]

                if (isMain) {
                    params = this.urlComponents.slice(1, this.urlComponents.length)
                    methodeName = HTTPProvider.serviceMainMethodeName
                }

                console.log(methodeName)

                return obj[methodeName].apply(obj, params)

            } else {
                return obj[HTTPProvider.serviceMainMethodeName].apply(obj, null)
            }


        } else {
            throw new Error("Load Service ( " + servicePath + " ) falled the exports.class Property is not a function or is undefined or is null")
        }

    }

    setup(req: __http.IncomingMessage, res: __http.ServerResponse) {
        /***
        *** set properties ***
        ***/

        this.request = req
        this.responds = res
        this.urlObject = __url.parse(req.url, true)
        this.urlComponents = this.fetchPathComponents()

        /***
        *** setup ***
        ***/

        //cookie
        this.cookieManager.setup(this.request.headers.cookie)

        //sesion
        this.sessionManager.loadSession(this)

        this.httpAuth = new __httpAuth.HTTPAuth({
            request: this.request,
            message: this.config.httpAuth.message,
            authType: this.config.httpAuth.authType,
            responds: this.responds
        })

    }

    saveOperationHandler(operationBlock: () => string): void {

        try {

            var content = operationBlock()
            clearTimeout(this.timeoutTimerID)
            this.responds.writeHead(HTTPProvider.httpStatusCodes.OK, this.cookieManager.toHTTPField([
                ['Content-Type', this.contentType]
            ]));
            this.responds.end(content);

        } catch (error) {

            if (error instanceof Error) {
                // Javascript Error Object
                console.error("Javacript Error");
                console.error(error.stack);
                let errorCode = HTTPProvider.httpStatusCodes.InternalServerError;
                this.responds.writeHead(errorCode, { 'Content-Type': this.config.errorContentType });
                this.responds.end(JSON.stringify({ error: { message: error.message, code: errorCode } }));
            } else {
                // OOD Error Object
                console.error("OOD Error");
                this.responds.writeHead(error.code, { 'Content-Type': this.config.errorContentType });
                error = JSON.stringify({ error: { message: error.message, code: error.code } })
                console.error(error);
                this.responds.end(error);
            }

        }

    }

    fetchPathComponents(pathname?: string): string[] {

        if (!pathname) {
            pathname = this.urlObject.pathname
        }

        if (pathname.charAt(0) == '/') {
            pathname = pathname.slice(1, pathname.length)
        }

        if (pathname.charAt(pathname.length - 1) == '/') {
            pathname = pathname.slice(0, (pathname.length - 1))
        }

        return pathname.split("/")

    }

}
