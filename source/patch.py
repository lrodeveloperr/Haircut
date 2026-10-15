import sys
p = sys.argv[1]
s = open(p).read()

# 1) collect the hair-region triangles while sampling the surface
a = 'if(!n.some(h=>Na(...h)>.01))continue;'
assert s.count(a) == 1
s = s.replace(a, a + 'q.push(...n[0],...n[1],...n[2]);')
b = 'function rw(e,t){let r={positions:new Float32Array(24576),weights:new Float32Array(8192)};'
assert s.count(b) == 1
s = s.replace(b, b + 'let q=[];')

# 2) grid cells too small to catch a surface sample (they converge at the crown, where the grid's
#    angular columns meet) were left with no position, so the clipper could never reach them and an
#    uncut tuft stayed in the middle of a shaved scalp. Grow outwards from the sampled cells and
#    place each empty neighbour where its own grid ray hits the head.
c = 'r.weights[A]+=f}}return r}function iw(e,t){'
assert s.count(c) == 1
fill = ('r.weights[A]+=f}}'
  'let O=[0,2.1,-.13],F=r.weights.map(h=>h>0?1:0);'
  'for(let h=!0;h;){h=!1;let d=F.slice();'
  'for(let A=0;A<8192;A++){if(F[A])continue;let g=A&127,m=A>>7,w=!1;'
  'for(let C=-1;C<=1&&!w;C++)for(let x=-1;x<=1;x++){let T=m+C;if(T>=0&&T<64&&F[T*128+(g+x+128&127)]===1){w=!0;break}}'
  'if(!w)continue;d[A]=2;'
  'let U=(g+.5)/128*2*Math.PI-Math.PI,D=(m+.5)/64*(Math.PI/2+.7)-.7,M=[Math.sin(U)*Math.cos(D),Math.sin(D),-Math.cos(U)*Math.cos(D)],I=1/0;'
  'for(let H=0;H<q.length;H+=9){let k=q[H+3]-q[H],G=q[H+4]-q[H+1],Z=q[H+5]-q[H+2],V=q[H+6]-q[H],$=q[H+7]-q[H+1],J=q[H+8]-q[H+2],'
  'te=M[1]*J-M[2]*$,Ae=M[2]*V-M[0]*J,Ue=M[0]*$-M[1]*V,Pe=k*te+G*Ae+Z*Ue;if(Math.abs(Pe)<1e-9)continue;'
  'let qe=1/Pe,He=O[0]-q[H],Oe=O[1]-q[H+1],ce=O[2]-q[H+2],P=(He*te+Oe*Ae+ce*Ue)*qe;if(P<0||P>1)continue;'
  'let L=Oe*Z-ce*G,X=ce*k-He*Z,z=He*G-Oe*k,he=(M[0]*L+M[1]*X+M[2]*z)*qe;if(he<0||P+he>1)continue;'
  'let _=(V*L+$*X+J*z)*qe;_>0&&_<I&&(I=_)}'
  'if(I<1/0){let H=O.map((k,G)=>k+M[G]*I);(r.positions.set(H,A*3),r.weights[A]=.05,d[A]=1,h=!0)}}'
  'F=d}'
  'return r}function iw(e,t){')
s = s.replace(c, fill)
open(p, 'w').write(s)
print('patched')
