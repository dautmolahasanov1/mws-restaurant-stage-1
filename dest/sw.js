// Cache on install
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open("caches-v1").then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/styles.css',
                '/js/main.js',
                '/js/restaurant_info.js',
                'js/responsivelyLazy.min.js',
                '/js/dbhelper.js'
            ])
        })
    )
});

// check if cache exists and if a match is found return it, if no match, return a network fetch and cache a clone
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(localResponse) {
            return localResponse || fetch(event.request).then(function(internetResponse) {
                return caches.open('caches-v1').then(function(cache) {
                    console.log(event.request);
                    cache.put(event.request, internetResponse.clone());
                    return internetResponse;
                });
            });
            // fallback
        }).catch(function() {
            return caches.match('/');
        })
    );
});