import __session = require("./Session")
import __objectSaver = require("../ObjectSaver")
import __utilities = require("../Utilities")
import __cookie = require("../cookies/Cookie")
import __cookieManager = require("../cookies/CookieManager")
import __httpProvider = require("../HTTPProvider")
import __fs = require("fs")

export interface SessionManagerInterface {
  cookieExpire: string
  sessionExpire: string
  sessionFolderPath: string
  fileEncoding: string
  session?: __session.Session
  sessions?: {}
}

export class SessionManager implements SessionManagerInterface {

    cookieExpire: string
    sessionExpire: string
    sessionFolderPath: string
    fileEncoding: string
    session: __session.Session
    sessions: {} = {}

    protected intervalID: number
    protected objectSaver: __objectSaver.ObjectSaver

    constructor(params: SessionManagerInterface) {
        this.cookieExpire = params.cookieExpire;
        this.sessionExpire = params.sessionExpire;
        this.sessionFolderPath = params.sessionFolderPath;
        this.fileEncoding = params.fileEncoding;
        this.session = params.session;
        this.objectSaver = new __objectSaver.ObjectSaver(this.sessionFolderPath, this.fileEncoding)
        if (params.sessions) { this.sessions = params.sessions }
    }

    startSession(cookieManager: __cookieManager.CookieManager): void {
        this.session = this.createSession();
        cookieManager.addCookie(this.createSessionCookie())
    }

    save(): void {
        console.log("hir bin ich")
        console.log(this.session.sessionId)
        //this.objectSaver.save(this.session.sessionId, this.session)
    }

    createSession(): __session.Session {

        let session =  new __session.Session({
                expire: this.sessionExpire,
                folderPath: this.sessionFolderPath,
                fileEncoding: this.fileEncoding
        })


        var isOkay = false
        while (isOkay == false) {

            var sessionFilePath = this.sessionFolderPath + "/" + session.sessionId + ".json"

            if (!__fs.existsSync(sessionFilePath)) {
                isOkay = true
            }

        }

        return session

    }


    createSessionCookie(): __cookie.Cookie {

        let cookieDate = new Date(Date.now() + eval(this.cookieExpire))
        var dateString = cookieDate.toUTCString()

        let cookie = new __cookie.Cookie({
            cookieName: "NODEJSSESSIONID",
            expire: dateString,
            httpOnly: true,
            values: this.session.sessionId
        });

        return cookie
    }

    loadSession(provider: __httpProvider.HTTPProvider) {

        let cookie = provider.cookieManager.cookies["NODEJSSESSIONID"];

        if (cookie) {

            let sessionId = cookie;
            let session = this.objectSaver.load(sessionId)

            if (session) {

                if (new Date().getTime() <= new Date(session.expire).getTime()) {
                    this.session = session
                    this.session.expire = new Date(Date.now() + eval(provider.config.session.sessionExpire)).toUTCString()
                    this.save()
                }

            } else {
                this.session = null
            }

        }

    }

    startCleaner(interval : string): void {

        console.log("Session Cleaner started with Interval ( " + eval(interval) + " )")

        let sessionManagerInstance = this

        this.intervalID = setInterval(() => {
            let sessions = __fs.readdirSync(sessionManagerInstance.sessionFolderPath)

            for (let sessionName of sessions) {

                var file = sessionName

                if (file == "." || file == "..") continue
                let session : __session.Session = sessionManagerInstance.objectSaver.load(file.split(".")[0])


                if (new Date(session.expire).getTime() <= new Date().getTime()) {

                    let filePath = sessionManagerInstance.sessionFolderPath + "/" + file
                    __fs.unlink(filePath)
                    console.log("removed session file ( " + file + " )")

                }

            }
        }, eval(interval))
    }

    endCleaner(): void {
        clearInterval(this.intervalID)
    }

}
