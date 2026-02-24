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

// --- PAGE GÉNÉRATEUR DE QR CODE ---
app.get('/generator', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Générateur QR - Genlove</title>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
            <style>
                body { font-family: Arial; padding: 20px; max-width: 400px; margin: 0 auto; background: #f4f4f9; }
                .card { background: white; padding: 20px; border-radius: 15px; }
                select, button { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; }
                #qrcode { display: flex; justify-content: center; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Générateur de QR code</h2>
                <select id="genotype">
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                </select>
                <select id="bloodGroup">
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                </select>
                <button onclick="generateQR()">Générer QR</button>
                <div id="qrcode"></div>
                <p><a href="/signup">→ Aller à l'inscription</a></p>
            </div>
            <script>
                function generateQR() {
                    const data = "NOM:João Silva|GENO:" + document.getElementById('genotype').value + "|GS:" + document.getElementById('bloodGroup').value;
                    
                    QRCode.toCanvas(document.createElement('canvas'), data, { width: 250 }, (err, canvas) => {
                        document.getElementById('qrcode').innerHTML = '';
                        document.getElementById('qrcode').appendChild(canvas);
                    });
                }
            </script>
        </body>
        </html>
    `);
});

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

// --- PAGE GÉNÉRATEUR DE QR CODE ---
app.get('/generator', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Générateur QR - Genlove</title>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
            <style>
                body { font-family: Arial; padding: 20px; max-width: 400px; margin: 0 auto; background: #f4f4f9; }
                .card { background: white; padding: 20px; border-radius: 15px; }
                select, button { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; }
                #qrcode { display: flex; justify-content: center; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Générateur de QR code</h2>
                <select id="genotype">
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                </select>
                <select id="bloodGroup">
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                </select>
                <button onclick="generateQR()">Générer QR</button>
                <div id="qrcode"></div>
                <p><a href="/signup">→ Aller à l'inscription</a></p>
            </div>
            <script>
                function generateQR() {
                    const data = "NOM:João Silva|GENO:" + document.getElementById('genotype').value + "|GS:" + document.getElementById('bloodGroup').value;
                    
                    QRCode.toCanvas(document.createElement('canvas'), data, { width: 250 }, (err, canvas) => {
                        document.getElementById('qrcode').innerHTML = '';
                        document.getElementById('qrcode').appendChild(canvas);
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// --- PAGE D'INSCRIPTION AVEC SCAN QR CORRIGÉE ---
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
        h2 { color: #1a2a44; margin-top: 0; }
        #reader { width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
        .debug-box {
            background: #f0f0f0;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.8rem;
            word-break: break-all;
            margin: 10px 0;
            display: none;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 10px;
            margin: 8px 0;
            box-sizing: border-box;
        }
        .locked {
            background: #e8f5e9;
            border-color: #4caf50;
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
            margin: 10px 0;
        }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .badge {
            background: #4caf50;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>Inscription Genlove</h2>
        <p>Scannez votre QR code médical</p>
        
        <div id="reader"></div>
        
        <!-- Zone de débogage (pour voir ce que le scanner lit) -->
        <div class="debug-box" id="debug">
            <strong>Dernier scan:</strong> <span id="debugText"></span>
        </div>
        
        <form id="regForm">
            <input type="text" id="nom" placeholder="Nom complet" readonly class="locked">
            <input type="text" id="genotype" placeholder="Génotype" readonly class="locked">
            <input type="text" id="gs" placeholder="Groupe sanguin" readonly class="locked">
            <input type="email" id="email" placeholder="Votre Email" required>
            <button type="submit" id="submitBtn" disabled>Finaliser l'inscription</button>
        </form>
        
        <hr>
        <p style="font-size:0.8rem; text-align:center;">🧪 Pas de QR ? Utilisez les boutons :</p>
        <div style="display:flex; gap:5px;">
            <button onclick="simulateQR('AA', 'O+')" style="background:#1a2a44;">AA / O+</button>
            <button onclick="simulateQR('AS', 'A+')" style="background:#1a2a44;">AS / A+</button>
            <button onclick="simulateQR('SS', 'B-')" style="background:#1a2a44;">SS / B-</button>
        </div>
        
        <p style="text-align:center; margin-top:15px;">
            <a href="/generator" target="_blank" style="color:#ff416c;">📱 Générer un vrai QR code</a>
        </p>
        
        <a href="/" style="display:block; text-align:center; margin-top:15px; color:#666;">← Retour</a>
    </div>

    <script>
        const scanner = new Html5Qrcode("reader");
        
        // Démarrer le scanner
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (text) => {
                // Afficher ce qui a été scanné (débogage)
                document.getElementById('debug').style.display = 'block';
                document.getElementById('debugText').innerText = text;
                
                console.log("QR scanné:", text);
                
                // Essayer plusieurs formats
                let nom = '', geno = '', gs = '';
                
                // Format 1: NOM:...|GENO:...|GS:...
                if (text.includes('NOM:') && text.includes('GENO:') && text.includes('GS:')) {
                    const parts = text.split('|');
                    parts.forEach(p => {
                        if(p.startsWith('NOM:')) nom = p.split(':')[1];
                        if(p.startsWith('GENO:')) geno = p.split(':')[1];
                        if(p.startsWith('GS:')) gs = p.split(':')[1];
                    });
                }
                
                // Format 2: { "patientName": "...", "genotype": "...", "bloodGroup": "..." }
                try {
                    const json = JSON.parse(text);
                    if (json.patientName) nom = json.patientName;
                    if (json.genotype) geno = json.genotype;
                    if (json.bloodGroup) gs = json.bloodGroup;
                } catch(e) {}
                
                // Si on a trouvé les données
                if (nom && geno && gs) {
                    document.getElementById('nom').value = nom;
                    document.getElementById('genotype').value = geno;
                    document.getElementById('gs').value = gs;
                    document.getElementById('submitBtn').disabled = false;
                    
                    scanner.stop();
                    document.getElementById('reader').style.display = 'none';
                    alert("✅ Scan réussi !");
                } else {
                    alert("❌ Format non reconnu. Cliquez sur 'Générer un vrai QR code'");
                }
            },
            (error) => {} // Ignorer les erreurs
        ).catch(err => {
            alert("❌ Erreur caméra: " + err);
        });

        function simulateQR(genotype, bloodGroup) {
            document.getElementById('nom').value = 'João Silva';
            document.getElementById('genotype').value = genotype;
            document.getElementById('gs').value = bloodGroup;
            document.getElementById('submitBtn').disabled = false;
            scanner.stop();
            document.getElementById('reader').style.display = 'none';
        }

        document.getElementById('regForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const data = {
                nom: document.getElementById('nom').value,
                genotype: document.getElementById('genotype').value,
                groupeSanguin: document.getElementById('gs').value,
                email: document.getElementById('email').value,
                verified: true
            };
            
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
                alert("🎉 Compte créé !");
                window.location.href = '/';
            } else {
                const err = await res.json();
                alert("❌ " + err.error);
            }
        };
    </script>
</body>
</html>
    `);
});

// --- PAGE LOGIN ---
app.get('/login', (req, res) => {
    res.send('<h2 style="text-align:center;margin-top:50px;">Page de connexion (bientôt)</h2><p style="text-align:center;"><a href="/">Retour</a></p>');
});

// --- LANCEMENT ---
app.listen(PORT, '0.0.0.0', () => {
    console.log("🚀 Genlove démarré sur le port " + PORT);
    console.log("📱 Accueil: http://localhost:" + PORT);
    console.log("📱 Inscription: http://localhost:" + PORT + "/signup");
    console.log("📱 Générateur QR: http://localhost:" + PORT + "/generator");
});


// --- PAGE LOGIN ---
app.get('/login', (req, res) => {
    res.send('<h2 style="text-align:center;margin-top:50px;">Page de connexion (bientôt)</h2><p style="text-align:center;"><a href="/">Retour</a></p>');
});

// --- LANCEMENT ---
app.listen(PORT, '0.0.0.0', () => {
    console.log("🚀 Genlove démarré sur le port " + PORT);
    console.log("📱 Accueil: http://localhost:" + PORT);
    console.log("📱 Inscription: http://localhost:" + PORT + "/signup");
    console.log("📱 Générateur QR: http://localhost:" + PORT + "/generator");
});
