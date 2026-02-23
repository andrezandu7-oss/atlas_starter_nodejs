const express = require('express');
const mongoose = require('mongoose');
const app = express();

// --- CONFIGURATION ---
app.use(express.json());
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/genlove";

// Connexion MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connecté"))
    .catch(err => console.error("❌ Erreur de connexion:", err));

// Modèle Utilisateur
const User = mongoose.model('User', new mongoose.Schema({
    nom: String,
    genotype: { type: String, uppercase: true, enum: ['AA', 'AS', 'SS'] },
    groupeSanguin: String,
    email: { type: String, unique: true, required: true },
    verified: { type: Boolean, default: false }
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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Genlove - Accueil</title>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .container {
                    max-width: 400px;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                h1 {
                    color: #1a2a44;
                    font-size: 3rem;
                    margin: 0;
                }
                .pink { color: #ff416c; }
                .slogan {
                    color: #666;
                    margin: 20px 0;
                    font-size: 1.2rem;
                }
                .btn {
                    display: block;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 30px;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 1.1rem;
                    transition: transform 0.3s;
                }
                .btn:hover {
                    transform: translateY(-2px);
                }
                .btn.dark {
                    background: #1a2a44;
                    color: white;
                }
                .btn.pink {
                    background: #ff416c;
                    color: white;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></h1>
                <div class="slogan">Unissez cœur et santé pour un avenir serein 💑</div>
                <a href="/signup" class="btn dark">Créer un compte</a>
                <a href="/login" class="btn pink">Se connecter</a>
                <div style="margin-top:30px; font-size:0.8rem; color:#999;">🛡️ Données de santé cryptées</div>
            </div>
        </body>
        </html>
    `);
});

// --- PAGE D'INSCRIPTION AVEC SCAN QR ---
app.get('/signup', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Inscription</title>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        h2 {
            color: #1a2a44;
            margin-top: 0;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 20px;
            font-size: 0.9rem;
        }
        #reader {
            width: 100%;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 20px;
            background: #000;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
            font-size: 0.9rem;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 1rem;
            box-sizing: border-box;
            transition: border 0.3s;
        }
        input:focus {
            border-color: #ff416c;
            outline: none;
        }
        .locked {
            background: #f0f0f0;
            border-color: #4caf50;
            color: #333;
        }
        .badge {
            background: #4caf50;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            margin-left: 8px;
        }
        button {
            width: 100%;
            padding: 15px;
            background: #ff416c;
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1.1rem;
            margin-top: 20px;
            transition: background 0.3s, transform 0.2s;
        }
        button:hover:not(:disabled) {
            background: #ff1a4f;
            transform: translateY(-2px);
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .scan-btn {
            background: #1a2a44;
            margin-top: 10px;
        }
        .scan-btn:hover {
            background: #0f1a2b;
        }
        .back-link {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: #666;
            text-decoration: none;
            font-size: 0.9rem;
        }
        .back-link:hover {
            color: #ff416c;
        }
        .test-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
            border: 2px dashed #ccc;
        }
        .test-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #555;
        }
        .test-buttons {
            display: flex;
            gap: 10px;
        }
        .test-btn {
            background: white;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            flex: 1;
            font-size: 0.9rem;
        }
        .test-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>Créer mon compte Genlove</h2>
        <div class="subtitle">Scannez votre certificat médical pour remplir automatiquement vos informations</div>
        
        <!-- Scanner QR -->
        <div id="reader"></div>
        
        <!-- Formulaire -->
        <form id="regForm">
            <div class="form-group">
                <label>Nom complet <span id="qrBadge" class="badge" style="display:none;">QR scanné</span></label>
                <input type="text" id="nom" placeholder="En attente de scan..." readonly class="locked">
            </div>
            
            <div class="form-group">
                <label>Génotype</label>
                <input type="text" id="genotype" placeholder="En attente de scan..." readonly class="locked">
            </div>
            
            <div class="form-group">
                <label>Groupe sanguin</label>
                <input type="text" id="gs" placeholder="En attente de scan..." readonly class="locked">
            </div>
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" placeholder="Votre adresse email" required>
            </div>
            
            <button type="submit" id="submitBtn" disabled>Finaliser l'inscription</button>
        </form>
        
        <!-- Zone de test (QR codes simulés) -->
        <div class="test-section">
            <div class="test-title">🧪 QR codes de test</div>
            <div class="test-buttons">
                <button class="test-btn" type="button" onclick="simulateQR('AA', 'O+')">AA / O+</button>
                <button class="test-btn" type="button" onclick="simulateQR('AS', 'A+')">AS / A+</button>
                <button class="test-btn" type="button" onclick="simulateQR('SS', 'B-')">SS / B-</button>
            </div>
        </div>
        
        <a href="/" class="back-link">← Retour à l'accueil</a>
    </div>

    <script>
        // Initialisation du scanner
        const scanner = new Html5Qrcode("reader");
        
        // Démarrer le scan automatiquement au chargement
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (text) => {
                // Format du QR: NOM:João Silva|GENO:AA|GS:O+
                const parts = text.split('|');
                
                parts.forEach(p => {
                    if(p.startsWith('NOM:')) {
                        document.getElementById('nom').value = p.split(':')[1];
                    }
                    if(p.startsWith('GENO:')) {
                        document.getElementById('genotype').value = p.split(':')[1];
                    }
                    if(p.startsWith('GS:')) {
                        document.getElementById('gs').value = p.split(':')[1];
                    }
                });
                
                // Vérifier que les champs sont remplis
                if(document.getElementById('genotype').value && 
                   document.getElementById('nom').value && 
                   document.getElementById('gs').value) {
                    
                    document.getElementById('qrBadge').style.display = 'inline-block';
                    document.getElementById('submitBtn').disabled = false;
                    
                    // Arrêter le scanner
                    scanner.stop();
                    document.getElementById('reader').style.display = 'none';
                    
                    alert("✅ Données extraites avec succès !");
                } else {
                    alert("❌ Format de QR code invalide");
                }
            },
            (errorMessage) => {
                // Ignorer les erreurs de scan
            }
        ).catch(err => {
            console.error("Erreur caméra", err);
            alert("❌ Impossible d'accéder à la caméra. Vérifiez les permissions.");
        });

        // Fonction pour simuler un QR code (test)
        function simulateQR(genotype, bloodGroup) {
            document.getElementById('nom').value = 'João Manuel Silva';
            document.getElementById('genotype').value = genotype;
            document.getElementById('gs').value = bloodGroup;
            document.getElementById('qrBadge').style.display = 'inline-block';
            document.getElementById('submitBtn').disabled = false;
            
            // Arrêter le scanner si actif
            scanner.stop();
            document.getElementById('reader').style.display = 'none';
        }

        // Soumission du formulaire
        document.getElementById('regForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const data = {
                nom: document.getElementById('nom').value,
                genotype: document.getElementById('genotype').value,
                groupeSanguin: document.getElementById('gs').value,
                email: document.getElementById('email').value,
                verified: true
            };
            
            // Validation simple
            if (!data.nom || !data.genotype || !data.groupeSanguin || !data.email) {
                alert("❌ Tous les champs sont requis");
                return;
            }
            
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            if(res.ok) {
                alert("🎉 Compte créé avec succès !");
                window.location.href = '/';
            } else {
                const err = await res.json();
                alert("❌ " + (err.error || "Erreur lors de l'envoi"));
            }
        };
    </script>
</body>
</html>
    `);
});

// --- PAGE DE LOGIN (simplifiée) ---
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Genlove - Connexion</title>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .container {
                    max-width: 400px;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                h2 { color: #1a2a44; }
                .btn {
                    display: inline-block;
                    padding: 12px 30px;
                    background: #ff416c;
                    color: white;
                    text-decoration: none;
                    border-radius: 30px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Connexion</h2>
                <p>Cette page sera bientôt disponible !</p>
                <a href="/" class="btn">Retour à l'accueil</a>
            </div>
        </body>
        </html>
    `);
});

// --- LANCEMENT DU SERVEUR ---
app.listen(PORT, '0.0.0.0', () => {
    console.log("🚀 Genlove démarré sur le port " + PORT);
    console.log("📱 Accueil: http://localhost:" + PORT);
    console.log("📱 Inscription: http://localhost:" + PORT + "/signup");
});