
const Server = require("./server.js");
process.env.IS_DEV = process.argv[2] === "dev";
Server.start();