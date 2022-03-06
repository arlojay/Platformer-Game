const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "client/index.html", to: "game.html" },
                { from: "client/style.css", to: "style.css" },
            ],
        }),
    ],
	entry: "./client/main.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist"),
	},
	target: "web",
	mode: "development",
	experiments: {
		topLevelAwait: true,
	},
};
