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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend running on port ${PORT}`));
