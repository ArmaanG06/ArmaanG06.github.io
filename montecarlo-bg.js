(() => {
  const canvas = document.getElementById('montecarlo-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  // Config (tweak these)
  const NUM_PATHS =20;
  const STEP_PX = 3;         // pixels moved on x per step
  const VOLATILITY = 7.5;    // vertical jitter scale
  const ALPHA_MIN = 0.06;    // faintest line alpha
  const ALPHA_MAX = 0.14;    // strongest line alpha
  const WIDTH_MIN = 0.6;
  const WIDTH_MAX = 1.6;
  const SPEED_STEPS_PER_FRAME = 1; // how many x-steps progress per frame

  // Utility: gaussian
  function gauss(){
    let u=0,v=0;
    while(u===0) u=Math.random();
    while(v===0) v=Math.random();
    return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
  }

  // color blending from CSS vars
  const cs = getComputedStyle(document.documentElement);
  const cssA = (cs.getPropertyValue('--acc1') || '#16f2b3').trim();
  const cssB = (cs.getPropertyValue('--acc2') || '#2da8ff').trim();
  function hexToRgb(h){
    h = (h||'#ffffff').replace('#','');
    if(h.length===3) h = h.split('').map(c=>c+c).join('');
    return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
  }
  function blend(a,b,t){
    const A=hexToRgb(a), B=hexToRgb(b);
    return `rgba(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)},`;
  }

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let paths = [];
  let steps = 0;
  let startX, startY;
  let raf = null;
  let currentStep = 1;

  function resizeAndBuild(){
    // stop animation while rebuilding
    if(raf) cancelAnimationFrame(raf);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // start position: center-left
    startX = Math.min(0, Math.round(window.innerWidth * 0.06));
    startY = Math.round(window.innerHeight * 0.5);

    steps = Math.ceil((window.innerWidth - startX) / STEP_PX) + 4;

    // build paths (each is an array of points)
    paths = [];
    for(let i=0;i<NUM_PATHS;i++){
      const points = [];
      let x = startX;
      // small per-path vertical offset for variety
      let y = startY + (i - NUM_PATHS/2) * 2.4 + (Math.random()-0.5)*12;
      for(let s=0;s<steps;s++){
        points.push({ x: Math.round(x), y: Math.round(y) });
        x += STEP_PX;
        // random-walk step in y. multiply by per-path scale for variety
        y += gauss() * VOLATILITY * (0.6 + Math.random()*0.9) + (Math.random()-0.5) * 0.6;
      }
      const t = i / Math.max(1, NUM_PATHS-1);
      const colorBase = blend(cssA, cssB, 0.5); // base blended rgb string prefix
      const color = `${colorBase}${(ALPHA_MIN + (ALPHA_MAX-ALPHA_MIN)*(0.2 + 0.8*Math.random())).toFixed(3)})`;
      const width = WIDTH_MIN + Math.random()*(WIDTH_MAX-WIDTH_MIN);
      paths.push({ points, color, width });
    }

    // clear canvas then draw small origin marker (optional)
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // reset animation counters
    currentStep = 1;
    raf = requestAnimationFrame(animateStep);
  }

  // Draw incremental segments for all paths for currentStep
  function animateStep(){
    // draw segments for this frame (advance by SPEED_STEPS_PER_FRAME)
    for(let k=0;k<SPEED_STEPS_PER_FRAME;k++){
      // for each path, draw next segment if available
      for(const p of paths){
        if(currentStep >= p.points.length) continue;
        const a = p.points[currentStep - 1];
        const b = p.points[currentStep];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.width;
        ctx.stroke();
      }
      currentStep++;
    }

    // continue until all steps drawn
    if(currentStep < steps){
      raf = requestAnimationFrame(animateStep);
    } else {
      // finished drawing full paths. Leave canvas as-is (no clearing).
      raf = null;
    }
  }

  // reduced motion fallback: draw all paths statically once
  if (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // build then draw fully
    resizeAndBuild();
    // draw everything at once
    for(const p of paths){
      ctx.beginPath();
      ctx.moveTo(p.points[0].x, p.points[0].y);
      for(let i=1;i<p.points.length;i++) ctx.lineTo(p.points[i].x, p.points[i].y);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.width;
      ctx.stroke();
    }
    return;
  }

  // initial run
  resizeAndBuild();

  // handle resize: debounce small
  let to=null;
  window.addEventListener('resize', () => {
    clearTimeout(to);
    to = setTimeout(resizeAndBuild, 120);
  }, { passive:true });

  // pause animation while page hidden to save CPU
  document.addEventListener('visibilitychange', () => {
    if(document.hidden && raf) cancelAnimationFrame(raf);
    if(!document.hidden && !raf && currentStep < steps) raf = requestAnimationFrame(animateStep);
  }, { passive:true });

})();


