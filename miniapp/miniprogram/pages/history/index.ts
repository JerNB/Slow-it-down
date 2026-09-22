import { MoodRecord, deleteRecord, errorMessage, readRecords } from '../../services/records';

Page({
  data: { entries: [] as MoodRecord[], error: '', visibleCount: 30 },
  onShow() { this.loadRecords(); },
  loadRecords() {
    try { this.setData({ entries: readRecords().slice().reverse(), error: '' }); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  showMore() { this.setData({ visibleCount: this.data.visibleCount + 30 }); },
  recordMood() { wx.redirectTo({ url: '/pages/record/index' }); },
  remove(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id);
    wx.showModal({
      title: '删除这笔记录？', content: '删除后无法恢复。', confirmText: '删除', cancelText: '保留',
      success: result => {
        if (!result.confirm) return;
        try { deleteRecord(id); this.loadRecords(); }
        catch (error) { this.setData({ error: errorMessage(error) }); }
      }
    });
  }
});
