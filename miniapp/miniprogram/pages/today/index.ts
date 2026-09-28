import { IDEAS } from '../../content/ideas';
import { LITERATURE } from '../../content/site';
import { errorMessage, readRecords } from '../../services/records';
import { addWish, readAction, readSpace } from '../../services/space';

const withoutFinalPeriod = (value: string) => value.replace(/。$/, '');
Page({
  data: { greeting: '你好', dateLabel: '', idea: IDEAS[0], ideaDescription: withoutFinalPeriod(IDEAS[0].desc), recordCount: 0, taskCount: 0, saved: false, hasAction: false, literature: LITERATURE[0], literatureTitle: withoutFinalPeriod(LITERATURE[0].title), error: '' },
  onLoad() { this.changeIdea(); },
  onShow() {
    const now = new Date();
    const hour = now.getHours();
    const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const literature = LITERATURE[day % LITERATURE.length];
    this.setData({ greeting: hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好', dateLabel: `${now.getMonth() + 1}月${now.getDate()}日`, literature, literatureTitle: withoutFinalPeriod(literature.title) });
    try {
      const space = readSpace();
      this.setData({ recordCount: readRecords().length + space.activities.length, taskCount: space.tasks.filter(t => !t.done).length, saved: space.wishes.some(w => w.sourceId === this.data.idea.id), hasAction: !!readAction(), error: '' });
    }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  changeIdea() {
    const options = IDEAS.filter(idea => idea.id !== this.data.idea.id);
    const idea = options[Math.floor(Math.random() * options.length)] || IDEAS[0];
    this.setData({ idea, ideaDescription: withoutFinalPeriod(idea.desc) });
    try { this.setData({ saved: readSpace().wishes.some(w => w.sourceId === idea.id), error: '' }); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  collectIdea() {
    try { addWish(this.data.idea.title, this.data.idea.step, { sourceId: this.data.idea.id }); this.setData({ saved: true, error: '' }); wx.showToast({ title: '已放进我的期待', icon: 'none' }); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  startIdea() { wx.navigateTo({ url: `/pages/action/index?kind=idea&id=${this.data.idea.id}` }); },
  resumeAction() { wx.navigateTo({ url: '/pages/action/index' }); },
  recordMood() { wx.navigateTo({ url: '/pages/record/index' }); },
  viewHistory() { wx.navigateTo({ url: '/pages/history/index' }); },
  goTodo() { wx.switchTab({ url: '/pages/todo/index' }); },
  goReading() { wx.switchTab({ url: '/pages/reading/index' }); },
  goPause() { wx.navigateTo({ url: '/pages/pause/index' }); },
  goLetters() { wx.navigateTo({ url: '/pages/letters/index' }); },
  goCampus() { wx.navigateTo({ url: '/pages/campus/index' }); }
});
