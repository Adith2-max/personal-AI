
const CACHE_NAME = 'zyra-ai-cache-v1';

// All local files that make up the app shell.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/vite.svg',
  '/App.tsx',
  '/types.ts',
  '/constants.tsx',
  '/contexts/AppContext.tsx',
  '/services/geminiService.ts',
  '/hooks/useSpeechToText.ts',
  '/components/DashboardLayout.tsx',
  '/components/Sidebar.tsx',
  '/components/Spinner.tsx',
  '/components/ListeningModal.tsx',
  '/pages/LoginPage.tsx',
  '/pages/ChatPage.tsx',
  '/pages/ImagePage.tsx',
  '/pages/SearchPage.tsx',
  '/pages/SettingsPage.tsx',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add core app shell files. We don't add third party URLs here
        // to avoid the install failing if the CDN is down. They will be
        // cached by the fetch handler on first access.
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle non-GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For API calls, always go to the network.
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found.
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network.
        return fetch(event.request).then((networkResponse) => {
          // Cache the new response for future use.
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
               cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});
