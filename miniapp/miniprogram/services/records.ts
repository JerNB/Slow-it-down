// 页面只调用这些函数，不直接操作存储，后续更容易接入云同步。
export const RECORDS_KEY = 'manmanlai.mini.lesson1.records';
export const DRAFT_KEY = 'manmanlai.mini.lesson1.draft';
export const MOODS = ['有点低落', '有些疲惫', '说不清楚', '还算平静', '有点开心'];

export interface MoodRecord {
  id: string;
  mood: string;
  note: string;
  createdAt: string;
  localDate: string;
  localTime: string;
  timezoneOffset: number;
}
export interface MoodDraft { id: string; mood: string; note: string }

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function validText(mood: unknown, note: unknown): boolean {
  return typeof mood === 'string' && (mood === '' || MOODS.includes(mood)) &&
    typeof note === 'string' && note.length <= 2000;
}
function isRecord(value: unknown): value is MoodRecord {
  return isObject(value) && typeof value.id === 'string' && value.id.length > 0 &&
    validText(value.mood, value.note) && !!(value.mood || String(value.note).trim()) &&
    typeof value.createdAt === 'string' && Number.isFinite(Date.parse(value.createdAt)) &&
    typeof value.localDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.localDate) &&
    typeof value.localTime === 'string' && /^\d{2}:\d{2}$/.test(value.localTime) &&
    typeof value.timezoneOffset === 'number' && Number.isFinite(value.timezoneOffset);
}
export function readRecords(): MoodRecord[] {
  const raw: unknown = wx.getStorageSync(RECORDS_KEY);
  if (raw === '' || raw === undefined) return [];
  if (!isObject(raw) || raw.version !== 1 || !Array.isArray(raw.entries) || !raw.entries.every(isRecord)) {
    throw new Error('无法读取已有记录。为保护内容，暂时停止保存，请保留输入并联系开发者。');
  }
  return raw.entries as MoodRecord[];
}
export function readDraft(): MoodDraft | null {
  const raw: unknown = wx.getStorageSync(DRAFT_KEY);
  if (raw === '' || raw === undefined) return null;
  if (!isObject(raw) || typeof raw.id !== 'string' || !raw.id || !validText(raw.mood, raw.note)) {
    throw new Error('草稿暂时无法读取，未覆盖原内容。');
  }
  return raw as unknown as MoodDraft;
}
export function saveDraft(draft: MoodDraft): void {
  if (!draft.id || !validText(draft.mood, draft.note)) throw new Error('草稿内容不正确。');
  wx.setStorageSync(DRAFT_KEY, draft);
}
export function clearDraft(): void { wx.removeStorageSync(DRAFT_KEY); }

export function saveMood(draft: MoodDraft, now = new Date()): MoodRecord {
  if (!draft.id || !validText(draft.mood, draft.note) || !(draft.mood || draft.note.trim())) {
    throw new Error('选一个心情，或者写下一句话就好。');
  }
  const entries = readRecords(); // 先读取检查：格式异常时不能覆盖旧记录。
  const existing = entries.find(entry => entry.id === draft.id);
  if (existing) return existing; // 同一次提交重试，不重复创建。
  const pad = (n: number) => String(n).padStart(2, '0');
  const entry: MoodRecord = {
    id: draft.id, mood: draft.mood, note: draft.note.trim(), createdAt: now.toISOString(),
    localDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    localTime: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    timezoneOffset: now.getTimezoneOffset()
  };
  wx.setStorageSync(RECORDS_KEY, { version: 1, entries: [...entries, entry] });
  return entry;
}
export function deleteRecord(id: string): void {
  const entries = readRecords();
  wx.setStorageSync(RECORDS_KEY, { version: 1, entries: entries.filter(entry => entry.id !== id) });
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '暂时无法读写本机存储，请保留输入后重试。';
}
