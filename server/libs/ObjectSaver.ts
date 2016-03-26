
import __fs = require("fs")

export class ObjectSaver {

  folderPath : string
  fileEncoding : string

  constructor(folderPath: string, fileEncoding : string) {
    this.folderPath = folderPath
    this.fileEncoding = fileEncoding
  }

  save(objectName : string, object : any , callback? : () => void) : void {
    if(__fs.existsSync(this.folderPath)) {
      let filePath = this.folderPath + "/" + objectName + ".json"
      __fs.writeFile(filePath, JSON.stringify(object), this.fileEncoding, callback)
    } else {
      throw new Error("Folder ist not existing")
    }
  }

  load(objectName : string) : any {

    let filePath = this.folderPath + "/" + objectName + ".json"

    if(__fs.existsSync(filePath)) {

      let fileContentData = __fs.readFileSync(filePath, this.fileEncoding)
      var jsonObject

      try {
        jsonObject = JSON.parse(fileContentData)
      } catch (e) {
      }

      return jsonObject
    }
  }

}
