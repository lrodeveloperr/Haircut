/* Playgama Bridge contract retained by this bundle: platform.language; storage.get; storage.set. */
(()=>{var Cd=Object.defineProperty,vd=Object.defineProperties;var Md=Object.getOwnPropertyDescriptors;var jl=Object.getOwnPropertySymbols;var Dd=Object.prototype.hasOwnProperty,Bd=Object.prototype.propertyIsEnumerable;var ql=(e,t,r)=>t in e?Cd(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,rt=(e,t)=>{for(var r in t||(t={}))Dd.call(t,r)&&ql(e,r,t[r]);if(jl)for(var r of jl(t))Bd.call(t,r)&&ql(e,r,t[r]);return e},gt=(e,t)=>vd(e,Md(t));var Kr=Object.freeze([1,2,3,4]),sa=5;var Zl=5,$l=Object.freeze([0,1,2,3,4,5]);var ms=Object.freeze({id:"customer-white-male-01",presentation:"adult-man",skinTone:"white",hairTexture:"straight",startingHaircut:"uniform-fade-region"}),oa=Object.freeze({minYawDeg:-180,initialYawDeg:-55,maxYawDeg:180,axis:"full-scalp"}),ur=Object.freeze({id:"clipper",touchOffsetPx:72,logicalRadiusCells:3,bladeWidthUnits:.56,bladeDepthUnits:.1,modelScale:.31});function la(e){return typeof e=="number"&&Kr.includes(e)}var ec=e=>$l.includes(e);function Wa(e,t){return!Number.isInteger(e)||!Number.isInteger(t)||e<0||e>=128||t<0||t>=64?-1:t*128+e}function Es(e,t){return!Number.isFinite(e)||!Number.isFinite(t)||e<0||e>1||t<0||t>1?null:{column:Math.min(127,Math.floor(e*128)),row:Math.min(63,Math.floor(t*64))}}var ca=Object.freeze({classic:Object.freeze([5,5,5]),tidy:Object.freeze([3,4,5]),medium:Object.freeze([4,5,5]),even16:Object.freeze([5,5,5]),tapered:Object.freeze([3,5,5]),soft:Object.freeze([4,4,5])});function xd(e,t,r=ca.classic){let a=.06*Math.max(0,-Math.cos((e-.5)*Math.PI*2)),n=.012*Math.sin(e*Math.PI*18)+.008*Math.sin(e*Math.PI*42+1.7);return t<.6-a+n?r[0]:t<.67-a+n?r[1]:r[2]}function Ja(e=ca.classic){return Array.from({length:8192},(t,r)=>xd((r%128+.5)/128,(Math.floor(r/128)+.5)/64,e))}var bt=e=>({0:.5,1:3,2:6,3:10,4:13,5:16,6:19,7:22,8:25})[e];var kt=99,Ms=Math.PI*2,ir=e=>{let t=(e-.5)*Ms;return{side:Math.abs(Math.sin(t)),back:Math.max(0,Math.cos(t)),front:Math.max(0,-Math.cos(t)),right:Math.sin(t)>0}},tc=(e,t)=>Math.min(Math.hypot((e-.25)*2.77,t-.17),Math.hypot((e-.75)*2.77,t-.17)),Ka=(e,t,r,i,a)=>t<r?0:t<r+i?1:t<r+i+a?2:t<r+i+a+.07?3:kt,rc=(e,t,r,i)=>{if(e<t)return i[0];let a=Math.floor((e-t)/r)+1;return a<i.length?i[a]:kt},_d=(e,t)=>{let r=t*2.27-.7,i=e*Ms-Math.PI;return 1.9*Math.cos(r)*Math.sin(i)},Sd=(e,t)=>{let r=t*2.27-.7,i=e*Ms-Math.PI;return-Math.cos(r)*Math.cos(i)},ha={"low-fade":(e,t)=>{let r=ir(e);return Ka(e,t,.05+.07*r.side,.07,.08)},"mid-fade":(e,t)=>{let r=ir(e);return Ka(e,t,.13+.08*r.side,.07,.08)},"high-fade":(e,t)=>{let r=ir(e);return Ka(e,t,.3+.07*r.side,.07,.08)},"drop-fade":(e,t)=>{let r=ir(e);return Ka(e,t,.2+.05*r.side-.14*Math.pow(r.back,.7),.07,.08)},"burst-fade":(e,t)=>{let r=tc(e,t);return t>.44?kt:r<.14?0:r<.21?1:r<.28?2:kt},"low-taper":(e,t)=>{let r=ir(e),i=tc(e,t);return r.back>.4&&t<.17?t<.05?0:t<.11?1:2:i<.12?i<.09?0:1:Math.min(Math.abs(e-.19),Math.abs(e-.81))<.065&&t<.3?t<.2?1:2:i<.17?2:kt},"skin-undercut":(e,t)=>{let r=ir(e);return t<.4+.03*r.side-.03*r.back?0:kt},"number-2-undercut":(e,t)=>{let r=ir(e);return t<.4+.03*r.side-.03*r.back?2:kt},"number-3-undercut":(e,t)=>{let r=ir(e);return t<.4+.03*r.side-.03*r.back?3:kt},"soft-fade":(e,t)=>{let r=ir(e);return rc(t,.08+.05*r.side,.09,[2,3,4])},"skin-blend":(e,t)=>{let r=ir(e);return rc(t,.1+.06*r.side,.065,[0,1,2,3,4])},"number-4-sides":(e,t)=>{let r=ir(e);return t<.05&&r.back>.3?2:t<.52+.03*r.side-.02*r.back?4:kt}},yd=(e,t)=>Math.abs(_d(e,t)-.82)<.07&&t>.48&&Sd(e,t)>-.35,ws=e=>t=>t===kt?e:Math.min(t,e),ua={long:e=>e,short:ws(2),part:(e,t,r)=>yd(t,r)?0:e,"crop-3":ws(3),"crop-4":ws(4)},gC=Object.freeze(Object.keys(ha)),fC=Object.freeze(Object.keys(ua)),Id=(e,t)=>`${e}/${t}`,Rd=(e,t)=>Array.from({length:8192},(r,i)=>{let a=(i%128+.5)/128,n=(Math.floor(i/128)+.5)/64;return ua[t](ha[e](a,n),a,n)});var Td=(()=>{let e=["low-fade","mid-fade","high-fade","drop-fade","burst-fade","low-taper","skin-undercut","number-2-undercut"],t=["long","short","part"],r=[];for(let a of t)for(let n of e)r.push([n,a]);for(let a of Object.keys(ua))for(let n of Object.keys(ha))r.some(([o,s])=>o===n&&s===a)||r.push([n,a]);let i=new Set;return r.filter(([a,n])=>{let o=Rd(a,n);if(o.includes(0))return!1;let s=o.join();return i.has(s)?!1:(i.add(s),!0)})})(),Xa=Object.freeze(Td.map(([e,t],r)=>Object.freeze({id:Id(e,t),family:e,top:t,variant:r%4,version:4}))),Xr=Object.freeze(Xa.map(e=>e.id));function bd(e,t,r){var o,s,l;let[i,a]=((o=e.id)!=null?o:"").split("/"),n=((s=ha[i])!=null?s:ha["low-fade"])(t,r);return((l=ua[a])!=null?l:ua.long)(n,t,r)}var Cs=new Map;function vs(e,t){let r=e.id+(t?"|m":"");return Cs.has(r)||Cs.set(r,Object.freeze(Array.from({length:8192},(i,a)=>{let n=a%128,o=t?127-n:n;return bd(e,(o+.5)/128,(Math.floor(a/128)+.5)/64)}))),Cs.get(r)}var ic=new WeakMap,Qd=Ja();function ac(e,t=Qd,r=!1){let i=ic.get(t);i||(i=new Map,ic.set(t,i));let a=e.id+(r?"|m":"");if(!i.has(a)){let n=vs(e,r);i.set(a,Object.freeze(n.map((o,s)=>o===kt?t[s]:Math.min(o,t[s]))))}return i.get(a)}function da(e){var t;return(t=Xa.find(r=>r.id===e))!=null?t:Xa[0]}function Ud(e){if(vs(e,!1).some(t=>t!==kt&&!Kr.includes(t))||!vs(e,!1).some(t=>t!==kt))throw Error(`Unachievable ${e.id}`);return!0}var Ds=e=>Math.imul(e>>>0,1664525)+1013904223>>>0;function Fd(e,t){let r=[...e];for(let i=r.length-1;i>0;i--){t=Ds(t);let a=t%(i+1);[r[i],r[a]]=[r[a],r[i]]}return{ids:r,seed:t}}var mi=e=>da(e).family;function Ld(e,t){var n,o;let r=e.length;if(!r)return!0;let i=new Map;for(let s of e)i.set(mi(s),((n=i.get(mi(s)))!=null?n:0)+1);return Math.max(...i.values())<=Math.ceil(r/2)&&((o=i.get(t))!=null?o:0)<=Math.floor(r/2)}function Bs(e,t,r=null){let i=Array.isArray(e)?e.filter((l,c,u)=>Xr.includes(l)&&u.indexOf(l)===c&&l!==r):[];if(!i.length){let l=Fd(Xr,t);i=l.ids,t=l.seed}let a=r?mi(r):null,n=l=>i.filter((c,u)=>u!==l),o=i.findIndex((l,c)=>mi(l)!==a&&Ld(n(c),mi(l)));return o<0&&(o=i.findIndex(l=>mi(l)!==a)),o<0&&(o=0),{id:i[o],bag:n(o),seed:t}}Xa.forEach(e=>Ud(e));function nc(e,t,r){var c,u,h;let i=0,a=0,n=0,o=0,s=0,l=0;for(let d=0;d<t.length;d++){let g=(c=r==null?void 0:r[d])!=null?c:1;if(!g)continue;let m=bt(e[d]),A=bt(t[d]);i+=g,a+=g*(m>=A?Math.min(1,Math.max(0,m-A-1.5)/10):Math.min(1,Math.max(0,A-m-.75)/3));for(let f of[d%128<127?d+1:d-128+1,d+128]){if(f>=t.length||!((u=r==null?void 0:r[f])==null||u))continue;let p=bt(t[f])-A,w=bt(e[f])-m,C=Math.min(g,(h=r==null?void 0:r[f])!=null?h:1);Math.abs(p)<=3?(n+=C*Math.min(1,Math.max(0,Math.abs(w-p)-1.5)/6),s+=C):(o+=C*Math.min(1,Math.abs(w-p)/13),l+=C)}}return Math.max(0,Math.min(1,.6*(1-a/(i||1))+.25*(1-n/(s||1))+.15*(1-o/(l||1))))}function sc(e,t){var u,h;let r=ac(da(e.requestId),e.startHair,!!((u=e.look)!=null&&u.mirror)),i=nc(e.hair,r,t),a=nc(e.startHair,r,t),n=a>=.999?i:Math.max(0,Math.min(1,(i-a)/(1-a))),o=0,s=0;for(let d=0;d<r.length;d++){let g=(h=t==null?void 0:t[d])!=null?h:1;if(!g)continue;let m=bt(e.startHair[d])-bt(e.hair[d]);m>0&&(o+=g,s+=m*g)}let l=t?o>=40&&s>=60:s>0,c=l?n>=.85?3:n>=.6?2:1:0;return{score:n,stars:c,meaningful:l,removedArea:o,volume:s,quality:i}}var cc=Object.freeze(["jet-black","soft-black","very-dark-brown","dark-brown","medium-brown","light-brown","dark-blonde","golden-blonde","light-blonde","auburn","ginger-red","silver-grey"]),Nd=[8,12,14,18,15,10,8,5,3,3,2,2],oc=[2,3,4,5],Pd=["low","mid","high","drop","taper"],hc=Object.freeze(Object.keys(ca)),uc=[];for(let e of oc)for(let t of oc){if(e>t)continue;let i=e===5?["even"]:Pd;for(let a of i)for(let n of a==="even"?[0]:[0,1])uc.push(Object.freeze({id:`s${e}-b${t}-t5-${a}-v${n}`,side:e,blend:t,top:5,contour:a,variant:n,triple:`${e}-${t}-5`}))}var Tr=Object.freeze(uc),dc=Object.freeze(Tr.map(e=>e.id)),Hd=new Map(Tr.map(e=>[e.id,e])),MC=Object.freeze({visit:"walk-in",profile:"classic",grownFrom:null,growthMm:0,colour:1,mirror:!1});function pc(e,t){return e=Ds(e),{seed:e,value:e%t}}function Gd(e,t){let r=t.reduce((n,o)=>n+o,0),i=pc(e,r),a=i.value;for(let n=0;n<t.length;n++){if(a<t[n])return{seed:i.seed,value:n};a-=t[n]}return{seed:i.seed,value:0}}var lc=(e,t,r)=>{let i=Math.max(0,Math.min(1,(r-e)/(t-e)));return i*i*(3-2*i)};function Od(e,t,r){if(e.contour==="even")return e.top;let i=Math.max(0,-Math.cos((t-.5)*Math.PI*2)),a=Math.max(0,Math.cos((t-.5)*Math.PI*2)),n=.01*Math.sin(t*Math.PI*18)+.006*Math.sin(t*Math.PI*42+1.7),o,s;if(e.contour==="low")o=.43-.035*i+n,s=.6-.025*i+n;else if(e.contour==="mid")o=.54-.045*i+n,s=.7-.035*i+n;else if(e.contour==="high")o=.64-.055*i+n,s=.79-.045*i+n;else if(e.contour==="drop")o=.59-.14*a-.04*i+n,s=o+.17;else{let l=Math.max(lc(.78,1,t),lc(.22,0,t)),u=Math.max(l,a*.92);o=.18+.36*u-.025*i+n,s=.37+.31*u-.02*i+n}return e.variant===1&&(o-=.035,s+=.025),r<o?e.side:r<s?e.blend:e.top}function kd(e){return Array.from({length:8192},(t,r)=>Od(e,(r%128+.5)/128,(Math.floor(r/128)+.5)/64))}function ja(e,t=[]){let r=pc(e,Tr.length);e=r.seed;let i=r.value,a=new Set(t.slice(-4)),n=Hd.get(t.at(-1)),o=!1;for(let c=0;c<2&&!o;c++)for(let u=0;u<Tr.length;u++){let h=Tr[(i+u)%Tr.length];if(!a.has(h.id)&&!(c===0&&n&&h.triple===n.triple)){i=(i+u)%Tr.length,o=!0;break}}r=Gd(e,Nd),e=r.seed;let s=Tr[i];return{look:{visit:"walk-in",profile:s.id,grownFrom:null,growthMm:0,colour:r.value,mirror:!1},hair:kd(s),seed:e}}function xs(e){let t=dc.includes(e==null?void 0:e.profile)||hc.includes(e==null?void 0:e.profile);return!!e&&typeof e=="object"&&t&&["walk-in","returning"].includes(e.visit)&&(e.visit==="walk-in"?e.grownFrom===null:Xr.includes(e.grownFrom))&&[0,4,7,10].includes(e.growthMm)&&Number.isInteger(e.colour)&&e.colour>=0&&e.colour<cc.length&&typeof e.mirror=="boolean"}var gc=e=>dc.includes(e)||hc.includes(e),DC=8192;var _s=(e,t,r)=>Math.min(r,Math.max(t,e)),Vd=()=>Math.floor(Math.random()*4294967296)>>>0||1;function Ei({tutorialSeen:e=!1,seed:t=Vd()}={}){let r=Bs([],t>>>0),i=ja(r.seed),a=i.hair;return{version:19,customerId:ms.id,status:"cutting",interactionMode:"rotate",selectedGuard:1,cameraYawDeg:oa.initialYawDeg,cameraElevation:10,hair:[...a],startHair:[...a],look:rt({},i.look),recentLooks:[i.look.profile],cutStrokeCount:0,tutorialSeen:e,freeStyle:!0,jobId:1,requestId:r.id,completed:0,best:{},recent:[],bag:r.bag,seed:i.seed,result:null,adCadence:{qualified:0,activeMs:0},retryCount:0,guideRemainingMs:0}}function pa(e,t){return e.status==="cutting"?gt(rt({},e),{interactionMode:t?"cut":"rotate"}):e}function Ss(e,t){return e.status==="cutting"&&la(t)?gt(rt({},e),{selectedGuard:t}):e}function Za(e,t,r=0){return e.status!=="cutting"||e.interactionMode!=="rotate"||!Number.isFinite(t)?e:gt(rt({},e),{cameraYawDeg:(e.cameraYawDeg+t+540)%360-180,cameraElevation:_s(e.cameraElevation+r,-5,70)})}function $a(e){return gt(rt({},e),{tutorialSeen:!0})}function ys(e,t){var o;if(e.status!=="cutting")return e;if(e.freeStyle)return gt(rt({},e),{status:"reveal",interactionMode:"rotate",guideRemainingMs:0,result:{freeStyle:!0},completed:e.completed+1,recent:[...e.recent,e.requestId].slice(-6)});let r=sc(e,t),i=(o=e.best[e.requestId])!=null?o:0,a=gt(rt({},r),{previousBest:i}),n=e.completed+(a.meaningful?1:0);return gt(rt({},e),{status:"reveal",interactionMode:"rotate",guideRemainingMs:0,result:a,completed:n,best:gt(rt({},e.best),{[e.requestId]:Math.max(i,a.stars)}),recent:[...e.recent,e.requestId].slice(-6)})}function Is(e){let t=Bs(e.bag,e.seed,e.requestId),r=ja(t.seed,e.recentLooks),i=r.hair;return gt(rt({},e),{status:"cutting",interactionMode:"rotate",selectedGuard:1,cameraYawDeg:oa.initialYawDeg,cameraElevation:10,hair:[...i],startHair:[...i],look:r.look,recentLooks:[...e.recentLooks,r.look.profile].slice(-4),cutStrokeCount:0,freeStyle:!0,jobId:e.jobId+1,requestId:t.id,bag:t.bag,seed:r.seed,result:null,guideRemainingMs:0})}function fc(e){if(!e||typeof e!="object")return["invalid session"];let t=[];e.version!==19&&t.push("version"),(!["cutting","reveal"].includes(e.status)||!["rotate","cut"].includes(e.interactionMode))&&t.push("mode"),la(e.selectedGuard)||t.push("guard");for(let r of["hair","startHair"])(!Array.isArray(e[r])||e[r].length!==8192||e[r].some(i=>!ec(i)))&&t.push(r);for(let r of["completed","jobId","cutStrokeCount"])(!Number.isSafeInteger(e[r])||e[r]<0)&&t.push(r);return(!Number.isFinite(e.cameraYawDeg)||!Number.isFinite(e.cameraElevation))&&t.push("camera"),(!Array.isArray(e.recent)||!Array.isArray(e.recentLooks)||e.recentLooks.length>4||e.recentLooks.some(r=>!gc(r))||!Array.isArray(e.bag)||!e.best||da(e.requestId).id!==e.requestId||e.bag.some(r=>!Xr.includes(r))||e.bag.includes(e.requestId)||new Set(e.bag).size!==e.bag.length)&&t.push("progression"),e.status==="reveal"&&!e.result&&t.push("result"),xs(e.look)||t.push("look"),(typeof e.tutorialSeen!="boolean"||!Number.isSafeInteger(e.seed)||e.seed<0)&&t.push("progress"),(!Number.isSafeInteger(e.retryCount)||e.retryCount<0||!Number.isFinite(e.guideRemainingMs)||e.guideRemainingMs<0||e.guideRemainingMs>45e3)&&t.push("retry"),(!e.adCadence||!Number.isSafeInteger(e.adCadence.qualified)||e.adCadence.qualified<0||!Number.isFinite(e.adCadence.activeMs)||e.adCadence.activeMs<0)&&t.push("adCadence"),Array.isArray(e.hair)&&Array.isArray(e.startHair)&&e.hair.some((r,i)=>r>e.startHair[i])&&t.push("growth"),t}function Rs(e){return e&&[15,16,17,18].includes(e.version)&&(e=gt(rt({},e),{version:19,retryCount:Number.isSafeInteger(e.retryCount)?e.retryCount:0,selectedGuard:la(e.selectedGuard)?e.selectedGuard:1,recentLooks:xs(e.look)?[e.look.profile]:[],bag:Array.isArray(e.bag)?e.bag.filter((t,r,i)=>Xr.includes(t)&&t!==e.requestId&&i.indexOf(t)===r):e.bag})),fc(e).length?Ei():gt(rt({},e),{hair:[...e.hair],startHair:[...e.startHair],look:rt({},e.look),adCadence:rt({},e.adCadence),guideRemainingMs:_s(e.guideRemainingMs,0,45e3),cameraElevation:_s(e.cameraElevation,-5,70)})}var bC=`
float hairMask(vec3 p){float ax=abs(p.x),front=3.05-.55*smoothstep(.7,1.6,ax);float m=mix(1.0,smoothstep(front-.07,front+.12,p.y),smoothstep(0.0,.9,p.z));float back=.72+.42*smoothstep(.3,1.35,ax);float hl=mix(1.55,back,1.0-smoothstep(-.75,-.15,p.z));hl=mix(hl,1.4,smoothstep(0.0,.4,p.z)*(1.0-smoothstep(.4,.9,p.z)));hl=mix(hl,max(hl,1.4+1.5*smoothstep(.5,1.5,p.z)),smoothstep(.25,.6,p.z));float rear=1.0-smoothstep(-.75,-.15,p.z);m*=smoothstep(hl-mix(.08,.16,rear),hl+mix(.12,.22,rear),p.y);float ear=length(vec2((p.z+.13)/.5,(p.y-1.2)/.74));return m*mix(1.0,smoothstep(1.0,1.28,ear),smoothstep(1.35,1.6,ax));}
float gridValue(vec3 p){float u=(atan(p.x,-(p.z+.13))+3.14159265)/6.28318530;float v=clamp((atan(p.y-2.1,length(vec2(p.x,p.z+.13)))+.70)/2.27079632679,0.0,1.0);return texture2D(uGrid,vec2(u,v)).r*${(bt(Zl)/bt(sa)).toFixed(4)};}`;function Ac(e,t,r){var l;if(!e.spatial)return[...e.weights.keys()].filter(c=>e.weights[c]>0);let{size:i,buckets:a}=e.spatial,n=[],o=t.map(c=>Math.floor((c-r)/i)),s=t.map(c=>Math.floor((c+r)/i));for(let c=o[0];c<=s[0];c++)for(let u=o[1];u<=s[1];u++)for(let h=o[2];h<=s[2];h++)n.push(...(l=a.get(`${c},${u},${h}`))!=null?l:[]);return n}function zd(e){if(!e||typeof e!="object"||!Number.isFinite(e.u)||!Number.isFinite(e.v)||e.u<0||e.u>1||e.v<0||e.v>1)return null;let t={u:e.u,v:e.v};for(let r of["position","normal","bladeAcross","bladeAlong"])Array.isArray(e[r])&&e[r].length===3&&e[r].every(Number.isFinite)&&(t[r]=[...e[r]]);return t}function Yd(e,t){let r=[];for(let i of e){let a=zd(i);if(!a)continue;let n=r[r.length-1];if(!n){r.push(a);continue}let o=(a.u-n.u+1.5)%1-.5,s=o*128,l=(a.v-n.v)*64,c=Math.hypot(s,l),u=Math.max(1,Math.ceil(c/t));for(let h=1;h<=u;h+=1){let d=h/u,g={u:(n.u+o*d+1)%1,v:n.v+(a.v-n.v)*d};for(let m of["position","normal","bladeAcross","bladeAlong"])if(n[m]&&a[m]&&(g[m]=a[m].map((A,f)=>n[m][f]+(A-n[m][f])*d),m!=="position")){let A=Math.hypot(...g[m]);g[m]=g[m].map(f=>f/(A||1))}r.push(g)}}return r}function Wd(e,t,r){var c,u,h,d;let i=Es(e.u,e.v);if(!i)return[];let a=Math.max(.5,t),n=[],o=Wa(i.column,i.row),s=r==null?void 0:r.positions,l=r==null?void 0:r.weights;if(r){if(!e.position&&!l[o])return n;let g=(c=e.position)!=null?c:[s[o*3],s[o*3+1],s[o*3+2]],m=(u=e.bladeAcross)!=null?u:[1,0,0],A=(h=e.bladeAlong)!=null?h:[0,1,0],f=(d=e.normal)!=null?d:[0,0,1],p=Math.hypot(ur.bladeWidthUnits/2,ur.bladeDepthUnits/2,.1);for(let w of Ac(r,g,p)){let C=[0,1,2].map(T=>s[w*3+T]-g[T]),x=T=>C.reduce((y,S,U)=>y+S*T[U],0);Math.abs(x(m))<=ur.bladeWidthUnits/2&&Math.abs(x(A))<=ur.bladeDepthUnits/2&&Math.abs(x(f))<=.1&&n.push(w)}}else{let g=Math.ceil(a);for(let m=Math.max(0,i.row-g);m<=Math.min(63,i.row+g);m++)for(let A=-g;A<=g;A++){let f=(i.column+A+128)%128;Math.hypot(A,m-i.row)<=a&&n.push(Wa(f,m))}}return n}function Ts(e,t,{radiusCells:r=ur.logicalRadiusCells,surface:i}={}){if(e.status!=="cutting"||e.interactionMode!=="cut")return{state:e,changed:!1,changedCells:0,removedLength:0,intensity:0};if(!Array.isArray(t)||t.length===0)return{state:e,changed:!1,changedCells:0,removedLength:0,intensity:0};let a=Yd(t,i?.35:Math.max(.5,r*.5));if(a.length===0)return{state:e,changed:!1,changedCells:0,removedLength:0,intensity:0};let n=[...e.hair],o=new Set,s=0;for(let l of a)for(let c of Wd(l,r,i)){let u=n[c],h=Math.min(u,e.selectedGuard);h<u&&(n[c]=h,o.add(c),s+=bt(u)-bt(h))}return o.size===0?{state:e,changed:!1,changedCells:0,removedLength:0,intensity:0}:{state:gt(rt({},e),{hair:n,cutStrokeCount:e.cutStrokeCount+1}),changed:!0,changedCells:o.size,removedLength:s,intensity:Math.min(1,s/Math.max(1,o.size*bt(sa)))}}var Jd=Object.freeze({1:"clipper-guard-1",2:"clipper-guard-2",3:"clipper-guard-3",4:"clipper-guard-4"});function en(e,t){if(!Kr.includes(e))throw new RangeError("unknown guard length");let r=Math.min(1,Math.max(0,Number.isFinite(t)?t:0));return{soundId:Jd[e],gain:.35+r*.65,playbackRate:.92+e*.025+r*.04,hapticMs:r===0?0:Math.round(8+r*18),hapticStrength:r}}var mc=Object.freeze({meaningfulCompletions:2,minActiveMs:6e4});function ga(e){let t=Number.isSafeInteger(e==null?void 0:e.qualified)&&e.qualified>=0?e.qualified:0,r=Number.isFinite(e==null?void 0:e.activeMs)&&e.activeMs>=0?e.activeMs:0;return{qualified:t,activeMs:r}}function Ec(e,t){let r=ga(e),i=Number.isFinite(t)?Math.max(0,Math.min(1e3,t)):0;return gt(rt({},r),{activeMs:r.activeMs+i})}function wc(e,{meaningful:t=!1,freeStyle:r=!1}={}){let i=ga(e);return t?gt(rt({},i),{qualified:i.qualified+1}):i}function Cc(e){let t=ga(e);return t.qualified>=mc.meaningfulCompletions&&t.activeMs>=mc.minActiveMs?{adSession:{qualified:0,activeMs:0},showInterstitial:!0}:{adSession:t,showInterstitial:!1}}function vc(){let e=null,t=null,r=null,i=null,a=!0,n=1,o=1,s=null,l=m=>118-Math.max(0,m)*9;function c(){var A;if(e)return e;let m=(A=globalThis.AudioContext)!=null?A:globalThis.webkitAudioContext;return m?(e=new m,t=e.createGain(),t.gain.value=a?.48*o:0,t.connect(e.destination),e):null}function u(){try{r==null||r.stop()}catch(m){}r==null||r.disconnect(),i==null||i.disconnect(),r=null,i=null}function h(m=n){var f;n=m;let A=c();!A||!a||r||((f=A.resume)==null||f.call(A),r=A.createOscillator(),i=A.createGain(),r.type="sawtooth",r.frequency.value=l(m),i.gain.value=.035,r.connect(i).connect(t),r.start())}function d(m){let A=c();if(!A||!a)return;h(n);let f=A.currentTime;r.frequency.setTargetAtTime((l(n)+4)*m.playbackRate,f,.018),i.gain.cancelScheduledValues(f),i.gain.setValueAtTime(Math.max(.03,i.gain.value),f),i.gain.linearRampToValueAtTime(.055+m.gain*.055,f+.025),i.gain.exponentialRampToValueAtTime(.035,f+.12)}function g(m){var y;let A=c();if(n=m,!A||!a)return;(y=A.resume)==null||y.call(A);let f=A.currentTime;if(!s){s=A.createBuffer(1,Math.round(A.sampleRate*.03),A.sampleRate);let S=s.getChannelData(0);for(let U=0;U<S.length;U++)S[U]=(Math.random()*2-1)*Math.pow(1-U/S.length,3)}let p=A.createBufferSource(),w=A.createBiquadFilter(),C=A.createGain();p.buffer=s,p.playbackRate.value=.9+m*.05,w.type="bandpass",w.frequency.value=3200-m*180,w.Q.value=1.4,C.gain.setValueAtTime(.7,f),C.gain.exponentialRampToValueAtTime(.001,f+.035),p.connect(w).connect(C).connect(t),p.start(f),p.stop(f+.04);let x=A.createOscillator(),T=A.createGain();x.type="sine",x.frequency.setValueAtTime(240,f),x.frequency.exponentialRampToValueAtTime(110,f+.03),T.gain.setValueAtTime(.28,f),T.gain.exponentialRampToValueAtTime(.001,f+.05),x.connect(T).connect(t),x.start(f),x.stop(f+.06),r&&r.frequency.setTargetAtTime(l(m),f+.02,.04)}return{unlock(){var m,A;(A=(m=c())==null?void 0:m.resume)==null||A.call(m)},start:h,stop:u,setGuard(m){n=m,r&&r.frequency.setTargetAtTime(l(m),e.currentTime,.03)},shift:g,cut:d,setEnabled(m){a=!!m,t&&e&&t.gain.setTargetAtTime(a?.48*o:0,e.currentTime,.018),a||u()},setVolume(m){o=Math.max(0,Math.min(1,Number(m)||0)),t&&e&&t.gain.setTargetAtTime(a?.48*o:0,e.currentTime,.018)},destroy(){var m;u(),(m=e==null?void 0:e.close)==null||m.call(e)}}}var Kd=Object.defineProperty,Xd=Object.defineProperties,jd=Object.getOwnPropertyDescriptors,Mc=Object.getOwnPropertySymbols,qd=Object.prototype.hasOwnProperty,Zd=Object.prototype.propertyIsEnumerable,Dc=(e,t,r)=>t in e?Kd(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,Nn=(e,t)=>{for(var r in t||(t={}))qd.call(t,r)&&Dc(e,r,t[r]);if(Mc)for(var r of Mc(t))Zd.call(t,r)&&Dc(e,r,t[r]);return e},dl=(e,t)=>Xd(e,jd(t)),$d=0,Bc=1,ep=2,Nh=1,tp=2,Dr=3,Vr=0,Nt=1,$t=2,Gr=0,ki=1,xc=2,_c=3,Sc=4,rp=5,ii=100,ip=101,ap=102,np=103,sp=104,op=200,lp=201,cp=202,hp=203,fo=204,Ao=205,up=206,dp=207,pp=208,gp=209,fp=210,Ap=211,mp=212,Ep=213,wp=214,mo=0,Eo=1,wo=2,zi=3,Co=4,vo=5,Mo=6,Do=7,pl=0,Cp=1,vp=2,Or=0,Mp=1,Dp=2,Bp=3,Ph=4,xp=5,_p=6,Sp=7,Hh=300,Yi=301,Wi=302,Bo=303,xo=304,Wn=306,Pn=1e3,ni=1001,_o=1002,Kt=1003,yp=1004,tn=1005,or=1006,bs=1007,si=1008,cr=1009,Gh=1010,Oh=1011,Ta=1012,gl=1013,li=1014,pr=1015,Pa=1016,fl=1017,Al=1018,ba=1020,kh=35902,Vh=35899,zh=1021,Yh=1022,lr=1023,Qa=1026,Ua=1027,Jn=1028,ml=1029,Wh=1030,El=1031,wl=1033,Rn=33776,Tn=33777,bn=33778,Qn=33779,So=35840,yo=35841,Io=35842,Ro=35843,To=36196,bo=37492,Qo=37496,Uo=37808,Fo=37809,Lo=37810,No=37811,Po=37812,Ho=37813,Go=37814,Oo=37815,ko=37816,Vo=37817,zo=37818,Yo=37819,Wo=37820,Jo=37821,Ko=36492,Xo=36494,jo=36495,qo=36283,Zo=36284,$o=36285,el=36286,Hn=2300,tl=2301,Qs=2302,yc=2400,Ic=2401,Rc=2402,Ip=3200,Rp=3201,Cl=0,Tp=1,Hr="",Lt="srgb",Ji="srgb-linear",Gn="linear",at="srgb",wi=7680,Tc=519,bp=512,Qp=513,Up=514,Jh=515,Fp=516,Lp=517,Np=518,Pp=519,bc=35044,Qc="300 es",gr=2e3,On=2001,ji=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){let r=this._listeners;return r===void 0?!1:r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){let r=this._listeners;if(r===void 0)return;let i=r[e];if(i!==void 0){let a=i.indexOf(t);a!==-1&&i.splice(a,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let r=t[e.type];if(r!==void 0){e.target=this;let i=r.slice(0);for(let a=0,n=i.length;a<n;a++)i[a].call(this,e);e.target=null}}},St=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Uc=1234567,ya=Math.PI/180,Fa=180/Math.PI;function qi(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(St[e&255]+St[e>>8&255]+St[e>>16&255]+St[e>>24&255]+"-"+St[t&255]+St[t>>8&255]+"-"+St[t>>16&15|64]+St[t>>24&255]+"-"+St[r&63|128]+St[r>>8&255]+"-"+St[r>>16&255]+St[r>>24&255]+St[i&255]+St[i>>8&255]+St[i>>16&255]+St[i>>24&255]).toLowerCase()}function Xe(e,t,r){return Math.max(t,Math.min(r,e))}function vl(e,t){return(e%t+t)%t}function Hp(e,t,r,i,a){return i+(e-t)*(a-i)/(r-t)}function Gp(e,t,r){return e!==t?(r-e)/(t-e):0}function Ia(e,t,r){return(1-r)*e+r*t}function Op(e,t,r,i){return Ia(e,t,1-Math.exp(-r*i))}function kp(e,t=1){return t-Math.abs(vl(e,t*2)-t)}function Vp(e,t,r){return e<=t?0:e>=r?1:(e=(e-t)/(r-t),e*e*(3-2*e))}function zp(e,t,r){return e<=t?0:e>=r?1:(e=(e-t)/(r-t),e*e*e*(e*(e*6-15)+10))}function Yp(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Wp(e,t){return e+Math.random()*(t-e)}function Jp(e){return e*(.5-Math.random())}function Kp(e){e!==void 0&&(Uc=e);let t=Uc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Xp(e){return e*ya}function jp(e){return e*Fa}function qp(e){return(e&e-1)===0&&e!==0}function Zp(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.LN2))}function $p(e){return Math.pow(2,Math.floor(Math.log(e)/Math.LN2))}function eg(e,t,r,i,a){let n=Math.cos,o=Math.sin,s=n(r/2),l=o(r/2),c=n((t+i)/2),u=o((t+i)/2),h=n((t-i)/2),d=o((t-i)/2),g=n((i-t)/2),m=o((i-t)/2);switch(a){case"XYX":e.set(s*u,l*h,l*d,s*c);break;case"YZY":e.set(l*d,s*u,l*h,s*c);break;case"ZXZ":e.set(l*h,l*d,s*u,s*c);break;case"XZX":e.set(s*u,l*m,l*g,s*c);break;case"YXY":e.set(l*g,s*u,l*m,s*c);break;case"ZYZ":e.set(l*m,l*g,s*u,s*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+a)}}function Fi(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("Invalid component type.")}}function Ut(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("Invalid component type.")}}var Fc={DEG2RAD:ya,RAD2DEG:Fa,generateUUID:qi,clamp:Xe,euclideanModulo:vl,mapLinear:Hp,inverseLerp:Gp,lerp:Ia,damp:Op,pingpong:kp,smoothstep:Vp,smootherstep:zp,randInt:Yp,randFloat:Wp,randFloatSpread:Jp,seededRandom:Kp,degToRad:Xp,radToDeg:jp,isPowerOfTwo:qp,ceilPowerOfTwo:Zp,floorPowerOfTwo:$p,setQuaternionFromProperEuler:eg,normalize:Ut,denormalize:Fi},je=class Kh{constructor(t=0,r=0){Kh.prototype.isVector2=!0,this.x=t,this.y=r}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,r){return this.x=t,this.y=r,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,r){switch(t){case 0:this.x=r;break;case 1:this.y=r;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,r){return this.x=t.x+r.x,this.y=t.y+r.y,this}addScaledVector(t,r){return this.x+=t.x*r,this.y+=t.y*r,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,r){return this.x=t.x-r.x,this.y=t.y-r.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let r=this.x,i=this.y,a=t.elements;return this.x=a[0]*r+a[3]*i+a[6],this.y=a[1]*r+a[4]*i+a[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,r){return this.x=Xe(this.x,t.x,r.x),this.y=Xe(this.y,t.y,r.y),this}clampScalar(t,r){return this.x=Xe(this.x,t,r),this.y=Xe(this.y,t,r),this}clampLength(t,r){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Xe(i,t,r))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let r=Math.sqrt(this.lengthSq()*t.lengthSq());if(r===0)return Math.PI/2;let i=this.dot(t)/r;return Math.acos(Xe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let r=this.x-t.x,i=this.y-t.y;return r*r+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,r){return this.x+=(t.x-this.x)*r,this.y+=(t.y-this.y)*r,this}lerpVectors(t,r,i){return this.x=t.x+(r.x-t.x)*i,this.y=t.y+(r.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,r=0){return this.x=t[r],this.y=t[r+1],this}toArray(t=[],r=0){return t[r]=this.x,t[r+1]=this.y,t}fromBufferAttribute(t,r){return this.x=t.getX(r),this.y=t.getY(r),this}rotateAround(t,r){let i=Math.cos(r),a=Math.sin(r),n=this.x-t.x,o=this.y-t.y;return this.x=n*i-o*a+t.x,this.y=n*a+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Zi=class{constructor(e=0,t=0,r=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=i}static slerpFlat(e,t,r,i,a,n,o){let s=r[i+0],l=r[i+1],c=r[i+2],u=r[i+3],h=a[n+0],d=a[n+1],g=a[n+2],m=a[n+3];if(o===0){e[t+0]=s,e[t+1]=l,e[t+2]=c,e[t+3]=u;return}if(o===1){e[t+0]=h,e[t+1]=d,e[t+2]=g,e[t+3]=m;return}if(u!==m||s!==h||l!==d||c!==g){let A=1-o,f=s*h+l*d+c*g+u*m,p=f>=0?1:-1,w=1-f*f;if(w>Number.EPSILON){let x=Math.sqrt(w),T=Math.atan2(x,f*p);A=Math.sin(A*T)/x,o=Math.sin(o*T)/x}let C=o*p;if(s=s*A+h*C,l=l*A+d*C,c=c*A+g*C,u=u*A+m*C,A===1-o){let x=1/Math.sqrt(s*s+l*l+c*c+u*u);s*=x,l*=x,c*=x,u*=x}}e[t]=s,e[t+1]=l,e[t+2]=c,e[t+3]=u}static multiplyQuaternionsFlat(e,t,r,i,a,n){let o=r[i],s=r[i+1],l=r[i+2],c=r[i+3],u=a[n],h=a[n+1],d=a[n+2],g=a[n+3];return e[t]=o*g+c*u+s*d-l*h,e[t+1]=s*g+c*h+l*u-o*d,e[t+2]=l*g+c*d+o*h-s*u,e[t+3]=c*g-o*u-s*h-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,i){return this._x=e,this._y=t,this._z=r,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let r=e._x,i=e._y,a=e._z,n=e._order,o=Math.cos,s=Math.sin,l=o(r/2),c=o(i/2),u=o(a/2),h=s(r/2),d=s(i/2),g=s(a/2);switch(n){case"XYZ":this._x=h*c*u+l*d*g,this._y=l*d*u-h*c*g,this._z=l*c*g+h*d*u,this._w=l*c*u-h*d*g;break;case"YXZ":this._x=h*c*u+l*d*g,this._y=l*d*u-h*c*g,this._z=l*c*g-h*d*u,this._w=l*c*u+h*d*g;break;case"ZXY":this._x=h*c*u-l*d*g,this._y=l*d*u+h*c*g,this._z=l*c*g+h*d*u,this._w=l*c*u-h*d*g;break;case"ZYX":this._x=h*c*u-l*d*g,this._y=l*d*u+h*c*g,this._z=l*c*g-h*d*u,this._w=l*c*u+h*d*g;break;case"YZX":this._x=h*c*u+l*d*g,this._y=l*d*u+h*c*g,this._z=l*c*g-h*d*u,this._w=l*c*u-h*d*g;break;case"XZY":this._x=h*c*u-l*d*g,this._y=l*d*u-h*c*g,this._z=l*c*g+h*d*u,this._w=l*c*u+h*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+n)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let r=t/2,i=Math.sin(r);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,r=t[0],i=t[4],a=t[8],n=t[1],o=t[5],s=t[9],l=t[2],c=t[6],u=t[10],h=r+o+u;if(h>0){let d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(c-s)*d,this._y=(a-l)*d,this._z=(n-i)*d}else if(r>o&&r>u){let d=2*Math.sqrt(1+r-o-u);this._w=(c-s)/d,this._x=.25*d,this._y=(i+n)/d,this._z=(a+l)/d}else if(o>u){let d=2*Math.sqrt(1+o-r-u);this._w=(a-l)/d,this._x=(i+n)/d,this._y=.25*d,this._z=(s+c)/d}else{let d=2*Math.sqrt(1+u-r-o);this._w=(n-i)/d,this._x=(a+l)/d,this._y=(s+c)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<1e-8?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){let r=this.angleTo(e);if(r===0)return this;let i=Math.min(1,t/r);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let r=e._x,i=e._y,a=e._z,n=e._w,o=t._x,s=t._y,l=t._z,c=t._w;return this._x=r*c+n*o+i*l-a*s,this._y=i*c+n*s+a*o-r*l,this._z=a*c+n*l+r*s-i*o,this._w=n*c-r*o-i*s-a*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let r=this._x,i=this._y,a=this._z,n=this._w,o=n*e._w+r*e._x+i*e._y+a*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=n,this._x=r,this._y=i,this._z=a,this;let s=1-o*o;if(s<=Number.EPSILON){let d=1-t;return this._w=d*n+t*this._w,this._x=d*r+t*this._x,this._y=d*i+t*this._y,this._z=d*a+t*this._z,this.normalize(),this}let l=Math.sqrt(s),c=Math.atan2(l,o),u=Math.sin((1-t)*c)/l,h=Math.sin(t*c)/l;return this._w=n*u+this._w*h,this._x=r*u+this._x*h,this._y=i*u+this._y*h,this._z=a*u+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),i=Math.sqrt(1-r),a=Math.sqrt(r);return this.set(i*Math.sin(e),i*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},b=class Xh{constructor(t=0,r=0,i=0){Xh.prototype.isVector3=!0,this.x=t,this.y=r,this.z=i}set(t,r,i){return i===void 0&&(i=this.z),this.x=t,this.y=r,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,r){switch(t){case 0:this.x=r;break;case 1:this.y=r;break;case 2:this.z=r;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,r){return this.x=t.x+r.x,this.y=t.y+r.y,this.z=t.z+r.z,this}addScaledVector(t,r){return this.x+=t.x*r,this.y+=t.y*r,this.z+=t.z*r,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,r){return this.x=t.x-r.x,this.y=t.y-r.y,this.z=t.z-r.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,r){return this.x=t.x*r.x,this.y=t.y*r.y,this.z=t.z*r.z,this}applyEuler(t){return this.applyQuaternion(Lc.setFromEuler(t))}applyAxisAngle(t,r){return this.applyQuaternion(Lc.setFromAxisAngle(t,r))}applyMatrix3(t){let r=this.x,i=this.y,a=this.z,n=t.elements;return this.x=n[0]*r+n[3]*i+n[6]*a,this.y=n[1]*r+n[4]*i+n[7]*a,this.z=n[2]*r+n[5]*i+n[8]*a,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let r=this.x,i=this.y,a=this.z,n=t.elements,o=1/(n[3]*r+n[7]*i+n[11]*a+n[15]);return this.x=(n[0]*r+n[4]*i+n[8]*a+n[12])*o,this.y=(n[1]*r+n[5]*i+n[9]*a+n[13])*o,this.z=(n[2]*r+n[6]*i+n[10]*a+n[14])*o,this}applyQuaternion(t){let r=this.x,i=this.y,a=this.z,n=t.x,o=t.y,s=t.z,l=t.w,c=2*(o*a-s*i),u=2*(s*r-n*a),h=2*(n*i-o*r);return this.x=r+l*c+o*h-s*u,this.y=i+l*u+s*c-n*h,this.z=a+l*h+n*u-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let r=this.x,i=this.y,a=this.z,n=t.elements;return this.x=n[0]*r+n[4]*i+n[8]*a,this.y=n[1]*r+n[5]*i+n[9]*a,this.z=n[2]*r+n[6]*i+n[10]*a,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,r){return this.x=Xe(this.x,t.x,r.x),this.y=Xe(this.y,t.y,r.y),this.z=Xe(this.z,t.z,r.z),this}clampScalar(t,r){return this.x=Xe(this.x,t,r),this.y=Xe(this.y,t,r),this.z=Xe(this.z,t,r),this}clampLength(t,r){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Xe(i,t,r))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,r){return this.x+=(t.x-this.x)*r,this.y+=(t.y-this.y)*r,this.z+=(t.z-this.z)*r,this}lerpVectors(t,r,i){return this.x=t.x+(r.x-t.x)*i,this.y=t.y+(r.y-t.y)*i,this.z=t.z+(r.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,r){let i=t.x,a=t.y,n=t.z,o=r.x,s=r.y,l=r.z;return this.x=a*l-n*s,this.y=n*o-i*l,this.z=i*s-a*o,this}projectOnVector(t){let r=t.lengthSq();if(r===0)return this.set(0,0,0);let i=t.dot(this)/r;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Us.copy(this).projectOnVector(t),this.sub(Us)}reflect(t){return this.sub(Us.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let r=Math.sqrt(this.lengthSq()*t.lengthSq());if(r===0)return Math.PI/2;let i=this.dot(t)/r;return Math.acos(Xe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let r=this.x-t.x,i=this.y-t.y,a=this.z-t.z;return r*r+i*i+a*a}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,r,i){let a=Math.sin(r)*t;return this.x=a*Math.sin(i),this.y=Math.cos(r)*t,this.z=a*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,r,i){return this.x=t*Math.sin(r),this.y=i,this.z=t*Math.cos(r),this}setFromMatrixPosition(t){let r=t.elements;return this.x=r[12],this.y=r[13],this.z=r[14],this}setFromMatrixScale(t){let r=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),a=this.setFromMatrixColumn(t,2).length();return this.x=r,this.y=i,this.z=a,this}setFromMatrixColumn(t,r){return this.fromArray(t.elements,r*4)}setFromMatrix3Column(t,r){return this.fromArray(t.elements,r*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,r=0){return this.x=t[r],this.y=t[r+1],this.z=t[r+2],this}toArray(t=[],r=0){return t[r]=this.x,t[r+1]=this.y,t[r+2]=this.z,t}fromBufferAttribute(t,r){return this.x=t.getX(r),this.y=t.getY(r),this.z=t.getZ(r),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,r=Math.random()*2-1,i=Math.sqrt(1-r*r);return this.x=i*Math.cos(t),this.y=r,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Us=new b,Lc=new Zi,Je=class jh{constructor(t,r,i,a,n,o,s,l,c){jh.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,r,i,a,n,o,s,l,c)}set(t,r,i,a,n,o,s,l,c){let u=this.elements;return u[0]=t,u[1]=a,u[2]=s,u[3]=r,u[4]=n,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let r=this.elements,i=t.elements;return r[0]=i[0],r[1]=i[1],r[2]=i[2],r[3]=i[3],r[4]=i[4],r[5]=i[5],r[6]=i[6],r[7]=i[7],r[8]=i[8],this}extractBasis(t,r,i){return t.setFromMatrix3Column(this,0),r.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let r=t.elements;return this.set(r[0],r[4],r[8],r[1],r[5],r[9],r[2],r[6],r[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,r){let i=t.elements,a=r.elements,n=this.elements,o=i[0],s=i[3],l=i[6],c=i[1],u=i[4],h=i[7],d=i[2],g=i[5],m=i[8],A=a[0],f=a[3],p=a[6],w=a[1],C=a[4],x=a[7],T=a[2],y=a[5],S=a[8];return n[0]=o*A+s*w+l*T,n[3]=o*f+s*C+l*y,n[6]=o*p+s*x+l*S,n[1]=c*A+u*w+h*T,n[4]=c*f+u*C+h*y,n[7]=c*p+u*x+h*S,n[2]=d*A+g*w+m*T,n[5]=d*f+g*C+m*y,n[8]=d*p+g*x+m*S,this}multiplyScalar(t){let r=this.elements;return r[0]*=t,r[3]*=t,r[6]*=t,r[1]*=t,r[4]*=t,r[7]*=t,r[2]*=t,r[5]*=t,r[8]*=t,this}determinant(){let t=this.elements,r=t[0],i=t[1],a=t[2],n=t[3],o=t[4],s=t[5],l=t[6],c=t[7],u=t[8];return r*o*u-r*s*c-i*n*u+i*s*l+a*n*c-a*o*l}invert(){let t=this.elements,r=t[0],i=t[1],a=t[2],n=t[3],o=t[4],s=t[5],l=t[6],c=t[7],u=t[8],h=u*o-s*c,d=s*l-u*n,g=c*n-o*l,m=r*h+i*d+a*g;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let A=1/m;return t[0]=h*A,t[1]=(a*c-u*i)*A,t[2]=(s*i-a*o)*A,t[3]=d*A,t[4]=(u*r-a*l)*A,t[5]=(a*n-s*r)*A,t[6]=g*A,t[7]=(i*l-c*r)*A,t[8]=(o*r-i*n)*A,this}transpose(){let t,r=this.elements;return t=r[1],r[1]=r[3],r[3]=t,t=r[2],r[2]=r[6],r[6]=t,t=r[5],r[5]=r[7],r[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let r=this.elements;return t[0]=r[0],t[1]=r[3],t[2]=r[6],t[3]=r[1],t[4]=r[4],t[5]=r[7],t[6]=r[2],t[7]=r[5],t[8]=r[8],this}setUvTransform(t,r,i,a,n,o,s){let l=Math.cos(n),c=Math.sin(n);return this.set(i*l,i*c,-i*(l*o+c*s)+o+t,-a*c,a*l,-a*(-c*o+l*s)+s+r,0,0,1),this}scale(t,r){return this.premultiply(Fs.makeScale(t,r)),this}rotate(t){return this.premultiply(Fs.makeRotation(-t)),this}translate(t,r){return this.premultiply(Fs.makeTranslation(t,r)),this}makeTranslation(t,r){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,r,0,0,1),this}makeRotation(t){let r=Math.cos(t),i=Math.sin(t);return this.set(r,-i,0,i,r,0,0,0,1),this}makeScale(t,r){return this.set(t,0,0,0,r,0,0,0,1),this}equals(t){let r=this.elements,i=t.elements;for(let a=0;a<9;a++)if(r[a]!==i[a])return!1;return!0}fromArray(t,r=0){for(let i=0;i<9;i++)this.elements[i]=t[i+r];return this}toArray(t=[],r=0){let i=this.elements;return t[r]=i[0],t[r+1]=i[1],t[r+2]=i[2],t[r+3]=i[3],t[r+4]=i[4],t[r+5]=i[5],t[r+6]=i[6],t[r+7]=i[7],t[r+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Fs=new Je;function qh(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function kn(e){return document.createElementNS("http:\x2f\x2fwww.w3.org/1999/xhtml",e)}function tg(){let e=kn("canvas");return e.style.display="block",e}var Nc={};function La(e){e in Nc||(Nc[e]=!0,console.warn(e))}function rg(e,t,r){return new Promise(function(i,a){function n(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:a();break;case e.TIMEOUT_EXPIRED:setTimeout(n,r);break;default:i()}}setTimeout(n,r)})}var Pc=new Je().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Hc=new Je().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ig(){let e={enabled:!0,workingColorSpace:Ji,spaces:{},convert:function(a,n,o){return this.enabled===!1||n===o||!n||!o||(this.spaces[n].transfer===at&&(a.r=_r(a.r),a.g=_r(a.g),a.b=_r(a.b)),this.spaces[n].primaries!==this.spaces[o].primaries&&(a.applyMatrix3(this.spaces[n].toXYZ),a.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===at&&(a.r=Vi(a.r),a.g=Vi(a.g),a.b=Vi(a.b))),a},workingToColorSpace:function(a,n){return this.convert(a,this.workingColorSpace,n)},colorSpaceToWorking:function(a,n){return this.convert(a,n,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===Hr?Gn:this.spaces[a].transfer},getToneMappingMode:function(a){return this.spaces[a].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(a,n=this.workingColorSpace){return a.fromArray(this.spaces[n].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,n,o){return a.copy(this.spaces[n].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(a,n){return La("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(a,n)},toWorkingColorSpace:function(a,n){return La("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(a,n)}},t=[.64,.33,.3,.6,.15,.06],r=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[Ji]:{primaries:t,whitePoint:i,transfer:Gn,toXYZ:Pc,fromXYZ:Hc,luminanceCoefficients:r,workingColorSpaceConfig:{unpackColorSpace:Lt},outputColorSpaceConfig:{drawingBufferColorSpace:Lt}},[Lt]:{primaries:t,whitePoint:i,transfer:at,toXYZ:Pc,fromXYZ:Hc,luminanceCoefficients:r,outputColorSpaceConfig:{drawingBufferColorSpace:Lt}}}),e}var tt=ig();function _r(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function Vi(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var Ci,ag=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement=="undefined")return e.src;let r;if(e instanceof HTMLCanvasElement)r=e;else{Ci===void 0&&(Ci=kn("canvas")),Ci.width=e.width,Ci.height=e.height;let i=Ci.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),r=Ci}return r.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement!="undefined"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&e instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&e instanceof ImageBitmap){let t=kn("canvas");t.width=e.width,t.height=e.height;let r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);let i=r.getImageData(0,0,e.width,e.height),a=i.data;for(let n=0;n<a.length;n++)a[n]=_r(a[n]/255)*255;return r.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor(_r(t[r]/255)*255):t[r]=_r(t[r]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ng=0,Ml=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ng++}),this.uuid=qi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement!="undefined"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let r={uuid:this.uuid,url:""},i=this.data;if(i!==null){let a;if(Array.isArray(i)){a=[];for(let n=0,o=i.length;n<o;n++)i[n].isDataTexture?a.push(Ls(i[n].image)):a.push(Ls(i[n]))}else a=Ls(i);r.url=a}return t||(e.images[this.uuid]=r),r}};function Ls(e){return typeof HTMLImageElement!="undefined"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&e instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&e instanceof ImageBitmap?ag.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var sg=0,Ns=new b,er=class Un extends ji{constructor(t=Un.DEFAULT_IMAGE,r=Un.DEFAULT_MAPPING,i=ni,a=ni,n=or,o=si,s=lr,l=cr,c=Un.DEFAULT_ANISOTROPY,u=Hr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:sg++}),this.uuid=qi(),this.name="",this.source=new Ml(t),this.mipmaps=[],this.mapping=r,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=n,this.minFilter=o,this.anisotropy=c,this.format=s,this.internalFormat=null,this.type=l,this.offset=new je(0,0),this.repeat=new je(1,1),this.center=new je(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Ns).x}get height(){return this.source.getSize(Ns).y}get depth(){return this.source.getSize(Ns).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,r){this.updateRanges.push({start:t,count:r})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let r in t){let i=t[r];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${r}' has value of undefined.`);continue}let a=this[r];if(a===void 0){console.warn(`THREE.Texture.setValues(): property '${r}' does not exist.`);continue}a&&i&&a.isVector2&&i.isVector2||a&&i&&a.isVector3&&i.isVector3||a&&i&&a.isMatrix3&&i.isMatrix3?a.copy(i):this[r]=i}}toJSON(t){let r=t===void 0||typeof t=="string";if(!r&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),r||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Hh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Pn:t.x=t.x-Math.floor(t.x);break;case ni:t.x=t.x<0?0:1;break;case _o:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Pn:t.y=t.y-Math.floor(t.y);break;case ni:t.y=t.y<0?0:1;break;case _o:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};er.DEFAULT_IMAGE=null;er.DEFAULT_MAPPING=Hh;er.DEFAULT_ANISOTROPY=1;var lt=class Zh{constructor(t=0,r=0,i=0,a=1){Zh.prototype.isVector4=!0,this.x=t,this.y=r,this.z=i,this.w=a}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,r,i,a){return this.x=t,this.y=r,this.z=i,this.w=a,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,r){switch(t){case 0:this.x=r;break;case 1:this.y=r;break;case 2:this.z=r;break;case 3:this.w=r;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,r){return this.x=t.x+r.x,this.y=t.y+r.y,this.z=t.z+r.z,this.w=t.w+r.w,this}addScaledVector(t,r){return this.x+=t.x*r,this.y+=t.y*r,this.z+=t.z*r,this.w+=t.w*r,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,r){return this.x=t.x-r.x,this.y=t.y-r.y,this.z=t.z-r.z,this.w=t.w-r.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let r=this.x,i=this.y,a=this.z,n=this.w,o=t.elements;return this.x=o[0]*r+o[4]*i+o[8]*a+o[12]*n,this.y=o[1]*r+o[5]*i+o[9]*a+o[13]*n,this.z=o[2]*r+o[6]*i+o[10]*a+o[14]*n,this.w=o[3]*r+o[7]*i+o[11]*a+o[15]*n,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let r=Math.sqrt(1-t.w*t.w);return r<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/r,this.y=t.y/r,this.z=t.z/r),this}setAxisAngleFromRotationMatrix(t){let r,i,a,n,o=t.elements,s=o[0],l=o[4],c=o[8],u=o[1],h=o[5],d=o[9],g=o[2],m=o[6],A=o[10];if(Math.abs(l-u)<.01&&Math.abs(c-g)<.01&&Math.abs(d-m)<.01){if(Math.abs(l+u)<.1&&Math.abs(c+g)<.1&&Math.abs(d+m)<.1&&Math.abs(s+h+A-3)<.1)return this.set(1,0,0,0),this;r=Math.PI;let p=(s+1)/2,w=(h+1)/2,C=(A+1)/2,x=(l+u)/4,T=(c+g)/4,y=(d+m)/4;return p>w&&p>C?p<.01?(i=0,a=.707106781,n=.707106781):(i=Math.sqrt(p),a=x/i,n=T/i):w>C?w<.01?(i=.707106781,a=0,n=.707106781):(a=Math.sqrt(w),i=x/a,n=y/a):C<.01?(i=.707106781,a=.707106781,n=0):(n=Math.sqrt(C),i=T/n,a=y/n),this.set(i,a,n,r),this}let f=Math.sqrt((m-d)*(m-d)+(c-g)*(c-g)+(u-l)*(u-l));return Math.abs(f)<.001&&(f=1),this.x=(m-d)/f,this.y=(c-g)/f,this.z=(u-l)/f,this.w=Math.acos((s+h+A-1)/2),this}setFromMatrixPosition(t){let r=t.elements;return this.x=r[12],this.y=r[13],this.z=r[14],this.w=r[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,r){return this.x=Xe(this.x,t.x,r.x),this.y=Xe(this.y,t.y,r.y),this.z=Xe(this.z,t.z,r.z),this.w=Xe(this.w,t.w,r.w),this}clampScalar(t,r){return this.x=Xe(this.x,t,r),this.y=Xe(this.y,t,r),this.z=Xe(this.z,t,r),this.w=Xe(this.w,t,r),this}clampLength(t,r){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Xe(i,t,r))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,r){return this.x+=(t.x-this.x)*r,this.y+=(t.y-this.y)*r,this.z+=(t.z-this.z)*r,this.w+=(t.w-this.w)*r,this}lerpVectors(t,r,i){return this.x=t.x+(r.x-t.x)*i,this.y=t.y+(r.y-t.y)*i,this.z=t.z+(r.z-t.z)*i,this.w=t.w+(r.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,r=0){return this.x=t[r],this.y=t[r+1],this.z=t[r+2],this.w=t[r+3],this}toArray(t=[],r=0){return t[r]=this.x,t[r+1]=this.y,t[r+2]=this.z,t[r+3]=this.w,t}fromBufferAttribute(t,r){return this.x=t.getX(r),this.y=t.getY(r),this.z=t.getZ(r),this.w=t.getW(r),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},og=class extends ji{constructor(e=1,t=1,r={}){super(),r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:or,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},r),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=r.depth,this.scissor=new lt(0,0,e,t),this.scissorTest=!1,this.viewport=new lt(0,0,e,t);let i={width:e,height:t,depth:r.depth},a=new er(i);this.textures=[];let n=r.count;for(let o=0;o<n;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(r),this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples,this.multiview=r.multiview}_setTextureOptions(e={}){let t={minFilter:or,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let r=0;r<this.textures.length;r++)this.textures[r].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let i=0,a=this.textures.length;i<a;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=r,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,r=e.textures.length;t<r;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Ml(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},zr=class extends og{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}},$h=class extends er{constructor(e=null,t=1,r=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:i},this.magFilter=Kt,this.minFilter=Kt,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},lg=class extends er{constructor(e=null,t=1,r=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:i},this.magFilter=Kt,this.minFilter=Kt,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ci=class{constructor(e=new b(1/0,1/0,1/0),t=new b(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(ar.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(ar.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let r=ar.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let r=e.geometry;if(r!==void 0){let a=r.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let n=0,o=a.count;n<o;n++)e.isMesh===!0?e.getVertexPosition(n,ar):ar.fromBufferAttribute(a,n),ar.applyMatrix4(e.matrixWorld),this.expandByPoint(ar);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),rn.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),rn.copy(r.boundingBox)),rn.applyMatrix4(e.matrixWorld),this.union(rn)}let i=e.children;for(let a=0,n=i.length;a<n;a++)this.expandByObject(i[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ar),ar.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(fa),an.subVectors(this.max,fa),vi.subVectors(e.a,fa),Mi.subVectors(e.b,fa),Di.subVectors(e.c,fa),br.subVectors(Mi,vi),Qr.subVectors(Di,Mi),jr.subVectors(vi,Di);let t=[0,-br.z,br.y,0,-Qr.z,Qr.y,0,-jr.z,jr.y,br.z,0,-br.x,Qr.z,0,-Qr.x,jr.z,0,-jr.x,-br.y,br.x,0,-Qr.y,Qr.x,0,-jr.y,jr.x,0];return!Ps(t,vi,Mi,Di,an)||(t=[1,0,0,0,1,0,0,0,1],!Ps(t,vi,Mi,Di,an))?!1:(nn.crossVectors(br,Qr),t=[nn.x,nn.y,nn.z],Ps(t,vi,Mi,Di,an))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ar).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ar).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Er[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Er[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Er[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Er[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Er[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Er[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Er[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Er[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Er),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Er=[new b,new b,new b,new b,new b,new b,new b,new b],ar=new b,rn=new ci,vi=new b,Mi=new b,Di=new b,br=new b,Qr=new b,jr=new b,fa=new b,an=new b,nn=new b,qr=new b;function Ps(e,t,r,i,a){for(let n=0,o=e.length-3;n<=o;n+=3){qr.fromArray(e,n);let s=a.x*Math.abs(qr.x)+a.y*Math.abs(qr.y)+a.z*Math.abs(qr.z),l=t.dot(qr),c=r.dot(qr),u=i.dot(qr);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>s)return!1}return!0}var cg=new ci,Aa=new b,Hs=new b,hi=class{constructor(e=new b,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let r=this.center;t!==void 0?r.copy(t):cg.setFromPoints(e).getCenter(r);let i=0;for(let a=0,n=e.length;a<n;a++)i=Math.max(i,r.distanceToSquared(e[a]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Aa.subVectors(e,this.center);let t=Aa.lengthSq();if(t>this.radius*this.radius){let r=Math.sqrt(t),i=(r-this.radius)*.5;this.center.addScaledVector(Aa,i/r),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Hs.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Aa.copy(e.center).add(Hs)),this.expandByPoint(Aa.copy(e.center).sub(Hs))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},wr=new b,Gs=new b,sn=new b,Ur=new b,Os=new b,on=new b,ks=new b,Kn=class{constructor(e=new b,t=new b(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,wr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=wr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(wr.copy(this.origin).addScaledVector(this.direction,t),wr.distanceToSquared(e))}distanceSqToSegment(e,t,r,i){Gs.copy(e).add(t).multiplyScalar(.5),sn.copy(t).sub(e).normalize(),Ur.copy(this.origin).sub(Gs);let a=e.distanceTo(t)*.5,n=-this.direction.dot(sn),o=Ur.dot(this.direction),s=-Ur.dot(sn),l=Ur.lengthSq(),c=Math.abs(1-n*n),u,h,d,g;if(c>0)if(u=n*s-o,h=n*o-s,g=a*c,u>=0)if(h>=-g)if(h<=g){let m=1/c;u*=m,h*=m,d=u*(u+n*h+2*o)+h*(n*u+h+2*s)+l}else h=a,u=Math.max(0,-(n*h+o)),d=-u*u+h*(h+2*s)+l;else h=-a,u=Math.max(0,-(n*h+o)),d=-u*u+h*(h+2*s)+l;else h<=-g?(u=Math.max(0,-(-n*a+o)),h=u>0?-a:Math.min(Math.max(-a,-s),a),d=-u*u+h*(h+2*s)+l):h<=g?(u=0,h=Math.min(Math.max(-a,-s),a),d=h*(h+2*s)+l):(u=Math.max(0,-(n*a+o)),h=u>0?a:Math.min(Math.max(-a,-s),a),d=-u*u+h*(h+2*s)+l);else h=n>0?-a:a,u=Math.max(0,-(n*h+o)),d=-u*u+h*(h+2*s)+l;return r&&r.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Gs).addScaledVector(sn,h),d}intersectSphere(e,t){wr.subVectors(e.center,this.origin);let r=wr.dot(this.direction),i=wr.dot(wr)-r*r,a=e.radius*e.radius;if(i>a)return null;let n=Math.sqrt(a-i),o=r-n,s=r+n;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){let r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,i,a,n,o,s,l=1/this.direction.x,c=1/this.direction.y,u=1/this.direction.z,h=this.origin;return l>=0?(r=(e.min.x-h.x)*l,i=(e.max.x-h.x)*l):(r=(e.max.x-h.x)*l,i=(e.min.x-h.x)*l),c>=0?(a=(e.min.y-h.y)*c,n=(e.max.y-h.y)*c):(a=(e.max.y-h.y)*c,n=(e.min.y-h.y)*c),r>n||a>i||((a>r||isNaN(r))&&(r=a),(n<i||isNaN(i))&&(i=n),u>=0?(o=(e.min.z-h.z)*u,s=(e.max.z-h.z)*u):(o=(e.max.z-h.z)*u,s=(e.min.z-h.z)*u),r>s||o>i)||((o>r||r!==r)&&(r=o),(s<i||i!==i)&&(i=s),i<0)?null:this.at(r>=0?r:i,t)}intersectsBox(e){return this.intersectBox(e,wr)!==null}intersectTriangle(e,t,r,i,a){Os.subVectors(t,e),on.subVectors(r,e),ks.crossVectors(Os,on);let n=this.direction.dot(ks),o;if(n>0){if(i)return null;o=1}else if(n<0)o=-1,n=-n;else return null;Ur.subVectors(this.origin,e);let s=o*this.direction.dot(on.crossVectors(Ur,on));if(s<0)return null;let l=o*this.direction.dot(Os.cross(Ur));if(l<0||s+l>n)return null;let c=-o*Ur.dot(ks);return c<0?null:this.at(c/n,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},nt=class rl{constructor(t,r,i,a,n,o,s,l,c,u,h,d,g,m,A,f){rl.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,r,i,a,n,o,s,l,c,u,h,d,g,m,A,f)}set(t,r,i,a,n,o,s,l,c,u,h,d,g,m,A,f){let p=this.elements;return p[0]=t,p[4]=r,p[8]=i,p[12]=a,p[1]=n,p[5]=o,p[9]=s,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=g,p[7]=m,p[11]=A,p[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new rl().fromArray(this.elements)}copy(t){let r=this.elements,i=t.elements;return r[0]=i[0],r[1]=i[1],r[2]=i[2],r[3]=i[3],r[4]=i[4],r[5]=i[5],r[6]=i[6],r[7]=i[7],r[8]=i[8],r[9]=i[9],r[10]=i[10],r[11]=i[11],r[12]=i[12],r[13]=i[13],r[14]=i[14],r[15]=i[15],this}copyPosition(t){let r=this.elements,i=t.elements;return r[12]=i[12],r[13]=i[13],r[14]=i[14],this}setFromMatrix3(t){let r=t.elements;return this.set(r[0],r[3],r[6],0,r[1],r[4],r[7],0,r[2],r[5],r[8],0,0,0,0,1),this}extractBasis(t,r,i){return t.setFromMatrixColumn(this,0),r.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,r,i){return this.set(t.x,r.x,i.x,0,t.y,r.y,i.y,0,t.z,r.z,i.z,0,0,0,0,1),this}extractRotation(t){let r=this.elements,i=t.elements,a=1/Bi.setFromMatrixColumn(t,0).length(),n=1/Bi.setFromMatrixColumn(t,1).length(),o=1/Bi.setFromMatrixColumn(t,2).length();return r[0]=i[0]*a,r[1]=i[1]*a,r[2]=i[2]*a,r[3]=0,r[4]=i[4]*n,r[5]=i[5]*n,r[6]=i[6]*n,r[7]=0,r[8]=i[8]*o,r[9]=i[9]*o,r[10]=i[10]*o,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,this}makeRotationFromEuler(t){let r=this.elements,i=t.x,a=t.y,n=t.z,o=Math.cos(i),s=Math.sin(i),l=Math.cos(a),c=Math.sin(a),u=Math.cos(n),h=Math.sin(n);if(t.order==="XYZ"){let d=o*u,g=o*h,m=s*u,A=s*h;r[0]=l*u,r[4]=-l*h,r[8]=c,r[1]=g+m*c,r[5]=d-A*c,r[9]=-s*l,r[2]=A-d*c,r[6]=m+g*c,r[10]=o*l}else if(t.order==="YXZ"){let d=l*u,g=l*h,m=c*u,A=c*h;r[0]=d+A*s,r[4]=m*s-g,r[8]=o*c,r[1]=o*h,r[5]=o*u,r[9]=-s,r[2]=g*s-m,r[6]=A+d*s,r[10]=o*l}else if(t.order==="ZXY"){let d=l*u,g=l*h,m=c*u,A=c*h;r[0]=d-A*s,r[4]=-o*h,r[8]=m+g*s,r[1]=g+m*s,r[5]=o*u,r[9]=A-d*s,r[2]=-o*c,r[6]=s,r[10]=o*l}else if(t.order==="ZYX"){let d=o*u,g=o*h,m=s*u,A=s*h;r[0]=l*u,r[4]=m*c-g,r[8]=d*c+A,r[1]=l*h,r[5]=A*c+d,r[9]=g*c-m,r[2]=-c,r[6]=s*l,r[10]=o*l}else if(t.order==="YZX"){let d=o*l,g=o*c,m=s*l,A=s*c;r[0]=l*u,r[4]=A-d*h,r[8]=m*h+g,r[1]=h,r[5]=o*u,r[9]=-s*u,r[2]=-c*u,r[6]=g*h+m,r[10]=d-A*h}else if(t.order==="XZY"){let d=o*l,g=o*c,m=s*l,A=s*c;r[0]=l*u,r[4]=-h,r[8]=c*u,r[1]=d*h+A,r[5]=o*u,r[9]=g*h-m,r[2]=m*h-g,r[6]=s*u,r[10]=A*h+d}return r[3]=0,r[7]=0,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,this}makeRotationFromQuaternion(t){return this.compose(hg,t,ug)}lookAt(t,r,i){let a=this.elements;return Vt.subVectors(t,r),Vt.lengthSq()===0&&(Vt.z=1),Vt.normalize(),Fr.crossVectors(i,Vt),Fr.lengthSq()===0&&(Math.abs(i.z)===1?Vt.x+=1e-4:Vt.z+=1e-4,Vt.normalize(),Fr.crossVectors(i,Vt)),Fr.normalize(),ln.crossVectors(Vt,Fr),a[0]=Fr.x,a[4]=ln.x,a[8]=Vt.x,a[1]=Fr.y,a[5]=ln.y,a[9]=Vt.y,a[2]=Fr.z,a[6]=ln.z,a[10]=Vt.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,r){let i=t.elements,a=r.elements,n=this.elements,o=i[0],s=i[4],l=i[8],c=i[12],u=i[1],h=i[5],d=i[9],g=i[13],m=i[2],A=i[6],f=i[10],p=i[14],w=i[3],C=i[7],x=i[11],T=i[15],y=a[0],S=a[4],U=a[8],D=a[12],M=a[1],I=a[5],H=a[9],k=a[13],G=a[2],Z=a[6],V=a[10],$=a[14],J=a[3],te=a[7],Ae=a[11],Ue=a[15];return n[0]=o*y+s*M+l*G+c*J,n[4]=o*S+s*I+l*Z+c*te,n[8]=o*U+s*H+l*V+c*Ae,n[12]=o*D+s*k+l*$+c*Ue,n[1]=u*y+h*M+d*G+g*J,n[5]=u*S+h*I+d*Z+g*te,n[9]=u*U+h*H+d*V+g*Ae,n[13]=u*D+h*k+d*$+g*Ue,n[2]=m*y+A*M+f*G+p*J,n[6]=m*S+A*I+f*Z+p*te,n[10]=m*U+A*H+f*V+p*Ae,n[14]=m*D+A*k+f*$+p*Ue,n[3]=w*y+C*M+x*G+T*J,n[7]=w*S+C*I+x*Z+T*te,n[11]=w*U+C*H+x*V+T*Ae,n[15]=w*D+C*k+x*$+T*Ue,this}multiplyScalar(t){let r=this.elements;return r[0]*=t,r[4]*=t,r[8]*=t,r[12]*=t,r[1]*=t,r[5]*=t,r[9]*=t,r[13]*=t,r[2]*=t,r[6]*=t,r[10]*=t,r[14]*=t,r[3]*=t,r[7]*=t,r[11]*=t,r[15]*=t,this}determinant(){let t=this.elements,r=t[0],i=t[4],a=t[8],n=t[12],o=t[1],s=t[5],l=t[9],c=t[13],u=t[2],h=t[6],d=t[10],g=t[14],m=t[3],A=t[7],f=t[11],p=t[15];return m*(+n*l*h-a*c*h-n*s*d+i*c*d+a*s*g-i*l*g)+A*(+r*l*g-r*c*d+n*o*d-a*o*g+a*c*u-n*l*u)+f*(+r*c*h-r*s*g-n*o*h+i*o*g+n*s*u-i*c*u)+p*(-a*s*u-r*l*h+r*s*d+a*o*h-i*o*d+i*l*u)}transpose(){let t=this.elements,r;return r=t[1],t[1]=t[4],t[4]=r,r=t[2],t[2]=t[8],t[8]=r,r=t[6],t[6]=t[9],t[9]=r,r=t[3],t[3]=t[12],t[12]=r,r=t[7],t[7]=t[13],t[13]=r,r=t[11],t[11]=t[14],t[14]=r,this}setPosition(t,r,i){let a=this.elements;return t.isVector3?(a[12]=t.x,a[13]=t.y,a[14]=t.z):(a[12]=t,a[13]=r,a[14]=i),this}invert(){let t=this.elements,r=t[0],i=t[1],a=t[2],n=t[3],o=t[4],s=t[5],l=t[6],c=t[7],u=t[8],h=t[9],d=t[10],g=t[11],m=t[12],A=t[13],f=t[14],p=t[15],w=h*f*c-A*d*c+A*l*g-s*f*g-h*l*p+s*d*p,C=m*d*c-u*f*c-m*l*g+o*f*g+u*l*p-o*d*p,x=u*A*c-m*h*c+m*s*g-o*A*g-u*s*p+o*h*p,T=m*h*l-u*A*l-m*s*d+o*A*d+u*s*f-o*h*f,y=r*w+i*C+a*x+n*T;if(y===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/y;return t[0]=w*S,t[1]=(A*d*n-h*f*n-A*a*g+i*f*g+h*a*p-i*d*p)*S,t[2]=(s*f*n-A*l*n+A*a*c-i*f*c-s*a*p+i*l*p)*S,t[3]=(h*l*n-s*d*n-h*a*c+i*d*c+s*a*g-i*l*g)*S,t[4]=C*S,t[5]=(u*f*n-m*d*n+m*a*g-r*f*g-u*a*p+r*d*p)*S,t[6]=(m*l*n-o*f*n-m*a*c+r*f*c+o*a*p-r*l*p)*S,t[7]=(o*d*n-u*l*n+u*a*c-r*d*c-o*a*g+r*l*g)*S,t[8]=x*S,t[9]=(m*h*n-u*A*n-m*i*g+r*A*g+u*i*p-r*h*p)*S,t[10]=(o*A*n-m*s*n+m*i*c-r*A*c-o*i*p+r*s*p)*S,t[11]=(u*s*n-o*h*n-u*i*c+r*h*c+o*i*g-r*s*g)*S,t[12]=T*S,t[13]=(u*A*a-m*h*a+m*i*d-r*A*d-u*i*f+r*h*f)*S,t[14]=(m*s*a-o*A*a-m*i*l+r*A*l+o*i*f-r*s*f)*S,t[15]=(o*h*a-u*s*a+u*i*l-r*h*l-o*i*d+r*s*d)*S,this}scale(t){let r=this.elements,i=t.x,a=t.y,n=t.z;return r[0]*=i,r[4]*=a,r[8]*=n,r[1]*=i,r[5]*=a,r[9]*=n,r[2]*=i,r[6]*=a,r[10]*=n,r[3]*=i,r[7]*=a,r[11]*=n,this}getMaxScaleOnAxis(){let t=this.elements,r=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],a=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(r,i,a))}makeTranslation(t,r,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,r,0,0,1,i,0,0,0,1),this}makeRotationX(t){let r=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,r,-i,0,0,i,r,0,0,0,0,1),this}makeRotationY(t){let r=Math.cos(t),i=Math.sin(t);return this.set(r,0,i,0,0,1,0,0,-i,0,r,0,0,0,0,1),this}makeRotationZ(t){let r=Math.cos(t),i=Math.sin(t);return this.set(r,-i,0,0,i,r,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,r){let i=Math.cos(r),a=Math.sin(r),n=1-i,o=t.x,s=t.y,l=t.z,c=n*o,u=n*s;return this.set(c*o+i,c*s-a*l,c*l+a*s,0,c*s+a*l,u*s+i,u*l-a*o,0,c*l-a*s,u*l+a*o,n*l*l+i,0,0,0,0,1),this}makeScale(t,r,i){return this.set(t,0,0,0,0,r,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,r,i,a,n,o){return this.set(1,i,n,0,t,1,o,0,r,a,1,0,0,0,0,1),this}compose(t,r,i){let a=this.elements,n=r._x,o=r._y,s=r._z,l=r._w,c=n+n,u=o+o,h=s+s,d=n*c,g=n*u,m=n*h,A=o*u,f=o*h,p=s*h,w=l*c,C=l*u,x=l*h,T=i.x,y=i.y,S=i.z;return a[0]=(1-(A+p))*T,a[1]=(g+x)*T,a[2]=(m-C)*T,a[3]=0,a[4]=(g-x)*y,a[5]=(1-(d+p))*y,a[6]=(f+w)*y,a[7]=0,a[8]=(m+C)*S,a[9]=(f-w)*S,a[10]=(1-(d+A))*S,a[11]=0,a[12]=t.x,a[13]=t.y,a[14]=t.z,a[15]=1,this}decompose(t,r,i){let a=this.elements,n=Bi.set(a[0],a[1],a[2]).length(),o=Bi.set(a[4],a[5],a[6]).length(),s=Bi.set(a[8],a[9],a[10]).length();this.determinant()<0&&(n=-n),t.x=a[12],t.y=a[13],t.z=a[14],nr.copy(this);let l=1/n,c=1/o,u=1/s;return nr.elements[0]*=l,nr.elements[1]*=l,nr.elements[2]*=l,nr.elements[4]*=c,nr.elements[5]*=c,nr.elements[6]*=c,nr.elements[8]*=u,nr.elements[9]*=u,nr.elements[10]*=u,r.setFromRotationMatrix(nr),i.x=n,i.y=o,i.z=s,this}makePerspective(t,r,i,a,n,o,s=gr,l=!1){let c=this.elements,u=2*n/(r-t),h=2*n/(i-a),d=(r+t)/(r-t),g=(i+a)/(i-a),m,A;if(l)m=n/(o-n),A=o*n/(o-n);else if(s===gr)m=-(o+n)/(o-n),A=-2*o*n/(o-n);else if(s===On)m=-o/(o-n),A=-o*n/(o-n);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+s);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=g,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=A,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,r,i,a,n,o,s=gr,l=!1){let c=this.elements,u=2/(r-t),h=2/(i-a),d=-(r+t)/(r-t),g=-(i+a)/(i-a),m,A;if(l)m=1/(o-n),A=o/(o-n);else if(s===gr)m=-2/(o-n),A=-(o+n)/(o-n);else if(s===On)m=-1/(o-n),A=-n/(o-n);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+s);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=g,c[2]=0,c[6]=0,c[10]=m,c[14]=A,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let r=this.elements,i=t.elements;for(let a=0;a<16;a++)if(r[a]!==i[a])return!1;return!0}fromArray(t,r=0){for(let i=0;i<16;i++)this.elements[i]=t[i+r];return this}toArray(t=[],r=0){let i=this.elements;return t[r]=i[0],t[r+1]=i[1],t[r+2]=i[2],t[r+3]=i[3],t[r+4]=i[4],t[r+5]=i[5],t[r+6]=i[6],t[r+7]=i[7],t[r+8]=i[8],t[r+9]=i[9],t[r+10]=i[10],t[r+11]=i[11],t[r+12]=i[12],t[r+13]=i[13],t[r+14]=i[14],t[r+15]=i[15],t}},Bi=new b,nr=new nt,hg=new b(0,0,0),ug=new b(1,1,1),Fr=new b,ln=new b,Vt=new b,Gc=new nt,Oc=new Zi,Sr=class eu{constructor(t=0,r=0,i=0,a=eu.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=r,this._z=i,this._order=a}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,r,i,a=this._order){return this._x=t,this._y=r,this._z=i,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,r=this._order,i=!0){let a=t.elements,n=a[0],o=a[4],s=a[8],l=a[1],c=a[5],u=a[9],h=a[2],d=a[6],g=a[10];switch(r){case"XYZ":this._y=Math.asin(Xe(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-u,g),this._z=Math.atan2(-o,n)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(s,g),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,n),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,g),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,n));break;case"ZYX":this._y=Math.asin(-Xe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,g),this._z=Math.atan2(l,n)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,n)):(this._x=0,this._y=Math.atan2(s,g));break;case"XZY":this._z=Math.asin(-Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(s,n)):(this._x=Math.atan2(-u,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+r)}return this._order=r,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,r,i){return Gc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Gc,r,i)}setFromVector3(t,r=this._order){return this.set(t.x,t.y,t.z,r)}reorder(t){return Oc.setFromEuler(this),this.setFromQuaternion(Oc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],r=0){return t[r]=this._x,t[r+1]=this._y,t[r+2]=this._z,t[r+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Sr.DEFAULT_ORDER="XYZ";var Dl=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},dg=0,kc=new b,xi=new Zi,Cr=new nt,cn=new b,ma=new b,pg=new b,gg=new Zi,Vc=new b(1,0,0),zc=new b(0,1,0),Yc=new b(0,0,1),Wc={type:"added"},fg={type:"removed"},_i={type:"childadded",child:null},Vs={type:"childremoved",child:null},Rt=class Fn extends ji{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dg++}),this.uuid=qi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Fn.DEFAULT_UP.clone();let t=new b,r=new Sr,i=new Zi,a=new b(1,1,1);function n(){i.setFromEuler(r,!1)}function o(){r.setFromQuaternion(i,void 0,!1)}r._onChange(n),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:r},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new nt},normalMatrix:{value:new Je}}),this.matrix=new nt,this.matrixWorld=new nt,this.matrixAutoUpdate=Fn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Fn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Dl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,r){this.quaternion.setFromAxisAngle(t,r)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,r){return xi.setFromAxisAngle(t,r),this.quaternion.multiply(xi),this}rotateOnWorldAxis(t,r){return xi.setFromAxisAngle(t,r),this.quaternion.premultiply(xi),this}rotateX(t){return this.rotateOnAxis(Vc,t)}rotateY(t){return this.rotateOnAxis(zc,t)}rotateZ(t){return this.rotateOnAxis(Yc,t)}translateOnAxis(t,r){return kc.copy(t).applyQuaternion(this.quaternion),this.position.add(kc.multiplyScalar(r)),this}translateX(t){return this.translateOnAxis(Vc,t)}translateY(t){return this.translateOnAxis(zc,t)}translateZ(t){return this.translateOnAxis(Yc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Cr.copy(this.matrixWorld).invert())}lookAt(t,r,i){t.isVector3?cn.copy(t):cn.set(t,r,i);let a=this.parent;this.updateWorldMatrix(!0,!1),ma.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cr.lookAt(ma,cn,this.up):Cr.lookAt(cn,ma,this.up),this.quaternion.setFromRotationMatrix(Cr),a&&(Cr.extractRotation(a.matrixWorld),xi.setFromRotationMatrix(Cr),this.quaternion.premultiply(xi.invert()))}add(t){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.add(arguments[r]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Wc),_i.child=t,this.dispatchEvent(_i),_i.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let r=this.children.indexOf(t);return r!==-1&&(t.parent=null,this.children.splice(r,1),t.dispatchEvent(fg),Vs.child=t,this.dispatchEvent(Vs),Vs.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Cr.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Cr.multiply(t.parent.matrixWorld)),t.applyMatrix4(Cr),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Wc),_i.child=t,this.dispatchEvent(_i),_i.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,r){if(this[t]===r)return this;for(let i=0,a=this.children.length;i<a;i++){let n=this.children[i].getObjectByProperty(t,r);if(n!==void 0)return n}}getObjectsByProperty(t,r,i=[]){this[t]===r&&i.push(this);let a=this.children;for(let n=0,o=a.length;n<o;n++)a[n].getObjectsByProperty(t,r,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ma,t,pg),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ma,gg,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let r=this.matrixWorld.elements;return t.set(r[8],r[9],r[10]).normalize()}raycast(){}traverse(t){t(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].traverseVisible(t)}traverseAncestors(t){let r=this.parent;r!==null&&(t(r),r.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].updateMatrixWorld(t)}updateWorldMatrix(t,r){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),r===!0){let a=this.children;for(let n=0,o=a.length;n<o;n++)a[n].updateWorldMatrix(!1,!0)}}toJSON(t){let r=t===void 0||typeof t=="string",i={};r&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.geometryInfo=this._geometryInfo.map(s=>dl(Nn({},s),{boundingBox:s.boundingBox?s.boundingBox.toJSON():void 0,boundingSphere:s.boundingSphere?s.boundingSphere.toJSON():void 0})),a.instanceInfo=this._instanceInfo.map(s=>Nn({},s)),a.availableInstanceIds=this._availableInstanceIds.slice(),a.availableGeometryIds=this._availableGeometryIds.slice(),a.nextIndexStart=this._nextIndexStart,a.nextVertexStart=this._nextVertexStart,a.geometryCount=this._geometryCount,a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.matricesTexture=this._matricesTexture.toJSON(t),a.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(a.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(a.boundingBox=this.boundingBox.toJSON()));function n(s,l){return s[l.uuid]===void 0&&(s[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=n(t.geometries,this.geometry);let s=this.geometry.parameters;if(s!==void 0&&s.shapes!==void 0){let l=s.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];n(t.shapes,h)}else n(t.shapes,l)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(n(t.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let s=[];for(let l=0,c=this.material.length;l<c;l++)s.push(n(t.materials,this.material[l]));a.material=s}else a.material=n(t.materials,this.material);if(this.children.length>0){a.children=[];for(let s=0;s<this.children.length;s++)a.children.push(this.children[s].toJSON(t).object)}if(this.animations.length>0){a.animations=[];for(let s=0;s<this.animations.length;s++){let l=this.animations[s];a.animations.push(n(t.animations,l))}}if(r){let s=o(t.geometries),l=o(t.materials),c=o(t.textures),u=o(t.images),h=o(t.shapes),d=o(t.skeletons),g=o(t.animations),m=o(t.nodes);s.length>0&&(i.geometries=s),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),g.length>0&&(i.animations=g),m.length>0&&(i.nodes=m)}return i.object=a,i;function o(s){let l=[];for(let c in s){let u=s[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,r=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),r===!0)for(let i=0;i<t.children.length;i++){let a=t.children[i];this.add(a.clone())}return this}};Rt.DEFAULT_UP=new b(0,1,0);Rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var sr=new b,vr=new b,zs=new b,Mr=new b,Si=new b,yi=new b,Jc=new b,Ys=new b,Ws=new b,Js=new b,Ks=new lt,Xs=new lt,js=new lt,Ea=class Li{constructor(t=new b,r=new b,i=new b){this.a=t,this.b=r,this.c=i}static getNormal(t,r,i,a){a.subVectors(i,r),sr.subVectors(t,r),a.cross(sr);let n=a.lengthSq();return n>0?a.multiplyScalar(1/Math.sqrt(n)):a.set(0,0,0)}static getBarycoord(t,r,i,a,n){sr.subVectors(a,r),vr.subVectors(i,r),zs.subVectors(t,r);let o=sr.dot(sr),s=sr.dot(vr),l=sr.dot(zs),c=vr.dot(vr),u=vr.dot(zs),h=o*c-s*s;if(h===0)return n.set(0,0,0),null;let d=1/h,g=(c*l-s*u)*d,m=(o*u-s*l)*d;return n.set(1-g-m,m,g)}static containsPoint(t,r,i,a){return this.getBarycoord(t,r,i,a,Mr)===null?!1:Mr.x>=0&&Mr.y>=0&&Mr.x+Mr.y<=1}static getInterpolation(t,r,i,a,n,o,s,l){return this.getBarycoord(t,r,i,a,Mr)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(n,Mr.x),l.addScaledVector(o,Mr.y),l.addScaledVector(s,Mr.z),l)}static getInterpolatedAttribute(t,r,i,a,n,o){return Ks.setScalar(0),Xs.setScalar(0),js.setScalar(0),Ks.fromBufferAttribute(t,r),Xs.fromBufferAttribute(t,i),js.fromBufferAttribute(t,a),o.setScalar(0),o.addScaledVector(Ks,n.x),o.addScaledVector(Xs,n.y),o.addScaledVector(js,n.z),o}static isFrontFacing(t,r,i,a){return sr.subVectors(i,r),vr.subVectors(t,r),sr.cross(vr).dot(a)<0}set(t,r,i){return this.a.copy(t),this.b.copy(r),this.c.copy(i),this}setFromPointsAndIndices(t,r,i,a){return this.a.copy(t[r]),this.b.copy(t[i]),this.c.copy(t[a]),this}setFromAttributeAndIndices(t,r,i,a){return this.a.fromBufferAttribute(t,r),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,a),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return sr.subVectors(this.c,this.b),vr.subVectors(this.a,this.b),sr.cross(vr).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Li.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,r){return Li.getBarycoord(t,this.a,this.b,this.c,r)}getInterpolation(t,r,i,a,n){return Li.getInterpolation(t,this.a,this.b,this.c,r,i,a,n)}containsPoint(t){return Li.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Li.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,r){let i=this.a,a=this.b,n=this.c,o,s;Si.subVectors(a,i),yi.subVectors(n,i),Ys.subVectors(t,i);let l=Si.dot(Ys),c=yi.dot(Ys);if(l<=0&&c<=0)return r.copy(i);Ws.subVectors(t,a);let u=Si.dot(Ws),h=yi.dot(Ws);if(u>=0&&h<=u)return r.copy(a);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),r.copy(i).addScaledVector(Si,o);Js.subVectors(t,n);let g=Si.dot(Js),m=yi.dot(Js);if(m>=0&&g<=m)return r.copy(n);let A=g*c-l*m;if(A<=0&&c>=0&&m<=0)return s=c/(c-m),r.copy(i).addScaledVector(yi,s);let f=u*m-g*h;if(f<=0&&h-u>=0&&g-m>=0)return Jc.subVectors(n,a),s=(h-u)/(h-u+(g-m)),r.copy(a).addScaledVector(Jc,s);let p=1/(f+A+d);return o=A*p,s=d*p,r.copy(i).addScaledVector(Si,o).addScaledVector(yi,s)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},tu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Lr={h:0,s:0,l:0},hn={h:0,s:0,l:0};function qs(e,t,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?e+(t-e)*6*r:r<1/2?t:r<2/3?e+(t-e)*6*(2/3-r):e}var Ye=class{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Lt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.colorSpaceToWorking(this,t),this}setRGB(e,t,r,i=tt.workingColorSpace){return this.r=e,this.g=t,this.b=r,tt.colorSpaceToWorking(this,i),this}setHSL(e,t,r,i=tt.workingColorSpace){if(e=vl(e,1),t=Xe(t,0,1),r=Xe(r,0,1),t===0)this.r=this.g=this.b=r;else{let a=r<=.5?r*(1+t):r+t-r*t,n=2*r-a;this.r=qs(n,a,e+1/3),this.g=qs(n,a,e),this.b=qs(n,a,e-1/3)}return tt.colorSpaceToWorking(this,i),this}setStyle(e,t=Lt){function r(a){a!==void 0&&parseFloat(a)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let a,n=i[1],o=i[2];switch(n){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return r(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let a=i[1],n=a.length;if(n===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(n===6)return this.setHex(parseInt(a,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Lt){let r=tu[e.toLowerCase()];return r!==void 0?this.setHex(r,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=_r(e.r),this.g=_r(e.g),this.b=_r(e.b),this}copyLinearToSRGB(e){return this.r=Vi(e.r),this.g=Vi(e.g),this.b=Vi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Lt){return tt.workingToColorSpace(yt.copy(this),e),Math.round(Xe(yt.r*255,0,255))*65536+Math.round(Xe(yt.g*255,0,255))*256+Math.round(Xe(yt.b*255,0,255))}getHexString(e=Lt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.workingToColorSpace(yt.copy(this),t);let r=yt.r,i=yt.g,a=yt.b,n=Math.max(r,i,a),o=Math.min(r,i,a),s,l,c=(o+n)/2;if(o===n)s=0,l=0;else{let u=n-o;switch(l=c<=.5?u/(n+o):u/(2-n-o),n){case r:s=(i-a)/u+(i<a?6:0);break;case i:s=(a-r)/u+2;break;case a:s=(r-i)/u+4;break}s/=6}return e.h=s,e.s=l,e.l=c,e}getRGB(e,t=tt.workingColorSpace){return tt.workingToColorSpace(yt.copy(this),t),e.r=yt.r,e.g=yt.g,e.b=yt.b,e}getStyle(e=Lt){tt.workingToColorSpace(yt.copy(this),e);let t=yt.r,r=yt.g,i=yt.b;return e!==Lt?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(i*255)})`}offsetHSL(e,t,r){return this.getHSL(Lr),this.setHSL(Lr.h+e,Lr.s+t,Lr.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(Lr),e.getHSL(hn);let r=Ia(Lr.h,hn.h,t),i=Ia(Lr.s,hn.s,t),a=Ia(Lr.l,hn.l,t);return this.setHSL(r,i,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,r=this.g,i=this.b,a=e.elements;return this.r=a[0]*t+a[3]*r+a[6]*i,this.g=a[1]*t+a[4]*r+a[7]*i,this.b=a[2]*t+a[5]*r+a[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},yt=new Ye;Ye.NAMES=tu;var Ag=0,Yr=class extends ji{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ag++}),this.uuid=qi(),this.name="",this.type="Material",this.blending=ki,this.side=Vr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=fo,this.blendDst=Ao,this.blendEquation=ii,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ye(0,0,0),this.blendAlpha=0,this.depthFunc=zi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Tc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wi,this.stencilZFail=wi,this.stencilZPass=wi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let r=e[t];if(r===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(r):i&&i.isVector3&&r&&r.isVector3?i.copy(r):this[t]=r}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let r={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(r.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(r.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==ki&&(r.blending=this.blending),this.side!==Vr&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==fo&&(r.blendSrc=this.blendSrc),this.blendDst!==Ao&&(r.blendDst=this.blendDst),this.blendEquation!==ii&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==zi&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Tc&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==wi&&(r.stencilFail=this.stencilFail),this.stencilZFail!==wi&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==wi&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function i(a){let n=[];for(let o in a){let s=a[o];delete s.metadata,n.push(s)}return n}if(t){let a=i(e.textures),n=i(e.images);a.length>0&&(r.textures=a),n.length>0&&(r.images=n)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,r=null;if(t!==null){let i=t.length;r=new Array(i);for(let a=0;a!==i;++a)r[a]=t[a].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ru=class extends Yr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Sr,this.combine=pl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},wt=new b,un=new je,mg=0,It=class{constructor(e,t,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:mg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=bc,this.updateRanges=[],this.gpuType=pr,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let i=0,a=this.itemSize;i<a;i++)this.array[e+i]=t.array[r+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)un.fromBufferAttribute(this,t),un.applyMatrix3(e),this.setXY(t,un.x,un.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)wt.fromBufferAttribute(this,t),wt.applyMatrix3(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)wt.fromBufferAttribute(this,t),wt.applyMatrix4(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)wt.fromBufferAttribute(this,t),wt.applyNormalMatrix(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)wt.fromBufferAttribute(this,t),wt.transformDirection(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=Fi(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Ut(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Fi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Fi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Fi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Fi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),r=Ut(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,i){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),r=Ut(r,this.array),i=Ut(i,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=i,this}setXYZW(e,t,r,i,a){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),r=Ut(r,this.array),i=Ut(i,this.array),a=Ut(a,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=i,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==bc&&(e.usage=this.usage),e}},iu=class extends It{constructor(e,t,r){super(new Uint16Array(e),t,r)}},au=class extends It{constructor(e,t,r){super(new Uint32Array(e),t,r)}},mt=class extends It{constructor(e,t,r){super(new Float32Array(e),t,r)}},Eg=0,qt=new nt,Zs=new Rt,Ii=new b,zt=new ci,wa=new ci,Bt=new b,Tt=class nu extends ji{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Eg++}),this.uuid=qi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(qh(t)?au:iu)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,r){return this.attributes[t]=r,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,r,i=0){this.groups.push({start:t,count:r,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,r){this.drawRange.start=t,this.drawRange.count=r}applyMatrix4(t){let r=this.attributes.position;r!==void 0&&(r.applyMatrix4(t),r.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let n=new Je().getNormalMatrix(t);i.applyNormalMatrix(n),i.needsUpdate=!0}let a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(t),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return qt.makeRotationFromQuaternion(t),this.applyMatrix4(qt),this}rotateX(t){return qt.makeRotationX(t),this.applyMatrix4(qt),this}rotateY(t){return qt.makeRotationY(t),this.applyMatrix4(qt),this}rotateZ(t){return qt.makeRotationZ(t),this.applyMatrix4(qt),this}translate(t,r,i){return qt.makeTranslation(t,r,i),this.applyMatrix4(qt),this}scale(t,r,i){return qt.makeScale(t,r,i),this.applyMatrix4(qt),this}lookAt(t){return Zs.lookAt(t),Zs.updateMatrix(),this.applyMatrix4(Zs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ii).negate(),this.translate(Ii.x,Ii.y,Ii.z),this}setFromPoints(t){let r=this.getAttribute("position");if(r===void 0){let i=[];for(let a=0,n=t.length;a<n;a++){let o=t[a];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new mt(i,3))}else{let i=Math.min(t.length,r.count);for(let a=0;a<i;a++){let n=t[a];r.setXYZ(a,n.x,n.y,n.z||0)}t.length>r.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),r.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ci);let t=this.attributes.position,r=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new b(-1/0,-1/0,-1/0),new b(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),r)for(let i=0,a=r.length;i<a;i++){let n=r[i];zt.setFromBufferAttribute(n),this.morphTargetsRelative?(Bt.addVectors(this.boundingBox.min,zt.min),this.boundingBox.expandByPoint(Bt),Bt.addVectors(this.boundingBox.max,zt.max),this.boundingBox.expandByPoint(Bt)):(this.boundingBox.expandByPoint(zt.min),this.boundingBox.expandByPoint(zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hi);let t=this.attributes.position,r=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new b,1/0);return}if(t){let i=this.boundingSphere.center;if(zt.setFromBufferAttribute(t),r)for(let n=0,o=r.length;n<o;n++){let s=r[n];wa.setFromBufferAttribute(s),this.morphTargetsRelative?(Bt.addVectors(zt.min,wa.min),zt.expandByPoint(Bt),Bt.addVectors(zt.max,wa.max),zt.expandByPoint(Bt)):(zt.expandByPoint(wa.min),zt.expandByPoint(wa.max))}zt.getCenter(i);let a=0;for(let n=0,o=t.count;n<o;n++)Bt.fromBufferAttribute(t,n),a=Math.max(a,i.distanceToSquared(Bt));if(r)for(let n=0,o=r.length;n<o;n++){let s=r[n],l=this.morphTargetsRelative;for(let c=0,u=s.count;c<u;c++)Bt.fromBufferAttribute(s,c),l&&(Ii.fromBufferAttribute(t,c),Bt.add(Ii)),a=Math.max(a,i.distanceToSquared(Bt))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,r=this.attributes;if(t===null||r.position===void 0||r.normal===void 0||r.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=r.position,a=r.normal,n=r.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new It(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),s=[],l=[];for(let U=0;U<i.count;U++)s[U]=new b,l[U]=new b;let c=new b,u=new b,h=new b,d=new je,g=new je,m=new je,A=new b,f=new b;function p(U,D,M){c.fromBufferAttribute(i,U),u.fromBufferAttribute(i,D),h.fromBufferAttribute(i,M),d.fromBufferAttribute(n,U),g.fromBufferAttribute(n,D),m.fromBufferAttribute(n,M),u.sub(c),h.sub(c),g.sub(d),m.sub(d);let I=1/(g.x*m.y-m.x*g.y);isFinite(I)&&(A.copy(u).multiplyScalar(m.y).addScaledVector(h,-g.y).multiplyScalar(I),f.copy(h).multiplyScalar(g.x).addScaledVector(u,-m.x).multiplyScalar(I),s[U].add(A),s[D].add(A),s[M].add(A),l[U].add(f),l[D].add(f),l[M].add(f))}let w=this.groups;w.length===0&&(w=[{start:0,count:t.count}]);for(let U=0,D=w.length;U<D;++U){let M=w[U],I=M.start,H=M.count;for(let k=I,G=I+H;k<G;k+=3)p(t.getX(k+0),t.getX(k+1),t.getX(k+2))}let C=new b,x=new b,T=new b,y=new b;function S(U){T.fromBufferAttribute(a,U),y.copy(T);let D=s[U];C.copy(D),C.sub(T.multiplyScalar(T.dot(D))).normalize(),x.crossVectors(y,D);let M=x.dot(l[U])<0?-1:1;o.setXYZW(U,C.x,C.y,C.z,M)}for(let U=0,D=w.length;U<D;++U){let M=w[U],I=M.start,H=M.count;for(let k=I,G=I+H;k<G;k+=3)S(t.getX(k+0)),S(t.getX(k+1)),S(t.getX(k+2))}}computeVertexNormals(){let t=this.index,r=this.getAttribute("position");if(r!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new It(new Float32Array(r.count*3),3),this.setAttribute("normal",i);else for(let d=0,g=i.count;d<g;d++)i.setXYZ(d,0,0,0);let a=new b,n=new b,o=new b,s=new b,l=new b,c=new b,u=new b,h=new b;if(t)for(let d=0,g=t.count;d<g;d+=3){let m=t.getX(d+0),A=t.getX(d+1),f=t.getX(d+2);a.fromBufferAttribute(r,m),n.fromBufferAttribute(r,A),o.fromBufferAttribute(r,f),u.subVectors(o,n),h.subVectors(a,n),u.cross(h),s.fromBufferAttribute(i,m),l.fromBufferAttribute(i,A),c.fromBufferAttribute(i,f),s.add(u),l.add(u),c.add(u),i.setXYZ(m,s.x,s.y,s.z),i.setXYZ(A,l.x,l.y,l.z),i.setXYZ(f,c.x,c.y,c.z)}else for(let d=0,g=r.count;d<g;d+=3)a.fromBufferAttribute(r,d+0),n.fromBufferAttribute(r,d+1),o.fromBufferAttribute(r,d+2),u.subVectors(o,n),h.subVectors(a,n),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let r=0,i=t.count;r<i;r++)Bt.fromBufferAttribute(t,r),Bt.normalize(),t.setXYZ(r,Bt.x,Bt.y,Bt.z)}toNonIndexed(){function t(s,l){let c=s.array,u=s.itemSize,h=s.normalized,d=new c.constructor(l.length*u),g=0,m=0;for(let A=0,f=l.length;A<f;A++){s.isInterleavedBufferAttribute?g=l[A]*s.data.stride+s.offset:g=l[A]*u;for(let p=0;p<u;p++)d[m++]=c[g++]}return new It(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let r=new nu,i=this.index.array,a=this.attributes;for(let s in a){let l=a[s],c=t(l,i);r.setAttribute(s,c)}let n=this.morphAttributes;for(let s in n){let l=[],c=n[s];for(let u=0,h=c.length;u<h;u++){let d=c[u],g=t(d,i);l.push(g)}r.morphAttributes[s]=l}r.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let s=0,l=o.length;s<l;s++){let c=o[s];r.addGroup(c.start,c.count,c.materialIndex)}return r}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let r=this.index;r!==null&&(t.data.index={type:r.array.constructor.name,array:Array.prototype.slice.call(r.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let a={},n=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let g=c[h];u.push(g.toJSON(t.data))}u.length>0&&(a[l]=u,n=!0)}n&&(t.data.morphAttributes=a,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let s=this.boundingSphere;return s!==null&&(t.data.boundingSphere=s.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let r={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let a=t.attributes;for(let c in a){let u=a[c];this.setAttribute(c,u.clone(r))}let n=t.morphAttributes;for(let c in n){let u=[],h=n[c];for(let d=0,g=h.length;d<g;d++)u.push(h[d].clone(r));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let s=t.boundingBox;s!==null&&(this.boundingBox=s.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Kc=new nt,Zr=new Kn,dn=new hi,Xc=new b,pn=new b,gn=new b,fn=new b,$s=new b,An=new b,jc=new b,mn=new b,Ze=class extends Rt{constructor(e=new Tt,t=new ru){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let r=e[t[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,a=r.length;i<a;i++){let n=r[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[n]=i}}}}getVertexPosition(e,t){let r=this.geometry,i=r.attributes.position,a=r.morphAttributes.position,n=r.morphTargetsRelative;t.fromBufferAttribute(i,e);let o=this.morphTargetInfluences;if(a&&o){An.set(0,0,0);for(let s=0,l=a.length;s<l;s++){let c=o[s],u=a[s];c!==0&&($s.fromBufferAttribute(u,e),n?An.addScaledVector($s,c):An.addScaledVector($s.sub(t),c))}t.add(An)}return t}raycast(e,t){let r=this.geometry,i=this.material,a=this.matrixWorld;i!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),dn.copy(r.boundingSphere),dn.applyMatrix4(a),Zr.copy(e.ray).recast(e.near),!(dn.containsPoint(Zr.origin)===!1&&(Zr.intersectSphere(dn,Xc)===null||Zr.origin.distanceToSquared(Xc)>(e.far-e.near)**2))&&(Kc.copy(a).invert(),Zr.copy(e.ray).applyMatrix4(Kc),!(r.boundingBox!==null&&Zr.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,Zr)))}_computeIntersections(e,t,r){let i,a=this.geometry,n=this.material,o=a.index,s=a.attributes.position,l=a.attributes.uv,c=a.attributes.uv1,u=a.attributes.normal,h=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(n))for(let g=0,m=h.length;g<m;g++){let A=h[g],f=n[A.materialIndex],p=Math.max(A.start,d.start),w=Math.min(o.count,Math.min(A.start+A.count,d.start+d.count));for(let C=p,x=w;C<x;C+=3){let T=o.getX(C),y=o.getX(C+1),S=o.getX(C+2);i=En(this,f,e,r,l,c,u,T,y,S),i&&(i.faceIndex=Math.floor(C/3),i.face.materialIndex=A.materialIndex,t.push(i))}}else{let g=Math.max(0,d.start),m=Math.min(o.count,d.start+d.count);for(let A=g,f=m;A<f;A+=3){let p=o.getX(A),w=o.getX(A+1),C=o.getX(A+2);i=En(this,n,e,r,l,c,u,p,w,C),i&&(i.faceIndex=Math.floor(A/3),t.push(i))}}else if(s!==void 0)if(Array.isArray(n))for(let g=0,m=h.length;g<m;g++){let A=h[g],f=n[A.materialIndex],p=Math.max(A.start,d.start),w=Math.min(s.count,Math.min(A.start+A.count,d.start+d.count));for(let C=p,x=w;C<x;C+=3){let T=C,y=C+1,S=C+2;i=En(this,f,e,r,l,c,u,T,y,S),i&&(i.faceIndex=Math.floor(C/3),i.face.materialIndex=A.materialIndex,t.push(i))}}else{let g=Math.max(0,d.start),m=Math.min(s.count,d.start+d.count);for(let A=g,f=m;A<f;A+=3){let p=A,w=A+1,C=A+2;i=En(this,n,e,r,l,c,u,p,w,C),i&&(i.faceIndex=Math.floor(A/3),t.push(i))}}}};function wg(e,t,r,i,a,n,o,s){let l;if(t.side===Nt?l=i.intersectTriangle(o,n,a,!0,s):l=i.intersectTriangle(a,n,o,t.side===Vr,s),l===null)return null;mn.copy(s),mn.applyMatrix4(e.matrixWorld);let c=r.ray.origin.distanceTo(mn);return c<r.near||c>r.far?null:{distance:c,point:mn.clone(),object:e}}function En(e,t,r,i,a,n,o,s,l,c){e.getVertexPosition(s,pn),e.getVertexPosition(l,gn),e.getVertexPosition(c,fn);let u=wg(e,t,r,i,pn,gn,fn,jc);if(u){let h=new b;Ea.getBarycoord(jc,pn,gn,fn,h),a&&(u.uv=Ea.getInterpolatedAttribute(a,s,l,c,h,new je)),n&&(u.uv1=Ea.getInterpolatedAttribute(n,s,l,c,h,new je)),o&&(u.normal=Ea.getInterpolatedAttribute(o,s,l,c,h,new b),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a:s,b:l,c,normal:new b,materialIndex:0};Ea.getNormal(pn,gn,fn,d.normal),u.face=d,u.barycoord=h}return u}var Wt=class su extends Tt{constructor(t=1,r=1,i=1,a=1,n=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:r,depth:i,widthSegments:a,heightSegments:n,depthSegments:o};let s=this;a=Math.floor(a),n=Math.floor(n),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,g=0;m("z","y","x",-1,-1,i,r,t,o,n,0),m("z","y","x",1,-1,i,r,-t,o,n,1),m("x","z","y",1,1,t,i,r,a,o,2),m("x","z","y",1,-1,t,i,-r,a,o,3),m("x","y","z",1,-1,t,r,i,a,n,4),m("x","y","z",-1,-1,t,r,-i,a,n,5),this.setIndex(l),this.setAttribute("position",new mt(c,3)),this.setAttribute("normal",new mt(u,3)),this.setAttribute("uv",new mt(h,2));function m(A,f,p,w,C,x,T,y,S,U,D){let M=x/S,I=T/U,H=x/2,k=T/2,G=y/2,Z=S+1,V=U+1,$=0,J=0,te=new b;for(let Ae=0;Ae<V;Ae++){let Ue=Ae*I-k;for(let Pe=0;Pe<Z;Pe++){let qe=Pe*M-H;te[A]=qe*w,te[f]=Ue*C,te[p]=G,c.push(te.x,te.y,te.z),te[A]=0,te[f]=0,te[p]=y>0?1:-1,u.push(te.x,te.y,te.z),h.push(Pe/S),h.push(1-Ae/U),$+=1}}for(let Ae=0;Ae<U;Ae++)for(let Ue=0;Ue<S;Ue++){let Pe=d+Ue+Z*Ae,qe=d+Ue+Z*(Ae+1),He=d+(Ue+1)+Z*(Ae+1),O=d+(Ue+1)+Z*Ae;l.push(Pe,qe,O),l.push(qe,He,O),J+=6}s.addGroup(g,J,D),g+=J,d+=$}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new su(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Ki(e){let t={};for(let r in e){t[r]={};for(let i in e[r]){let a=e[r][i];a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)?a.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[r][i]=null):t[r][i]=a.clone():Array.isArray(a)?t[r][i]=a.slice():t[r][i]=a}}return t}function Ft(e){let t={};for(let r=0;r<e.length;r++){let i=Ki(e[r]);for(let a in i)t[a]=i[a]}return t}function Cg(e){let t=[];for(let r=0;r<e.length;r++)t.push(e[r].clone());return t}function ou(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:tt.workingColorSpace}var vg={clone:Ki,merge:Ft},Mg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Dg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,fr=class extends Yr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mg,this.fragmentShader=Dg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ki(e.uniforms),this.uniformsGroups=Cg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let r={};for(let i in this.extensions)this.extensions[i]===!0&&(r[i]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}},lu=class extends Rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new nt,this.projectionMatrix=new nt,this.projectionMatrixInverse=new nt,this.coordinateSystem=gr,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Nr=new b,qc=new je,Zc=new je,Jt=class extends lu{constructor(e=50,t=1,r=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Fa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ya*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Fa*2*Math.atan(Math.tan(ya*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){Nr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Nr.x,Nr.y).multiplyScalar(-e/Nr.z),Nr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(Nr.x,Nr.y).multiplyScalar(-e/Nr.z)}getViewSize(e,t){return this.getViewBounds(e,qc,Zc),t.subVectors(Zc,qc)}setViewOffset(e,t,r,i,a,n){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=i,this.view.width=a,this.view.height=n,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ya*.5*this.fov)/this.zoom,r=2*t,i=this.aspect*r,a=-.5*i,n=this.view;if(this.view!==null&&this.view.enabled){let s=n.fullWidth,l=n.fullHeight;a+=n.offsetX*i/s,t-=n.offsetY*r/l,i*=n.width/s,r*=n.height/l}let o=this.filmOffset;o!==0&&(a+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+i,t,t-r,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ri=-90,Ti=1,Bg=class extends Rt{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Jt(Ri,Ti,e,t);i.layers=this.layers,this.add(i);let a=new Jt(Ri,Ti,e,t);a.layers=this.layers,this.add(a);let n=new Jt(Ri,Ti,e,t);n.layers=this.layers,this.add(n);let o=new Jt(Ri,Ti,e,t);o.layers=this.layers,this.add(o);let s=new Jt(Ri,Ti,e,t);s.layers=this.layers,this.add(s);let l=new Jt(Ri,Ti,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[r,i,a,n,o,s]=t;for(let l of t)this.remove(l);if(e===gr)r.up.set(0,1,0),r.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),n.up.set(0,0,1),n.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===On)r.up.set(0,-1,0),r.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),n.up.set(0,0,-1),n.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:r,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[a,n,o,s,l,c]=this.children,u=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let m=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,i),e.render(t,a),e.setRenderTarget(r,1,i),e.render(t,n),e.setRenderTarget(r,2,i),e.render(t,o),e.setRenderTarget(r,3,i),e.render(t,s),e.setRenderTarget(r,4,i),e.render(t,l),r.texture.generateMipmaps=m,e.setRenderTarget(r,5,i),e.render(t,c),e.setRenderTarget(u,h,d),e.xr.enabled=g,r.texture.needsPMREMUpdate=!0}},cu=class extends er{constructor(e=[],t=Yi,r,i,a,n,o,s,l,c){super(e,t,r,i,a,n,o,s,l,c),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},xg=class extends zr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let r={width:e,height:e,depth:1},i=[r,r,r,r,r,r];this.texture=new cu(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Wt(5,5,5),a=new fr({name:"CubemapFromEquirect",uniforms:Ki(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:Nt,blending:Gr});a.uniforms.tEquirect.value=t;let n=new Ze(i,a),o=t.minFilter;return t.minFilter===si&&(t.minFilter=or),new Bg(1,10,this).update(e,n),t.minFilter=o,n.geometry.dispose(),n.material.dispose(),this}clear(e,t=!0,r=!0,i=!0){let a=e.getRenderTarget();for(let n=0;n<6;n++)e.setRenderTarget(this,n),e.clear(t,r,i);e.setRenderTarget(a)}},oi=class extends Rt{constructor(){super(),this.isGroup=!0,this.type="Group"}},_g={type:"move"},eo=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new oi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new oi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new b,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new b),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new oi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new b,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new b),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let i=null,a=null,n=null,o=this._targetRay,s=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){n=!0;for(let m of e.hand.values()){let A=t.getJointPose(m,r),f=this._getHandJoint(l,m);A!==null&&(f.matrix.fromArray(A.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=A.radius),f.visible=A!==null}let c=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],h=c.position.distanceTo(u.position),d=.02,g=.005;l.inputState.pinching&&h>d+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&h<=d-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,r),a!==null&&(s.matrix.fromArray(a.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,a.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(a.linearVelocity)):s.hasLinearVelocity=!1,a.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(a.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,r),i===null&&a!==null&&(i=a),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(_g)))}return o!==null&&(o.visible=i!==null),s!==null&&(s.visible=a!==null),l!==null&&(l.visible=n!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let r=new oi;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}},hu=class extends Rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Sr,this.environmentIntensity=1,this.environmentRotation=new Sr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},uu=class extends er{constructor(e=null,t=1,r=1,i,a,n,o,s,l=Kt,c=Kt,u,h){super(null,n,o,s,l,c,i,a,u,h),this.isDataTexture=!0,this.image={data:e,width:t,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ra=class extends It{constructor(e,t,r,i=1){super(e,t,r),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},bi=new nt,$c=new nt,wn=[],eh=new ci,Sg=new nt,Ca=new Ze,va=new hi,yg=class extends Ze{constructor(e,t,r){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ra(new Float32Array(r*16),16),this.instanceColor=null,this.morphTexture=null,this.count=r,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<r;i++)this.setMatrixAt(i,Sg)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new ci),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let r=0;r<t;r++)this.getMatrixAt(r,bi),eh.copy(e.boundingBox).applyMatrix4(bi),this.boundingBox.union(eh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new hi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let r=0;r<t;r++)this.getMatrixAt(r,bi),va.copy(e.boundingSphere).applyMatrix4(bi),this.boundingSphere.union(va)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let r=t.morphTargetInfluences,i=this.morphTexture.source.data.data,a=r.length+1,n=e*a+1;for(let o=0;o<r.length;o++)r[o]=i[n+o]}raycast(e,t){let r=this.matrixWorld,i=this.count;if(Ca.geometry=this.geometry,Ca.material=this.material,Ca.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),va.copy(this.boundingSphere),va.applyMatrix4(r),e.ray.intersectsSphere(va)!==!1))for(let a=0;a<i;a++){this.getMatrixAt(a,bi),$c.multiplyMatrices(r,bi),Ca.matrixWorld=$c,Ca.raycast(e,wn);for(let n=0,o=wn.length;n<o;n++){let s=wn[n];s.instanceId=a,s.object=this,t.push(s)}wn.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Ra(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let r=t.morphTargetInfluences,i=r.length+1;this.morphTexture===null&&(this.morphTexture=new uu(new Float32Array(i*this.count),i,this.count,Jn,pr));let a=this.morphTexture.source.data.data,n=0;for(let l=0;l<r.length;l++)n+=r[l];let o=this.geometry.morphTargetsRelative?1:1-n,s=i*e;a[s]=o,a.set(r,s+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},to=new b,Ig=new b,Rg=new Je,Pr=class{constructor(e=new b(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,i){return this.normal.set(e,t,r),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){let i=to.subVectors(r,t).cross(Ig.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let r=e.delta(to),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return a<0||a>1?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let r=t||Rg.getNormalMatrix(e),i=this.coplanarPoint(to).applyMatrix4(e),a=this.normal.applyMatrix3(r).normalize();return this.constant=-i.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},$r=new hi,Tg=new je(.5,.5),Cn=new b,Bl=class{constructor(e=new Pr,t=new Pr,r=new Pr,i=new Pr,a=new Pr,n=new Pr){this.planes=[e,t,r,i,a,n]}set(e,t,r,i,a,n){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(r),o[3].copy(i),o[4].copy(a),o[5].copy(n),this}copy(e){let t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=gr,r=!1){let i=this.planes,a=e.elements,n=a[0],o=a[1],s=a[2],l=a[3],c=a[4],u=a[5],h=a[6],d=a[7],g=a[8],m=a[9],A=a[10],f=a[11],p=a[12],w=a[13],C=a[14],x=a[15];if(i[0].setComponents(l-n,d-c,f-g,x-p).normalize(),i[1].setComponents(l+n,d+c,f+g,x+p).normalize(),i[2].setComponents(l+o,d+u,f+m,x+w).normalize(),i[3].setComponents(l-o,d-u,f-m,x-w).normalize(),r)i[4].setComponents(s,h,A,C).normalize(),i[5].setComponents(l-s,d-h,f-A,x-C).normalize();else if(i[4].setComponents(l-s,d-h,f-A,x-C).normalize(),t===gr)i[5].setComponents(l+s,d+h,f+A,x+C).normalize();else if(t===On)i[5].setComponents(s,h,A,C).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),$r.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),$r.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere($r)}intersectsSprite(e){$r.center.set(0,0,0);let t=Tg.distanceTo(e.center);return $r.radius=.7071067811865476+t,$r.applyMatrix4(e.matrixWorld),this.intersectsSphere($r)}intersectsSphere(e){let t=this.planes,r=e.center,i=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(r)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let r=0;r<6;r++){let i=t[r];if(Cn.x=i.normal.x>0?e.max.x:e.min.x,Cn.y=i.normal.y>0?e.max.y:e.min.y,Cn.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Cn)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},du=class extends Yr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ye(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Vn=new b,zn=new b,th=new nt,Ma=new Kn,vn=new hi,ro=new b,rh=new b,bg=class extends Rt{constructor(e=new Tt,t=new du){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,r=[0];for(let i=1,a=t.count;i<a;i++)Vn.fromBufferAttribute(t,i-1),zn.fromBufferAttribute(t,i),r[i]=r[i-1],r[i]+=Vn.distanceTo(zn);e.setAttribute("lineDistance",new mt(r,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let r=this.geometry,i=this.matrixWorld,a=e.params.Line.threshold,n=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),vn.copy(r.boundingSphere),vn.applyMatrix4(i),vn.radius+=a,e.ray.intersectsSphere(vn)===!1)return;th.copy(i).invert(),Ma.copy(e.ray).applyMatrix4(th);let o=a/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,l=this.isLineSegments?2:1,c=r.index,u=r.attributes.position;if(c!==null){let h=Math.max(0,n.start),d=Math.min(c.count,n.start+n.count);for(let g=h,m=d-1;g<m;g+=l){let A=c.getX(g),f=c.getX(g+1),p=Mn(this,e,Ma,s,A,f,g);p&&t.push(p)}if(this.isLineLoop){let g=c.getX(d-1),m=c.getX(h),A=Mn(this,e,Ma,s,g,m,d-1);A&&t.push(A)}}else{let h=Math.max(0,n.start),d=Math.min(u.count,n.start+n.count);for(let g=h,m=d-1;g<m;g+=l){let A=Mn(this,e,Ma,s,g,g+1,g);A&&t.push(A)}if(this.isLineLoop){let g=Mn(this,e,Ma,s,d-1,h,d-1);g&&t.push(g)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let r=e[t[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,a=r.length;i<a;i++){let n=r[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[n]=i}}}}};function Mn(e,t,r,i,a,n,o){let s=e.geometry.attributes.position;if(Vn.fromBufferAttribute(s,a),zn.fromBufferAttribute(s,n),r.distanceSqToSegment(Vn,zn,ro,rh)>i)return;ro.applyMatrix4(e.matrixWorld);let l=t.ray.origin.distanceTo(ro);if(!(l<t.near||l>t.far))return{distance:l,point:rh.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Qg=class extends bg{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},pu=class extends Yr{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ye(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ih=new nt,il=new Kn,Dn=new hi,Bn=new b,Ug=class extends Rt{constructor(e=new Tt,t=new pu){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let r=this.geometry,i=this.matrixWorld,a=e.params.Points.threshold,n=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),Dn.copy(r.boundingSphere),Dn.applyMatrix4(i),Dn.radius+=a,e.ray.intersectsSphere(Dn)===!1)return;ih.copy(i).invert(),il.copy(e.ray).applyMatrix4(ih);let o=a/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,l=r.index,c=r.attributes.position;if(l!==null){let u=Math.max(0,n.start),h=Math.min(l.count,n.start+n.count);for(let d=u,g=h;d<g;d++){let m=l.getX(d);Bn.fromBufferAttribute(c,m),ah(Bn,m,s,i,e,t,this)}}else{let u=Math.max(0,n.start),h=Math.min(c.count,n.start+n.count);for(let d=u,g=h;d<g;d++)Bn.fromBufferAttribute(c,d),ah(Bn,d,s,i,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let r=e[t[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,a=r.length;i<a;i++){let n=r[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[n]=i}}}}};function ah(e,t,r,i,a,n,o){let s=il.distanceSqToPoint(e);if(s<r){let l=new b;il.closestPointToPoint(e,l),l.applyMatrix4(i);let c=a.ray.origin.distanceTo(l);if(c<a.near||c>a.far)return;n.push({distance:c,distanceToRay:Math.sqrt(s),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Fg=class extends er{constructor(e,t,r,i,a,n,o,s,l){super(e,t,r,i,a,n,o,s,l),this.isCanvasTexture=!0,this.needsUpdate=!0}},gu=class extends er{constructor(e,t,r=li,i,a,n,o=Kt,s=Kt,l,c=Qa,u=1){if(c!==Qa&&c!==Ua)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:u};super(h,i,a,n,o,s,c,r,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ml(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},fu=class extends er{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Lg=class Au extends Tt{constructor(t=1,r=1,i=4,a=8,n=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:r,capSegments:i,radialSegments:a,heightSegments:n},r=Math.max(0,r),i=Math.max(1,Math.floor(i)),a=Math.max(3,Math.floor(a)),n=Math.max(1,Math.floor(n));let o=[],s=[],l=[],c=[],u=r/2,h=Math.PI/2*t,d=r,g=2*h+d,m=i*2+n,A=a+1,f=new b,p=new b;for(let w=0;w<=m;w++){let C=0,x=0,T=0,y=0;if(w<=i){let D=w/i,M=D*Math.PI/2;x=-u-t*Math.cos(M),T=t*Math.sin(M),y=-t*Math.cos(M),C=D*h}else if(w<=i+n){let D=(w-i)/n;x=-u+D*r,T=t,y=0,C=h+D*d}else{let D=(w-i-n)/i,M=D*Math.PI/2;x=u+t*Math.sin(M),T=t*Math.cos(M),y=t*Math.sin(M),C=h+d+D*h}let S=Math.max(0,Math.min(1,C/g)),U=0;w===0?U=.5/a:w===m&&(U=-.5/a);for(let D=0;D<=a;D++){let M=D/a,I=M*Math.PI*2,H=Math.sin(I),k=Math.cos(I);p.x=-T*k,p.y=x,p.z=T*H,s.push(p.x,p.y,p.z),f.set(-T*k,y,T*H),f.normalize(),l.push(f.x,f.y,f.z),c.push(M+U,S)}if(w>0){let D=(w-1)*A;for(let M=0;M<a;M++){let I=D+M,H=D+M+1,k=w*A+M,G=w*A+M+1;o.push(I,H,k),o.push(H,G,k)}}}this.setIndex(o),this.setAttribute("position",new mt(s,3)),this.setAttribute("normal",new mt(l,3)),this.setAttribute("uv",new mt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Au(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Ng=class mu extends Tt{constructor(t=[new je(0,-.5),new je(.5,0),new je(0,.5)],r=12,i=0,a=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:r,phiStart:i,phiLength:a},r=Math.floor(r),a=Xe(a,0,Math.PI*2);let n=[],o=[],s=[],l=[],c=[],u=1/r,h=new b,d=new je,g=new b,m=new b,A=new b,f=0,p=0;for(let w=0;w<=t.length-1;w++)switch(w){case 0:f=t[w+1].x-t[w].x,p=t[w+1].y-t[w].y,g.x=p*1,g.y=-f,g.z=p*0,A.copy(g),g.normalize(),l.push(g.x,g.y,g.z);break;case t.length-1:l.push(A.x,A.y,A.z);break;default:f=t[w+1].x-t[w].x,p=t[w+1].y-t[w].y,g.x=p*1,g.y=-f,g.z=p*0,m.copy(g),g.x+=A.x,g.y+=A.y,g.z+=A.z,g.normalize(),l.push(g.x,g.y,g.z),A.copy(m)}for(let w=0;w<=r;w++){let C=i+w*u*a,x=Math.sin(C),T=Math.cos(C);for(let y=0;y<=t.length-1;y++){h.x=t[y].x*x,h.y=t[y].y,h.z=t[y].x*T,o.push(h.x,h.y,h.z),d.x=w/r,d.y=y/(t.length-1),s.push(d.x,d.y);let S=l[3*y+0]*x,U=l[3*y+1],D=l[3*y+0]*T;c.push(S,U,D)}}for(let w=0;w<r;w++)for(let C=0;C<t.length-1;C++){let x=C+w*t.length,T=x,y=x+t.length,S=x+t.length+1,U=x+1;n.push(T,y,U),n.push(S,U,y)}this.setIndex(n),this.setAttribute("position",new mt(o,3)),this.setAttribute("uv",new mt(s,2)),this.setAttribute("normal",new mt(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new mu(t.points,t.segments,t.phiStart,t.phiLength)}},Eu=class wu extends Tt{constructor(t=1,r=1,i=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:r,widthSegments:i,heightSegments:a};let n=t/2,o=r/2,s=Math.floor(i),l=Math.floor(a),c=s+1,u=l+1,h=t/s,d=r/l,g=[],m=[],A=[],f=[];for(let p=0;p<u;p++){let w=p*d-o;for(let C=0;C<c;C++){let x=C*h-n;m.push(x,-w,0),A.push(0,0,1),f.push(C/s),f.push(1-p/l)}}for(let p=0;p<l;p++)for(let w=0;w<s;w++){let C=w+c*p,x=w+c*(p+1),T=w+1+c*(p+1),y=w+1+c*p;g.push(C,x,y),g.push(x,T,y)}this.setIndex(g),this.setAttribute("position",new mt(m,3)),this.setAttribute("normal",new mt(A,3)),this.setAttribute("uv",new mt(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new wu(t.width,t.height,t.widthSegments,t.heightSegments)}},Pg=class Cu extends Tt{constructor(t=1,r=32,i=16,a=0,n=Math.PI*2,o=0,s=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:r,heightSegments:i,phiStart:a,phiLength:n,thetaStart:o,thetaLength:s},r=Math.max(3,Math.floor(r)),i=Math.max(2,Math.floor(i));let l=Math.min(o+s,Math.PI),c=0,u=[],h=new b,d=new b,g=[],m=[],A=[],f=[];for(let p=0;p<=i;p++){let w=[],C=p/i,x=0;p===0&&o===0?x=.5/r:p===i&&l===Math.PI&&(x=-.5/r);for(let T=0;T<=r;T++){let y=T/r;h.x=-t*Math.cos(a+y*n)*Math.sin(o+C*s),h.y=t*Math.cos(o+C*s),h.z=t*Math.sin(a+y*n)*Math.sin(o+C*s),m.push(h.x,h.y,h.z),d.copy(h).normalize(),A.push(d.x,d.y,d.z),f.push(y+x,1-C),w.push(c++)}u.push(w)}for(let p=0;p<i;p++)for(let w=0;w<r;w++){let C=u[p][w+1],x=u[p][w],T=u[p+1][w],y=u[p+1][w+1];(p!==0||o>0)&&g.push(C,x,y),(p!==i-1||l<Math.PI)&&g.push(x,T,y)}this.setIndex(g),this.setAttribute("position",new mt(m,3)),this.setAttribute("normal",new mt(A,3)),this.setAttribute("uv",new mt(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Cu(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Br=class extends Yr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ye(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Cl,this.normalScale=new je(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Sr,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Xn=class extends Br{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new je(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Xe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ye(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ye(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ye(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},Hg=class extends Yr{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Cl,this.normalScale=new je(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Sr,this.combine=pl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Gg=class extends Yr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ip,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Og=class extends Yr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function xn(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}function kg(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var jn=class{constructor(e,t,r,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(r),this.sampleValues=t,this.valueSize=r,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,r=this._cachedIndex,i=t[r],a=t[r-1];e:{t:{let n;r:{i:if(!(e<i)){for(let o=r+2;;){if(i===void 0){if(e<a)break i;return r=t.length,this._cachedIndex=r,this.copySampleValue_(r-1)}if(r===o)break;if(a=i,i=t[++r],e<i)break t}n=t.length;break r}if(!(e>=a)){let o=t[1];e<o&&(r=2,a=o);for(let s=r-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===s)break;if(i=a,a=t[--r-1],e>=a)break t}n=r,r=0;break r}break e}for(;r<n;){let o=r+n>>>1;e<t[o]?n=o:r=o+1}if(i=t[r],a=t[r-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return r=t.length,this._cachedIndex=r,this.copySampleValue_(r-1)}this._cachedIndex=r,this.intervalChanged_(r,a,i)}return this.interpolate_(r,a,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,r=this.sampleValues,i=this.valueSize,a=e*i;for(let n=0;n!==i;++n)t[n]=r[a+n];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Vg=class extends jn{constructor(e,t,r,i){super(e,t,r,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:yc,endingEnd:yc}}intervalChanged_(e,t,r){let i=this.parameterPositions,a=e-2,n=e+1,o=i[a],s=i[n];if(o===void 0)switch(this.getSettings_().endingStart){case Ic:a=e,o=2*t-r;break;case Rc:a=i.length-2,o=t+i[a]-i[a+1];break;default:a=e,o=r}if(s===void 0)switch(this.getSettings_().endingEnd){case Ic:n=e,s=2*r-t;break;case Rc:n=1,s=r+i[1]-i[0];break;default:n=e-1,s=t}let l=(r-t)*.5,c=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(s-r),this._offsetPrev=a*c,this._offsetNext=n*c}interpolate_(e,t,r,i){let a=this.resultBuffer,n=this.sampleValues,o=this.valueSize,s=e*o,l=s-o,c=this._offsetPrev,u=this._offsetNext,h=this._weightPrev,d=this._weightNext,g=(r-t)/(i-t),m=g*g,A=m*g,f=-h*A+2*h*m-h*g,p=(1+h)*A+(-1.5-2*h)*m+(-.5+h)*g+1,w=(-1-d)*A+(1.5+d)*m+.5*g,C=d*A-d*m;for(let x=0;x!==o;++x)a[x]=f*n[c+x]+p*n[l+x]+w*n[s+x]+C*n[u+x];return a}},zg=class extends jn{constructor(e,t,r,i){super(e,t,r,i)}interpolate_(e,t,r,i){let a=this.resultBuffer,n=this.sampleValues,o=this.valueSize,s=e*o,l=s-o,c=(r-t)/(i-t),u=1-c;for(let h=0;h!==o;++h)a[h]=n[l+h]*u+n[s+h]*c;return a}},Yg=class extends jn{constructor(e,t,r,i){super(e,t,r,i)}interpolate_(e){return this.copySampleValue_(e-1)}},Ar=class{constructor(e,t,r,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=xn(t,this.TimeBufferType),this.values=xn(r,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,r;if(t.toJSON!==this.toJSON)r=t.toJSON(e);else{r={name:e.name,times:xn(e.times,Array),values:xn(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(r.interpolation=i)}return r.type=e.ValueTypeName,r}InterpolantFactoryMethodDiscrete(e){return new Yg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new zg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Vg(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Hn:t=this.InterpolantFactoryMethodDiscrete;break;case tl:t=this.InterpolantFactoryMethodLinear;break;case Qs:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let r="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(r);return console.warn("THREE.KeyframeTrack:",r),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Hn;case this.InterpolantFactoryMethodLinear:return tl;case this.InterpolantFactoryMethodSmooth:return Qs}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let r=0,i=t.length;r!==i;++r)t[r]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let r=0,i=t.length;r!==i;++r)t[r]*=e}return this}trim(e,t){let r=this.times,i=r.length,a=0,n=i-1;for(;a!==i&&r[a]<e;)++a;for(;n!==-1&&r[n]>t;)--n;if(++n,a!==0||n!==i){a>=n&&(n=Math.max(n,1),a=n-1);let o=this.getValueSize();this.times=r.slice(a,n),this.values=this.values.slice(a*o,n*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let r=this.times,i=this.values,a=r.length;a===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let n=null;for(let o=0;o!==a;o++){let s=r[o];if(typeof s=="number"&&isNaN(s)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,s),e=!1;break}if(n!==null&&n>s){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,s,n),e=!1;break}n=s}if(i!==void 0&&kg(i))for(let o=0,s=i.length;o!==s;++o){let l=i[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),r=this.getValueSize(),i=this.getInterpolation()===Qs,a=e.length-1,n=1;for(let o=1;o<a;++o){let s=!1,l=e[o],c=e[o+1];if(l!==c&&(o!==1||l!==e[0]))if(i)s=!0;else{let u=o*r,h=u-r,d=u+r;for(let g=0;g!==r;++g){let m=t[u+g];if(m!==t[h+g]||m!==t[d+g]){s=!0;break}}}if(s){if(o!==n){e[n]=e[o];let u=o*r,h=n*r;for(let d=0;d!==r;++d)t[h+d]=t[u+d]}++n}}if(a>0){e[n]=e[a];for(let o=a*r,s=n*r,l=0;l!==r;++l)t[s+l]=t[o+l];++n}return n!==e.length?(this.times=e.slice(0,n),this.values=t.slice(0,n*r)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),r=this.constructor,i=new r(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};Ar.prototype.ValueTypeName="";Ar.prototype.TimeBufferType=Float32Array;Ar.prototype.ValueBufferType=Float32Array;Ar.prototype.DefaultInterpolation=tl;var Ha=class extends Ar{constructor(e,t,r){super(e,t,r)}};Ha.prototype.ValueTypeName="bool";Ha.prototype.ValueBufferType=Array;Ha.prototype.DefaultInterpolation=Hn;Ha.prototype.InterpolantFactoryMethodLinear=void 0;Ha.prototype.InterpolantFactoryMethodSmooth=void 0;var Wg=class extends Ar{constructor(e,t,r,i){super(e,t,r,i)}};Wg.prototype.ValueTypeName="color";var Jg=class extends Ar{constructor(e,t,r,i){super(e,t,r,i)}};Jg.prototype.ValueTypeName="number";var Kg=class extends jn{constructor(e,t,r,i){super(e,t,r,i)}interpolate_(e,t,r,i){let a=this.resultBuffer,n=this.sampleValues,o=this.valueSize,s=(r-t)/(i-t),l=e*o;for(let c=l+o;l!==c;l+=4)Zi.slerpFlat(a,0,n,l-o,n,l,s);return a}},vu=class extends Ar{constructor(e,t,r,i){super(e,t,r,i)}InterpolantFactoryMethodLinear(e){return new Kg(this.times,this.values,this.getValueSize(),e)}};vu.prototype.ValueTypeName="quaternion";vu.prototype.InterpolantFactoryMethodSmooth=void 0;var Ga=class extends Ar{constructor(e,t,r){super(e,t,r)}};Ga.prototype.ValueTypeName="string";Ga.prototype.ValueBufferType=Array;Ga.prototype.DefaultInterpolation=Hn;Ga.prototype.InterpolantFactoryMethodLinear=void 0;Ga.prototype.InterpolantFactoryMethodSmooth=void 0;var Xg=class extends Ar{constructor(e,t,r,i){super(e,t,r,i)}};Xg.prototype.ValueTypeName="vector";var jg=class{constructor(e,t,r){let i=this,a=!1,n=0,o=0,s,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=r,this.abortController=new AbortController,this.itemStart=function(c){o++,a===!1&&i.onStart!==void 0&&i.onStart(c,n,o),a=!0},this.itemEnd=function(c){n++,i.onProgress!==void 0&&i.onProgress(c,n,o),n===o&&(a=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(c){i.onError!==void 0&&i.onError(c)},this.resolveURL=function(c){return s?s(c):c},this.setURLModifier=function(c){return s=c,this},this.addHandler=function(c,u){return l.push(c,u),this},this.removeHandler=function(c){let u=l.indexOf(c);return u!==-1&&l.splice(u,2),this},this.getHandler=function(c){for(let u=0,h=l.length;u<h;u+=2){let d=l[u],g=l[u+1];if(d.global&&(d.lastIndex=0),d.test(c))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},qg=new jg,Zg=class{constructor(e){this.manager=e!==void 0?e:qg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let r=this;return new Promise(function(i,a){r.load(e,i,t,a)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Zg.DEFAULT_MATERIAL_NAME="__DEFAULT";var xl=class extends Rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ye(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},$g=class extends xl{constructor(e,t,r){super(e,r),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ye(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},io=new nt,nh=new b,sh=new b,Mu=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new je(512,512),this.mapType=cr,this.map=null,this.mapPass=null,this.matrix=new nt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Bl,this._frameExtents=new je(1,1),this._viewportCount=1,this._viewports=[new lt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,r=this.matrix;nh.setFromMatrixPosition(e.matrixWorld),t.position.copy(nh),sh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(sh),t.updateMatrixWorld(),io.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(io,t.coordinateSystem,t.reversedDepth),t.reversedDepth?r.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(io)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},oh=new nt,Da=new b,ao=new b,ef=class extends Mu{constructor(){super(new Jt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new je(4,2),this._viewportCount=6,this._viewports=[new lt(2,1,1,1),new lt(0,1,1,1),new lt(3,1,1,1),new lt(1,1,1,1),new lt(3,0,1,1),new lt(1,0,1,1)],this._cubeDirections=[new b(1,0,0),new b(-1,0,0),new b(0,0,1),new b(0,0,-1),new b(0,1,0),new b(0,-1,0)],this._cubeUps=[new b(0,1,0),new b(0,1,0),new b(0,1,0),new b(0,1,0),new b(0,0,1),new b(0,0,-1)]}updateMatrices(e,t=0){let r=this.camera,i=this.matrix,a=e.distance||r.far;a!==r.far&&(r.far=a,r.updateProjectionMatrix()),Da.setFromMatrixPosition(e.matrixWorld),r.position.copy(Da),ao.copy(r.position),ao.add(this._cubeDirections[t]),r.up.copy(this._cubeUps[t]),r.lookAt(ao),r.updateMatrixWorld(),i.makeTranslation(-Da.x,-Da.y,-Da.z),oh.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),this._frustum.setFromProjectionMatrix(oh,r.coordinateSystem,r.reversedDepth)}},tf=class extends xl{constructor(e,t,r=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=r,this.decay=i,this.shadow=new ef}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Du=class extends lu{constructor(e=-1,t=1,r=1,i=-1,a=.1,n=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=i,this.near=a,this.far=n,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,i,a,n){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=i,this.view.width=a,this.view.height=n,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,i=(this.top+this.bottom)/2,a=r-e,n=r+e,o=i+t,s=i-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=l*this.view.offsetX,n=a+l*this.view.width,o-=c*this.view.offsetY,s=o-c*this.view.height}this.projectionMatrix.makeOrthographic(a,n,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},rf=class extends Mu{constructor(){super(new Du(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},_l=class extends xl{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.shadow=new rf}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},af=class extends Tt{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}},nf=class extends Jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Sl="\\[\\]\\.:\\/",sf=new RegExp("["+Sl+"]","g"),yl="[^"+Sl+"]",of="[^"+Sl.replace("\\.","")+"]",lf=/((?:WC+[\/:])*)/.source.replace("WC",yl),cf=/(WCOD+)?/.source.replace("WCOD",of),hf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",yl),uf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",yl),df=new RegExp("^"+lf+cf+hf+uf+"$"),pf=["material","materials","bones","map"],gf=class{constructor(e,t,r){let i=r||At.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let r=this._targetGroup.nCachedObjects_,i=this._bindings[r];i!==void 0&&i.getValue(e,t)}setValue(e,t){let r=this._bindings;for(let i=this._targetGroup.nCachedObjects_,a=r.length;i!==a;++i)r[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,r=e.length;t!==r;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,r=e.length;t!==r;++t)e[t].unbind()}},At=class Ni{constructor(t,r,i){this.path=r,this.parsedPath=i||Ni.parseTrackName(r),this.node=Ni.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,r,i){return t&&t.isAnimationObjectGroup?new Ni.Composite(t,r,i):new Ni(t,r,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(sf,"")}static parseTrackName(t){let r=df.exec(t);if(r===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:r[2],objectName:r[3],objectIndex:r[4],propertyName:r[5],propertyIndex:r[6]},a=i.nodeName&&i.nodeName.lastIndexOf(".");if(a!==void 0&&a!==-1){let n=i.nodeName.substring(a+1);pf.indexOf(n)!==-1&&(i.nodeName=i.nodeName.substring(0,a),i.objectName=n)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,r){if(r===void 0||r===""||r==="."||r===-1||r===t.name||r===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(r);if(i!==void 0)return i}if(t.children){let i=function(n){for(let o=0;o<n.length;o++){let s=n[o];if(s.name===r||s.uuid===r)return s;let l=i(s.children);if(l)return l}return null},a=i(t.children);if(a)return a}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,r){t[r]=this.targetObject[this.propertyName]}_getValue_array(t,r){let i=this.resolvedProperty;for(let a=0,n=i.length;a!==n;++a)t[r++]=i[a]}_getValue_arrayElement(t,r){t[r]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,r){this.resolvedProperty.toArray(t,r)}_setValue_direct(t,r){this.targetObject[this.propertyName]=t[r]}_setValue_direct_setNeedsUpdate(t,r){this.targetObject[this.propertyName]=t[r],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,r){this.targetObject[this.propertyName]=t[r],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,r){let i=this.resolvedProperty;for(let a=0,n=i.length;a!==n;++a)i[a]=t[r++]}_setValue_array_setNeedsUpdate(t,r){let i=this.resolvedProperty;for(let a=0,n=i.length;a!==n;++a)i[a]=t[r++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,r){let i=this.resolvedProperty;for(let a=0,n=i.length;a!==n;++a)i[a]=t[r++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,r){this.resolvedProperty[this.propertyIndex]=t[r]}_setValue_arrayElement_setNeedsUpdate(t,r){this.resolvedProperty[this.propertyIndex]=t[r],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,r){this.resolvedProperty[this.propertyIndex]=t[r],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,r){this.resolvedProperty.fromArray(t,r)}_setValue_fromArray_setNeedsUpdate(t,r){this.resolvedProperty.fromArray(t,r),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,r){this.resolvedProperty.fromArray(t,r),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,r){this.bind(),this.getValue(t,r)}_setValue_unbound(t,r){this.bind(),this.setValue(t,r)}bind(){let t=this.node,r=this.parsedPath,i=r.objectName,a=r.propertyName,n=r.propertyIndex;if(t||(t=Ni.findNode(this.rootNode,r.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=r.objectIndex;switch(i){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[a];if(o===void 0){let c=r.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+a+" but it wasn't found.",t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(n!==void 0){if(a==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[n]!==void 0&&(n=t.morphTargetDictionary[n])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=n}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=a;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};At.Composite=gf;At.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};At.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};At.prototype.GetterByBindingType=[At.prototype._getValue_direct,At.prototype._getValue_array,At.prototype._getValue_arrayElement,At.prototype._getValue_toArray];At.prototype.SetterByBindingTypeAndVersioning=[[At.prototype._setValue_direct,At.prototype._setValue_direct_setNeedsUpdate,At.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[At.prototype._setValue_array,At.prototype._setValue_array_setNeedsUpdate,At.prototype._setValue_array_setMatrixWorldNeedsUpdate],[At.prototype._setValue_arrayElement,At.prototype._setValue_arrayElement_setNeedsUpdate,At.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[At.prototype._setValue_fromArray,At.prototype._setValue_fromArray_setNeedsUpdate,At.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var gv=new Float32Array(1),lh=new nt,ff=class{constructor(e,t,r=0,i=1/0){this.ray=new Kn(e,t),this.near=r,this.far=i,this.camera=null,this.layers=new Dl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return lh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(lh),this}intersectObject(e,t=!0,r=[]){return al(e,this,r,t),r.sort(ch),r}intersectObjects(e,t=!0,r=[]){for(let i=0,a=e.length;i<a;i++)al(e[i],this,r,t);return r.sort(ch),r}};function ch(e,t){return e.distance-t.distance}function al(e,t,r,i){let a=!0;if(e.layers.test(t.layers)&&e.raycast(t,r)===!1&&(a=!1),a===!0&&i===!0){let n=e.children;for(let o=0,s=n.length;o<s;o++)al(n[o],t,r,!0)}}function hh(e,t,r,i){let a=Af(i);switch(r){case zh:return e*t;case Jn:return e*t/a.components*a.byteLength;case ml:return e*t/a.components*a.byteLength;case Wh:return e*t*2/a.components*a.byteLength;case El:return e*t*2/a.components*a.byteLength;case Yh:return e*t*3/a.components*a.byteLength;case lr:return e*t*4/a.components*a.byteLength;case wl:return e*t*4/a.components*a.byteLength;case Rn:case Tn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case bn:case Qn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case yo:case Ro:return Math.max(e,16)*Math.max(t,8)/4;case So:case Io:return Math.max(e,8)*Math.max(t,8)/2;case To:case bo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Qo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Uo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Fo:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Lo:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case No:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Po:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Ho:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Go:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Oo:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case ko:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Vo:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case zo:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Yo:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Wo:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Jo:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Ko:case Xo:case jo:return Math.ceil(e/4)*Math.ceil(t/4)*16;case qo:case Zo:return Math.ceil(e/4)*Math.ceil(t/4)*8;case $o:case el:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${r} format.`)}function Af(e){switch(e){case cr:case Gh:return{byteLength:1,components:1};case Ta:case Oh:case Pa:return{byteLength:2,components:1};case fl:case Al:return{byteLength:2,components:4};case li:case gl:case pr:return{byteLength:4,components:1};case kh:case Vh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window!="undefined"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function Bu(){let e=null,t=!1,r=null,i=null;function a(n,o){r(n,o),i=e.requestAnimationFrame(a)}return{start:function(){t!==!0&&r!==null&&(i=e.requestAnimationFrame(a),t=!0)},stop:function(){e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(n){r=n},setContext:function(n){e=n}}}function mf(e){let t=new WeakMap;function r(s,l){let c=s.array,u=s.usage,h=c.byteLength,d=e.createBuffer();e.bindBuffer(l,d),e.bufferData(l,c,u),s.onUploadCallback();let g;if(c instanceof Float32Array)g=e.FLOAT;else if(typeof Float16Array!="undefined"&&c instanceof Float16Array)g=e.HALF_FLOAT;else if(c instanceof Uint16Array)s.isFloat16BufferAttribute?g=e.HALF_FLOAT:g=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)g=e.SHORT;else if(c instanceof Uint32Array)g=e.UNSIGNED_INT;else if(c instanceof Int32Array)g=e.INT;else if(c instanceof Int8Array)g=e.BYTE;else if(c instanceof Uint8Array)g=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)g=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:g,bytesPerElement:c.BYTES_PER_ELEMENT,version:s.version,size:h}}function i(s,l,c){let u=l.array,h=l.updateRanges;if(e.bindBuffer(c,s),h.length===0)e.bufferSubData(c,0,u);else{h.sort((g,m)=>g.start-m.start);let d=0;for(let g=1;g<h.length;g++){let m=h[d],A=h[g];A.start<=m.start+m.count+1?m.count=Math.max(m.count,A.start+A.count-m.start):(++d,h[d]=A)}h.length=d+1;for(let g=0,m=h.length;g<m;g++){let A=h[g];e.bufferSubData(c,A.start*u.BYTES_PER_ELEMENT,u,A.start,A.count)}l.clearUpdateRanges()}l.onUploadCallback()}function a(s){return s.isInterleavedBufferAttribute&&(s=s.data),t.get(s)}function n(s){s.isInterleavedBufferAttribute&&(s=s.data);let l=t.get(s);l&&(e.deleteBuffer(l.buffer),t.delete(s))}function o(s,l){if(s.isInterleavedBufferAttribute&&(s=s.data),s.isGLBufferAttribute){let u=t.get(s);(!u||u.version<s.version)&&t.set(s,{buffer:s.buffer,type:s.type,bytesPerElement:s.elementSize,version:s.version});return}let c=t.get(s);if(c===void 0)t.set(s,r(s,l));else if(c.version<s.version){if(c.size!==s.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,s,l),c.version=s.version}}return{get:a,remove:n,update:o}}var Ef=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,wf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Cf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,vf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Mf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Df=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Bf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,xf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,_f=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Sf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,yf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,If=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Rf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Tf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Qf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Uf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ff=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Lf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Nf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Pf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Hf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Gf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Of=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,kf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Vf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,zf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Yf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Wf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Jf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Kf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Xf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,jf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,qf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Zf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,$f=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,eA=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,tA=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,rA=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,iA=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,aA=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,nA=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,sA=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,oA=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lA=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cA=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,hA=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,uA=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,dA=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,pA=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,gA=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,fA=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,AA=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,mA=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,EA=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,wA=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,CA=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,vA=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,MA=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,DA=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,BA=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,xA=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,_A=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,SA=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,yA=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,IA=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,RA=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,TA=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,bA=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,QA=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,UA=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,FA=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,LA=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,NA=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,PA=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,HA=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,GA=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,OA=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,kA=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,VA=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,zA=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,YA=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,WA=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,JA=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,KA=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,XA=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jA=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,qA=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ZA=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$A=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,em=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,tm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,rm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,im=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,am=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,nm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,sm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,om=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,lm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,hm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,um=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,dm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,pm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,gm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,fm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Am=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,mm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Em=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Cm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Bm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,xm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,_m=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Sm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ym=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Im=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Rm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Tm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,bm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Um=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Lm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Nm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Pm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Hm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Om=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,km=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ym=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Wm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Jm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Km=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,jm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,We={alphahash_fragment:Ef,alphahash_pars_fragment:wf,alphamap_fragment:Cf,alphamap_pars_fragment:vf,alphatest_fragment:Mf,alphatest_pars_fragment:Df,aomap_fragment:Bf,aomap_pars_fragment:xf,batching_pars_vertex:_f,batching_vertex:Sf,begin_vertex:yf,beginnormal_vertex:If,bsdfs:Rf,iridescence_fragment:Tf,bumpmap_pars_fragment:bf,clipping_planes_fragment:Qf,clipping_planes_pars_fragment:Uf,clipping_planes_pars_vertex:Ff,clipping_planes_vertex:Lf,color_fragment:Nf,color_pars_fragment:Pf,color_pars_vertex:Hf,color_vertex:Gf,common:Of,cube_uv_reflection_fragment:kf,defaultnormal_vertex:Vf,displacementmap_pars_vertex:zf,displacementmap_vertex:Yf,emissivemap_fragment:Wf,emissivemap_pars_fragment:Jf,colorspace_fragment:Kf,colorspace_pars_fragment:Xf,envmap_fragment:jf,envmap_common_pars_fragment:qf,envmap_pars_fragment:Zf,envmap_pars_vertex:$f,envmap_physical_pars_fragment:hA,envmap_vertex:eA,fog_vertex:tA,fog_pars_vertex:rA,fog_fragment:iA,fog_pars_fragment:aA,gradientmap_pars_fragment:nA,lightmap_pars_fragment:sA,lights_lambert_fragment:oA,lights_lambert_pars_fragment:lA,lights_pars_begin:cA,lights_toon_fragment:uA,lights_toon_pars_fragment:dA,lights_phong_fragment:pA,lights_phong_pars_fragment:gA,lights_physical_fragment:fA,lights_physical_pars_fragment:AA,lights_fragment_begin:mA,lights_fragment_maps:EA,lights_fragment_end:wA,logdepthbuf_fragment:CA,logdepthbuf_pars_fragment:vA,logdepthbuf_pars_vertex:MA,logdepthbuf_vertex:DA,map_fragment:BA,map_pars_fragment:xA,map_particle_fragment:_A,map_particle_pars_fragment:SA,metalnessmap_fragment:yA,metalnessmap_pars_fragment:IA,morphinstance_vertex:RA,morphcolor_vertex:TA,morphnormal_vertex:bA,morphtarget_pars_vertex:QA,morphtarget_vertex:UA,normal_fragment_begin:FA,normal_fragment_maps:LA,normal_pars_fragment:NA,normal_pars_vertex:PA,normal_vertex:HA,normalmap_pars_fragment:GA,clearcoat_normal_fragment_begin:OA,clearcoat_normal_fragment_maps:kA,clearcoat_pars_fragment:VA,iridescence_pars_fragment:zA,opaque_fragment:YA,packing:WA,premultiplied_alpha_fragment:JA,project_vertex:KA,dithering_fragment:XA,dithering_pars_fragment:jA,roughnessmap_fragment:qA,roughnessmap_pars_fragment:ZA,shadowmap_pars_fragment:$A,shadowmap_pars_vertex:em,shadowmap_vertex:tm,shadowmask_pars_fragment:rm,skinbase_vertex:im,skinning_pars_vertex:am,skinning_vertex:nm,skinnormal_vertex:sm,specularmap_fragment:om,specularmap_pars_fragment:lm,tonemapping_fragment:cm,tonemapping_pars_fragment:hm,transmission_fragment:um,transmission_pars_fragment:dm,uv_pars_fragment:pm,uv_pars_vertex:gm,uv_vertex:fm,worldpos_vertex:Am,background_vert:mm,background_frag:Em,backgroundCube_vert:wm,backgroundCube_frag:Cm,cube_vert:vm,cube_frag:Mm,depth_vert:Dm,depth_frag:Bm,distanceRGBA_vert:xm,distanceRGBA_frag:_m,equirect_vert:Sm,equirect_frag:ym,linedashed_vert:Im,linedashed_frag:Rm,meshbasic_vert:Tm,meshbasic_frag:bm,meshlambert_vert:Qm,meshlambert_frag:Um,meshmatcap_vert:Fm,meshmatcap_frag:Lm,meshnormal_vert:Nm,meshnormal_frag:Pm,meshphong_vert:Hm,meshphong_frag:Gm,meshphysical_vert:Om,meshphysical_frag:km,meshtoon_vert:Vm,meshtoon_frag:zm,points_vert:Ym,points_frag:Wm,shadow_vert:Jm,shadow_frag:Km,sprite_vert:Xm,sprite_frag:jm},Ce={common:{diffuse:{value:new Ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Je},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Je}},envmap:{envMap:{value:null},envMapRotation:{value:new Je},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Je},normalScale:{value:new je(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0},uvTransform:{value:new Je}},sprite:{diffuse:{value:new Ye(16777215)},opacity:{value:1},center:{value:new je(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Je},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0}}},dr={basic:{uniforms:Ft([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:Ft([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new Ye(0)}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:Ft([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new Ye(0)},specular:{value:new Ye(1118481)},shininess:{value:30}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:Ft([Ce.common,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.roughnessmap,Ce.metalnessmap,Ce.fog,Ce.lights,{emissive:{value:new Ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:Ft([Ce.common,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.gradientmap,Ce.fog,Ce.lights,{emissive:{value:new Ye(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:Ft([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:Ft([Ce.points,Ce.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:Ft([Ce.common,Ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:Ft([Ce.common,Ce.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:Ft([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:Ft([Ce.sprite,Ce.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new Je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Je}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distanceRGBA:{uniforms:Ft([Ce.common,Ce.displacementmap,{referencePosition:{value:new b},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distanceRGBA_vert,fragmentShader:We.distanceRGBA_frag},shadow:{uniforms:Ft([Ce.lights,Ce.fog,{color:{value:new Ye(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};dr.physical={uniforms:Ft([dr.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Je},clearcoatNormalScale:{value:new je(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Je},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Je},sheen:{value:0},sheenColor:{value:new Ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Je},transmissionSamplerSize:{value:new je},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Je},attenuationDistance:{value:0},attenuationColor:{value:new Ye(0)},specularColor:{value:new Ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Je},anisotropyVector:{value:new je},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Je}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};var _n={r:0,b:0,g:0},ei=new Sr,qm=new nt;function Zm(e,t,r,i,a,n,o){let s=new Ye(0),l=n===!0?0:1,c,u,h=null,d=0,g=null;function m(C){let x=C.isScene===!0?C.background:null;return x&&x.isTexture&&(x=(C.backgroundBlurriness>0?r:t).get(x)),x}function A(C){let x=!1,T=m(C);T===null?p(s,l):T&&T.isColor&&(p(T,1),x=!0);let y=e.xr.getEnvironmentBlendMode();y==="additive"?i.buffers.color.setClear(0,0,0,1,o):y==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(e.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function f(C,x){let T=m(x);T&&(T.isCubeTexture||T.mapping===Wn)?(u===void 0&&(u=new Ze(new Wt(1,1,1),new fr({name:"BackgroundCubeMaterial",uniforms:Ki(dr.backgroundCube.uniforms),vertexShader:dr.backgroundCube.vertexShader,fragmentShader:dr.backgroundCube.fragmentShader,side:Nt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(y,S,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(u)),ei.copy(x.backgroundRotation),ei.x*=-1,ei.y*=-1,ei.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(ei.y*=-1,ei.z*=-1),u.material.uniforms.envMap.value=T,u.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(qm.makeRotationFromEuler(ei)),u.material.toneMapped=tt.getTransfer(T.colorSpace)!==at,(h!==T||d!==T.version||g!==e.toneMapping)&&(u.material.needsUpdate=!0,h=T,d=T.version,g=e.toneMapping),u.layers.enableAll(),C.unshift(u,u.geometry,u.material,0,0,null)):T&&T.isTexture&&(c===void 0&&(c=new Ze(new Eu(2,2),new fr({name:"BackgroundMaterial",uniforms:Ki(dr.background.uniforms),vertexShader:dr.background.vertexShader,fragmentShader:dr.background.fragmentShader,side:Vr,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(c)),c.material.uniforms.t2D.value=T,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=tt.getTransfer(T.colorSpace)!==at,T.matrixAutoUpdate===!0&&T.updateMatrix(),c.material.uniforms.uvTransform.value.copy(T.matrix),(h!==T||d!==T.version||g!==e.toneMapping)&&(c.material.needsUpdate=!0,h=T,d=T.version,g=e.toneMapping),c.layers.enableAll(),C.unshift(c,c.geometry,c.material,0,0,null))}function p(C,x){C.getRGB(_n,ou(e)),i.buffers.color.setClear(_n.r,_n.g,_n.b,x,o)}function w(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return s},setClearColor:function(C,x=1){s.set(C),l=x,p(s,l)},getClearAlpha:function(){return l},setClearAlpha:function(C){l=C,p(s,l)},render:A,addToRenderList:f,dispose:w}}function $m(e,t){let r=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},a=d(null),n=a,o=!1;function s(M,I,H,k,G){let Z=!1,V=h(k,H,I);n!==V&&(n=V,c(n.object)),Z=g(M,k,H,G),Z&&m(M,k,H,G),G!==null&&t.update(G,e.ELEMENT_ARRAY_BUFFER),(Z||o)&&(o=!1,x(M,I,H,k),G!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(G).buffer))}function l(){return e.createVertexArray()}function c(M){return e.bindVertexArray(M)}function u(M){return e.deleteVertexArray(M)}function h(M,I,H){let k=H.wireframe===!0,G=i[M.id];G===void 0&&(G={},i[M.id]=G);let Z=G[I.id];Z===void 0&&(Z={},G[I.id]=Z);let V=Z[k];return V===void 0&&(V=d(l()),Z[k]=V),V}function d(M){let I=[],H=[],k=[];for(let G=0;G<r;G++)I[G]=0,H[G]=0,k[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:H,attributeDivisors:k,object:M,attributes:{},index:null}}function g(M,I,H,k){let G=n.attributes,Z=I.attributes,V=0,$=H.getAttributes();for(let J in $)if($[J].location>=0){let te=G[J],Ae=Z[J];if(Ae===void 0&&(J==="instanceMatrix"&&M.instanceMatrix&&(Ae=M.instanceMatrix),J==="instanceColor"&&M.instanceColor&&(Ae=M.instanceColor)),te===void 0||te.attribute!==Ae||Ae&&te.data!==Ae.data)return!0;V++}return n.attributesNum!==V||n.index!==k}function m(M,I,H,k){let G={},Z=I.attributes,V=0,$=H.getAttributes();for(let J in $)if($[J].location>=0){let te=Z[J];te===void 0&&(J==="instanceMatrix"&&M.instanceMatrix&&(te=M.instanceMatrix),J==="instanceColor"&&M.instanceColor&&(te=M.instanceColor));let Ae={};Ae.attribute=te,te&&te.data&&(Ae.data=te.data),G[J]=Ae,V++}n.attributes=G,n.attributesNum=V,n.index=k}function A(){let M=n.newAttributes;for(let I=0,H=M.length;I<H;I++)M[I]=0}function f(M){p(M,0)}function p(M,I){let H=n.newAttributes,k=n.enabledAttributes,G=n.attributeDivisors;H[M]=1,k[M]===0&&(e.enableVertexAttribArray(M),k[M]=1),G[M]!==I&&(e.vertexAttribDivisor(M,I),G[M]=I)}function w(){let M=n.newAttributes,I=n.enabledAttributes;for(let H=0,k=I.length;H<k;H++)I[H]!==M[H]&&(e.disableVertexAttribArray(H),I[H]=0)}function C(M,I,H,k,G,Z,V){V===!0?e.vertexAttribIPointer(M,I,H,G,Z):e.vertexAttribPointer(M,I,H,k,G,Z)}function x(M,I,H,k){A();let G=k.attributes,Z=H.getAttributes(),V=I.defaultAttributeValues;for(let $ in Z){let J=Z[$];if(J.location>=0){let te=G[$];if(te===void 0&&($==="instanceMatrix"&&M.instanceMatrix&&(te=M.instanceMatrix),$==="instanceColor"&&M.instanceColor&&(te=M.instanceColor)),te!==void 0){let Ae=te.normalized,Ue=te.itemSize,Pe=t.get(te);if(Pe===void 0)continue;let qe=Pe.buffer,He=Pe.type,O=Pe.bytesPerElement,ce=He===e.INT||He===e.UNSIGNED_INT||te.gpuType===gl;if(te.isInterleavedBufferAttribute){let P=te.data,L=P.stride,X=te.offset;if(P.isInstancedInterleavedBuffer){for(let z=0;z<J.locationSize;z++)p(J.location+z,P.meshPerAttribute);M.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=P.meshPerAttribute*P.count)}else for(let z=0;z<J.locationSize;z++)f(J.location+z);e.bindBuffer(e.ARRAY_BUFFER,qe);for(let z=0;z<J.locationSize;z++)C(J.location+z,Ue/J.locationSize,He,Ae,L*O,(X+Ue/J.locationSize*z)*O,ce)}else{if(te.isInstancedBufferAttribute){for(let P=0;P<J.locationSize;P++)p(J.location+P,te.meshPerAttribute);M.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let P=0;P<J.locationSize;P++)f(J.location+P);e.bindBuffer(e.ARRAY_BUFFER,qe);for(let P=0;P<J.locationSize;P++)C(J.location+P,Ue/J.locationSize,He,Ae,Ue*O,Ue/J.locationSize*P*O,ce)}}else if(V!==void 0){let Ae=V[$];if(Ae!==void 0)switch(Ae.length){case 2:e.vertexAttrib2fv(J.location,Ae);break;case 3:e.vertexAttrib3fv(J.location,Ae);break;case 4:e.vertexAttrib4fv(J.location,Ae);break;default:e.vertexAttrib1fv(J.location,Ae)}}}}w()}function T(){U();for(let M in i){let I=i[M];for(let H in I){let k=I[H];for(let G in k)u(k[G].object),delete k[G];delete I[H]}delete i[M]}}function y(M){if(i[M.id]===void 0)return;let I=i[M.id];for(let H in I){let k=I[H];for(let G in k)u(k[G].object),delete k[G];delete I[H]}delete i[M.id]}function S(M){for(let I in i){let H=i[I];if(H[M.id]===void 0)continue;let k=H[M.id];for(let G in k)u(k[G].object),delete k[G];delete H[M.id]}}function U(){D(),o=!0,n!==a&&(n=a,c(n.object))}function D(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:s,reset:U,resetDefaultState:D,dispose:T,releaseStatesOfGeometry:y,releaseStatesOfProgram:S,initAttributes:A,enableAttribute:f,disableUnusedAttributes:w}}function eE(e,t,r){let i;function a(c){i=c}function n(c,u){e.drawArrays(i,c,u),r.update(u,i,1)}function o(c,u,h){h!==0&&(e.drawArraysInstanced(i,c,u,h),r.update(u,i,h))}function s(c,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let d=0;for(let g=0;g<h;g++)d+=u[g];r.update(d,i,1)}function l(c,u,h,d){if(h===0)return;let g=t.get("WEBGL_multi_draw");if(g===null)for(let m=0;m<c.length;m++)o(c[m],u[m],d[m]);else{g.multiDrawArraysInstancedWEBGL(i,c,0,u,0,d,0,h);let m=0;for(let A=0;A<h;A++)m+=u[A]*d[A];r.update(m,i,1)}}this.setMode=a,this.render=n,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=l}function tE(e,t,r,i){let a;function n(){if(a!==void 0)return a;if(t.has("EXT_texture_filter_anisotropic")===!0){let S=t.get("EXT_texture_filter_anisotropic");a=e.getParameter(S.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function o(S){return!(S!==lr&&i.convert(S)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function s(S){let U=S===Pa&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(S!==cr&&i.convert(S)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&S!==pr&&!U)}function l(S){if(S==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";S="mediump"}return S==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=r.precision!==void 0?r.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=r.logarithmicDepthBuffer===!0,d=r.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),g=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),A=e.getParameter(e.MAX_TEXTURE_SIZE),f=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),p=e.getParameter(e.MAX_VERTEX_ATTRIBS),w=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),C=e.getParameter(e.MAX_VARYING_VECTORS),x=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),T=m>0,y=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:n,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:s,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:g,maxVertexTextures:m,maxTextureSize:A,maxCubemapSize:f,maxAttributes:p,maxVertexUniforms:w,maxVaryings:C,maxFragmentUniforms:x,vertexTextures:T,maxSamples:y}}function rE(e){let t=this,r=null,i=0,a=!1,n=!1,o=new Pr,s=new Je,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let g=h.length!==0||d||i!==0||a;return a=d,i=h.length,g},this.beginShadows=function(){n=!0,u(null)},this.endShadows=function(){n=!1},this.setGlobalState=function(h,d){r=u(h,d,0)},this.setState=function(h,d,g){let m=h.clippingPlanes,A=h.clipIntersection,f=h.clipShadows,p=e.get(h);if(!a||m===null||m.length===0||n&&!f)n?u(null):c();else{let w=n?0:i,C=w*4,x=p.clippingState||null;l.value=x,x=u(m,d,C,g);for(let T=0;T!==C;++T)x[T]=r[T];p.clippingState=x,this.numIntersection=A?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==r&&(l.value=r,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function u(h,d,g,m){let A=h!==null?h.length:0,f=null;if(A!==0){if(f=l.value,m!==!0||f===null){let p=g+A*4,w=d.matrixWorldInverse;s.getNormalMatrix(w),(f===null||f.length<p)&&(f=new Float32Array(p));for(let C=0,x=g;C!==A;++C,x+=4)o.copy(h[C]).applyMatrix4(w,s),o.normal.toArray(f,x),f[x+3]=o.constant}l.value=f,l.needsUpdate=!0}return t.numPlanes=A,t.numIntersection=0,f}}function iE(e){let t=new WeakMap;function r(o,s){return s===Bo?o.mapping=Yi:s===xo&&(o.mapping=Wi),o}function i(o){if(o&&o.isTexture){let s=o.mapping;if(s===Bo||s===xo)if(t.has(o)){let l=t.get(o).texture;return r(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new xg(l.height);return c.fromEquirectangularTexture(e,o),t.set(o,c),o.addEventListener("dispose",a),r(c.texture,o.mapping)}else return null}}return o}function a(o){let s=o.target;s.removeEventListener("dispose",a);let l=t.get(s);l!==void 0&&(t.delete(s),l.dispose())}function n(){t=new WeakMap}return{get:i,dispose:n}}var Hi=4,uh=[.125,.215,.35,.446,.526,.582],ai=20,no=new Du,dh=new Ye,so=null,oo=0,lo=0,co=!1,ri=(1+Math.sqrt(5))/2,Qi=1/ri,ph=[new b(-ri,Qi,0),new b(ri,Qi,0),new b(-Qi,0,ri),new b(Qi,0,ri),new b(0,ri,-Qi),new b(0,ri,Qi),new b(-1,1,-1),new b(1,1,-1),new b(-1,1,1),new b(1,1,1)],aE=new b,nl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,r=.1,i=100,a={}){let{size:n=256,position:o=aE}=a;so=this._renderer.getRenderTarget(),oo=this._renderer.getActiveCubeFace(),lo=this._renderer.getActiveMipmapLevel(),co=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(n);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,r,i,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ah(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(so,oo,lo),this._renderer.xr.enabled=co,e.scissorTest=!1,Sn(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Yi||e.mapping===Wi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),so=this._renderer.getRenderTarget(),oo=this._renderer.getActiveCubeFace(),lo=this._renderer.getActiveMipmapLevel(),co=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:or,minFilter:or,generateMipmaps:!1,type:Pa,format:lr,colorSpace:Ji,depthBuffer:!1},i=gh(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=gh(e,t,r);let{_lodMax:a}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=nE(a)),this._blurMaterial=sE(a,e,t)}return i}_compileMaterial(e){let t=new Ze(this._lodPlanes[0],e);this._renderer.compile(t,no)}_sceneToCubeUV(e,t,r,i,a){let n=new Jt(90,1,t,r),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],l=this._renderer,c=l.autoClear,u=l.toneMapping;l.getClearColor(dh),l.toneMapping=Or,l.autoClear=!1,l.state.buffers.depth.getReversed()&&(l.setRenderTarget(i),l.clearDepth(),l.setRenderTarget(null));let h=new ru({name:"PMREM.Background",side:Nt,depthWrite:!1,depthTest:!1}),d=new Ze(new Wt,h),g=!1,m=e.background;m?m.isColor&&(h.color.copy(m),e.background=null,g=!0):(h.color.copy(dh),g=!0);for(let A=0;A<6;A++){let f=A%3;f===0?(n.up.set(0,o[A],0),n.position.set(a.x,a.y,a.z),n.lookAt(a.x+s[A],a.y,a.z)):f===1?(n.up.set(0,0,o[A]),n.position.set(a.x,a.y,a.z),n.lookAt(a.x,a.y+s[A],a.z)):(n.up.set(0,o[A],0),n.position.set(a.x,a.y,a.z),n.lookAt(a.x,a.y,a.z+s[A]));let p=this._cubeSize;Sn(i,f*p,A>2?p:0,p,p),l.setRenderTarget(i),g&&l.render(d,n),l.render(e,n)}d.geometry.dispose(),d.material.dispose(),l.toneMapping=u,l.autoClear=c,e.background=m}_textureToCubeUV(e,t){let r=this._renderer,i=e.mapping===Yi||e.mapping===Wi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ah()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=fh());let a=i?this._cubemapMaterial:this._equirectMaterial,n=new Ze(this._lodPlanes[0],a),o=a.uniforms;o.envMap.value=e;let s=this._cubeSize;Sn(t,0,0,3*s,2*s),r.setRenderTarget(t),r.render(n,no)}_applyPMREM(e){let t=this._renderer,r=t.autoClear;t.autoClear=!1;let i=this._lodPlanes.length;for(let a=1;a<i;a++){let n=Math.sqrt(this._sigmas[a]*this._sigmas[a]-this._sigmas[a-1]*this._sigmas[a-1]),o=ph[(i-a-1)%ph.length];this._blur(e,a-1,a,n,o)}t.autoClear=r}_blur(e,t,r,i,a){let n=this._pingPongRenderTarget;this._halfBlur(e,n,t,r,i,"latitudinal",a),this._halfBlur(n,e,r,r,i,"longitudinal",a)}_halfBlur(e,t,r,i,a,n,o){let s=this._renderer,l=this._blurMaterial;n!=="latitudinal"&&n!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let c=3,u=new Ze(this._lodPlanes[i],l),h=l.uniforms,d=this._sizeLods[r]-1,g=isFinite(a)?Math.PI/(2*d):2*Math.PI/(2*ai-1),m=a/g,A=isFinite(a)?1+Math.floor(c*m):ai;A>ai&&console.warn(`sigmaRadians, ${a}, is too large and will clip, as it requested ${A} samples when the maximum is set to ${ai}`);let f=[],p=0;for(let y=0;y<ai;++y){let S=y/m,U=Math.exp(-S*S/2);f.push(U),y===0?p+=U:y<A&&(p+=2*U)}for(let y=0;y<f.length;y++)f[y]=f[y]/p;h.envMap.value=e.texture,h.samples.value=A,h.weights.value=f,h.latitudinal.value=n==="latitudinal",o&&(h.poleAxis.value=o);let{_lodMax:w}=this;h.dTheta.value=g,h.mipInt.value=w-r;let C=this._sizeLods[i],x=3*C*(i>w-Hi?i-w+Hi:0),T=4*(this._cubeSize-C);Sn(t,x,T,3*C,2*C),s.setRenderTarget(t),s.render(u,no)}};function nE(e){let t=[],r=[],i=[],a=e,n=e-Hi+1+uh.length;for(let o=0;o<n;o++){let s=Math.pow(2,a);r.push(s);let l=1/s;o>e-Hi?l=uh[o-e+Hi-1]:o===0&&(l=0),i.push(l);let c=1/(s-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],g=6,m=6,A=3,f=2,p=1,w=new Float32Array(A*m*g),C=new Float32Array(f*m*g),x=new Float32Array(p*m*g);for(let y=0;y<g;y++){let S=y%3*2/3-1,U=y>2?0:-1,D=[S,U,0,S+2/3,U,0,S+2/3,U+1,0,S,U,0,S+2/3,U+1,0,S,U+1,0];w.set(D,A*m*y),C.set(d,f*m*y);let M=[y,y,y,y,y,y];x.set(M,p*m*y)}let T=new Tt;T.setAttribute("position",new It(w,A)),T.setAttribute("uv",new It(C,f)),T.setAttribute("faceIndex",new It(x,p)),t.push(T),a>Hi&&a--}return{lodPlanes:t,sizeLods:r,sigmas:i}}function gh(e,t,r){let i=new zr(e,t,r);return i.texture.mapping=Wn,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Sn(e,t,r,i,a){e.viewport.set(t,r,i,a),e.scissor.set(t,r,i,a)}function sE(e,t,r){let i=new Float32Array(ai),a=new b(0,1,0);return new fr({name:"SphericalGaussianBlur",defines:{n:ai,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/r,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:Il(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Gr,depthTest:!1,depthWrite:!1})}function fh(){return new fr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Il(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Gr,depthTest:!1,depthWrite:!1})}function Ah(){return new fr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Il(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Gr,depthTest:!1,depthWrite:!1})}function Il(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function oE(e){let t=new WeakMap,r=null;function i(s){if(s&&s.isTexture){let l=s.mapping,c=l===Bo||l===xo,u=l===Yi||l===Wi;if(c||u){let h=t.get(s),d=h!==void 0?h.texture.pmremVersion:0;if(s.isRenderTargetTexture&&s.pmremVersion!==d)return r===null&&(r=new nl(e)),h=c?r.fromEquirectangular(s,h):r.fromCubemap(s,h),h.texture.pmremVersion=s.pmremVersion,t.set(s,h),h.texture;if(h!==void 0)return h.texture;{let g=s.image;return c&&g&&g.height>0||u&&g&&a(g)?(r===null&&(r=new nl(e)),h=c?r.fromEquirectangular(s):r.fromCubemap(s),h.texture.pmremVersion=s.pmremVersion,t.set(s,h),s.addEventListener("dispose",n),h.texture):null}}}return s}function a(s){let l=0,c=6;for(let u=0;u<c;u++)s[u]!==void 0&&l++;return l===c}function n(s){let l=s.target;l.removeEventListener("dispose",n);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:o}}function lE(e){let t={};function r(i){if(t[i]!==void 0)return t[i];let a;switch(i){case"WEBGL_depth_texture":a=e.getExtension("WEBGL_depth_texture")||e.getExtension("MOZ_WEBGL_depth_texture")||e.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":a=e.getExtension("EXT_texture_filter_anisotropic")||e.getExtension("MOZ_EXT_texture_filter_anisotropic")||e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":a=e.getExtension("WEBGL_compressed_texture_s3tc")||e.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":a=e.getExtension("WEBGL_compressed_texture_pvrtc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:a=e.getExtension(i)}return t[i]=a,a}return{has:function(i){return r(i)!==null},init:function(){r("EXT_color_buffer_float"),r("WEBGL_clip_cull_distance"),r("OES_texture_float_linear"),r("EXT_color_buffer_half_float"),r("WEBGL_multisampled_render_to_texture"),r("WEBGL_render_shared_exponent")},get:function(i){let a=r(i);return a===null&&La("THREE.WebGLRenderer: "+i+" extension not supported."),a}}}function cE(e,t,r,i){let a={},n=new WeakMap;function o(h){let d=h.target;d.index!==null&&t.remove(d.index);for(let m in d.attributes)t.remove(d.attributes[m]);d.removeEventListener("dispose",o),delete a[d.id];let g=n.get(d);g&&(t.remove(g),n.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,r.memory.geometries--}function s(h,d){return a[d.id]===!0||(d.addEventListener("dispose",o),a[d.id]=!0,r.memory.geometries++),d}function l(h){let d=h.attributes;for(let g in d)t.update(d[g],e.ARRAY_BUFFER)}function c(h){let d=[],g=h.index,m=h.attributes.position,A=0;if(g!==null){let w=g.array;A=g.version;for(let C=0,x=w.length;C<x;C+=3){let T=w[C+0],y=w[C+1],S=w[C+2];d.push(T,y,y,S,S,T)}}else if(m!==void 0){let w=m.array;A=m.version;for(let C=0,x=w.length/3-1;C<x;C+=3){let T=C+0,y=C+1,S=C+2;d.push(T,y,y,S,S,T)}}else return;let f=new(qh(d)?au:iu)(d,1);f.version=A;let p=n.get(h);p&&t.remove(p),n.set(h,f)}function u(h){let d=n.get(h);if(d){let g=h.index;g!==null&&d.version<g.version&&c(h)}else c(h);return n.get(h)}return{get:s,update:l,getWireframeAttribute:u}}function hE(e,t,r){let i;function a(d){i=d}let n,o;function s(d){n=d.type,o=d.bytesPerElement}function l(d,g){e.drawElements(i,g,n,d*o),r.update(g,i,1)}function c(d,g,m){m!==0&&(e.drawElementsInstanced(i,g,n,d*o,m),r.update(g,i,m))}function u(d,g,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,g,0,n,d,0,m);let A=0;for(let f=0;f<m;f++)A+=g[f];r.update(A,i,1)}function h(d,g,m,A){if(m===0)return;let f=t.get("WEBGL_multi_draw");if(f===null)for(let p=0;p<d.length;p++)c(d[p]/o,g[p],A[p]);else{f.multiDrawElementsInstancedWEBGL(i,g,0,n,d,0,A,0,m);let p=0;for(let w=0;w<m;w++)p+=g[w]*A[w];r.update(p,i,1)}}this.setMode=a,this.setIndex=s,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function uE(e){let t={geometries:0,textures:0},r={frame:0,calls:0,triangles:0,points:0,lines:0};function i(n,o,s){switch(r.calls++,o){case e.TRIANGLES:r.triangles+=s*(n/3);break;case e.LINES:r.lines+=s*(n/2);break;case e.LINE_STRIP:r.lines+=s*(n-1);break;case e.LINE_LOOP:r.lines+=s*n;break;case e.POINTS:r.points+=s*n;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function a(){r.calls=0,r.triangles=0,r.points=0,r.lines=0}return{memory:t,render:r,programs:null,autoReset:!0,reset:a,update:i}}function dE(e,t,r){let i=new WeakMap,a=new lt;function n(o,s,l){let c=o.morphTargetInfluences,u=s.morphAttributes.position||s.morphAttributes.normal||s.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(s);if(d===void 0||d.count!==h){let g=function(){U.dispose(),i.delete(s),s.removeEventListener("dispose",g)};d!==void 0&&d.texture.dispose();let m=s.morphAttributes.position!==void 0,A=s.morphAttributes.normal!==void 0,f=s.morphAttributes.color!==void 0,p=s.morphAttributes.position||[],w=s.morphAttributes.normal||[],C=s.morphAttributes.color||[],x=0;m===!0&&(x=1),A===!0&&(x=2),f===!0&&(x=3);let T=s.attributes.position.count*x,y=1;T>t.maxTextureSize&&(y=Math.ceil(T/t.maxTextureSize),T=t.maxTextureSize);let S=new Float32Array(T*y*4*h),U=new $h(S,T,y,h);U.type=pr,U.needsUpdate=!0;let D=x*4;for(let M=0;M<h;M++){let I=p[M],H=w[M],k=C[M],G=T*y*4*M;for(let Z=0;Z<I.count;Z++){let V=Z*D;m===!0&&(a.fromBufferAttribute(I,Z),S[G+V+0]=a.x,S[G+V+1]=a.y,S[G+V+2]=a.z,S[G+V+3]=0),A===!0&&(a.fromBufferAttribute(H,Z),S[G+V+4]=a.x,S[G+V+5]=a.y,S[G+V+6]=a.z,S[G+V+7]=0),f===!0&&(a.fromBufferAttribute(k,Z),S[G+V+8]=a.x,S[G+V+9]=a.y,S[G+V+10]=a.z,S[G+V+11]=k.itemSize===4?a.w:1)}}d={count:h,texture:U,size:new je(T,y)},i.set(s,d),s.addEventListener("dispose",g)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",o.morphTexture,r);else{let g=0;for(let A=0;A<c.length;A++)g+=c[A];let m=s.morphTargetsRelative?1:1-g;l.getUniforms().setValue(e,"morphTargetBaseInfluence",m),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",d.texture,r),l.getUniforms().setValue(e,"morphTargetsTextureSize",d.size)}return{update:n}}function pE(e,t,r,i){let a=new WeakMap;function n(l){let c=i.render.frame,u=l.geometry,h=t.get(l,u);if(a.get(h)!==c&&(t.update(h),a.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",s)===!1&&l.addEventListener("dispose",s),a.get(l)!==c&&(r.update(l.instanceMatrix,e.ARRAY_BUFFER),l.instanceColor!==null&&r.update(l.instanceColor,e.ARRAY_BUFFER),a.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;a.get(d)!==c&&(d.update(),a.set(d,c))}return h}function o(){a=new WeakMap}function s(l){let c=l.target;c.removeEventListener("dispose",s),r.remove(c.instanceMatrix),c.instanceColor!==null&&r.remove(c.instanceColor)}return{update:n,dispose:o}}var xu=new er,mh=new gu(1,1),_u=new $h,Su=new lg,yu=new cu,Eh=[],wh=[],Ch=new Float32Array(16),vh=new Float32Array(9),Mh=new Float32Array(4);function $i(e,t,r){let i=e[0];if(i<=0||i>0)return e;let a=t*r,n=Eh[a];if(n===void 0&&(n=new Float32Array(a),Eh[a]=n),t!==0){i.toArray(n,0);for(let o=1,s=0;o!==t;++o)s+=r,e[o].toArray(n,s)}return n}function Mt(e,t){if(e.length!==t.length)return!1;for(let r=0,i=e.length;r<i;r++)if(e[r]!==t[r])return!1;return!0}function Dt(e,t){for(let r=0,i=t.length;r<i;r++)e[r]=t[r]}function qn(e,t){let r=wh[t];r===void 0&&(r=new Int32Array(t),wh[t]=r);for(let i=0;i!==t;++i)r[i]=e.allocateTextureUnit();return r}function gE(e,t){let r=this.cache;r[0]!==t&&(e.uniform1f(this.addr,t),r[0]=t)}function fE(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),r[0]=t.x,r[1]=t.y);else{if(Mt(r,t))return;e.uniform2fv(this.addr,t),Dt(r,t)}}function AE(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),r[0]=t.x,r[1]=t.y,r[2]=t.z);else if(t.r!==void 0)(r[0]!==t.r||r[1]!==t.g||r[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),r[0]=t.r,r[1]=t.g,r[2]=t.b);else{if(Mt(r,t))return;e.uniform3fv(this.addr,t),Dt(r,t)}}function mE(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z||r[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),r[0]=t.x,r[1]=t.y,r[2]=t.z,r[3]=t.w);else{if(Mt(r,t))return;e.uniform4fv(this.addr,t),Dt(r,t)}}function EE(e,t){let r=this.cache,i=t.elements;if(i===void 0){if(Mt(r,t))return;e.uniformMatrix2fv(this.addr,!1,t),Dt(r,t)}else{if(Mt(r,i))return;Mh.set(i),e.uniformMatrix2fv(this.addr,!1,Mh),Dt(r,i)}}function wE(e,t){let r=this.cache,i=t.elements;if(i===void 0){if(Mt(r,t))return;e.uniformMatrix3fv(this.addr,!1,t),Dt(r,t)}else{if(Mt(r,i))return;vh.set(i),e.uniformMatrix3fv(this.addr,!1,vh),Dt(r,i)}}function CE(e,t){let r=this.cache,i=t.elements;if(i===void 0){if(Mt(r,t))return;e.uniformMatrix4fv(this.addr,!1,t),Dt(r,t)}else{if(Mt(r,i))return;Ch.set(i),e.uniformMatrix4fv(this.addr,!1,Ch),Dt(r,i)}}function vE(e,t){let r=this.cache;r[0]!==t&&(e.uniform1i(this.addr,t),r[0]=t)}function ME(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),r[0]=t.x,r[1]=t.y);else{if(Mt(r,t))return;e.uniform2iv(this.addr,t),Dt(r,t)}}function DE(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),r[0]=t.x,r[1]=t.y,r[2]=t.z);else{if(Mt(r,t))return;e.uniform3iv(this.addr,t),Dt(r,t)}}function BE(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z||r[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),r[0]=t.x,r[1]=t.y,r[2]=t.z,r[3]=t.w);else{if(Mt(r,t))return;e.uniform4iv(this.addr,t),Dt(r,t)}}function xE(e,t){let r=this.cache;r[0]!==t&&(e.uniform1ui(this.addr,t),r[0]=t)}function _E(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),r[0]=t.x,r[1]=t.y);else{if(Mt(r,t))return;e.uniform2uiv(this.addr,t),Dt(r,t)}}function SE(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),r[0]=t.x,r[1]=t.y,r[2]=t.z);else{if(Mt(r,t))return;e.uniform3uiv(this.addr,t),Dt(r,t)}}function yE(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z||r[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),r[0]=t.x,r[1]=t.y,r[2]=t.z,r[3]=t.w);else{if(Mt(r,t))return;e.uniform4uiv(this.addr,t),Dt(r,t)}}function IE(e,t,r){let i=this.cache,a=r.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a);let n;this.type===e.SAMPLER_2D_SHADOW?(mh.compareFunction=Jh,n=mh):n=xu,r.setTexture2D(t||n,a)}function RE(e,t,r){let i=this.cache,a=r.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),r.setTexture3D(t||Su,a)}function TE(e,t,r){let i=this.cache,a=r.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),r.setTextureCube(t||yu,a)}function bE(e,t,r){let i=this.cache,a=r.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),r.setTexture2DArray(t||_u,a)}function QE(e){switch(e){case 5126:return gE;case 35664:return fE;case 35665:return AE;case 35666:return mE;case 35674:return EE;case 35675:return wE;case 35676:return CE;case 5124:case 35670:return vE;case 35667:case 35671:return ME;case 35668:case 35672:return DE;case 35669:case 35673:return BE;case 5125:return xE;case 36294:return _E;case 36295:return SE;case 36296:return yE;case 35678:case 36198:case 36298:case 36306:case 35682:return IE;case 35679:case 36299:case 36307:return RE;case 35680:case 36300:case 36308:case 36293:return TE;case 36289:case 36303:case 36311:case 36292:return bE}}function UE(e,t){e.uniform1fv(this.addr,t)}function FE(e,t){let r=$i(t,this.size,2);e.uniform2fv(this.addr,r)}function LE(e,t){let r=$i(t,this.size,3);e.uniform3fv(this.addr,r)}function NE(e,t){let r=$i(t,this.size,4);e.uniform4fv(this.addr,r)}function PE(e,t){let r=$i(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,r)}function HE(e,t){let r=$i(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,r)}function GE(e,t){let r=$i(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,r)}function OE(e,t){e.uniform1iv(this.addr,t)}function kE(e,t){e.uniform2iv(this.addr,t)}function VE(e,t){e.uniform3iv(this.addr,t)}function zE(e,t){e.uniform4iv(this.addr,t)}function YE(e,t){e.uniform1uiv(this.addr,t)}function WE(e,t){e.uniform2uiv(this.addr,t)}function JE(e,t){e.uniform3uiv(this.addr,t)}function KE(e,t){e.uniform4uiv(this.addr,t)}function XE(e,t,r){let i=this.cache,a=t.length,n=qn(r,a);Mt(i,n)||(e.uniform1iv(this.addr,n),Dt(i,n));for(let o=0;o!==a;++o)r.setTexture2D(t[o]||xu,n[o])}function jE(e,t,r){let i=this.cache,a=t.length,n=qn(r,a);Mt(i,n)||(e.uniform1iv(this.addr,n),Dt(i,n));for(let o=0;o!==a;++o)r.setTexture3D(t[o]||Su,n[o])}function qE(e,t,r){let i=this.cache,a=t.length,n=qn(r,a);Mt(i,n)||(e.uniform1iv(this.addr,n),Dt(i,n));for(let o=0;o!==a;++o)r.setTextureCube(t[o]||yu,n[o])}function ZE(e,t,r){let i=this.cache,a=t.length,n=qn(r,a);Mt(i,n)||(e.uniform1iv(this.addr,n),Dt(i,n));for(let o=0;o!==a;++o)r.setTexture2DArray(t[o]||_u,n[o])}function $E(e){switch(e){case 5126:return UE;case 35664:return FE;case 35665:return LE;case 35666:return NE;case 35674:return PE;case 35675:return HE;case 35676:return GE;case 5124:case 35670:return OE;case 35667:case 35671:return kE;case 35668:case 35672:return VE;case 35669:case 35673:return zE;case 5125:return YE;case 36294:return WE;case 36295:return JE;case 36296:return KE;case 35678:case 36198:case 36298:case 36306:case 35682:return XE;case 35679:case 36299:case 36307:return jE;case 35680:case 36300:case 36308:case 36293:return qE;case 36289:case 36303:case 36311:case 36292:return ZE}}var e0=class{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=QE(t.type)}},t0=class{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$E(t.type)}},r0=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){let i=this.seq;for(let a=0,n=i.length;a!==n;++a){let o=i[a];o.setValue(e,t[o.id],r)}}},ho=/(\w+)(\])?(\[|\.)?/g;function Dh(e,t){e.seq.push(t),e.map[t.id]=t}function i0(e,t,r){let i=e.name,a=i.length;for(ho.lastIndex=0;;){let n=ho.exec(i),o=ho.lastIndex,s=n[1],l=n[2]==="]",c=n[3];if(l&&(s=s|0),c===void 0||c==="["&&o+2===a){Dh(r,c===void 0?new e0(s,e,t):new t0(s,e,t));break}else{let u=r.map[s];u===void 0&&(u=new r0(s),Dh(r,u)),r=u}}}var Ln=class{constructor(e,t){this.seq=[],this.map={};let r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<r;++i){let a=e.getActiveUniform(t,i),n=e.getUniformLocation(t,a.name);i0(a,n,this)}}setValue(e,t,r,i){let a=this.map[t];a!==void 0&&a.setValue(e,r,i)}setOptional(e,t,r){let i=t[r];i!==void 0&&this.setValue(e,r,i)}static upload(e,t,r,i){for(let a=0,n=t.length;a!==n;++a){let o=t[a],s=r[o.id];s.needsUpdate!==!1&&o.setValue(e,s.value,i)}}static seqWithValue(e,t){let r=[];for(let i=0,a=e.length;i!==a;++i){let n=e[i];n.id in t&&r.push(n)}return r}};function Bh(e,t,r){let i=e.createShader(t);return e.shaderSource(i,r),e.compileShader(i),i}var a0=37297,n0=0;function s0(e,t){let r=e.split(`
`),i=[],a=Math.max(t-6,0),n=Math.min(t+6,r.length);for(let o=a;o<n;o++){let s=o+1;i.push(`${s===t?">":" "} ${s}: ${r[o]}`)}return i.join(`
`)}var xh=new Je;function o0(e){tt._getMatrix(xh,tt.workingColorSpace,e);let t=`mat3( ${xh.elements.map(r=>r.toFixed(4))} )`;switch(tt.getTransfer(e)){case Gn:return[t,"LinearTransferOETF"];case at:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function _h(e,t,r){let i=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let n=/ERROR: 0:(\d+)/.exec(a);if(n){let o=parseInt(n[1]);return r.toUpperCase()+`

`+a+`

`+s0(e.getShaderSource(t),o)}else return a}function l0(e,t){let r=o0(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${r[1]}( vec4( value.rgb * ${r[0]}, value.a ) );`,"}"].join(`
`)}function c0(e,t){let r;switch(t){case Mp:r="Linear";break;case Dp:r="Reinhard";break;case Bp:r="Cineon";break;case Ph:r="ACESFilmic";break;case _p:r="AgX";break;case Sp:r="Neutral";break;case xp:r="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),r="Linear"}return"vec3 "+e+"( vec3 color ) { return "+r+"ToneMapping( color ); }"}var yn=new b;function h0(){tt.getLuminanceCoefficients(yn);let e=yn.x.toFixed(4),t=yn.y.toFixed(4),r=yn.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${r} );`,"	return dot( weights, rgb );","}"].join(`
`)}function u0(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Sa).join(`
`)}function d0(e){let t=[];for(let r in e){let i=e[r];i!==!1&&t.push("#define "+r+" "+i)}return t.join(`
`)}function p0(e,t){let r={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let a=0;a<i;a++){let n=e.getActiveAttrib(t,a),o=n.name,s=1;n.type===e.FLOAT_MAT2&&(s=2),n.type===e.FLOAT_MAT3&&(s=3),n.type===e.FLOAT_MAT4&&(s=4),r[o]={type:n.type,location:e.getAttribLocation(t,o),locationSize:s}}return r}function Sa(e){return e!==""}function Sh(e,t){let r=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,r).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function yh(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var g0=/^[ \t]*#include +<([\w\d./]+)>/gm;function sl(e){return e.replace(g0,A0)}var f0=new Map;function A0(e,t){let r=We[t];if(r===void 0){let i=f0.get(t);if(i!==void 0)r=We[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return sl(r)}var m0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ih(e){return e.replace(m0,E0)}function E0(e,t,r,i){let a="";for(let n=parseInt(t);n<parseInt(r);n++)a+=i.replace(/\[\s*i\s*\]/g,"[ "+n+" ]").replace(/UNROLLED_LOOP_INDEX/g,n);return a}function Rh(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function w0(e){let t="SHADOWMAP_TYPE_BASIC";return e.shadowMapType===Nh?t="SHADOWMAP_TYPE_PCF":e.shadowMapType===tp?t="SHADOWMAP_TYPE_PCF_SOFT":e.shadowMapType===Dr&&(t="SHADOWMAP_TYPE_VSM"),t}function C0(e){let t="ENVMAP_TYPE_CUBE";if(e.envMap)switch(e.envMapMode){case Yi:case Wi:t="ENVMAP_TYPE_CUBE";break;case Wn:t="ENVMAP_TYPE_CUBE_UV";break}return t}function v0(e){let t="ENVMAP_MODE_REFLECTION";if(e.envMap)switch(e.envMapMode){case Wi:t="ENVMAP_MODE_REFRACTION";break}return t}function M0(e){let t="ENVMAP_BLENDING_NONE";if(e.envMap)switch(e.combine){case pl:t="ENVMAP_BLENDING_MULTIPLY";break;case Cp:t="ENVMAP_BLENDING_MIX";break;case vp:t="ENVMAP_BLENDING_ADD";break}return t}function D0(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let r=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,r),112)),texelHeight:i,maxMip:r}}function B0(e,t,r,i){let a=e.getContext(),n=r.defines,o=r.vertexShader,s=r.fragmentShader,l=w0(r),c=C0(r),u=v0(r),h=M0(r),d=D0(r),g=u0(r),m=d0(n),A=a.createProgram(),f,p,w=r.glslVersion?"#version "+r.glslVersion+`
`:"";r.isRawShaderMaterial?(f=["#define SHADER_TYPE "+r.shaderType,"#define SHADER_NAME "+r.shaderName,m].filter(Sa).join(`
`),f.length>0&&(f+=`
`),p=["#define SHADER_TYPE "+r.shaderType,"#define SHADER_NAME "+r.shaderName,m].filter(Sa).join(`
`),p.length>0&&(p+=`
`)):(f=[Rh(r),"#define SHADER_TYPE "+r.shaderType,"#define SHADER_NAME "+r.shaderName,m,r.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",r.batching?"#define USE_BATCHING":"",r.batchingColor?"#define USE_BATCHING_COLOR":"",r.instancing?"#define USE_INSTANCING":"",r.instancingColor?"#define USE_INSTANCING_COLOR":"",r.instancingMorph?"#define USE_INSTANCING_MORPH":"",r.useFog&&r.fog?"#define USE_FOG":"",r.useFog&&r.fogExp2?"#define FOG_EXP2":"",r.map?"#define USE_MAP":"",r.envMap?"#define USE_ENVMAP":"",r.envMap?"#define "+u:"",r.lightMap?"#define USE_LIGHTMAP":"",r.aoMap?"#define USE_AOMAP":"",r.bumpMap?"#define USE_BUMPMAP":"",r.normalMap?"#define USE_NORMALMAP":"",r.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",r.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",r.displacementMap?"#define USE_DISPLACEMENTMAP":"",r.emissiveMap?"#define USE_EMISSIVEMAP":"",r.anisotropy?"#define USE_ANISOTROPY":"",r.anisotropyMap?"#define USE_ANISOTROPYMAP":"",r.clearcoatMap?"#define USE_CLEARCOATMAP":"",r.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",r.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",r.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",r.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",r.specularMap?"#define USE_SPECULARMAP":"",r.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",r.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",r.roughnessMap?"#define USE_ROUGHNESSMAP":"",r.metalnessMap?"#define USE_METALNESSMAP":"",r.alphaMap?"#define USE_ALPHAMAP":"",r.alphaHash?"#define USE_ALPHAHASH":"",r.transmission?"#define USE_TRANSMISSION":"",r.transmissionMap?"#define USE_TRANSMISSIONMAP":"",r.thicknessMap?"#define USE_THICKNESSMAP":"",r.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",r.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",r.mapUv?"#define MAP_UV "+r.mapUv:"",r.alphaMapUv?"#define ALPHAMAP_UV "+r.alphaMapUv:"",r.lightMapUv?"#define LIGHTMAP_UV "+r.lightMapUv:"",r.aoMapUv?"#define AOMAP_UV "+r.aoMapUv:"",r.emissiveMapUv?"#define EMISSIVEMAP_UV "+r.emissiveMapUv:"",r.bumpMapUv?"#define BUMPMAP_UV "+r.bumpMapUv:"",r.normalMapUv?"#define NORMALMAP_UV "+r.normalMapUv:"",r.displacementMapUv?"#define DISPLACEMENTMAP_UV "+r.displacementMapUv:"",r.metalnessMapUv?"#define METALNESSMAP_UV "+r.metalnessMapUv:"",r.roughnessMapUv?"#define ROUGHNESSMAP_UV "+r.roughnessMapUv:"",r.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+r.anisotropyMapUv:"",r.clearcoatMapUv?"#define CLEARCOATMAP_UV "+r.clearcoatMapUv:"",r.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+r.clearcoatNormalMapUv:"",r.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+r.clearcoatRoughnessMapUv:"",r.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+r.iridescenceMapUv:"",r.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+r.iridescenceThicknessMapUv:"",r.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+r.sheenColorMapUv:"",r.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+r.sheenRoughnessMapUv:"",r.specularMapUv?"#define SPECULARMAP_UV "+r.specularMapUv:"",r.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+r.specularColorMapUv:"",r.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+r.specularIntensityMapUv:"",r.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+r.transmissionMapUv:"",r.thicknessMapUv?"#define THICKNESSMAP_UV "+r.thicknessMapUv:"",r.vertexTangents&&r.flatShading===!1?"#define USE_TANGENT":"",r.vertexColors?"#define USE_COLOR":"",r.vertexAlphas?"#define USE_COLOR_ALPHA":"",r.vertexUv1s?"#define USE_UV1":"",r.vertexUv2s?"#define USE_UV2":"",r.vertexUv3s?"#define USE_UV3":"",r.pointsUvs?"#define USE_POINTS_UV":"",r.flatShading?"#define FLAT_SHADED":"",r.skinning?"#define USE_SKINNING":"",r.morphTargets?"#define USE_MORPHTARGETS":"",r.morphNormals&&r.flatShading===!1?"#define USE_MORPHNORMALS":"",r.morphColors?"#define USE_MORPHCOLORS":"",r.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+r.morphTextureStride:"",r.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+r.morphTargetsCount:"",r.doubleSided?"#define DOUBLE_SIDED":"",r.flipSided?"#define FLIP_SIDED":"",r.shadowMapEnabled?"#define USE_SHADOWMAP":"",r.shadowMapEnabled?"#define "+l:"",r.sizeAttenuation?"#define USE_SIZEATTENUATION":"",r.numLightProbes>0?"#define USE_LIGHT_PROBES":"",r.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",r.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Sa).join(`
`),p=[Rh(r),"#define SHADER_TYPE "+r.shaderType,"#define SHADER_NAME "+r.shaderName,m,r.useFog&&r.fog?"#define USE_FOG":"",r.useFog&&r.fogExp2?"#define FOG_EXP2":"",r.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",r.map?"#define USE_MAP":"",r.matcap?"#define USE_MATCAP":"",r.envMap?"#define USE_ENVMAP":"",r.envMap?"#define "+c:"",r.envMap?"#define "+u:"",r.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",r.lightMap?"#define USE_LIGHTMAP":"",r.aoMap?"#define USE_AOMAP":"",r.bumpMap?"#define USE_BUMPMAP":"",r.normalMap?"#define USE_NORMALMAP":"",r.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",r.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",r.emissiveMap?"#define USE_EMISSIVEMAP":"",r.anisotropy?"#define USE_ANISOTROPY":"",r.anisotropyMap?"#define USE_ANISOTROPYMAP":"",r.clearcoat?"#define USE_CLEARCOAT":"",r.clearcoatMap?"#define USE_CLEARCOATMAP":"",r.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",r.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",r.dispersion?"#define USE_DISPERSION":"",r.iridescence?"#define USE_IRIDESCENCE":"",r.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",r.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",r.specularMap?"#define USE_SPECULARMAP":"",r.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",r.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",r.roughnessMap?"#define USE_ROUGHNESSMAP":"",r.metalnessMap?"#define USE_METALNESSMAP":"",r.alphaMap?"#define USE_ALPHAMAP":"",r.alphaTest?"#define USE_ALPHATEST":"",r.alphaHash?"#define USE_ALPHAHASH":"",r.sheen?"#define USE_SHEEN":"",r.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",r.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",r.transmission?"#define USE_TRANSMISSION":"",r.transmissionMap?"#define USE_TRANSMISSIONMAP":"",r.thicknessMap?"#define USE_THICKNESSMAP":"",r.vertexTangents&&r.flatShading===!1?"#define USE_TANGENT":"",r.vertexColors||r.instancingColor||r.batchingColor?"#define USE_COLOR":"",r.vertexAlphas?"#define USE_COLOR_ALPHA":"",r.vertexUv1s?"#define USE_UV1":"",r.vertexUv2s?"#define USE_UV2":"",r.vertexUv3s?"#define USE_UV3":"",r.pointsUvs?"#define USE_POINTS_UV":"",r.gradientMap?"#define USE_GRADIENTMAP":"",r.flatShading?"#define FLAT_SHADED":"",r.doubleSided?"#define DOUBLE_SIDED":"",r.flipSided?"#define FLIP_SIDED":"",r.shadowMapEnabled?"#define USE_SHADOWMAP":"",r.shadowMapEnabled?"#define "+l:"",r.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",r.numLightProbes>0?"#define USE_LIGHT_PROBES":"",r.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",r.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",r.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",r.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",r.toneMapping!==Or?"#define TONE_MAPPING":"",r.toneMapping!==Or?We.tonemapping_pars_fragment:"",r.toneMapping!==Or?c0("toneMapping",r.toneMapping):"",r.dithering?"#define DITHERING":"",r.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,l0("linearToOutputTexel",r.outputColorSpace),h0(),r.useDepthPacking?"#define DEPTH_PACKING "+r.depthPacking:"",`
`].filter(Sa).join(`
`)),o=sl(o),o=Sh(o,r),o=yh(o,r),s=sl(s),s=Sh(s,r),s=yh(s,r),o=Ih(o),s=Ih(s),r.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,f=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,p=["#define varying in",r.glslVersion===Qc?"":"layout(location = 0) out highp vec4 pc_fragColor;",r.glslVersion===Qc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let C=w+f+o,x=w+p+s,T=Bh(a,a.VERTEX_SHADER,C),y=Bh(a,a.FRAGMENT_SHADER,x);a.attachShader(A,T),a.attachShader(A,y),r.index0AttributeName!==void 0?a.bindAttribLocation(A,0,r.index0AttributeName):r.morphTargets===!0&&a.bindAttribLocation(A,0,"position"),a.linkProgram(A);function S(I){if(e.debug.checkShaderErrors){let H=a.getProgramInfoLog(A)||"",k=a.getShaderInfoLog(T)||"",G=a.getShaderInfoLog(y)||"",Z=H.trim(),V=k.trim(),$=G.trim(),J=!0,te=!0;if(a.getProgramParameter(A,a.LINK_STATUS)===!1)if(J=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(a,A,T,y);else{let Ae=_h(a,T,"vertex"),Ue=_h(a,y,"fragment");console.error("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(A,a.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+Z+`
`+Ae+`
`+Ue)}else Z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Z):(V===""||$==="")&&(te=!1);te&&(I.diagnostics={runnable:J,programLog:Z,vertexShader:{log:V,prefix:f},fragmentShader:{log:$,prefix:p}})}a.deleteShader(T),a.deleteShader(y),U=new Ln(a,A),D=p0(a,A)}let U;this.getUniforms=function(){return U===void 0&&S(this),U};let D;this.getAttributes=function(){return D===void 0&&S(this),D};let M=r.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=a.getProgramParameter(A,a0)),M},this.destroy=function(){i.releaseStatesOfProgram(this),a.deleteProgram(A),this.program=void 0},this.type=r.shaderType,this.name=r.shaderName,this.id=n0++,this.cacheKey=t,this.usedTimes=1,this.program=A,this.vertexShader=T,this.fragmentShader=y,this}var x0=0,_0=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,r=e.fragmentShader,i=this._getShaderStage(t),a=this._getShaderStage(r),n=this._getShaderCacheForMaterial(e);return n.has(i)===!1&&(n.add(i),i.usedTimes++),n.has(a)===!1&&(n.add(a),a.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){let t=this.shaderCache,r=t.get(e);return r===void 0&&(r=new S0(e),t.set(e,r)),r}},S0=class{constructor(e){this.id=x0++,this.code=e,this.usedTimes=0}};function y0(e,t,r,i,a,n,o){let s=new Dl,l=new _0,c=new Set,u=[],h=a.logarithmicDepthBuffer,d=a.vertexTextures,g=a.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function A(D){return c.add(D),D===0?"uv":`uv${D}`}function f(D,M,I,H,k){let G=H.fog,Z=k.geometry,V=D.isMeshStandardMaterial?H.environment:null,$=(D.isMeshStandardMaterial?r:t).get(D.envMap||V),J=$&&$.mapping===Wn?$.image.height:null,te=m[D.type];D.precision!==null&&(g=a.getMaxPrecision(D.precision),g!==D.precision&&console.warn("THREE.WebGLProgram.getParameters:",D.precision,"not supported, using",g,"instead."));let Ae=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Ue=Ae!==void 0?Ae.length:0,Pe=0;Z.morphAttributes.position!==void 0&&(Pe=1),Z.morphAttributes.normal!==void 0&&(Pe=2),Z.morphAttributes.color!==void 0&&(Pe=3);let qe,He,O,ce;if(te){let et=dr[te];qe=et.vertexShader,He=et.fragmentShader}else qe=D.vertexShader,He=D.fragmentShader,l.update(D),O=l.getVertexShaderID(D),ce=l.getFragmentShaderID(D);let P=e.getRenderTarget(),L=e.state.buffers.depth.getReversed(),X=k.isInstancedMesh===!0,z=k.isBatchedMesh===!0,he=!!D.map,_=!!D.matcap,ie=!!$,Ee=!!D.aoMap,ve=!!D.lightMap,ge=!!D.bumpMap,j=!!D.normalMap,ae=!!D.displacementMap,fe=!!D.emissiveMap,ue=!!D.metalnessMap,ye=!!D.roughnessMap,Ie=D.anisotropy>0,B=D.clearcoat>0,E=D.dispersion>0,Q=D.iridescence>0,K=D.sheen>0,re=D.transmission>0,q=Ie&&!!D.anisotropyMap,Me=B&&!!D.clearcoatMap,pe=B&&!!D.clearcoatNormalMap,xe=B&&!!D.clearcoatRoughnessMap,be=Q&&!!D.iridescenceMap,se=Q&&!!D.iridescenceThicknessMap,me=K&&!!D.sheenColorMap,Fe=K&&!!D.sheenRoughnessMap,_e=!!D.specularMap,we=!!D.specularColorMap,Ve=!!D.specularIntensityMap,R=re&&!!D.transmissionMap,le=re&&!!D.thicknessMap,de=!!D.gradientMap,Be=!!D.alphaMap,ne=D.alphaTest>0,ee=!!D.alphaHash,Se=!!D.extensions,Ne=Or;D.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(Ne=e.toneMapping);let ut={shaderID:te,shaderType:D.type,shaderName:D.name,vertexShader:qe,fragmentShader:He,defines:D.defines,customVertexShaderID:O,customFragmentShaderID:ce,isRawShaderMaterial:D.isRawShaderMaterial===!0,glslVersion:D.glslVersion,precision:g,batching:z,batchingColor:z&&k._colorsTexture!==null,instancing:X,instancingColor:X&&k.instanceColor!==null,instancingMorph:X&&k.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:P===null?e.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:Ji,alphaToCoverage:!!D.alphaToCoverage,map:he,matcap:_,envMap:ie,envMapMode:ie&&$.mapping,envMapCubeUVHeight:J,aoMap:Ee,lightMap:ve,bumpMap:ge,normalMap:j,displacementMap:d&&ae,emissiveMap:fe,normalMapObjectSpace:j&&D.normalMapType===Tp,normalMapTangentSpace:j&&D.normalMapType===Cl,metalnessMap:ue,roughnessMap:ye,anisotropy:Ie,anisotropyMap:q,clearcoat:B,clearcoatMap:Me,clearcoatNormalMap:pe,clearcoatRoughnessMap:xe,dispersion:E,iridescence:Q,iridescenceMap:be,iridescenceThicknessMap:se,sheen:K,sheenColorMap:me,sheenRoughnessMap:Fe,specularMap:_e,specularColorMap:we,specularIntensityMap:Ve,transmission:re,transmissionMap:R,thicknessMap:le,gradientMap:de,opaque:D.transparent===!1&&D.blending===ki&&D.alphaToCoverage===!1,alphaMap:Be,alphaTest:ne,alphaHash:ee,combine:D.combine,mapUv:he&&A(D.map.channel),aoMapUv:Ee&&A(D.aoMap.channel),lightMapUv:ve&&A(D.lightMap.channel),bumpMapUv:ge&&A(D.bumpMap.channel),normalMapUv:j&&A(D.normalMap.channel),displacementMapUv:ae&&A(D.displacementMap.channel),emissiveMapUv:fe&&A(D.emissiveMap.channel),metalnessMapUv:ue&&A(D.metalnessMap.channel),roughnessMapUv:ye&&A(D.roughnessMap.channel),anisotropyMapUv:q&&A(D.anisotropyMap.channel),clearcoatMapUv:Me&&A(D.clearcoatMap.channel),clearcoatNormalMapUv:pe&&A(D.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&A(D.clearcoatRoughnessMap.channel),iridescenceMapUv:be&&A(D.iridescenceMap.channel),iridescenceThicknessMapUv:se&&A(D.iridescenceThicknessMap.channel),sheenColorMapUv:me&&A(D.sheenColorMap.channel),sheenRoughnessMapUv:Fe&&A(D.sheenRoughnessMap.channel),specularMapUv:_e&&A(D.specularMap.channel),specularColorMapUv:we&&A(D.specularColorMap.channel),specularIntensityMapUv:Ve&&A(D.specularIntensityMap.channel),transmissionMapUv:R&&A(D.transmissionMap.channel),thicknessMapUv:le&&A(D.thicknessMap.channel),alphaMapUv:Be&&A(D.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(j||Ie),vertexColors:D.vertexColors,vertexAlphas:D.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!Z.attributes.uv&&(he||Be),fog:!!G,useFog:D.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:D.flatShading===!0&&D.wireframe===!1,sizeAttenuation:D.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:L,skinning:k.isSkinnedMesh===!0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:Ue,morphTextureStride:Pe,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:D.dithering,shadowMapEnabled:e.shadowMap.enabled&&I.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ne,decodeVideoTexture:he&&D.map.isVideoTexture===!0&&tt.getTransfer(D.map.colorSpace)===at,decodeVideoTextureEmissive:fe&&D.emissiveMap.isVideoTexture===!0&&tt.getTransfer(D.emissiveMap.colorSpace)===at,premultipliedAlpha:D.premultipliedAlpha,doubleSided:D.side===$t,flipSided:D.side===Nt,useDepthPacking:D.depthPacking>=0,depthPacking:D.depthPacking||0,index0AttributeName:D.index0AttributeName,extensionClipCullDistance:Se&&D.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Se&&D.extensions.multiDraw===!0||z)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:D.customProgramCacheKey()};return ut.vertexUv1s=c.has(1),ut.vertexUv2s=c.has(2),ut.vertexUv3s=c.has(3),c.clear(),ut}function p(D){let M=[];if(D.shaderID?M.push(D.shaderID):(M.push(D.customVertexShaderID),M.push(D.customFragmentShaderID)),D.defines!==void 0)for(let I in D.defines)M.push(I),M.push(D.defines[I]);return D.isRawShaderMaterial===!1&&(w(M,D),C(M,D),M.push(e.outputColorSpace)),M.push(D.customProgramCacheKey),M.join()}function w(D,M){D.push(M.precision),D.push(M.outputColorSpace),D.push(M.envMapMode),D.push(M.envMapCubeUVHeight),D.push(M.mapUv),D.push(M.alphaMapUv),D.push(M.lightMapUv),D.push(M.aoMapUv),D.push(M.bumpMapUv),D.push(M.normalMapUv),D.push(M.displacementMapUv),D.push(M.emissiveMapUv),D.push(M.metalnessMapUv),D.push(M.roughnessMapUv),D.push(M.anisotropyMapUv),D.push(M.clearcoatMapUv),D.push(M.clearcoatNormalMapUv),D.push(M.clearcoatRoughnessMapUv),D.push(M.iridescenceMapUv),D.push(M.iridescenceThicknessMapUv),D.push(M.sheenColorMapUv),D.push(M.sheenRoughnessMapUv),D.push(M.specularMapUv),D.push(M.specularColorMapUv),D.push(M.specularIntensityMapUv),D.push(M.transmissionMapUv),D.push(M.thicknessMapUv),D.push(M.combine),D.push(M.fogExp2),D.push(M.sizeAttenuation),D.push(M.morphTargetsCount),D.push(M.morphAttributeCount),D.push(M.numDirLights),D.push(M.numPointLights),D.push(M.numSpotLights),D.push(M.numSpotLightMaps),D.push(M.numHemiLights),D.push(M.numRectAreaLights),D.push(M.numDirLightShadows),D.push(M.numPointLightShadows),D.push(M.numSpotLightShadows),D.push(M.numSpotLightShadowsWithMaps),D.push(M.numLightProbes),D.push(M.shadowMapType),D.push(M.toneMapping),D.push(M.numClippingPlanes),D.push(M.numClipIntersection),D.push(M.depthPacking)}function C(D,M){s.disableAll(),M.supportsVertexTextures&&s.enable(0),M.instancing&&s.enable(1),M.instancingColor&&s.enable(2),M.instancingMorph&&s.enable(3),M.matcap&&s.enable(4),M.envMap&&s.enable(5),M.normalMapObjectSpace&&s.enable(6),M.normalMapTangentSpace&&s.enable(7),M.clearcoat&&s.enable(8),M.iridescence&&s.enable(9),M.alphaTest&&s.enable(10),M.vertexColors&&s.enable(11),M.vertexAlphas&&s.enable(12),M.vertexUv1s&&s.enable(13),M.vertexUv2s&&s.enable(14),M.vertexUv3s&&s.enable(15),M.vertexTangents&&s.enable(16),M.anisotropy&&s.enable(17),M.alphaHash&&s.enable(18),M.batching&&s.enable(19),M.dispersion&&s.enable(20),M.batchingColor&&s.enable(21),M.gradientMap&&s.enable(22),D.push(s.mask),s.disableAll(),M.fog&&s.enable(0),M.useFog&&s.enable(1),M.flatShading&&s.enable(2),M.logarithmicDepthBuffer&&s.enable(3),M.reversedDepthBuffer&&s.enable(4),M.skinning&&s.enable(5),M.morphTargets&&s.enable(6),M.morphNormals&&s.enable(7),M.morphColors&&s.enable(8),M.premultipliedAlpha&&s.enable(9),M.shadowMapEnabled&&s.enable(10),M.doubleSided&&s.enable(11),M.flipSided&&s.enable(12),M.useDepthPacking&&s.enable(13),M.dithering&&s.enable(14),M.transmission&&s.enable(15),M.sheen&&s.enable(16),M.opaque&&s.enable(17),M.pointsUvs&&s.enable(18),M.decodeVideoTexture&&s.enable(19),M.decodeVideoTextureEmissive&&s.enable(20),M.alphaToCoverage&&s.enable(21),D.push(s.mask)}function x(D){let M=m[D.type],I;if(M){let H=dr[M];I=vg.clone(H.uniforms)}else I=D.uniforms;return I}function T(D,M){let I;for(let H=0,k=u.length;H<k;H++){let G=u[H];if(G.cacheKey===M){I=G,++I.usedTimes;break}}return I===void 0&&(I=new B0(e,M,D,n),u.push(I)),I}function y(D){if(--D.usedTimes===0){let M=u.indexOf(D);u[M]=u[u.length-1],u.pop(),D.destroy()}}function S(D){l.remove(D)}function U(){l.dispose()}return{getParameters:f,getProgramCacheKey:p,getUniforms:x,acquireProgram:T,releaseProgram:y,releaseShaderCache:S,programs:u,dispose:U}}function I0(){let e=new WeakMap;function t(o){return e.has(o)}function r(o){let s=e.get(o);return s===void 0&&(s={},e.set(o,s)),s}function i(o){e.delete(o)}function a(o,s,l){e.get(o)[s]=l}function n(){e=new WeakMap}return{has:t,get:r,remove:i,update:a,dispose:n}}function R0(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.z!==t.z?e.z-t.z:e.id-t.id}function Th(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function bh(){let e=[],t=0,r=[],i=[],a=[];function n(){t=0,r.length=0,i.length=0,a.length=0}function o(h,d,g,m,A,f){let p=e[t];return p===void 0?(p={id:h.id,object:h,geometry:d,material:g,groupOrder:m,renderOrder:h.renderOrder,z:A,group:f},e[t]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=g,p.groupOrder=m,p.renderOrder=h.renderOrder,p.z=A,p.group=f),t++,p}function s(h,d,g,m,A,f){let p=o(h,d,g,m,A,f);g.transmission>0?i.push(p):g.transparent===!0?a.push(p):r.push(p)}function l(h,d,g,m,A,f){let p=o(h,d,g,m,A,f);g.transmission>0?i.unshift(p):g.transparent===!0?a.unshift(p):r.unshift(p)}function c(h,d){r.length>1&&r.sort(h||R0),i.length>1&&i.sort(d||Th),a.length>1&&a.sort(d||Th)}function u(){for(let h=t,d=e.length;h<d;h++){let g=e[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:r,transmissive:i,transparent:a,init:n,push:s,unshift:l,finish:u,sort:c}}function T0(){let e=new WeakMap;function t(i,a){let n=e.get(i),o;return n===void 0?(o=new bh,e.set(i,[o])):a>=n.length?(o=new bh,n.push(o)):o=n[a],o}function r(){e=new WeakMap}return{get:t,dispose:r}}function b0(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let r;switch(t.type){case"DirectionalLight":r={direction:new b,color:new Ye};break;case"SpotLight":r={position:new b,direction:new b,color:new Ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":r={position:new b,color:new Ye,distance:0,decay:0};break;case"HemisphereLight":r={direction:new b,skyColor:new Ye,groundColor:new Ye};break;case"RectAreaLight":r={color:new Ye,position:new b,halfWidth:new b,halfHeight:new b};break}return e[t.id]=r,r}}}function Q0(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let r;switch(t.type){case"DirectionalLight":r={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"SpotLight":r={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"PointLight":r={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=r,r}}}var U0=0;function F0(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function L0(e){let t=new b0,r=Q0(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new b);let a=new b,n=new nt,o=new nt;function s(c){let u=0,h=0,d=0;for(let D=0;D<9;D++)i.probe[D].set(0,0,0);let g=0,m=0,A=0,f=0,p=0,w=0,C=0,x=0,T=0,y=0,S=0;c.sort(F0);for(let D=0,M=c.length;D<M;D++){let I=c[D],H=I.color,k=I.intensity,G=I.distance,Z=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)u+=H.r*k,h+=H.g*k,d+=H.b*k;else if(I.isLightProbe){for(let V=0;V<9;V++)i.probe[V].addScaledVector(I.sh.coefficients[V],k);S++}else if(I.isDirectionalLight){let V=t.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let $=I.shadow,J=r.get(I);J.shadowIntensity=$.intensity,J.shadowBias=$.bias,J.shadowNormalBias=$.normalBias,J.shadowRadius=$.radius,J.shadowMapSize=$.mapSize,i.directionalShadow[g]=J,i.directionalShadowMap[g]=Z,i.directionalShadowMatrix[g]=I.shadow.matrix,w++}i.directional[g]=V,g++}else if(I.isSpotLight){let V=t.get(I);V.position.setFromMatrixPosition(I.matrixWorld),V.color.copy(H).multiplyScalar(k),V.distance=G,V.coneCos=Math.cos(I.angle),V.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),V.decay=I.decay,i.spot[A]=V;let $=I.shadow;if(I.map&&(i.spotLightMap[T]=I.map,T++,$.updateMatrices(I),I.castShadow&&y++),i.spotLightMatrix[A]=$.matrix,I.castShadow){let J=r.get(I);J.shadowIntensity=$.intensity,J.shadowBias=$.bias,J.shadowNormalBias=$.normalBias,J.shadowRadius=$.radius,J.shadowMapSize=$.mapSize,i.spotShadow[A]=J,i.spotShadowMap[A]=Z,x++}A++}else if(I.isRectAreaLight){let V=t.get(I);V.color.copy(H).multiplyScalar(k),V.halfWidth.set(I.width*.5,0,0),V.halfHeight.set(0,I.height*.5,0),i.rectArea[f]=V,f++}else if(I.isPointLight){let V=t.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),V.distance=I.distance,V.decay=I.decay,I.castShadow){let $=I.shadow,J=r.get(I);J.shadowIntensity=$.intensity,J.shadowBias=$.bias,J.shadowNormalBias=$.normalBias,J.shadowRadius=$.radius,J.shadowMapSize=$.mapSize,J.shadowCameraNear=$.camera.near,J.shadowCameraFar=$.camera.far,i.pointShadow[m]=J,i.pointShadowMap[m]=Z,i.pointShadowMatrix[m]=I.shadow.matrix,C++}i.point[m]=V,m++}else if(I.isHemisphereLight){let V=t.get(I);V.skyColor.copy(I.color).multiplyScalar(k),V.groundColor.copy(I.groundColor).multiplyScalar(k),i.hemi[p]=V,p++}}f>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Ce.LTC_FLOAT_1,i.rectAreaLTC2=Ce.LTC_FLOAT_2):(i.rectAreaLTC1=Ce.LTC_HALF_1,i.rectAreaLTC2=Ce.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let U=i.hash;(U.directionalLength!==g||U.pointLength!==m||U.spotLength!==A||U.rectAreaLength!==f||U.hemiLength!==p||U.numDirectionalShadows!==w||U.numPointShadows!==C||U.numSpotShadows!==x||U.numSpotMaps!==T||U.numLightProbes!==S)&&(i.directional.length=g,i.spot.length=A,i.rectArea.length=f,i.point.length=m,i.hemi.length=p,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=C,i.pointShadowMap.length=C,i.spotShadow.length=x,i.spotShadowMap.length=x,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=C,i.spotLightMatrix.length=x+T-y,i.spotLightMap.length=T,i.numSpotLightShadowsWithMaps=y,i.numLightProbes=S,U.directionalLength=g,U.pointLength=m,U.spotLength=A,U.rectAreaLength=f,U.hemiLength=p,U.numDirectionalShadows=w,U.numPointShadows=C,U.numSpotShadows=x,U.numSpotMaps=T,U.numLightProbes=S,i.version=U0++)}function l(c,u){let h=0,d=0,g=0,m=0,A=0,f=u.matrixWorldInverse;for(let p=0,w=c.length;p<w;p++){let C=c[p];if(C.isDirectionalLight){let x=i.directional[h];x.direction.setFromMatrixPosition(C.matrixWorld),a.setFromMatrixPosition(C.target.matrixWorld),x.direction.sub(a),x.direction.transformDirection(f),h++}else if(C.isSpotLight){let x=i.spot[g];x.position.setFromMatrixPosition(C.matrixWorld),x.position.applyMatrix4(f),x.direction.setFromMatrixPosition(C.matrixWorld),a.setFromMatrixPosition(C.target.matrixWorld),x.direction.sub(a),x.direction.transformDirection(f),g++}else if(C.isRectAreaLight){let x=i.rectArea[m];x.position.setFromMatrixPosition(C.matrixWorld),x.position.applyMatrix4(f),o.identity(),n.copy(C.matrixWorld),n.premultiply(f),o.extractRotation(n),x.halfWidth.set(C.width*.5,0,0),x.halfHeight.set(0,C.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),m++}else if(C.isPointLight){let x=i.point[d];x.position.setFromMatrixPosition(C.matrixWorld),x.position.applyMatrix4(f),d++}else if(C.isHemisphereLight){let x=i.hemi[A];x.direction.setFromMatrixPosition(C.matrixWorld),x.direction.transformDirection(f),A++}}}return{setup:s,setupView:l,state:i}}function Qh(e){let t=new L0(e),r=[],i=[];function a(u){c.camera=u,r.length=0,i.length=0}function n(u){r.push(u)}function o(u){i.push(u)}function s(){t.setup(r)}function l(u){t.setupView(r,u)}let c={lightsArray:r,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:a,state:c,setupLights:s,setupLightsView:l,pushLight:n,pushShadow:o}}function N0(e){let t=new WeakMap;function r(a,n=0){let o=t.get(a),s;return o===void 0?(s=new Qh(e),t.set(a,[s])):n>=o.length?(s=new Qh(e),o.push(s)):s=o[n],s}function i(){t=new WeakMap}return{get:r,dispose:i}}var P0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,H0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function G0(e,t,r){let i=new Bl,a=new je,n=new je,o=new lt,s=new Gg({depthPacking:Rp}),l=new Og,c={},u=r.maxTextureSize,h={[Vr]:Nt,[Nt]:Vr,[$t]:$t},d=new fr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new je},radius:{value:4}},vertexShader:P0,fragmentShader:H0}),g=d.clone();g.defines.HORIZONTAL_PASS=1;let m=new Tt;m.setAttribute("position",new It(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let A=new Ze(m,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nh;let p=this.type;this.render=function(y,S,U){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||y.length===0)return;let D=e.getRenderTarget(),M=e.getActiveCubeFace(),I=e.getActiveMipmapLevel(),H=e.state;H.setBlending(Gr),H.buffers.depth.getReversed()===!0?H.buffers.color.setClear(0,0,0,0):H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);let k=p!==Dr&&this.type===Dr,G=p===Dr&&this.type!==Dr;for(let Z=0,V=y.length;Z<V;Z++){let $=y[Z],J=$.shadow;if(J===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(J.autoUpdate===!1&&J.needsUpdate===!1)continue;a.copy(J.mapSize);let te=J.getFrameExtents();if(a.multiply(te),n.copy(J.mapSize),(a.x>u||a.y>u)&&(a.x>u&&(n.x=Math.floor(u/te.x),a.x=n.x*te.x,J.mapSize.x=n.x),a.y>u&&(n.y=Math.floor(u/te.y),a.y=n.y*te.y,J.mapSize.y=n.y)),J.map===null||k===!0||G===!0){let Ue=this.type!==Dr?{minFilter:Kt,magFilter:Kt}:{};J.map!==null&&J.map.dispose(),J.map=new zr(a.x,a.y,Ue),J.map.texture.name=$.name+".shadowMap",J.camera.updateProjectionMatrix()}e.setRenderTarget(J.map),e.clear();let Ae=J.getViewportCount();for(let Ue=0;Ue<Ae;Ue++){let Pe=J.getViewport(Ue);o.set(n.x*Pe.x,n.y*Pe.y,n.x*Pe.z,n.y*Pe.w),H.viewport(o),J.updateMatrices($,Ue),i=J.getFrustum(),x(S,U,J.camera,$,this.type)}J.isPointLightShadow!==!0&&this.type===Dr&&w(J,U),J.needsUpdate=!1}p=this.type,f.needsUpdate=!1,e.setRenderTarget(D,M,I)};function w(y,S){let U=t.update(A);d.defines.VSM_SAMPLES!==y.blurSamples&&(d.defines.VSM_SAMPLES=y.blurSamples,g.defines.VSM_SAMPLES=y.blurSamples,d.needsUpdate=!0,g.needsUpdate=!0),y.mapPass===null&&(y.mapPass=new zr(a.x,a.y)),d.uniforms.shadow_pass.value=y.map.texture,d.uniforms.resolution.value=y.mapSize,d.uniforms.radius.value=y.radius,e.setRenderTarget(y.mapPass),e.clear(),e.renderBufferDirect(S,null,U,d,A,null),g.uniforms.shadow_pass.value=y.mapPass.texture,g.uniforms.resolution.value=y.mapSize,g.uniforms.radius.value=y.radius,e.setRenderTarget(y.map),e.clear(),e.renderBufferDirect(S,null,U,g,A,null)}function C(y,S,U,D){let M=null,I=U.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(I!==void 0)M=I;else if(M=U.isPointLight===!0?l:s,e.localClippingEnabled&&S.clipShadows===!0&&Array.isArray(S.clippingPlanes)&&S.clippingPlanes.length!==0||S.displacementMap&&S.displacementScale!==0||S.alphaMap&&S.alphaTest>0||S.map&&S.alphaTest>0||S.alphaToCoverage===!0){let H=M.uuid,k=S.uuid,G=c[H];G===void 0&&(G={},c[H]=G);let Z=G[k];Z===void 0&&(Z=M.clone(),G[k]=Z,S.addEventListener("dispose",T)),M=Z}if(M.visible=S.visible,M.wireframe=S.wireframe,D===Dr?M.side=S.shadowSide!==null?S.shadowSide:S.side:M.side=S.shadowSide!==null?S.shadowSide:h[S.side],M.alphaMap=S.alphaMap,M.alphaTest=S.alphaToCoverage===!0?.5:S.alphaTest,M.map=S.map,M.clipShadows=S.clipShadows,M.clippingPlanes=S.clippingPlanes,M.clipIntersection=S.clipIntersection,M.displacementMap=S.displacementMap,M.displacementScale=S.displacementScale,M.displacementBias=S.displacementBias,M.wireframeLinewidth=S.wireframeLinewidth,M.linewidth=S.linewidth,U.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let H=e.properties.get(M);H.light=U}return M}function x(y,S,U,D,M){if(y.visible===!1)return;if(y.layers.test(S.layers)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&M===Dr)&&(!y.frustumCulled||i.intersectsObject(y))){y.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,y.matrixWorld);let H=t.update(y),k=y.material;if(Array.isArray(k)){let G=H.groups;for(let Z=0,V=G.length;Z<V;Z++){let $=G[Z],J=k[$.materialIndex];if(J&&J.visible){let te=C(y,J,D,M);y.onBeforeShadow(e,y,S,U,H,te,$),e.renderBufferDirect(U,null,H,te,y,$),y.onAfterShadow(e,y,S,U,H,te,$)}}}else if(k.visible){let G=C(y,k,D,M);y.onBeforeShadow(e,y,S,U,H,G,null),e.renderBufferDirect(U,null,H,G,y,null),y.onAfterShadow(e,y,S,U,H,G,null)}}let I=y.children;for(let H=0,k=I.length;H<k;H++)x(I[H],S,U,D,M)}function T(y){y.target.removeEventListener("dispose",T);for(let S in c){let U=c[S],D=y.target.uuid;D in U&&(U[D].dispose(),delete U[D])}}}var O0={[mo]:Eo,[wo]:Mo,[Co]:Do,[zi]:vo,[Eo]:mo,[Mo]:wo,[Do]:Co,[vo]:zi};function k0(e,t){function r(){let R=!1,le=new lt,de=null,Be=new lt(0,0,0,0);return{setMask:function(ne){de!==ne&&!R&&(e.colorMask(ne,ne,ne,ne),de=ne)},setLocked:function(ne){R=ne},setClear:function(ne,ee,Se,Ne,ut){ut===!0&&(ne*=Ne,ee*=Ne,Se*=Ne),le.set(ne,ee,Se,Ne),Be.equals(le)===!1&&(e.clearColor(ne,ee,Se,Ne),Be.copy(le))},reset:function(){R=!1,de=null,Be.set(-1,0,0,0)}}}function i(){let R=!1,le=!1,de=null,Be=null,ne=null;return{setReversed:function(ee){if(le!==ee){let Se=t.get("EXT_clip_control");ee?Se.clipControlEXT(Se.LOWER_LEFT_EXT,Se.ZERO_TO_ONE_EXT):Se.clipControlEXT(Se.LOWER_LEFT_EXT,Se.NEGATIVE_ONE_TO_ONE_EXT),le=ee;let Ne=ne;ne=null,this.setClear(Ne)}},getReversed:function(){return le},setTest:function(ee){ee?P(e.DEPTH_TEST):L(e.DEPTH_TEST)},setMask:function(ee){de!==ee&&!R&&(e.depthMask(ee),de=ee)},setFunc:function(ee){if(le&&(ee=O0[ee]),Be!==ee){switch(ee){case mo:e.depthFunc(e.NEVER);break;case Eo:e.depthFunc(e.ALWAYS);break;case wo:e.depthFunc(e.LESS);break;case zi:e.depthFunc(e.LEQUAL);break;case Co:e.depthFunc(e.EQUAL);break;case vo:e.depthFunc(e.GEQUAL);break;case Mo:e.depthFunc(e.GREATER);break;case Do:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}Be=ee}},setLocked:function(ee){R=ee},setClear:function(ee){ne!==ee&&(le&&(ee=1-ee),e.clearDepth(ee),ne=ee)},reset:function(){R=!1,de=null,Be=null,ne=null,le=!1}}}function a(){let R=!1,le=null,de=null,Be=null,ne=null,ee=null,Se=null,Ne=null,ut=null;return{setTest:function(et){R||(et?P(e.STENCIL_TEST):L(e.STENCIL_TEST))},setMask:function(et){le!==et&&!R&&(e.stencilMask(et),le=et)},setFunc:function(et,Ht,Gt){(de!==et||Be!==Ht||ne!==Gt)&&(e.stencilFunc(et,Ht,Gt),de=et,Be=Ht,ne=Gt)},setOp:function(et,Ht,Gt){(ee!==et||Se!==Ht||Ne!==Gt)&&(e.stencilOp(et,Ht,Gt),ee=et,Se=Ht,Ne=Gt)},setLocked:function(et){R=et},setClear:function(et){ut!==et&&(e.clearStencil(et),ut=et)},reset:function(){R=!1,le=null,de=null,Be=null,ne=null,ee=null,Se=null,Ne=null,ut=null}}}let n=new r,o=new i,s=new a,l=new WeakMap,c=new WeakMap,u={},h={},d=new WeakMap,g=[],m=null,A=!1,f=null,p=null,w=null,C=null,x=null,T=null,y=null,S=new Ye(0,0,0),U=0,D=!1,M=null,I=null,H=null,k=null,G=null,Z=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,$=0,J=e.getParameter(e.VERSION);J.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(J)[1]),V=$>=1):J.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),V=$>=2);let te=null,Ae={},Ue=e.getParameter(e.SCISSOR_BOX),Pe=e.getParameter(e.VIEWPORT),qe=new lt().fromArray(Ue),He=new lt().fromArray(Pe);function O(R,le,de,Be){let ne=new Uint8Array(4),ee=e.createTexture();e.bindTexture(R,ee),e.texParameteri(R,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(R,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Se=0;Se<de;Se++)R===e.TEXTURE_3D||R===e.TEXTURE_2D_ARRAY?e.texImage3D(le,0,e.RGBA,1,1,Be,0,e.RGBA,e.UNSIGNED_BYTE,ne):e.texImage2D(le+Se,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,ne);return ee}let ce={};ce[e.TEXTURE_2D]=O(e.TEXTURE_2D,e.TEXTURE_2D,1),ce[e.TEXTURE_CUBE_MAP]=O(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[e.TEXTURE_2D_ARRAY]=O(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ce[e.TEXTURE_3D]=O(e.TEXTURE_3D,e.TEXTURE_3D,1,1),n.setClear(0,0,0,1),o.setClear(1),s.setClear(0),P(e.DEPTH_TEST),o.setFunc(zi),ge(!1),j(Bc),P(e.CULL_FACE),Ee(Gr);function P(R){u[R]!==!0&&(e.enable(R),u[R]=!0)}function L(R){u[R]!==!1&&(e.disable(R),u[R]=!1)}function X(R,le){return h[R]!==le?(e.bindFramebuffer(R,le),h[R]=le,R===e.DRAW_FRAMEBUFFER&&(h[e.FRAMEBUFFER]=le),R===e.FRAMEBUFFER&&(h[e.DRAW_FRAMEBUFFER]=le),!0):!1}function z(R,le){let de=g,Be=!1;if(R){de=d.get(le),de===void 0&&(de=[],d.set(le,de));let ne=R.textures;if(de.length!==ne.length||de[0]!==e.COLOR_ATTACHMENT0){for(let ee=0,Se=ne.length;ee<Se;ee++)de[ee]=e.COLOR_ATTACHMENT0+ee;de.length=ne.length,Be=!0}}else de[0]!==e.BACK&&(de[0]=e.BACK,Be=!0);Be&&e.drawBuffers(de)}function he(R){return m!==R?(e.useProgram(R),m=R,!0):!1}let _={[ii]:e.FUNC_ADD,[ip]:e.FUNC_SUBTRACT,[ap]:e.FUNC_REVERSE_SUBTRACT};_[np]=e.MIN,_[sp]=e.MAX;let ie={[op]:e.ZERO,[lp]:e.ONE,[cp]:e.SRC_COLOR,[fo]:e.SRC_ALPHA,[fp]:e.SRC_ALPHA_SATURATE,[pp]:e.DST_COLOR,[up]:e.DST_ALPHA,[hp]:e.ONE_MINUS_SRC_COLOR,[Ao]:e.ONE_MINUS_SRC_ALPHA,[gp]:e.ONE_MINUS_DST_COLOR,[dp]:e.ONE_MINUS_DST_ALPHA,[Ap]:e.CONSTANT_COLOR,[mp]:e.ONE_MINUS_CONSTANT_COLOR,[Ep]:e.CONSTANT_ALPHA,[wp]:e.ONE_MINUS_CONSTANT_ALPHA};function Ee(R,le,de,Be,ne,ee,Se,Ne,ut,et){if(R===Gr){A===!0&&(L(e.BLEND),A=!1);return}if(A===!1&&(P(e.BLEND),A=!0),R!==rp){if(R!==f||et!==D){if((p!==ii||x!==ii)&&(e.blendEquation(e.FUNC_ADD),p=ii,x=ii),et)switch(R){case ki:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case xc:e.blendFunc(e.ONE,e.ONE);break;case _c:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case Sc:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}else switch(R){case ki:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case xc:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case _c:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Sc:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}w=null,C=null,T=null,y=null,S.set(0,0,0),U=0,f=R,D=et}return}ne=ne||le,ee=ee||de,Se=Se||Be,(le!==p||ne!==x)&&(e.blendEquationSeparate(_[le],_[ne]),p=le,x=ne),(de!==w||Be!==C||ee!==T||Se!==y)&&(e.blendFuncSeparate(ie[de],ie[Be],ie[ee],ie[Se]),w=de,C=Be,T=ee,y=Se),(Ne.equals(S)===!1||ut!==U)&&(e.blendColor(Ne.r,Ne.g,Ne.b,ut),S.copy(Ne),U=ut),f=R,D=!1}function ve(R,le){R.side===$t?L(e.CULL_FACE):P(e.CULL_FACE);let de=R.side===Nt;le&&(de=!de),ge(de),R.blending===ki&&R.transparent===!1?Ee(Gr):Ee(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),o.setFunc(R.depthFunc),o.setTest(R.depthTest),o.setMask(R.depthWrite),n.setMask(R.colorWrite);let Be=R.stencilWrite;s.setTest(Be),Be&&(s.setMask(R.stencilWriteMask),s.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),s.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),fe(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?P(e.SAMPLE_ALPHA_TO_COVERAGE):L(e.SAMPLE_ALPHA_TO_COVERAGE)}function ge(R){M!==R&&(R?e.frontFace(e.CW):e.frontFace(e.CCW),M=R)}function j(R){R!==$d?(P(e.CULL_FACE),R!==I&&(R===Bc?e.cullFace(e.BACK):R===ep?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):L(e.CULL_FACE),I=R}function ae(R){R!==H&&(V&&e.lineWidth(R),H=R)}function fe(R,le,de){R?(P(e.POLYGON_OFFSET_FILL),(k!==le||G!==de)&&(e.polygonOffset(le,de),k=le,G=de)):L(e.POLYGON_OFFSET_FILL)}function ue(R){R?P(e.SCISSOR_TEST):L(e.SCISSOR_TEST)}function ye(R){R===void 0&&(R=e.TEXTURE0+Z-1),te!==R&&(e.activeTexture(R),te=R)}function Ie(R,le,de){de===void 0&&(te===null?de=e.TEXTURE0+Z-1:de=te);let Be=Ae[de];Be===void 0&&(Be={type:void 0,texture:void 0},Ae[de]=Be),(Be.type!==R||Be.texture!==le)&&(te!==de&&(e.activeTexture(de),te=de),e.bindTexture(R,le||ce[R]),Be.type=R,Be.texture=le)}function B(){let R=Ae[te];R!==void 0&&R.type!==void 0&&(e.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function E(){try{e.compressedTexImage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Q(){try{e.compressedTexImage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function K(){try{e.texSubImage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function re(){try{e.texSubImage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function q(){try{e.compressedTexSubImage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Me(){try{e.compressedTexSubImage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function pe(){try{e.texStorage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function xe(){try{e.texStorage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function be(){try{e.texImage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function se(){try{e.texImage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function me(R){qe.equals(R)===!1&&(e.scissor(R.x,R.y,R.z,R.w),qe.copy(R))}function Fe(R){He.equals(R)===!1&&(e.viewport(R.x,R.y,R.z,R.w),He.copy(R))}function _e(R,le){let de=c.get(le);de===void 0&&(de=new WeakMap,c.set(le,de));let Be=de.get(R);Be===void 0&&(Be=e.getUniformBlockIndex(le,R.name),de.set(R,Be))}function we(R,le){let de=c.get(le).get(R);l.get(le)!==de&&(e.uniformBlockBinding(le,de,R.__bindingPointIndex),l.set(le,de))}function Ve(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},te=null,Ae={},h={},d=new WeakMap,g=[],m=null,A=!1,f=null,p=null,w=null,C=null,x=null,T=null,y=null,S=new Ye(0,0,0),U=0,D=!1,M=null,I=null,H=null,k=null,G=null,qe.set(0,0,e.canvas.width,e.canvas.height),He.set(0,0,e.canvas.width,e.canvas.height),n.reset(),o.reset(),s.reset()}return{buffers:{color:n,depth:o,stencil:s},enable:P,disable:L,bindFramebuffer:X,drawBuffers:z,useProgram:he,setBlending:Ee,setMaterial:ve,setFlipSided:ge,setCullFace:j,setLineWidth:ae,setPolygonOffset:fe,setScissorTest:ue,activeTexture:ye,bindTexture:Ie,unbindTexture:B,compressedTexImage2D:E,compressedTexImage3D:Q,texImage2D:be,texImage3D:se,updateUBOMapping:_e,uniformBlockBinding:we,texStorage2D:pe,texStorage3D:xe,texSubImage2D:K,texSubImage3D:re,compressedTexSubImage2D:q,compressedTexSubImage3D:Me,scissor:me,viewport:Fe,reset:Ve}}function V0(e,t,r,i,a,n,o){let s=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new je,u=new WeakMap,h,d=new WeakMap,g=!1;try{g=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(B){}function m(B,E){return g?new OffscreenCanvas(B,E):kn("canvas")}function A(B,E,Q){let K=1,re=Ie(B);if((re.width>Q||re.height>Q)&&(K=Q/Math.max(re.width,re.height)),K<1)if(typeof HTMLImageElement!="undefined"&&B instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&B instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&B instanceof ImageBitmap||typeof VideoFrame!="undefined"&&B instanceof VideoFrame){let q=Math.floor(K*re.width),Me=Math.floor(K*re.height);h===void 0&&(h=m(q,Me));let pe=E?m(q,Me):h;return pe.width=q,pe.height=Me,pe.getContext("2d").drawImage(B,0,0,q,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+re.width+"x"+re.height+") to ("+q+"x"+Me+")."),pe}else return"data"in B&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+re.width+"x"+re.height+")."),B;return B}function f(B){return B.generateMipmaps}function p(B){e.generateMipmap(B)}function w(B){return B.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:B.isWebGL3DRenderTarget?e.TEXTURE_3D:B.isWebGLArrayRenderTarget||B.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function C(B,E,Q,K,re=!1){if(B!==null){if(e[B]!==void 0)return e[B];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+B+"'")}let q=E;if(E===e.RED&&(Q===e.FLOAT&&(q=e.R32F),Q===e.HALF_FLOAT&&(q=e.R16F),Q===e.UNSIGNED_BYTE&&(q=e.R8)),E===e.RED_INTEGER&&(Q===e.UNSIGNED_BYTE&&(q=e.R8UI),Q===e.UNSIGNED_SHORT&&(q=e.R16UI),Q===e.UNSIGNED_INT&&(q=e.R32UI),Q===e.BYTE&&(q=e.R8I),Q===e.SHORT&&(q=e.R16I),Q===e.INT&&(q=e.R32I)),E===e.RG&&(Q===e.FLOAT&&(q=e.RG32F),Q===e.HALF_FLOAT&&(q=e.RG16F),Q===e.UNSIGNED_BYTE&&(q=e.RG8)),E===e.RG_INTEGER&&(Q===e.UNSIGNED_BYTE&&(q=e.RG8UI),Q===e.UNSIGNED_SHORT&&(q=e.RG16UI),Q===e.UNSIGNED_INT&&(q=e.RG32UI),Q===e.BYTE&&(q=e.RG8I),Q===e.SHORT&&(q=e.RG16I),Q===e.INT&&(q=e.RG32I)),E===e.RGB_INTEGER&&(Q===e.UNSIGNED_BYTE&&(q=e.RGB8UI),Q===e.UNSIGNED_SHORT&&(q=e.RGB16UI),Q===e.UNSIGNED_INT&&(q=e.RGB32UI),Q===e.BYTE&&(q=e.RGB8I),Q===e.SHORT&&(q=e.RGB16I),Q===e.INT&&(q=e.RGB32I)),E===e.RGBA_INTEGER&&(Q===e.UNSIGNED_BYTE&&(q=e.RGBA8UI),Q===e.UNSIGNED_SHORT&&(q=e.RGBA16UI),Q===e.UNSIGNED_INT&&(q=e.RGBA32UI),Q===e.BYTE&&(q=e.RGBA8I),Q===e.SHORT&&(q=e.RGBA16I),Q===e.INT&&(q=e.RGBA32I)),E===e.RGB&&(Q===e.UNSIGNED_INT_5_9_9_9_REV&&(q=e.RGB9_E5),Q===e.UNSIGNED_INT_10F_11F_11F_REV&&(q=e.R11F_G11F_B10F)),E===e.RGBA){let Me=re?Gn:tt.getTransfer(K);Q===e.FLOAT&&(q=e.RGBA32F),Q===e.HALF_FLOAT&&(q=e.RGBA16F),Q===e.UNSIGNED_BYTE&&(q=Me===at?e.SRGB8_ALPHA8:e.RGBA8),Q===e.UNSIGNED_SHORT_4_4_4_4&&(q=e.RGBA4),Q===e.UNSIGNED_SHORT_5_5_5_1&&(q=e.RGB5_A1)}return(q===e.R16F||q===e.R32F||q===e.RG16F||q===e.RG32F||q===e.RGBA16F||q===e.RGBA32F)&&t.get("EXT_color_buffer_float"),q}function x(B,E){let Q;return B?E===null||E===li||E===ba?Q=e.DEPTH24_STENCIL8:E===pr?Q=e.DEPTH32F_STENCIL8:E===Ta&&(Q=e.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===li||E===ba?Q=e.DEPTH_COMPONENT24:E===pr?Q=e.DEPTH_COMPONENT32F:E===Ta&&(Q=e.DEPTH_COMPONENT16),Q}function T(B,E){return f(B)===!0||B.isFramebufferTexture&&B.minFilter!==Kt&&B.minFilter!==or?Math.log2(Math.max(E.width,E.height))+1:B.mipmaps!==void 0&&B.mipmaps.length>0?B.mipmaps.length:B.isCompressedTexture&&Array.isArray(B.image)?E.mipmaps.length:1}function y(B){let E=B.target;E.removeEventListener("dispose",y),U(E),E.isVideoTexture&&u.delete(E)}function S(B){let E=B.target;E.removeEventListener("dispose",S),M(E)}function U(B){let E=i.get(B);if(E.__webglInit===void 0)return;let Q=B.source,K=d.get(Q);if(K){let re=K[E.__cacheKey];re.usedTimes--,re.usedTimes===0&&D(B),Object.keys(K).length===0&&d.delete(Q)}i.remove(B)}function D(B){let E=i.get(B);e.deleteTexture(E.__webglTexture);let Q=B.source,K=d.get(Q);delete K[E.__cacheKey],o.memory.textures--}function M(B){let E=i.get(B);if(B.depthTexture&&(B.depthTexture.dispose(),i.remove(B.depthTexture)),B.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(E.__webglFramebuffer[K]))for(let re=0;re<E.__webglFramebuffer[K].length;re++)e.deleteFramebuffer(E.__webglFramebuffer[K][re]);else e.deleteFramebuffer(E.__webglFramebuffer[K]);E.__webglDepthbuffer&&e.deleteRenderbuffer(E.__webglDepthbuffer[K])}else{if(Array.isArray(E.__webglFramebuffer))for(let K=0;K<E.__webglFramebuffer.length;K++)e.deleteFramebuffer(E.__webglFramebuffer[K]);else e.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&e.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&e.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let K=0;K<E.__webglColorRenderbuffer.length;K++)E.__webglColorRenderbuffer[K]&&e.deleteRenderbuffer(E.__webglColorRenderbuffer[K]);E.__webglDepthRenderbuffer&&e.deleteRenderbuffer(E.__webglDepthRenderbuffer)}let Q=B.textures;for(let K=0,re=Q.length;K<re;K++){let q=i.get(Q[K]);q.__webglTexture&&(e.deleteTexture(q.__webglTexture),o.memory.textures--),i.remove(Q[K])}i.remove(B)}let I=0;function H(){I=0}function k(){let B=I;return B>=a.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+B+" texture units while this GPU supports only "+a.maxTextures),I+=1,B}function G(B){let E=[];return E.push(B.wrapS),E.push(B.wrapT),E.push(B.wrapR||0),E.push(B.magFilter),E.push(B.minFilter),E.push(B.anisotropy),E.push(B.internalFormat),E.push(B.format),E.push(B.type),E.push(B.generateMipmaps),E.push(B.premultiplyAlpha),E.push(B.flipY),E.push(B.unpackAlignment),E.push(B.colorSpace),E.join()}function Z(B,E){let Q=i.get(B);if(B.isVideoTexture&&ue(B),B.isRenderTargetTexture===!1&&B.isExternalTexture!==!0&&B.version>0&&Q.__version!==B.version){let K=B.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ce(Q,B,E);return}}else B.isExternalTexture&&(Q.__webglTexture=B.sourceTexture?B.sourceTexture:null);r.bindTexture(e.TEXTURE_2D,Q.__webglTexture,e.TEXTURE0+E)}function V(B,E){let Q=i.get(B);if(B.isRenderTargetTexture===!1&&B.version>0&&Q.__version!==B.version){ce(Q,B,E);return}r.bindTexture(e.TEXTURE_2D_ARRAY,Q.__webglTexture,e.TEXTURE0+E)}function $(B,E){let Q=i.get(B);if(B.isRenderTargetTexture===!1&&B.version>0&&Q.__version!==B.version){ce(Q,B,E);return}r.bindTexture(e.TEXTURE_3D,Q.__webglTexture,e.TEXTURE0+E)}function J(B,E){let Q=i.get(B);if(B.version>0&&Q.__version!==B.version){P(Q,B,E);return}r.bindTexture(e.TEXTURE_CUBE_MAP,Q.__webglTexture,e.TEXTURE0+E)}let te={[Pn]:e.REPEAT,[ni]:e.CLAMP_TO_EDGE,[_o]:e.MIRRORED_REPEAT},Ae={[Kt]:e.NEAREST,[yp]:e.NEAREST_MIPMAP_NEAREST,[tn]:e.NEAREST_MIPMAP_LINEAR,[or]:e.LINEAR,[bs]:e.LINEAR_MIPMAP_NEAREST,[si]:e.LINEAR_MIPMAP_LINEAR},Ue={[bp]:e.NEVER,[Pp]:e.ALWAYS,[Qp]:e.LESS,[Jh]:e.LEQUAL,[Up]:e.EQUAL,[Np]:e.GEQUAL,[Fp]:e.GREATER,[Lp]:e.NOTEQUAL};function Pe(B,E){if(E.type===pr&&t.has("OES_texture_float_linear")===!1&&(E.magFilter===or||E.magFilter===bs||E.magFilter===tn||E.magFilter===si||E.minFilter===or||E.minFilter===bs||E.minFilter===tn||E.minFilter===si)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(B,e.TEXTURE_WRAP_S,te[E.wrapS]),e.texParameteri(B,e.TEXTURE_WRAP_T,te[E.wrapT]),(B===e.TEXTURE_3D||B===e.TEXTURE_2D_ARRAY)&&e.texParameteri(B,e.TEXTURE_WRAP_R,te[E.wrapR]),e.texParameteri(B,e.TEXTURE_MAG_FILTER,Ae[E.magFilter]),e.texParameteri(B,e.TEXTURE_MIN_FILTER,Ae[E.minFilter]),E.compareFunction&&(e.texParameteri(B,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(B,e.TEXTURE_COMPARE_FUNC,Ue[E.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===Kt||E.minFilter!==tn&&E.minFilter!==si||E.type===pr&&t.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||i.get(E).__currentAnisotropy){let Q=t.get("EXT_texture_filter_anisotropic");e.texParameterf(B,Q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,a.getMaxAnisotropy())),i.get(E).__currentAnisotropy=E.anisotropy}}}function qe(B,E){let Q=!1;B.__webglInit===void 0&&(B.__webglInit=!0,E.addEventListener("dispose",y));let K=E.source,re=d.get(K);re===void 0&&(re={},d.set(K,re));let q=G(E);if(q!==B.__cacheKey){re[q]===void 0&&(re[q]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,Q=!0),re[q].usedTimes++;let Me=re[B.__cacheKey];Me!==void 0&&(re[B.__cacheKey].usedTimes--,Me.usedTimes===0&&D(E)),B.__cacheKey=q,B.__webglTexture=re[q].texture}return Q}function He(B,E,Q){return Math.floor(Math.floor(B/Q)/E)}function O(B,E,Q,K){let re=B.updateRanges;if(re.length===0)r.texSubImage2D(e.TEXTURE_2D,0,0,0,E.width,E.height,Q,K,E.data);else{re.sort((be,se)=>be.start-se.start);let q=0;for(let be=1;be<re.length;be++){let se=re[q],me=re[be],Fe=se.start+se.count,_e=He(me.start,E.width,4),we=He(se.start,E.width,4);me.start<=Fe+1&&_e===we&&He(me.start+me.count-1,E.width,4)===_e?se.count=Math.max(se.count,me.start+me.count-se.start):(++q,re[q]=me)}re.length=q+1;let Me=e.getParameter(e.UNPACK_ROW_LENGTH),pe=e.getParameter(e.UNPACK_SKIP_PIXELS),xe=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,E.width);for(let be=0,se=re.length;be<se;be++){let me=re[be],Fe=Math.floor(me.start/4),_e=Math.ceil(me.count/4),we=Fe%E.width,Ve=Math.floor(Fe/E.width),R=_e;e.pixelStorei(e.UNPACK_SKIP_PIXELS,we),e.pixelStorei(e.UNPACK_SKIP_ROWS,Ve),r.texSubImage2D(e.TEXTURE_2D,0,we,Ve,R,1,Q,K,E.data)}B.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,Me),e.pixelStorei(e.UNPACK_SKIP_PIXELS,pe),e.pixelStorei(e.UNPACK_SKIP_ROWS,xe)}}function ce(B,E,Q){let K=e.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(K=e.TEXTURE_2D_ARRAY),E.isData3DTexture&&(K=e.TEXTURE_3D);let re=qe(B,E),q=E.source;r.bindTexture(K,B.__webglTexture,e.TEXTURE0+Q);let Me=i.get(q);if(q.version!==Me.__version||re===!0){r.activeTexture(e.TEXTURE0+Q);let pe=tt.getPrimaries(tt.workingColorSpace),xe=E.colorSpace===Hr?null:tt.getPrimaries(E.colorSpace),be=E.colorSpace===Hr||pe===xe?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,E.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,E.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,be);let se=A(E.image,!1,a.maxTextureSize);se=ye(E,se);let me=n.convert(E.format,E.colorSpace),Fe=n.convert(E.type),_e=C(E.internalFormat,me,Fe,E.colorSpace,E.isVideoTexture);Pe(K,E);let we,Ve=E.mipmaps,R=E.isVideoTexture!==!0,le=Me.__version===void 0||re===!0,de=q.dataReady,Be=T(E,se);if(E.isDepthTexture)_e=x(E.format===Ua,E.type),le&&(R?r.texStorage2D(e.TEXTURE_2D,1,_e,se.width,se.height):r.texImage2D(e.TEXTURE_2D,0,_e,se.width,se.height,0,me,Fe,null));else if(E.isDataTexture)if(Ve.length>0){R&&le&&r.texStorage2D(e.TEXTURE_2D,Be,_e,Ve[0].width,Ve[0].height);for(let ne=0,ee=Ve.length;ne<ee;ne++)we=Ve[ne],R?de&&r.texSubImage2D(e.TEXTURE_2D,ne,0,0,we.width,we.height,me,Fe,we.data):r.texImage2D(e.TEXTURE_2D,ne,_e,we.width,we.height,0,me,Fe,we.data);E.generateMipmaps=!1}else R?(le&&r.texStorage2D(e.TEXTURE_2D,Be,_e,se.width,se.height),de&&O(E,se,me,Fe)):r.texImage2D(e.TEXTURE_2D,0,_e,se.width,se.height,0,me,Fe,se.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){R&&le&&r.texStorage3D(e.TEXTURE_2D_ARRAY,Be,_e,Ve[0].width,Ve[0].height,se.depth);for(let ne=0,ee=Ve.length;ne<ee;ne++)if(we=Ve[ne],E.format!==lr)if(me!==null)if(R){if(de)if(E.layerUpdates.size>0){let Se=hh(we.width,we.height,E.format,E.type);for(let Ne of E.layerUpdates){let ut=we.data.subarray(Ne*Se/we.data.BYTES_PER_ELEMENT,(Ne+1)*Se/we.data.BYTES_PER_ELEMENT);r.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,ne,0,0,Ne,we.width,we.height,1,me,ut)}E.clearLayerUpdates()}else r.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,ne,0,0,0,we.width,we.height,se.depth,me,we.data)}else r.compressedTexImage3D(e.TEXTURE_2D_ARRAY,ne,_e,we.width,we.height,se.depth,0,we.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else R?de&&r.texSubImage3D(e.TEXTURE_2D_ARRAY,ne,0,0,0,we.width,we.height,se.depth,me,Fe,we.data):r.texImage3D(e.TEXTURE_2D_ARRAY,ne,_e,we.width,we.height,se.depth,0,me,Fe,we.data)}else{R&&le&&r.texStorage2D(e.TEXTURE_2D,Be,_e,Ve[0].width,Ve[0].height);for(let ne=0,ee=Ve.length;ne<ee;ne++)we=Ve[ne],E.format!==lr?me!==null?R?de&&r.compressedTexSubImage2D(e.TEXTURE_2D,ne,0,0,we.width,we.height,me,we.data):r.compressedTexImage2D(e.TEXTURE_2D,ne,_e,we.width,we.height,0,we.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):R?de&&r.texSubImage2D(e.TEXTURE_2D,ne,0,0,we.width,we.height,me,Fe,we.data):r.texImage2D(e.TEXTURE_2D,ne,_e,we.width,we.height,0,me,Fe,we.data)}else if(E.isDataArrayTexture)if(R){if(le&&r.texStorage3D(e.TEXTURE_2D_ARRAY,Be,_e,se.width,se.height,se.depth),de)if(E.layerUpdates.size>0){let ne=hh(se.width,se.height,E.format,E.type);for(let ee of E.layerUpdates){let Se=se.data.subarray(ee*ne/se.data.BYTES_PER_ELEMENT,(ee+1)*ne/se.data.BYTES_PER_ELEMENT);r.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ee,se.width,se.height,1,me,Fe,Se)}E.clearLayerUpdates()}else r.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,me,Fe,se.data)}else r.texImage3D(e.TEXTURE_2D_ARRAY,0,_e,se.width,se.height,se.depth,0,me,Fe,se.data);else if(E.isData3DTexture)R?(le&&r.texStorage3D(e.TEXTURE_3D,Be,_e,se.width,se.height,se.depth),de&&r.texSubImage3D(e.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,me,Fe,se.data)):r.texImage3D(e.TEXTURE_3D,0,_e,se.width,se.height,se.depth,0,me,Fe,se.data);else if(E.isFramebufferTexture){if(le)if(R)r.texStorage2D(e.TEXTURE_2D,Be,_e,se.width,se.height);else{let ne=se.width,ee=se.height;for(let Se=0;Se<Be;Se++)r.texImage2D(e.TEXTURE_2D,Se,_e,ne,ee,0,me,Fe,null),ne>>=1,ee>>=1}}else if(Ve.length>0){if(R&&le){let ne=Ie(Ve[0]);r.texStorage2D(e.TEXTURE_2D,Be,_e,ne.width,ne.height)}for(let ne=0,ee=Ve.length;ne<ee;ne++)we=Ve[ne],R?de&&r.texSubImage2D(e.TEXTURE_2D,ne,0,0,me,Fe,we):r.texImage2D(e.TEXTURE_2D,ne,_e,me,Fe,we);E.generateMipmaps=!1}else if(R){if(le){let ne=Ie(se);r.texStorage2D(e.TEXTURE_2D,Be,_e,ne.width,ne.height)}de&&r.texSubImage2D(e.TEXTURE_2D,0,0,0,me,Fe,se)}else r.texImage2D(e.TEXTURE_2D,0,_e,me,Fe,se);f(E)&&p(K),Me.__version=q.version,E.onUpdate&&E.onUpdate(E)}B.__version=E.version}function P(B,E,Q){if(E.image.length!==6)return;let K=qe(B,E),re=E.source;r.bindTexture(e.TEXTURE_CUBE_MAP,B.__webglTexture,e.TEXTURE0+Q);let q=i.get(re);if(re.version!==q.__version||K===!0){r.activeTexture(e.TEXTURE0+Q);let Me=tt.getPrimaries(tt.workingColorSpace),pe=E.colorSpace===Hr?null:tt.getPrimaries(E.colorSpace),xe=E.colorSpace===Hr||Me===pe?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,E.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,E.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);let be=E.isCompressedTexture||E.image[0].isCompressedTexture,se=E.image[0]&&E.image[0].isDataTexture,me=[];for(let ee=0;ee<6;ee++)!be&&!se?me[ee]=A(E.image[ee],!0,a.maxCubemapSize):me[ee]=se?E.image[ee].image:E.image[ee],me[ee]=ye(E,me[ee]);let Fe=me[0],_e=n.convert(E.format,E.colorSpace),we=n.convert(E.type),Ve=C(E.internalFormat,_e,we,E.colorSpace),R=E.isVideoTexture!==!0,le=q.__version===void 0||K===!0,de=re.dataReady,Be=T(E,Fe);Pe(e.TEXTURE_CUBE_MAP,E);let ne;if(be){R&&le&&r.texStorage2D(e.TEXTURE_CUBE_MAP,Be,Ve,Fe.width,Fe.height);for(let ee=0;ee<6;ee++){ne=me[ee].mipmaps;for(let Se=0;Se<ne.length;Se++){let Ne=ne[Se];E.format!==lr?_e!==null?R?de&&r.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Se,0,0,Ne.width,Ne.height,_e,Ne.data):r.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Se,Ve,Ne.width,Ne.height,0,Ne.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):R?de&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Se,0,0,Ne.width,Ne.height,_e,we,Ne.data):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Se,Ve,Ne.width,Ne.height,0,_e,we,Ne.data)}}}else{if(ne=E.mipmaps,R&&le){ne.length>0&&Be++;let ee=Ie(me[0]);r.texStorage2D(e.TEXTURE_CUBE_MAP,Be,Ve,ee.width,ee.height)}for(let ee=0;ee<6;ee++)if(se){R?de&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,me[ee].width,me[ee].height,_e,we,me[ee].data):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,Ve,me[ee].width,me[ee].height,0,_e,we,me[ee].data);for(let Se=0;Se<ne.length;Se++){let Ne=ne[Se].image[ee].image;R?de&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Se+1,0,0,Ne.width,Ne.height,_e,we,Ne.data):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Se+1,Ve,Ne.width,Ne.height,0,_e,we,Ne.data)}}else{R?de&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,_e,we,me[ee]):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,Ve,_e,we,me[ee]);for(let Se=0;Se<ne.length;Se++){let Ne=ne[Se];R?de&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Se+1,0,0,_e,we,Ne.image[ee]):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Se+1,Ve,_e,we,Ne.image[ee])}}}f(E)&&p(e.TEXTURE_CUBE_MAP),q.__version=re.version,E.onUpdate&&E.onUpdate(E)}B.__version=E.version}function L(B,E,Q,K,re,q){let Me=n.convert(Q.format,Q.colorSpace),pe=n.convert(Q.type),xe=C(Q.internalFormat,Me,pe,Q.colorSpace),be=i.get(E),se=i.get(Q);if(se.__renderTarget=E,!be.__hasExternalTextures){let me=Math.max(1,E.width>>q),Fe=Math.max(1,E.height>>q);re===e.TEXTURE_3D||re===e.TEXTURE_2D_ARRAY?r.texImage3D(re,q,xe,me,Fe,E.depth,0,Me,pe,null):r.texImage2D(re,q,xe,me,Fe,0,Me,pe,null)}r.bindFramebuffer(e.FRAMEBUFFER,B),fe(E)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,K,re,se.__webglTexture,0,ae(E)):(re===e.TEXTURE_2D||re>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,K,re,se.__webglTexture,q),r.bindFramebuffer(e.FRAMEBUFFER,null)}function X(B,E,Q){if(e.bindRenderbuffer(e.RENDERBUFFER,B),E.depthBuffer){let K=E.depthTexture,re=K&&K.isDepthTexture?K.type:null,q=x(E.stencilBuffer,re),Me=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,pe=ae(E);fe(E)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,pe,q,E.width,E.height):Q?e.renderbufferStorageMultisample(e.RENDERBUFFER,pe,q,E.width,E.height):e.renderbufferStorage(e.RENDERBUFFER,q,E.width,E.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,Me,e.RENDERBUFFER,B)}else{let K=E.textures;for(let re=0;re<K.length;re++){let q=K[re],Me=n.convert(q.format,q.colorSpace),pe=n.convert(q.type),xe=C(q.internalFormat,Me,pe,q.colorSpace),be=ae(E);Q&&fe(E)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,be,xe,E.width,E.height):fe(E)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,be,xe,E.width,E.height):e.renderbufferStorage(e.RENDERBUFFER,xe,E.width,E.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function z(B,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(r.bindFramebuffer(e.FRAMEBUFFER,B),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Q=i.get(E.depthTexture);Q.__renderTarget=E,(!Q.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),Z(E.depthTexture,0);let K=Q.__webglTexture,re=ae(E);if(E.depthTexture.format===Qa)fe(E)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,K,0,re):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,K,0);else if(E.depthTexture.format===Ua)fe(E)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,K,0,re):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function he(B){let E=i.get(B),Q=B.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==B.depthTexture){let K=B.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),K){let re=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,K.removeEventListener("dispose",re)};K.addEventListener("dispose",re),E.__depthDisposeCallback=re}E.__boundDepthTexture=K}if(B.depthTexture&&!E.__autoAllocateDepthBuffer){if(Q)throw new Error("target.depthTexture not supported in Cube render targets");let K=B.texture.mipmaps;K&&K.length>0?z(E.__webglFramebuffer[0],B):z(E.__webglFramebuffer,B)}else if(Q){E.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(r.bindFramebuffer(e.FRAMEBUFFER,E.__webglFramebuffer[K]),E.__webglDepthbuffer[K]===void 0)E.__webglDepthbuffer[K]=e.createRenderbuffer(),X(E.__webglDepthbuffer[K],B,!1);else{let re=B.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,q=E.__webglDepthbuffer[K];e.bindRenderbuffer(e.RENDERBUFFER,q),e.framebufferRenderbuffer(e.FRAMEBUFFER,re,e.RENDERBUFFER,q)}}else{let K=B.texture.mipmaps;if(K&&K.length>0?r.bindFramebuffer(e.FRAMEBUFFER,E.__webglFramebuffer[0]):r.bindFramebuffer(e.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=e.createRenderbuffer(),X(E.__webglDepthbuffer,B,!1);else{let re=B.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,q=E.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,q),e.framebufferRenderbuffer(e.FRAMEBUFFER,re,e.RENDERBUFFER,q)}}r.bindFramebuffer(e.FRAMEBUFFER,null)}function _(B,E,Q){let K=i.get(B);E!==void 0&&L(K.__webglFramebuffer,B,B.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),Q!==void 0&&he(B)}function ie(B){let E=B.texture,Q=i.get(B),K=i.get(E);B.addEventListener("dispose",S);let re=B.textures,q=B.isWebGLCubeRenderTarget===!0,Me=re.length>1;if(Me||(K.__webglTexture===void 0&&(K.__webglTexture=e.createTexture()),K.__version=E.version,o.memory.textures++),q){Q.__webglFramebuffer=[];for(let pe=0;pe<6;pe++)if(E.mipmaps&&E.mipmaps.length>0){Q.__webglFramebuffer[pe]=[];for(let xe=0;xe<E.mipmaps.length;xe++)Q.__webglFramebuffer[pe][xe]=e.createFramebuffer()}else Q.__webglFramebuffer[pe]=e.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){Q.__webglFramebuffer=[];for(let pe=0;pe<E.mipmaps.length;pe++)Q.__webglFramebuffer[pe]=e.createFramebuffer()}else Q.__webglFramebuffer=e.createFramebuffer();if(Me)for(let pe=0,xe=re.length;pe<xe;pe++){let be=i.get(re[pe]);be.__webglTexture===void 0&&(be.__webglTexture=e.createTexture(),o.memory.textures++)}if(B.samples>0&&fe(B)===!1){Q.__webglMultisampledFramebuffer=e.createFramebuffer(),Q.__webglColorRenderbuffer=[],r.bindFramebuffer(e.FRAMEBUFFER,Q.__webglMultisampledFramebuffer);for(let pe=0;pe<re.length;pe++){let xe=re[pe];Q.__webglColorRenderbuffer[pe]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,Q.__webglColorRenderbuffer[pe]);let be=n.convert(xe.format,xe.colorSpace),se=n.convert(xe.type),me=C(xe.internalFormat,be,se,xe.colorSpace,B.isXRRenderTarget===!0),Fe=ae(B);e.renderbufferStorageMultisample(e.RENDERBUFFER,Fe,me,B.width,B.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+pe,e.RENDERBUFFER,Q.__webglColorRenderbuffer[pe])}e.bindRenderbuffer(e.RENDERBUFFER,null),B.depthBuffer&&(Q.__webglDepthRenderbuffer=e.createRenderbuffer(),X(Q.__webglDepthRenderbuffer,B,!0)),r.bindFramebuffer(e.FRAMEBUFFER,null)}}if(q){r.bindTexture(e.TEXTURE_CUBE_MAP,K.__webglTexture),Pe(e.TEXTURE_CUBE_MAP,E);for(let pe=0;pe<6;pe++)if(E.mipmaps&&E.mipmaps.length>0)for(let xe=0;xe<E.mipmaps.length;xe++)L(Q.__webglFramebuffer[pe][xe],B,E,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+pe,xe);else L(Q.__webglFramebuffer[pe],B,E,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0);f(E)&&p(e.TEXTURE_CUBE_MAP),r.unbindTexture()}else if(Me){for(let pe=0,xe=re.length;pe<xe;pe++){let be=re[pe],se=i.get(be),me=e.TEXTURE_2D;(B.isWebGL3DRenderTarget||B.isWebGLArrayRenderTarget)&&(me=B.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),r.bindTexture(me,se.__webglTexture),Pe(me,be),L(Q.__webglFramebuffer,B,be,e.COLOR_ATTACHMENT0+pe,me,0),f(be)&&p(me)}r.unbindTexture()}else{let pe=e.TEXTURE_2D;if((B.isWebGL3DRenderTarget||B.isWebGLArrayRenderTarget)&&(pe=B.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),r.bindTexture(pe,K.__webglTexture),Pe(pe,E),E.mipmaps&&E.mipmaps.length>0)for(let xe=0;xe<E.mipmaps.length;xe++)L(Q.__webglFramebuffer[xe],B,E,e.COLOR_ATTACHMENT0,pe,xe);else L(Q.__webglFramebuffer,B,E,e.COLOR_ATTACHMENT0,pe,0);f(E)&&p(pe),r.unbindTexture()}B.depthBuffer&&he(B)}function Ee(B){let E=B.textures;for(let Q=0,K=E.length;Q<K;Q++){let re=E[Q];if(f(re)){let q=w(B),Me=i.get(re).__webglTexture;r.bindTexture(q,Me),p(q),r.unbindTexture()}}}let ve=[],ge=[];function j(B){if(B.samples>0){if(fe(B)===!1){let E=B.textures,Q=B.width,K=B.height,re=e.COLOR_BUFFER_BIT,q=B.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,Me=i.get(B),pe=E.length>1;if(pe)for(let be=0;be<E.length;be++)r.bindFramebuffer(e.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+be,e.RENDERBUFFER,null),r.bindFramebuffer(e.FRAMEBUFFER,Me.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+be,e.TEXTURE_2D,null,0);r.bindFramebuffer(e.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer);let xe=B.texture.mipmaps;xe&&xe.length>0?r.bindFramebuffer(e.DRAW_FRAMEBUFFER,Me.__webglFramebuffer[0]):r.bindFramebuffer(e.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let be=0;be<E.length;be++){if(B.resolveDepthBuffer&&(B.depthBuffer&&(re|=e.DEPTH_BUFFER_BIT),B.stencilBuffer&&B.resolveStencilBuffer&&(re|=e.STENCIL_BUFFER_BIT)),pe){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,Me.__webglColorRenderbuffer[be]);let se=i.get(E[be]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,se,0)}e.blitFramebuffer(0,0,Q,K,0,0,Q,K,re,e.NEAREST),l===!0&&(ve.length=0,ge.length=0,ve.push(e.COLOR_ATTACHMENT0+be),B.depthBuffer&&B.resolveDepthBuffer===!1&&(ve.push(q),ge.push(q),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,ge)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ve))}if(r.bindFramebuffer(e.READ_FRAMEBUFFER,null),r.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),pe)for(let be=0;be<E.length;be++){r.bindFramebuffer(e.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+be,e.RENDERBUFFER,Me.__webglColorRenderbuffer[be]);let se=i.get(E[be]).__webglTexture;r.bindFramebuffer(e.FRAMEBUFFER,Me.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+be,e.TEXTURE_2D,se,0)}r.bindFramebuffer(e.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(B.depthBuffer&&B.resolveDepthBuffer===!1&&l){let E=B.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[E])}}}function ae(B){return Math.min(a.maxSamples,B.samples)}function fe(B){let E=i.get(B);return B.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function ue(B){let E=o.render.frame;u.get(B)!==E&&(u.set(B,E),B.update())}function ye(B,E){let Q=B.colorSpace,K=B.format,re=B.type;return B.isCompressedTexture===!0||B.isVideoTexture===!0||Q!==Ji&&Q!==Hr&&(tt.getTransfer(Q)===at?(K!==lr||re!==cr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",Q)),E}function Ie(B){return typeof HTMLImageElement!="undefined"&&B instanceof HTMLImageElement?(c.width=B.naturalWidth||B.width,c.height=B.naturalHeight||B.height):typeof VideoFrame!="undefined"&&B instanceof VideoFrame?(c.width=B.displayWidth,c.height=B.displayHeight):(c.width=B.width,c.height=B.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=H,this.setTexture2D=Z,this.setTexture2DArray=V,this.setTexture3D=$,this.setTextureCube=J,this.rebindTextures=_,this.setupRenderTarget=ie,this.updateRenderTargetMipmap=Ee,this.updateMultisampleRenderTarget=j,this.setupDepthRenderbuffer=he,this.setupFrameBufferTexture=L,this.useMultisampledRTT=fe}function z0(e,t){function r(i,a=Hr){let n,o=tt.getTransfer(a);if(i===cr)return e.UNSIGNED_BYTE;if(i===fl)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Al)return e.UNSIGNED_SHORT_5_5_5_1;if(i===kh)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===Vh)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===Gh)return e.BYTE;if(i===Oh)return e.SHORT;if(i===Ta)return e.UNSIGNED_SHORT;if(i===gl)return e.INT;if(i===li)return e.UNSIGNED_INT;if(i===pr)return e.FLOAT;if(i===Pa)return e.HALF_FLOAT;if(i===zh)return e.ALPHA;if(i===Yh)return e.RGB;if(i===lr)return e.RGBA;if(i===Qa)return e.DEPTH_COMPONENT;if(i===Ua)return e.DEPTH_STENCIL;if(i===Jn)return e.RED;if(i===ml)return e.RED_INTEGER;if(i===Wh)return e.RG;if(i===El)return e.RG_INTEGER;if(i===wl)return e.RGBA_INTEGER;if(i===Rn||i===Tn||i===bn||i===Qn)if(o===at)if(n=t.get("WEBGL_compressed_texture_s3tc_srgb"),n!==null){if(i===Rn)return n.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Tn)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===bn)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Qn)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(n=t.get("WEBGL_compressed_texture_s3tc"),n!==null){if(i===Rn)return n.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Tn)return n.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===bn)return n.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Qn)return n.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===So||i===yo||i===Io||i===Ro)if(n=t.get("WEBGL_compressed_texture_pvrtc"),n!==null){if(i===So)return n.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===yo)return n.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Io)return n.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ro)return n.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===To||i===bo||i===Qo)if(n=t.get("WEBGL_compressed_texture_etc"),n!==null){if(i===To||i===bo)return o===at?n.COMPRESSED_SRGB8_ETC2:n.COMPRESSED_RGB8_ETC2;if(i===Qo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:n.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Uo||i===Fo||i===Lo||i===No||i===Po||i===Ho||i===Go||i===Oo||i===ko||i===Vo||i===zo||i===Yo||i===Wo||i===Jo)if(n=t.get("WEBGL_compressed_texture_astc"),n!==null){if(i===Uo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:n.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Fo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:n.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Lo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:n.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===No)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:n.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Po)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:n.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ho)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:n.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Go)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:n.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Oo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:n.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===ko)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:n.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Vo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:n.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===zo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:n.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Yo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:n.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Wo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:n.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Jo)return o===at?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:n.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ko||i===Xo||i===jo)if(n=t.get("EXT_texture_compression_bptc"),n!==null){if(i===Ko)return o===at?n.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:n.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Xo)return n.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===jo)return n.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===qo||i===Zo||i===$o||i===el)if(n=t.get("EXT_texture_compression_rgtc"),n!==null){if(i===qo)return n.COMPRESSED_RED_RGTC1_EXT;if(i===Zo)return n.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===$o)return n.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===el)return n.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ba?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:r}}var Y0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,W0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,J0=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let r=new fu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,r=new fr({vertexShader:Y0,fragmentShader:W0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ze(new Eu(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},K0=class extends ji{constructor(e,t){super();let r=this,i=null,a=1,n=null,o="local-floor",s=1,l=null,c=null,u=null,h=null,d=null,g=null,m=typeof XRWebGLBinding!="undefined",A=new J0,f={},p=t.getContextAttributes(),w=null,C=null,x=[],T=[],y=new je,S=null,U=new Jt;U.viewport=new lt;let D=new Jt;D.viewport=new lt;let M=[U,D],I=new nf,H=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(O){let ce=x[O];return ce===void 0&&(ce=new eo,x[O]=ce),ce.getTargetRaySpace()},this.getControllerGrip=function(O){let ce=x[O];return ce===void 0&&(ce=new eo,x[O]=ce),ce.getGripSpace()},this.getHand=function(O){let ce=x[O];return ce===void 0&&(ce=new eo,x[O]=ce),ce.getHandSpace()};function G(O){let ce=T.indexOf(O.inputSource);if(ce===-1)return;let P=x[ce];P!==void 0&&(P.update(O.inputSource,O.frame,l||n),P.dispatchEvent({type:O.type,data:O.inputSource}))}function Z(){i.removeEventListener("select",G),i.removeEventListener("selectstart",G),i.removeEventListener("selectend",G),i.removeEventListener("squeeze",G),i.removeEventListener("squeezestart",G),i.removeEventListener("squeezeend",G),i.removeEventListener("end",Z),i.removeEventListener("inputsourceschange",V);for(let O=0;O<x.length;O++){let ce=T[O];ce!==null&&(T[O]=null,x[O].disconnect(ce))}H=null,k=null,A.reset();for(let O in f)delete f[O];e.setRenderTarget(w),d=null,h=null,u=null,i=null,C=null,He.stop(),r.isPresenting=!1,e.setPixelRatio(S),e.setSize(y.width,y.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(O){a=O,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(O){o=O,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||n},this.setReferenceSpace=function(O){l=O},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(O){if(i=O,i!==null){if(w=e.getRenderTarget(),i.addEventListener("select",G),i.addEventListener("selectstart",G),i.addEventListener("selectend",G),i.addEventListener("squeeze",G),i.addEventListener("squeezestart",G),i.addEventListener("squeezeend",G),i.addEventListener("end",Z),i.addEventListener("inputsourceschange",V),p.xrCompatible!==!0&&await t.makeXRCompatible(),S=e.getPixelRatio(),e.getSize(y),m&&"createProjectionLayer"in XRWebGLBinding.prototype){let ce=null,P=null,L=null;p.depth&&(L=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ce=p.stencil?Ua:Qa,P=p.stencil?ba:li);let X={colorFormat:t.RGBA8,depthFormat:L,scaleFactor:a};u=this.getBinding(),h=u.createProjectionLayer(X),i.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),C=new zr(h.textureWidth,h.textureHeight,{format:lr,type:cr,depthTexture:new gu(h.textureWidth,h.textureHeight,P,void 0,void 0,void 0,void 0,void 0,void 0,ce),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{let ce={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(i,t,ce),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),C=new zr(d.framebufferWidth,d.framebufferHeight,{format:lr,type:cr,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}C.isXRRenderTarget=!0,this.setFoveation(s),l=null,n=await i.requestReferenceSpace(o),He.setContext(i),He.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return A.getDepthTexture()};function V(O){for(let ce=0;ce<O.removed.length;ce++){let P=O.removed[ce],L=T.indexOf(P);L>=0&&(T[L]=null,x[L].disconnect(P))}for(let ce=0;ce<O.added.length;ce++){let P=O.added[ce],L=T.indexOf(P);if(L===-1){for(let z=0;z<x.length;z++)if(z>=T.length){T.push(P),L=z;break}else if(T[z]===null){T[z]=P,L=z;break}if(L===-1)break}let X=x[L];X&&X.connect(P)}}let $=new b,J=new b;function te(O,ce,P){$.setFromMatrixPosition(ce.matrixWorld),J.setFromMatrixPosition(P.matrixWorld);let L=$.distanceTo(J),X=ce.projectionMatrix.elements,z=P.projectionMatrix.elements,he=X[14]/(X[10]-1),_=X[14]/(X[10]+1),ie=(X[9]+1)/X[5],Ee=(X[9]-1)/X[5],ve=(X[8]-1)/X[0],ge=(z[8]+1)/z[0],j=he*ve,ae=he*ge,fe=L/(-ve+ge),ue=fe*-ve;if(ce.matrixWorld.decompose(O.position,O.quaternion,O.scale),O.translateX(ue),O.translateZ(fe),O.matrixWorld.compose(O.position,O.quaternion,O.scale),O.matrixWorldInverse.copy(O.matrixWorld).invert(),X[10]===-1)O.projectionMatrix.copy(ce.projectionMatrix),O.projectionMatrixInverse.copy(ce.projectionMatrixInverse);else{let ye=he+fe,Ie=_+fe,B=j-ue,E=ae+(L-ue),Q=ie*_/Ie*ye,K=Ee*_/Ie*ye;O.projectionMatrix.makePerspective(B,E,Q,K,ye,Ie),O.projectionMatrixInverse.copy(O.projectionMatrix).invert()}}function Ae(O,ce){ce===null?O.matrixWorld.copy(O.matrix):O.matrixWorld.multiplyMatrices(ce.matrixWorld,O.matrix),O.matrixWorldInverse.copy(O.matrixWorld).invert()}this.updateCamera=function(O){if(i===null)return;let ce=O.near,P=O.far;A.texture!==null&&(A.depthNear>0&&(ce=A.depthNear),A.depthFar>0&&(P=A.depthFar)),I.near=D.near=U.near=ce,I.far=D.far=U.far=P,(H!==I.near||k!==I.far)&&(i.updateRenderState({depthNear:I.near,depthFar:I.far}),H=I.near,k=I.far),I.layers.mask=O.layers.mask|6,U.layers.mask=I.layers.mask&3,D.layers.mask=I.layers.mask&5;let L=O.parent,X=I.cameras;Ae(I,L);for(let z=0;z<X.length;z++)Ae(X[z],L);X.length===2?te(I,U,D):I.projectionMatrix.copy(U.projectionMatrix),Ue(O,I,L)};function Ue(O,ce,P){P===null?O.matrix.copy(ce.matrixWorld):(O.matrix.copy(P.matrixWorld),O.matrix.invert(),O.matrix.multiply(ce.matrixWorld)),O.matrix.decompose(O.position,O.quaternion,O.scale),O.updateMatrixWorld(!0),O.projectionMatrix.copy(ce.projectionMatrix),O.projectionMatrixInverse.copy(ce.projectionMatrixInverse),O.isPerspectiveCamera&&(O.fov=Fa*2*Math.atan(1/O.projectionMatrix.elements[5]),O.zoom=1)}this.getCamera=function(){return I},this.getFoveation=function(){if(!(h===null&&d===null))return s},this.setFoveation=function(O){s=O,h!==null&&(h.fixedFoveation=O),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=O)},this.hasDepthSensing=function(){return A.texture!==null},this.getDepthSensingMesh=function(){return A.getMesh(I)},this.getCameraTexture=function(O){return f[O]};let Pe=null;function qe(O,ce){if(c=ce.getViewerPose(l||n),g=ce,c!==null){let P=c.views;d!==null&&(e.setRenderTargetFramebuffer(C,d.framebuffer),e.setRenderTarget(C));let L=!1;P.length!==I.cameras.length&&(I.cameras.length=0,L=!0);for(let z=0;z<P.length;z++){let he=P[z],_=null;if(d!==null)_=d.getViewport(he);else{let Ee=u.getViewSubImage(h,he);_=Ee.viewport,z===0&&(e.setRenderTargetTextures(C,Ee.colorTexture,Ee.depthStencilTexture),e.setRenderTarget(C))}let ie=M[z];ie===void 0&&(ie=new Jt,ie.layers.enable(z),ie.viewport=new lt,M[z]=ie),ie.matrix.fromArray(he.transform.matrix),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.projectionMatrix.fromArray(he.projectionMatrix),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert(),ie.viewport.set(_.x,_.y,_.width,_.height),z===0&&(I.matrix.copy(ie.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale)),L===!0&&I.cameras.push(ie)}let X=i.enabledFeatures;if(X&&X.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&m){u=r.getBinding();let z=u.getDepthInformation(P[0]);z&&z.isValid&&z.texture&&A.init(z,i.renderState)}if(X&&X.includes("camera-access")&&m){e.state.unbindTexture(),u=r.getBinding();for(let z=0;z<P.length;z++){let he=P[z].camera;if(he){let _=f[he];_||(_=new fu,f[he]=_);let ie=u.getCameraImage(he);_.sourceTexture=ie}}}}for(let P=0;P<x.length;P++){let L=T[P],X=x[P];L!==null&&X!==void 0&&X.update(L,ce,l||n)}Pe&&Pe(O,ce),ce.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ce}),g=null}let He=new Bu;He.setAnimationLoop(qe),this.setAnimationLoop=function(O){Pe=O},this.dispose=function(){}}},ti=new Sr,X0=new nt;function j0(e,t){function r(f,p){f.matrixAutoUpdate===!0&&f.updateMatrix(),p.value.copy(f.matrix)}function i(f,p){p.color.getRGB(f.fogColor.value,ou(e)),p.isFog?(f.fogNear.value=p.near,f.fogFar.value=p.far):p.isFogExp2&&(f.fogDensity.value=p.density)}function a(f,p,w,C,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?n(f,p):p.isMeshToonMaterial?(n(f,p),h(f,p)):p.isMeshPhongMaterial?(n(f,p),u(f,p)):p.isMeshStandardMaterial?(n(f,p),d(f,p),p.isMeshPhysicalMaterial&&g(f,p,x)):p.isMeshMatcapMaterial?(n(f,p),m(f,p)):p.isMeshDepthMaterial?n(f,p):p.isMeshDistanceMaterial?(n(f,p),A(f,p)):p.isMeshNormalMaterial?n(f,p):p.isLineBasicMaterial?(o(f,p),p.isLineDashedMaterial&&s(f,p)):p.isPointsMaterial?l(f,p,w,C):p.isSpriteMaterial?c(f,p):p.isShadowMaterial?(f.color.value.copy(p.color),f.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function n(f,p){f.opacity.value=p.opacity,p.color&&f.diffuse.value.copy(p.color),p.emissive&&f.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(f.map.value=p.map,r(p.map,f.mapTransform)),p.alphaMap&&(f.alphaMap.value=p.alphaMap,r(p.alphaMap,f.alphaMapTransform)),p.bumpMap&&(f.bumpMap.value=p.bumpMap,r(p.bumpMap,f.bumpMapTransform),f.bumpScale.value=p.bumpScale,p.side===Nt&&(f.bumpScale.value*=-1)),p.normalMap&&(f.normalMap.value=p.normalMap,r(p.normalMap,f.normalMapTransform),f.normalScale.value.copy(p.normalScale),p.side===Nt&&f.normalScale.value.negate()),p.displacementMap&&(f.displacementMap.value=p.displacementMap,r(p.displacementMap,f.displacementMapTransform),f.displacementScale.value=p.displacementScale,f.displacementBias.value=p.displacementBias),p.emissiveMap&&(f.emissiveMap.value=p.emissiveMap,r(p.emissiveMap,f.emissiveMapTransform)),p.specularMap&&(f.specularMap.value=p.specularMap,r(p.specularMap,f.specularMapTransform)),p.alphaTest>0&&(f.alphaTest.value=p.alphaTest);let w=t.get(p),C=w.envMap,x=w.envMapRotation;C&&(f.envMap.value=C,ti.copy(x),ti.x*=-1,ti.y*=-1,ti.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(ti.y*=-1,ti.z*=-1),f.envMapRotation.value.setFromMatrix4(X0.makeRotationFromEuler(ti)),f.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=p.reflectivity,f.ior.value=p.ior,f.refractionRatio.value=p.refractionRatio),p.lightMap&&(f.lightMap.value=p.lightMap,f.lightMapIntensity.value=p.lightMapIntensity,r(p.lightMap,f.lightMapTransform)),p.aoMap&&(f.aoMap.value=p.aoMap,f.aoMapIntensity.value=p.aoMapIntensity,r(p.aoMap,f.aoMapTransform))}function o(f,p){f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,p.map&&(f.map.value=p.map,r(p.map,f.mapTransform))}function s(f,p){f.dashSize.value=p.dashSize,f.totalSize.value=p.dashSize+p.gapSize,f.scale.value=p.scale}function l(f,p,w,C){f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,f.size.value=p.size*w,f.scale.value=C*.5,p.map&&(f.map.value=p.map,r(p.map,f.uvTransform)),p.alphaMap&&(f.alphaMap.value=p.alphaMap,r(p.alphaMap,f.alphaMapTransform)),p.alphaTest>0&&(f.alphaTest.value=p.alphaTest)}function c(f,p){f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,f.rotation.value=p.rotation,p.map&&(f.map.value=p.map,r(p.map,f.mapTransform)),p.alphaMap&&(f.alphaMap.value=p.alphaMap,r(p.alphaMap,f.alphaMapTransform)),p.alphaTest>0&&(f.alphaTest.value=p.alphaTest)}function u(f,p){f.specular.value.copy(p.specular),f.shininess.value=Math.max(p.shininess,1e-4)}function h(f,p){p.gradientMap&&(f.gradientMap.value=p.gradientMap)}function d(f,p){f.metalness.value=p.metalness,p.metalnessMap&&(f.metalnessMap.value=p.metalnessMap,r(p.metalnessMap,f.metalnessMapTransform)),f.roughness.value=p.roughness,p.roughnessMap&&(f.roughnessMap.value=p.roughnessMap,r(p.roughnessMap,f.roughnessMapTransform)),p.envMap&&(f.envMapIntensity.value=p.envMapIntensity)}function g(f,p,w){f.ior.value=p.ior,p.sheen>0&&(f.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),f.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(f.sheenColorMap.value=p.sheenColorMap,r(p.sheenColorMap,f.sheenColorMapTransform)),p.sheenRoughnessMap&&(f.sheenRoughnessMap.value=p.sheenRoughnessMap,r(p.sheenRoughnessMap,f.sheenRoughnessMapTransform))),p.clearcoat>0&&(f.clearcoat.value=p.clearcoat,f.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(f.clearcoatMap.value=p.clearcoatMap,r(p.clearcoatMap,f.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,r(p.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(f.clearcoatNormalMap.value=p.clearcoatNormalMap,r(p.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Nt&&f.clearcoatNormalScale.value.negate())),p.dispersion>0&&(f.dispersion.value=p.dispersion),p.iridescence>0&&(f.iridescence.value=p.iridescence,f.iridescenceIOR.value=p.iridescenceIOR,f.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(f.iridescenceMap.value=p.iridescenceMap,r(p.iridescenceMap,f.iridescenceMapTransform)),p.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=p.iridescenceThicknessMap,r(p.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),p.transmission>0&&(f.transmission.value=p.transmission,f.transmissionSamplerMap.value=w.texture,f.transmissionSamplerSize.value.set(w.width,w.height),p.transmissionMap&&(f.transmissionMap.value=p.transmissionMap,r(p.transmissionMap,f.transmissionMapTransform)),f.thickness.value=p.thickness,p.thicknessMap&&(f.thicknessMap.value=p.thicknessMap,r(p.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=p.attenuationDistance,f.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(f.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(f.anisotropyMap.value=p.anisotropyMap,r(p.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=p.specularIntensity,f.specularColor.value.copy(p.specularColor),p.specularColorMap&&(f.specularColorMap.value=p.specularColorMap,r(p.specularColorMap,f.specularColorMapTransform)),p.specularIntensityMap&&(f.specularIntensityMap.value=p.specularIntensityMap,r(p.specularIntensityMap,f.specularIntensityMapTransform))}function m(f,p){p.matcap&&(f.matcap.value=p.matcap)}function A(f,p){let w=t.get(p).light;f.referencePosition.value.setFromMatrixPosition(w.matrixWorld),f.nearDistance.value=w.shadow.camera.near,f.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:a}}function q0(e,t,r,i){let a={},n={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(w,C){let x=C.program;i.uniformBlockBinding(w,x)}function c(w,C){let x=a[w.id];x===void 0&&(m(w),x=u(w),a[w.id]=x,w.addEventListener("dispose",f));let T=C.program;i.updateUBOMapping(w,T);let y=t.render.frame;n[w.id]!==y&&(d(w),n[w.id]=y)}function u(w){let C=h();w.__bindingPointIndex=C;let x=e.createBuffer(),T=w.__size,y=w.usage;return e.bindBuffer(e.UNIFORM_BUFFER,x),e.bufferData(e.UNIFORM_BUFFER,T,y),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,C,x),x}function h(){for(let w=0;w<s;w++)if(o.indexOf(w)===-1)return o.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(w){let C=a[w.id],x=w.uniforms,T=w.__cache;e.bindBuffer(e.UNIFORM_BUFFER,C);for(let y=0,S=x.length;y<S;y++){let U=Array.isArray(x[y])?x[y]:[x[y]];for(let D=0,M=U.length;D<M;D++){let I=U[D];if(g(I,y,D,T)===!0){let H=I.__offset,k=Array.isArray(I.value)?I.value:[I.value],G=0;for(let Z=0;Z<k.length;Z++){let V=k[Z],$=A(V);typeof V=="number"||typeof V=="boolean"?(I.__data[0]=V,e.bufferSubData(e.UNIFORM_BUFFER,H+G,I.__data)):V.isMatrix3?(I.__data[0]=V.elements[0],I.__data[1]=V.elements[1],I.__data[2]=V.elements[2],I.__data[3]=0,I.__data[4]=V.elements[3],I.__data[5]=V.elements[4],I.__data[6]=V.elements[5],I.__data[7]=0,I.__data[8]=V.elements[6],I.__data[9]=V.elements[7],I.__data[10]=V.elements[8],I.__data[11]=0):(V.toArray(I.__data,G),G+=$.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,H,I.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function g(w,C,x,T){let y=w.value,S=C+"_"+x;if(T[S]===void 0)return typeof y=="number"||typeof y=="boolean"?T[S]=y:T[S]=y.clone(),!0;{let U=T[S];if(typeof y=="number"||typeof y=="boolean"){if(U!==y)return T[S]=y,!0}else if(U.equals(y)===!1)return U.copy(y),!0}return!1}function m(w){let C=w.uniforms,x=0,T=16;for(let S=0,U=C.length;S<U;S++){let D=Array.isArray(C[S])?C[S]:[C[S]];for(let M=0,I=D.length;M<I;M++){let H=D[M],k=Array.isArray(H.value)?H.value:[H.value];for(let G=0,Z=k.length;G<Z;G++){let V=k[G],$=A(V),J=x%T,te=J%$.boundary,Ae=J+te;x+=te,Ae!==0&&T-Ae<$.storage&&(x+=T-Ae),H.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=x,x+=$.storage}}}let y=x%T;return y>0&&(x+=T-y),w.__size=x,w.__cache={},this}function A(w){let C={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(C.boundary=4,C.storage=4):w.isVector2?(C.boundary=8,C.storage=8):w.isVector3||w.isColor?(C.boundary=16,C.storage=12):w.isVector4?(C.boundary=16,C.storage=16):w.isMatrix3?(C.boundary=48,C.storage=48):w.isMatrix4?(C.boundary=64,C.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),C}function f(w){let C=w.target;C.removeEventListener("dispose",f);let x=o.indexOf(C.__bindingPointIndex);o.splice(x,1),e.deleteBuffer(a[C.id]),delete a[C.id],delete n[C.id]}function p(){for(let w in a)e.deleteBuffer(a[w]);o=[],a={},n={}}return{bind:l,update:c,dispose:p}}var Z0=class{constructor(e={}){let{canvas:t=tg(),context:r=null,depth:i=!0,stencil:a=!1,alpha:n=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:h=!1}=e;this.isWebGLRenderer=!0;let d;if(r!==null){if(typeof WebGLRenderingContext!="undefined"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=r.getContextAttributes().alpha}else d=n;let g=new Uint32Array(4),m=new Int32Array(4),A=null,f=null,p=[],w=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Or,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,x=!1;this._outputColorSpace=Lt;let T=0,y=0,S=null,U=-1,D=null,M=new lt,I=new lt,H=null,k=new Ye(0),G=0,Z=t.width,V=t.height,$=1,J=null,te=null,Ae=new lt(0,0,Z,V),Ue=new lt(0,0,Z,V),Pe=!1,qe=new Bl,He=!1,O=!1,ce=new nt,P=new b,L=new lt,X={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},z=!1;function he(){return S===null?$:1}let _=r;function ie(v,N){return t.getContext(v,N)}try{let v={alpha:!0,depth:i,stencil:a,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r180"),t.addEventListener("webglcontextlost",le,!1),t.addEventListener("webglcontextrestored",de,!1),t.addEventListener("webglcontextcreationerror",Be,!1),_===null){let N="webgl2";if(_=ie(N,v),_===null)throw ie(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(v){throw console.error("THREE.WebGLRenderer: "+v.message),v}let Ee,ve,ge,j,ae,fe,ue,ye,Ie,B,E,Q,K,re,q,Me,pe,xe,be,se,me,Fe,_e,we;function Ve(){Ee=new lE(_),Ee.init(),Fe=new z0(_,Ee),ve=new tE(_,Ee,e,Fe),ge=new k0(_,Ee),ve.reversedDepthBuffer&&h&&ge.buffers.depth.setReversed(!0),j=new uE(_),ae=new I0,fe=new V0(_,Ee,ge,ae,ve,Fe,j),ue=new iE(C),ye=new oE(C),Ie=new mf(_),_e=new $m(_,Ie),B=new cE(_,Ie,j,_e),E=new pE(_,B,Ie,j),be=new dE(_,ve,fe),Me=new rE(ae),Q=new y0(C,ue,ye,Ee,ve,_e,Me),K=new j0(C,ae),re=new T0,q=new N0(Ee),xe=new Zm(C,ue,ye,ge,E,d,s),pe=new G0(C,E,ve),we=new q0(_,j,ve,ge),se=new eE(_,Ee,j),me=new hE(_,Ee,j),j.programs=Q.programs,C.capabilities=ve,C.extensions=Ee,C.properties=ae,C.renderLists=re,C.shadowMap=pe,C.state=ge,C.info=j}Ve();let R=new K0(C,_);this.xr=R,this.getContext=function(){return _},this.getContextAttributes=function(){return _.getContextAttributes()},this.forceContextLoss=function(){let v=Ee.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=Ee.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(v){v!==void 0&&($=v,this.setSize(Z,V,!1))},this.getSize=function(v){return v.set(Z,V)},this.setSize=function(v,N,Y=!0){if(R.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Z=v,V=N,t.width=Math.floor(v*$),t.height=Math.floor(N*$),Y===!0&&(t.style.width=v+"px",t.style.height=N+"px"),this.setViewport(0,0,v,N)},this.getDrawingBufferSize=function(v){return v.set(Z*$,V*$).floor()},this.setDrawingBufferSize=function(v,N,Y){Z=v,V=N,$=Y,t.width=Math.floor(v*Y),t.height=Math.floor(N*Y),this.setViewport(0,0,v,N)},this.getCurrentViewport=function(v){return v.copy(M)},this.getViewport=function(v){return v.copy(Ae)},this.setViewport=function(v,N,Y,W){v.isVector4?Ae.set(v.x,v.y,v.z,v.w):Ae.set(v,N,Y,W),ge.viewport(M.copy(Ae).multiplyScalar($).round())},this.getScissor=function(v){return v.copy(Ue)},this.setScissor=function(v,N,Y,W){v.isVector4?Ue.set(v.x,v.y,v.z,v.w):Ue.set(v,N,Y,W),ge.scissor(I.copy(Ue).multiplyScalar($).round())},this.getScissorTest=function(){return Pe},this.setScissorTest=function(v){ge.setScissorTest(Pe=v)},this.setOpaqueSort=function(v){J=v},this.setTransparentSort=function(v){te=v},this.getClearColor=function(v){return v.copy(xe.getClearColor())},this.setClearColor=function(){xe.setClearColor(...arguments)},this.getClearAlpha=function(){return xe.getClearAlpha()},this.setClearAlpha=function(){xe.setClearAlpha(...arguments)},this.clear=function(v=!0,N=!0,Y=!0){let W=0;if(v){let F=!1;if(S!==null){let oe=S.texture.format;F=oe===wl||oe===El||oe===ml}if(F){let oe=S.texture.type,De=oe===cr||oe===li||oe===Ta||oe===ba||oe===fl||oe===Al,Re=xe.getClearColor(),Te=xe.getClearAlpha(),Ge=Re.r,ke=Re.g,Oe=Re.b;De?(g[0]=Ge,g[1]=ke,g[2]=Oe,g[3]=Te,_.clearBufferuiv(_.COLOR,0,g)):(m[0]=Ge,m[1]=ke,m[2]=Oe,m[3]=Te,_.clearBufferiv(_.COLOR,0,m))}else W|=_.COLOR_BUFFER_BIT}N&&(W|=_.DEPTH_BUFFER_BIT),Y&&(W|=_.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),_.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",le,!1),t.removeEventListener("webglcontextrestored",de,!1),t.removeEventListener("webglcontextcreationerror",Be,!1),xe.dispose(),re.dispose(),q.dispose(),ae.dispose(),ue.dispose(),ye.dispose(),E.dispose(),_e.dispose(),we.dispose(),Q.dispose(),R.dispose(),R.removeEventListener("sessionstart",Ht),R.removeEventListener("sessionend",Gt),hr.stop()};function le(v){v.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),x=!0}function de(){console.log("THREE.WebGLRenderer: Context Restored."),x=!1;let v=j.autoReset,N=pe.enabled,Y=pe.autoUpdate,W=pe.needsUpdate,F=pe.type;Ve(),j.autoReset=v,pe.enabled=N,pe.autoUpdate=Y,pe.needsUpdate=W,pe.type=F}function Be(v){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function ne(v){let N=v.target;N.removeEventListener("dispose",ne),ee(N)}function ee(v){Se(v),ae.remove(v)}function Se(v){let N=ae.get(v).programs;N!==void 0&&(N.forEach(function(Y){Q.releaseProgram(Y)}),v.isShaderMaterial&&Q.releaseShaderCache(v))}this.renderBufferDirect=function(v,N,Y,W,F,oe){N===null&&(N=X);let De=F.isMesh&&F.matrixWorld.determinant()<0,Re=za(v,N,Y,W,F);ge.setMaterial(W,De);let Te=Y.index,Ge=1;if(W.wireframe===!0){if(Te=B.getWireframeAttribute(Y),Te===void 0)return;Ge=2}let ke=Y.drawRange,Oe=Y.attributes.position,$e=ke.start*Ge,st=(ke.start+ke.count)*Ge;oe!==null&&($e=Math.max($e,oe.start*Ge),st=Math.min(st,(oe.start+oe.count)*Ge)),Te!==null?($e=Math.max($e,0),st=Math.min(st,Te.count)):Oe!=null&&($e=Math.max($e,0),st=Math.min(st,Oe.count));let ct=st-$e;if(ct<0||ct===1/0)return;_e.setup(F,W,Re,Y,Te);let dt,ot=se;if(Te!==null&&(dt=Ie.get(Te),ot=me,ot.setIndex(dt)),F.isMesh)W.wireframe===!0?(ge.setLineWidth(W.wireframeLinewidth*he()),ot.setMode(_.LINES)):ot.setMode(_.TRIANGLES);else if(F.isLine){let Le=W.linewidth;Le===void 0&&(Le=1),ge.setLineWidth(Le*he()),F.isLineSegments?ot.setMode(_.LINES):F.isLineLoop?ot.setMode(_.LINE_LOOP):ot.setMode(_.LINE_STRIP)}else F.isPoints?ot.setMode(_.POINTS):F.isSprite&&ot.setMode(_.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)La("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ot.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Ee.get("WEBGL_multi_draw"))ot.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Le=F._multiDrawStarts,xt=F._multiDrawCounts,mr=F._multiDrawCount,tr=Te?Ie.get(Te).bytesPerElement:1,Ai=ae.get(W).currentProgram.getUniforms();for(let Ot=0;Ot<mr;Ot++)Ai.setValue(_,"_gl_DrawID",Ot),ot.render(Le[Ot]/tr,xt[Ot])}else if(F.isInstancedMesh)ot.renderInstances($e,ct,F.count);else if(Y.isInstancedBufferGeometry){let Le=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,xt=Math.min(Y.instanceCount,Le);ot.renderInstances($e,ct,xt)}else ot.render($e,ct)};function Ne(v,N,Y){v.transparent===!0&&v.side===$t&&v.forceSinglePass===!1?(v.side=Nt,v.needsUpdate=!0,Rr(v,N,Y),v.side=Vr,v.needsUpdate=!0,Rr(v,N,Y),v.side=$t):Rr(v,N,Y)}this.compile=function(v,N,Y=null){Y===null&&(Y=v),f=q.get(Y),f.init(N),w.push(f),Y.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),v!==Y&&v.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),f.setupLights();let W=new Set;return v.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let oe=F.material;if(oe)if(Array.isArray(oe))for(let De=0;De<oe.length;De++){let Re=oe[De];Ne(Re,Y,F),W.add(Re)}else Ne(oe,Y,F),W.add(oe)}),f=w.pop(),W},this.compileAsync=function(v,N,Y=null){let W=this.compile(v,N,Y);return new Promise(F=>{function oe(){if(W.forEach(function(De){ae.get(De).currentProgram.isReady()&&W.delete(De)}),W.size===0){F(v);return}setTimeout(oe,10)}Ee.get("KHR_parallel_shader_compile")!==null?oe():setTimeout(oe,10)})};let ut=null;function et(v){ut&&ut(v)}function Ht(){hr.stop()}function Gt(){hr.start()}let hr=new Bu;hr.setAnimationLoop(et),typeof self!="undefined"&&hr.setContext(self),this.setAnimationLoop=function(v){ut=v,R.setAnimationLoop(v),v===null?hr.stop():hr.start()},R.addEventListener("sessionstart",Ht),R.addEventListener("sessionend",Gt),this.render=function(v,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(x===!0)return;if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),R.enabled===!0&&R.isPresenting===!0&&(R.cameraAutoUpdate===!0&&R.updateCamera(N),N=R.getCamera()),v.isScene===!0&&v.onBeforeRender(C,v,N,S),f=q.get(v,w.length),f.init(N),w.push(f),ce.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),qe.setFromProjectionMatrix(ce,gr,N.reversedDepth),O=this.localClippingEnabled,He=Me.init(this.clippingPlanes,O),A=re.get(v,p.length),A.init(),p.push(A),R.enabled===!0&&R.isPresenting===!0){let oe=C.xr.getDepthSensingMesh();oe!==null&&di(oe,N,-1/0,C.sortObjects)}di(v,N,0,C.sortObjects),A.finish(),C.sortObjects===!0&&A.sort(J,te),z=R.enabled===!1||R.isPresenting===!1||R.hasDepthSensing()===!1,z&&xe.addToRenderList(A,v),this.info.render.frame++,He===!0&&Me.beginShadows();let Y=f.state.shadowsArray;pe.render(Y,v,N),He===!0&&Me.endShadows(),this.info.autoReset===!0&&this.info.reset();let W=A.opaque,F=A.transmissive;if(f.setupLights(),N.isArrayCamera){let oe=N.cameras;if(F.length>0)for(let De=0,Re=oe.length;De<Re;De++){let Te=oe[De];gi(W,F,v,Te)}z&&xe.render(v);for(let De=0,Re=oe.length;De<Re;De++){let Te=oe[De];pi(A,v,Te,Te.viewport)}}else F.length>0&&gi(W,F,v,N),z&&xe.render(v),pi(A,v,N);S!==null&&y===0&&(fe.updateMultisampleRenderTarget(S),fe.updateRenderTargetMipmap(S)),v.isScene===!0&&v.onAfterRender(C,v,N),_e.resetDefaultState(),U=-1,D=null,w.pop(),w.length>0?(f=w[w.length-1],He===!0&&Me.setGlobalState(C.clippingPlanes,f.state.camera)):f=null,p.pop(),p.length>0?A=p[p.length-1]:A=null};function di(v,N,Y,W){if(v.visible===!1)return;if(v.layers.test(N.layers)){if(v.isGroup)Y=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(N);else if(v.isLight)f.pushLight(v),v.castShadow&&f.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||qe.intersectsSprite(v)){W&&L.setFromMatrixPosition(v.matrixWorld).applyMatrix4(ce);let oe=E.update(v),De=v.material;De.visible&&A.push(v,oe,De,Y,L.z,null)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||qe.intersectsObject(v))){let oe=E.update(v),De=v.material;if(W&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),L.copy(v.boundingSphere.center)):(oe.boundingSphere===null&&oe.computeBoundingSphere(),L.copy(oe.boundingSphere.center)),L.applyMatrix4(v.matrixWorld).applyMatrix4(ce)),Array.isArray(De)){let Re=oe.groups;for(let Te=0,Ge=Re.length;Te<Ge;Te++){let ke=Re[Te],Oe=De[ke.materialIndex];Oe&&Oe.visible&&A.push(v,oe,Oe,Y,L.z,ke)}}else De.visible&&A.push(v,oe,De,Y,L.z,null)}}let F=v.children;for(let oe=0,De=F.length;oe<De;oe++)di(F[oe],N,Y,W)}function pi(v,N,Y,W){let F=v.opaque,oe=v.transmissive,De=v.transparent;f.setupLightsView(Y),He===!0&&Me.setGlobalState(C.clippingPlanes,Y),W&&ge.viewport(M.copy(W)),F.length>0&&Ir(F,N,Y),oe.length>0&&Ir(oe,N,Y),De.length>0&&Ir(De,N,Y),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function gi(v,N,Y,W){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[W.id]===void 0&&(f.state.transmissionRenderTarget[W.id]=new zr(1,1,{generateMipmaps:!0,type:Ee.has("EXT_color_buffer_half_float")||Ee.has("EXT_color_buffer_float")?Pa:cr,minFilter:si,samples:4,stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:tt.workingColorSpace}));let F=f.state.transmissionRenderTarget[W.id],oe=W.viewport||M;F.setSize(oe.z*C.transmissionResolutionScale,oe.w*C.transmissionResolutionScale);let De=C.getRenderTarget(),Re=C.getActiveCubeFace(),Te=C.getActiveMipmapLevel();C.setRenderTarget(F),C.getClearColor(k),G=C.getClearAlpha(),G<1&&C.setClearColor(16777215,.5),C.clear(),z&&xe.render(Y);let Ge=C.toneMapping;C.toneMapping=Or;let ke=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),f.setupLightsView(W),He===!0&&Me.setGlobalState(C.clippingPlanes,W),Ir(v,Y,W),fe.updateMultisampleRenderTarget(F),fe.updateRenderTargetMipmap(F),Ee.has("WEBGL_multisampled_render_to_texture")===!1){let Oe=!1;for(let $e=0,st=N.length;$e<st;$e++){let ct=N[$e],dt=ct.object,ot=ct.geometry,Le=ct.material,xt=ct.group;if(Le.side===$t&&dt.layers.test(W.layers)){let mr=Le.side;Le.side=Nt,Le.needsUpdate=!0,fi(dt,Y,W,ot,Le,xt),Le.side=mr,Le.needsUpdate=!0,Oe=!0}}Oe===!0&&(fe.updateMultisampleRenderTarget(F),fe.updateRenderTargetMipmap(F))}C.setRenderTarget(De,Re,Te),C.setClearColor(k,G),ke!==void 0&&(W.viewport=ke),C.toneMapping=Ge}function Ir(v,N,Y){let W=N.isScene===!0?N.overrideMaterial:null;for(let F=0,oe=v.length;F<oe;F++){let De=v[F],Re=De.object,Te=De.geometry,Ge=De.group,ke=De.material;ke.allowOverride===!0&&W!==null&&(ke=W),Re.layers.test(Y.layers)&&fi(Re,N,Y,Te,ke,Ge)}}function fi(v,N,Y,W,F,oe){v.onBeforeRender(C,N,Y,W,F,oe),v.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),F.onBeforeRender(C,N,Y,W,v,oe),F.transparent===!0&&F.side===$t&&F.forceSinglePass===!1?(F.side=Nt,F.needsUpdate=!0,C.renderBufferDirect(Y,N,W,F,v,oe),F.side=Vr,F.needsUpdate=!0,C.renderBufferDirect(Y,N,W,F,v,oe),F.side=$t):C.renderBufferDirect(Y,N,W,F,v,oe),v.onAfterRender(C,N,Y,W,F,oe)}function Rr(v,N,Y){N.isScene!==!0&&(N=X);let W=ae.get(v),F=f.state.lights,oe=f.state.shadowsArray,De=F.state.version,Re=Q.getParameters(v,F.state,oe,N,Y),Te=Q.getProgramCacheKey(Re),Ge=W.programs;W.environment=v.isMeshStandardMaterial?N.environment:null,W.fog=N.fog,W.envMap=(v.isMeshStandardMaterial?ye:ue).get(v.envMap||W.environment),W.envMapRotation=W.environment!==null&&v.envMap===null?N.environmentRotation:v.envMapRotation,Ge===void 0&&(v.addEventListener("dispose",ne),Ge=new Map,W.programs=Ge);let ke=Ge.get(Te);if(ke!==void 0){if(W.currentProgram===ke&&W.lightsStateVersion===De)return ia(v,Re),ke}else Re.uniforms=Q.getUniforms(v),v.onBeforeCompile(Re,C),ke=Q.acquireProgram(Re,Te),Ge.set(Te,ke),W.uniforms=Re.uniforms;let Oe=W.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(Oe.clippingPlanes=Me.uniform),ia(v,Re),W.needsLights=aa(v),W.lightsStateVersion=De,W.needsLights&&(Oe.ambientLightColor.value=F.state.ambient,Oe.lightProbe.value=F.state.probe,Oe.directionalLights.value=F.state.directional,Oe.directionalLightShadows.value=F.state.directionalShadow,Oe.spotLights.value=F.state.spot,Oe.spotLightShadows.value=F.state.spotShadow,Oe.rectAreaLights.value=F.state.rectArea,Oe.ltc_1.value=F.state.rectAreaLTC1,Oe.ltc_2.value=F.state.rectAreaLTC2,Oe.pointLights.value=F.state.point,Oe.pointLightShadows.value=F.state.pointShadow,Oe.hemisphereLights.value=F.state.hemi,Oe.directionalShadowMap.value=F.state.directionalShadowMap,Oe.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Oe.spotShadowMap.value=F.state.spotShadowMap,Oe.spotLightMatrix.value=F.state.spotLightMatrix,Oe.spotLightMap.value=F.state.spotLightMap,Oe.pointShadowMap.value=F.state.pointShadowMap,Oe.pointShadowMatrix.value=F.state.pointShadowMatrix),W.currentProgram=ke,W.uniformsList=null,ke}function ra(v){if(v.uniformsList===null){let N=v.currentProgram.getUniforms();v.uniformsList=Ln.seqWithValue(N.seq,v.uniforms)}return v.uniformsList}function ia(v,N){let Y=ae.get(v);Y.outputColorSpace=N.outputColorSpace,Y.batching=N.batching,Y.batchingColor=N.batchingColor,Y.instancing=N.instancing,Y.instancingColor=N.instancingColor,Y.instancingMorph=N.instancingMorph,Y.skinning=N.skinning,Y.morphTargets=N.morphTargets,Y.morphNormals=N.morphNormals,Y.morphColors=N.morphColors,Y.morphTargetsCount=N.morphTargetsCount,Y.numClippingPlanes=N.numClippingPlanes,Y.numIntersection=N.numClipIntersection,Y.vertexAlphas=N.vertexAlphas,Y.vertexTangents=N.vertexTangents,Y.toneMapping=N.toneMapping}function za(v,N,Y,W,F){N.isScene!==!0&&(N=X),fe.resetTextureUnits();let oe=N.fog,De=W.isMeshStandardMaterial?N.environment:null,Re=S===null?C.outputColorSpace:S.isXRRenderTarget===!0?S.texture.colorSpace:Ji,Te=(W.isMeshStandardMaterial?ye:ue).get(W.envMap||De),Ge=W.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,ke=!!Y.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Oe=!!Y.morphAttributes.position,$e=!!Y.morphAttributes.normal,st=!!Y.morphAttributes.color,ct=Or;W.toneMapped&&(S===null||S.isXRRenderTarget===!0)&&(ct=C.toneMapping);let dt=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,ot=dt!==void 0?dt.length:0,Le=ae.get(W),xt=f.state.lights;if(He===!0&&(O===!0||v!==D)){let _t=v===D&&W.id===U;Me.setState(W,v,_t)}let mr=!1;W.version===Le.__version?(Le.needsLights&&Le.lightsStateVersion!==xt.state.version||Le.outputColorSpace!==Re||F.isBatchedMesh&&Le.batching===!1||!F.isBatchedMesh&&Le.batching===!0||F.isBatchedMesh&&Le.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Le.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Le.instancing===!1||!F.isInstancedMesh&&Le.instancing===!0||F.isSkinnedMesh&&Le.skinning===!1||!F.isSkinnedMesh&&Le.skinning===!0||F.isInstancedMesh&&Le.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Le.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Le.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Le.instancingMorph===!1&&F.morphTexture!==null||Le.envMap!==Te||W.fog===!0&&Le.fog!==oe||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==Me.numPlanes||Le.numIntersection!==Me.numIntersection)||Le.vertexAlphas!==Ge||Le.vertexTangents!==ke||Le.morphTargets!==Oe||Le.morphNormals!==$e||Le.morphColors!==st||Le.toneMapping!==ct||Le.morphTargetsCount!==ot)&&(mr=!0):(mr=!0,Le.__version=W.version);let tr=Le.currentProgram;mr===!0&&(tr=Rr(W,N,F));let Ai=!1,Ot=!1,na=!1,pt=tr.getUniforms(),Xt=Le.uniforms;if(ge.useProgram(tr.program)&&(Ai=!0,Ot=!0,na=!0),W.id!==U&&(U=W.id,Ot=!0),Ai||D!==v){ge.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),pt.setValue(_,"projectionMatrix",v.projectionMatrix),pt.setValue(_,"viewMatrix",v.matrixWorldInverse);let _t=pt.map.cameraPosition;_t!==void 0&&_t.setValue(_,P.setFromMatrixPosition(v.matrixWorld)),ve.logarithmicDepthBuffer&&pt.setValue(_,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&pt.setValue(_,"isOrthographic",v.isOrthographicCamera===!0),D!==v&&(D=v,Ot=!0,na=!0)}if(F.isSkinnedMesh){pt.setOptional(_,F,"bindMatrix"),pt.setOptional(_,F,"bindMatrixInverse");let _t=F.skeleton;_t&&(_t.boneTexture===null&&_t.computeBoneTexture(),pt.setValue(_,"boneTexture",_t.boneTexture,fe))}F.isBatchedMesh&&(pt.setOptional(_,F,"batchingTexture"),pt.setValue(_,"batchingTexture",F._matricesTexture,fe),pt.setOptional(_,F,"batchingIdTexture"),pt.setValue(_,"batchingIdTexture",F._indirectTexture,fe),pt.setOptional(_,F,"batchingColorTexture"),F._colorsTexture!==null&&pt.setValue(_,"batchingColorTexture",F._colorsTexture,fe));let jt=Y.morphAttributes;if((jt.position!==void 0||jt.normal!==void 0||jt.color!==void 0)&&be.update(F,Y,tr),(Ot||Le.receiveShadow!==F.receiveShadow)&&(Le.receiveShadow=F.receiveShadow,pt.setValue(_,"receiveShadow",F.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(Xt.envMap.value=Te,Xt.flipEnvMap.value=Te.isCubeTexture&&Te.isRenderTargetTexture===!1?-1:1),W.isMeshStandardMaterial&&W.envMap===null&&N.environment!==null&&(Xt.envMapIntensity.value=N.environmentIntensity),Ot&&(pt.setValue(_,"toneMappingExposure",C.toneMappingExposure),Le.needsLights&&Ya(Xt,na),oe&&W.fog===!0&&K.refreshFogUniforms(Xt,oe),K.refreshMaterialUniforms(Xt,W,$,V,f.state.transmissionRenderTarget[v.id]),Ln.upload(_,ra(Le),Xt,fe)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(Ln.upload(_,ra(Le),Xt,fe),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&pt.setValue(_,"center",F.center),pt.setValue(_,"modelViewMatrix",F.modelViewMatrix),pt.setValue(_,"normalMatrix",F.normalMatrix),pt.setValue(_,"modelMatrix",F.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){let _t=W.uniformsGroups;for(let rr=0,As=_t.length;rr<As;rr++){let Jr=_t[rr];we.update(Jr,tr),we.bind(Jr,tr)}}return tr}function Ya(v,N){v.ambientLightColor.needsUpdate=N,v.lightProbe.needsUpdate=N,v.directionalLights.needsUpdate=N,v.directionalLightShadows.needsUpdate=N,v.pointLights.needsUpdate=N,v.pointLightShadows.needsUpdate=N,v.spotLights.needsUpdate=N,v.spotLightShadows.needsUpdate=N,v.rectAreaLights.needsUpdate=N,v.hemisphereLights.needsUpdate=N}function aa(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return y},this.getRenderTarget=function(){return S},this.setRenderTargetTextures=function(v,N,Y){let W=ae.get(v);W.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),ae.get(v.texture).__webglTexture=N,ae.get(v.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:Y,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,N){let Y=ae.get(v);Y.__webglFramebuffer=N,Y.__useDefaultFramebuffer=N===void 0};let md=_.createFramebuffer();this.setRenderTarget=function(v,N=0,Y=0){S=v,T=N,y=Y;let W=!0,F=null,oe=!1,De=!1;if(v){let Re=ae.get(v);if(Re.__useDefaultFramebuffer!==void 0)ge.bindFramebuffer(_.FRAMEBUFFER,null),W=!1;else if(Re.__webglFramebuffer===void 0)fe.setupRenderTarget(v);else if(Re.__hasExternalTextures)fe.rebindTextures(v,ae.get(v.texture).__webglTexture,ae.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let ke=v.depthTexture;if(Re.__boundDepthTexture!==ke){if(ke!==null&&ae.has(ke)&&(v.width!==ke.image.width||v.height!==ke.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");fe.setupDepthRenderbuffer(v)}}let Te=v.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(De=!0);let Ge=ae.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Ge[N])?F=Ge[N][Y]:F=Ge[N],oe=!0):v.samples>0&&fe.useMultisampledRTT(v)===!1?F=ae.get(v).__webglMultisampledFramebuffer:Array.isArray(Ge)?F=Ge[Y]:F=Ge,M.copy(v.viewport),I.copy(v.scissor),H=v.scissorTest}else M.copy(Ae).multiplyScalar($).floor(),I.copy(Ue).multiplyScalar($).floor(),H=Pe;if(Y!==0&&(F=md),ge.bindFramebuffer(_.FRAMEBUFFER,F)&&W&&ge.drawBuffers(v,F),ge.viewport(M),ge.scissor(I),ge.setScissorTest(H),oe){let Re=ae.get(v.texture);_.framebufferTexture2D(_.FRAMEBUFFER,_.COLOR_ATTACHMENT0,_.TEXTURE_CUBE_MAP_POSITIVE_X+N,Re.__webglTexture,Y)}else if(De){let Re=N;for(let Te=0;Te<v.textures.length;Te++){let Ge=ae.get(v.textures[Te]);_.framebufferTextureLayer(_.FRAMEBUFFER,_.COLOR_ATTACHMENT0+Te,Ge.__webglTexture,Y,Re)}}else if(v!==null&&Y!==0){let Re=ae.get(v.texture);_.framebufferTexture2D(_.FRAMEBUFFER,_.COLOR_ATTACHMENT0,_.TEXTURE_2D,Re.__webglTexture,Y)}U=-1},this.readRenderTargetPixels=function(v,N,Y,W,F,oe,De,Re=0){if(!(v&&v.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=ae.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&De!==void 0&&(Te=Te[De]),Te){ge.bindFramebuffer(_.FRAMEBUFFER,Te);try{let Ge=v.textures[Re],ke=Ge.format,Oe=Ge.type;if(!ve.textureFormatReadable(ke)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ve.textureTypeReadable(Oe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=v.width-W&&Y>=0&&Y<=v.height-F&&(v.textures.length>1&&_.readBuffer(_.COLOR_ATTACHMENT0+Re),_.readPixels(N,Y,W,F,Fe.convert(ke),Fe.convert(Oe),oe))}finally{let Ge=S!==null?ae.get(S).__webglFramebuffer:null;ge.bindFramebuffer(_.FRAMEBUFFER,Ge)}}},this.readRenderTargetPixelsAsync=async function(v,N,Y,W,F,oe,De,Re=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=ae.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&De!==void 0&&(Te=Te[De]),Te)if(N>=0&&N<=v.width-W&&Y>=0&&Y<=v.height-F){ge.bindFramebuffer(_.FRAMEBUFFER,Te);let Ge=v.textures[Re],ke=Ge.format,Oe=Ge.type;if(!ve.textureFormatReadable(ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ve.textureTypeReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let $e=_.createBuffer();_.bindBuffer(_.PIXEL_PACK_BUFFER,$e),_.bufferData(_.PIXEL_PACK_BUFFER,oe.byteLength,_.STREAM_READ),v.textures.length>1&&_.readBuffer(_.COLOR_ATTACHMENT0+Re),_.readPixels(N,Y,W,F,Fe.convert(ke),Fe.convert(Oe),0);let st=S!==null?ae.get(S).__webglFramebuffer:null;ge.bindFramebuffer(_.FRAMEBUFFER,st);let ct=_.fenceSync(_.SYNC_GPU_COMMANDS_COMPLETE,0);return _.flush(),await rg(_,ct,4),_.bindBuffer(_.PIXEL_PACK_BUFFER,$e),_.getBufferSubData(_.PIXEL_PACK_BUFFER,0,oe),_.deleteBuffer($e),_.deleteSync(ct),oe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,N=null,Y=0){let W=Math.pow(2,-Y),F=Math.floor(v.image.width*W),oe=Math.floor(v.image.height*W),De=N!==null?N.x:0,Re=N!==null?N.y:0;fe.setTexture2D(v,0),_.copyTexSubImage2D(_.TEXTURE_2D,Y,0,0,De,Re,F,oe),ge.unbindTexture()};let Ed=_.createFramebuffer(),wd=_.createFramebuffer();this.copyTextureToTexture=function(v,N,Y=null,W=null,F=0,oe=null){oe===null&&(F!==0?(La("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),oe=F,F=0):oe=0);let De,Re,Te,Ge,ke,Oe,$e,st,ct,dt=v.isCompressedTexture?v.mipmaps[oe]:v.image;if(Y!==null)De=Y.max.x-Y.min.x,Re=Y.max.y-Y.min.y,Te=Y.isBox3?Y.max.z-Y.min.z:1,Ge=Y.min.x,ke=Y.min.y,Oe=Y.isBox3?Y.min.z:0;else{let jt=Math.pow(2,-F);De=Math.floor(dt.width*jt),Re=Math.floor(dt.height*jt),v.isDataArrayTexture?Te=dt.depth:v.isData3DTexture?Te=Math.floor(dt.depth*jt):Te=1,Ge=0,ke=0,Oe=0}W!==null?($e=W.x,st=W.y,ct=W.z):($e=0,st=0,ct=0);let ot=Fe.convert(N.format),Le=Fe.convert(N.type),xt;N.isData3DTexture?(fe.setTexture3D(N,0),xt=_.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(fe.setTexture2DArray(N,0),xt=_.TEXTURE_2D_ARRAY):(fe.setTexture2D(N,0),xt=_.TEXTURE_2D),_.pixelStorei(_.UNPACK_FLIP_Y_WEBGL,N.flipY),_.pixelStorei(_.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),_.pixelStorei(_.UNPACK_ALIGNMENT,N.unpackAlignment);let mr=_.getParameter(_.UNPACK_ROW_LENGTH),tr=_.getParameter(_.UNPACK_IMAGE_HEIGHT),Ai=_.getParameter(_.UNPACK_SKIP_PIXELS),Ot=_.getParameter(_.UNPACK_SKIP_ROWS),na=_.getParameter(_.UNPACK_SKIP_IMAGES);_.pixelStorei(_.UNPACK_ROW_LENGTH,dt.width),_.pixelStorei(_.UNPACK_IMAGE_HEIGHT,dt.height),_.pixelStorei(_.UNPACK_SKIP_PIXELS,Ge),_.pixelStorei(_.UNPACK_SKIP_ROWS,ke),_.pixelStorei(_.UNPACK_SKIP_IMAGES,Oe);let pt=v.isDataArrayTexture||v.isData3DTexture,Xt=N.isDataArrayTexture||N.isData3DTexture;if(v.isDepthTexture){let jt=ae.get(v),_t=ae.get(N),rr=ae.get(jt.__renderTarget),As=ae.get(_t.__renderTarget);ge.bindFramebuffer(_.READ_FRAMEBUFFER,rr.__webglFramebuffer),ge.bindFramebuffer(_.DRAW_FRAMEBUFFER,As.__webglFramebuffer);for(let Jr=0;Jr<Te;Jr++)pt&&(_.framebufferTextureLayer(_.READ_FRAMEBUFFER,_.COLOR_ATTACHMENT0,ae.get(v).__webglTexture,F,Oe+Jr),_.framebufferTextureLayer(_.DRAW_FRAMEBUFFER,_.COLOR_ATTACHMENT0,ae.get(N).__webglTexture,oe,ct+Jr)),_.blitFramebuffer(Ge,ke,De,Re,$e,st,De,Re,_.DEPTH_BUFFER_BIT,_.NEAREST);ge.bindFramebuffer(_.READ_FRAMEBUFFER,null),ge.bindFramebuffer(_.DRAW_FRAMEBUFFER,null)}else if(F!==0||v.isRenderTargetTexture||ae.has(v)){let jt=ae.get(v),_t=ae.get(N);ge.bindFramebuffer(_.READ_FRAMEBUFFER,Ed),ge.bindFramebuffer(_.DRAW_FRAMEBUFFER,wd);for(let rr=0;rr<Te;rr++)pt?_.framebufferTextureLayer(_.READ_FRAMEBUFFER,_.COLOR_ATTACHMENT0,jt.__webglTexture,F,Oe+rr):_.framebufferTexture2D(_.READ_FRAMEBUFFER,_.COLOR_ATTACHMENT0,_.TEXTURE_2D,jt.__webglTexture,F),Xt?_.framebufferTextureLayer(_.DRAW_FRAMEBUFFER,_.COLOR_ATTACHMENT0,_t.__webglTexture,oe,ct+rr):_.framebufferTexture2D(_.DRAW_FRAMEBUFFER,_.COLOR_ATTACHMENT0,_.TEXTURE_2D,_t.__webglTexture,oe),F!==0?_.blitFramebuffer(Ge,ke,De,Re,$e,st,De,Re,_.COLOR_BUFFER_BIT,_.NEAREST):Xt?_.copyTexSubImage3D(xt,oe,$e,st,ct+rr,Ge,ke,De,Re):_.copyTexSubImage2D(xt,oe,$e,st,Ge,ke,De,Re);ge.bindFramebuffer(_.READ_FRAMEBUFFER,null),ge.bindFramebuffer(_.DRAW_FRAMEBUFFER,null)}else Xt?v.isDataTexture||v.isData3DTexture?_.texSubImage3D(xt,oe,$e,st,ct,De,Re,Te,ot,Le,dt.data):N.isCompressedArrayTexture?_.compressedTexSubImage3D(xt,oe,$e,st,ct,De,Re,Te,ot,dt.data):_.texSubImage3D(xt,oe,$e,st,ct,De,Re,Te,ot,Le,dt):v.isDataTexture?_.texSubImage2D(_.TEXTURE_2D,oe,$e,st,De,Re,ot,Le,dt.data):v.isCompressedTexture?_.compressedTexSubImage2D(_.TEXTURE_2D,oe,$e,st,dt.width,dt.height,ot,dt.data):_.texSubImage2D(_.TEXTURE_2D,oe,$e,st,De,Re,ot,Le,dt);_.pixelStorei(_.UNPACK_ROW_LENGTH,mr),_.pixelStorei(_.UNPACK_IMAGE_HEIGHT,tr),_.pixelStorei(_.UNPACK_SKIP_PIXELS,Ai),_.pixelStorei(_.UNPACK_SKIP_ROWS,Ot),_.pixelStorei(_.UNPACK_SKIP_IMAGES,na),oe===0&&N.generateMipmaps&&_.generateMipmap(xt),ge.unbindTexture()},this.initRenderTarget=function(v){ae.get(v).__webglFramebuffer===void 0&&fe.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?fe.setTextureCube(v,0):v.isData3DTexture?fe.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?fe.setTexture2DArray(v,0):fe.setTexture2D(v,0),ge.unbindTexture()},this.resetState=function(){T=0,y=0,S=null,ge.reset(),_e.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return gr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=tt._getUnpackColorSpace()}},fv=Object.freeze([1,2,3,4]),Iu=5,Rl=5,Av=Object.freeze([0,1,2,3,4,5]),Ru=42,mv=Object.freeze({id:"customer-white-male-01",presentation:"adult-man",skinTone:"white",hairTexture:"straight",startingHaircut:"uniform-fade-region"}),Ev=Object.freeze({minYawDeg:-180,initialYawDeg:-55,maxYawDeg:180,axis:"full-scalp"}),uo=Object.freeze({id:"clipper",touchOffsetPx:72,logicalRadiusCells:3,bladeWidthUnits:.56,bladeDepthUnits:.1,modelScale:.31}),Tu=Object.freeze({classic:Object.freeze([5,5,5]),tidy:Object.freeze([3,4,5]),medium:Object.freeze([4,5,5]),even16:Object.freeze([5,5,5]),tapered:Object.freeze([3,5,5]),soft:Object.freeze([4,4,5])});function $0(e,t,r=Tu.classic){let i=.06*Math.max(0,-Math.cos((e-.5)*Math.PI*2)),a=.012*Math.sin(e*Math.PI*18)+.008*Math.sin(e*Math.PI*42+1.7);return t<.6-i+a?r[0]:t<.67-i+a?r[1]:r[2]}function ew(e=Tu.classic){return Array.from({length:8192},(t,r)=>$0((r%128+.5)/128,(Math.floor(r/128)+.5)/64,e))}var Xi=e=>({0:.5,1:3,2:6,3:10,4:13,5:16,6:19,7:22,8:25})[e],Yt=(e,t,r)=>{let i=Math.max(0,Math.min(1,(r-e)/(t-e)));return i*i*(3-2*i)};function Na(e,t,r){let i=Math.abs(e),a=3.05-.55*Yt(.7,1.6,i),n=1+(Yt(a-.07,a+.12,t)-1)*Yt(0,.9,r),o=1.55+(.72+.42*Yt(.3,1.35,i)-1.55)*(1-Yt(-.75,-.15,r));o+=(1.4-o)*Yt(0,.4,r)*(1-Yt(.4,.9,r)),o+=(Math.max(o,1.4+1.5*Yt(.5,1.5,r))-o)*Yt(.25,.6,r);let s=1-Yt(-.75,-.15,r);return n*=Yt(o-(.08+.08*s),o+(.12+.1*s),t),n*(1+(Yt(1,1.28,Math.hypot((r+.13)/.5,(t-1.2)/.74))-1)*Yt(1.35,1.6,i))}function Tl(e,t,r){return{u:(Math.atan2(e,-(r+.13))+Math.PI)/(2*Math.PI),v:Math.max(0,Math.min(1,(Math.atan2(t-2.1,Math.hypot(e,r+.13))+.7)/(Math.PI/2+.7)))}}var tw=`
float hairMask(vec3 p){float ax=abs(p.x),front=3.05-.55*smoothstep(.7,1.6,ax);float m=mix(1.0,smoothstep(front-.07,front+.12,p.y),smoothstep(0.0,.9,p.z));float back=.72+.42*smoothstep(.3,1.35,ax);float hl=mix(1.55,back,1.0-smoothstep(-.75,-.15,p.z));hl=mix(hl,1.4,smoothstep(0.0,.4,p.z)*(1.0-smoothstep(.4,.9,p.z)));hl=mix(hl,max(hl,1.4+1.5*smoothstep(.5,1.5,p.z)),smoothstep(.25,.6,p.z));float rear=1.0-smoothstep(-.75,-.15,p.z);m*=smoothstep(hl-mix(.08,.16,rear),hl+mix(.12,.22,rear),p.y);float ear=length(vec2((p.z+.13)/.5,(p.y-1.2)/.74));return m*mix(1.0,smoothstep(1.0,1.28,ear),smoothstep(1.35,1.6,ax));}
float gridValue(vec3 p){float u=(atan(p.x,-(p.z+.13))+3.14159265)/6.28318530;float v=clamp((atan(p.y-2.1,length(vec2(p.x,p.z+.13)))+.70)/2.27079632679,0.0,1.0);return texture2D(uGrid,vec2(u,v)).r*${(Xi(Rl)/Xi(Iu)).toFixed(4)};}`;function rw(e,t){let r={positions:new Float32Array(24576),weights:new Float32Array(8192)};for(let i=0;i<t.length;i+=3){let a=[t[i],t[i+1],t[i+2]],n=a.map(h=>[e[h*3],e[h*3+1],e[h*3+2]]);if(!n.some(h=>Na(...h)>.01))continue;let o=n[1].map((h,d)=>h-n[0][d]),s=n[2].map((h,d)=>h-n[0][d]),l=Math.hypot(o[1]*s[2]-o[2]*s[1],o[2]*s[0]-o[0]*s[2],o[0]*s[1]-o[1]*s[0])*.5*24*24,c=12,u=(c+1)*(c+2)/2;for(let h=0;h<=c;h++)for(let d=0;d<=c-h;d++){let g=[0,1,2].map(w=>n[0][w]*(1-(h+d)/c)+n[1][w]*h/c+n[2][w]*d/c);if(Na(...g)<.05)continue;let m=Tl(...g),A=Math.min(63,Math.floor(m.v*64))*128+Math.min(127,Math.floor(m.u*128)),f=l/u,p=r.weights[A];for(let w=0;w<3;w++)r.positions[A*3+w]=(r.positions[A*3+w]*p+g[w]*f)/(p+f);r.weights[A]+=f}}return r}function iw(e,t){for(let a=0;a<t.length;a+=3){let n=[t[a],t[a+1],t[a+2]],o=Tl(...n),s=Math.min(63,Math.floor(o.v*64))*128+Math.min(127,Math.floor(o.u*128));e.weights[s]||(e.positions.set(n,s*3),e.weights[s]=.05)}let r=.22,i=new Map;for(let a=0;a<e.weights.length;a++){if(!e.weights[a])continue;let n=[0,1,2].map(o=>Math.floor(e.positions[a*3+o]/r)).join(",");i.has(n)||i.set(n,[]),i.get(n).push(a)}return e.spatial={size:r,buckets:i},e}function aw(e,t,r){let i=e.attributes.position.array,a=e.attributes.normal.array,n=e.index.array,o=[],s=[],l=0,c=41873,u=()=>(c=Math.imul(c,1664525)+1013904223>>>0,c/4294967296);for(let S=0;S<n.length;S+=3){let U=n[S]*3,D=n[S+1]*3,M=n[S+2]*3;if(![U,D,M].some(G=>Na(i[G],i[G+1],i[G+2])>.05))continue;let I=new b(i[D]-i[U],i[D+1]-i[U+1],i[D+2]-i[U+2]),H=new b(i[M]-i[U],i[M+1]-i[U+1],i[M+2]-i[U+2]),k=I.cross(H).length()*.5;k<=0||(l+=k,o.push([U,D,M]),s.push(l))}let h=new Float32Array(3e4*3),d=new Float32Array(3e4*3),g=new Float32Array(3e4*3);for(let S=0;S<3e4;S++){let U,D;do{let M=u()*l,I=0,H=s.length-1;for(;I<H;){let te=I+H>>1;s[te]<M?I=te+1:H=te}let[k,G,Z]=o[I],V=Math.sqrt(u()),$=u(),J=[1-V,V*(1-$),V*$];U=[0,1,2].map(te=>i[k+te]*J[0]+i[G+te]*J[1]+i[Z+te]*J[2]),D=[0,1,2].map(te=>a[k+te]*J[0]+a[G+te]*J[1]+a[Z+te]*J[2])}while(Na(...U)<.08);h.set(U,S*3),d.set(D,S*3),g.set([u(),u(),u()],S*3)}let m=new af,A=[],f=[];for(let S=0;S<=5;S++)if(A.push(-1,S/5,0,1,S/5,0),S<5){let U=S*2;f.push(U,U+1,U+2,U+1,U+3,U+2)}m.setAttribute("position",new mt(A,3)),m.setIndex(f),m.setAttribute("aRoot",new Ra(h,3)),m.setAttribute("aNormal",new Ra(d,3)),m.setAttribute("aSeed",new Ra(g,3)),m.instanceCount=3e4;let p={value:1},w=[null,{HANG:.35,FWD:0,LIFT:.55,TOPLIFT:.66,SPREAD:.18,SAG:.12,WAVE:0,WAVEF:1},{HANG:.22,FWD:.56,LIFT:.56,TOPLIFT:.5,SPREAD:.16,SAG:.1,WAVE:.02,WAVEF:1},{HANG:.15,FWD:.15,LIFT:.7,TOPLIFT:.92,SPREAD:.26,SAG:.04,WAVE:.06,WAVEF:1.5}][2],C=Object.entries(w).map(([S,U])=>"#define "+S+" "+Number(U).toFixed(4)).join(`
`)+`
`+t+`
 attribute vec3 aRoot,aNormal,aSeed;
 uniform vec3 cam;uniform float uWidth;
 varying vec3 vRoot,vTip,vTangent,vSeed;varying float vAlong,vEdge,vLength;
 void main(){
  vec3 n=normalize(aNormal);
  vec3 down=vec3(0.0,-1.0,0.0);down-=n*dot(down,n);
  // at the very top of the head the surface faces straight up, so "down along the surface" vanishes and its direction
  // turns radial (the compass star); there it falls back to a fixed backward direction instead
  vec3 back=vec3(0.0,0.0,-1.0);back-=n*dot(back,n);
  down=normalize(mix(back,down,smoothstep(.12,.5,length(down)))+vec3(.0001));
  vec3 fwd=vec3(0.0,.25,1.0);fwd-=n*dot(fwd,n);fwd=normalize(fwd+vec3(.0001));
  // combed flow with no radial whorl (no "compass" star on the crown): the top lies forward, the back and sides
  // fall down; where the two meet (a band across the back of the crown) strands are scattered so no line or point shows
  float topW=smoothstep(3.05,3.75,aRoot.y)*smoothstep(-1.1,.2,aRoot.z);
  vec3 flow=normalize(mix(down,fwd,topW)+vec3(.0001));
  vec3 tA=normalize(cross(n,flow)+vec3(.0001));
  float g=gridValue(aRoot),hm=hairMask(aRoot);
  float stock=smoothstep(.80,1.0,g); // ~13 mm and up reads as uncut growth
  float top=smoothstep(3.22,3.62,aRoot.y);
  float crown=1.0-smoothstep(.0,.42,distance(aRoot,vec3(.12,3.65,-.55)));
  float L0=${Xi(Iu)/Ru};
  // natural per-strand length variation on uncut stock, ragged (not blunt) perimeter
  float jitter=1.0+(aSeed.x-.5)*mix(.08,.24,stock);
  float ragged=mix(.72+.38*aSeed.y,1.0,smoothstep(.55,.98,hm));
  float L=g*L0*hm*mix(1.0,jitter*ragged,stock);
  float shortHair=1.0-smoothstep(.10,.45,g);
  float hang=(1.0-smoothstep(2.7,3.65,aRoot.y))*HANG;
  flow=normalize(mix(flow,down,hang));
  flow=normalize(mix(flow,fwd,top*FWD));
  float lift=mix(LIFT,.95,shortHair);
  lift=mix(lift,TOPLIFT,top);
  // seam between the forward top and the falling back: each strand turns a random way around its root
  // (a soft, scattered crown like real short hair) and lies moderately flat so the scalp stays covered
  float scatter=clamp(4.0*topW*(1.0-topW),0.0,1.0);
  float spinA=(aSeed.x-.5)*6.2831*scatter*scatter*(3.0-2.0*scatter);
  flow=normalize(flow*cos(spinA)+tA*sin(spinA));
  tA=normalize(cross(n,flow)+vec3(.0001));
  lift=mix(lift,.42,max(crown,scatter)*.7);
  vec3 dir=normalize(n*lift+flow*(1.0-lift*.75)+tA*(aSeed.z-.5)*SPREAD+flow*(aSeed.y-.5)*SPREAD*.6);
  float t=position.y;
  float sag=SAG*t*clamp(L/L0,0.0,1.6);
  vec3 curve=normalize(dir+flow*(.10*t)+down*sag);
  float wave=sin(t*6.2831*WAVEF+aSeed.x*6.2831)*WAVE*t;
  vec3 p=aRoot+n*.002+curve*(t*L)+tA*wave*L;
  vec3 view=normalize(cam-p),side=cross(curve,view);
  if(dot(side,side)<.00001)side=cross(curve,vec3(0.0,1.0,.001));side=normalize(side);
  float radius=.0062*uWidth*(.82+.36*aSeed.y)*mix(1.0,.28,pow(t,2.0));
  // stubble seen edge-on at the head's silhouette would pile up into a dark outline: thin it out there
  float facing=abs(dot(n,normalize(cam-aRoot)));
  radius*=mix(1.0,smoothstep(.04,.40,facing),shortHair);
  p+=side*position.x*radius;
  vRoot=aRoot;vTip=p;vTangent=curve;vSeed=aSeed;vAlong=t;vEdge=position.x;vLength=L;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
 }`,x=t+`
 uniform vec3 lA,lB,lC,cam;
 varying vec3 vRoot,vTip,vTangent,vSeed;varying float vAlong,vEdge,vLength;
 void main(){
  if(vLength<.0001||vSeed.z>uDensity)discard;
  float edge=abs(vEdge),aa=max(fwidth(edge),.03);if(edge>1.0-aa*.25)discard;
  vec3 tangent=normalize(vTangent),view=normalize(cam-vTip);
  vec3 root=vec3(.012,.008,.005),tip=mix(vec3(.045,.029,.017),vec3(.095,.066,.036),vSeed.x);
  vec3 base=mix(root,tip,smoothstep(0.0,.9,vAlong))*uHairTint;
  float light=.58+.80*sqrt(max(0.0,1.0-pow(dot(tangent,lA),2.0)));
  vec3 halfA=normalize(view+lA),halfB=normalize(view+lB);
  float glint=pow(sqrt(max(0.0,1.0-pow(dot(tangent,halfA),2.0))),65.0)*.08;
  float rim=pow(sqrt(max(0.0,1.0-pow(dot(tangent,halfB),2.0))),45.0)*.04;
  vec3 lit=base*light+vec3(1.0,.88,.68)*(glint+rim)*smoothstep(.05,.6,vAlong);
  gl_FragColor=vec4(lit,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`,T=new fr({vertexShader:C,fragmentShader:x,uniforms:dl(Nn({},r),{uWidth:p}),side:$t}),y=new Ze(m,T);return y.frustumCulled=!1,y.renderOrder=1,{mesh:y,roots:h,count:3e4,setCount(S){m.instanceCount=Math.max(16e3,Math.min(3e4,S)),p.value=Math.sqrt(3e4/m.instanceCount)}}}var nw=class extends hu{constructor(){super();let e=new Wt;e.deleteAttribute("uv");let t=new Br({side:Nt}),r=new Br,i=new tf(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);let a=new Ze(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let n=new yg(e,r,6),o=new Rt;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),n.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),n.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),n.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),n.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),n.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),n.setMatrixAt(5,o.matrix),this.add(n);let s=new Ze(e,Ui(50));s.position.set(-16.116,14.37,8.208),s.scale.set(.1,2.428,2.739),this.add(s);let l=new Ze(e,Ui(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let c=new Ze(e,Ui(17));c.position.set(14.904,12.198,-1.832),c.scale.set(.15,4.265,6.331),this.add(c);let u=new Ze(e,Ui(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let h=new Ze(e,Ui(20));h.position.set(3.235,11.486,-12.541),h.scale.set(2.5,2,.1),this.add(h);let d=new Ze(e,Ui(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Ui(e){return new Hg({color:0,emissive:16777215,emissiveIntensity:e})}function sw(e,t,r,i,a=0,n=34){let o=r*Math.PI/180,s=i*Math.PI/180,l=[Math.sin(o)*Math.cos(s),Math.sin(s),-Math.cos(o)*Math.cos(s)],c=[-Math.cos(o),0,-Math.sin(o)],u=[-Math.sin(o)*Math.sin(s),Math.cos(s),Math.cos(o)*Math.sin(s)],h=[1/0,1/0,1/0],d=[-1/0,-1/0,-1/0];for(let f of e)for(let p=0;p<3;p++)h[p]=Math.min(h[p],f[p]),d[p]=Math.max(d[p],f[p]);let g=h.map((f,p)=>(f+d[p])/2),m=Math.tan(n*Math.PI/360)*.92,A=2;for(let f of e){let p=f.map((x,T)=>x-g[T]),w=x=>p.reduce((T,y,S)=>T+y*x[S],0),C=w(l)+a;A=Math.max(A,C+(Math.abs(w(c))+a)/(m*t),C+(Math.abs(w(u))+a)/m)}return{center:g,position:g.map((f,p)=>f+l[p]*A),distance:A,fov:n,right:c,up:u,outward:l}}var ow="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dNaUcbnWqHH51qt0Ate4dBfXenRk15N0YNfFdBjXmnTi1hpx09ZScZrWUXG91m5xCNfAdAXXH3XX1lpx/NYicR/XP3Hd1mRxp9Yxcb7WWXET18F0JtcUdbXW9XNh1hB0mNY9cxjXtHRH1+x0YxDYmasTYJkJE7SdVA/Lm64KDpGzCiGMTw4jjUUMa5H0BX2TBgM4ktUD2Y8GB0eSZgWHmYoDbZlxA46YKgWNmE8Ln529CgKi0QZloFEJZp2SEBKY4RL1ltkQl5B3DRmSaQPglxAFpZcABRCevweenKkSE5Y8EN6Www8Ulj0SRZUMDsSSBRGdkQYRN5J/DnCTfQNnlxcF0Jb+A86blwaam1gPhZWuEayUIQX0lSkDiJYGA6CVTQXslLMDo5rdBZGaGw/9lHoRa5RUD6yhaQ0ZndwOUpRdEbqTNg5ilXkO3pW7DWSafQw2m38HjpkrB9qYIguBm9wN3ZSSDjuZlQrPksILCJNZB7eUEgjWk/0GLZjbCWKb2g4MmIsMbpPlBoWXywjums0OHZeqDmqWBA3Rk28NQpTaBuaWAghGmuAGU5b7BqKVEAtXmicKSprdDfCXiQ3HmHgL9pMTDDOU4wf2l8wHbZdeCQCa8A0zl94NnJZ4DHOU2QzElMkH6pbBCI6Zuw0jltEHeJbtB/iVUwgKmYgNtpXkDJCZAwwYmg8If5hBDT2VlwrfkzUIU5W7CKuUCgu3mccLg5nmDHmVKg3klQENg5h5DBuZnwpxlFYLepSuCKOVGwkelYgITJhfCNaXUQqymVEN25fWC6OUSwhel64JfZlwDT+XbQ25li0M0ZSEDBGVSQjtlisJJ5lUDUqWVgiNlnAIJpbKCL6YbAnjmBQJjJjWCCqYrwjCl5sI8ZabCFaXrAyllesMB5bACEeWpwiellgJZ5X4CNmVRgvQlKcKzpQHC1KZawpRmbYL7pQ5DM2YrgxUmBANZpYcDUWXIA3OlgMMEpVRDEmV+QzKl6YLJZngCSmZoQmrmAcK45jWDEiX3wzdlrIMupfkC02VnwsulTwLGZWxChuVCAyOmG4MK5jgCPiW4QhRl4AKApkFCwCZ6wiwllEJYpiMC9mY1Ax/lrUMKJaLCaSVNQkHlhgJDph8DNCV8wiylwMJZZYxCcOWKAkAl40JNJjTCW+Y2wtSmDIMAph6DEuWSQz+lZQMl5a+CeCV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ls7AXdjPxllj0ClbwtKJXc/UZV5l0YZc7d/hUGXe6U+f3E1P1toAT9XhNlT34BRSxcxNWLPPNlhuyXZYWti/XSTS0FUG08dUxtZ/UePY9lCR3QlbS9sJXHTVTVQr1iRV0NVfVRfV3VQx4AhXtd9fWWveflJx34VTkNcSXCnYaFuo2ThbZtnSW1nde1Nz3NVUO9tyVBvc/VKY061br9KQWvrYplxU0ylYTtS9VwDU31iY01NZW9/6VrreDVdD3iNWB9/XVcrUJVoO1D5aa9r7UKjdb1WC3vFUGdbLW+DWQVsV1rpTmNbsVKDT21Mv3XpazNwfWk/etljZ3vlY5NqXUkvaPlRl2SJUA9qWUmPWJ1rL1c9aoNWMWdHdeFdv3aFY/NojWjnbzVrC2YJaEtxOVaDa21TK1JZYH9ysWcLWL1Vi1lxVg92UVmLXkVqE2KhaqtXXVXnVoFUU1oxVXNfjVE/Xm1RB2FNUJtizVAXZn1Tt3M9V0tTDV8vZuFQu1ZlWxNSTViDV31dm1aRYtNkLVeHY7FRd1bNWydX8VcLYJlrc2f5ZrduSVYPcElbN1tNZE9ZbWR7dmFe43I5Y8NqxWWXaLFWj22pZ9dZUVYnWg1X83MNWu9cdWi3WqVV31ydVQNjtVPvX0lkr2J5ZCNmfWe3Y0Vlm3OtWHdwDV7jbd1b821VWqNamVc/W31VP1vBVQ9bUVU3bA1kD281YTtt8WMvbeViw1QZY3dX7VxfWaVjj1XJYlNlvVZHZkVUF2XpVANlZVe3Zd1np2apZU9viVTXbA1YZ2rJVJNqQVcDWD1l81jtZItefVTrXtVWW3KxXJdypV3Ta7FiX2i5Z6tlGWcHaoVgz1pZWGNZ9VnbWPFb316tV29eTVZvYe1We2JhV+didVRrWClfo1fxWCtsZVoPbiFae1zdZZtdoWfTW8Vir26FXB9tuWFDa3VcC2sBXAtqBV07an1fU2NlY99iWWF3Zn1hP2d5YpddSVzzXGVdS191WqNcaV0jaG1j92fdXCtm8VirZdFaY2aVWZdnXVqvXgFbT18dWuNfrVnLXrFZy2LRWadhZVsTYYVa42L5W+NlGVzzaQFf92SZYMtpPWBbaelj22UNYMNiqVhzYX1Yw18RXwdfyV//XHlhg1zNYatgTVs/YGVYI2CFW3tbtVv3Wqlal2BRZPdkYWRfY4Vhi2KtY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BR8hjMQjfZOyIkeS4yXZj7ImOJJSJIeZjiSNmEcmjpguJm2ZaR6fnWcgZp3nImWg+x4CoiYZEpjXFvWWQRwZkt8Yl5CoJKWXTibgl/khnpy4JBCeDxcTlnsXRZX1GRSWfBnelqwbxJI5G3CTshg3krMYnZGgJNCWOyZnlyEjmpu6Jc6bYBqFlQoYrJSXJPSVayTslLImoJWPJoiW2yORmgUmo5qdGv2UPRhrlE8cGZ1kGqyh2xpSlFsYupOCG2KVPxvelf0bZJo6HTabOSKOmY0i2piWHoGb3BvdlCYbO5kjH8+S9R0Ik18it5SmIdaTuyItmN0fYpveGgyYLR1uk9MihZftIO6aDhtqlusaHZe0HNGTSRxClN4i5pa2IUaa2CJTlr0iopWoHleakR9Kmtsb8JcvHMeYQB72k6UdM5TVIfaX7CFtl1ogAJraG5yWyBszl0Adc5TfHMSU7yHqlvYgjpn9GyOW5yF4lssh+JVlIQqZMBy2ldQckJm1HRiaqSF/mHccPZUhH9+TgyFTlf0gq5TxHYOZrh63mdIceZWNHOSVtxyDmD8dG5kZH3GUYh56lAoho5WdIB6VMCFMmFkh1pdnH7KZZxzbl+Ido5RtIV6XCiB9mUscuZZIHD+Xih3RlDQdEZVvIe2WjSAnmWQcSpZiIY2WSCEmlu4gvphLIOOYpCCMmOIgKpgJIcKXHCFWlxwh8ZYMHaWVzRwHlhEhnpb4IEeWwCDZlWAgZ5UQH86Uch7QlLEeUplNH1GZAh7ulAodVJh/Hc2YqBxmlpcczpacHEWXtR0SlWcdSZW/HMqXEh4lmdgfKZmwH+OYFyCrmNkc3ZbiHEiXBh26lxgeLpXUHU2VBx8blXweGZVKHSuYrx2OmNcgUZfYIPiWsx4AmTgfApnNILCWZyBimCwe2ZgDHSiW5Bx/loIgB5YtIKSVoCAOmDwd0JXFILKXtSBllpAgAJeHIMOW5B9vmCsgNJiGHQKY3R1SmG8d/pU+HUuWJB2XlkQgNZb6H+CVXSDvl0YekJi3HrOYHh3qloYeY5UwHnKVfSCglyodRpdLHaaXcSCFlo0gTJclH7aYix+dmPQdipX/HmiVih10lncdsZb6H2WWvh8hluYf+pcOIMSXZx5AmMAeXJh1HfWWlx64lU8ewZUmIIWXgR1Al5wdi5cgIKSWMyBClxUfX5hlH0uY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GdaVm+DWIJwV1qejmNZ1oqDThqMv3eec2d5onk/eq57M3EGd5NrKpAPay6Rl2T6jS9ojo2PWOp2g1dWdy9WRnNHd6Z9v3cCe/No+ncLZ35w525OcoNqFohLcE6LK1MueH9y1nWLWBaLC1jKig93NoITYuZxi19CcqtWKoRTW1KF51cGhXNd9oibYrqJB2A6jT9fGogXZwqLt3JGh0tSen8vZqKIu1cigxNTOoGbVvZ4g1YGf4dh1orTZVqJd1a6gydVlodzZYp3C2DudrdvPoYPcT6HN1o6dE9YGnh7dyZ+43NOe8NqwnWXaNaKj2/adidbdofXWDKL83J6gu9dEnS3WuKF31zqiQNh0ovvXj53t2I+dCNnBnSvYw51m3Hag/NsMobjb6qAd3F6gqNa7oUPWjKFP1nGhz9aCoU3bXZ7L2+ieTtvlngPblJ6w1Vuf49XunhfW+J7d1WaflNnyoQDZCKIF2eahkdnQoenZt53t2eqdU9t+oSTa0aEZ2q+hNdtdoXzWJp7A1lKeItfCoTrXrKGW3LSfJdy3n3TadZ7q2Ruel9oynsHawJ4z1sqgdtYloRjW5KD317WhntjIoZvY5qHb186h+djEoRrWVqDo1WWgCttIoYPb2aCe1yme9NZwnmbX+Z2r28CfB9vynlDahJ9O2sKfAtrgnwLaoZ/U2IeeT9mDnl3Zwp732MuepdcPoKjXR6BS14SgPNdIoP3ZaZ9I2kafCtmloGXZiqCY2bygKtntoKvX4aBy17WguNd2oNPXmqBy2K2guNiioMTYAKFp2AehPNohoPjZG6D92Tuf9tkdnxba554y2hGfMNi2oBzYAaEw152fYNcun//XQp/B12+fz9hIoWrYTqEI2ECh/da2oN7WdKCl2E2ePdlJnmLYtp4X2ICeltp9n6ra5Z+F1x2hLtfvoDraup5h2uue6tb0nm7Xr5711+WeWtrhoNLZDqEE2o2g0tm0ntrZep552i2fpdqkoDPXA6DE1v6fSdkxocHWW58i18CdutrlnffULZz72ZGh/tlKodvaIKFH1gCfKteMnnTWBZ9K14yh1tZjofXWMaFa12mhydtHoF7bMqAl25SfU9jwnR3Z650u2RWeedgbnjXbwaCb1u6gy9oLn5La0Z4Q1mWfQtZsn4zZraHZ2J+hZdluoebZR57T11OelNj6oVrYI5/S2e+eo9fXn9DX7KHw1T2hutVnoL3ZXKCg2PSe6dgqn4jYTZ8P2QufX9kIn6jZLJ+r2UmfpNlvn6LZnZ+g2dCfqNkCoLPZJqCB2UWgNtlaoObYW6Ck2FOgcthXoEHYZKAS2FCgBNgtoPrXBaDz19uf8dexnxHYeZ9D2GOf1dgpoKjYHqBj2IifnNh3n1DWRqAi2SWgZdkdoPTYVZ/12JSfpNijn2rY059r2K6fqdjKnyfZS58t2Y+fZdlcn2LZi59f2bufLNnFn+3Ywp8l2fSf2Nj7n6jY959q2PifbNghoF7Z7Z9a2qKee9ajoAHYjqFx2J2hetT2oZfT9aCw2KekB9dopEzbFJx11Eekm9Z3miHdmKUC0nGfNdLfnVfgHKLV1O6aVtUOpbLbFaYw5wkDAAABAAIAAAACAAMABAAFAAYABAAGAAcACAAAAAUACAAFAAkACQAFAAQACQAEAAoACwAJAAoACwAKAAwADQAIAAkADQAJAAsADgALAAwADgAMAA8AEAANAAsAEAALAA4AEQAOAA8AEQAPABIAEwAQAA4AEwAOABEAFAARABIAFAASABUAFgATABEAFgARABQAFwAUABUAFwAVABgAGQAWABQAGQAUABcAGgAXABgAGgAYABsAHAAZABcAHAAXABoAHQAaABsAHQAbAB4AHwAcABoAHwAaAB0AIAAdAB4AIAAeACEAIgAfAB0AIgAdACAAIwAkACUAIwAlACYAJwAoACQAJwAkACMAKQAqACsAKQArACwALAArAC0ALAAtAC4ALwApACwALwAsADAAMAAsAC4AMAAuADEAMgAvADAAMgAwADMAMwAwADEAMwAxADQANQADAAIANQACADYANwAHAAYANwAGADgAOQA3ADgAOQA4ADoAOwA1ADYAOwA2ADwAPQA5ADoAPQA6AD4APwA7ADwAPwA8AEAAQQA9AD4AQQA+AEIAQwA/AEAAQwBAAEQARQBGAEcARQBHAEgASQBKAEsASQBLAEwATQBFAEgATQBIAE4ATwBJAEwATwBMAFAAUQBNAE4AUQBOAFIAUwBPAFAAUwBQAFQAVQAmACUAVQAlAFYAVwA0ADEAVwAxAFgAWAAxAC4AWAAuAFkAWQBaAFsAWQBbAFwAXQAhAB4AXQAeAF4AXgAeABsAXgAbAF8AXwAbABgAXwAYAGAAYAAYABUAYAAVAGEAYQAVABIAYQASAGIAYgASAA8AYgAPAGMAZAAMAAoAZAAKAGUAZgAEAAcAZgAHAGcAZwAHADcAZwA3AGgAZQAKAAQAZQAEAGYAaQA5AD0AaQA9AGoAaAA3ADkAaAA5AGkAYwBkAGsAYwBrAGwAbQBGAEUAbQBFAG4AbgBFAE0AbgBNAG8AbwBNAFEAbwBRAHAAcQBtAHIAcQByAHMARgBBAEIARgBCAEcASgBDAEQASgBEAEsAagBxAHMAagBzAHQAdQBzAHIAdQByAHYAdgByAHcAdgB3AHgAeAB3AHkAeAB5AHoAegB5AHsAegB7AHwAfQB+AH8AfQB/AIAAgQCCAIMAgQCDAIQAhACDAIUAhACFAIYAgAB/AIIAgACCAIEAhwB9AIAAhwCAAIgAiACAAIEAiACBAIkAiQCBAIQAiQCEAIoAigCEAIYAigCGAIsAjACHAIgAjACIAI0AjgCPAJAAjgCQAIsAjQCIAIkAjQCJAJEAkQCJAIoAkQCKAJIAkgCKAIsAkgCLAJAAkwCMAI0AkwCNAJQAjwCVAJYAjwCWAJAAlACNAJEAlACRAJcAlwCRAJIAlwCSAJgAmACSAJAAmACQAJYAWwCZAJoAWwCaAFwAmwCcAFwAmwBcAJoAnQCeAJwAnQCcAJsAnwCgAKEAnwChAKIAowCkAKUAowClAKYApwCoAKkApwCpAKoApgClAKsApgCrAKwAqgCpAKQAqgCkAKMArACrAGwArABsAK0ArgBrAK8ArgCvALAAsQCyALMAsQCzALQAsACvALUAsAC1ALYAtwC4ALIAtwCyALEAtACzAHQAtAB0ALkAtgC1ALgAtgC4ALcAdQC5AHQAdQB0AHMAbABrAK4AbACuAK0AfgB9ALoAfgC6ALsAfQCHALwAfQC8ALoAhwCMAL0AhwC9ALwAjACTAL4AjAC+AL0AvwDAAMEAvwDBAMIAwwDEAMAAwwDAAL8AxQDGAMcAxQDHAMgAyQDKAMYAyQDGAMUAyADHAMQAyADEAMMAuwC6AMIAuwDCAMEAywDMAM0AywDNAM4AzgDNAM8AzgDPANAA0QDSAMwA0QDMAMsA0ADPANMA0ADTANQA1ADTANUA1ADVANYAygDJANYAygDWANUA1wDJAMUA1wDFANgAyQDXANkAyQDZANYA2gDDAL8A2gC/ANsA2wC/AMIA2wDCANwA3QDLAM4A3QDOAN4A3gDOANAA3gDQAN8A4ADRAMsA4ADLAN0A3wDQANQA3wDUAOEA4gDIAMMA4gDDANoA4wDkANEA4wDRAOAA4QDUANYA4QDWANkA2ADFAMgA2ADIAOIAugC8ANwAugDcAMIAvAC9AOUAvADlANwAvQC+AOYAvQDmAOUA5wDXANgA5wDYAOgA6ADYAOIA6ADiAOkA6QDiANoA6QDaAOoA6wDlAOYA6wDmAOwA7QDbAOsA7QDrAO4A7wDpAOoA7wDqAPAA2wDcAOUA2wDlAOsA8QDnAOgA8QDoAPIA7gDrAOwA7gDsAPMA8gDoAOkA8gDpAO8A9ADtAO4A9ADuAPUA9QDuAPMA9QDzAPYA9wD4APkA9wD5APoA+gD5APsA+gD7APwA/AD7AP0A/AD9AP4A/wDgAN0A/wDdAAABAQHeAN8AAQHfAAIBAAHdAN4AAAHeAAEBAwHhANkAAwHZAAQBBQHjAOAABQHgAP8AAgHfAOEAAgHhAAMBBgEDAQQBBgEEAQcBCAECAQMBCAEDAQYBCQEBAQIBCQECAQgB5wAEAdkA5wDZANcA5wDxAAcB5wAHAQQBCgELAQwBCgEMAQ0B9wAOAQ8B9wAPAQ0BEAH4AAwBEAEMAREBEgEKARMBEgETARQBFQEWARcBFQEXARgBGQEaARsBGQEbARwBHQEeAR8BHQEfASABIQEdASABIQEgASIBIwEkASABIwEgAR8BIgEgASQBIgEkASUBJgEnARsBJgEbASgBKQEqASsBKQErASgBKwEsASYBKwEmASgBJwEtARwBJwEcARsBGgEpASgBGgEoARsBLgEvATABLgEwATEBLAEjAR8BLAEfASYBMgEzATQBMgE0ATUBNgE3ATgBNgE4ATkBOgE7ATwBOgE8AT0BMwE+AT8BMwE/ATQBQAFBAT0BQAE9ATwBOwFCAUMBOwFDATwBPgFEAUUBPgFFAT8BRgFAATwBRgE8AUMBQgFHAUgBQgFIAUMBRAFJAUoBRAFKAUUBSwFGAUMBSwFDAUgBTAFNAU4BTAFOAU8BUAFMAVEBUAFRAVIBUwFUATIBUwEyAVUBVgFXAVgBVgFYAVkBWgFWAVkBWgFZAVsBMwEyAVQBMwFUAVwBPgEzAVwBPgFcAV0BRAE+AV0BRAFdAV4BSQFEAV4BSQFeAV8BTwFJAV8BTwFfAWABTAFPAWABTAFgAVEBUAFSAVoBUAFaAVsBOAFbAVkBOAFZATkBOQFZAVgBOQFYAWEBYgFjAWQBYgFkAWUBVQFmAWEBVQFhAVgBZwEeAR0BZwEdAWgBIQFpAWoBIQFqAWsBaQFsAW0BaQFtAWoBbgFQAVsBbgFbATgBbwFwAXEBbwFxAXIBRwFzAXQBRwF0AUgBdQFLAUgBdQFIAXQBUgF2AXcBUgF3AVoBdgFSAVEBdgFRAXgBXgF5AXoBXgF6AV8BVAF7AXwBVAF8AVwBfQFWAVoBfQFaAXcBXAF8AX4BXAF+AV0BUwF/AXsBUwF7AVQBXwF6AYABXwGAAWABgQFXAVYBgQFWAX0BeAFRAWABeAFgAYABXQF+AXkBXQF5AV4BggF1AXQBggF0AYMBhAGFAYYBhAGGAYcBiAGJAYoBiAGKAYsBTwFOAUoBTwFKAUkBTQFMAVABTQFQAW4BVwFTAVUBVwFVAVgBMgE1AWYBMgFmAVUBVwGBAX8BVwF/AVMBjAGNAYkBjAGJAYgBjgGPAZABjgGQAZEBkgGCAYMBkgGDAZMBegGUAZUBegGVAYABlgF9AXcBlgF3AZcBmAF4AYABmAGAAZUBdgGZAZcBdgGXAXcBewGaAZsBewGbAXwBfAGbAZwBfAGcAX4BmQF2AXgBmQF4AZgBnQF/AYEBnQGBAZ4BfgGcAZ8BfgGfAXkBfwGdAZoBfwGaAXsBeQGfAZQBeQGUAXoBngGBAX0BngF9AZYBoAGdAZ4BoAGeAaEBoQGeAZYBoQGWAaIBowGgAaEBowGhAaQBpAGhAaIBpAGiAaUBoAGbAZoBoAGaAZ0BlgGXAZkBlgGZAaIBmQGYAaUBmQGlAaIBpQGYAZUBpQGVAZQBpAGlAZQBpAGUAZ8BowGkAZ8BowGfAZwBoAGjAZwBoAGcAZsBjQGmAacBjQGnAYkBiQGnAagBiQGoAYoBhwGGAakBhwGpAaoBqwGTAYMBqwGDAawBqgGtAa4BqgGuAa8BrQGwAbEBrQGxAa4BsgGzAbQBsgG0AbUBswG2AbcBswG3AbQBtgG4AbkBtgG5AbcBugG7AbwBugG8Ab0BvgG6Ab0BvgG9Ab8BwAHBAcIBwAHCAcMBxAHAAcMBxAHDAcUBxgHHAcgBxgHIAckBygHLAcwBygHMAc0BzgGtAaoBzgGqAakBsAGtAc4BsAHOAc8BsgGwAc8BsgHPAdABtgGzAdEBtgHRAdIBuAG2AdIBuAHSAdMB1AHVAdYB1AHWAdcB2AHZAccB2AHHAcYBzQHMAdoBzQHaAdsBjAGIAckBjAHJAcgB3AHdAd4B3AHeAd8B4AHhAeIB4AHiAeMB5AHlAeYB5AHmAecB6AHpAeoB6AHqAesB7AHtAe4B7AHuAe8B8AHxAfIB8AHyAfMB9AH1AfYB9AH2AfcB+AHwAfMB+AHzAfkB+gH0AfcB+gH3AfsB/AH4AfkB/AH5Af0B/gH6AfsB/gH7Af8BAAL8Af0BAAL9AQECAgL+Af8BAgL/AQMCBAIFAvIBBALyAecB8wHyAQUC8wEFAgYC+QHzAQYC+QEGAgcC/QH5AQcC/QEHAggCAQL9AQgCAQIIAgkC7wHuAeEB7wHhAeAB9QH0Ad4B9QHeAQoC3wHeAfQB3wH0AfoB+gH+AZEB+gGRAd8BjgGRAf4BjgH+AQICCwLGAckBCwLJAQwCDQLNAdsBDQLbAQ4CDwLYAcYBDwLGAQsCiAGLAQwCiAEMAskBEAIRAgwCEAIMAosBCwIMAhECCwIRAhICDwILAhICDwISAhMCEwIUAg4CEwIOAg8CDQIOAhQCDQIUAhUCFgITAhICFgISAhcCFwISAhECFwIRAhgCGQIaAhsCGQIbAhwCEAIdAhgCEAIYAhECHgIVAhQCHgIUAh8CsAGyAbUBsAG1AbEBwQG+Ab8BwQG/AcIBswGyAdABswHQAdEB2wHaAdkB2wHZAdgB4wHiAeUB4wHlAeQB9wH2AfEB9wHxAfAB+wH3AfAB+wHwAfgB/wH7AfgB/wH4AfwBAwL/AfwBAwL8AQACDgLbAdgBDgLYAQ8CFQIgAiECFQIhAg0CHwIUAhMCHwITAhYCIAIVAh4CIAIeAiICBQIjAiQCBQIkAgYCBgIkAiUCBgIlAgcCBAImAiMCBAIjAgUCIAInAigCIAIoAiECygHNAQ0CygENAiECCAIpAioCCAIqAgkCBwIlAikCBwIpAggCKwLEAcUBKwLFASwCKQItAi4CKQIuAioCLwK4AdMBLwLTATACIwIxAjICIwIyAiQCMwLLAcoBMwLKATQCNQI2AjcCNQI3AjgCJQI5Ai0CJQItAikCJwIgAiICJwIiAjoCJAIyAjkCJAI5AiUCNALKASECNAIhAigCJgI7AjECJgIxAiMCuAEvAjwCuAE8ArkBPQI+Aj8CPQI/AkACQQJCAkMCQQJDAkQCRAJDAj4CRAI+Aj0CNgI1AkUCNgJFAkYCRwJIAkkCRwJJAkoCSwJMAk0CSwJNAk4CTwJQAlECTwJRAlICUAJPAlMCUAJTAlQCSgJJAkICSgJCAkECVQI3AjYCVQI2AlYCTgJNAjgCTgI4AjcCVwJYAlkCVwJZAloCWwJOAjcCWwI3AlUCXAJXAloCXAJaAl0CPgJeAl8CPgJfAj8CQgJgAmECQgJhAkMCQwJhAl4CQwJeAj4CVgI2AkYCVgJGAmICSAJjAmQCSAJkAkkCZQJLAk4CZQJOAlsCZgJPAlICZgJSAmcCTwJmAmgCTwJoAlMCSQJkAmACSQJgAkICVgJpAmoCVgJqAlUCawJqAmkCawJpAmwCbQJbAlUCbQJVAmoCbgJcAl0CbgJdAm8CXgJwAnECXgJxAl8CYAJyAnMCYAJzAmECYQJzAnACYQJwAl4CaQJWAmICaQJiAnQCYwJ1AnYCYwJ2AmQCdwJlAlsCdwJbAm0CeAJmAmcCeAJnAnkCZgJ4AnoCZgJ6AmgCewJ8An0CewJ9An4CZAJ2AnICZAJyAmACfwJ4AnkCfwJ5AoACeAJ/AoECeAKBAnoCggKDAnwCggJ8AnsCdgKEAoUCdgKFAnICbAKGAocCbAKHAmsCiAJtAmoCiAJqAmsCgwKCAokCgwKJAooCiwJuAm8CiwJvAowCcAKNAo4CcAKOAnECigKJAo8CigKPApACcgKFApECcgKRAnMCcwKRAo0CcwKNAnACbAJpAnQCbAJ0ApICdQKTAoQCdQKEAnYClAJ3Am0ClAJtAogCjQKVApYCjQKWAo4CjwKSApcCjwKXApAChQKYApkChQKZApECkQKZApUCkQKVAo0ChgJsApIChgKSAo8CkwKaApsCkwKbAoQCnAKUAogCnAKIAp0CngJ/AoACngKAAp8CfwKeAqACfwKgAoECoQKXApICoQKSAnQChAKbApgChAKYAoUCogKHAoYCogKGAqMCnQKIAmsCnQJrAocCdAJiAqQCdAKkAqECpQKLAowCpQKMAqYCpwKdAocCpwKHAqICYgJGAqgCYgKoAqQCqQKlAqYCqQKmAqoClQKrAqwClQKsApYCRgJFAq0CRgKtAqgCmAKuAq8CmAKvApkCmQKvAqsCmQKrApUCowKGAo8CowKPAokCmgKwArECmgKxApsCsgKcAp0CsgKdAqcCswKeAp8CswKfArQCngKzArUCngK1AqACOgIiArYCOgK2ArcCmwKxAq4CmwKuApgCogKjArgCogK4ArkCugK7ArkCugK5ArgCvAKnAqICvAKiArkCIgIeAr0CIgK9ArYCvgKpAqoCvgKqAr8CqwLAAsECqwLBAqwCHgIfAsICHgLCAr0CrgLDAsQCrgLEAq8CrwLEAsACrwLAAqsCuAKjAokCuAKJAoICsALFAsYCsALGArECxwKyAqcCxwKnArwCyAKzArQCyAK0AskCswLIAsoCswLKArUCywLCAh8CywIfAhYCsQLGAsMCsQLDAq4CwALMAs0CwALNAsECFgIXAs4CFgLOAssCwwLPAtACwwLQAsQCxALQAswCxALMAsACugK4AoICugKCAnsCxQLRAtICxQLSAsYC0wLHArwC0wK8AtQC1QLIAskC1QLJAtYCyALVAtcCyALXAsoCFwIYAtgCFwLYAs4CxgLSAs8CxgLPAsMC2QLaArsC2QK7AroC1AK8ArkC1AK5ArsC2wLYAhgC2wIYAh0C3AK+Ar8C3AK/At0C3gLVAtYC3gLWAt8C1QLeAuAC1QLgAtcC0gLhAuIC0gLiAs8C4wLUArsC4wK7AtoC5ALcAt0C5ALdAuUCzALmAucCzALnAs0CzwLiAugCzwLoAtAC0ALoAuYC0ALmAswC2QK6AnsC2QJ7An4C0QLpAuEC0QLhAtIC6gLTAtQC6gLUAuMC6wLqAuMC6wLjAuwC7QLuAtoC7QLaAtkCfgJ9Au8CfgLvAvAC8QLeAt8C8QLfAvIC3gLxAvMC3gLzAuAC9ALgAvMC9ALzAvUC7ALjAtoC7ALaAu4C9gLkAuUC9gLlAvcC5gL4AvkC5gL5AucC4gL6AvsC4gL7AugC6AL7AvgC6AL4AuYC2QJ+AvAC2QLwAu0C6QL8Av0C6QL9AuEC/QL6AuIC/QLiAuEC/AL1AvMC/ALzAvEC6wLsAv4C6wL+Av8C/gD9AAAD/gAAAwEDAgMcAhsCAgMbAgMDBAMFAwYDBAMGAwcDpgEIAwkDpgEJA6cB1wHWAbwB1wG8AbsBCQMKA6gBCQOoAacBCwMMAw0DCwMNAw4DDwMQAxEDDwMRAxIDEwMUAxUDEwMVAxYDFwMTAxYDFwMWAxgDGQMXAxgDGQMYAxoDGwMZAxoDGwMaAxwDHQMbAxwDHQMcAx4DHwMdAx4DHwMeAyADIQMiAyMDIQMjAyQDJQMhAyQDJQMkAyYDJwMlAyYDJwMmAygDKQMnAygDKQMoAyoDKwMpAyoDKwMqAywDLQMrAywDLQMsAy4DEgMRAy8DEgMvAzADMQMyAzMDMQMzAzQDNQM2AzcDNQM3AzgDNgM5AzoDNgM6AzcDOQM7AzwDOQM8AzoDPQM+Az8DPQM/A0ADQQNCAz4DQQM+A0MDOwNCA0QDOwNEAzwDQgNBA0UDQgNFA0QDRgNDAz4DRgM+Az0DQgM7Az8DQgM/Az4DQQNHA0gDQQNIA0UDQANJA0oDQANKA0sDRANFA0wDRANMA00DTgNPA0MDTgNDA0YDKwMtA1ADKwNQA1EDKQMrA1EDKQNRA1IDJwMpA1IDJwNSA1MDNwM6A1QDNwNUA1UDVgNXAxADVgMQAw8DDgH3APoADgH6AFgDFAMTAyQDFAMkAyMDEwMXAyYDEwMmAyQDFwMZAygDFwMoAyYDGQMbAyoDGQMqAygDGwMdAywDGwMsAyoDHQMfAy4DHQMuAywDFgNZA1oDFgNaAxgDHgNbA1wDHgNcAyADHANdA1sDHANbAx4DGgNeA10DGgNdAxwDGANaA14DGANeAxoDXwNgA2EDXwNhA2IDWwNjA2QDWwNkA1wDYgNhA2UDYgNlA2YDXgNnA2gDXgNoA10DXQNoA2MDXQNjA1sDYANpA2oDYANqA2EDYwNrA2wDYwNsA2QDYQNqA20DYQNtA2UDZwNuA28DZwNvA2gDaANvA2sDaANrA2MDaQNwA3EDaQNxA2oDawNyA3MDawNzA2wDagNxA3QDagN0A20DbgN1A3YDbgN2A28DbwN2A3IDbwNyA2sDcAN3A3gDcAN4A3EDcgN5A3oDcgN6A3MDcQN4A3sDcQN7A3QDdQN8A30DdQN9A3YDdgN9A3kDdgN5A3IDdwN+A38DdwN/A3gDeQOAA4EDeQOBA3oDeAN/A4IDeAOCA3sDfAODA4QDfAOEA30DfQOEA4ADfQOAA3kDhQOGA4cDhQOHA4gDiQOKA4sDiQOLA4wDiAOHA40DiAONA44DjwOQA5EDjwORA5IDkgORA4oDkgOKA4kDkwOUA5UDkwOVA5YDlgOVA5cDlgOXA5gDmQOaA5sDmQObA5wDnQOeA58DnQOfA6ADnAObA5QDnAOUA5MDoAOfA6EDoAOhA6IDowOkA6UDowOlA6YDpAOnA6gDpAOoA6UDqQOqA6sDqQOrA6wDrQOjA6YDrQOmA64DrwOwA7EDrwOxA7IDpwMSARQBpwMUAagDswO0AxYBswMWARUBqgOpA7QDqgO0A7MDsQO1A7YDsQO2A7IDtwO4Ay8DtwMvAxEDFgMVA7kDFgO5A1kDYANfA7oDYAO6A7sDaQNgA7sDaQO7A7wDcANpA7wDcAO8A70DdwNwA70DdwO9A74DfgN3A74DfgO+A78DwAPBA8IDwAPCA8MDxAOoAKcAxAOnAMUDnwCiAMYDnwDGA8cDyAPJA8oDyAPKA8UDyAPSANEAyAPRAOQAywPHA8YDywPGA8wDwgPBA8sDwgPLA8wDrQCuAMoArQDKANUAowCmAM8AowDPAM0AdQB2AH8AdQB/AH4ApwCqAMwApwDMANIAsQC0AMEAsQDBAMAAeAB6AIMAeACDAIIAtgC3AMQAtgDEAMcArACtANUArADVANMAdgB4AIIAdgCCAH8AqgCjAM0AqgDNAMwAtAC5ALsAtAC7AMEAtwCxAMAAtwDAAMQArgCwAMYArgDGAMoAfgC7ALkAfgC5AHUApgCsANMApgDTAM8AsAC2AMcAsADHAMYAegB8AIUAegCFAIMAMAMvA80DMAPNA84DuAPPA80DuAPNAy8DOgM8A9ADOgPQA1QDTQPQAzwDTQM8A0QDRQNIA9EDRQPRA0wDDAMLA9IDDAPSA9MD1APVA9YD1APWA9cD2APZA9cD2APXA9YD2gPWA9UD2gPVA9sD2gPcA9gD2gPYA9YD3QPeA98D3QPfA+ADPwPhA0kDPwNJA0ADOwM5A+EDOwPhAz8DQQNDA08DQQNPA0cD4gPjA04D4gNOA0YD5APiA0YD5ANGAz0DPQNAA0sDPQNLA+QD4APfA+UD4APlA+YD5wPoA9kD5wPZA9gD5wPpA+oD5wPqA+sD7APtAxAD7AMQA1cD7gPvA/AD7gPwA/EDUwNSA/IDUwPyA/MDUgNRA/QDUgP0A/IDUQNQA/UDUQP1A/QD9gP3A/gD9gP4A/kD+gP7A/wD+gP8A/0D/gP2A/kD/gP5A/8D+gMABDAD+gMwA84D9wMABAEE9wMBBPgDAgS6A/wDAgT8A/sDAwQEBJ4DAwSeA50DBQQGBAQEBQQEBAMEBwSuA6YDBwSmAwgEmAOXAwkEmAMJBAoEogOhA5oDogOaA5kDzgPNAwsEzgMLBAwEDQQOBA8EDQQPBBAEEQS7A7oDEQS6AwIEEgQTBBQEEgQUBBUEFgQXBBgEFgQYBBkEGgQbBBcEGgQXBBYEHAQdBL8DHAS/A74DHgQcBL4DHgS+A70DHwQeBL0DHwS9A7wDIAQfBLwDIAS8A7sDIQR+A78DIQS/AyIEsQMjBCQEsQMkBLUDJQQmBCcEJQQnBCgEsAMpBCMEsAMjBLEDKgQrBCwEKgQsBC0ELgQvBCkELgQpBLADtQMkBCsEtQMrBCoEMAQxBDIEMAQyBDMENAQNBBAENAQQBDUENgQ3BA0ENgQNBDQEOAQ5BDoEOAQ6BDsEMwQyBDcEMwQ3BDYENQQQBDwENQQ8BD0EDwScA5MDDwSTAz4EPwSdA6ADPwSgA0AEDgSZA5wDDgScAw8EQQSiA5kDQQSZAw4EQgSYAwoEQgQKBEMEQASgA6IDQASiA0EERARFBEYERARGBEcESARJBBcBSAQXARYBWANKBEsEWANLBEwETQROBA8BTQQPAQ4BTQQOAVgDTQRYA0wETwRQBBgBTwQYARcBtQMqBFEEtQNRBLYDKgQtBBsEKgQbBFEEUgRTBFQEUgRUBFUESwRKBFYESwRWBFcEAQMAA1MEAQNTBFIEWARNBEwEWARMBFkEWARaBE4EWAROBE0EGwQtBFsEGwRbBBcEXARdBKkDXASpA6wDXQReBLQDXQS0A6kDWQRMBEsEWQRLBF8EDQMxAzQDDQM0Aw4DFwRbBCUEFwQlBBgE6wNgBOgD6wPoA+cD2APcA+kD2APpA+cDDwMSA/cDDwP3A/YDzgNhBPsDzgP7A/oDVgMPA/YDVgP2A/4D/QMBBAAE/QMABPoDEgMwAwAEEgMABPcDYgQCBPsDYgT7A2EEYwQRBAIEYwQCBGIEZAQgBLsDZAS7AxEEZQRmBC8EZQQvBC4EZwRoBDEEZwQxBDAEaQQDBJ0DaQSdAz8EXQRqBGsEXQRrBF4EXQRcBGwEXQRsBGoEGAQlBCgEGAQoBG0EXgRrBG4EXgRuBEgEbwRwBHEEbwRxBHIEcwSPA5IDcwSSA3QERgR1BHYERgR2BEcEdwR4BHkEdwR5BHoEewRJBHwEewR8BH0E8ADqAO0A8ADtAPQAcAR+BH8EcAR/BHEEWwSABCYEWwQmBCUESQRIBG4ESQRuBHwEgQSIA44DgQSOA4IEgwSWA5gDgwSYA0IEXgRIBBYBXgQWAbQDhASFBEUEhARFBEQEhgSJA4wDhgSMA4cEIQSFA4gDIQSIA4EEiASJBDkEiAQ5BDgEhgOFAxUEhgMVBBQEdASSA4kDdASJA4YEewREBEcEewRHBE8EXwSKBHwEXwR8BG4E2gDbAO0A2gDtAOoAigGoARsCigEbAhoCAwMbAqgBAwOoAQoDGQIcAosEGQKLBIwEHAICA40EHAKNBIsE1APXAwwD1AMMA9MD1wPZAw0D1wMNAwwDMQMNA9kDMQPZA+gD6ANgBDID6AMyAzEDNgM1A+YDNgPmA+UDOAM3A1UDOANVA44ENAMzA48ENAOPBJAEkASRBA4DkAQOAzQDkQSSBAsDkQQLAw4D0gMLA5IE0gOSBJMElASVBJYElASWBJcEmATbA9UDmATVA5kEmQTVA9QDmQTUA5oEmgTUA9MDmgTTA5sEmwTTA9IDmwTSA5wEaQExATABaQEwAWwBnQTuA/EDnQTxA54EIgMhA/EDIgPxA/ADIQMlA54EIQOeBPED3wPeA0oD3wNKA0kD5QPfA0kD5QNJA+EDOQM2A+UDOQPlA+EDnQSeBFMDnQRTA/MDJQMnA1MDJQNTA54EZgRlBJ8EZgSfBKAEoQSiBGgEoQRoBGcEMQQ/BEAEMQRABDIEfgRwBKMEfgSjBKQEpASjBFcEpARXBFYEhQMhBCIEhQMiBBUERwR2BFAERwRQBE8EgwNzBHQEgwN0BIQDRAR7BH0ERAR9BIQELQQsBIAELQSABFsEfwOBBIIEfwOCBIIDPgSTA5YDPgSWA4MEgAOGBIcEgAOHBIEDfgMhBIEEfgOBBH8DPQQ8BIkEPQSJBIgEhAN0BIYEhAOGBIADSQR7BE8ESQRPBBcBbwSEBH0EbwR9BKUEpQR9BHwEpQR8BIoEpgSnBKgEpgSoBKkEqgSrBKwEqgSsBK0ErgSvBKsErgSrBKoEsASxBK8EsASvBK4EsgSzBLEEsgSxBLAEtAQ2AAIAtAQCAKkEtQRUAFAAtQRQALYEtwS4BLkEtwS5BLoEtgRQAEwAtgRMALsEvAS9BL4EvAS+BL8EuwRMAEsAuwRLALoEwATBBMIEwATCBMMEtwREAEAAtwRAAMQExQTGBMEExQTBBMAExARAADwAxAQ8AMcExwQ8ADYAxwQ2ALQEyATJBMoEyATKBMsEzATNBM4EzATOBM8E0ATRBNIE0ATSBNMEpgQBALMEpgSzBLIE1ATVBNEE1ATRBNAErQSsBNUErQTVBNQE1gTXBNgE1gTYBNkE2gTbBNwE2gTcBN0E3gTfBOAE3gTgBOEE4gSnBOME4gTjBOQE5QTmBOcE5QTnBOgE2QTYBOkE2QTpBOoE4QTgBOsE4QTrBOwE5ATjBO0E5ATtBO4EuATvBPAEuATwBLkE7wS4BOYE7wTmBOUE8QTyBPME8QTzBPQE7ATrBPUE7AT1BPYE7gTtBPcE7gT3BPgE+QT6BLkE+QS5BPAE+wT8BP0E+wT9BP4E+AT3BP8E+AT/BAAFAQUCBfoEAQX6BPkEAwUEBagEAwWoBAUFAAX/BN8EAAXfBN4EpwTiBAUFpwQFBagEBgUHBQIFBgUCBQEF6ATnBAQF6AQEBQMFCAUJBQoFCAUKBQsFDAUNBQ4FDAUOBQ8FEAURBRIFEAUSBRMFFAUVBRYFFAUWBRcFGAUZBRoFGAUaBRsFHAUdBQkFHAUJBQgFDwUOBR4FDwUeBR8FFwUWBSAFFwUgBSEFGwUaBSIFGwUiBSMFJAUlBSYFJAUmBScFJQUkBR0FJQUdBRwFKAUpBSoFKAUqBSsFIQUgBSwFIQUsBS0FIwUiBS4FIwUuBS8FMAUxBScFMAUnBSYFMgUzBTQFMgU0BTUFLwUuBTYFLwU2BTcFOAU5BTEFOAUxBTAFCwUKBToFCwU6BTsFNwU2BRUFNwUVBRQFGQUYBTsFGQU7BToFPAU9BTkFPAU5BTgFPgU4BTAFPgUwBT8FQAULBTsFQAU7BUEFQgU3BRQFQgUUBUMFGAVEBUEFGAVBBTsFRQU8BTgFRQU4BT4FRgUIBQsFRgULBUAFRwUMBQ8FRwUPBUgFSQUQBRMFSQUTBUoFQwUUBRcFQwUXBUsFRAUYBRsFRAUbBUwFTQUcBQgFTQUIBUYFSAUPBR8FSAUfBU4FSwUXBSEFSwUhBU8FTAUbBSMFTAUjBVAFJQVRBVIFJQVSBSYFUQUlBRwFUQUcBU0FUwUoBSsFUwUrBVQFTwUhBS0FTwUtBVUFUAUjBS8FUAUvBVYFPwUwBSYFPwUmBVIFVwUyBTUFVwU1BVgFVgUvBTcFVgU3BUIFWQVEBUwFWQVMBVoFWwVNBUYFWwVGBVwFXQVIBU4FXQVOBV4FXwVLBU8FXwVPBWAFWgVMBVAFWgVQBWEFUQViBWMFUQVjBVIFYgVRBU0FYgVNBVsFZAVTBVQFZAVUBWUFYAVPBVUFYAVVBWYFYQVQBVYFYQVWBWcFaAU/BVIFaAVSBWMFaQVXBVgFaQVYBWoFZwVWBUIFZwVCBWsFbAU+BT8FbAU/BWgFbQVABUEFbQVBBW4FawVCBUMFawVDBW8FRAVZBW4FRAVuBUEFcAVFBT4FcAU+BWwFXAVGBUAFXAVABW0FcQVHBUgFcQVIBV0FcgVJBUoFcgVKBXMFbwVDBUsFbwVLBV8FWQV0BXUFWQV1BW4FdgVwBWwFdgVsBXcFeAVcBW0FeAVtBXkFegVxBV0FegVdBXsFfAVyBXMFfAVzBX0FfgVvBV8FfgVfBX8FdAVZBVoFdAVaBYAFgQVbBVwFgQVcBXgFewVdBV4FewVeBYIFfwVfBWAFfwVgBYMFgAVaBWEFgAVhBYQFYgWFBYYFYgWGBWMFhQViBVsFhQVbBYEFhwVkBWUFhwVlBYgFgwVgBWYFgwVmBYkFhAVhBWcFhAVnBYoFiwVoBWMFiwVjBYYFjAVpBWoFjAVqBY0FigVnBWsFigVrBY4FdwVsBWgFdwVoBYsFeQVtBW4FeQVuBXUFjgVrBW8FjgVvBX4FjwWKBY4FjwWOBZAFjgV+BZEFjgWRBZAFfgV/BZIFfgWSBZEFgwWJBZMFgwWTBZQFlQV2BXcFlQV3BZYFjAWNBZcFjAWXBZgFfAV9BZkFfAWZBZoFegV7BZsFegWbBZwFnQV0BYAFnQWABZ4FewWCBZ8FewWfBZsFeQWgBaEFeQWhBXgFkgV/BYMFkgWDBZQFdwWLBaIFdwWiBZYFhQWjBaQFhQWkBYYFiwWGBaQFiwWkBaIFpQWHBYgFpQWIBaYFhQWBBacFhQWnBaMFgQV4BaEFgQWhBacFeQV1BagFeQWoBaAFnQWoBXUFnQV1BXQFgAWEBakFgAWpBZ4FhAWKBY8FhAWPBakFjQV8BZoFjQWaBZcFcgV8BY0FcgWNBWoFSQVyBWoFSQVqBVgFWAU1BRAFWAUQBUkFjwWqBasFjwWrBakFowWsBa0FowWtBaQFpwWuBawFpwWsBaMFpQWvBbAFpQWwBZ8FmwWxBbIFmwWyBZwFoAWzBbQFoAW0BaEFkwW1BbYFkwW2BZQFngW3BbgFngW4BZ0FoQW0Ba4FoQWuBacFmAW5BbUFmAW1BZMFkAW6BaoFkAWqBY8FqQWrBbcFqQW3BZ4FqAW7BbMFqAWzBaAFogW8Bb0FogW9BZYFmQW+Bb8FmQW/BZoFkQXABboFkQW6BZAFlgW9BcEFlgXBBZUFpAWtBbwFpAW8BaIFnwWwBbEFnwWxBZsFkgXCBcAFkgXABZEFnQW4BbsFnQW7BagFmgW/BcMFmgXDBZcFlAW2BcIFlAXCBZIFuQXEBcUFuQXFBbUFugXGBccFugXHBaoFswXIBckFswXJBbQFvQXKBcsFvQXLBcEFvAXMBcoFvAXKBb0FvgXNBc4FvgXOBb8FwAXPBcYFwAXGBboFuAXQBdEFuAXRBbsFrQXSBcwFrQXMBbwFsAXTBdQFsAXUBbEFwgXVBc8FwgXPBcAFrAXWBdIFrAXSBa0FrgXXBdYFrgXWBawFvwXOBdgFvwXYBcMFtgXZBdUFtgXVBcIFqwXaBdsFqwXbBbcFtAXJBdcFtAXXBa4FrwXcBdMFrwXTBbAFsQXUBd0FsQXdBbIFtQXFBdkFtQXZBbYFtwXbBdAFtwXQBbgFqgXHBdoFqgXaBasFuwXRBcgFuwXIBbMFzAXeBd8FzAXfBcoFzQXgBeEFzQXhBc4FzwXiBeMFzwXjBcYF0AXkBeUF0AXlBdEF0gXmBd4F0gXeBcwF0wXnBegF0wXoBdQF1QXpBeIF1QXiBc8F1gXqBeYF1gXmBdIF1wXrBeoF1wXqBdYFzgXhBewFzgXsBdgF2QXtBekF2QXpBdUF2gXuBe8F2gXvBdsFyQXwBesFyQXrBdcF3AXxBecF3AXnBdMF1AXoBfIF1AXyBd0FxQXzBe0FxQXtBdkF2wXvBeQF2wXkBdAFxwX0Be4FxwXuBdoF0QXlBfUF0QX1BcgFxAX2BfMFxAXzBcUFxgXjBfQFxgX0BccFyAX1BfAFyAXwBckFygXfBfcFygX3BcsF+AX5BfoF+AX6BfsF/AX9Bf4F/AX+Bf8FAAYBBgIGAAYCBgMGBAYFBgYGBAYGBgcGCAYJBgoGCAYKBgsGBQYEBgwGBQYMBg0GCQYIBg4GCQYOBg8G+wX6BRAG+wUQBhEGEgYTBhQGEgYUBhUGBwYGBhYGBwYWBhcGGAYZBhoGGAYaBhsGHAYdBh4GHAYeBh8GAQYABhMGAQYTBhIGDwYOBiAGDwYgBiEGHwYeBiIGHwYiBiMGJAYlBhcGJAYXBhYGJgYnBh0GJgYdBhwG/QX8BfkF/QX5BfgFGQYYBhUGGQYVBhQGJQYkBigGJQYoBikGJwYmBiEGJwYhBiAGIwYiBioGIwYqBisGLAYtBi4GLAYuBi8G/wX+BSkG/wUpBigGAwYCBi0GAwYtBiwGEQYQBgsGEQYLBgoGKwYqBi8GKwYvBi4GGQbkBe8FGQbvBRoG8wX/BSgG8wUoBu0FDgboBecFDgbnBSAG8AUABgMG8AUDBusFGgbvBe4FGgbuBQ0G8QUnBiAG8QUgBucFJAbpBe0FJAbtBSgGCAbyBegFCAboBQ4G6wUDBiwG6wUsBuoF6gUsBi8G6gUvBuYF/AX2BewF/AXsBfkF6QUkBhYG6QUWBuIF+QXsBeEF+QXhBfoFKgbeBeYFKgbmBS8G5AUZBhQG5AUUBuUF8gUIBgsG8gULBjAGBgbjBeIFBgbiBRYG+gXhBeAF+gXgBRAGIgbfBd4FIgbeBSoGMQYyBsMDMQbDA8IDMwYLBM0DMwbNA88DDAQ0BmEEDARhBM4DNQYxBsIDNQbCA8wDzAPGA8kDzAPJAzUGxgOiAMoDxgPKA8kDNgbKA6IANgaiAKEAVgAlADcGVgA3BjgGOQY3BiUAOQYlACQAOgY5BiQAOgYkACgAyATbBP0EyAT9BM8E2wTaBP4E2wT+BP0EEQUQBTUFEQU1BTQFOwY8Bj0GOwY9Bj4GPAY/BkAGPAZABj0GPwZBBkIGPwZCBkAGQQZDBkQGQQZEBkIGQwZFBkYGQwZGBkQGPgY9BkcGPgZHBkgGPQZABkkGPQZJBkcGQAZCBkoGQAZKBkkGQgZEBksGQgZLBkoGRAZGBkwGRAZMBksGTQZOBk8GTQZPBlAGTgZRBlIGTgZSBk8GUQZTBlQGUQZUBlIGVQZWBlcGVQZXBlgGUAZPBlkGUAZZBloGTwZSBlsGTwZbBlkGXAZdBl4GXAZeBl8GXwZeBlgGXwZYBlcGUAZaBlYGUAZWBlUGXAZfBmAGXAZgBmEGYgb1A1ADYgZQA2MGZAZlBjwGZAY8BjsGZQZmBj8GZQY/BjwGZgZnBkEGZgZBBj8GZwZoBkMGZwZDBkEGaAZpBkUGaAZFBkMGagZrBmwGagZsBm0GXwZXBm4GXwZuBmAGbwZQBlUGbwZVBnAGcAZVBlgGcAZYBnEGcgZNBlAGcgZQBm8GcwZPA04DcwZOA3QGdQZHA08DdQZPA3MGdAZOA+MDdAbjA3YGdwY7Bj4GdwY+BngGeQYtAy4DeQYuA3oGewZsA3MDewZzA3wGfQaHBIwDfQaMA34GfwZkA2wDfwZsA3sGfgaMA4sDfgaLA4AGhwR9BoEGhwSBBoEDggZcA2QDggZkA38GgwYfAyADgwYgA4QGhQZ6A4EDhQaBA4EGhAYgA1wDhAZcA4IGfAZzA3oDfAZ6A4UGhgaEBoIGhgaCBocGiAaFBoEGiAaBBokGigaDBoQGigaEBoYGiwZ8BoUGiwaFBogGjAZ7BnwGjAZ8BosGjQZ/BnsGjQZ7BowGjgZ9Bn4GjgZ+Bo8GhwaCBn8GhwZ/Bo0GfQaOBokGfQaJBoEGjwZ+BoAGjwaABpAGkQaPBpAGkQaQBpIGkwaMBosGkwaLBpQGlAaLBogGlAaIBpUGlQaIBokGlQaJBpYGlwaKBoYGlwaGBpgGjgaZBpYGjgaWBokGmAaGBocGmAaHBpoGmQaOBo8GmQaPBpEGmgaHBo0GmgaNBpsGmwaNBowGmwaMBpMGnAZiBmMGnAZjBngGnQZzBnQGnQZ0Bp4GnwZ1BnMGnwZzBp0GngZ0BnYGngZ2BqAGLQN5BmMGLQNjBlADdwZ5BnoGdwZ6BqEGSAacBngGSAZ4Bj4GgwaKBqEGgwahBnoGOwZ3BqEGOwahBmQGbwaeBqAGbwagBnIGeQZ3BngGeQZ4BmMGcQafBp0GcQadBnAGcAadBp4GcAaeBm8GigaXBmQGigZkBqEGgwZ6Bi4DgwYuAx8DSAOiBqMGSAOjBtEDogakBqUGogalBqMGpAamBqcGpAanBqUGpgZeBl0GpgZdBqcGVwZWBqgGVwaoBm4GdQaiBkgDdQZIA0cDpAaiBnUGpAZ1Bp8GnwZxBqYGnwamBqQGcQZYBl4GcQZeBqYGVgZaBqkGVgapBqgGqgaRBpIGqgaSBqsGrAaYBpoGrAaaBq0GmQauBq8GmQavBpYGrQaaBpsGrQabBrAGrgaZBpEGrgaRBqoGsAabBpMGsAaTBrEGsQaTBpQGsQaUBrIGsgaUBpUGsgaVBrMGswaVBpYGswaWBq8GtAaXBpgGtAaYBqwGtQaxBrIGtQayBrYGtgayBrMGtgazBrcGtwazBq8GtwavBrgGuQa0BqwGuQasBroGuwaqBqsGuwarBrwGugasBq0GugatBr0Grga+BrgGrga4Bq8GvQatBrAGvQawBr8GvgauBqoGvgaqBrsGvwawBrEGvwaxBrUGwAbBBsIGwAbCBsMGwQbEBsUGwQbFBsIGxgbHBsEGxgbBBsAGxwbIBsQGxwbEBsEGyQbKBscGyQbHBsYGygbLBsgGygbIBscGzAbNBsoGzAbKBskGzQbOBssGzQbLBsoGzwbQBs0GzwbNBswG0AbRBs4G0AbOBs0G0gbTBtAG0gbQBs8G0wbUBtEG0wbRBtAGwwa1BrYGwwa2BsAGwAa2BrcGwAa3BsYGxga3BrgGxga4BskGvgbMBskGvgbJBrgGzAa+BrsGzAa7Bs8Gzwa7BrwGzwa8BtIGZgZlBrQGZga0BrkGZQZkBpcGZQaXBrQG1Qa5BroG1Qa6BtYG1ga6Br0G1ga9BtcG1wa9Br8G1wa/BtgG2QbVBtYG2QbWBtoG2gbWBtcG2gbXBtsG2wbXBtgG2wbYBtwG3QbZBtoG3QbaBt4G3gbaBtsG3gbbBt8G3wbbBtwG3wbcBuAG4AbcBuEG4AbhBuIG4gbhBuMG4gbjBuQG5QbdBt4G5QbeBuYG5gbeBt8G5gbfBucG5wbfBuAG5wbgBugG6AbgBuIG6AbiBukG6QbiBuQG6QbkBuoG6wbsBu0G6wbtBu4G7gbtBu8G7gbvBvAG8AbvBvEG8AbxBvIG8gbxBvMG8gbzBvQG9QbuBvAG9QbwBvYG9gbwBvIG9gbyBvcG5Ab4BvkG5Ab5BuoG7AblBuYG7AbmBu0G7QbmBucG7QbnBu8G7wbnBugG7wboBvEG8QboBukG8QbpBvMG8wbpBuoG8wbqBvoGRQZtBvsGRQb7BkYGaQZqBm0GaQZtBkUGZwZmBrkGZwa5BtUGaAZnBtUGaAbVBtkG2QbdBmkG2QZpBmgGagZpBt0GagbdBuUG5QbsBmsG5QZrBmoG7AbrBvwG7Ab8BmsG/Qb4BuQG/QbkBuMG/gb/BvUD/gb1A2IG/wYAB/QD/wb0A/UDAAcBB/IDAAfyA/QDAQcCB/MDAQfzA/IDAgcDB50EAgedBPMDAwcEB+4DAwfuA50EBAcFB+8DBAfvA+4DBgcHB+oDBgfqA+kDBgcIB1YDBgdWA/4DCQcIB9wDCQfcA9oDCQcKB+wDCQfsA1cDCwcKB9sDCwfbA5gEGQEcAWMBGQFjAWIBDAdjARwBDAccAS0BDQcOBwgDDQcIA6YBDwcNB6YBDwemAY0BEAcRB4wBEAeMAcgBEgcQB8gBEgfIAccBEwcSB8cBEwfHAdkBEwcUB8IBEwfCAb8BFQcUB9oBFQfaAcwBFgcVB8wBFgfMAcsBFwcWB8sBFwfLATMCGAcZB1oCGAdaAlkCGgcZB0sCGgdLAmUCGwcaB2UCGwdlAncCGwccB4wCGweMAm8CHAcdB6YCHAemAowCHgcdB5wCHgecArICHwceB7ICHweyAscCHwcgB90CHwfdAr8CIAchB+UCIAflAt0CIQciB/cCIQf3AuUCIwciB+sCIwfrAv8CJAclB+QCJAfkAvYCJQcmB9wCJQfcAuQCJwcmB9YCJwfWAskCJwcoB6kCJwepAr4CKQcoB7QCKQe0Ap8CKgcpB58CKgefAoACKgcrB24CKgduAosCKwcsB1wCKwdcAm4CLQcsB2cCLQdnAlICLgctB1ICLgdSAlECLwcwB8QBLwfEASsCMQcwB9MBMQfTAdIBMgcxB9IBMgfSAdEBMwcyB9EBMwfRAdABMwc0B7oBMwe6Ab4BNQc0B88BNQfPAc4BNQc2B9cBNQfXAbsBNwc4BwcDNwcHA9QBOAc5BwQDOAcEAwcDZwE6BwwHZwEMBy0BZwFoATsHZwE7BzoHPAf+BmIGPAdiBpwGPAc9B3IGPAdyBqAGPgc9B0gGPgdIBkcGPwc+B0cGPwdHBkkGQAc/B0kGQAdJBkoGQQdAB0oGQQdKBksGdgbjA/8Gdgb/Bv4G4wPiAwAH4wMAB/8G4gPkAwEH4gMBBwAH5ANLAwIH5AMCBwEHSwNKAwMHSwMDBwIHSgPeAwQHSgMEBwMH3gPdAwUH3gMFBwQH/gP/AwcH/gMHBwYH6QPcAwgH6QMIBwYHVwNWAwgHVwMIBwkH2gPbAwoH2gMKBwkHQgdDB2YBQgdmATUBRAc7B2gBRAdoAWsBRAdrAWoBRAdqAUUHBgMFAw4HBgMOBw0H1QEGAw0H1QENBw8HvAHWAREHvAERBxAHvQG8ARAHvQEQBxIHvwG9ARIHvwESBxMH2QHaARQH2QEUBxMHwwHCARQHwwEUBxUHxQHDARUHxQEVBxYHLALFARYHLAIWBxcHTAJLAhkHTAIZBxgHXQJaAhkHXQIZBxoHbwJdAhoHbwIaBxsHdwKUAhwHdwIcBxsHlAKcAh0HlAIdBxwHqgKmAh0HqgIdBx4HvwKqAh4HvwIeBx8HxwLTAiAHxwIgBx8H0wLqAiEH0wIhByAH6gLrAiIH6gIiByEHRgdHByIHRgciByMH8gLfAiUH8gIlByQH3wLWAiYH3wImByUHvgLcAiYHvgImBycHyQK0AigHyQIoBycHpQKpAigHpQIoBykHiwKlAikHiwIpByoHgAJ5AisHgAIrByoHeQJnAiwHeQIsBysHVwJcAiwHVwIsBy0HWAJXAi0HWAItBy4HMALTATAHMAIwBy8HwAHEATAHwAEwBzEHwQHAATEHwQExBzIHvgHBATIHvgEyBzMH0AHPATQH0AE0BzMHuwG6ATQHuwE0BzUHzgGpATYHzgE2BzUHhgGFATgHhgE4BzcHhQFIBzkHhQE5BzgHSQdFB2oBSQdqAW0BSgdLB0wHSgdMB00HSwdOB08HSwdPB0wHTgdQB1EHTgdRB08HUgdTB1QHUgdUB1UHUwdWB1cHUwdXB1QHVgdYB1kHVgdZB1cHWAdaB1sHWAdbB1kHWgdcB10HWgddB1sHXAdeB18HXAdfB10HoAZ2Bv4GoAb+BjwHnAZIBj0HnAY9BzwHTQZyBj0HTQY9Bz4HTgZNBj4HTgY+Bz8HUQZOBj8HUQY/B0AHUwZRBkAHUwZAB0EHSwZMBmAHSwZgB0EHxAZhB2IHxAZiB8UGyAZjB2EHyAZhB8QGywZkB2MHywZjB8gGzgZlB2QHzgZkB8sG0QZmB2UH0QZlB84G1AZnB2YH1AZmB9EG/QZoB2kH/QZpB/gGvwa1BsMGvwbDBtgG2AbDBuEG2AbhBtwGwwbCBuMGwwbjBuEGwgbFBv0Gwgb9BuMGaAf9BsUGaAfFBmIHBQAAAAMABQADAAYAswQBAAAAswQAAAgAsQSzBAgAsQQIAA0ArwSxBA0ArwQNABAAqwSvBBAAqwQQABMArASrBBMArAQTABYA1QSsBBYA1QQWABkA0QTVBBkA0QQZABwA0gTRBBwA0gQcAB8AzQTSBB8AzQQfACIAygTJBCgAygQoACcAwQTGBCoAwQQqACkAwgTBBCkAwgQpAC8AvQTCBC8AvQQvADIAOAAGAAMAOAADADUAOgA4ADUAOgA1ADsAPgA6ADsAPgA7AD8AQgA+AD8AQgA/AEMASABHAEoASABKAEkATgBIAEkATgBJAE8AUgBOAE8AUgBPAFMARwBCAEMARwBDAEoAzgQ6BigAzgQoAMkEuABnAGgAuABoALIAqwBiAGMAqwBjAGwAnABYAFkAnABZAFwAoABVAFYAoABWAKEAawBkAGUAawBlAK8AdwBuAG8AdwBvAHkAeQBvAHAAeQBwAHsADwAMAGQADwBkAGMApABgAGEApABhAKUAPQBBAHEAPQBxAGoAqQBfAGAAqQBgAKQAoQBWADgGoQA4BjYGxANdAF4AxANeAKgAcgBtAG4AcgBuAHcArwBlAGYArwBmALUAtQBmAGcAtQBnALgAQQBGAG0AQQBtAHEAswBpAGoAswBqAHQApQBhAGIApQBiAKsALgAtAFoALgBaAFkAsgBoAGkAsgBpALMAngBXAFgAngBYAJwAqABeAF8AqABfAKkAOQYgACEAOQYhADcGagdJB20BagdtAWwBMAFrB2oHMAFqB2wBbAdtB24HbAduB28HcAdxB3IHcAdyB3MHdAd1B3YHdAd2B3cHeAd5B3EHeAdxB3AHdAd3BywBdAcsASsBNwE2AUUHNwFFB0kHegd7B3UHegd1B3QHegd0BysBegcrASoBbwduB3kHbwd5B3gHNwF8B24BNwFuATgBfQd+B38HfQd/B4AHXQdfB4EHXQeBB4IHWwddB4IHWweCB4MHWQdbB4MHWQeDB4QHhAeFB1cHhAdXB1kHSgFOAeoBSgHqAekBhgfqAU4BhgdOAU0BhweIB24BhwduAXwHRQFKAXMBRQFzAUcBPwFFAUcBPwFHAUIBNAE/AUIBNAFCATsBOwE6ATUBOwE1ATQBNQE6AYkHNQGJB0IHLQEnAR4BLQEeAWcBhAGKB0gHhAFIB4UBOgE9AWQBOgFkAYkHZQFkAT0BZQE9AUEBOgYiACAAOgYgADkGiwcyADMAiwczAIwHjAczADQAjAc0AI0HjgeNBzQAjgc0AFcAOAY3BiEAOAYhAF0AjweQB54AjweeAJ0AMQY1BuQAMQbkAOMAMgYxBuMAMgbjAAUBaQEhASIBaQEiATEBMQEiASUBMQElAS4BhQeRB1QHhQdUB1cHLwGSB2sHLwFrBzABHQEhAWsBHQFrAWgBMwatA64DMwauAwsENgbEA8UDNgbFA8oD0gDIA8UD0gDFA6cAyQPIA+QAyQPkADUGkwdsB28HkwdvB30HDAQLBK4DDASuAwcEmwCaAIAHmwCAB38HwwTCBL0EwwS9BLwE0wTSBM0E0wTNBMwE6gTpBPIE6gTyBPEE9gT1BPwE9gT8BPsEHwUeBSkFHwUpBSgFLQUsBTMFLQUzBTIFTgUfBSgFTgUoBVMFVQUtBTIFVQUyBVcFXgVOBVMFXgVTBWQFZgVVBVcFZgVXBWkFggVeBWQFggVkBYcFiQVmBWkFiQVpBYwFiQWMBZgFiQWYBZMFnwWCBYcFnwWHBaUFpgWUB68FpgWvBaUFlwXDBbkFlwW5BZgFwwXYBcQFwwXEBbkFlAeVB9wFlAfcBa8FlQeWB/EFlQfxBdwF2AXsBfYF2AX2BcQFHgb3Bd8FHgbfBSIGAAbwBfUFAAb1BRMGBQb0BeMFBQbjBQYG9gX8Bf8F9gX/BfMFEAbgBTAGEAYwBgsGHQaWB/cFHQb3BR4GJwbxBZYHJwaWBx0GkQeXB1UHkQdVB1QHzgTNBCIAzgQiADoGvgS9BDIAvgQyAIsHNgY4Bl0ANgZdAMQDkAeOB1cAkAdXAJ4AmAeZB40EmAeNBAIDmgeTB30Hmgd9B4AHmwc2ATkBmwc5AWEBJwEmAR8BJwEfAR4BYQFmAUMHYQFDB5sHrAFzAUoBrAFKAekBnAedB0oHnAdKB00Hhwd8B2oHhwdqB2sHcwGsAYMBcwGDAXQBAgMDA54HAgOeB5gHaweSB58HawefB4cHoAeeBwMDoAcDAwoDCgMJA6EHCgOhB6AHogehBwkDogcJAwgDiQdkAWMBiQdjAQwHQgeJBwwHQgcMBzoHOgc7B0MHOgdDB0IHmwdDBzsHmwc7B0QHRAdFBzYBRAc2AZsHowekBy8BowcvAS4BfAc3AUkHfAdJB2oHpQeiBwgDpQcIAw4HDgcFA6YHDgemB6UHpwemBwUDpwcFAwQDqAenBwQDqAcEAzkHOQdIB6kHOQepB6gHSAeKB6oHSAeqB6kHkgdvAXIBkgdyAZ8HqwesB60HqwetB64HkgcvAaQHkgekB28BlgRzB4sAlgSLAIYAUQdVB5cHUQeXB68HrwewB08HrwdPB1EHlQRwB3MHlQRzB5YEsAexB0wHsAdMB08HsQeyB00HsQdNB0wHfgd4B3AHfgdwB5UEswe0B7UHswe1B7YHTQeyB7cHTQe3B5wHuAe5B5wHuAecB7cHuQe4B7oHuQe6B7sHuwe6B7wHuwe8B70Hswe+B70Hswe9B7wHvwe+B7MHvwezB7YHCwfAB+wDCwfsAwoHwQfCB8MHwQfDB8QHlQCPAHUHlQB1B3sHjwCOAHYHjwB2B3UHxQfGB8cHxQfHB8gHyQd2B44AyQeOAHIHygfLB8wHygfMB8EHxgfNB84HxgfOB8cHzwfQB9EHzwfRB9IH0wfUB8sH0wfLB8oH0gfRB9QH0gfUB9MH1QfNB9YH1QfWB9cH2AfZB9oH2AfaB8wH1QfXB9AH1QfQB88HywfbB9gHywfYB8wH1AfcB9sH1AfbB8sH3QfeB74H3Qe+B78HvAffB7QHvAe0B7MH3gfgB70H3ge9B74H4AfhB7sH4Ae7B70H4gfJB3IH4gdyB3EHcQd5B+MHcQfjB+IH4QfkB7kH4Qe5B7sH5AedB5wH5AecB7kH5QfmB+cH5QfnB+gH5gfpB+oH5gfqB+cHAAEBAQkBAAEJAesH/wAAAesH/wDrB+wHBQH/AOwHBQHsB+0H7QfuBzIG7QcyBgUB7gfvB8MD7gfDAzIG7wfwB8AD7wfAA8MD8QflB+gH8QfoB/IHUwTzB/QHUwT0B1QEAAP1B/MHAAPzB1ME+wD2B/cH+wD3B/0A+AAQAfgH+AD4B/kA+QD4B/YH+QD2B/sA/QD3B/UH/QD1BwAD6gfpB/kH6gf5B/oH+gf5B/sH+gf7BwsBCwH7BxEBCwERAQwB8gf8B98H8gffB/EH/Af9B7QH/Ae0B98H/Qf+B7UH/Qe1B7QHmQCaB4AHmQCAB5oAtge1B/8Htgf/BwAIzAfaB8IHzAfCB8EHAQgCCMYHAQjGB8UHAwjKB8EHAwjBB8QHAgjWB80HAgjNB8YHBAjPB9IHBAjSBwUIBgjTB8oHBgjKBwMIBQjSB9MHBQjTBwYIBwjOB80HBwjNB9UHBwjVB88HBwjPBwQI0QcICNwH0QfcB9QHCQjjB3kHCQh5B24HCggJCG4HCghuB20HCwhwAQoICwgKCG0HCwgMCHEBCwhxAXABxQfIBw0IxQcNCA4I0AcPCAgI0AcICNEH1wcQCA8I1wcPCNAH1wfWBxEI1wcRCBAInAQSCNkHnATZB9gH1gcCCBMI1gcTCBEIFAjABxEIFAgRCBMI/we1B/4H/wf+BxUIWAP6APwAWAP8AEoESgT8AP4ASgT+AFYEEwEKAQ0BEwENAQ8B+AD3AA0B+AANAQwB+gcLAQoB+gcKARIBVgT+AAEDVgQBA6QE6AfnB6QD6AekA6MD5wfqB6cD5wenA6QD8gfoB6MD8gejA60D6gf6BxIB6gcSAacDFQj+B7gDFQi4A7cD/gf9B88D/gfPA7gDfgRSBFUEfgRVBH8EpAQBA1IEpARSBH4E/AczBs8D/AfPA/0H/AfyB60D/AetAzMGtwMRAxADtwMQA+0DDwiYBJkEDwiZBAgImwB/B5QEmwCUBJ0AnQCUBJcEnQCXBI8Hbwd4B34Hbwd+B30HjgCLAHMHjgBzB3IHvwe2BwAIvwcACBYIrQesBw4IrQcOCA0IcAFvAaQHcAGkBwoIqQcNCMgHqQfIB6gHyAfHB6cHyAenB6gHCQgKCKQHCQikB6MHowcXCOMHowfjBwkIxwfOB6YHxwemB6cHzgcHCKUHzgelB6YHJQEXCKMHJQGjBy4BBwgECKIHBwiiB6UHFwgYCOIHFwjiB+MHoQeiBwQIoQcECAUIJQEkARgIJQEYCBcIGQgYCCQBGQgkASMBdwcZCCMBdwcjASwBGQjJB+IHGQjiBxgIyQcZCHcHyQd3B3YHoAehBwUIoAcFCAYIngegBwYIngcGCAMIAwjEB5gHAwiYB54HxAfDB5kHxAeZB5gHrgetB6oHrgeqBxoIVQdRB1AHVQdQB1IHGQQbCBwIGQQcCB0IHggfCB0IHggdCBIEHQQgCB8IHQQfCB4IIQgaBCAIIQggCCIIIwghCCIIIwgiCCQIJQgjCCQIJQgkCCYIJwglCCYIJwgmCCgIdwQnCCgIdwQoCCkIZAQqCCsIZAQrCCkIIgggCB0EIggdBBwEHQgcCBMEHQgTBBIEKAgmCB8EKAgfBCAEKQgoCCAEKQggBGQEIgQeCBIEIgQSBBUEJAgiCBwEJAgcBB4EJggkCB4EJggeBB8EvwMdBB4IvwMeCCIEEQRjBCoIEQQqCGQEqgetBw0IqgcNCKkHLAgtCC4ILAguCC8IxQcOCCwIxQcsCAEILQgsCA4ILQgOCKwHqwcwCC0IqwctCKwHLAgvCDEILAgxCAEIMQgTCAIIMQgCCAEICAiZBJoECAiaBNwH3AeaBJsE3AebBNsH2webBJwE2wecBNgHEAgLB5gEEAiYBA8IEAgRCMAHEAjABwsH0gOTBBII0gMSCJwE7QPsA8AH7QPABxQIFggACDIIFggyCDMINAg1CDYINAg2CDcIFAgTCDEIFAgxCDgINQhsBzkINQg5CDYIFAg4CP8HFAj/BxUICwg1CDQICwg0CAwIbAc1CAsIbAcLCG0HOAgyCAAIOAgACP8H7QMUCBUI7QMVCLcDLwgyCDgILwg4CDEIfwd+B5UEfweVBJQEMggvCC4IMgguCDMINwg2CMADNwjAA/AHwQPAAzYIwQM2CDkIOQg6CMsDOQjLA8EDOgg7CMcDOgjHA8sDnwDHAzsInwA7CDwIPAg9CKAAPAigAJ8AVQCgAD0IVQA9CD4IPgg/CCYAPggmAFUAIwAmAD8IIwA/CEAIJwAjAEAIJwBACEEIugfxB98HugffB7wHuge4B+UHugflB/EHuAe3B+YHuAfmB+UH6QfmB7cH6Qe3B7IH+QfpB7IH+QeyB7EH+wf5B7EH+wexB7AHEQH7B7AHEQGwB68HEwb1BeUFEwblBRQG4AXNBUII4AVCCDAGzQW+BUMIzQVDCEIIRAhDCL4FRAi+BZkFRQhECJkFRQiZBX0FfQVzBUYIfQVGCEUIcwVKBUcIcwVHCEYISgUTBUgISgVICEcIEwUSBUkIEwVJCEgI3QTcBEoI3QRKCEsITAhKCNwETAjcBMsEQQhNCMoEQQjKBCcArweXBxABrwcQAREB+AcQAZcH+AeXB5EH9gf4B5EH9geRB4UH9wf2B4UH9weFB4QHhAeDB/UHhAf1B/cHgweCB/MHgwfzB/UHggeBB/QHggf0B/MH9AUFBg0G9AUNBu4FMAZCCN0FMAbdBfIFywX3BZYHywWWB5UHOgg5CGwHOghsB5MHkweaBzsIkwc7CDoIPAg7CJoHPAiaB5kAmQBbAD0ImQA9CDwIlwSWBIYAlwSGAIUAjweXBIUAjweFAHwAkAePB3wAkAd8AHsAGwYaBg0GGwYNBgwGGAYbBhIGGAYSBhUGGwYMBgEGGwYBBhIGDAYEBgIGDAYCBgEGBAYHBi0GBAYtBgIGBwYXBi4GBwYuBi0GKwYuBhcGKwYXBiUGJQYpBiMGJQYjBisGHwYjBikGHwYpBv4FHAYfBv4FHAb+Bf0FJgYcBv0FJgb9BfgF+AX7BSEG+AUhBiYG+wURBg8G+wUPBiEGCQYPBhEGCQYRBgoGQghDCLIFQgiyBd0FnAWyBUMInAVDCEQIRAhFCHoFRAh6BZwFcQV6BUUIcQVFCEYIRghHCEcFRghHBXEFRwhICAwFRwgMBUcFDQUMBUgIDQVICEkI1wTWBEsI1wRLCEoIxQTXBEoIxQRKCEwIKgDGBE0IKgBNCEEIQQhACCsAQQgrACoAQAg/CC0AQAgtACsAWgAtAD8IWgA/CD4IPgg9CFsAPghbAFoAjgeQB3sAjgd7AHAAcABRAI0HcACNB44HjAeNB1EAjAdRAFIAiweMB1IAiwdSAFMAUwBUAL4EUwC+BIsHtQQHBfMEtQTzBL8E9ATzBAcF9AQHBQYFKwUqBT0FKwU9BTwFPAVFBVQFPAVUBSsFZQVUBUUFZQVFBXAFcAV2BYgFcAWIBWUFdgWVBaYFdgWmBYgFlAemBZUFlAeVBcEFwQXLBZUHwQWVB5QHFghOCN0HFgjdB78HLQgwCE8ILQhPCC4IMwguCE8IMwhPCFAIMwhQCE4IMwhOCBYIGgiqB4oHGgiKB1EIUghRCIoHUgiKB4QBUwiHAaoBUwiqAa8B3wGRAZAB3wGQAdwBBwMGA9UBBwPVAdQBqwHoAd0BqwHdAdwB3gHdAVQI3gFUCAoC7QFVCFII7QFSCFMIHQIQAhoCHQIaAhkCiwGKARoCiwEaAhACHQIZAowEHQKMBNsCEQcPB40BEQeNAYwBNgc3B9QBNgfUAdcB1gHVAQ8H1gEPBxEHqQGGATcHqQE3BzYHUgiEAYcBUgiHAVMItAG3AVYItAFWCOYBtQG0AeYBtQHmAeUB5QHiAbEB5QGxAbUBrgGxAeIBrgHiAeEBrwGuAeEBrwHhAe4BUwivAe4BUwjuAe0BGghRCIgHGgiIB4cHUghVCIgHUgiIB1EIhwefB64HhweuBxoInwdyAasHnwerB64HcgFxATAIcgEwCKsHcQEMCE8IcQFPCDAIDAg0CFAIDAhQCE8ITghQCDQITgg0CDcINwjwB90HNwjdB04IjwGSAZMBjwGTAZAB3AGQAZMB3AGTAasB3QHoAesB3QHrAVQIrAHpAegBrAHoAasBVghXCCYCVggmAgQC8QHkAecB8QHnAfIBWAjsAVQIWAhUCOsB9gHjAeQB9gHkAfEBCgLvAeABCgLgAfUBVAjsAe8BVAjvAQoC9QHgAeMB9QHjAfYBVggEAucBVgjnAeYBVwhZCDsCVwg7AiYCWghbCEgCWghIAkcCWwhcCGMCWwhjAkgCXAhdCHUCXAh1AmMCXQheCJMCXQiTAnUCXghfCJoCXgiaApMCXwhgCLACXwiwApoCYAhhCMUCYAjFArACYQhiCNECYQjRAsUCYgj0AukCYgjpAtEC9AL1AvwC9AL8AukCVQjtAewBVQjsAVgIiAeGB00BiAdNAW4BiAdVCFgIiAdYCIYH6wHqAYYH6wGGB1gI7ALuAmMI7AJjCP4C7gLtAmQI7gJkCGMI/QL4AvsC/QL7AvoC7QLwAmUI7QJlCGQI8ALvAmYI8AJmCGUI1wLgAvQC1wL0AmIIYghhCMoCYgjKAtcCYQhgCLUCYQi1AsoCYAhfCKACYAigArUCXwheCIECXwiBAqACegKBAl4IegJeCF0IXQhcCGgCXQhoAnoCXAhbCFMCXAhTAmgCWwhaCFQCWwhUAlMCWQhXCLkBWQi5ATwCtwG5AVcItwFXCFYI3gfdB/AH3gfwB+8H4AfeB+8H4AfvB+4H4QfgB+4H4QfuB+0H5AfhB+0H5AftB+wHnQfkB+wHnQfsB+sHSgedB+sHSgfrBwkBCQEIAUsHCQFLB0oHCAEGAU4HCAFOB0sHBgEHAVAHBgFQB04HUgdQBwcBUgcHAfEA8QDyAFMH8QBTB1IH8gDvAFYH8gBWB1MH7wDwAFgH7wBYB1YH8AD0AFoH8ABaB1gH9AD1AFwH9ABcB1oH9QD2AF4H9QBeB1wHEAQPBD4EEAQ+BDwENwRBBA4ENwQOBA0EOQRCBEMEOQRDBDoEMgRABEEEMgRBBDcEaARpBD8EaAQ/BDEEiQSDBEIEiQRCBDkEPAQ+BIMEPASDBIkEBQQDBGkEBQRpBGcIaQRoBKIEaQSiBGcIegQuBLADegSwA68DeQRlBC4EeQQuBHoEWgRoCGkIWgRpCE4EaghsBFwEaghcBGsIrANsCGsIrANrCFwEbAhtCG4IbAhuCGsIaAhvCHAIaAhwCGkIcQhqCGsIcQhrCG4IbQhyCHMIbQhzCG4Ibwh0CHUIbwh1CHAIdghxCG4IdghuCHMIKgh3CHgIKgh4CCsIeAR5CHoIeAR6CHkEYgR7CHwIYgR8CGMEdwgqCGMEdwhjBHwIYgRhBDQGYgQ0BnsInwRlBHkEnwR5BHoIqAMUAXAIqANwCHUIaQhwCBQBaQgUARMBcghtCH0Icgh9CH4IrAOrA38IrAN/CGwIfwh9CG0IfwhtCGwIEwEPAU4EEwFOBGkIpQOoA3UIpQN1CIAICASmA6UDCASlA4AIgQgGBAUEgQgFBIIIgwigBJ8EgwifBIQIhQgHBAgEhQgIBIYIhwiICIkIhwiJCIoIiwg0BgwEiwgMBIwIjQh3CHwIjQh8CI4IjwiQCJEIjwiRCJIIkwiUCJUIkwiVCJYIlwh2CHMIlwhzCJgIhggIBIAIhgiACJkImgibCJwImgicCJ0IngifCKAIngigCKEInQicCKIInQiiCKMIhAifBHoIhAh6CKQIoQigCKUIoQilCKYIpwioCJAIpwiQCI8IqQiqCIgIqQiICIcIgggFBGcIgghnCKsIrAitCK4IrAiuCK8IsAixCLIIsAiyCLMItAi1CKIItAiiCLYItwifCK4ItwiuCLgIuQi6CJEIuQiRCLsIlAi8CL0IlAi9CJUInAi+CLYInAi2CKIIvwitCLoIvwi6CLkIqgjACMEIqgjBCIgInwi3CMIInwjCCKAIqAjDCMQIqAjECJAIxQjGCIkIxQiJCMcIyAjJCMoIyAjKCMsIywjKCLIIywiyCMwIoAjCCM0IoAjNCKUIiAjBCMcIiAjHCIkIrQi/CLgIrQi4CK4ImwjOCL4Imwi+CJwIsQjPCMwIsQjMCLII0AjRCMYI0AjGCMUIkAjECLsIkAi7CJEIvAiUCKUIvAilCM0IzgjSCNMIzgjTCL4IzwjUCNUIzwjVCMwI1gjQCMUI1gjFCNcIxAjYCNkIxAjZCLsI2gi8CM0I2gjNCNsI3Ai0CLYI3Ai2CN0I3gi3CLgI3gi4CN8I4Ai5CLsI4Ai7CNkIvAjaCOEIvAjhCL0IvgjTCN0IvgjdCLYI4gi/CLkI4gi5COAIwAjjCOQIwAjkCMEItwjeCOUItwjlCMIIwwjmCNgIwwjYCMQI1wjFCMcI1wjHCOcI6AjICMsI6AjLCOkI6QjLCMwI6QjMCNUIwgjlCNsIwgjbCM0IwQjkCOcIwQjnCMcIvwjiCN8IvwjfCLgI6gjrCOwI6gjsCO0I7gjvCPAI7gjwCPEI8gjzCPQI8gj0CPUI9gj3CPgI9gj4CPkI+gj7CPwI+gj8CP0I/gj/CAAJ/ggACQEJ7QjsCAIJ7QgCCQMJBAkFCQYJBAkGCQcJ/Qj8CAgJ/QgICQkJCgkLCfMICgnzCPIIDAkNCe8IDAnvCO4IDgkPCQIJDgkCCRAJEQn3CA8JEQkPCQ4JEgkTCfQIEgn0CBQJFQkWCRcJFQkXCRgJGAkXCQAJGAkACRkJGgkbCRMJGgkTCRIJHAkFCfAIHAnwCB0JHgkfCQgJHgkICSAJIQkNCfgIIQn4CCIJIwkkCSUJIwklCSYJJwkoCSkJJwkpCSoJKwksCS0JKwktCS4JJAkjCS8JJAkvCTAJMQkyCTMJMQkzCTQJNQk2CTcJNQk3CTgJOQk6CTsJOQk7CTwJJgklCT0JJgk9CT4JOAk3CS4JOAkuCS0JPwlACUEJPwlBCUIJQwlECToJQwk6CTkJRQlGCUcJRQlHCUgJMgkxCTwJMgk8CTsJOglJCUoJOglKCTsJRAlLCUkJRAlJCToJLAlMCU0JLAlNCS0JTgknCSoJTgkqCU8JJwlOCVAJJwlQCVEJUgkjCSYJUgkmCVMJVAk1CTgJVAk4CVUJQAlWCVcJQAlXCUEJWAlICVkJWAlZCVoJWwlcCTMJWwkzCV0JQQlXCV4JQQleCV8JIwlSCWAJIwlgCS8JUQlQCVoJUQlaCVkJXAlbCWEJXAlhCT4JTwkqCV8JTwlfCV4JYgljCUwJYglMCSwJZAkyCTsJZAk7CUoJZQlFCUgJZQlICVgJ+gj9CNMI+gjTCNII/QgJCd0I/QjdCNMI3AjdCAkJ3AgJCWYJ5gjcCGYJ5ghmCeoI6gjtCNgI6gjYCOYI7QgDCdkI7QjZCNgI4AjZCAMJ4AgDCWcJHwgWBBkEHwgZBB0IIAgaBBYEIAgWBB8IagRYBFkEagRZBGsEagRsBFoEagRaBFgEawRZBF8EawRfBG4EhARvBHIEhARyBIUEKQgrCHgEKQh4BHcESwRXBIoESwSKBF8EcARvBKUEcASlBKMEowSlBIoEowSKBFcEGARtBBsIGAQbCBkEUQQbBBoEUQQaBCEItgNRBCEItgMhCCMIsgO2AyMIsgMjCCUIrwOyAyUIrwMlCCcIegSvAycIegQnCHcEbARqCGgIbARoCFoEaghxCG8IaghvCGgIcQh2CHQIcQh0CG8IKwh4CHkIKwh5CHgEaAm1CKgIaAmoCKcIlgiVCLEIlgixCLAItQi0CMMItQjDCKgIlQi9CM8IlQjPCLEIvQjhCNQIvQjUCM8ItAjcCOYItAjmCMMIZgkfCesIZgnrCOoIBwkGCf8IBwn/CP4IVglACS8JVgkvCWAJVQk4CS0JVQktCU0JUwkmCT4JUwk+CWEJMglkCV0JMgldCTMJ4gjgCGcJ4ghnCfYI9gj5CN8I9gjfCOIIHAlpCWoJHAlqCWsJbAltCW4JbAluCSAJbwlwCXEJbwlxCXIJIQlzCXQJIQl0CXUJdgl3CXgJdgl4CXkJdQl0CXoJdQl6CR0JcglxCXsJcgl7CRQJEQl8CX0JEQl9CSIJfgl/CW0JfgltCWwJgAmBCYIJgAmCCRkJeQl4CYMJeQmDCRAJHgmECXcJHgl3CXYJawlqCYEJawmBCYAJDQkMCfkIDQn5CPgI3gjfCPkI3gj5CAwJDAnuCOUIDAnlCN4I7gjxCNsI7gjbCOUI2gjbCPEI2gjxCAQJBAkHCeEIBAnhCNoIFwmFCQEJFwkBCQAJ1AjhCAcJ1AgHCf4ISAlHCYYJSAmGCVkJQglBCV8JQglfCYcJBQkECfEIBQnxCPAIiAliCSwJiAksCSsJ9wj2CGcJ9whnCQ8JFgmJCYUJFgmFCRcJ/ggBCdUI/gjVCNQIEwmKCfUIEwn1CPQI6QjVCAEJ6QgBCYUJHwlmCQkJHwkJCQgJDwlnCQMJDwkDCQIJ6AjpCIUJ6AiFCYkJGwmLCYoJGwmKCRMJCgnyCOQICgnkCOMI8gj1COcI8gjnCOQI1wjnCPUI1wj1CIoJ1gjXCIoJ1giKCYsJXAmMCTQJXAk0CTMJKAknCVEJKAlRCY0JjQlRCVkJjQlZCYYJQAk/CTAJQAkwCS8JjQmGCY4JjQmOCY8JKgkpCYcJKgmHCV8JKAmNCY8JKAmPCZAJkAmRCSkJkAkpCSgJkQmSCYcJkQmHCSkJQgmHCZIJQgmSCZMJPwlCCZMJPwmTCZQJlAmVCTAJlAkwCT8JJAkwCZUJJAmVCZYJlgmXCSUJlgklCSQJlwmYCT0Jlwk9CSUJjAk9CZgJjAmYCZkJjAlcCT4JjAk+CT0JmQmaCTQJmQk0CYwJMQk0CZoJMQmaCZsJmwmcCTwJmwk8CTEJOQk8CZwJOQmcCZ0JQwk5CZ0JQwmdCZ4JnwmgCTcJnwk3CTYJoAmhCS4JoAkuCTcJKwkuCaEJKwmhCaIJiAkrCaIJiAmiCaMJpAmlCUcJpAlHCUYJpQmOCYYJpQmGCUcJpgmnCZwJpgmcCZsJqAmpCY4JqAmOCaUJYwllCX8JYwl/CaoJqwmmCZsJqwmbCZoJrAmrCZoJrAmaCZkJYwliCUUJYwlFCWUJrQmpCa4JrQmuCa8JsAmxCa4JsAmuCbIJpAlGCYgJpAmICaMJswmtCa8JswmvCbQJtQmzCbQJtQm0CbYJtwmVCZQJtwmUCbYJtAmvCbgJtAm4CbkJYgmICUYJYglGCUUJrwmuCbEJrwmxCbgJuQm4CboJuQm6CbsJsgmuCakJsgmpCagJjwmOCakJjwmpCa0JkAmPCa0JkAmtCbMJkQmQCbMJkQmzCbUJugm8CacJugmnCaYJvQm8CbEJvQmxCbAJtgm0CbkJtgm5CbcJowmiCbIJowmyCagJogmhCbAJogmwCbIJuAmxCbwJuAm8CboJtQmTCZIJtQmSCZEJngmdCb4Jngm+CZ8JvQmwCaEJvQmhCaAJvgmnCbwJvgm8Cb0Jtwm5CbsJtwm7Cb8JnQmcCacJnQmnCb4Jvwm7CasJvwmrCawJuwm6CaYJuwmmCasJvwmWCZUJvwmVCbcJtgmUCZMJtgmTCbUJmQmYCZcJmQmXCawJrAmXCZYJrAmWCb8JwAkOCRAJwAkQCYMJfAkRCQ4JfAkOCcAJwQkSCRQJwQkUCXsJwgkVCRgJwgkYCcMJwwkYCRkJwwkZCYIJqgkaCRIJqgkSCcEJaQkcCR0JaQkdCXoJhAkeCSAJhAkgCW4JcwkhCSIJcwkiCX0JBQkcCWsJBQlrCQYJ/AhsCSAJ/AggCQgJCwlvCXIJCwlyCfMIDQkhCXUJDQl1Ce8I6wh2CXkJ6wh5CewI7wh1CR0J7wgdCfAI8whyCRQJ8wgUCfQI9wgRCSIJ9wgiCfgI+wh+CWwJ+whsCfwI/wiACRkJ/wgZCQAJ7Ah5CRAJ7AgQCQIJHwkeCXYJHwl2CesIBglrCYAJBgmACf8IhAluCVoJhAlaCVAJdwmECVAJdwlQCU4JTglPCXgJTgl4CXcJTwleCYMJTwmDCXgJwAmDCV4JwAleCVcJfAnACVcJfAlXCVYJVglgCX0JVgl9CXwJcwl9CWAJcwlgCVIJUglTCXQJUgl0CXMJUwlhCXoJUwl6CXQJaQl6CWEJaQlhCVsJWwldCWoJWwlqCWkJgQlqCV0JgQldCWQJZAlKCYIJZAmCCYEJwwmCCUoJwwlKCUkJwgnDCUkJwglJCUsJVAlVCXEJVAlxCXAJVQlNCXsJVQl7CXEJwQl7CU0JwQlNCUwJqgnBCUwJqglMCWMJZQlYCW0JZQltCX8JWAlaCW4JWAluCW0J0QjECcUJ0QjFCcYIyQjGCccJyQjHCcoIrQisCMgJrQjICboIyQmHCIoIyQmKCKsInwieCK8InwivCK4IlAiTCKYIlAimCKUI1giLCfoI1gj6CNIIygmPCJIIygmSCJkIjQiTCJYIjQiWCMsJtQhoCaMItQijCKIIugjICZIIugiSCJEIzAmaCJ0IzAmdCM0JiwieCKEIiwihCM4JzQmdCKMIzQmjCJgIiwkbCfsIiwn7CPoIygjHCbMIygizCLIIzgmhCKYIzgmmCI4IzwmnCI8IzwmPCMoJ0AmpCIcI0AmHCMkJxgjFCYoIxgiKCIkIhQisCK8IhQivCIwI0QmwCLMI0QmzCKQIlwhoCacIlwinCM8JywmWCLAIywmwCNEJxAmBCIIIxAmCCMUJxgmDCIQIxgmECMcJrAiFCIYIrAiGCMgJngiLCIwIngiMCK8IkwiNCI4IkwiOCKYIaAmXCJgIaAmYCKMIyAmGCJkIyAmZCJIIxwmECKQIxwmkCLMIxQmCCKsIxQmrCIoInwk2CUMJnwlDCZ4JogTJCasIogSrCGcIfgn7CBsJfgkbCRoJdQjKCZkIdQiZCIAIdwiNCMsJdwjLCXgIfgjMCc0JfgjNCXIINAaLCM4JNAbOCXsIcgjNCZgIcgiYCHMIfgkaCaoJfgmqCX8JewjOCY4IewiOCHwIdAjPCcoJdAjKCXUIoQTQCckJoQTJCaIEBwSFCIwIBwSMCAwEeQjRCaQIeQikCHoIdgiXCM8JdgjPCXQIeAjLCdEJeAjRCXkIvgm9CaAJvgmgCZ8JowmoCaUJowmlCaQJRAlDCTYJRAk2CTUJSwlECTUJSwk1CVQJVAlwCcIJVAnCCUsJFQnCCXAJFQlwCW8JbwkLCRYJbwkWCRUJiQkWCQsJiQkLCQoJ6AiJCQoJ6AgKCeMIyAjoCOMIyAjjCMAIwAiqCMkIwAjJCMgIxgnJCKoIxgmqCKkIgwjGCakIgwipCNAJ0AmhBKAE0AmgBIMIoQRnBGYEoQRmBKAELwRmBGcELwRnBDAEMAQzBCkEMAQpBC8EMwQ2BCMEMwQjBCkE0gjOCNAI0gjQCNYI0QjQCM4I0QjOCJsIxAnRCJsIxAmbCJoIgQjECZoIgQiaCMwJzAl+CAYEzAkGBIEIBAQGBH4IBAR+CH0IngMEBH0IngN9CH8InwOeA38InwN/CKsDoQOfA6sDoQOrA6oDmgOhA6oDmgOqA7MDmwOaA7MDmwOzAxUBlAObAxUBlAMVARgBlQOUAxgBlQMYAVAElwOVA1AElwNQBHYECQSXA3YECQR2BHUENgQ0BCQENgQkBCMENAQ1BCsENAQrBCQENQQ9BCwENQQsBCsEgAQsBD0EgAQ9BIgEiAQ4BCYEiAQmBIAEOAQ7BCcEOAQnBCYEAQCmBKkEAQCpBAIA/wSqBK0E/wStBN8E9wSuBKoE9wSqBP8E7QSwBK4E7QSuBPcE4wSyBLAE4wSwBO0EBAW0BKkEBAWpBKgEBwW1BLYEBwW2BAIFRAC3BLoERAC6BEsAAgW2BLsEAgW7BPoE8gS8BL8E8gS/BPME+gS7BLoE+gS6BLkE2ATABMME2ATDBOkEuAS3BMQEuATEBOYE1wTFBMAE1wTABNgE5gTEBMcE5gTHBOcE5wTHBLQE5wS0BAQF2wTIBMsE2wTLBNwE/ATMBM8E/ATPBP0E6wTQBNME6wTTBPUEpwSmBLIEpwSyBOME4ATUBNAE4ATQBOsE3wStBNQE3wTUBOAEyQTIBM8EyQTPBM4E6QTDBLwE6QS8BPIE9QTTBMwE9QTMBPwETQhMCMsETQjLBMoExgTFBEwIxgRMCE0IVAC1BL8EVAC/BL4E0gnTCdQJ0gnUCdUJ1gnXCdgJ1gnYCdkJ2gnbCdkJ2gnZCdIJ2wncCdYJ2wnWCdkJ3QneCdwJ3QncCdsJ3wndCdsJ3wnbCdoJ4AnhCd4J4AneCd0J4gngCd0J4gndCd8J4wnkCeEJ4wnhCeAJ5QnjCeAJ5QngCeIJ5gnnCeQJ5gnkCeMJ6AnmCeMJ6AnjCeUJ6QnqCecJ6QnnCeYJ6wnpCeYJ6wnmCegJ7AntCeoJ7AnqCekJ7gnsCekJ7gnpCesJ7wnwCe0J7wntCewJ8QnvCewJ8QnsCe4J8gnzCfAJ8gnwCe8J9AnyCe8J9AnvCfEJ9Qn2CfcJ9Qn3CfgJ+Qn1CfgJ+Qn4CfoJ+wn8Cf0J+wn9Cf4J/An/CQAK/AkACv0JAQoCCvwJAQr8CfsJAgoDCv8JAgr/CfwJBAoFCgIKBAoCCgEKBQoGCgMKBQoDCgIKBwoICtQJBwrUCdMJCQoKCtgJCQrYCdcJCwoMCgoKCwoKCgkKDQoOCggKDQoICgcKDwoQCgwKDwoMCgsKEQoSCg4KEQoOCg0KEwoUChAKEwoQCg8KFQoWChIKFQoSChEKFwoYChkKFwoZChoKGwocCh0KGwodCh4KHwogChgKHwoYChcKIQoiChwKIQocChsKIwokCiAKIwogCh8KJQomCiIKJQoiCiEKJwooCvcJJwr3CfYJKQoqCgMKKQoDCgYKKgorCv8JKgr/CQMKKwosCi0KKwotCi4KLwowCvAJLwrwCfMJMAoxCu0JMArtCfAJMQoyCuoJMQrqCe0JMgozCucJMgrnCeoJMwo0CuQJMwrkCecJNAo1CuEJNArhCeQJNgo3CtwJNgrcCd4JOAo5CtcJOArXCdYJOQo6CgkKOQoJCtcJNwo4CtYJNwrWCdwJOwo8Cg8KOwoPCgsKOgo7CgsKOgoLCgkKNQo9Cj4KNQo+CjYKPwpAChcKPwoXChoKQApBCh8KQAofChcKQQpCCiMKQQojCh8KQwpECkUKQwpFCj8KGgoZChQKGgoUChMKHgodChYKHgoWChUKPApGCkQKPApECkMKRwpICkUKRwpFCkQKSApJCkoKSApKCkUKSQpLCkwKSQpMCkoKSwpNCk4KSwpOCkwKTwpQClEKTwpRClIKUwpUClUKUwpVClYKVApXClgKVApYClUKUApTClYKUApWClEKWQpaClAKWQpQCk8KWgpbClMKWgpTClAKWwpcClQKWwpUClMKXApdClcKXApXClQKXgpfCloKXgpaClkKYApdCmEKYAphCmIKXwpjClsKXwpbCloKYwpkClwKYwpcClsKZAphCl0KZApdClwKkwCUAF8KkwBfCl4KYgphCpYAYgqWAJUAlACXAGMKlABjCl8KlwCYAGQKlwBkCmMKmACWAGEKmABhCmQKLQosCmUKLQplCmYKZwplCiwKZwosCmgKaQpnCmgKaQpoCmoKawpsCm0KawptCm4KbwpwCnEKbwpxCnIKcwp0CnUKcwp1CnYKcAp3CngKcAp4CnEKdApvCnIKdApyCnUKdwp5Cj0Kdwo9CngKegp7CnwKegp8Cj4KfQp+Cn8KfQp/CoAKewqBCoIKewqCCnwKgwp9CoAKgwqACoQKfgqFCkYKfgpGCn8KgQqDCoQKgQqECoIKRwpECkYKRwpGCoUKPQp5CnoKPQp6Cj4KUgqGCocKUgqHCk8KTwqHCogKTwqIClkKWQqICokKWQqJCl4KXgqJCr4AXgq+AJMAigqLCowKigqMCo0KjgqKCo0KjgqNCo8KkAqRCpIKkAqSCpMKlAqQCpMKlAqTCpUKkQqOCo8KkQqPCpIKhgqMCosKhgqLCocKlgqXCpgKlgqYCpkKlwqaCpsKlwqbCpgKnAqWCpkKnAqZCp0KmgqeCp8KmgqfCpsKngqgCqEKngqhCp8KlQqhCqAKlQqgCpQKogqjCpAKogqQCpQKlAqgCqQKlAqkCqIKpQqmCooKpQqKCo4KpgqnCosKpgqLCooKqAqpCpcKqAqXCpYKqQqqCpoKqQqaCpcKqwqoCpYKqwqWCpwKqgqsCp4KqgqeCpoKrQqlCo4KrQqOCpEKrgqrCpwKrgqcCq8KrAqkCqAKrAqgCp4KowqtCpEKowqRCpAKhwqLCqcKhwqnCogKiAqnCrAKiAqwCokKiQqwCuYAiQrmAL4AsQqyCqMKsQqjCqIKsgqzCq0KsgqtCqMKswq0CqUKswqlCq0KtQq2CrcKtQq3CqYKuAq5CrQKuAq0CrMKpgq3CrAKpgqwCqcKugq7CrIKugqyCrEKtgrzAOwAtgrsALcKuwq4CrMKuwqzCrIKvAq9CrYKvAq2CrUKvQr2APMAvQrzALYKvgq/CsAKvgrACsEKvwrCCsMKvwrDCsAKwgrECsUKwgrFCsMKxgrHCqgKxgqoCqsKyArJCqoKyAqqCqkKxwrICqkKxwqpCqgKygrLCqQKygqkCqwKzArGCqsKzAqrCq4KyQrKCqwKyQqsCqoKzQrOCssKzQrLCsoKzwrNCsoKzwrKCskK0ArPCskK0ArJCsgKsQqiCqQKsQqkCssKsQrLCs4KsQrOCroK0QrSCtMK0QrTCtQKvgrSCtUKvgrVCtYK1wrYCtMK1wrTCsEK2QraCtsK2QrbCtEK3ArdCt4K3AreCt8KGQHgCuEKGQHhChoB4grjCuQK4grkCuUK5grnCuMK5grjCuIK6ArkCuMK6ArjCukK5wrqCukK5wrpCuMK6wrsCuEK6wrhCu0KKQHsCu4KKQHuCioB7grsCusK7grrCu8K7QrhCuAK7QrgCvAKGgHhCuwKGgHsCikB8QryCvMK8QrzCvQK7wrrCuQK7wrkCugK9Qr2CvcK9Qr3CvgK+Qr6CvsK+Qr7CvwK/Qr+Cv8K/Qr/CgAL+Ar3CgEL+AoBCwILQAH/Cv4KQAH+CkEBAAv/CgMLAAsDCwQLAgsBCwULAgsFCwYLRgEDC/8KRgH/CkABBAsDCwcLBAsHCwgLBgsFCwkLBgsJCwoLSwEHCwMLSwEDC0YBCwsMCw0LCwsNCw4LDwsQCxELDwsRCwsLEgsTC/UKEgv1ChQLFQsWCxcLFQsXCxgLGQsaCxYLGQsWCxUL+AobCxQL+AoUC/UKAgscCxsLAgsbC/gKBgsdCxwLBgscCwILCgseCx0LCgsdCwYLDAsfCx4LDAseCwoLCwsRCx8LCwsfCwwLDwsaCxkLDwsZCxAL+wr6ChYL+woWCxoL+gogCxcL+goXCxYLYgFlASELYgEhCyILEwsXCyALEwsgCyMLJAslC+IKJAviCuUK5gomCycL5gonCygLKAsnCykLKAspCyoLKwv7ChoLKwsaCw8LLAstCy4LLAsuCy8LCAsHCzALCAswCzELdQEwCwcLdQEHC0sBEAsZCzILEAsyCzMLMws0CxELMwsRCxALHQseCzULHQs1CzYLFAsbCzcLFAs3CzgLOQsyCxkLOQsZCxULGwscCzoLGws6CzcLEgsUCzgLEgs4CzsLHgsfCzwLHgs8CzULPQs5CxULPQsVCxgLNAs8Cx8LNAsfCxELHAsdCzYLHAs2CzoLggE+CzALggEwC3UBPwtAC0ELPwtBC0ILQwtEC0ULQwtFC0YLDAsKCwkLDAsJCw0LDgsrCw8LDgsPCwsLGAsXCxMLGAsTCxIL9QoTCyML9QojC/YKGAsSCzsLGAs7Cz0LRwtDC0YLRwtGC0gLjgFJC0oLjgFKC48BkgFLCz4LkgE+C4IBNQs8C0wLNQtMC00LTgtPCzILTgsyCzkLUAtMCzwLUAs8CzQLMwsyC08LMwtPC1ELOAs3C1ILOAtSC1MLNws6C1QLNwtUC1ILUQtQCzQLUQs0CzMLVQtWCz0LVQs9CzsLOgs2C1cLOgtXC1QLOws4C1MLOwtTC1ULNgs1C00LNgtNC1cLVgtOCzkLVgs5Cz0LWAtZC1YLWAtWC1ULWQtaC04LWQtOC1YLWwtcC1kLWwtZC1gLXAtdC1oLXAtaC1kLWAtVC1MLWAtTC1ILTgtaC1ELTgtRC08LUQtaC10LUQtdC1ALXQtNC0wLXQtMC1ALXAtXC00LXAtNC10LWwtUC1cLWwtXC1wLWAtSC1QLWAtUC1sLSAtGC14LSAteC18LRgtFC2ALRgtgC14LQAthC2ILQAtiC0ELYwtkCz4LYws+C0sLYQtlC2YLYQtmC2cLZwtmC2gLZwtoC2kLagtrC2wLagtsC20LbQtsC24LbQtuC28LbwtuC3ALbwtwC3ELcgtzC3QLcgt0C3ULdgt3C3MLdgtzC3ILeAt5C3oLeAt6C3sLfAt9C3kLfAt5C3gLfgt/C4ALfguAC4ELgguDC4QLgguEC4ULhgtiC2ELhgthC2cLaQuHC4YLaQuGC2cLaguIC4cLaguHC2kLbwuJC4oLbwuKC20LcQuLC4kLcQuJC28LjAuNC44LjAuOC48LkAt+C4ELkAuBC5ELgwuSC5MLgwuTC4QLRwuAC38LRwt/C0MLlAuVC5YLlAuWC5cLmAuZC5oLmAuaC5sLnAudC54LnAueC58LoAuhC6ILoAuiC6MLpAulC6YLpAumC6cLqAupC6oLqAuqC6sLrAutC64LrAuuC68LsAuxC6kLsAupC6gLsguzC60LsgutC6wLtAu1C7ELtAuxC7ALtgu3C7MLtguzC7ILAAIBArULAAK1C7QLAgIDArcLAgK3C7YLuAudC6oLuAuqC7kLqQu6C7kLqQu5C6oLsQu7C7oLsQu6C6kLtQu8C7sLtQu7C7ELAQIJArwLAQK8C7ULpQuYC5sLpQubC6YLrwu9C5YLrwuWC6wLlQuyC6wLlQusC5YLsguVC0kLsgtJC7YLjgECArYLjgG2C0kLvgu/C38Lvgt/C34LwAvBC5ILwAuSC4MLwgu+C34Lwgt+C5ALQwt/C78LQwu/C0QLwwtEC78Lwwu/C8QLvgvFC8QLvgvEC78LwgvGC8ULwgvFC74LxgvCC8ELxgvBC8cLwAvIC8cLwAvHC8ELyQvKC8ULyQvFC8YLygvLC8QLygvEC8ULzAvNC84LzAvOC88LwwvEC8sLwwvLC9AL0QvSC8cL0QvHC8gLaQtoC2sLaQtrC2oLewt6C3cLewt3C3YLbQuKC4gLbQuIC2oLkguQC5ELkguRC5MLmQucC58LmQufC5oLrQuoC6sLrQurC64LswuwC6gLswuoC60Ltwu0C7ALtwuwC7MLAwIAArQLAwK0C7cLwQvCC5ALwQuQC5ILyAvAC9MLyAvTC9QL0gvJC8YL0gvGC8cL1AvVC9EL1AvRC8gLuQu6C9YLuQvWC9cLugu7C9gLugvYC9YLuAu5C9cLuAvXC9kL1AvTC9oL1AvaC9sLggvTC8ALggvAC4MLvAsJAioCvAsqAtwLuwu8C9wLuwvcC9gL3QveC30L3Qt9C3wL1Qu2Ar0C1Qu9AtEL3wvgC4sL3wuLC3EL1wvWC+EL1wvhC+IL4wvkC4IL4wuCC4UL5QvmC+cL5QvnC+gL2AvcC+kL2AvpC+oL2wvrC9UL2wvVC9QL1gvYC+oL1gvqC+EL5AvaC9ML5AvTC4IL2QvXC+IL2QviC+wLcQtwC+0LcQvtC98L7gvvC/AL7gvwC/EL7wvyC/ML7wvzC/AL6Av0C/UL6Av1C+UL9gv3C/gL9gv4C/kL+gv7C/wL+gv8C/0L/gv/CwAM/gsADAEMAQwCDAMMAQwDDP4L9wvuC/EL9wvxC/gLBAwFDOgLBAzoC+cL+wvnC+YL+wvmC/wLBgwHDAgMBgwIDAkMCgwEDOcLCgznC/sLCwwMDAcMCwwHDAYM8wsNDA4M8wsODA8M8QvwCxAM8QsQDBEM8AvzCw8M8AsPDBAMBQwSDPQLBQz0C+gL+Qv4CxMM+QsTDBQMFQwKDPsLFQz7C/oLFgwXDP8LFgz/C/4L/gsDDBgM/gsYDBYM+AvxCxEM+AsRDBMMBQwEDBkMBQwZDBoMGwwcDBoMGwwaDBkMHQwZDAQMHQwEDAoMHgwfDAwMHgwMDAsMDwwODCAMDwwgDCEMEQwQDCIMEQwiDCMMEAwPDCEMEAwhDCIMGgwkDBIMGgwSDAUMFAwTDCUMFAwlDCYMJwwdDAoMJwwKDBUMKAwpDBcMKAwXDBYMFgwYDCoMFgwqDCgMKwwsDH0CKwx9AnwCEwwRDCMMEwwjDCUMLQwuDCkMLQwpDCgMKAwqDC8MKAwvDC0MMAwrDHwCMAx8AoMCJQwjDDEMJQwxDDIMHAwbDDMMHAwzDDQMNQwbDBkMNQwZDB0MgwKKAjYMgwI2DDAMNww4DB8MNwwfDB4MIQwgDDkMIQw5DDoMigKQAjsMigI7DDYMIwwiDDwMIww8DDEMIgwhDDoMIgw6DDwMHAw9DCQMHAwkDBoMJgwlDDIMJgwyDD4MPww1DB0MPwwdDCcMOgw5DEAMOgxADEEMOwyQApcCOwyXAj0MMQw8DEIMMQxCDEMMPAw6DEEMPAxBDEIMNAw7DD0MNAw9DBwMPgwyDEQMPgxEDEUMRgxHDDUMRgw1DD8MSAxJDC4MSAwuDC0MLQwvDEoMLQxKDEgMoQIkDD0MoQI9DJcCMgwxDEMMMgxDDEQMSwxMDDQMSww0DDMMRwwzDBsMRwwbDDUMJAyhAqQCJAykAhIMTQxODDgMTQw4DDcMTwxLDDMMTwwzDEcMEgykAqgCEgyoAvQLUAxRDE4MUAxODE0MQQxADFIMQQxSDFMM9AuoAq0C9AutAvULQwxCDFQMQwxUDFUMQgxBDFMMQgxTDFQMTAw2DDsMTAw7DDQMRQxEDFYMRQxWDFcMWAxPDEcMWAxHDEYMWQxaDEkMWQxJDEgMSAxKDFsMSAxbDFkMRAxDDFUMRAxVDFYMSwxcDF0MSwxdDEwMXgxdDFwMXgxcDF8MYAxcDEsMYAxLDE8MygvOAtgCygvYAssLYQxiDFEMYQxRDFAMUwxSDGMMUwxjDGQMVQxUDGUMVQxlDGYMVAxTDGQMVAxkDGUMXQwwDDYMXQw2DEwMVwxWDGcMVwxnDGgMaQxgDE8MaQxPDFgMagxrDFoMagxaDFkMWQxbDGwMWQxsDGoMywLJC9ILywLSC8ICVgxVDGYMVgxmDGcMZAxjDG0MZAxtDG4MZgxlDG8MZgxvDHAMZQxkDG4MZQxuDG8MXgwrDDAMXgwwDF0MaAxnDHEMaAxxDHIMcwx0DGAMcwxgDGkMdQx2DGsMdQxrDGoMagxsDHcMagx3DHUMZwxmDHAMZwxwDHEMeAxeDF8MeAxfDHkMdAxfDFwMdAxcDGAMzAuMBIsEzAuLBM0Legx7DGIMegxiDGEMfAx9DHYMfAx2DHUMdQx3DH4MdQx+DHwMcQxwDH8McQx/DIAMgQx5DF8MgQxfDHQMggyDDHsMggx7DHoMbgxtDIQMbgyEDIUMcAxvDIYMcAyGDH8MbwxuDIUMbwyFDIYMeAwsDCsMeAwrDF4McgxxDIAMcgyADIcMiAyBDHQMiAx0DHMMiQyKDIEMiQyBDIgMiwx4DHkMiwx5DIwMLAyNDO8CLAzvAn0CjgyPDH0Mjgx9DHwMfAx+DJAMfAyQDI4MkQySDJAMkQyQDH4MigyMDHkMigx5DIEMkwyUDIMMkwyDDIIMhQyEDJUMhQyVDJYMfwyGDJcMfwyXDJgMhgyFDJYMhgyWDJcMeAyLDI0MeAyNDCwMhwyADJkMhwyZDJoMmQyADH8MmQx/DJgMmgyODJAMmgyQDJIMiQybDJwMiQycDIoMxAqdDJ4MxAqeDMUKnwygDM4LnwzOC80LoQyiDKMMoQyjDKQMXwteC6UMXwulDKYMjQt1C3QLjQt0C44LpQxeC2ALpQxgC6cMqAypDKoMqAyqDKsMrAytDK4MrAyuDK8MsAyxDLIMsAyyDLMMtAy1DLEMtAyxDLAMtgy3DLUMtgy1DLQMuAy5DLcMuAy3DLYMugy7DLkMugy5DLgMvAy9DLsMvAy7DLoMvgy/DMAMvgzADMEMwgzDDL8Mwgy/DL4MxAzFDMMMxAzDDMIMxgzHDMUMxgzFDMQMyAzJDMcMyAzHDMYMygzLDMkMygzJDMgMrQzMDM0MrQzNDK4MzgzPDNAMzgzQDNEM0gzTDNQM0gzUDNUM1QzUDNYM1QzWDNcM1wzWDNgM1wzYDNkM2gzbDNwM2gzcDN0M3gzfDN0M3gzdDOAM2QzYDOEM2QzhDOAM4AzhDOIM4AziDN4M4wzaDN0M4wzdDN8M4AzdDNwM4AzcDNkM3gziDOQM3gzkDOUM2wzmDOcM2wznDOgM4QxNA0wD4QxMA+IM6QzjDN8M6QzfDOoMyAzrDOwMyAzsDMoMxgztDOsMxgzrDMgMxAzuDO0MxAztDMYM1AxVA1QD1AxUA9YM7wysDK8M7wyvDPAM1grxDL8K1gq/Cr4KswzADL8Mswy/DLAMsAy/DMMMsAzDDLQMtAzDDMUMtAzFDLYMtgzFDMcMtgzHDLgMuAzHDMkMuAzJDLoMugzJDMsMugzLDLwMsQy1DPIMsQzyDPMMuwy9DPQMuwz0DPUMuQy7DPUMuQz1DPYMtwy5DPYMtwz2DPcMtQy3DPcMtQz3DPIM+Az5DPoM+Az6DPsM9Qz0DPwM9Qz8DP0M+Qz+DP8M+Qz/DPoM9wz2DAAN9wwADQEN9gz1DP0M9gz9DAAN+wz6DAIN+wwCDQMN/Qz8DAQN/QwEDQUN+gz/DAYN+gwGDQINAQ0ADQcNAQ0HDQgNAA39DAUNAA0FDQcNAw0CDQkNAw0JDQoNBQ0EDQsNBQ0LDQwNAg0GDQ0NAg0NDQkNCA0HDQ4NCA0ODQ8NBw0FDQwNBw0MDQ4NCg0JDRANCg0QDRENDA0LDRINDA0SDRMNCQ0NDRQNCQ0UDRANDw0ODRUNDw0VDRYNDg0MDRMNDg0TDRUNEQ0QDRcNEQ0XDRgNEw0SDRkNEw0ZDRoNEA0UDRsNEA0bDRcNFg0VDRwNFg0cDR0NFQ0TDRoNFQ0aDRwNHg0fDSANHg0gDSENIg0jDSQNIg0kDSUNHw0mDScNHw0nDSANKA0pDSoNKA0qDSsNKQ0iDSUNKQ0lDSoNLA0tDS4NLA0uDS8NLQ0wDTENLQ0xDS4NMg0zDTQNMg00DTUNNg03DTgNNg04DTkNMw0sDS8NMw0vDTQNNw06DTsNNw07DTgNPA09DT4NPA0+DT8NPw0+DUANPw1ADUENQg1DDUQNQg1EDUUNRg1HDT0NRg09DTwNSA1JDUoNSA1KDUsNQQ1ADdoKQQ3aCtkKTA3cCt8KTA3fCk0NRQ1MDU0NRQ1NDUINSg1JDU4NSg1ODU8NUA2uDM0MUA3NDFENsQzzDFINsQxSDbIM+wxTDVQN+wxUDfgMAw1VDVMNAw1TDfsMCg1WDVUNCg1VDQMNEQ1XDVYNEQ1WDQoNGA1YDVcNGA1XDRENWQ1aDVsNWQ1bDVwNXQ1eDXMKXQ1zCnYKawpfDWANawpgDWwKYQ1eDWINYQ1iDWMNYQ2vCpwKYQ2cCp0KZA1lDWANZA1gDV8NWw1lDWQNWw1kDVwNeQqhCpUKeQqVCnoKbwqYCpsKbwqbCnAKRwpSClEKRwpRCkgKcwqdCpkKcwqZCnQKfQqNCowKfQqMCn4KSQpWClUKSQpVCksKgQqSCo8KgQqPCoMKdwqfCqEKdwqhCnkKSApRClYKSApWCkkKdAqZCpgKdAqYCm8KfgqMCoYKfgqGCoUKgwqPCo0KgwqNCn0KegqVCpMKegqTCnsKUgpHCoUKUgqFCoYKcAqbCp8KcAqfCncKewqTCpIKewqSCoEKSwpVClgKSwpYCk0KzAxmDWcNzAxnDc0MUQ3NDGcNUQ1nDWgN1gxUA9AD1gzQA9gMTQPhDNgMTQPYDNAD4gxMA9ED4gzRA+QMqwxpDWoNqwxqDagMaw1sDW0Naw1tDW4Nbw1tDWwNbw1sDXANcQ1yDW4NcQ1uDW0NcQ1tDW8NcQ1vDXMNdA11DXYNdA12DXcN3AzbDOgM3AzoDHgN2QzcDHgN2Qx4DdcM3gzlDOoM3gzqDN8MeQ3jDOkMeQ3pDHoNew3aDOMMew3jDHkN2gx7DeYM2gzmDNsMdQ18DX0NdQ19DXYNfg1vDXANfg1wDX8Nfg2ADYENfg2BDYINgw3wDK8Mgw2vDIQNhQ2GDYcNhQ2HDYgN7gyJDYoN7gyKDe0M7QyKDYsN7QyLDesM6wyLDYwN6wyMDewMjQ2ODY8NjQ2PDZANkQ2SDZMNkQ2TDZQNlQ2WDY4NlQ2ODY0NkQ1mDcwMkQ3MDJcNkA2PDZgNkA2YDZcNmQ2UDZMNmQ2TDVQNmg02DTkNmg05DZsNnA2aDZsNnA2bDZ0Nng2fDT0Nng09DUcNMA2gDaENMA2hDTENOg0yDTUNOg01DTsNZg2iDaMNZg2jDWcNpA2lDaYNpA2mDacNqA2ZDVQNqA1UDVMNqQ2qDasNqQ2rDawNrQ2uDa8NrQ2vDbANsQ2tDbANsQ2wDbINsw1XDVgNsw1YDbQNtQ1WDVcNtQ1XDbMNtg1VDVYNtg1WDbUNtw1TDVUNtw1VDbYNuA25DVgNuA1YDRgNSg1PDboNSg26DbsNvA29Db4NvA2+Db8NSw1KDbsNSw27DcANwQ3CDcMNwQ3DDcQNxQ1LDcANxQ3ADcYNTw3BDcQNTw3EDboNxw3IDckNxw3JDcoNyw3MDaUNyw2lDaQNzQ3LDaQNzQ2kDc4Nzw3QDdENzw3RDdINyA3NDc4NyA3ODckNzA3TDdQNzA3UDaUNpg3VDSwNpg0sDTMN1g3XDTcN1g03DTYNpw2mDTMNpw0zDTIN2A2nDTIN2A0yDToN2Q3aDaAN2Q2gDTAN1w3YDToN1w06DTcN2w3cDd0N2w3dDd4N3w3fCt4K3w3eCuAN8QzhDeIN8QziDeMN5A3WCtUK5A3VCuUN5A3hDfEM5A3xDNYK5g3eCt0K5g3dCucNTw1ODegNTw3oDcENwQ3oDbINwQ2yDcIN6Q1VBFQE6Q1UBOoN4g3rDewN4g3sDeMNnQzpDeoNnQzqDZ4M7Q3uDeEN7Q3hDeQN7Q3kDeUN7Q3lDe8Nsg2wDfANsg3wDcIN8Q1DDUIN8Q1CDfIN8g1CDU0N8g1NDfMN7g30DeIN7g3iDeENqgypDM8MqgzPDM4MsA2vDbwNsA28DfANgA1+DX8NgA1/DfUNbw1+DYINbw2CDXMNrAyNDZANrAyQDa0MZg2RDZQNZg2UDfYN7wyVDY0N7wyNDawMkg2RDZcNkg2XDZgNrQyQDZcNrQyXDcwM9w32DZQN9w2UDZkN+A33DZkN+A2ZDagN+Q2oDVMN+Q1TDbcN+g3FDcYN+g3GDfsN/A3HDcoN/A3KDf0N/g3WDTYN/g02DZoN8g3zDf8N8g3/DQAO8g0ADgEO8g0BDvENrw0CDr0Nrw29DbwN8w3fDQMO8w0DDv8NBA5yBHEEBA5xBAUOBg4HDikNBg4pDSgN3Q3cDQgO3Q0IDgkOCg4LDgwOCg4MDg0ODg4PDhAODg4QDuANuQq8CrUKuQq1CrQKBQ5xBH8EBQ5/BBEO8A28Db8N8A2/DRIO4A0QDgMO4A0DDt8NEw4UDiYNEw4mDR8NFQ7ZDTANFQ4wDS0N8w1NDd8K8w3fCt8NFg7bDd4NFg7eDYUEFw4YDiMNFw4jDSINuA0TDh8NuA0fDR4NGQ7PDdINGQ7SDRoOIQ2rDaoNIQ2qDR4NBw4XDiINBw4iDSkNDg7mDdwNDg7cDdsN9A0DDhAO9A0QDhsOpQq0CrUKpQq1CqYKRQvPC84LRQvOC2ALoAynDGALoAxgC84LHA6fDI0EHA6NBJkHaw1pDasMaw2rDGwNbA2rDKoMbA2qDHANzgx/DXANzgxwDaoMfw3ODNEMfw3RDPUN1Qx9DXwN1Qx8DdIM0wyOBFUD0wxVA9QMzwyQBI8EzwyPBNAMkATPDKkMkASpDJEEkQSpDKgMkQSoDJIEag2TBJIEag2SBKgMHQ4eDh8OHQ4fDiAOIQ4iDm4NIQ5uDXINIg4jDmsNIg5rDW4NIw4kDmkNIw5pDWsNJA4lDmoNJA5qDWkNKAsqC/MKKAvzCvIKJg4nDoYNJg6GDYUNwQyHDYYNwQyGDb4MvgyGDScOvgwnDsIMdg3oDOcMdg3nDHcNfQ14DegMfQ3oDHYN1wx4DX0N1wx9DdUMJg6JDe4MJg7uDCcOwgwnDu4MwgzuDMQM+w0oDikO+w0pDvoNKg78Df0NKg79DSsOyg3JDdcNyg3XDdYNEQ4sDi0OEQ4tDgUOLA7sDesNLA7rDS0OHg2qDbkNHg25DbgN3A3mDecN3A3nDQgOHQ0cDQcOHQ0HDgYO2w0WDg8O2w0PDg4Owg3wDRIOwg0SDsMNFw0bDRQOFw0UDhMO1Q0VDi0N1Q0tDSwNGg0ZDRgOGg0YDhcOGA0XDRMOGA0TDrgN0w0ZDhoO0w0aDtQNHA0aDRcOHA0XDgcO4A3eCuYN4A3mDQ4OBA4uDg8OBA4PDhYOLg4bDhAOLg4QDg8OLw4wDjEOLw4xDjIOMw40DjUOMw41DjYONw4zDjYONw42DjgOOQ43DjgOOQ44DjoOOw45DjoOOw46DjwOPQ4wDtQJPQ7UCQgKPg4/DiIKPg4iCiYKQA5BDkIOQA5CDkMOPw5EDhwKPw4cCiIKRQ5GDkcORQ5HDkgORA5BDh0KRA4dChwKSQ5KDksOSQ5LDkwOQA5NDhIKQA4SChYKTg5JDkwOTg5MDk8OTQ5QDg4KTQ4OChIKUA49DggKUA4ICg4KUQ5SDlMOUQ5TDlQOVQ5WDlcOVQ5XDlgOWQ5aDlsOWQ5bDlwOLw47DjwOLw48DtUJXQ5ZDlwOXQ5cDl4ONA5dDl4ONA5eDjUOXw5gDmEOXw5hDmIOYw5kDmUOYw5lDmYOZw5oDmkOZw5pDmoOaw5sDm0Oaw5tDjIObg5vDnAObg5wDnEOYA5yDnMOYA5zDmEOaA50DnUOaA51DmkObA52DncObA53Dm0OQw5CDngOQw54DnkOeQ5uDnEOeQ5xDkMOeg57DnwOeg58Dn0OdA5+Dn8OdA5/DnUOdg6ADoEOdg6BDncOgg54DkIOgg5CDoMOhA6FDoYOhA6GDocOgA6IDokOgA6JDoEOig6CDoMOig6DDosOjA6NDjEOjA4xDo4OiA5nDmoOiA5qDokOMg4xDo0OMg6NDmsOjw6KDosOjw6LDpAObw6MDo4Obw6ODnAOkQ6SDpMOkQ6TDpQOlQ6WDpcOlQ6XDpgOmQ6aDpsOmQ6bDpwOnQ6eDp8OnQ6fDqAOoQ6iDqMOoQ6jDqQOpQ6RDpQOpQ6UDqYOlg6nDqgOlg6oDpcOng6pDqoOng6qDp8Oog6rDqwOog6sDqMOrQ6uDq8OrQ6vDrAOsA6lDqYOsA6mDq0OsQ6yDrMOsQ6zDrQOqQ61DrYOqQ62DqoOqw63DrgOqw64DqwOuQ6vDq4OuQ6uDroOuw68Dr0Ouw69Dr4Otw6/DsAOtw7ADrgOwQ65DroOwQ66DsIOkg7DDsQOkg7EDpMOvw6dDqAOvw6gDsAOpA7EDsMOpA7DDqEOxQ7BDsIOxQ7CDsYOxw7IDrkOxw65DsEOyQ7KDsMOyQ7DDpIOyw7MDp0Oyw6dDr8OoQ7DDsoOoQ7KDs0Ozg7HDsEOzg7BDsUOzw7JDpIOzw6SDpEO0A7RDpYO0A6WDpUO0g7TDpoO0g6aDpkOzA7UDp4OzA6eDp0OzQ7VDqIOzQ6iDqEO1g7PDpEO1g6RDqUO0Q7XDqcO0Q6nDpYO1A7YDqkO1A6pDp4O1Q7ZDqsO1Q6rDqIOsA6vDtoOsA7aDtsO2w7WDqUO2w6lDrAO3A7dDrIO3A6yDrEO2A7eDrUO2A61DqkO2Q7fDrcO2Q63DqsOyA7aDq8OyA6vDrkO4A7hDrwO4A68DrsO3w7LDr8O3w6/DrcO4g7jDtUO4g7VDs0O5A7lDs8O5A7PDtYO5g7nDtcO5g7XDtEO6A7pDtgO6A7YDtQO4w7qDtkO4w7ZDtUO2w7aDusO2w7rDuwO7A7kDtYO7A7WDtsO7Q7uDt0O7Q7dDtwO6Q7vDt4O6Q7eDtgO6g7wDt8O6g7fDtkO8Q7rDtoO8Q7aDsgO8g7zDuEO8g7hDuAO8A70DssO8A7LDt8O9Q7xDsgO9Q7IDscO9g73DsoO9g7KDskO9A74DswO9A7MDssOzQ7KDvcOzQ73DuIO+Q71DscO+Q7HDs4O5Q72DskO5Q7JDs8O+g7mDtEO+g7RDtAO+w78DtMO+w7TDtIO+A7oDtQO+A7UDswO4g73Dv0O4g79Dv4O/w4AD/UO/w71DvkOAQ8CD/YOAQ/2DuUOAw8ED+YOAw/mDvoOBQ8GD/wOBQ/8DvsOBw8ID+gOBw/oDvgO/g4JD+MO/g7jDuIOCg8BD+UOCg/lDuQOBA8LD+cOBA/nDuYOCA8MD+kOCA/pDugOCQ8ND+oOCQ/qDuMO7A7rDg4P7A4ODw8PDw8KD+QODw/kDuwOEA8RD+4OEA/uDu0ODA8SD+8ODA/vDukODQ8TD/AODQ/wDuoOFA8OD+sOFA/rDvEOFQ8WD/MOFQ/zDvIOEw8XD/QOEw/0DvAOAA8UD/EOAA/xDvUOAg/9DvcOAg/3DvYOFw8HD/gOFw/4DvQOGA8ZDxcPGA8XDxMPFw8ZDxoPFw8aDwcPBw8aDxsPBw8bDwgPDA8cDx0PDA8dDxIPHg8fDwAPHg8AD/8OFQ8gDyEPFQ8hDxYPBQ8iDyMPBQ8jDwYPAw8kDyUPAw8lDwQPJg8nDwkPJg8JD/4OBA8lDygPBA8oDwsPAg8BDykPAg8pDyoPGw8cDwwPGw8MDwgPAA8fDysPAA8rDxQPDw8ODywPDw8sDy0PFA8rDywPFA8sDw4PLg8vDxEPLg8RDxAPDw8tDzAPDw8wDwoPCg8wDykPCg8pDwEPAg8qDzEPAg8xD/0OJg/+Dv0OJg/9DjEPCQ8nDzIPCQ8yDw0PDQ8yDxgPDQ8YDxMPFg8hDyIPFg8iDwUP+w7zDhYP+w4WDwUP0g7hDvMO0g7zDvsO4Q7SDpkO4Q6ZDrwOGA8yDzMPGA8zDzQPLQ8sDzUPLQ81DzYPMA8tDzYPMA82DzcPLg8oDzgPLg84DzkPJQ8kDzoPJQ86DzsPKg8pDzwPKg88Dz0PHQ8cDz4PHQ8+Dz8PJw8mD0APJw9AD0EPKQ8wDzcPKQ83DzwPIA8dDz8PIA8/D0IPGQ8YDzQPGQ80D0MPMg8nD0EPMg9BDzMPMQ8qDz0PMQ89D0QPKw8fD0UPKw9FD0YPIw8iD0cPIw9HD0gPGg8ZD0MPGg9DD0kPHw8eD0oPHw9KD0UPLA8rD0YPLA9GDzUPKA8lDzsPKA87DzgPGw8aD0kPGw9JD0sPJg8xD0QPJg9ED0APIg8hD0wPIg9MD0cPHA8bD0sPHA9LDz4PQg8/D00PQg9ND04PQw80D08PQw9PD1APPQ88D1EPPQ9RD1IPRQ9KD1MPRQ9TD1QPRg9FD1QPRg9UD1UPSA9HD1YPSA9WD1cPSQ9DD1APSQ9QD1gPQA9ED1kPQA9ZD1oPNQ9GD1UPNQ9VD1sPOA87D1wPOA9cD10PSw9JD1gPSw9YD14PNg81D1sPNg9bD18PNw82D18PNw9fD2APRw9MD2EPRw9hD1YPPg9LD14PPg9eD2IPMw9BD2MPMw9jD2QPPA83D2APPA9gD1EPOQ84D10POQ9dD2UPOw86D2YPOw9mD1wPPw8+D2IPPw9iD00PQQ9AD1oPQQ9aD2MPNA8zD2QPNA9kD08PRA89D1IPRA9SD1kPVQ9UD2cPVQ9nD2gPVw9WD2kPVw9pD2oPWA9QD2sPWA9rD2wPWg9ZD20PWg9tD24PWw9VD2gPWw9oD28PXQ9cD3APXQ9wD3EPXg9YD2wPXg9sD3IPXw9bD28PXw9vD3MPYA9fD3MPYA9zD3QPVg9hD3UPVg91D2kPYg9eD3IPYg9yD3YPZA9jD3cPZA93D3gPUQ9gD3QPUQ90D3kPZQ9dD3EPZQ9xD3oPXA9mD3sPXA97D3APTQ9iD3YPTQ92D3wPYw9aD24PYw9uD3cPTw9kD3gPTw94D30PWQ9SD34PWQ9+D20PTg9ND3wPTg98D38PUA9PD30PUA99D2sPUg9RD3kPUg95D34PVA9TD4APVA+AD2cPgQ+CD4MPgQ+DD4QPhQ+GD4cPhQ+HD4gPiQ+KD4sPiQ+LD4wPjQ+OD48PjQ+PD5APkQ+SD5MPkQ+TD5QPkA+VD5YPkA+WD40PlA+XD5gPlA+YD5EPgg+ZD5oPgg+aD4MPmw+cD50Pmw+dD54Pjg+fD6APjg+gD48PoQ+iD6MPoQ+jD6QPpQ+mD6cPpQ+nD6gPjA+bD54PjA+eD4kPlw+pD6oPlw+qD5gPpg+rD6wPpg+sD6cPrQ+gD58PrQ+fD64Prw+lD6gPrw+oD7APiA+BD4QPiA+ED4UPpA+dD5wPpA+cD6EPrg+xD7IPrg+yD60PsA+qD6kPsA+pD68Pqw+zD7QPqw+0D6wPtQ+2D7cPtQ+3D7gPhg+yD7EPhg+xD4cPig+1D7gPig+4D4sPmQ+TD5IPmQ+SD5oPsw+3D7YPsw+2D7QPpA+jD3cPpA93D24PfA92D7IPfA+yD4YPmA+qD3EPmA9xD3APeQ90D4oPeQ+KD4kPow+VD3gPow94D3cPeg9xD6oPeg+qD7APrQ+yD3YPrQ92D3IPkQ+YD3APkQ9wD3sPdA9zD7UPdA+1D4oPcw9vD7YPcw+2D7UPhQ+ED3UPhQ91D38Pcg9sD6APcg+gD60PhA+DD2kPhA9pD3UPtA+2D28PtA9vD2gPbg9tD50Pbg+dD6QPew+5D5IPew+SD5EPjw+gD2wPjw9sD2sPgw+aD2oPgw9qD2kPrA+0D2gPrA9oD2cPug9bDVoNug9aDbsPvA9oDWcNvA9nDaMNog1mDfYNog32Db0Pvg9lDVsNvg9bDboPZQ2+D2MNZQ1jDWANYA1jDWINYA1iDWwKvw9tCmwKvw9sCmINKArAD8EPKArBD/cJwg/4CfcJwg/3CcEPww/6CfgJww/4CcIPUQ5WDoYOUQ6GDmYOZg6GDoUOZg6FDmMOnA69DrwOnA68DpkOxA/FD8YPxA/GD8cPxw/GD8gPxw/ID8kPyQ/ID8oPyQ/KD8sPyw/KD8wPyw/MD80PzQ/MD84PzQ/OD88PxQ/QD9EPxQ/RD8YPxg/RD9IPxg/SD8gPyA/SD9MPyA/TD8oPyg/TD9QPyg/UD8wPzA/UD9UPzA/VD84P1g/XD9gP1g/YD9kP2Q/YD9oP2Q/aD9sP2w/aD9wP2w/cD90P3g/fD+AP3g/gD+EP1w/iD+MP1w/jD9gP2A/jD+QP2A/kD9oPXAblD+YPXAbmD10G5Q/gD98P5Q/fD+YP1w/eD+EP1w/hD+IPXAZhBucPXAbnD+UP6A/pD+wM6A/sDIwN6g/ED8cP6g/HD+sP6w/HD8kP6w/JD+wP7A/JD8sP7A/LD+0P7Q/LD80P7Q/ND+4P7g/ND88P7g/PD+8P8A/xD/IP8A/yD/MP5Q/nD/QP5Q/0D+AP9Q/2D94P9Q/eD9cP9g/3D98P9g/fD94P+A/1D9cP+A/XD9YP+Q/6D+kM+Q/pDOoM+w/5D+oM+w/qDOUM+g/8D3oN+g96DekM/Q/+D8UP/Q/FD8QP/w8AEMsM/w/LDMoMARACEAsNARALDQQNAxAEECMNAxAjDRgOBRABEAQNBRAEDfwMBBAGECQNBBAkDSMNGA4ZDQcQGA4HEAMQCBAFEPwMCBD8DPQMCRAKEL0MCRC9DLwMCxAHEBkNCxAZDRINChAIEPQMChD0DL0MAhALEBINAhASDQsNDBANEAgQDBAIEAoQDhAPEAcQDhAHEAsQEBAMEAoQEBAKEAkQERAOEAsQERALEAIQEhAREAIQEhACEAEQExASEAEQExABEAUQFBAVEAQQFBAEEAMQDRATEAUQDRAFEAgQAxAHEA8QAxAPEBQQFRAWEAYQFRAGEAQQFxAYEBEQFxAREBIQGBAZEA4QGBAOEBEQGRAaEA8QGRAPEA4QGxAcEAwQGxAMEBAQFBAPEBoQFBAaEB0QHBAeEA0QHBANEAwQHRAfEBUQHRAVEBQQHhAgEBMQHhATEA0QIBAXEBIQIBASEBMQIRD+D+kPIRDpD+gPIhAjEPoPIhD6D/kPJBAiEPkPJBD5D/sPIxAlEPwPIxD8D/oPygzsDOkPygzpD/8P/Q8mEAAQ/Q8AEP8P0A/FD/4P0A/+DyEQCRAAECYQCRAmEBAQxA/qDyYQxA8mEP0P9Q/4DyUQ9Q8lECMQ/w/pD/4P/w/+D/0P9w/2DyIQ9w8iECQQ9g/1DyMQ9g8jECIQEBAmEOoPEBDqDxsQCRC8DMsMCRDLDAAQ5AzRA6MG5AyjBicQJxCjBqUGJxClBigQKRCnBl0GKRBdBuYP4A/0DyoQ4A8qEOEP+w/lDOQM+w/kDCcQKBAkEPsPKBD7DycQJBAoECkQJBApEPcP9w8pEOYP9w/mD98P4Q8qECsQ4Q8rEOIPLBAtEC4QLBAuEB8QLxAwEB4QLxAeEBwQHRAaEDEQHRAxEDIQMBAzECAQMBAgEB4QMhAsEB8QMhAfEB0QMxA0EBcQMxAXECAQNBA1EBgQNBAYEBcQNRA2EBkQNRAZEBgQNhAxEBoQNhAaEBkQNxAvEBwQNxAcEBsQOBA5EDUQOBA1EDQQORA6EDYQORA2EDUQOhA7EDEQOhAxEDYQPBA9EC8QPBAvEDcQPhA/EC0QPhAtECwQPRBAEDAQPRAwEC8QMhAxEDsQMhA7EEEQQBBCEDMQQBAzEDAQQRA+ECwQQRAsEDIQQhA4EDQQQhA0EDMQQxBEEEUQQxBFEEYQRhBFEEcQRhBHEEgQSRBDEEYQSRBGEEoQShBGEEgQShBIEEsQTBBJEEoQTBBKEE0QTRBKEEsQTRBLEE4QTxBMEE0QTxBNEFAQUBBNEE4QUBBOEFEQUhBPEFAQUhBQEFMQUxBQEFEQUxBREFQQVRBSEFMQVRBTEFYQVhBTEFQQVhBUEFcQRBBDEDkQRBA5EDgQQxBJEDoQQxA6EDkQSRBMEDsQSRA7EDoQQRA7EEwQQRBMEE8QTxBSED4QTxA+EEEQUhBVED8QUhA/ED4Q7A88EDcQ7A83EOsP6w83EBsQ6w8bEOoPWBBZED0QWBA9EDwQWRBaEEAQWRBAED0QWhBbEEIQWhBCEEAQXBBdEFkQXBBZEFgQXRBeEFoQXRBaEFkQXhBfEFsQXhBbEFoQYBBhEF0QYBBdEFwQYRBiEF4QYRBeEF0QYhBjEF8QYhBfEF4QYxBkEGUQYxBlEF8QZBBmEGcQZBBnEGUQaBBpEGEQaBBhEGAQaRBqEGIQaRBiEGEQahBrEGMQahBjEGIQaxBsEGQQaxBkEGMQbBBtEGYQbBBmEGQQbhBvEHAQbhBwEHEQbxByEHMQbxBzEHAQchB0EHUQchB1EHMQdBB2EHcQdBB3EHUQeBB5EHIQeBByEG8QeRB6EHQQeRB0EHIQZhBtEHsQZhB7EHwQcRBwEGkQcRBpEGgQcBBzEGoQcBBqEGkQcxB1EGsQcxBrEGoQdRB3EGwQdRBsEGsQdxB9EG0QdxBtEGwQzw/OD34Qzw9+EPEP7w/PD/EP7w/xD/AP7Q9YEDwQ7Q88EOwP7g9cEFgQ7g9YEO0PXBDuD+8PXBDvD2AQ8A9oEGAQ8A9gEO8PaBDwD/MPaBDzD3EQcRDzD38QcRB/EG4QgBBnEGYQgBBmEHwQgRDoD4wNgRCMDYIQghCMDYsNghCLDYMQgxCLDYoNgxCKDYQQhBCKDYkNhBCJDYUQhRCJDSYOhRAmDoYQhhAmDoUNhhCFDYcQhxCFDYgNhxCIDYgQiRCCDYENiRCBDYoQiRCVDe8MiRDvDIsQjBBxDXMNjBBzDYsQjBDwDIMNjBCDDY0QjhAhDnINjhByDY0QGQFiASILGQEiC+AKjxDwCuAKjxDgCiILkBBfC6YMkBCmDJEQkhBIC18LkhBfC5AQkxCAC0cLkxBHC5QQlRCBC4ALlRCAC5MQlhCRC4ELlhCBC5UQlhB3C3oLlhB6C5cQmBCEC5MLmBCTC5cQmRCFC4QLmRCEC5gQmhDjC4ULmhCFC5kQmxAIDAcMmxAHDJwQnRAVDPoLnRD6C5wQnhAnDBUMnhAVDJ0QnhAfDDgMnhA4DJ8QnxA4DE4MnxBODKAQoRBYDEYMoRBGDKAQohBpDFgMohBYDKEQohBiDHsMohB7DKMQoxB7DIMMoxCDDKQQpBCDDJQMpBCUDKUQphCbDIkMphCJDKUQpxCTDIIMpxCCDKgQqBCCDHoMqBB6DKkQqhBrDHYMqhB2DKkQqhBhDFAMqhBQDKsQrBBJDFoMrBBaDKsQrRAuDEkMrRBJDKwQrRA3DB4MrRAeDK4QrhAeDAsMrhALDK8QsBD/CxcMsBAXDK8QsRAADP8LsRD/C7AQshDdC3wLshB8C7MQtBCJC4sLtBCLC7MQtRCKC4kLtRCJC7QQthCIC4oLthCKC7UQthB2C3ILthByC7cQuBCGC4cLuBCHC7cQuBB1C40LuBCNC7kQuhCMC6IMuhCiDLsQuxCiDKEMuxChDLwQJAvwCo8QJAuPEL0QJAu9EL4QJAu+ECULvxAhEOgPvxDoD4EQvxAlEPgPvxD4D8AQwRDRD9APwRDQD8AQwhDSD9EPwhDRD8EQwxDTD9IPwxDSD8IQxBDUD9MPxBDTD8MQ/A+BEIIQ/A+CEHoNeg2CEIMQeg2DEHkNeQ2DEIQQeQ2EEHsNew2EEIUQew2FEOYM5gyFEIYQ5gyGEOcM5wyGEIcQ5wyHEHcNdw2HEIgQdw2IEHQNlQ2JEIoQlQ2KEJYNgg2JEIsQgg2LEHMN8AyMEIsQ8AyLEO8McQ2MEI0QcQ2NEHINxRD2CiMLxRAjC8YQxxAmCyULxxAlC74QxxDIECcLxxAnCyYLowyQEJEQowyREKQMjwuSEJAQjwuQEKMMdAuTEJQQdAuUEI4LcwuVEJMQcwuTEHQLdwuWEJUQdwuVEHMLkQuWEJcQkQuXEJMLeQuYEJcQeQuXEHoLfQuZEJgQfQuYEHkL3guaEJkQ3guZEH0L/QubEJwQ/QucEPoLDAydEJwQDAycEAcMHwyeEJ0QHwydEAwMJwyeEJ8QJwyfED8MPwyfEKAQPwygEEYMUQyhEKAQUQygEE4MYgyiEKEQYgyhEFEMaQyiEKMQaQyjEHMMcwyjEKQQcwykEIgMiAykEKUQiAylEIkMyRCmEKUQyRClEMoQjwynEKgQjwyoEH0MfQyoEKkQfQypEHYMYQyqEKkQYQypEHoMawyqEKsQawyrEFoMTQysEKsQTQyrEFAMNwytEKwQNwysEE0MLgytEK4QLgyuECkMKQyuEK8QKQyvEBcMBgywEK8QBgyvEAsMCQyxELAQCQywEAYM4AuyELMQ4AuzEIsLeAu0ELMQeAuzEHwLewu1ELQQewu0EHgLdgu2ELUQdgu1EHsLiAu2ELcQiAu3EIcLdQu4ELcQdQu3EHILhgu4ELkQhgu5EGILQQu6ELsQQQu7EEILQgu7ELwQQgu8EMsQzBApCycLzBAnC8gQzRDOEM8QzRDPENAQ0BDPENEQ0BDRENIQ0hDRENMQ0hDTENQQ1RDWENcQ1RDXENgQ2BDXENkQ2BDZENoQ2hDZENsQ2hDbENwQ3BDbEN0Q3BDdEN4Q3hDdEN8Q3hDfEOAQJRC/EIEQJRCBEPwPIRC/EMAQIRDAENAP1g/BEMAQ1g/AEPgP2Q/CEMEQ2Q/BENYP2w/DEMIQ2w/CENkP3Q/EEMMQ3Q/DENsP1A/EEOEQ1A/hENUPSBBHEOIQSBDiEOMQSxBIEOMQSxDjEOQQThBLEOQQThDkEOUQURBOEOUQURDlEOYQVBBREOYQVBDmEOcQVxBUEOcQVxDnEOgQgBB8EOkQgBDpEOoQQhBbEEQQQhBEEDgQWxBfEGUQWxBlEEQQRBBlEGcQRBBnEEUQRRBnEIAQRRCAEEcQ6hDiEEcQ6hBHEIAQ2QnYCdMJ2QnTCdIJPA7aCdIJPA7SCdUJOg7fCdoJOg7aCTwOOA7iCd8JOA7fCToO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9w34DfAR9w3wEfER7RHwEfgN7RH4DaER9w3xEb0P9w29D/YNKQ7uEQwOKQ4MDvoNQA3pEeQRQA3kEdoK3RHbCtoK3RHaCuQR6BHyEfMR6BHzEeMRQw3hEfQRQw30EUQN9BHhEeMR9BHjEfMR2wrdEeUN2wrlDdUKPg31EekRPg3pEUANnw31ET4Nnw0+DT0N9hH3EZwN9hGcDZ0N+BH5ESkO+BEpDigO+hH7EZ8N+hGfDZ4N/BH9Ef4R/BH+Ef8RABIBEqINABKiDb0PAhIDEvARAhLwEe0RBBIFEgYSBBIGEgcSCBIJEgoSCBIKEgsSDBINEucRDBLnEesR+xEOEvUR+xH1EZ8NDxIQEhESDxIREhISExIUEhUSExIVEhYSEBIXEhgSEBIYEhES+REZEu4R+RHuESkOFBIaEhsSFBIbEhUSHBIEEgcSHBIHEh0SHhL8Ef8RHhL/ER8S9xEgEtwR9xHcEZwNIRIiEiMSIRIjEiQSJRImEicSJRInEigSKRIqEhgSKRIYEisSLBItEiMSLBIjEhYSLhIvEgYSLhIGEjASCxIKEjESCxIxEjISERIYEioSERIqEjMSNBIuEjASNBIwEiQSHxL/ETUSHxI1EjYSFhIVEjcSFhI3EiwSHRIHEjgSHRI4EjkSOhI7Ev4ROhL+ETwSPRI+Ej8SPRI/EkASPhJBEicSPhInEj8SFRIbEkISFRJCEjcS/xH+ETsS/xE7EjUSJBIjEi0SJBItEjQSEhIREjMSEhIzEkMSKBInEkESKBJBEkQSRRI6EjwSRRI8EkYSBxIGEi8SBxIvEjgSMhJCEhsSMhIbEgsSQxIzEkcSQxJHEkgSRBJBEkkSRBJJEkoSSxJMEjoSSxI6EkUSOBIvEk0SOBJNEk4STxJQEkISTxJCEjISURJSEioSURIqEikSUxJUEi0SUxItEiwSVRJNEi8SVRIvEi4SMhIxElYSMhJWEk8SMxIqElISMxJSEkcSVxJVEi4SVxIuEjQSNhI1ElgSNhJYElkSLBI3EloSLBJaElMSORI4Ek4SORJOElsSTBJcEjsSTBI7EjoSXRJeEj4SXRI+Ej0SXhJJEkESXhJBEj4SNxJCElASNxJQEloSNRI7ElwSNRJcElgSNBItElQSNBJUElcSXxJgEmESXxJhEmISYxJkEmUSYxJlEmYSZxJoEmkSZxJpEmoS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",In=-.35,ol=-1.3,lw=-1.62,cw=-7.5,Ke=160,Ba=.04,hw=.11,Uh=.16,po=e=>{let t=Math.max(0,Math.cos(e));return ol+(lw-ol)*t*t};function uw(e,{color:t="#2f4f6a",stripColor:r="#f3efe6"}={}){let i=e.attributes.position.array,a=e.index.array,n=ol+.25,o=(()=>{let P=1e9;for(let L=1;L<i.length;L+=3)P=Math.min(P,i[L]);return P})(),s=Math.ceil((n-o)/Ba)+1,l=new Float32Array(Ke*s).fill(-1),c=new b,u=new b,h=new b,d=new b,g=new b,m=9187,A=()=>(m=Math.imul(m,1664525)+1013904223>>>0,m/4294967296);for(let P=0;P<a.length;P+=3){if(c.fromArray(i,a[P]*3),u.fromArray(i,a[P+1]*3),h.fromArray(i,a[P+2]*3),Math.max(c.y,u.y,h.y)>n+.3)continue;let L=d.subVectors(u,c).cross(g.subVectors(h,c)).length()*.5,X=Math.min(400,Math.max(3,Math.ceil(L*220)));for(let z=0;z<X;z++){let he=A(),_=A();he+_>1&&(he=1-he,_=1-_);let ie=c.x+(u.x-c.x)*he+(h.x-c.x)*_,Ee=c.y+(u.y-c.y)*he+(h.y-c.y)*_,ve=c.z+(u.z-c.z)*he+(h.z-c.z)*_;if(Ee>n)continue;let ge=Math.atan2(ie,ve-In),j=Math.hypot(ie,ve-In),ae=(Math.round((ge+Math.PI)/(2*Math.PI)*Ke)%Ke+Ke)%Ke,fe=Math.round((n-Ee)/Ba);fe>=0&&fe<s&&j>l[ae*s+fe]&&(l[ae*s+fe]=j)}}for(let P=0;P<s;P++)for(let L=0;L<Ke;L++){let X=!0;for(let z=0;z<Ke;z++)if(l[z*s+P]<0){let he=l[(z+Ke-1)%Ke*s+P],_=l[(z+1)%Ke*s+P];he>=0||_>=0?l[z*s+P]=Math.max(he,_):X=!1}if(X)break}for(let P=0;P<Ke;P++)for(let L=1;L<s;L++)l[P*s+L]<0&&(l[P*s+L]=l[P*s+L-1]);for(let P=0;P<Ke;P++)for(let L=s-2;L>=0;L--)l[P*s+L]<0&&(l[P*s+L]=l[P*s+L+1]);let f=(P,L,X)=>{let z=new Float32Array(P.length);for(let he=0;he<Ke;he++)for(let _=0;_<s;_++){let ie=0,Ee=0;for(let ve=-L;ve<=L;ve++)for(let ge=-X;ge<=X;ge++){let j=_+ge;j<0||j>=s||(ie+=P[(he+ve+Ke)%Ke*s+j],Ee++)}z[he*s+_]=ie/Ee}return z},p=(P,L,X)=>{let z=new Float32Array(P.length);for(let he=0;he<Ke;he++)for(let _=0;_<s;_++){let ie=-1;for(let Ee=-L;Ee<=L;Ee++)for(let ve=-X;ve<=X;ve++){let ge=_+ve;ge>=0&&ge<s&&(ie=Math.max(ie,P[(he+Ee+Ke)%Ke*s+ge]))}z[he*s+_]=ie}return z},w=P=>{for(let L=0;L<Ke;L++)for(let X=1;X<s;X++)P[L*s+X]=Math.max(P[L*s+X],P[L*s+X-1]);return P},C=w(p(l,1,1)),x=P=>{for(let L=0;L<Ke;L++)for(let X=1;X<s;X++)P[L*s+X]=Math.max(P[L*s+X],P[L*s+X-1]+Ba*Uh);return P},T=w(f(p(l,4,3),3,3)),y=f(w(p(l,10,6)),8,9),S=new Float32Array(l.length);for(let P=0;P<Ke;P++)for(let L=0;L<s;L++){let X=L*Ba,z=Math.min(1,Math.max(0,(X-.35)/.9)),he=P*s+L;S[he]=T[he]+(y[he]-T[he])*z*z*(3-2*z)}S=x(w(S));for(let P=0;P<S.length;P++)S[P]=Math.max(S[P],C[P]);let U=(P,L)=>{let X=(P+Math.PI)/(2*Math.PI)*Ke,z=Math.floor(X),he=X-z,_=Math.min(s-1,Math.max(0,(n-L)/Ba)),ie=Math.min(s-2,Math.floor(_)),Ee=_-ie,ve=(ae,fe)=>S[(ae%Ke+Ke)%Ke*s+fe],ge=ve(z,ie)*(1-he)+ve(z+1,ie)*he,j=ve(z,ie+1)*(1-he)+ve(z+1,ie+1)*he;return ge*(1-Ee)+j*Ee},D=90,M=[],I=[],H=[],k=[],G=[],Z=[];for(let P=0;P<=Ke;P++){let L=P/Ke*2*Math.PI-Math.PI,X=po(L),z=[],he=[];for(let ie=0;ie<=D;ie++){let Ee=X+(cw-X)*Math.pow(ie/D,1.55),ve=Math.max(0,o-Ee);z.push(Ee),he.push(U(L,Math.max(Ee,o))+hw+ve*Uh)}let _=he.map((ie,Ee)=>{let ve=0,ge=0;for(let j=0;j<=D;j++){let ae=Math.abs(z[j]-z[Ee]),fe=.25+.65*Math.min(1,(X-z[Ee])/2.5);if(ae<fe){let ue=1-ae/fe;ve+=he[j]*ue,ge+=ue}}return ve/ge});for(let ie=0;ie<=D;ie++)_[ie]=Math.max(_[ie],he[ie]),ie&&(_[ie]=Math.max(_[ie],_[ie-1]));k.push(z),G.push(he),Z.push(_)}for(let P=0;P<=D;P++){let L=P/D;for(let X=0;X<=Ke;X++){let z=X/Ke*2*Math.PI-Math.PI,he=po(z),_=k[X][P],ie=Z[X][P],Ee=Math.max(0,he-_),ve=Math.min(1,Ee/2.6)*(.1*Math.sin(z*9+1.3+Ee*.35)+.06*Math.sin(z*17+.4-Ee*.2));ie+=ve+Math.min(1,Ee/.5)*.015,P===0&&(ie-=.03),M.push(Math.sin(z)*ie,_,In+Math.cos(z)*ie),I.push(X/Ke,L)}}for(let P=0;P<D;P++)for(let L=0;L<Ke;L++){let X=P*(Ke+1)+L,z=X+Ke+1;H.push(X,z,X+1,X+1,z,z+1)}let V=new Tt;V.setAttribute("position",new mt(M,3)),V.setAttribute("uv",new mt(I,2)),V.setIndex(H),V.computeVertexNormals();let $=new Xn({color:t,roughness:.82,metalness:0,sheen:.6,sheenRoughness:.6,sheenColor:new Ye("#a9c0d2"),side:$t}),J=new Ze(V,$),te=[],Ae=[],Ue=.26,Pe=.12,qe=8;for(let P=0;P<=qe;P++)for(let L=0;L<=Ke;L++){let X=L/Ke*2*Math.PI-Math.PI,z=po(X),he=P/qe,_=z+.03+Ue-(Ue+.03+Pe)*he,ie=Z[L][0]-.03,Ee=U(X,Math.min(_,z+.03+Ue))+.022+.02*he,ve=Math.min(1,Math.max(0,(he-.45)/.55)),ge=ve*ve*(3-2*ve),j=Math.max(Ee,Ee+(ie+.035-Ee)*ge);te.push(Math.sin(X)*j,_,In+Math.cos(X)*j)}for(let P=0;P<qe;P++)for(let L=0;L<Ke;L++){let X=P*(Ke+1)+L,z=X+Ke+1;Ae.push(X,z,X+1,X+1,z,z+1)}let He=new Tt;He.setAttribute("position",new mt(te,3)),He.setIndex(Ae),He.computeVertexNormals();let O=new Ze(He,new Br({color:r,roughness:.92,metalness:0,side:$t})),ce=new oi;return ce.add(J,O),ce.name="robe",ce}var bu="1.624",dw="0.628",pw="1.627";function gw(){let e=atob(ow),t=new Uint8Array(e.length);for(let d=0;d<e.length;d++)t[d]=e.charCodeAt(d);let r=new DataView(t.buffer),i=r.getUint32(0,!0),a=r.getUint32(4,!0),n=[8,12,16].map(d=>r.getFloat32(d,!0)),o=[20,24,28].map(d=>r.getFloat32(d,!0)),s=32,l=new Float32Array(i*3);for(let d=0;d<i;d++)for(let g=0;g<3;g++)l[d*3+g]=(r.getInt16(s+(d*3+g)*2,!0)+32767)*o[g]+n[g];s+=i*6;let c=new Float32Array(i*3);for(let d=0;d<i*3;d++)c[d]=r.getInt8(s+d)/127;s+=i*3+(i*3&1);let u=new Float32Array(i*2);for(let d=0;d<i*2;d++)u[d]=r.getUint16(s+d*2,!0)/65535;s+=i*4;let h=new Uint16Array(a);for(let d=0;d<a;d++)h[d]=r.getUint16(s+d*2,!0);return{pos:l,nrm:c,uv:u,idx:h}}var Pt=new Tt;{let e=gw();Pt.setAttribute("position",new It(e.pos,3)),Pt.setAttribute("normal",new It(e.nrm,3)),Pt.setAttribute("uv",new It(e.uv,2)),Pt.setIndex(new It(e.idx,1))}var Zt=new hu,vt=new oi,fw=new Uint8Array(8192).fill(255),kr=new uu(fw,128,64,Jn,cr);kr.minFilter=kr.magFilter=or;kr.wrapS=Pn;kr.needsUpdate=!0;var bl={value:kr},Zn={value:new b(1,1,1)},$n={value:1},Aw=`
float hsh(vec3 p){ p = fract(p * vec3(.1031,.1030,.0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hsh(i),hsh(i+vec3(1,0,0)),f.x), mix(hsh(i+vec3(0,1,0)),hsh(i+vec3(1,1,0)),f.x), f.y),
             mix(mix(hsh(i+vec3(0,0,1)),hsh(i+vec3(1,0,1)),f.x), mix(hsh(i+vec3(0,1,1)),hsh(i+vec3(1,1,1)),f.x), f.y), f.z); }
`,Ql=Aw+`
uniform sampler2D uGrid;
uniform vec3 uHairTint; uniform float uDensity;
const float ZC = -0.13;
const float PI_ = 3.14159265;
${tw}
float browMask(vec3 p){
  float ax = abs(p.x);
  float t = clamp((ax - 0.30) / 0.80, 0.0, 1.0);
  float rs = mix(smoothstep(0.0, 0.450, t), clamp(t / 0.450, 0.0, 1.0), 0.000);
  float fl = mix(smoothstep(0.450, 1.0, t), clamp((t - 0.450) / (1.0 - 0.450), 0.0, 1.0), 0.000);
  float yb = ${bu} + 0.315 + 0.080 * rs * (1.0 - 0.750 * fl);
  float th = mix(0.140, 0.058, smoothstep(0.25, 1.0, t)) * mix(0.45, 1.0, smoothstep(0.0, 0.22, t));
  float along = smoothstep(0.27, 0.36, ax) * (1.0 - smoothstep(1.00, 1.12, ax));
  float across = 1.0 - smoothstep(0.3, 1.0, abs(p.y - yb) / th);
  return along * across * smoothstep(0.9, 1.5, p.z);
}
float regionDensity(vec3 p){
  // relative terminal-hair density by region (vertex 1.0; frontal 0.96, occipital 0.90, temporoparietal 0.78)
  float ax = abs(p.x);
  float occ = 1.0 - smoothstep(-0.9, 0.3, p.z);
  float tmp = smoothstep(1.3, 1.8, ax) * (1.0 - smoothstep(2.6, 3.2, p.y));
  float frt = smoothstep(0.6, 1.6, p.z) * smoothstep(2.6, 3.2, p.y);
  float f = mix(1.0, 0.90, occ);
  f = mix(f, 0.78, tmp);
  return mix(f, 0.96, frt);
}
float hairLen(vec3 p){
  float vol = 1.0 + 0.16 * smoothstep(0.3, 2.3, p.z) * smoothstep(2.7, 3.5, p.y);
  float g = gridValue(p);
  float Lh = g;
  // The rear begins fully uncut at one compact length; only a clipper stroke changes it.
  float rear = 1.0 - smoothstep(0.15, 0.9, p.z);
  float growthScale = mix(vol, 0.62, rear);
  float s = hairMask(p) * Lh;
  return max(s, browMask(p) * 0.06);
}
`,Gi=new Xn({color:16777215,roughness:.56,metalness:0,specularIntensity:.55,sheen:.6,sheenRoughness:.5,sheenColor:new Ye("#ff8f7a"),envMapIntensity:.8});Gi.onBeforeCompile=e=>{e.uniforms.uGrid=bl,e.uniforms.uHairTint=Zn,e.uniforms.uDensity=$n,e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vObj;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vObj = position;`),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 vObj;
`+Ql+`
    float skinBump(vec3 P){ return .55 * n3(P * 62.0) + .30 * n3(P * 118.0) + .15 * n3(P * 36.0); }
  `).replace("#include <map_fragment>",`
      vec3 P = vObj; float aX = abs(P.x);
      vec3 tone = vec3(.66, .385, .30);
      tone *= 1.0 + .10 * (n3(P * 1.1) - .5);
      tone += vec3(.05, -.012, -.01) * (n3(P * 2.6 + 4.0) - .5);
      tone += vec3(.035, -.01, -.008) * (n3(P * 9.0 + 11.0) - .5);
      float pores = pow(n3(P * 85.0), 4.0);
      tone *= 1.0 - .14 * pores;
      float fr = smoothstep(.2, 2.0, P.z);
      float cheek = fr * (1.0 - smoothstep(.55, 1.5, aX - .35)) * smoothstep(-.4, .5, P.y) * (1.0 - smoothstep(1.3, 1.9, P.y));
      tone += vec3(.075, -.02, -.015) * cheek;
      float nose = 1.0 - smoothstep(.0, .5, length(vec3(P.x, P.y - .8, P.z - 2.5)));
      tone += vec3(.07, -.02, -.015) * nose;
      float ear = smoothstep(1.66, 1.85, aX) * (1.0 - smoothstep(2.2, 2.7, P.y));
      tone += vec3(.09, -.02, -.01) * ear;
      // lips + mouth line
      float ly = P.y - .125;
      float lipW = 1.0 - smoothstep(.55, .72, aX);
      float upL = (1.0 - smoothstep(.55, .95, length(vec2(P.x / .66, (ly - .12) / .15)))) * step(.0, ly);
      float loL = (1.0 - smoothstep(.55, .95, length(vec2(P.x / .62, (ly + .13) / .21)))) * step(ly, .0);
      float lipsM = max(upL, loL) * smoothstep(1.8, 2.2, P.z) * lipW;
      float lipTone = n3(P * 40.0);
      vec3 lipC = mix(vec3(.70, .30, .28), vec3(.66, .26, .24), step(ly, .0)) * (.9 + .2 * lipTone);
      lipC *= 1.0 - .25 * (1.0 - smoothstep(.0, .06, abs(ly - .06)));
      tone = mix(tone, lipC, lipsM * .95);
      float mline = (1.0 - smoothstep(.0, .022, abs(ly + .035 * P.x * P.x * 2.0))) * (1.0 - smoothstep(.5, .66, aX)) * smoothstep(1.9, 2.3, P.z);
      tone *= 1.0 - .6 * mline;
      // nostrils
      float nost = 1.0 - smoothstep(.04, .13, length(vec3((aX - .21) * 1.2, (P.y - .60) * 1.6, P.z - 2.36)));
      tone *= 1.0 - .7 * nost;
      // eye sockets, lid creases, lash lines
      vec3 eC = vec3(aX - ${dw}, P.y - ${bu}, P.z - ${pw});
      float eyesock = 1.0 - smoothstep(.0, .8, length(eC));
      tone *= 1.0 - .20 * eyesock;
      vec2 eo = vec2(eC.x / .40, eC.y / .21);
      float ring = 1.0 - smoothstep(.0, .12, abs(length(eo) - 1.0));
      float upper = smoothstep(-.1, .5, eC.y);
      tone *= 1.0 - ring * (.25 + .35 * upper) * smoothstep(.4, 1.0, P.z);
      float crease = (1.0 - smoothstep(.0, .06, abs(length(vec2(eC.x / .46, (eC.y - .12) / .30)) - 1.0))) * upper;
      tone *= 1.0 - .08 * crease;
      float bm = browMask(P);
      float browHair = .72 + .5 * n3(P * vec3(95.0, 230.0, 95.0));
      tone = mix(tone, vec3(.085, .055, .04) * uHairTint * browHair, clamp(bm * 1.25, 0.0, .94));
      // faint 5 o'clock shadow on jaw / upper lip for a masculine, young look
      float jaw = smoothstep(-.9, -.25, P.y) * (1.0 - smoothstep(.15, .5, P.y)) * smoothstep(.6, 1.7, P.z) * (1.0 - smoothstep(1.2, 1.9, aX));
      float ulip = (1.0 - smoothstep(.0, .22, abs(P.y - .28))) * (1.0 - smoothstep(.2, .6, aX)) * smoothstep(2.0, 2.4, P.z);
      float stub = pow(n3(P * 95.0), 2.0);
      tone *= 1.0 - .13 * (jaw * .8 + ulip) * (.5 + stub);
      // scalp / fade skin
      float Lh = hairLen(P);
      float hm = hairMask(P);
      float st = hm * smoothstep(1.0, 2.3, P.y);
      tone = mix(tone, vec3(.62, .36, .27), hm * smoothstep(1.2, 1.9, P.y) * .9);
      tone = mix(tone, tone * vec3(.26, .19, .16), st * .88 * smoothstep(0.0,.12,gridValue(P)));
      tone = mix(tone, vec3(.035, .024, .018)*uHairTint, smoothstep(.06, .32, Lh) * .92);
      diffuseColor.rgb = tone;`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, .26, lipsM);
      roughnessFactor = mix(roughnessFactor, .44, smoothstep(2.2, 3.0, P.y) * fr * .6);`).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
      {
        float hb = skinBump(vObj);
        vec2 dh = vec2(dFdx(hb), dFdy(hb));
        vec3 q0 = dFdx(-vViewPosition), q1 = dFdy(-vViewPosition);
        vec3 R1 = cross(q1, normal), R2 = cross(normal, q0);
        float det = dot(q0, R1);
        vec3 grad = sign(det) * (dh.x * R1 + dh.y * R2);
        normal = normalize(abs(det) * normal - .0022 * grad * (1.0 - .6 * lipsM));
      }`)};vt.add(new Ze(Pt,Gi));var ll=uw(Pt);vt.add(ll);var Fh=1.7,mw=.15,Ew=2.55,ww=-1.12,Lh=new Pr(new b(0,1,0),0),Cw=new Ze(Pt,new fr({uniforms:{uGrid:bl,uHairTint:Zn,uDensity:$n},transparent:!0,depthWrite:!1,vertexShader:"varying vec3 vRoot; void main(){vRoot=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*.003,1.0);}",fragmentShader:Ql+`varying vec3 vRoot;void main(){float g=gridValue(vRoot),m=hairMask(vRoot);if(g<.0001||m<.001)discard;float coverage=m*smoothstep(0.0,.28,g)*.92;float fiber=.90+.10*n3(vRoot*110.0);gl_FragColor=vec4(vec3(.040,.025,.016)*uHairTint*fiber,coverage);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));vt.add(Cw);var es=document.createElement("canvas");es.width=1024;es.height=512;{let e=es.getContext("2d");e.scale(.5,.5),e.fillStyle="#efe7e0",e.fillRect(0,0,2048,1024);for(let o=0;o<70;o++){let s=(Math.random()<.5?.05+Math.random()*.12:.38+Math.random()*.12)*2048,l=(.25+Math.random()*.5)*1024;e.strokeStyle=`rgba(190,90,85,${.05+Math.random()*.12})`,e.lineWidth=1.5,e.beginPath(),e.moveTo(s,l),e.bezierCurveTo(s+30,l+20*(Math.random()-.5),s+60,l+40*(Math.random()-.5),s+90*(Math.random()<.5?1:-1),l+30*(Math.random()-.5)),e.stroke()}let t=512,r=512,i=150;e.save(),e.translate(t,r),e.scale(1,300/i),e.fillStyle="rgba(40,30,28,.28)",e.beginPath(),e.arc(0,0,i*1.08,0,7),e.fill();let n=e.createRadialGradient(0,0,10,0,0,i);n.addColorStop(0,"#060606"),n.addColorStop(.2,"#060606"),n.addColorStop(.24,"#a8c4d6"),n.addColorStop(.5,"#5d90b3"),n.addColorStop(.78,"#34688d"),n.addColorStop(.93,"#1d3c55"),n.addColorStop(1,"#0d1a24"),e.fillStyle=n,e.beginPath(),e.arc(0,0,i,0,7),e.fill();for(let o=0;o<160;o++){let s=Math.random()*6.283,l=i*(.32+Math.random()*.1),c=i*(.62+Math.random()*.33);e.strokeStyle=`rgba(${170+Math.random()*70|0},${200+Math.random()*45|0},225,${.1+Math.random()*.22})`,e.lineWidth=1.6,e.beginPath(),e.moveTo(Math.cos(s)*l,Math.sin(s)*l),e.lineTo(Math.cos(s)*c,Math.sin(s)*c),e.stroke()}e.restore()}var ts=new Fg(es);ts.colorSpace=Lt;ts.anisotropy=8;var vw=new Xn({map:ts,roughness:.08,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:1.4});for(let e of[[.628,1.624,1.627],[-.628,1.624,1.627]]){let t=new Ze(new Pg(.305,40,30),vw);t.position.set(e[0],e[1],e[2]+.01),vt.add(t)}var xr={lA:{value:new b},lB:{value:new b},lC:{value:new b},cam:{value:new b}},Qu=rw(Pt.attributes.position.array,Pt.index.array),Oi=aw(Pt,Ql,{uGrid:bl,uHairTint:Zn,uDensity:$n,lA:xr.lA,lB:xr.lB,lC:xr.lC,cam:xr.cam});vt.add(Oi.mesh);iw(Qu,Oi.roots);var ft=.43,Yn=-.4703,Ul=.13*ft;vt.scale.setScalar(ft);vt.position.set(0,Yn,Ul);Zt.add(vt);Zt.add(new $g("#ffe8d0","#2a1c14",.35));var cl=new _l("#fff0dc",1.7),hl=new _l("#ffc27a",1.7),ul=new _l("#8fa8ff",.45);Zt.add(cl,hl,ul);var ze=new Jt(34,1,.1,20),Mw=[-.5,.6,.25],Dw=[.8,.3,-1.5],Bw=[.8,-.2,.4],xa=new b,Uu=new b,Fu=new b,Pi=new b,_a=new b(0,.1,0),Lu=[];for(let e=0;e<Pt.attributes.position.count;e++){let t=new b().fromBufferAttribute(Pt.attributes.position,e);t.y>=-.9&&Math.abs(t.x)<2.3&&Lu.push([t.x*ft,t.y*ft+Yn,t.z*ft+Ul])}var xw=Xi(Rl)/Ru*ft;function go(e,t,r,i){e.position.copy(r).addScaledVector(Uu,t[0]*i).addScaledVector(Pi,t[1]*i).addScaledVector(Fu,-t[2]*i)}var _w={1:"#b8923f",2:"#5f9a6e",3:"#4f7fa8",4:"#8a5fa0"};function Sw(){let e=new oi,t=new Xn({color:"#25282b",metalness:.05,roughness:.5,clearcoat:.6,clearcoatRoughness:.3}),r=new Br({color:"#141516",metalness:0,roughness:.85}),i=new Br({color:"#cfd5da",metalness:1,roughness:.22}),a=new Br({color:"#8a9298",metalness:1,roughness:.38}),n=new Br({color:"#b9bfc4",metalness:.9,roughness:.3}),o=[[.3,0],[.33,.1],[.36,.35],[.375,.8],[.37,1.25],[.345,1.62],[.3,1.82],[.2,1.92],[.001,1.95]],s=new Ze(new Ng(o.map(w=>new je(w[0],w[1])),40),t);s.scale.set(1,1,.62),s.position.set(0,.3,.02),e.add(s);for(let w of[-1,1]){let C=new Ze(new Lg(.07,.9,6,14),r);C.scale.set(.6,1,.45),C.position.set(w*.27,1.1,.09),e.add(C)}let l=new Ze(new Wt(.84,.26,.17),t);l.position.set(0,.18,0),e.add(l);let c=new Ze(new Wt(.86,.028,.19),i);c.position.set(0,.32,0),e.add(c);let u=new Ze(new Wt(.18,.035,.008),n);u.position.set(0,1,.205),e.add(u);let h=new Ze(new Wt(.09,.2,.03),r);h.position.set(0,1.45,.2),e.add(h);let d=new Ze(new Wt(.1,.024,.034),n);d.position.set(0,1.56,.2),e.add(d);let g=new Ze(new Wt(.8,.12,.018),i);g.position.set(0,.06,-.004),e.add(g);let m=new Ze(new Wt(.76,.05,.012),a);m.position.set(0,.015,-.012),e.add(m);let A=33,f=.78/A;for(let w=0;w<A;w++){let C=new Ze(new Wt(f*.55,.035,.014),i);C.position.set(-.39+f*(w+.5),-.012,-.004),e.add(C)}let p=new Ze(new Wt(.86,.2,.05),new Br({color:"#6e7479",metalness:0,roughness:.55,transparent:!0,opacity:.88}));return p.position.set(0,.07,-.035),p.visible=!1,e.add(p),e.visible=!1,e.userData.comb=p,e}function Nu(e){let t=new Z0({canvas:e,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.localClippingEnabled=!0,t.outputColorSpace=Lt,t.toneMapping=Ph,t.toneMappingExposure=.95,t.setClearColor(0,0);let r=new nl(t);Zt.environment=r.fromScene(new nw,.04).texture,Zt.environmentIntensity=.4,r.dispose();let i=Sw();Zt.add(i);let a=uo.bladeWidthUnits*ft/2,n=uo.bladeDepthUnits*ft/2,o=new Qg(new Tt().setFromPoints([new b(-a,-n,0),new b(a,-n,0),new b(a,n,0),new b(-a,n,0)]),new du({color:14336922,transparent:!0,opacity:.55,depthWrite:!1}));o.visible=!1,Zt.add(o);let s=new Float32Array(144),l=new Float32Array(48),c=new Float32Array(144),u=new Tt;u.setAttribute("position",new It(s,3));let h=new Ug(u,new pu({color:6242346,size:.012,transparent:!0,opacity:.75,depthWrite:!1}));h.frustumCulled=!1,h.visible=!1,Zt.add(h);let d=0,g=performance.now();function m(ue){if(w)for(let ye=0;ye<Math.ceil(2+ue*5);ye++){let Ie=d++%48;l[Ie]=.5;for(let B=0;B<3;B++)s[Ie*3+B]=w.point.getComponent(B),c[Ie*3+B]=(Math.random()-.5)*.35;c[Ie*3+1]=.05}}function A(){let ue=performance.now(),ye=Math.min(.05,(ue-g)/1e3);g=ue;let Ie=0;for(let B=0;B<48;B++){if(l[B]<=0){s[B*3+1]=-100;continue}Ie++,l[B]-=ye,c[B*3+1]-=ye*.7;for(let E=0;E<3;E++)s[B*3+E]+=c[B*3+E]*ye}h.visible=Ie>0,u.attributes.position.needsUpdate=Ie>0}let f=!1,p=1,w=null,C=0,x=0,T=new b,y=new b,S=new b,U=new b,D=new b,M=new nt;function I(){let ue=i.userData.comb;ue.visible=p>0,ue.visible&&ue.material.color.set(_w[p]||"#e8b44c")}I();let H=10,k=!1,G=-55,Z=ew(),V=!0,$=Math.max(1,Math.min(2,globalThis.devicePixelRatio||1)),J=$,te=3e4,Ae=0,Ue=16,Pe=0,qe=kr.image.data;function He(ue){te=Math.max(16e3,Math.min(Oi.count,ue)),Oi.setCount(te)}He(te);let O={x:0,y:0,width:1,height:1},ce=new nt;function P(){var ue;let ye=Math.max(1,e.clientWidth),Ie=Math.max(1,e.clientHeight),B=Math.floor(ye*$),E=Math.floor(Ie*$);(e.width!==B||e.height!==E)&&(t.setPixelRatio($),t.setSize(ye,Ie,!1));let Q=(ue=e.parentElement.querySelector(".play-area"))==null?void 0:ue.getBoundingClientRect(),K=e.getBoundingClientRect();O=Q&&Q.width>0&&Q.height>0?{x:Q.left-K.left,y:Q.top-K.top,width:Q.width,height:Q.height}:{x:0,y:0,width:ye,height:Ie},ze.aspect=O.width/O.height,ze.fov=34,ze.updateProjectionMatrix()}function L(){let ue=sw(Lu,ze.aspect,G,H,xw,ze.fov);_a.set(...ue.center),ze.position.set(...ue.position),ze.lookAt(_a),ze.updateMatrixWorld(),Fu.set(0,0,-1).applyQuaternion(ze.quaternion),Uu.set(1,0,0).applyQuaternion(ze.quaternion),Pi.set(0,1,0).applyQuaternion(ze.quaternion),go(cl,Mw,ze.position,15*.28),go(hl,Dw,ze.position,15*.28),go(ul,Bw,ze.position,15*.28),xr.lA.value.copy(cl.position).sub(_a).normalize(),xr.lB.value.copy(hl.position).sub(_a).normalize(),xr.lC.value.copy(ul.position).sub(_a).normalize(),xa.copy(ze.position).sub(vt.position).divideScalar(ft),xr.cam.value.copy(xa)}function X(){if(V){for(let ue=0;ue<Z.length;ue++)qe[ue]=Math.round(Xi(Z[ue])/Xi(Rl)*255);kr.needsUpdate=!0,V=!1}}function z(){let ue=f&&w;if(o.visible=!!ue,ue){o.position.copy(w.point).addScaledVector(w.normal,.008);let E=new b(...w.bladeAcross),Q=new b(...w.bladeAlong);o.quaternion.setFromRotationMatrix(new nt().makeBasis(E,Q.clone().negate(),w.normal))}if(C=ue?C+(1-C)*.35:0,i.visible=C>.03,!i.visible||!w)return;x+=.9,y.copy(w.point),T.copy(y);let ye=w.normal,Ie=xa.copy(Pi).addScaledVector(ye,-Pi.dot(ye)).normalize();S.copy(Ie).multiplyScalar(-.9).addScaledVector(ye,.42).normalize(),U.crossVectors(ye,Ie).normalize(),D.crossVectors(U,S).normalize(),M.makeBasis(U,S,D),i.quaternion.setFromRotationMatrix(M);let B=Math.sin(x*3.1)*.0035;i.position.copy(T).addScaledVector(w.normal,.012).addScaledVector(U,B),i.scale.setScalar(uo.modelScale)}function he(ue){Pe&&(Ue=Ue*.93+(ue-Pe)*.07),Pe=ue,Ae+=1,!(Ae%40)&&(Ue>24&&te>16e3?He(te-4e3):Ue>30&&$>1.2?$=Math.max(1.1,$-.25):Ue<18&&te<Oi.count?He(te+2e3):Ue<17.5&&$<J&&($=Math.min(J,$+.25)))}function _(ue=!0){if(k)return;ue?he(performance.now()):Pe=0,P(),L(),X(),z(),A();let ye=e.clientWidth,Ie=e.clientHeight,B=ze.near,E=B*Math.tan(Fc.degToRad(ze.fov/2)),Q=E*ze.aspect,K=2*E/O.height;ce.copy(ze.projectionMatrix),ze.projectionMatrix.makePerspective(-Q-O.x*K,Q+(ye-O.x-O.width)*K,E+O.y*K,-E-(Ie-O.y-O.height)*K,B,ze.far),ze.projectionMatrixInverse.copy(ze.projectionMatrix).invert(),t.setScissorTest(!1),t.setViewport(0,0,ye,Ie),t.render(Zt,ze),ze.projectionMatrix.copy(ce),ze.projectionMatrixInverse.copy(ce).invert()}let ie=Pt.attributes.position.array,Ee=Pt.index.array,ve=new ff,ge=new je;function j(ue,ye){P(),L();let Ie=e.getBoundingClientRect(),B=ue-Ie.left-O.x,E=ye-Ie.top-O.y;if(B<0||B>O.width||E<0||E>O.height)return w=null,null;ge.set(B/O.width*2-1,1-E/O.height*2),ve.setFromCamera(ge,ze);let Q=(ve.ray.origin.x-vt.position.x)/ft,K=(ve.ray.origin.y-vt.position.y)/ft,re=(ve.ray.origin.z-vt.position.z)/ft,q=ve.ray.direction.x,Me=ve.ray.direction.y,pe=ve.ray.direction.z,xe=1/0,be=0;for(let R=0;R<Ee.length;R+=3){let le=Ee[R]*3,de=Ee[R+1]*3,Be=Ee[R+2]*3,ne=ie[de]-ie[le],ee=ie[de+1]-ie[le+1],Se=ie[de+2]-ie[le+2],Ne=ie[Be]-ie[le],ut=ie[Be+1]-ie[le+1],et=ie[Be+2]-ie[le+2],Ht=Me*et-pe*ut,Gt=pe*Ne-q*et,hr=q*ut-Me*Ne,di=ne*Ht+ee*Gt+Se*hr;if(Math.abs(di)<1e-9)continue;let pi=1/di,gi=Q-ie[le],Ir=K-ie[le+1],fi=re-ie[le+2],Rr=(gi*Ht+Ir*Gt+fi*hr)*pi;if(Rr<0||Rr>1)continue;let ra=Ir*Se-fi*ee,ia=fi*ne-gi*Se,za=gi*ee-Ir*ne,Ya=(q*ra+Me*ia+pe*za)*pi;if(Ya<0||Rr+Ya>1)continue;let aa=(Ne*ra+ut*ia+et*za)*pi;aa>0&&aa<xe&&(xe=aa,be=R)}if(!isFinite(xe))return w=null,null;let se=Q+q*xe,me=K+Me*xe,Fe=re+pe*xe;{let R=Ee[be]*3,le=Ee[be+1]*3,de=Ee[be+2]*3,Be=new b(ie[le]-ie[R],ie[le+1]-ie[R+1],ie[le+2]-ie[R+2]),ne=new b(ie[de]-ie[R],ie[de+1]-ie[R+1],ie[de+2]-ie[R+2]),ee=Be.cross(ne).normalize();ee.x*q+ee.y*Me+ee.z*pe>0&&ee.negate(),w={point:new b(se*ft+vt.position.x,me*ft+vt.position.y,Fe*ft+vt.position.z),normal:ee}}if(Na(se,me,Fe)<.05)return w=null,null;let _e=w.normal,we=new b().copy(Pi).addScaledVector(_e,-Pi.dot(_e)).normalize(),Ve=new b().crossVectors(_e,we).normalize();return w.bladeAcross=Ve.toArray(),w.bladeAlong=we.toArray(),dl(Nn({},Tl(se,me,Fe)),{position:[se,me,Fe],normal:_e.toArray(),bladeAcross:Ve.toArray(),bladeAlong:we.toArray()})}let ae=ue=>{ue.preventDefault(),k=!0},fe=()=>{k=!1,V=!0,Pe=0};return e.addEventListener("webglcontextlost",ae),e.addEventListener("webglcontextrestored",fe),{surface:Qu,emitHair:m,setAppearance(ue){let ye=[[.3,.32,.38],[.48,.48,.52],[.72,.68,.64],[1,1,1],[1.55,1.36,1.16],[2.3,1.95,1.55],[3.1,2.65,1.95],[4,3.35,2.05],[5.1,4.45,3.1],[2.4,1.25,.8],[4,1.8,.75],[2.1,3.15,5.2]],Ie=[.94,.96,.98,1,.98,.97,.96,.95,.94,.96,.94,.92],B=Math.max(0,Math.min(ye.length-1,ue|0));Zn.value.set(...ye[B]),$n.value=Ie[B]},setElevation(ue){H=ue},headScreen(){P(),L();let ue=e.getBoundingClientRect(),ye=new b,Ie=1e9,B=-1e9,E=1e9,Q=-1e9;for(let K=0;K<ie.length;K+=12){if(ie[K+1]<Fh-.2)continue;ye.set(ie[K]*ft+vt.position.x,ie[K+1]*ft+vt.position.y,ie[K+2]*ft+vt.position.z).project(ze);let re=ue.left+O.x+(ye.x+1)/2*O.width,q=ue.top+O.y+(1-ye.y)/2*O.height;re<Ie&&(Ie=re),re>B&&(B=re),q<E&&(E=q),q>Q&&(Q=q)}return{x:(Ie+B)/2,y:(E+Q)/2,left:Ie,right:B,top:E,bottom:Q,r:(Q-E)/2}},thumbnail(ue,ye=-55,Ie=15,{headOnly:B=!1,size:E=180}={}){let Q=E;B&&(ll.visible=!1,Lh.constant=-(ww*ft+Yn),Gi.clippingPlanes=[Lh],Gi.needsUpdate=!0);let K=Z,re=G,q=H,Me=f,pe=ze.aspect,xe=ze.fov,be=t.getRenderTarget(),se=h.visible;Z=ue,G=ye,H=Ie,f=!1,V=!0,X(),z(),h.visible=!1;let me=new zr(Q,Q,{samples:4});if(me.texture.colorSpace=Lt,ze.aspect=1,ze.fov=B?30:40,ze.updateProjectionMatrix(),L(),B){let le=new b(0,Fh*ft+Yn,mw*ft+Ul),de=new b;ze.getWorldDirection(de);let Be=Ew*ft*1.24/Math.tan(Fc.degToRad(ze.fov/2));ze.position.copy(le).addScaledVector(de,-Be),ze.lookAt(le),ze.updateMatrixWorld(),xa.copy(ze.position).sub(vt.position).divideScalar(ft),xr.cam.value.copy(xa)}t.setScissorTest(!1),t.setRenderTarget(me),t.render(Zt,ze);let Fe=new Uint8Array(Q*Q*4);t.readRenderTargetPixels(me,0,0,Q,Q,Fe);let _e=document.createElement("canvas");_e.width=Q,_e.height=Q;let we=_e.getContext("2d"),Ve=we.createImageData(Q,Q);for(let le=0;le<Q;le++)Ve.data.set(Fe.subarray((Q-1-le)*Q*4,(Q-le)*Q*4),le*Q*4);we.putImageData(Ve,0,0);let R=_e.toDataURL("image/png");return B&&(ll.visible=!0,Gi.clippingPlanes=[],Gi.needsUpdate=!0),t.setRenderTarget(be),t.setViewport(0,0,e.clientWidth,e.clientHeight),me.dispose(),Z=K,G=re,H=q,f=Me,h.visible=se,ze.aspect=pe,ze.fov=xe,ze.updateProjectionMatrix(),V=!0,X(),L(),z(),R},resetTiming(){Pe=0},destroy(){var ue;e.removeEventListener("webglcontextlost",ae),e.removeEventListener("webglcontextrestored",fe),Zt.traverse(ye=>{var Ie,B;(Ie=ye.geometry)==null||Ie.dispose(),Array.isArray(ye.material)?ye.material.forEach(E=>E.dispose()):(B=ye.material)==null||B.dispose()}),kr.dispose(),ts.dispose(),(ue=Zt.environment)==null||ue.dispose(),t.dispose()},render:_,setYaw(ue){G=ue},setHair(ue){Z=ue,V=!0},raycast:j,getYaw(){return G},grow(){He(Oi.count)},setClipper(ue,ye){f=!!ue,ye!==void 0&&(p=ye,I()),f||(w=null)},setClipperGuard(ue){p=ue,I()}}}var Fl="skin-fade-studio-session-v2",Ll="skin-fade-studio-audio-v1",yw=e=>e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2;function Pu({root:e,client:t,savedSession:r,savedAudio:i=!0}){let a=e.querySelector("#scene"),n=Nu(a),o=vc(),s=gt(rt({},Rs(r!=null?r:Ei())),{freeStyle:!0}),l=ga(s.adCadence),c=!1,u=!1,h=!1,d=!0,g=i===!1?0:i===!0?1:Math.max(0,Math.min(1,Number(i)||0)),m=g>0,A=g>0?g:1,f=null,p=0,w=0,C=!1,x=s.status==="reveal",T=!1,y=!1,S=performance.now(),U=S,D=0,M=s.cameraYawDeg,I=!1,H={key:"",spot:null},k=new Set,G=!1,Z=()=>{G||(G=!0,queueMicrotask(()=>{G=!1,k.forEach(j=>j())}))},V=()=>{U=performance.now()};function $(j=!1){clearTimeout(p);let ae=()=>(s=gt(rt({},s),{adCadence:rt({},l)}),t.saveProgress(Fl,s).then(()=>{I=!1,Z()}).catch(fe=>{throw I=!0,Z(),fe}));return j?ae():(p=setTimeout(()=>ae().catch(()=>{}),220),Promise.resolve())}function J(){var j,ae;e.classList.add("free-style"),n.setAppearance((ae=(j=s.look)==null?void 0:j.colour)!=null?ae:1),n.setYaw(s.cameraYawDeg),n.setElevation(s.cameraElevation),n.setHair(s.hair),Z()}function te(){o.setVolume(g),o.setEnabled(d&&m&&!c)}function Ae(){if(f)try{a.releasePointerCapture(f.id)}catch(j){}f=null,o.stop(),n.setClipper(!1)}function Ue(j){let ae=j.clientX,fe=j.clientY-(j.pointerType==="touch"?Math.min(ur.touchOffsetPx,a.clientHeight*.12):0),ue=n.raycast(ae,fe);if(n.setClipper(!!ue,s.selectedGuard),!ue){f&&(f.lastUv=null),o.stop();return}o.start(s.selectedGuard);let ye=f!=null&&f.lastUv?[f.lastUv,ue]:[ue],Ie=Ts(s,ye,{surface:n.surface});f&&(f.lastUv=ue),s=Ie.state,Ie.changed&&(n.setHair(s.hair),n.emitHair(Ie.intensity),Z(),o.cut(en(s.selectedGuard,Ie.intensity)),navigator.vibrate&&navigator.vibrate(en(s.selectedGuard,Ie.intensity).hapticMs),$())}function Pe(j){let ae=j.clientY-(j.pointerType==="touch"?Math.min(ur.touchOffsetPx,a.clientHeight*.12):0),fe=j.pointerType==="touch"?22:12;if(n.raycast(j.clientX,ae))return!0;for(let ue=0;ue<8;ue++){let ye=ue*Math.PI/4;if(n.raycast(j.clientX+Math.cos(ye)*fe,ae+Math.sin(ye)*fe))return!0}return!1}function qe(j){if(c||T||s.status!=="cutting"||j.button>0||f)return;V(),o.unlock();let ae=s.interactionMode==="cut";a.setPointerCapture(j.pointerId),f={id:j.pointerId,x:j.clientX,y:j.clientY,lastUv:null},ae&&Ue(j),j.preventDefault()}function He(j){!f||f.id!==j.pointerId||c||s.status!=="cutting"||(V(),s.interactionMode==="rotate"?(s=Za(s,(j.clientX-f.x)*.36,(f.y-j.clientY)*.25),n.setYaw(s.cameraYawDeg),n.setElevation(s.cameraElevation)):Ue(j),f.x=j.clientX,f.y=j.clientY,j.preventDefault())}function O(j){(f==null?void 0:f.id)===j.pointerId&&(Ae(),$())}let ce=()=>{Ae(),C||n.render(!1)},P=typeof ResizeObserver=="function"?new ResizeObserver(ce):{observe(){},disconnect(){}};P.observe(e),globalThis.addEventListener("resize",ce);let L=j=>j.preventDefault();a.addEventListener("contextmenu",L);for(let[j,ae]of[["pointerdown",qe],["pointermove",He],["pointerup",O],["pointercancel",O],["lostpointercapture",O]])a.addEventListener(j,ae);function X(){c||T||s.status!=="cutting"||(V(),Ae(),M=s.cameraYawDeg,s=$a(ys(s,n.surface.weights)),l=wc(l,{meaningful:!0,freeStyle:!0}),s=gt(rt({},s),{freeStyle:!0,adCadence:rt({},l)}),y=!1,x=!1,D=0,J(),$(!0).catch(()=>{}),t.sendAnalytics("haircut_completed",{job:s.jobId}))}function z(j){if(c||T||s.status!=="cutting")return;V(),Ae(),o.unlock();let ae=s.selectedGuard;s=Ss(s,j),s.selectedGuard!==ae&&(o.shift(s.selectedGuard),navigator.vibrate&&navigator.vibrate(12)),n.setClipperGuard(j),J(),$()}function he(j,ae=0){if(c||T||s.status!=="cutting")return;V(),Ae();let fe=s.interactionMode==="cut";s=pa(Za(pa(s,!1),j,ae),fe),J(),$()}function _(){c||T||s.status!=="cutting"||(V(),Ae(),o.unlock(),s=pa(s,s.interactionMode!=="cut"),J(),$())}function ie(){y=!0,U=performance.now()}async function Ee(){if(c||T||s.status!=="reveal"||!x)return!1;V(),T=!0,Z();try{let j=Cc(l);if(j.showInterstitial&&!y)try{await $(!0);let ae=await t.showInterstitial("next-customer",{onDisplay:ie});ae&&(l=j.adSession),t.sendAnalytics("interstitial_outcome",{opened:ae,nextClick:s.jobId})}catch(ae){}return C?!1:(s=gt(rt({},Is(s)),{freeStyle:!0,adCadence:rt({},l)}),x=!1,y=!1,J(),await $(!0).catch(()=>{}),!0)}finally{T=!1,Z()}}function ve(j){if(C)return;let ae=Math.max(0,Math.min(100,j-S));if(S=j,!c){if(s.status==="cutting"&&(l=Ec(l,ae),s.guideRemainingMs>0)){let fe=Math.ceil(s.guideRemainingMs/1e3),ue=Math.max(0,s.guideRemainingMs-ae);s=gt(rt({},s),{guideRemainingMs:ue}),Math.ceil(ue/1e3)!==fe&&Z(),ue===0&&$()}if(s.status==="reveal"&&!x){D+=ae;let fe=Math.min(1,D/1500);n.setYaw(M+360*yw(fe)),fe===1&&(x=!0,Z())}(f||s.status==="reveal"&&!x||j%66<20)&&n.render(!!(f||s.status==="reveal"&&!x))}w=requestAnimationFrame(ve)}t.setUserAudioEnabled(m),J(),te(),w=requestAnimationFrame(ve);function ge(){c=u||h,S=performance.now(),n.resetTiming(),c&&(Ae(),$(!0).catch(()=>{})),te(),Z()}return{renderFirstPlayableFrame(){n.render()},setPaused(j){u=!!j,ge()},setUserPaused(j){h=!!j,ge()},setPlatformAudio(j){d=!!j,te()},getState:()=>s,getView:()=>({revealComplete:x,paused:c,userPaused:h,volume:g,audio:m&&d,showAudioControl:t.platformId!=="youtube",busy:T,saveError:I,surface:n.surface}),subscribe(j){return k.add(j),()=>k.delete(j)},selectGuard:z,turn:he,toggleClipper:_,finish:X,headScreen:()=>n.headScreen(),hairHint(){let j=n.headScreen(),ae=[s.cameraYawDeg,s.cameraElevation,a.clientWidth,a.clientHeight,Math.round(j.left),Math.round(j.top)].join();return H.key===ae?H.spot:(H.key=ae,H.spot=(()=>{let fe=j.right-j.left,ue=j.bottom-j.top;for(let ye of[.22,.3,.15,.4])for(let Ie of[.45,.35,.55,.28,.62,.4,.5]){let B=j.left+fe*Ie,E=j.top+ue*ye;if(n.raycast(B,E)&&n.raycast(B,E+45)&&n.raycast(B,E+90))return{x:B,y:E}}return{x:j.x,y:j.top+ue*.3}})())},completeTutorial(){s.tutorialSeen||(s=$a(s),Z(),$())},next:Ee,setUserAudio(j){u||(g>0&&(A=g),g=typeof j=="number"?Math.max(0,Math.min(1,j)):j?g>0?g:A:0,m=g>0,t.setUserAudioEnabled(m),t.saveProgress(Ll,g).catch(()=>{}),te(),Z())},destroy(){C=!0,P.disconnect(),globalThis.removeEventListener("resize",ce),a.removeEventListener("contextmenu",L),clearTimeout(p),cancelAnimationFrame(w),Ae();for(let[j,ae]of[["pointerdown",qe],["pointermove",He],["pointerup",O],["pointercancel",O],["lostpointercapture",O]])a.removeEventListener(j,ae);o.destroy(),n.destroy(),k.clear()}}}function Iw(){let e=new Map,t=new Map;return{__localPreview:!0,async initialize(){return!0},platform:{id:"playgama",language:"en",isAudioEnabled:!0,isPaused:!1,on(i,a){t.has(i)||t.set(i,new Set),t.get(i).add(a)},off(i,a){var n;(n=t.get(i))==null||n.delete(a)},sendMessage(){}},storage:{async get(i){return i.map(a=>{var n;return(n=e.get(a))!=null?n:null})},async set(i,a){i.forEach((n,o)=>e.set(n,a[o]))},async delete(i){i.forEach(a=>e.delete(a))}},advertisement:{isInterstitialSupported:!0,isRewardedSupported:!0,interstitialState:"closed",rewardedState:"closed",on(i,a){t.has(i)||t.set(i,new Set),t.get(i).add(a)},off(i,a){var n;(n=t.get(i))==null||n.delete(a)},async showInterstitial(){var i,a;this.interstitialState="opened",(i=t.get("interstitial_state_changed"))==null||i.forEach(n=>n("opened")),this.interstitialState="closed",(a=t.get("interstitial_state_changed"))==null||a.forEach(n=>n("closed"))},async showRewarded(){var i,a,n;this.rewardedState="opened",(i=t.get("rewarded_state_changed"))==null||i.forEach(o=>o("opened")),this.rewardedState="rewarded",(a=t.get("rewarded_state_changed"))==null||a.forEach(o=>o("rewarded")),this.rewardedState="closed",(n=t.get("rewarded_state_changed"))==null||n.forEach(o=>o("closed"))}},analytics:{send(){}}}}function ea(e,t,r){return typeof(e==null?void 0:e.on)=="function"?(e.on(t,r),()=>{var i;return(i=e.off)==null?void 0:i.call(e,t,r)}):typeof(e==null?void 0:e.addEventListener)=="function"?(e.addEventListener(t,r),()=>{var i;return(i=e.removeEventListener)==null?void 0:i.call(e,t,r)}):()=>{}}function Hu(e){return typeof e=="boolean"?e:typeof(e==null?void 0:e.data)=="boolean"?e.data:typeof(e==null?void 0:e.value)=="boolean"?e.value:!!e}var rs=e=>{var t;return typeof e=="string"?e:(t=e==null?void 0:e.state)!=null?t:e==null?void 0:e.data};async function Gu(){var k,G,Z,V,$,J,te,Ae,Ue,Pe,qe,He,O,ce,P;let e=["localhost","127.0.0.1","terminal.local"].includes((k=globalThis.location)==null?void 0:k.hostname),t=(G=globalThis.bridge)!=null?G:e?Iw():null;if(!t)throw new Error("Playgama Bridge unavailable; release cannot use preview mocks");if(await t.initialize()===!1)throw new Error("Playgama Bridge initialization failed");let i=t.platform,a=t.storage,n=t.advertisement,o=t.analytics,s=new Set,l=new Set,c=(i==null?void 0:i.isAudioEnabled)!==!1,u=null,h=!0,d=-1/0,g=!1,m=Promise.resolve(),A=[],f=()=>({paused:s.size>0,audioEnabled:c&&h&&s.size===0}),p=()=>{var X,z,he;let L=f();(X=u==null?void 0:u.root)==null||X.classList.toggle("paused",L.paused),u!=null&&u.root&&(u.root.inert=L.paused),(z=u==null?void 0:u.setPaused)==null||z.call(u,L.paused),(he=u==null?void 0:u.setAudioEnabled)==null||he.call(u,L.audioEnabled),l.forEach(_=>_(L))},w=(L,X)=>{X?s.add(L):s.delete(L),p()},C=(V=(Z=t.EVENT_NAME)==null?void 0:Z.PAUSE_STATE_CHANGED)!=null?V:"pause_state_changed",x=(J=($=t.EVENT_NAME)==null?void 0:$.AUDIO_STATE_CHANGED)!=null?J:"audio_state_changed",T=(Ae=(te=t.EVENT_NAME)==null?void 0:te.INTERSTITIAL_STATE_CHANGED)!=null?Ae:"interstitial_state_changed",y=(Pe=(Ue=t.EVENT_NAME)==null?void 0:Ue.REWARDED_STATE_CHANGED)!=null?Pe:"rewarded_state_changed";A.push(ea(i,C,L=>w("host",Hu(L)))),A.push(ea(i,x,L=>{c=Hu(L),p()})),A.push(ea(n,T,L=>{let X=rs(L);w("advertisement",X==="loading"||X==="opened")})),A.push(ea(n,y,L=>{let X=rs(L);w("advertisement",X==="loading"||X==="opened")})),(i==null?void 0:i.isPaused)===!0&&s.add("host"),((n==null?void 0:n.interstitialState)==="loading"||(n==null?void 0:n.interstitialState)==="opened")&&s.add("advertisement");let S=String((He=(qe=i==null?void 0:i.id)!=null?qe:i==null?void 0:i.name)!=null?He:"").toLowerCase();if(S!=="youtube"){let L=()=>w("visibility",document.hidden);document.addEventListener("visibilitychange",L),A.push(()=>{var he;return(he=document.removeEventListener)==null?void 0:he.call(document,"visibilitychange",L)});let X=()=>w("focus",!0),z=()=>w("focus",!1);(O=globalThis.addEventListener)==null||O.call(globalThis,"blur",X),(ce=globalThis.addEventListener)==null||ce.call(globalThis,"focus",z),A.push(()=>{var he,_;(he=globalThis.removeEventListener)==null||he.call(globalThis,"blur",X),(_=globalThis.removeEventListener)==null||_.call(globalThis,"focus",z)})}async function U(L,X){let[z]=await a.get([L]);if(z==null)return X;try{return JSON.parse(z)}catch(he){return X}}async function D(L,X){let z=JSON.stringify(X),he=m.catch(()=>{}).then(()=>a.set([L],[z]));return m=he,he}async function M(L){await a.delete([L])}async function I(L,{onDisplay:X=()=>{}}={}){if(g||(n==null?void 0:n.isInterstitialSupported)!==!0||typeof(n==null?void 0:n.showInterstitial)!="function"||performance.now()-d<6e4)return!1;g=!0,w("advertisement-request",!0);let z=!1,he=!1,_=()=>{},ie,Ee,ve=new Promise(j=>{Ee=j}),ge=()=>{he||(he=!0,Ee())};_=ea(n,T,j=>{let ae=rs(j);ae==="opened"&&!z&&(z=!0,X()),(ae==="failed"||ae==="closed")&&ge()}),ie=setTimeout(ge,12e4);try{return Promise.resolve(n.showInterstitial(L)).then(()=>setTimeout(ge,1500),ge),await ve,z}catch(j){return z}finally{z&&(d=performance.now()),clearTimeout(ie),_(),g=!1,w("advertisement-request",!1)}}async function H(L,{onDisplay:X=()=>{}}={}){if(S==="youtube"||g||(n==null?void 0:n.isRewardedSupported)!==!0||typeof(n==null?void 0:n.showRewarded)!="function")return!1;g=!0,w("advertisement-request",!0);let z=!1,he=!1,_=!1,ie=()=>{},Ee,ve,ge=new Promise(ae=>{ve=ae}),j=()=>{_||(_=!0,ve())};ie=ea(n,y,ae=>{let fe=rs(ae);fe==="opened"&&!z&&(z=!0,X()),fe==="rewarded"&&(he=!0),(fe==="failed"||fe==="closed")&&j()}),Ee=setTimeout(j,12e4);try{return Promise.resolve(n.showRewarded(L)).then(()=>setTimeout(j,1500),j),await ge,he}catch(ae){return!1}finally{clearTimeout(Ee),ie(),g=!1,w("advertisement-request",!1)}}return{destroy(){A.forEach(L=>L()),l.clear(),u=null},language:(P=i==null?void 0:i.language)!=null?P:"en",platformId:S,rewardedSupported:S!=="youtube"&&(n==null?void 0:n.isRewardedSupported)===!0&&typeof(n==null?void 0:n.showRewarded)=="function",isLocalPreview:t.__localPreview===!0,loadProgress:U,saveProgress:D,deleteProgress:M,setPauseReason:w,setUserAudioEnabled(L){h=!!L,p()},bindGame(L){u=L,p()},onStateChange(L){return l.add(L),L(f()),()=>l.delete(L)},async gameReady(){var L,X,z;await((z=i==null?void 0:i.sendMessage)==null?void 0:z.call(i,(X=(L=t.PLATFORM_MESSAGE)==null?void 0:L.GAME_READY)!=null?X:"game_ready"))},showInterstitial:I,showRewarded:H,async sendAnalytics(L,X={}){var z;try{await((z=o==null?void 0:o.send)==null?void 0:z.call(o,L,X))}catch(he){}}}}var Rw=Object.defineProperty,Ou=Object.getOwnPropertySymbols,Tw=Object.prototype.hasOwnProperty,bw=Object.prototype.propertyIsEnumerable,ku=(e,t,r)=>t in e?Rw(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,Qw=(e,t)=>{for(var r in t||(t={}))Tw.call(t,r)&&ku(e,r,t[r]);if(Ou)for(var r of Ou(t))bw.call(t,r)&&ku(e,r,t[r]);return e},ps,ht,rd,Uw,ui,Vu,id,ad,nd,zl,Hl,Gl,Fw,Oa={},sd=[],Lw=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,gs=Array.isArray;function yr(e,t){for(var r in t)e[r]=t[r];return e}function Yl(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function Qe(e,t,r){var i,a,n,o={};for(n in t)n=="key"?i=t[n]:n=="ref"?a=t[n]:o[n]=t[n];if(arguments.length>2&&(o.children=arguments.length>3?ps.call(arguments,2):r),typeof e=="function"&&e.defaultProps!=null)for(n in e.defaultProps)o[n]===void 0&&(o[n]=e.defaultProps[n]);return as(e,o,i,a,null)}function as(e,t,r,i,a){var n={type:e,props:t,key:r,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:a==null?++rd:a,__i:-1,__u:0};return a==null&&ht.vnode!=null&&ht.vnode(n),n}function fs(e){return e.children}function ns(e,t){this.props=e,this.context=t}function ta(e,t){if(t==null)return e.__?ta(e.__,e.__i+1):null;for(var r;t<e.__k.length;t++)if((r=e.__k[t])!=null&&r.__e!=null)return r.__e;return typeof e.type=="function"?ta(e):null}function od(e){var t,r;if((e=e.__)!=null&&e.__c!=null){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if((r=e.__k[t])!=null&&r.__e!=null){e.__e=e.__c.base=r.__e;break}return od(e)}}function zu(e){(!e.__d&&(e.__d=!0)&&ui.push(e)&&!ls.__r++||Vu!=ht.debounceRendering)&&((Vu=ht.debounceRendering)||id)(ls)}function ls(){for(var e,t,r,i,a,n,o,s=1;ui.length;)ui.length>s&&ui.sort(ad),e=ui.shift(),s=ui.length,e.__d&&(r=void 0,i=void 0,a=(i=(t=e).__v).__e,n=[],o=[],t.__P&&((r=yr({},i)).__v=i.__v+1,ht.vnode&&ht.vnode(r),Wl(t.__P,r,i,t.__n,t.__P.namespaceURI,32&i.__u?[a]:null,n,a==null?ta(i):a,!!(32&i.__u),o),r.__v=i.__v,r.__.__k[r.__i]=r,hd(n,r,o),i.__e=i.__=null,r.__e!=a&&od(r)));ls.__r=0}function ld(e,t,r,i,a,n,o,s,l,c,u){var h,d,g,m,A,f,p,w=i&&i.__k||sd,C=t.length;for(l=Nw(r,t,w,l,C),h=0;h<C;h++)(g=r.__k[h])!=null&&(d=g.__i==-1?Oa:w[g.__i]||Oa,g.__i=h,f=Wl(e,g,d,a,n,o,s,l,c,u),m=g.__e,g.ref&&d.ref!=g.ref&&(d.ref&&Jl(d.ref,null,g),u.push(g.ref,g.__c||m,g)),A==null&&m!=null&&(A=m),(p=!!(4&g.__u))||d.__k===g.__k?l=cd(g,l,e,p):typeof g.type=="function"&&f!==void 0?l=f:m&&(l=m.nextSibling),g.__u&=-7);return r.__e=A,l}function Nw(e,t,r,i,a){var n,o,s,l,c,u=r.length,h=u,d=0;for(e.__k=new Array(a),n=0;n<a;n++)(o=t[n])!=null&&typeof o!="boolean"&&typeof o!="function"?(l=n+d,(o=e.__k[n]=typeof o=="string"||typeof o=="number"||typeof o=="bigint"||o.constructor==String?as(null,o,null,null,null):gs(o)?as(fs,{children:o},null,null,null):o.constructor==null&&o.__b>0?as(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):o).__=e,o.__b=e.__b+1,s=null,(c=o.__i=Pw(o,r,l,h))!=-1&&(h--,(s=r[c])&&(s.__u|=2)),s==null||s.__v==null?(c==-1&&(a>u?d--:a<u&&d++),typeof o.type!="function"&&(o.__u|=4)):c!=l&&(c==l-1?d--:c==l+1?d++:(c>l?d--:d++,o.__u|=4))):e.__k[n]=null;if(h)for(n=0;n<u;n++)(s=r[n])!=null&&(2&s.__u)==0&&(s.__e==i&&(i=ta(s)),dd(s,s));return i}function cd(e,t,r,i){var a,n;if(typeof e.type=="function"){for(a=e.__k,n=0;a&&n<a.length;n++)a[n]&&(a[n].__=e,t=cd(a[n],t,r,i));return t}e.__e!=t&&(i&&(t&&e.type&&!t.parentNode&&(t=ta(e)),r.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Pw(e,t,r,i){var a,n,o,s=e.key,l=e.type,c=t[r],u=c!=null&&(2&c.__u)==0;if(c===null&&e.key==null||u&&s==c.key&&l==c.type)return r;if(i>(u?1:0)){for(a=r-1,n=r+1;a>=0||n<t.length;)if((c=t[o=a>=0?a--:n++])!=null&&(2&c.__u)==0&&s==c.key&&l==c.type)return o}return-1}function Yu(e,t,r){t[0]=="-"?e.setProperty(t,r==null?"":r):e[t]=r==null?"":typeof r!="number"||Lw.test(t)?r:r+"px"}function is(e,t,r,i,a){var n,o;e:if(t=="style")if(typeof r=="string")e.style.cssText=r;else{if(typeof i=="string"&&(e.style.cssText=i=""),i)for(t in i)r&&t in r||Yu(e.style,t,"");if(r)for(t in r)i&&r[t]==i[t]||Yu(e.style,t,r[t])}else if(t[0]=="o"&&t[1]=="n")n=t!=(t=t.replace(nd,"$1")),o=t.toLowerCase(),t=o in e||t=="onFocusOut"||t=="onFocusIn"?o.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+n]=r,r?i?r.u=i.u:(r.u=zl,e.addEventListener(t,n?Gl:Hl,n)):e.removeEventListener(t,n?Gl:Hl,n);else{if(a=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=r==null?"":r;break e}catch(s){}typeof r=="function"||(r==null||r===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&r==1?"":r))}}function Wu(e){return function(t){if(this.l){var r=this.l[t.type+e];if(t.t==null)t.t=zl++;else if(t.t<r.u)return;return r(ht.event?ht.event(t):t)}}}function Wl(e,t,r,i,a,n,o,s,l,c){var u,h,d,g,m,A,f,p,w,C,x,T,y,S,U,D,M,I=t.type;if(t.constructor!=null)return null;128&r.__u&&(l=!!(32&r.__u),n=[s=t.__e=r.__e]),(u=ht.__b)&&u(t);e:if(typeof I=="function")try{if(p=t.props,w="prototype"in I&&I.prototype.render,C=(u=I.contextType)&&i[u.__c],x=u?C?C.props.value:u.__:i,r.__c?f=(h=t.__c=r.__c).__=h.__E:(w?t.__c=h=new I(p,x):(t.__c=h=new ns(p,x),h.constructor=I,h.render=Gw),C&&C.sub(h),h.props=p,h.state||(h.state={}),h.context=x,h.__n=i,d=h.__d=!0,h.__h=[],h._sb=[]),w&&h.__s==null&&(h.__s=h.state),w&&I.getDerivedStateFromProps!=null&&(h.__s==h.state&&(h.__s=yr({},h.__s)),yr(h.__s,I.getDerivedStateFromProps(p,h.__s))),g=h.props,m=h.state,h.__v=t,d)w&&I.getDerivedStateFromProps==null&&h.componentWillMount!=null&&h.componentWillMount(),w&&h.componentDidMount!=null&&h.__h.push(h.componentDidMount);else{if(w&&I.getDerivedStateFromProps==null&&p!==g&&h.componentWillReceiveProps!=null&&h.componentWillReceiveProps(p,x),!h.__e&&h.shouldComponentUpdate!=null&&h.shouldComponentUpdate(p,h.__s,x)===!1||t.__v==r.__v){for(t.__v!=r.__v&&(h.props=p,h.state=h.__s,h.__d=!1),t.__e=r.__e,t.__k=r.__k,t.__k.some(function(H){H&&(H.__=t)}),T=0;T<h._sb.length;T++)h.__h.push(h._sb[T]);h._sb=[],h.__h.length&&o.push(h);break e}h.componentWillUpdate!=null&&h.componentWillUpdate(p,h.__s,x),w&&h.componentDidUpdate!=null&&h.__h.push(function(){h.componentDidUpdate(g,m,A)})}if(h.context=x,h.props=p,h.__P=e,h.__e=!1,y=ht.__r,S=0,w){for(h.state=h.__s,h.__d=!1,y&&y(t),u=h.render(h.props,h.state,h.context),U=0;U<h._sb.length;U++)h.__h.push(h._sb[U]);h._sb=[]}else do h.__d=!1,y&&y(t),u=h.render(h.props,h.state,h.context),h.state=h.__s;while(h.__d&&++S<25);h.state=h.__s,h.getChildContext!=null&&(i=yr(yr({},i),h.getChildContext())),w&&!d&&h.getSnapshotBeforeUpdate!=null&&(A=h.getSnapshotBeforeUpdate(g,m)),D=u,u!=null&&u.type===fs&&u.key==null&&(D=ud(u.props.children)),s=ld(e,gs(D)?D:[D],t,r,i,a,n,o,s,l,c),h.base=t.__e,t.__u&=-161,h.__h.length&&o.push(h),f&&(h.__E=h.__=null)}catch(H){if(t.__v=null,l||n!=null)if(H.then){for(t.__u|=l?160:128;s&&s.nodeType==8&&s.nextSibling;)s=s.nextSibling;n[n.indexOf(s)]=null,t.__e=s}else{for(M=n.length;M--;)Yl(n[M]);Ol(t)}else t.__e=r.__e,t.__k=r.__k,H.then||Ol(t);ht.__e(H,t,r)}else n==null&&t.__v==r.__v?(t.__k=r.__k,t.__e=r.__e):s=t.__e=Hw(r.__e,t,r,i,a,n,o,l,c);return(u=ht.diffed)&&u(t),128&t.__u?void 0:s}function Ol(e){e&&e.__c&&(e.__c.__e=!0),e&&e.__k&&e.__k.forEach(Ol)}function hd(e,t,r){for(var i=0;i<r.length;i++)Jl(r[i],r[++i],r[++i]);ht.__c&&ht.__c(t,e),e.some(function(a){try{e=a.__h,a.__h=[],e.some(function(n){n.call(a)})}catch(n){ht.__e(n,a.__v)}})}function ud(e){return typeof e!="object"||e==null||e.__b&&e.__b>0?e:gs(e)?e.map(ud):yr({},e)}function Hw(e,t,r,i,a,n,o,s,l){var c,u,h,d,g,m,A,f=r.props,p=t.props,w=t.type;if(w=="svg"?a="http://www.w3.org/2000/svg":w=="math"?a="http:\x2f\x2fwww.w3.org/1998/Math/MathML":a||(a="http:\x2f\x2fwww.w3.org/1999/xhtml"),n!=null){for(c=0;c<n.length;c++)if((g=n[c])&&"setAttribute"in g==!!w&&(w?g.localName==w:g.nodeType==3)){e=g,n[c]=null;break}}if(e==null){if(w==null)return document.createTextNode(p);e=document.createElementNS(a,w,p.is&&p),s&&(ht.__m&&ht.__m(t,n),s=!1),n=null}if(w==null)f===p||s&&e.data==p||(e.data=p);else{if(n=n&&ps.call(e.childNodes),f=r.props||Oa,!s&&n!=null)for(f={},c=0;c<e.attributes.length;c++)f[(g=e.attributes[c]).name]=g.value;for(c in f)if(g=f[c],c!="children"){if(c=="dangerouslySetInnerHTML")h=g;else if(!(c in p)){if(c=="value"&&"defaultValue"in p||c=="checked"&&"defaultChecked"in p)continue;is(e,c,null,g,a)}}for(c in p)g=p[c],c=="children"?d=g:c=="dangerouslySetInnerHTML"?u=g:c=="value"?m=g:c=="checked"?A=g:s&&typeof g!="function"||f[c]===g||is(e,c,g,f[c],a);if(u)s||h&&(u.__html==h.__html||u.__html==e.innerHTML)||(e.innerHTML=u.__html),t.__k=[];else if(h&&(e.innerHTML=""),ld(t.type=="template"?e.content:e,gs(d)?d:[d],t,r,i,w=="foreignObject"?"http:\x2f\x2fwww.w3.org/1999/xhtml":a,n,o,n?n[0]:r.__k&&ta(r,0),s,l),n!=null)for(c=n.length;c--;)Yl(n[c]);s||(c="value",w=="progress"&&m==null?e.removeAttribute("value"):m!=null&&(m!==e[c]||w=="progress"&&!m||w=="option"&&m!=f[c])&&is(e,c,m,f[c],a),c="checked",A!=null&&A!=e[c]&&is(e,c,A,f[c],a))}return e}function Jl(e,t,r){try{if(typeof e=="function"){var i=typeof e.__u=="function";i&&e.__u(),i&&t==null||(e.__u=e(t))}else e.current=t}catch(a){ht.__e(a,r)}}function dd(e,t,r){var i,a;if(ht.unmount&&ht.unmount(e),(i=e.ref)&&(i.current&&i.current!=e.__e||Jl(i,null,t)),(i=e.__c)!=null){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(n){ht.__e(n,t)}i.base=i.__P=null}if(i=e.__k)for(a=0;a<i.length;a++)i[a]&&dd(i[a],t,r||typeof e.type!="function");r||Yl(e.__e),e.__c=e.__=e.__e=void 0}function Gw(e,t,r){return this.constructor(e,r)}function Ju(e,t,r){var i,a,n,o;t==document&&(t=document.documentElement),ht.__&&ht.__(e,t),a=(i=typeof r=="function")?null:r&&r.__k||t.__k,n=[],o=[],Wl(t,e=(!i&&r||t).__k=Qe(fs,null,[e]),a||Oa,Oa,t.namespaceURI,!i&&r?[r]:a?null:t.firstChild?ps.call(t.childNodes):null,n,!i&&r?r:a?a.__e:t.firstChild,i,o),hd(n,e,o)}ps=sd.slice,ht={__e:function(e,t,r,i){for(var a,n,o;t=t.__;)if((a=t.__c)&&!a.__)try{if((n=a.constructor)&&n.getDerivedStateFromError!=null&&(a.setState(n.getDerivedStateFromError(e)),o=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(e,i||{}),o=a.__d),o)return a.__E=a}catch(s){e=s}throw e}},rd=0,Uw=function(e){return e!=null&&e.constructor==null},ns.prototype.setState=function(e,t){var r;r=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=yr({},this.state),typeof e=="function"&&(e=e(yr({},r),this.props)),e&&yr(r,e),e!=null&&this.__v&&(t&&this._sb.push(t),zu(this))},ns.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),zu(this))},ns.prototype.render=fs,ui=[],id=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,ad=function(e,t){return e.__v.__b-t.__v.__b},ls.__r=0,nd=/(PointerCapture)$|Capture$/i,zl=0,Hl=Wu(!1),Gl=Wu(!0),Fw=0;var ka,Et,Nl,Ku,cs=0,pd=[],Ct=ht,Xu=Ct.__b,ju=Ct.__r,qu=Ct.diffed,Zu=Ct.__c,$u=Ct.unmount,ed=Ct.__;function Kl(e,t){Ct.__h&&Ct.__h(Et,e,cs||t),cs=0;var r=Et.__H||(Et.__H={__:[],__h:[]});return e>=r.__.length&&r.__.push({}),r.__[e]}function kl(e){return cs=1,Ow(fd,e)}function Ow(e,t,r){var i=Kl(ka++,2);if(i.t=e,!i.__c&&(i.__=[r?r(t):fd(void 0,t),function(s){var l=i.__N?i.__N[0]:i.__[0],c=i.t(l,s);l!==c&&(i.__N=[c,i.__[1]],i.__c.setState({}))}],i.__c=Et,!Et.__f)){var a=function(s,l,c){if(!i.__c.__H)return!0;var u=i.__c.__H.__.filter(function(d){return!!d.__c});if(u.every(function(d){return!d.__N}))return!n||n.call(this,s,l,c);var h=i.__c.props!==s;return u.forEach(function(d){if(d.__N){var g=d.__[0];d.__=d.__N,d.__N=void 0,g!==d.__[0]&&(h=!0)}}),n&&n.call(this,s,l,c)||h};Et.__f=!0;var n=Et.shouldComponentUpdate,o=Et.componentWillUpdate;Et.componentWillUpdate=function(s,l,c){if(this.__e){var u=n;n=void 0,a(s,l,c),n=u}o&&o.call(this,s,l,c)},Et.shouldComponentUpdate=a}return i.__N||i.__}function hs(e,t){var r=Kl(ka++,3);!Ct.__s&&gd(r.__H,t)&&(r.__=e,r.u=t,Et.__H.__h.push(r))}function ss(e){return cs=5,kw(function(){return{current:e}},[])}function kw(e,t){var r=Kl(ka++,7);return gd(r.__H,t)&&(r.__=e(),r.__H=t,r.__h=e),r.__}function Vw(){for(var e;e=pd.shift();)if(e.__P&&e.__H)try{e.__H.__h.forEach(os),e.__H.__h.forEach(Vl),e.__H.__h=[]}catch(t){e.__H.__h=[],Ct.__e(t,e.__v)}}Ct.__b=function(e){Et=null,Xu&&Xu(e)},Ct.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),ed&&ed(e,t)},Ct.__r=function(e){ju&&ju(e),ka=0;var t=(Et=e.__c).__H;t&&(Nl===Et?(t.__h=[],Et.__h=[],t.__.forEach(function(r){r.__N&&(r.__=r.__N),r.u=r.__N=void 0})):(t.__h.forEach(os),t.__h.forEach(Vl),t.__h=[],ka=0)),Nl=Et},Ct.diffed=function(e){qu&&qu(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(pd.push(t)!==1&&Ku===Ct.requestAnimationFrame||((Ku=Ct.requestAnimationFrame)||zw)(Vw)),t.__H.__.forEach(function(r){r.u&&(r.__H=r.u),r.u=void 0})),Nl=Et=null},Ct.__c=function(e,t){t.some(function(r){try{r.__h.forEach(os),r.__h=r.__h.filter(function(i){return!i.__||Vl(i)})}catch(i){t.some(function(a){a.__h&&(a.__h=[])}),t=[],Ct.__e(i,r.__v)}}),Zu&&Zu(e,t)},Ct.unmount=function(e){$u&&$u(e);var t,r=e.__c;r&&r.__H&&(r.__H.__.forEach(function(i){try{os(i)}catch(a){t=a}}),r.__H=void 0,t&&Ct.__e(t,r.__v))};var td=typeof requestAnimationFrame=="function";function zw(e){var t,r=function(){clearTimeout(i),td&&cancelAnimationFrame(t),setTimeout(e)},i=setTimeout(r,35);td&&(t=requestAnimationFrame(r))}function os(e){var t=Et,r=e.__c;typeof r=="function"&&(e.__c=void 0,r()),Et=t}function Vl(e){var t=Et;e.__c=e.__(),Et=t}function gd(e,t){return!e||e.length!==t.length||t.some(function(r,i){return r!==e[i]})}function fd(e,t){return typeof t=="function"?t(e):t}var Wr=Object.freeze([1,2,3,4]),rD=Object.freeze([0,1,2,3,4,5]),iD=Object.freeze({id:"customer-white-male-01",presentation:"adult-man",skinTone:"white",hairTexture:"straight",startingHaircut:"uniform-fade-region"}),aD=Object.freeze({minYawDeg:-180,initialYawDeg:-55,maxYawDeg:180,axis:"full-scalp"}),nD=Object.freeze({id:"clipper",touchOffsetPx:72,logicalRadiusCells:3,bladeWidthUnits:.56,bladeDepthUnits:.1,modelScale:.31}),sD=Object.freeze({classic:Object.freeze([5,5,5]),tidy:Object.freeze([3,4,5]),medium:Object.freeze([4,5,5]),even16:Object.freeze([5,5,5]),tapered:Object.freeze([3,5,5]),soft:Object.freeze([4,4,5])}),Yw=e=>({0:.5,1:3,2:6,3:10,4:13,5:16,6:19,7:22,8:25})[e],Ww=e=>String(e),Jw=e=>`Guard ${e}, ${Yw(e)} millimetres`,Va=(e,t,r,i={})=>Qe("svg",Qw({viewBox:"0 0 24 24",width:e,height:e,fill:"none",stroke:"currentColor","stroke-width":t,"stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true"},i),r),Kw=({size:e=24})=>Va(e,2.2,[Qe("path",{d:"M21 12a9 9 0 0 1-15.5 6.2"}),Qe("path",{d:"M3 12A9 9 0 0 1 18.5 5.8"}),Qe("path",{d:"M18.5 2v4h-4"}),Qe("path",{d:"M5.5 22v-4h4"})]),Xl=({size:e=26})=>Va(e,2.2,[Qe("rect",{x:7,y:8,width:10,height:14,rx:3}),Qe("path",{d:"M6 4h12v4H6z"}),Qe("path",{d:"M8 4V2M11 4V2M14 4V2M17 4V2"})]),Xw=({size:e=26})=>Va(e,2.6,Qe("path",{d:"M5 12.5l4.5 4.5L19 7"})),jw=({size:e=27})=>Va(e,2.8,[Qe("path",{d:"M5 12h14"}),Qe("path",{d:"M13 6l6 6-6 6"})]),qw=({muted:e=!1})=>Va(25,2.2,[Qe("path",{d:"M5 9v6h4l5 4V5L9 9H5"}),e?Qe("path",{d:"M18 9l4 6M22 9l-4 6"}):Qe("path",{d:"M17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11"})]);function Zw(e){let[,t]=kl(0);return hs(()=>e.subscribe(()=>t(r=>r+1)),[e]),{state:e.getState(),view:e.getView()}}function $w({game:e,view:t}){if(!t.showAudioControl)return null;let r=t.volume>0;return Qe("button",{type:"button",class:"audio-toggle","aria-pressed":r?"true":"false","aria-label":r?"Mute game sound":"Unmute game sound",onClick:()=>e.setUserAudio(!r)},Qe(qw,{muted:!r}))}var us=108,ds=158,Pl=e=>{let t=Math.PI+Math.PI/2*(e/(Wr.length-1));return[ds+us*Math.cos(t),ds+us*Math.sin(t)]};function eC({state:e,game:t,disabled:r}){let i=ss(null),a=ss(null),n=ss(-1e9),o=Wr.length,s=p=>{let w=i.current.getBoundingClientRect(),C=w.left+ds-p.clientX,x=w.top+ds-p.clientY,T=Math.atan2(Math.max(0,x),Math.max(0,C))/(Math.PI/2),y=Wr[Math.max(0,Math.min(o-1,Math.round(T*(o-1))))];y!==t.getState().selectedGuard&&t.selectGuard(y)},l=p=>{if(!r){a.current=p.pointerId;try{p.currentTarget.setPointerCapture(p.pointerId)}catch(w){}s(p),p.preventDefault()}},c=p=>{a.current===p.pointerId&&s(p)},u=p=>{a.current===p.pointerId&&(a.current=null,n.current=performance.now())},h=p=>{performance.now()-n.current<500||t.selectGuard(p)},[d,g]=Pl(0),[m,A]=Pl(o-1),f=`M${d} ${g} A ${us} ${us} 0 0 1 ${m} ${A}`;return Qe("div",{class:"guard-arc",ref:i,role:"radiogroup","aria-label":"Clipper guard: tap or slide, 1 is shortest","data-disabled":r?"1":"0"},Qe("svg",{class:"track",width:197,height:197,"aria-hidden":"true"},Qe("path",{d:f,fill:"none",stroke:"#2a1d15","stroke-width":14,"stroke-linecap":"round"}),Qe("path",{d:f,fill:"none",stroke:"#e2d2b2","stroke-width":8,"stroke-linecap":"round"})),Wr.map((p,w)=>{let[C,x]=Pl(w);return Qe("button",{key:p,type:"button",role:"radio",class:"rung","aria-checked":e.selectedGuard===p?"true":"false","aria-label":Jw(p),disabled:r,style:{left:`${C}px`,top:`${x}px`},onPointerDown:l,onPointerMove:c,onPointerUp:u,onPointerCancel:u,onClick:()=>h(p)},Ww(p))}))}var tC="12.00,0.60 14.51,2.63 17.70,2.13 18.86,5.14 21.87,6.30 21.37,9.49 23.40,12.00 21.37,14.51 21.87,17.70 18.86,18.86 17.70,21.87 14.51,21.37 12.00,23.40 9.49,21.37 6.30,21.87 5.14,18.86 2.13,17.70 2.63,14.51 0.60,12.00 2.63,9.49 2.13,6.30 5.14,5.14 6.30,2.13 9.49,2.63";function rC({state:e,game:t}){let r=e.interactionMode==="cut";return Qe("button",{type:"button",class:r?"clip-toggle on":"clip-toggle","aria-pressed":r?"true":"false","aria-label":r?"Clipper on: drag on the hair to cut":"Clipper off: drag to turn the customer",onClick:()=>t.toggleClipper()},Qe(Xl,{size:34}),Qe("span",{class:"led","aria-hidden":"true"}))}function iC({game:e}){return Qe("div",{class:"controls"},Qe("button",{type:"button",class:"ctl finish seal","aria-label":"Finish haircut",onClick:()=>e.finish()},Qe("svg",{class:"seal-shape",viewBox:"0 0 24 24","aria-hidden":"true"},Qe("polygon",{points:tC})),Qe(Xw,{size:32})))}var aC=({size:e=44})=>Qe("svg",{viewBox:"0 0 24 24",width:e,height:e,"aria-hidden":"true"},Qe("path",{d:"M9 11.5V4.8a1.6 1.6 0 0 1 3.2 0v5.4l.1-1.2a1.5 1.5 0 0 1 3 .2v1.3a1.5 1.5 0 0 1 3 .1v.9a1.4 1.4 0 0 1 2.8.2v3.9c0 3.7-2.6 6.4-6.2 6.4h-1.6c-2 0-3.4-.8-4.6-2.4l-3-4.2a1.6 1.6 0 0 1 2.4-2.1z",fill:"#fff6e6",stroke:"#2a1d15","stroke-width":1.6,"stroke-linejoin":"round"})),nC=()=>{let e=l=>[158+150*Math.cos(l),158+150*Math.sin(l)],[t,r]=e(Math.PI*1.06),[i,a]=e(Math.PI*1.44),n=`M${t} ${r} A 150 150 0 0 1 ${i} ${a}`,o=(l,c,u)=>{let h=[l+14*Math.cos(u+2.5),c+14*Math.sin(u+2.5)],d=[l+14*Math.cos(u-2.5),c+14*Math.sin(u-2.5)];return`M${h[0]} ${h[1]} L${l} ${c} L${d[0]} ${d[1]}`},s=o(t,r,Math.PI*1.06-Math.PI/2)+" "+o(i,a,Math.PI*1.44+Math.PI/2);return Qe("svg",{class:"tut-arc",width:197,height:197,"aria-hidden":"true"},Qe("path",{d:n+" "+s,fill:"none",stroke:"#2a1d15","stroke-width":11,"stroke-linecap":"round","stroke-linejoin":"round"}),Qe("path",{d:n+" "+s,fill:"none",stroke:"#ffd23f","stroke-width":6,"stroke-linecap":"round","stroke-linejoin":"round"}))};function sC({state:e,game:t}){let r=ss(null);r.current||(r.current={yaw:e.cameraYawDeg,guard:e.selectedGuard});let[i,a]=kl({spin:!1,clip:!1,cut:!1,guard:!1}),n={clip:i.clip||e.interactionMode==="cut"||e.cutStrokeCount>0,cut:i.cut||e.cutStrokeCount>0,spin:i.spin||Math.abs((e.cameraYawDeg-r.current.yaw+540)%360-180)>25,guard:i.guard||e.selectedGuard!==r.current.guard},o=["spin","clip","cut","guard"].find(m=>!n[m]),[,s]=kl(0);if(hs(()=>{let m=setInterval(()=>s(A=>A+1),400);return()=>clearInterval(m)},[]),hs(()=>{(n.cut!==i.cut||n.spin!==i.spin||n.clip!==i.clip||n.guard!==i.guard)&&a(n),o||t.completeTutorial()}),!o)return null;let l=t.headScreen(),c=Math.max(40,l.r),u=innerWidth,h,d,g;if(o==="cut"){let m=t.hairHint();h={left:`${m.x}px`,top:`${m.y}px`},d="Drag on the hair to cut",g=Qe("path",{d:"M22 6 L22 92",class:"tut-trail"})}else if(o==="spin"){let m=l.top-70>=110,A=m?l.x-66:l.left>u-l.right?l.left-170:l.right+30;h={left:`${Math.max(16,Math.min(u-160,A))}px`,top:`${m?l.top-46:l.top+(l.y-l.top)*.3}px`},d="Drag to turn the customer",g=Qe("path",{d:"M8 30 Q 70 -6 132 30",class:"tut-trail"})}else if(o==="clip"){let m=document.querySelector(".clip-toggle"),A=m?m.getBoundingClientRect():{left:20,top:innerHeight-100,width:78,height:78};h={left:`${A.left+A.width/2-8}px`,top:`${A.top+A.height/2+4}px`},d="Tap the clipper to switch it on",g=null}else{let m=document.querySelector(".guard-arc").getBoundingClientRect();h={left:`${m.left}px`,top:`${m.top}px`},d="Tap or slide the guard arc to change the clipper guard",g=null}return Qe("div",{class:`tutorial tut-${o}`,style:h,role:"img","aria-label":d},g?Qe("svg",{class:"tut-path",viewBox:o==="spin"?"0 0 140 40":"0 0 44 100","aria-hidden":"true"},g):null,o==="cut"?Qe("span",{class:"tut-tool","aria-hidden":"true"},Qe(Xl,{size:20})):null,o==="spin"?Qe("span",{class:"tut-tool","aria-hidden":"true"},Qe(Kw,{size:20})):null,o==="guard"?Qe(nC):Qe("span",{class:"tut-hand"},Qe(aC)))}function oC({game:e,view:t}){return t.revealComplete?Qe("button",{class:"training-continue",type:"button",disabled:t.busy,"aria-label":"Next customer",onClick:()=>e.next()},Qe(jw,{size:42})):Qe("div",{class:"reveal-wait","aria-label":"Showing finished haircut"},Qe(Xl,{size:30}))}function lC(e){hs(()=>{let t=r=>{var i;if(r.altKey||r.ctrlKey||r.metaKey)return;let a=e.getState(),n=e.getView(),o=(i=r.target)==null?void 0:i.tagName;if(n.paused)return;if(a.status==="reveal"){r.key==="Enter"&&n.revealComplete&&(r.preventDefault(),e.next());return}if(a.status!=="cutting")return;let s=Wr.indexOf(a.selectedGuard);(r.key==="ArrowUp"||r.key==="+"||r.key==="=")&&s<Wr.length-1?(r.preventDefault(),e.selectGuard(Wr[s+1])):(r.key==="ArrowDown"||r.key==="-")&&s>0?(r.preventDefault(),e.selectGuard(Wr[s-1])):r.key===" "&&o!=="BUTTON"&&o!=="INPUT"?(r.preventDefault(),e.toggleClipper()):r.key==="ArrowLeft"?(r.preventDefault(),e.turn(-45)):r.key==="ArrowRight"?(r.preventDefault(),e.turn(45)):r.key==="Enter"&&o!=="BUTTON"&&(r.preventDefault(),e.finish())};return globalThis.addEventListener("keydown",t),()=>globalThis.removeEventListener("keydown",t)},[e])}function cC({game:e}){let{state:t,view:r}=Zw(e),i=t.status==="cutting";return lC(e),Qe("div",{class:"ui","data-status":t.status},Qe("header",{class:"top"},Qe($w,{game:e,view:r})),Qe("div",{class:"play-area","aria-hidden":"true"}),i&&!t.tutorialSeen&&!r.paused?Qe(sC,{state:t,game:e}):null,i?Qe(eC,{state:t,game:e,disabled:r.busy}):null,i?Qe(rC,{state:t,game:e}):null,Qe("footer",{class:i?"bar":"bar reveal training-reveal"},i?Qe(iC,{state:t,game:e,view:r}):Qe(oC,{game:e,view:r})),r.saveError?Qe("span",{class:"save-error",role:"status","aria-label":"Save failed. Progress will retry on the next action"},"\u2601 !"):null)}function Ad({root:e,game:t}){let r=document.createElement("div");return r.id="hud",e.appendChild(r),Ju(Qe(cC,{game:t}),r),()=>Ju(null,r)}async function hC(){let e=document.querySelector("#game");if(!e)throw new Error("Game shell is incomplete");let t=await Gu();document.documentElement.lang=String(t.language||"en").replace(/_/g,"-");let[r,i]=await Promise.all([t.loadProgress(Fl,Ei()),t.loadProgress(Ll,!0)]),a=Pu({root:e,client:t,savedSession:r,savedAudio:i});t.bindGame({root:e,setPaused:a.setPaused,setAudioEnabled:a.setPlatformAudio});let n=Ad({root:e,game:a});a.renderFirstPlayableFrame(),globalThis.addEventListener("pagehide",()=>{n(),a.destroy(),t.destroy()},{once:!0}),await t.gameReady(),globalThis.skinFadeStudio=Object.freeze({selectGuard:a.selectGuard,turn:a.turn,toggleClipper:a.toggleClipper,setAudioEnabled:a.setUserAudio,finish:a.finish,next:a.next,getView:a.getView,getState:a.getState})}hC().catch(e=>{console.error(e),document.documentElement.dataset.bootError="true"});})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
