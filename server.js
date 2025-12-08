const express = require('express');
const path = require('path');

const app = express();

// Вказуємо папку з фронтендом
const frontendPath = path.join(__dirname, 'index');

// Віддаємо всі статичні файли з папки frontend
app.use(express.static(frontendPath));

// Для будь-якого GET запиту, який не збігається зі статичними файлами
app.all(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend running on port ${PORT}`));
