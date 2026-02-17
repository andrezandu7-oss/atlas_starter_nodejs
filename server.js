// ============================================
// GENLOVE V4.5 - CODE COMPLET CORRIGÉ
// Tous les écrans, tout le design, toutes les fonctionnalités
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ============================================
// 1. MIDDLEWARES
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// ============================================
// 2. CONNEXION MONGODB
// ============================================
const mongoURI = process.env.MONGODB_URI;
console.log('🔄 Connexion à MongoDB...');

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connecté à MongoDB pour Genlove V4.5 !'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err.message);
    process.exit(1);
  });

// ============================================
// 3. SCHÉMAS MONGODB
// ============================================

// Schéma Utilisateur
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: String,
  dob: String,
  residence: String,
  genotype: { type: String, enum: ['AA', 'AS', 'SS'] },
  bloodGroup: String,
  desireChild: String,
  photo: { type: String, default: "https://via.placeholder.com/150?text=👤" },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Schéma Message
const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// ============================================
// 4. FONCTION UTILITAIRE (CORRIGÉE)
// ============================================
function calculerAge(dateNaissance) {
  if (!dateNaissance) return "???";
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// ============================================
// 5. ROUTES API
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Inscription
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, gender, dob, residence, genotype, bloodGroup, desireChild, photo } = req.body;
    
    if (!firstName || !lastName || !genotype) {
      return res.status(400).json({ error: "Prénom, Nom et Génotype obligatoires" });
    }
    
    const newUser = new User({
      firstName, lastName, gender, dob, residence, 
      genotype, bloodGroup, desireChild,
      photo: photo || "https://via.placeholder.com/150?text=👤",
      blockedUsers: []
    });
    
    await newUser.save();
    res.json({ success: true, user: newUser._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Mise à jour compte
app.put('/api/update-account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Suppression compte
app.delete('/api/delete-account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ success: true, message: "Compte supprimé définitivement" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Bloquer utilisateur
app.post('/api/block-user/:userId/:blockedId', async (req, res) => {
  try {
    const { userId, blockedId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    if (!user.blockedUsers.includes(blockedId)) {
      user.blockedUsers.push(blockedId);
      await user.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Débloquer utilisateur
app.post('/api/unblock-user/:userId/:blockedId', async (req, res) => {
  try {
    const { userId, blockedId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== blockedId);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Envoyer message
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: "Données incomplètes" });
    }
    const message = new Message({ senderId, receiverId, text, timestamp: new Date() });
    await message.save();
    res.json({ success: true, message: "Message envoyé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer messages
app.get('/api/messages/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ timestamp: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer conversations
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: -1 });
    
    const interlocutorIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== userId) {
        interlocutorIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== userId) {
        interlocutorIds.add(msg.receiverId.toString());
      }
    });
    
    const interlocutors = await User.find({
      _id: { $in: Array.from(interlocutorIds) }
    }).select('firstName lastName photo genotype');
    
    const conversations = await Promise.all(interlocutors.map(async (interlocutor) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: userId, receiverId: interlocutor._id },
          { senderId: interlocutor._id, receiverId: userId }
        ]
      }).sort({ timestamp: -1 });
      
      const unreadCount = await Message.countDocuments({
        senderId: interlocutor._id,
        receiverId: userId,
        read: false
      });
      
      return { interlocutor, lastMessage, unreadCount };
    }));
    
    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Marquer messages comme lus
app.post('/api/messages/read/:userId/:interlocutorId', async (req, res) => {
  try {
    const { userId, interlocutorId } = req.params;
    await Message.updateMany(
      { senderId: interlocutorId, receiverId: userId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer conversation
app.delete('/api/conversation/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    await Message.deleteMany({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    });
    res.json({ success: true, message: "Conversation supprimée" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Obtenir utilisateur par ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName photo genotype blockedUsers');
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// 6. STYLES GLOBAUX (identiques à l'original)
// ============================================
const head = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💙</text></svg>">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#ff416c">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>Genlove - Rencontres Santé</title>
`;

const styles = `
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body { 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
      margin: 0; 
      background: #fdf2f2; 
      display: flex; 
      justify-content: center;
      overscroll-behavior: none;
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
      position: absolute; 
      top: -100px; 
      left: 10px; 
      right: 10px; 
      background: #1a2a44; 
      color: white; 
      padding: 15px; 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      transition: 0.5s cubic-bezier(0.175,0.885,0.32,1.275); 
      z-index: 9999; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
      border-left: 5px solid #007bff;
    }
    #genlove-notify.show { top: 10px; }
    #loader {
      display: none; 
      position: absolute; 
      inset: 0; 
      background: white; 
      z-index: 100; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      text-align: center; 
      padding: 20px;
    }
    .spinner {
      width: 50px; 
      height: 50px; 
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
    }
    .logo-text { 
      font-size: 3.5rem; 
      font-weight: bold; 
      margin-bottom: 5px;
    }
    .slogan { 
      font-weight: bold; 
      color: #1a2a44; 
      margin-bottom: 40px; 
      font-size: 1rem; 
      line-height: 1.5;
    }
    .page-white { 
      background: white; 
      min-height: 100vh; 
      padding: 25px 20px; 
      box-sizing: border-box; 
      text-align: center;
    }
    .photo-circle { 
      width: 110px; 
      height: 110px; 
      border: 2px dashed #ff416c; 
      border-radius: 50%; 
      margin: 0 auto 20px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      position: relative; 
      cursor: pointer; 
      background-size: cover; 
      background-position: center;
    }
    .input-box { 
      width: 100%; 
      padding: 14px; 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      margin-top: 10px; 
      font-size: 1rem; 
      box-sizing: border-box; 
      background: #f8f9fa; 
      color: #333;
    }
    .serment-container { 
      margin-top: 20px; 
      padding: 15px; 
      background: #fff5f7; 
      border-radius: 12px; 
      border: 1px solid #ffdae0; 
      text-align: left; 
      display: flex; 
      gap: 10px; 
      align-items: flex-start;
    }
    .serment-text { 
      font-size: 0.82rem; 
      color: #d63384; 
      line-height: 1.4;
    }
    .btn-pink { 
      background: #ff416c; 
      color: white; 
      padding: 18px; 
      border-radius: 50px; 
      text-align: center; 
      text-decoration: none; 
      font-weight: bold; 
      display: block; 
      width: 85%; 
      margin: 20px auto; 
      border: none; 
      cursor: pointer; 
      transition: 0.3s;
    }
    .btn-dark { 
      background: #1a2a44; 
      color: white; 
      padding: 18px; 
      border-radius: 12px; 
      text-align: center; 
      text-decoration: none; 
      font-weight: bold; 
      display: block; 
      margin: 15px; 
      width: auto; 
      box-sizing: border-box;
    }
    .btn-action { 
      border: none; 
      border-radius: 8px; 
      padding: 8px 12px; 
      font-size: 0.8rem; 
      font-weight: bold; 
      cursor: pointer; 
      transition: 0.2s;
    }
    .btn-details { 
      background: #ff416c; 
      color: white;
    }
    .btn-contact { 
      background: #1a2a44; 
      color: white; 
      margin-right: 5px;
    }
    #popup-overlay { 
      display: none; 
      position: fixed; 
      inset: 0; 
      background: rgba(0,0,0,0.7); 
      z-index: 1000; 
      align-items: center; 
      justify-content: center; 
      padding: 20px;
    }
    .popup-content { 
      background: white; 
      border-radius: 20px; 
      width: 100%; 
      max-width: 380px; 
      padding: 25px; 
      position: relative; 
      text-align: left; 
      animation: slideUp 0.3s ease-out;
    }
    .close-popup { 
      position: absolute; 
      top: 15px; 
      right: 15px; 
      font-size: 1.5rem; 
      cursor: pointer; 
      color: #666;
    }
    .st-group { 
      background: white; 
      border-radius: 15px; 
      margin: 0 15px 15px 15px; 
      overflow: hidden; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
      text-align: left;
    }
    .st-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 15px 20px; 
      border-bottom: 1px solid #f8f8f8; 
      color: #333; 
      font-size: 0.95rem;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 45px;
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
      background-color: #007bff;
    }
    input:checked + .slider:before {
      transform: translateX(21px);
    }
    .match-card { 
      background: white; 
      margin: 10px 15px; 
      padding: 15px; 
      border-radius: 15px; 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .match-photo { 
      width: 55px; 
      height: 55px; 
      border-radius: 50%; 
      background-size: cover; 
      background-position: center;
    }
    .match-photo-blur { 
      width: 55px; 
      height: 55px; 
      border-radius: 50%; 
      background: #eee;
      filter: blur(6px); 
      background-size: cover; 
      background-position: center;
    }
    .end-overlay { 
      position: fixed; 
      inset: 0; 
      background: linear-gradient(180deg, #4a76b8 0%, #1a2a44 100%); 
      z-index: 9999; 
      display: flex; 
      align-items: center; 
      justify-content: center;
    }
    .end-card { 
      background: white; 
      border-radius: 30px; 
      padding: 40px 25px; 
      width: 85%; 
      text-align: center; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .chat-header {
      background: #ff416c;
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chat-messages {
      flex: 1;
      padding: 15px;
      background: #f8fafb;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: calc(100vh - 140px);
    }
    .bubble-received {
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      max-width: 80%;
      line-height: 1.4;
      background: #e2ecf7;
      align-self: flex-start;
    }
    .bubble-sent {
      padding: 12px 16px;
      border-radius: 18px 18px 4px 18px;
      max-width: 80%;
      line-height: 1.4;
      background: #ff416c;
      color: white;
      align-self: flex-end;
    }
    .conversation-item {
      background: white;
      margin: 10px 15px;
      padding: 15px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      cursor: pointer;
    }
    .unread-badge {
      background: #ff416c;
      color: white;
      border-radius: 20px;
      padding: 2px 8px;
      font-size: 0.7rem;
      font-weight: bold;
      margin-left: 10px;
    }
    .compatibility-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: bold;
      margin-left: 8px;
    }
    .badge-AA { background: #4CAF50; color: white; }
    .badge-AS { background: #FF9800; color: white; }
    .badge-SS { background: #f44336; color: white; }
    @keyframes slideUp { 
      from { transform: translateY(50px); opacity: 0; } 
      to { transform: translateY(0); opacity: 1; } 
    }
  </style>
`;

const notifyScript = `
  <script>
    function showNotify(msg) { 
      const n = document.getElementById('genlove-notify'); 
      const m = document.getElementById('notify-msg'); 
      if (m) m.innerText = msg; 
      if (n) { 
        n.classList.add('show'); 
        setTimeout(() => { n.classList.remove('show'); }, 3500); 
      } 
    }
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  </script>
`;

// ============================================
// 7. ROUTES FRONTEND (TOUS LES ÉCRANS)
// ============================================

// Accueil
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div class="home-screen">
            <div class="logo-text">
              <span style="color:#1a2a44;">Gen</span>
              <span style="color:#ff416c;">love</span>
            </div>
            <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
            <div style="width:100%;margin-top:20px;">
              <p style="font-size:0.9rem;color:#1a2a44;margin-bottom:10px;">Avez-vous déjà un compte ?</p>
              <a href="/profile" class="btn-dark">➔ Se connecter</a>
              <a href="/charte-engagement" style="color:#1a2a44;text-decoration:none;font-weight:bold;display:block;margin-top:15px;">Créer un compte</a>
            </div>
            <div style="font-size:0.75rem;color:#666;margin-top:25px;">Vos données sont cryptées et confidentielles.</div>
          </div>
        </div>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Charte d'engagement
app.get('/charte-engagement', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body style="background:#fdf2f2;">
        <div class="app-shell">
          <div class="page-white" style="display:flex;flex-direction:column;justify-content:center;padding:30px;min-height:100vh;">
            <div style="font-size:3.5rem;margin-bottom:10px;">📜</div>
            <h2 style="color:#1a2a44;margin-top:0;">Engagement Éthique</h2>
            <p style="color:#666;font-size:0.9rem;margin-bottom:20px;">Pour protéger la santé de votre future famille.</p>
            <div id="charte-box" style="height:220px;overflow-y:scroll;background:#fff5f7;border:2px solid #ffdae0;border-radius:15px;padding:20px;font-size:0.85rem;color:#444;line-height:1.6;text-align:left;" onscroll="checkScroll(this)">
              <b style="color:#ff416c;">1. Sincérité</b><br>Données médicales conformes aux examens.<br><br>
              <b style="color:#ff416c;">2. Responsabilité</b><br>Vous garantissez l'authenticité de votre profil.<br><br>
              <b style="color:#ff416c;">3. Confidentialité</b><br>Messages privés et sécurisés.<br><br>
              <b style="color:#ff416c;">4. Sérénité</b><br>Algorithmes protègent la santé des enfants.<br><br>
              <b style="color:#ff416c;">5. Respect</b><br>Non-stigmatisation obligatoire.<br>
              <hr style="border:0;border-top:1px solid #ffdae0;margin:15px 0;">
              <center><i style="color:#ff416c;">Scrollez jusqu'en bas...</i></center>
            </div>
            <button id="agree-btn" onclick="location.href='/signup'" class="btn-pink" style="background:#ccc;cursor:not-allowed;margin-top:25px;width:100%;border:none;" disabled>J'ai lu et je m'engage</button>
            <a href="/" style="margin-top:15px;color:#666;text-decoration:none;font-size:0.8rem;">Annuler</a>
          </div>
        </div>
        <script>
          function checkScroll(el) {
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 5) {
              const btn = document.getElementById('agree-btn');
              btn.disabled = false;
              btn.style.background = '#ff416c';
              btn.style.cursor = 'pointer';
              el.style.borderColor = '#4CAF50';
            }
          }
        </script>
      </body>
    </html>
  `);
});

// Inscription
app.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification données médicales.</p></div>
          <div class="page-white" id="main-content">
            <h2 style="color:#ff416c;margin-top:0;">Configuration Santé</h2>
            <form onsubmit="saveAndRedirect(event)">
              <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo</span></div>
              <input type="file" id="i" style="display:none" onchange="preview(event)">
              <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
              <input type="text" id="ln" class="input-box" placeholder="Nom" required>
              <select id="gender" class="input-box">
                <option value="">Genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              <div style="text-align:left;margin-top:10px;padding-left:5px;">
                <small style="color:#666;font-size:0.75rem;">📅 Date de naissance :</small>
              </div>
              <input type="date" id="dob" class="input-box" style="margin-top:2px;">
              <input type="text" id="res" class="input-box" placeholder="Résidence">
              <select id="gt" class="input-box" required>
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex;gap:10px;">
                <select id="gs_type" class="input-box" style="flex:2;">
                  <option value="">Groupe</option>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
                <select id="gs_rh" class="input-box" style="flex:1;">
                  <option>+</option>
                  <option>-</option>
                </select>
              </div>
              <select id="pj" class="input-box">
                <option value="">Désir d'enfant ?</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
              <div class="serment-container">
                <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                <label for="oath" class="serment-text">Je confirme mon engagement éthique.</label>
              </div>
              <button type="submit" class="btn-pink">🚀 Valider profil</button>
            </form>
          </div>
        </div>
        <script>
          let b64 = localStorage.getItem('current_user_photo') || "";
          window.onload = () => {
            if (b64) {
              document.getElementById('c').style.backgroundImage = 'url(' + b64 + ')';
              document.getElementById('t').style.display = 'none';
            }
          };
          function preview(e) {
            const r = new FileReader();
            r.onload = () => {
              b64 = r.result;
              document.getElementById('c').style.backgroundImage = 'url(' + b64 + ')';
              document.getElementById('t').style.display = 'none';
            };
            r.readAsDataURL(e.target.files[0]);
          }
          async function saveAndRedirect(e) {
            e.preventDefault();
            document.getElementById('loader').style.display = 'flex';
            
            const userData = {
              firstName: document.getElementById('fn').value,
              lastName: document.getElementById('ln').value,
              gender: document.getElementById('gender').value,
              dob: document.getElementById('dob').value,
              residence: document.getElementById('res').value,
              genotype: document.getElementById('gt').value,
              bloodGroup: document.getElementById('gs_type').value ? 
                (document.getElementById('gs_type').value + document.getElementById('gs_rh').value) : "",
              desireChild: document.getElementById('pj').value,
              photo: b64 || "https://via.placeholder.com/150?text=👤"
            };
            
            try {
              const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
              });
              const result = await response.json();
              
              localStorage.setItem('current_user_data', JSON.stringify(userData));
              localStorage.setItem('current_user_photo', userData.photo);
              localStorage.setItem('current_user_id', result.user);
              
              if (response.ok) {
                setTimeout(() => { window.location.href = '/profile'; }, 800);
              } else {
                throw new Error(result.error || 'Erreur serveur');
              }
            } catch (err) {
              document.getElementById('loader').style.display = 'none';
              alert('❌ Erreur: ' + err.message);
            }
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Profil
app.get('/profile', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body style="background:#f8f9fa;">
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div style="background:white;padding:30px 20px;text-align:center;border-radius:0 0 30px 30px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <a href="/" style="text-decoration:none;background:#eff6ff;color:#1a2a44;padding:8px 14px;border-radius:12px;font-size:0.8rem;font-weight:bold;display:flex;align-items:center;gap:8px;border:1px solid #dbeafe;">🏠 Accueil</a>
              <a href="/inbox" style="text-decoration:none;background:#eff6ff;color:#1a2a44;padding:8px 14px;border-radius:12px;font-size:0.8rem;font-weight:bold;">💬 Messages</a>
              <a href="/settings" style="text-decoration:none;font-size:1.4rem;">⚙️</a>
            </div>
            <div id="vP" style="width:110px;height:110px;border-radius:50%;border:3px solid #ff416c;margin:20px auto;background-size:cover;background-color:#eee;"></div>
            <h2 id="vN">Chargement...</h2>
            <p id="vR" style="color:#666;margin:0 0 10px 0;font-size:0.9rem;">📍 Chargement...</p>
            <p style="color:#007bff;font-weight:bold;margin:0;">Profil Santé Validé ✅</p>
          </div>
          <div style="padding:15px 20px 5px 20px;font-size:0.75rem;color:#888;font-weight:bold;">MES INFORMATIONS</div>
          <div class="st-group">
            <div class="st-item"><span>Génotype</span><b id="rG">Chargement...</b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS">Chargement...</b></div>
            <div class="st-item"><span>Âge</span><b id="rAge">Chargement...</b></div>
            <div class="st-item"><span>Résidence</span><b id="rRes">Chargement...</b></div>
            <div class="st-item"><span>Projet (Enfant)</span><b id="rP">Chargement...</b></div>
          </div>
          <a href="/matching" class="btn-dark" style="text-decoration:none;">Trouver un partenaire</a>
        </div>
        <script>
          function calculerAge(dateNaissance) {
            if (!dateNaissance) return "???";
            const today = new Date();
            const birthDate = new Date(dateNaissance);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
          }
          
          window.onload = function() {
            try {
              let userData, photo = "https://via.placeholder.com/150?text=👤";
              const stored = localStorage.getItem('current_user_data');
              if (!stored) {
                showNotify('Redirection création profil...');
                setTimeout(() => { window.location.href = '/signup'; }, 1000);
                return;
              }
              userData = JSON.parse(stored);
              photo = localStorage.getItem('current_user_photo') || photo;
              const userId = localStorage.getItem('current_user_id');
              
              if (!userData.firstName || !userData.genotype) {
                showNotify('Redirection création profil...');
                setTimeout(() => { window.location.href = '/signup'; }, 1000);
                return;
              }
              
              document.getElementById('vP').style.backgroundImage = 'url(' + photo + ')';
              document.getElementById('vN').innerText = userData.firstName + ' ' + userData.lastName;
              document.getElementById('vR').innerText = '📍 ' + (userData.residence || 'Luanda');
              document.getElementById('rG').innerText = userData.genotype || 'Non renseigné';
              document.getElementById('rS').innerText = userData.bloodGroup || 'Non renseigné';
              document.getElementById('rAge').innerText = userData.dob ? calculerAge(userData.dob) + ' ans' : 'Non renseigné';
              document.getElementById('rRes').innerText = userData.residence || 'Luanda';
              document.getElementById('rP').innerText = userData.desireChild === 'Oui' ? 'Oui' : 'Non';
              
              if (userId) localStorage.setItem('current_user_id', userId);
              showNotify('Profil chargé !');
            } catch(e) {
              console.error('Profil error:', e);
              showNotify('❌ Erreur chargement');
              localStorage.removeItem('current_user_data');
              localStorage.removeItem('current_user_photo');
              setTimeout(() => { window.location.href = '/signup'; }, 1500);
            }
          };
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Matching
app.get('/matching', async (req, res) => {
  try {
    const users = await User.find()
      .select('firstName lastName gender dob residence genotype bloodGroup desireChild photo _id blockedUsers')
      .limit(50)
      .lean();
    
    const partnersWithAge = users
      .filter(u => u.genotype && u.gender && u._id)
      .map(u => ({
        id: u._id.toString().slice(-4),
        fullid: u._id.toString(),
        gt: u.genotype,
        gs: u.bloodGroup,
        pj: u.desireChild === "Oui" ? "Désire fonder une famille" : "Sans enfants",
        name: u.firstName + " " + u.lastName.charAt(0) + ".",
        dob: u.dob,
        res: u.residence || "Luanda",
        gender: u.gender,
        photo: u.photo,
        blockedUsers: u.blockedUsers || []
      }));
    
    const matchesHTML = partnersWithAge.map(p => `
      <div class="match-card" data-gt="${p.gt}" data-gender="${p.gender}" data-userid="${p.fullid}" data-blockedusers='${JSON.stringify(p.blockedUsers)}'>
        <div class="match-photo" style="background-image:url(${p.photo})"></div>
        <div style="flex:1">
          <b>${p.name} (#${p.id})</b>
          <span class="compatibility-badge badge-${p.gt}">${p.gt}</span>
          <br><small>${calculerAge(p.dob)} ans • ${p.res}</small>
        </div>
        <div style="display:flex;">
          <button class="btn-action btn-contact" onclick="contactUser('${p.fullid}')">💬</button>
          <button class="btn-action btn-details" onclick="showDetails(${JSON.stringify(p).replace(/'/g, "\\'")})">🔍</button>
          <button class="btn-action" style="background:#f44336;color:white;" onclick="blockUser('${p.fullid}')">🚫</button>
        </div>
      </div>
    `).join("");
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>${head}${styles}</head>
        <body style="background:#f4f7f6;">
          <div class="app-shell">
            <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
            <div style="padding:20px;background:white;text-align:center;border-bottom:1px solid #eee;">
              <h3 style="margin:0;color:#1a2a44;">Partenaires Compatibles <span id="count">0</span></h3>
            </div>
            <div id="match-container">
              ${matchesHTML || '<p style="text-align:center;color:#666;padding:40px;">Aucun partenaire compatible.<br>Revenez bientôt !</p>'}
            </div>
            <a href="/profile" class="btn-pink">Retour profil</a>
          </div>
          
          <div id="popup-overlay" onclick="closePopup()">
            <div class="popup-content" onclick="event.stopPropagation()">
              <span class="close-popup" onclick="closePopup()">&times;</span>
              <h3 id="pop-name" style="color:#ff416c;margin-top:0;">Détails</h3>
              <div id="pop-details" style="font-size:0.95rem;color:#333;line-height:1.6;"></div>
              <div id="pop-msg" style="background:#f0f7ff;padding:15px;border-radius:12px;border-left:5px solid #007bff;font-size:0.85rem;color:#1a2a44;line-height:1.4;margin-top:15px;"></div>
              <button id="pop-btn" class="btn-pink" style="margin:20px 0 0 0;width:100%;">Contacter</button>
            </div>
          </div>
          
          <script>
            let selectedPartner = null;
            let currentUserId = localStorage.getItem('current_user_id');
            
            function calculerAge(dateNaissance) {
              if (!dateNaissance) return "???";
              const today = new Date();
              const birthDate = new Date(dateNaissance);
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
              return age;
            }
            
            window.onload = function() {
              try {
                const myDataStr = localStorage.getItem('current_user_data');
                if (!myDataStr) {
                  showNotify('Profil requis');
                  setTimeout(() => { window.location.href = '/profile'; }, 1000);
                  return;
                }
                
                const myData = JSON.parse(myDataStr);
                const myGt = myData.genotype;
                const myGender = myData.gender;
                const myId = localStorage.getItem('current_user_id');
                
                if (!myGt) {
                  showNotify('Génotype requis');
                  setTimeout(() => { window.location.href = '/profile'; }, 1000);
                  return;
                }
                
                let totalFiltered = 0;
                const cards = document.querySelectorAll('.match-card');
                
                cards.forEach(card => {
                  const pGt = card.dataset.gt;
                  const pGender = card.dataset.gender;
                  const pUserId = card.dataset.userid;
                  let visible = true;
                  
                  if (pUserId === myId) visible = false;
                  if (myGender && pGender === myGender) visible = false;
                  
                  if (myGt === 'AS' || myGt === 'SS') {
                    if (pGt !== 'AA') visible = false;
                  }
                  
                  try {
                    const blockedUsers = JSON.parse(card.dataset.blockedusers || '[]');
                    if (blockedUsers.includes(myId)) visible = false;
                  } catch(e) {}
                  
                  if (visible) {
                    totalFiltered++;
                    card.style.display = 'flex';
                  } else {
                    card.style.display = 'none';
                  }
                });
                
                document.getElementById('count').innerText = totalFiltered;
                
                if ((myGt === 'AS' || myGt === 'SS') && totalFiltered === 0) {
                  document.getElementById('pop-name').innerText = "Protection Santé";
                  document.getElementById('pop-details').innerHTML = "Genlove vous présente <b>exclusivement</b> des partenaires AA pour garantir une descendance sans drépanocytose.";
                  document.getElementById('pop-msg').style.display = "none";
                  document.getElementById('pop-btn').innerText = "Je comprends";
                  document.getElementById('pop-btn').onclick = closePopup;
                  document.getElementById('popup-overlay').style.display = "flex";
                }
              } catch(e) {
                console.error('Matching error:', e);
                showNotify('❌ Erreur chargement');
              }
            };
            
            function showDetails(p) {
              selectedPartner = p;
              document.getElementById('pop-name').innerText = p.name + ' #' + p.id;
              document.getElementById('pop-details').innerHTML = 
                '<b>Âge:</b> ' + calculerAge(p.dob) + ' ans<br>' +
                '<b>Résidence:</b> ' + p.res + '<br>' +
                '<b>Génotype:</b> ' + p.gt + '<br>' +
                '<b>Groupe:</b> ' + (p.gs || 'NR') + '<br><br>' +
                '<b>Projet:</b><br><i>' + p.pj + '</i>';
              document.getElementById('pop-msg').style.display = 'block';
              document.getElementById('pop-msg').innerHTML = '<b>Compatibilité:</b> ' + 
                (p.gt === 'AA' ? '✅ Partenaire recommandé' : '⚠️ Vérifiez compatibilité');
              document.getElementById('pop-btn').innerText = '💬 Contacter';
              document.getElementById('pop-btn').onclick = () => {
                sessionStorage.setItem('chatPartner', JSON.stringify(p));
                window.location.href = '/chat?partner=' + p.fullid;
              };
              document.getElementById('popup-overlay').style.display = 'flex';
            }
            
            function contactUser(partnerId) {
              window.location.href = '/chat?partner=' + partnerId;
            }
            
            async function blockUser(blockedId) {
              if (!confirm('Bloquer cet utilisateur ? Il n\\'apparaîtra plus dans vos recherches.')) return;
              
              try {
                const userId = localStorage.getItem('current_user_id');
                const response = await fetch('/api/block-user/' + userId + '/' + blockedId, {
                  method: 'POST'
                });
                
                if (response.ok) {
                  showNotify('✅ Utilisateur bloqué');
                  setTimeout(() => { window.location.reload(); }, 1000);
                } else {
                  throw new Error('Erreur blocage');
                }
              } catch(e) {
                showNotify('❌ Erreur: ' + e.message);
              }
            }
            
            function closePopup() {
              document.getElementById('popup-overlay').style.display = 'none';
            }
          </script>
          ${notifyScript}
        </body>
      </html>
    `);
  } catch(e) {
    console.error("❌ Matching error:", e);
    res.status(500).send("Erreur chargement");
  }
});

// Chat
app.get('/chat', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell" style="background:#f0f2f5;height:100vh;overflow:hidden;display:flex;flex-direction:column;">
          <div class="chat-header">
            <button class="btn-action" style="background:white;color:#ff416c;" onclick="window.location.href='/inbox'">⬅️ Retour</button>
            <div style="font-weight:bold;" id="chat-partner-name">Discussion</div>
            <button class="btn-action" style="background:white;color:#f44336;" onclick="deleteConversation()">🗑️</button>
          </div>
          
          <div class="chat-messages" id="chat-box"></div>
          
          <div style="padding:15px;background:white;display:flex;gap:10px;border-top:1px solid #eee;">
            <textarea id="msg-input" style="flex:1;background:#f1f3f4;border:none;padding:12px;border-radius:25px;resize:none;" placeholder="Écrivez ici..." rows="1"></textarea>
            <button style="background:#ff416c;color:white;border:none;width:45px;height:45px;border-radius:50%;font-size:1.2rem;cursor:pointer;" onclick="sendMessage()">➤</button>
          </div>
        </div>
        
        <script>
          let currentUserId = localStorage.getItem('current_user_id');
          let partnerId = new URLSearchParams(window.location.search).get('partner');
          let refreshInterval = null;
          
          window.onload = async function() {
            if (!currentUserId) {
              alert('Veuillez vous connecter');
              window.location.href = '/profile';
              return;
            }
            
            if (!partnerId) {
              const partner = sessionStorage.getItem('chatPartner');
              if (partner) {
                partnerId = JSON.parse(partner).fullid;
                document.getElementById('chat-partner-name').innerText = JSON.parse(partner).name;
              } else {
                alert('Aucun partenaire sélectionné');
                window.location.href = '/matching';
                return;
              }
            } else {
              try {
                const response = await fetch('/api/users/' + partnerId);
                const data = await response.json();
                document.getElementById('chat-partner-name').innerText = data.user.firstName + ' ' + data.user.lastName.charAt(0) + '.';
              } catch(e) {}
            }
            
            loadMessages();
            refreshInterval = setInterval(loadMessages, 3000);
          };
          
          window.onbeforeunload = function() {
            if (refreshInterval) clearInterval(refreshInterval);
          };
          
          async function loadMessages() {
            try {
              const response = await fetch('/api/messages/' + currentUserId + '/' + partnerId);
              const data = await response.json();
              
              if (data.success) {
                displayMessages(data.messages);
                
                await fetch('/api/messages/read/' + currentUserId + '/' + partnerId, {
                  method: 'POST'
                });
              }
            } catch(e) {
              console.error('Erreur chargement messages:', e);
            }
          }
          
          function displayMessages(messages) {
            const box = document.getElementById('chat-box');
            box.innerHTML = '';
            
            messages.forEach(msg => {
              const div = document.createElement('div');
              div.className = msg.senderId === currentUserId ? 'bubble-sent' : 'bubble-received';
              div.innerHTML = msg.text + '<br><small style="opacity:0.7;font-size:0.7rem;">' + new Date(msg.timestamp).toLocaleTimeString() + '</small>';
              box.appendChild(div);
            });
            
            box.scrollTop = box.scrollHeight;
          }
          
          async function sendMessage() {
            const input = document.getElementById('msg-input');
            const text = input.value.trim();
            
            if (!text) return;
            
            try {
              const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  senderId: currentUserId,
                  receiverId: partnerId,
                  text: text
                })
              });
              
              const data = await response.json();
              
              if (data.success) {
                input.value = '';
                loadMessages();
              } else {
                alert('Erreur envoi message');
              }
            } catch(e) {
              console.error('Erreur:', e);
            }
          }
          
          async function deleteConversation() {
            if (!confirm('Supprimer toute cette conversation ?')) return;
            
            try {
              const response = await fetch('/api/conversation/' + currentUserId + '/' + partnerId, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                showNotify('✅ Conversation supprimée');
                setTimeout(() => { window.location.href = '/inbox'; }, 1000);
              }
            } catch(e) {
              showNotify('❌ Erreur suppression');
            }
          }
          
          document.getElementById('msg-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          });
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Boîte de réception
app.get('/inbox', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body style="background:#f8f9fa;">
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          
          <div style="background:white;padding:20px;text-align:center;border-bottom:1px solid #eee;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <a href="/profile" style="text-decoration:none;background:#eff6ff;color:#1a2a44;padding:8px 14px;border-radius:12px;">⬅️ Retour</a>
              <h3 style="margin:0;color:#1a2a44;">Mes Conversations</h3>
              <a href="/matching" style="text-decoration:none;background:#ff416c;color:white;padding:8px 14px;border-radius:12px;">➕ Nouveau</a>
            </div>
          </div>
          
          <div id="conversations-list" style="padding:10px 0;">
            <div style="text-align:center;padding:40px;">Chargement...</div>
          </div>
        </div>
        
        <script>
          window.onload = async function() {
            const userId = localStorage.getItem('current_user_id');
            
            if (!userId) {
              showNotify('Veuillez vous connecter');
              setTimeout(() => { window.location.href = '/profile'; }, 1000);
              return;
            }
            
            try {
              const response = await fetch('/api/conversations/' + userId);
              const data = await response.json();
              
              if (data.success) {
                displayConversations(data.conversations);
              }
            } catch(e) {
              console.error('Erreur chargement conversations:', e);
              document.getElementById('conversations-list').innerHTML = '<div style="text-align:center;padding:40px;color:#f44336;">❌ Erreur chargement</div>';
            }
          };
          
          function displayConversations(conversations) {
            const container = document.getElementById('conversations-list');
            
            if (!conversations || conversations.length === 0) {
              container.innerHTML = '<div style="text-align:center;padding:40px;">📭 Aucune conversation<br><small style="color:#666;">Commencez à discuter avec un partenaire compatible</small></div>';
              return;
            }
            
            let html = '';
            
            conversations.sort((a, b) => {
              return new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0);
            });
            
            conversations.forEach(conv => {
              const partner = conv.interlocutor;
              const lastMsg = conv.lastMessage;
              const date = lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString() : '';
              const time = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
              
              html += `
                <div class="conversation-item" onclick="openChat('${partner._id}')">
                  <div class="match-photo" style="background-image:url(${partner.photo || 'https://via.placeholder.com/150?text=👤'})"></div>
                  <div style="flex:1;">
                    <div style="display:flex;align-items:center;">
                      <b>${partner.firstName} ${partner.lastName.charAt(0)}.</b>
                      <span class="compatibility-badge badge-${partner.genotype}">${partner.genotype || '?'}</span>
                      ${conv.unreadCount > 0 ? '<span class="unread-badge">' + conv.unreadCount + '</span>' : ''}
                    </div>
                    <small style="color:#666;">
                      ${lastMsg ? 
                        (lastMsg.senderId === localStorage.getItem('current_user_id') ? 'Vous: ' : '') + 
                        (lastMsg.text.length > 30 ? lastMsg.text.substring(0,30) + '…' : lastMsg.text) + 
                        ' • ' + date + ' ' + time
                        : 'Aucun message'}
                    </small>
                  </div>
                </div>
              `;
            });
            
            container.innerHTML = html;
          }
          
          function openChat(partnerId) {
            window.location.href = '/chat?partner=' + partnerId;
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Paramètres
app.get('/settings', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body style="background:#f4f7f6;">
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          
          <div style="padding:25px;background:white;text-align:center;">
            <div style="font-size:2.5rem;font-weight:bold;">
              <span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span>
            </div>
          </div>
          
          <div style="padding:15px 20px 5px 20px;font-size:0.75rem;color:#888;font-weight:bold;">CONFIDENTIALITÉ</div>
          
          <div class="st-group">
            <div class="st-item"><span>👤 Modifier profil</span><a href="/edit-profile" style="color:#ff416c;text-decoration:none;">Modifier ➔</a></div>
            <div class="st-item"><span>⚕️ Configuration santé</span><a href="/health-config" style="color:#ff416c;text-decoration:none;">Modifier ➔</a></div>
          </div>
          
          <div class="st-group">
            <div class="st-item"><span>🚫 Utilisateurs bloqués</span><a href="/blocked-users" style="color:#ff416c;text-decoration:none;">Voir ➔</a></div>
          </div>
          
          <div class="st-group">
            <div class="st-item" style="color:red;font-weight:bold;">🗑️ Supprimer compte</div>
            <div style="display:flex;justify-content:space-around;padding:15px;">
              <button id="delete-btn" onclick="deleteAccount()" style="background:#dc3545;color:white;border:none;padding:12px 25px;border-radius:12px;cursor:pointer;font-weight:bold;font-size:0.9rem;">Supprimer</button>
              <button onclick="cancelDelete()" style="background:#28a745;color:white;border:none;padding:12px 25px;border-radius:12px;cursor:pointer;font-weight:bold;font-size:0.9rem;">Annuler</button>
            </div>
          </div>
          
          <a href="/profile" class="btn-pink">Retour profil</a>
        </div>
        
        <script>
          async function deleteAccount() {
            if (confirm('⚠️ Supprimer DÉFINITIVEMENT votre compte Genlove ?\\n\\nCette action est irréversible.')) {
              try {
                const userId = localStorage.getItem('current_user_id');
                if (!userId) {
                  showNotify('❌ ID utilisateur manquant');
                  return;
                }
                
                document.getElementById('delete-btn').innerText = 'Suppression...';
                document.getElementById('delete-btn').disabled = true;
                
                const response = await fetch('/api/delete-account/' + userId, { method: 'DELETE' });
                const result = await response.json();
                
                if (response.ok) {
                  localStorage.clear();
                  showNotify('✅ Compte supprimé définitivement');
                  setTimeout(() => { location.href = '/'; }, 2000);
                } else {
                  throw new Error(result.error || 'Erreur serveur');
                }
              } catch(e) {
                console.error('Delete error:', e);
                showNotify('❌ Erreur: ' + e.message);
                document.getElementById('delete-btn').innerText = 'Supprimer';
                document.getElementById('delete-btn').disabled = false;
              }
            }
          }
          
          function cancelDelete() {
            showNotify('❌ Annulation - Compte préservé');
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Édition profil
app.get('/edit-profile', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div id="loader"><div class="spinner"></div><h3>Chargement profil...</h3></div>
          
          <div class="page-white" id="main-content" style="display:none;">
            <h2 style="color:#ff416c;margin-top:0;">✏️ Modifier Profil</h2>
            <form onsubmit="updateProfile(event)">
              <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo</span></div>
              <input type="file" id="i" style="display:none" onchange="preview(event)">
              <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
              <input type="text" id="ln" class="input-box" placeholder="Nom" required>
              <select id="gender" class="input-box">
                <option value="">Genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              <div style="text-align:left;margin-top:10px;padding-left:5px;">
                <small style="color:#666;font-size:0.75rem;">📅 Date de naissance :</small>
              </div>
              <input type="date" id="dob" class="input-box" style="margin-top:2px;">
              <input type="text" id="res" class="input-box" placeholder="Résidence">
              <select id="gt" class="input-box" required>
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex;gap:10px;">
                <select id="gs_type" class="input-box" style="flex:2;">
                  <option value="">Groupe</option>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
                <select id="gs_rh" class="input-box" style="flex:1;">
                  <option>+</option>
                  <option>-</option>
                </select>
              </div>
              <select id="pj" class="input-box">
                <option value="">Désir d'enfant ?</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
              <div class="serment-container">
                <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                <label for="oath" class="serment-text">Je confirme les modifications.</label>
              </div>
              <div style="display:flex;gap:15px;margin-top:20px;">
                <button type="submit" class="btn-pink" style="flex:1;">💾 Enregistrer</button>
                <a href="/settings" class="btn-dark" style="flex:1;text-align:center;line-height:18px;">❌ Annuler</a>
              </div>
            </form>
          </div>
        </div>
        
        <script>
          let b64 = "", userId = "";
          
          window.onload = () => {
            try {
              const userDataStr = localStorage.getItem('current_user_data');
              if (!userDataStr) {
                showNotify('👤 Profil requis');
                setTimeout(() => { window.location.href = '/profile'; }, 1000);
                return;
              }
              
              const userData = JSON.parse(userDataStr);
              userId = localStorage.getItem('current_user_id');
              b64 = localStorage.getItem('current_user_photo') || "";
              
              document.getElementById('fn').value = userData.firstName || "";
              document.getElementById('ln').value = userData.lastName || "";
              document.getElementById('gender').value = userData.gender || "";
              document.getElementById('dob').value = userData.dob || "";
              document.getElementById('res').value = userData.residence || "";
              document.getElementById('gt').value = userData.genotype || "";
              
              if (userData.bloodGroup) {
                const gs = userData.bloodGroup.match(/([ABO]+)([+-])/);
                if (gs) {
                  document.getElementById('gs_type').value = gs[1];
                  document.getElementById('gs_rh').value = gs[2];
                }
              }
              
              document.getElementById('pj').value = userData.desireChild || "";
              
              if (b64) {
                document.getElementById('c').style.backgroundImage = 'url(' + b64 + ')';
                document.getElementById('t').style.display = 'none';
              }
              
              document.getElementById('loader').style.display = 'none';
              document.getElementById('main-content').style.display = 'block';
              showNotify('✅ Profil chargé pour édition');
            } catch(e) {
              console.error('Edit load error:', e);
              showNotify('❌ Erreur chargement');
            }
          };
          
          function preview(e) {
            const r = new FileReader();
            r.onload = () => {
              b64 = r.result;
              document.getElementById('c').style.backgroundImage = 'url(' + b64 + ')';
              document.getElementById('t').style.display = 'none';
            };
            r.readAsDataURL(e.target.files[0]);
          }
          
          async function updateProfile(e) {
            e.preventDefault();
            document.getElementById('loader').style.display = 'flex';
            document.getElementById('main-content').style.display = 'none';
            
            const updates = {
              firstName: document.getElementById('fn').value,
              lastName: document.getElementById('ln').value,
              gender: document.getElementById('gender').value,
              dob: document.getElementById('dob').value,
              residence: document.getElementById('res').value,
              genotype: document.getElementById('gt').value,
              bloodGroup: document.getElementById('gs_type').value ? 
                (document.getElementById('gs_type').value + document.getElementById('gs_rh').value) : "",
              desireChild: document.getElementById('pj').value,
              photo: b64 || localStorage.getItem('current_user_photo') || ""
            };
            
            try {
              const response = await fetch('/api/update-account/' + userId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              });
              
              const result = await response.json();
              
              if (response.ok) {
                localStorage.setItem('current_user_data', JSON.stringify(updates));
                localStorage.setItem('current_user_photo', updates.photo);
                showNotify('✅ Profil mis à jour !');
                setTimeout(() => { window.location.href = '/profile'; }, 1200);
              } else {
                throw new Error(result.error || 'Erreur serveur');
              }
            } catch(err) {
              document.getElementById('loader').style.display = 'none';
              document.getElementById('main-content').style.display = 'block';
              showNotify('❌ Erreur: ' + err.message);
            }
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Configuration santé
app.get('/health-config', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div id="loader"><div class="spinner"></div><h3>Chargement config santé...</h3></div>
          
          <div class="page-white" id="main-content" style="display:none;">
            <h2 style="color:#ff416c;margin-top:0;">⚕️ Configuration Santé</h2>
            <form onsubmit="saveHealthConfig(event)">
              <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
              <input type="text" id="ln" class="input-box" placeholder="Nom" required>
              <select id="gender" class="input-box">
                <option value="">Genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              <input type="date" id="dob" class="input-box">
              <input type="text" id="res" class="input-box" placeholder="Résidence">
              <select id="gt" class="input-box" required>
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex;gap:10px;">
                <select id="gs_type" class="input-box" style="flex:2;">
                  <option value="">Groupe</option>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
                <select id="gs_rh" class="input-box" style="flex:1;">
                  <option>+</option>
                  <option>-</option>
                </select>
              </div>
              <select id="pj" class="input-box">
                <option value="">Désir d'enfant ?</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
              <div style="display:flex;gap:15px;margin-top:20px;">
                <button type="submit" class="btn-pink" style="flex:1;">💾 Enregistrer</button>
                <button type="button" onclick="cancelHealthConfig()" class="btn-dark" style="flex:1;">❌ Annuler</button>
              </div>
            </form>
          </div>
        </div>
        
        <script>
          let userId = "";
          
          window.onload = () => {
            try {
              const userDataStr = localStorage.getItem('current_user_data');
              if (!userDataStr) {
                showNotify('👤 Profil requis');
                setTimeout(() => { window.location.href = '/profile'; }, 1000);
                return;
              }
              
              const userData = JSON.parse(userDataStr);
              userId = localStorage.getItem('current_user_id');
              
              if (!userId) {
                showNotify('❌ ID manquant');
                setTimeout(() => { window.location.href = '/profile'; }, 1000);
                return;
              }
              
              document.getElementById('fn').value = userData.firstName || "";
              document.getElementById('ln').value = userData.lastName || "";
              document.getElementById('gender').value = userData.gender || "";
              document.getElementById('dob').value = userData.dob || "";
              document.getElementById('res').value = userData.residence || "";
              document.getElementById('gt').value = userData.genotype || "";
              
              if (userData.bloodGroup) {
                const gs = userData.bloodGroup.match(/([ABO]+)([+-])/);
                if (gs) {
                  document.getElementById('gs_type').value = gs[1];
                  document.getElementById('gs_rh').value = gs[2];
                }
              }
              
              document.getElementById('pj').value = userData.desireChild || "";
              
              document.getElementById('loader').style.display = 'none';
              document.getElementById('main-content').style.display = 'block';
              showNotify('✅ Config santé chargée');
            } catch(e) {
              console.error('Health config error:', e);
              showNotify('❌ Erreur chargement');
            }
          };
          
          async function saveHealthConfig(e) {
            e.preventDefault();
            document.getElementById('loader').style.display = 'flex';
            document.getElementById('main-content').style.display = 'none';
            
            const updates = {
              firstName: document.getElementById('fn').value,
              lastName: document.getElementById('ln').value,
              gender: document.getElementById('gender').value,
              dob: document.getElementById('dob').value,
              residence: document.getElementById('res').value,
              genotype: document.getElementById('gt').value,
              bloodGroup: document.getElementById('gs_type').value ? 
                (document.getElementById('gs_type').value + document.getElementById('gs_rh').value) : "",
              desireChild: document.getElementById('pj').value
            };
            
            try {
              const response = await fetch('/api/update-account/' + userId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              });
              
              const result = await response.json();
              
              if (response.ok) {
                const currentData = JSON.parse(localStorage.getItem('current_user_data') || '{}');
                const newData = { ...currentData, ...updates };
                localStorage.setItem('current_user_data', JSON.stringify(newData));
                
                showNotify('✅ Config santé enregistrée !');
                setTimeout(() => { window.location.href = '/profile'; }, 1200);
              } else {
                throw new Error(result.error || 'Erreur serveur');
              }
            } catch(err) {
              document.getElementById('loader').style.display = 'none';
              document.getElementById('main-content').style.display = 'block';
              showNotify('❌ Erreur: ' + err.message);
            }
          }
          
          function cancelHealthConfig() {
            if (confirm('Annuler les modifications ?')) {
              window.location.href = '/profile';
            }
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Utilisateurs bloqués
app.get('/blocked-users', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          
          <div style="background:white;padding:20px;text-align:center;border-bottom:1px solid #eee;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <a href="/settings" style="text-decoration:none;background:#eff6ff;color:#1a2a44;padding:8px 14px;border-radius:12px;">⬅️ Retour</a>
              <h3 style="margin:0;color:#1a2a44;">Utilisateurs bloqués</h3>
              <div style="width:40px;"></div>
            </div>
          </div>
          
          <div id="blocked-list" style="padding:20px;">
            <div style="text-align:center;padding:40px;">Chargement...</div>
          </div>
        </div>
        
        <script>
          window.onload = async function() {
            const userId = localStorage.getItem('current_user_id');
            
            if (!userId) {
              showNotify('Veuillez vous connecter');
              setTimeout(() => { window.location.href = '/profile'; }, 1000);
              return;
            }
            
            try {
              const response = await fetch('/api/users/' + userId);
              const data = await response.json();
              
              if (data.success && data.user.blockedUsers && data.user.blockedUsers.length > 0) {
                const blockedIds = data.user.blockedUsers;
                const blockedUsers = [];
                
                for (const id of blockedIds) {
                  const res = await fetch('/api/users/' + id);
                  const userData = await res.json();
                  if (userData.success) {
                    blockedUsers.push(userData.user);
                  }
                }
                
                displayBlockedUsers(blockedUsers);
              } else {
                document.getElementById('blocked-list').innerHTML = '<div style="text-align:center;padding:40px;">🚫 Aucun utilisateur bloqué</div>';
              }
            } catch(e) {
              console.error('Erreur:', e);
              document.getElementById('blocked-list').innerHTML = '<div style="text-align:center;padding:40px;color:#f44336;">❌ Erreur chargement</div>';
            }
          };
          
          function displayBlockedUsers(users) {
            const container = document.getElementById('blocked-list');
            
            if (users.length === 0) {
              container.innerHTML = '<div style="text-align:center;padding:40px;">🚫 Aucun utilisateur bloqué</div>';
              return;
            }
            
            let html = '';
            
            users.forEach(user => {
              html += `
                <div class="conversation-item">
                  <div class="match-photo" style="background-image:url(${user.photo || 'https://via.placeholder.com/150?text=👤'})"></div>
                  <div style="flex:1;">
                    <b>${user.firstName} ${user.lastName}</b>
                    <span class="compatibility-badge badge-${user.genotype}">${user.genotype || '?'}</span>
                  </div>
                  <button class="btn-action" style="background:#4CAF50;color:white;" onclick="unblockUser('${user._id}')">Débloquer</button>
                </div>
              `;
            });
            
            container.innerHTML = html;
          }
          
          async function unblockUser(blockedId) {
            const userId = localStorage.getItem('current_user_id');
            
            try {
              const response = await fetch('/api/unblock-user/' + userId + '/' + blockedId, {
                method: 'POST'
              });
              
              if (response.ok) {
                showNotify('✅ Utilisateur débloqué');
                setTimeout(() => { window.location.reload(); }, 1000);
              }
            } catch(e) {
              showNotify('❌ Erreur: ' + e.message);
            }
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Routes de fin (pour compatibilité)
app.get('/chat-end', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body class="end-overlay">
        <div class="end-card">
          <div style="font-size:50px;margin-bottom:10px;">✨</div>
          <h2 style="color:#1a2a44;">Merci pour cet échange</h2>
          <p style="color:#666;margin-bottom:30px;">Genlove vous remercie.</p>
          <a href="/matching" class="btn-pink" style="width:100%;margin:0;">🔎 Autre profil</a>
        </div>
      </body>
    </html>
  `);
});

app.get('/logout-success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body class="end-overlay">
        <div class="end-card">
          <div style="font-size:50px;margin-bottom:20px;">🛡️</div>
          <h2 style="color:#1a2a44;">Session fermée</h2>
          <p style="color:#666;margin-bottom:30px;">Sécurité assurée.</p>
          <button onclick="location.href='/'" class="btn-dark" style="width:100%;margin:0;border-radius:50px;cursor:pointer;border:none;">Quitter</button>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// 8. DÉMARRAGE DU SERVEUR
// ============================================
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`✅ GENLOVE V4.5 DÉMARRÉ AVEC SUCCÈS`);
  console.log(`🌍 Port: ${port}`);
  console.log(`🕒 ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  console.log(`📱 Routes disponibles:`);
  console.log(`   / - Accueil`);
  console.log(`   /profile - Profil`);
  console.log(`   /matching - Matching`);
  console.log(`   /inbox - Messages`);
  console.log(`   /chat - Discussion`);
  console.log(`   /settings - Paramètres`);
  console.log('='.repeat(60));
});