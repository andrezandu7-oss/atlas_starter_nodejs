const express = require('express');
const mongoose = require('mongoose');
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
// MODÈLES DE DONNÉES
// ============================================
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    genotype: String,
    bloodGroup: String,
    desireChild: String,
    photo: String,
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
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Genlove - Accueil</title>${styles}</head>
<body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains 💑</div><div><p>Avez-vous déjà un compte ?</p><a href="/profile" class="btn-dark">🔐 Se connecter</a><a href="/charte-engagement" class="btn-pink">✨ Créer un compte</a></div><div>🛡️ Vos données sont cryptées</div></div></div></body></html>`);
});

// CHARTE ENGAGEMENT
app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Engagement Éthique</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Engagement Éthique</h2><div id="charte-box" style="height:200px; overflow-y:scroll; background:#fff5f7; padding:20px;"><p><b>1. Sincérité des données</b> - Je certifie l'exactitude de mes informations médicales.</p><p><b>2. Confidentialité</b> - Je respecte la vie privée des autres membres.</p><p><b>3. Non-discrimination</b> - Je m'engage à être bienveillant.</p></div><button id="agreeBtn" class="btn-pink" onclick="window.location.href='/signup'" disabled>Accepter</button><script>document.getElementById('charte-box').addEventListener('scroll',function(){if(this.scrollHeight-this.scrollTop<=this.clientHeight+5)document.getElementById('agreeBtn').disabled=false});</script></div></div></body></html>`);
});

// INSCRIPTION
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Inscription</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Créer mon profil</h2><form action="/api/register" method="POST" enctype="multipart/form-data"><input type="text" name="firstName" class="input-box" placeholder="Prénom" required><input type="text" name="lastName" class="input-box" placeholder="Nom" required><select name="gender" class="input-box"><option>Homme</option><option>Femme</option></select><input type="date" name="dob" class="input-box" required><input type="text" name="residence" class="input-box" placeholder="Ville" required><select name="genotype" class="input-box"><option>AA</option><option>AS</option><option>SS</option></select><select name="bloodGroup" class="input-box"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select><select name="desireChild" class="input-box"><option>Oui</option><option>Non</option></select><button type="submit" class="btn-pink">Valider</button></form></div></div></body></html>`);
});

// PROFIL
app.get('/profile', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 }) || await new User({ firstName: "Test", lastName: "User", gender: "Homme", dob: "1990-01-01", residence: "Luanda", genotype: "AA", bloodGroup: "O+", desireChild: "Oui" }).save();
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Profil</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>${currentUser.firstName} ${currentUser.lastName}</h2><p>📍 ${currentUser.residence} • ${currentUser.gender}</p><div class="st-group"><div class="st-item"><span>🧬 Génotype</span><b>${currentUser.genotype}</b></div><div class="st-item"><span>🩸 Groupe</span><b>${currentUser.bloodGroup}</b></div><div class="st-item"><span>📅 Âge</span><b>${calculerAge(currentUser.dob)} ans</b></div><div class="st-item"><span>👶 Projet</span><b>${currentUser.desireChild}</b></div></div><a href="/matching" class="btn-pink">Trouver un partenaire</a><a href="/inbox" class="btn-dark">Messages</a><a href="/settings" class="btn-dark">Paramètres</a></div></div></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur profil");
    }
});

// MATCHING
app.get('/matching', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.redirect('/signup');
        
        let partners = await User.find({ _id: { $ne: currentUser._id } });
        const blockedIds = currentUser.blockedUsers || [];
        partners = partners.filter(p => !blockedIds.includes(p._id.toString()));
        
        if (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') {
            partners = partners.filter(p => p.genotype === 'AA');
        }
        
        partners = partners.filter(p => p.gender !== currentUser.gender);
        
        const partnersHTML = partners.map(p => `
            <div class="match-card">
                <div class="match-photo-blur"></div>
                <div><b>${p.firstName}</b><br><small>${p.genotype} • ${p.residence}</small></div>
                <button class="btn-action btn-contact" onclick="showNotify('Contact envoyé')">Contacter</button>
            </div>
        `).join('');
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Matching</title>${styles}${notifyScript}</head>
<body><div class="app-shell"><div id="genlove-notify"><span id="notify-msg"></span></div><div class="page-white"><h2>Partenaires compatibles</h2>${partnersHTML || '<p>Aucun partenaire trouvé</p>'}<a href="/profile" class="btn-pink">Retour</a></div></div></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur matching");
    }
});

// INBOX
app.get('/inbox', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.redirect('/signup');
        
        const messages = await Message.find({ $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }] })
            .populate('senderId receiverId').sort({ timestamp: -1 });
        
        const conversations = new Map();
        for (const msg of messages) {
            const otherUser = msg.senderId._id.equals(currentUser._id) ? msg.receiverId : msg.senderId;
            if (!conversations.has(otherUser._id.toString())) {
                conversations.set(otherUser._id.toString(), { user: otherUser, lastMessage: msg });
            }
        }
        
        const inboxHTML = Array.from(conversations.values()).map(conv => `
            <div class="inbox-item" onclick="window.location.href='/chat?partnerId=${conv.user._id}'">
                <div><b>${conv.user.firstName} ${conv.user.lastName}</b><br><small>${conv.lastMessage.text.substring(0,30)}...</small></div>
            </div>
        `).join('');
        
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Messages</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Boîte de réception</h2>${inboxHTML || '<p>Aucune conversation</p>'}<a href="/profile" class="btn-pink">Retour</a></div></div></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur inbox");
    }
});

// CHAT
app.get('/chat', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.redirect('/signup');
        
        const partnerId = req.query.partnerId;
        if (!partnerId) return res.redirect('/inbox');
        
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
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Chat</title>${styles}</head>
<body><div class="app-shell"><div class="chat-header"><span>${partner.firstName}</span><button onclick="window.location.href='/inbox'">Retour</button></div><div class="chat-messages" id="messages">${messagesHTML}</div><div class="input-area"><input id="msgInput" placeholder="Message..."><button onclick="sendMessage('${partnerId}')">Envoyer</button></div></div><script>function sendMessage(id){const msg=document.getElementById('msgInput');if(msg.value.trim()){fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({receiverId:id,text:msg.value})}).then(()=>{location.reload()});}}</script></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur chat");
    }
});

// PARAMÈTRES
app.get('/settings', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Paramètres</title>${styles}</head>
<body><div class="app-shell"><div class="page-white"><h2>Paramètres</h2><div class="st-group"><div class="st-item">Visibilité<input type="checkbox" checked></div><div class="st-item">Notifications<input type="checkbox"></div></div><a href="/signup" class="btn-dark">Modifier profil</a><a href="/logout-success" class="btn-dark">Déconnexion</a><a href="/profile" class="btn-pink">Retour</a></div></div></body></html>`);
    } catch (error) {
        res.status(500).send("Erreur paramètres");
    }
});

// FIN DE CHAT
app.get('/chat-end', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Merci</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2>Merci pour cet échange</h2><a href="/matching" class="btn-pink">Nouvelle recherche</a></div></body></html>`);
});

// DÉCONNEXION
app.get('/logout-success', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Déconnecté</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2>Déconnexion réussie</h2><a href="/" class="btn-pink">Accueil</a></div></body></html>`);
});

// ============================================
// ROUTES API
// ============================================

// ENREGISTREMENT
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json({ success: true, user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENVOI MESSAGE
app.post('/api/messages', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        const message = new Message({
            senderId: currentUser._id,
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
app.get('/api/messages', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        const messages = await Message.find({
            $or: [
                { senderId: currentUser._id, receiverId: req.query.partnerId },
                { senderId: req.query.partnerId, receiverId: currentUser._id }
            ]
        }).sort({ timestamp: 1 });
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MARQUER COMME LU
app.post('/api/messages/read/:partnerId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        await Message.updateMany(
            { senderId: req.params.partnerId, receiverId: currentUser._id, read: false },
            { read: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MESSAGES NON LUS
app.get('/api/messages/unread', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        const count = await Message.countDocuments({ receiverId: currentUser._id, read: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BLOQUER UTILISATEUR
app.post('/api/block/:userId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        if (!currentUser.blockedUsers) currentUser.blockedUsers = [];
        if (!currentUser.blockedUsers.includes(req.params.userId)) {
            currentUser.blockedUsers.push(req.params.userId);
            await currentUser.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DÉBLOQUER UTILISATEUR
app.post('/api/unblock/:userId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        if (currentUser.blockedUsers) {
            currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== req.params.userId);
            await currentUser.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LISTE BLOQUÉS
app.get('/api/blocked-users', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        const blockedUsers = await User.find({ _id: { $in: currentUser.blockedUsers || [] } });
        res.json(blockedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SUGGESTIONS MATCHING
app.get('/api/matching/suggestions', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        let query = { _id: { $ne: currentUser._id } };
        if (currentUser.blockedUsers && currentUser.blockedUsers.length) {
            query._id.$nin = currentUser.blockedUsers;
        }
        if (currentUser.gender) {
            query.gender = currentUser.gender === 'Homme' ? 'Femme' : 'Homme';
        }
        
        let users = await User.find(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SUPPRIMER COMPTE
app.delete('/api/delete-account', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        await Message.deleteMany({ $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }] });
        await User.findByIdAndDelete(currentUser._id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// STATISTIQUES
app.get('/api/stats', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });
        
        const stats = {
            messages: await Message.countDocuments({ $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }] }),
            unread: await Message.countDocuments({ receiverId: currentUser._id, read: false }),
            blocked: (currentUser.blockedUsers || []).length
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SANTÉ SERVEUR
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ============================================
// GESTION DES ERREURS 404
// ============================================
app.use((req, res) => {
    res.status(404).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title>${styles}</head><body class="end-overlay"><div class="end-card"><h2>Page non trouvée</h2><a href="/" class="btn-pink">Accueil</a></div></body></html>`);
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