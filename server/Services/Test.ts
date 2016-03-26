import __serviceInterface = require("../libs/ServiceInterface")
import __provider = require("../libs/HTTPProvider")
import __cookie = require("../libs/cookies/Cookie")
import __viewLoader = require("../libs/ViewLoader")

//TODO: Cookie Functional Test == YES
//TODO: Cookie Logical Test == NO
//TODO: View Loader Test == YES
//TODO: Vuew Loader Logic Test == NO
//TODO: Session Functional Test == NO
//TODO: Session Logical Test == NO

function setupController(controller, viewName) {
    controller.model = {};

    let viewLoader = new __viewLoader.ViewLoader({
        controller: controller,
        viewFolderPath: controller.provider.config.viewFolderPath,
        model: {
            key: "Value",
            text: "ich bin cool"
        }
    });

    viewLoader.load(viewName);
    viewLoader.parse();
    return viewLoader.viewContent;

}

export class Test implements __serviceInterface.ServiceInterface {

    provider: __provider.HTTPProvider
    paramters: any

    test(param: string): string {
        return "Jo hdhd log with param " + param
    }

    cookieTest(): string {


        if (!this.provider.cookieManager.cookies["user2"]) {
            console.log("create cookie");
            var cookie = new __cookie.Cookie({
                cookieName: "user2",
                expire: new Date(Date.now() + (60000 * 1)).toUTCString(),
                httpOnly: true
            })

            cookie.addValue("username", "Marius")
            cookie.addValue("userid", "44758539339")
            this.provider.cookieManager.addCookie(cookie)

        }

        console.log(this.provider.cookieManager.cookies)

        return this.provider.cookieManager.cookies["user2"].getValue("username")

    }

    showView() {
        return setupController(this, "Test");
    }

    sessionTest() {
        if (this.provider.sessionManager.session == null || this.provider.sessionManager.session == undefined) {
            console.log("create session");
            this.provider.sessionManager.startSession(this.provider.cookieManager);
            this.provider.sessionManager.session.addValue("name", "Marius");
            this.provider.sessionManager.save();
        }

        if(this.provider.sessionManager.session) {
          return this.provider.sessionManager.session.getValue("name")
        }

        return "keine session vorhanden"
    }

}
