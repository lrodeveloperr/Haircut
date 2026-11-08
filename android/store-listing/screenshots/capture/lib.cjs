const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const build=require('path').resolve(__dirname,'../../../../source/build');
exports.page=async(W,H,dsf)=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox']});
const c=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:dsf});
await c.route('http://flow.test/**',r=>{const u=new URL(r.request().url()),f=path.join(build,u.pathname==='/'?'index.html':u.pathname);return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''});});
await c.addInitScript(()=>{const sp=Element.prototype.setPointerCapture;Element.prototype.setPointerCapture=function(id){try{sp.call(this,id);}catch(e){}};const rp=Element.prototype.releasePointerCapture;Element.prototype.releasePointerCapture=function(id){try{rp.call(this,id);}catch(e){}};window.AndroidHost={request(id,op){setTimeout(()=>__androidHost.complete(id,true,op==='load'?'{}':''),0);},gameReady(){},showRewarded(){},showInterstitial(){},openPrivacy(){},showPrivacyOptions(){}};});
const p=await c.newPage();p.setDefaultTimeout(120000);p.on('pageerror',e=>console.log('ERR',String(e).slice(0,200)));await p.goto('http://flow.test/?detail=high');
await p.waitForFunction(()=>window.skinFadeStudio&&HSC.startupTiming?.firstPlayable&&HSC.menu&&HSC.wardrobe&&HSC.wardrobe.data,undefined,{polling:250});
await p.addStyleTag({content:'.tutorial{display:none!important}'});
await p.evaluate(async()=>{HSC.meta.data.cuts=40;HSC.menu.open();console.log('play',await HSC.menu.play('free'));});await p.waitForTimeout(1500);await p.evaluate(()=>{document.querySelector('#hsc-menu')?.classList.remove('open','athome');});await p.addStyleTag({content:'#hsc-menu,#hsc-reveal,#hsc-hub,#hsc-dock{display:none!important}'});console.log('  booted');
return {b,c,p};};
const HER=['north-european','mediterranean','mena','west-african','east-african','east-asian','southeast-asian','south-asian','latino','indigenous-american','pacific-islander','mixed'];
exports.serve=async(p,opts,predSrc)=>{const T0=Date.now(),lg=(m)=>console.log('  serve',((Date.now()-T0)/1000).toFixed(1)+'s',m);
  await p.evaluate(async()=>{const g=skinFadeStudio;if(g.getState().status==='cutting'){g.getState().cutStrokeCount=Math.max(3,g.getState().cutStrokeCount);await g.finish();}});
  lg('finished '+await p.evaluate(()=>skinFadeStudio.getState().status));await p.waitForFunction(()=>document.querySelector('#hsc-hub.show'),null,{timeout:60000});lg('hub');await p.waitForTimeout(300);
  const r=await p.evaluate(([opts,predSrc,HER])=>{const pred=eval(predSrc),M=HSC.meta,d=M.data,job=skinFadeStudio.getState().jobId+1;const o=Object.assign({},opts);if(typeof o.heritage==='string')o.heritage=HER.indexOf(o.heritage);
    for(let i=0;i<5000;i++){const seed=(Math.random()*2**32)>>>0||1;const person=HSC.makePerson(seed,o);const profile=M.profileFor(person,[]);if(pred(person,profile)){d.queue={job,person,profile};return {i,seed,profile,her:person.heritage,tex:person.hair.type,beard:person.beard.style,age:person.years};}}return null;},[opts,predSrc,HER]);
  lg('matched '+JSON.stringify(r));if(!r)throw new Error('no customer matched');
  await p.evaluate(()=>skinFadeStudio.next());for(let k=0;k<6;k++){await p.waitForTimeout(1000);lg('after next '+JSON.stringify(await p.evaluate(()=>[skinFadeStudio.getState().status,!!document.querySelector('#hsc-hub.show'),document.visibilityState])));}
  await p.waitForFunction(()=>skinFadeStudio.getState().status==='cutting',null,{timeout:60000,polling:250});await p.evaluate(async()=>{HSC.menu.open();await HSC.menu.play('free');});lg('cutting seed '+await p.evaluate(()=>skinFadeStudio.getState().look.person.seed));await p.waitForTimeout(1200);
  return r;};
exports.cam=async(p,yaw,el)=>{await p.evaluate(([y,e])=>{const g=skinFadeStudio,s=g.getState();g.turn(((y-s.cameraYawDeg+540)%360)-180,e-s.cameraElevation);},[yaw,el]);await p.waitForTimeout(400);};
exports.wear=(p,clip,gown)=>p.evaluate(([c,g])=>{const W=HSC.wardrobe;if(c!=null)W.data.look.clipper=String(c);if(g!=null)W.data.look.gown=String(g);HSC.wardrobeApply();return W.data.look;},[clip,gown]);
exports.grid=(p,n=12)=>p.evaluate((n)=>{const v=HSC.view,b=v.headScreen();const rows=[];for(let j=0;j<n;j++){let row='';for(let i=0;i<n;i++){const x=b.left+(b.right-b.left)*(i+.5)/n,y=b.top+(b.bottom-b.top)*(j+.5)/n;const h=v.raycast(x,y);row+=h?({hair:'H',beard:'B'}[h.kind]||(h.kind||'?')[0]):'.';}rows.push(row);}return {b:{l:Math.round(b.left),r:Math.round(b.right),t:Math.round(b.top),bt:Math.round(b.bottom)},rows};},n);
exports.redraw=async(p,W,H)=>{await p.setViewportSize({width:W+1,height:H});await p.waitForTimeout(150);await p.setViewportSize({width:W,height:H});await p.waitForTimeout(400);};
// head-box fraction -> screen point
exports.box=(p)=>p.evaluate(()=>{const b=HSC.view.headScreen();return {l:b.left,r:b.right,t:b.top,b:b.bottom};});
const at=(B,fx,fy)=>[B.l+(B.r-B.l)*fx,B.t+(B.b-B.t)*fy];exports.at=at;
exports.clip=(p,guard)=>p.evaluate((g)=>{const s=skinFadeStudio;if(s.getState().interactionMode!=='cut')s.toggleClipper();s.selectGuard(g);},guard);
// in-page strokes (screen px)
exports.strokes=async(p,guard,lines)=>{await exports.clip(p,guard);return p.evaluate(async(lines)=>{const c=document.querySelector('#scene');
 const ev=(t,x,y)=>c.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:7,pointerType:'mouse',isPrimary:true,bubbles:true,cancelable:true,button:t==='pointermove'?-1:0,buttons:t==='pointerup'?0:1}));
 let n=0;for(const pts of lines){ev('pointerdown',pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[x,d]=pts[i];const k=Math.max(1,Math.ceil(Math.hypot(x-a,d-b)/4));for(let j=1;j<=k;j++){ev('pointermove',a+(x-a)*j/k,b+(d-b)*j/k);if(++n%40===0)await new Promise(r=>setTimeout(r,0));}}ev('pointerup',pts[pts.length-1][0],pts[pts.length-1][1]);}return n;},lines);};
// hold the clipper mid-stroke (real mouse), never released
exports.hold=async(p,guard,pts)=>{console.log('  brows',JSON.stringify(await exports.brows(p)));await p.evaluate(()=>{const g=skinFadeStudio;if(g.getState().interactionMode!=='cut')g.toggleClipper();});await exports.clip(p,guard);await p.mouse.move(pts[0][0],pts[0][1]);await p.mouse.down();
 for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];for(let j=1;j<=8;j++){await p.mouse.move(a+(c-a)*j/8,b+(d-b)*j/8);await p.waitForTimeout(25);}}};
// horizontal wavy passes between fy0..fy1 over fx0..fx1 in head-box fractions
exports.band=(B,fx0,fx1,fy0,fy1,dy=0.018,slope=0)=>{const L=[];let k=0;for(let fy=fy0;fy<=fy1;fy+=dy,k++){const pts=[];for(let fx=fx0;fx<=fx1+1e-9;fx+=0.03)pts.push(at(B,fx,fy+(fx-fx0)*slope+0.006*Math.sin(fx*40+k)));L.push(k%2?pts.reverse():pts);}return L;};
// vertical passes
exports.vband=(B,fx0,fx1,fy0,fy1,dx=0.015)=>{const L=[];for(let fx=fx0;fx<=fx1;fx+=dx)L.push([at(B,fx,fy1),at(B,fx+0.005,fy0)]);return L;};
// put a chosen customer straight in the chair: queue them, then the game's own skip() seats the queued customer
exports.serve=async(p,opts,predSrc)=>{const HER=['north-european','mediterranean','mena','west-african','east-african','east-asian','southeast-asian','south-asian','latino','indigenous-american','pacific-islander','mixed'];
  const r=await p.evaluate(async([opts,predSrc,HER])=>{const pred=eval(predSrc),M=HSC.meta,d=M.data,g=skinFadeStudio,job=g.getState().jobId+1;const o=Object.assign({},opts);if(typeof o.heritage==='string')o.heritage=HER.indexOf(o.heritage);
    let hit=null;if(opts.seed){const person=HSC.makePerson(opts.seed,o);hit={person,profile:M.profileFor(person,[]),seed:opts.seed};}for(let i=0;i<5000&&!hit;i++){const seed=(Math.random()*2**32)>>>0||1;const person=HSC.makePerson(seed,o);const profile=M.profileFor(person,[]);if(pred(person,profile))hit={person,profile,seed};}
    if(!hit)return null;if(opts.profile)hit.profile=opts.profile;d.queue={job,person:hit.person,profile:hit.profile};await g.skip();HSC.clearClippings&&HSC.clearClippings();
    const s=g.getState();return {want:hit.seed,got:s.look.person.seed,status:s.status,her:s.look.person.heritage,tex:s.look.person.hair.type,beard:s.look.person.beard.style,age:s.look.person.years,profile:s.look.profile};},[opts,predSrc,HER]);
  if(!r)throw new Error('no customer matched');await p.waitForTimeout(500);return r;};
// put every eyebrow back to full (the scripted passes must never leave a cut brow)
exports.brows=(p)=>p.evaluate(()=>{const b=skinFadeStudio.getState().brow;return b==null?'full':'CUT '+[...new Set(b)].join(',');});
