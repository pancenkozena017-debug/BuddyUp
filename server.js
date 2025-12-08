const express = require('express');
const path = require('path');

const app = express();

// Віддаємо всі CSS і JS з кореневих папок
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// HTML маршрути
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup/signup.html'));
});

const PORT = process.env.PORT;
if (!PORT) {
  console.error('Error: process.env.PORT is not set');
  process.exit(1);
}
console.log('Server directory:', __dirname);
console.log('PORT from env:', process.env.PORT);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend running on 0.0.0.0:${PORT}`);
});
