const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Running on AWS App Runner Service !');
});

const PORT = 3978;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});