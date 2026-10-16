'use strict';
// Installed debug APK only: exercise real native choices, persistence and denied ad callbacks.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const app='com.worksbien.barbersimulatorasmr.debug';
const activity=app+'/com.worksbien.barbersimulatorasmr.MainActivity';
const adbPath=path.join(process.env.ANDROID_HOME,'platform-tools/adb');
const adb=(...a)=>execFileSync(adbPath,a,{encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024}).trim();
const out='qa/results';fs.mkdirSync(out,{recursive:true});
const report={checks:[],screenshots:[],started:new Date().toISOString()};
const specs=[
 {band:0,label:'Under 13',size:'1080x1920',density:'420'},
 {band:1,label:'13–15',size:'1920x1080',density:'420'},
 {band:2,label:'16–17',size:'1600x2560',density:'320'},
 {band:3,label:'18 or older',size:'2560x1600',density:'320'}
];
function hierarchy(){adb('shell','uiautomator','dump','--compressed','/sdcard/barber-age.xml');return adb('shell','cat','/sdcard/barber-age.xml');}
function node(xml,text){return (xml.match(/<node[^>]*>/g)||[]).find(n=>n.match(/text="([^"]*)"/)?.[1].toLowerCase()===text.toLowerCase());}
function tap(n){assert(n,'native control missing');const b=n.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);assert(b);adb('shell','input','tap',String((+b[1]+ +b[3])>>1),String((+b[2]+ +b[4])>>1));}
function check(s){report.checks.push(s);console.log('PASS:',s);}
(async()=>{try{
 adb('install','-r','android/native/app/build/outputs/apk/debug/app-debug.apk');
 adb('shell','settings','put','secure','immersive_mode_confirmations','confirmed');
 adb('shell','svc','wifi','disable');adb('shell','svc','data','disable');
 for(const spec of specs){
  adb('shell','am','force-stop',app);adb('shell','pm','clear',app);
  adb('shell','wm','size',spec.size);adb('shell','wm','density',spec.density);
  adb('shell','am','start','-W','-n',activity);
  let xml;for(let attempt=0;attempt<4;attempt++){xml=hierarchy();if(node(xml,'What is your age group?'))break;}assert(node(xml,'What is your age group?'));
  assert(node(xml,'Continue')?.includes('enabled="false"'),'Continue must require a choice');
  assert(!(xml.match(/<node[^>]*checked="true"/g)||[]).length,'no age may be preselected');
  const name='android-installed-age-band-'+spec.band+'.png';
  const png=execFileSync(adbPath,['exec-out','screencap','-p'],{timeout:30000});
  assert.equal(png.readUInt32BE(16),+spec.size.split('x')[0]);assert.equal(png.readUInt32BE(20),+spec.size.split('x')[1]);
  fs.writeFileSync(path.join(out,name),png);report.screenshots.push({name,size:spec.size});
  tap(node(xml,spec.label));xml=hierarchy();assert(node(xml,'Continue')?.includes('enabled="true"'));
  tap(node(xml,'Continue'));xml=hierarchy();assert(!node(xml,'What is your age group?'));
  const prefs=adb('shell','run-as',app,'cat','shared_prefs/advertising-age.xml');assert(prefs.includes('value="'+spec.band+'"'));
  check('native neutral choice and local persistence for '+spec.label+' at '+spec.size);
  if(spec.band<3){
   const pid=adb('shell','pidof',app).split(' ')[0];adb('forward','tcp:9222','localabstract:webview_devtools_remote_'+pid);
   const targets=await(await fetch('http://127.0.0.1:9222/json/list')).json();const target=targets.find(t=>t.url.includes('appassets.androidplatform.net'));assert(target);
   const socket=new WebSocket(target.webSocketDebuggerUrl);
   try {
    await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('CDP connection timed out')),10000);socket.addEventListener('open',()=>{clearTimeout(timer);r();},{once:true});socket.addEventListener('error',j,{once:true});});
    let sequence=0;
    const evaluateRemote=expression=>new Promise((resolve,reject)=>{
     const id=++sequence;
     const listener=e=>{const m=JSON.parse(e.data);if(m.id!==id)return;clearTimeout(timer);socket.removeEventListener('message',listener);if(m.error||m.result.exceptionDetails)reject(Error(JSON.stringify(m.error||m.result.exceptionDetails)));else resolve(m.result.result.value);};
     const timer=setTimeout(()=>{socket.removeEventListener('message',listener);reject(Error('CDP evaluation timed out'));},10000);
     socket.addEventListener('message',listener);socket.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression,returnByValue:true}}));
    });
    const readinessDeadline=Date.now()+120000;
    while(Date.now()<readinessDeadline){if(await evaluateRemote('!!window.skinFadeStudio && !!window.__androidHost'))break;await new Promise(r=>setTimeout(r,250));}
    assert(await evaluateRemote('!!window.skinFadeStudio && !!window.__androidHost'),'real bundled game must be ready');
    // Return from CDP before awaiting a Java->WebView callback; poll the actual native event.
    await evaluateRemote("window.__ageAdCheck={done:false}; window.__ageAdReceive=__androidHost.ad; __androidHost.ad=function(kind,state){__ageAdReceive(kind,state);window.__ageAdCheck={done:true,kind,state,game:!!window.skinFadeStudio}}; AndroidHost.showRewarded('age-check'); 'requested'");
    let result;
    for(let attempt=0;attempt<40;attempt++){result=await evaluateRemote('window.__ageAdCheck');if(result.done)break;await new Promise(r=>setTimeout(r,250));}
    assert.deepEqual(result,{done:true,kind:'rewarded',state:'failed',game:true});
   } finally { socket.close(); }
   check('under-18 core game available and native rewarded request denied without consent initialization: '+spec.label);
  }
  adb('shell','am','force-stop',app);adb('shell','am','start','-W','-n',activity);assert(!node(hierarchy(),'What is your age group?'));
  check('saved choice survives relaunch: '+spec.label);
 }
 report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack;process.exitCode=1;console.error(e);}finally{
 report.finished=new Date().toISOString();fs.writeFileSync(out+'/android-installed-age-report.json',JSON.stringify(report,null,2));
 adb('shell','wm','size','reset');adb('shell','wm','density','reset');
 // All evidence writes are synchronous. A failed CDP socket must not strand the hosted emulator.
 process.exit(process.exitCode||0);
}})();
