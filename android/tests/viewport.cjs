'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(require('node:path').join(__dirname,'../viewport-compat.js'),'utf8');
for(const legacy of [false,true]){
  class Rect {constructor(x,y,width,height){Object.assign(this,{x,y,width,height,left:x,top:y,right:x+width,bottom:y+height});}}
  class Element {
    constructor({classes=[],parent=null,zoom=1,scoped=false,rect=new Rect(10,20,30,40)}={}){this.classes=classes;this.parentElement=parent;this.zoom=zoom;this.scoped=scoped;this.rect=rect;this.classList={contains:name=>this.classes.includes(name)};this.style={};}
    closest(){return this.scoped?this:null;}
    getBoundingClientRect(){return this.rect;}
    remove(){}
  }
  const native=Element.prototype.getBoundingClientRect;
  const context=vm.createContext({window:{HSC:{S:1.429}},Element,DOMRect:Rect,getComputedStyle:el=>({zoom:el.zoom}),document:{body:{appendChild(){}},createElement(){return new Element({rect:new Rect(0,0,legacy?10:20,legacy?10:20)});}}});
  vm.runInContext(code,context);
  assert.equal(context.window.HSC.viewportCompat.legacyRectZoom,legacy);
  assert.equal(Element.prototype.getBoundingClientRect===native,!legacy,'modern browsers retain native geometry API');
  const canvas=new Element();
  assert.equal(canvas.getBoundingClientRect(),canvas.rect,'unscoped canvas retains exact original rect');
  const ui=new Element({classes:['ui'],zoom:1.429,scoped:true});
  const area=new Element({classes:['play-area'],parent:ui,scoped:true});
  const sheet=new Element({parent:ui,zoom:.8,scoped:true});
  const button=new Element({parent:sheet,zoom:2,scoped:true});
  for(const [element,factor] of [[ui,1.429],[area,1.429],[button,1.429*.8*2]]){
    const rect=element.getBoundingClientRect();
    const scale=legacy?factor:1;
    for(const key of ['x','y','left','top','right','bottom','width','height'])assert(Math.abs(rect[key]-element.rect[key]*scale)<1e-8,`${legacy}/${key}: cumulative viewport geometry`);
    assert.equal(context.window.HSC.viewportCompat.rawRect(element),element.rect);
  }
  context.window.HSC.S=1.2;
  ui.zoom=1.2;
  assert.equal(area.getBoundingClientRect().width,30*(legacy?1.2:1),'responsive resize reads current UI zoom');
}
console.log('PASS: legacy/modern viewport normalization, nested zoom, resize, raw rect and canvas isolation.');
