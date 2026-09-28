const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('four bottom entries point to registered pages and existing icons', () => {
  const root = path.join(__dirname, '../miniprogram');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  const entries = config.tabBar.list;
  assert.deepEqual(entries.map(entry => entry.text), ['今天', '一件件来', '读一点', '我的']);
  for (const entry of entries) {
    assert.ok(config.pages.includes(entry.pagePath), `${entry.pagePath} is registered`);
    assert.ok(fs.existsSync(path.join(root, entry.iconPath)), `${entry.iconPath} exists`);
    assert.ok(fs.existsSync(path.join(root, entry.selectedIconPath)), `${entry.selectedIconPath} exists`);
  }
});
