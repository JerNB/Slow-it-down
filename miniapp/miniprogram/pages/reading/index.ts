import { BOOKS, CONCERNS, LITERATURE, REASONS, RECOMMENDATIONS } from '../../content/site';

const map = RECOMMENDATIONS as Record<string, Record<string, string>>;
const reasons = REASONS as Record<string, Record<string, string>>;
Page({
  data: { stage: 0, concern: '', style: '', concerns: CONCERNS.map(([id, label]) => ({ id, label })), books: BOOKS, literature: LITERATURE, result: BOOKS[0], reason: '' },
  chooseConcern(event: WechatMiniprogram.TouchEvent) { this.setData({ concern: String(event.currentTarget.dataset.value), stage: 1 }); },
  chooseStyle(event: WechatMiniprogram.TouchEvent) {
    const style = String(event.currentTarget.dataset.value);
    const book = BOOKS.find(b => b.id === map[this.data.concern]?.[style]);
    this.setData({ style, result: book || BOOKS[0], reason: reasons[this.data.concern]?.[style] || '', stage: 2 });
  },
  reset() { this.setData({ stage: 0, concern: '', style: '' }); },
  back() { this.setData({ stage: 0, style: '' }); },
  viewBook(event: WechatMiniprogram.TouchEvent) { wx.navigateTo({ url: `/pages/book/index?kind=book&id=${event.currentTarget.dataset.id}` }); },
  viewLiterature(event: WechatMiniprogram.TouchEvent) { wx.navigateTo({ url: `/pages/book/index?kind=literature&id=${event.currentTarget.dataset.id}` }); }
});
