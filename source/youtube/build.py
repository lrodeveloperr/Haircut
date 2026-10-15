"""Create the direct-YouTube target; preserve the full-detail game on every device."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
src, out = root / 'build', root / 'build-youtube'
if out.exists():
    shutil.rmtree(out)
out.mkdir()
for name in ['index.html', 'styles.css', 'THIRD-PARTY-NOTICES.md', 'assets', 'runtime', 'licenses']:
    source, target = src / name, out / name
    shutil.copytree(source, target) if source.is_dir() else shutil.copy2(source, target)

def replace(text, old, new):
    assert text.count(old) == 1, f'YouTube patch expected exactly one occurrence: {old[:100]}'
    return text.replace(old, new)

game_path = out / 'runtime/game.js'
s = game_path.read_text()
start, end = s.index('function Iw(){'), s.index('var Rw=Object.defineProperty')
assert start < end
s = s[:start] + 'async function Gu(){return HSC.youtubeClientPromise}'+s[end:]
s = replace(s, 'let ce=()=>{Ae(),C||n.render(!1)}', 'let ce=()=>{if(c)return;Ae(),C||n.render(!1)}')
s = replace(s, 'w=requestAnimationFrame(ve)}t.setUserAudioEnabled(m),J(),te(),w=requestAnimationFrame(ve);function ge(){c=u||h,S=performance.now(),n.resetTiming(),c&&(Ae(),$(!0).catch(()=>{})),te(),Z()}',
    'w=c?0:requestAnimationFrame(ve)}t.setUserAudioEnabled(m),J(),te(),w=requestAnimationFrame(ve);function ge(){c=u||h;cancelAnimationFrame(w);w=0;S=performance.now();n.resetTiming();if(c){Ae();$(!0).catch(()=>{})}else{ce();w=requestAnimationFrame(ve)}te();Z()}')
s = replace(s, 'return{renderFirstPlayableFrame(){n.render()}', 'return{flushProgress:()=>$(!0),renderFirstPlayableFrame(){n.render()}')
s = replace(s, 'ae&&(l=j.adSession)', 't.lastInterstitialRequestAccepted&&(l=j.adSession)')
s = replace(s, 'game = Pu({root, client, savedSession: session, savedAudio: audio});', 'await HSC.geo.environmentReady;\n    await client.whenResumed();\n    game = Pu({root, client, savedSession: session, savedAudio: true});')
s = replace(s, 'client.bindGame({root, setPaused: game.setPaused, setAudioEnabled: game.setPlatformAudio});', 'client.bindGame({root, setPaused: game.setPaused, setAudioEnabled: game.setPlatformAudio, flush: game.flushProgress});')
s = replace(s, '    unmount = Ad({root, game});', '    unmount = Ad({root, game});\n    HSC.failGame = error => { unmount(); game.destroy(); client.destroy(); showBootError(error); };')
s = replace(s, '    await client.gameReady();', '    HSC.dismissLoading();\n    await client.gameReady();\n    HSC.geo.saveLater();\n    HSC.view.warmClipper?.();\n    HSC.poster?.start(game, client);')
s = replace(s, '    game.renderFirstPlayableFrame();', '    await game.renderFirstPlayableFrame();')
s = replace(s, 'async function hC() {', 'async function hC() {\n  HSC.startupTiming.geometryReady=performance.now();')
s = replace(s, '    if (HSC.wardrobeInit)', '    HSC.startupTiming.rendererReady=performance.now();\n    if (HSC.wardrobeInit)')
s = replace(s, "    globalThis.addEventListener('pagehide', () => { unmount(); game.destroy(); client.destroy(); }, {once: true});", '')
s = replace(s, 'function showBootError(error) {', 'function showBootError(error) {\n  HSC.dismissLoading();')
s = replace(s, '  panel.append(title, message, retry);', '  panel.append(title, message, retry, HSC.bootErrorCode(error));')
# Full-fidelity geometry and shading remain enabled. Keep the drawing buffer bounded on resize.
start = s.index('function he(ue){Pe&&(Ue=Ue*.93+')
end = s.index('function _(ue=!0)', start)
s = replace(s, s[start:end], 'function he(ue){if(Pe){let quality=HSC.detail.sample(ue-Pe,te,$,J);if(quality){He(quality.strands);$=quality.pixel}}Pe=ue}')
s = replace(s, 'resetTiming(){Pe=0}', 'resetTiming(){Pe=0;HSC.detail.resetHistory()}')
s = replace(s, 'let ye=Math.max(1,e.clientWidth),Ie=Math.max(1,e.clientHeight),B=Math.floor(ye*$),E=Math.floor(Ie*$);',
    'let ye=Math.max(1,e.clientWidth),Ie=Math.max(1,e.clientHeight);J=HSC.detail.pixelRatio(ye,Ie);$=Math.min(J,Math.max(HSC.detail.pixelFloor(ye,Ie),$));let B=Math.floor(ye*$),E=Math.floor(Ie*$);')
# A static customer needs no recurring GPU redraw. Keep clocks/input responsive in RAF, and
# redraw on scene changes or active cutting/rotation/reveal/clippings. Full-detail idle frames
# otherwise waste GPU time while bypassing the active-animation quality sampler.
s = replace(s, 'function J(){var j,ae;s=HSC.ensure(s)', 'let initialBoot=true,needsRender=true;function J(){needsRender=true;var j,ae;s=HSC.ensure(s)')
s = replace(s, 'function Ae(){if(f)try{a.releasePointerCapture(f.id)}', 'function Ae(){needsRender=true;if(f)try{a.releasePointerCapture(f.id)}')
s = replace(s, 'let ce=()=>{if(c)return;Ae(),C||n.render(!1)}',
    'let startupLost=false,lastSize="";let ce=(force=false)=>{if(c)return;let size=[a.clientWidth,a.clientHeight,globalThis.devicePixelRatio||1].join();if(force!==true&&size===lastSize)return;lastSize=size;Ae();if(!C){n.render(!1);needsRender=false}}')
s = replace(s, 'else{ce();w=requestAnimationFrame(ve)}te();Z()}', 'else{if(!initialBoot)ce(true);w=requestAnimationFrame(ve)}te();Z()}')
s = replace(s, 'setPaused(j){u=!!j,ge()}', 'setPaused(j){if(u===!!j)return;u=!!j;ge()}')
s = replace(s, 'if(s.status==="reveal"&&!x){D+=ae;', 'if(s.status==="reveal"&&!x){needsRender=true;D+=ae;')
s = replace(s, '(f||s.status==="reveal"&&!x||j%66<20||HSC.clippingsActive&&HSC.clippingsActive())&&n.render(!!(f||s.status==="reveal"&&!x||HSC.clippingsActive&&HSC.clippingsActive()))',
    '(()=>{let active=!!(f||s.status==="reveal"&&!x||HSC.clippingsActive&&HSC.clippingsActive());if(active||needsRender){n.render(active);needsRender=false}})()')
s = replace(s, 'renderFirstPlayableFrame(){n.render()}',
    '''async renderFirstPlayableFrame(){
  HSC.startupTiming.materialsReady=performance.now();
  // Mobile browsers may drop the context while a full-detail scene starts. Wait for the
  // browser to restore it and start again, rather than treating the interruption as fatal.
  for(let attempt=0;;attempt++){
    try{
      await t.whenResumed();
      await n.prepareFirstFrame();await t.whenResumed();
      HSC.startupTiming.shadersReady=performance.now();n.beginFirstFrame();
      do {
        await t.whenResumed();
        lastSize=[a.clientWidth,a.clientHeight,globalThis.devicePixelRatio||1].join();
        n.render(!1);needsRender=false;HSC.startupTiming.firstDraw=performance.now();
        await n.waitForFirstFrame();HSC.startupTiming.gpuReady=performance.now();HSC.dismissLoading();
        await t.afterPaint();await t.afterPaint();
        if(startupLost||n.isContextLost())throw HSC.graphicsError('GFX_LOST');
      }while(lastSize!==[a.clientWidth,a.clientHeight,globalThis.devicePixelRatio||1].join());
      break;
    }catch(error){
      if(!(startupLost||n.isContextLost())||attempt>=2)throw error;
      HSC.startupTiming.contextRestores=attempt+1;
      await new Promise((resolve,reject)=>{
        if(!n.isContextLost()){resolve();return}
        let timer=0;
        const done=()=>{HSC.lifecycle.clear(timer);resolve()};
        a.addEventListener("webglcontextrestored",done,{once:true});
        timer=HSC.lifecycle.timeout(()=>{a.removeEventListener("webglcontextrestored",done);reject(HSC.graphicsError('GFX_LOST'))},8000);
      });
      startupLost=false;
    }
  }
  t.finishStartup();initialBoot=false;needsRender=false;
  HSC.startupTiming.firstPlayable=performance.now();
}''')
s = replace(s, 'globalThis.addEventListener("resize",ce);let L=', '''globalThis.addEventListener("resize",ce);
let recoveryTimer=0,recovering=false;
const lost=()=>{
  if(initialBoot){startupLost=true;return}
  t.setPauseReason("graphics",true);
  HSC.lifecycle.clear(recoveryTimer);
  recoveryTimer=HSC.lifecycle.timeout(()=>HSC.failGame(HSC.graphicsError("GFX_LOST")),8000);
};
const restore=()=>{
  if(initialBoot){ce(true);return}
  if(recovering)return;
  recovering=true;HSC.lifecycle.clear(recoveryTimer);
  (async()=>{
    await t.whenResumed();await n.prepareFirstFrame();await t.whenResumed();
    n.render(false);await n.waitForFirstFrame();await t.whenResumed();
    if(n.isContextLost())throw HSC.graphicsError("GFX_LOST");
    needsRender=false;t.setPauseReason("graphics",false);
  })().catch(error=>HSC.failGame(error)).finally(()=>recovering=false);
};
a.addEventListener("webglcontextrestored",restore);a.addEventListener("webglcontextlost",lost);let L=''')
s = replace(s, 'globalThis.removeEventListener("resize",ce),', 'HSC.lifecycle.clear(recoveryTimer),globalThis.removeEventListener("resize",ce),a.removeEventListener("webglcontextrestored",restore),a.removeEventListener("webglcontextlost",lost),')
# Hold all customer draws until final saved materials are installed and their shaders are ready.
# The startup pause reason separately blocks keyboard/pointer actions and the controller RAF.
s = replace(s, 'function _(ue=!0){if(k)return;', 'let firstFramePending=true,firstFrameCancel=null;function _(ue=!0){if(k||firstFramePending)return;restoreEnvironment();')
s = replace(s, 'render:_,setYaw(ue)', '''async prepareFirstFrame(){
  restoreEnvironment();P();L();X();z();
  const visible=Zt.clone(false);
  // Only what the first frame draws. The hidden clipper compiles right after (warmClipper).
  visible.traverse=visit=>Zt.traverseVisible(visit);
  await t.compileAsync(visible,ze,Zt);
  await HSC.whenYouTubeResumed();
  // Keep diagnostics enabled, but resolve reflection/log queries before any full customer draw.
  // Interleaving these synchronous queries with draws serializes earlier GPU work.
  for(const program of t.info.programs){
    program.getUniforms();program.getAttributes();
    const failed=program.diagnostics;
    if(failed?.runnable===false){
      // Carry the GPU's own reason to the recovery screen; a phone has no console.
      const gl=t.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
      const lines=text=>String(text||'').trim().split(/\\n/).filter(Boolean).slice(0,4).map(line=>line.slice(0,240)).join(' / ');
      throw Object.assign(HSC.graphicsError('GFX_SHADER'),{detail:[
        // A short fingerprint of the program's cache key identifies the exact variant offline.
        'Shader: '+(program.name||program.type||'custom')+' #'+[...String(program.cacheKey)].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261).toString(16),
        failed.vertexShader.log&&'Vertex: '+lines(failed.vertexShader.log),
        failed.fragmentShader.log&&'Fragment: '+lines(failed.fragmentShader.log),
        failed.programLog&&'Link: '+lines(failed.programLog),
        'GPU: '+(info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)),
        'Limits: varyings '+gl.getParameter(gl.MAX_VARYING_VECTORS)+', vertex uniforms '+gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)+', fragment uniforms '+gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      ].filter(Boolean)});
    }
  }
},async waitForFirstFrame(){
  const gl=t.getContext(),sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);
  if(!sync)throw HSC.graphicsError('GFX_LOST');
  gl.flush();
  try{
    await new Promise((resolve,reject)=>{
      // About ten seconds. The fence only times readiness, so a slow GPU continues instead of failing.
      let poll=0,remaining=1250,settled=false;
      const settle=error=>{
        if(settled)return;settled=true;HSC.lifecycle.clear(poll);firstFrameCancel=null;
        error?reject(error):resolve();
      };
      firstFrameCancel=()=>settle(Error('Game graphics initialization was cancelled'));
      const check=()=>{
        if(gl.isContextLost()){settle(HSC.graphicsError('GFX_LOST'));return}
        const result=gl.clientWaitSync(sync,0,0);
        if(result===gl.ALREADY_SIGNALED||result===gl.CONDITION_SATISFIED)settle();
        else if(result===gl.WAIT_FAILED||--remaining===0)settle();
        else poll=HSC.lifecycle.timeout(check,8);
      };
      check();
    });
  }finally{gl.deleteSync(sync)}
},warmClipper(){const hidden=Zt.clone(false);hidden.traverse=visit=>{for(const child of i.children)child.traverseVisible(visit)};return t.compileAsync(hidden,ze,Zt).catch(()=>{})},isContextLost(){return t.getContext().isContextLost()},beginFirstFrame(){firstFramePending=false},render:_,setYaw(ue)''')
s = replace(s, 'destroy(){var ue;e.removeEventListener("webglcontextlost",ae)',
    'destroy(){firstFrameCancel?.();var ue;e.removeEventListener("webglcontextlost",ae)')
# Three's asynchronous completion polling obeys the same host-owned execution scheduler.
start = s.index('this.compileAsync=function(')
end = s.index(';let ut=null;', start)
polling = s[start:end]
assert polling.count('setTimeout(oe,10)') == 2
guarded = polling.replace('new Promise(F=>{function oe(){', 'new Promise((F,reject)=>{function oe(){try{if(x===!0)throw Error("Game graphics could not initialize");')
guarded = guarded.replace('setTimeout(oe,10)}Ee.get', 'setTimeout(oe,10)}catch(error){reject(error)}}Ee.get')
assert guarded != polling and 'catch(error)' in guarded
s = replace(s, polling, guarded.replace('setTimeout(oe,10)', 'HSC.lifecycle.timeout(oe,10)'))
game_path.write_text(s)

# Hair-root sampling without per-sample array allocation: the same arithmetic in the same order, so
# the output is bit-identical (checked by qa/youtube-models.cjs); only temporary arrays are removed.
s = game_path.read_text()
old_rw_head = 'for(let i=0;i<t.length;i+=3){let a=[t[i],t[i+1],t[i+2]],n=a.map(h=>[e[h*3],e[h*3+1],e[h*3+2]]);if(!n.some(h=>Na(...h)>.01))continue;K||q.push(...n[0],...n[1],...n[2]);let o=n[1].map((h,d)=>h-n[0][d]),s=n[2].map((h,d)=>h-n[0][d]),l=Math.hypot(o[1]*s[2]-o[2]*s[1],o[2]*s[0]-o[0]*s[2],o[0]*s[1]-o[1]*s[0])*.5*24*24,c=Math.max(2,Math.min(12,Math.ceil(Math.max(Math.hypot(...o),Math.hypot(...s),Math.hypot(o[0]-s[0],o[1]-s[1],o[2]-s[2]))/.028))),u=(c+1)*(c+2)/2;for(let h=0;h<=c;h++)for(let d=0;d<=c-h;d++){let g=[0,1,2].map(w=>n[0][w]*(1-(h+d)/c)+n[1][w]*h/c+n[2][w]*d/c);if(Na(...g)<.05)continue;let m=Tl(...g),A=Math.min(63,Math.floor(m.v*64))*128+Math.min(127,Math.floor(m.u*128)),f=l/u,p=r.weights[A];for(let w=0;w<3;w++)r.positions[A*3+w]=(r.positions[A*3+w]*p+g[w]*f)/(p+f);r.weights[A]+=f}}'
new_rw_head = ('for(let i=0;i<t.length;i+=3){const i0=t[i]*3,i1=t[i+1]*3,i2=t[i+2]*3,'
    'x0=e[i0],y0=e[i0+1],z0=e[i0+2],x1=e[i1],y1=e[i1+1],z1=e[i1+2],x2=e[i2],y2=e[i2+1],z2=e[i2+2];'
    'if(!(Na(x0,y0,z0)>.01||Na(x1,y1,z1)>.01||Na(x2,y2,z2)>.01))continue;K||q.push(x0,y0,z0,x1,y1,z1,x2,y2,z2);'
    'const o0=x1-x0,o1=y1-y0,o2=z1-z0,s0=x2-x0,s1=y2-y0,s2=z2-z0,'
    'l=Math.hypot(o1*s2-o2*s1,o2*s0-o0*s2,o0*s1-o1*s0)*.5*24*24,'
    'c=Math.max(2,Math.min(12,Math.ceil(Math.max(Math.hypot(o0,o1,o2),Math.hypot(s0,s1,s2),Math.hypot(o0-s0,o1-s1,o2-s2))/.028))),u=(c+1)*(c+2)/2;'
    'for(let h=0;h<=c;h++)for(let d=0;d<=c-h;d++){'
    'const gx=x0*(1-(h+d)/c)+x1*h/c+x2*d/c,gy=y0*(1-(h+d)/c)+y1*h/c+y2*d/c,gz=z0*(1-(h+d)/c)+z1*h/c+z2*d/c;'
    'if(Na(gx,gy,gz)<.05)continue;let m=Tl(gx,gy,gz),A=Math.min(63,Math.floor(m.v*64))*128+Math.min(127,Math.floor(m.u*128)),f=l/u,p=r.weights[A];'
    'r.positions[A*3]=(r.positions[A*3]*p+gx*f)/(p+f);r.positions[A*3+1]=(r.positions[A*3+1]*p+gy*f)/(p+f);r.positions[A*3+2]=(r.positions[A*3+2]*p+gz*f)/(p+f);'
    'r.weights[A]+=f}}')
s = replace(s, old_rw_head, new_rw_head)
game_path.write_text(s)

# Fixed startup models come from the device cache (youtube/geo.js) when present. Each computes
# from fixed data with fixed seeds, so a stored copy is identical to a fresh computation.
s = game_path.read_text()
s = replace(s, 'e=hs_smooth(c,.15,3)', 'e=HSC.geo.use("head",()=>hs_smooth(c,.15,3))')
s = replace(s, 'Qu=rw(Pt.attributes.position.array,Pt.index.array,Pt.userData.coarse)', 'Qu=HSC.geo.use("roots",()=>rw(Pt.attributes.position.array,Pt.index.array,Pt.userData.coarse))')
s = replace(s, 'n=e.index.array,o=[],s=[],l=0,c=41873,', 'n=e.index.array;let{h,d,g}=HSC.geo.use("strands",()=>{let o=[],s=[],l=0,c=41873,')
s = replace(s, 'g.set([u(),u(),u()],S*3)}let m=new af', 'g.set([u(),u(),u()],S*3)}return{h,d,g}});let m=new af')
s = replace(s, 'function uw(e,{color:t="#2f4f6a",stripColor:r="#f3efe6"}={}){', '''function uw(e,opts={}){
  const{color:t="#2f4f6a",stripColor:r="#f3efe6"}=opts;let built=null;
  const m=HSC.geo.use("gown",()=>{built=uwBuild(e,opts);const[J,O]=built.children,a=J.geometry,b=O.geometry;
    return{vp:a.attributes.position.array,vu:a.attributes.uv.array,vn:a.attributes.normal.array,vi:a.index.array,hp:b.attributes.position.array,hn:b.attributes.normal.array,hi:b.index.array}});
  if(built)return built;
  const V=new Tt;V.setAttribute("position",new It(m.vp,3)),V.setAttribute("uv",new It(m.vu,2)),V.setIndex(new It(m.vi,1)),V.setAttribute("normal",new It(m.vn,3));
  const J=new Ze(V,new Xn({color:t,roughness:.82,metalness:0,sheen:.6,sheenRoughness:.6,sheenColor:new Ye("#a9c0d2"),side:$t}));
  const He=new Tt;He.setAttribute("position",new It(m.hp,3)),He.setIndex(new It(m.hi,1)),He.setAttribute("normal",new It(m.hn,3));
  const O=new Ze(He,new Br({color:r,roughness:.92,metalness:0,side:$t})),ce=new oi;return ce.add(J,O),ce.name="robe",ce}
function uwBuild(e,{color:t="#2f4f6a",stripColor:r="#f3efe6"}={}){''')
# Both gown materials are rebuilt verbatim above; fail the build if the original ever changes.
assert 'let $=new Xn({color:t,roughness:.82,metalness:0,sheen:.6,sheenRoughness:.6,sheenColor:new Ye("#a9c0d2"),side:$t})' in s
assert 'let O=new Ze(He,new Br({color:r,roughness:.92,metalness:0,side:$t})),ce=new oi;return ce.add(J,O),ce.name="robe",ce}' in s
game_path.write_text(s)

# Reflection lighting keeps a CPU copy for context restoration. A render target's contents are lost
# with the context: merely drawing it again silently leaves every reflection texel at zero.
s = game_path.read_text()
s = replace(s, 'let r=new nl(t);Zt.environment=r.fromScene(new nw,.04).texture,Zt.environmentIntensity=.4,r.dispose();',
    (root / 'youtube' / 'environment.js').read_text())
s = replace(s, 'let ae=ue=>{ue.preventDefault(),k=!0},fe=()=>{k=!1,V=!0,Pe=0};',
    'let ae=ue=>{ue.preventDefault();k=true;environmentDirty=true},fe=()=>{k=!1,V=!0,Pe=0};')
s = replace(s, 'destroy(){firstFrameCancel?.();var ue;', 'destroy(){firstFrameCancel?.();environmentTarget?.dispose();var ue;')
game_path.write_text(s)

customer_path = out / 'runtime/customers.js'
s = customer_path.read_text()
start = s.index('  function oneTab(client) {')
end = s.index('\n  M.level =', start)
s = s[:start] + '  function oneTab(client) { /* YouTube owns foreground, pause and resume. */ }\n' + s[end:]
s = s.replace('setInterval(', 'HSC.lifecycle.interval(').replace('clearTimeout(', 'HSC.lifecycle.clear(').replace('setTimeout(', 'HSC.lifecycle.timeout(')
# Prevent resize handlers and delayed wardrobe/reveal UI work from running during host pause.
s = replace(s, "const place = () => { HSC.applyScale(); this.place();", "const place = () => { if (HSC.executionPaused) return; HSC.applyScale(); this.place();")
# Beard density is independent of adaptive scalp count; facial hair is part of the core visual.
s = replace(s, 'const k = Math.max(0.3, Math.min(1, f)) * HSC.detail.beardMax;', 'const k = HSC.detail.beardMax;')
s = replace(s, "  const sfx = { ctx: null, out: null, noise: null };", """  const sfx = { ctx: null, out: null, noise: null };
  HSC.setRevealAudio = enabled => {
    if (!sfx.ctx || !sfx.out) return;
    sfx.out.gain.cancelScheduledValues(sfx.ctx.currentTime);
    sfx.out.gain.value = enabled ? 0.55 * (view()?.volume ?? 1) : 0;
    (enabled ? sfx.ctx.resume() : sfx.ctx.suspend()).catch(() => {});
  };""")
customer_path.write_text('HSC.youtubeModulesReady=(HSC.whenYouTubeResumed?HSC.whenYouTubeResumed():Promise.resolve()).then(()=>HSC.geo.ready).then(()=>{\n' + s + '\n});\nHSC.youtubeModulesReady.catch(()=>{});\n')
game_path.write_text('HSC.youtubeModulesReady.then(()=>HSC.whenYouTubeResumed?.()).then(()=>{\nHSC.startupTiming.engineStart=performance.now();\n' + game_path.read_text() + '\n}).catch(HSC.bootstrapError);\n')
for name in ['client.js', 'loader.js', 'startup.js', 'geo.js', 'poster.js']:
    shutil.copy2(root / 'youtube' / name, out / 'runtime' / ('youtube-' + name))

s = (out / 'index.html').read_text()
s = replace(s, '  <link rel="stylesheet" href="./styles.css">', '  <link rel="stylesheet" href="./styles.css">\n  <link rel="preload" href="./runtime/room-env.dat" as="fetch" crossorigin="anonymous">')
s = replace(s, '  <script src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>', '''  <div id="yt-loading" role="status" aria-label="Loading game"><span aria-hidden="true">✂</span><span>Loading…</span></div>
  <script src="https://www.youtube.com/game_api/v1"></script>
  <script src="./runtime/youtube-poster.js"></script>
  <script src="./runtime/youtube-loader.js"></script>
  <script src="./runtime/youtube-geo.js"></script>
  <script src="./runtime/youtube-client.js"></script>
  <script src="./runtime/youtube-startup.js"></script>''')
(out / 'index.html').write_text(s)
shutil.copy2(root / 'youtube' / 'env' / 'room-env.dat', out / 'runtime' / 'room-env.dat')
# The model cache is keyed by the exact runtime, so a new build never reads an older build's models.
import hashlib
digest = hashlib.sha256((out / 'runtime/game.js').read_bytes() + (out / 'runtime/customers.js').read_bytes()).hexdigest()[:16]
geo = out / 'runtime/youtube-geo.js'
env_digest = hashlib.sha256((out / 'runtime/room-env.dat').read_bytes()).hexdigest()[:16]
geo.write_text(f'globalThis.HSC=globalThis.HSC||{{}};HSC.geoBuild="{digest}";HSC.environmentBuild="{env_digest}";\n' + geo.read_text())
with (out / 'styles.css').open('a') as f:
    f.write('\n#yt-loading{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#f5e7d7;color:#493326;font-size:18px;z-index:9999}#yt-loading [aria-hidden]{font-size:64px}#yt-loading.has-poster{justify-content:flex-end;padding-bottom:calc(28px + env(safe-area-inset-bottom,0px));background:#2b1e17 url("assets/backdrop-portrait.webp") center/cover no-repeat;transition:opacity .25s ease}@media (orientation:landscape){#yt-loading.has-poster{background-image:url("assets/backdrop-landscape.webp")}}#yt-loading .yt-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:-1}#yt-loading.has-poster>span{position:relative}#yt-loading.has-poster>span[aria-hidden]{display:none}#yt-loading.has-poster>span:last-child{padding:6px 16px;border-radius:999px;background:rgb(43 30 23 / .72);color:#fff6e6;font-size:15px}#yt-loading.yt-leaving{opacity:0;pointer-events:none}html.yt-paused *{animation-play-state:paused!important}\n')
print('youtube-build-ok')
