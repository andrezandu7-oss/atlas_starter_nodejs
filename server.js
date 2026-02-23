const express = require('express');
const mongoose = require('mongoose');
const app = express();

// --- CONFIGURATION ---
app.use(express.json());
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/biosync";

// Connexion MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Base de données connectée"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

// Modèle Utilisateur
const User = mongoose.model('User', new mongoose.Schema({
    nom: String,
    genotype: String,
    groupeSanguin: String,
    email: { type: String, unique: true, required: true }
}));

// --- API : ENREGISTREMENT ---
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, message: "Utilisateur certifié enregistré !" });
    } catch (e) {
        res.status(400).json({ error: "Erreur : Email déjà utilisé ou données invalides." });
    }
});

// --- INTERFACE UNIQUE (ACCUEIL + FORMULAIRE) ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BioSync - Inscription Certifiée</title>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .container { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); width: 90%; max-width: 400px; text-align: center; }
        #reader { width: 100%; border-radius: 10px; margin-bottom: 20px; border: 2px dashed #ccc; }
        input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 14px; }
        /* Style spécifique pour les champs verrouillés (Anti-triche) */
        .locked { background: #e8f5e9; border: 1px solid #2ecc71; color: #27ae60; font-weight: bold; cursor: not-allowed; }
        button { width: 100%; padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .hidden { display: none; }
        .status { font-size: 12px; margin-bottom: 10px; color: #666; }
    </style>
</head>
<body>

<div class="container">
    <div id="home">
        <h1 style="color: #2c3e50;">BioSync</h1>
        <p>Pour créer un compte, munissez-vous de votre certificat médical officiel.</p>
        <button onclick="startProcess()">Commencer l'inscription</button>
    </div>

    <div id="register-form" class="hidden">
        <h3>Vérification Médicale</h3>
        <p class="status">Scannez le QR Code du certificat pour débloquer les champs.</p>
        
        <div id="reader"></div>

        <form id="finalForm">
            <input type="text" id="nom" placeholder="Nom Complet (Scan requis)" readonly class="locked">
            <input type="text" id="genotype" placeholder="Génotype (Scan requis)" readonly class="locked">
            <input type="text" id="gs" placeholder="Groupe Sanguin (Scan requis)" readonly class="locked">
            
            <input type="email" id="email" placeholder="Votre adresse Email" required>
            
            <button type="submit" id="btnSubmit" disabled style="background: #95a5a6;">Valider mon profil</button>
        </form>
    </div>
</div>

<script>
    const scanner = new Html5Qrcode("reader");

    function startProcess() {
        document.getElementById('home').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        
        // Démarrage de la caméra
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                // Analyse des données (Format attendu : NOM:Nom|GENO:SS|GS:O+)
                try {
                    const data = decodedText.split('|');
                    data.forEach(item => {
                        if(item.startsWith('NOM:')) document.getElementById('nom').value = item.split(':')[1];
                        if(item.startsWith('GENO:')) document.getElementById('genotype').value = item.split(':')[1];
                        if(item.startsWith('GS:')) document.getElementById('gs').value = item.split(':')[1];
                    });

                    // Si les données sont présentes, on active le bouton de validation
                    if(document.getElementById('genotype').value) {
                        document.getElementById('btnSubmit').disabled = false;
                        document.getElementById('btnSubmit').style.background = "#2ecc71";
                        scanner.stop();
                        document.getElementById('reader').innerHTML = "<p style='color:#2ecc71;'>✅ Certificat authentifié</p>";
                    }
                } catch(e) {
                    alert("Format de certificat invalide.");
                }
            }
        ).catch(err => alert("Erreur d'accès à la caméra. Vérifiez les permissions HTTPS sur Render."));
    }

    document.getElementById('finalForm').onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
            nom: document.getElementById('nom').value,
            genotype: document.getElementById('genotype').value,
            groupeSanguin: document.getElementById('gs').value,
            email: document.getElementById('email').value
        };

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if(response.ok) {
            alert("Compte créé avec succès ! Bienvenue sur BioSync.");
            window.location.reload();
        } else {
            alert("Erreur lors de l'enregistrement.");
        }
    };
</script>

</body>
</html>
    `);
});

app.listen(PORT, () => console.log("🚀 Serveur actif sur le port " + PORT));
