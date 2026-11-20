(() => {
  function init() {
    if (document.querySelector('.dfl-hiring-tab')) return;
    const bag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2M3 13c4 3 14 3 18 0M12 12v3"/></svg>';
    const tab = document.createElement('button');
    tab.type = 'button';tab.className = 'dfl-hiring-tab';
    tab.setAttribute('aria-controls','dfl-hiring-panel');tab.setAttribute('aria-expanded','false');tab.setAttribute('aria-label','Open now hiring information');
    tab.innerHTML = bag + '<span>Now Hiring</span>';
    const panel = document.createElement('section');
    panel.id='dfl-hiring-panel';panel.className='dfl-hiring-panel';
    panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Now hiring at Desert Forest Landscape');
    panel.hidden=true;
    panel.innerHTML='<button type="button" class="dfl-hiring-close" aria-label="Close hiring popup">&times;</button><p class="dfl-hiring-eyebrow">Join our team</p><h2>We’re Now Hiring!</h2><p>Interested in working with Desert Forest Landscape? Tell us about yourself and your experience.</p><a class="dfl-hiring-apply" href="/application.html">Apply Now →</a>';
    document.body.append(tab,panel);
    let lastFocused=null;
    function setOpen(open,focus=false){panel.hidden=!open;tab.setAttribute('aria-expanded',String(open));tab.setAttribute('aria-label',open?'Hiring information is open':'Open now hiring information');if(open){lastFocused=document.activeElement;if(focus)panel.querySelector('.dfl-hiring-close').focus();}else if(focus&&lastFocused?.focus)lastFocused.focus();}
    tab.addEventListener('click',()=>setOpen(panel.hidden,true));
    panel.querySelector('.dfl-hiring-close').addEventListener('click',()=>setOpen(false,true));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)setOpen(false,true);});
    window.setTimeout(()=>setOpen(true),5000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();