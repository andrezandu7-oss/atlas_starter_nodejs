// ============================================
// GENLOVE - VERSION ULTRA STABLE
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connexion MongoDB avec logs détaillés
const mongoURI = process.env.MONGODB_URI;
console.log('🔌 Tentative de connexion à MongoDB...');

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MONGO DB CONNECTÉ AVEC SUCCÈS !');
    console.log('📊 Base de données:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ ERREUR MONGODB:', err.message);
    console.error('🔑 Vérifiez votre MONGODB_URI dans .env');
  });

// ============================================
// STYLES
// ============================================
const styles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 30px;
      padding: 40px 25px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      text-align: center;
    }
    h1 {
      color: #ff416c;
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    .slogan {
      color: #1a2a44;
      margin-bottom: 30px;
      font-size: 1rem;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 18px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      margin: 15px 0;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary {
      background: #ff416c;
      color: white;
    }
    .btn-secondary {
      background: #1a2a44;
      color: white;
    }
    .status {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 15px;
      margin: 20px 0;
      font-size: 0.9rem;
    }
    .success { color: #28a745; font-weight: bold; }
    .error { color: #dc3545; font-weight: bold; }
    .info { color: #17a2b8; }
  </style>
`;

// ============================================
// PAGE UNIQUE - TOUT EN UN
// ============================================
app.get('*', (req, res) => {
  // Déterminer la page à afficher basée sur l'URL
  const path = req.path;
  
  let content = '';
  
  if (path === '/signup') {
    // Page inscription
    content = `
      <h1>📝 Inscription</h1>
      <form id="signupForm">
        <input type="text" id="firstName" placeholder="Prénom" style="width:100%; padding:15px; margin:10px 0; border-radius:10px; border:1px solid #ddd;" required>
        <input type="text" id="lastName" placeholder="Nom" style="width:100%; padding:15px; margin:10px 0; border-radius:10px; border:1px solid #ddd;" required>
        <select id="genotype" style="width:100%; padding:15px; margin:10px 0; border-radius:10px; border:1px solid #ddd;" required>
          <option value="">Génotype</option>
          <option>AA</option>
          <option>AS</option>
          <option>SS</option>
        </select>
        <button type="submit" class="btn btn-primary">S'inscrire</button>
      </form>
      <a href="/" class="btn btn-secondary">Retour accueil</a>
      
      <script>
        document.getElementById('signupForm').onsubmit = async (e) => {
          e.preventDefault();
          const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            genotype: document.getElementById('genotype').value
          };
          
          const res = await fetch('/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
          });
          const data = await res.json();
          
          if (data.success) {
            localStorage.setItem('userId', data.user);
            alert('✅ Inscription réussie !');
            window.location.href = '/profile?id=' + data.user;
          } else {
            alert('❌ ' + data.error);
          }
        };
      </script>
    `;
  } 
  else if (path === '/profile') {
    // Page profil
    const userId = req.query.id || '';
    content = `
      <h1>👤 Profil</h1>
      <div id="profileData" class="status">Chargement...</div>
      <a href="/" class="btn btn-secondary">Retour accueil</a>
      
      <script>
        (async () => {
          const userId = localStorage.getItem('userId') || '${userId}';
          if (!userId) {
            document.getElementById('profileData').innerHTML = '<p class="error">Non connecté</p>';
            return;
          }
          
          try {
            const res = await fetch('/api/users/' + userId);
            const data = await res.json();
            if (data.success) {
              document.getElementById('profileData').innerHTML = \`
                <p><b>ID:</b> \${data.user._id}</p>
                <p><b>Nom:</b> \${data.user.firstName} \${data.user.lastName}</p>
                <p><b>Génotype:</b> \${data.user.genotype}</p>
              \`;
            } else {
              document.getElementById('profileData').innerHTML = '<p class="error">Utilisateur non trouvé</p>';
            }
          } catch(e) {
            document.getElementById('profileData').innerHTML = '<p class="error">Erreur chargement</p>';
          }
        })();
      </script>
    `;
  }
  else {
    // Page accueil (par défaut)
    const dbStatus = mongoose.connection.readyState === 1 ? 
      '<span class="success">✅ MongoDB connecté</span>' : 
      '<span class="error">❌ MongoDB déconnecté</span>';
    
    content = `
      <div class="logo-text">
        <span style="color:#1a2a44;">Gen</span>
        <span style="color:#ff416c;">love</span>
      </div>
      <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
      
      <div class="status">
        <p>${dbStatus}</p>
        <p class="info">Serveur: ${new Date().toLocaleString()}</p>
      </div>
      
      <a href="/signup" class="btn btn-primary">Créer un compte</a>
      <a href="/profile" class="btn btn-secondary">Se connecter</a>
    `;
  }
  
  // Envoyer la page complète
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove</title>
        ${styles}
      </head>
      <body>
        <div class="card">
          ${content}
          <div style="margin-top: 20px; font-size: 0.8rem; color: #999;">
            Genlove © 2026 - Santé et compatibilité
          </div>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// API ROUTES
// ============================================
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, genotype } = req.body;
    
    if (!firstName || !lastName || !genotype) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }
    
    const newUser = new User({ firstName, lastName, genotype });
    await newUser.save();
    res.json({ success: true, user: newUser._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ GENLOVE DÉMARRÉ SUR PORT ${port}`);
  console.log('='.repeat(50));
});