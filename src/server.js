const express = require("express");
const fs = require("fs");
const exws = require("express-ws");
const path = require("path");
const helmet = require("helmet");
const bodyParser = require('body-parser');
const http = require("http");

const ClientInterface = require("./clientinterface.js");

function getStatusPage(code) {
    let status = (`${code}`).replace(/[^0-9]/g,"");
    status = Number(status);
    const filePath = path.join(__dirname,"../statuses/"+status+".html");
    
    if(fs.existsSync(filePath)) return fs.readFileSync(filePath).toString();
    else return fs.readFileSync(path.join(__dirname,"../statuses/unknown.html")).toString().replace("${code}",status);
}

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

        this.server.get("/", (req, res, next) => {
            if(req.headers.host == "arlojay.com") {
                res.sendFile(path.join(__dirname,"../dist/construction.html"));
            } else {
                next();
            }
        })

        this.server.get("/browse/list", async (req, res, next) => {
            if(!req.query.sort) return next();

            let ret = await ClientInterface.levelList(req);
            res.status(200).send(JSON.stringify(ret));
        })

        this.server.get("/level", async (req, res, next) => {
            if(!req.query.id) return next();

            let ret = await ClientInterface.getLevel(req);
            if(!ret) return next();
            res.status(200).send(JSON.stringify(ret));
        })
        
        this.server.post("/publish", async (req, res) => {
            let error = null;
            let ret = null;
            try {
                ret = await ClientInterface.publish(req);
            } catch(e) {
                error = e ?? null;
                console.error(e);
            }

            if(error) res.status(500).write(typeof error == "string" ? error : JSON.stringify(error));
            else res.status(200).write(JSON.stringify(ret));

            res.end();
        })

        this.server.get("/statustest/*", (req, res) => {
            let status = req.path.replace(/[^0-9]/g,"");
            status = Number(status);
            
            if(!fs.existsSync(path.join(__dirname, "../dist", req.path))) return res.status(http.STATUS_CODES[status] ? status : 500).send(getStatusPage(status));
        })
        
        this.server.use(express.static(path.join(__dirname,"../dist/"), options));

        this.server.use("/assets/", express.static(path.join(__dirname, "../client/assets")));

        this.server.get("*", (req, res, next) => {
            if(!fs.existsSync(path.join(__dirname, "../dist", req.path))) return res
                .status(404).send(getStatusPage(404));

            next();
        })
    }
}

module.exports = Server;