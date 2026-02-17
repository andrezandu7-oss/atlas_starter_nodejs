const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares indispensables pour Render
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connexion MongoDB (Nécessaire si ton Render attend une DB)
const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
    mongoose.connect(mongoURI)
      .then(() => console.log('✅ MongoDB Connecté'))
      .catch(err => console.error('❌ Erreur DB:', err));
}

// --- CONFIGURATION VISUELLE ---
const head = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💙</text></svg>">
  <title>Genlove</title>
`;

const styles = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .home-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; text-align: center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-decoration: none; font-weight: bold; display: block; width: 90%; margin: 20px auto; border: none; cursor: pointer; text-align: center; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: bold; display: block; width: 90%; margin: 10px auto; text-align: center; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; text-align: center; display: flex; flex-direction: column; justify-content: center; }
    #charte-box { height: 280px; overflow-y: scroll; background: #fff5f7; border: 2px solid #ffdae0; border-radius: 15px; padding: 20px; font-size: 0.9rem; color: #444; line-height: 1.6; text-align: left; margin: 15px 0; }
    b { color: #ff416c; }
  </style>
`;

// --- ROUTES ---

// 1. Accueil
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div class="home-screen">
            <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <p style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">Unissez cœur et santé</p>
            <a href="/charte-engagement" class="btn-pink">Créer un compte</a>
            <a href="/profile" class="btn-dark">Se connecter</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// 2. Charte d'Engagement
app.get('/charte-engagement', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div class="page-white">
            <h2 style="color:#1a2a44;">Engagement Éthique</h2>
            <div id="charte-box" onscroll="checkScroll(this)">
              <b>1. Sincérité Médicale</b><br>Je m'engage à fournir mon vrai génotype.<br><br>
              <b>2. Responsabilité</b><br>Je choisis de protéger ma future descendance.<br><br>
              <b>3. Respect</b><br>La bienveillance est obligatoire envers tous.<br><br>
              <b>4. Confidentialité</b><br>Je ne divulguerai aucune info privée.<br><br>
              <b>5. Éthique</b><br>Je signale tout profil frauduleux.<br><br>
              <center><i>--- Continuez à scroller pour valider ---</i></center>
            </div>
            <button id="agree-btn" onclick="location.href='/signup'" class="btn-pink" style="background:#ccc; cursor:not-allowed;" disabled>J'ai lu et je m'engage</button>
            <a href="/" style="color:#666; text-decoration:none; font-size:0.8rem;">Annuler</a>
          </div>
        </div>
        <script>
          function checkScroll(el) {
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 2) {
              const btn = document.getElementById('agree-btn');
              btn.disabled = false;
              btn.style.background = '#ff416c';
              btn.style.cursor = 'pointer';
            }
          }
        </script>
      </body>
    </html>
  `);
});

// Route factice pour tester le bouton de la charte
app.get('/signup', (req, res) => { res.send("Bienvenue sur la page d'inscription !"); });
app.get('/profile', (req, res) => { res.send("Page de profil (Connexion)"); });

// --- LANCEMENT ---
app.listen(port, '0.0.0.0', () => {
  console.log(\`✅ Serveur actif sur le port \${port}\`);
});
