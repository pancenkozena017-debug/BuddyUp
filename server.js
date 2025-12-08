const express = require('express');
const path = require('path');

const app = express();

// Віддаємо всі статичні файли з поточної папки (buddy_up)
app.use(express.static(__dirname));

// Корінь "/" віддає index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend running on port ${PORT}`));
