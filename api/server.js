const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = '/data/entries.json';
const VISITS_FILE = '/data/visits.json';

app.use(cors());
app.use(express.json());

function ensureFile(file, def = '[]') {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, def);
}

// ========== ENTRIES ==========

app.get('/entries', (req, res) => {
  ensureFile(DATA_FILE);
  res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
});

app.post('/entries', (req, res) => {
  ensureFile(DATA_FILE);
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const entry = { ...req.body, id: Date.now() };
  data.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(entry);
});

app.put('/entries/:id', (req, res) => {
  ensureFile(DATA_FILE);
  let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const id = parseInt(req.params.id);
  const idx = data.findIndex(e => e.id === id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  data[idx] = { ...req.body, id };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[idx]);
});

app.delete('/entries/:id', (req, res) => {
  ensureFile(DATA_FILE);
  let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  data = data.filter(e => e.id !== parseInt(req.params.id));
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

// ========== VISITS ==========

app.post('/visits', async (req, res) => {
  ensureFile(VISITS_FILE);
  const visits = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket.remoteAddress
    || 'unknown';

  // Получить геолокацию по IP
  let geo = { country: '—', city: '—', org: '—' };
  try {
    const geoRes = await fetch(`https://ipinfo.io/${ip}/json`);
    const geoData = await geoRes.json();
    geo.country = geoData.country || '—';
    geo.city = geoData.city || '—';
    geo.org = geoData.org || '—';
  } catch(e) {}

  const visit = {
    id: Date.now(),
    date: new Date().toLocaleString('ru-RU'),
    ip,
    country: geo.country,
    city: geo.city,
    org: geo.org,
    page: req.body.page || '/stats.html',
    userAgent: req.body.userAgent || ''
  };

  visits.push(visit);
  // Хранить только последние 500 визитов
  if (visits.length > 500) visits.splice(0, visits.length - 500);
  fs.writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2));
  res.json({ ok: true });
});

app.get('/visits', (req, res) => {
  ensureFile(VISITS_FILE);
  const visits = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
  res.json([...visits].reverse());
});

app.listen(PORT, () => {
  console.log(`API сервер запущен на порту ${PORT}`);
});
