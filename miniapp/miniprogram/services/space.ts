import { createId } from './records';

export type Priority = 'inbox' | 'now' | 'next' | 'later';
export const PRIORITY_NAMES: Record<Priority, string> = {
  now: '先做这一件', inbox: '先放在这里', next: '接下来', later: '暂时放下'
};
export const SPACE_KEY = 'manmanlai.mini.space.v1';
export const ACTIVE_KEY = 'manmanlai.mini.active.v1';

export interface Task { id: string; title: string; step: string; priority: Priority; done: boolean }
export interface Wish { id: string; title: string; step: string; sourceId?: string; bookId?: string }
export interface Activity {
  id: string; title: string; step: string; feeling: string; note: string;
  createdAt: string; localDate: string; localTime: string;
}
export interface ActiveAction { id: string; title: string; step: string; taskId?: string }
export interface Space { version: 1; tasks: Task[]; wishes: Wish[]; activities: Activity[] }

const empty = (): Space => ({ version: 1, tasks: [], wishes: [], activities: [] });
const obj = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, max: number) => typeof value === 'string' && value.length <= max;
const priorities: Priority[] = ['inbox', 'now', 'next', 'later'];
const validTask = (t: unknown): t is Task => obj(t) && text(t.id, 100) && !!t.id && text(t.title, 160) && !!t.title && text(t.step, 500) && priorities.includes(t.priority as Priority) && typeof t.done === 'boolean';
const validWish = (w: unknown): w is Wish => obj(w) && text(w.id, 100) && !!w.id && text(w.title, 160) && !!w.title && text(w.step, 500) && (w.sourceId === undefined || text(w.sourceId, 100)) && (w.bookId === undefined || text(w.bookId, 100));
const validActivity = (a: unknown): a is Activity => obj(a) && text(a.id, 100) && !!a.id && text(a.title, 160) && !!a.title && text(a.step, 500) && text(a.feeling, 80) && !!a.feeling && text(a.note, 2000) && text(a.createdAt, 40) && Number.isFinite(Date.parse(a.createdAt as string)) && text(a.localDate, 10) && /^\d{4}-\d{2}-\d{2}$/.test(a.localDate as string) && text(a.localTime, 5);
export function readSpace(): Space {
  const raw: unknown = wx.getStorageSync(SPACE_KEY);
  if (raw === '' || raw === undefined) return empty();
  // Refuse to overwrite unknown or damaged saved data with a new empty record.
  if (!obj(raw) || raw.version !== 1 || !Array.isArray(raw.tasks) || !raw.tasks.every(validTask) ||
      !Array.isArray(raw.wishes) || !raw.wishes.every(validWish) ||
      !Array.isArray(raw.activities) || !raw.activities.every(validActivity)) {
    throw new Error('已有资料暂时无法读取。为保护原内容，已停止写入。');
  }
  return raw as unknown as Space;
}
function commit(next: Space): Space { wx.setStorageSync(SPACE_KEY, next); return next; }

export function addTask(title: string, priority: Priority = 'inbox'): Space {
  const clean = title.trim();
  if (!clean || clean.length > 160) throw new Error('写下一件不超过 160 字的事就好。');
  if (!priorities.includes(priority)) throw new Error('请选择一个放置位置。');
  const data = readSpace();
  const tasks = priority === 'now' ? data.tasks.map(t => t.priority === 'now' && !t.done ? { ...t, priority: 'next' as Priority } : t) : data.tasks;
  return commit({ ...data, tasks: [...tasks, { id: createId(), title: clean, step: '', priority, done: false }] });
}
export function editTask(id: string, title: string, step: string, priority: Priority): Space {
  const clean = title.trim(), smallStep = step.trim();
  if (!clean || clean.length > 160 || smallStep.length > 500 || !priorities.includes(priority)) throw new Error('请检查事项和第一小步。');
  const data = readSpace();
  if (!data.tasks.some(t => t.id === id)) throw new Error('找不到这件事。');
  const selected = data.tasks.find(t => t.id === id)!;
  const tasks = data.tasks.map(t => {
    if (t.id === id) return { ...t, title: clean, step: smallStep, priority: t.done ? t.priority : priority };
    return !selected.done && priority === 'now' && t.priority === 'now' && !t.done ? { ...t, priority: 'next' as Priority } : t;
  });
  return commit({ ...data, tasks });
}
export function focusTask(id: string): Space {
  const data = readSpace();
  if (!data.tasks.some(t => t.id === id && !t.done)) throw new Error('找不到待办事项。');
  return commit({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, priority: 'now' } : t.priority === 'now' && !t.done ? { ...t, priority: 'next' } : t) as Task[] });
}
export function toggleTask(id: string): Space {
  const data = readSpace();
  if (!data.tasks.some(t => t.id === id)) throw new Error('找不到这件事。');
  const current = data.tasks.find(t => t.id === id)!;
  const occupied = data.tasks.some(t => t.id !== id && !t.done && t.priority === 'now');
  return commit({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, done: !t.done, priority: current.done && current.priority === 'now' && occupied ? 'next' as Priority : t.priority } : t) });
}
export function moveTask(id: string, direction: -1 | 1): Space {
  const data = readSpace(), tasks = [...data.tasks], index = tasks.findIndex(t => t.id === id);
  if (index < 0 || tasks[index].done) return data;
  const group = tasks.filter(t => !t.done && t.priority === tasks[index].priority);
  const other = group[group.findIndex(t => t.id === id) + direction];
  if (!other) return data;
  const otherIndex = tasks.findIndex(t => t.id === other.id);
  [tasks[index], tasks[otherIndex]] = [tasks[otherIndex], tasks[index]];
  return commit({ ...data, tasks });
}
export function deleteTask(id: string): Space {
  const data = readSpace();
  return commit({ ...data, tasks: data.tasks.filter(t => t.id !== id) });
}
export function addWish(title: string, step = '', link: { sourceId?: string; bookId?: string } = {}): Space {
  const clean = title.trim(), smallStep = step.trim(), data = readSpace();
  if (!clean || clean.length > 160 || smallStep.length > 500) throw new Error('请检查期待和第一小步。');
  if ((link.sourceId && data.wishes.some(w => w.sourceId === link.sourceId)) || (link.bookId && data.wishes.some(w => w.bookId === link.bookId))) return data;
  return commit({ ...data, wishes: [...data.wishes, { id: createId(), title: clean, step: smallStep, ...link }] });
}
export function deleteWish(id: string): Space {
  const data = readSpace();
  return commit({ ...data, wishes: data.wishes.filter(w => w.id !== id) });
}
export function readAction(): ActiveAction | null {
  const raw: unknown = wx.getStorageSync(ACTIVE_KEY);
  if (raw === '' || raw === undefined) return null;
  if (!obj(raw) || !text(raw.id, 100) || !raw.id || !text(raw.title, 160) || !raw.title || !text(raw.step, 500) || !raw.step || (raw.taskId !== undefined && !text(raw.taskId, 100))) throw new Error('上次的小事暂时无法恢复。');
  return raw as unknown as ActiveAction;
}
export function saveAction(action: ActiveAction): void {
  if (!action.id || !action.title.trim() || !action.step.trim() || action.step.length > 500) throw new Error('先写下一小步。');
  wx.setStorageSync(ACTIVE_KEY, action);
}
export function clearAction(): void { wx.removeStorageSync(ACTIVE_KEY); }
export function saveReflection(action: ActiveAction, feeling: string, note: string, now = new Date()): Space {
  if (!['心里松了一点', '有一会儿很投入', '还是有点难受', '现在还说不清', '轻松了一点', '有点投入了', '还是难受', '暂时说不清'].includes(feeling) || note.length > 2000) throw new Error('选择一种此刻的感受。');
  const data = readSpace();
  // Reuse the action ID so a retry after an uncertain save cannot create a duplicate reflection.
  if (data.activities.some(a => a.id === action.id)) return data;
  const pad = (n: number) => String(n).padStart(2, '0');
  const activity: Activity = { id: action.id, title: action.title, step: action.step, feeling, note: note.trim(), createdAt: now.toISOString(), localDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, localTime: `${pad(now.getHours())}:${pad(now.getMinutes())}` };
  return commit({ ...data, activities: [...data.activities, activity] });
}
export function deleteActivity(id: string): Space {
  const data = readSpace();
  return commit({ ...data, activities: data.activities.filter(a => a.id !== id) });
}
