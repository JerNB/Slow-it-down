import { IDEAS } from '../../content/ideas';
import { createId, errorMessage } from '../../services/records';
import { ActiveAction, clearAction, editTask, readAction, readSpace, saveAction, saveReflection } from '../../services/space';

const FEELINGS = [
  { value: '心里松了一点', hint: '比开始前，轻了一些' },
  { value: '有一会儿很投入', hint: '那时只想着眼前的事' },
  { value: '还是有点难受', hint: '做完也没有马上好起来' },
  { value: '现在还说不清', hint: '先记下这一刻就好' }
];
Page({
  data: { actionId: '', title: '', step: '', taskId: '', phase: 'prepare', feelings: FEELINGS, feeling: '', note: '', error: '', saving: false },
  onLoad(options: Record<string, string | undefined>) {
    try {
      const active = readAction();
      if (!options.id && active) { this.setData({ actionId: active.id, title: active.title, step: active.step, taskId: active.taskId || '', phase: 'doing' }); return; }
      if (options.kind === 'idea') {
        const idea = IDEAS.find(i => i.id === options.id);
        if (idea) this.setData({ actionId: createId(), title: idea.title, step: idea.step });
      } else if (options.kind === 'task') {
        const task = readSpace().tasks.find(t => t.id === options.id);
        if (task) this.setData({ actionId: createId(), title: task.title, step: task.step, taskId: task.id });
      } else if (options.kind === 'wish') {
        const wish = readSpace().wishes.find(w => w.id === options.id);
        if (wish) this.setData({ actionId: createId(), title: wish.title, step: wish.step });
      }
      if (!this.data.actionId) this.setData({ error: '暂时找不到这件小事。' });
    } catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  inputStep(event: { detail: { value: string } }) { this.setData({ step: event.detail.value }); },
  inputNote(event: { detail: { value: string } }) { this.setData({ note: event.detail.value }); },
  start() {
    const action: ActiveAction = { id: this.data.actionId, title: this.data.title, step: this.data.step.trim(), ...(this.data.taskId ? { taskId: this.data.taskId } : {}) };
    try {
      if (this.data.taskId) {
        const task = readSpace().tasks.find(t => t.id === this.data.taskId);
        if (task) editTask(task.id, task.title, action.step, task.priority);
      }
      saveAction(action);
      this.setData({ phase: 'doing', step: action.step, error: '' });
    } catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  adjustStep() { this.setData({ phase: 'prepare' }); },
  reflect() { this.setData({ phase: 'reflect', feeling: '', note: '' }); },
  selectFeeling(event: WechatMiniprogram.TouchEvent) { this.setData({ feeling: String(event.currentTarget.dataset.value) }); },
  save() {
    if (this.data.saving) return;
    this.setData({ saving: true });
    try {
      const action: ActiveAction = { id: this.data.actionId, title: this.data.title, step: this.data.step, ...(this.data.taskId ? { taskId: this.data.taskId } : {}) };
      saveReflection(action, this.data.feeling, this.data.note);
      this.setData({ phase: 'saved', error: '' });
      try { clearAction(); } catch (_) { /* 稳定 ID 防止下一次重复记录 */ }
    } catch (error) { this.setData({ error: errorMessage(error) }); }
    this.setData({ saving: false });
  },
  stop() { try { clearAction(); wx.navigateBack(); } catch (error) { this.setData({ error: errorMessage(error) }); } },
  goHistory() { wx.redirectTo({ url: '/pages/history/index' }); }
});
