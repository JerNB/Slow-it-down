import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { searchSchools, schoolsInCity, supportForSchool } from './campus-service.js';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../web');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png' };
const port = Number(process.env.PORT) || 3000;

function json(response, status, body) {
  response.writeHead(status, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff' });
  response.end(JSON.stringify(body));
}
const server = createServer(async (request, response) => {
  if (request.method !== 'GET') return json(response, 405, { error:'只支持 GET 请求。' });
  const url = new URL(request.url || '/', 'http://localhost');
  try {
    if (url.pathname === '/api/campus/search') return json(response, 200, { schools: await searchSchools(url.searchParams.get('q')) });
    if (url.pathname === '/api/campus/nearby') return json(response, 200, { schools: await schoolsInCity(url.searchParams.get('city'), url.searchParams.get('country')) });
    if (url.pathname === '/api/campus/support') return json(response, 200, await supportForSchool(url.searchParams.get('id')));
    const path = resolve(webRoot, `.${url.pathname === '/' ? '/index.html' : url.pathname}`);
    if (path !== webRoot && !path.startsWith(webRoot + sep)) return json(response, 404, { error:'页面不存在。' });
    const body = await readFile(path);
    response.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream', 'x-content-type-options':'nosniff' });
    response.end(body);
  } catch (error) {
    const status = error?.code === 'ENOENT' ? 404 : /无效|找不到/.test(error?.message || '') ? 400 : 502;
    json(response, status, { error: status === 502 ? '暂时无法查询学校资料，请稍后再试。' : error.message });
  }
});
server.listen(port, () => { console.log(`Manmanlai web and campus API: http://localhost:${port}`); });
