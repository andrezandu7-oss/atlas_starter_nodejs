const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = process.env.PORT || 3000;

// ========================
// CONNEXION MONGODB
// ========================
const mongouRI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';

mongoose.connect(mongouRI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion:", err));

// ========================
// CONFIGURATION SESSION
// ========================
app.set('trust proxy', 1);

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'genlove-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongouRI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    },
    proxy: true
};

app.use(session(sessionConfig));

// ========================
// MODÈLE UTILISATEUR
// ========================
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    genotype: { type: String, enum: ['AA', 'AS', 'SS'] },
    bloodGroup: String,
    dob: String,
    residence: String,
    region: String,
    desireChild: String,
    qrVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/');
    next();
};

// ============================================
// STYLES CSS PARTAGÉS
// ============================================
const styles = `
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Segoe UI', Roboto, sans-serif;
        background: #fdf2f2;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
    }
    .app-shell {
        width: 100%;
        max-width: 420px;
        min-height: 100vh;
        background: #f4e9da;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 30px rgba(0,0,0,0.1);
        margin: 0 auto;
    }
    .page-white {
        background: white;
        padding: 20px;
        flex: 1;
    }
    h2 {
        color: #1a2a44;
        margin-bottom: 20px;
    }
    .btn-pink, .btn-dark {
        padding: 15px 25px;
        border-radius: 60px;
        font-size: 1.2rem;
        font-weight: 600;
        width: 90%;
        margin: 10px auto;
        display: block;
        text-align: center;
        text-decoration: none;
        border: none;
        cursor: pointer;
    }
    .btn-pink {
        background: #ff416c;
        color: white;
    }
    .btn-dark {
        background: #1a2a44;
        color: white;
    }
    .input-box {
        width: 100%;
        padding: 14px;
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        margin: 8px 0;
        font-size: 1rem;
    }
    .locked {
        background: #e8f5e9;
        border-color: #4caf50;
    }
    .back-link {
        display: inline-block;
        margin: 15px 0;
        color: #666;
        text-decoration: none;
    }
    .photo-circle {
        width: 110px;
        height: 110px;
        border: 4px solid #ff416c;
        border-radius: 50%;
        margin: 15px auto;
        background-size: cover;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .st-group {
        background: white;
        border-radius: 15px;
        padding: 15px;
        margin: 15px 0;
    }
    .st-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    .st-item:last-child {
        border-bottom: none;
    }
</style>
`;

// ============================================
// PAGE D'ACCUEIL - SIMPLE, JUSTE UN LIEN VERS QR
// ============================================
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Accueil</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="page-white" style="text-align: center; padding-top: 100px;">
            <h1 style="font-size: 3rem; color: #ff416c;">Genlove</h1>
            <p style="margin: 30px 0; color: #666;">Trouvez l'amour en toute sécurité</p>
            <a href="/signup-qr" class="btn-pink">Créer un compte avec QR</a>
            <a href="/login" class="btn-dark">Se connecter</a>
        </div>
    </div>
</body>
</html>`);
});

// ============================================
// LOGIN (simplifié)
// ============================================
app.get('/login', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Connexion</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Connexion</h2>
            <form id="loginForm">
                <input type="text" id="firstName" class="input-box" placeholder="Votre prénom" required>
                <button type="submit" class="btn-pink">Se connecter</button>
            </form>
            <a href="/" class="back-link">← Retour</a>
        </div>
    </div>
    <script>
        document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            const res = await fetch('/api/login', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({firstName: document.getElementById('firstName').value})
            });
            if(res.ok) window.location.href = '/profile';
            else alert('Prénom non trouvé');
        };
    </script>
</body>
</html>`);
});

// ============================================
// TON CODE D'INSCRIPTION QR - CENTRAL - INCHANGÉ
// ============================================
app.get('/signup-qr', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Inscription QR</title>
    ${styles}
    <script src="https://unpkg.com/html5-qrcode@2.2.0/minified/html5-qrcode.min.js"></script>
    <style>
        .card {
            background: white;
            padding: 30px;
            border-radius: 20px;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        }
        #reader {
            width: 100%;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        .locked {
            background: #f0f0f0;
            border-color: #4caf50;
        }
        .debug-box {
            background: #f0f0f0;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.8rem;
            word-break: break-all;
            margin: 10px 0;
            display: none;
            border-left: 5px solid #ff416c;
        }
        .date-row {
            display: flex;
            gap: 5px;
            margin: 15px 0;
        }
        .date-row select {
            flex: 1;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 15px;
        }
        .test-buttons {
            display: flex;
            gap: 5px;
            margin: 15px 0;
        }
        .test-btn {
            flex: 1;
            background: #1a2a44;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 30px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <div class="card">
                <h2>Inscription avec certificat</h2>
                <p>Scannez votre QR code médical</p>
                
                <div id="reader"></div>
                
                <div class="debug-box" id="debug">
                    <strong>Dernier scan:</strong> <span id="debugText"></span>
                </div>
                
                <form id="regForm">
                    <input type="text" id="firstName" placeholder="Prénom" readonly class="locked input-box">
                    <input type="text" id="lastName" placeholder="Nom" readonly class="locked input-box">
                    <input type="text" id="genotype" placeholder="Génotype" readonly class="locked input-box">
                    <input type="text" id="bloodGroup" placeholder="Groupe sanguin" readonly class="locked input-box">
                    
                    <!-- 3 CASES DATE -->
                    <div class="date-row">
                        <select id="dobDay" disabled>
                            <option value="">Jour</option>
                            ${Array.from({length:31},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}
                        </select>
                        <select id="dobMonth" disabled>
                            <option value="">Mois</option>
                            <option value="1">Jan</option><option value="2">Fév</option><option value="3">Mar</option>
                            <option value="4">Avr</option><option value="5">Mai</option><option value="6">Juin</option>
                            <option value="7">Juil</option><option value="8">Aoû</option><option value="9">Sep</option>
                            <option value="10">Oct</option><option value="11">Nov</option><option value="12">Déc</option>
                        </select>
                        <select id="dobYear" disabled>
                            <option value="">Année</option>
                            ${Array.from({length:100},(_,i)=>{
                                let y = new Date().getFullYear()-18-i;
                                return `<option value="${y}">${y}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    
                    <input type="text" id="residence" placeholder="Ville" class="input-box" required>
                    <input type="text" id="region" placeholder="Région" class="input-box" required>
                    <select id="desireChild" class="input-box" required>
                        <option value="">Désir d'enfant ?</option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                    </select>
                    
                    <button type="submit" id="submitBtn" disabled class="btn-pink">S'inscrire</button>
                </form>
                
                <div class="test-buttons">
                    <button class="test-btn" onclick="simulateQR('AA','O+','1990-05-15')">AA/O+</button>
                    <button class="test-btn" onclick="simulateQR('AS','A+','1992-08-20')">AS/A+</button>
                    <button class="test-btn" onclick="simulateQR('SS','B-','1988-12-10')">SS/B-</button>
                </div>
                
                <a href="/" class="back-link">← Retour à l'accueil</a>
            </div>
        </div>
    </div>
    
    <script>
        // TON CODE DE SCAN - EXACTEMENT LE MÊME
        const scanner = new Html5Qrcode("reader");
        
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (text) => {
                document.getElementById('debug').style.display = 'block';
                document.getElementById('debugText').innerText = text;
                
                let nom = '', geno = '', gs = '', dob = '';
                
                if (text.includes('NOM:') && text.includes('GENO:') && text.includes('GS:')) {
                    const parts = text.split('|');
                    parts.forEach(p => {
                        if(p.startsWith('NOM:')) nom = p.split(':')[1];
                        if(p.startsWith('GENO:')) geno = p.split(':')[1];
                        if(p.startsWith('GS:')) gs = p.split(':')[1];
                        if(p.startsWith('DOB:')) dob = p.split(':')[1];
                    });
                }
                
                try {
                    const json = JSON.parse(text);
                    if (json.patientName) nom = json.patientName;
                    if (json.genotype) geno = json.genotype;
                    if (json.bloodGroup) gs = json.bloodGroup;
                    if (json.dateOfBirth) dob = json.dateOfBirth;
                } catch(e) {}
                
                if (nom && geno && gs) {
                    const parts = nom.split(' ');
                    document.getElementById('firstName').value = parts[0] || '';
                    document.getElementById('lastName').value = parts.slice(1).join(' ') || '';
                    document.getElementById('genotype').value = geno;
                    document.getElementById('bloodGroup').value = gs;
                    
                    if (dob) {
                        const date = new Date(dob);
                        document.getElementById('dobDay').value = date.getDate();
                        document.getElementById('dobMonth').value = date.getMonth() + 1;
                        document.getElementById('dobYear').value = date.getFullYear();
                        document.getElementById('dobDay').disabled = false;
                        document.getElementById('dobMonth').disabled = false;
                        document.getElementById('dobYear').disabled = false;
                    }
                    
                    document.getElementById('submitBtn').disabled = false;
                    scanner.stop();
                    document.getElementById('reader').style.display = 'none';
                    alert("✅ Scan réussi !");
                }
            },
            (error) => {}
        ).catch(err => {
            alert("❌ Erreur caméra: " + err);
        });

        function simulateQR(genotype, bloodGroup, dob) {
            document.getElementById('firstName').value = 'João';
            document.getElementById('lastName').value = 'Silva';
            document.getElementById('genotype').value = genotype;
            document.getElementById('bloodGroup').value = bloodGroup;
            
            const date = new Date(dob);
            document.getElementById('dobDay').value = date.getDate();
            document.getElementById('dobMonth').value = date.getMonth() + 1;
            document.getElementById('dobYear').value = date.getFullYear();
            document.getElementById('dobDay').disabled = false;
            document.getElementById('dobMonth').disabled = false;
            document.getElementById('dobYear').disabled = false;
            
            document.getElementById('submitBtn').disabled = false;
            scanner.stop();
            document.getElementById('reader').style.display = 'none';
        }

        document.getElementById('regForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const day = document.getElementById('dobDay').value;
            const month = document.getElementById('dobMonth').value;
            const year = document.getElementById('dobYear').value;
            
            if (!day || !month || !year) {
                alert("Veuillez remplir la date de naissance");
                return;
            }
            
            const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
            
            const data = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                dob: dob,
                genotype: document.getElementById('genotype').value,
                bloodGroup: document.getElementById('bloodGroup').value,
                residence: document.getElementById('residence').value,
                region: document.getElementById('region').value,
                desireChild: document.getElementById('desireChild').value,
                qrVerified: true
            };
            
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            if(res.ok) {
                alert("🎉 Compte créé !");
                window.location.href = '/profile';
            } else {
                alert("❌ Erreur");
            }
        };
    </script>
</body>
</html>`);
});

// ============================================
// PROFIL - POUR VOIR LES DONNÉES
// ============================================
app.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Mon Profil</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Mon Profil</h2>
            <div class="photo-circle" style="background-image:url('${user.photo || ''}');"></div>
            
            <div class="st-group">
                <div class="st-item"><span>Prénom</span><b>${user.firstName}</b></div>
                <div class="st-item"><span>Nom</span><b>${user.lastName}</b></div>
                <div class="st-item"><span>Génotype</span><b>${user.genotype}</b></div>
                <div class="st-item"><span>Groupe</span><b>${user.bloodGroup}</b></div>
                <div class="st-item"><span>Date naissance</span><b>${user.dob}</b></div>
                <div class="st-item"><span>Ville</span><b>${user.residence}</b></div>
                <div class="st-item"><span>Région</span><b>${user.region}</b></div>
                <div class="st-item"><span>Projet</span><b>${user.desireChild}</b></div>
            </div>
            
            ${user.qrVerified ? '<p style="color:#4caf50;">✅ Certifié par QR</p>' : ''}
            
            <a href="/" class="btn-dark">Accueil</a>
        </div>
    </div>
</body>
</html>`);
    } catch(error) {
        res.status(500).send('Erreur');
    }
});

// ============================================
// ROUTES API
// ============================================
app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ firstName: req.body.firstName }).sort({ createdAt: -1 });
        if (!user) return res.status(404).json({ error: "Non trouvé" });
        req.session.userId = user._id;
        await req.session.save();
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        req.session.userId = user._id;
        await req.session.save();
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Genlove démarré sur http://localhost:${port}`);
    console.log(`📱 Accueil: /`);
    console.log(`📱 Inscription QR: /signup-qr (LE CŒUR DE L'APP)`);
    console.log(`📱 Profil: /profile`);
});