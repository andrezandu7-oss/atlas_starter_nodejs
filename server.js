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
// STYLES CSS
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
    h2 { font-size: 2rem; margin-bottom: 20px; color: #1a2a44; }
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
        border-radius: 15px;
        overflow: hidden;
        margin: 15px 0;
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
    .test-btn:hover {
        background: #ff416c;
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
        font-size: 1rem;
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
    .info-message p {
        color: #0d47a1;
        font-size: 0.9rem;
        margin: 0;
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
        font-size: 1rem;
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
        line-height: 1.4;
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
    @media (max-width: 420px) {
        .btn-pink, .btn-dark { width: 95%; padding: 15px; }
    }
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
function vibrate(pattern) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
}
</script>
`;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function generateDateOptions(req, selectedDate = null) {
    const t = (key) => key;
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
// ROUTES
// ============================================

// ============================================
// ACCUEIL
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
        <div class="page-white" style="text-align: center;">
            <h2>Genlove</h2>
            <p>Unissez cœur et santé 💑</p>
            <a href="/signup-choice" class="btn-pink">Créer un compte</a>
            <a href="/login" class="btn-dark">Se connecter</a>
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
    <title>Login</title>
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
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({firstName: document.getElementById('firstName').value})
            });
            if(res.ok) window.location.href = '/profile';
            else alert('Utilisateur non trouvé');
        };
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
    <title>Choix inscription</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Créer mon compte</h2>
            <div style="display: flex; gap: 10px; margin: 20px 0;">
                <div style="flex:1; background: #1a2a44; color:white; padding:20px; border-radius:15px; text-align:center; cursor:pointer;" onclick="window.location.href='/signup-qr'">
                    <div style="font-size:2rem;">📱</div>
                    <h3>Avec certificat</h3>
                </div>
                <div style="flex:1; background: #f0f0f0; padding:20px; border-radius:15px; text-align:center; cursor:pointer;" onclick="window.location.href='/signup-manual'">
                    <div style="font-size:2rem;">📝</div>
                    <h3>Manuel</h3>
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
// INSCRIPTION QR - VERSION STABLE ANDROID
// ============================================
app.get('/signup-qr', (req, res) => {
    const datePicker = generateDateOptions(req);

    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription QR</title>
    ${styles}
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
</head>
<body>
<div class="app-shell">

<div id="loader">
    <div class="spinner"></div>
    <h3>Création de votre profil...</h3>
</div>

<div class="page-white">
    <h2>Inscription QR</h2>

    <div class="qr-scan-section">

        <button type="button" class="btn-dark" onclick="startCamera()">
            📷 Activer la caméra
        </button>

        <button type="button" class="btn-pink" onclick="stopCamera()" style="margin-top:10px;">
            🛑 Stop caméra
        </button>

        <div id="reader"></div>

        <div id="scan-status" style="margin-top:10px;"></div>

        <div class="debug-box" id="debug">
            <strong>Scan:</strong> <span id="debugText"></span>
        </div>

    </div>

<form id="signupForm">

<div class="photo-circle" id="photoCircle"
onclick="document.getElementById('photoInput').click()">
<span id="photoText">📷 Photo</span>
</div>

<input type="file" id="photoInput"
style="display:none"
accept="image/*"
onchange="previewPhoto(event)">

<div class="qr-fields">
<h3>Données du certificat</h3>
<input type="text" id="firstName" class="input-box" placeholder="Prénom" readonly>
<input type="text" id="lastName" class="input-box" placeholder="Nom" readonly>
<input type="text" id="genotype" class="input-box" placeholder="Génotype" readonly>
<input type="text" id="bloodGroup" class="input-box" placeholder="Groupe sanguin" readonly>
</div>

<input type="text" id="residence" class="input-box" placeholder="Ville" required>
<input type="text" id="region" class="input-box" placeholder="Région" required>

<select id="desireChild" class="input-box" required>
<option value="">Désir d'enfant ?</option>
<option value="Oui">Oui</option>
<option value="Non">Non</option>
</select>

<input type="hidden" id="qrVerified" value="false">
<input type="hidden" id="verifiedBy" value="">

<div class="serment-container">
<input type="checkbox" id="oath" required>
<label for="oath" class="serment-text">
Je confirme sur l'honneur que mes informations sont sincères
</label>
</div>

<button type="submit" class="btn-pink" id="submitBtn" disabled>
S'inscrire
</button>

</form>

<a href="/signup-choice" class="back-link">← Retour</a>
</div>
</div>

<script>
let photoBase64 = "";
let html5QrCode = null;
let cameraRunning = false;

async function startCamera() {
    try {
        if (cameraRunning) return;

        html5QrCode = new Html5Qrcode("reader");

        await html5QrCode.start(
            { facingMode: { exact: "environment" } },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess,
            onScanError
        );

        cameraRunning = true;
        document.getElementById("scan-status").innerHTML =
            "📷 Caméra activée";
    } catch (err) {
        console.error(err);
        document.getElementById("scan-status").innerHTML =
            "❌ Caméra bloquée. Vérifie HTTPS et permissions.";
    }
}

function onScanSuccess(decodedText) {

    document.getElementById("debug").style.display = "block";
    document.getElementById("debugText").innerText = decodedText;

    let nom="", geno="", gs="";

    if (decodedText.includes("NOM:")) {
        const parts = decodedText.split("|");
        parts.forEach(p => {
            if(p.startsWith("NOM:")) nom = p.split(":")[1];
            if(p.startsWith("GENO:")) geno = p.split(":")[1];
            if(p.startsWith("GS:")) gs = p.split(":")[1];
        });
    }

    try {
        const json = JSON.parse(decodedText);
        if(json.patientName) nom=json.patientName;
        if(json.genotype) geno=json.genotype;
        if(json.bloodGroup) gs=json.bloodGroup;
    } catch(e){}

    if(nom && geno && gs){

        const parts = nom.split(" ");
        document.getElementById("firstName").value = parts[0] || "";
        document.getElementById("lastName").value =
            parts.slice(1).join(" ") || "";

        document.getElementById("genotype").value = geno;
        document.getElementById("bloodGroup").value = gs;

        document.getElementById("qrVerified").value = "true";
        document.getElementById("verifiedBy").value = "QR Scan";

        document.getElementById("submitBtn").disabled = false;

        document.getElementById("scan-status").innerHTML =
            "✅ Scan réussi";

        stopCamera();
    } else {
        document.getElementById("scan-status").innerHTML =
            "❌ Format QR non reconnu";
    }
}

function onScanError(errorMessage) {
    // silence volontaire
}

async function stopCamera(){
    if(html5QrCode && cameraRunning){
        await html5QrCode.stop();
        await html5QrCode.clear();
        cameraRunning = false;

        document.getElementById("scan-status").innerHTML +=
            "<br>📴 Caméra arrêtée";
    }
}

function previewPhoto(e){
    const reader = new FileReader();
    reader.onload = function(){
        photoBase64 = reader.result;
        document.getElementById("photoCircle").style.backgroundImage =
            "url("+photoBase64+")";
        document.getElementById("photoText").style.display="none";
    };
    reader.readAsDataURL(e.target.files[0]);
}

document.getElementById("signupForm")
.addEventListener("submit", async function(e){

    e.preventDefault();
    document.getElementById("loader").style.display="flex";

    const userData={
        firstName:document.getElementById("firstName").value,
        lastName:document.getElementById("lastName").value,
        gender:"Non spécifié",
        dob:"2000-01-01",
        residence:document.getElementById("residence").value,
        region:document.getElementById("region").value,
        genotype:document.getElementById("genotype").value,
        bloodGroup:document.getElementById("bloodGroup").value,
        desireChild:document.getElementById("desireChild").value,
        photo:photoBase64||"",
        language:"fr",
        isPublic:true,
        qrVerified:true,
        verifiedBy:"QR Scan",
        verificationBadge:"lab"
    };

    const res=await fetch("/api/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(userData)
    });

    setTimeout(()=>{
        document.getElementById("loader").style.display="none";
        if(res.ok) window.location.href="/profile";
        else alert("Erreur inscription");
    },1500);
});
</script>

</body>
</html>`);
});
// ============================================
// INSCRIPTION MANUELLE
// ============================================
app.get('/signup-manual', (req, res) => {
    const datePicker = generateDateOptions(req);
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Inscription manuelle</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div id="loader">
            <div class="spinner"></div>
            <h3>Création...</h3>
        </div>
        
        <div class="page-white">
            <h2>Inscription</h2>
            
            <div class="info-message">
                <span class="info-icon">📍</span>
                <p>Aider les personnes proches à vous contacter</p>
            </div>
            
            <form id="signupForm">
                <div class="photo-circle" id="photoCircle" onclick="document.getElementById('photoInput').click()">
                    <span id="photoText">📷 Photo</span>
                </div>
                <input type="file" id="photoInput" style="display:none" onchange="previewPhoto(event)" accept="image/*">
                
                <input type="text" id="firstName" class="input-box" placeholder="Prénom" required>
                <input type="text" id="lastName" class="input-box" placeholder="Nom" required>
                
                <select id="gender" class="input-box" required>
                    <option value="">Genre</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                </select>
                
                ${datePicker}
                
                <input type="text" id="residence" class="input-box" placeholder="Ville" required>
                <input type="text" id="region" class="input-box" placeholder="Région" required>
                
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
                
                <select id="desireChild" class="input-box" required>
                    <option value="">Désir d'enfant ?</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                </select>
                
                <div class="serment-container">
                    <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                    <label for="oath" class="serment-text">Je confirme sur l'honneur que mes informations sont sincères</label>
                </div>
                
                <button type="submit" class="btn-pink">S'inscrire</button>
            </form>
            
            <a href="/signup-choice" class="back-link">← Retour</a>
        </div>
    </div>
    
    <script>
        let photoBase64 = "";
        
        function previewPhoto(e) {
            const reader = new FileReader();
            reader.onload = function() {
                photoBase64 = reader.result;
                document.getElementById('photoCircle').style.backgroundImage = 'url(' + photoBase64 + ')';
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
            
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
            
            setTimeout(() => {
                document.getElementById('loader').style.display = 'none';
                if (res.ok) window.location.href = '/profile';
                else alert("Erreur");
            }, 2000);
        });
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
            '<span class="verified-badge">✅ Certifié</span>' : 
            '<span class="unverified-badge">📝 Non certifié</span>';
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Profil</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <div class="photo-circle" style="background-image:url('${user.photo || ''}');"></div>
            <h2>${user.firstName} ${user.lastName}</h2>
            <p>${badge}</p>
            <p>${user.residence} • ${user.region}</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 10px;">
                <p><strong>Génotype:</strong> ${user.genotype}</p>
                <p><strong>Groupe sanguin:</strong> ${user.bloodGroup}</p>
            </div>
            
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
// API
// ============================================

app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ firstName: req.body.firstName });
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
});