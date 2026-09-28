import { MOODS, clearDraft, createId, errorMessage, readDraft, readRecords, saveDraft, saveMood } from '../../services/records';

Page({
  data: { moods: MOODS, mood: '', note: '', draftId: '', error: '', draftStatus: '', saving: false, submitted: false, blocked: false },
  onLoad() {
    try {
      const draft = readDraft();
      // 写入成功但清草稿失败时，重新进入不重复恢复已提交的草稿。
      const alreadySaved = draft && readRecords().some(entry => entry.id === draft.id);
      this.setData(draft && !alreadySaved
        ? { mood: draft.mood, note: draft.note, draftId: draft.id, draftStatus: '已恢复上次的草稿' }
        : { draftId: createId() });
    } catch (error) {
      this.setData({ blocked: true, error: errorMessage(error) });
    }
  },
  selectMood(event: WechatMiniprogram.TouchEvent) {
    this.setData({ mood: String(event.currentTarget.dataset.mood) });
    this.persistDraft();
  },
  inputNote(event: { detail: { value: string } }) {
    this.setData({ note: event.detail.value });
    this.persistDraft();
  },
  persistDraft() {
    if (this.data.blocked || this.data.submitted) return;
    try {
      saveDraft({ id: this.data.draftId, mood: this.data.mood, note: this.data.note });
      this.setData({ draftStatus: '草稿已保存在本机', error: '' });
    } catch (_) {
      this.setData({ draftStatus: '', error: '草稿暂时无法保存，请保留输入，稍后重试。' });
    }
  },
  save() {
    if (this.data.saving || this.data.blocked || this.data.submitted) return;
    this.setData({ saving: true, error: '' });
    try { saveMood({ id: this.data.draftId, mood: this.data.mood, note: this.data.note }); }
    catch (error) {
      this.setData({ saving: false, error: errorMessage(error) });
      return;
    }
    this.setData({ saving: false, submitted: true, draftStatus: '这笔心情已保存在本机' });
    try { clearDraft(); }
    catch (_) { /* 记录已保存。下次根据稳定 ID 跳过这份旧草稿。 */ }
  },
  retryDraft() { this.persistDraft(); },
  viewHistory() { wx.redirectTo({ url: '/pages/history/index' }); },
  goBack() { wx.navigateBack(); }
});
