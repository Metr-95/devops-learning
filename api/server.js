const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = '/data/entries.json';

app.use(cors());
app.use(express.json());

// Создать файл если не существует
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

// Получить все записи
app.get('/entries', (req, res) => {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(data);
});

// Добавить запись
app.post('/entries', (req, res) => {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const entry = { ...req.body, id: Date.now() };
  data.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(entry);
});

// Удалить запись
app.delete('/entries/:id', (req, res) => {
  ensureDataFile();
  let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  data = data.filter(e => e.id !== parseInt(req.params.id));
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API сервер запущен на порту ${PORT}`);
});
