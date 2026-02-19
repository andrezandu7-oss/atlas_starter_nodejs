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
    systemMessage: { type: Boolean, default: false }, // Pour les messages de rejet
    visibleFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Qui peut voir ce message
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
// SYSTÈME DE TRADUCTION SIMPLIFIÉ (pour cet exemple, on garde seulement le français)
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
        // ... (on peut raccourcir pour l'exemple)
    }
};

app.use(async (req, res, next) => {
    // Langue par défaut français
    req.lang = 'fr';
    req.t = (key) => translations.fr[key] || key;
    next();
});

// ============================================
// STYLES CSS (version simplifiée pour la lisibilité, mais fonctionnelle)
// ============================================
const styles = `
<style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width:100%; max-width:420px; min-height:100vh; background:#f4e9da; display:flex; flex-direction:column; }
    h2 { color:#1a2a44; margin-bottom:20px; }
    .btn-pink { background:#ff416c; color:white; padding:15px; border-radius:50px; text-align:center; text-decoration:none; display:block; width:90%; margin:10px auto; border:none; cursor:pointer; }
    .btn-dark { background:#1a2a44; color:white; padding:15px; border-radius:50px; text-align:center; text-decoration:none; display:block; width:90%; margin:10px auto; }
    .input-box { width:100%; padding:12px; border:1px solid #ccc; border-radius:8px; margin:8px 0; }
    .page-white { background:white; min-height:100vh; padding:20px; }
    .st-group { background:#f8f9fa; border-radius:10px; padding:10px; margin:10px 0; }
    .st-item { display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; }
    .photo-circle { width:120px; height:120px; border:3px solid #ff416c; border-radius:50%; margin:0 auto 20px; background-size:cover; background-position:center; }
    #request-popup, #message-choice-popup, #system-popup { display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.9); z-index:10000; align-items:center; justify-content:center; padding:20px; }
    .popup-card { background:white; border-radius:30px; padding:30px; max-width:380px; width:100%; text-align:center; border:3px solid #ff416c; }
    .popup-buttons { display:flex; gap:15px; margin:20px 0; }
    .popup-buttons button { flex:1; padding:15px; border:none; border-radius:50px; font-weight:bold; cursor:pointer; }
    .accept-btn { background:#ff416c; color:white; }
    .ignore-btn { background:#1a2a44; color:white; }
    .unread-badge { background:#ff416c; color:white; padding:2px 8px; border-radius:10px; margin-left:5px; }
    .inbox-item { background:white; padding:15px; border-radius:10px; margin:10px 0; cursor:pointer; }
    .inbox-item.unread { background:#e8f0fe; border-left:5px solid #ff416c; }
    .navigation { display:flex; gap:10px; margin-top:20px; }
    .nav-link { background:white; padding:10px; border-radius:20px; text-decoration:none; color:#1a2a44; flex:1; text-align:center; }
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

// ============================================
// ROUTES PRINCIPALES
// ============================================

// Accueil (simplifié)
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles}${notifyScript}</head>
<body><div class="app-shell"><div style="text-align:center;padding:50px;"><h1 style="font-size:3rem;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></h1><p>Unissez cœur et santé</p><a href="/charte-engagement" class="btn-pink">Créer un compte</a><a href="/login" class="btn-dark">Se connecter</a></div></div></body></html>`);
});

// Login (simplifié)
app.get('/login', (req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">${styles}${notifyScript}</head>
<body><div class="app-shell"><div class="page-white"><h2>Connexion</h2><form id="loginForm"><input type="text" id="firstName" class="input-box" placeholder="Votre prénom"><button class="btn-pink">Se connecter</button></form><a href="/" class="back-link">← Retour</a></div></div>
<script>document.getElementById("loginForm").addEventListener("submit",async(e)=>{e.preventDefault();const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:e.target.firstName.value})});if(r.ok)window.location.href="/profile";else alert("Prénom non trouvé");});</script></body></html>`);
});

// Charte (simplifiée)
app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">${styles}${notifyScript}</head>
<body><div class="app-shell"><div class="page-white"><h2>Charte d'honneur</h2><div class="charte-box" id="box"><p>Engagement 1</p><p>Engagement 2</p><p>Engagement 3</p><p>Engagement 4</p><p>Engagement 5</p></div><button id="btn" class="btn-pink" onclick="window.location.href='/signup'" disabled>Accepter</button><a href="/">Retour</a></div></div>
<script>document.getElementById("box").addEventListener("scroll",function(){if(this.scrollHeight-this.scrollTop<=this.clientHeight+5)document.getElementById("btn").disabled=false});</script></body></html>`);
});

// Inscription (simplifiée)
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">${styles}${notifyScript}</head>
<body><div class="app-shell"><div class="page-white"><h2>Inscription</h2><form id="f"><input class="input-box" name="firstName" placeholder="Prénom" required><input class="input-box" name="lastName" placeholder="Nom" required><select class="input-box" name="gender"><option value="Homme">Homme</option><option value="Femme">Femme</option></select><input class="input-box" type="date" name="dob" required><input class="input-box" name="residence" placeholder="Ville" required><select class="input-box" name="genotype"><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select><select class="input-box" name="bloodGroup"><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select><select class="input-box" name="desireChild"><option value="Oui">Oui</option><option value="Non">Non</option></select><button class="btn-pink">Créer</button></form></div></div>
<script>document.getElementById("f").addEventListener("submit",async(e)=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const r=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});if(r.ok)window.location.href="/sas-validation"});</script></body></html>`);
});

// Sas de validation (simplifié)
app.get('/sas-validation', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">${styles}${notifyScript}</head>
<body><div class="app-shell"><div class="page-white"><h2>Validation</h2><p>Je confirme sur l'honneur que mes informations sont exactes</p><label><input type="checkbox" id="c"> Je le jure</label><button class="btn-pink" id="b" onclick="validate()" disabled>Continuer</button></div></div>
<script>document.getElementById("c").addEventListener("change",function(){document.getElementById("b").disabled=!this.checked});async function validate(){await fetch("/api/validate-honor",{method:"POST"});window.location.href="/profile"}</script></body></html>`);
});

// PROFIL avec popup de demande automatique et gestion des messages système
app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false, systemMessage: false });
        const genderDisplay = user.gender === 'Homme' ? 'Homme' : 'Femme';
        const unreadBadge = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : '';

        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil</title>
    ${styles}
    ${notifyScript}
    <style>
        #request-popup, #system-popup {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <!-- Popup de demande (destinataire) -->
        <div id="request-popup">
            <div class="popup-card">
                <div class="popup-icon">📬</div>
                <h3 style="color:#ff416c;">Nouvelle demande</h3>
                <div id="popup-message" style="margin:20px 0; font-size:1.2rem;"></div>
                <div class="popup-buttons">
                    <button class="accept-btn" onclick="acceptRequest()">✅ Accepter</button>
                    <button class="ignore-btn" onclick="ignoreRequest()">🌿 Ignorer</button>
                </div>
                <div id="popup-note" style="color:#888;"></div>
            </div>
        </div>

        <!-- Popup système (rejet) -->
        <div id="system-popup">
            <div class="popup-card">
                <div class="popup-icon">🌸</div>
                <h3 style="color:#ff416c;">Réponse à votre demande</h3>
                <div id="system-message" style="margin:20px 0;"></div>
                <button class="btn-pink" onclick="closeSystemPopup()">OK</button>
            </div>
        </div>

        <div class="page-white">
            <div style="display:flex; justify-content:space-between;">
                <a href="/" class="btn-dark" style="padding:8px;">Accueil</a>
                <a href="/inbox" class="btn-pink" style="padding:8px;">📬 ${unreadBadge}</a>
                <a href="/settings" style="font-size:2rem;">⚙️</a>
            </div>
            <div class="photo-circle"></div>
            <h2>${user.firstName} ${user.lastName}</h2>
            <p>📍 ${user.residence} • ${genderDisplay}</p>
            <div class="st-group">
                <div class="st-item">Génotype: <b>${user.genotype}</b></div>
                <div class="st-item">Groupe: <b>${user.bloodGroup}</b></div>
                <div class="st-item">Âge: <b>${calculerAge(user.dob)} ans</b></div>
            </div>
            <a href="/matching" class="btn-pink">Trouver un partenaire</a>
        </div>
    </div>

    <script>
        let currentRequestId = null;
        let currentSenderId = null;

        // Vérifier les demandes en attente
        async function checkPendingRequests() {
            try {
                const res = await fetch('/api/requests/pending');
                const requests = await res.json();
                if (requests.length > 0) showRequestPopup(requests[0]);
            } catch (e) {}
        }

        function showRequestPopup(r) {
            currentRequestId = r._id;
            currentSenderId = r.senderId._id;
            const prenom = r.senderId.firstName;
            const genre = r.senderId.gender === 'Homme' ? 'Monsieur' : 'Madame';
            let message = '';
            switch (r.choiceIndex) {
                case 0: message = `${genre} ${prenom} est intéressé(e) par votre profil. Souhaitez-vous accepter sa demande ?`; break;
                case 1: message = `${genre} ${prenom} est vivement attiré(e) par votre profil et souhaite échanger avec vous. Acceptez-vous la conversation ?`; break;
                case 2: message = `${genre} ${prenom} cherche une relation sincère et votre profil correspond à ce qu'il/elle espère trouver. Souhaitez-vous échanger ?`; break;
            }
            document.getElementById('popup-message').innerText = message;
            document.getElementById('popup-note').innerText = `ℹ️ ${prenom} sera informé(e) de votre choix.`;
            document.getElementById('request-popup').style.display = 'flex';
            vibrate([200,100,200]);
        }

        async function acceptRequest() {
            if (!currentRequestId) return;
            await fetch('/api/requests/' + currentRequestId + '/accept', {method:'POST'});
            document.getElementById('request-popup').style.display = 'none';
            window.location.href = '/inbox';
        }

        async function ignoreRequest() {
            if (!currentRequestId) return;
            if (confirm('Ignorer cette demande ?')) {
                await fetch('/api/requests/' + currentRequestId + '/ignore', {method:'POST'});
                document.getElementById('request-popup').style.display = 'none';
            }
        }

        // Vérifier les messages système (rejet)
        async function checkSystemMessages() {
            try {
                const res = await fetch('/api/messages/system/unread');
                const msgs = await res.json();
                if (msgs.length > 0) showSystemPopup(msgs[0]);
            } catch (e) {}
        }

        function showSystemPopup(msg) {
            document.getElementById('system-message').innerText = msg.text;
            document.getElementById('system-popup').style.display = 'flex';
            // Marquer comme lu
            fetch('/api/messages/' + msg._id + '/read', {method:'POST'});
        }

        function closeSystemPopup() {
            document.getElementById('system-popup').style.display = 'none';
        }

        setInterval(checkPendingRequests, 5000);
        setInterval(checkSystemMessages, 5000);
        checkPendingRequests();
        checkSystemMessages();
    </script>
</body>
</html>`);
    } catch (error) {
        res.status(500).send('Erreur profil');
    }
});

// MATCHING avec popup de choix des messages
app.get('/matching', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');

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

        let partnersHTML = '';
        partners.forEach(p => {
            partnersHTML += `<div class="match-card" style="background:white; padding:15px; border-radius:10px; margin:10px 0;">
                <b>${p.firstName}</b> • ${p.genotype} • ${p.residence}<br>
                <button class="btn-pink" onclick="showMessageOptions('${p._id}', '${p.firstName}')">Contacter</button>
            </div>`;
        });

        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matching</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Partenaires compatibles</h2>
            ${partnersHTML || '<p>Aucun partenaire trouvé</p>'}
            <div class="navigation">
                <a href="/profile" class="nav-link">← Profil</a>
                <a href="/inbox" class="nav-link">Messages →</a>
            </div>
        </div>
    </div>

    <!-- Popup de choix des messages -->
    <div id="message-choice-popup">
        <div class="popup-card">
            <h3 style="color:#ff416c;">Choisissez votre message</h3>
            <button onclick="sendMessageChoice(0)" style="background:#ff416c; color:white; border:none; border-radius:50px; padding:15px; margin:10px 0; width:100%;">💬 "Je suis très intéressé(e) par votre profil. Souhaitez-vous faire connaissance ?"</button>
            <button onclick="sendMessageChoice(1)" style="background:#1a2a44; color:white; border:none; border-radius:50px; padding:15px; margin:10px 0; width:100%;">💬 "Votre profil a tout de suite attiré mon attention. J'aimerais beaucoup échanger avec vous."</button>
            <button onclick="sendMessageChoice(2)" style="background:#ff416c; color:white; border:none; border-radius:50px; padding:15px; margin:10px 0; width:100%;">💬 "Je cherche une relation sincère et votre profil correspond à ce que j'espère trouver."</button>
            <button onclick="closeMessageChoice()" style="background:#ccc; color:#333; border:none; border-radius:50px; padding:15px; margin-top:15px; width:100%;">Annuler</button>
        </div>
    </div>

    <script>
        const messages = [
            "Je suis très intéressé(e) par votre profil. Souhaitez-vous faire connaissance ?",
            "Votre profil a tout de suite attiré mon attention. J'aimerais beaucoup échanger avec vous.",
            "Je cherche une relation sincère et votre profil correspond à ce que j'espère trouver."
        ];

        let currentReceiverId = null;
        let currentReceiverName = null;

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
                headers: {'Content-Type': 'application/json'},
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
    </script>
    <style>
        #message-choice-popup {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 20000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
    </style>
</body>
</html>`);
    } catch (error) {
        res.status(500).send('Erreur matching');
    }
});

// INBOX (simplifiée)
app.get('/inbox', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const messages = await Message.find({ 
            $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }],
            systemMessage: false, // Ne pas afficher les messages système dans l'inbox
            visibleFor: { $in: [currentUser._id] } // Seulement les messages que l'utilisateur peut voir
        }).populate('senderId receiverId').sort({ timestamp: -1 });

        const conversations = new Map();
        for (const m of messages) {
            const other = m.senderId._id.equals(currentUser._id) ? m.receiverId : m.senderId;
            if (!conversations.has(other._id.toString())) {
                const unread = await Message.countDocuments({ senderId: other._id, receiverId: currentUser._id, read: false, systemMessage: false });
                conversations.set(other._id.toString(), { user: other, last: m, unread });
            }
        }

        let inboxHTML = '';
        if (conversations.size === 0) {
            inboxHTML = '<p>Aucune conversation</p>';
        } else {
            conversations.forEach((v,k) => {
                inboxHTML += `<div class="inbox-item ${v.unread ? 'unread' : ''}" onclick="window.location.href='/chat?partnerId=${k}'">
                    <b>${v.user.firstName}</b> ${v.unread ? `<span class="unread-badge">${v.unread}</span>` : ''}<br>
                    <small>${v.last.text.substring(0,30)}...</small>
                </div>`;
            });
        }

        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Messages</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Messages</h2>${inboxHTML}<div class="navigation"><a href="/profile" class="nav-link">← Profil</a><a href="/matching" class="nav-link">Matching →</a></div></div></div></body></html>`);
    } catch (error) {
        res.status(500).send('Erreur inbox');
    }
});

// CHAT avec filtre visibleFor
app.get('/chat', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const partnerId = req.query.partnerId;
        if (!partnerId) return res.redirect('/inbox');
        const partner = await User.findById(partnerId);
        if (!partner) return res.redirect('/inbox');

        // Marquer les messages comme lus
        await Message.updateMany({ senderId: partnerId, receiverId: currentUser._id, read: false }, { read: true });

        const messages = await Message.find({
            $or: [
                { senderId: currentUser._id, receiverId: partnerId },
                { senderId: partnerId, receiverId: currentUser._id }
            ],
            visibleFor: { $in: [currentUser._id] } // Seulement les messages visibles pour l'utilisateur
        }).sort({ timestamp: 1 });

        let msgs = '';
        messages.forEach(m => {
            const cls = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
            msgs += `<div class="bubble ${cls}">${m.text}</div>`;
        });

        res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>.bubble{padding:10px;margin:5px;border-radius:10px;max-width:80%}.sent{background:#ff416c;color:white;margin-left:auto}.received{background:white}</style>${styles}</head>
<body><div class="app-shell"><div style="background:#1a2a44;color:white;padding:15px;display:flex;justify-content:space-between"><span>${partner.firstName}</span><button onclick="blockUser('${partnerId}')">🚫 Bloquer</button><button onclick="window.location.href='/inbox'">❌</button></div><div style="padding:20px;min-height:300px;">${msgs}</div><div style="display:flex;padding:15px;"><input id="msg" style="flex:1;padding:10px;"><button onclick="send('${partnerId}')">Envoyer</button></div></div>
<script>async function send(id){const m=document.getElementById('msg');if(m.value){await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({receiverId:id,text:m.value})});location.reload()}}async function blockUser(id){if(confirm('Bloquer ?')){await fetch('/api/block/'+id,{method:'POST'});window.location.href='/inbox'}}</script></body></html>`);
    } catch (error) {
        res.status(500).send('Erreur chat');
    }
});

// Paramètres, édition, bloqués, etc. (simplifiés, non essentiels pour la démo)
app.get('/settings', requireAuth, requireVerified, (req, res) => res.send('Paramètres'));
app.get('/edit-profile', requireAuth, requireVerified, (req, res) => res.send('Edition'));
app.get('/blocked-list', requireAuth, requireVerified, (req, res) => res.send('Bloqués'));
app.get('/chat-end', (req, res) => res.send('Merci'));
app.get('/logout-success', (req, res) => { req.session.destroy(); res.send('Déconnecté'); });

// ============================================
// ROUTES API
// ============================================

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

// Créer une demande
app.post('/api/requests', requireAuth, requireVerified, async (req, res) => {
    try {
        const { receiverId, message, choiceIndex } = req.body;
        // Vérifier si conversation existe déjà
        const exists = await Message.findOne({
            $or: [
                { senderId: req.session.userId, receiverId },
                { senderId: receiverId, receiverId: req.session.userId }
            ]
        });
        if (exists) {
            // Si conversation existe, créer directement le message visible pour les deux
            const msg = new Message({
                senderId: req.session.userId,
                receiverId,
                text: message,
                read: false,
                visibleFor: [req.session.userId, receiverId]
            });
            await msg.save();
            return res.json({ success: true });
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
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Récupérer les demandes en attente
app.get('/api/requests/pending', requireAuth, requireVerified, async (req, res) => {
    try {
        const requests = await Request.find({ receiverId: req.session.userId, status: 'pending' }).populate('senderId');
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
        if (request.receiverId._id.toString() !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });

        // Créer le message visible uniquement par le demandeur (sender)
        const msg = new Message({
            senderId: request.senderId._id,
            receiverId: request.receiverId._id,
            text: request.message,
            read: false,
            visibleFor: [request.senderId._id] // seul le demandeur voit ce message
        });
        await msg.save();

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
        if (request.receiverId._id.toString() !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });

        // Créer un message système pour le demandeur
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
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Envoyer un message normal (conversation existante)
app.post('/api/messages', requireAuth, requireVerified, async (req, res) => {
    try {
        const msg = new Message({
            senderId: req.session.userId,
            receiverId: req.body.receiverId,
            text: req.body.text,
            read: false,
            visibleFor: [req.session.userId, req.body.receiverId]
        });
        await msg.save();
        res.json(msg);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Récupérer les messages système non lus
app.get('/api/messages/system/unread', requireAuth, requireVerified, async (req, res) => {
    try {
        const msgs = await Message.find({
            receiverId: req.session.userId,
            systemMessage: true,
            read: false
        }).sort({ timestamp: -1 });
        res.json(msgs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Marquer un message comme lu
app.post('/api/messages/:id/read', requireAuth, requireVerified, async (req, res) => {
    try {
        await Message.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Bloquer
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

// Santé
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// 404
app.use((req, res) => {
    res.status(404).send('Page non trouvée');
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