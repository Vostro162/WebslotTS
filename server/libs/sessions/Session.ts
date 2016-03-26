
import __utilities = require("../Utilities")
import __fs = require("fs")

export interface SessionInterface {
  expire? : string
  folderPath : string
  fileEncoding : string
  data? : {}
}

export class Session implements SessionInterface {

  sessionId : string
  expire : string
  folderPath : string
  fileEncoding : string
  data : {} = {}

  constructor(params : SessionInterface) {
    if(params.expire) {this.expire =  new Date(Date.now() + eval(params.expire)).toUTCString()}
    this.sessionId = this.createSessionId()
    this.folderPath = params.folderPath
    this.fileEncoding = params.fileEncoding
    if(params.data) { this.data = params.data }
  }

  addValue(key, value) : void {
    this.data[key] = value
  }

  createSessionId() : string {
    return __utilities.Utilities.createUUID(null)
  }
}
