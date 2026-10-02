const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/notes', (_req, res) => {
  res.json([
    { title: 'A little reminder', text: 'You make ordinary days feel like pages worth keeping.' },
    { title: 'My favorite thing', text: 'The way you can make me smile without even trying.' },
    { title: 'Always', text: 'No matter where life takes us, I hope we keep choosing each other.' }
  ]);
});

app.listen(PORT, () => {
  console.log(`💕 Scrapbook running at http://localhost:${PORT}`);
});
