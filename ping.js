const http = require('http');

const routes = ['/', '/transfer', '/ledger'];
const apiRoutes = ['/api/chat'];

async function ping(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      resolve({ route, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ route, error: err.message });
    });
  });
}

async function pingPost(route) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: route,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      resolve({ route, status: res.statusCode });
    });
    
    req.on('error', (err) => {
      resolve({ route, error: err.message });
    });

    req.write(JSON.stringify({ messages: [{ role: 'user', content: 'test' }] }));
    req.end();
  });
}

async function run() {
  for (const route of routes) {
    const res = await ping(route);
    console.log(`GET ${res.route} -> ${res.status || res.error}`);
  }
  for (const route of apiRoutes) {
    const res = await pingPost(route);
    console.log(`POST ${res.route} -> ${res.status || res.error}`);
  }
}

run();
