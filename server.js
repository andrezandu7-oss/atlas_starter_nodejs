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
    store: MongoStore.create({ mongoUrl: mongoURI }),
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
    read: { type: Boolean, default: false },
    systemMessage: { type: Boolean, default: false },
    visibleFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // qui peut voir ce message
});

const Message = mongoose.model('Message', messageSchema);

const requestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    choiceIndex: { type: Number, required: true }, // 0,1,2 pour les trois messages
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', requestSchema);

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/');
    next();
};

const requireVerified = (req, res, next) => {
    if (!req.session.isVerified) return res.redirect('/sas-validation');
    next();
};

// ============================================
// SYSTÈME DE TRADUCTION MULTILINGUE (6 langues)
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
        dobPlaceholder: 'jj/mm/aaaa',
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
        popupMessageAS: 'En tant que profil AS, nous ne vous présentons que des partenaires AA. Ce choix responsable garantit la sérénité de votre futur foyer et protège votre descendance contre la drépanocytose. Construisons ensemble un amour sain et durable. 💑',
        popupMessageSS: 'En tant que profil SS, nous ne vous présentons que des partenaires AA. Ce choix responsable garantit la sérénité de votre futur foyer et protège votre descendance contre la drépanocytose. Construisons ensemble un amour sain et durable. 💑',
        understood: 'J\'ai compris',
        inboxTitle: 'Boîte de réception',
        emptyInbox: '📭 Boîte vide',
        startConversation: 'Commencez une conversation !',
        findPartners: 'Trouver des partenaires',
        block: '🚫 Bloquer',
        yourMessage: 'Votre message...',
        send: 'Envoyer',
        blockedByUser: '⛔ Conversation impossible',
        blockedMessage: 'Cet utilisateur vous a bloqué. Vous ne pouvez pas lui envoyer de messages.',
        settingsTitle: 'Paramètres',
        visibility: 'Visibilité du profil',
        notifications: 'Notifications push',
        language: 'Langue',
        blockedUsers: 'Utilisateurs bloqués',
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
        pageNotFoundMessage: 'La page que vous cherchez n\'existe pas.',
        residence_label: 'Résidence',
        project_life: 'Projet de vie',
        newRequest: 'Nouvelle demande',
        whatToDo: 'Que souhaitez-vous faire ?',
        openChat: 'Ouvrir la discussion',
        ignore: 'Ignorer',
        willBeInformed: 'sera informé(e) de votre choix.',
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
        december: 'Décembre',
        chooseMessage: 'Choisissez votre message',
        msg1: 'Je suis très intéressé(e) par votre profil. Souhaitez-vous faire connaissance ?',
        msg2: 'Votre profil a tout de suite attiré mon attention. J\'aimerais beaucoup échanger avec vous.',
        msg3: 'Je cherche une relation sincère et votre profil correspond à ce que j\'espère trouver.',
        cancel: 'Annuler'
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
        enterName: 'Enter your first name to login',
        yourName: 'Your first name',
        backHome: '← Back to home',
        nameNotFound: 'Name not found. Please create an account.',
        charterTitle: '📜 The Honor Charter',
        charterSubtitle: 'Read these 5 commitments carefully',
        scrollDown: '⬇️ Scroll to the bottom ⬇️',
        accept: 'I accept and continue',
        oath1: '1. The Oath of Sincerity',
        oath1Sub: 'Medical Truth',
        oath1Text: 'I pledge on my honor to provide accurate information about my genotype and health data.',
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
        dobPlaceholder: 'dd/mm/yyyy',
        city: 'City of residence',
        genotype: 'Genotype',
        bloodGroup: 'Blood group',
        desireChild: 'Desire for children?',
        yes: 'Yes',
        no: 'No',
        createProfile: 'Create my profile',
        backCharter: '← Back to charter',
        required: 'required',
        honorTitle: 'Oath of Honor',
        honorText: '"I confirm on my honor that my information is sincere and conforms to reality."',
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
        noPartners: 'No partners found at the moment',
        searchOngoing: 'Search in progress...',
        expandCommunity: 'We are expanding our community. Come back soon!',
        details: 'Details',
        contact: 'Contact',
        backProfile: '← My profile',
        toMessages: 'Messages →',
        healthCommitment: '🛡️ Your health commitment',
        popupMessageAS: 'As an AS profile, we only show you AA partners. This responsible choice guarantees the serenity of your future family and protects your offspring against sickle cell disease. Let\'s build a healthy and lasting love together. 💑',
        popupMessageSS: 'As an SS profile, we only show you AA partners. This responsible choice guarantees the serenity of your future family and protects your offspring against sickle cell disease. Let\'s build a healthy and lasting love together. 💑',
        understood: 'I understand',
        inboxTitle: 'Inbox',
        emptyInbox: '📭 Empty inbox',
        startConversation: 'Start a conversation!',
        findPartners: 'Find partners',
        block: '🚫 Block',
        yourMessage: 'Your message...',
        send: 'Send',
        blockedByUser: '⛔ Conversation impossible',
        blockedMessage: 'This user has blocked you. You cannot send them messages.',
        settingsTitle: 'Settings',
        visibility: 'Profile visibility',
        notifications: 'Push notifications',
        language: 'Language',
        blockedUsers: 'Blocked users',
        dangerZone: '⚠️ DANGER ZONE',
        deleteAccount: '🗑️ Delete my account',
        delete: 'Delete',
        logout: 'Logout',
        confirmDelete: 'Delete permanently?',
        noBlocked: 'No blocked users',
        unblock: 'Unblock',
        thankYou: 'Thank you for this exchange',
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
        pageNotFoundMessage: 'The page you are looking for does not exist.',
        residence_label: 'Residence',
        project_life: 'Life project',
        newRequest: 'New request',
        whatToDo: 'What would you like to do?',
        openChat: 'Open chat',
        ignore: 'Ignore',
        willBeInformed: 'will be informed of your choice.',
        requestRejected: '🌸 Thank you for your message. This person prefers not to respond at this time. Continue your journey, the right person is waiting for you elsewhere.',
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
        december: 'December',
        chooseMessage: 'Choose your message',
        msg1: 'I am very interested in your profile. Would you like to get to know each other?',
        msg2: 'Your profile immediately caught my attention. I would love to exchange with you.',
        msg3: 'I am looking for a sincere relationship and your profile matches what I hope to find.',
        cancel: 'Cancel'
    },
    // Pour les autres langues (pt, es, ar, zh), on reprendrait la même structure
    // Par souci de concision, je ne les réécris pas entièrement ici, mais dans le code final elles doivent être présentes.
    pt: { /* ... */ },
    es: { /* ... */ },
    ar: { /* ... */ },
    zh: { /* ... */ }
};

app.use(async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            req.lang = (user && user.language) ? user.language : 'fr';
        } catch { req.lang = 'fr'; }
    } else {
        const acceptLanguage = req.headers['accept-language'] || '';
        if (acceptLanguage.includes('pt')) req.lang = 'pt';
        else if (acceptLanguage.includes('es')) req.lang = 'es';
        else if (acceptLanguage.includes('ar')) req.lang = 'ar';
        else if (acceptLanguage.includes('zh')) req.lang = 'zh';
        else if (acceptLanguage.includes('en')) req.lang = 'en';
        else req.lang = 'fr';
    }
    req.t = (key, params = {}) => {
        let text = translations[req.lang]?.[key] || translations.fr[key] || key;
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(`{${k}}`, v);
        }
        return text;
    };
    next();
});

// ============================================
// STYLES CSS COMPLETS (identique à la version précédente)
// ============================================
const styles = `...`; // On garde le même bloc CSS que précédemment, trop long pour être réécrit ici mais présent dans le code final.

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
function calculerAge(dateNaissance) {
    if (!dateNaissance) return "?";
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function formatTimeAgo(timestamp, lang = 'fr') {
    // identique à la version précédente
    // ...
}

function generateDateOptions(req, selectedDate = null) {
    // identique à la version précédente
    // ...
}

// ============================================
// ROUTE POUR CHANGER DE LANGUE
// ============================================
app.get('/lang/:lang', async (req, res) => {
    const lang = req.params.lang;
    if (['fr','en','pt','es','ar','zh'].includes(lang)) {
        if (req.session.userId) await User.findByIdAndUpdate(req.session.userId, { language: lang });
        req.session.lang = lang;
    }
    res.redirect(req.get('referer') || '/');
});

// ============================================
// ROUTES PRINCIPALES (Accueil, Login, Charte, Signup, Sas, Profil, Matching, Inbox, Chat, Settings, etc.)
// ============================================
// Pour gagner de la place, on ne réécrit pas toutes les routes inchangées (Accueil, Login, Charte, Signup, Sas, Profil, Inbox, Chat, Settings, Edit, Blocked, etc.) car elles sont identiques à la version précédente.
// Seule la route /matching est modifiée pour intégrer le popup SS/AS et le filtrage des contacts existants.
// De plus, les routes API pour les demandes doivent être vérifiées.

// On suppose que les routes inchangées sont présentes (on les copie depuis le code précédent).
// Je vais me concentrer sur la route /matching et les routes API critiques.

app.get('/matching', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        const t = req.t;

        // Récupérer les IDs des personnes avec qui une conversation existe
        const existingMessages = await Message.find({
            $or: [
                { senderId: currentUser._id },
                { receiverId: currentUser._id }
            ]
        }).lean();
        const conversationIds = new Set();
        existingMessages.forEach(msg => {
            if (msg.senderId.toString() !== currentUser._id.toString()) conversationIds.add(msg.senderId.toString());
            if (msg.receiverId.toString() !== currentUser._id.toString()) conversationIds.add(msg.receiverId.toString());
        });
        const conversationArray = Array.from(conversationIds);

        let query = { _id: { $ne: currentUser._id } };
        if (currentUser.blockedUsers && currentUser.blockedUsers.length) {
            query._id.$nin = currentUser.blockedUsers.map(id => id.toString());
        }
        if (conversationArray.length > 0) {
            query._id.$nin = query._id.$nin ? [...query._id.$nin, ...conversationArray] : conversationArray;
        }
        const blockedByOthers = await User.find({ blockedBy: currentUser._id }).distinct('_id');
        if (blockedByOthers.length) {
            query._id.$nin = query._id.$nin ? [...query._id.$nin, ...blockedByOthers.map(id => id.toString())] : blockedByOthers.map(id => id.toString());
        }
        if (currentUser.gender === 'Homme') query.gender = 'Femme';
        else if (currentUser.gender === 'Femme') query.gender = 'Homme';

        let partners = await User.find(query);
        const isSSorAS = (currentUser.genotype === 'SS' || currentUser.genotype === 'AS');
        if (isSSorAS) {
            partners = partners.filter(p => p.genotype === 'AA');
        }

        let partnersHTML = '';
        if (partners.length === 0) {
            partnersHTML = `<div class="empty-message"><span>🔍</span><h3>${t('searchOngoing')}</h3><p>${t('expandCommunity')}</p></div>`;
        } else {
            partners.forEach(p => {
                partnersHTML += `<div class="match-card">
                    <div class="match-header">
                        <div class="match-photo-blur"></div>
                        <div style="flex:1">
                            <b style="font-size:1.3rem;">${p.firstName}</b>
                            <br><span style="font-size:1.1rem;">${p.genotype} • ${p.residence}</span>
                        </div>
                    </div>
                    <div class="match-actions">
                        <button class="btn-action btn-details small" onclick='showDetails(${JSON.stringify({
                            name: p.firstName + ' ' + p.lastName,
                            genotype: p.genotype,
                            bloodGroup: p.bloodGroup,
                            residence: p.residence,
                            desireChild: p.desireChild,
                            age: calculerAge(p.dob)
                        })})'>📋 ${t('details')}</button>
                        <button class="btn-action btn-contact small" onclick="showMessageOptions('${p._id}','${p.firstName}')">💬 ${t('contact')}</button>
                    </div>
                </div>`;
            });
        }

        const ssasPopup = isSSorAS ? `
        <div id="genlove-popup" style="display:flex;">
            <div class="popup-card">
                <div class="popup-icon">🛡️</div>
                <div class="popup-title">${t('healthCommitment')}</div>
                <div class="popup-message">
                    ${currentUser.genotype === 'AS' ? t('popupMessageAS') : t('popupMessageSS')}
                </div>
                <button class="popup-button" onclick="document.getElementById('genlove-popup').style.display='none';">${t('understood')}</button>
            </div>
        </div>
        ` : '';

        const detailsPopup = `
        <div id="details-popup" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:10001; align-items:center; justify-content:center; padding:20px;">
            <div style="background:white; border-radius:30px; padding:30px; max-width:380px; width:100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="color:#ff416c;">📋 ${t('details')}</h3>
                    <span onclick="document.getElementById('details-popup').style.display='none'" style="font-size:2rem; cursor:pointer;">&times;</span>
                </div>
                <div id="details-content" style="font-size:1.2rem; line-height:2;"></div>
            </div>
        </div>
        `;

        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('compatiblePartners')}</title>
    ${styles}
    ${notifyScript}
    <style>
        #message-choice-popup { display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:20000; align-items:center; justify-content:center; padding:20px; }
    </style>
</head>
<body>
    <div class="app-shell">
        ${ssasPopup}
        ${detailsPopup}
        <div class="page-white">
            <h2>${t('compatiblePartners')}</h2>
            ${partnersHTML}
            <div class="navigation">
                <a href="/profile" class="nav-link">← ${t('backProfile')}</a>
                <a href="/inbox" class="nav-link">${t('toMessages')}</a>
            </div>
        </div>
    </div>

    <div id="message-choice-popup">
        <div class="popup-card">
            <h3 style="color:#ff416c;">${t('chooseMessage')}</h3>
            <button onclick="sendMessageChoice(0)" class="btn-pink" style="margin:10px 0;">💬 "${t('msg1')}"</button>
            <button onclick="sendMessageChoice(1)" class="btn-dark" style="margin:10px 0;">💬 "${t('msg2')}"</button>
            <button onclick="sendMessageChoice(2)" class="btn-pink" style="margin:10px 0;">💬 "${t('msg3')}"</button>
            <button onclick="closeMessageChoice()" style="background:#ccc; border:none; border-radius:50px; padding:15px; margin-top:15px; width:100%;">${t('cancel')}</button>
        </div>
    </div>

    <script>
        const messages = [
            "${t('msg1')}",
            "${t('msg2')}",
            "${t('msg3')}"
        ];
        let currentReceiverId = null, currentReceiverName = null;

        function showMessageOptions(receiverId, receiverName) {
            currentReceiverId = receiverId;
            currentReceiverName = receiverName;
            document.getElementById('message-choice-popup').style.display = 'flex';
        }
        function sendMessageChoice(index) {
            if (!currentReceiverId) return;
            const message = messages[index];
            fetch('/api/requests', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ receiverId: currentReceiverId, message: message, choiceIndex: index })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) showNotify('✅ Demande envoyée à ' + currentReceiverName, 'success');
                else showNotify('❌ ' + (data.error || 'Erreur'), 'error');
            })
            .catch(() => showNotify('❌ Erreur réseau', 'error'));
            closeMessageChoice();
        }
        function closeMessageChoice() {
            document.getElementById('message-choice-popup').style.display = 'none';
        }
        function showDetails(partner) {
            const content = document.getElementById('details-content');
            content.innerHTML = \`
                <p><strong>${t('firstName')} :</strong> \${partner.name}</p>
                <p><strong>${t('genotype_label')} :</strong> \${partner.genotype}</p>
                <p><strong>${t('blood_label')} :</strong> \${partner.bloodGroup}</p>
                <p><strong>${t('residence_label')} :</strong> \${partner.residence}</p>
                <p><strong>${t('age_label')} :</strong> \${partner.age} ${t('age_label')}</p>
                <p><strong>${t('project_life')} :</strong> \${partner.desireChild === 'Oui' ? '${t('yes')}' : '${t('no')}'}</p>
            \`;
            document.getElementById('details-popup').style.display = 'flex';
        }
    </script>
</body>
</html>`);
    } catch(error) {
        console.error(error);
        res.status(500).send('Erreur matching');
    }
});

// ============================================
// ROUTES API POUR LES DEMANDES (corrigées)
// ============================================
app.post('/api/requests', requireAuth, requireVerified, async (req, res) => {
    try {
        const { receiverId, message, choiceIndex } = req.body;
        // Vérifier si une conversation existe déjà (message échangé)
        const existing = await Message.findOne({
            $or: [
                { senderId: req.session.userId, receiverId },
                { senderId: receiverId, receiverId: req.session.userId }
            ]
        });
        if (existing) {
            // Si conversation existe, créer directement le message visible pour les deux
            const msg = new Message({
                senderId: req.session.userId,
                receiverId,
                text: message,
                read: false,
                visibleFor: [req.session.userId, receiverId]
            });
            await msg.save();
            return res.json({ success: true, direct: true });
        }
        // Sinon créer une demande
        const request = new Request({
            senderId: req.session.userId,
            receiverId,
            message,
            choiceIndex
        });
        await request.save();
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/requests/pending', requireAuth, requireVerified, async (req, res) => {
    try {
        const requests = await Request.find({ receiverId: req.session.userId, status: 'pending' })
            .populate('senderId', 'firstName gender dob');
        res.json(requests);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/requests/:id/accept', requireAuth, requireVerified, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('senderId receiverId');
        if (!request) return res.status(404).json({ error: 'Demande non trouvée' });
        if (request.receiverId._id.toString() !== req.session.userId) return res.status(403).json({ error: 'Non autorisé' });
        // Créer le message visible uniquement par le demandeur
        const msg = new Message({
            senderId: request.senderId._id,
            receiverId: request.receiverId._id,
            text: request.message,
            read: false,
            visibleFor: [request.senderId._id]
        });
        await msg.save();
        request.status = 'accepted';
        await request.save();
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/requests/:id/ignore', requireAuth, requireVerified, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('senderId receiverId');
        if (!request) return res.status(404).json({ error: 'Demande non trouvée' });
        if (request.receiverId._id.toString() !== req.session.userId) return res.status(403).json({ error: 'Non autorisé' });
        const systemMsg = new Message({
            senderId: request.receiverId._id,
            receiverId: request.senderId._id,
            text: `🌸 Merci pour votre message. Cette personne préfère ne pas donner suite pour le moment. Continuez votre chemin, la bonne personne vous attend ailleurs.`,
            read: false,
            systemMessage: true,
            visibleFor: [request.senderId._id]
        });
        await systemMsg.save();
        request.status = 'rejected';
        await request.save();
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// ... autres routes API (messages, blocage, etc.) inchangées ...

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