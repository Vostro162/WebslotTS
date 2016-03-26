

var params = {
  "--config_path": null,
  "--help": null
};

var isStarting = false

process.argv.forEach(function (val, index, array) {
  if(val == "--config_path") {
    params["--config_path"] = array[index + 1]
  } else if(val == "--help") {
    isStarting = true
    params["--config_path"] = "set the config path: --config_path $yourPath"
    params["--help"] = "show this message"
    console.log(params)
  }
})

function main(params : any) {
  let provider = require(__dirname + "/libs/HTTPProvider")
  let configObject = provider.HTTPProvider.loadConfigObject(params["--config_path"])
  if(configObject) {
    let providerObject = new provider.HTTPProvider(configObject)
    providerObject.start()
  }
}

if(!isStarting)main(params)
