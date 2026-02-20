const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = process.env.PORT || 3000;

// MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';
mongoose.connect(mongoURI);

// Session
app.set('trust proxy', 1);
app.use(session({
    secret: 'genlove-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Modèles
const userSchema = new mongoose.Schema({
    firstName: String, lastName: String, gender: String, dob: String,
    residence: String, genotype: String, bloodGroup: String, desireChild: String,
    language: { type: String, default: 'fr' }, isVerified: { type: Boolean, default: true },
    blockedUsers: [String], blockedBy: [String]
});
const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    senderId: String, receiverId: String, text: String,
    timestamp: { type: Date, default: Date.now }, read: { type: Boolean, default: false },
    hiddenFor: [String]
});
const Message = mongoose.model('Message', messageSchema);

// Traductions minimales
const t = (key) => {
    const texts = {
        'appName': 'Genlove', 'login': 'Se connecter', 'createAccount': 'Créer compte',
        'myProfile': 'Mon Profil', 'messages': 'Messages', 'findPartner': 'Trouver partenaire',
        'inboxTitle': 'Boîte de réception', 'yourMessage': 'Votre message...', 'send': 'Envoyer',
        'emptyInbox': 'Boîte vide', 'startConversation': 'Commencez une conversation !'
    };
    return texts[key] || key;
};

// CSS complet
const styles = `
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Segoe UI, sans-serif;background:#fdf2f2;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;font-size:16px}.app-shell{width:100%;max-width:420px;min-height:100vh;background:#f4e9da;display:flex;flex-direction:column;box-shadow:0 0 30px rgba(0,0,0,0.1);margin:0 auto}.page-white{background:white;min-height:100vh;padding:30px 25px;text-align:center;display:flex;flex-direction:column}.btn-pink{background:#ff416c;color:white;padding:20px 25px;border-radius:60px;font-size:1.3rem;font-weight:600;width:90%;margin:15px auto;display:block;text-align:center;text-decoration:none;border:none;cursor:pointer;transition:all 0.3s}.btn-pink:hover{transform:translateY(-3px);box-shadow:0 15px 30px rgba(255,65,108,0.4)}.input-box{width:100%;padding:18px;border:2px solid #e2e8f0;border-radius:15px;margin:12px 0;font-size:1.2rem;background:#f8f9fa}.navigation{display:flex;justify-content:space-between;padding:20px 0;margin-top:20px;gap:10px}.nav-link{color:#1a2a44;text-decoration:none;font-size:1.1rem;padding:12px 18px;border-radius:30px;background:white;box-shadow:0 3px 10px rgba(0,0,0,0.05);flex:1;text-align:center}.chat-container{display:flex;flex-direction:column;height:100vh;max-height:100vh}.chat-header{background:#1a2a44;color:white;padding:18px 20px;font-size:1.3rem;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.chat-messages{flex:1;padding:20px;background:#f5f7fb;overflow-y:auto;display:flex;flex-direction:column;justify-content:flex-end;gap:12px}.bubble{padding:16px 22px;border-radius:25px;max-width:80%;font-size:1.2rem;line-height:1.5}.received{background:white;align-self:flex-start;border-bottom-left-radius:5px}.sent{background:#ff416c;color:white;align-self:flex-end;border-bottom-right-radius:5px}.input-area{padding:15px 20px;background:white;border-top:2px solid #eee;display:flex;gap:12px;align-items:center;flex-shrink:0}.input-area input{flex:1;padding:16px 20px;font-size:1.2rem;border:2px solid #e2e8f0;border-radius:30px;outline:none}.input-area input:focus{border-color:#ff416c}.input-area button{padding:16px 25px;font-size:1.2rem;border-radius:30px;background:#ff416c;color:white;border:none;cursor:pointer;flex-shrink:0}</style>`;

// Middleware auth
const requireAuth = (req, res, next) => { if (!req.session.userId) return res.redirect('/'); next(); };
const requireVerified = (req, res, next) => { req.session.isVerified = true; next(); };

// Routes
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Genlove</title>${styles}</head><body>
<div class="app-shell">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px">
        <h1 style="font-size:5rem;font-weight:800;margin:20px 0;letter-spacing:-2px;color:#1a2a44">Genlove</h1>
        <p style="font-weight:500;color:#1a2a44;margin:20px 25px 40px;font-size:1.3rem">Unissez cœur et santé</p>
        <a href="/login" class="btn-pink">Se connecter</a>
        <a href="/signup" class="btn-pink">Créer compte</a>
    </div>
</div></body></html>`);
});

app.get('/login', (req, res) => {
    res.send(`
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Genlove - Connexion</title>${styles}</head><body>
<div class="app-shell">
    <div class="page-white">
        <h2>Connexion</h2>
        <p style="font-size:1.2rem;margin:20px 0">Entrez votre prénom</p>
        <form id="loginForm">
            <input type="text" id="firstName" class="input-box" placeholder="Votre prénom" required>
            <button type="submit" class="btn-pink">Se connecter</button>
        </form>
        <a href="/" style="color:#666;text-decoration:none;font-size:1.1rem;margin:20px 0">← Retour</a>
    </div>
</div>
<script>
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('firstName').value;
    const res = await fetch('/api/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(name)});
    if (res.ok) window.location.href = '/profile';
    else alert('Utilisateur non trouvé');
});
</script></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Genlove - Inscription</title>${styles}</head><body>
<div class="app-shell"><div class="page-white">
<h2>Créer mon profil</h2>
<form id="signupForm">
    <input name="firstName" class="input-box" placeholder="Prénom" required>
    <input name="lastName" class="input-box" placeholder="Nom" required>
    <select name="gender" class="input-box"><option>Homme</option><option>Femme</option></select>
    <input name="residence" class="input-box" placeholder="Ville" required>
    <select name="genotype" class="input-box"><option>AA</option><option>AS</option><option>SS</option></select>
    <button type="submit" class="btn-pink">Créer profil</button>
</form>
</div></div>
<script>
document.getElementById('signupForm').addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (res.ok) window.location.href = '/profile';
});
</script></body></html>`);
});

app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    const user = await User.findById(req.session.userId) || { firstName: 'Test', genotype: 'AA' };
    res.send(`
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Genlove - Profil</title>${styles}</head><body>
<div class="app-shell">
<div class="page-white">
    <h2>Mon Profil</h2>
    <div style="text-align:left;margin:30px 0">
        <h3>${user.firstName}</h3>
        <p>Génotype: ${user.genotype}</p>
    </div>
    <div class="navigation">
        <a href="/matching" class="nav-link">🔍 Trouver partenaire</a>
        <a href="/inbox" class="nav-link">Messages</a>
    </div>
</div></div></body></html>`);
});

app.get('/inbox', requireAuth, requireVerified, async (req, res) => {
    res.send(`
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Genlove - Messages</title>${styles}</head><body>
<div class="app-shell">
<div class="page-white">
    <h2>Boîte de réception</h2>
    <div style="text-align:center;padding:50px;color:#666">
        <span style="font-size:5rem;display:block;margin-bottom:20px">📭</span>
        <h3>Boîte vide</h3>
        <p>Commencez une conversation !</p>
        <a href="/matching" class="btn-pink" style="width:auto;display:inline-block">Trouver partenaires</a>
    </div>
    <div class="navigation">
        <a href="/profile" class="nav-link">← Profil</a>
    </div>
</div></div></body></html>`);
});

// CHAT avec clavier fixé ✅
app.get('/chat', requireAuth, requireVerified, async (req, res) => {
    res.send(`
<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Genlove - Chat</title>${styles}
</head><body>
<div class="app-shell">
    <div class="chat-container">
        <div class="chat-header">
            <span><b>Marie</b></span>
            <button onclick="window.location.href='/inbox'" style="background:none;border:none;color:white;font-size:1.5rem">×</button>
        </div>
        <div class="chat-messages" id="messages">
            <div class="bubble received">Bonjour ! Comment allez-vous ?</div>
            <div class="bubble sent">Bonjour Marie ! Très bien merci 🙂</div>
        </div>
        <div class="input-area">
            <input id="msgInput" placeholder="Votre message..." autofocus>
            <button onclick="sendMessage()">Envoyer</button>
        </div>
    </div>
</div>
<script>
function scrollToBottom() {
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if (!text) return;
    
    const messages = document.getElementById('messages');
    const bubble = document.createElement('div');
    bubble.className = 'bubble sent';
    bubble.textContent = text;
    messages.appendChild(bubble);
    input.value = '';
    scrollToBottom();
}

window.addEventListener('load', () => {
    scrollToBottom();
    document.getElementById('msgInput').focus();
    document.getElementById('msgInput').addEventListener('input', scrollToBottom);
});
</script></body></html>`);
});

// API Login
app.post('/api/login', async (req, res) => {
    const { firstName } = await req.body;
    let user = await User.findOne({ firstName }).lean();
    if (!user) {
        user = await User.create({ firstName, lastName: 'Test', genotype: 'AA', gender: 'Homme' });
    }
    req.session.userId = user._id;
    res.json({ success: true });
});

// API Register
app.post('/api/register', async (req, res) => {
    const user = await User.create(await req.body);
    req.session.userId = user._id;
    res.json({ success: true });
});

app.listen(port, () => console.log(`🚀 Genlove sur http://localhost:${port}`));