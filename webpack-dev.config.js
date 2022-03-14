const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const {plugins,entry,output} = require("./webpack.config.js");

module.exports = {
    plugins, entry, output,
	target: "web",
	mode: "development",
	experiments: {
		topLevelAwait: true,
	},
};
