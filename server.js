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
// CONFIGURATION SESSION (Correction 1 & 3)
// ============================================
app.set('trust proxy', 1); // IMPORTANT: Active la confiance proxy pour Render

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'genlove-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: mongoURI,
        touchAfter: 24 * 3600 // Évite les écritures inutiles
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' // Important pour Render
    },
    proxy: true // Indique qu'on est derrière un proxy
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
    .back-link { 
        display: inline-block;
        margin: 15px 0;
        color: #666;
        text-decoration: none;
        font-size: 0.9rem;
    }
    .back-link:hover {
        color: #ff416c;
    }
    .navigation {
        display: flex;
        justify-content: space-between;
        padding: 15px;
        background: white;
        border-bottom: 1px solid #eee;
    }
    .nav-link {
        color: #1a2a44;
        text-decoration: none;
        font-size: 0.9rem;
        padding: 8px 12px;
        border-radius: 20px;
        transition: all 0.3s;
    }
    .nav-link:hover {
        background: #ff416c;
        color: white;
    }
    .empty-message {
        text-align: center;
        padding: 40px 20px;
        color: #666;
        background: white;
        border-radius: 15px;
        margin: 20px;
    }
    .empty-message span {
        font-size: 3rem;
        display: block;
        margin-bottom: 15px;
    }
    /* ... le reste des styles (gardez votre CSS existant) ... */
</style>
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

// ============================================
// ROUTES PRINCIPALES
// ============================================

// ACCUEIL (Correction 2 - Suppression du lien direct /profile)
app.get('/', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Genlove - Rencontres Santé</title>' + styles + '</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains 💑</div><div><p style="margin-bottom:15px;">Commencez votre voyage</p><a href="/charte-engagement" class="btn-pink">✨ Créer un compte</a></div><div style="margin-top:30px; font-size:0.8rem; color:#666;">🛡️ Vos données de santé sont cryptées et confidentielles</div></div></div></body></html>');
});

// CHARTE ENGAGEMENT
app.get('/charte-engagement', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Engagement Éthique - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2 style="color:#ff416c;">📜 La Charte d\'Honneur</h2><p style="color:#1a2a44; margin-bottom:20px;">Lisez attentivement ces 5 engagements fondamentaux</p><div class="charte-box" id="charteBox" onscroll="checkScroll(this)"><div class="charte-section"><div class="charte-title">1. Le Serment de Sincérité</div><div class="charte-subtitle">Vérité Médicale</div><p>Je m\'engage sur l\'honneur à fournir des informations exactes concernant mon génotype et mes données de santé. Je comprends que la sincérité est le fondement de cette communauté pour protéger ma santé et celle de ma future descendance.</p></div><div class="charte-section"><div class="charte-title">2. Le Pacte de Confidentialité</div><div class="charte-subtitle">Secret Partagé</div><p>Je m\'engage à garder strictement confidentielles toutes les informations personnelles et médicales auxquelles j\'aurai accès lors de mes échanges. Aucune donnée consultée sur l\'application ne doit être divulguée, capturée ou partagée à des tiers.</p></div><div class="charte-section"><div class="charte-title">3. Le Principe de Non-Discrimination</div><div class="charte-subtitle">Égalité de Respect</div><p>Je m\'engage à traiter chaque membre avec dignité, quel que soit son génotype. Je comprends que Genlove est un espace d\'inclusion où chaque personne, qu\'elle soit AA, AS ou SS, a droit à l\'amour et au respect sans aucun jugement.</p></div><div class="charte-section"><div class="charte-title">4. La Responsabilité Préventive</div><div class="charte-subtitle">Orientation Santé</div><p>J\'accepte et je soutiens les mesures de protection de l\'application (comme le filtrage des compatibilités à risque). Je reconnais que ces limites ne sont pas des exclusions, mais des guides responsables pour favoriser des unions sereines et durables.</p></div><div class="charte-section"><div class="charte-title">5. La Bienveillance Éthique</div><div class="charte-subtitle">Courtoisie</div><p>Je m\'engage à adopter une conduite exemplaire et respectueuse dans mes messages. Je rejette toute forme de harcèlement ou de comportement inapproprié, veillant à ce que Genlove reste un environnement sûr et humain pour tous.</p></div></div><div class="scroll-indicator" id="scrollIndicator">⬇️ Faites défiler jusqu\'en bas pour accepter ⬇️</div><button id="agreeBtn" class="btn-pink" onclick="acceptCharte()" disabled>J\'ai compris et j\'accepte</button><a href="/" class="back-link">← Retour à l\'accueil</a></div></div><script>function checkScroll(el){if(el.scrollHeight - el.scrollTop <= el.clientHeight + 5){document.getElementById("agreeBtn").disabled=false;document.getElementById("agreeBtn").style.opacity="1";document.getElementById("scrollIndicator").style.opacity="0";}}function acceptCharte(){if(!document.getElementById("agreeBtn").disabled){window.location.href="/signup";}}</script></body></html>');
});

// INSCRIPTION
app.get('/signup', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Inscription - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2 style="color:#ff416c;">Créer mon profil</h2><p style="color:#666; margin-bottom:20px;">Toutes les informations sont confidentielles</p><form id="signupForm"><input type="text" name="firstName" class="input-box" placeholder="Prénom" required><input type="text" name="lastName" class="input-box" placeholder="Nom" required><select name="gender" class="input-box" required><option value="">Genre</option><option value="Homme">Homme</option><option value="Femme">Femme</option></select><input type="date" name="dob" class="input-box" required><input type="text" name="residence" class="input-box" placeholder="Ville de résidence" required><select name="genotype" class="input-box" required><option value="">Génotype</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select><select name="bloodGroup" class="input-box" required><option value="">Groupe sanguin</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select><select name="desireChild" class="input-box" required><option value="">Désir d\'enfant ?</option><option value="Oui">Oui</option><option value="Non">Non</option></select><button type="submit" class="btn-pink">Créer mon profil</button></form><a href="/charte-engagement" class="back-link">← Retour à la charte</a></div></div><script>document.getElementById("signupForm").addEventListener("submit", async function(e){e.preventDefault();const formData=new FormData(e.target);const data=Object.fromEntries(formData);const res=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});if(res.ok){window.location.href="/sas-validation";}else{alert("Erreur lors de l\'inscription");}});</script></body></html>');
});

// SAS DE VALIDATION
app.get('/sas-validation', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Validation d\'Honneur - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><div style="font-size:4rem; margin-bottom:20px;">⚖️</div><h2 style="color:#ff416c;">Serment d\'Honneur</h2><div style="background:#fff5f7; border-radius:20px; padding:25px; margin:20px 0; border:2px solid #ffdae0; text-align:left;"><p style="font-size:1rem; line-height:1.6; color:#1a2a44;"><strong>"Je confirme sur mon honneur que toutes les informations fournies, notamment mon génotype et mon groupe sanguin, sont sincères et conformes à la réalité. Je comprends l\'importance de cette déclaration pour ma santé et celle de la communauté."</strong></p></div><div style="margin:30px 0;"><label style="display:flex; align-items:center; gap:15px; padding:15px; background:#f8f9fa; border-radius:15px;"><input type="checkbox" id="honorCheck" style="width:25px; height:25px; accent-color:#ff416c;"> <span style="color:#1a2a44; font-weight:500;">Je jure sur l\'honneur que mes informations sont vraies</span></label></div><button id="validateBtn" class="btn-pink" onclick="validateHonor()" disabled>Afficher mon profil</button></div></div><script>document.getElementById("honorCheck").addEventListener("change",function(){document.getElementById("validateBtn").disabled=!this.checked;});async function validateHonor(){const res=await fetch("/api/validate-honor",{method:"POST"});if(res.ok){window.location.href="/profile";}}</script></body></html>');
});

// PROFIL (Navigation corrigée - Correction 4)
app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false });
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Mon Profil - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><a href="/matching" class="btn-dark" style="padding:8px 15px; margin:0;">🔍 Matching</a><a href="/inbox" class="btn-pink" style="padding:8px 15px; margin:0; width:auto;">📬 ' + (unreadCount > 0 ? '<span style=\"background:white; color:#ff416c; padding:2px 8px; border-radius:20px; margin-left:5px;\">' + unreadCount + '</span>' : '') + '</a><a href="/settings" style="font-size:1.5rem; color:#1a2a44;">⚙️</a></div><div class="photo-circle" style="background-image:url(\'' + (user.photo || '') + '\'); border:3px solid #ff416c;"></div><h2>' + user.firstName + ' ' + user.lastName + '</h2><p>📍 ' + (user.residence || 'Non précisée') + ' • ' + user.gender + '</p><div class="st-group"><div class="st-item"><span>🧬 Génotype</span><b>' + user.genotype + '</b></div><div class="st-item"><span>🩸 Groupe</span><b>' + user.bloodGroup + '</b></div><div class="st-item"><span>📅 Âge</span><b>' + calculerAge(user.dob) + ' ans</b></div><div class="st-item"><span>👶 Projet</span><b>' + user.desireChild + '</b></div></div><a href="/matching" class="btn-pink">🔍 Trouver un partenaire</a><a href="/edit-profile" class="btn-dark">✏️ Modifier mon profil</a></div></div></body></html>');
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
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Modifier profil - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Modifier mon profil</h2><form id="editForm"><input type="text" name="firstName" class="input-box" value="' + user.firstName + '" required><input type="text" name="lastName" class="input-box" value="' + user.lastName + '" required><select name="gender" class="input-box"><option value="Homme"' + (user.gender === 'Homme' ? ' selected' : '') + '>Homme</option><option value="Femme"' + (user.gender === 'Femme' ? ' selected' : '') + '>Femme</option></select><input type="date" name="dob" class="input-box" value="' + user.dob + '" required><input type="text" name="residence" class="input-box" value="' + user.residence + '" required><select name="genotype" class="input-box"><option value="AA"' + (user.genotype === 'AA' ? ' selected' : '') + '>AA</option><option value="AS"' + (user.genotype === 'AS' ? ' selected' : '') + '>AS</option><option value="SS"' + (user.genotype === 'SS' ? ' selected' : '') + '>SS</option></select><select name="bloodGroup" class="input-box">' + bloodOptions + '</select><select name="desireChild" class="input-box"><option value="Oui"' + (user.desireChild === 'Oui' ? ' selected' : '') + '>Oui</option><option value="Non"' + (user.desireChild === 'Non' ? ' selected' : '') + '>Non</option></select><button type="submit" class="btn-pink">Enregistrer</button></form><a href="/profile" class="back-link">← Retour au profil</a></div></div><script>document.getElementById("editForm").addEventListener("submit", async function(e){e.preventDefault();const formData=new FormData(e.target);const data=Object.fromEntries(formData);const res=await fetch("/api/users/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});if(res.ok){window.location.href="/profile";}else{alert("Erreur");}});</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur édition');
    }
});

// MATCHING (avec message bienveillant - Correction 5)
app.get('/matching', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        let query = { _id: { $ne: currentUser._id } };
        
        if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
            query._id.$nin = currentUser.blockedUsers;
        }
        
        if (currentUser.gender === 'Homme') query.gender = 'Femme';
        else if (currentUser.gender === 'Femme') query.gender = 'Homme';
        
        let partners = await User.find(query);
        
        // Filtrage génétique pour SS/AS
        if (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') {
            partners = partners.filter(p => p.genotype === 'AA');
        }
        
        let partnersHTML = '';
        if (partners.length === 0) {
            // Message bienveillant quand aucun partenaire trouvé
            partnersHTML = '<div class="empty-message"><span>🔍</span><h3>Recherche en cours...</h3><p>Nous élargissons constamment notre communauté. Revenez bientôt pour découvrir de nouveaux profils compatibles avec votre profil génétique.</p></div>';
        } else {
            partners.forEach(p => {
                partnersHTML += '<div class="match-card"><div class="match-photo-blur"></div><div style="flex:1"><b>' + p.firstName + '</b><br><small>' + p.genotype + ' • ' + p.residence + '</small></div><button class="btn-action btn-contact" onclick="window.location.href=\'/chat?partnerId=' + p._id + '\'">Contacter</button></div>';
            });
        }
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Matching - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Partenaires compatibles</h2>' + partnersHTML + '<div class="navigation"><a href="/profile" class="nav-link">← Mon profil</a><a href="/inbox" class="nav-link">Messages →</a></div></div></div></body></html>');
    } catch (error) {
        res.status(500).send('Erreur matching');
    }
});

// INBOX
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
            
            if (currentUser.blockedUsers && currentUser.blockedUsers.includes(otherUser._id)) {
                continue;
            }
            
            if (!conversations.has(otherUser._id.toString())) {
                conversations.set(otherUser._id.toString(), { user: otherUser, lastMessage: msg });
            }
        }
        
        let inboxHTML = '';
        if (conversations.size === 0) {
            inboxHTML = '<div class="empty-message"><span>📭</span><h3>Boîte vide</h3><p>Commencez une conversation en trouvant un partenaire compatible.</p><a href="/matching" class="btn-pink" style="width:auto; display:inline-block; margin-top:15px;">Trouver des partenaires</a></div>';
        } else {
            conversations.forEach(conv => {
                inboxHTML += '<div class="inbox-item" onclick="window.location.href=\'/chat?partnerId=' + conv.user._id + '\'"><div><b>' + conv.user.firstName + ' ' + conv.user.lastName + '</b><br><small>' + conv.lastMessage.text.substring(0,40) + '...</small></div></div>';
            });
        }
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Messages - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Boîte de réception</h2>' + inboxHTML + '<div class="navigation"><a href="/profile" class="nav-link">← Mon profil</a><a href="/matching" class="nav-link">Matching →</a></div></div></div></body></html>');
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
        
        let messagesHTML = '';
        messages.forEach(m => {
            const classe = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
            messagesHTML += '<div class="bubble ' + classe + '">' + m.text + '</div>';
        });
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Chat avec ' + partner.firstName + '</title>' + styles + '</head><body><div class="app-shell"><div class="chat-header"><span><b>' + partner.firstName + '</b></span><button class="btn-action btn-block" onclick="blockUser(\'' + partnerId + '\')">🚫 Bloquer</button><button onclick="window.location.href=\'/inbox\'">❌</button></div><div class="chat-messages" id="messages">' + messagesHTML + '</div><div class="input-area"><input id="msgInput" class="input-box" placeholder="Écrivez votre message..." style="margin:0;"><button class="btn-contact" onclick="sendMessage(\'' + partnerId + '\')">Envoyer</button></div></div><script>async function sendMessage(id){const msg=document.getElementById("msgInput");if(msg.value.trim()){await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({receiverId:id,text:msg.value})});location.reload();}}async function blockUser(id){if(confirm("Bloquer cet utilisateur ?")){await fetch("/api/block/"+id,{method:"POST"});window.location.href="/inbox";}}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur chat');
    }
});

// PARAMÈTRES
app.get('/settings', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const blockedCount = currentUser.blockedUsers ? currentUser.blockedUsers.length : 0;
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Paramètres - Genlove</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Paramètres</h2><div class="st-group"><div class="st-item">Visibilité du profil<input type="checkbox" checked></div><div class="st-item">Notifications push<input type="checkbox"></div></div><a href="/edit-profile" class="btn-dark">✏️ Modifier mon profil</a><a href="/blocked-list" class="btn-dark">🚫 Utilisateurs bloqués (' + blockedCount + ')</a><div class="st-group danger-zone" style="margin-top:30px;"><div class="st-item" style="color:#dc3545;">⚠️ ZONE DE DANGER</div><div class="st-item"><span>🗑️ Supprimer mon compte</span><button class="btn-action btn-block" onclick="deleteAccount()">Supprimer</button></div></div><div class="navigation"><a href="/profile" class="nav-link">← Mon profil</a><a href="/logout-success" class="nav-link" style="color:#ff416c;">Déconnexion</a></div></div></div><script>async function deleteAccount(){if(confirm("Êtes-vous ABSOLUMENT sûr ? Cette action est irréversible !")){if(confirm("Toutes vos données seront effacées. Confirmer ?")){await fetch("/api/delete-account",{method:"DELETE"});window.location.href="/logout-success";}}}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur paramètres');
    }
});

// LISTE DES BLOQUÉS
app.get('/blocked-list', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId).populate('blockedUsers');
        
        let blockedHTML = '';
        if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
            currentUser.blockedUsers.forEach(user => {
                blockedHTML += '<div class="inbox-item" style="justify-content:space-between;"><span><b>' + user.firstName + ' ' + user.lastName + '</b></span><button class="btn-action" onclick="unblockUser(\'' + user._id + '\')" style="background:#4CAF50; color:white;">Débloquer</button></div>';
            });
        } else {
            blockedHTML = '<div class="empty-message"><span>🔓</span><p>Aucun utilisateur bloqué</p></div>';
        }
        
        res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Utilisateurs bloqués</title>' + styles + '</head><body><div class="app-shell"><div class="page-white"><h2>Utilisateurs bloqués</h2>' + blockedHTML + '<a href="/settings" class="back-link">← Retour aux paramètres</a></div></div><script>async function unblockUser(id){await fetch("/api/unblock/"+id,{method:"POST"});location.reload();}</script></body></html>');
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

// FIN DE CHAT
app.get('/chat-end', (req, res) => {
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Merci</title>' + styles + '</head><body class="end-overlay"><div class="end-card"><h2 style="color:#1a2a44;">Merci pour cet échange</h2><p style="margin:20px 0;">Genlove vous remercie pour ce moment de partage</p><a href="/matching" class="btn-pink">Nouvelle recherche</a><a href="/profile" class="btn-dark" style="margin-top:10px;">Mon profil</a></div></body></html>');
});

// DÉCONNEXION
app.get('/logout-success', (req, res) => {
    req.session.destroy();
    res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Déconnecté</title>' + styles + '</head><body class="end-overlay"><div class="end-card"><h2 style="color:#1a2a44;">Déconnexion réussie</h2><p style="margin:20px 0;">À bientôt sur Genlove !</p><a href="/" class="btn-pink">Accueil</a></div></body></html>');
});

// ============================================
// ROUTES API (Correction 1 - Synchronisation session)
// ============================================

// ENREGISTREMENT AVEC ATTENTE SESSION
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        
        // Attendre que la session soit bien créée avant de répondre
        await new Promise((resolve) => {
            req.session.userId = newUser._id;
            req.session.isVerified = false;
            
            // Sauvegarder la session et attendre la confirmation
            req.session.save((err) => {
                if (err) console.error("Erreur sauvegarde session:", err);
                resolve();
            });
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// VALIDATION D'HONNEUR AVEC ATTENTE SESSION
app.post('/api/validate-honor', requireAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, { isVerified: true });
        
        // Attendre que la session soit mise à jour
        await new Promise((resolve) => {
            req.session.isVerified = true;
            req.session.save((err) => {
                if (err) console.error("Erreur sauvegarde session:", err);
                resolve();
            });
        });
        
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

// MISE À JOUR PROFIL
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

// SUPPRIMER COMPTE
app.delete('/api/delete-account', requireAuth, requireVerified, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
        await User.findByIdAndDelete(userId);
        
        // Détruire la session après suppression
        req.session.destroy();
        
        res.json({ success: true });
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
    res.status(404).send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404 - Genlove</title>' + styles + '</head><body class="end-overlay"><div class="end-card"><h2 style="color:#1a2a44;">Page non trouvée</h2><p style="margin:20px;">La page que vous cherchez n\'existe pas.</p><a href="/" class="btn-pink">Accueil</a></div></body></html>');
});

// ============================================
// DÉMARRAGE SERVEUR
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