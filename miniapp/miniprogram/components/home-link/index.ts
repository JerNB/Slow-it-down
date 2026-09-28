Component({
  methods: {
    goHome() {
      wx.switchTab({ url: '/pages/today/index' });
    }
  }
});
