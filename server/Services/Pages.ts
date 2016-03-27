import __viewLoader = require("../libs/ViewLoader")
import __serviceInterface = require("../libs/ServiceInterface")
import __provider = require("../libs/HTTPProvider")

export class Pages implements __serviceInterface.ServiceInterface {

  provider: __provider.HTTPProvider
  paramters: any

  main(name): string {

    let viewLoader = new __viewLoader.ViewLoader({
        controller: this,
        viewFolderPath: this.provider.config.viewFolderPath,
        model: this.paramters
    });

    viewLoader.load(name);
    viewLoader.parse();
    return viewLoader.viewContent;
    
  }

}
