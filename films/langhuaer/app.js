'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const track=$('#album-track');
let albumDrag=null, momentumFrame=0;
const posters=[1,2,3,4].map(n=>({src:`portrait-${n}.jpg`,alt:`浪花儿人物海报 ${n}`,kind:'portrait'})).concat([{src:'illustration-poster.jpg',alt:'浪花儿原版海报',kind:'portrait'}]);
const stillOrder=[2,1,3,4,5,6,7,8,9];
const gallery=[];
for(let i=0;i<14;i++){
 if(i<posters.length)gallery.push(posters[i]);
 if(i<stillOrder.length)gallery.push({src:`still-${String(stillOrder[i]).padStart(2,'0')}.jpg`,alt:`浪花儿剧照 ${stillOrder[i]}`,kind:'photo'});
 gallery.push({src:`review-${String(i+1).padStart(2,'0')}.jpg`,alt:`浪花儿口碑图 ${i+1}`,kind:'photo'});
}
for(const [i,item] of gallery.entries()){
 const page=document.createElement('div');page.className=`album-page ${item.kind==='photo'?'album-photo':'album-poster'}`;page.style.setProperty('--index',Math.min(i,5));page.style.setProperty('--rest-angle',`${i%2?2:-2}deg`);
 const image=new Image();image.src=`./assets/${item.src}`;image.alt=item.alt;image.draggable=false;image.loading=i<4?'eager':'lazy';page.append(image);track.append(page);
 page.addEventListener('pointermove',e=>{if(albumDrag||e.pointerType!=='mouse'||reducedMotion.matches)return;const r=page.getBoundingClientRect();page.style.setProperty('--rx',`${-(e.clientY-r.top-r.height/2)/r.height*9}deg`);page.style.setProperty('--ry',`${(e.clientX-r.left-r.width/2)/r.width*12}deg`);});
 page.addEventListener('pointerleave',()=>{page.style.setProperty('--rx','0deg');page.style.setProperty('--ry','0deg');});
}
function stopMomentum(){cancelAnimationFrame(momentumFrame);track.style.setProperty('--drag-lean','0deg');}
track.addEventListener('pointerdown',e=>{stopMomentum();if(e.pointerType!=='mouse'||e.button!==0)return;albumDrag={x:e.clientX,time:e.timeStamp,velocity:0};track.setPointerCapture(e.pointerId);track.classList.add('dragging');});
track.addEventListener('pointermove',e=>{if(!albumDrag)return;const dx=albumDrag.x-e.clientX,dt=Math.max(8,e.timeStamp-albumDrag.time);track.scrollLeft+=dx;albumDrag.velocity=albumDrag.velocity*.35+dx/dt*.65;albumDrag.x=e.clientX;albumDrag.time=e.timeStamp;if(!reducedMotion.matches)track.style.setProperty('--drag-lean',`${Math.max(-4,Math.min(4,albumDrag.velocity*-1.4))}deg`);});
function endAlbumDrag(e){if(!albumDrag)return;const drag=albumDrag;albumDrag=null;track.classList.remove('dragging');if(reducedMotion.matches||e.type!=='pointerup'||e.timeStamp-drag.time>120){stopMomentum();return;}let velocity=drag.velocity,last=performance.now();function coast(time){const dt=Math.min(32,time-last);last=time;const before=track.scrollLeft;track.scrollLeft+=velocity*dt;velocity*=Math.exp(-dt/190);track.style.setProperty('--drag-lean',`${Math.max(-4,Math.min(4,velocity*-1.4))}deg`);if(Math.abs(velocity)>.015&&Math.abs(track.scrollLeft-before)>.1)momentumFrame=requestAnimationFrame(coast);else stopMomentum();}momentumFrame=requestAnimationFrame(coast);}
track.addEventListener('pointerup',endAlbumDrag);track.addEventListener('pointercancel',endAlbumDrag);track.addEventListener('lostpointercapture',endAlbumDrag);
track.addEventListener('wheel',stopMomentum,{passive:true});
track.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.preventDefault();stopMomentum();track.scrollBy({left:e.key==='ArrowRight'?180:-180,behavior:reducedMotion.matches?'instant':'smooth'});});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');revealObserver.unobserve(entry.target);}}),{threshold:.12});
for(const section of $$('.control-group,.preview')){section.classList.add('reveal');revealObserver.observe(section);}

const canvas=$('#poster'),ctx=canvas.getContext('2d'),W=886,H=1329;
const images=new Map();let ready=false,sourceImage=null,objectURL=null,photoDrag=null,renderFrame=0;
const state={director:'齐炎焱',english:'Yanyan QI',zoom:1,x:0,y:0};
async function load(name){if(images.has(name))return images.get(name);const image=new Image();image.src=`./assets/${name}`;await image.decode();images.set(name,image);return image;}
function say(message){$('#status').textContent=message;}
function drawFit(value,x,y,width,size,font,color){ctx.font=`${size}px ${font}`;while(ctx.measureText(value).width>width&&size>10){size--;ctx.font=`${size}px ${font}`;}ctx.fillStyle=color;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(value,x,y);}
function drawDirector(){const c='#c49d62';drawFit('导演 /',25,39,135,25,'MiSans',c);drawFit('DIRECTOR',25,68,135,23,'Anton',c);drawFit(state.director,25,108,230,26,'MiSans',c);drawFit(state.english,25,136,230,25,'Anton',c);}
function render(){if(!ready||!sourceImage)return;ctx.clearRect(0,0,W,H);
 const scale=Math.max(W/sourceImage.width,H/sourceImage.height)*state.zoom;const width=sourceImage.width*scale,height=sourceImage.height*scale;state.x=Math.max(-(width-W)/2,Math.min((width-W)/2,state.x));state.y=Math.max(-(height-H)/2,Math.min((height-H)/2,state.y));ctx.drawImage(sourceImage,(W-width)/2+state.x,(H-height)/2+state.y,width,height);
 const shade=ctx.createLinearGradient(0,760,0,H);shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#00000090');ctx.fillStyle=shade;ctx.fillRect(0,760,W,H-760);ctx.drawImage(images.get('original-overlay.png'),0,0);drawDirector();
 canvas.setAttribute('aria-label',`浪花儿照片海报，导演 ${state.director} / ${state.english}`);
}
function schedule(){cancelAnimationFrame(renderFrame);renderFrame=requestAnimationFrame(render);}
function sync(){const hasPhoto=Boolean(sourceImage);$('#director').value=state.director;$('#director-en').value=state.english;$('#zoom').value=state.zoom;$('#zoom-value').textContent=`${Math.round(state.zoom*100)}%`;$('#zoom').disabled=!hasPhoto;$('#center').disabled=!hasPhoto;$('#enlarge').disabled=!ready||!hasPhoto;$('#download').disabled=!ready||!hasPhoto;canvas.hidden=!hasPhoto;$('#photo-area').hidden=!hasPhoto;$('#photo-area').classList.toggle('editable',hasPhoto);$('#empty-photo').hidden=hasPhoto;}
function animatePhoto(){if(reducedMotion.matches)return;canvas.getAnimations().forEach(animation=>animation.cancel());canvas.animate([{opacity:.15,transform:'scale(1.04)',filter:'blur(5px)'},{opacity:1,transform:'scale(1)',filter:'blur(0)'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});}
$('#director').addEventListener('input',e=>{state.director=e.target.value;schedule();});$('#director-en').addEventListener('input',e=>{state.english=e.target.value;schedule();});
async function upload(file){if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){say('支持 JPG、PNG、WebP。');return;}if(file.size>25*1024*1024){say('图片需小于 25 MB。');return;}const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();if(objectURL)URL.revokeObjectURL(objectURL);objectURL=url;sourceImage=image;state.zoom=1;state.x=0;state.y=0;$('#upload-label').textContent=file.name.length>22?`${file.name.slice(0,19)}…`:file.name;sync();render();animatePhoto();say('');}catch{URL.revokeObjectURL(url);say('图片读取失败。');}}
$('#empty-photo').addEventListener('click',()=>$('#photo').click());
$('#photo').addEventListener('change',e=>{upload(e.target.files[0]);e.target.value='';});
const dropzone=$('#dropzone');for(const type of ['dragenter','dragover'])dropzone.addEventListener(type,e=>{e.preventDefault();dropzone.classList.add('over');});for(const type of ['dragleave','drop'])dropzone.addEventListener(type,e=>{e.preventDefault();dropzone.classList.remove('over');if(type==='drop')upload(e.dataTransfer.files[0]);});
$('#zoom').addEventListener('input',e=>{state.zoom=Number(e.target.value);$('#zoom-value').textContent=`${Math.round(state.zoom*100)}%`;schedule();});
$('#center').addEventListener('click',()=>{state.x=state.y=0;state.zoom=1;sync();render();});
const area=$('#photo-area');let pointers=new Map(),pinchStart=null;
area.addEventListener('pointerdown',e=>{if(!sourceImage)return;area.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});photoDrag={x:e.clientX,y:e.clientY,ox:state.x,oy:state.y};if(pointers.size===2){const p=[...pointers.values()];pinchStart={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom:state.zoom};}area.classList.add('dragging');});
area.addEventListener('pointermove',e=>{if(!sourceImage||!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&pinchStart){const p=[...pointers.values()];state.zoom=Math.max(1,Math.min(3,pinchStart.zoom*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/pinchStart.distance));sync();}else if(photoDrag){const scale=W/area.clientWidth;state.x=photoDrag.ox+(e.clientX-photoDrag.x)*scale;state.y=photoDrag.oy+(e.clientY-photoDrag.y)*scale;}schedule();});
function endPhoto(e){pointers.delete(e.pointerId);pinchStart=null;photoDrag=null;if(pointers.size===1){const p=[...pointers.values()][0];photoDrag={x:p.x,y:p.y,ox:state.x,oy:state.y};}if(!pointers.size)area.classList.remove('dragging');}
area.addEventListener('pointerup',endPhoto);area.addEventListener('pointercancel',endPhoto);
area.addEventListener('keydown',e=>{if(!sourceImage||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();state.x+=e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0;state.y+=e.key==='ArrowDown'?10:e.key==='ArrowUp'?-10:0;schedule();});
$('#reset').addEventListener('click',()=>{state.director='齐炎焱';state.english='Yanyan QI';state.x=state.y=0;state.zoom=1;sync();render();say('');});
function showPreview(){if(!ready||!sourceImage)return;render();$('#save-image').src=canvas.toDataURL('image/png');$('#save-dialog').showModal();}
async function download(){if(!ready||!sourceImage)return;try{render();const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('export failed')),'image/png'));const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='浪花儿海报.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);say('已导出 886 × 1329 PNG');}catch{say('导出失败。');}}
$('#download').addEventListener('click',()=>{if(matchMedia('(max-width:760px)').matches)showPreview();else download();});$('#save-file').addEventListener('click',download);$('#enlarge').addEventListener('click',showPreview);$('#save-close').addEventListener('click',()=>$('#save-dialog').close());
async function init(){try{await Promise.all([document.fonts.load('24px MiSans'),document.fonts.load('24px Anton'),load('original-overlay.png')]);ready=true;sync();render();$('#download').textContent='下载海报';}catch(error){say('素材载入失败。');console.error(error);}}
init();
