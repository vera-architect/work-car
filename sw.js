// 작업 차량 계산기 — 오프라인용 서비스 워커
// 같은 주소의 파일만 저장해 두고: 저장본을 먼저 보여주고, 그사이 새 버전을 받아 다음에 열 때 씀
var CACHE = 'twc-site-b46f1392';
var SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('twc-site-') === 0 && k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (res) {
    if (!res || !res.ok) return res;
    var copy = res.clone();
    return caches.open(CACHE).then(function (c) { return c.put(req, copy); }).then(function () { return res; });
  });
  e.waitUntil(net.then(function () {}, function () {}));
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return net.catch(function () {
      return req.mode === 'navigate' ? caches.match('index.html') : Response.error();
    });
  }));
});
