// Nearby Hotels feature - client-side geolocation and simple local dataset
(function(){
  const HOTELS = [
    {name: 'Seaside Grand', lat:  -33.8688, lon: 151.2093, address: 'Seaside Avenue, Sydney', phone: '+61-2-5555-0101'},
    {name: 'Harbour View Suites', lat: -33.8700, lon: 151.2110, address: 'Harbour Rd, Sydney', phone: '+61-2-5555-0102'},
    {name: 'City Center Inn', lat: -33.8655, lon: 151.2090, address: 'Central Park, Sydney', phone: '+61-2-5555-0103'},
    {name: 'Riverside Retreat', lat: -33.8600, lon: 151.2150, address: 'River Rd, Sydney', phone: '+61-2-5555-0104'},
    {name: 'Airport Lodge', lat: -33.9461, lon: 151.1772, address: 'Airport Drive', phone: '+61-2-5555-0105'}
  ];

  function injectCSS(){
    const href='nearby-hotels.css';
    if(!document.querySelector(`link[href="${href}"]`)){
      const link=document.createElement('link'); link.rel='stylesheet'; link.href=href; document.head.appendChild(link);
    }
  }

  function haversine(lat1, lon1, lat2, lon2){
    const toRad = v => v * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function buildModal(){
    if(document.getElementById('nearbyModalRoot')) return;
    const btn = document.createElement('button'); btn.className='nearby-btn'; btn.id='nearbyBtn'; btn.textContent='Find Nearby Hotels';
    const modal = document.createElement('div'); modal.className='nearby-modal'; modal.id='nearbyModalRoot';
    modal.innerHTML = `
      <div class="nearby-header"><strong>Nearby Hotels</strong><button id="nearbyClose" style="background:none;border:none;color:white;font-weight:700;cursor:pointer">✕</button></div>
      <div class="nearby-body" id="nearbyBody"><p class="nearby-loading">Click "Find Nearby Hotels" to locate hotels near you.</p></div>
      <div class="nearby-note">Results provided from local sample data. Click Navigate to open Google Maps.</div>
    `;
    document.body.appendChild(btn); document.body.appendChild(modal);

    btn.addEventListener('click', onFindNearby);
    modal.querySelector('#nearbyClose').addEventListener('click', ()=>{ modal.classList.remove('open'); });
  }

  function renderResults(userPos, results){
    const modal = document.getElementById('nearbyModalRoot');
    const body = document.getElementById('nearbyBody');
    body.innerHTML = '';
    // show user's coords and maps search button
    const headerInfo = document.createElement('div');
    headerInfo.style.marginBottom = '8px';
    headerInfo.innerHTML = `<div style="font-size:13px;color:#222;margin-bottom:6px">Your location: ${userPos.lat.toFixed(5)}, ${userPos.lon.toFixed(5)}</div>`;
    const mapsBtn = document.createElement('a');
    mapsBtn.className = 'nearby-actions';
    const mapsLink = document.createElement('a');
    mapsLink.href = `https://www.google.com/maps/search/hotels/@${userPos.lat},${userPos.lon},14z`;
    mapsLink.target = '_blank';
    mapsLink.textContent = 'Search Google Maps for hotels near me';
    mapsLink.style.display = 'inline-block';
    mapsLink.style.padding = '8px 10px';
    mapsLink.style.background = '#4c81b3';
    mapsLink.style.color = '#fff';
    mapsLink.style.borderRadius = '6px';
    mapsLink.style.textDecoration = 'none';
    headerInfo.appendChild(mapsLink);
    body.appendChild(headerInfo);

    if(!results.length){ body.innerHTML += '<p>No nearby hotels found.</p>'; document.getElementById('nearbyModalRoot').classList.add('open'); return; }
    results.forEach(r=>{
      const div = document.createElement('div'); div.className='nearby-item';
      const dist = (r.distance).toFixed(2);
      div.innerHTML = `<h4>${escapeHtml(r.name)} <small style="color:#666;font-weight:600">${dist} km</small></h4><p>${escapeHtml(r.address)}</p>`;
      const actions = document.createElement('div'); actions.className='nearby-actions';
      // Navigate: directions from user's location
      const nav = document.createElement('a'); nav.className='navigate'; nav.textContent='Navigate';
      nav.href = `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lon}&destination=${r.lat},${r.lon}`;
      nav.target = '_blank';
      // Also allow searching the hotel name on maps centered on the hotel
      const searchOnMaps = document.createElement('a'); searchOnMaps.className='navigate'; searchOnMaps.textContent='Open on Maps';
      searchOnMaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}&query_place_id=`;
      searchOnMaps.target = '_blank';
      const call = document.createElement('a'); call.className='call'; call.textContent='Call'; call.href = `tel:${r.phone}`;
      actions.appendChild(nav); actions.appendChild(searchOnMaps); actions.appendChild(call);
      div.appendChild(actions);
      body.appendChild(div);
    });
    document.getElementById('nearbyModalRoot').classList.add('open');
  }

  function onFindNearby(){
    const modal = document.getElementById('nearbyModalRoot');
    const body = document.getElementById('nearbyBody');
    body.innerHTML = '<p class="nearby-loading">Requesting your location&hellip;</p>';
    modal.classList.add('open');
    if(!navigator.geolocation){ body.innerHTML = '<p>Geolocation is not supported by your browser.</p>'; return; }
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude; const lon = pos.coords.longitude;
      // compute distances
        const list = HOTELS.map(h=>({ ...h, distance: haversine(lat, lon, h.lat, h.lon) }));
      list.sort((a,b)=>a.distance - b.distance);
        renderResults({lat,lon}, list);
    }, err => {
      body.innerHTML = `<p>Unable to get location: ${escapeHtml(err.message || 'permission denied')}</p>`;
    }, {timeout:15000});
  }

  function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

  // init
  function init(){ injectCSS(); buildModal(); }
  if(document.readyState==='complete' || document.readyState==='interactive'){ setTimeout(init,200); } else { window.addEventListener('DOMContentLoaded', ()=>setTimeout(init,200)); }

  window.NearbyHotels = { init };

})();
