
import __cookie = require("./Cookie")
import __utilities = require("../Utilities")

export class CookieManager {

  cookies = {}
  protected setedCookies = {}

  setup(cookies? : string) : void {
      //TDOO: add cookies as Cookie object
      this.cookies = {}
      this.setedCookies = {}

      if(cookies) {
        for(let cookie of cookies.split(";")) {

          let values = cookie.split("=")
          var cookieValue : string

          try {
            cookieValue = JSON.parse(values[1])
          } catch (e){
            cookieValue = values[1]
          }

          let cookieObj = new __cookie.Cookie({
            cookieName : values[0],
            values : cookieValue
          });

          this.cookies[values[0]] = cookieObj

        }

      }
  }

  toHTTPField(field? : string[][]) : string[][]  {
    if(!field) field = []

    if(!__utilities.Utilities.isEmpty(this.setedCookies)) {
      for(let key in this.setedCookies) {
          let cookieHeader : string[] = ["Set-Cookie",this.setedCookies[key].toString()]
          field.push(cookieHeader)
      }
    }

    return field

  }

  addCookie(cookie : __cookie.Cookie) : void {
      this.cookies[cookie.cookieName] = cookie
      this.setedCookies[cookie.cookieName] = cookie
  }

  deleteCookie(cookieName : string) : void {
    delete this.setedCookies[cookieName];
  }

  getValue(cookieName : string, key : string) : any {
    if(!__utilities.Utilities.isEmpty(this.cookies)) {
      var cookie = this.cookies[cookieName];
      if(cookie) {
        return cookie[key];
      }
    }
  }
}
