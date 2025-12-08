const express = require('express');
const path = require('path');

const app = express();

// Маршрути
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup/signup.html'));
});

// Використовуємо порт із Railway
const PORT = process.env.PORT; // обов'язково з ENV
if (!PORT) {
  console.error('Error: process.env.PORT is not set');
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => console.log(`Frontend running on 0.0.0.0:${PORT}`));
