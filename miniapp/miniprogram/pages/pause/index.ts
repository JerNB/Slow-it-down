type Status = 'idle' | 'running' | 'paused' | 'finished';
interface Clock { duration: number; remaining: number; endAt: number | null; status: Status }
const KEY = 'manmanlai.mini.pause.v1';
const create = (seconds = 180): Clock => ({ duration: seconds, remaining: seconds * 1000, endAt: null, status: 'idle' });
const remaining = (clock: Clock) => Math.max(0, clock.status === 'running' && clock.endAt !== null ? clock.endAt - Date.now() : clock.remaining);
const display = (milliseconds: number) => { const s = Math.ceil(Math.max(0, milliseconds) / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
function readClock(): Clock {
  const raw: unknown = wx.getStorageSync(KEY);
  if (raw === '' || raw === undefined) return create();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return create();
  const c = raw as Clock;
  if (![180, 300, 600].includes(c.duration) || !['idle', 'running', 'paused', 'finished'].includes(c.status) || !Number.isFinite(c.remaining) || c.remaining < 0 || c.remaining > c.duration * 1000 || (c.status === 'running' && !Number.isFinite(c.endAt))) return create();
  return c;
}
let clock = create();
let timer: ReturnType<typeof setInterval> | null = null;
Page({
  data: { duration: 180, status: 'idle' as Status, time: '03:00', stateLabel: '选一段属于自己的时间', error: '' },
  onShow() {
    try { clock = readClock(); this.tick(); this.setData({ error: '' }); }
    catch (_) { this.setData({ error: '计时暂时无法读取，请稍后再试。' }); }
    if (timer) clearInterval(timer);
    timer = setInterval(() => this.tick(), 1000);
  },
  onHide() { this.leave(); },
  onUnload() { this.leave(); },
  leave() { if (timer) clearInterval(timer); timer = null; if (clock.status === 'running') { clock = { ...clock, remaining: remaining(clock), endAt: null, status: 'paused' }; try { wx.setStorageSync(KEY, clock); } catch (_) {} } },
  tick() {
    if (clock.status === 'running' && remaining(clock) <= 0) {
      clock = { ...clock, remaining: 0, endAt: null, status: 'finished' };
      try { wx.setStorageSync(KEY, clock); } catch (_) {}
    }
    this.setData({ duration: clock.duration, status: clock.status, time: display(remaining(clock)), stateLabel: clock.status === 'finished' ? '这段时间，留给了自己' : clock.status === 'running' ? '正在静坐' : clock.status === 'paused' ? '已暂停' : '选一段属于自己的时间' });
  },
  choose(event: WechatMiniprogram.TouchEvent) {
    if (clock.status === 'running') return;
    clock = create(Number(event.currentTarget.dataset.seconds));
    try { wx.setStorageSync(KEY, clock); this.setData({ error: '' }); this.tick(); }
    catch (_) { this.setData({ error: '暂时无法保存计时设置。' }); }
  },
  toggle() {
    const previous = clock;
    if (clock.status === 'running') clock = { ...clock, remaining: remaining(clock), endAt: null, status: 'paused' };
    else { const ms = clock.status === 'finished' ? clock.duration * 1000 : clock.remaining; clock = { ...clock, remaining: ms, endAt: Date.now() + ms, status: 'running' }; }
    try { wx.setStorageSync(KEY, clock); this.setData({ error: '' }); this.tick(); }
    catch (_) { clock = previous; this.setData({ error: '暂时无法保存计时状态。' }); }
  },
  reset() { const previous = clock; clock = create(clock.duration); try { wx.setStorageSync(KEY, clock); this.setData({ error: '' }); this.tick(); } catch (_) { clock = previous; this.setData({ error: '暂时无法重置计时。' }); } }
});
