var idb = require('idb');

// Cache on install
self.addEventListener('install', function(event) {
    event.waitUntil(caches.open("caches-v1")
        .then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/styles.css',
                '/js/main.js',
                '/js/restaurant_info.js',
                'js/responsivelyLazy.min.js',
                '/js/dbhelper.js'
            ]);
        })
    );
});

var dbPromise = idb.open('restaurant-db', 1, function(upgradeDb) {
    upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
    });
});



// check if cache exists and if a match is found return it, if no match, return a network fetch and cache a clone
self.addEventListener('fetch', function(event) {

    if (event.request.url == 'http://localhost:1337/restaurants') {
        event.respondWith(
            dbPromise.then(function(db) {
                return db.transaction('restaurants')
                    .objectStore('restaurants').getAll()
            }).then(function(allObjs) {
                if (allObjs.length > 0) {
                    return new Response(JSON.stringify(allObjs), { "status": 200, "statusText": "MyCustomResponse!" });
                } else {
                    fetch(event.request).then(function(internetResponse) {
                        internetResponse.clone().json().then(function(restaurants) {

                            dbPromise.then(function(db) {
                                var tx = db.transaction('restaurants', 'readwrite');
                                var store = tx.objectStore('restaurants');

                                restaurants.forEach(function(restaurant) {
                                    store.put(restaurant);
                                });

                                return tx.complete;
                            }).then(function() {
                                console.log('Added');
                            }).catch(function(error) {
                                console.error('Error:' + error);
                            });
                        });
                        return internetResponse;
                    })
                }
            })
        )
    } else {
        event.respondWith(caches.match(event.request)
            .then(function(localResponse) {
                return localResponse || fetch(event.request).then(function(internetResponse) {

                    return caches.open('caches-v1')
                        .then(function(cache) {
                            cache.put(event.request, internetResponse.clone());
                            return internetResponse;
                        });
                    // fallback
                }).catch(function() {
                    return caches.match('/');
                });

            })
        );
    }
});