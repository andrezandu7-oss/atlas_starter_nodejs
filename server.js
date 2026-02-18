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
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// ============================================
// CONFIGURATION SESSION
// ============================================
app.set('trust proxy', 1);

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'genlove-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: mongoURI,
        touchAfter: 24 * 3600
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    },
    proxy: true
};

app.use(session(sessionConfig));

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
    isVerified: { type: Boolean, default: false },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Effet miroir
    createdAt: { type: Date, default: Date.now }
});

userSchema.index({ genotype: 1 });
const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
const Message = mongoose.model('Message', messageSchema);

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
// STYLES CSS
// ============================================
const styles = `
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: 'Segoe UI', Roboto, system-ui, -apple-system, sans-serif; 
        margin: 0; 
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
        position: relative;
        margin: 0 auto;
    }
    
    h1 { font-size: 2.4rem; margin: 10px 0; }
    h2 { font-size: 2rem; margin-bottom: 20px; color: #1a2a44; }
    h3 { font-size: 1.6rem; margin: 15px 0; }
    p { font-size: 1.2rem; line-height: 1.6; }
    
    .logo-text { 
        font-size: 5rem; 
        font-weight: 800; 
        margin: 20px 0; 
        letter-spacing: -2px;
        text-shadow: 4px 4px 0 rgba(255,65,108,0.1);
        text-align: center;
    }
    
    .slogan { 
        font-weight: 500; 
        color: #1a2a44; 
        margin: 20px 25px 40px; 
        font-size: 1.3rem; 
        line-height: 1.7;
        text-align: center;
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
    
    .page-white { 
        background: white; 
        min-height: 100vh; 
        padding: 30px 25px; 
        text-align: center; 
        display: flex;
        flex-direction: column;
    }
    
    .btn-pink, .btn-dark { 
        padding: 20px 25px; 
        border-radius: 60px; 
        font-size: 1.3rem; 
        font-weight: 600;
        width: 90%; 
        margin: 15px auto; 
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
    
    .btn-pink:hover, .btn-dark:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(255,65,108,0.4);
    }
    
    .btn-action { 
        padding: 15px 20px; 
        font-size: 1.1rem; 
        font-weight: 600; 
        border-radius: 30px;
        border: none;
        cursor: pointer;
    }
    
    .btn-contact { background: #ff416c; color: white; }
    .btn-block { background: #dc3545; color: white; }
    
    .input-box { 
        width: 100%; 
        padding: 18px; 
        border: 2px solid #e2e8f0; 
        border-radius: 15px; 
        margin: 12px 0; 
        font-size: 1.2rem; 
        background: #f8f9fa; 
    }
    
    .input-box:focus {
        border-color: #ff416c;
        outline: none;
        box-shadow: 0 0 0 4px rgba(255,65,108,0.2);
    }
    
    .photo-circle { 
        width: 160px; 
        height: 160px; 
        border: 4px solid #ff416c; 
        border-radius: 50%; 
        margin: 20px auto; 
        background-size: cover; 
        background-position: center; 
        box-shadow: 0 10px 25px rgba(255,65,108,0.3);
    }
    
    .match-card, .inbox-item, .st-group { 
        background: white; 
        border-radius: 25px; 
        margin: 15px 0; 
        padding: 20px; 
        box-shadow: 0 5px 20px rgba(0,0,0,0.05); 
        font-size: 1.2rem;
    }
    
    .match-card {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    
    .inbox-item {
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .inbox-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(255,65,108,0.15);
    }
    
    .st-item { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 18px 20px; 
        border-bottom: 1px solid #f0f0f0; 
        font-size: 1.2rem;
    }
    
    .charte-box {
        height: 500px;
        overflow-y: auto;
        background: #fff5f7;
        border: 2px solid #ffdae0;
        border-radius: 25px;
        padding: 30px;
        font-size: 1.2rem;
        color: #1a2a44;
        line-height: 1.8;
        margin: 20px 0;
        text-align: left;
    }
    
    .charte-section {
        margin-bottom: 35px;
        padding-bottom: 25px;
        border-bottom: 2px dashed #ffdae0;
    }
    
    .charte-title {
        color: #ff416c;
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 12px;
    }
    
    .scroll-indicator {
        text-align: center;
        color: #ff416c;
        font-size: 1.1rem;
        margin: 15px 0;
        padding: 12px;
        background: rgba(255,65,108,0.1);
        border-radius: 40px;
    }
    
    .chat-header { 
        background: #1a2a44; 
        color: white; 
        padding: 18px 20px; 
        font-size: 1.3rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .chat-messages { 
        flex: 1;
        padding: 20px; 
        background: #f5f7fb; 
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .bubble { 
        padding: 16px 22px; 
        border-radius: 25px; 
        max-width: 80%; 
        font-size: 1.2rem; 
        line-height: 1.5; 
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
        background: white; 
        border-top: 2px solid #eee; 
        display: flex;
        gap: 12px;
    }
    
    .input-area input {
        flex: 1;
        padding: 16px 20px;
        font-size: 1.2rem;
        border: 2px solid #e2e8f0;
        border-radius: 30px;
        outline: none;
    }
    
    .input-area button {
        padding: 16px 25px;
        font-size: 1.2rem;
        border-radius: 30px;
        background: #ff416c;
        color: white;
        border: none;
        cursor: pointer;
    }
    
    .empty-message {
        text-align: center;
        padding: 50px 20px;
        color: #666;
        background: white;
        border-radius: 25px;
        margin: 20px 0;
        font-size: 1.2rem;
    }
    
    .empty-message span {
        font-size: 5rem;
        display: block;
        margin-bottom: 20px;
    }
    
    .danger-zone {
        border: 2px solid #dc3545;
        background: #fff5f5;
        margin-top: 30px;
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
        padding: 18px 25px; 
        border-radius: 60px; 
        display: flex; 
        align-items: center; 
        gap: 12px; 
        transition: 0.5s; 
        z-index: 9999; 
        box-shadow: 0 15px 30px rgba(0,0,0,0.3); 
        border-left: 5px solid #ff416c; 
        font-size: 1.1rem;
    }
    
    #genlove-notify.show { top: 20px; }
    
    .navigation {
        display: flex;
        justify-content: space-between;
        padding: 20px 0;
        margin-top: 20px;
        gap: 10px;
    }
    
    .nav-link {
        color: #1a2a44;
        text-decoration: none;
        font-size: 1.1rem;
        padding: 12px 18px;
        border-radius: 30px;
        background: white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        flex: 1;
        text-align: center;
    }
    
    .back-link {
        display: inline-block;
        margin: 20px 0;
        color: #666;
        text-decoration: none;
        font-size: 1.1rem;
    }
    
    .login-prompt {
        font-size: 1.2rem;
        color: #1a2a44;
        margin: 20px 0 10px;
    }
    
    @media (max-width: 420px) {
        body { font-size: 15px; }
        .app-shell { max-width: 100%; }
        .logo-text { font-size: 4.2rem; }
        h2 { font-size: 1.8rem; }
        .btn-pink, .btn-dark { width: 95%; padding: 18px; font-size: 1.2rem; }
    }
</style>
`;

// ============================================
// SCRIPT DE NOTIFICATION
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
        setTimeout(() => { 
            if(n) n.classList.remove('show'); 
        }, 3000);
    }
</script>
`;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function calculerAge(dateNaissance) {
    if (!dateNaissance) return "?";
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

// ============================================
// ROUTES PRINCIPALES
// ============================================

// ACCUEIL AVEC BOUTON CONNEXION
app.get('/', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Genlove - Rencontres Santé</title>' + styles + '</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains 💑</div><div class="login-prompt">Avez-vous déjà un compte ?</div><a href="/login" class="btn-dark">🔐 Se connecter</a><a href="/charte-engagement" class="btn-pink">✨ Créer un compte</a><div style="margin-top:40px; font-size:1rem; color:#666;">🛡️ Vos données de santé sont cryptées</div></div></div></body></html>');
});

// PAGE DE CONNEXION
app.get('/login', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Connexion - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Connexion</h2><p style="font-size:1.2rem; margin:20px 0;">Pour vous connecter, veuillez entrer vos identifiants</p><form id="loginForm"><input type="text" id="firstName" class="input-box" placeholder="Votre prénom" required><button type="submit" class="btn-pink">Se connecter</button></form><a href="/" class="back-link">← Retour à l\'accueil</a></div></div><script>document.getElementById("loginForm").addEventListener("submit", async function(e){e.preventDefault();const firstName=document.getElementById("firstName").value;const res=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName})});if(res.ok){window.location.href="/profile";}else{alert("Prénom non trouvé. Veuillez créer un compte.");}});</script></body></html>');
});

// CHARTE ENGAGEMENT
app.get('/charte-engagement', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Engagement Éthique - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>📜 La Charte d\'Honneur</h2><p style="font-size:1.2rem; margin-bottom:25px;">Lisez attentivement ces 5 engagements</p><div class="charte-box" id="charteBox" onscroll="checkScroll(this)"><div class="charte-section"><div class="charte-title">1. Le Serment de Sincérité</div><p>Je m\'engage sur l\'honneur à fournir des informations exactes concernant mon génotype et mes données de santé.</p></div><div class="charte-section"><div class="charte-title">2. Le Pacte de Confidentialité</div><p>Je m\'engage à garder confidentielles toutes les informations personnelles et médicales.</p></div><div class="charte-section"><div class="charte-title">3. Le Principe de Non-Discrimination</div><p>Je traite chaque membre avec dignité, quel que soit son génotype.</p></div><div class="charte-section"><div class="charte-title">4. La Responsabilité Préventive</div><p>J\'accepte les mesures de protection comme le filtrage des compatibilités à risque.</p></div><div class="charte-section"><div class="charte-title">5. La Bienveillance Éthique</div><p>J\'adopte une conduite exemplaire et respectueuse dans mes messages.</p></div></div><div class="scroll-indicator" id="scrollIndicator">⬇️ Faites défiler jusqu\'en bas ⬇️</div><button id="agreeBtn" class="btn-pink" onclick="acceptCharte()" disabled>J\'accepte et je continue</button><a href="/" class="back-link">← Retour à l\'accueil</a></div></div><script>function checkScroll(el){if(el.scrollHeight - el.scrollTop <= el.clientHeight + 5){document.getElementById("agreeBtn").disabled=false;document.getElementById("agreeBtn").style.opacity="1";document.getElementById("scrollIndicator").style.opacity="0.3";}}function acceptCharte(){if(!document.getElementById("agreeBtn").disabled) window.location.href="/signup";}</script></body></html>');
});

// INSCRIPTION
app.get('/signup', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Inscription - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Créer mon profil</h2><form id="signupForm"><input type="text" name="firstName" class="input-box" placeholder="Prénom" required><input type="text" name="lastName" class="input-box" placeholder="Nom" required><select name="gender" class="input-box" required><option value="">Genre</option><option value="Homme">Homme</option><option value="Femme">Femme</option></select><input type="date" name="dob" class="input-box" required><input type="text" name="residence" class="input-box" placeholder="Ville" required><select name="genotype" class="input-box" required><option value="">Génotype</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select><select name="bloodGroup" class="input-box" required><option value="">Groupe sanguin</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select><select name="desireChild" class="input-box" required><option value="">Désir d\'enfant ?</option><option value="Oui">Oui</option><option value="Non">Non</option></select><button type="submit" class="btn-pink">Créer mon profil</button></form><a href="/charte-engagement" class="back-link">← Retour à la charte</a></div></div><script>document.getElementById("signupForm").addEventListener("submit", async function(e){e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const res=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});if(res.ok) window.location.href="/sas-validation"; else alert("Erreur lors de l\'inscription");});</script></body></html>');
});

// SAS DE VALIDATION
app.get('/sas-validation', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Validation - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><div style="font-size:5rem; margin:20px 0;">⚖️</div><h2>Serment d\'Honneur</h2><div style="background:#fff5f7; border-radius:25px; padding:30px; margin:20px 0; border:2px solid #ffdae0; text-align:left; font-size:1.2rem;"><p><strong>"Je confirme sur mon honneur que mes informations sont sincères et conformes à la réalité."</strong></p></div><label style="display:flex; align-items:center; justify-content:center; gap:15px; padding:20px; background:#f8f9fa; border-radius:15px; margin:20px 0; font-size:1.2rem;"><input type="checkbox" id="honorCheck" style="width:25px; height:25px;"> Je le jure</label><button id="validateBtn" class="btn-pink" onclick="validateHonor()" disabled>Accéder à mon profil</button></div></div><script>document.getElementById("honorCheck").addEventListener("change",function(){document.getElementById("validateBtn").disabled=!this.checked;});async function validateHonor(){const res=await fetch("/api/validate-honor",{method:"POST"});if(res.ok) window.location.href="/profile";}</script></body></html>');
});

// PROFIL
app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false });
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Mon Profil - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;"><a href="/matching" class="btn-dark" style="padding:12px 20px; margin:0; font-size:1rem;">🔍 Matching</a><a href="/inbox" class="btn-pink" style="padding:12px 20px; margin:0; font-size:1rem;">📬 ' + (unreadCount > 0 ? unreadCount : '') + '</a><a href="/settings" style="font-size:2rem; color:#1a2a44;">⚙️</a></div><div class="photo-circle" style="background-image:url(\'' + (user.photo || '') + '\');"></div><h2>' + user.firstName + ' ' + user.lastName + '</h2><p style="font-size:1.2rem;">📍 ' + (user.residence || '') + ' • ' + user.gender + '</p><div class="st-group"><div class="st-item"><span>🧬 Génotype</span><b>' + user.genotype + '</b></div><div class="st-item"><span>🩸 Groupe</span><b>' + user.bloodGroup + '</b></div><div class="st-item"><span>📅 Âge</span><b>' + calculerAge(user.dob) + ' ans</b></div><div class="st-item"><span>👶 Projet</span><b>' + user.desireChild + '</b></div></div><a href="/matching" class="btn-pink">🔍 Trouver un partenaire</a><a href="/edit-profile" class="btn-dark">✏️ Modifier mon profil</a></div></div></body></html>');
    } catch (error) {
        res.status(500).send('Erreur profil');
    }
});

// ÉDITION PROFIL
app.get('/edit-profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const bloodOptions = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => 
            '<option value="' + g + '" ' + (user.bloodGroup === g ? 'selected' : '') + '>' + g + '</option>'
        ).join('');
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Modifier profil - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Modifier mon profil</h2><form id="editForm"><input type="text" name="firstName" class="input-box" value="' + user.firstName + '" required><input type="text" name="lastName" class="input-box" value="' + user.lastName + '" required><select name="gender" class="input-box"><option value="Homme"' + (user.gender === 'Homme' ? ' selected' : '') + '>Homme</option><option value="Femme"' + (user.gender === 'Femme' ? ' selected' : '') + '>Femme</option></select><input type="date" name="dob" class="input-box" value="' + user.dob + '" required><input type="text" name="residence" class="input-box" value="' + user.residence + '" required><select name="genotype" class="input-box"><option value="AA"' + (user.genotype === 'AA' ? ' selected' : '') + '>AA</option><option value="AS"' + (user.genotype === 'AS' ? ' selected' : '') + '>AS</option><option value="SS"' + (user.genotype === 'SS' ? ' selected' : '') + '>SS</option></select><select name="bloodGroup" class="input-box">' + bloodOptions + '</select><select name="desireChild" class="input-box"><option value="Oui"' + (user.desireChild === 'Oui' ? ' selected' : '') + '>Oui</option><option value="Non"' + (user.desireChild === 'Non' ? ' selected' : '') + '>Non</option></select><button type="submit" class="btn-pink">Enregistrer</button></form><a href="/profile" class="back-link">← Retour au profil</a></div></div><script>document.getElementById("editForm").addEventListener("submit", async function(e){e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const res=await fetch("/api/users/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});if(res.ok) window.location.href="/profile"; else alert("Erreur");});</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur édition');
    }
});

// MATCHING
app.get('/matching', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        let query = { _id: { $ne: currentUser._id } };
        
        // Exclure ceux qui ont bloqué l'utilisateur ET ceux que l'utilisateur a bloqués
        if (currentUser.blockedUsers?.length) query._id.$nin = currentUser.blockedUsers;
        
        // Exclure aussi les utilisateurs qui ont bloqué currentUser
        const blockedByOthers = await User.find({ blockedBy: currentUser._id }).distinct('_id');
        if (blockedByOthers.length > 0) {
            query._id.$nin = query._id.$nin ? [...query._id.$nin, ...blockedByOthers] : blockedByOthers;
        }
        
        if (currentUser.gender === 'Homme') query.gender = 'Femme';
        else if (currentUser.gender === 'Femme') query.gender = 'Homme';
        
        let partners = await User.find(query);
        
        if (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') {
            partners = partners.filter(p => p.genotype === 'AA');
        }
        
        let partnersHTML = '';
        if (partners.length === 0) {
            partnersHTML = '<div class="empty-message"><span>🔍</span><h3>Recherche en cours...</h3><p>Nous élargissons notre communauté. Revenez bientôt !</p></div>';
        } else {
            partners.forEach(p => {
                partnersHTML += '<div class="match-card"><div class="match-photo-blur"></div><div style="flex:1"><b style="font-size:1.3rem;">' + p.firstName + '</b><br><span style="font-size:1.1rem;">' + p.genotype + ' • ' + p.residence + '</span></div><button class="btn-action btn-contact" onclick="window.location.href=\'/chat?partnerId=' + p._id + '\'">Contacter</button></div>';
            });
        }
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Matching - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Partenaires compatibles</h2>' + partnersHTML + '<div class="navigation"><a href="/profile" class="nav-link">← Mon profil</a><a href="/inbox" class="nav-link">Messages →</a></div></div></div></body></html>');
    } catch (error) {
        res.status(500).send('Erreur matching');
    }
});

// INBOX
app.get('/inbox', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const messages = await Message.find({ $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }] })
            .populate('senderId receiverId').sort({ timestamp: -1 });
        
        const conversations = new Map();
        for (const msg of messages) {
            const otherUser = msg.senderId._id.equals(currentUser._id) ? msg.receiverId : msg.senderId;
            
            // Vérifier si l'autre utilisateur n'a pas bloqué currentUser
            const otherUserDoc = await User.findById(otherUser._id);
            if (otherUserDoc && otherUserDoc.blockedBy?.includes(currentUser._id)) {
                continue; // L'autre a bloqué currentUser
            }
            
            // Vérifier si currentUser n'a pas bloqué l'autre
            if (currentUser.blockedUsers?.includes(otherUser._id)) continue;
            
            if (!conversations.has(otherUser._id.toString())) {
                conversations.set(otherUser._id.toString(), { user: otherUser, lastMessage: msg });
            }
        }
        
        let inboxHTML = '';
        if (conversations.size === 0) {
            inboxHTML = '<div class="empty-message"><span>📭</span><h3>Boîte vide</h3><p>Commencez une conversation !</p><a href="/matching" class="btn-pink" style="width:auto; display:inline-block; margin-top:15px;">Trouver des partenaires</a></div>';
        } else {
            conversations.forEach(conv => {
                inboxHTML += '<div class="inbox-item" onclick="window.location.href=\'/chat?partnerId=' + conv.user._id + '\'"><div><b style="font-size:1.3rem;">' + conv.user.firstName + ' ' + conv.user.lastName + '</b><br><span style="font-size:1.1rem;">' + conv.lastMessage.text.substring(0,50) + '...</span></div></div>';
            });
        }
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Messages - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Boîte de réception</h2>' + inboxHTML + '<div class="navigation"><a href="/profile" class="nav-link">← Mon profil</a><a href="/matching" class="nav-link">Matching →</a></div></div></div></body></html>');
    } catch (error) {
        res.status(500).send('Erreur inbox');
    }
});

// CHAT
app.get('/chat', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const partnerId = req.query.partnerId;
        if (!partnerId) return res.redirect('/inbox');
        
        // Vérifier si l'autre a bloqué currentUser
        const partner = await User.findById(partnerId);
        if (!partner) return res.redirect('/inbox');
        
        if (partner.blockedBy?.includes(currentUser._id)) {
            return res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bloqué</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>⛔ Conversation impossible</h2><p style="font-size:1.2rem; margin:30px 0;">Cet utilisateur vous a bloqué. Vous ne pouvez pas lui envoyer de messages.</p><a href="/inbox" class="btn-pink">Retour</a></div></div></body></html>');
        }
        
        // Vérifier si currentUser a bloqué l'autre
        if (currentUser.blockedUsers?.includes(partnerId)) {
            return res.redirect('/inbox');
        }
        
        const messages = await Message.find({ $or: [{ senderId: currentUser._id, receiverId: partnerId }, { senderId: partnerId, receiverId: currentUser._id }] }).sort({ timestamp: 1 });
        
        let messagesHTML = '';
        messages.forEach(m => {
            const classe = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
            messagesHTML += '<div class="bubble ' + classe + '">' + m.text + '</div>';
        });
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Chat avec ' + partner.firstName + '</title>' + styles + '</head><body><div class="app-shell"><div class="chat-header"><span><b>' + partner.firstName + '</b></span><button class="btn-action btn-block" onclick="blockUser(\'' + partnerId + '\')" style="padding:10px 15px;">🚫 Bloquer</button><button onclick="window.location.href=\'/inbox\'" style="background:none; border:none; color:white; font-size:1.5rem;">❌</button></div><div class="chat-messages" id="messages">' + messagesHTML + '</div><div class="input-area"><input id="msgInput" placeholder="Votre message..."><button onclick="sendMessage(\'' + partnerId + '\')">Envoyer</button></div></div><script>async function sendMessage(id){const msg=document.getElementById("msgInput");if(msg.value.trim()){await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({receiverId:id,text:msg.value})});location.reload();}}async function blockUser(id){if(confirm("Bloquer cet utilisateur ?")){await fetch("/api/block/"+id,{method:"POST"});window.location.href="/inbox";}}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur chat');
    }
});

// PARAMÈTRES
app.get('/settings', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const blockedCount = currentUser.blockedUsers?.length || 0;
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Paramètres - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Paramètres</h2><div class="st-group"><div class="st-item">Visibilité<input type="checkbox" checked></div><div class="st-item">Notifications<input type="checkbox"></div></div><a href="/edit-profile" class="btn-dark">✏️ Modifier mon profil</a><a href="/blocked-list" class="btn-dark">🚫 Bloqués (' + blockedCount + ')</a><div class="st-group danger-zone"><div class="st-item" style="color:#dc3545;">⚠️ ZONE DE DANGER</div><div class="st-item"><span>🗑️ Supprimer mon compte</span><button class="btn-action btn-block" onclick="deleteAccount()">Supprimer</button></div></div><div class="navigation"><a href="/profile" class="nav-link">← Mon profil</a><a href="/logout-success" class="nav-link" style="color:#ff416c;">Déconnexion</a></div></div></div><script>async function deleteAccount(){if(confirm("Supprimer définitivement ?")){await fetch("/api/delete-account",{method:"DELETE"});window.location.href="/logout-success";}}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur paramètres');
    }
});

// LISTE DES BLOQUÉS
app.get('/blocked-list', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId).populate('blockedUsers');
        let blockedHTML = currentUser.blockedUsers?.length ? '' : '<div class="empty-message"><span>🔓</span><p>Aucun utilisateur bloqué</p></div>';
        
        if (currentUser.blockedUsers?.length) {
            currentUser.blockedUsers.forEach(user => {
                blockedHTML += '<div class="inbox-item" style="justify-content:space-between;"><span><b style="font-size:1.3rem;">' + user.firstName + ' ' + user.lastName + '</b></span><button class="btn-action" onclick="unblockUser(\'' + user._id + '\')" style="background:#4CAF50; color:white;">Débloquer</button></div>';
            });
        }
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Utilisateurs bloqués</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Utilisateurs bloqués</h2>' + blockedHTML + '<a href="/settings" class="back-link">← Retour</a></div></div><script>async function unblockUser(id){await fetch("/api/unblock/"+id,{method:"POST"});location.reload();}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

// FIN DE CHAT
app.get('/chat-end', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Merci</title>' + styles + '</head><body class="end-overlay"><div class="end-card"><h2 style="font-size:2.2rem;">Merci pour cet échange</h2><p style="font-size:1.3rem; margin:25px 0;">Genlove vous remercie</p><a href="/matching" class="btn-pink">Nouvelle recherche</a><a href="/profile" class="btn-dark" style="margin-top:15px;">Mon profil</a></div></body></html>');
});

// DÉCONNEXION
app.get('/logout-success', (req, res) => {
    req.session.destroy();
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"><title>Déconnecté</title>' + styles + '</head><body class="end-overlay"><div class="end-card"><h2 style="font-size:2.2rem;">Déconnexion réussie</h2><p style="font-size:1.3rem; margin:25px 0;">À bientôt !</p><a href="/" class="btn-pink">Accueil</a></div></body></html>');
});

// ============================================
// ROUTES API
// ============================================

// CONNEXION
app.post('/api/login', async (req, res) => {
    try {
        const { firstName } = req.body;
        const user = await User.findOne({ firstName: firstName }).sort({ createdAt: -1 });
        
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        
        await new Promise((resolve) => {
            req.session.userId = user._id;
            req.session.isVerified = user.isVerified;
            req.session.save(resolve);
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENREGISTREMENT
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        
        await new Promise((resolve) => {
            req.session.userId = newUser._id;
            req.session.isVerified = false;
            req.session.save(resolve);
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// VALIDATION D'HONNEUR
app.post('/api/validate-honor', requireAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, { isVerified: true });
        
        await new Promise((resolve) => {
            req.session.isVerified = true;
            req.session.save(resolve);
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENVOI MESSAGE
app.post('/api/messages', requireAuth, requireVerified, async (req, res) => {
    try {
        const message = new Message({ senderId: req.session.userId, receiverId: req.body.receiverId, text: req.body.text, read: false });
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BLOQUER (AVEC EFFET MIROIR)
app.post('/api/block/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        const targetUserId = req.params.userId;
        
        // Bloquer l'autre utilisateur
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.blockedUsers) currentUser.blockedUsers = [];
        if (!currentUser.blockedUsers.includes(targetUserId)) {
            currentUser.blockedUsers.push(targetUserId);
            await currentUser.save();
        }
        
        // Ajouter currentUser à la liste blockedBy de l'autre utilisateur (effet miroir)
        const targetUser = await User.findById(targetUserId);
        if (!targetUser.blockedBy) targetUser.blockedBy = [];
        if (!targetUser.blockedBy.includes(currentUserId)) {
            targetUser.blockedBy.push(currentUserId);
            await targetUser.save();
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DÉBLOQUER (AVEC EFFET MIROIR)
app.post('/api/unblock/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        const targetUserId = req.params.userId;
        
        // Débloquer l'autre utilisateur
        const currentUser = await User.findById(currentUserId);
        if (currentUser.blockedUsers) {
            currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== targetUserId);
            await currentUser.save();
        }
        
        // Retirer currentUser de la liste blockedBy de l'autre utilisateur
        const targetUser = await User.findById(targetUserId);
        if (targetUser.blockedBy) {
            targetUser.blockedBy = targetUser.blockedBy.filter(id => id.toString() !== currentUserId);
            await targetUser.save();
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MISE À JOUR PROFIL
app.put('/api/users/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const allowedUpdates = ['firstName','lastName','gender','dob','residence','genotype','bloodGroup','desireChild','photo'];
        const updates = {};
        allowedUpdates.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
        await User.findByIdAndUpdate(req.session.userId, updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SUPPRIMER COMPTE
app.delete('/api/delete-account', requireAuth, requireVerified, async (req, res) => {
    try {
        const userId = req.session.userId;
        await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
        
        // Retirer cet utilisateur des listes blockedBy des autres
        await User.updateMany({ blockedBy: userId }, { $pull: { blockedBy: userId } });
        
        await User.findByIdAndDelete(userId);
        req.session.destroy();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SANTÉ
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ============================================
// GESTION 404
// ============================================
app.use((req, res) => {
    res.status(404).send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title>' + styles + '</head><body class="end-overlay"><div class="end-card"><h2>Page non trouvée</h2><a href="/" class="btn-pink">Accueil</a></div></body></html>');
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
    console.log('🚀 Genlove démarré sur http://localhost:' + port);
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('✅ Déconnexion MongoDB');
        process.exit(0);
    });
});