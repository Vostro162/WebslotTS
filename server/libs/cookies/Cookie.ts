export interface CookieInterface {
  cookieName : string
  values? : {}
  expire? : string
  path? : string
  domain?: string
  httpOnly? : boolean
  security? : string
}
export class Cookie implements CookieInterface {

  cookieName : string
  values : {}
  expire : string
  path : string
  domain : string
  httpOnly : boolean
  security : string

  constructor(params : CookieInterface) {

    this.cookieName = params.cookieName
    this.values = (params.values) ? params.values : {}
    this.expire = params.expire
    this.domain = params.domain
    this.httpOnly = params.httpOnly
    this.security = params.security

  }

  addValue(key : string, value : any) : void {
    this.values[key] = value
  }

  getValue(key : string) : any {
    return this.values[key]
  }

  toString() : string {

      var param = ""
      var valuesString : any = (typeof this.values == "object") ? JSON.stringify(this.values) : this.values;
      if(!valuesString) valuesString = ""

      param = this.cookieName + "=" + valuesString + ";"
      param += "Expires=" + this.expire + ";"
      param += "Path=" + this.path + ";"
      param += "Security=" + this.security + ";"
      if(this.httpOnly) param += "HttpOnly=" + this.httpOnly + ";"
      if(this.domain) param += "Domain=" + this.domain + ";"

      return param
  }

}
