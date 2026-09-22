const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup() {
  const store = new Map();
  const wx = {
    getStorageSync: key => store.has(key) ? structuredClone(store.get(key)) : '',
    setStorageSync: (key, value) => store.set(key, structuredClone(value)),
    removeStorageSync: key => store.delete(key)
  };
  const source = fs.readFileSync(path.join(__dirname, '../miniprogram/services/records.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 } }).outputText;
  const context = { exports: {}, wx };
  vm.runInNewContext(code, context);
  return { api: context.exports, store, wx };
}

test('save, reload and retry use one stable record; date/time are captured at creation', () => {
  const { api } = setup();
  const draft = { id: 'test-1', mood: '还算平静', note: '  虚构的练习记录  ' };
  const now = new Date(2026, 8, 21, 8, 15);
  const result = api.saveMood(draft, now);
  assert.equal(result.localDate, '2026-09-21');
  assert.equal(result.localTime, '08:15');
  assert.equal(result.createdAt, now.toISOString());
  assert.equal(result.note, '虚构的练习记录');
  api.saveMood(draft, new Date(2026, 8, 22, 10));
  assert.equal(api.readRecords().length, 1);
  assert.equal(api.readRecords()[0].localDate, '2026-09-21');
});

test('invalid old data is never overwritten by a save or deletion', () => {
  const { api, store } = setup();
  const invalid = { version: 99, entries: [{ id: 'keep-me' }] };
  store.set(api.RECORDS_KEY, invalid);
  assert.throws(() => api.saveMood({ id: 'new', mood: '还算平静', note: '' }), /无法读取/);
  assert.throws(() => api.deleteRecord('keep-me'), /无法读取/);
  assert.deepEqual(store.get(api.RECORDS_KEY), invalid);
});

test('storage failure propagates; existing record and draft survive', () => {
  const { api, wx } = setup();
  const draft = { id: 'test-1', mood: '有些疲惫', note: '虚构草稿' };
  api.saveDraft(draft);
  api.saveMood({ id: 'older', mood: '还算平静', note: '' });
  wx.setStorageSync = () => { throw new Error('quota exceeded'); };
  assert.throws(() => api.saveMood(draft), /quota exceeded/);
  assert.equal(api.readDraft().note, '虚构草稿');
  assert.equal(api.readRecords().length, 1);
});

test('delete removes only selected record; empty input is rejected', () => {
  const { api } = setup();
  assert.throws(() => api.saveMood({ id: 'blank', mood: '', note: '  ' }), /选一个/);
  api.saveMood({ id: 'first', mood: '还算平静', note: '' });
  api.saveMood({ id: 'second', mood: '', note: '只写一句话也可以' });
  api.deleteRecord('first');
  assert.equal(api.readRecords().length, 1);
  assert.equal(api.readRecords()[0].id, 'second');
});

test('draft can be recovered and cleared without clearing saved records', () => {
  const { api } = setup();
  const draft = { id: 'draft', mood: '有点开心', note: '练习文字' };
  api.saveDraft(draft);
  assert.equal(api.readDraft().id, 'draft');
  api.saveMood(draft);
  api.clearDraft();
  assert.equal(api.readDraft(), null);
  assert.equal(api.readRecords().length, 1);
});
