Page({
  data: { message: '最近有点想找人聊聊。你这几天有空打个电话，或者一起吃顿饭吗？不用帮我解决什么，陪我说说话就好。', error: '' },
  input(event: { detail: { value: string } }) { this.setData({ message: event.detail.value }); },
  copy() { wx.setClipboardData({ data: this.data.message, fail: () => this.setData({ error: '复制失败，请长按文字手动复制。' }) }); }
});
