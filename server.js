const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// ============================================
// CONFIGURATION VISUELLE (HEAD & STYLES)
// ============================================
const head = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💙</text></svg>">
  <title>Genlove - Engagement</title>
`;

const styles = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .home-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; text-align: center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; text-align: center; display: flex; flex-direction: column; justify-content: center; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-decoration: none; font-weight: bold; display: block; width: 100%; margin: 20px auto; border: none; cursor: pointer; text-align: center; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: bold; display: block; width: 100%; margin-top: 10px; }
    #charte-box { height: 300px; overflow-y: scroll; background: #fff5f7; border: 2px solid #ffdae0; border-radius: 15px; padding: 20px; font-size: 0.9rem; color: #444; line-height: 1.6; text-align: left; }
    b { color: #ff416c; }
  </style>
`;

// ============================================
// ROUTE 1 : ACCUEIL
// ============================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div class="home-screen">
            <div class="logo-text">
              <span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span>
            </div>
            <div class="slogan">Unissez cœur et santé</div>
            <div style="width:100%;">
              <a href="/charte-engagement" class="btn-pink">Commencer l'aventure</a>
              <p style="margin-top:15px; font-size:0.8rem; color:#666;">En cliquant, vous acceptez notre charte éthique.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// ROUTE 2 : CHARTE D'ENGAGEMENT
// ============================================
app.get('/charte-engagement', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div class="page-white">
            <div style="font-size:3rem;margin-bottom:10px;">🛡️</div>
            <h2 style="color:#1a2a44;margin-bottom:15px;">Charte d'Engagement</h2>
            
            <div id="charte-box" onscroll="checkScroll(this)">
              <b>1. Sincérité Médicale</b><br>
              Je m'engage à fournir des informations exactes concernant mon génotype. La sincérité protège les générations futures.<br><br>
              
              <b>2. Responsabilité Familiale</b><br>
              Je choisis consciemment de bâtir un foyer à l'abri des maladies génétiques évitables.<br><br>
              
              <b>3. Respect et Bienveillance</b><br>
              Il n'y a pas de "mauvais" génotype ; il n'y a que des porteurs de vie responsables.<br><br>
              
              <b>4. Confidentialité Absolue</b><br>
              Je promets de respecter la vie privée et de ne jamais stigmatiser les autres membres.<br><br>
              
              <b>5. Éthique de la Communauté</b><br>
              Je protégerai l'intégrité de Genlove pour la santé de tous.<br><br>
              
              <hr style="border:0;border-top:1px solid #ffdae0;margin:15px 0;">
              <center><i style="color:#ff416c;">Scrollez jusqu'en bas pour valider...</i></center>
            </div>

            <button id="agree-btn" onclick="window.location.href='/signup'" 
              class="btn-pink" style="background:#ccc; cursor:not-allowed;" disabled>
              J'ai lu et je m'engage
            </button>
            
            <a href="/" style="color:#666;text-decoration:none;font-size:0.8rem;">Annuler</a>
          </div>
        </div>

        <script>
          function checkScroll(el) {
            // Si on arrive à 5px du bas
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

// Route temporaire pour simuler la suite
app.get('/signup', (req, res) => {
  res.send("<h1>Félicitations !</h1><p>Vous avez accepté la charte. Le formulaire d'inscription arrive ici.</p><a href='/'>Retour</a>");
});

app.listen(port, () => {
  console.log(\`✅ Genlove Mini-App lancée sur http://localhost:\${port}\`);
});
