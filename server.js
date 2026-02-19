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

app.get('/', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' + styles + '</head><body><div class="app-shell"><div style="text-align:center; padding:50px;"><h1 style="font-size:3rem;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></h1><p style="margin:30px;">Unissez cœur et santé</p><a href="/charte-engagement" class="btn-pink">Créer un compte</a><a href="/login" class="btn-dark">Se connecter</a></div></div></body></html>');
});

app.get('/login', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Connexion</h2><form id="loginForm"><input type="text" id="firstName" class="input-box" placeholder="Votre prénom"><button class="btn-pink">Se connecter</button></form><a href="/" class="back-link">← Retour</a></div></div><script>document.getElementById("loginForm").addEventListener("submit",async(e)=>{e.preventDefault();const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:e.target.firstName.value})});if(r.ok)window.location.href="/profile";else alert("Prénom non trouvé");});</script></body></html>');
});

app.get('/charte-engagement', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Charte d\'honneur</h2><div class="charte-box" id="box"><p><b>1. Sincérité</b> - Je certifie mes données médicales</p><p><b>2. Confidentialité</b> - Je respecte la vie privée</p><p><b>3. Non-discrimination</b> - Je respecte tous les génotypes</p><p><b>4. Prévention</b> - J\'accepte les filtres génétiques</p><p><b>5. Bienveillance</b> - Je reste courtois</p></div><button id="btn" class="btn-pink" onclick="window.location.href=\'/signup\'" disabled>Accepter</button><a href="/">Retour</a></div></div><script>document.getElementById("box").addEventListener("scroll",function(){if(this.scrollHeight-this.scrollTop<=this.clientHeight+5)document.getElementById("btn").disabled=false})</script></body></html>');
});

app.get('/signup', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Inscription</h2><form id="f"><input class="input-box" name="firstName" placeholder="Prénom" required><input class="input-box" name="lastName" placeholder="Nom" required><select class="input-box" name="gender"><option value="Homme">Homme</option><option value="Femme">Femme</option></select><input class="input-box" type="date" name="dob" required><input class="input-box" name="residence" placeholder="Ville" required><select class="input-box" name="genotype"><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select><select class="input-box" name="bloodGroup"><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select><select class="input-box" name="desireChild"><option value="Oui">Oui</option><option value="Non">Non</option></select><button class="btn-pink">Créer</button></form></div></div><script>document.getElementById("f").addEventListener("submit",async(e)=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const r=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});if(r.ok)window.location.href="/sas-validation"});</script></body></html>');
});

app.get('/sas-validation', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Validation</h2><p>Je confirme sur l\'honneur que mes informations sont exactes</p><label><input type="checkbox" id="c"> Je le jure</label><button class="btn-pink" id="b" onclick="validate()" disabled>Continuer</button></div></div><script>document.getElementById("c").addEventListener("change",function(){document.getElementById("b").disabled=!this.checked});async function validate(){await fetch("/api/validate-honor",{method:"POST"});window.location.href="/profile"}</script></body></html>');
});

app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const u = await User.findById(req.session.userId);
        if (!u) return res.redirect('/');
        const unread = await Message.countDocuments({ receiverId: u._id, read: false });
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div id="request-popup"><div class="popup-content"><h3>📬 Nouvelle demande</h3><div id="popup-user"></div><div id="popup-details"></div><div id="popup-message"></div><div class="popup-buttons"><button class="accept-btn" onclick="acceptRequest()">✅ Ouvrir</button><button class="ignore-btn" onclick="ignoreRequest()">🌿 Ignorer</button></div><div id="popup-note"></div></div></div><div class="page-white"><div style="display:flex; justify-content:space-between;"><a href="/" class="btn-dark" style="padding:8px;">Accueil</a><a href="/inbox" class="btn-pink" style="padding:8px;">📬 ' + (unread ? '<span class="unread-badge">'+unread+'</span>' : '') + '</a><a href="/settings">⚙️</a></div><div class="photo-circle"></div><h2>' + u.firstName + ' ' + u.lastName + '</h2><p>📍 ' + u.residence + ' • ' + (u.gender === 'Homme' ? 'Homme' : 'Femme') + '</p><div class="st-group"><div class="st-item">Génotype: <b>' + u.genotype + '</b></div><div class="st-item">Groupe: <b>' + u.bloodGroup + '</b></div><div class="st-item">Âge: <b>' + calculerAge(u.dob) + ' ans</b></div></div><a href="/matching" class="btn-pink">Trouver un partenaire</a></div></div><div style="position:fixed; bottom:20px; right:20px;"><button onclick="testPopup()" style="background:#ff416c; color:white; border:none; border-radius:50px; padding:15px;">🔍 TEST</button></div><script>let currentId=null;function testPopup(){showRequestPopup({_id:"test",senderId:{_id:"test",firstName:"Maria",dob:"1995-01-01",genotype:"AA",residence:"Luanda"},message:"Bonjour, je suis très intéressé par votre profil !"})}function showRequestPopup(r){currentId=r._id;const age=new Date().getFullYear()-new Date(r.senderId.dob).getFullYear();document.getElementById("popup-user").innerHTML=r.senderId.firstName+", "+age+" ans";document.getElementById("popup-details").innerHTML="Génotype: "+r.senderId.genotype+" • Résidence: "+r.senderId.residence;document.getElementById("popup-message").innerHTML='"'+r.message+'"';document.getElementById("popup-note").innerHTML="ℹ️ "+r.senderId.firstName+" sera informé(e)";document.getElementById("request-popup").style.display="flex";if("vibrate" in navigator)navigator.vibrate(200)}async function checkRequests(){try{const r=await fetch("/api/requests/pending");const d=await r.json();if(d.length>0)showRequestPopup(d[0])}catch(e){}}async function acceptRequest(){if(!currentId)return;await fetch("/api/requests/"+currentId+"/accept",{method:"POST"});document.getElementById("request-popup").style.display="none";window.location.href="/inbox"}async function ignoreRequest(){if(!currentId)return;if(confirm("Ignorer ?")){await fetch("/api/requests/"+currentId+"/ignore",{method:"POST"});document.getElementById("request-popup").style.display="none"}}document.addEventListener("DOMContentLoaded",checkRequests);setInterval(checkRequests,10000);</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur profil');
    }
});

app.get('/matching', requireAuth, requireVerified, async (req, res) => {
    try {
        const cu = await User.findById(req.session.userId);
        let q = { _id: { $ne: cu._id } };
        if (cu.blockedUsers?.length) q._id.$nin = cu.blockedUsers;
        if (cu.gender === 'Homme') q.gender = 'Femme'; else q.gender = 'Homme';
        let users = await User.find(q);
        if (cu.genotype === 'SS' || cu.genotype === 'AS') users = users.filter(u => u.genotype === 'AA');
        let html = '';
        users.forEach(u => html += '<div class="match-card"><b>' + u.firstName + '</b> • ' + u.genotype + ' • ' + u.residence + '<br><button onclick="sendRequest(\'' + u._id + '\')">Contacter</button></div>');
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Partenaires</h2>' + (html || '<p>Aucun</p>') + '<div class="navigation"><a href="/profile" class="nav-link">← Profil</a><a href="/inbox" class="nav-link">Messages →</a></div></div></div><script>function sendRequest(id){const m=prompt("Votre message:");if(m)fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({receiverId:id,message:m})}).then(()=>alert("✅ Envoyé"))}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur matching');
    }
});

app.get('/inbox', requireAuth, requireVerified, async (req, res) => {
    try {
        const cu = await User.findById(req.session.userId);
        const msgs = await Message.find({ $or: [{ senderId: cu._id }, { receiverId: cu._id }] }).populate('senderId receiverId');
        const conv = new Map();
        msgs.forEach(m => {
            const other = m.senderId._id.equals(cu._id) ? m.receiverId : m.senderId;
            if (cu.blockedUsers?.includes(other._id)) return;
            if (!conv.has(other._id.toString())) conv.set(other._id.toString(), { user: other, last: m });
        });
        let html = '';
        conv.forEach((v,k) => html += '<div class="inbox-item" onclick="window.location.href=\'/chat?partnerId=' + k + '\'"><b>' + v.user.firstName + '</b><br><small>' + v.last.text.substring(0,30) + '...</small></div>');
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Messages</h2>' + (html || '<p>Aucun</p>') + '<div class="navigation"><a href="/profile" class="nav-link">← Profil</a><a href="/matching" class="nav-link">Matching →</a></div></div></div></body></html>');
    } catch (error) {
        res.status(500).send('Erreur inbox');
    }
});

app.get('/chat', requireAuth, requireVerified, async (req, res) => {
    try {
        const cu = await User.findById(req.session.userId);
        const pid = req.query.partnerId;
        if (!pid) return res.redirect('/inbox');
        const p = await User.findById(pid);
        if (!p) return res.redirect('/inbox');
        if (p.blockedBy?.includes(cu._id)) {
            return res.send('<div class="app-shell"><div class="page-white"><h2>⛔ Bloqué</h2><p>Cet utilisateur vous a bloqué</p><a href="/inbox" class="btn-pink">Retour</a></div></div>');
        }
        if (cu.blockedUsers?.includes(pid)) return res.redirect('/inbox');
        await Message.updateMany({ senderId: pid, receiverId: cu._id, read: false }, { read: true });
        const msgs = await Message.find({ $or: [{ senderId: cu._id, receiverId: pid }, { senderId: pid, receiverId: cu._id }] }).sort({ timestamp: 1 });
        let h = '';
        msgs.forEach(m => {
            const cls = m.senderId.equals(cu._id) ? 'sent' : 'received';
            h += '<div class="bubble ' + cls + '">' + m.text + '</div>';
        });
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><style>.bubble{padding:10px;margin:5px;border-radius:10px;max-width:80%}.sent{background:#ff416c;color:white;margin-left:auto}.received{background:white}</style>' + styles + '</head><body><div class="app-shell"><div style="background:#1a2a44;color:white;padding:15px;display:flex;justify-content:space-between"><span>' + p.firstName + '</span><button onclick="blockUser(\'' + pid + '\')">🚫 Bloquer</button><button onclick="window.location.href=\'/inbox\'">❌</button></div><div style="padding:20px;min-height:300px;">' + h + '</div><div style="display:flex;padding:15px;"><input id="msg" style="flex:1;padding:10px;"><button onclick="send(\'' + pid + '\')">Envoyer</button></div></div><script>async function send(id){const m=document.getElementById("msg");if(m.value){await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({receiverId:id,text:m.value})});location.reload()}}async function blockUser(id){if(confirm("Bloquer ?")){await fetch("/api/block/"+id,{method:"POST"});window.location.href="/inbox"}}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur chat');
    }
});

app.get('/settings', requireAuth, requireVerified, async (req, res) => {
    try {
        const u = await User.findById(req.session.userId);
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Paramètres</h2><div class="st-group"><div class="st-item">Visibilité<input type="checkbox"></div><div class="st-item">Notifications<input type="checkbox"></div></div><a href="/edit-profile" class="btn-dark">Modifier</a><a href="/blocked-list" class="btn-dark">Bloqués (' + (u.blockedUsers?.length||0) + ')</a><div class="st-group" style="border:2px solid red;margin-top:20px;"><div style="color:red;padding:10px;">⚠️ ZONE DE DANGER</div><div class="st-item"><span>Supprimer mon compte</span><button class="btn-pink" onclick="del()">Supprimer</button></div></div><div class="navigation"><a href="/profile" class="nav-link">← Profil</a><a href="/logout-success" class="nav-link">Déconnexion</a></div></div></div><script>async function del(){if(confirm("Supprimer définitivement ?")){await fetch("/api/delete-account",{method:"DELETE"});window.location.href="/logout-success"}}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

app.get('/edit-profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const u = await User.findById(req.session.userId);
        const bloodOptions = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => '<option value="' + g + '" ' + (u.bloodGroup === g ? 'selected' : '') + '>' + g + '</option>').join('');
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Modifier</h2><form id="f"><input name="firstName" class="input-box" value="' + u.firstName + '"><input name="lastName" class="input-box" value="' + u.lastName + '"><select name="gender"><option value="Homme"' + (u.gender==='Homme'?' selected':'') + '>Homme</option><option value="Femme"' + (u.gender==='Femme'?' selected':'') + '>Femme</option></select><input type="date" name="dob" class="input-box" value="' + u.dob + '"><input name="residence" class="input-box" value="' + u.residence + '"><select name="genotype"><option value="AA"' + (u.genotype==='AA'?' selected':'') + '>AA</option><option value="AS"' + (u.genotype==='AS'?' selected':'') + '>AS</option><option value="SS"' + (u.genotype==='SS'?' selected':'') + '>SS</option></select><select name="bloodGroup">' + bloodOptions + '</select><select name="desireChild"><option value="Oui"' + (u.desireChild==='Oui'?' selected':'') + '>Oui</option><option value="Non"' + (u.desireChild==='Non'?' selected':'') + '>Non</option></select><button class="btn-pink">Enregistrer</button></form><a href="/profile" class="back-link">← Retour</a></div></div><script>document.getElementById("f").addEventListener("submit",async(e)=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));await fetch("/api/users/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});window.location.href="/profile"});</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

app.get('/blocked-list', requireAuth, requireVerified, async (req, res) => {
    try {
        const u = await User.findById(req.session.userId).populate('blockedUsers');
        let h = '';
        if (u.blockedUsers?.length) {
            u.blockedUsers.forEach(b => h += '<div style="display:flex;justify-content:space-between;margin:10px;"><span>' + b.firstName + ' ' + b.lastName + '</span><button onclick="unblock(\'' + b._id + '\')">Débloquer</button></div>');
        } else {
            h = '<p>Aucun utilisateur bloqué</p>';
        }
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Bloqués</h2>' + h + '<a href="/settings" class="back-link">← Retour</a></div></div><script>async function unblock(id){await fetch("/api/unblock/"+id,{method:"POST"});location.reload()}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

app.get('/chat-end', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body class="end-overlay"><div class="end-card"><h2>Merci</h2><p>Genlove vous remercie</p><a href="/matching" class="btn-pink">Nouvelle recherche</a><a href="/profile" class="btn-dark">Mon profil</a></div></body></html>');
});

app.get('/logout-success', (req, res) => {
    req.session.destroy();
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8">' + styles + '</head><body class="end-overlay"><div class="end-card"><h2>Déconnecté</h2><p>À bientôt</p><a href="/" class="btn-pink">Accueil</a></div></body></html>');
});

// ============================================
// ROUTES API
// ============================================

app.post('/api/login', async (req, res) => {
    try {
        const u = await User.findOne({ firstName: req.body.firstName }).sort({ createdAt: -1 });
        if (!u) return res.status(404).json({ error: "Not found" });
        req.session.userId = u._id;
        req.session.isVerified = u.isVerified;
        await new Promise(r => req.session.save(r));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const u = new User(req.body);
        await u.save();
        req.session.userId = u._id;
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

app.post('/api/requests', requireAuth, requireVerified, async (req, res) => {
    try {
        const exists = await Message.findOne({ $or: [{ senderId: req.session.userId, receiverId: req.body.receiverId }, { senderId: req.body.receiverId, receiverId: req.session.userId }] });
        if (exists) {
            const m = new Message({ senderId: req.session.userId, receiverId: req.body.receiverId, text: req.body.message, read: false });
            await m.save();
            return res.json({ success: true });
        }
        const r = new Request({ senderId: req.session.userId, receiverId: req.body.receiverId, message: req.body.message });
        await r.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/requests/pending', requireAuth, requireVerified, async (req, res) => {
    try {
        const r = await Request.find({ receiverId: req.session.userId, status: 'pending' }).populate('senderId');
        res.json(r);
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

app.post('/api/messages', requireAuth, requireVerified, async (req, res) => {
    try {
        const m = new Message({ senderId: req.session.userId, receiverId: req.body.receiverId, text: req.body.text, read: false });
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