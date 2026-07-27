const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = '/data/entries.json';

app.use(cors());
app.use(express.json());

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

// Обновить запись
app.put('/entries/:id', (req, res) => {
  ensureDataFile();
  let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const id = parseInt(req.params.id);
  const idx = data.findIndex(e => e.id === id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  data[idx] = { ...req.body, id };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[idx]);
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
