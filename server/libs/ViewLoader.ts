import __fs = require("fs")
import __utilities = require("./Utilities")

export interface ViewLoaderProperties {
    controller: any
    viewFolderPath: string
    model : {}
    getValueFunction?: (key: string) => any
    setValueFunction?: (key: string, value: any) => void
    viewContent?: string
    orginViewContent?: string
    viewscriptMatches?: string[]
}

export class ViewLoader implements ViewLoaderProperties {

    controller: any
    getValueFunction: (key: string) => any
    setValueFunction: (key: string, value: any) => void
    viewFolderPath: string
    viewContent: string
    orginViewContent: string
    viewscriptMatches: string[]
    model : {}

    private params: ViewLoaderProperties
    private viewScriptVars: {}

    constructor(params: ViewLoaderProperties, viewScriptVars?: {}) {
        this.viewScriptVars = (viewScriptVars) ? viewScriptVars : {}
        this.controller = params.controller
        this.getValueFunction = params.getValueFunction
        this.setValueFunction = params.setValueFunction
        this.viewFolderPath = params.viewFolderPath
        this.viewContent = params.viewContent
        this.orginViewContent = params.orginViewContent
        this.viewscriptMatches = params.viewscriptMatches
        this.model = params.model
        this.params = params
    }

    load(viewName): void {

        let viewLoaderInstance = this;

        if (this.controller) {

            this.controller.provider.contentType = "text/html"

            this.controller.getValue = function(key) {
                if (!viewLoaderInstance.getValueFunction) {
                    return this.model[key]
                } else {
                    return viewLoaderInstance.getValueFunction(key)
                }
            }

            this.controller.setValue = function(key, value) {
                if (!viewLoaderInstance.setValueFunction) {
                    this.model[key] = value
                } else {
                    viewLoaderInstance.setValueFunction(key, value)
                }
            }

            let filePath = this.viewFolderPath + "/" + viewName + ".view"

            if (__fs.existsSync(filePath)) {
                this.orginViewContent = new String(__fs.readFileSync(filePath)) as string
                this.viewContent = this.orginViewContent
            } else {
                throw new Error("View Path is not exists")
            }

            this.findViewScripts()

        }
    }

    findViewScripts(): void {
        if (this.orginViewContent) {
            let regex = /<\?vs([\w\W][^\?]*)\?>/g
            var match
            this.viewscriptMatches = []
            while ((match = regex.exec(this.orginViewContent)) !== null) {
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++
                }
                this.viewscriptMatches.push(match)
            }

        }
    }

    parse(): void {

        if (this.viewscriptMatches) {
            if (this.orginViewContent) {
                for (let match of this.viewscriptMatches) {

                    var script = match[1]
                    var contentString = eval("(function(vars, model, viewLoader){" + script + "}).call(this.controller, this.viewScriptVars, this.model, this);")

                    if (!contentString) {
                        contentString = ""
                    }

                    this.viewContent = this.viewContent.replace(match[0], contentString)

                }
            }
        }

    }

    importContent(viewName): string {
        let viewLoader = new ViewLoader(this.params, this.viewScriptVars)

        viewLoader.load(viewName)
        viewLoader.parse()
        return viewLoader.viewContent
    }


}
