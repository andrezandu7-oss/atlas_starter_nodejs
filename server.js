// ============================================
// GENLOVE TEST - VERSION MINIMALE
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connexion MongoDB simplifiée
const mongoURI = process.env.MONGODB_URI;
console.log('🔌 Tentative de connexion à MongoDB...');

mongoose.connect(mongoURI)
  .then(() => console.log('✅ CONNEXION MONGODB RÉUSSIE !'))
  .catch(err => {
    console.error('❌ ERREUR MONGODB:', err.message);
    console.log('⚠️ L\'application continue sans base de données...');
  });

// Route de test API
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Genlove fonctionne !',
    timestamp: new Date().toISOString()
  });
});

// Route principale - sert la page d'accueil
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Serveur Genlove TEST démarré sur le port ${port}`);
  console.log(`🌍 http://localhost:${port}`);
});