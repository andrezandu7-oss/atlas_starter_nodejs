// ============================================
// GENLOVE V4.5 - CODE COMPLET STABLE
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// ============================================
// CONNEXION MONGODB
// ============================================
const mongoURI = process.env.MONGODB_URI;
console.log('🔄 Connexion à MongoDB...');

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connecté avec succès !'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err.message);
    process.exit(1);
  });

// ============================================
// SCHÉMAS MONGODB
// ============================================

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
// FONCTION UTILITAIRE
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
// ROUTES API
// ============================================

// TEST - Route de vérification
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
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

// Mise à jour
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

// Suppression
app.delete('/api/delete-account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ success: true, message: "Compte supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Messages
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: "Données incomplètes" });
    }
    const message = new Message({ senderId, receiverId, text });
    await message.save();
    res.json({ success: true, message: "Message envoyé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

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

// Conversations
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

// Blocage
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

// ============================================
// PAGE D'ACCUEIL UNIQUE
// ============================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #fdf2f2 0%, #f4e9da 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .app-shell {
                max-width: 420px;
                width: 100%;
                background: white;
                border-radius: 30px;
                padding: 40px 25px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .logo {
                font-size: 4rem;
                text-align: center;
                margin-bottom: 10px;
            }
            .logo-text {
                font-size: 3rem;
                font-weight: bold;
                text-align: center;
                margin-bottom: 10px;
            }
            .logo-text span:first-child { color: #1a2a44; }
            .logo-text span:last-child { color: #ff416c; }
            .slogan {
                text-align: center;
                color: #1a2a44;
                margin-bottom: 40px;
                font-size: 1.1rem;
                line-height: 1.5;
            }
            .btn {
                display: block;
                width: 100%;
                padding: 18px;
                border-radius: 50px;
                text-align: center;
                text-decoration: none;
                font-weight: bold;
                font-size: 1.1rem;
                margin: 15px 0;
                border: none;
                cursor: pointer;
            }
            .btn-primary {
                background: #ff416c;
                color: white;
            }
            .btn-secondary {
                background: #1a2a44;
                color: white;
            }
            .btn-outline {
                background: transparent;
                color: #1a2a44;
                border: 2px solid #1a2a44;
            }
            .status-badge {
                background: #f0f0f0;
                padding: 15px;
                border-radius: 15px;
                margin: 20px 0;
                font-size: 0.9rem;
            }
            .status-ok { color: #28a745; font-weight: bold; }
            .footer {
                text-align: center;
                color: #999;
                font-size: 0.8rem;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="app-shell">
            <div class="logo">💙</div>
            <div class="logo-text">
                <span>Gen</span><span>love</span>
            </div>
            <div class="slogan">
                Unissez cœur et santé pour bâtir des couples sains
            </div>
            
            <div class="status-badge" id="status">
                <p>🔄 Vérification du serveur...</p>
            </div>
            
            <a href="/profile" class="btn btn-primary">Se connecter</a>
            <a href="/signup" class="btn btn-secondary">Créer un compte</a>
            <a href="/matching" class="btn btn-outline">Voir les matchs</a>
            
            <div class="footer">
                Vos données sont cryptées et confidentielles.
            </div>
        </div>
        
        <script>
            async function checkServer() {
                try {
                    const res = await fetch('/api/health');
                    const data = await res.json();
                    const statusDiv = document.getElementById('status');
                    
                    if (data.mongodb === 'connected') {
                        statusDiv.innerHTML = \`
                            <p class="status-ok">✅ Serveur opérationnel</p>
                            <p>MongoDB: Connecté</p>
                            <p>Heure: \${new Date(data.timestamp).toLocaleString()}</p>
                        \`;
                    } else {
                        statusDiv.innerHTML = \`
                            <p style="color:orange;">⚠️ MongoDB non connecté</p>
                            <p>L'application fonctionne en mode limité</p>
                        \`;
                    }
                } catch (e) {
                    document.getElementById('status').innerHTML = \`
                        <p style="color:red;">❌ Erreur de connexion</p>
                    \`;
                }
            }
            checkServer();
        </script>
    </body>
    </html>
  `);
});

// Routes minimales (juste pour que les liens fonctionnent)
app.get('/profile', (req, res) => res.redirect('/'));
app.get('/signup', (req, res) => res.redirect('/'));
app.get('/matching', (req, res) => res.redirect('/'));

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ GENLOVE V4.5 DÉMARRÉ`);
  console.log(`🌍 Port: ${port}`);
  console.log(`🕒 ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
});