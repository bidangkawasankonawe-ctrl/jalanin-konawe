import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const TRIPS_FILE = path.join(DATA_DIR, 'trips.json');

app.use(express.json({ limit: '10mb' }));

// Pastikan direktori data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'E-TRAVEL KONAWE', timestamp: new Date().toISOString() });
});

app.get('/api/trips', (req, res) => {
  try {
    if (fs.existsSync(TRIPS_FILE)) {
      const content = fs.readFileSync(TRIPS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return res.json(parsed);
    }
    return res.json({ trips: [], lastSync: null });
  } catch (err: any) {
    console.error('Error membaca trips.json:', err);
    res.status(500).json({ error: 'Gagal membaca data dari server' });
  }
});

app.post('/api/trips', (req, res) => {
  try {
    const { trips, lastSync } = req.body;
    if (!Array.isArray(trips)) {
      return res.status(400).json({ error: 'Data trips harus berupa array' });
    }
    const payload = {
      trips,
      lastSync: lastSync || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(TRIPS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    res.json({ success: true, count: trips.length, lastSync: payload.lastSync });
  } catch (err: any) {
    console.error('Error menyimpan trips.json:', err);
    res.status(500).json({ error: 'Gagal menyimpan data ke server' });
  }
});

// Setup Vite dev server or serve production static assets
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server E-TRAVEL KONAWE aktif pada port ${PORT}`);
  });
}

startServer();
