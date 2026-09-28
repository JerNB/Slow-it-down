import { deleteRecord, errorMessage, readRecords } from '../../services/records';
import { deleteActivity, readSpace } from '../../services/space';

interface HistoryItem { id: string; kind: 'mood' | 'activity'; title: string; feeling: string; note: string; localDate: string; localTime: string; createdAt: string }

Page({
  data: { entries: [] as HistoryItem[], error: '', visibleCount: 30 },
  onShow() { this.loadRecords(); },
  loadRecords() {
    try {
      const moods: HistoryItem[] = readRecords().map(m => ({ id: m.id, kind: 'mood', title: m.mood || '给自己的一句话', feeling: '', note: m.note, localDate: m.localDate, localTime: m.localTime, createdAt: m.createdAt }));
      const activities: HistoryItem[] = readSpace().activities.map(a => ({ id: a.id, kind: 'activity', title: a.title, feeling: a.feeling, note: a.note, localDate: a.localDate, localTime: a.localTime, createdAt: a.createdAt }));
      this.setData({ entries: [...moods, ...activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), error: '' });
    }
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
        try { if (event.currentTarget.dataset.kind === 'activity') deleteActivity(id); else deleteRecord(id); this.loadRecords(); }
        catch (error) { this.setData({ error: errorMessage(error) }); }
      }
    });
  }
});
