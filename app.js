    // Year
    document.getElementById('yr').textContent = new Date().getFullYear();

    // Mobile nav
    const hamb = document.getElementById('hamb');
    const navLinks = document.getElementById('navLinks');
    hamb.addEventListener('click', ()=> navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>navLinks.classList.remove('open')));

    // Open/close toggles for cards (work + projects share .toggle)
    document.querySelectorAll('.toggle').forEach(t => {
      t.addEventListener('click', () => t.parentElement.classList.toggle('open'));
    });

    // Scroll reveal
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('show'); observer.unobserve(e.target);} });
    }, {threshold: .12});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Animated skill bars on reveal
    document.querySelectorAll('.bar span').forEach(span => {
      const pct = Math.max(0, Math.min(100, parseInt(span.dataset.progress||'0',10)));
      const run = () => span.style.width = pct + '%';
      const io = new IntersectionObserver(es=>{es.forEach(x=>{if(x.isIntersecting){run(); io.unobserve(span);}})},{threshold:.4});
      io.observe(span);
    });

    // Market ticker random flares for micro-interaction
    setInterval(()=>{
      document.querySelectorAll('.tick').forEach((el,i)=>{
        if(Math.random()<0.06){ el.style.filter='drop-shadow(0 0 8px rgba(45,168,255,.6))'; setTimeout(()=>el.style.filter='', 600); }
      })
    },800);

    // Smooth scroll fix for browsers without CSS native support
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const id = a.getAttribute('href');
        if(id.length>1){ e.preventDefault(); document.querySelector(id).scrollIntoView({behavior:'smooth'}); }
      });
    });
