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

// --- Simulated Market Ticker ---
setInterval(() => {
  document.querySelectorAll('.tick').forEach(tick => {
    const priceEl = tick.querySelector('.price');
    const chgEl = tick.querySelector('.chg');

    // Get current values
    let price = parseFloat(priceEl.textContent.replace(/,/g,'')) || 100;
    let pctChange = parseFloat(chgEl.textContent) || 0;

    // Simulate a random % change
    const delta = (Math.random() - 0.5) * 0.4; // ±0.2%
    const newPrice = price * (1 + delta / 100);

    // Update DOM
    priceEl.textContent = newPrice.toFixed(2);
    const newPct = delta.toFixed(2);

    chgEl.textContent = (delta >= 0 ? '+' : '') + newPct + '%';
    chgEl.classList.remove('up','down');
    chgEl.classList.add(delta >= 0 ? 'up' : 'down');
  });
}, 3000); // update every 3s


// Smooth scroll fix for browsers without CSS native support
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){ e.preventDefault(); document.querySelector(id).scrollIntoView({behavior:'smooth'}); }
  });
});

