export const PRIORITIES=['inbox','now','next','later'];
export function normalize(raw){
 if(!raw||!Array.isArray(raw.wishes)||!Array.isArray(raw.entries))throw Error('Invalid records');
 if(raw.wishes.some(x=>!x||typeof x.id!=='string'||typeof x.title!=='string'))throw Error('Invalid wishes');
 if(raw.entries.some(x=>!x||typeof x.id!=='string'||!['mood','activity'].includes(x.type)||!Number.isFinite(new Date(x.at).getTime())))throw Error('Invalid entries');
 const todos=raw.todos??[];
 if(!Array.isArray(todos)||todos.some(x=>!x||typeof x.id!=='string'||typeof x.title!=='string'||!PRIORITIES.includes(x.priority)||typeof x.done!=='boolean'))throw Error('Invalid todos');
 let hasNow=false;
 return {...raw,todos:todos.map(t=>{if(!t.done&&t.priority==='now'){if(hasNow)return {...t,priority:'next'};hasNow=true;}return t;})};
}
export function prioritize(todos,id,priority){
 if(!PRIORITIES.includes(priority)||!todos.some(t=>t.id===id&&!t.done))return todos;
 return todos.map(t=>t.id===id?{...t,priority}:priority==='now'&&t.priority==='now'&&!t.done?{...t,priority:'next'}:t);
}
export function reorder(todos,id,direction){
 const index=todos.findIndex(t=>t.id===id);if(index<0)return todos;
 const group=todos.filter(t=>!t.done&&t.priority===todos[index].priority);
 const position=group.findIndex(t=>t.id===id),other=group[position+direction];if(!other)return todos;
 const result=[...todos],otherIndex=todos.findIndex(t=>t.id===other.id);
 [result[index],result[otherIndex]]=[result[otherIndex],result[index]];return result;
}
export function pickIdea(ideas,previous,random=Math.random){const candidates=ideas.filter(x=>x.id!==previous);return candidates[Math.floor(random()*candidates.length)]||ideas[0];}
export function dailyIndex(date,length){return Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)%length;}
