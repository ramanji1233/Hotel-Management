// In-project Hotel Management Assistant
(function(){
  const PAGES = [
    'index.html',
    'luxury-rooms.html',
    'dining-hall.html',
    'infinity-pool.html',
    'food-beverages.html',
    'login.html',
    'main.html'
  ];

  // Minimal CSS injection (in case assistant.css isn't loaded)
  function injectCSS(){
    const href = 'assistant.css';
    if(!document.querySelector(`link[href="${href}"]`)){
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }

  // Simple index store
  const indexStore = [];

  // Fetch and index pages (text only)
  async function fetchAndIndex(){
    const fetches = PAGES.map(async path => {
      try{
        const res = await fetch(path);
        if(!res.ok) return null;
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const title = (doc.querySelector('title') && doc.querySelector('title').textContent) || path;
        // collect visible text from main areas
        const bodyText = doc.body ? doc.body.textContent.replace(/\s+/g,' ').trim() : '';
        // split into sentences
        const sentences = bodyText.split(/(?<=[.!?])\s+/).filter(Boolean);
        return {path, title, text: bodyText, sentences};
      }catch(e){
        return null;
      }
    });
    const results = await Promise.all(fetches);
    indexStore.length = 0;
    results.filter(Boolean).forEach(r=>indexStore.push(r));
  }

  // Simple keyword score + sentence extraction
  function searchQuery(query){
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/).filter(Boolean);
    if(!terms.length) return {hits:[], snippet:''};

    const hits = indexStore.map(page => {
      let score = 0;
      const excerpts = [];
      const text = page.text.toLowerCase();
      terms.forEach(t=>{
        const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
        const m = text.match(re);
        if(m) score += m.length;
      });
      // collect sentences containing any term
      page.sentences.forEach(s=>{
        const lower = s.toLowerCase();
        if(terms.some(t=>lower.includes(t))){
          excerpts.push(s.trim());
        }
      });
      return {page, score, excerpts};
    }).filter(h=>h.score>0).sort((a,b)=>b.score-a.score);

    // Build snippet from top excerpts
    const snippetParts = [];
    for(const h of hits.slice(0,4)){
      if(h.excerpts.length) snippetParts.push(`${h.excerpts.slice(0,2).join(' ')} [source: ${h.page.path}]`);
    }
    const snippet = snippetParts.join('\n\n');
    return {hits, snippet};
  }

  // Heuristic answer generator
  function answerQuery(query){
    const q = query.toLowerCase();
    // simple intent mapping
    if(q.includes('book') || q.includes('booking') || q.includes('reserve') || q.includes('book a room')){
      return {
        text: 'To make a booking: visit the Luxury Rooms page and click "Book This Room" on the desired room. You can also use the main booking form on the homepage.',
        sources: ['luxury-rooms.html','index.html']
      };
    }
    if(q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('₹')){
      return {
        text: 'Room prices are listed on the Luxury Rooms page next to each room (e.g., ₹1,999/night). Open the Luxury Rooms page to compare rates.',
        sources: ['luxury-rooms.html']
      };
    }
    if(q.includes('pool') || q.includes('cabana') || q.includes('lifeguard')){
      return {
        text: 'Pool information (cabana booking, lifeguards, and facilities) is on the Infinity Pool page. Click on any pool area for booking details.',
        sources: ['infinity-pool.html']
      };
    }
    if(q.includes('dining') || q.includes('restaurant') || q.includes('reserve table') || q.includes('menu')){
      return {
        text: 'Dining areas, menus, and reservation options are on the Dining Hall page. Use the reservation modal on that page to book a table.',
        sources: ['dining-hall.html']
      };
    }
    if(q.includes('beverage') || q.includes('juice') || q.includes('coffee') || q.includes('bar')){
      return {
        text: 'Food & Beverages services (juice bar, cocktail lounge, tea, coffee) are on the Food & Beverages page with ordering information.',
        sources: ['food-beverages.html']
      };
    }

    // fallback to search
    const res = searchQuery(query);
    if(res.hits.length){
      return {text: res.snippet || 'Found info in project files. See sources below.', sources: res.hits.map(h=>h.page.path)};
    }
    return {text: 'I could not find project-internal information matching your question. Try simpler keywords (e.g., "book room", "pool hours", "dining reservations").', sources: []};
  }

  // UI creation
  function createWidget(){
    if(document.getElementById('hotelAssistantRoot')) return;
    const root = document.createElement('div'); root.id='hotelAssistantRoot'; root.className='hotel-assistant';

    // toggle button
    const toggle = document.createElement('button'); toggle.className='ha-toggle'; toggle.innerHTML='🤖';
    root.appendChild(toggle);

    const panel = document.createElement('div'); panel.className='ha-panel'; panel.style.display='none';
    panel.innerHTML = `
      <div class="ha-header"><div style="width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center">🤖</div><h4>Hotel Assistant</h4></div>
      <div class="ha-body" id="haBody"><div class="ha-message bot">Hello — I can answer questions about this site (bookings, rooms, facilities). I only search project files.</div></div>
      <div class="ha-input"><input id="haInput" placeholder="Ask about rooms, bookings, dining..."/><button id="haSend">Ask</button></div>
      <div class="ha-footer-note">Responses are generated from site files only — no external AI used.</div>
    `;

    root.appendChild(panel);
    document.body.appendChild(root);

    const body = panel.querySelector('#haBody');
    const input = panel.querySelector('#haInput');
    const send = panel.querySelector('#haSend');

    function appendMessage(text, who='bot', sources=[]){
      const m = document.createElement('div'); m.className='ha-message '+(who==='user'?'user':'bot');
      m.innerHTML = `<div>${escapeHtml(text).replace(/\n/g,'<br>')}</div>`;
      if(sources && sources.length){
        sources = Array.from(new Set(sources)).slice(0,5);
        sources.forEach(s=>{
          const a = document.createElement('a'); a.href = s; a.className='ha-source'; a.textContent = `Source: ${s}`; a.target='_blank';
          m.appendChild(a);
        });
      }
      body.appendChild(m);
      body.scrollTop = body.scrollHeight;
    }

    toggle.addEventListener('click', ()=>{
      if(panel.style.display==='none'){
        panel.style.display='flex'; input.focus();
      } else {
        panel.style.display='none';
      }
    });

    send.addEventListener('click', async ()=>{ await handleSend(); });
    input.addEventListener('keydown', async (e)=>{ if(e.key==='Enter'){ e.preventDefault(); await handleSend(); } });

    async function handleSend(){
      const q = input.value.trim(); if(!q) return;
      appendMessage(q,'user'); input.value='';
      appendMessage('Searching site files...', 'bot');
      // answer
      const ans = answerQuery(q);
      // remove loading message
      const msgs = body.querySelectorAll('.ha-message.bot');
      if(msgs.length) msgs[msgs.length-1].remove();
      appendMessage(ans.text, 'bot', ans.sources || []);
    }
  }

  function escapeHtml(s){ return s.replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];}); }

  // Expose init
  window.HotelAssistant = {
    init: async function(){
      injectCSS();
      await fetchAndIndex();
      createWidget();
    },
    reindex: fetchAndIndex,
    pages: PAGES
  };

  // Auto init when script loads
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(()=>window.HotelAssistant.init(), 250);
  } else {
    window.addEventListener('DOMContentLoaded', ()=>setTimeout(()=>window.HotelAssistant.init(),250));
  }

})();
