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
    language: { type: String, default: 'fr' },
    isVerified: { type: Boolean, default: false },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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

// NOUVEAU MODÈLE POUR LES DEMANDES
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

requestSchema.index({ receiverId: 1, status: 1 });
const Request = mongoose.model('Request', requestSchema);

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
        noPartners: 'Aucun partenaire trouvé',
        searchOngoing: 'Recherche en cours...',
        expandCommunity: 'Revenez bientôt !',
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
        requestRejected: 'Cette personne préfère ne pas donner suite. Continuez votre chemin, la bonne personne vous attend ailleurs.',
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
    },
    
    en: {
        appName: 'Genlove',
        slogan: 'Unite heart and health to build healthy couples 💑',
        security: '🛡️ Your health data is encrypted',
        welcome: 'Welcome to Genlove',
        haveAccount: 'Already have an account?',
        login: 'Login',
        createAccount: 'Create account',
        loginTitle: 'Login',
        enterName: 'Enter your first name',
        yourName: 'Your first name',
        backHome: '← Back to home',
        nameNotFound: 'Name not found. Please create an account.',
        charterTitle: '📜 The Honor Charter',
        charterSubtitle: 'Read these 5 commitments',
        scrollDown: '⬇️ Scroll to the bottom ⬇️',
        accept: 'I accept',
        
        oath1: '1. The Oath of Sincerity',
        oath1Sub: 'Medical Truth',
        oath1Text: 'I pledge to provide accurate information about my genotype and health data.',
        oath2: '2. The Pact of Confidentiality',
        oath2Sub: 'Shared Secret',
        oath2Text: 'I commit to keeping all personal and medical information confidential.',
        oath3: '3. The Principle of Non-Discrimination',
        oath3Sub: 'Equality of Respect',
        oath3Text: 'I treat every member with dignity, regardless of their genotype.',
        oath4: '4. Preventive Responsibility',
        oath4Sub: 'Health Orientation',
        oath4Text: 'I accept protective measures such as filtering risky compatibilities.',
        oath5: '5. Ethical Benevolence',
        oath5Sub: 'Courtesy',
        oath5Text: 'I adopt exemplary and respectful conduct in my messages.',
        
        signupTitle: 'Create my profile',
        signupSub: 'All information is confidential',
        firstName: 'First name',
        lastName: 'Last name',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        dob: 'Date of birth',
        city: 'City',
        genotype: 'Genotype',
        bloodGroup: 'Blood group',
        desireChild: 'Desire for children?',
        yes: 'Yes',
        no: 'No',
        createProfile: 'Create my profile',
        backCharter: '← Back to charter',
        
        honorTitle: 'Oath of Honor',
        honorText: '"I confirm on my honor that my information is sincere."',
        swear: 'I swear',
        accessProfile: 'Access my profile',
        
        myProfile: 'My Profile',
        home: 'Home',
        messages: 'Messages',
        settings: 'Settings',
        genotype_label: 'Genotype',
        blood_label: 'Blood',
        age_label: 'Age',
        project_label: 'Project',
        findPartner: '🔍 Find a partner',
        editProfile: '✏️ Edit my profile',
        
        compatiblePartners: 'Compatible partners',
        noPartners: 'No partners found',
        searchOngoing: 'Search in progress...',
        expandCommunity: 'Come back soon!',
        details: 'Details',
        contact: 'Contact',
        backProfile: '← My profile',
        toMessages: 'Messages →',
        
        healthCommitment: '🛡️ Your health commitment',
        popupMessageAS: '"As an AS profile, we only show you AA partners."',
        popupMessageSS: '"As an SS profile, we only show you AA partners."',
        understood: 'I understand',
        
        inboxTitle: 'Inbox',
        emptyInbox: '📭 Empty inbox',
        startConversation: 'Start a conversation!',
        findPartners: 'Find partners',
        
        block: '🚫 Block',
        yourMessage: 'Your message...',
        send: 'Send',
        blockedByUser: '⛔ Conversation impossible',
        blockedMessage: 'This user has blocked you.',
        
        settingsTitle: 'Settings',
        visibility: 'Visibility',
        notifications: 'Notifications',
        language: 'Language',
        blockedUsers: 'Blocked',
        dangerZone: '⚠️ DANGER ZONE',
        deleteAccount: '🗑️ Delete my account',
        delete: 'Delete',
        logout: 'Logout',
        confirmDelete: 'Delete permanently?',
        
        noBlocked: 'No blocked users',
        unblock: 'Unblock',
        
        thankYou: 'Thank you',
        thanksMessage: 'Genlove thanks you',
        newSearch: 'New search',
        
        logoutSuccess: 'Logout successful',
        seeYouSoon: 'See you soon!',
        
        french: 'French',
        english: 'English',
        portuguese: 'Portuguese',
        spanish: 'Spanish',
        arabic: 'Arabic',
        chinese: 'Chinese',
        
        pageNotFound: 'Page not found',
        pageNotFoundMessage: 'The page does not exist.',
        
        residence_label: 'Residence',
        project_life: 'Life project',
        
        newRequest: 'New request',
        interested: 'is interested in your profile.',
        whatToDo: 'What would you like to do?',
        openChat: 'Open chat',
        ignore: 'Ignore',
        willBeInformed: 'will be informed of your choice.',
        requestAccepted: 'Your request has been accepted!',
        requestRejected: 'This person prefers not to respond. Continue your journey, the right person is waiting for you elsewhere.',
        day: 'Day',
        month: 'Month',
        year: 'Year',
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December'
    }
};

// ============================================
// MIDDLEWARE DE LANGUE
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
// MIDDLEWARE D'AUTHENTIFICATION
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
        font-family: 'Segoe UI', Roboto, sans-serif; 
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
        margin: 0 auto;
    }
    h1 { font-size: 2.4rem; }
    h2 { font-size: 2rem; color: #1a2a44; }
    .btn-pink { 
        background: #ff416c; 
        color: white; 
        padding: 18px 25px; 
        border-radius: 60px; 
        font-size: 1.2rem;
        font-weight: 600;
        display: block;
        text-align: center;
        text-decoration: none;
        margin: 15px auto;
        width: 90%;
        border: none;
        cursor: pointer;
    }
    .btn-dark { 
        background: #1a2a44; 
        color: white; 
        padding: 18px 25px; 
        border-radius: 60px; 
        font-size: 1.2rem;
        font-weight: 600;
        display: block;
        text-align: center;
        text-decoration: none;
        margin: 15px auto;
        width: 90%;
    }
    .input-box { 
        width: 100%; 
        padding: 15px; 
        border: 2px solid #e2e8f0; 
        border-radius: 15px; 
        margin: 10px 0; 
        font-size: 1.1rem; 
    }
    .photo-circle { 
        width: 140px; 
        height: 140px; 
        border: 4px solid #ff416c; 
        border-radius: 50%; 
        margin: 20px auto; 
        background-size: cover; 
        background-position: center; 
    }
    .match-card, .inbox-item, .st-group { 
        background: white; 
        border-radius: 20px; 
        margin: 15px 0; 
        padding: 15px; 
    }
    .st-item { 
        display: flex; 
        justify-content: space-between; 
        padding: 12px 0; 
        border-bottom: 1px solid #eee; 
    }
    .charte-box {
        height: 400px;
        overflow-y: auto;
        background: #fff5f7;
        border: 2px solid #ffdae0;
        border-radius: 20px;
        padding: 20px;
        margin: 20px 0;
        text-align: left;
    }
    .chat-header { 
        background: #1a2a44; 
        color: white; 
        padding: 15px; 
        display: flex;
        justify-content: space-between;
    }
    .chat-messages { 
        padding: 20px; 
        background: #f5f7fb; 
        min-height: 60vh;
    }
    .bubble { 
        padding: 12px 16px; 
        border-radius: 20px; 
        max-width: 80%; 
        margin: 8px 0;
    }
    .received { background: white; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
    .input-area { 
        padding: 15px; 
        background: white; 
        display: flex;
        gap: 10px;
    }
    .language-selector-compact {
        background: white;
        border-radius: 15px;
        padding: 10px;
        margin: 10px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .language-selector-compact select {
        padding: 8px;
        border: 2px solid #ff416c;
        border-radius: 30px;
    }
    .profile-unread {
        background: #ff416c;
        color: white;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.8rem;
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
        margin-left: 8px;
    }
    .navigation {
        display: flex;
        justify-content: space-between;
        padding: 15px 0;
        gap: 10px;
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
    .empty-message {
        text-align: center;
        padding: 40px;
        color: #666;
    }
    .danger-zone {
        border: 2px solid #dc3545;
        background: #fff5f5;
    }
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
    #request-popup {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 99999;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    .popup-content {
        background: white;
        border-radius: 30px;
        padding: 30px 20px;
        max-width: 380px;
        width: 100%;
        text-align: center;
        border: 3px solid #ff416c;
        animation: slideUp 0.3s;
    }
    @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .popup-icon { font-size: 4rem; margin-bottom: 10px; }
    .popup-title { color: #ff416c; font-size: 1.8rem; font-weight: bold; margin-bottom: 15px; }
    .popup-user { font-size: 1.5rem; font-weight: bold; color: #1a2a44; margin-bottom: 5px; }
    .popup-details { color: #666; margin-bottom: 15px; }
    .popup-message {
        background: #fff5f7; padding: 20px; border-radius: 15px;
        margin: 20px 0; font-style: italic; border: 2px solid #ffdae0;
    }
    .popup-question { font-size: 1.2rem; margin: 20px 0; font-weight: bold; }
    .popup-buttons { display: flex; gap: 15px; margin: 20px 0; }
    .popup-buttons button {
        flex: 1; padding: 15px; border-radius: 50px; border: none;
        font-weight: bold; cursor: pointer;
    }
    .accept-btn { background: #ff416c; color: white; }
    .ignore-btn { background: #1a2a44; color: white; }
    .popup-note { color: #888; font-size: 0.9rem; }
    @media (max-width: 420px) {
        .app-shell { max-width: 100%; }
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
    if (['fr', 'en'].includes(lang)) {
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
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Genlove</title>${styles}</head>
<body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">${t('slogan')}</div><div class="login-prompt">${t('haveAccount')}</div><a href="/login" class="btn-dark">🔐 ${t('login')}</a><a href="/charte-engagement" class="btn-pink">✨ ${t('createAccount')}</a></div></div></body></html>`);
});

// CONNEXION
app.get('/login', (req, res) => {
    const t = req.t;
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Login</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>${t('loginTitle')}</h2><form id="loginForm"><input type="text" id="firstName" class="input-box" placeholder="${t('yourName')}"><button class="btn-pink">${t('login')}</button></form><a href="/" class="back-link">← ${t('backHome')}</a></div></div>
<script>document.getElementById("loginForm").addEventListener("submit",async(e)=>{e.preventDefault();const r=await fetch("/api/login",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({firstName:e.target.firstName.value})});if(r.ok)window.location.href="/profile";else alert("${t('nameNotFound')}");});</script></body></html>`);
});

// CHARTE
app.get('/charte-engagement', (req, res) => {
    const t = req.t;
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Charte</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>${t('charterTitle')}</h2><div class="charte-box" id="charteBox" onscroll="checkScroll(this)"><div class="charte-section"><div class="charte-title">${t('oath1')}</div><p>${t('oath1Text')}</p></div><div class="charte-section"><div class="charte-title">${t('oath2')}</div><p>${t('oath2Text')}</p></div><div class="charte-section"><div class="charte-title">${t('oath3')}</div><p>${t('oath3Text')}</p></div><div class="charte-section"><div class="charte-title">${t('oath4')}</div><p>${t('oath4Text')}</p></div><div class="charte-section"><div class="charte-title">${t('oath5')}</div><p>${t('oath5Text')}</p></div></div><div class="scroll-indicator">${t('scrollDown')}</div><button id="agreeBtn" class="btn-pink" onclick="acceptCharte()" disabled>${t('accept')}</button><a href="/" class="back-link">← ${t('backHome')}</a></div></div>
<script>function checkScroll(e){if(e.scrollHeight-e.scrollTop<=e.clientHeight+5)document.getElementById("agreeBtn").disabled=false}function acceptCharte(){if(!document.getElementById("agreeBtn").disabled)window.location.href="/signup"}</script></body></html>`);
});

// INSCRIPTION
app.get('/signup', (req, res) => {
    const t = req.t;
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Inscription</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>${t('signupTitle')}</h2><form id="signupForm"><div class="input-label">${t('firstName')}</div><input name="firstName" class="input-box" required><div class="input-label">${t('lastName')}</div><input name="lastName" class="input-box" required><div class="input-label">${t('gender')}</div><select name="gender" class="input-box"><option value="Homme">${t('male')}</option><option value="Femme">${t('female')}</option></select><div class="input-label">${t('dob')}</div><input type="date" name="dob" class="input-box" required><div class="input-label">${t('city')}</div><input name="residence" class="input-box" required><div class="input-label">${t('genotype')}</div><select name="genotype" class="input-box"><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select><div class="input-label">${t('bloodGroup')}</div><select name="bloodGroup" class="input-box"><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select><div class="input-label">${t('desireChild')}</div><select name="desireChild" class="input-box"><option value="Oui">${t('yes')}</option><option value="Non">${t('no')}</option></select><input type="hidden" name="language" value="${req.lang}"><button class="btn-pink">${t('createProfile')}</button></form><a href="/charte-engagement" class="back-link">← ${t('backCharter')}</a></div></div>
<script>document.getElementById("signupForm").addEventListener("submit",async(e)=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const r=await fetch("/api/register",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(r.ok)window.location.href="/sas-validation"});</script></body></html>`);
});

// SAS VALIDATION
app.get('/sas-validation', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const t = req.t;
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Validation</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><div style="font-size:5rem;">⚖️</div><h2>${t('honorTitle')}</h2><div style="background:#fff5f7;padding:20px;border-radius:15px;"><p>${t('honorText')}</p></div><label><input type="checkbox" id="honorCheck"> ${t('swear')}</label><button id="validateBtn" class="btn-pink" onclick="validateHonor()" disabled>${t('accessProfile')}</button></div></div>
<script>document.getElementById("honorCheck").addEventListener("change",function(){document.getElementById("validateBtn").disabled=!this.checked});async function validateHonor(){await fetch("/api/validate-honor",{method:"POST"});window.location.href="/profile"}</script></body></html>`);
});

// PROFIL (AVEC POPUP CORRIGÉ)
app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const t = req.t;
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false });
        const genderDisplay = user.gender === 'Homme' ? t('male') : t('female');
        const unreadBadge = unreadCount > 0 ? '<span class="profile-unread">' + unreadCount + '</span>' : '';
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t('appName')} - Profil</title>${styles}${notifyScript}</head>
<body>
<div class="app-shell">
    <div id="request-popup">
        <div class="popup-content">
            <div class="popup-icon">📬</div>
            <div class="popup-title">${t('newRequest')}</div>
            <div class="popup-user" id="popup-user"></div>
            <div class="popup-details" id="popup-details"></div>
            <div class="popup-message" id="popup-message"></div>
            <div class="popup-question">❓ ${t('whatToDo')}</div>
            <div class="popup-buttons">
                <button class="accept-btn" onclick="acceptRequest()">✅ ${t('openChat')}</button>
                <button class="ignore-btn" onclick="ignoreRequest()">🌿 ${t('ignore')}</button>
            </div>
            <div class="popup-note" id="popup-note"></div>
        </div>
    </div>
    <div class="page-white">
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <a href="/" class="btn-dark" style="padding:8px 15px;">🏠 ${t('home')}</a>
            <a href="/inbox" class="btn-pink" style="padding:8px 15px;">📬 ${unreadBadge}</a>
            <a href="/settings" style="font-size:2rem;">⚙️</a>
        </div>
        <div class="language-selector-compact">
            <span>${t('language')}:</span>
            <select onchange="window.location.href='/lang/'+this.value">
                <option value="fr" ${user.language === 'fr' ? 'selected' : ''}>🇫🇷 ${t('french')}</option>
                <option value="en" ${user.language === 'en' ? 'selected' : ''}>🇬🇧 ${t('english')}</option>
            </select>
        </div>
        <div class="photo-circle" style="background-image:url('${user.photo || ''}');"></div>
        <h2>${user.firstName} ${user.lastName}</h2>
        <p>📍 ${user.residence || ''} • ${genderDisplay}</p>
        <div class="st-group">
            <div class="st-item"><span>🧬 ${t('genotype_label')}</span><b>${user.genotype}</b></div>
            <div class="st-item"><span>🩸 ${t('blood_label')}</span><b>${user.bloodGroup}</b></div>
            <div class="st-item"><span>📅 ${t('age_label')}</span><b>${calculerAge(user.dob)} ${t('age_label') === 'Âge' ? 'ans' : 'years'}</b></div>
            <div class="st-item"><span>👶 ${t('project_label')}</span><b>${user.desireChild === 'Oui' ? t('yes') : t('no')}</b></div>
        </div>
        <a href="/matching" class="btn-pink">${t('findPartner')}</a>
    </div>
</div>
<div style="position:fixed; bottom:20px; right:20px; z-index:10000;">
    <button onclick="testPopup()" style="background:#ff416c; color:white; border:none; border-radius:50px; padding:15px 25px; font-size:1.2rem;">🔍 TEST POPUP</button>
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
    document.getElementById('popup-note').innerHTML = 'ℹ️ ' + r.senderId.firstName + ' ${t('willBeInformed')}';
    document.getElementById('request-popup').style.display = 'flex';
    vibrate();
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
    if (confirm('${t('ignore')} ?')) {
        await fetch('/api/requests/' + currentRequestId + '/ignore', {method: 'POST'});
        document.getElementById('request-popup').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', checkRequests);
setInterval(checkRequests, 10000);
</script>
</body></html>`);
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
        if (blockedByOthers.length) query._id.$nin = [...(query._id.$nin || []), ...blockedByOthers];
        if (currentUser.gender === 'Homme') query.gender = 'Femme';
        else if (currentUser.gender === 'Femme') query.gender = 'Homme';
        
        let partners = await User.find(query);
        if (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') {
            partners = partners.filter(p => p.genotype === 'AA');
        }
        
        let html = '';
        partners.forEach(p => {
            html += `<div class="match-card">
                <div><b>${p.firstName}</b> • ${p.genotype} • ${p.residence}</div>
                <div><button class="btn-action" onclick="sendRequest('${p._id}')">${t('contact')}</button></div>
            </div>`;
        });
        
        const popup = (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') ? 
            `<div id="popup" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center;"><div style="background:white; padding:30px; border-radius:20px;"><h3>${t('healthCommitment')}</h3><p>${currentUser.genotype === 'AS' ? t('popupMessageAS') : t('popupMessageSS')}</p><button onclick="this.parentElement.parentElement.remove()">${t('understood')}</button></div></div>` : '';
        
        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Matching</title>${styles}${notifyScript}</head>
<body><div class="app-shell">${popup}<div class="page-white"><h2>${t('compatiblePartners')}</h2>${html || '<div class="empty-message">🔍 ${t('noPartners')}</div>'}<div class="navigation"><a href="/profile" class="nav-link">← ${t('backProfile')}</a><a href="/inbox" class="nav-link">${t('toMessages')}</a></div></div></div>
<script>function sendRequest(id){const m=prompt("Votre message:");if(m)fetch("/api/requests",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({receiverId:id,message:m})}).then(()=>alert("✅ Demande envoyée"))}</script></body></html>`);
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
            html = `<div class="empty-message">📭 ${t('emptyInbox')}</div>`;
        } else {
            conv.forEach((v, k) => {
                html += `<div class="inbox-item ${v.unread ? 'unread' : ''}" onclick="window.location.href='/chat?partnerId=${k}'"><b>${v.user.firstName}</b> ${v.unread ? '<span class="unread-badge">'+v.unread+'</span>' : ''}<br><small>${v.last.text.substring(0,30)}...</small></div>`;
            });
        }
        
        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Inbox</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>${t('inboxTitle')}</h2>${html}<div class="navigation"><a href="/profile" class="nav-link">← ${t('backProfile')}</a><a href="/matching" class="nav-link">${t('toMessages')}</a></div></div></div></body></html>`);
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
            return res.send(`<div class="app-shell"><div class="page-white"><h2>${t('blockedByUser')}</h2><p>${t('blockedMessage')}</p><a href="/inbox" class="btn-pink">Retour</a></div></div>`);
        }
        if (currentUser.blockedUsers?.includes(partnerId)) return res.redirect('/inbox');
        
        await Message.updateMany({ senderId: partnerId, receiverId: currentUser._id, read: false }, { read: true });
        const messages = await Message.find({ $or: [{ senderId: currentUser._id, receiverId: partnerId }, { senderId: partnerId, receiverId: currentUser._id }] }).sort({ timestamp: 1 });
        
        let msgs = '';
        messages.forEach(m => {
            const cls = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
            msgs += `<div class="bubble ${cls}">${m.text}</div>`;
        });
        
        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Chat</title>${styles}</head>
<body><div class="app-shell"><div class="chat-header"><span><b>${partner.firstName}</b></span><button onclick="blockUser('${partnerId}')">${t('block')}</button><button onclick="window.location.href='/inbox'">❌</button></div><div class="chat-messages">${msgs}</div><div class="input-area"><input id="msg" placeholder="${t('yourMessage')}"><button onclick="send('${partnerId}')">${t('send')}</button></div></div>
<script>async function send(id){const m=document.getElementById('msg');if(m.value){await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({receiverId:id,text:m.value})});location.reload()}}async function blockUser(id){if(confirm('${t('block')}?')){await fetch('/api/block/'+id,{method:'POST'});window.location.href='/inbox'}}</script></body></html>`);
    } catch (error) {
        res.status(500).send('Erreur chat');
    }
});

// PARAMÈTRES
app.get('/settings', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const t = req.t;
        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Paramètres</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>${t('settingsTitle')}</h2><div class="st-group"><div class="st-item">${t('visibility')}<input type="checkbox"></div><div class="st-item">${t('notifications')}<input type="checkbox"></div><div class="st-item">${t('language')}<select onchange="window.location.href='/lang/'+this.value"><option value="fr" ${user.language==='fr'?'selected':''}>🇫🇷 Français</option><option value="en" ${user.language==='en'?'selected':''}>🇬🇧 English</option></select></div></div><a href="/edit-profile" class="btn-dark">✏️ ${t('editProfile')}</a><a href="/blocked-list" class="btn-dark">🚫 ${t('blockedUsers')} (${user.blockedUsers?.length||0})</a><div class="st-group danger-zone"><div class="st-item" style="color:#dc3545;">${t('dangerZone')}</div><div class="st-item"><span>${t('deleteAccount')}</span><button onclick="deleteAccount()" class="btn-block">${t('delete')}</button></div></div><div class="navigation"><a href="/profile" class="nav-link">← ${t('backProfile')}</a><a href="/logout-success" class="nav-link">${t('logout')}</a></div></div></div>
<script>async function deleteAccount(){if(confirm('${t('confirmDelete')}')){await fetch('/api/delete-account',{method:'DELETE'});window.location.href='/logout-success'}}</script></body></html>`);
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

// ÉDITION PROFIL
app.get('/edit-profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const t = req.t;
        const bloodOptions = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => `<option value="${g}" ${user.bloodGroup===g?'selected':''}>${g}</option>`).join('');
        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Edit</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>${t('editProfile')}</h2><form id="editForm"><input name="firstName" class="input-box" value="${user.firstName}"><input name="lastName" class="input-box" value="${user.lastName}"><select name="gender"><option value="Homme" ${user.gender==='Homme'?'selected':''}>${t('male')}</option><option value="Femme" ${user.gender==='Femme'?'selected':''}>${t('female')}</option></select><input type="date" name="dob" class="input-box" value="${user.dob}"><input name="residence" class="input-box" value="${user.residence}"><select name="genotype"><option value="AA" ${user.genotype==='AA'?'selected':''}>AA</option><option value="AS" ${user.genotype==='AS'?'selected':''}>AS</option><option value="SS" ${user.genotype==='SS'?'selected':''}>SS</option></select><select name="bloodGroup">${bloodOptions}</select><select name="desireChild"><option value="Oui" ${user.desireChild==='Oui'?'selected':''}>${t('yes')}</option><option value="Non" ${user.desireChild==='Non'?'selected':''}>${t('no')}</option></select><button class="btn-pink">${t('editProfile')}</button></form><a href="/profile" class="back-link">← ${t('backProfile')}</a></div></div>
<script>document.getElementById("editForm").addEventListener("submit",async(e)=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));await fetch("/api/users/profile",{method:"PUT",headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});window.location.href="/profile"});</script></body></html>`);
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
                html += `<div class="inbox-item" style="justify-content:space-between;"><span>${u.firstName} ${u.lastName}</span><button onclick="unblock('${u._id}')" style="background:#4CAF50; color:white;">${t('unblock')}</button></div>`;
            });
        } else {
            html = `<div class="empty-message">🔓 ${t('noBlocked')}</div>`;
        }
        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Bloqués</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>${t('blockedUsers')}</h2>${html}<a href="/settings" class="back-link">← ${t('backHome')}</a></div></div>
<script>async function unblock(id){await fetch('/api/unblock/'+id,{method:'POST'});location.reload()}</script></body></html>`);
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

// FIN DE CHAT
app.get('/chat-end', (req, res) => {
    const t = req.t;
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Merci</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2>${t('thankYou')}</h2><p>${t('thanksMessage')}</p><a href="/matching" class="btn-pink">${t('newSearch')}</a><a href="/profile" class="btn-dark">${t('myProfile')}</a></div></body></html>`);
});

// DÉCONNEXION
app.get('/logout-success', (req, res) => {
    const t = req.t;
    req.session.destroy();
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Déconnecté</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2>${t('logoutSuccess')}</h2><p>${t('seeYouSoon')}</p><a href="/" class="btn-pink">${t('home')}</a></div></body></html>`);
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

// DEMANDES
app.post('/api/requests', requireAuth, requireVerified, async (req, res) => {
    try {
        const exists = await Message.findOne({ $or: [{ senderId: req.session.userId, receiverId: req.body.receiverId }, { senderId: req.body.receiverId, receiverId: req.session.userId }] });
        if (exists) {
            const msg = new Message({ senderId: req.session.userId, receiverId: req.body.receiverId, text: req.body.message, read: false });
            await msg.save();
            return res.json({ success: true, direct: true });
        }
        const request = new Request({ senderId: req.session.userId, receiverId: req.body.receiverId, message: req.body.message });
        await request.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/requests/pending', requireAuth, requireVerified, async (req, res) => {
    try {
        const reqs = await Request.find({ receiverId: req.session.userId, status: 'pending' }).populate('senderId');
        res.json(reqs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/requests/:id/accept', requireAuth, requireVerified, async (req, res) => {
    try {
        const r = await Request.findById(req.params.id).populate('senderId receiverId');
        if (!r) return res.status(404).json({ error: 'Not found' });
        if (r.receiverId._id.toString() !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });
        await Message.create({ senderId: r.senderId._id, receiverId: r.receiverId._id, text: r.message, read: false });
        await Message.create({ senderId: r.receiverId._id, receiverId: r.senderId._id, text: '✅ ' + r.receiverId.firstName + ' a accepté votre demande.', read: false });
        r.status = 'accepted';
        await r.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/requests/:id/ignore', requireAuth, requireVerified, async (req, res) => {
    try {
        const r = await Request.findById(req.params.id).populate('senderId receiverId');
        if (!r) return res.status(404).json({ error: 'Not found' });
        if (r.receiverId._id.toString() !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });
        await Message.create({ senderId: r.receiverId._id, receiverId: r.senderId._id, text: '🌸 Merci pour votre message. Cette personne préfère ne pas donner suite pour le moment. Continuez votre chemin, la bonne personne vous attend ailleurs.', read: false });
        r.status = 'rejected';
        await r.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// MESSAGES
app.post('/api/messages', requireAuth, requireVerified, async (req, res) => {
    try {
        const m = new Message({ senderId: req.session.userId, receiverId: req.body.receiverId, text: req.body.text, read: false });
        await m.save();
        res.json(m);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/messages/unread', requireAuth, requireVerified, async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiverId: req.session.userId, read: false });
        res.json({ count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// BLOCAGE
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
        if (u.blockedUsers) u.blockedUsers = u.blockedUsers.filter(id => id.toString() !== req.params.userId);
        const t = await User.findById(req.params.userId);
        if (t.blockedBy) t.blockedBy = t.blockedBy.filter(id => id.toString() !== req.session.userId);
        await u.save();
        await t.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PROFIL
app.put('/api/users/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// SUPPRESSION
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

// SANTÉ
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ============================================
// GESTION 404
// ============================================
app.use((req, res) => {
    const t = req.t;
    res.status(404).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2>${t('pageNotFound')}</h2><p>${t('pageNotFoundMessage')}</p><a href="/" class="btn-pink">${t('home')}</a></div></body></html>`);
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