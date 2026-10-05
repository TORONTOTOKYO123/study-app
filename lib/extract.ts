import type {Slide} from './study';
export async function extractFile(file:File, status:(s:string)=>void):Promise<Slide[]> {
 if(file.size>20*1024*1024)throw new Error('Please use a file smaller than 20 MB. Split a larger lecture into smaller files.');
 const ext=file.name.split('.').pop()?.toLowerCase();
 if(ext==='txt'){const text=await file.text();return text.split(/\f|\n\s*---+\s*\n/).map((text,i)=>({number:i+1,text}));}
 if(ext==='pdf'){
  const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdf.worker.min.mjs',document.baseURI).href;
  const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
  let pdf;
  try{
   pdf=await task.promise;if(pdf.numPages>250)throw new Error('Please split this PDF into files of 250 pages or fewer.');
   const slides:Slide[]=[];
   for(let n=1;n<=pdf.numPages;n++){
    status(`Reading page ${n} of ${pdf.numPages}…`);
    const page=await pdf.getPage(n);
    // getTextContent uses async stream iteration, which some Safari versions lack.
    // Read the same text chunks through the broadly supported reader API instead.
    const reader=page.streamTextContent().getReader();
    const content: Awaited<ReturnType<typeof page.getTextContent>>={items:[],styles:{},lang:null};
    try {
     while(true){
      const chunk=await reader.read();
      if(chunk.done)break;
      content.items.push(...chunk.value.items);
     }
    } finally {reader.releaseLock();}
    let text='',lastY:number|null=null;
    for(const item of content.items){if(!('str' in item))continue;const y=item.transform[5];if(lastY!==null && Math.abs(lastY-y)>4)text+='\n';text+=item.str+' ';if(item.hasEOL)text+='\n';lastY=y;}
    slides.push({number:n,text:text.replace(/\n\s*\n/g,'\n').trim()});page.cleanup();
   }return slides;
  }finally{await task.destroy();}
 }
 if(ext==='pptx'){
  const {unzipSync,strFromU8}=await import('fflate');let expanded=0;
  const files=unzipSync(new Uint8Array(await file.arrayBuffer()),{filter:f=>{const needed=/^ppt\/slides\/slide\d+\.xml$|^ppt\/presentation\.xml$|^ppt\/_rels\/presentation\.xml\.rels$/.test(f.name);if(needed){expanded+=f.originalSize;if(expanded>40*1024*1024)throw new Error('This presentation contains too much text to process. Please split it.');}return needed;}});
  const parser=new DOMParser();const xml=(path:string)=>parser.parseFromString(strFromU8(files[path]),'application/xml');
  let paths=Object.keys(files).filter(p=>/^ppt\/slides\/slide\d+\.xml$/.test(p)).sort((a,b)=>Number(a.match(/slide(\d+)/)?.[1])-Number(b.match(/slide(\d+)/)?.[1]));
  if(files['ppt/presentation.xml']&&files['ppt/_rels/presentation.xml.rels']){
   const rels=new Map(Array.from(xml('ppt/_rels/presentation.xml.rels').getElementsByTagName('Relationship')).map(e=>[e.getAttribute('Id'),e.getAttribute('Target')||'']));
   const ordered=Array.from(xml('ppt/presentation.xml').getElementsByTagNameNS('*','sldId')).map(e=>rels.get(e.getAttribute('r:id'))).filter(Boolean).map(p=>p!.startsWith('/')?p!.slice(1):'ppt/'+p!.replace(/^\.\//,''));
   if(ordered.length&&ordered.every(p=>files[p]))paths=ordered;
  }
  if(paths.length>250)throw new Error('Please split this presentation into files of 250 slides or fewer.');
  return paths.map((path,i)=>({number:i+1,text:Array.from(xml(path).getElementsByTagNameNS('*','p')).map(p=>Array.from(p.getElementsByTagNameNS('*','t')).map(t=>t.textContent||'').join('')).join('\n')}));
 }
 throw new Error('Choose a PDF, PPTX, or TXT file. Export older .ppt or Keynote slides as PDF first.');
}
