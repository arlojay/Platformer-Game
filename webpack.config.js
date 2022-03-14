const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "client/editor/index.html", to: "editor/index.html" },
                { from: "client/editor/style.css", to: "editor/style.css" },
                { from: "client/browse/index.html", to: "browse/index.html" },
                { from: "client/browse/style.css", to: "browse/style.css" },
                { from: "client/play/index.html", to: "play/index.html" },
                { from: "client/play/style.css", to: "play/style.css" },
                { from: "client/globals.css", to: "globals.css" },
            ],
        })
    ],
	entry: {
        "browse/bundle": path.resolve(__dirname, "client/browse/main.js"),
        "editor/bundle": path.resolve(__dirname, "client/editor/main.js"),
        "play/bundle": path.resolve(__dirname, "client/play/main.js")
    },
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js"
	},
	target: "web",
	mode: "production",
	experiments: {
		topLevelAwait: true,
	},
};
