// serveur-test.js - Version MINIMALE
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

console.log("✅ express chargé");
console.log("✅ mongoose chargé");
console.log("✅ cors chargé");

const app = express();
const port = process.env.PORT || 3000;

// Connexion MongoDB
const mongouRI = process.env.MONGODB_URI || "mongodb+srv://Genlove:le09022025rose%40@cluster0.6vdjyyo.mongodb.net/?appName=Cluster0";

console.log("Tentative de connexion à MongoDB...");

mongoose.connect(mongouRI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch(err => console.error("❌ Erreur MongoDB:", err.message));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Genlove API fonctionne !');
});

app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur port ${port}`);
});