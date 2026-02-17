// ============================================
// GENLOVE - ÉTAPE 2 (Styles CSS complets)
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connexion MongoDB
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connecté !'))
  .catch(err => {
    console.error('❌ MongoDB:', err.message);
    process.exit(1);
  });

// Styles CSS complets (identiques à l'original)
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
    }
  </style>
`;

// Page d'accueil avec styles
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
            <div style="font-size:0.75rem;color:#666;margin-top:25px;">Vos données sont cryptées et confidentielles.</div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Routes temporaires (redirection vers accueil)
app.get('/profile', (req, res) => res.redirect('/'));
app.get('/signup', (req, res) => res.redirect('/'));

// Route API
app.get('/api/health', (req, res) => {
  res.json({ success: true, mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ GENLOVE ÉTAPE 2 - STYLES COMPLETS`);
  console.log(`🌍 Port: ${port}`);
  console.log('='.repeat(50));
});