import re, sys
p = sys.argv[1]
s = open(p).read()
here = __file__.rsplit('/', 1)[0]

def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)

# 1) smooth the decoded head mesh; keep the original for touch picking and the grid-gap ray fill
fn = open(here + '/smooth.js').read()
fn = fn[:fn.index("if (typeof module")].strip().replace('function smoothHead(', 'function hs_smooth(')
fn = re.sub(r'^\s*//.*\n', '', fn, flags=re.M)
fn = re.sub(r'\n\s*', '', fn)
rep('var Pt=new Tt;{let e=gw();Pt.setAttribute(',
    fn + 'var Pt=new Tt;{let c=gw(),e=hs_smooth(c,.15,3);Pt.userData.coarse=c;Pt.userData.org=e.org;Pt.setAttribute(')

# 2) clipper touch picking: hit the coarse mesh first (cheap), then refine on the smooth triangles that
#    came from the hit triangle and its neighbours, so the blade sits on the visible surface
rep('let ie=Pt.attributes.position.array,Ee=Pt.index.array,ve=new ff,ge=new je;',
    'let ie=Pt.userData.coarse.pos,Ee=Pt.userData.coarse.idx,ve=new ff,ge=new je,hs_P=Pt.attributes.position.array,hs_I=Pt.index.array,'
    'hs_K=(()=>{let o=Pt.userData.org,n=Ee.length/3,kids=Array.from({length:n},()=>[]),at=new Map(),vk=[];'
    'for(let t=0;t<o.length;t++)kids[o[t]].push(t);'
    'for(let v=0;v<ie.length/3;v++)vk.push(Math.round(ie[v*3]*1e4)+","+Math.round(ie[v*3+1]*1e4)+","+Math.round(ie[v*3+2]*1e4));'
    'for(let t=0;t<n;t++)for(let c=0;c<3;c++){let k=vk[Ee[t*3+c]],l=at.get(k);l||at.set(k,l=[]);l.push(t)}'
    'let ring=Array.from({length:n},(_,t)=>[...new Set([0,1,2].flatMap(c=>at.get(vk[Ee[t*3+c]])))]);return{kids,ring}})();')
rep('if(!isFinite(xe))return w=null,null;let se=Q+q*xe,me=K+Me*xe,Fe=re+pe*xe;{let R=Ee[be]*3,le=Ee[be+1]*3,de=Ee[be+2]*3,Be=new b(ie[le]-ie[R],ie[le+1]-ie[R+1],ie[le+2]-ie[R+2]),ne=new b(ie[de]-ie[R],ie[de+1]-ie[R+1],ie[de+2]-ie[R+2])',
    'if(!isFinite(xe))return w=null,null;let hs_A=ie,hs_B=Ee;{let fx=1/0,fb=-1;for(let T of hs_K.ring[be/3])for(let F of hs_K.kids[T]){'
    'let a0=hs_I[F*3]*3,a1=hs_I[F*3+1]*3,a2=hs_I[F*3+2]*3,e1x=hs_P[a1]-hs_P[a0],e1y=hs_P[a1+1]-hs_P[a0+1],e1z=hs_P[a1+2]-hs_P[a0+2],e2x=hs_P[a2]-hs_P[a0],e2y=hs_P[a2+1]-hs_P[a0+1],e2z=hs_P[a2+2]-hs_P[a0+2],'
    'px=Me*e2z-pe*e2y,py=pe*e2x-q*e2z,pz=q*e2y-Me*e2x,dt=e1x*px+e1y*py+e1z*pz;if(Math.abs(dt)<1e-9)continue;'
    'let iv=1/dt,tx=Q-hs_P[a0],ty=K-hs_P[a0+1],tz=re-hs_P[a0+2],uu=(tx*px+ty*py+tz*pz)*iv;if(uu<0||uu>1)continue;'
    'let qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,vv=(q*qx+Me*qy+pe*qz)*iv;if(vv<0||uu+vv>1)continue;'
    'let tt=(e2x*qx+e2y*qy+e2z*qz)*iv;tt>0&&tt<fx&&(fx=tt,fb=F*3)}fb>=0&&(xe=fx,be=fb,hs_A=hs_P,hs_B=hs_I)}'
    'let se=Q+q*xe,me=K+Me*xe,Fe=re+pe*xe;{let R=hs_B[be]*3,le=hs_B[be+1]*3,de=hs_B[be+2]*3,Be=new b(hs_A[le]-hs_A[R],hs_A[le+1]-hs_A[R+1],hs_A[le+2]-hs_A[R+2]),ne=new b(hs_A[de]-hs_A[R],hs_A[de+1]-hs_A[R+1],hs_A[de+2]-hs_A[R+2])')

# 3) hair grid sampling: keep the same sample spacing on the now smaller triangles
rep('l=Math.hypot(o[1]*s[2]-o[2]*s[1],o[2]*s[0]-o[0]*s[2],o[0]*s[1]-o[1]*s[0])*.5*24*24,c=12,',
    'l=Math.hypot(o[1]*s[2]-o[2]*s[1],o[2]*s[0]-o[0]*s[2],o[0]*s[1]-o[1]*s[0])*.5*24*24,c=Math.max(2,Math.min(12,Math.ceil(Math.max(Math.hypot(...o),Math.hypot(...s),Math.hypot(o[0]-s[0],o[1]-s[1],o[2]-s[2]))/.028))),')

# 4) the grid-gap ray fill (patch.py) casts against the coarse scalp triangles: same result, far fewer tests
rep('function rw(e,t){', 'function rw(e,t,K){')
rep('weights:new Float32Array(8192)};let q=[];',
    'weights:new Float32Array(8192)};let q=[];if(K)for(let i=0;i<K.idx.length;i+=3){let a=[0,1,2].map(h=>[K.pos[K.idx[i+h]*3],K.pos[K.idx[i+h]*3+1],K.pos[K.idx[i+h]*3+2]]);a.some(h=>Na(...h)>.01)&&q.push(...a[0],...a[1],...a[2])}')
rep('q.push(...n[0],...n[1],...n[2]);', 'K||q.push(...n[0],...n[1],...n[2]);')
rep('Qu=rw(Pt.attributes.position.array,Pt.index.array)', 'Qu=rw(Pt.attributes.position.array,Pt.index.array,Pt.userData.coarse)')

open(p, 'w').write(s)
print('patched head smoothing')
