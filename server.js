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
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 jours
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
    rejectedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false }
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
// SYSTÈME DE TRADUCTION MULTILINGUE
// ============================================
const translations = {
    fr: {
        appName: 'Genlove',
        slogan: 'Unissez cœur et santé pour bâtir des couples sains 💑',
        // ... (toutes les traductions françaises du fichier original)
        blockConfirm: 'Bloquer cet utilisateur ? La conversation disparaîtra de votre vue.',
        unblockConfirm: 'Débloquer cet utilisateur ? Tous les messages réapparaîtront.',
        blockSuccess: 'Utilisateur bloqué',
        unblockSuccess: 'Utilisateur débloqué',
        yourMessage: 'Votre message...',
        send: 'Envoyer',
        blockedByUser: '⛔ Conversation impossible',
        blockedMessage: 'Cet utilisateur vous a bloqué. Vous ne pouvez pas lui envoyer de messages.'
        // ... reste des traductions
    },
    // en, pt, es, ar, zh... (identique au fichier original)
};

// Middleware traduction
app.use(async (req, res, next) => {
    if (req.session?.userId) {
        try {
            const user = await User.findById(req.session.userId);
            req.lang = user?.language || 'fr';
        } catch {
            req.lang = 'fr';
        }
    } else {
        const acceptLanguage = req.headers['accept-language'];
        if (acceptLanguage?.includes('pt')) req.lang = 'pt';
        else if (acceptLanguage?.includes('es')) req.lang = 'es';
        else if (acceptLanguage?.includes('ar')) req.lang = 'ar';
        else if (acceptLanguage?.includes('zh')) req.lang = 'zh';
        else if (acceptLanguage?.includes('en')) req.lang = 'en';
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

// STYLES CSS AMÉLIORÉS (CLAVIER FIXÉ)
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

.chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 100vh;
}

.chat-header { 
    background: #1a2a44; 
    color: white; 
    padding: 18px 20px; 
    font-size: 1.3rem; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    flex-shrink: 0;
}

.chat-messages { 
    flex: 1; 
    padding: 20px; 
    background: #f5f7fb; 
    overflow-y: auto; 
    display: flex; 
    flex-direction: column; 
    justify-content: flex-end; /* NOUVEAU: messages toujours en bas */
    gap: 12px;
    scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
    width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
    background: #ff416c;
    border-radius: 2px;
}

.bubble { 
    padding: 16px 22px; 
    border-radius: 25px; 
    max-width: 80%; 
    font-size: 1.2rem; 
    line-height: 1.5; 
    word-wrap: break-word;
}

.received { 
    background: white; 
    align-self: flex-start; 
    border-bottom-left-radius: 5px; 
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
    align-items: center; /* NOUVEAU: centrage vertical */
    flex-shrink: 0;
    position: relative;
}

.input-area input { 
    flex: 1; 
    padding: 16px 20px; 
    font-size: 1.2rem; 
    border: 2px solid #e2e8f0; 
    border-radius: 30px; 
    outline: none; 
    resize: none;
}

.input-area input:focus { 
    border-color: #ff416c; 
}

.input-area button { 
    padding: 16px 25px; 
    font-size: 1.2rem; 
    border-radius: 30px; 
    background: #ff416c; 
    color: white; 
    border: none; 
    cursor: pointer; 
    flex-shrink: 0;
    transition: all 0.2s;
}

.input-area button:hover { 
    transform: scale(1.05); 
}

.input-area button:disabled { 
    opacity: 0.5; 
    cursor: not-allowed;
}

/* Autres styles inchangés... */
.page-white { background: white; min-height: 100vh; padding: 30px 25px; text-align: center; display: flex; flex-direction: column; }
.btn-pink { background: #ff416c; color: white; padding: 20px 25px; border-radius: 60px; font-size: 1.3rem; font-weight: 600; width: 90%; margin: 15px auto; display: block; text-align: center; text-decoration: none; border: none; cursor: pointer; transition: all 0.3s; }
.btn-pink:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(255,65,108,0.4); }
</style>`;

// ============================================
// ROUTES PRINCIPALES
// ============================================

// Page d'accueil
app.get('/', (req, res) => {
    const t = req.t;
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${t('appName')}</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="home-screen">
            <h1 class="logo-text">Genlove</h1>
            <p class="slogan">${t('slogan')}</p>
            <p>${t('security')}</p>
            <a href="/login" class="btn-pink">${t('login')}</a>
            <a href="/signup" class="btn-pink">${t('createAccount')}</a>
        </div>
    </div>
</body>
</html>`);
});

// Login
app.get('/login', (req, res) => {
    const t = req.t;
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('loginTitle')}</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('loginTitle')}</h2>
            <p style="font-size: 1.2rem; margin: 20px 0;">${t('enterName')}</p>
            <form id="loginForm">
                <input type="text" id="firstName" class="input-box" placeholder="${t('yourName')}" required>
                <button type="submit" class="btn-pink">${t('login')}</button>
            </form>
            <a href="/" class="back-link">${t('backHome')}</a>
        </div>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(firstName)
            });
            if (res.ok) window.location.href = '/profile';
            else alert('Prénom non trouvé');
        });
    </script>
</body>
</html>`);
});

// Chat avec clavier corrigé
app.get('/chat', requireAuth, requireVerified, async (req, res) => {
    const t = req.t;
    const currentUser = await User.findById(req.session.userId);
    const partnerId = req.query.partnerId;
    
    if (!partnerId) return res.redirect('/inbox');
    
    const partner = await User.findById(partnerId);
    if (!partner) return res.redirect('/inbox');
    
    const isBlockedByPartner = partner.blockedBy?.includes(currentUser._id);
    const hasBlockedPartner = currentUser.blockedUsers?.includes(partnerId);
    
    if (isBlockedByPartner) {
        return res.send(`
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Bloqué</title>${styles}</head>
<body>
<div class="app-shell">
    <div class="page-white">
        <h2>${t('blockedByUser')}</h2>
        <p>${t('blockedMessage')}</p>
        <a href="/inbox" class="btn-pink">Retour</a>
    </div>
</div>
</body>
</html>`);
    }
    
    // Charger les messages
    await Message.updateMany(
        { senderId: partnerId, receiverId: currentUser._id, read: false },
        { read: true }
    );
    
    const messages = await Message.find({
        $or: [
            { senderId: currentUser._id, receiverId: partnerId },
            { senderId: partnerId, receiverId: currentUser._id }
        ],
        hiddenFor: { $ne: currentUser._id }
    }).sort({ timestamp: 1 });
    
    let msgs = '';
    messages.forEach(m => {
        const cls = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
        msgs += `<div class="bubble ${cls}">${m.text}</div>`;
    });
    
    const blockButton = hasBlockedPartner 
        ? `<button class="btn-action btn-unblock" onclick="unblockUser('${partnerId}')">${t('unblock')}</button>`
        : `<button class="btn-action btn-block" onclick="blockUser('${partnerId}')">${t('block')}</button>`;
    
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${t('appName')} - Chat</title>
    ${styles}
</head>
<body>
<div class="app-shell">
    <div class="chat-container">
        <div class="chat-header">
            <span><b>${partner.firstName}</b></span>
            <button onclick="window.location.href='/inbox'" style="background:none;border:none;color:white;font-size:1.5rem">×</button>
        </div>
        <div class="chat-messages" id="messages">
            ${msgs}
        </div>
        <div class="input-area">
            <input id="msgInput" placeholder="${t('yourMessage')}" ${hasBlockedPartner ? 'disabled' : ''}>
            <button onclick="sendMessage('${partnerId}')" ${hasBlockedPartner ? 'disabled' : ''}>${t('send')}</button>
        </div>
    </div>
</div>

<script>
let pendingAction = null;

function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
}

function blockUser(id) {
    document.getElementById('block-message').innerText = '${t('blockConfirm')}';
    document.getElementById('block-popup').style.display = 'flex';
    pendingAction = () => fetch('/api/block/' + id, {method: 'POST'})
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showNotify('${t('blockSuccess')}', 'info');
                setTimeout(() => location.reload(), 1500);
            }
        });
}

function unblockUser(id) {
    document.getElementById('block-message').innerText = '${t('unblockConfirm')}';
    document.getElementById('block-popup').style.display = 'flex';
    pendingAction = () => fetch('/api/unblock/' + id, {method: 'POST'})
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showNotify('${t('unblockSuccess')}', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        });
}

async function sendMessage(partnerId) {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if (!text) return;
    
    const messagesContainer = document.getElementById('messages');
    const bubble = document.createElement('div');
    bubble.className = 'bubble sent';
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    input.value = '';
    scrollToBottom();
    
    await fetch('/api/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({receiverId: partnerId, text})
    });
    
    setTimeout(() => location.reload(), 100);
}

// Auto-scroll au chargement et focus input
window.addEventListener('load', () => {
    scrollToBottom();
    const input = document.getElementById('msgInput');
    if (!input.disabled) input.focus();
    
    // NOUVEAU: Gestion clavier mobile - scroll auto quand on tape
    input.addEventListener('input', scrollToBottom);
    
    // NOUVEAU: Remonte quand clavier monte
    window.visualViewport?.addEventListener('resize', scrollToBottom);
});

// Notifications (inchangé)
function showNotify(message, type) {
    // implémentation notification toast
}
</script>
</body>
</html>`);
});

// API Block (effet miroir préservé)
app.post('/api/block/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        const targetUserId = req.params.userId;
        
        const current = await User.findById(currentUserId);
        const target = await User.findById(targetUserId);
        
        if (!current || !target) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        
        if (!current.blockedUsers) current.blockedUsers = [];
        if (!target.blockedBy) target.blockedBy = [];
        
        current.blockedUsers.addToSet(targetUserId);
        target.blockedBy.addToSet(currentUserId);
        
        // Masquer messages des DEUX CÔTÉS (effet miroir)
        await Message.updateMany({
            $or: [
                { senderId: currentUserId, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: currentUserId }
            ]
        }, { 
            $addToSet: { hiddenFor: currentUserId },
            $addToSet: { hiddenFor: targetUserId }
        });
        
        await current.save();
        await target.save();
        
        res.json({ success: true });
    } catch (e) {
        console.error('Erreur dans /api/block:', e);
        res.status(500).json({ error: e.message });
    }
});

// ... (reste des routes API identiques au fichier original)
// PROFIL - Page principale après connexion
app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    const t = req.t;
    const currentUser = await User.findById(req.session.userId).lean();
    
    if (!currentUser) return res.redirect('/');
    
    const age = Math.floor((new Date() - new Date(currentUser.dob)) / (365.25 * 24 * 60 * 60 * 1000));
    
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('myProfile')}</title>
    ${styles}
</head>
<body>
<div class="app-shell">
    <div class="page-white">
        <h2>${t('myProfile')}</h2>
        
        <!-- Infos profil -->
        <div style="text-align: left; margin: 30px 0;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <div class="photo-circle" style="background: #f0f0f0;"></div>
                <div>
                    <h3>${currentUser.firstName} ${currentUser.lastName}</h3>
                    <p>${t('genotype_label')}: ${currentUser.genotype} | ${t('blood_label')}: ${currentUser.bloodGroup}</p>
                    <p>${t('age_label')}: ${age} ${t('age_label')} | ${t('residencelabel')}: ${currentUser.residence}</p>
                </div>
            </div>
            <p><strong>${t('projectlabel')}:</strong> ${currentUser.desireChild === 'Oui' ? t('yes') : t('no')}</p>
        </div>
        
        <div class="navigation">
            <a href="/matching" class="nav-link">${t('findPartner')}</a>
            <a href="/inbox" class="nav-link">${t('messages')}</a>
            <a href="/settings" class="nav-link">${t('settings')}</a>
        </div>
        
        <div style="margin-top: 30px;">
            <a href="/edit-profile" class="btn-pink">${t('editProfile')}</a>
            ${t('healthCommitment')}
        </div>
    </div>
</div>
</body>
</html>`);
});

app.listen(port, '0.0.0.0', () => {
    console.log('🚀 Genlove démarré sur http://localhost:' + port);
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('✅ Déconnexion MongoDB');
        process.exit(0);
    });
});
