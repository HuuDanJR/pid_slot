'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "99e2301f963a7308c7d264c795651971",
"favicon.ico": "5783ffc07d9f8d02ef683e6d4980e0b3",
"index.html": "071b189c38992f4bbaa72d7a1f634f88",
"/": "071b189c38992f4bbaa72d7a1f634f88",
"main.dart.js": "3daa4ea6ca6417490ac7c81b9f1eb225",
"flutter.js": "8ae00b472ec3937a5bee52055d6bc8b4",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "6a69f4be28ca6dba731e2f4ab3272f9e",
"assets/AssetManifest.json": "f1b8766917ef388e9ae031ddd6b54a45",
"assets/NOTICES": "1d6262c9cb0ad5a2f3b448e0cfc63dc6",
"assets/FontManifest.json": "2b743737465103f0ed096d130962738c",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/esc_pos_utils/resources/capabilities.json": "ae5c3288b81125ab9c54fff02d30387e",
"assets/packages/fluttertoast/assets/toastify.js": "e7006a0a033d834ef9414d48db3be6fc",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/shaders/ink_sparkle.frag": "2ad5fabd6a36a6deff087b8edfd0c1f8",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/icons/happy.png": "41c5e0d0896d3877f5f7178b3ce86ee1",
"assets/assets/icons/Vegas_membership_One+-1.png": "0cf36dcdb5180b8e03e0498030c8f03f",
"assets/assets/icons/happiness_1.png": "cc1770f1bedeac5ad7df36f859cd8ac6",
"assets/assets/icons/Vegas_membership_One+-2.png": "d66155c393630cf5d8ce557a848bca78",
"assets/assets/icons/sad.png": "b8cff3f925eb351b01df8bdc7848137f",
"assets/assets/icons/happiness.png": "7e80681064f22c58f3bdbee4d0ac6d40",
"assets/assets/icons/Vegas_membership_One-2.png": "c0590836e863df531a843f2858e8ec6d",
"assets/assets/icons/Vegas_membership_One-1.png": "9d4e9d675e32e895c58d753f1be935bf",
"assets/assets/icons/Vegas_membership_P-1.png": "33ab1ba0792746f2e3cbad0adc4c6d7f",
"assets/assets/icons/Vegas_membership_I-2.png": "ed28a1e8a494b07e99b587ab7c33e142",
"assets/assets/icons/Vegas_membership_P-2.png": "5990798e0df9c48d7a0e9c232136bb6f",
"assets/assets/icons/logo_app_yellow.png": "17663e288b54d766ac46037b91f02793",
"assets/assets/icons/Vegas_membership_I-1.png": "9dd174f14b1770d0d31ed753e447e9f4",
"assets/assets/icons/Vegas_membership_V-1.png": "0b4c066b639e6353c660f8c4b0b7ac20",
"assets/assets/icons/Vegas_membership_V-2.png": "87666b11388e551668b4bbf8132f3633",
"assets/assets/fonts/BebasNeue-Regular.otf": "efe36cb1e690638fc59af446ffc5e774",
"assets/assets/fonts/Quicksand-Medium.ttf": "890d9ed927bb7f0c6b9eed04f9c329e5",
"assets/assets/fonts/Quantum_Lemon_Bold.ttf": "0620ece73f774b5cee9462497f2f0514",
"assets/assets/fonts/PlayfairDisplay-VariableFont_wght.ttf": "168ee09f171436bd22bfc276dc181ada",
"assets/assets/fonts/Cinzel-VariableFont_wght.ttf": "19d9462715f8122b5f57ef71b81843d0",
"assets/assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf": "f54fcb31947f45744af46e4bb6166b0e",
"assets/assets/fonts/GoldencoastpersonaluseItalic-7BR0w.otf": "b89a558c76ab7f0c7b1ec50cbb664c56",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
