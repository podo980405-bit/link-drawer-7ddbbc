// 링크 서랍 서비스 워커: 앱 설치용. 인터넷이 되면 항상 최신 화면을 받고,
// 안 될 때만 마지막으로 받아 둔 화면을 보여 줌.
const CACHE = "link-drawer-v2";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; // 유튜브·GitHub 등 바깥 요청은 건드리지 않음
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          // 공유로 열린 주소(?text=...)도 같은 화면이라 주소 뒤 내용은 빼고 저장
          caches.open(CACHE).then(c => c.put(url.pathname, copy));
        }
        return res;
      })
      .catch(() => caches.match(url.pathname).then(r => r || caches.match("./")))
  );
});
