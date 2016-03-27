import __configInterface = require("./ConfigInterface")
import __httpAuth = require("./libs/HTTPAuth")

export class Config implements __configInterface.Config {

  // settings
  port = 8080
  host = '127.0.0.1'
  contentType = "text/plain"
  errorContentType = "text/plain"
  timeout = "0"
  callMainService = true
  isUsingHTTPS =  false

  // HTTPS
  https =  {
    key : "key.pem",
    cert : "cert.pem"
  }

  //services settings
  services =  {
    caching: false,
    callOnlyMain: [
      "JSD",
      "Pages"
    ]
  }

  // paths settings
  servicesPath =  __dirname + "/Services/"
  resourcesPath =  __dirname + "/Resources/"
  viewFolderPath =  __dirname + "/Views"

  // session settings
  session =  {
    sessionFolderPath: __dirname + "/Sessions",
    cookieExpire: "",
    sessionExpire: "60000 * 5",
    fileEncoding: "utf8",
    cleanerInterval: "600"
  }

  // file settngs
  files = {

    indexTypes: [
      "html"
    ],

    extensionTypes: {

      txt: {
        contentType : "text/plain"
      },

      html: {
        contentType : "text/html"
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

  }

  // http file auth settings

  httpAuth = {
    realm: "Secure Area",
    message: "Please Login",
    authType: __httpAuth.HTTPAuthType.createBasicType()
  }

}
