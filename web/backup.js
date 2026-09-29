import {normalize} from './logic.js';

export const BACKUP_VERSION=1;

export function createBackup(records, exportedAt=new Date().toISOString()){
 return JSON.stringify({format:'manmanlai-backup',version:BACKUP_VERSION,exportedAt,records:normalize(records)},null,2);
}

export function parseBackup(text){
 const backup=JSON.parse(text);
 if(backup?.format!=='manmanlai-backup'||backup.version!==BACKUP_VERSION)throw Error('Unsupported backup format');
 return normalize(backup.records);
}
