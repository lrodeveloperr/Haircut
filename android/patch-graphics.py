"""Android-only fixed High graphics matching Sites, applied after shared patches."""
from pathlib import Path
import sys


def adapt(runtime):
    path = Path(runtime)
    s = path.read_text()

    def replace(old, new, count=1):
        nonlocal s
        actual = s.count(old)
        if actual != count:
            raise ValueError(f"Android graphics expected {count} occurrences, got {actual}: {old[:100]}")
        s = s.replace(old, new)

    # Preserve the shared Sites/YouTube touch mapping. The blade remains above the
    # finger so the player can see the cutting edge; visual and actual hits agree.

    # Remove the renderer's independent adaptive controller as well as using the
    # fixed profile. Sampling slow frames must have no quality-changing side effects.
    start = s.index('function he(ue){Pe&&(Ue=Ue*.93+')
    end = s.index('function _(ue=!0)', start)
    replace(s[start:end], 'function he(ue){if(Pe)HSC.detail.sample(ue-Pe);Pe=ue}')
    replace('resetTiming(){Pe=0}', 'resetTiming(){Pe=0;HSC.detail.resetHistory()}')
    # Use exactly the Sites/YouTube fixed High pixel budget for these canvas bounds.
    # Recalculate only for viewport/display changes, never in response to slow frames.
    replace('let ye=Math.max(1,e.clientWidth),Ie=Math.max(1,e.clientHeight),B=Math.floor(ye*$),E=Math.floor(Ie*$);',
            'let ye=Math.max(1,e.clientWidth),Ie=Math.max(1,e.clientHeight);J=$=HSC.detail.pixelRatio(ye,Ie);let B=Math.floor(ye*$),E=Math.floor(Ie*$);')

    # Reuse the existing YouTube idle-render policy: static scenes need no GPU
    # redraw. Cutting, rotation, reveal and falling hair still render each frame.
    replace('function J(){var j,ae;s=HSC.ensure(s)',
            'let needsRender=true;function J(){needsRender=true;var j,ae;s=HSC.ensure(s)')
    replace('function Ae(){if(f)try{a.releasePointerCapture(f.id)}',
            'function Ae(){needsRender=true;if(f)try{a.releasePointerCapture(f.id)}')
    replace('let ce=()=>{Ae(),C||n.render(!1)}',
            'let ce=()=>{Ae();if(!C&&!c){n.render(!1);needsRender=false}}')
    replace('if(s.status==="reveal"&&!x){D+=ae;',
            'if(s.status==="reveal"&&!x){needsRender=true;D+=ae;')
    replace('(f||s.status==="reveal"&&!x||j%66<20||HSC.clippingsActive&&HSC.clippingsActive())&&n.render(!!(f||s.status==="reveal"&&!x||HSC.clippingsActive&&HSC.clippingsActive()))',
            '(()=>{let active=!!(f||s.status==="reveal"&&!x||HSC.clippingsActive&&HSC.clippingsActive());if(active||needsRender){n.render(active);needsRender=false}})()')
    # Idle rendering must restart after WebGL restoration. Cancel an interrupted
    # stroke on loss, then redraw the unchanged full-detail scene on restoration.
    replace('P.observe(e),globalThis.addEventListener("resize",ce);',
            'P.observe(e),globalThis.addEventListener("resize",ce);a.addEventListener("webglcontextlost",Ae);a.addEventListener("webglcontextrestored",ce);')
    replace('P.disconnect(),globalThis.removeEventListener("resize",ce),',
            'P.disconnect(),globalThis.removeEventListener("resize",ce),a.removeEventListener("webglcontextlost",Ae),a.removeEventListener("webglcontextrestored",ce),')

    path.write_text(s)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('usage: python3 android/patch-graphics.py RUNTIME_GAME_JS')
    adapt(sys.argv[1])
    print('Android fixed Sites High graphics and shared touchscreen mapping applied')
