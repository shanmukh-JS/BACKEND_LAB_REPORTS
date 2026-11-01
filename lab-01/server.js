// Part 2: The same server rewritten with Express, plus extra routes.
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// GET / -> welcome text
app.get('/', (req, res) => {
  res.status(200).send('Welcome to Lab 1: Node.js and Express server!');
});

// GET /about -> JSON with name and section
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'SHANMUKH NAGANJAN KADALI',
    section: 'CSE GEN_AI-2A , 304'
  });
});

// GET /time -> current date and time
app.get('/time', (req, res) => {
  res.status(200).send(`Current date and time: ${new Date()}`);
});

// 404 handler: must come AFTER all other routes.
// It runs only when no route above matched the request.
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Start the server only when run directly (node server.js).
// When imported by a hosting platform (e.g. Vercel), it just exports the app.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
