const nice=v=>{v=Math.max(v,0.001);let m=10**Math.floor(Math.log10(v/4));return Math.ceil(v/4/m)*m*4};
const C={coal:'#49535e',renew:'#00868b',other:'#d6e0e3',grid:'#dce5e7'};
const fmt=(v,d=1)=>v.toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const tx=(x,y,s,cl='',anchor='start')=>`<text x="${x}" y="${y}" class="${cl}" text-anchor="${anchor}">${esc(s)}</text>`;
const ln=(x,y,a,b,color=C.grid,dash='')=>`<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" stroke="${color}" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const wrap=(s,w,h,label)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${s}</svg>`;
function lineChart(rows,pct=true){const w=550,h=300,L=55,R=425,T=28,B=250,max=pct?100:nice(Math.max(...rows.flatMap(r=>[r[1],r[2]]))*1.15);const x=y=>L+(y-rows[0][0])/(rows.at(-1)[0]-rows[0][0])*(R-L),yy=v=>B-v/max*(B-T);let s=tx(L,14,pct?'발전량 중 비중 (%)':'발전량 (TWh)');for(let i=0;i<=4;i++){let v=max*i/4;s+=ln(L,yy(v),R,yy(v))+tx(L-9,yy(v)+4,fmt(v,pct?0:0),'','end')}let years=[rows[0][0],...rows.filter(r=>r[0]%10===0&&r[0]>rows[0][0]+2&&r[0]<rows.at(-1)[0]-2).map(r=>r[0]),rows.at(-1)[0]];for(let y of years)s+=tx(x(y),B+24,y,'','middle');let labels=[];for(let [idx,col,name] of [[1,C.coal,'석탄'],[2,C.renew,'재생']]){const val=r=>pct?r[idx]/r[3]*100:r[idx];s+=`<path d="${rows.map((r,i)=>(i?'L':'M')+x(r[0])+','+yy(val(r))).join(' ')}" fill="none" stroke="${col}" stroke-width="3"/>`;for(let r of rows){let tip=`${r[0]}년 · ${name}\n${fmt(val(r))}${pct?'%':' TWh'}`;s+=`<circle cx="${x(r[0])}" cy="${yy(val(r))}" r="5" fill="${col}" opacity="0.01" tabindex="0" data-tip="${esc(tip)}"><title>${esc(tip)}</title></circle>`}let r=rows.at(-1);labels.push({col,name,v:val(r),y:yy(val(r))})}labels.sort((a,b)=>a.y-b.y);if(labels[1].y-labels[0].y<24){labels[0].y-=12;labels[1].y+=12}for(let l of labels)s+=tx(R+12,l.y+4,l.name+' '+fmt(l.v)+(pct?'%':''),'bold');return wrap(s,w,h,'석탄과 재생에너지 연간 추세')}
function barChart(rows){let ends=[rows[0],rows.at(-1)],w=550,h=300,L=65,B=250,T=28,max=nice(Math.max(...ends.map(r=>r[3]))*1.16),yy=v=>B-v/max*(B-T);let s=tx(L,14,'발전량 (TWh)');for(let i=0;i<=4;i++){let v=max*i/4;s+=ln(L,yy(v),505,yy(v))+tx(L-10,yy(v)+4,fmt(v,0),'','end')}ends.forEach((r,i)=>{let x=125+i*225,off=0;for(let [v,col,n] of [[r[1],C.coal,'석탄'],[r[2],C.renew,'재생에너지'],[Math.max(0,r[3]-r[1]-r[2]),C.other,'나머지 발전원']]){let hh=v/max*(B-T),tip=`${r[0]}년 · ${n}\n${fmt(v)} TWh (${fmt(v/r[3]*100)}%)`;s+=`<rect x="${x}" y="${yy(off+v)}" width="82" height="${hh}" fill="${col}" tabindex="0" data-tip="${esc(tip)}"><title>${esc(tip)}</title></rect>`;if(n==='석탄'&&hh>22)s+=tx(x+41,yy(off+v/2)+4,fmt(v,0),'white','middle');off+=v}s+=tx(x+41,yy(r[3])-10,fmt(r[3],0),'bold','middle')+tx(x+41,B+24,r[0],'','middle')});return wrap(s,w,h,'기간 시작과 종료의 총 발전량 및 발전원 구성')}
function bindTips(root=document){
 document.querySelector('#tooltip')?.remove();
 root.querySelectorAll('#trend,#bars').forEach(chart=>{
  chart.nextElementSibling?.classList.contains('pinned-value')&&chart.nextElementSibling.remove();
  chart.querySelector('.chart-tooltip')?.remove();
  const tip=document.createElement('div');tip.className='chart-tooltip';tip.hidden=true;tip.setAttribute('role','status');
  const content=document.createElement('span'),close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','고정 값 닫기');tip.append(content,close);chart.append(tip);
  let pinned=null;
  const clear=()=>{pinned?.removeAttribute('data-pinned');pinned?.setAttribute('aria-pressed','false');pinned=null;tip.hidden=true;tip.classList.remove('is-pinned')};close.onclick=clear;
  const position=(el,e)=>{const b=chart.getBoundingClientRect(),r=el.getBoundingClientRect();const x=e&&e.clientX?e.clientX:r.x+r.width/2,y=e&&e.clientY?e.clientY:r.y+r.height/2;content.textContent=el.dataset.tip;tip.hidden=false;let left=Math.max(4,Math.min(b.width-tip.offsetWidth-4,x-b.x));let top=y-b.y+16;if(top+tip.offsetHeight>b.height)top=Math.max(0,y-b.y-tip.offsetHeight-12);tip.style.left=(left/b.width*100)+'%';tip.style.top=(top/b.height*100)+'%'};
  chart.querySelectorAll('[data-tip]').forEach(el=>{
   el.setAttribute('role','button');el.setAttribute('aria-label',el.dataset.tip+' · 클릭하여 고정');el.setAttribute('aria-pressed','false');el.querySelector('title')?.remove();
   el.onpointermove=e=>{if(!pinned)position(el,e)};el.onfocus=()=>{if(!pinned)position(el)};el.onpointerleave=el.onblur=()=>{if(!pinned)tip.hidden=true};
   const pin=e=>{if(pinned===el){clear();return}clear();pinned=el;el.dataset.pinned='true';el.setAttribute('aria-pressed','true');tip.classList.add('is-pinned');position(el,e)};
   el.onclick=pin;el.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();pin()}if(e.key==='Escape')clear()};
  });tip.onkeydown=e=>{if(e.key==='Escape')clear()};
 });
}
