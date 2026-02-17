// ============================================
// GENLOVE - ÉTAPE 1 (Ajout d'une route)
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

// Route d'accueil
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
        <title>Genlove - Étape 1</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { background: #fdf2f2; font-family: Arial; display: flex; justify-content: center; padding: 20px; }
            .card { background: white; border-radius: 20px; padding: 30px; max-width: 400px; text-align: center; }
            h1 { color: #ff416c; }
            .success { color: green; }
            .btn { background: #ff416c; color: white; padding: 15px 30px; border-radius: 50px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💙 Genlove</h1>
            <p class="success">✅ Étape 1 réussie !</p>
            <p>MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connecté' : '⏳ En attente'}</p>
            <a href="/test" class="btn">Tester route /test</a>
        </div>
    </body>
    </html>
  `);
});

// Nouvelle route de test
app.get('/test', (req, res) => {
  res.send(`
    <html>
    <head>
        <title>Route test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { background: #fdf2f2; font-family: Arial; display: flex; justify-content: center; padding: 20px; }
            .card { background: white; border-radius: 20px; padding: 30px; max-width: 400px; text-align: center; }
            .success { color: green; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>✅ Route /test fonctionne</h1>
            <p><a href="/">Retour</a></p>
        </div>
    </body>
    </html>
  `);
});

// Route API
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ GENLOVE ÉTAPE 1 DÉMARRÉE`);
  console.log(`🌍 Port: ${port}`);
  console.log('='.repeat(50));
});