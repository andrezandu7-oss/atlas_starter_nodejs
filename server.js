const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. LIEN DE CONNEXION DIRECT
const mongoURI = "mongodb+srv://Genlove:le09022025rose%40@cluster0.6vdjyyo.mongodb.net/?appName=Cluster0";

// 2. TENTATIVE DE CONNEXION
mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB est CONNECTÉ !");
  })
  .catch(err => {
    console.error("❌ ERREUR MongoDB :", err.message);
  });

// 3. ROUTE DE TEST
app.get('/', (req, res) => {
  res.send("🚀 Le serveur Genlove est en ligne !");
});

// 4. DÉMARRAGE DU SERVEUR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
