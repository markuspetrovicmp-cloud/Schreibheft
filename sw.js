const CACHE='schreibheft-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('schreibheft-')&&key!==CACHE).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(request,{cache:'no-cache'});
      if(response.ok)await cache.put(request,response.clone());
      return response;
    }catch(error){
      const saved=await caches.match(request);
      if(saved)return saved;
      if(request.mode==='navigate'){
        const offline=await caches.match('./index.html');
        if(offline)return offline;
      }
      throw error;
    }
  })());
});
