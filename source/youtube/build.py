"""Create the direct-YouTube target with full-fidelity, measured adaptive graphics."""
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
s = replace(s, 'game = Pu({root, client, savedSession: session, savedAudio: audio});', 'await client.whenResumed();\n    game = Pu({root, client, savedSession: session, savedAudio: true});')
s = replace(s, 'client.bindGame({root, setPaused: game.setPaused, setAudioEnabled: game.setPlatformAudio});', 'client.bindGame({root, setPaused: game.setPaused, setAudioEnabled: game.setPlatformAudio, flush: game.flushProgress});')
s = replace(s, '    await client.gameReady();', '    HSC.dismissLoading();\n    await client.gameReady();')
s = replace(s, '    game.renderFirstPlayableFrame();', '    await game.renderFirstPlayableFrame();')
s = replace(s, 'async function hC() {', 'async function hC() {\n  HSC.startupTiming.geometryReady=performance.now();')
s = replace(s, '    if (HSC.wardrobeInit)', '    HSC.startupTiming.rendererReady=performance.now();\n    if (HSC.wardrobeInit)')
s = replace(s, "    globalThis.addEventListener('pagehide', () => { unmount(); game.destroy(); client.destroy(); }, {once: true});", '')
s = replace(s, 'function showBootError(error) {', 'function showBootError(error) {\n  HSC.dismissLoading();')
s = replace(s, '  panel.append(title, message, retry);', '  panel.append(title, message, retry, HSC.bootErrorCode(error));')
# Full-fidelity geometry and shading remain enabled. Adapt from sustained scene frame times,
# not device labels; keep the drawing buffer bounded on every resize, including large desktops.
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
s = replace(s, 'globalThis.addEventListener("resize",ce);let L=', 'globalThis.addEventListener("resize",ce);let restore=()=>ce(true),lost=()=>{if(initialBoot)startupLost=true};a.addEventListener("webglcontextrestored",restore);a.addEventListener("webglcontextlost",lost);let L=')
s = replace(s, 'globalThis.removeEventListener("resize",ce),', 'globalThis.removeEventListener("resize",ce),a.removeEventListener("webglcontextrestored",restore),a.removeEventListener("webglcontextlost",lost),')
# Hold all customer draws until final saved materials are installed and their shaders are ready.
# The startup pause reason separately blocks keyboard/pointer actions and the controller RAF.
s = replace(s, 'function _(ue=!0){if(k)return;', 'let firstFramePending=true,firstFrameCancel=null;function _(ue=!0){if(k||firstFramePending)return;')
s = replace(s, 'render:_,setYaw(ue)', '''async prepareFirstFrame(){
  P();L();X();z();
  const visible=Zt.clone(false);
  visible.traverse=visit=>{
    Zt.traverseVisible(visit);
    // The clipper is needed by the first gesture; compile its current guard without drawing it.
    for(const child of i.children)child.traverseVisible(visit);
  };
  await t.compileAsync(visible,ze,Zt);
  await HSC.whenYouTubeResumed();
  // Keep diagnostics enabled, but resolve reflection/log queries before any full customer draw.
  // Interleaving these synchronous queries with draws serializes earlier GPU work.
  for(const program of t.info.programs){
    program.getUniforms();program.getAttributes();
    if(program.diagnostics?.runnable===false)throw HSC.graphicsError('GFX_SHADER');
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
},isContextLost(){return t.getContext().isContextLost()},beginFirstFrame(){firstFramePending=false},render:_,setYaw(ue)''')
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
customer_path.write_text('HSC.youtubeModulesReady=(HSC.whenYouTubeResumed?HSC.whenYouTubeResumed():Promise.resolve()).then(()=>{\n' + s + '\n});\nHSC.youtubeModulesReady.catch(()=>{});\n')
game_path.write_text('HSC.youtubeModulesReady.then(()=>HSC.whenYouTubeResumed?.()).then(()=>{\nHSC.startupTiming.engineStart=performance.now();\n' + game_path.read_text() + '\n}).catch(HSC.bootstrapError);\n')
for name in ['client.js', 'loader.js', 'startup.js']:
    shutil.copy2(root / 'youtube' / name, out / 'runtime' / ('youtube-' + name))

s = (out / 'index.html').read_text()
s = replace(s, '  <script src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>', '''  <div id="yt-loading" role="status" aria-label="Loading game"><span aria-hidden="true">✂</span><span>Loading…</span></div>
  <script src="https://www.youtube.com/game_api/v1"></script>
  <script src="./runtime/youtube-loader.js"></script>
  <script src="./runtime/youtube-client.js"></script>
  <script src="./runtime/youtube-startup.js"></script>''')
(out / 'index.html').write_text(s)
with (out / 'styles.css').open('a') as f:
    f.write('\n#yt-loading{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#f5e7d7;color:#493326;font-size:18px;z-index:9999}#yt-loading [aria-hidden]{font-size:64px}html.yt-paused *{animation-play-state:paused!important}\n')
print('youtube-build-ok')
