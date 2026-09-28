import { errorMessage } from '../../services/records';
import { addTask, deleteTask, editTask, focusTask, moveTask, PRIORITY_NAMES, Priority, readSpace, Task, toggleTask } from '../../services/space';

const priorities: Priority[] = ['now', 'inbox', 'next', 'later'];
function groups(tasks: Task[]) { return priorities.map(key => ({ key, name: PRIORITY_NAMES[key], tasks: tasks.filter(t => !t.done && t.priority === key) })); }

Page({
  data: { title: '', addPriority: 'inbox' as Priority, addPriorityIndex: 1, groups: groups([]), completed: [] as Task[], editing: false, editId: '', editTitle: '', editStep: '', editPriority: 'inbox' as Priority, priorityOptions: priorities.map(p => PRIORITY_NAMES[p]), priorityIndex: 1, error: '' },
  onShow() { this.load(); },
  load() {
    try { const space = readSpace(); this.setData({ groups: groups(space.tasks), completed: space.tasks.filter(t => t.done), error: '' }); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  inputTitle(event: { detail: { value: string } }) { this.setData({ title: event.detail.value }); },
  changeAddPriority(event: { detail: { value: string } }) {
    const index = Number(event.detail.value);
    if (index >= 0 && index < priorities.length) this.setData({ addPriorityIndex: index, addPriority: priorities[index] });
  },
  add() {
    try { addTask(this.data.title, this.data.addPriority); this.setData({ title: '', error: '' }); this.load(); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  focus(event: WechatMiniprogram.TouchEvent) { try { focusTask(String(event.currentTarget.dataset.id)); this.load(); } catch (error) { this.setData({ error: errorMessage(error) }); } },
  toggle(event: WechatMiniprogram.TouchEvent) { try { toggleTask(String(event.currentTarget.dataset.id)); this.load(); } catch (error) { this.setData({ error: errorMessage(error) }); } },
  openEdit(event: WechatMiniprogram.TouchEvent) {
    try {
      const task = readSpace().tasks.find(t => t.id === String(event.currentTarget.dataset.id));
      if (!task) return;
      this.setData({ editing: true, editId: task.id, editTitle: task.title, editStep: task.step, editPriority: task.priority, priorityIndex: priorities.indexOf(task.priority), error: '' });
    } catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  inputEditTitle(event: { detail: { value: string } }) { this.setData({ editTitle: event.detail.value }); },
  inputEditStep(event: { detail: { value: string } }) { this.setData({ editStep: event.detail.value }); },
  changePriority(event: { detail: { value: string } }) { const index = Number(event.detail.value); if (index >= 0 && index < priorities.length) this.setData({ priorityIndex: index, editPriority: priorities[index] }); },
  saveEdit() {
    try { editTask(this.data.editId, this.data.editTitle, this.data.editStep, this.data.editPriority); this.setData({ editing: false, error: '' }); this.load(); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  cancelEdit() { this.setData({ editing: false, error: '' }); },
  move(event: WechatMiniprogram.TouchEvent) {
    try { moveTask(String(event.currentTarget.dataset.id), Number(event.currentTarget.dataset.direction) as -1 | 1); this.load(); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  delete() {
    wx.showModal({ title: '删除这件事？', content: '删除后无法恢复。', confirmText: '删除', success: result => {
      if (!result.confirm) return;
      try { deleteTask(this.data.editId); this.setData({ editing: false }); this.load(); }
      catch (error) { this.setData({ error: errorMessage(error) }); }
    } });
  },
  start(event: WechatMiniprogram.TouchEvent) { wx.navigateTo({ url: `/pages/action/index?kind=task&id=${event.currentTarget.dataset.id}` }); }
});
