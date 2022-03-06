const express = require("express");
const fs = require("fs");
const exws = require("express-ws");
const path = require("path");
const helmet = require("helmet");
const bodyParser = require('body-parser');

const ClientInterface = require("./clientinterface.js");

class Server {
    static server = express();
    static maxid = 0;
    static clients = new Map();

    static start() {
        exws(this.server);
        this.server.use(bodyParser.text());

		if (process.env.IS_DEV == "false") {
			this.server.use(helmet());
		}
        
        this.setupWebSocket();
        this.setupPaths();
        this.server.listen();
    }
    static setupWebSocket() {
        this.server.ws("/", (ws, _req) => {
            ws.id = this.maxid++;
            this.clients.set(ws.id, ws);

            console.log("user join");

            ws.on("close", () => {
                console.log("user left");
            });
        });
    }
    static setupPaths() {
        let securityPolicy = `
            default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval' 'unsafe-dynamic'; 
            script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; 
            connect-src * data: blob: 'unsafe-inline'; 
            img-src * data: blob: 'unsafe-inline'; 
            frame-src * data: blob: ; 
            style-src * data: blob: 'unsafe-inline';
            font-src * data: blob: 'unsafe-inline';
            frame-ancestors * data: blob: 'unsafe-inline';
        `;
        const options = {
            setHeaders: (res,path,stat) => {
                res.set("Content-Security-Policy", securityPolicy.replace(/\s{4}|\n/g,""));
            }
        }

        this.server.get("/", (req, res) => {
            if(req.headers.host == "arlojay.com") return res.sendFile(path.join(__dirname,"../dist/construction.html"));
            return res.sendFile(path.join(__dirname,"../dist/game.html"));
        })
        this.server.get("/game.html", (req, res) => {
            if(req.headers.host == "arlojay.com") {
                res.status(403);
                return res.end();
            }
            return res.sendFile(path.join(__dirname,"../dist/game.html"));
        })
        this.server.post("/publish", (req, res) => {
            let error = null;
            let ret = null;
            try {
                
                ret = ClientInterface.publish(req);
            } catch(e) {
                error = e ?? null;
                console.error(e);
            }

            if(error) res.status(500).write(JSON.stringify(error));
            else res.status(200).write(JSON.stringify(ret));

            res.end();
        })
        this.server.use(express.static(path.join(__dirname,"../dist/"), options));

        this.server.use("/assets/", express.static(path.join(__dirname, "../client/assets")));
    }
}

module.exports = Server;