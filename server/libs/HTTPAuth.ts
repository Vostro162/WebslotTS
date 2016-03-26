import __utilities = require("./Utilities")
import __fs = require("fs")
import __http = require("http")

export enum HTTPAuthTypes {
      basicType,
      digestType,
}

export class HTTPAuthComponents {
    username: string
    realm: string
    nonce: string
    uri: string
    response: string
    qop: string
    nc: string
    cnonce: string
}

export class HTTPAuthType {

    private type: number

    private constructor(type: number) {
        this.type = type
    }

    static createBasicType(): HTTPAuthType {
        return new HTTPAuthType(HTTPAuthTypes.basicType)
    }

    static createDigestType(): HTTPAuthType {
        return new HTTPAuthType(HTTPAuthTypes.digestType)
    }

    get isBasicType(): boolean {
        return this.type == HTTPAuthTypes.basicType
    }

    get isDigestType(): boolean {
        return this.type == HTTPAuthTypes.digestType
    }
}

export interface HTTPAuthInterface {
  request: __http.IncomingMessage
  responds: __http.ServerResponse
  realm?: string
  message: string
  authType: HTTPAuthType
  nonces?: {}
}

export class HTTPAuth {

    request: __http.IncomingMessage
    responds: __http.ServerResponse
    realm: string
    message: string
    authType: HTTPAuthType
    nonces: {}

    constructor(params: HTTPAuthInterface) {
        this.request = params.request;
        this.responds = params.responds;
        this.realm = params.realm;
        this.message = params.message;
        this.authType = params.authType;
        this.nonces = (params.nonces) ? params.nonces : {};
    }

    login(path: string, serviceName?: string): boolean {

        var foundedUser = false
        let folderPath = path
        path = (serviceName) ? path + serviceName + ".htpasswd" : path + "/" + "users.htpasswd"

        if (__fs.existsSync(path)) {

            if (this.authType.isBasicType && this.request.headers.authorization) {

                let tmp = this.request.headers.authorization.split(' ')
                let buf = new Buffer(tmp[1], 'base64')
                let clientUser = buf.toString("ascii")

                var clientPassword = clientUser.split(":")[1]
                var localUsername = clientUser.split(":")[0]

                let regex = new RegExp("(" + localUsername + "):([^\\n]*)")
                let usersString = __fs.readFileSync(path, "ascii")
                var regexReult = regex.exec(usersString)

                if (regexReult) {
                    let localPassword = regexReult[2]

                    if (__utilities.Utilities.md5(clientPassword) == localPassword) {
                        foundedUser = true
                    }
                }

            } else if (this.authType.isDigestType) {
                let authComponents = this.fetchComponents()
                if (authComponents) {
                    let regex = new RegExp("(" + authComponents.username + "):([^\\n]*)")
                    let usersString = __fs.readFileSync(path, "ascii")
                    var regexReult = regex.exec(usersString)
                    if (regexReult) {
                        if (this.digestCompare(regexReult[2], authComponents)) {
                            foundedUser = true
                        }
                    }
                }
            }


            if (!foundedUser) {
                this.auth401(folderPath, this.message)
            }

            return foundedUser

        } else {
            return true
        }
    }

    digestCompare(userHash: string, authComponents): boolean {

        if (userHash) {

            let a2 = __utilities.Utilities.md5(this.request.method + ":" + authComponents.uri)

            let hash = userHash + ":"
            hash += authComponents.nonce + ":"
            hash += authComponents.nc + ":"
            hash += authComponents.cnonce + ":"
            hash += authComponents.qop + ":"
            hash += a2
            hash = __utilities.Utilities.md5(hash)

            if (hash == authComponents.response) {
                return true
            }

            return false

        } else {
            return false
        }


    }

    fetchComponents(): HTTPAuthComponents {

        if (this.request.headers.authorization) {

            var components = new HTTPAuthComponents()

            for (var k in components) {

                var val = new RegExp(k + '="([^"]*)"').exec(this.request.headers.authorization)

                if (val == null) {
                    val = new RegExp(k + '=([^,]*)').exec(this.request.headers.authorization)
                }

                components[k] = val[1]
            }

            return components
        }

    }

    auth401(uri, message): void {

        var authString

        if (this.authType.isBasicType) {
            console.log("basic auth")
            authString = 'Basic realm="' + this.realm + '",uri="' + uri + '"'
        } else if (this.authType.isDigestType) {
            let userAgent = this.request.headers['user-agent']
            let opaque = __utilities.Utilities.md5(this.realm + userAgent + (this.request as __http.ServerRequest).connection.remoteAddress)
            authString = 'Digest realm="' + this.realm + '",qop=auth,opaque="' + opaque + '"' + ',uri="' + uri + '"'
        }

        if (authString) {

            this.responds.writeHead(401, {
                'Content-Type': 'text/html',
                'WWW-Authenticate': authString
            });

            this.responds.end('<html><body>' + message + '</body></html>')
        }
    }
}
