import { supportForSchool } from '../../server/campus-service.js';

export async function GET(request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    return Response.json(await supportForSchool(id));
  } catch (error) {
    const invalid = /无效|找不到/.test(error?.message || '');
    return Response.json(
      { error: invalid ? error.message : '暂时无法查询学校资料，请稍后再试。' },
      { status: invalid ? 400 : 502 }
    );
  }
}
