import __httpAuth = require("./libs/HTTPAuth")
export interface Config {
  // settings
  port : number
  host: string
  contentType: string
  errorContentType: string
  timeout: string
  callMainService : boolean
  isUsingHTTPS: boolean

  // HTTPS
  https : {
    key : string
    cert : string
  }

  //services settings
  services: {
    caching: boolean
    callOnlyMain: any
  }

  // paths settings
  servicesPath: string
  resourcesPath: string
  viewFolderPath: string

  // session settings
  session: {
    sessionFolderPath: string
    cookieExpire: string
    sessionExpire: string
    fileEncoding: string
    cleanerInterval: string
  }

  // file settngs
  files: {

    indexTypes: string[]

    extensionTypes: {}

  }

  // http file auth settings

  httpAuth: {
    realm: string
    message: string
    authType: __httpAuth.HTTPAuthType
  }

}
