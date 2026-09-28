import { CAMPUSES, matchCampuses } from '../web/campus-data.js';

const ROR = 'https://api.ror.org/v2/organizations';
const SUPPORT = /counsel(?:l)?ing|mental[-\s]?health|psycholog(?:ical|y)|psychotherap|心理咨询|心理健康|学生心理|精神健康|gesundheit.*psych|sant[ée].*mentale|salud.*mental/i;
const PATHWAY = /student|health|wellness|wellbeing|well-being|support|services|life|care|wellbeing|咨询|健康/i;
const SKIP = /\.(?:pdf|jpg|jpeg|png|gif|svg|zip|docx?)($|\?)/i;
const curatedDomains = { 'nyu.edu':'nyu', 'usc.edu':'usc', 'umich.edu':'umich', 'berkeley.edu':'berkeley', 'columbia.edu':'columbia' };
const cache = new Map();

// Cache promises so concurrent identical searches share one upstream request; failed lookups must be retried.
function cached(key, ttl, load) {
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.value;
  const value = Promise.resolve().then(load).catch(error => { cache.delete(key); throw error; });
  if (cache.size >= 500) cache.delete(cache.keys().next().value);
  cache.set(key, { until: Date.now() + ttl, value });
  return value;
}
async function getJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`上游查询失败（${response.status}）`);
  return response.json();
}
function displayName(item) {
  return item.names?.find(n => n.types?.includes('ror_display'))?.value || item.names?.[0]?.value || '未命名学校';
}
function website(item) {
  const raw = item.links?.find(link => link.type === 'website')?.value;
  try { const url = new URL(raw); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function domain(item) {
  return item.domains?.find(Boolean) || (website(item) ? new URL(website(item)).hostname.replace(/^www\./, '') : '');
}
export function institution(item) {
  const geo = item.locations?.[0]?.geonames_details || {};
  return { id: item.id?.replace('https://ror.org/', '') || '', name: displayName(item), city: geo.name || '', country: geo.country_code || '', website: website(item), domain: domain(item) };
}
function unique(items) { return [...new Map(items.map(item => [item.id, item])).values()]; }
export async function searchSchools(query, fetchImpl = fetch) {
  const q = String(query || '').trim().slice(0, 120);
  if (q.length < 2) return [];
  const known = matchCampuses(q);
  const search = known.length === 1 ? known[0].english : q;
  const url = `${ROR}?query=${encodeURIComponent(search)}&filter=types:education`;
  const data = await cached(`search:${search.toLowerCase()}`, 3600000, () => getJson(url, fetchImpl));
  const words = search.toLowerCase().split(/\s+/).filter(w => w && !['university','college','of','the','and'].includes(w));
  const ranked = (data.items || []).filter(item => item.types?.includes('education') && (!words.length || words.every(w => item.names?.some(name => name.value?.toLowerCase().includes(w))))).map(item => ({
    ...institution(item),
    score: (displayName(item).toLowerCase() === search.toLowerCase() ? 120 : 0)
      + (item.names?.some(name => name.value?.toLowerCase() === search.toLowerCase()) ? 100 : 0)
      + words.filter(w => displayName(item).toLowerCase().includes(w)).length * 10
  })).filter(item => item.id && item.website);
  const candidates = unique(ranked);
  return candidates.sort((a,b) => b.score-a.score).slice(0, 8).map(({ score, ...item }) => item);
}
export async function schoolsInCity(city, country, fetchImpl = fetch) {
  const place = String(city || '').trim().slice(0, 80);
  const code = String(country || '').toUpperCase();
  if (place.length < 2 || !/^[A-Z]{2}$/.test(code)) return [];
  const safePlace = place.replace(/([+\-=&|><!(){}\[\]^"~*?:\\/])/g, '\\$1');
  const advanced = encodeURIComponent(`locations.geonames_details.name:"${safePlace}"`);
  const base = `${ROR}?query.advanced=${advanced}&filter=types:education,locations.geonames_details.country_code:${code}`;
  const data = await cached(`city:${place.toLowerCase()}:${code}`, 3600000, async () => {
    const first = await getJson(`${base}&page=1`, fetchImpl);
    const totalPages = Math.min(5, Math.ceil((first.number_of_results || first.items?.length || 0) / 20));
    const rest = await Promise.all(Array.from({ length: Math.max(0,totalPages-1) }, (_,i) => getJson(`${base}&page=${i+2}`, fetchImpl)));
    return [...(first.items || []), ...rest.flatMap(page => page.items || [])];
  });
  const score = item => (curatedDomains[item.domain] ? 100 : 0) + (/university|universit/i.test(item.name) ? 20 : 0) + (/college|institute|academy|school|polytechnic/i.test(item.name) ? 8 : 0);
  return unique(data.map(institution).filter(item => item.website && item.city.toLowerCase() === place.toLowerCase() && item.country === code && !/press|district|system|association|foundation/i.test(item.name))).sort((a,b) => score(b)-score(a) || a.name.localeCompare(b.name)).slice(0, 20);
}
function htmlText(raw) { return String(raw || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_,n) => String.fromCodePoint(Number(n))).replace(/\s+/g, ' ').trim(); }
function allowed(raw, domains) {
  try {
    const url = new URL(raw);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || SKIP.test(url.pathname)) return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || /^\d+(?:\.\d+){3}$/.test(host)) return false;
    // Only follow links on the institution's listed domain or its subdomains.
    return domains.some(d => host === d || host.endsWith(`.${d}`));
  } catch { return false; }
}
function links(html, base, domains) {
  const out = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1].replace(/&amp;/g, '&'), base);
      url.hash = '';
      if (allowed(url.href, domains)) out.push({ url: url.href, label: htmlText(match[2]) });
    } catch { /* Ignore malformed links. */ }
  }
  return out;
}
function linkScore(link) {
  const value = `${link.url} ${link.label}`;
  return (SUPPORT.test(value) ? 20 : 0) + (PATHWAY.test(value) ? 5 : 0) - (/news|blog|event|research|faculty|staff|job/i.test(value) ? 8 : 0);
}
async function page(url, domains, fetchImpl, redirects = 0) {
  if (!allowed(url, domains)) return null;
  try {
    const response = await fetchImpl(url, { redirect: 'manual', headers: { accept: 'text/html' }, signal: AbortSignal.timeout(4500) });
    if (response.status >= 300 && response.status < 400 && redirects < 3) {
      const next = new URL(response.headers.get('location') || '', url).href;
      return next !== url && allowed(next, domains) ? page(next, domains, fetchImpl, redirects + 1) : null;
    }
    if (!response.ok || !/text\/html/i.test(response.headers.get('content-type') || '')) return null;
    if (Number(response.headers.get('content-length') || 0) > 1000000) return null;
    const html = (await response.text()).slice(0, 1000000);
    const title = htmlText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '学校支持页面').slice(0, 140);
    return { url, title, links: links(html, url, domains) };
  } catch { return null; }
}
export async function discoverSupport(item, fetchImpl = fetch) {
  const school = institution(item);
  const domains = item.domains?.length ? item.domains.map(d => d.toLowerCase()) : [school.domain];
  if (!school.website || !domains.length || !allowed(school.website, domains)) return [];
  const seed = await page(school.website, domains, fetchImpl);
  if (!seed) return [];
  const seen = new Set([seed.url]);
  const queue = [...new Map(seed.links.filter(link => linkScore(link) >= 5).map(link => [link.url, link])).values()].sort((a,b) => linkScore(b) - linkScore(a)).slice(0, 25);
  const found = [];
  // Bound discovery so a slow school website cannot hold a user request indefinitely.
  const deadline = Date.now() + 15000;
  for (let i = 0; i < queue.length && seen.size < 30 && found.length < 3 && Date.now() < deadline; i++) {
    const candidate = queue[i];
    if (seen.has(candidate.url) || linkScore(candidate) < 5) continue;
    seen.add(candidate.url);
    const result = await page(candidate.url, domains, fetchImpl);
    if (!result) continue;
    if (SUPPORT.test(`${result.url} ${result.title}`)) found.push({ title: result.title, url: result.url, source: 'school_website' });
    if (i < 18) {
      for (const link of result.links.sort((a,b) => linkScore(b) - linkScore(a)).slice(0, 12)) {
        if (linkScore(link) >= 5 && !seen.has(link.url) && !queue.some(x => x.url === link.url)) queue.push(link);
      }
      queue.splice(i + 1, queue.length - i - 1, ...queue.slice(i + 1).sort((a,b) => linkScore(b) - linkScore(a)));
    }
  }
  return found;
}
export async function supportForSchool(id, fetchImpl = fetch) {
  if (!/^[0-9a-z]{9}$/.test(String(id || ''))) throw new Error('学校编号无效');
  const item = await cached(`record:${id}`, 86400000, () => getJson(`${ROR}/${id}`, fetchImpl));
  const school = institution(item);
  if (!item.types?.includes('education') || !school.website) throw new Error('找不到学校官网');
  const knownId = curatedDomains[school.domain];
  const known = CAMPUSES.find(c => c.id === knownId);
  const resources = known ? [{ title: known.center, url: known.url, source: 'curated', address: known.address, checked: '2026-09-22' }] : await cached(`support:${id}`, 86400000, () => discoverSupport(item, fetchImpl));
  return { school, resources, checked: new Intl.DateTimeFormat('sv-SE', { timeZone:'Asia/Shanghai' }).format(new Date()) };
}
