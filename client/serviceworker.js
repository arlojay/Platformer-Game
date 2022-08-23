self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open("platformer").then((cache) => cache.addAll([
            "/globals.css",

            "/home/index.html",
            "/home/style.css",
            "/home/bundle.js",

            "/editor/index.html",
            "/editor/style.css",
            "/editor/bundle.js",

            // "/settings/index.html",
            // "/settings/style.css",
            // "/settings/bundle.js",

            // "/campaign/index.html",
            // "/campaign/style.css",
            // "/campaign/bundle.js"
        ])),
    );
});

function clearCache() {
    caches.keys().then(names => {
        for (let name of names) caches.delete(name);
    });
}

self.addEventListener("fetch", (e) => {
    console.log(e.request.url);
    if (new URL(e.request.url) == "/reset_offline_worker/") {
        clearCache()
        console.log("Successfully cleared the cache of the offline worker!")
    } else {
        e.respondWith(
            caches.match(e.request).then((response) => response || fetch(e.request)),
        );
    }
});