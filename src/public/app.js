import { applianceCalculation, btuCalculation, solarCalculation, clp, num, nf } from '../lib/calc.js';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const animations = new WeakMap();
function write(root,key,value,numeric) {
  root.querySelectorAll(`[data-out="${key}"]`).forEach(el=>{
    cancelAnimationFrame(animations.get(el));
    const match=String(value).match(/^(\$?)([\d.,]+)(.*)$/);
    if(!match){el.textContent=value;return;}
    const target=numeric ?? Number(match[2].replace(/\./g,'').replace(',','.'));
    const start=Number(el.dataset.numeric ?? target);
    const digits=match[2].split(',')[1]?.length ?? 0;
    const begin=performance.now();
    function frame(now) {
      const p=reduced.matches?1:Math.min(1,(now-begin)/420);
      const n=start+(target-start)*(1-(1-p)**3);
      el.dataset.numeric=p===1?target:n;
      el.textContent=p===1?value:match[1]+num(n,digits)+match[3];
      if(p<1)animations.set(el,requestAnimationFrame(frame));
    }
    frame(begin);
  });
}
function number(root,name,fallback=0) {
  const input=root.querySelector(`[name="${name}"]`);
  const raw=input?.value.trim();
  const n=raw?Number(raw):fallback;
  return Math.min(input?.max?Number(input.max):Infinity,Math.max(input?.min?Number(input.min):0,Number.isFinite(n)?n:fallback));
}
function updateRing(root,p) {
  root.querySelector('.ring')?.style.setProperty('--share',`${Math.max(0,Math.min(100,p))}%`);
}
document.querySelectorAll('[data-calculator]').forEach(root=>{
  const type=root.dataset.calculator;
  function update() {
    if(type==='appliance'){
      const x=applianceCalculation({watts:number(root,'watts',1),hoursPerDay:number(root,'hours'),daysPerMonth:number(root,'days',30),priceKwh:number(root,'price',1)});
      write(root,'costMonth',clp(x.costMonth),Math.round(x.costMonth));
      write(root,'costYear',clp(x.costYear),Math.round(x.costYear));
      write(root,'kwhMonth',num(x.kwhMonth,1)+' kWh',x.kwhMonth);
      const share=x.costMonth/Number(root.dataset.bill)*100;
      write(root,'billShare',num(share,1)+'%',share);
      updateRing(root,share);
    } else if(type==='btu'){
      const args={areaM2:number(root,'area',15),heightM:number(root,'height',2.5),occupants:number(root,'occupants',2),windowsM2:number(root,'windows',2),orientation:root.querySelector('[name="orientation"]').value,insulation:root.querySelector('[name="insulation"]').value,climate:{coolingBaseBtuhM2:number(root,'baseCooling'),heatingBaseBtuhM2:number(root,'baseHeating')},priceKwh:number(root,'price')};
      const cold=btuCalculation(args),heat=btuCalculation({...args,mode:'calefaccion'});
      write(root,'btu',nf.format(Math.round(cold.raw))+' BTU/h',Math.round(cold.raw));
      write(root,'recommended',nf.format(cold.recommended)+' BTU',cold.recommended);
      write(root,'costMonth',clp(cold.monthlyCost30h),Math.round(cold.monthlyCost30h));
      write(root,'heatBtu',nf.format(Math.round(heat.raw))+' BTU/h',Math.round(heat.raw));
      write(root,'heatRecommended',nf.format(heat.recommended)+' BTU',heat.recommended);
      write(root,'heatCost',clp(heat.monthlyCost30h),Math.round(heat.monthlyCost30h));
    } else {
      const self=number(root,'selfConsumption',72)/100;
      const x=solarCalculation({monthlyKwh:number(root,'monthlyKwh',250),coverage:number(root,'coverage',80)/100,ghiDay:number(root,'ghi',4.8),panelW:number(root,'panelW',550),selfConsumption:self,priceKwh:number(root,'price',200),injectionKwh:number(root,'injection',100),costPerWp:number(root,'costKwp')/1000,roofAvailable:number(root,'roofAvailable',500)});
      write(root,'kwp',num(x.installedKwp,2)+' kWp',x.installedKwp);
      write(root,'panels',nf.format(x.panels)+' paneles',x.panels);
      write(root,'roof',num(x.roofM2,1)+' m²',x.roofM2);
      write(root,'generation',nf.format(Math.round(x.generationYear))+' kWh/año',Math.round(x.generationYear));
      write(root,'annualSavings',clp(x.savingsYear),Math.round(x.savingsYear));
      write(root,'savings',clp(x.savingsMonth),Math.round(x.savingsMonth));
      write(root,'payback',Number.isFinite(x.paybackYears)?num(x.paybackYears,1)+' años':'Sin retorno',Number.isFinite(x.paybackYears)?x.paybackYears:0);
      write(root,'cost',clp(x.totalCost),Math.round(x.totalCost));
      write(root,'selfShare',num(self*100,1)+'%',self*100);
      updateRing(root,self*100);
    }
  }
  root.addEventListener('input',update);root.addEventListener('change',update);
  root.querySelector('form').addEventListener('submit',e=>{e.preventDefault();update();});
  update();
});
let indexPromise;
function getIndex() {
  indexPromise ||= fetch('/api/comunas.json').then(r=>{if(!r.ok)throw Error('No se pudo cargar el índice');return r.json();}).catch(e=>{indexPromise=null;throw e;});
  return indexPromise;
}
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const localPath=(mode,slug,a)=>mode==='consumo'?`/consumo-electrico/${a || 'refrigerador'}/${slug}/`:mode==='btu'?`/btu/${slug}/`:`/paneles-solares/${slug}/`;
const home=document.querySelector('[data-home]');
const searchRoot=document.querySelector('[data-search]');
let selected=null;
function action() {
  if(!searchRoot)return;
  const mode=searchRoot.dataset.mode,a=searchRoot.dataset.appliance;
  const link=searchRoot.querySelector('.search-action');
  const slug=selected?.slug || searchRoot.dataset.selected;
  if(slug){
    link.href=localPath(mode,slug,a);
    const name=selected?.name || searchRoot.querySelector('input').value;
    link.textContent=mode==='consumo'?`Ver consumo en ${name}`:mode==='btu'?`Ver BTU en ${name}`:`Ver paneles en ${name}`;
  } else {link.href='/comunas/';link.textContent='Explorar comunas';}
  if(home)home.querySelector('.appliance-picker').hidden=mode!=='consumo';
}
function setMeridian(c,summary) {
  const root=document.querySelector('.meridian');
  if(!root)return;
  const slider=root.querySelector('[role="slider"]'),regions=JSON.parse(slider.dataset.regions);
  const i=Math.max(0,regions.findIndex(r=>r.slug===c.regionSlug));
  slider.setAttribute('aria-valuenow',i);
  slider.setAttribute('aria-valuetext',`${c.region}, ${num(Math.abs(c.lat),1)}°S, tarifa media ${clp(regions[i].price,2)}/kWh`);
  root.querySelector('.latitude-cursor').style.setProperty('--latitude',`${(Math.abs(c.lat)-18)/37*100}%`);
  const lat=root.querySelector('.latitude');
  lat.textContent=num(Math.abs(c.lat),1)+'°S';
  lat.classList.remove('sweep');if(!reduced.matches){void lat.offsetWidth;lat.classList.add('sweep');}
  root.querySelector('.meridian-summary').textContent=summary || `Región de ${c.region}, ${num(Math.abs(c.lat),1)}°S, tarifa media ${clp(regions[i].price,2)}/kWh`;
}
function choose(c) {
  selected=c;searchRoot.dataset.selected=c.slug;
  searchRoot.querySelector('input').value=c.name;
  action();
  if(home){
    home.querySelector('[data-facts-name]').textContent=`${c.name} · ${c.region}`;
    home.querySelector('[data-fact="price"]').textContent=clp(c.price,2);
    home.querySelector('[data-fact="ghi"]').textContent=num(c.ghi,2);
    home.querySelector('[data-fact="temp"]').textContent=`${num(c.summer,1)}° / ${num(c.winter,1)}°`;
    home.querySelector('[data-fact="season"]').textContent='Verano / invierno · °C medio';
    home.querySelectorAll('[data-fact-link]').forEach(a=>a.href=localPath(a.dataset.factLink,c.slug,searchRoot.dataset.appliance));
    setMeridian(c);
  }
}
if(searchRoot) {
  const input=searchRoot.querySelector('input'),list=searchRoot.querySelector('[role="listbox"]'),status=searchRoot.querySelector('[role="status"]');
  let communes=[],matches=[],visible=[],active=-1,request=0;
  function close(){list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;}
  function render(){
    if(document.activeElement!==input)return;
    const query=norm(input.value);
    matches=communes.filter(c=>norm(c.name+' '+c.region).includes(query));
    visible=matches.slice(0,30);active=-1;
    list.replaceChildren(...visible.map((c,i)=>{
      const option=document.createElement('li');
      option.id=`comuna-option-${i}`;option.setAttribute('role','option');option.setAttribute('aria-selected','false');
      const name=document.createElement('span');name.textContent=c.name;
      const region=document.createElement('small');region.textContent=c.region;
      option.append(name,region);
      option.addEventListener('mousedown',e=>e.preventDefault());
      option.addEventListener('click',()=>{choose(c);close();status.textContent=`${c.name} seleccionada. Revisa los datos y continúa con el botón.`;});
      return option;
    }));
    status.textContent=matches.length===1?'1 comuna disponible':`${matches.length} comunas disponibles${matches.length>30?', escribe para acotar':''}`;
    list.hidden=!visible.length;input.setAttribute('aria-expanded',String(Boolean(visible.length)));
  }
  input.addEventListener('focus',async()=>{
    const id=++request;status.textContent='Cargando comunas…';
    try{communes=await getIndex();if(id===request)render();}
    catch{status.textContent='No pudimos cargar las comunas. Usa el índice de comunas.';}
  });
  input.addEventListener('input',()=>{selected=null;delete searchRoot.dataset.selected;action();render();});
  input.addEventListener('keydown',e=>{
    if(e.key==='Escape'){close();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();if(list.hidden)render();
      if(!visible.length)return;
      active=Math.max(0,Math.min(visible.length-1,active+(e.key==='ArrowDown'?1:-1)));
      [...list.children].forEach((o,i)=>o.setAttribute('aria-selected',String(i===active)));
      input.setAttribute('aria-activedescendant',list.children[active].id);list.children[active].scrollIntoView({block:'nearest'});
    }
    if(e.key==='Enter'){
      e.preventDefault();const c=visible[active] || (matches.length===1?matches[0]:null);
      if(c){choose(c);close();status.textContent=`${c.name} seleccionada. Revisa los datos y continúa con el botón.`;}
    }
  });
  input.addEventListener('blur',close);action();
}
document.querySelectorAll('[data-mode-button]').forEach(b=>b.addEventListener('click',()=>{
  searchRoot.dataset.mode=b.dataset.modeButton;
  document.querySelectorAll('[data-mode-button]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));action();
}));
document.querySelectorAll('[data-appliance-button]').forEach(b=>b.addEventListener('click',()=>{
  searchRoot.dataset.appliance=b.dataset.applianceButton;
  document.querySelectorAll('[data-appliance-button]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));action();
  if(home && selected)home.querySelector('[data-fact-link="consumo"]').href=localPath('consumo',selected.slug,b.dataset.applianceButton);
}));
document.querySelectorAll('.meridian-scale').forEach(slider=>{
  const regions=JSON.parse(slider.dataset.regions);
  const mobile=matchMedia('(max-width:760px)');
  const orient=()=>slider.setAttribute('aria-orientation',mobile.matches?'horizontal':'vertical');
  orient();mobile.addEventListener('change',orient);
  async function move(i) {
    i=Math.max(0,Math.min(15,i));
    slider.setAttribute('aria-valuenow',i);
    const r=regions[i];setMeridian({region:r.name,regionSlug:r.slug,lat:r.lat});
    if(home){const all=await getIndex();const c=all.find(c=>c.slug===r.commune);if(c)choose(c);}
  }
  slider.addEventListener('keydown',e=>{
    let i=Number(slider.getAttribute('aria-valuenow'));
    const keys={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1,PageDown:3,PageUp:-3};
    if(e.key in keys)i+=keys[e.key];else if(e.key==='Home')i=0;else if(e.key==='End')i=15;else return;
    e.preventDefault();move(i).catch(()=>{});
  });
  function pointer(e){
    const rect=slider.getBoundingClientRect();
    const f=mobile.matches?(e.clientX-rect.left)/rect.width:(e.clientY-rect.top)/rect.height;
    const lat=18+Math.max(0,Math.min(1,f))*37;
    const index=regions.reduce((best,r,i)=>Math.abs(Math.abs(r.lat)-lat)<Math.abs(Math.abs(regions[best].lat)-lat)?i:best,0);
    move(index).catch(()=>{});
  }
  slider.addEventListener('pointerdown',e=>{slider.setPointerCapture(e.pointerId);pointer(e);});
  slider.addEventListener('pointermove',e=>{if(slider.hasPointerCapture(e.pointerId))pointer(e);});
});
const filters=document.querySelector('.tariff-filters');
if(filters)filters.addEventListener('change',()=>{
  const region=filters.querySelector('[name="region-filter"]').value,dist=filters.querySelector('[name="distributor-filter"]').value;
  let count=0;
  document.querySelectorAll('.tariff-index tbody tr').forEach(tr=>{
    tr.hidden=Boolean((region && tr.dataset.region!==region)||(dist && tr.dataset.distributor!==dist));
    if(!tr.hidden)count++;
  });
  document.querySelector('[data-filter-status]').textContent=count===1?'1 tarifa disponible':`${count} tarifas disponibles`;
});
const rail=document.querySelector('.region-rail');
if(rail && 'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    const entry=entries.find(e=>e.isIntersecting);if(!entry)return;
    rail.querySelectorAll('a').forEach(a=>a.getAttribute('href')==='#'+entry.target.id?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  },{rootMargin:'-10% 0px -65% 0px'});
  document.querySelectorAll('.atlas-region').forEach(s=>observer.observe(s));
}
