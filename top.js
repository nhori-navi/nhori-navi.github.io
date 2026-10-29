// ミル シリーズ TOP の動き（版4：2026-10-29）
// はじめの絵：昼→夕暮れ→夜→明け方を30秒でめぐる。右下の丸ボタンで昼夜を切り替え
(function(){
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);(p||null)&&p.appendChild(e);return e};
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
const W=1200,H=760;
// 稜線（いくつかの波を重ねて、なめらかな山並みを作る）
function ridgePts(base,amp,s,peaks){seed=s;const w=[];for(let i=0;i<6;i++)w.push([rnd()*0.012+0.002*(i+1),rnd()*6.28,amp/(i*0.9+1)]);
  const pts=[];for(let x=-20;x<=W+20;x+=8){let y=base;for(const [f,ph,a] of w)y-=Math.sin(x*f+ph)*a;
    for(const pk of (peaks||[])){const d=(x-pk.x)/pk.w;y-=pk.h*Math.exp(-d*d)}pts.push([x,y])}return pts}
const toPath=(pts)=>'M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+` L${W+20} ${H} L-20 ${H} Z`;
// いちばん遠い山並み＋富士山
const fujiX=640,FR=330,FH=125;
const fujiE=d=>{d=Math.max(Math.abs(d),14);return d<FR?FH*Math.pow(1-d/FR,1.9):0};
const r0=ridgePts(480,8,11).map(([x,y])=>[x,Math.min(y,480-fujiE(x-fujiX))]);
for(let x=fujiX-60;x<=fujiX+60;x+=3)r0.push([x,480-fujiE(x-fujiX)]);r0.sort((a,b)=>a[0]-b[0]);
$('r0').setAttribute('d',toPath(r0));
let snow='';{const lim=FH*.58;const top=[];for(let x=fujiX-160;x<=fujiX+160;x+=3){if(fujiE(x-fujiX)>lim)top.push([x,480-fujiE(x-fujiX)])}
  snow='M'+top.map(p=>p[0]+' '+p[1].toFixed(1)).join(' L');
  const bottom=[];for(let x=top[top.length-1][0];x>=top[0][0];x-=2){const u=x-fujiX;
    const wav=4*Math.sin(u*.09+1)+3*Math.sin(u*.23+2);const st=16*Math.pow(Math.max(0,Math.sin(u*.075+.4)),8)+10*Math.pow(Math.max(0,Math.sin(u*.13+2.1)),10);
    bottom.push([x,Math.max(480-fujiE(u)+2,480-lim+wav+st)])}
  const z=bottom;
  snow+=' L'+z.map(p=>p[0]+' '+p[1].toFixed(1)).join(' L')+' Z'}
$('fujiSnow').setAttribute('d',snow);
const r1=ridgePts(530,24,23,[{x:440,w:80,h:62}]), r2=ridgePts(575,22,41,[{x:930,w:120,h:30}]), r3=ridgePts(625,16,57);
$('r1').setAttribute('d',toPath(r1));$('r2').setAttribute('d',toPath(r2));$('r3').setAttribute('d',toPath(r3));
const peakOf=(pts,a,b)=>pts.filter(p=>p[0]>a&&p[0]<b).reduce((m,p)=>p[1]<m[1]?p:m,[0,9999]);
const ml=$('mlabels');
const labs=[];for(const [p,name] of [[peakOf(r0,fujiX-40,fujiX+40),'富士山'],[peakOf(r1,380,500),'大山']]){
  const g=el('g',{transform:`translate(${p[0]} ${p[1]-8})`},ml);labs.push(g);
  el('line',{x1:0,y1:0,x2:0,y2:-34,stroke:'currentColor','stroke-opacity':.55},g);
  const t=el('text',{x:0,y:-42,'text-anchor':'middle',fill:'currentColor'},g);t.textContent=name}
// 町並み（家・駅・木）
const town=$('town'); seed=99; const wins=[];
function house(x,base,w,h,roof){const g=el('g',{},town);
  el('path',{d:`M${x} ${base} L${x} ${base-h} L${x+w/2} ${base-h-roof} L${x+w} ${base-h} L${x+w} ${base} Z`},g);
  const n=Math.max(1,Math.floor(w/22));for(let i=0;i<n;i++){if(rnd()<.35)continue;
    wins.push(el('rect',{x:x+8+i*(w-12)/n,y:base-h+10,width:8,height:9,rx:1,fill:'#ffd98a',opacity:0},town))}}
const townBase=x=>{let y=660;y-=Math.sin(x*0.004+1)*14;return y};
for(let x=-10;x<W+20;){const w=40+rnd()*46,h=24+rnd()*30;const b=townBase(x+w/2)+8;
  if(rnd()<.22){el('ellipse',{cx:x+w/2,cy:b-h*.8,rx:w*.42,ry:h*.75},town);el('rect',{x:x+w/2-2,y:b-h*.4,width:4,height:h*.4},town)}
  else house(x,b,w,h,8+rnd()*14);x+=w+4+rnd()*18}
// 駅（屋根の長い建物）
{const x=700,b=townBase(760)+6;el('rect',{x,y:b-26,width:150,height:26},town);el('path',{d:`M${x-10} ${b-26} L${x+160} ${b-26} L${x+150} ${b-36} L${x} ${b-36} Z`},town);
 for(let i=0;i<5;i++)wins.push(el('rect',{x:x+12+i*28,y:b-19,width:14,height:8,rx:1,fill:'#ffd98a',opacity:0},town))}
// 手前の丘と散歩道
const fgPts=[];for(let x=-20;x<=W+20;x+=10)fgPts.push([x,690-Math.sin(x*0.005+0.6)*18-Math.sin(x*0.013)*6]);
$('fg').setAttribute('d',toPath(fgPts));
const routeD='M-20 752 C140 730 210 700 330 708 S520 742 640 722 S860 690 980 704 S1140 726 1230 712';
$('route').setAttribute('d',routeD);$('walked').setAttribute('d',routeD);
const walked=$('walked'),L=walked.getTotalLength();walked.style.strokeDasharray=L;
const pinAt=walked.getPointAtLength(L*0.62);$('pin').setAttribute('transform',`translate(${pinAt.x} ${pinAt.y-58}) scale(.9)`);
// 星
const st=$('stars');seed=5;for(let i=0;i<150;i++){const y=rnd()*470;const c=el('circle',{cx:rnd()*W,cy:y,r:(rnd()*1.3+.4).toFixed(2),fill:'#fff',opacity:(.45+rnd()*.55).toFixed(2)},st);if(rnd()<.35){c.setAttribute('class','twinkle');c.style.animationDelay=(rnd()*3).toFixed(2)+'s'}}
// 星座（オリオン座の形）
{const c=$('constel');
 const C=[
  [[[0,0],[50,-6],[22,58],[30,60],[38,62],[6,120],[60,116]],[[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[0,1]],960,140],
  [[[0,0],[30,30],[60,12],[92,38],[122,6]],[[0,1],[1,2],[2,3],[3,4]],540,60],
  [[[0,0],[36,8],[66,22],[96,18],[122,46],[168,42],[172,8]],[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],150,130],
  [[[0,0],[0,44],[0,96],[-38,40],[38,48]],[[0,1],[1,2],[3,1],[1,4]],790,230]];
 for(const [pts,ls,ox,oy] of C){const o=pts.map(([x,y])=>[x+ox,y+oy]);
   for(const [a,b] of ls)el('line',{x1:o[a][0],y1:o[a][1],x2:o[b][0],y2:o[b][1]},c);
   for(const q of o)el('circle',{cx:q[0],cy:q[1],r:2.2,fill:'#fff',stroke:'none'},$('stars'))}
 seed=77;for(let i=0;i<7;i++)el('circle',{cx:1080+rnd()*26,cy:70+rnd()*18,r:1.3,fill:'#fff'},$('stars'))}
// 雲
const cl=$('clouds');seed=3;const clouds=[];
for(let i=0;i<5;i++){const g=el('g',{},cl);const s=.7+rnd()*.8;for(let j=0;j<5;j++)el('ellipse',{cx:j*34*s,cy:-Math.sin(j/4*3.14)*16*s,rx:(40+rnd()*20)*s,ry:(16+rnd()*8)*s,fill:'#fff'},g);
  clouds.push({g,x:rnd()*W,y:i<2?70+rnd()*60:290+rnd()*70,v:4+rnd()*6})}
// 色
const P={
 day:{s:['#79b0e2','#a8d1ef','#e7f1f2'],r:['#b4cadb','#8fb0c0','#749c8e','#5d8866'],town:'#56755f',fg:'#78a35e',route:'#ffffff',walk:'#1e8a4c',ink:'#1f2a33',lab:'#33465a',plane:'#2b4a6b',cloud:.85,haze:1},
 dusk:{s:['#34477a','#c97b8f','#f6b47c'],r:['#9a86a8','#7a6c90','#5c5a7c','#454c66'],town:'#3a4058',fg:'#4b5b52',route:'#ffe3c4',walk:'#6fd39a',ink:'#ffffff',lab:'#fff1e6',plane:'#2d2a3c',cloud:.55,haze:.6},
 night:{s:['#070f28','#14234a','#2b3c66'],r:['#2a3b60','#203050','#18253f','#111b2f'],town:'#0d1523','fg':'#122019',route:'#a8b8d8',walk:'#5ccf8a',ink:'#ffffff',lab:'#d9e2ff',plane:'#10141f',cloud:.12,haze:.15}};
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const lerp=(a,b,t)=>a+(b-a)*t;
function pal(n){const [a,b,t]=n<.5?[P.day,P.dusk,n*2]:[P.dusk,P.night,(n-.5)*2];const o={};
  for(const k in a){o[k]=Array.isArray(a[k])?a[k].map((v,i)=>mix(v,b[k][i],t)):typeof a[k]==='number'?lerp(a[k],b[k],t):mix(a[k],b[k],t)}return o}
// 時間の進み：昼12秒→夕方3秒→夜12秒→明け方3秒
const CY=30000, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let offset=0, manual=null, t0=performance.now();
function nightOf(p){if(p<.40)return 0;if(p<.50)return (p-.40)/.10;if(p<.90)return 1;return 1-(p-.90)/.10}
$('tg').onclick=()=>{const cur=reduce?manual??0:nightOf(((performance.now()-t0+offset)%CY)/CY);
  if(reduce){manual=cur>.5?0:1;draw(performance.now());return}
  const target=cur>.5?0.02:0.52;const now=(performance.now()-t0)%CY/CY;offset=((target-now+1)%1)*CY};
const hero=$('hero'),root=document.documentElement;
function draw(now){
  const p=((now-t0+offset)%CY)/CY;
  const n=reduce?(manual??0):nightOf(p);
  const c=pal(n);
  ['s0','s1','s2'].forEach((id,i)=>$(id).setAttribute('stop-color',c.s[i]));
  ['r0','r1','r2','r3'].forEach((id,i)=>$(id).setAttribute('fill',c.r[i]));
  $('fujiSnow').setAttribute('fill',mix('#ffffff','#8d9cc0',n));
  $('haze0').setAttribute('opacity',c.haze.toFixed(2));
  $('town').setAttribute('fill',c.town);$('fg').setAttribute('fill',c.fg);
  $('route').setAttribute('stroke',c.route);$('walked').setAttribute('stroke',c.walk);
  const lit=Math.max(0,(n-.35)/.65);wins.forEach((w,i)=>w.setAttribute('opacity',(lit*(i%3?1:.7)).toFixed(2)));
  $('stars').setAttribute('opacity',Math.max(0,(n-.45)/.55).toFixed(2));$('constel').setAttribute('opacity',(Math.max(0,(n-.7)/.3)*.8).toFixed(2));
  // 太陽は弧を描いて山の向こうへ沈む／月は反対側から昇る
  const top=480-FH;let sx,sy,so=1;
  if(p<.40){const u=p/.40;sx=lerp(140,fujiX,u);sy=top-Math.sin((1-u)*Math.PI/2)*230}
  else if(p<.50){const u=(p-.40)/.10;sx=fujiX+u*6;sy=top+u*60}
  else {sx=140;sy=top-230;so=p>.90?(p-.90)/.10:0}
  $('sun').setAttribute('transform',`translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);$('sun').setAttribute('opacity',so.toFixed(2));
  const gd=Math.abs(sy-top);const gl=(p>.36&&p<.46)?Math.max(0,1-gd/26):0;
  $('glint').setAttribute('transform',`translate(${fujiX} ${top+2}) scale(${(.4+gl*.8).toFixed(2)}) rotate(${(now/80%360).toFixed(1)})`);$('glint').setAttribute('opacity',(gl*.95).toFixed(2));
  labs[0].setAttribute('opacity',Math.min(1,Math.hypot(sx-fujiX,sy-top)/120).toFixed(2));
  const mu=p>=.44&&p<=.96?(p-.44)/.52:-1;
  if(mu>=0){$('moon').setAttribute('transform',`translate(${lerp(430,1080,mu).toFixed(1)} ${(470-Math.sin(mu*Math.PI)*185).toFixed(1)}) rotate(${(-35+mu*70).toFixed(1)})`)}
  $('moon').setAttribute('opacity',mu<0?0:Math.min(1,n*1.3).toFixed(2));
  clouds.forEach(k=>{const x=((k.x+now/1000*k.v)%(W+300))-200;k.g.setAttribute('transform',`translate(${x.toFixed(1)} ${k.y})`)});
  $('clouds').setAttribute('opacity',c.cloud.toFixed(2));
  // 飛行機（右へ進む）
  const px=reduce?640:((now/1000*34)%(W+520))-240;
  const pl=$('plane');pl.setAttribute('transform',`translate(${px.toFixed(1)} ${(395-px*.05).toFixed(1)})`);pl.style.color=c.lab;
  $('pbody').setAttribute('fill',c.plane);$('trail').setAttribute('opacity',(1-n).toFixed(2));
  $('blink').setAttribute('opacity',n>.4&&Math.floor(now/600)%2?'1':'0');
  $('plabel').setAttribute('opacity',(1-Math.min(1,n*1.4)).toFixed(2));
  // 宇宙ステーション（夜の間に西から東へ）
  const ip=p>.52&&p<.88&&!reduce?(p-.52)/.36:-1;$('iss').setAttribute('opacity',ip<0?0:Math.min(1,Math.sin(ip*Math.PI)*3).toFixed(2));
  if(ip>=0)$('iss').setAttribute('transform',`translate(${lerp(80,1120,ip).toFixed(1)} ${(440-Math.sin(ip*Math.PI)*120).toFixed(1)})`);
  $('mlabels').style.color=c.lab;
  // 歩いた道は昼の間にのびる
  const wk=reduce?.62:Math.min(1,p/.4)*.62+.0;walked.style.strokeDashoffset=(L*(1-wk)).toFixed(1);
  const wp=walked.getPointAtLength(L*wk);$('walker').setAttribute('transform',`translate(${wp.x} ${wp.y})`);
  hero.style.setProperty('--ink',c.ink);hero.style.setProperty('--ink2',c.ink+'cc');
  $('tg').textContent=n>.5?'☀':'☾';
  if(!reduce)requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
window.__seek=q=>{const now=(performance.now()-t0)%CY/CY;offset=((q-now+1)%1)*CY};
})();

// ── ここから TOP の動き（版4） ──
(function(){
  // 絵の中の道・ピン・飛行機・山を押すと、そのアプリの紹介へ
  document.querySelectorAll('#hero .hot').forEach(e=>e.addEventListener('click',()=>{
    const t=document.getElementById(e.dataset.go);if(t)t.scrollIntoView({behavior:reduceM?'auto':'smooth',block:'start'})}));
  const reduceM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 数字を数え上げる・棒をのばす
  function run(box){
    box.querySelectorAll('[data-count]').forEach(e=>{const to=+e.dataset.count,dec=+(e.dataset.dec||0);
      if(reduceM){e.textContent=to.toFixed(dec);return}
      const t0=performance.now();(function f(now){const k=Math.min(1,(now-t0)/1200),v=to*(1-Math.pow(1-k,3));e.textContent=v.toFixed(dec);if(k<1)requestAnimationFrame(f)})(t0)});
    box.querySelectorAll('[data-w]').forEach(e=>{e.style.width=e.dataset.w});
    box.querySelectorAll('[data-l]').forEach(e=>{e.style.left=e.dataset.l});
  }
  // 画面に入ったら、ふわっと出す
  const items=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){items.forEach(e=>{e.classList.add('in');run(e)});return}
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');run(en.target);io.unobserve(en.target)}}),{threshold:.18});
  items.forEach(e=>io.observe(e));
  // TenMiru の小さな絵：真上に向かって飛んでくる飛行機
  const pl=document.getElementById('tenPlane'),cnt=document.getElementById('tenCount');
  if(pl){const P=11000;let vis=false;
    new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(pl.ownerSVGElement);
    (function f(now){
      const k=reduceM?0.62:(now%P)/P,x=-40+k*580,y=250-k*165;
      pl.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(-16)`);
      const left=Math.round((300-x)/6.2);
      cnt.textContent=left>2?`真上まで あと 0:${String(left).padStart(2,'0')}`:left>-6?'いま真上！':'通りすぎました';
      if(!reduceM)requestAnimationFrame(f)})(performance.now());
  }
})();
