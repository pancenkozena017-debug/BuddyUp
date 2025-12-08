const express = require('express');
const path = require('path');

const app = express();

// Папка з фронтендом
const frontendPath = path.join(__dirname, 'buddy_up');

// Віддаємо всі статичні файли з buddy_up
app.use(express.static(frontendPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend running on port ${PORT}`));
