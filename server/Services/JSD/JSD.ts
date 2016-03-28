export class JSD {

  main(...params : string[]) {

    let objName = params[0];
    let globalEval = eval;
    let globalObject = globalEval("this");

    if(objName == "global" || objName == undefined) {
        return Object.getOwnPropertyNames(globalObject).toString();
    } else {
        var obj = globalObject[objName];
        for(let propterty of params) {
          if(propterty != objName) {
              obj = obj[propterty];
          }
        }

        return Object.getOwnPropertyNames(obj).toString();
    }

  }

}
