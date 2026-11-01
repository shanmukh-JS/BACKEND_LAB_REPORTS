// Part 1: Plain server using Node's built-in http module (no Express).
const http = require('http');

const PORT = process.env.PORT || 3000;

// The callback runs for EVERY incoming request.
// req = incoming request (url, method, headers), res = response we send back.
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello');
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 - Page Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}`);
});
