// ============================================
// GENLOVE - VERSION MINIMALE DE TEST
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connexion MongoDB
const mongoURI = process.env.MONGODB_URI;
console.log('🔄 Connexion à MongoDB...');

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connecté !'))
  .catch(err => {
    console.error('❌ MongoDB:', err.message);
    process.exit(1);
  });

// Route de test
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
        <title>Genlove Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { background: #fdf2f2; font-family: Arial; display: flex; justify-content: center; padding: 20px; }
            .card { background: white; border-radius: 20px; padding: 30px; max-width: 400px; text-align: center; }
            h1 { color: #ff416c; }
            .success { color: green; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💙 Genlove Test</h1>
            <p class="success">✅ Serveur fonctionnel !</p>
            <p>MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connecté' : '⏳ En attente'}</p>
            <p>Heure: ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
  `);
});

// Route API test
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ SERVEUR DE TEST DÉMARRÉ`);
  console.log(`🌍 Port: ${port}`);
  console.log('='.repeat(50));
});