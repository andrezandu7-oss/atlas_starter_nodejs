// ============================================
// GENLOVE - VERSION SIMPLE SANS CHARTE
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
  });

// Schéma User
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

// Styles
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
    }
    .page-white { 
      background: white; 
      min-height: 100vh; 
      padding: 25px 20px; 
      text-align: center;
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
      width: 100%; 
      margin: 20px 0; 
      border: none; 
      cursor: pointer; 
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
      width: 100%; 
      border: none; 
      cursor: pointer; 
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
// ROUTE API
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
// PAGE ACCUEIL
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
            
            <div style="width:100%; margin-top:20px;">
              <a href="/signup" class="btn-pink" style="text-decoration:none;">Créer un compte</a>
              
              <p style="font-size:0.9rem; color:#1a2a44; margin:20px 0 10px 0;">Déjà membre ?</p>
              <a href="/profile" class="btn-dark" style="text-decoration:none;">Se connecter</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// PAGE INSCRIPTION
// ============================================
app.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${styles}</head>
      <body>
        <div class="app-shell">
          <div class="page-white">
            <h2 style="color:#ff416c; margin-top:0;">Créer un compte</h2>
            
            <form onsubmit="saveUser(event)">
              <!-- Photo -->
              <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                <span id="t">📸 Photo</span>
              </div>
              <input type="file" id="i" style="display:none" onchange="preview(event)">
              
              <!-- Champs -->
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
              
              <div style="display:flex; gap:10px;">
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
              
              <!-- Engagement -->
              <div class="serment-container">
                <input type="checkbox" id="oath" style="width:20px; height:20px;" required>
                <label for="oath" class="serment-text">Je certifie que mes informations sont exactes</label>
              </div>
              
              <button type="submit" class="btn-pink">S'inscrire</button>
              <a href="/" style="display:block; margin-top:15px; color:#666; text-decoration:none;">← Retour</a>
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
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('userId', result.user);
                localStorage.setItem('userPhoto', userData.photo);
                window.location.href = '/profile';
              } else {
                alert('Erreur: ' + result.error);
              }
            } catch (err) {
              alert('Erreur: ' + err.message);
            }
          }
        </script>
      </body>
    </html>
  `);
});

// ============================================
// PAGE PROFIL
// ============================================
app.get('/profile', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${styles}</head>
      <body>
        <div class="app-shell">
          <div class="page-white" id="profileContent">
            <h2 style="color:#ff416c;">Profil</h2>
            <p>Chargement...</p>
          </div>
        </div>
        
        <script>
          // Récupérer les données
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const photo = localStorage.getItem('userPhoto') || '';
          
          if (user.firstName) {
            document.getElementById('profileContent').innerHTML = \`
              <h2 style="color:#ff416c;">Bienvenue \${user.firstName} !</h2>
              
              <div style="width:110px; height:110px; border-radius:50%; margin:20px auto; background-image:url('\${photo}'); background-size:cover; background-position:center; border:3px solid #ff416c;"></div>
              
              <div style="background:#fff5f7; padding:20px; border-radius:15px; margin:20px 0; text-align:left;">
                <p><b>Nom complet:</b> \${user.firstName} \${user.lastName}</p>
                <p><b>Genre:</b> \${user.gender || 'Non précisé'}</p>
                <p><b>Date naissance:</b> \${user.dob || 'Non précisée'}</p>
                <p><b>Résidence:</b> \${user.residence || 'Non précisée'}</p>
                <p><b>Génotype:</b> \${user.genotype}</p>
                <p><b>Groupe sanguin:</b> \${user.bloodGroup || 'Non renseigné'}</p>
                <p><b>Désir d'enfant:</b> \${user.desireChild || 'Non précisé'}</p>
              </div>
              
              <a href="/" class="btn-dark" style="text-decoration:none;">Retour accueil</a>
            \`;
          } else {
            document.getElementById('profileContent').innerHTML += \`
              <p>Aucune donnée trouvée.</p>
              <a href="/signup" class="btn-pink" style="text-decoration:none;">Créer un compte</a>
            \`;
          }
        </script>
      </body>
    </html>
  `);
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ GENLOVE - VERSION SIMPLE`);
  console.log(`🌍 Port: ${port}`);
  console.log('='.repeat(50));
});