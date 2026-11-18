'use strict';
const initial=[
['RESERVORIO #06','INST. PVC DE 315 MM RETRO LAVADO',[3,3,4,3,4,0]],['RESERVORIO #06','INST. DE CUELLO DE GANSO 12"',[3,3,0,0,0,0]],['RESERVORIO #06','INST. DE FERTIRRIEGO',[0,0,3,3,3,3]],['RESERVORIO #06','CONEXIÓN DE PVC 315 CAMPO',[0,0,0,0,0,4]],['RESERVORIO #06','SOLDAR NIPLES CALD. ',[0,1,0,0,0,0]],['RESERVORIO #06','SOLDAR CODOS DE RETRO LAVADO',[0,0,1,1,1,0]],['RESERVORIO #06','SOLDAR PORTA VENTANA',[0,0,0,0,0,1]],['RESERVORIO #06','SOLDAR TRATOBOMBAS',[1,0,0,0,0,0]],['RESERVORIO #06','SOLDAR SOPORTES CALDERERÍA',[0,0,0,0,0,0]],['LOTE B02','MOVER VÁLVULAS PRINCIPALES 4"',[2,0,0,0,0,0]],['LOTE B.01','MOVER VÁLVULAS PRINCIPAL 4"',[0,0,3,3,0,0]],['LOTE H.15','CORRECCIÓN DE VIGOTES',[0,2,0,2,4,3]],['LOTE H11','INST. DE BOMBA LODERA 3"',[1,0,0,0,0,0]],['OSMOSIS R1','REPARACIÓN DE FUGA DE PVC 3"',[0,1,0,0,0,0]],['OSMOSIS R1','TRATAMIENTO DE AGUA',[1,1,1,1,1,1]],['OSMOSIS R1','REVISAR VÁLVULA COMPUERTA POZO 4',[0,0,1,0,0,0]],['OTROS','VACACIONES',[0,0,0,0,0,0]],['OTROS','FALTOS',[0,1,0,0,0,0]],['OTROS','HORAS COMPENSADAS',[1,0,0,0,0,1]],['OTROS','LICENCIA',[1,1,0,0,0,0]],['RIO','INSTALACIÓN DE TAPONES',[0,0,0,0,0,0]]];
const KEY='santarosa_personal_v1';const $=id=>document.getElementById(id);const clone=x=>JSON.parse(JSON.stringify(x));
function safeLoad(){try{let x=JSON.parse(localStorage.getItem(KEY));return x&&typeof x==='object'&&x.weeks&&x.locations&&x.labors?x:null}catch{return null}}
let db=safeLoad()||{weeks:{},locations:[...new Set(initial.map(x=>x[0]))],labors:[...new Set(initial.map(x=>x[1]))]};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parse=s=>new Date(`${s}T12:00:00`);const monday=d=>{let x=new Date(d);x.setDate(x.getDate()-(x.getDay()+6)%7);return iso(x)};
const today=new Date();let current=monday(today);let rows=[];
function saveDb(){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch{alert('No se pudo guardar. Revisa el almacenamiento del navegador.');return false}}
function rowObj(x){return {location:x[0],labor:x[1],days:[...x[2]]}}
// La plantilla conserva ubicaciones y labores, nunca las cantidades.
const emptyDays=()=>[0,0,0,0,0,0];
function templateRows(){
 const saved=Array.isArray(db.template)&&db.template.length?db.template:null;
 const last=Object.keys(db.weeks).sort().reverse().find(k=>Array.isArray(db.weeks[k])&&db.weeks[k].length);
 const source=saved||(last?db.weeks[last]:initial.map(rowObj));
 return source.map(r=>({location:r.location,labor:r.labor,days:emptyDays()}));
}
function loadWeek(date){
 current=monday(parse(date));$('weekStart').value=current;
 rows=db.weeks[current]?clone(db.weeks[current]):templateRows();
 render();
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){let start=parse(current),end=parse(current);end.setDate(end.getDate()+5);$('range').textContent=`${start.toLocaleDateString('es-PE')} al ${end.toLocaleDateString('es-PE')}`;
$('rows').innerHTML=rows.map((r,i)=>{
 const first=i===0||rows[i-1].location!==r.location;
 let span=1;if(first){while(i+span<rows.length&&rows[i+span].location===r.location)span++}
 return `<tr class="${first?'group-start':'group-continuation'}">${first?`<td class="loc" data-label="Ubicación" rowspan="${span}">${escapeHTML(r.location)}</td>`:''}<td class="labor" data-label="Labor">${escapeHTML(r.labor)}</td>${r.days.map((v,j)=>`<td class="num" data-label="${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][j]}"><input type="number" min="0" step="1" value="${v||''}" data-row="${i}" data-day="${j}" aria-label="${escapeHTML(r.labor)} día ${j+1}"></td>`).join('')}<td class="num row-total" data-label="Total jornadas"><b>${r.days.reduce((a,b)=>a+b,0)}</b></td><td class="no-print row-actions"><button class="delete" data-delete="${i}" title="Eliminar fila">✕</button></td></tr>`
 }).join('');
let totals=Array.from({length:6},(_,i)=>rows.reduce((s,r)=>s+r.days[i],0)),sum=totals.reduce((a,b)=>a+b,0);$('totals').innerHTML=`<tr><td colspan="2">TOTAL POR DÍA</td>${totals.map(x=>`<td>${x}</td>`).join('')}<td>${sum}</td><td class="no-print"></td></tr>`;$('weeklyTotal').textContent=sum;$('dailyAvg').textContent=(sum/6).toFixed(1);$('activeTasks').textContent=rows.filter(r=>r.days.some(Boolean)).length;}
$('rows').addEventListener('input',e=>{let t=e.target;if(!t.matches('input[data-row]'))return;let n=Math.max(0,Math.floor(Number(t.value)||0));rows[+t.dataset.row].days[+t.dataset.day]=n;renderTotalsOnly()});
function renderTotalsOnly(){let totals=Array.from({length:6},(_,i)=>rows.reduce((s,r)=>s+r.days[i],0)),sum=totals.reduce((a,b)=>a+b,0);$('totals').innerHTML=`<tr><td colspan="2">TOTAL POR DÍA</td>${totals.map(x=>`<td>${x}</td>`).join('')}<td>${sum}</td><td class="no-print"></td></tr>`;document.querySelectorAll('#rows tr').forEach((tr,i)=>tr.querySelector('td.row-total b').textContent=rows[i].days.reduce((a,b)=>a+b,0));$('weeklyTotal').textContent=sum;$('dailyAvg').textContent=(sum/6).toFixed(1);$('activeTasks').textContent=rows.filter(r=>r.days.some(Boolean)).length;}
$('rows').addEventListener('click',e=>{let b=e.target.closest('[data-delete]');if(b&&confirm('¿Eliminar esta fila?')){rows.splice(+b.dataset.delete,1);render()}});
$('weekStart').addEventListener('change',e=>loadWeek(e.target.value));
$('save').onclick=()=>{
 db.weeks[current]=clone(rows);
 // Mantener la estructura actual para las próximas semanas.
 db.template=rows.map(r=>({location:r.location,labor:r.labor}));
 if(saveDb())alert('Programación guardada: '+current);
};
$('newWeek').onclick=()=>{
 let d=parse(current);d.setDate(d.getDate()+7);
 const next=monday(d);
 if(db.weeks[next]&&!confirm('La siguiente semana ya tiene datos guardados. ¿Abrirla sin borrar nada?'))return;
 // Copiar solo la estructura visible; los números siempre empiezan en cero.
 const blank=rows.map(r=>({location:r.location,labor:r.labor,days:emptyDays()}));
 current=next;$('weekStart').value=current;
 rows=db.weeks[current]?clone(db.weeks[current]):blank;
 render();
};
function options(){for(let [id,arr] of [['locationSelect',db.locations],['laborSelect',db.labors]])$(id).innerHTML=arr.map(s=>`<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join('');$('locationsList').innerHTML=db.locations.map(x=>`<span>${escapeHTML(x)}</span>`).join('');$('laborsList').innerHTML=db.labors.map(x=>`<span>${escapeHTML(x)}</span>`).join('')}
$('addRow').onclick=()=>{let loc=$('locationSelect').value,lab=$('laborSelect').value;if(!loc||!lab)return;rows.push({location:loc,labor:lab,days:[0,0,0,0,0,0]});render()};
$('addLocation').onclick=()=>addCatalog('newLocation','locations');$('addLabor').onclick=()=>addCatalog('newLabor','labors');function addCatalog(id,key){let v=$(id).value.trim();if(!v)return;if(db[key].some(x=>x.toLowerCase()===v.toLowerCase()))return alert('Ya existe.');db[key].push(v);$(id).value='';saveDb();options()}
for(let nav of document.querySelectorAll('.nav'))nav.onclick=()=>show(nav.dataset.view);function show(id){document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===id));document.querySelectorAll('.view').forEach(n=>n.classList.toggle('active',n.id===id));if(id==='mensual')renderMonth();if(id==='historial')renderHistory();if(id==='catalogo')options()}
function monthData(month){let entries=[],total=0,dates=new Set();for(let [start,items] of Object.entries(db.weeks)){let sum=0;for(let i=0;i<6;i++){let d=parse(start);d.setDate(d.getDate()+i);if(iso(d).slice(0,7)!==month)continue;let day=items.reduce((s,r)=>s+(Number(r.days[i])||0),0);sum+=day;dates.add(iso(d))}if(sum){entries.push({start,sum});total+=sum}}return {entries:entries.sort((a,b)=>a.start.localeCompare(b.start)),total,days:dates.size}}
function renderMonth(){let m=$('month').value,data=monthData(m);$('monthTotal').textContent=data.total;$('monthWeeks').textContent=data.entries.length;$('monthAvg').textContent=data.days?(data.total/data.days).toFixed(1):'0';$('monthRows').innerHTML=data.entries.map(e=>`<tr><td>Semana del ${escapeHTML(e.start)}</td><td>${e.sum}</td></tr>`).join('')||'<tr><td colspan="2">Sin programaciones guardadas</td></tr>';let max=Math.max(1,...data.entries.map(e=>e.sum));$('bars').innerHTML=data.entries.map(e=>`<div class="baritem"><b>${e.sum}</b><div class="bar" style="height:${Math.max(3,150*e.sum/max)}px"></div><span>${escapeHTML(e.start.slice(5))}</span></div>`).join('')||'<p>Guarda semanas para ver el gráfico.</p>'}
$('month').value=iso(today).slice(0,7);$('month').onchange=renderMonth;
$('csv').onclick=()=>{let m=$('month').value,d=monthData(m);download(`jornadas_${m}.csv`,'\ufeffSemana;Jornadas\r\n'+d.entries.map(e=>`${e.start};${e.sum}`).join('\r\n')+`\r\nTOTAL;${d.total}`,'text/csv;charset=utf-8')};
function renderHistory(){$('historyRows').innerHTML=Object.entries(db.weeks).sort((a,b)=>b[0].localeCompare(a[0])).map(([d,r])=>`<tr><td>${escapeHTML(d)}</td><td>${r.reduce((s,x)=>s+x.days.reduce((a,b)=>a+b,0),0)}</td><td><button data-open="${escapeHTML(d)}">Abrir</button> <button class="delete" data-remove="${escapeHTML(d)}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="3">Todavía no hay programaciones guardadas.</td></tr>'}
$('historyRows').onclick=e=>{let open=e.target.closest('[data-open]'),remove=e.target.closest('[data-remove]');if(open){loadWeek(open.dataset.open);show('semanal')}if(remove&&confirm('¿Eliminar la semana guardada '+remove.dataset.remove+'?')){delete db.weeks[remove.dataset.remove];saveDb();renderHistory()}};
function download(name,content,type){let blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('backup').onclick=()=>download('respaldo_programacion_personal.json',JSON.stringify(db,null,2),'application/json');$('restore').onchange=async e=>{let file=e.target.files[0];if(!file)return;try{let data=JSON.parse(await file.text());if(!data||!data.weeks||!Array.isArray(data.locations)||!Array.isArray(data.labors))throw Error();if(!confirm('¿Reemplazar todos los datos locales por este respaldo?'))return;db=data;saveDb();
// Exportación real XLSX sin internet: genera un libro Excel con colores, bordes,
// ubicaciones agrupadas, seis días y totales calculados.


options();loadWeek(current);renderHistory();alert('Respaldo importado')}catch{alert('Archivo de respaldo inválido')}finally{e.target.value=''}};
$('print').onclick=()=>window.print();$('printMonthly').onclick=()=>window.print();
// Exportación PNG nativa: no depende de SVG, librerías externas ni conexión.
$('png').onclick=()=>{
 try {
  const scale=2, widths=[175,440,94,94,94,94,94,94,100], W=widths.reduce((a,b)=>a+b,0);
  const x=[0];widths.forEach(w=>x.push(x[x.length-1]+w));
  const rowH=50,headH=56,titleH=92,footH=58,pad=24;
  const H=pad*2+titleH+headH+rows.length*rowH+footH;
  const canvas=document.createElement('canvas');canvas.width=W*scale;canvas.height=H*scale;
  const c=canvas.getContext('2d');if(!c)throw Error('Canvas no disponible');c.scale(scale,scale);
  const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
  const border=(x,y,w,h)=>{c.strokeStyle='#493b56';c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1)};
  const txt=(t,x,y,maxW,font='bold 15px Arial',color='#1a1420',align='center')=>{c.font=font;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(String(t),x,y,maxW)};
  const wrap=(t,maxW,font)=>{c.font=font;let lines=[''];for(const word of String(t).split(/\s+/)){let n=lines[lines.length-1];if(c.measureText((n?n+' ':'')+word).width>maxW&&n)lines.push(word);else lines[lines.length-1]=(n?n+' ':'')+word}return lines.slice(0,3)};
  const cell=(i,y,h,color)=>{rect(x[i],y,widths[i],h,color);border(x[i],y,widths[i],h)};
  rect(0,0,W,H,'#ffffff');rect(0,0,W,titleH+pad,'#4b146e');
  txt('PROGRAMACIÓN SEMANAL DE PERSONAL',W/2,pad+27,W-30,'bold 28px Arial','#ffffff');
  txt($('range').textContent,W/2,pad+65,W-30,'17px Arial','#f1e4ff');
  let y=pad+titleH;
  ['UBICACIÓN','LABORES','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','TOTAL'].forEach((h,i)=>{cell(i,y,headH,'#64218a');txt(h,x[i]+widths[i]/2,y+headH/2,widths[i]-8,'bold 13px Arial','#ffffff')});
  y+=headH;
  rows.forEach((r,k)=>{
   const bg=k%2===0?'#ffffff':'#f6f2f9';
   cell(1,y,rowH,bg);

   const labor=wrap(r.labor,widths[1]-18,'14px Arial');labor.forEach((line,j)=>txt(line,x[1]+10,y+rowH/2+(j-(labor.length-1)/2)*17,widths[1]-18,'14px Arial','#1a1420','left'));
   r.days.forEach((v,i)=>{cell(i+2,y,rowH,bg);txt(v||'–',x[i+2]+widths[i+2]/2,y+rowH/2,widths[i+2]-10,'bold 17px Arial')});
   cell(8,y,rowH,'#ead8f7');txt(r.days.reduce((a,b)=>a+Number(b||0),0),x[8]+widths[8]/2,y+rowH/2,widths[8]-10,'bold 18px Arial');y+=rowH;
  });
  // Unir visualmente las ubicaciones consecutivas en el PNG
  for(let i=0;i<rows.length;){
    let end=i+1;while(end<rows.length&&rows[end].location===rows[i].location)end++;
    const top=pad+titleH+headH+i*rowH, height=(end-i)*rowH;
    cell(0,top,height,'#91e594');
    const loc=wrap(rows[i].location,widths[0]-16,'bold 14px Arial');
    loc.forEach((line,j)=>txt(line,x[0]+widths[0]/2,top+height/2+(j-(loc.length-1)/2)*17,widths[0]-16,'bold 14px Arial'));
    i=end;
  }
  const totals=Array.from({length:6},(_,i)=>rows.reduce((sum,r)=>sum+Number(r.days[i]||0),0));
  rect(0,y,widths[0]+widths[1],footH,'#4b146e');border(0,y,widths[0]+widths[1],footH);
  txt('TOTAL POR DÍA', (widths[0]+widths[1])/2,y+footH/2,widths[0]+widths[1]-20,'bold 19px Arial','#ffffff');
  [...totals,totals.reduce((a,b)=>a+b,0)].forEach((v,i)=>{cell(i+2,y,footH,'#dfb6f5');txt(v,x[i+2]+widths[i+2]/2,y+footH/2,widths[i+2]-10,'bold 21px Arial')});
  canvas.toBlob(blob=>{if(!blob){alert('No se pudo generar la imagen PNG.');return}const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`programacion_personal_${current}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000)},'image/png');
 }catch(e){console.error('Error exportando PNG',e);alert('No se pudo crear la imagen: '+e.message)}
};

// Exportación real XLSX sin internet: genera un libro Excel con colores, bordes,
// ubicaciones agrupadas, seis días y totales calculados.
$('excel').onclick=async()=>{
 try{
  if(typeof JSZip==='undefined')throw Error('No se encontró la biblioteca de Excel');
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s};
  const xmlCell=(r,c,value,style=0,formula=null)=>{
   const ref=col(c)+r;
   if(formula)return `<c r="${ref}" s="${style}"><f>${formula}</f><v>${Number(value)||0}</v></c>`;
   if(typeof value==='number')return `<c r="${ref}" s="${style}"><v>${value}</v></c>`;
   return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${esc(value)}</t></is></c>`;
  };
  let lines=[],merges=['A1:I1','A2:I2'],r=1;
  lines.push(`<row r="${r}">${xmlCell(r,0,'PROGRAMACIÓN SEMANAL DE PERSONAL',1)}</row>`);r++;
  lines.push(`<row r="${r}">${xmlCell(r,0,$('range').textContent,2)}</row>`);r++;
  lines.push(`<row r="${r}">${['UBICACIÓN','LABORES','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','TOTAL'].map((v,i)=>xmlCell(r,i,v,3)).join('')}</row>`);r++;
  let i=0;
  for(const item of rows){
   const start=i===0||rows[i-1].location!==item.location;
   if(start){let count=1;while(i+count<rows.length&&rows[i+count].location===item.location)count++;if(count>1)merges.push(`A${r}:A${r+count-1}`)}
   const dayCells=item.days.map((v,j)=>xmlCell(r,j+2,Number(v)||0,5)).join('');
   const total=item.days.reduce((sum,v)=>sum+(Number(v)||0),0);
   lines.push(`<row r="${r}" ht="30" customHeight="1">${start?xmlCell(r,0,item.location,4):''}${xmlCell(r,1,item.labor,6)}${dayCells}${xmlCell(r,8,total,7,`SUM(C${r}:H${r})`)}</row>`);
   r++;i++;
  }
  const totals=Array.from({length:6},(_,j)=>rows.reduce((sum,item)=>sum+(Number(item.days[j])||0),0));
  merges.push(`A${r}:B${r}`);
  lines.push(`<row r="${r}">${xmlCell(r,0,'TOTAL POR DÍA',3)}${totals.map((v,j)=>xmlCell(r,j+2,v,8,`SUM(${col(j+2)}4:${col(j+2)}${r-1})`)).join('')}${xmlCell(r,8,totals.reduce((a,b)=>a+b,0),8,`SUM(C${r}:H${r})`)}</row>`);
  const sheet=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><sheetFormatPr defaultRowHeight="24"/><cols><col min="1" max="1" width="24" customWidth="1"/><col min="2" max="2" width="55" customWidth="1"/><col min="3" max="8" width="13" customWidth="1"/><col min="9" max="9" width="14" customWidth="1"/></cols><sheetData>${lines.join('')}</sheetData><mergeCells count="${merges.length}">${merges.map(m=>`<mergeCell ref="${m}"/>`).join('')}</mergeCells><pageMargins left="0.2" right="0.2" top="0.4" bottom="0.4" header="0.1" footer="0.1"/><pageSetup orientation="landscape" paperSize="9" fitToWidth="1"/></worksheet>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="15"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF4B146E"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF64218A"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF91E594"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDFB6F5"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FF9988AA"/></left><right style="thin"><color rgb="FF9988AA"/></right><top style="thin"><color rgb="FF9988AA"/></top><bottom style="thin"><color rgb="FF9988AA"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="9"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center"/></xf></cellXfs></styleSheet>`;
  const zip=new JSZip();
  zip.file('[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`);
  zip.file('_rels/.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file('xl/workbook.xml',`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Semana ${esc(current)}" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`);
  zip.file('xl/_rels/workbook.xml.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file('xl/styles.xml',styles);zip.file('xl/worksheets/sheet1.xml',sheet);
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const filename=`programacion_personal_${current}.xlsx`;
  // Descarga directa .xlsx en Chrome Android y navegadores de escritorio.
  // No se usa navigator.share, ni se descarga un ZIP como resultado.
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.setAttribute('download',filename);
  a.style.position='fixed';a.style.left='-9999px';
  document.body.appendChild(a);
  a.click();
  // Dar tiempo suficiente a Chrome móvil para iniciar la transferencia.
  setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},120000);
 }catch(e){console.error(e);alert('No se pudo generar Excel: '+e.message)}
};

options();loadWeek(current);
