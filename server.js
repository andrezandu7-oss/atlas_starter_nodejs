const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webPush = require('web-push');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Connexion MongoDB
const mongoURI = "mongodb+srv://Genlove:le09022025rose%40@cluster0.6vdjyyo.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ Erreur MongoDB:", err.message));

// Route de test
app.get('/', (req, res) => {
  res.send("🚀 Genlove API en ligne");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});