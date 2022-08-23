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
                { from: "client/home/index.html", to: "home/index.html" },
                { from: "client/home/style.css", to: "home/style.css" },
                { from: "client/comments/index.html", to: "comments/index.html" },
                { from: "client/comments/style.css", to: "comments/style.css" },
                { from: "client/markdowntext/index.html", to: "markdowntext/index.html" },
                { from: "client/markdowntext/style.css", to: "markdowntext/style.css" },
                { from: "client/account/index.html", to: "account/index.html" },
                { from: "client/account/style.css", to: "account/style.css" },
                { from: "client/chat/index.html", to: "chat/index.html" },
                { from: "client/chat/style.css", to: "chat/style.css" },
                { from: "client/user/index.html", to: "user/index.html" },
                { from: "client/user/style.css", to: "user/style.css" },
                { from: "client/globals.css", to: "globals.css" },
                { from: "client/manifest.webmanifest", to: "manifest.webmanifest" },
                { from: "client/serviceworker.js", to: "serviceworker.js" }
            ],
        })
    ],
    entry: {
        "browse/bundle": path.resolve(__dirname, "client/browse/main.js"),
        "editor/bundle": path.resolve(__dirname, "client/editor/main.js"),
        "play/bundle": path.resolve(__dirname, "client/play/main.js"),
        "home/bundle": path.resolve(__dirname, "client/home/main.js"),
        "comments/bundle": path.resolve(__dirname, "client/comments/main.js"),
        "markdowntext/bundle": path.resolve(__dirname, "client/markdowntext/main.js"),
        "account/bundle": path.resolve(__dirname, "client/account/main.js"),
        "chat/bundle": path.resolve(__dirname, "client/chat/main.js"),
        "user/bundle": path.resolve(__dirname, "client/user/main.js")
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
