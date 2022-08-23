const express = require("express");
const fs = require("fs");
const exws = require("express-ws");
const path = require("path");
const helmet = require("helmet");
const bodyParser = require('body-parser');
const http = require("http");
const Hasher = require("./hasher.js");
const Database = require("@replit/database");

const ClientInterface = require("./clientinterface.js");
const ChatManager = require("./chatmanager.js");

const db = new Database();

function getStatusPage(code) {
    let status = (`${code}`).replace(/[^0-9]/g, "");
    status = Number(status);
    const filePath = path.join(__dirname, "../statuses/" + status + ".html");

    if (fs.existsSync(filePath)) return fs.readFileSync(filePath).toString();
    else return fs.readFileSync(path.join(__dirname, "../statuses/unknown.html")).toString().replace("${code}", status);
}
function listAllFiles(directory) {
    let assets = fs.readdirSync(path.resolve(directory));
    assets.forEach((asset, i) => {
        if (asset.includes(".")) return
        assets[i] = null

        assets = assets.concat(listAllFiles(path.join(directory, asset)).map(l => asset + "/" + l))
    })

    return assets.filter(l => l != null)
}

class Server {
    static server = express();

    static async start() {
        exws(this.server);
        this.server.use(bodyParser.json());

        if (process.env.IS_DEV == "false") {
            this.server.use(helmet());
        }

        await ChatManager.setup();

        this.setupWebSocket();
        this.setupPaths();
        this.server.listen();
    }
    static setupWebSocket() {
        this.server.ws("/chat", (ws, req) => {
            ChatManager.clientJoin(ws);
            ws.on("close", () => {
                ChatManager.clientLeave(ws);
            })
            ws.on("message", (data) => {
                const { type, message } = JSON.parse(data);
                ChatManager.clientMessage(ws, type, message);
            })
        });
    }
    static setupPaths() {
        let securityPolicy = `
            default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval' 'unsafe-dynamic';
            script-src * data: blob: 'unsafe-inline' 'unsafe-eval';
            connect-src * data: blob: 'unsafe-inline';
            img-src * data: blob: 'unsafe-inline';
            style-src * data: blob: 'unsafe-inline';
            font-src * data: blob: 'unsafe-inline';
            frame-ancestors * data: blob: 'unsafe-inline' 'https://e621.net';
        `;
        const options = {
            setHeaders: (res, path, stat) => {
                res.set("Content-Security-Policy", securityPolicy.replace(/\s{4}|\n/g, ""));
            }
        }

        this.server.get("/", (req, res, next) => {
            res.redirect("/home/");
        })

        this.server.get("/browse/list", async (req, res, next) => {
            if (!req.query.sort) return next();

            let ret = await ClientInterface.levelList(req);
            res.status(200).send(JSON.stringify(ret));
        })

        this.server.get("/level", async (req, res, next) => {
            if (!req.query.id) return next();

            let ret = await ClientInterface.getLevel(req);
            if (!ret) return next();
            res.status(200).send(JSON.stringify(ret));
        })

        this.server.post("/publish", async (req, res) => {
            let error = null;
            let ret = null;
            try {
                ret = await ClientInterface.publish(req);
            } catch (e) {
                error = e ?? null;
                console.error(e);
            }

            if (error) res.status(500).write(typeof error == "string" ? error : JSON.stringify(error));
            else res.status(200).write(JSON.stringify(ret));

            res.end();
        })

        this.server.post("/register", async (req, res) => {
            try {
                const response = await ClientInterface.register(req);

                res.send(JSON.stringify(response));
            } catch (e) {
                res.send(JSON.stringify({
                    type: "error",
                    message: e.message ?? e
                }))

                console.error(e);
            }
        })

        this.server.post("/login", async (req, res) => {
            try {
                const response = await ClientInterface.login(req);

                res.send(JSON.stringify(response));
            } catch (e) {
                res.send(JSON.stringify({
                    type: "error",
                    message: e.message ?? e
                }))

                console.error(e);
            }
        })

        this.server.get("/info", async (req, res) => {
            const { token } = req.query;

            const client = await ClientInterface.getClientWithToken(Hasher.hashString(token));

            if (client) return res.status(200).send({
                type: "success",
                message: client
            });

            res.status(200).send({
                type: "error",
                message: "Client not found"
            })
        })

        this.server.get("/chat/messages", async (req, res) => {
            const { from, to } = req.query;

            if (from == null || to == null) return res.status(400).send("Malformed input");

            let messages = await db.get("chat/public");
            if (messages == null) {
                messages = [];
                await db.set("chat/public", []);
            }

            res.status(200).send(messages.slice(messages.length - to, messages.length - from));
        })

        this.server.get("/user/", (req, res) => {
            res.redirect("/");
        })

        this.server.get("/user/*", async (req, res, next) => {
            if (req.path.includes(".")) return next();

            const userId = req.path.split("/")[2];

            const account = await ClientInterface.getAccountById(userId);
            if (account == null) return next();

            const info = {
                username: account.username,
                creationDate: account.creationDate,
                id: account.id
            };

            let file = fs.readFileSync(path.join(__dirname, "../dist/user/index.html")).toString();
            file = file.replace("{{USER_INFO}}", JSON.stringify(info));
            res.status(200).send(file);
        })

        this.server.get("/assets", (req, res) => {
            let assets = listAllFiles("./client/assets/");
            res.status(200).send(JSON.stringify(assets));
        })



        this.server.get("/statustest/*", (req, res) => {
            let status = req.path.replace(/[^0-9]/g, "");
            status = Number(status);

            if (!fs.existsSync(path.join(__dirname, "../dist", req.path))) return res.status(http.STATUS_CODES[status] ? status : 500).send(getStatusPage(status));
        })

        this.server.use(express.static(path.join(__dirname, "../dist/"), options));

        this.server.use("/assets/", express.static(path.join(__dirname, "../client/assets")));

        this.server.get("*", (req, res, next) => {
            if (!fs.existsSync(path.join(__dirname, "../dist", req.path))) return res
                .status(404).send(getStatusPage(404));

            next();
        })
    }
}

module.exports = Server;