import { LETTERS } from '../../content/site';
Page({
  data: { letters: LETTERS.map(([title, context, reflection, action], id) => ({ id, number: String(id + 1).padStart(2, '0'), title, context, reflection, action })), expanded: -1 },
  toggle(event: WechatMiniprogram.TouchEvent) { const index = Number(event.currentTarget.dataset.index); this.setData({ expanded: this.data.expanded === index ? -1 : index }); },
  pause() { wx.switchTab({ url: '/pages/pause/index' }); },
  campus() { wx.navigateTo({ url: '/pages/campus/index' }); },
  contact() { wx.navigateTo({ url: '/pages/contact/index' }); }
});
