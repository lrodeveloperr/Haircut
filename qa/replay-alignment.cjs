// Inspect the real completion UI in the extracted production build; no game/UI overrides.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const game=require('./youtube-browser.cjs');
const out=path.resolve(process.env.QA_OUTPUT||'qa/results/replay-alignment');fs.mkdirSync(out,{recursive:true});
const screens=[[390,844],[225,400],[320,568],[360,640],[375,667],[412,915],[430,932],[568,320],[640,360],[844,390],[932,430],[717,512],[768,1024],[820,1180],[1024,1366],[1024,768],[1180,820],[1366,1024],[1280,720],[1366,768],[1440,900],[1920,1080],[2560,1440],[3440,1440],[400,400],[480,270],[270,480],[225,800],[320,1120],[3840,1080],[390,844]];
let browser,f;const results=[];
async function metrics(p){return p.evaluate(()=>{
 const b=document.querySelector('.hsc-replay'),svg=b.querySelector(':scope>svg'),badge=b.querySelector('.hsc-ad'),next=document.querySelector('.training-continue'),top=document.querySelector('.ui .top');
 const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,cx:r.x+r.width/2,cy:r.y+r.height/2};};
 const br=rect(b),sr=rect(svg),nr=rect(next);return{viewport:[innerWidth,innerHeight],scale:HSC.S,top:b.classList.contains('top'),button:br,svg:sr,badge:rect(badge),next:nr,topRow:rect(top),offset:{x:sr.cx-br.cx,y:sr.cy-br.cy},hidden:b.hidden,svgCSS:{display:getComputedStyle(svg).display,flexShrink:getComputedStyle(svg).flexShrink},buttonCSS:{justify:getComputedStyle(b).justifyContent,align:getComputedStyle(b).alignItems},status:skinFadeStudio.getState().status,seed:skinFadeStudio.getState().look.person.seed,scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight]};
});}
(async()=>{
 browser=await game.start();f=await game.fixture({viewport:{width:390,height:844},dpr:2,touch:true,mobile:true});const p=f.page;
 await game.stroke(p);
 await p.getByRole('button',{name:'Finish haircut',exact:true}).click();
 await p.locator('#hsc-hub.show').waitFor({state:'visible',timeout:120000});
 await p.waitForTimeout(450);
 const seed=(await game.state(p)).look.person.seed;
 for(const [width,height]of screens){
  await p.setViewportSize({width,height});
  await p.waitForTimeout(250);
  const m=await metrics(p);const tag=width+'x'+height;
  try{
   assert.equal(m.hidden,false);assert.equal(m.status,'reveal');assert.equal(m.seed,seed);
   assert(Math.abs(m.offset.x)<=.5&&Math.abs(m.offset.y)<=.5,'SVG box is off-center');
   for(const [name,r]of [['button',m.button],['badge',m.badge]])assert(r.x>=-.5&&r.y>=-.5&&r.right<=width+.5&&r.bottom<=height+.5,name+' is clipped');
   assert(m.button.right<=m.next.x||m.next.right<=m.button.x||m.button.bottom<=m.next.y||m.next.bottom<=m.button.y,'Replay overlaps Next');
   assert(Math.abs(m.button.width-m.button.height)<=.5,'Replay is not circular');
   if(m.top){assert(Math.abs(m.button.x-m.topRow.x)<=.5&&Math.abs(m.button.y-m.topRow.y)<=.5,'Top-row placement differs');}
   else assert(Math.abs(m.button.cy-m.next.cy)<=.5,'Replay is not level with Next');
   assert(m.scroll[0]<=width+1&&m.scroll[1]<=height+1,'Viewport overflows');
   m.status='PASS';
  }catch(e){m.status='FAIL';m.error=e.message;}
  const left=Math.max(0,Math.min(m.button.x,m.badge.x)-6),top=Math.max(0,Math.min(m.button.y,m.badge.y)-6);
  const right=Math.min(width,Math.max(m.button.right,m.badge.right)+6),bottom=Math.min(height,Math.max(m.button.bottom,m.badge.bottom)+6);
  await p.screenshot({path:path.join(out,tag+'-button.png'),clip:{x:left,y:top,width:right-left,height:bottom-top},timeout:60000});
  if(['390x844','320x568','225x400','844x390','768x1024','1920x1080'].includes(tag))await p.screenshot({path:path.join(out,tag+'-screen.png'),timeout:60000});
  results.push(m);fs.writeFileSync(path.join(out,'alignment.json'),JSON.stringify({release:process.env.RELEASE_DIR||'source/build-youtube',results,errors:f.errors},null,2));
  console.log(JSON.stringify({screen:tag,status:m.status,top:m.top,offset:m.offset,error:m.error}));
 }
 await p.locator('.hsc-replay').click();
 await p.getByRole('button',{name:'Finish haircut',exact:true}).waitFor({state:'visible',timeout:45000});
 const after=await game.state(p);assert.equal(after.look.person.seed,seed);assert.deepEqual(after.hair,after.startHair);assert.deepEqual(f.errors,[]);
 fs.writeFileSync(path.join(out,'alignment.json'),JSON.stringify({release:process.env.RELEASE_DIR||'source/build-youtube',results,errors:f.errors,replayClick:{sameCustomer:true,resetHair:true}},null,2));
 console.log('REPLAY CLICK PASS: same customer, reset hair, no errors');
 await f.close();await browser.close();process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(async e=>{console.error(e);await f?.close();await browser?.close();process.exitCode=2;});
