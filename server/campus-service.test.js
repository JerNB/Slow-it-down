import test from 'node:test';
import assert from 'node:assert/strict';
import { searchSchools, schoolsInCity, discoverSupport } from './campus-service.js';

const school = (id, name, city = 'Cambridge', aliases = []) => ({
  id: `https://ror.org/${id}`,
  names: [{ value:name, types:['ror_display'] }, ...aliases.map(value => ({ value, types:['acronym'] }))],
  types:['education'], status:'active', domains:['example.edu'], links:[{ type:'website', value:'https://www.example.edu/' }],
  locations:[{ geonames_details:{ name:city, country_code:'US' } }]
});
const json = data => new Response(JSON.stringify(data), { status:200, headers:{ 'content-type':'application/json' } });
const html = body => new Response(body, { status:200, headers:{ 'content-type':'text/html' } });

test('manual search uses registry acronyms and excludes unrelated schools', async () => {
  const fetchImpl = async () => json({ items:[school('123456789','Massachusetts Institute of Technology','Cambridge',['MIT']), school('987654321','Something Else')] });
  const result = await searchSchools('MIT', fetchImpl);
  assert.deepEqual(result.map(item => item.name), ['Massachusetts Institute of Technology']);
});

test('location candidates match both city and country', async () => {
  const fetchImpl = async () => json({ items:[school('123456789','A University','Ann Arbor'), school('987654321','B University','Detroit')] });
  const result = await schoolsInCity('Ann Arbor','US',fetchImpl);
  assert.deepEqual(result.map(item => item.name), ['A University']);
});

test('city lookup pages through schools whose names omit the city', async () => {
  const seen = [];
  const fetchImpl = async url => {
    seen.push(url);
    return json(url.includes('page=2')
      ? { items:[school('111222333','Southern California University','Los Angeles')] }
      : { number_of_results:21, items:[school('123456789','Los Angeles College','Los Angeles')] });
  };
  const result = await schoolsInCity('Los Angeles','US',fetchImpl);
  assert.ok(seen[0].includes('query.advanced='));
  assert.ok(seen.some(url => url.includes('page=2')));
  assert.ok(result.some(item => item.name === 'Southern California University'));
});

test('support discovery follows official links but never presents outside domains', async () => {
  const pages = new Map([
    ['https://www.example.edu/', '<a href="/students">Students</a><a href="https://other.example.org/counseling">Counseling</a>'],
    ['https://www.example.edu/students', '<a href="https://health.example.edu/mental-health">Mental health</a>'],
    ['https://health.example.edu/mental-health', '<title>Student Mental Health and Counseling</title>']
  ]);
  const fetchImpl = async url => pages.has(url) ? html(pages.get(url)) : new Response('', { status:404 });
  const result = await discoverSupport(school('123456789','Example University'), fetchImpl);
  assert.equal(result.length, 1);
  assert.equal(result[0].url, 'https://health.example.edu/mental-health');
});
