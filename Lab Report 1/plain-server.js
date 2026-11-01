// Step 3: plain server using Node's built-in http module
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello');
});

server.listen(3000, () => {
  console.log('Plain http server running on http://localhost:3000');
});

