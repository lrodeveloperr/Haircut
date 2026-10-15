"""Wire runtime/customers.js (globalThis.HSC) into the game bundle."""
import sys
p = sys.argv[1]
s = open(p).read()


def rep(old, new, count=1):
    global s
    assert s.count(old) == count, (s.count(old), old[:90])
    s = s.replace(old, new)


# shared shader prelude: customer uniforms, baldness, beard grid
rep('uniform vec3 uHairTint; uniform float uDensity;\nconst float ZC',
    'uniform vec3 uHairTint; uniform float uDensity;\n${HSC.glsl.decls}\nconst float ZC')

# the shader hair mask also follows the customer's baldness pattern (the CPU mask, used for cutting, does not)
i = s.index('var tw=`\nfloat hairMask(vec3 p){')
s = s[:i] + s[i:].replace('var tw=`\nfloat hairMask(vec3 p){', 'var tw=`\nfloat hairMask0(vec3 p){', 1)
end = 'return m*mix(1.0,smoothstep(1.0,1.28,ear),smoothstep(1.35,1.6,ax));}'
j = s.index(end, i) + len(end)
s = s[:j] + '\nfloat hairMask(vec3 p){return hairMask0(p)*baldDensity(p);}' + s[j:]

# eyebrow thickness per customer
rep('float th = mix(0.140, 0.058, smoothstep(0.25, 1.0, t)) * mix(0.45, 1.0, smoothstep(0.0, 0.22, t));',
    'float th = mix(0.140, 0.058, smoothstep(0.25, 1.0, t)) * mix(0.45, 1.0, smoothstep(0.0, 0.22, t)) * uBrowA.x;')

# head skin material: customer-driven shader
i = s.index('Gi.onBeforeCompile=')
j = s.index(';vt.add(new Ze(Pt,Gi))', i)
s = s[:i] + 'Gi.onBeforeCompile=e=>HSC.skinCompile(e,{uGrid:bl,uHairTint:Zn,uDensity:$n,Ql})' + s[j:]

# scalp coverage overlay gets the customer uniforms (baldness)
rep('Cw=new Ze(Pt,new fr({uniforms:{uGrid:bl,uHairTint:Zn,uDensity:$n},',
    'Cw=new Ze(Pt,new fr({uniforms:Object.assign({uGrid:bl,uHairTint:Zn,uDensity:$n},HSC.U),')

# scalp strands: 8 segments (curls need them) and customer-driven style, grey and baldness
rep('for(let S=0;S<=5;S++)if(A.push(-1,S/5,0,1,S/5,0),S<5){let U=S*2;',
    'for(let S=0;S<=8;S++)if(A.push(-1,S/8,0,1,S/8,0),S<8){let U=S*2;')
i = s.index('C=Object.entries(w).map(')
j = s.index(',T=new fr({vertexShader:C,fragmentShader:x,', i)
s = s[:i] + 'C=HSC.glsl.strandVert(t),x=HSC.glsl.strandFrag(t)' + s[j:]
rep('uniforms:dl(Nn({},r),{uWidth:p})', 'uniforms:dl(Nn(Nn({},HSC.U),r),{uWidth:p})')

# attach the customer system once the head, hair and lights exist
rep('vt.add(Oi.mesh);iw(Qu,Oi.roots);',
    'vt.add(Oi.mesh);iw(Qu,Oi.roots);HSC.attach({Pt,Gi,vt,Ql,Na,uGrid:bl,uHairTint:Zn,uDensity:$n,light:xr,eyeCanvas:es,eyeTexture:ts,'
    'T:{It,mt,Ra,af,Ze,fr,uu,Jn,cr,or,$t}});')

# renderer API
rep('{surface:Qu,emitHair:m,',
    '{surface:Qu,get beardSurface(){return HSC.beardSurface},setPerson:ue=>HSC.setPerson(ue),setBeard:ue=>HSC.setBeard(ue),emitHair:m,')

# clipper picking: hits outside the scalp can land on the beard
rep('if(Na(se,me,Fe)<.05)return w=null,null;',
    'let hs_bh=Na(se,me,Fe)<.05?HSC.beardHit(se,me,Fe,be,hs_B===hs_I):null;if(Na(se,me,Fe)<.05&&!hs_bh)return w=null,null;')
rep('dl(Nn({},Tl(se,me,Fe)),{', 'dl(Nn({},hs_bh||Tl(se,me,Fe)),{')

# controller: keep the customer in the session, show them, and trim beards
rep('function J(){var j,ae;e.classList.add("free-style"),',
    'function J(){var j,ae;s=HSC.ensure(s),e.classList.add("free-style"),')
rep('n.setElevation(s.cameraElevation),n.setHair(s.hair),Z()}function te(){',
    'n.setElevation(s.cameraElevation),n.setHair(s.hair),n.setPerson(s.look.person),n.setBeard(s.beard),Z()}function te(){')
rep('let ye=f!=null&&f.lastUv?[f.lastUv,ue]:[ue],Ie=Ts(s,ye,{surface:n.surface});',
    'let ye=f!=null&&f.lastUv&&f.lastUv.kind===ue.kind?[f.lastUv,ue]:[ue],Ie=ue.kind==="beard"?HSC.cutBeard(s,ye,n.beardSurface):Ts(s,ye,{surface:n.surface});')
rep('Ie.changed&&(n.setHair(s.hair),n.emitHair(Ie.intensity)',
    'Ie.changed&&(n.setHair(s.hair),n.setBeard(s.beard),n.emitHair(Ie.intensity)')

# beard strand detail follows the scalp's adaptive strand count
rep('function He(ue){te=Math.max(16e3,Math.min(Oi.count,ue)),Oi.setCount(te)}',
    'function He(ue){te=Math.max(16e3,Math.min(Oi.count,ue)),Oi.setCount(te),HSC.setDetail&&HSC.setDetail(te/Oi.count)}')

open(p, 'w').write(s)
print('patched customers')
