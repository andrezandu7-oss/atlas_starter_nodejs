const express = require('express');
const mongoose = require('mongoose');
const app = express();

// --- CONFIGURATION ---
app.use(express.json());
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/biosync";

// Connexion MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connecté"))
    .catch(err => console.error("❌ Erreur de connexion:", err));

// Modèle Utilisateur
const User = mongoose.model('User', new mongoose.Schema({
    nom: String,
    genotype: { type: String, uppercase: true },
    groupeSanguin: String,
    email: { type: String, unique: true, required: true }
}));

// --- ROUTES API ---
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true });
    } catch (e) {
        res.status(400).json({ error: "Email déjà utilisé ou données manquantes." });
    }
});

// --- PAGE D'ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
            <h1>Bienvenue sur BioSync</h1>
            <p>Sécurité médicale et éthique garantie.</p>
            <a href="/signup"><button style="padding:10px 20px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer;">Créer un compte</button></a>
        </body>
    `);
});

// --- PAGE D'INSCRIPTION (Celle qui manquait) ---
app.get('/signup', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BioSync - Inscription</title>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <style>
        body { font-family: sans-serif; background: #f4f4f9; display: flex; justify-content: center; padding: 20px; }
        .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        #reader { width: 100%; border-radius: 8px; margin-bottom: 15px; }
        input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
        .locked { background: #e8f5e9; border: 1px solid #2ecc71; font-weight: bold; }
        button { width: 100%; padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
        button:disabled { background: #ccc; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Inscription</h2>
        <p>Scannez votre certificat médical pour remplir vos infos.</p>
        <div id="reader"></div>
        <form id="regForm">
            <input type="text" id="nom" placeholder="Nom complet (via scan)" readonly class="locked">
            <input type="text" id="genotype" placeholder="Génotype (via scan)" readonly class="locked">
            <input type="text" id="gs" placeholder="Groupe Sanguin (via scan)" readonly class="locked">
            <input type="email" id="email" placeholder="Votre Email" required>
            <button type="submit" id="submitBtn" disabled>Finaliser l'inscription</button>
        </form>
    </div>

    <script>
        const scanner = new Html5Qrcode("reader");
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (text) => {
                const parts = text.split('|');
                parts.forEach(p => {
                    if(p.startsWith('NOM:')) document.getElementById('nom').value = p.split(':')[1];
                    if(p.startsWith('GENO:')) document.getElementById('genotype').value = p.split(':')[1];
                    if(p.startsWith('GS:')) document.getElementById('gs').value = p.split(':')[1];
                });
                if(document.getElementById('genotype').value) {
                    document.getElementById('submitBtn').disabled = false;
                    scanner.stop();
                    document.getElementById('reader').style.display = 'none';
                    alert("✅ Données extraites !");
                }
            }
        ).catch(err => console.error("Erreur caméra", err));

        document.getElementById('regForm').onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                nom: document.getElementById('nom').value,
                genotype: document.getElementById('genotype').value,
                groupeSanguin: document.getElementById('gs').value,
                email: document.getElementById('email').value
            };
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if(res.ok) alert("🎉 Compte créé !");
            else alert("❌ Erreur lors de l'envoi.");
        };
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => console.log("🚀 Serveur en ligne sur le port " + PORT));
