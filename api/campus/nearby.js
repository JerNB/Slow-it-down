import { schoolsInCity } from '../../server/campus-service.js';

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    return Response.json({ schools: await schoolsInCity(params.get('city'), params.get('country')) });
  } catch {
    return Response.json({ error: '暂时无法查询学校资料，请稍后再试。' }, { status: 502 });
  }
}
