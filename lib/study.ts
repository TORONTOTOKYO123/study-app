export type Slide = { number: number; text: string };
export type Card = { id: number; question: string; answer: string; source: string; slide: number; kind: 'definition' | 'recall' };
const stop = new Set('about above after again also another because before being below between could during every first following from have into just lecture more most other over same should slide some such than that their them then there these they this those through under using very what when where which while will with would your used uses each only both does example'.split(' '));
export function generateCards(slides: Slide[]): Card[] {
 const seen = new Set<string>(); const groups: Card[][] = [];
 for (const slide of slides) {
  const cards: Card[] = [];
  const lines = slide.text.replace(/\r/g,'').split(/\n|(?<=[.!?])\s+(?=[A-Z])/).map(s=>s.replace(/^\s*[•●▪◦\-–]\s*/,'').replace(/\s+/g,' ').trim()).filter(s=>s.length>=22 && s.length<=600);
  for (const source of lines) {
   if (/https?:|copyright|all rights reserved|learning objectives|^chapter\s+\d|^references$/i.test(source)) continue;
   let question='', answer='', kind: Card['kind']='recall';
   const m=source.match(/^(.{2,80}?)\s*(?::\s+|\s+(?:is defined as|refers to|is|are|means)\s+)(.{12,})$/i);
   if(m && m[1].split(' ').length<=10 && !/^(this|it|there|these|we|they|what|why|how)\b/i.test(m[1])) {
    answer=m[1].trim(); question=`Which term fits this description?\n${m[2].trim()}`;kind='definition';
   } else {
    const words=source.match(/\b[A-Za-z][A-Za-z0-9-]{3,}\b/g)||[];
    const choices=words.filter(w=>!stop.has(w.toLowerCase()));
    if(!choices.length)continue;
    answer=[...choices].sort((a,b)=>b.length-a.length)[0];
    question='Complete the statement:\n'+source.replace(new RegExp('\\b'+answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','gi'),'________');
   }
   const key=source.toLowerCase();if(seen.has(key))continue;seen.add(key);
   cards.push({id:0, question, answer, source, slide:slide.number, kind});
  }
  groups.push(cards);
 }
 // Round-robin selection covers the whole lecture before adding deeper questions.
 const result:Card[]=[];for(let depth=0;depth<20 && result.length<60;depth++)for(const group of groups)if(group[depth] && result.length<60)result.push({...group[depth],id:result.length});
 return result;
}
export function shuffle<T>(items:T[]):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function makeQuiz(cards:Card[]){return shuffle(cards).slice(0,Math.min(10,cards.length)).map(card=>{const others=[...new Set(cards.filter(c=>c.answer.toLowerCase()!==card.answer.toLowerCase()).map(c=>c.answer))];return {card,options:others.length>=3?shuffle([card.answer,...shuffle(others).slice(0,3)]):[]};});}
export const demo:Slide[]=[{number:1,text:'Data structures\nAn array is a collection of elements stored in contiguous memory locations.\nA linked list is a sequence of nodes where each node stores data and a pointer to the next node.\nA stack is a data structure that follows the last-in, first-out principle.'},{number:2,text:'Trees and searching\nA binary search tree is a tree in which left descendants have smaller keys and right descendants have larger keys.\nAn AVL tree is a self-balancing binary search tree whose subtree heights differ by at most one at every node.\nBinary search repeatedly halves the search interval in a sorted array.'},{number:3,text:'Complexity\nTime complexity: a measure of how an algorithm’s running time grows with the size of its input.\nSpace complexity: a measure of how an algorithm’s memory requirements grow with the size of its input.\nA queue is a data structure that follows the first-in, first-out principle.'}];
