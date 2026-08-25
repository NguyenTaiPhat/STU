import fs from 'fs';

async function crawlFrontend() {
  console.log('1. Fetching STU AMIS index HTML...');
  const res = await fetch('http://amis01.stu.edu.vn/');
  const html = await res.text();
  console.log('HTML size:', html.length);
  fs.writeFileSync('scripts/amis_index.html', html);

  const scripts = [];
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  console.log('Found scripts:', scripts);

  const allApiRoutes = new Set();
  const allStates = [];

  for (const src of scripts) {
    const fullUrl = src.startsWith('http') ? src : 'http://amis01.stu.edu.vn/' + src.replace(/^\.\//, '');
    try {
      const sRes = await fetch(fullUrl);
      const content = await sRes.text();
      console.log('Fetched script:', fullUrl, 'size:', content.length);

      const routeRegex = /state\(['"]([^'"]+)['"],\s*\{/g;
      let rMatch;
      while ((rMatch = routeRegex.exec(content)) !== null) {
        allStates.push(rMatch[1]);
      }

      const apiRegex = /api\/([a-zA-Z0-9_\-\/]+)/g;
      let apiMatch;
      while ((apiMatch = apiRegex.exec(content)) !== null) {
        allApiRoutes.add(apiMatch[0]);
      }
    } catch (e) {
      console.log('Error fetching', fullUrl, e.message);
    }
  }

  console.log('--- ALL STATES ---');
  console.log(allStates);
  console.log('--- ALL DISCOVERED APIS (' + allApiRoutes.size + ') ---');
  console.log([...allApiRoutes].sort());
  fs.writeFileSync('scripts/discovered_apis.json', JSON.stringify([...allApiRoutes], null, 2));
}

crawlFrontend();
