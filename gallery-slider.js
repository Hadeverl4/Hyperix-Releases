(function () {
  'use strict';
  const section=document.querySelector('.showcase');
  const rail=document.getElementById('gallery-track');
  const prev=document.getElementById('gallery-prev');
  const next=document.getElementById('gallery-next');
  if(!section||!rail||!prev||!next)return;
  const slides=Array.from(rail.querySelectorAll('.screenshot'));
  // The number of slides may grow when new launcher screenshots are added.
  const counter=document.querySelector('.gallery-toolbar > span');
  const title=document.getElementById('showcase-title');
  const description=document.getElementById('gallery-feature-desc');
  const activeFeature=document.getElementById('gallery-active-feature');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let index=0, startX=null, startY=null, dragPointer=null, outgoing=-1, settleTimer=0, titleTimer=0, lastMoveAt=0, streak=0;
  function updateFeature(){
    if(!activeFeature)return;
    activeFeature.querySelector('strong').textContent=slides[index].querySelector('figcaption strong')?.textContent || '';
    activeFeature.querySelector('span').textContent=slides[index].querySelector('figcaption span')?.textContent || '';
  }
  function paint() {
    slides.forEach((slide,i)=>{
      const delta=i-index;
      // Older screenshots remain behind the active one, new screenshots await at right.
      slide.style.setProperty('--depth',String(delta<0?Math.min(-delta,3):0));
      slide.style.setProperty('--shift',delta>0?'95%':delta<0?'-2%':'0%');
      slide.style.setProperty('--scale',delta<0?String(Math.max(.90,1+delta*.035)):'1');
      // Keep a returning screenshot opaque and on top until it reaches its right peek.
      slide.style.setProperty('--opacity',i===outgoing?'1':delta>=0?'1':'0.16');
      slide.style.zIndex=i===outgoing?'40':delta===0?'30':delta>0?String(20-delta):String(10+delta);
      slide.classList.toggle('is-active',delta===0);
      slide.setAttribute('aria-hidden',String(delta!==0));
    });
    section.style.setProperty('--gallery-heading-opacity','1');
    // The page language switch owns the localized showcase heading.
    // Do not restore the English heading cached at slider initialization.
    if(description) {
      description.textContent='';
    }
    prev.disabled=index===0; next.disabled=index===slides.length-1;
    if(counter)counter.textContent=String(index+1).padStart(2,'0')+' - '+String(slides.length).padStart(2,'0')+' / '+(document.documentElement.lang==='vi'?'KHÁM PHÁ GIAO DIỆN':'EXPLORE THE EXPERIENCE');
  }
  function move(step){
    const target=Math.min(slides.length-1,Math.max(0,index+step));
    if(target===index)return;
    if(activeFeature){
      window.clearTimeout(titleTimer);
      activeFeature.classList.add('is-changing');
    }
    const now=performance.now();
    streak=now-lastMoveAt<550?Math.min(streak+1,4):0;
    lastMoveAt=now;
    const duration=reduced.matches?0:Math.max(320,780-streak*115);
    section.style.setProperty('--gallery-motion-duration',duration+'ms');
    section.classList.toggle('is-rapid',streak>0);
    window.clearTimeout(settleTimer);
    outgoing=step<0?index:-1;
    index=target; paint();
    titleTimer=window.setTimeout(()=>{
      updateFeature();
      activeFeature?.classList.remove('is-changing');
    },reduced.matches?0:130);
    settleTimer=window.setTimeout(()=>{
      outgoing=-1;
      section.classList.remove('is-rapid');
      paint();
    },duration+40);
  }
  prev.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  rail.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();move(1);}
    if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}
  });
  rail.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    startX=e.clientX; startY=e.clientY; dragPointer=e.pointerId;
    if(e.pointerType==='mouse'){rail.setPointerCapture(e.pointerId);rail.classList.add('is-dragging');}
  });
  rail.addEventListener('pointerup',e=>{
    if(startX===null||dragPointer!==e.pointerId)return;
    const distance=e.clientX-startX, dy=e.clientY-startY;
    startX=null;startY=null;dragPointer=null;
    rail.classList.remove('is-dragging');
    if(rail.hasPointerCapture(e.pointerId))rail.releasePointerCapture(e.pointerId);
    if(Math.abs(distance)>45&&Math.abs(distance)>Math.abs(dy)*1.15)move(distance<0?1:-1);
  });
  rail.addEventListener('pointercancel',()=>{startX=null;startY=null;dragPointer=null;rail.classList.remove('is-dragging');});
  paint();
  updateFeature();
  document.querySelectorAll('.lang-btn').forEach(button => button.addEventListener('click', () => window.setTimeout(() => { paint(); updateFeature(); }, 0)));
})();