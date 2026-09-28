import { searchSchools } from '../../server/campus-service.js';

// Vercel serves files in api/ as functions; the local server keeps the same route.
export async function GET(request) {
  try {
    const query = new URL(request.url).searchParams.get('q');
    return Response.json({ schools: await searchSchools(query) });
  } catch {
    return Response.json({ error: '暂时无法查询学校资料，请稍后再试。' }, { status: 502 });
  }
}
