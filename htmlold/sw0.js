var cacheName = 'beta19';
var filesToCache = [
  cacheName+"/index.js",
  cacheName+"/style.css",
  cacheName+"/manifest.json"
]
self.addEventListener('install', function(e) {
  console.log('installing sw'+cacheName);
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate',  event => {
  event.waitUntil(
    caches.keys().then(keys=> Promise.all(
      keys.map(key=>{
        if (cacheName != key) {
          return caches.delete(key);
        }
      })
    )).then(()=>{
      console.log(cacheName+' is activated');
    })
  );
});

self.addEventListener('fetch', event => {
  var a = new URL(event.request.url);
  var request = cacheName+a.pathname.substr(a.pathname.lastIndexOf('/'))
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(event.request);
    })
  );
});
