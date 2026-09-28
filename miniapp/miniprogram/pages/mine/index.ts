import { DRAFT_KEY, errorMessage, readRecords, RECORDS_KEY } from '../../services/records';
import { ACTIVE_KEY, addWish, deleteWish, readSpace, SPACE_KEY, Wish } from '../../services/space';

Page({
  data: { wishes: [] as Wish[], entryCount: 0, title: '', step: '', adding: false, error: '' },
  onShow() { this.load(); },
  load() {
    try { const data = readSpace(); this.setData({ wishes: data.wishes, entryCount: readRecords().length + data.activities.length, error: '' }); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  startAdd() { this.setData({ adding: true }); },
  cancelAdd() { this.setData({ adding: false }); },
  inputTitle(event: { detail: { value: string } }) { this.setData({ title: event.detail.value }); },
  inputStep(event: { detail: { value: string } }) { this.setData({ step: event.detail.value }); },
  saveWish() {
    try { addWish(this.data.title, this.data.step); this.setData({ title: '', step: '', adding: false, error: '' }); this.load(); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  remove(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id);
    wx.showModal({ title: '放下这份期待？', content: '移除后无法恢复。', confirmText: '移除', success: result => {
      if (!result.confirm) return;
      try { deleteWish(id); this.load(); } catch (error) { this.setData({ error: errorMessage(error) }); }
    } });
  },
  start(event: WechatMiniprogram.TouchEvent) { wx.navigateTo({ url: `/pages/action/index?kind=wish&id=${event.currentTarget.dataset.id}` }); },
  history() { wx.navigateTo({ url: '/pages/history/index' }); },
  letters() { wx.navigateTo({ url: '/pages/letters/index' }); },
  campus() { wx.navigateTo({ url: '/pages/campus/index' }); },
  contact() { wx.navigateTo({ url: '/pages/contact/index' }); },
  clearAll() {
    wx.showModal({ title: '清空本机所有记录？', content: '心情、行动足迹、期待和待办都会删除，无法恢复。此版本没有云备份。', confirmText: '确认清空', success: result => {
      if (!result.confirm) return;
      try {
        readRecords(); readSpace(); // 异常资料不能被清空操作悄悄覆盖。
        for (const key of [RECORDS_KEY, SPACE_KEY, DRAFT_KEY, ACTIVE_KEY]) wx.removeStorageSync(key);
        this.load(); wx.showToast({ title: '本机记录已清空', icon: 'none' });
      } catch (error) { this.setData({ error: errorMessage(error) }); }
    } });
  }
});
