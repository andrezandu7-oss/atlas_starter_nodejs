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
        mongoUrl: mongoURI
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
    language: { type: String, default: 'fr' },
    isVerified: { type: Boolean, default: false },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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

// MODÈLE POUR LES DEMANDES DE PREMIER CONTACT
const requestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', requestSchema);

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
// SYSTÈME DE TRADUCTION SIMPLIFIÉ
// ============================================
const translations = {
    fr: {
        appName: 'Genlove',
        slogan: 'Unissez cœur et santé pour bâtir des couples sains 💑',
        security: '🛡️ Vos données de santé sont cryptées',
        welcome: 'Bienvenue sur Genlove',
        haveAccount: 'Avez-vous déjà un compte ?',
        login: 'Se connecter',
        createAccount: 'Créer un compte',
        loginTitle: 'Connexion',
        enterName: 'Entrez votre prénom pour vous connecter',
        yourName: 'Votre prénom',
        backHome: 'Retour à l\'accueil',
        nameNotFound: 'Prénom non trouvé. Veuillez créer un compte.',
        charterTitle: '📜 La Charte d\'Honneur',
        charterSubtitle: 'Lisez attentivement ces 5 engagements',
        scrollDown: '⬇️ Faites défiler jusqu\'en bas ⬇️',
        accept: 'J\'accepte et je continue',
        
        oath1: '1. Le Serment de Sincérité',
        oath1Sub: 'Vérité Médicale',
        oath1Text: 'Je m\'engage sur l\'honneur à fournir des informations exactes concernant mon génotype et mes données de santé.',
        oath2: '2. Le Pacte de Confidentialité',
        oath2Sub: 'Secret Partagé',
        oath2Text: 'Je m\'engage à garder confidentielles toutes les informations personnelles et médicales.',
        oath3: '3. Le Principe de Non-Discrimination',
        oath3Sub: 'Égalité de Respect',
        oath3Text: 'Je traite chaque membre avec dignité, quel que soit son génotype.',
        oath4: '4. La Responsabilité Préventive',
        oath4Sub: 'Orientation Santé',
        oath4Text: 'J\'accepte les mesures de protection comme le filtrage des compatibilités à risque.',
        oath5: '5. La Bienveillance Éthique',
        oath5Sub: 'Courtoisie',
        oath5Text: 'J\'adopte une conduite exemplaire et respectueuse dans mes messages.',
        
        signupTitle: 'Créer mon profil',
        signupSub: 'Toutes les informations sont confidentielles',
        firstName: 'Prénom',
        lastName: 'Nom',
        gender: 'Genre',
        male: 'Homme',
        female: 'Femme',
        dob: 'Date de naissance',
        city: 'Ville de résidence',
        genotype: 'Génotype',
        bloodGroup: 'Groupe sanguin',
        desireChild: 'Désir d\'enfant ?',
        yes: 'Oui',
        no: 'Non',
        createProfile: 'Créer mon profil',
        backCharter: '← Retour à la charte',
        required: 'obligatoire',
        
        honorTitle: 'Serment d\'Honneur',
        honorText: '"Je confirme sur mon honneur que mes informations sont sincères et conformes à la réalité."',
        swear: 'Je le jure',
        accessProfile: 'Accéder à mon profil',
        
        myProfile: 'Mon Profil',
        home: 'Accueil',
        messages: 'Messages',
        settings: 'Paramètres',
        genotype_label: 'Génotype',
        blood_label: 'Groupe',
        age_label: 'Âge',
        project_label: 'Projet',
        findPartner: '🔍 Trouver un partenaire',
        editProfile: '✏️ Modifier mon profil',
        
        compatiblePartners: 'Partenaires compatibles',
        noPartners: 'Aucun partenaire trouvé pour le moment',
        searchOngoing: 'Recherche en cours...',
        expandCommunity: 'Nous élargissons notre communauté. Revenez bientôt !',
        details: 'Détails',
        contact: 'Contacter',
        backProfile: '← Mon profil',
        toMessages: 'Messages →',
        
        healthCommitment: '🛡️ Votre engagement santé',
        popupMessageAS: '"En tant que profil AS, nous ne vous présentons que des partenaires AA."',
        popupMessageSS: '"En tant que profil SS, nous ne vous présentons que des partenaires AA."',
        understood: 'J\'ai compris',
        
        inboxTitle: 'Boîte de réception',
        emptyInbox: '📭 Boîte vide',
        startConversation: 'Commencez une conversation !',
        findPartners: 'Trouver des partenaires',
        
        block: '🚫 Bloquer',
        yourMessage: 'Votre message...',
        send: 'Envoyer',
        blockedByUser: '⛔ Conversation impossible',
        blockedMessage: 'Cet utilisateur vous a bloqué.',
        
        settingsTitle: 'Paramètres',
        visibility: 'Visibilité',
        notifications: 'Notifications',
        language: 'Langue',
        blockedUsers: 'Bloqués',
        dangerZone: '⚠️ ZONE DE DANGER',
        deleteAccount: '🗑️ Supprimer mon compte',
        delete: 'Supprimer',
        logout: 'Déconnexion',
        confirmDelete: 'Supprimer définitivement ?',
        
        noBlocked: 'Aucun utilisateur bloqué',
        unblock: 'Débloquer',
        
        thankYou: 'Merci pour cet échange',
        thanksMessage: 'Genlove vous remercie',
        newSearch: 'Nouvelle recherche',
        
        logoutSuccess: 'Déconnexion réussie',
        seeYouSoon: 'À bientôt !',
        
        french: 'Français',
        english: 'English',
        portuguese: 'Português',
        spanish: 'Español',
        arabic: 'العربية',
        chinese: '中文',
        
        pageNotFound: 'Page non trouvée',
        pageNotFoundMessage: 'La page n\'existe pas.',
        
        residence_label: 'Résidence',
        project_life: 'Projet de vie',
        
        newRequest: 'Nouvelle demande',
        interested: 's\'intéresse à votre profil.',
        whatToDo: 'Que souhaitez-vous faire ?',
        openChat: 'Ouvrir la discussion',
        ignore: 'Ignorer',
        willBeInformed: 'sera informé(e) de votre choix.',
        requestAccepted: 'Votre demande a été acceptée !',
        requestRejected: '🌸 Merci pour votre message. Cette personne préfère ne pas donner suite pour le moment. Continuez votre chemin, la bonne personne vous attend ailleurs.',
        day: 'Jour',
        month: 'Mois',
        year: 'Année',
        january: 'Janvier',
        february: 'Février',
        march: 'Mars',
        april: 'Avril',
        may: 'Mai',
        june: 'Juin',
        july: 'Juillet',
        august: 'Août',
        september: 'Septembre',
        october: 'Octobre',
        november: 'Novembre',
        december: 'Décembre'
    }
};

// ============================================
// MIDDLEWARE DE LANGUE SIMPLIFIÉ
// ============================================
app.use(async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            req.lang = (user && user.language) ? user.language : 'fr';
        } catch (e) {
            req.lang = 'fr';
        }
    } else {
        req.lang = 'fr';
    }
    
    req.t = (key) => {
        return translations[req.lang] && translations[req.lang][key] 
            ? translations[req.lang][key] 
            : translations['fr'][key] || key;
    };
    
    next();
});

// ============================================
// STYLES CSS
// ============================================
const styles = `
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: 'Segoe UI', sans-serif; 
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
    }
    h2 { color: #1a2a44; margin-bottom: 20px; }
    .btn-pink { 
        background: #ff416c; 
        color: white; 
        padding: 15px 20px; 
        border-radius: 50px; 
        text-align: center; 
        text-decoration: none; 
        font-weight: bold; 
        display: block; 
        width: 90%; 
        margin: 10px auto; 
        border: none; 
        cursor: pointer; 
    }
    .btn-dark { 
        background: #1a2a44; 
        color: white; 
        padding: 15px 20px; 
        border-radius: 50px; 
        text-align: center; 
        text-decoration: none; 
        font-weight: bold; 
        display: block; 
        width: 90%; 
        margin: 10px auto; 
    }
    .input-box { 
        width: 100%; 
        padding: 12px; 
        border: 1px solid #ccc; 
        border-radius: 8px; 
        margin: 8px 0; 
    }
    .page-white { 
        background: white; 
        min-height: 100vh; 
        padding: 20px; 
    }
    .st-group { 
        background: #f8f9fa; 
        border-radius: 10px; 
        padding: 10px; 
        margin: 10px 0; 
    }
    .st-item { 
        display: flex; 
        justify-content: space-between; 
        padding: 10px; 
        border-bottom: 1px solid #eee; 
    }
    .charte-box { 
        height: 300px; 
        overflow-y: auto; 
        background: #fff5f7; 
        padding: 15px; 
        border-radius: 10px; 
        margin: 15px 0; 
    }
    .photo-circle { 
        width: 120px; 
        height: 120px; 
        border: 3px solid #ff416c; 
        border-radius: 50%; 
        margin: 0 auto 20px; 
        background-size: cover; 
        background-position: center; 
    }
    #request-popup {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    .popup-content {
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 380px;
        width: 100%;
        text-align: center;
        border: 3px solid #ff416c;
    }
    .popup-buttons {
        display: flex;
        gap: 10px;
        margin: 20px 0;
    }
    .popup-buttons button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
    }
    .accept-btn { background: #ff416c; color: white; }
    .ignore-btn { background: #1a2a44; color: white; }
    #genlove-notify { 
        position: fixed; 
        top: -100px; 
        left: 50%; 
        transform: translateX(-50%);
        background: #1a2a44; 
        color: white; 
        padding: 15px; 
        border-radius: 50px; 
        transition: 0.5s; 
        z-index: 9999; 
    }
    #genlove-notify.show { top: 20px; }
    .match-card { 
        background: white; 
        padding: 15px; 
        border-radius: 10px; 
        margin: 10px 0; 
    }
    .inbox-item { 
        background: white; 
        padding: 15px; 
        border-radius: 10px; 
        margin: 10px 0; 
        cursor: pointer; 
    }
    .inbox-item.unread { 
        background: #e8f0fe; 
        border-left: 5px solid #ff416c; 
    }
    .unread-badge { 
        background: #ff416c; 
        color: white; 
        padding: 2px 8px; 
        border-radius: 10px; 
        margin-left: 5px; 
    }
    .navigation { 
        display: flex; 
        gap: 10px; 
        margin-top: 20px; 
    }
    .nav-link { 
        background: white; 
        padding: 10px; 
        border-radius: 20px; 
        text-decoration: none; 
        color: #1a2a44; 
        flex: 1; 
        text-align: center; 
    }
    .back-link { 
        display: block; 
        margin: 15px 0; 
        color: #666; 
        text-decoration: none; 
    }
    .end-overlay { 
        position: fixed; 
        inset: 0; 
        background: linear-gradient(135deg, #ff416c, #1a2a44); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
    }
    .end-card { 
        background: white; 
        border-radius: 30px; 
        padding: 40px; 
        text-align: center; 
        width: 85%; 
    }
</style>
`;

// ============================================
// SCRIPT DE NOTIFICATION ET VIBRATION
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
    
    function vibrate() {
        if ("vibrate" in navigator) {
            navigator.vibrate(200);
        }
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
// ROUTE POUR CHANGER DE LANGUE
// ============================================
app.get('/lang/:lang', async (req, res) => {
    const lang = req.params.lang;
    if (['fr', 'en', 'pt', 'es', 'ar', 'zh'].includes(lang)) {
        if (req.session.userId) {
            await User.findByIdAndUpdate(req.session.userId, { language: lang });
        }
    }
    res.redirect(req.get('referer') || '/');
});

// ============================================
// ROUTES PRINCIPALES
// ============================================

// ACCUEIL
app.get('/', (req, res) => {
    const t = req.t;
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Genlove</title>' + styles + '</head><body><div class="app-shell"><div style="text-align:center; padding:50px;"><h1 style="font-size:3rem;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></h1><p style="margin:30px;">' + t('slogan') + '</p><a href="/charte-engagement" class="btn-pink">' + t('createAccount') + '</a><a href="/login" class="btn-dark">' + t('login') + '</a></div></div></body></html>');
});

// CONNEXION
app.get('/login', (req, res) => {
    const t = req.t;
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('loginTitle') + '</h2><form id="loginForm"><input type="text" id="firstName" class="input-box" placeholder="' + t('yourName') + '"><button class="btn-pink">' + t('login') + '</button></form><a href="/" class="back-link">← ' + t('backHome') + '</a></div></div><script>document.getElementById("loginForm").addEventListener("submit",async(e)=>{e.preventDefault();const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:e.target.firstName.value})});if(r.ok)window.location.href="/profile";else alert("' + t('nameNotFound') + '");});</script></body></html>');
});

// CHARTE
app.get('/charte-engagement', (req, res) => {
    const t = req.t;
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('charterTitle') + '</h2><div class="charte-box" id="box"><p><b>1.</b> ' + t('oath1Text') + '</p><p><b>2.</b> ' + t('oath2Text') + '</p><p><b>3.</b> ' + t('oath3Text') + '</p><p><b>4.</b> ' + t('oath4Text') + '</p><p><b>5.</b> ' + t('oath5Text') + '</p></div><button id="btn" class="btn-pink" onclick="window.location.href=\'/signup\'" disabled>' + t('accept') + '</button><a href="/">' + t('backHome') + '</a></div></div><script>document.getElementById("box").addEventListener("scroll",function(){if(this.scrollHeight-this.scrollTop<=this.clientHeight+5)document.getElementById("btn").disabled=false});</script></body></html>');
});

// INSCRIPTION
app.get('/signup', (req, res) => {
    const t = req.t;
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('signupTitle') + '</h2><form id="f"><input class="input-box" name="firstName" placeholder="' + t('firstName') + '" required><input class="input-box" name="lastName" placeholder="' + t('lastName') + '" required><select class="input-box" name="gender"><option value="Homme">' + t('male') + '</option><option value="Femme">' + t('female') + '</option></select><input class="input-box" type="date" name="dob" required><input class="input-box" name="residence" placeholder="' + t('city') + '" required><select class="input-box" name="genotype"><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select><select class="input-box" name="bloodGroup"><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select><select class="input-box" name="desireChild"><option value="Oui">' + t('yes') + '</option><option value="Non">' + t('no') + '</option></select><button class="btn-pink">' + t('createProfile') + '</button></form></div></div><script>document.getElementById("f").addEventListener("submit",async(e)=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const r=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});if(r.ok)window.location.href="/sas-validation"});</script></body></html>');
});

// SAS VALIDATION
app.get('/sas-validation', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const t = req.t;
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('honorTitle') + '</h2><p>' + t('honorText') + '</p><label><input type="checkbox" id="c"> ' + t('swear') + '</label><button class="btn-pink" id="b" onclick="validate()" disabled>' + t('accessProfile') + '</button></div></div><script>document.getElementById("c").addEventListener("change",function(){document.getElementById("b").disabled=!this.checked});async function validate(){await fetch("/api/validate-honor",{method:"POST"});window.location.href="/profile"}</script></body></html>');
});

// PROFIL AVEC POPUP CORRIGÉ
app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const t = req.t;
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false });
        const genderDisplay = user.gender === 'Homme' ? t('male') : t('female');
        const unreadBadge = unreadCount > 0 ? '<span class="unread-badge">' + unreadCount + '</span>' : '';
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - Profil</title>
    ${styles}
    ${notifyScript}
    <style>
        #request-popup {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .popup-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 380px;
            width: 100%;
            text-align: center;
            border: 3px solid #ff416c;
        }
        .popup-buttons {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        .popup-buttons button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 50px;
            font-weight: bold;
            cursor: pointer;
        }
        .accept-btn { background: #ff416c; color: white; }
        .ignore-btn { background: #1a2a44; color: white; }
    </style>
</head>
<body>
    <div class="app-shell">
        <!-- POPUP -->
        <div id="request-popup">
            <div class="popup-content">
                <h3 style="color:#ff416c; font-size:1.8rem; margin-bottom:15px;">📬 ${t('newRequest')}</h3>
                <div id="popup-user" style="font-size:1.5rem; font-weight:bold; margin-bottom:5px;"></div>
                <div id="popup-details" style="color:#666; margin-bottom:15px;"></div>
                <div id="popup-message" style="background:#fff5f7; padding:20px; border-radius:10px; margin:20px 0; font-style:italic;"></div>
                <div style="font-size:1.2rem; margin:20px 0;">❓ ${t('whatToDo')}</div>
                <div class="popup-buttons">
                    <button class="accept-btn" onclick="acceptRequest()">✅ ${t('openChat')}</button>
                    <button class="ignore-btn" onclick="ignoreRequest()">🌿 ${t('ignore')}</button>
                </div>
                <div id="popup-note" style="color:#888; font-size:0.9rem;"></div>
            </div>
        </div>

        <!-- CONTENU DU PROFIL -->
        <div class="page-white">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                <a href="/" class="btn-dark" style="padding:8px 15px;">🏠 ${t('home')}</a>
                <a href="/inbox" class="btn-pink" style="padding:8px 15px;">📬 ${unreadBadge}</a>
                <a href="/settings" style="font-size:2rem;">⚙️</a>
            </div>
            <div class="photo-circle" style="background-image:url('${user.photo || ''}');"></div>
            <h2>${user.firstName} ${user.lastName}</h2>
            <p>📍 ${user.residence || ''} • ${genderDisplay}</p>
            <div class="st-group">
                <div class="st-item"><span>🧬 ${t('genotype_label')}</span><b>${user.genotype}</b></div>
                <div class="st-item"><span>🩸 ${t('blood_label')}</span><b>${user.bloodGroup}</b></div>
                <div class="st-item"><span>📅 ${t('age_label')}</span><b>${calculerAge(user.dob)} ans</b></div>
                <div class="st-item"><span>👶 ${t('project_label')}</span><b>${user.desireChild === 'Oui' ? t('yes') : t('no')}</b></div>
            </div>
            <a href="/matching" class="btn-pink">${t('findPartner')}</a>
        </div>
    </div>

    <!-- BOUTON TEST -->
    <div style="position:fixed; bottom:20px; right:20px; z-index:9999;">
        <button onclick="testPopup()" style="background:#ff416c; color:white; border:none; border-radius:50px; padding:15px 25px; font-size:1.2rem; box-shadow:0 5px 15px rgba(255,65,108,0.3);">🔍 TEST POPUP</button>
    </div>

    <script>
        let currentRequestId = null;
        let currentSenderId = null;

        function testPopup() {
            showRequestPopup({
                _id: 'test',
                senderId: {
                    _id: 'test',
                    firstName: 'Maria',
                    dob: '1995-01-01',
                    genotype: 'AA',
                    residence: 'Luanda'
                },
                message: 'Bonjour, je suis très intéressé par votre profil !'
            });
        }

        function showRequestPopup(r) {
            currentRequestId = r._id;
            currentSenderId = r.senderId._id;
            
            const age = r.senderId.dob ? new Date().getFullYear() - new Date(r.senderId.dob).getFullYear() : '?';
            
            document.getElementById('popup-user').innerHTML = r.senderId.firstName + ', ' + age + ' ans';
            document.getElementById('popup-details').innerHTML = 'Génotype: ' + (r.senderId.genotype || '?') + ' • Résidence: ' + (r.senderId.residence || '?');
            document.getElementById('popup-message').innerHTML = '"' + r.message + '"';
            document.getElementById('popup-note').innerHTML = 'ℹ️ ' + r.senderId.firstName + ' sera informé(e) de votre choix.';
            
            document.getElementById('request-popup').style.display = 'flex';
            
            if ("vibrate" in navigator) {
                navigator.vibrate(200);
            }
        }

        async function checkRequests() {
            try {
                const res = await fetch('/api/requests/pending');
                const reqs = await res.json();
                if (reqs.length > 0) showRequestPopup(reqs[0]);
            } catch (e) {}
        }

        async function acceptRequest() {
            if (!currentRequestId) return;
            await fetch('/api/requests/' + currentRequestId + '/accept', {method: 'POST'});
            document.getElementById('request-popup').style.display = 'none';
            window.location.href = '/inbox';
        }

        async function ignoreRequest() {
            if (!currentRequestId) return;
            if (confirm('Ignorer cette demande ?')) {
                await fetch('/api/requests/' + currentRequestId + '/ignore', {method: 'POST'});
                document.getElementById('request-popup').style.display = 'none';
            }
        }

        document.addEventListener('DOMContentLoaded', checkRequests);
        setInterval(checkRequests, 10000);
    </script>
</body>
</html>`);
    } catch (error) {
        res.status(500).send('Erreur profil');
    }
});

// MATCHING
app.get('/matching', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        const t = req.t;
        
        let query = { _id: { $ne: currentUser._id } };
        if (currentUser.blockedUsers?.length) query._id.$nin = currentUser.blockedUsers;
        
        const blockedByOthers = await User.find({ blockedBy: currentUser._id }).distinct('_id');
        if (blockedByOthers.length) {
            query._id.$nin = [...(query._id.$nin || []), ...blockedByOthers];
        }
        
        if (currentUser.gender === 'Homme') query.gender = 'Femme';
        else if (currentUser.gender === 'Femme') query.gender = 'Homme';
        
        let partners = await User.find(query);
        if (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') {
            partners = partners.filter(p => p.genotype === 'AA');
        }
        
        let html = '';
        if (partners.length === 0) {
            html = '<div class="empty-message"><span>🔍</span><h3>' + t('noPartners') + '</h3></div>';
        } else {
            partners.forEach(p => {
                html += '<div class="match-card"><b>' + p.firstName + '</b> • ' + p.genotype + ' • ' + p.residence + '<br><button class="btn-pink" onclick="sendRequest(\'' + p._id + '\')">' + t('contact') + '</button></div>';
            });
        }
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Matching</title>' + styles + notifyScript + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('compatiblePartners') + '</h2>' + html + '<div class="navigation"><a href="/profile" class="nav-link">← ' + t('backProfile') + '</a><a href="/inbox" class="nav-link">' + t('toMessages') + '</a></div></div></div><script>function sendRequest(id){const m=prompt("Votre message:");if(m)fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({receiverId:id,message:m})}).then(()=>alert("✅ Envoyé"))}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur matching');
    }
});

// INBOX
app.get('/inbox', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        const t = req.t;
        
        const messages = await Message.find({ $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }] })
            .populate('senderId receiverId').sort({ timestamp: -1 });
        
        const conv = new Map();
        for (const m of messages) {
            const other = m.senderId._id.equals(currentUser._id) ? m.receiverId : m.senderId;
            if (currentUser.blockedUsers?.includes(other._id)) continue;
            if (!conv.has(other._id.toString())) {
                const unread = await Message.countDocuments({ senderId: other._id, receiverId: currentUser._id, read: false });
                conv.set(other._id.toString(), { user: other, last: m, unread });
            }
        }
        
        let html = '';
        if (conv.size === 0) {
            html = '<div class="empty-message">📭 ' + t('emptyInbox') + '</div>';
        } else {
            conv.forEach((v, k) => {
                html += '<div class="inbox-item ' + (v.unread ? 'unread' : '') + '" onclick="window.location.href=\'/chat?partnerId=' + k + '\'"><b>' + v.user.firstName + '</b> ' + (v.unread ? '<span class="unread-badge">' + v.unread + '</span>' : '') + '<br><small>' + v.last.text.substring(0,30) + '...</small></div>';
            });
        }
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Inbox</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('inboxTitle') + '</h2>' + html + '<div class="navigation"><a href="/profile" class="nav-link">← ' + t('backProfile') + '</a><a href="/matching" class="nav-link">' + t('toMessages') + '</a></div></div></div></body></html>');
    } catch (error) {
        res.status(500).send('Erreur inbox');
    }
});

// CHAT
app.get('/chat', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        const t = req.t;
        const partnerId = req.query.partnerId;
        if (!partnerId) return res.redirect('/inbox');
        const partner = await User.findById(partnerId);
        if (!partner) return res.redirect('/inbox');
        
        if (partner.blockedBy?.includes(currentUser._id)) {
            return res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bloqué</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('blockedByUser') + '</h2><p>' + t('blockedMessage') + '</p><a href="/inbox" class="btn-pink">Retour</a></div></div></body></html>');
        }
        if (currentUser.blockedUsers?.includes(partnerId)) return res.redirect('/inbox');
        
        await Message.updateMany({ senderId: partnerId, receiverId: currentUser._id, read: false }, { read: true });
        const messages = await Message.find({ $or: [{ senderId: currentUser._id, receiverId: partnerId }, { senderId: partnerId, receiverId: currentUser._id }] }).sort({ timestamp: 1 });
        
        let msgs = '';
        messages.forEach(m => {
            const cls = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
            msgs += '<div class="bubble ' + cls + '">' + m.text + '</div>';
        });
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><style>.bubble{padding:10px;margin:5px;border-radius:10px;max-width:80%}.sent{background:#ff416c;color:white;margin-left:auto}.received{background:white}</style>' + styles + '</head><body><div class="app-shell"><div style="background:#1a2a44;color:white;padding:15px;display:flex;justify-content:space-between"><span>' + partner.firstName + '</span><button onclick="blockUser(\'' + partnerId + '\')">🚫 Bloquer</button><button onclick="window.location.href=\'/inbox\'">❌</button></div><div style="padding:20px;min-height:300px;">' + msgs + '</div><div style="display:flex;padding:15px;"><input id="msg" style="flex:1;padding:10px;"><button onclick="send(\'' + partnerId + '\')">Envoyer</button></div></div><script>async function send(id){const m=document.getElementById("msg");if(m.value){await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({receiverId:id,text:m.value})});location.reload()}}async function blockUser(id){if(confirm("Bloquer ?")){await fetch("/api/block/"+id,{method:"POST"});window.location.href="/inbox"}}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur chat');
    }
});

// PARAMÈTRES
app.get('/settings', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const t = req.t;
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Paramètres</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('settingsTitle') + '</h2><div class="st-group"><div class="st-item">' + t('visibility') + '<input type="checkbox"></div><div class="st-item">' + t('notifications') + '<input type="checkbox"></div></div><a href="/edit-profile" class="btn-dark">✏️ ' + t('editProfile') + '</a><a href="/blocked-list" class="btn-dark">🚫 ' + t('blockedUsers') + ' (' + (user.blockedUsers?.length||0) + ')</a><div class="st-group danger-zone"><div class="st-item" style="color:#dc3545;">' + t('dangerZone') + '</div><div class="st-item"><span>' + t('deleteAccount') + '</span><button class="btn-pink" onclick="del()">' + t('delete') + '</button></div></div><div class="navigation"><a href="/profile" class="nav-link">← ' + t('backProfile') + '</a><a href="/logout-success" class="nav-link">' + t('logout') + '</a></div></div></div><script>async function del(){if(confirm("' + t('confirmDelete') + '")){await fetch("/api/delete-account",{method:"DELETE"});window.location.href="/logout-success"}}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

// ÉDITION PROFIL
app.get('/edit-profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const t = req.t;
        const bloodOptions = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => '<option value="' + g + '" ' + (user.bloodGroup === g ? 'selected' : '') + '>' + g + '</option>').join('');
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Edit</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('editProfile') + '</h2><form id="f"><input name="firstName" class="input-box" value="' + user.firstName + '"><input name="lastName" class="input-box" value="' + user.lastName + '"><select name="gender"><option value="Homme"' + (user.gender==='Homme'?' selected':'') + '>' + t('male') + '</option><option value="Femme"' + (user.gender==='Femme'?' selected':'') + '>' + t('female') + '</option></select><input type="date" name="dob" class="input-box" value="' + user.dob + '"><input name="residence" class="input-box" value="' + user.residence + '"><select name="genotype"><option value="AA"' + (user.genotype==='AA'?' selected':'') + '>AA</option><option value="AS"' + (user.genotype==='AS'?' selected':'') + '>AS</option><option value="SS"' + (user.genotype==='SS'?' selected':'') + '>SS</option></select><select name="bloodGroup">' + bloodOptions + '</select><select name="desireChild"><option value="Oui"' + (user.desireChild==='Oui'?' selected':'') + '>' + t('yes') + '</option><option value="Non"' + (user.desireChild==='Non'?' selected':'') + '>' + t('no') + '</option></select><button class="btn-pink">' + t('editProfile') + '</button></form><a href="/profile" class="back-link">← ' + t('backProfile') + '</a></div></div><script>document.getElementById("f").addEventListener("submit",async(e)=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));await fetch("/api/users/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});window.location.href="/profile"});</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

// BLOQUÉS
app.get('/blocked-list', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('blockedUsers');
        const t = req.t;
        let html = '';
        if (user.blockedUsers?.length) {
            user.blockedUsers.forEach(u => {
                html += '<div class="inbox-item" style="justify-content:space-between;"><span>' + u.firstName + ' ' + u.lastName + '</span><button onclick="unblock(\'' + u._id + '\')" style="background:#4CAF50; color:white;">' + t('unblock') + '</button></div>';
            });
        } else {
            html = '<div class="empty-message">🔓 ' + t('noBlocked') + '</div>';
        }
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bloqués</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>' + t('blockedUsers') + '</h2>' + html + '<a href="/settings" class="back-link">← ' + t('backHome') + '</a></div></div><script>async function unblock(id){await fetch("/api/unblock/"+id,{method:"POST"});location.reload()}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

// FIN DE CHAT
app.get('/chat-end', (req, res) => {
    const t = req.t;
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Merci</title>' + styles + '</head><body class="end-overlay"><div class="end-card"><h2>' + t('thankYou') + '</h2><p>' + t('thanksMessage') + '</p><a href="/matching" class="btn-pink">' + t('newSearch') + '</a><a href="/profile" class="btn-dark">' + t('myProfile') + '</a></div></body></html>');
});

// DÉCONNEXION
app.get('/logout-success', (req, res) => {
    const t = req.t;
    req.session.destroy();
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Déconnecté</title>' + styles + '</head><body class="end-overlay"><div class="end-card"><h2>' + t('logoutSuccess') + '</h2><p>' + t('seeYouSoon') + '</p><a href="/" class="btn-pink">' + t('home') + '</a></div></body></html>');
});

// ============================================
// ROUTES API
// ============================================

// CONNEXION
app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ firstName: req.body.firstName }).sort({ createdAt: -1 });
        if (!user) return res.status(404).json({ error: "Not found" });
        req.session.userId = user._id;
        req.session.isVerified = user.isVerified;
        await new Promise(r => req.session.save(r));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ENREGISTREMENT
app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        req.session.userId = user._id;
        req.session.isVerified = false;
        await new Promise(r => req.session.save(r));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// VALIDATION
app.post('/api/validate-honor', requireAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, { isVerified: true });
        req.session.isVerified = true;
        await new Promise(r => req.session.save(r));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ============================================
// ROUTES API POUR LES DEMANDES
// ============================================

// Envoyer une demande
app.post('/api/requests', requireAuth, requireVerified, async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        
        const exists = await Message.findOne({
            $or: [
                { senderId: req.session.userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: req.session.userId }
            ]
        });
        
        if (exists) {
            const msg = new Message({
                senderId: req.session.userId,
                receiverId: receiverId,
                text: message,
                read: false
            });
            await msg.save();
            return res.json({ success: true });
        }
        
        const request = new Request({
            senderId: req.session.userId,
            receiverId: receiverId,
            message: message
        });
        await request.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Récupérer les demandes en attente
app.get('/api/requests/pending', requireAuth, requireVerified, async (req, res) => {
    try {
        const requests = await Request.find({
            receiverId: req.session.userId,
            status: 'pending'
        }).populate('senderId');
        res.json(requests);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Accepter une demande
app.post('/api/requests/:id/accept', requireAuth, requireVerified, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('senderId receiverId');
        if (!request) return res.status(404).json({ error: 'Not found' });
        
        await Message.create({
            senderId: request.senderId._id,
            receiverId: request.receiverId._id,
            text: request.message,
            read: false
        });
        
        await Message.create({
            senderId: request.receiverId._id,
            receiverId: request.senderId._id,
            text: '✅ ' + request.receiverId.firstName + ' a accepté votre demande.',
            read: false
        });
        
        request.status = 'accepted';
        await request.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ignorer une demande
app.post('/api/requests/:id/ignore', requireAuth, requireVerified, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('senderId receiverId');
        if (!request) return res.status(404).json({ error: 'Not found' });
        
        await Message.create({
            senderId: request.receiverId._id,
            receiverId: request.senderId._id,
            text: '🌸 Merci pour votre message. Cette personne préfère ne pas donner suite pour le moment. Continuez votre chemin, la bonne personne vous attend ailleurs.',
            read: false
        });
        
        request.status = 'rejected';
        await request.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ============================================
// AUTRES ROUTES API
// ============================================

app.post('/api/messages', requireAuth, requireVerified, async (req, res) => {
    try {
        const m = new Message({
            senderId: req.session.userId,
            receiverId: req.body.receiverId,
            text: req.body.text,
            read: false
        });
        await m.save();
        res.json(m);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/block/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const u = await User.findById(req.session.userId);
        if (!u.blockedUsers) u.blockedUsers = [];
        if (!u.blockedUsers.includes(req.params.userId)) u.blockedUsers.push(req.params.userId);
        
        const t = await User.findById(req.params.userId);
        if (!t.blockedBy) t.blockedBy = [];
        if (!t.blockedBy.includes(req.session.userId)) t.blockedBy.push(req.session.userId);
        
        await u.save();
        await t.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/unblock/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const u = await User.findById(req.session.userId);
        if (u.blockedUsers) {
            u.blockedUsers = u.blockedUsers.filter(id => id.toString() !== req.params.userId);
        }
        
        const t = await User.findById(req.params.userId);
        if (t.blockedBy) {
            t.blockedBy = t.blockedBy.filter(id => id.toString() !== req.session.userId);
        }
        
        await u.save();
        await t.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/users/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/delete-account', requireAuth, requireVerified, async (req, res) => {
    try {
        const id = req.session.userId;
        await Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });
        await Request.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });
        await User.findByIdAndDelete(id);
        req.session.destroy();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

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