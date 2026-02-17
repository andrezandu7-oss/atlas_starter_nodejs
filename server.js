// ============================================
// GENLOVE - ÉTAPE 3 (Schéma User + Inscription)
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connexion MongoDB
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connecté !'))
  .catch(err => {
    console.error('❌ MongoDB:', err.message);
    process.exit(1);
  });

// ============================================
// SCHÉMA USER
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
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// ============================================
// STYLES (identiques à l'étape 2)
// ============================================
const styles = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', sans-serif; 
      background: #fdf2f2; 
      display: flex; 
      justify-content: center;
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
    .page-white { 
      background: white; 
      min-height: 100vh; 
      padding: 25px 20px; 
      text-align: center;
    }
    .input-box { 
      width: 100%; 
      padding: 14px; 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      margin-top: 10px; 
      font-size: 1rem; 
      background: #f8f9fa; 
    }
    .btn-pink { 
      background: #ff416c; 
      color: white; 
      padding: 18px; 
      border-radius: 50px; 
      text-decoration: none; 
      font-weight: bold; 
      display: block; 
      width: 85%; 
      margin: 20px auto; 
      border: none; 
      cursor: pointer; 
    }
    .btn-dark { 
      background: #1a2a44; 
      color: white; 
      padding: 18px; 
      border-radius: 12px; 
      text-decoration: none; 
      font-weight: bold; 
      display: block; 
      margin: 15px; 
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
    }
    .home-screen { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      padding: 30px; 
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
      cursor: pointer; 
      background-size: cover; 
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
    }
    .serment-text { 
      font-size: 0.82rem; 
      color: #d63384; 
    }
  </style>
`;

// ============================================
// ROUTE API D'INSCRIPTION
// ============================================
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, gender, dob, residence, genotype, bloodGroup, desireChild, photo } = req.body;
    
    if (!firstName || !lastName || !genotype) {
      return res.status(400).json({ error: "Prénom, Nom et Génotype obligatoires" });
    }
    
    const newUser = new User({
      firstName, lastName, gender, dob, residence, 
      genotype, bloodGroup, desireChild,
      photo: photo || "https://via.placeholder.com/150?text=👤"
    });
    
    await newUser.save();
    res.json({ success: true, user: newUser._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// PAGE D'ACCUEIL
// ============================================
app.get('/', (req, res) => {
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
              <a href="/signup" style="color:#1a2a44;text-decoration:none;font-weight:bold;display:block;margin-top:15px;">Créer un compte</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// PAGE D'INSCRIPTION
// ============================================
app.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${styles}</head>
      <body>
        <div class="app-shell">
          <div class="page-white">
            <h2 style="color:#ff416c;margin-top:0;">Configuration Santé</h2>
            <form onsubmit="saveUser(event)">
              <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                <span id="t">📸 Photo</span>
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
              <select id="gt" class="input-box" required>
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex;gap:10px;">
                <select id="gs_type" class="input-box" style="flex:2;">
                  <option value="">Groupe</option>
                  <option>A</option><option>B</option><option>AB</option><option>O</option>
                </select>
                <select id="gs_rh" class="input-box" style="flex:1;">
                  <option>+</option><option>-</option>
                </select>
              </div>
              <select id="pj" class="input-box">
                <option value="">Désir d'enfant ?</option>
                <option>Oui</option><option>Non</option>
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
          let b64 = "";
          
          function preview(e) {
            const r = new FileReader();
            r.onload = () => {
              b64 = r.result;
              document.getElementById('c').style.backgroundImage = 'url(' + b64 + ')';
              document.getElementById('t').style.display = 'none';
            };
            r.readAsDataURL(e.target.files[0]);
          }
          
          async function saveUser(e) {
            e.preventDefault();
            
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
              
              if (response.ok) {
                localStorage.setItem('current_user_data', JSON.stringify(userData));
                localStorage.setItem('current_user_photo', userData.photo);
                localStorage.setItem('current_user_id', result.user);
                alert('✅ Inscription réussie !');
                window.location.href = '/';
              } else {
                alert('❌ Erreur: ' + result.error);
              }
            } catch (err) {
              alert('❌ Erreur: ' + err.message);
            }
          }
        </script>
      </body>
    </html>
  `);
});

// ============================================
// PAGE PROFIL (temporaire)
// ============================================
app.get('/profile', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${styles}</head>
      <body>
        <div class="app-shell">
          <div class="page-white">
            <h2 style="color:#ff416c;">Profil</h2>
            <p>Page profil en construction</p>
            <a href="/" class="btn-dark">Retour accueil</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// ROUTE API HEALTH
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    users: mongoose.connection.readyState === 1 ? await User.countDocuments() : 0
  });
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ GENLOVE ÉTAPE 3 - SCHÉMA USER`);
  console.log(`🌍 Port: ${port}`);
  console.log('='.repeat(50));
});