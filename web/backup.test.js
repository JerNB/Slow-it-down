import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackup,parseBackup} from './backup.js';

test('backup round trip preserves local records',()=>{
 const records={wishes:[{id:'w1',title:'读一点'}],entries:[{id:'e1',type:'mood',at:'2026-09-29T00:00:00.000Z',note:'今天'}],todos:[{id:'t1',title:'散步',priority:'now',done:false}]};
 assert.deepEqual(parseBackup(createBackup(records,'2026-09-29T00:00:00.000Z')),records);
});

test('unsupported or malformed backups are rejected',()=>{
 assert.throws(()=>parseBackup('{'),SyntaxError);
 assert.throws(()=>parseBackup(JSON.stringify({format:'manmanlai-backup',version:2,records:{}})),/Unsupported backup format/);
 assert.throws(()=>parseBackup(JSON.stringify({format:'manmanlai-backup',version:1,records:{wishes:[],entries:'invalid'}})),/Invalid records/);
});
