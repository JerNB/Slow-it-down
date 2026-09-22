import { IDEAS } from '../../content/ideas';
import { errorMessage, readRecords } from '../../services/records';

Page({
  data: { greeting: '你好', idea: IDEAS[0], recordCount: 0, error: '' },
  onLoad() { this.changeIdea(); },
  onShow() {
    const hour = new Date().getHours();
    this.setData({ greeting: hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好' });
    try { this.setData({ recordCount: readRecords().length, error: '' }); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  changeIdea() {
    const options = IDEAS.filter(idea => idea.id !== this.data.idea.id);
    this.setData({ idea: options[Math.floor(Math.random() * options.length)] || IDEAS[0] });
  },
  recordMood() { wx.navigateTo({ url: '/pages/record/index' }); },
  viewHistory() { wx.navigateTo({ url: '/pages/history/index' }); }
});
