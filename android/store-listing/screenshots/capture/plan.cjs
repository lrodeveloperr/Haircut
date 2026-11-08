// cut choreography per scene, in 360x640 screen px. hold = in progress with the clipper; none = finished cut
const wav=(x0,x1,y,ph)=>{const a=[];for(let x=x0;x<=x1;x+=8)a.push([x,y+2.5*Math.sin(x/19+ph)]);return a;};
const band=(x0,x1,y0,y1,dy=3)=>{const L=[];let k=0;for(let y=y0;y<=y1;y+=dy,k++){const w=wav(x0,x1,y,k);L.push(k%2?w.reverse():w);}return L;};
const vl=(x0,x1,yb,yt,dx=3)=>{const L=[];for(let x=x0;x<=x1;x+=dx)L.push([[x,yb],[x+1,yt]]);return L;};
const clear=(p)=>p.evaluate(()=>HSC.clearClippings());
module.exports={
 // in progress: beard trimmed from underneath
 '1-beard-under':async(p,B,L)=>{await L.strokes(p,1,vl(60,165,455,385));await clear(p);await L.strokes(p,1,vl(140,165,455,385));await L.hold(p,1,[[172,460],[173,425],[174,388]]);},
 // finished: crisp side skin fade
 '2-fade-side':async(p,B,L)=>{await L.strokes(p,0,band(50,320,338,400));await L.strokes(p,1,band(50,320,314,338));await L.strokes(p,2,band(50,320,292,314));await L.strokes(p,3,band(50,320,272,292));await clear(p);},
 // in progress: back fade, clipper on the line
 '3-fade-back':async(p,B,L)=>{await L.strokes(p,0,band(40,330,385,445));await L.strokes(p,1,band(40,330,352,385));await L.strokes(p,2,vl(40,190,355,318));await clear(p);await L.strokes(p,2,vl(165,190,355,318));await L.hold(p,2,[[198,360],[199,340],[200,318]]);},
 // in progress: first buzz strip through long hair
 '4-buzz-top':async(p,B,L)=>{await L.strokes(p,1,vl(160,235,370,140));await clear(p);await L.strokes(p,1,vl(215,235,370,140));await L.hold(p,1,[[240,355],[241,300],[242,250]]);},
 // finished: sculpted silver beard, clean cheek line
 '5-beard-cheek':async(p,B,L)=>{await L.strokes(p,3,vl(55,290,330,540).map(l=>l));await L.strokes(p,2,vl(55,290,470,540));await clear(p);},
 // finished: ginger taper from behind
 '6-neckline-low':async(p,B,L)=>{await L.strokes(p,0,band(45,325,348,400));await L.strokes(p,1,band(45,325,322,348));await L.strokes(p,2,band(45,325,298,322));await L.strokes(p,3,band(45,325,276,298));await clear(p);},
 // in progress: temple skin fade on coily hair
 '7-fade-coily':async(p,B,L)=>{await L.strokes(p,0,band(160,250,300,355));await L.strokes(p,1,band(160,250,276,300));await clear(p);await L.strokes(p,0,band(225,250,300,355));await L.hold(p,0,[[256,350],[257,325],[258,298]]);},
 // finished: high fade, three-quarter front
 '8-crown-high':async(p,B,L)=>{await L.strokes(p,0,band(215,350,320,380));await L.strokes(p,1,band(215,350,296,320));await L.strokes(p,2,band(215,350,276,296));await clear(p);},
 'F-feature':async(p,B,L)=>{await L.strokes(p,3,vl(360,615,200,164,2));await L.strokes(p,2,vl(360,615,236,198,2));await L.strokes(p,1,vl(360,615,345,234,2));await L.strokes(p,0,vl(360,548,345,270,2));await clear(p);await L.strokes(p,0,vl(530,548,345,270,2));await L.hold(p,0,[[556,336],[557,304],[558,272]]);},
};
