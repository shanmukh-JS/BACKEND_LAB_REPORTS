// Steps 4-6: Express server with routes and a 404 handler
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// GET / -> welcome text
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Backend Development Fundamentals Lab 1 server!');
});

// GET /about -> JSON with name and section
app.get('/about', (req, res) => {
  res.status(200).json({ name: 'SHANMUKH NAGANJAN KADALI', section: 'CSE-GEN_AI- 2A , 304 ' });
});

// GET /time -> current date and time
app.get('/time', (req, res) => {
  res.status(200).json({ currentTime: new Date().toString(), iso: new Date().toISOString() });
});

// 404 for any unknown path (must come after all other routes)
app.use((req, res) => {
  res.status(404).send(`404 Not Found: ${req.method} ${req.originalUrl} does not exist`);
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

