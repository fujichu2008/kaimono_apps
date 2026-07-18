const CACHE_NAME = "appstudio-pwa-corporate-quest-real-company-battle-766192774c53f0bbebab";
const CACHE_PREFIX = "appstudio-pwa-corporate-quest-real-company-battle-";
const PRECACHE_URLS = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(PRECACHE_URLS);
        })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys
                    .filter(function (key) {
                        return key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME;
                    })
                    .map(function (key) {
                        return caches.delete(key);
                    })
            );
        })
    );
});

self.addEventListener("fetch", function (event) {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(function () {
                return caches.match("./index.html");
            })
        );
        return;
    }

    const staticDestinations = ["style", "script", "image", "font", "manifest", "worker"];
    const isStaticRequest = staticDestinations.includes(request.destination);
    if (!isStaticRequest) {
        event.respondWith(fetch(request));
        return;
    }

    event.respondWith(
        caches.match(request).then(function (cached) {
            if (cached) return cached;
            return fetch(request).then(function (response) {
                if (!response || !response.ok || response.type === "opaque") {
                    return response;
                }
                const copy = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(request, copy);
                });
                return response;
            });
        })
    );
});
