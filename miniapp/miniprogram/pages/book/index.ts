import { BOOKS, LITERATURE, QUOTES } from '../../content/site';
import { errorMessage } from '../../services/records';
import { addWish, readSpace } from '../../services/space';

Page({
  data: { kind: 'book', book: BOOKS[0], quote: QUOTES[0], hasQuote: true, noteId: '', literature: LITERATURE[0], saved: false, error: '' },
  onLoad(options: Record<string, string | undefined>) {
    if (options.kind === 'literature') {
      const literature = LITERATURE.find(n => n.id === options.id);
      if (literature) this.setData({ kind: 'literature', literature });
    } else {
      const book = BOOKS.find(b => b.id === options.id) || BOOKS[0];
      const quote = QUOTES.find(q => q.bookId === book.id);
      this.setData({ kind: 'book', book, quote: quote || QUOTES[0], hasQuote: !!quote, noteId: 'noteId' in book ? String(book.noteId) : '' });
      try { this.setData({ saved: readSpace().wishes.some(w => w.bookId === book.id) }); }
      catch (error) { this.setData({ error: errorMessage(error) }); }
    }
  },
  saveBook() {
    try { addWish(`读一点《${this.data.book.title}》`, this.data.book.start, { bookId: this.data.book.id }); this.setData({ saved: true, error: '' }); wx.showToast({ title: '已放进我的期待', icon: 'none' }); }
    catch (error) { this.setData({ error: errorMessage(error) }); }
  },
  viewNote() { if (this.data.noteId) wx.navigateTo({ url: `/pages/book/index?kind=literature&id=${this.data.noteId}` }); },
  copySource() {
    const source = this.data.kind === 'book' ? (this.data.hasQuote ? this.data.quote.source : this.data.book.source) : this.data.literature.source;
    wx.setClipboardData({ data: source, fail: () => this.setData({ error: '复制失败，请稍后重试。' }) });
  }
});
