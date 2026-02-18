const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = process.env.PORT || 3000;

// ============================================
// CONNEXION MONGODB
// ============================================
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';

mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ Connecté à MongoDB pour Genlove !");
        createIndexes();
    })
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// ============================================
// CRÉATION DES INDEX (Amendement VII)
// ============================================
async function createIndexes() {
    try {
        await mongoose.connection.collection('users').createIndex({ genotype: 1 });
        await mongoose.connection.collection('messages').createIndex({ senderId: 1, receiverId: 1, timestamp: -1 });
        console.log("✅ Index MongoDB créés avec succès");
    } catch (err) {
        console.log("⚠️ Index可能存在 déjà");
    }
}

// ============================================
// CONFIGURATION SESSION (Amendement II)
// ============================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'genlove-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: mongoURI,
        touchAfter: 24 * 3600
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// ============================================
// MODÈLES DE DONNÉES
// ============================================
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    genotype: { type: String, enum: ['AA', 'AS', 'SS'] },
    bloodGroup: String,
    desireChild: String,
    photo: String,
    isVerified: { type: Boolean, default: false }, // Amendement VIII
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de vérification d'authentification
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
};

const requireVerified = (req, res, next) => {
    if (!req.session.isVerified) {
        return res.redirect('/sas-validation');
    }
    next();
};

// ============================================
// STYLES CSS PARTAGÉS
// ============================================
const styles = `
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        margin: 0; 
        background: #fdf2f2; 
        display: flex; 
        justify-content: center; 
        min-height: 100vh;
    }
    .app-shell { 
        width: 100%; 
        max-width: 420px; 
        min-height: 100vh; 
        background: #f4e9da; 
        display: flex; 
        flex-direction: column; 
        box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        position: relative; 
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
        border-radius: 50px; 
        display: flex; 
        align-items: center; 
        gap: 10px; 
        transition: 0.5s; 
        z-index: 9999; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
        border-left: 5px solid #ff416c; 
    }
    #genlove-notify.show { top: 20px; }
    #loader { 
        display: none; 
        position: fixed; 
        inset: 0; 
        background: rgba(255,255,255,0.95); 
        z-index: 10000; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
    }
    .spinner { 
        width: 60px; 
        height: 60px; 
        border: 5px solid #f3f3f3; 
        border-top: 5px solid #ff416c; 
        border-radius: 50%; 
        animation: spin 1s linear infinite; 
        margin-bottom: 20px; 
    }
    @keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); } 
    }
    .home-screen { 
        flex: 1; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        padding: 30px; 
        text-align: center; 
        background: linear-gradient(135deg, #fff5f7 0%, #f4e9da 100%);
    }
    .logo-text { 
        font-size: 4rem; 
        font-weight: 800; 
        margin-bottom: 10px; 
        letter-spacing: -1px;
        text-shadow: 3px 3px 0 rgba(255,65,108,0.1);
    }
    .slogan { 
        font-weight: 600; 
        color: #1a2a44; 
        margin-bottom: 40px; 
        font-size: 1rem; 
        line-height: 1.6;
        padding: 0 20px;
    }
    .page-white { 
        background: white; 
        min-height: 100vh; 
        padding: 25px 20px; 
        text-align: center; 
    }
    .photo-circle { 
        width: 130px; 
        height: 130px; 
        border: 3px dashed #ff416c; 
        border-radius: 50%; 
        margin: 0 auto 20px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        cursor: pointer; 
        background-size: cover; 
        background-position: center; 
        transition: all 0.3s;
        overflow: hidden;
    }
    .input-box { 
        width: 100%; 
        padding: 15px; 
        border: 2px solid #e2e8f0; 
        border-radius: 15px; 
        margin-top: 12px; 
        font-size: 1rem; 
        background: #f8f9fa; 
        transition: all 0.3s;
    }
    .input-box:focus {
        border-color: #ff416c;
        outline: none;
        box-shadow: 0 0 0 3px rgba(255,65,108,0.1);
    }
    .serment-container { 
        margin-top: 25px; 
        padding: 20px; 
        background: #fff5f7; 
        border-radius: 15px; 
        border: 2px solid #ffdae0; 
        display: flex; 
        gap: 15px; 
        align-items: flex-start; 
    }
    .serment-text { 
        font-size: 0.85rem; 
        color: #1a2a44; 
        line-height: 1.5; 
    }
    .btn-pink { 
        background: #ff416c; 
        color: white; 
        padding: 18px 25px; 
        border-radius: 60px; 
        text-align: center; 
        text-decoration: none; 
        font-weight: 700; 
        font-size: 1.1rem; 
        display: block; 
        width: 85%; 
        margin: 20px auto; 
        border: none; 
        cursor: pointer; 
        transition: all 0.3s; 
        box-shadow: 0 10px 20px rgba(255,65,108,0.2);
    }
    .btn-pink:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 15px 25px rgba(255,65,108,0.3);
    }
    .btn-pink:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .btn-dark { 
        background: #1a2a44; 
        color: white; 
        padding: 18px 25px; 
        border-radius: 60px; 
        text-align: center; 
        text-decoration: none; 
        font-weight: 700; 
        font-size: 1.1rem; 
        display: block; 
        margin: 15px; 
        transition: all 0.3s;
        box-shadow: 0 10px 20px rgba(26,42,68,0.2);
    }
    .btn-action { 
        border: none; 
        border-radius: 25px; 
        padding: 10px 16px; 
        font-size: 0.85rem; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.2s; 
    }
    .btn-contact { 
        background: #ff416c; 
        color: white; 
    }
    .btn-contact:hover {
        background: #ff1f4f;
        transform: scale(1.02);
    }
    .btn-details { 
        background: #1a2a44; 
        color: white; 
    }
    .btn-block { 
        background: #dc3545; 
        color: white; 
    }
    #popup-overlay { 
        display: none; 
        position: fixed; 
        inset: 0; 
        background: rgba(0,0,0,0.8); 
        z-index: 10000; 
        align-items: center; 
        justify-content: center; 
        padding: 20px; 
        backdrop-filter: blur(5px);
    }
    .popup-content { 
        background: white; 
        border-radius: 30px; 
        width: 100%; 
        max-width: 380px; 
        padding: 30px 25px; 
        position: relative; 
        animation: slideUp 0.4s; 
        max-height: 90vh;
        overflow-y: auto;
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .close-popup { 
        position: absolute; 
        top: 15px; 
        right: 15px; 
        font-size: 1.8rem; 
        cursor: pointer; 
        color: #666; 
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #f0f0f0;
    }
    .st-group { 
        background: white; 
        border-radius: 20px; 
        margin: 0 15px 15px 15px; 
        overflow: hidden; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.03); 
    }
    .st-item { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 16px 20px; 
        border-bottom: 1px solid #f8f8f8; 
        color: #333; 
        font-size: 0.95rem; 
    }
    .st-item:last-child { border-bottom: none; }
    .switch { 
        position: relative; 
        display: inline-block; 
        width: 50px; 
        height: 24px; 
    }
    .switch input { 
        opacity: 0; 
        width: 0; 
        height: 0; 
    }
    .slider { 
        position: absolute; 
        cursor: pointer; 
        inset: 0; 
        background-color: #ccc; 
        transition: .4s; 
        border-radius: 24px; 
    }
    .slider:before { 
        position: absolute; 
        content: ""; 
        height: 18px; 
        width: 18px; 
        left: 3px; 
        bottom: 3px; 
        background-color: white; 
        transition: .4s; 
        border-radius: 50%; 
    }
    input:checked + .slider { 
        background-color: #ff416c; 
    }
    input:checked + .slider:before { 
        transform: translateX(26px); 
    }
    .match-card { 
        background: white; 
        margin: 15px; 
        padding: 20px; 
        border-radius: 25px; 
        display: flex; 
        align-items: center; 
        gap: 15px; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.03); 
        transition: all 0.3s;
        border: 1px solid rgba(255,65,108,0.1);
    }
    .match-photo-blur { 
        width: 70px; 
        height: 70px; 
        border-radius: 50%; 
        background: #f0f0f0; 
        filter: blur(5px); 
    }
    .end-overlay { 
        position: fixed; 
        inset: 0; 
        background: linear-gradient(135deg, #ff416c 0%, #1a2a44 100%); 
        z-index: 9999; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
    }
    .end-card { 
        background: white; 
        border-radius: 40px; 
        padding: 50px 30px; 
        width: 85%; 
        text-align: center; 
        box-shadow: 0 20px 40px rgba(0,0,0,0.2); 
    }
    .inbox-item { 
        background: white; 
        margin: 10px 15px; 
        padding: 18px; 
        border-radius: 20px; 
        display: flex; 
        align-items: center; 
        gap: 15px; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.03); 
        cursor: pointer; 
        transition: all 0.3s;
    }
    .chat-messages { 
        flex: 1; 
        padding: 20px; 
        background: #f5f7fb; 
        overflow-y: auto; 
        display: flex; 
        flex-direction: column; 
        gap: 10px; 
    }
    .bubble { 
        padding: 12px 18px; 
        border-radius: 20px; 
        max-width: 75%; 
        line-height: 1.4; 
        word-wrap: break-word;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .received { 
        background: white; 
        align-self: flex-start; 
        border-bottom-left-radius: 5px;
    }
    .sent { 
        background: #ff416c; 
        color: white; 
        align-self: flex-end; 
        border-bottom-right-radius: 5px;
    }
    .input-area { 
        padding: 15px 20px; 
        display: flex; 
        gap: 10px; 
        background: white; 
        border-top: 1px solid #eee; 
    }
    .chat-header { 
        background: #1a2a44; 
        color: white; 
        padding: 15px 20px; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .charte-box {
        height: 400px;
        overflow-y: auto;
        background: #fff5f7;
        border: 2px solid #ffdae0;
        border-radius: 20px;
        padding: 25px;
        font-size: 0.95rem;
        color: #1a2a44;
        line-height: 1.7;
        margin-bottom: 20px;
        text-align: left;
        scroll-behavior: smooth;
    }
    .charte-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px dashed #ffdae0;
    }
    .charte-section:last-child {
        border-bottom: none;
    }
    .charte-title {
        color: #ff416c;
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 10px;
    }
    .charte-subtitle {
        color: #1a2a44;
        font-size: 0.9rem;
        font-style: italic;
        margin-bottom: 10px;
        opacity: 0.8;
    }
    .scroll-indicator {
        text-align: center;
        color: #ff416c;
        font-size: 0.9rem;
        margin: 10px 0;
        padding: 10px;
        background: rgba(255,65,108,0.1);
        border-radius: 30px;
    }
    .danger-zone {
        border: 2px solid #dc3545;
        background: #fff5f5;
    }
    @media (max-width: 420px) {
        .app-shell { max-width: 100%; }
        .btn-pink, .btn-dark { width: 90%; padding: 16px 20px; }
    }
</style>
`;

// ============================================
// SCRIPT DE NOTIFICATION PARTAGÉ
// ============================================
const notifyScript = `
<script>
    function showNotify(msg, type = 'info') {
        const n = document.getElementById('genlove-notify');
        const m = document.getElementById('notify-msg');
        if(m) m.innerText = msg;
        if(n) {
            n.style.backgroundColor = type === 'success' ? '#4CAF50' : '#1a2a44';
            n.classList.add('show');
        }
        setTimeout(() => { 
            if(n) n.classList.remove('show'); 
        }, 3000);
    }
    function showLoader() { document.getElementById('loader').style.display = 'flex'; }
    function hideLoader() { document.getElementById('loader').style.display = 'none'; }
    window.addEventListener('online', () => showNotify('📶 Connecté', 'success'));
    window.addEventListener('offline', () => showNotify('📴 Hors ligne', 'error'));
</script>
`;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function calculerAge(dateNaissance) {
    if (!dateNaissance) return "??";
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function groupMessagesByDate(messages) {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;
    messages.forEach(msg => {
        const date = new Date(msg.timestamp).toLocaleDateString();
        if (date !== currentDate) {
            currentDate = date;
            currentGroup = { date: formatDateHeader(date), messages: [] };
            groups.push(currentGroup);
        }
        currentGroup.messages.push(msg);
    });
    return groups;
}

function formatDateHeader(dateStr) {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterday) return "Hier";
    return dateStr;
}

// ============================================
// ROUTES PRINCIPALES
// ============================================

// ACCUEIL
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Genlove - Rencontres Santé</title>${styles}</head>
<body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains 💑</div><div><p style="margin-bottom:15px;">Avez-vous déjà un compte ?</p><a href="/login" class="btn-dark">🔐 Se connecter</a><a href="/charte-engagement" class="btn-pink">✨ Créer un compte</a></div><div style="margin-top:30px; font-size:0.8rem; color:#666;">🛡️ Vos données de santé sont cryptées et confidentielles</div></div></div></body></html>`);
});

// CHARTE ENGAGEMENT avec scroll obligatoire (Amendement III)
app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Engagement Éthique - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2 style="color:#ff416c;">📜 La Charte d'Honneur</h2><p style="color:#1a2a44; margin-bottom:20px;">Lisez attentivement ces 5 engagements fondamentaux</p><div class="charte-box" id="charteBox" onscroll="checkScroll(this)"><div class="charte-section"><div class="charte-title">1. Le Serment de Sincérité</div><div class="charte-subtitle">Vérité Médicale</div><p>Je m'engage sur l'honneur à fournir des informations exactes concernant mon génotype et mes données de santé. Je comprends que la sincérité est le fondement de cette communauté pour protéger ma santé et celle de ma future descendance.</p></div><div class="charte-section"><div class="charte-title">2. Le Pacte de Confidentialité</div><div class="charte-subtitle">Secret Partagé</div><p>Je m'engage à garder strictement confidentielles toutes les informations personnelles et médicales auxquelles j'aurai accès lors de mes échanges. Aucune donnée consultée sur l'application ne doit être divulguée, capturée ou partagée à des tiers.</p></div><div class="charte-section"><div class="charte-title">3. Le Principe de Non-Discrimination</div><div class="charte-subtitle">Égalité de Respect</div><p>Je m'engage à traiter chaque membre avec dignité, quel que soit son génotype. Je comprends que Genlove est un espace d'inclusion où chaque personne, qu'elle soit AA, AS ou SS, a droit à l'amour et au respect sans aucun jugement.</p></div><div class="charte-section"><div class="charte-title">4. La Responsabilité Préventive</div><div class="charte-subtitle">Orientation Santé</div><p>J'accepte et je soutiens les mesures de protection de l'application (comme le filtrage des compatibilités à risque). Je reconnais que ces limites ne sont pas des exclusions, mais des guides responsables pour favoriser des unions sereines et durables.</p></div><div class="charte-section"><div class="charte-title">5. La Bienveillance Éthique</div><div class="charte-subtitle">Courtoisie</div><p>Je m'engage à adopter une conduite exemplaire et respectueuse dans mes messages. Je rejette toute forme de harcèlement ou de comportement inapproprié, veillant à ce que Genlove reste un environnement sûr et humain pour tous.</p></div></div><div class="scroll-indicator" id="scrollIndicator">⬇️ Faites défiler jusqu'en bas pour accepter ⬇️</div><button id="agreeBtn" class="btn-pink" onclick="acceptCharte()" disabled>J'ai compris et j'accepte</button><a href="/" style="display:block; margin-top:15px; color:#666; text-decoration:none;">← Retour</a></div></div><script>function checkScroll(el){if(el.scrollHeight-el.scrollTop<=el.clientHeight+5){document.getElementById('agreeBtn').disabled=false;document.getElementById('agreeBtn').style.opacity='1';document.getElementById('scrollIndicator').style.opacity='0';}}function acceptCharte(){if(!document.getElementById('agreeBtn').disabled){window.location.href='/signup';}}</script></body></html>`);
});

// INSCRIPTION
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Inscription - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2 style="color:#ff416c;">Créer mon profil</h2><p style="color:#666; margin-bottom:20px;">Toutes les informations sont confidentielles</p><form id="signupForm"><input type="text" name="firstName" class="input-box" placeholder="Prénom" required><input type="text" name="lastName" class="input-box" placeholder="Nom" required><select name="gender" class="input-box" required><option value="">Genre</option><option value="Homme">Homme</option><option value="Femme">Femme</option></select><input type="date" name="dob" class="input-box" required><input type="text" name="residence" class="input-box" placeholder="Ville de résidence" required><select name="genotype" class="input-box" required><option value="">Génotype</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select><select name="bloodGroup" class="input-box" required><option value="">Groupe sanguin</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select><select name="desireChild" class="input-box" required><option value="">Désir d'enfant ?</option><option value="Oui">Oui</option><option value="Non">Non</option></select><button type="submit" class="btn-pink">Créer mon profil</button></form><a href="/" style="display:block; margin-top:15px; color:#666; text-decoration:none;">← Retour</a></div></div><script>document.getElementById('signupForm').addEventListener('submit',async(e)=>{e.preventDefault();const formData=new FormData(e.target);const data=Object.fromEntries(formData);const res=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(res.ok){window.location.href='/sas-validation';}else{alert('Erreur lors de l\\'inscription');}});</script></body></html>`);
});

// SAS DE VALIDATION D'HONNEUR (Amendement VIII)
app.get('/sas-validation', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/');
    
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Validation d'Honneur - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><div style="font-size:4rem; margin-bottom:20px;">⚖️</div><h2 style="color:#ff416c;">Serment d'Honneur</h2><div style="background:#fff5f7; border-radius:20px; padding:25px; margin:20px 0; border:2px solid #ffdae0; text-align:left;"><p style="font-size:1rem; line-height:1.6; color:#1a2a44;"><strong>"Je confirme sur mon honneur que toutes les informations fournies, notamment mon génotype et mon groupe sanguin, sont sincères et conformes à la réalité. Je comprends l'importance de cette déclaration pour ma santé et celle de la communauté."</strong></p></div><div style="margin:30px 0;"><label style="display:flex; align-items:center; gap:15px; padding:15px; background:#f8f9fa; border-radius:15px;"><input type="checkbox" id="honorCheck" style="width:25px; height:25px; accent-color:#ff416c;"> <span style="color:#1a2a44; font-weight:500;">Je jure sur l'honneur que mes informations sont vraies</span></label></div><button id="validateBtn" class="btn-pink" onclick="validateHonor()" disabled>Afficher mon profil</button></div></div><script>document.getElementById('honorCheck').addEventListener('change',function(){document.getElementById('validateBtn').disabled=!this.checked;});async function validateHonor(){const res=await fetch('/api/validate-honor',{method:'POST'});if(res.ok){window.location.href='/profile';}}</script></body></html>`);
});

// PAGE DE CONNEXION (simplifiée pour la démo)
app.get('/login', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Connexion - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Connexion</h2><p style="color:#666; margin:20px;">Pour la démo, utilisez le bouton ci-dessous</p><a href="/profile" class="btn-pink">Accéder à mon profil</a><a href="/" class="btn-dark" style="margin-top:15px;">Retour</a></div></div></body></html>`);
});

// PROFIL (avec vérification session et validation)
app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/');
        }
        
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false });
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Mon Profil - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><a href="/" class="btn-dark" style="padding:8px 15px; margin:0;">Accueil</a><a href="/inbox" class="btn-pink" style="padding:8px 15px; margin:0; width:auto;">📬 ${unreadCount > 0 ? `<span style="background:white; color:#ff416c; padding:2px 8px; border-radius:20px; margin-left:5px;">${unreadCount}</span>` : ''}</a><a href="/settings" style="font-size:1.5rem; color:#1a2a44;">⚙️</a></div><div class="photo-circle" style="background-image:url('${user.photo || ''}'); border:3px solid #ff416c;"></div><h2>${user.firstName} ${user.lastName}</h2><p>📍 ${user.residence || 'Non précisée'} • ${user.gender}</p><div class="st-group"><div class="st-item"><span>🧬 Génotype</span><b>${user.genotype}</b></div><div class="st-item"><span>🩸 Groupe</span><b>${user.bloodGroup}</b></div><div class="st-item"><span>📅 Âge</span><b>${calculerAge(user.dob)} ans</b></div><div class="st-item"><span>👶 Projet</span><b>${user.desireChild}</b></div></div><a href="/matching" class="btn-pink">🔍 Trouver un partenaire</a><a href="/edit-profile" class="btn-dark">✏️ Modifier mon profil</a></div></div></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur profil");
    }
});

// ÉDITION DE PROFIL (Amendement IV)
app.get('/edit-profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Modifier profil - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Modifier mon profil</h2><form id="editForm"><input type="text" name="firstName" class="input-box" value="${user.firstName}" required><input type="text" name="lastName" class="input-box" value="${user.lastName}" required><select name="gender" class="input-box"><option value="Homme" ${user.gender === 'Homme' ? 'selected' : ''}>Homme</option><option value="Femme" ${user.gender === 'Femme' ? 'selected' : ''}>Femme</option></select><input type="date" name="dob" class="input-box" value="${user.dob}" required><input type="text" name="residence" class="input-box" value="${user.residence}" required><select name="genotype" class="input-box"><option value="AA" ${user.genotype === 'AA' ? 'selected' : ''}>AA</option><option value="AS" ${user.genotype === 'AS' ? 'selected' : ''}>AS</option><option value="SS" ${user.genotype === 'SS' ? 'selected' : ''}>SS</option></select><select name="bloodGroup" class="input-box">${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => `<option value="${g}" ${user.bloodGroup === g ? 'selected' : ''}>${g}</option>`).join('')}</select><select name="desireChild" class="input-box"><option value="Oui" ${user.desireChild === 'Oui' ? 'selected' : ''}>Oui</option><option value="Non" ${user.desireChild === 'Non' ? 'selected' : ''}>Non</option></select><button type="submit" class="btn-pink">Enregistrer</button></form><a href="/profile" class="btn-dark">Annuler</a></div></div><script>document.getElementById('editForm').addEventListener('submit',async(e)=>{e.preventDefault();const formData=new FormData(e.target);const data=Object.fromEntries(formData);const res=await fetch('/api/users/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(res.ok){window.location.href='/profile';}else{alert('Erreur');}});</script></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur édition");
    }
});

// MATCHING (avec filtrage génétique Amendement III et blocage Amendement V)
app.get('/matching', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        let query = { _id: { $ne: currentUser._id } };
        
        // Exclure les bloqués (Amendement V)
        if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
            query._id.$nin = currentUser.blockedUsers;
        }
        
        // Filtrer par genre opposé
        if (currentUser.gender === 'Homme') query.gender = 'Femme';
        else if (currentUser.gender === 'Femme') query.gender = 'Homme';
        
        let partners = await User.find(query);
        
        // Filtrage génétique (Amendement III)
        if (currentUser.genotype === 'SS') {
            partners = partners.filter(p => p.genotype === 'AA');
        } else if (currentUser.genotype === 'AS') {
            partners = partners.filter(p => p.genotype === 'AA');
        }
        
        const partnersHTML = partners.map(p => `
            <div class="match-card">
                <div class="match-photo-blur"></div>
                <div style="flex:1"><b>${p.firstName}</b><br><small>${p.genotype} • ${p.residence}</small></div>
                <button class="btn-action btn-contact" onclick="window.location.href='/chat?partnerId=${p._id}'">Contacter</button>
            </div>
        `).join('');
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Matching - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Partenaires compatibles</h2>${partnersHTML || '<p style="color:#666; padding:30px;">Aucun partenaire trouvé pour le moment</p>'}<a href="/profile" class="btn-pink">Retour au profil</a></div></div></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur matching");
    }
});

// INBOX (avec filtrage des bloqués - Amendement V)
app.get('/inbox', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const messages = await Message.find({ 
            $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }] 
        }).populate('senderId receiverId').sort({ timestamp: -1 });
        
        const conversations = new Map();
        for (const msg of messages) {
            const otherUser = msg.senderId._id.equals(currentUser._id) ? msg.receiverId : msg.senderId;
            
            // Vérifier si l'utilisateur n'est pas bloqué (Amendement V)
            if (currentUser.blockedUsers && currentUser.blockedUsers.includes(otherUser._id)) {
                continue; // Ignorer les conversations avec des bloqués
            }
            
            if (!conversations.has(otherUser._id.toString())) {
                conversations.set(otherUser._id.toString(), { user: otherUser, lastMessage: msg });
            }
        }
        
        const inboxHTML = Array.from(conversations.values()).map(conv => `
            <div class="inbox-item" onclick="window.location.href='/chat?partnerId=${conv.user._id}'">
                <div><b>${conv.user.firstName} ${conv.user.lastName}</b><br><small>${conv.lastMessage.text.substring(0,40)}...</small></div>
            </div>
        `).join('');
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Messages - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Boîte de réception</h2>${inboxHTML || '<p style="color:#666; padding:30px;">Aucune conversation</p>'}<a href="/profile" class="btn-pink">Retour</a></div></div></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur inbox");
    }
});

// CHAT
app.get('/chat', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const partnerId = req.query.partnerId;
        if (!partnerId) return res.redirect('/inbox');
        
        // Vérifier si le partenaire n'est pas bloqué
        if (currentUser.blockedUsers && currentUser.blockedUsers.includes(partnerId)) {
            return res.redirect('/inbox');
        }
        
        const partner = await User.findById(partnerId);
        if (!partner) return res.redirect('/inbox');
        
        const messages = await Message.find({
            $or: [
                { senderId: currentUser._id, receiverId: partnerId },
                { senderId: partnerId, receiverId: currentUser._id }
            ]
        }).sort({ timestamp: 1 });
        
        const messagesHTML = messages.map(m => `
            <div class="bubble ${m.senderId.equals(currentUser._id) ? 'sent' : 'received'}">${m.text}</div>
        `).join('');
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Chat avec ${partner.firstName}</title>${styles}</head>
<body><div class="app-shell"><div class="chat-header"><span><b>${partner.firstName}</b></span><button class="btn-action btn-block" onclick="blockUser('${partnerId}')">🚫 Bloquer</button><button onclick="window.location.href='/inbox'">❌</button></div><div class="chat-messages" id="messages">${messagesHTML}</div><div class="input-area"><input id="msgInput" class="input-box" placeholder="Écrivez votre message..." style="margin:0;"><button class="btn-contact" onclick="sendMessage('${partnerId}')">Envoyer</button></div></div><script>async function sendMessage(id){const msg=document.getElementById('msgInput');if(msg.value.trim()){await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({receiverId:id,text:msg.value})});location.reload();}}async function blockUser(id){if(confirm('Bloquer cet utilisateur ?')){await fetch('/api/block/'+id,{method:'POST'});window.location.href='/inbox';}}</script></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur chat");
    }
});

// PARAMÈTRES (avec zone de danger - Amendement VI)
app.get('/settings', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Paramètres - Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Paramètres</h2><div class="st-group"><div class="st-item">Visibilité du profil<input type="checkbox" checked></div><div class="st-item">Notifications push<input type="checkbox"></div></div><a href="/edit-profile" class="btn-dark">✏️ Modifier mon profil</a><a href="/blocked-list" class="btn-dark">🚫 Utilisateurs bloqués (${currentUser.blockedUsers?.length || 0})</a><div class="st-group danger-zone" style="margin-top:30px;"><div class="st-item" style="color:#dc3545;">⚠️ ZONE DE DANGER</div><div class="st-item"><span>🗑️ Supprimer mon compte</span><button class="btn-action btn-block" onclick="deleteAccount()">Supprimer</button></div></div><a href="/profile" class="btn-pink">Retour</a><a href="/logout-success" class="btn-dark" style="margin-top:10px;">Déconnexion</a></div></div><script>async function deleteAccount(){if(confirm('Êtes-vous ABSOLUMENT sûr ? Cette action est irréversible !')){if(confirm('Toutes vos données seront effacées. Confirmer ?')){await fetch('/api/delete-account',{method:'DELETE'});window.location.href='/logout-success';}}}</script></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur paramètres");
    }
});

// LISTE DES BLOQUÉS
app.get('/blocked-list', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId).populate('blockedUsers');
        
        const blockedHTML = (currentUser.blockedUsers || []).map(user => `
            <div class="inbox-item" style="justify-content:space-between;">
                <span><b>${user.firstName} ${user.lastName}</b></span>
                <button class="btn-action" onclick="unblockUser('${user._id}')" style="background:#4CAF50; color:white;">Débloquer</button>
            </div>
        `).join('');
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Utilisateurs bloqués</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Utilisateurs bloqués</h2>${blockedHTML || '<p>Aucun utilisateur bloqué</p>'}<a href="/settings" class="btn-pink">Retour</a></div></div><script>async function unblockUser(id){await fetch('/api/unblock/'+id,{method:'POST'});location.reload();}</script></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur");
    }
});

// FIN DE CHAT
app.get('/chat-end', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Merci</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2 style="color:#1a2a44;">Merci pour cet échange</h2><p style="margin:20px 0;">Genlove vous remercie pour ce moment de partage</p><a href="/matching" class="btn-pink">Nouvelle recherche</a></div></body></html>`);
});

// DÉCONNEXION
app.get('/logout-success', (req, res) => {
    req.session.destroy();
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Déconnecté</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2 style="color:#1a2a44;">Déconnexion réussie</h2><p style="margin:20px 0;">À bientôt sur Genlove !</p><a href="/" class="btn-pink">Accueil</a></div></body></html>`);
});

// ============================================
// ROUTES API
// ============================================

// ENREGISTREMENT (avec création de session - Amendement II)
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        
        // Créer la session
        req.session.userId = newUser._id;
        req.session.isVerified = false;
        
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// VALIDATION D'HONNEUR (Amendement VIII)
app.post('/api/validate-honor', requireAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, { isVerified: true });
        req.session.isVerified = true;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENVOI MESSAGE
app.post('/api/messages', requireAuth, requireVerified, async (req, res) => {
    try {
        const message = new Message({
            senderId: req.session.userId,
            receiverId: req.body.receiverId,
            text: req.body.text,
            read: false
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RÉCUPÉRATION MESSAGES
app.get('/api/messages', requireAuth, requireVerified, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.session.userId, receiverId: req.query.partnerId },
                { senderId: req.query.partnerId, receiverId: req.session.userId }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MARQUER COMME LU
app.post('/api/messages/read/:partnerId', requireAuth, requireVerified, async (req, res) => {
    try {
        await Message.updateMany(
            { senderId: req.params.partnerId, receiverId: req.session.userId, read: false },
            { read: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MESSAGES NON LUS
app.get('/api/messages/unread', requireAuth, requireVerified, async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiverId: req.session.userId, read: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BLOQUER UTILISATEUR
app.post('/api/block/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user.blockedUsers) user.blockedUsers = [];
        if (!user.blockedUsers.includes(req.params.userId)) {
            user.blockedUsers.push(req.params.userId);
            await user.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DÉBLOQUER UTILISATEUR
app.post('/api/unblock/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user.blockedUsers) {
            user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== req.params.userId);
            await user.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LISTE BLOQUÉS
app.get('/api/blocked-users', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('blockedUsers');
        res.json(user.blockedUsers || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MISE À JOUR PROFIL (Amendement IV)
app.put('/api/users/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const allowedUpdates = ['firstName', 'lastName', 'gender', 'dob', 'residence', 'genotype', 'bloodGroup', 'desireChild', 'photo'];
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        
        await User.findByIdAndUpdate(req.session.userId, updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SUGGESTIONS MATCHING
app.get('/api/matching/suggestions', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        
        let query = { _id: { $ne: req.session.userId } };
        if (currentUser.blockedUsers?.length) {
            query._id.$nin = currentUser.blockedUsers;
        }
        if (currentUser.gender === 'Homme') query.gender = 'Femme';
        else if (currentUser.gender === 'Femme') query.gender = 'Homme';
        
        let users = await User.find(query);
        
        // Filtrage génétique
        if (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') {
            users = users.filter(u => u.genotype === 'AA');
        }
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SUPPRIMER COMPTE (Amendement VI)
app.delete('/api/delete-account', requireAuth, requireVerified, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        // Supprimer tous les messages
        await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
        
        // Supprimer l'utilisateur
        await User.findByIdAndDelete(userId);
        
        // Détruire la session
        req.session.destroy();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// STATISTIQUES
app.get('/api/stats', requireAuth, requireVerified, async (req, res) => {
    try {
        const stats = {
            messages: await Message.countDocuments({ $or: [{ senderId: req.session.userId }, { receiverId: req.session.userId }] }),
            unread: await Message.countDocuments({ receiverId: req.session.userId, read: false }),
            blocked: (await User.findById(req.session.userId)).blockedUsers?.length || 0
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SANTÉ SERVEUR
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        session: req.session ? 'active' : 'inactive'
    });
});

// ============================================
// GESTION DES ERREURS 404
// ============================================
app.use((req, res) => {
    res.status(404).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404 - Genlove</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2 style="color:#1a2a44;">Page non trouvée</h2><p style="margin:20px;">La page que vous cherchez n'existe pas.</p><a href="/" class="btn-pink">Accueil</a></div></body></html>`);
});

// ============================================
// DÉMARRAGE SERVEUR
// ============================================
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Genlove démarré sur http://localhost:${port}`);
});

// GESTION ARRÊT PROPRE
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('✅ Déconnexion MongoDB');
        process.exit(0);
    });
});