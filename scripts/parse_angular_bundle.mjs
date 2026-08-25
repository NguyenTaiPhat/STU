import fs from 'fs';

async function parseAngular() {
  const mainJs = await fetch('http://amis01.stu.edu.vn/main.c05329cf16a139f9.js').then(r => r.text());
  const runtimeJs = await fetch('http://amis01.stu.edu.vn/runtime.34849ea50697bcbc.js').then(r => r.text());
  
  fs.writeFileSync('scripts/main.js', mainJs);
  fs.writeFileSync('scripts/runtime.js', runtimeJs);

  console.log('Main.js length:', mainJs.length);

  // 1. Find all API endpoint strings (e.g., w-loc..., /api/...)
  const wRegex = /["'`]([a-zA-Z0-9_\-\/]*w-[a-zA-Z0-9_\-]+)["'`]/g;
  const wEndpoints = new Set();
  let match;
  while ((match = wRegex.exec(mainJs)) !== null) {
    wEndpoints.add(match[1]);
  }
  console.log('Found ' + wEndpoints.size + ' "w-" endpoints:');
  console.log([...wEndpoints].sort());

  // 2. Find all Angular routes
  const routeRegex = /path:\s*["']([^"']*)["']/g;
  const routes = new Set();
  while ((match = routeRegex.exec(mainJs)) !== null) {
    routes.add(match[1]);
  }
  console.log('\nFound ' + routes.size + ' Angular route paths:');
  console.log([...routes].sort());

  // 3. Find all chunks
  const chunkRegex = /([0-9a-zA-Z_\-]+)\.([0-9a-f]{16})\.js/g;
  const chunks = new Set();
  while ((match = chunkRegex.exec(runtimeJs + mainJs)) !== null) {
    chunks.add(match[0]);
  }
  console.log('\nFound ' + chunks.size + ' chunk files:');
  console.log([...chunks]);

  // Crawl each chunk for more endpoints & menu items
  for (const chunk of chunks) {
    try {
      const cContent = await fetch('http://amis01.stu.edu.vn/' + chunk).then(r => r.text());
      while ((match = wRegex.exec(cContent)) !== null) {
        wEndpoints.add(match[1]);
      }
      while ((match = routeRegex.exec(cContent)) !== null) {
        routes.add(match[1]);
      }
    } catch (e) {
      // ignore
    }
  }

  console.log('\n=== FINAL FULL DISCOVERED W-ENDPOINTS (' + wEndpoints.size + ') ===');
  console.log([...wEndpoints].sort());
  fs.writeFileSync('scripts/all_stu_w_endpoints.json', JSON.stringify([...wEndpoints].sort(), null, 2));

  console.log('\n=== FINAL FULL DISCOVERED ROUTES (' + routes.size + ') ===');
  console.log([...routes].sort());
  fs.writeFileSync('scripts/all_stu_routes.json', JSON.stringify([...routes].sort(), null, 2));
}

parseAngular();
