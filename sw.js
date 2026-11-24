/* Mode hors ligne : met en cache le site après la première visite */
const V = 'nic-g21-v5';
const CORE = ['./', 'index.html', 'hub.js', 'hub.css', 'main.bundle.js', 'logo-esgis.png', 'slides/index.html'];
const BIG = ['media/video1.mp4','media/video2.mp4','media/video3.mp4','media/video4.mp4','media/video5.mp4','media/video6.mp4','media/video7.mp4',
  'media/poster1.jpg','media/poster2.jpg','media/poster3.jpg','media/poster4.jpg','media/poster5.jpg','media/poster6.jpg','media/poster7.jpg',
  'doc/Expose-Carte-Reseau-Groupe21.pdf','doc/Expose-Carte-Reseau-Groupe21.docx','doc/Programme-de-passage-Expose-Groupe21.docx'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
async function ranged(req, res) {
  const buf = await res.arrayBuffer(); const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range')); if (!m) return res;
  const size = buf.byteLength; let s = m[1] === '' ? size - +m[2] : +m[1]; let e = m[1] !== '' && m[2] !== '' ? +m[2] : size - 1; e = Math.min(e, size - 1);
  return new Response(buf.slice(s, e + 1), { status: 206, headers: { 'Content-Type': res.headers.get('Content-Type') || 'video/mp4', 'Content-Range': 'bytes ' + s + '-' + e + '/' + size, 'Content-Length': e - s + 1, 'Accept-Ranges': 'bytes' } });
}
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(V); const hit = await c.match(r.url, { ignoreSearch: true });
    if (hit) {
      if (!/\/(media|doc)\//.test(r.url)) e.waitUntil(fetch(r).then(n => { if (n.ok) c.put(r.url, n); }).catch(() => {}));
      return r.headers.get('range') ? ranged(r, hit.clone()) : hit;
    }
    try { const net = await fetch(r); if (net.ok && net.status === 200 && !r.headers.get('range')) c.put(r.url, net.clone()); return net; }
    catch (err) { return new Response('Hors ligne : fichier non mis en cache.', { status: 503 }); }
  })());
});
self.addEventListener('message', async e => {
  if (e.data !== 'precache') return; const c = await caches.open(V); let n = 0;
  const cl = await self.clients.matchAll(); const say = (t, k) => cl.forEach(x => x.postMessage({ off: t, n: k, total: BIG.length }));
  for (const u of BIG) { try { if (!(await c.match(u))) { const r = await fetch(u); if (r.ok) await c.put(u, r); } n++; say('prog', n); } catch (err) { say('err', n); return; } }
  say('ok', n);
});
