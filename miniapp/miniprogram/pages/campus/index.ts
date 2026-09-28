import { CAMPUS_API_BASE_URL } from '../../config';

interface School { id: string; name: string; city: string; country: string; website: string; domain: string }
interface Resource { title: string; url: string; source: string; address?: string; checked?: string }
interface Support { school: School; resources: Resource[]; checked: string }

function request<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => wx.request({
    url: `${CAMPUS_API_BASE_URL}${path}`,
    method: 'GET',
    success: result => result.statusCode >= 200 && result.statusCode < 300
      ? resolve(result.data as T)
      : reject(new Error((result.data as { error?: string })?.error || '查询暂时不可用。')),
    fail: () => reject(new Error('暂时无法连接学校查询服务。'))
  }));
}

Page({
  data: { query: '', schools: [] as School[], support: null as Support | null, message: '', busy: false, locating: false },
  input(event: { detail: { value: string } }) { this.setData({ query: event.detail.value }); },
  async search() {
    const query = this.data.query.trim();
    if (query.length < 2) { this.setData({ message: '请至少输入两个字或字母。' }); return; }
    this.setData({ busy: true, schools: [], support: null, message: '正在查找学校…' });
    try {
      const data = await request<{ schools: School[] }>(`/api/campus/search?q=${encodeURIComponent(query)}`);
      this.setData({ schools: data.schools, message: data.schools.length ? `找到 ${data.schools.length} 所可能匹配的学校，请确认校名和校区。` : '没有找到匹配的学校。可以试试学校的英文全称。' });
    } catch (error) { this.setData({ message: (error as Error).message }); }
    finally { this.setData({ busy: false }); }
  },
  locate() {
    if (this.data.locating) return;
    this.setData({ locating: true, schools: [], support: null, message: '请在微信提示中选择是否允许定位。' });
    // Coordinates go directly to the city lookup provider; our campus API receives only city and country.
    wx.getLocation({
      type: 'wgs84',
      success: position => {
        wx.request({
          url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.latitude}&longitude=${position.longitude}&localityLanguage=en`,
          success: async result => {
            try {
              if (result.statusCode !== 200) throw new Error('位置服务暂时不可用。');
              const place = result.data as { city?: string; locality?: string; countryCode?: string };
              const city = place.city || place.locality;
              if (!city || !place.countryCode) throw new Error('无法识别当前城市。');
              const data = await request<{ schools: School[] }>(`/api/campus/nearby?city=${encodeURIComponent(city)}&country=${encodeURIComponent(place.countryCode)}`);
              this.setData({ schools: data.schools, message: data.schools.length ? `找到 ${city} 的 ${data.schools.length} 所候选学校，请选择你就读的学校。` : `目录中暂未找到 ${city} 的学校，请手动输入校名。` });
            } catch (error) { this.setData({ message: `${(error as Error).message} 请手动输入校名。` }); }
            finally { this.setData({ locating: false }); }
          },
          fail: () => this.setData({ locating: false, message: '位置服务暂时不可用，请手动输入校名。' })
        });
      },
      fail: () => this.setData({ locating: false, message: '未获得定位权限，或暂时无法定位。你仍可手动输入校名。' })
    });
  },
  async choose(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || '');
    if (!id) return;
    this.setData({ busy: true, support: null, message: '正在查找这所学校的支持页面…' });
    try {
      const support = await request<Support>(`/api/campus/support?id=${encodeURIComponent(id)}`);
      this.setData({ support, schools: [], message: support.resources.length ? `找到 ${support.resources.length} 个学校官网支持页面。` : '已找到学校，但没有找到可核实的心理支持页面。' });
    } catch (error) { this.setData({ message: (error as Error).message }); }
    finally { this.setData({ busy: false }); }
  },
  copyResource(event: WechatMiniprogram.TouchEvent) {
    const index = Number(event.currentTarget.dataset.index);
    const resource = this.data.support?.resources[index];
    if (resource) wx.setClipboardData({ data: resource.url, fail: () => this.setData({ message: '复制失败，请稍后重试。' }) });
  },
  copySchool() {
    const website = this.data.support?.school.website;
    if (website) wx.setClipboardData({ data: website, fail: () => this.setData({ message: '复制失败，请稍后重试。' }) });
  }
});
