const express = require('express');
const path = require('path');

const app = express();

// Віддаємо всі статичні файли з поточної папки
app.use(express.static(__dirname));

// Для будь-якого GET запиту, який не збігається зі статичними файлами
app.all(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend running on port ${PORT}`));
