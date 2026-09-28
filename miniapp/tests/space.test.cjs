const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup(store = new Map()) {
  const wx = {
    getStorageSync: key => store.has(key) ? structuredClone(store.get(key)) : '',
    setStorageSync: (key, value) => store.set(key, structuredClone(value)),
    removeStorageSync: key => store.delete(key)
  };
  const cache = new Map();
  function load(name) {
    if (cache.has(name)) return cache.get(name);
    const source = fs.readFileSync(path.join(__dirname, `../miniprogram/services/${name}.ts`), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 } }).outputText;
    const context = { exports: {}, wx, require: spec => load(spec.replace('./', '')) };
    vm.runInNewContext(code, context);
    cache.set(name, context.exports);
    return context.exports;
  }
  return { api: load('space'), store, wx };
}

test('one current task at a time; previous focus moves to next', () => {
  const { api } = setup();
  api.addTask('第一件'); api.addTask('第二件');
  const [first, second] = api.readSpace().tasks;
  api.focusTask(first.id); api.focusTask(second.id);
  const tasks = api.readSpace().tasks;
  assert.equal(tasks.filter(t => t.priority === 'now' && !t.done).length, 1);
  assert.equal(tasks.find(t => t.id === first.id).priority, 'next');
  assert.equal(tasks.find(t => t.id === second.id).priority, 'now');
});

test('all four priorities are available when adding, with only one current task', () => {
  const { api } = setup();
  api.addTask('收集', 'inbox');
  api.addTask('接下来', 'next');
  api.addTask('暂时放下', 'later');
  api.addTask('先做甲', 'now');
  api.addTask('先做乙', 'now');
  const tasks = api.readSpace().tasks;
  assert.deepEqual(tasks.map(t => t.priority), ['inbox', 'next', 'later', 'next', 'now']);
  assert.throws(() => api.addTask('无效', 'urgent'), /放置位置/);
  assert.equal(api.readSpace().tasks.length, 5);
});

test('completion, recovery and reopening retain the task state', () => {
  const store = new Map();
  const firstRun = setup(store).api;
  firstRun.addTask('写下标题', 'now');
  const id = firstRun.readSpace().tasks[0].id;
  firstRun.toggleTask(id);
  assert.equal(firstRun.readSpace().tasks[0].done, true);
  const reopened = setup(store).api;
  assert.equal(reopened.readSpace().tasks[0].done, true);
  reopened.toggleTask(id);
  assert.equal(reopened.readSpace().tasks[0].priority, 'now');
  reopened.addTask('打开文档', 'now');
  reopened.toggleTask(id);
  reopened.toggleTask(id);
  const finalRun = setup(store).api;
  const tasks = finalRun.readSpace().tasks;
  assert.equal(tasks.find(t => t.id === id).priority, 'next');
  assert.equal(tasks.filter(t => !t.done && t.priority === 'now').length, 1);
});

test('task editing, reordering, completion and recovery persist', () => {
  const { api } = setup();
  api.addTask('A'); api.addTask('B');
  const [first, second] = api.readSpace().tasks;
  api.editTask(first.id, 'A 修改', '第一小步', 'inbox');
  api.moveTask(second.id, -1);
  assert.equal(api.readSpace().tasks[0].id, second.id);
  api.toggleTask(first.id);
  assert.equal(api.readSpace().tasks.find(t => t.id === first.id).done, true);
  api.toggleTask(first.id);
  assert.equal(api.readSpace().tasks.find(t => t.id === first.id).done, false);
  assert.equal(api.readSpace().tasks.find(t => t.id === first.id).step, '第一小步');
});

test('collecting the same source or book twice does not duplicate it', () => {
  const { api } = setup();
  api.addWish('散步', '走出门', { sourceId: 'walk' });
  api.addWish('散步', '走出门', { sourceId: 'walk' });
  api.addWish('读书', '读导言', { bookId: 'time' });
  api.addWish('读书', '读导言', { bookId: 'time' });
  assert.equal(api.readSpace().wishes.length, 2);
});

test('action survives reopening; reflection retry writes only once', () => {
  const { api } = setup();
  const action = { id: 'action-1', title: '散步', step: '走到门口' };
  api.saveAction(action);
  assert.equal(api.readAction().step, '走到门口');
  api.saveReflection(action, '还是难受', '练习文字', new Date(2026, 8, 23, 8, 15));
  api.saveReflection(action, '还是难受', '练习文字', new Date(2026, 8, 24, 8, 15));
  const [record] = api.readSpace().activities;
  assert.equal(api.readSpace().activities.length, 1);
  assert.equal(record.localDate, '2026-09-23');
  api.clearAction();
  assert.equal(api.readAction(), null);
});

test('invalid existing data is preserved; failed write does not pretend to commit', () => {
  const { api, store, wx } = setup();
  const invalid = { version: 999, tasks: [{ title: 'do not erase' }] };
  store.set(api.SPACE_KEY, invalid);
  assert.throws(() => api.addTask('新事项'), /无法读取/);
  assert.deepEqual(store.get(api.SPACE_KEY), invalid);
  store.delete(api.SPACE_KEY);
  api.addTask('原有事项');
  wx.setStorageSync = () => { throw new Error('full'); };
  assert.throws(() => api.addTask('新事项'), /full/);
  assert.equal(api.readSpace().tasks.length, 1);
});
