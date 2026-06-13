const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

async function main() {
  const tRes = await fetch('http://localhost:4000/timetable?department=Computer%20Science%20and%20Engineering&limit=500');
  console.log('Timetable Status:', tRes.status);
  console.log('Timetable Response:', JSON.parse(tRes.data).data.length, 'items');

  const cRes = await fetch('http://localhost:4000/courses?department=Computer%20Science%20and%20Engineering&limit=10');
  console.log('Courses Status:', cRes.status);
  console.log('Courses Response:', JSON.parse(cRes.data).data.length, 'items');
  if (JSON.parse(cRes.data).data.length > 0) {
    console.log('Sample course department:', JSON.parse(cRes.data).data[0].department);
  }
}

main().catch(console.error);
