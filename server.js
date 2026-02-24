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
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

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
// MODÈLES DE DONNÉES
// ========================
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    region: { type: String, default: '' },
    genotype: { type: String, enum: ['AA', 'AS', 'SS'] },
    bloodGroup: String,
    desireChild: String,
    photo: String,
    language: { type: String, default: 'fr' },
    isVerified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rejectedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    
    // QR Code fields
    qrVerified: { type: Boolean, default: false },
    verifiedBy: String,
    verifiedAt: Date,
    verificationBadge: { type: String, enum: ['none', 'self', 'lab'], default: 'none' }
});

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

const requestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    viewed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', requestSchema);

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/');
    next();
};

// ============================================
// STYLES CSS - NOTRE DESIGN
// ============================================
const styles = `
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
        background: #fdf2f2;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        font-size: 16px;
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
        font-size: 2rem;
        margin-bottom: 20px;
        color: #1a2a44;
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
        transition: all 0.3s;
    }
    .btn-pink {
        background: #ff416c;
        color: white;
        box-shadow: 0 10px 20px rgba(255,65,108,0.3);
    }
    .btn-dark {
        background: #1a2a44;
        color: white;
        box-shadow: 0 10px 20px rgba(26,42,68,0.3);
    }
    .input-box {
        width: 100%;
        padding: 14px;
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        margin: 8px 0;
        font-size: 1rem;
        background: #f8f9fa;
        transition: all 0.3s;
    }
    .input-box:focus {
        border-color: #ff416c;
        outline: none;
    }
    .input-label {
        text-align: left;
        font-size: 0.9rem;
        color: #1a2a44;
        margin-top: 10px;
        font-weight: 600;
    }
    input[readonly] {
        background: #f0f0f0;
        border-color: #4caf50;
        color: #333;
    }
    .photo-circle {
        width: 110px;
        height: 110px;
        border: 4px solid #ff416c;
        border-radius: 50%;
        margin: 15px auto;
        background-size: cover;
        background-position: center;
        box-shadow: 0 10px 25px rgba(255,65,108,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    
    /* Styles pour QR - inspirés de ton code */
    .qr-scan-section {
        background: #1a2a44;
        color: white;
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
        text-align: center;
    }
    #reader {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 20px;
        background: #000;
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
    .test-buttons {
        display: flex;
        gap: 10px;
        margin: 15px 0;
    }
    .test-btn {
        flex: 1;
        background: #1a2a44;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 30px;
        cursor: pointer;
        font-weight: bold;
    }
    .qr-link {
        text-align: center;
        margin: 15px 0;
        color: #ff416c;
        display: block;
    }
    .qr-fields {
        background: #e8f5e9;
        padding: 15px;
        border-radius: 10px;
        margin: 15px 0;
    }
    .qr-fields h3 {
        color: #2e7d32;
        margin-bottom: 10px;
    }
    .info-message {
        background: #e3f2fd;
        padding: 15px;
        border-radius: 10px;
        margin: 15px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        border-left: 5px solid #2196f3;
    }
    .info-icon {
        font-size: 1.5rem;
    }
    .manual-fields {
        background: #fff3e0;
        padding: 15px;
        border-radius: 10px;
        margin: 15px 0;
    }
    .manual-fields h3 {
        color: #bf360c;
        margin-bottom: 10px;
    }
    .serment-container {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 12px;
        border: 1px solid #ffdae0;
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin: 10px 0;
    }
    .serment-text {
        font-size: 0.85rem;
        color: #d63384;
    }
    #loader {
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 20000;
        text-align: center;
    }
    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #ff416c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .back-link {
        display: inline-block;
        margin: 15px 0;
        color: #666;
        text-decoration: none;
    }
    .verified-badge {
        background: #4caf50;
        color: white;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        display: inline-block;
    }
    .unverified-badge {
        background: #ff9800;
        color: white;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        display: inline-block;
    }
    .choice-buttons {
        display: flex;
        gap: 10px;
        margin: 20px 0;
    }
    .choice-btn {
        flex: 1;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        cursor: pointer;
        transition: transform 0.3s;
    }
    .choice-btn.qr {
        background: #1a2a44;
        color: white;
    }
    .choice-btn.manual {
        background: #f0f0f0;
        color: #333;
    }
    .choice-btn:hover {
        transform: translateY(-3px);
    }
    .custom-date-picker {
        display: flex;
        gap: 5px;
        margin: 10px 0;
    }
    .date-part {
        flex: 1;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 15px;
    }
    #genlove-notify {
        position: fixed;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 380px;
        background: #1a2a44;
        color: white;
        padding: 15px 20px;
        border-radius: 60px;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: 0.5s;
        z-index: 9999;
        border-left: 5px solid #ff416c;
    }
    #genlove-notify.show { top: 20px; }
</style>
`;

// ============================================
// NOTIFICATION SCRIPT
// ============================================
const notifyScript = `
<script>
function showNotify(msg, type) {
    const n = document.getElementById('genlove-notify');
    const m = document.getElementById('notify-msg');
    if(m) m.innerText = msg;
    if(n) {
        n.style.backgroundColor = type === 'success' ? '#4CAF50' : '#1a2a44';
        n.classList.add('show');
    }
    setTimeout(() => n.classList.remove('show'), 3000);
}
</script>
`;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function generateDateOptions(selectedDate = null) {
    const currentYear = new Date().getFullYear();
    const selected = selectedDate ? new Date(selectedDate) : null;
    
    let html = '<div class="custom-date-picker">';
    
    html += '<select name="day" class="date-part" required><option value="">Jour</option>';
    for (let d = 1; d <= 31; d++) {
        const sel = (selected && selected.getDate() === d) ? 'selected' : '';
        html += `<option value="${d}" ${sel}>${d}</option>`;
    }
    html += '</select>';
    
    html += '<select name="month" class="date-part" required><option value="">Mois</option>';
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    for (let m = 0; m < 12; m++) {
        const monthVal = m + 1;
        const sel = (selected && selected.getMonth() === m) ? 'selected' : '';
        html += `<option value="${monthVal}" ${sel}>${months[m]}</option>`;
    }
    html += '</select>';
    
    html += '<select name="year" class="date-part" required><option value="">Année</option>';
    for (let y = currentYear - 100; y <= currentYear - 18; y++) {
        const sel = (selected && selected.getFullYear() === y) ? 'selected' : '';
        html += `<option value="${y}" ${sel}>${y}</option>`;
    }
    html += '</select></div>';
    
    return html;
}

// ============================================
// ACCUEIL - NOTRE DESIGN
// ============================================
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>Genlove - Accueil</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="home-screen" style="text-align: center; padding: 50px 20px;">
            <div class="logo-text" style="font-size: 3rem; font-weight: 800;">
                <span style="color:#1a2a44;">Gen</span><span style="color:#FF69B4;">love</span>
            </div>
            <div class="slogan" style="margin: 20px 0; color: #666;">
                Unissez cœur et santé pour un avenir serein 💑
            </div>
            <a href="/signup-choice" class="btn-dark">Créer un compte</a>
            <a href="/login" class="btn-pink">Se connecter</a>
            <div style="margin-top:30px; font-size:0.8rem; color:#999;">🛡️ Données de santé cryptées</div>
        </div>
    </div>
</body>
</html>`);
});

// ============================================
// LOGIN
// ============================================
app.get('/login', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>Genlove - Connexion</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Connexion</h2>
            <form id="loginForm">
                <input type="text" id="firstName" class="input-box" placeholder="Votre prénom" required>
                <button type="submit" class="btn-pink">Se connecter</button>
            </form>
            <a href="/" class="back-link">← Retour à l'accueil</a>
        </div>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({firstName})
            });
            if (res.ok) window.location.href = '/profile';
            else alert('Prénom non trouvé');
        });
    </script>
</body>
</html>`);
});

// ============================================
// CHOIX D'INSCRIPTION
// ============================================
app.get('/signup-choice', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>Genlove - Inscription</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Créer mon compte</h2>
            <p style="margin-bottom: 30px;">Choisissez votre méthode d'inscription</p>
            
            <div class="choice-buttons">
                <div class="choice-btn qr" onclick="window.location.href='/signup-qr'">
                    <div style="font-size: 2rem;">📱</div>
                    <h3>Avec certificat médical</h3>
                    <p style="font-size: 0.9rem;">Scan automatique de vos données</p>
                </div>
                <div class="choice-btn manual" onclick="window.location.href='/signup-manual'">
                    <div style="font-size: 2rem;">📝</div>
                    <h3>Manuellement</h3>
                    <p style="font-size: 0.9rem;">Saisie libre de vos informations</p>
                </div>
            </div>
            
            <a href="/" class="back-link">← Retour</a>
        </div>
    </div>
</body>
</html>`);
});

// ============================================
// ============================================
// ============================================
// INSCRIPTION QR - LECTURE SEULE - CAMÉRA FIXE
// ============================================
app.get('/signup-qr', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Genlove - Scan QR Certificat</title>
    ${styles}
    ${notifyScript}
    <!-- Bibliothèque QR MINIMALISTE -->
    <script src="https://unpkg.com/@zxing/library@0.20.2/umd/index.min.js"></script>
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>📸 Scan certificat</h2>
            
            <!-- CAMÉRA UNIQUEMENT -->
            <div class="qr-scan-section" style="text-align:center;">
                <div style="font-size:3rem;margin-bottom:10px;">📱</div>
                <h3 style="color:white;">Pointez votre QR code</h3>
                
                <!-- VIDEO STREAM -->
                <video id="video" style="width:100%;max-height:300px;border-radius:15px;display:none;" autoplay playsinline></video>
                
                <!-- CANVAS INVISIBLE -->
                <canvas id="canvas" style="display:none;"></canvas>
                
                <div id="status" style="margin:20px 0;font-size:1.1rem;font-weight:bold;"></div>
            </div>
            
            <!-- RÉSULTAT AUTOMATIQUE -->
            <form id="formResult" style="display:none;">
                <div class="qr-fields">
                    <h3>✅ Données lues</h3>
                    <input type="text" id="firstName" class="input-box" placeholder="Prénom" readonly required>
                    <input type="text" id="lastName" class="input-box" placeholder="Nom" readonly required>
                    <input type="text" id="genotype" class="input-box" placeholder="Génotype" readonly required>
                    <input type="text" id="bloodGroup" class="input-box" placeholder="Groupe sanguin" readonly required>
                </div>
                
                <!-- LOCALISATION UNIQUEMENT -->
                <div style="margin:20px 0;">
                    <input type="text" id="residence" class="input-box" placeholder="Ville" required>
                    <input type="text" id="region" class="input-box" placeholder="Région" required>
                    <select id="desireChild" class="input-box" required>
                        <option value="">Désir d'enfant ?</option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                    </select>
                </div>
                
                <input type="hidden" id="qrVerified" value="true">
                <input type="hidden" id="verifiedBy" value="QR Scan">
                
                <button type="submit" class="btn-pink" style="width:100%;">✅ S'inscrire</button>
            </form>
            
            <!-- BOUTONS TEST UNIQUEMENT -->
            <div class="test-buttons" style="margin:20px 0;">
                <button class="test-btn" onclick="testQR('AA','O+')">Test AA/O+</button>
                <button class="test-btn" onclick="testQR('AS','A+')">Test AS/A+</button>
            </div>
            
            <a href="/signup-choice" style="display:block;text-align:center;color:#666;margin-top:20px;">← Manuel</a>
        </div>
    </div>
    
    <script>
        let stream = null;
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const status = document.getElementById('status');
        
        // === DÉMARRAGE CAMÉRA ===
        async function startCamera() {
            try {
                status.textContent = '🔄 Demande caméra...';
                status.style.color = '#ff9800';
                
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                
                video.srcObject = stream;
                video.style.display = 'block';
                status.textContent = '🎥 Caméra OK - Scan auto';
                status.style.color = '#4caf50';
                
                // SCAN CONTINU
                requestAnimationFrame(scanQR);
                
            } catch(err) {
                status.textContent = '❌ Caméra refusée';
                status.style.color = '#f44336';
                console.error(err);
            }
        }
        
        // === SCAN QR ===
        async function scanQR() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const codeReader = new ZXing.BrowserMultiFormatReader();
                    const result = await codeReader.decodeFromImageData(imageData);
                    
                    if (result) {
                        parseQR(result.text);
                        return; // STOP SCAN
                    }
                } catch(e) {
                    // Continue scanning
                }
            }
            
            if (document.getElementById('formResult').style.display !== 'block') {
                requestAnimationFrame(scanQR);
            }
        }
        
        // === PARSER QR ===
        function parseQR(text) {
            console.log('QR lu:', text);
            
            let nom = '', geno = '', gs = '';
            
            // Format 1: NOM:xxx|GENO:xxx|GS:xxx
            const nomMatch = text.match(/NOM:([^|]+)/i);
            const genoMatch = text.match(/GENO:([^|]+)/i);
            const gsMatch = text.match(/GS:([^|]+)/i);
            
            if (nomMatch) nom = nomMatch[1].trim();
            if (genoMatch) geno = genoMatch[1].trim().toUpperCase();
            if (gsMatch) gs = gsMatch[1].trim().toUpperCase();
            
            // Format 2: JSON
            try {
                const json = JSON.parse(text);
                nom = json.patientName || json.nom || nom;
                geno = (json.genotype || json.geno || geno).toUpperCase();
                gs = (json.bloodGroup || json.gs || json.sanguin || gs).toUpperCase();
            } catch(e) {}
            
            // Validation stricte
            if (nom && geno && gs && ['AA','AS','SS'].includes(geno)) {
                const noms = nom.split(' ');
                document.getElementById('firstName').value = noms[0] || 'User';
                document.getElementById('lastName').value = noms.slice(1).join(' ') || 'Certifié';
                document.getElementById('genotype').value = geno;
                document.getElementById('bloodGroup').value = gs;
                
                // Affiche formulaire
                document.getElementById('formResult').style.display = 'block';
                video.style.display = 'none';
                status.textContent = '✅ Données lues ! Complétez';
                status.style.color = '#4caf50';
                
                stopCamera();
            } else {
                status.textContent = '❌ QR invalide';
                status.style.color = '#f44336';
            }
        }
        
        // === STOP CAMÉRA ===
        function stopCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
        }
        
        // === TEST ===
        function testQR(geno, gs) {
            parseQR(`NOM:João Silva|GENO:${geno}|GS:${gs}`);
        }
        
        // === SUBMIT ===
        document.getElementById('formResult').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                genotype: document.getElementById('genotype').value,
                bloodGroup: document.getElementById('bloodGroup').value,
                residence: document.getElementById('residence').value,
                region: document.getElementById('region').value,
                desireChild: document.getElementById('desireChild').value,
                qrVerified: true,
                verifiedBy: 'QR Scan ' + new Date().toLocaleDateString('fr'),
                verificationBadge: 'lab'
            };
            
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                
                const result = await res.json();
                if (result.success) {
                    showNotify('✅ Inscription réussie !');
                    setTimeout(() => location.href = '/profile', 1500);
                }
            } catch(err) {
                showNotify('❌ Erreur serveur');
            }
        });
        
        // === START ===
        window.addEventListener('load', startCamera);
        window.addEventListener('beforeunload', stopCamera);
    </script>
</body>
</html>`);
});
// ============================================
// INSCRIPTION MANUELLE
// ============================================
app.get('/signup-manual', (req, res) => {
    const datePicker = generateDateOptions();
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>Genlove - Inscription manuelle</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div id="loader">
            <div class="spinner"></div>
            <h3>Création de votre profil...</h3>
        </div>
        
        <div class="page-white">
            <h2>Inscription manuelle</h2>
            
            <div class="info-message">
                <span class="info-icon">📍</span>
                <p>Aider les personnes proches de chez vous à vous contacter facilement</p>
            </div>
            
            <form id="signupForm">
                <div class="photo-circle" id="photoCircle" onclick="document.getElementById('photoInput').click()">
                    <span id="photoText">📷 Photo</span>
                </div>
                <input type="file" id="photoInput" style="display:none" onchange="previewPhoto(event)" accept="image/*">
                
                <div class="input-label">Prénom</div>
                <input type="text" id="firstName" class="input-box" placeholder="Prénom" required>
                
                <div class="input-label">Nom</div>
                <input type="text" id="lastName" class="input-box" placeholder="Nom" required>
                
                <div class="input-label">Genre</div>
                <select id="gender" class="input-box" required>
                    <option value="">Genre</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                </select>
                
                <div class="input-label">Date de naissance</div>
                ${datePicker}
                
                <div class="input-label">Ville</div>
                <input type="text" id="residence" class="input-box" placeholder="Ville" required>
                
                <div class="input-label">Région</div>
                <input type="text" id="region" class="input-box" placeholder="Région" required>
                
                <div class="input-label">Génotype</div>
                <select id="genotype" class="input-box" required>
                    <option value="">Génotype</option>
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                </select>
                
                <div style="display:flex; gap:10px;">
                    <select id="bloodType" class="input-box" style="flex:2;" required>
                        <option value="">Groupe</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>
                    <select id="bloodRh" class="input-box" style="flex:1;" required>
                        <option value="+">+</option>
                        <option value="-">-</option>
                    </select>
                </div>
                
                <div class="input-label">Désir d'enfant</div>
                <select id="desireChild" class="input-box" required>
                    <option value="">Désir d'enfant ?</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                </select>
                
                <input type="hidden" id="qrVerified" value="false">
                
                <div class="serment-container">
                    <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                    <label for="oath" class="serment-text">Je confirme sur mon honneur que mes informations sont sincères et conformes à la réalité.</label>
                </div>
                
                <button type="submit" class="btn-pink">S'inscrire</button>
            </form>
            
            <div style="text-align: center;">
                <a href="/signup-qr" class="back-link">📱 Inscription avec QR</a>
            </div>
            <a href="/signup-choice" class="back-link">← Retour au choix</a>
        </div>
    </div>
    
    <script>
        let photoBase64 = "";
        
        function previewPhoto(e) {
            const reader = new FileReader();
            reader.onload = function() {
                photoBase64 = reader.result;
                document.getElementById('photoCircle').style.backgroundImage = 'url(' + photoBase64 + ')';
                document.getElementById('photoCircle').style.backgroundSize = 'cover';
                document.getElementById('photoText').style.display = 'none';
            };
            reader.readAsDataURL(e.target.files[0]);
        }

        document.getElementById('signupForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            document.getElementById('loader').style.display = 'flex';
            
            const day = document.querySelector('select[name="day"]').value;
            const month = document.querySelector('select[name="month"]').value;
            const year = document.querySelector('select[name="year"]').value;
            
            if (!day || !month || !year) {
                alert('Date de naissance requise');
                document.getElementById('loader').style.display = 'none';
                return;
            }
            
            const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
            
            const userData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                gender: document.getElementById('gender').value,
                dob: dob,
                residence: document.getElementById('residence').value,
                region: document.getElementById('region').value,
                genotype: document.getElementById('genotype').value,
                bloodGroup: document.getElementById('bloodType').value + document.getElementById('bloodRh').value,
                desireChild: document.getElementById('desireChild').value,
                photo: photoBase64 || "",
                language: 'fr',
                isPublic: true,
                qrVerified: false,
                verificationBadge: 'self'
            };
            
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(userData)
                });
                
                const data = await res.json();
                
                setTimeout(() => {
                    document.getElementById('loader').style.display = 'none';
                    if (data.success) {
                        window.location.href = '/profile';
                    } else {
                        alert("Erreur: " + (data.error || "Inconnue"));
                    }
                }, 2000);
            } catch(error) {
                document.getElementById('loader').style.display = 'none';
                alert("Erreur de connexion");
            }
        });
    </script>
</body>
</html>`);
});

// ============================================
// GÉNÉRATEUR DE QR CODE
// ============================================
app.get('/generator', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Générateur QR - Genlove</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f4e9da;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 400px;
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1a2a44;
            text-align: center;
        }
        select, button {
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            border: 2px solid #e2e8f0;
            border-radius: 15px;
        }
        button {
            background: #ff416c;
            color: white;
            border: none;
            font-weight: bold;
            cursor: pointer;
        }
        #qrcode {
            display: flex;
            justify-content: center;
            margin: 20px 0;
        }
        .back-link {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
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
            <option value="O-">O-</option>
            <option value="A-">A-</option>
            <option value="B-">B-</option>
            <option value="AB-">AB-</option>
        </select>
        
        <button onclick="generateQR()">Générer QR code</button>
        
        <div id="qrcode"></div>
        
        <a href="/signup-qr" class="back-link">← Retour à l'inscription</a>
    </div>
    
    <script>
        function generateQR() {
            const data = "NOM:João Silva|GENO:" + document.getElementById('genotype').value + "|GS:" + document.getElementById('bloodGroup').value;
            
            QRCode.toCanvas(document.createElement('canvas'), data, { width: 250 }, (err, canvas) => {
                if (err) {
                    alert('Erreur: ' + err);
                    return;
                }
                document.getElementById('qrcode').innerHTML = '';
                document.getElementById('qrcode').appendChild(canvas);
            });
        }
    </script>
</body>
</html>`);
});

// ============================================
// PROFIL
// ============================================
app.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const badge = user.qrVerified ? 
            '<span class="verified-badge">✅ Certifié par laboratoire</span>' : 
            '<span class="unverified-badge">📝 Auto-déclaré</span>';
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>Genlove - Profil</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <div class="photo-circle" style="background-image:url('${user.photo || ''}');"></div>
            
            <h2 style="text-align: center;">${user.firstName} ${user.lastName}</h2>
            <p style="text-align: center; margin: 5px 0;">${badge}</p>
            <p style="text-align: center;">${user.residence || ''} • ${user.region || ''}</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                <p><strong>Génotype:</strong> ${user.genotype}</p>
                <p><strong>Groupe sanguin:</strong> ${user.bloodGroup}</p>
                <p><strong>Projet:</strong> ${user.desireChild === 'Oui' ? 'Désire des enfants' : 'Ne désire pas d\'enfants'}</p>
            </div>
            
            <a href="/" class="btn-dark">Accueil</a>
        </div>
    </div>
</body>
</html>`);
    } catch(error) {
        res.status(500).send('Erreur profil');
    }
});

// ============================================
// ROUTES API
// ============================================

app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ firstName: req.body.firstName }).sort({ createdAt: -1 });
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
        
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
    console.log(`📱 Routes:`);
    console.log(`   - Accueil: /`);
    console.log(`   - Choix inscription: /signup-choice`);
    console.log(`   - Inscription QR: /signup-qr`);
    console.log(`   - Inscription manuelle: /signup-manual`);
    console.log(`   - Générateur QR: /generator`);
    console.log(`   - Login: /login`);
    console.log(`   - Profil: /profile`);
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('📦 Déconnexion MongoDB');
        process.exit(0);
    });
});