/* ================================================================
   MURASOLIMARAN PORTFOLIO — SERVICE WORKER
================================================================ */

const CACHE_NAME =
  "murasolimaran-portfolio-v1.0.0";


/* =========================================
   PRECACHE
========================================= */

const PRECACHE_ASSETS = [

  "/",
  "index.html",
  "manifest.json",

  /* CSS */
  "style/style.css",

  /* MM Loader Logo */
  "assert/project_image/MM-logo.png"

];


/* =========================================
   INSTALL
========================================= */

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then((cache) => {

          return cache.addAll(
            PRECACHE_ASSETS
          );

        })

    );

    self.skipWaiting();

  }
);


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(

      caches
        .keys()
        .then((cacheNames) => {

          return Promise.all(

            cacheNames

              .filter(
                (name) =>
                  name !== CACHE_NAME
              )

              .map(
                (name) =>
                  caches.delete(name)
              )

          );

        })

    );

    self.clients.claim();

  }
);


/* =========================================
   FETCH
========================================= */

self.addEventListener(
  "fetch",
  (event) => {


    if (
      event.request.method !== "GET"
    ) {
      return;
    }


    const requestURL =
      new URL(event.request.url);


    /*
     * External resources:
     * Let browser handle them normally.
     */

    if (
      requestURL.origin !==
      self.location.origin
    ) {

      return;

    }


    /* =====================================
       HTML → NETWORK FIRST
    ===================================== */

    if (

      event.request.mode ===
        "navigate" ||

      requestURL.pathname === "/" ||

      requestURL.pathname.endsWith(
        ".html"
      )

    ) {

      event.respondWith(

        fetch(event.request)

          .then((networkResponse) => {


            /*
             * Save latest HTML
             */

            const responseClone =
              networkResponse.clone();


            caches
              .open(CACHE_NAME)
              .then((cache) => {

                cache.put(
                  event.request,
                  responseClone
                );

              });


            return networkResponse;

          })

          .catch(() => {


            /*
             * OFFLINE FALLBACK
             */

            return caches
              .match(event.request)

              .then((cachedResponse) => {

                return (

                  cachedResponse ||

                  caches.match(
                    "index.html"
                  )

                );

              });

          })

      );


      return;

    }


    /* =====================================
       STATIC ASSETS → CACHE FIRST
    ===================================== */

    event.respondWith(

      caches
        .match(event.request)

        .then((cachedResponse) => {


          /*
           * Cached → instant
           */

          if (
            cachedResponse
          ) {

            return cachedResponse;

          }


          /*
           * Not cached → network
           */

          return fetch(
            event.request
          )

            .then((networkResponse) => {


              /*
               * Cache successful response
               */

              if (

                networkResponse &&

                networkResponse.status ===
                  200

              ) {

                const responseClone =
                  networkResponse.clone();


                caches
                  .open(CACHE_NAME)
                  .then((cache) => {

                    cache.put(
                      event.request,
                      responseClone
                    );

                  });

              }


              return networkResponse;

            })

            .catch(() => {


              /*
               * Last fallback
               */

              return caches.match(
                "index.html"
              );

            });

        })

    );

  }
);