# Builds the single-file playable test copy from build/ (not the store package):
# no Playgama bridge (the game's local test mode, stand-in ads), and test-mode saves kept in the browser.
import base64, sys
out = sys.argv[1]
B = 'build/'
css = open(B + 'styles.css').read()
for n in ['backdrop-landscape', 'backdrop-portrait']:
    d = base64.b64encode(open(B + f'assets/{n}.webp', 'rb').read()).decode()
    css = css.replace(f'url("assets/{n}.webp")', f'url("data:image/webp;base64,{d}")')
js = lambda f: open(B + 'runtime/' + f).read().replace('</script', '<\\/script')
g = js('game.js')
a = 'let e=["localhost","127.0.0.1","terminal.local"].includes((k=globalThis.location)==null?void 0:k.hostname),'
assert g.count(a) == 1; g = g.replace(a, 'let e=!0,')
a = 'storage:{async get(i){return i.map(a=>{var n;return(n=e.get(a))!=null?n:null})},async set(i,a){i.forEach((n,o)=>e.set(n,a[o]))},async delete(i){i.forEach(a=>e.delete(a))}}'
assert g.count(a) == 1
g = g.replace(a, 'storage:{async get(i){return i.map(a=>{try{let n=localStorage.getItem("hs:"+a);return n==null?null:JSON.parse(n)}catch(o){return null}})},async set(i,a){i.forEach((n,o)=>{try{localStorage.setItem("hs:"+n,JSON.stringify(a[o]))}catch(s){}})},async delete(i){i.forEach(a=>{try{localStorage.removeItem("hs:"+a)}catch(n){}})}}')
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#2b1e17">
<title>ASMR Barber: Fade Master</title>
<style>{css}</style>
</head>
<body>
<main id="game" class="game-root" aria-label="ASMR Barber: Fade Master">
<canvas id="scene" aria-label="Customer haircut view"></canvas>
</main>
<script>{js('customers.js')}</script>
<script>{g}</script>
</body>
</html>
'''
open(out, 'w').write(html)
print('wrote', out, len(html.encode()))
