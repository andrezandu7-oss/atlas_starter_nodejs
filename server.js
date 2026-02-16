const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webPush = require('web-push');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// ============================================
// 1. CONNEXION MONGODB (AVEC TON LIEN EN DUR)
// ============================================
const mongoURI = "mongodb+srv://Genlove:le09022025rose%40@cluster0.6vdjyyo.mongodb.net/?appName=Cluster0";

console.log("🔌 Tentative de connexion à MongoDB...");

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB est CONNECTÉ !"))
  .catch(err => console.error("❌ ERREUR MongoDB :", err.message));

// ============================================
// 2. CONFIGURATION WEB PUSH
// ============================================
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BGxcxQp5yRJ8qW7qJ7X8Z9kL2mN4pQ6rS8tU9vW0xY1zA2bB3cC4dD5eE6fF7gG8hH9iI0jJ',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'hJYzNp4qR6sT8uV0wX2yZ4aB6cD8eF0gH2iJ4kL6mN8oP0qR2sT4uV6wX8yZ0'
};

webPush.setVapidDetails(
  'mailto:contact@genlove.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// ============================================
// 3. MODÈLES MONGODB
// ============================================

// Modèle Utilisateur
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: String,
  dob: String,
  residence: String,
  genotype: { type: String, enum: ['AA', 'AS', 'SS'] },
  bloodGroup: String,
  desireChild: { type: String, enum: ['Oui', 'Non'] },
  photo: { type: String, default: "https://via.placeholder.com/150?text=Photo" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Modèle Subscription (Notifications Push)
const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: String,
    auth: String
  },
  createdAt: { type: Date, default: Date.now },
  userAgent: String
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ============================================
// 4. FONCTIONS UTILITAIRES
// ============================================

function calculerAge(dateNaissance) {
  if (!dateNaissance) return "???";
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

async function sendNotificationToUser(userId, title, body, data = {}) {
  try {
    const subscriptions = await Subscription.find({ userId });
    if (subscriptions.length === 0) return false;
    
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: 'Ouvrir' },
        { action: 'close', title: 'Fermer' }
      ]
    });
    
    const promises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        return true;
      } catch (error) {
        if (error.statusCode === 410) {
          await Subscription.deleteOne({ _id: sub._id });
        }
        return false;
      }
    });
    
    const results = await Promise.all(promises);
    return results.filter(r => r).length > 0;
  } catch (error) {
    console.error("❌ Erreur envoi notification:", error);
    return false;
  }
}

// ============================================
// 5. ROUTES API (TOUTES DÉFINIES AVANT LE LISTEN)
// ============================================

// ---------- REGISTER ----------
app.post('/api/register', async (req, res) => {
  try {
    console.log("📝 Inscription reçue:", req.body);
    const { firstName, lastName, gender, dob, residence, genotype, bloodGroup, desireChild, photo } = req.body;
    
    if (!firstName || !lastName || !genotype) {
      return res.status(400).json({ error: "Prénom, Nom et Génotype obligatoires" });
    }
    
    const newUser = new User({
      firstName,
      lastName,
      gender,
      dob,
      residence,
      genotype,
      bloodGroup,
      desireChild,
      photo: photo || "https://via.placeholder.com/150?text=Photo"
    });
    
    await newUser.save();
    console.log("✅ Utilisateur sauvegardé:", firstName);
    res.json({ success: true, user: newUser._id });
  } catch (error) {
    console.error("❌ Erreur register:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- UPDATE COMPTE ----------
app.put('/api/update-account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    console.log("✅ Compte modifié:", updatedUser.firstName);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ Erreur update:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- SUPPRESSION COMPTE ----------
app.delete('/api/delete-account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    await Subscription.deleteMany({ userId: id });
    console.log("✅ Compte supprimé:", deletedUser.firstName);
    res.json({ success: true, message: "Compte supprimé" });
  } catch (error) {
    console.error("❌ Erreur suppression:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- WEB PUSH : CLÉ PUBLIQUE ----------
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// ---------- WEB PUSH : ABONNEMENT ----------
app.post('/api/subscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    if (!subscription || !userId) {
      return res.status(400).json({ error: "Subscription et userId requis" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    
    await Subscription.deleteMany({ endpoint: subscription.endpoint });
    
    const newSubscription = new Subscription({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: req.headers['user-agent']
    });
    
    await newSubscription.save();
    
    // Notification de confirmation
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: "✅ Notifications activées",
        body: "Vous recevrez les demandes de contact Genlove",
        icon: "/icon-192x192.png",
        url: "/profile"
      })
    ).catch(() => {});
    
    res.json({ success: true, message: "Abonnement enregistré" });
  } catch (error) {
    console.error("❌ Erreur subscription:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- WEB PUSH : DÉSABONNEMENT ----------
app.post('/api/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: "Endpoint requis" });
    await Subscription.deleteMany({ endpoint });
    res.json({ success: true, message: "Désabonnement réussi" });
  } catch (error) {
    console.error("❌ Erreur unsubscribe:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- ENVOI DEMANDE AVEC NOTIFICATION ----------
app.post('/api/send-request', async (req, res) => {
  try {
    const { fromUserId, toUserId, message } = req.body;
    
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: "IDs expéditeur et destinataire requis" });
    }
    
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId)
    ]);
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    
    const notificationSent = await sendNotificationToUser(
      toUserId,
      "💌 Demande de contact - Genlove",
      `${fromUser.firstName} ${fromUser.lastName} souhaite vous contacter`,
      {
        fromUserId: fromUserId.toString(),
        fromUserName: `${fromUser.firstName} ${fromUser.lastName}`,
        message: message || "Souhaite faire connaissance",
        url: `/chat?with=${fromUserId}`
      }
    );
    
    res.json({
      success: true,
      message: "Demande envoyée",
      notificationSent
    });
  } catch (error) {
    console.error("❌ Erreur send-request:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 6. TEMPLATES HTML (head, styles, notifyScript)
// ============================================

const head = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>❤️</text></svg>">
  <meta name="theme-color" content="#ff416c">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>Genlove</title>
`;

const styles = `
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 10px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .home-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; text-align: center; }
    .logox-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-size: cover; background-position: center; background-color: #f8f9fa; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: bold; display: block; margin: 15px; border: none; cursor: pointer; }
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }
    #popup-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center; padding: 20px; }
    .popup-content { background: white; border-radius: 20px; width: 100%; max-width: 380px; padding: 25px; position: relative; text-align: left; animation: slideUp 0.3s; }
    .close-popup { position: absolute; top: 15px; right: 15px; font-size: 1.5rem; cursor: pointer; color: #666; }
    .st-group { background: white; margin: 10px 15px; border-radius: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }
    .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: 0.4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.4s; border-radius: 50%; }
    input:checked + .slider { background-color: #007bff; }
    input:checked + .slider:before { transform: translateX(21px); }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; background-size: cover; background-position: center; border: 2px solid #ff416c; }
    .end-overlay { position: fixed; inset: 0; background: linear-gradient(180deg, #4a76bb 0%, #1a2a44 100%); z-index: 9999; display: flex; align-items: center; justify-content: center; }
    .end-card { background: white; border-radius: 30px; padding: 40px 25px; width: 85%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .permission-banner { background: #e3f2fd; padding: 15px; margin: 15px; border-radius: 12px; text-align: center; border-left: 5px solid #2196f3; }
    .permission-button { background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin-top: 10px; cursor: pointer; }
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; }
    .btn-quit { background: white; color: #9dbce3; border: none; width: 32px; height: 32px; border-radius: 8px; font-size: 1.2rem; cursor: pointer; }
    .btn-logout-badge { background: #1a2a44; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
    .bubble.received { background: #e2ecf7; align-self: flex-start; }
    .bubble.sent { background: #ff416c; color: white; align-self: flex-end; }
    .input-area { position: fixed; bottom: 0; width: 100%; max-width: 420px; padding: 10px 15px 45px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; }
    .input-area textarea { flex: 1; background: #f1f3f4; border: none; padding: 12px; border-radius: 25px; resize: none; }
    .input-area button { background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; }
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
    
    function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  </script>
`;

// ============================================
// 7. ROUTES PAGES
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
            <div class="logox-text">
              <span style="color:#1a2a44;">Gen</span>
              <span style="color:#ff416c;">love</span>
            </div>
            <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
            <div style="width:100%; margin-top:20px;">
              <p style="font-size:0.9rem; color:#1a2a44;">Avez-vous déjà un compte ?</p>
              <a href="/profile" class="btn-dark">→ Se connecter</a>
              <a href="/charte-engagement" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">Créer un compte</a>
            </div>
            <div style="font-size:0.75rem; color:#666; margin-top:25px;">
              Vos données sont cryptées et confidentielles.
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Charte engagement
app.get('/charte-engagement', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body style="background:#fdf2f2;">
        <div class="app-shell">
          <div class="page-white" style="display:flex; flex-direction:column; justify-content:center; padding:30px; min-height:100vh;">
            <div style="font-size:3.5rem;">❤️</div>
            <h2 style="color:#1a2a44;">Engagement Éthique</h2>
            <p style="color:#666; font-size:0.9rem;">Pour protéger la santé de votre future famille.</p>
            <div id="charte-box" style="height:220px; overflow-y:scroll; background:#fff5f7; border:2px solid #ffdae0; border-radius:15px; padding:20px; text-align:left;" onscroll="checkScroll(this)">
              <b style="color:#ff416c;">1. Sincérité</b><br>Données médicales conformes.<br><br>
              <b style="color:#ff416c;">2. Confidentialité</b><br>Échanges éphémères (30min).<br><br>
              <b style="color:#ff416c;">3. Sérénité</b><br>Protection des enfants.<br><br>
              <b style="color:#ff416c;">4. Respect</b><br>Non-stigmatisation.<br><br>
              <hr>
              <center><i style="color:#ff416c;">Scrollez jusqu'en bas...</i></center>
            </div>
            <button id="agree-btn" onclick="location.href='/signup'" class="btn-pink" style="background:#ccc; cursor:not-allowed;" disabled>J'ai lu et je m'engage</button>
            <a href="/" style="margin-top:15px; color:#666;">Annuler</a>
          </div>
        </div>
        <script>
          function checkScroll(el) {
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 5) {
              const btn = document.getElementById('agree-btn');
              btn.disabled = false;
              btn.style.backgroundColor = "#ff416c";
              btn.style.cursor = "pointer";
              el.style.borderColor = "#4CAF50";
            }
          }
        </script>
      </body>
    </html>
  `);
});

// Signup
app.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>
          <div class="page-white" id="main-content">
            <h2 style="color:#ff416c;">❤️ Configuration Santé</h2>
            <form onsubmit="saveAndRedirect(event)">
              <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                <span id="t">📷 Photo</span>
              </div>
              <input type="file" id="i" style="display:none" onchange="preview(event)" accept="image/*">
              <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
              <input type="text" id="ln" class="input-box" placeholder="Nom" required>
              <select id="gender" class="input-box">
                <option value="">Genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              <div style="text-align:left;"><small>Date de naissance</small></div>
              <input type="date" id="dob" class="input-box">
              <input type="text" id="res" class="input-box" placeholder="Résidence">
              <select id="gt" class="input-box">
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex; gap:10px;">
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
                <input type="checkbox" id="oath" style="width:20px; height:20px;" required>
                <label for="oath" class="serment-text">Je confirme mon engagement éthique.</label>
              </div>
              <button type="submit" class="btn-pink" style="width:100%;">✅ Créer mon compte</button>
            </form>
          </div>
        </div>
        ${notifyScript}
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
              bloodGroup: document.getElementById('gs_type').value ? document.getElementById('gs_type').value + document.getElementById('gs_rh').value : "",
              desireChild: document.getElementById('pj').value,
              photo: b64 || "https://via.placeholder.com/150?text=Photo"
            };
            try {
              const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
              });
              const result = await response.json();
              if (response.ok) {
                localStorage.setItem('current_user_data', JSON.stringify(userData));
                localStorage.setItem('current_user_photo', userData.photo);
                localStorage.setItem('current_user_id', result.user);
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
          <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div style="display:flex; justify-content:space-between;">
              <a href="/" style="text-decoration:none; background:#eff6ff; color:#1a2a44; padding:8px 14px; border-radius:12px;">🏠 Accueil</a>
              <a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a>
            </div>
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-color:#eee;"></div>
            <h2 id="vN">Chargement...</h2>
            <p id="vR" style="color:#666;">Chargement...</p>
            <p style="color:#007bff;">✅ Profil Santé Validé</p>
          </div>
          
          <div id="push-permission-banner" style="display:none;"></div>
          
          <div style="padding:15px 20px 5px; color:#888;">📋 MES INFORMATIONS</div>
          <div class="st-group">
            <div class="st-item"><span>Génotype</span><b id="rG">Chargement...</b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS">Chargement...</b></div>
            <div class="st-item"><span>Âge</span><b id="rAge">Chargement...</b></div>
            <div class="st-item"><span>Résidence</span><b id="rRes">Chargement...</b></div>
            <div class="st-item"><span>Projet</span><b id="rP">Chargement...</b></div>
          </div>
          <a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a>
        </div>
        
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
          
          function calculerAge(dateNaissance) {
            if (!dateNaissance) return "???";
            const today = new Date();
            const birthDate = new Date(dateNaissance);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
          }
          
          async function initPushNotifications() {
            if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
            const userId = localStorage.getItem('current_user_id');
            if (!userId) return;
            
            if (Notification.permission === 'granted') {
              registerServiceWorker(userId);
            } else if (Notification.permission !== 'denied') {
              const banner = document.getElementById('push-permission-banner');
              banner.style.display = 'block';
              banner.className = 'permission-banner';
              banner.innerHTML = \`
                <strong>🔔 Activer les notifications</strong>
                <p style="margin:5px 0;">Recevez les demandes même en veille</p>
                <button id="enable-push" class="permission-button">✅ Activer</button>
              \`;
              
              document.getElementById('enable-push').addEventListener('click', async () => {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  banner.style.display = 'none';
                  await registerServiceWorker(userId);
                  showNotify('✅ Notifications activées !');
                }
              });
            }
          }
          
          async function registerServiceWorker(userId) {
            try {
              const registration = await navigator.serviceWorker.register('/sw.js');
              const response = await fetch('/api/vapid-public-key');
              const { publicKey } = await response.json();
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
              });
              await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription, userId })
              });
            } catch (err) {
              console.error('Erreur subscription:', err);
            }
          }
          
          window.onload = function() {
            try {
              const stored = localStorage.getItem('current_user_data');
              if (!stored) {
                showNotify('👤 Redirection...');
                setTimeout(() => { window.location.href = '/signup'; }, 1000);
                return;
              }
              
              const userData = JSON.parse(stored);
              const photo = localStorage.getItem('current_user_photo') || "https://via.placeholder.com/150?text=Photo";
              const userId = localStorage.getItem('current_user_id');
              
              if (!userData.firstName || !userData.genotype) {
                setTimeout(() => { window.location.href = '/signup'; }, 1000);
                return;
              }
              
              document.getElementById('vP').style.backgroundImage = 'url(' + photo + ')';
              document.getElementById('vN').innerText = userData.firstName + ' ' + userData.lastName;
              document.getElementById('vR').innerText = userData.residence || 'Luanda';
              document.getElementById('rG').innerText = userData.genotype || '-';
              document.getElementById('rS').innerText = userData.bloodGroup || '-';
              document.getElementById('rAge').innerText = userData.dob ? calculerAge(userData.dob) + ' ans' : '-';
              document.getElementById('rRes').innerText = userData.residence || 'Luanda';
              document.getElementById('rP').innerText = userData.desireChild === 'Oui' ? 'Oui' : 'Non';
              
              showNotify('✅ Profil chargé !');
              initPushNotifications();
            } catch (e) {
              console.error('Erreur:', e);
              localStorage.clear();
              setTimeout(() => { window.location.href = '/signup'; }, 1500);
            }
          };
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Health Config
app.get('/health-config', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div id="loader"><div class="spinner"></div><h3>Chargement...</h3></div>
          <div class="page-white" id="main-content" style="display:none;">
            <h2 style="color:#ff416c;">⚕️ Configuration Santé</h2>
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
              <select id="gt" class="input-box">
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex; gap:10px;">
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
              <div style="display:flex; gap:15px; margin-top:20px;">
                <button type="submit" class="btn-pink" style="flex:1;">💾 Enregistrer</button>
                <button type="button" onclick="window.location.href='/profile'" class="btn-dark" style="flex:1;">❌ Annuler</button>
              </div>
            </form>
          </div>
        </div>
        <script>
          let userId = "";
          window.onload = () => {
            try {
              const userDataStr = localStorage.getItem('current_user_data');
              if (!userDataStr) { window.location.href = '/profile'; return; }
              const userData = JSON.parse(userDataStr);
              userId = localStorage.getItem('current_user_id');
              if (!userId) { window.location.href = '/profile'; return; }
              
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
              showNotify('✅ Config chargée');
            } catch (e) {
              console.error(e);
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
                document.getElementById('gs_type').value + document.getElementById('gs_rh').value : "",
              desireChild: document.getElementById('pj').value
            };
            
            try {
              const response = await fetch('/api/update-account/' + userId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              });
              
              if (response.ok) {
                localStorage.setItem('current_user_data', JSON.stringify(updates));
                showNotify('✅ Config enregistrée !');
                setTimeout(() => { window.location.href = '/profile'; }, 1200);
              } else {
                throw new Error('Erreur');
              }
            } catch (err) {
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

// MATCHING AVEC RÈGLE SS CORRIGÉE
app.get('/matching', async (req, res) => {
  try {
    const users = await User.find({}).select('firstName lastName gender dob residence genotype bloodGroup desireChild photo _id').lean();
    
    const partnersWithAge = users.filter(u => u.genotype && u.gender && u._id).map(u => ({
      id: u._id.toString().slice(-4),
      fullId: u._id.toString(),
      gt: u.genotype,
      gs: u.bloodGroup,
      pj: u.desireChild === "Oui" ? "Désire fonder une famille" : "Sans enfants",
      name: u.firstName + " " + u.lastName.charAt(0) + ".",
      dob: u.dob,
      res: u.residence || "Luanda",
      gender: u.gender,
      photo: u.photo
    }));
    
    const matchesHTML = partnersWithAge.map(p => `
      <div class="match-card" data-gt="${p.gt}" data-gender="${p.gender}" data-userid="${p.fullId}">
        <div class="match-photo-blur" style="background-image:url(${p.photo})"></div>
        <div style="flex:1">
          <b>${p.name} (#${p.id})</b><br>
          <small>${calculerAge(p.dob)} ans • ${p.res} • ${p.gt}</small>
        </div>
        <div style="display:flex;">
          <button class="btn-action btn-contact" onclick="sendRequest('${p.fullId}', '${p.name}')">Contacter</button>
          <button class="btn-action btn-details" onclick='showDetails(${JSON.stringify(p).replace(/'/g, "\\'")})'>Détails</button>
        </div>
      </div>
    `).join('');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>${head}${styles}</head>
        <body style="background:#f4f7f6;">
          <div class="app-shell">
            <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
            <div style="padding:20px; background:white; text-align:center;">
              <h3 style="margin:0; color:#1a2a44;">Partenaires (${partnersWithAge.length})</h3>
            </div>
            <div id="match-container">
              ${matchesHTML || '<p style="text-align:center; padding:40px;">Aucun partenaire</p>'}
            </div>
            <a href="/profile" class="btn-pink">Retour</a>
          </div>
          
          <div id="popup-overlay" onclick="closePopup()">
            <div class="popup-content" onclick="event.stopPropagation()">
              <span class="close-popup" onclick="closePopup()">&times;</span>
              <h3 id="pop-name" style="color:#ff416c;">Détails</h3>
              <div id="pop-details"></div>
              <div id="pop-msg" style="background:#e7f3ff; padding:15px; border-radius:12px; margin-top:15px;"></div>
              <button id="pop-btn" class="btn-pink" style="margin:20px 0 0;">🚀 Contacter</button>
            </div>
          </div>
          
          ${notifyScript}
          <script>
            let sP = null;
            
            function calculerAge(dateNaissance) {
              if (!dateNaissance) return "???";
              const today = new Date();
              const birthDate = new Date(dateNaissance);
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
              return age;
            }
            
            function showDetails(p) {
              sP = p;
              document.getElementById('pop-name').innerText = p.name + ' #' + p.id;
              document.getElementById('pop-details').innerHTML = 
                "<b>Âge:</b> " + calculerAge(p.dob) + " ans<br>" +
                "<b>Résidence:</b> " + p.res + "<br>" +
                "<b>Génotype:</b> " + p.gt + "<br>" +
                "<b>Groupe:</b> " + p.gs + "<br><br>" +
                "<b>Projet:</b><br><i>" + p.pj + "</i>";
              
              document.getElementById('pop-msg').innerHTML = "<b>L'Union Sérénité:</b> Compatibilité validée.";
              document.getElementById('pop-btn').onclick = () => sendRequest(p.fullId, p.name);
              document.getElementById('popup-overlay').style.display = 'flex';
            }
            
            function closePopup() {
              document.getElementById('popup-overlay').style.display = 'none';
            }
            
            async function sendRequest(toUserId, toName) {
              const fromUserId = localStorage.getItem('current_user_id');
              if (!fromUserId) {
                showNotify('❌ Connectez-vous');
                return;
              }
              
              try {
                const response = await fetch('/api/send-request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fromUserId, toUserId })
                });
                
                if (response.ok) {
                  showNotify('✅ Demande envoyée à ' + toName);
                  closePopup();
                } else {
                  throw new Error('Erreur');
                }
              } catch (err) {
                showNotify('❌ Erreur: ' + err.message);
              }
            }
            
            window.onload = () => {
              try {
                const myDataStr = localStorage.getItem('current_user_data');
                if (!myDataStr) {
                  window.location.href = '/profile';
                  return;
                }
                
                const myData = JSON.parse(myDataStr);
                const myGt = myData.genotype;
                const myGender = myData.gender;
                const myId = localStorage.getItem('current_user_id');
                
                if (!myGt) return;
                
                let totalFiltered = 0;
                
                document.querySelectorAll('.match-card').forEach(card => {
                  const pGt = card.dataset.gt;
                  const pGender = card.dataset.gender;
                  const pUserId = card.dataset.userid;
                  
                  let visible = true;
                  
                  if (pUserId === myId) visible = false;
                  if (myGender && pGender === myGender) visible = false;
                  
                  // RÈGLE SS STRICTE : SS ne peut voir que AA
                  if (myGt === 'SS' && pGt !== 'AA') visible = false;
                  // RÈGLE AS : ne peut voir que AA
                  if (myGt === 'AS' && pGt !== 'AA') visible = false;
                  // INTERDICTION SS-SS (sécurité supplémentaire)
                  if (myGt === 'SS' && pGt === 'SS') visible = false;
                  
                  if (visible) {
                    totalFiltered++;
                    card.style.display = 'flex';
                  } else {
                    card.style.display = 'none';
                  }
                });
                
                if ((myGt === "SS" || myGt === "AS") && totalFiltered === 0) {
                  document.getElementById('pop-name').innerText = "🛡️ Protection Santé";
                  document.getElementById('pop-details').innerHTML = 
                    "Partenaires AA uniquement pour garantir une descendance sans drépanocytose.";
                  document.getElementById('pop-msg').style.display = 'none';
                  document.getElementById('pop-btn').innerText = "Je comprends";
                  document.getElementById('pop-btn').onclick = closePopup;
                  document.getElementById('popup-overlay').style.display = 'flex';
                }
              } catch (e) {
                console.error(e);
              }
            };
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Erreur matching:", error);
    res.status(500).send("Erreur");
  }
});

// Settings
app.get('/settings', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body style="background:#f4f7f6;">
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div style="padding:25px; background:white; text-align:center;">
            <div style="font-size:2.5rem;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
          </div>
          
          <div style="padding:15px 20px 5px; color:#888;">🔐 CONFIDENTIALITÉ</div>
          <div class="st-group">
            <div class="st-item">
              <span>Visibilité</span>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="st-item">
              <span>Notifications</span>
              <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            </div>
          </div>
          
          <div class="st-group">
            <a href="/edit-profile" class="st-item"><span>📝 Modifier profil</span><b>→</b></a>
            <a href="/health-config" class="st-item"><span>⚕️ Config santé</span><b>→</b></a>
            <a href="/notifications-settings" class="st-item"><span>🔔 Notifications push</span><b>→</b></a>
          </div>
          
          <div class="st-group">
            <div class="st-item" style="color:red;">⚠️ Supprimer compte</div>
          </div>
          
          <div style="display:flex; justify-content:space-around; padding:15px;">
            <button id="delete-btn" onclick="deleteAccount()" style="background:#dc3545; color:white; border:none; padding:12px 25px; border-radius:12px;">🗑️ Supprimer</button>
            <button onclick="cancelDelete()" style="background:#28a745; color:white; border:none; padding:12px 25px; border-radius:12px;">✅ Annuler</button>
          </div>
          
          <a href="/profile" class="btn-pink">Retour</a>
        </div>
        
        <script>
          async function deleteAccount() {
            if (confirm('⚠️ Supprimer définitivement ?')) {
              try {
                const userId = localStorage.getItem('current_user_id');
                if (!userId) return;
                
                document.getElementById('delete-btn').innerText = 'Suppression...';
                const response = await fetch('/api/delete-account/' + userId, { method: 'DELETE' });
                
                if (response.ok) {
                  localStorage.clear();
                  showNotify('✅ Compte supprimé');
                  setTimeout(() => { location.href = '/'; }, 2000);
                }
              } catch (e) {
                console.error(e);
                document.getElementById('delete-btn').innerText = 'Supprimer';
              }
            }
          }
          
          function cancelDelete() {
            showNotify('✅ Annulation');
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Edit Profil
app.get('/edit-profile', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div id="loader"><div class="spinner"></div><h3>Chargement...</h3></div>
          <div class="page-white" id="main-content" style="display:none;">
            <h2 style="color:#ff416c;">📝 Modifier Profil</h2>
            <form onsubmit="updateProfile(event)">
              <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                <span id="t">📷 Photo</span>
              </div>
              <input type="file" id="i" style="display:none" onchange="preview(event)">
              <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
              <input type="text" id="ln" class="input-box" placeholder="Nom" required>
              <select id="gender" class="input-box">
                <option value="">Genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              <input type="date" id="dob" class="input-box">
              <input type="text" id="res" class="input-box" placeholder="Résidence">
              <select id="gt" class="input-box">
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex; gap:10px;">
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
              <div style="display:flex; gap:15px; margin-top:30px;">
                <button type="submit" class="btn-pink" style="flex:1;">💾 Sauvegarder</button>
                <button type="button" onclick="window.location.href='/profile'" class="btn-dark" style="flex:1;">❌ Annuler</button>
              </div>
            </form>
          </div>
        </div>
        
        <script>
          let b64 = "";
          let userId = "";
          
          window.onload = () => {
            try {
              const userDataStr = localStorage.getItem('current_user_data');
              if (!userDataStr) { window.location.href = '/profile'; return; }
              
              const userData = JSON.parse(userDataStr);
              userId = localStorage.getItem('current_user_id');
              b64 = localStorage.getItem('current_user_photo') || "";
              
              if (!userId) { window.location.href = '/profile'; return; }
              
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
            } catch (e) {
              console.error(e);
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
            
            const updates = {
              firstName: document.getElementById('fn').value,
              lastName: document.getElementById('ln').value,
              gender: document.getElementById('gender').value,
              dob: document.getElementById('dob').value,
              residence: document.getElementById('res').value,
              genotype: document.getElementById('gt').value,
              bloodGroup: document.getElementById('gs_type').value ? 
                document.getElementById('gs_type').value + document.getElementById('gs_rh').value : "",
              desireChild: document.getElementById('pj').value,
              photo: b64
            };
            
            try {
              const response = await fetch('/api/update-account/' + userId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              });
              
              if (response.ok) {
                localStorage.setItem('current_user_data', JSON.stringify(updates));
                if (b64) localStorage.setItem('current_user_photo', b64);
                showNotify('✅ Profil mis à jour !');
                setTimeout(() => { window.location.href = '/profile'; }, 1200);
              }
            } catch (err) {
              document.getElementById('loader').style.display = 'none';
              showNotify('❌ Erreur: ' + err.message);
            }
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Notifications Settings
app.get('/notifications-settings', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div class="page-white">
            <h2 style="color:#ff416c;">🔔 Notifications</h2>
            
            <div class="st-group">
              <div class="st-item">
                <span>Activer les notifications</span>
                <label class="switch">
                  <input type="checkbox" id="push-toggle" onchange="togglePush()">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div id="push-status" style="padding:20px; background:#f8f9fa; border-radius:15px; margin:20px 0;">
              <p>Vérification...</p>
            </div>
            
            <button onclick="testNotification()" class="btn-dark">📱 Tester</button>
            <button onclick="window.location.href='/settings'" class="btn-pink">Retour</button>
          </div>
        </div>
        
        <script>
          async function checkPushStatus() {
            if (!('Notification' in window)) {
              document.getElementById('push-status').innerHTML = '<p>❌ Non supporté</p>';
              return;
            }
            
            const toggle = document.getElementById('push-toggle');
            
            if (Notification.permission === 'granted') {
              document.getElementById('push-status').innerHTML = '<p style="color:#28a745;">✅ Activées</p>';
              toggle.checked = true;
            } else if (Notification.permission === 'denied') {
              document.getElementById('push-status').innerHTML = '<p style="color:#dc3545;">❌ Bloquées</p>';
              toggle.checked = false;
            } else {
              document.getElementById('push-status').innerHTML = '<p>🔔 En attente</p>';
              toggle.checked = false;
            }
          }
          
          async function togglePush() {
            if (Notification.permission === 'granted') {
              if (confirm('Désactiver ?')) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                  await subscription.unsubscribe();
                  await fetch('/api/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                  });
                }
                showNotify('🔕 Désactivées');
              }
            } else {
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                const userId = localStorage.getItem('current_user_id');
                if (userId) {
                  const registration = await navigator.serviceWorker.register('/sw.js');
                  const response = await fetch('/api/vapid-public-key');
                  const { publicKey } = await response.json();
                  
                  const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                  });
                  
                  await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subscription, userId })
                  });
                  
                  showNotify('✅ Activées !');
                }
              }
            }
            checkPushStatus();
          }
          
          async function testNotification() {
            const userId = localStorage.getItem('current_user_id');
            if (!userId) {
              showNotify('❌ Connectez-vous');
              return;
            }
            
            try {
              const response = await fetch('/api/send-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUserId: userId, toUserId: userId })
              });
              
              const result = await response.json();
              if (result.notificationSent) {
                showNotify('✅ Test envoyé !');
              }
            } catch (err) {
              showNotify('❌ Erreur: ' + err.message);
            }
          }
          
          window.onload = checkPushStatus;
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// Chat
app.get('/chat', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell" style="background:#f0f2f5; height:100vh; overflow:hidden;">
          <div class="chat-header">
            <button class="btn-quit" onclick="if(confirm('Quitter ?')) location.href='/chat-end'">←</button>
            <div class="digital-clock"><span id="timer-display">30:00</span></div>
            <button class="btn-logout-badge" onclick="if(confirm('Déconnecter ?')) location.href='/logout-success'">Logout</button>
          </div>
          
          <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! Ton profil m'intéresse</div>
          </div>
          
          <div class="input-area">
            <textarea id="msg" placeholder="Écrivez..."></textarea>
            <button onclick="send()">➤</button>
          </div>
        </div>
        
        <script>
          let t = 1800;
          function startTimer() {
            setInterval(() => {
              t--;
              let m = Math.floor(t/60), s = t%60;
              document.getElementById('timer-display').innerText = 
                (m<10?'0'+m:m) + ':' + (s<10?'0'+s:s);
              if (t<=0) {
                localStorage.clear();
                window.location.href = '/logout-success';
              }
            }, 1000);
          }
          
          function send() {
            const i = document.getElementById('msg');
            if (i.value.trim()) {
              const d = document.createElement('div');
              d.className = 'bubble sent';
              d.innerHTML = i.value;
              document.getElementById('box').appendChild(d);
              i.value = "";
            }
          }
          
          startTimer();
        </script>
      </body>
    </html>
  `);
});

// Chat End
app.get('/chat-end', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body class="end-overlay">
        <div class="end-card">
          <div style="font-size:50px;">✨</div>
          <h2 style="color:#1a2a44;">Merci</h2>
          <p>Genlove vous remercie.</p>
          <a href="/matching" class="btn-pink">🔎 Autre profil</a>
        </div>
      </body>
    </html>
  `);
});

// Logout Success
app.get('/logout-success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body class="end-overlay">
        <div class="end-card">
          <div style="font-size:50px;">🛡️</div>
          <h2 style="color:#1a2a44;">Session fermée</h2>
          <p>Sécurité assurée.</p>
          <button onclick="location.href='/'" class="btn-dark">Quitter</button>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// 8. DÉMARRAGE DU SERVEUR
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur Genlove V4.4 lancé sur le port ${PORT}`);
  console.log(`✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'CONNECTÉ' : 'EN ATTENTE'}`);
  console.log(`✅ Web Push: ${vapidKeys.publicKey.substring(0, 20)}...`);
});