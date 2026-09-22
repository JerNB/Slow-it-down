export function createClock(seconds=180){return {duration:seconds,remaining:seconds*1000,endAt:null,status:'idle'};}
export function remainingMs(clock,now=Date.now()){return Math.max(0,clock.status==='running'?clock.endAt-now:clock.remaining);}
export function startClock(clock,now=Date.now()){if(clock.status==='running')return clock;const remaining=clock.status==='finished'?clock.duration*1000:clock.remaining;return {...clock,remaining,endAt:now+remaining,status:'running'};}
export function pauseClock(clock,now=Date.now()){const remaining=remainingMs(clock,now);return {...clock,remaining,endAt:null,status:remaining<=0?'finished':'paused'};}
export function restoreClock(raw){if(!raw||![180,300,600].includes(raw.duration)||!['idle','running','paused','finished'].includes(raw.status)||!Number.isFinite(raw.remaining)||raw.remaining<0||raw.remaining>raw.duration*1000||(raw.status==='running'&&!Number.isFinite(raw.endAt)))return createClock();return raw;}
export function displayTime(ms){const s=Math.ceil(Math.max(0,ms)/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
