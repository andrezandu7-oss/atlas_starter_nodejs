const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- PAGE D'ACCUEIL : VERSION FINALE DU SLOGAN ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove - Bienvenue</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
            h1 { font-size: 2.5rem; margin-bottom: 15px; letter-spacing: 1px; }
            .tagline { font-size: 1rem; margin-bottom: 5px; opacity: 0.95; line-height: 1.4; }
            .mission { font-weight: bold; margin-bottom: 35px; font-size: 1.1rem; line-height: 1.4; }
            .highlight { text-transform: uppercase; border-bottom: 2px solid white; }
            .btn { display: block; width: 100%; padding: 16px; margin: 12px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 1rem; transition: 0.3s; box-sizing: border-box; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
            .btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p class="tagline">"L'amour qui prend soin de votre avenir."</p>
            <p class="mission">Unissez cœur et santé pour bâtir des couples <span class="highlight">Solides</span></p>
            
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup-full" class="btn btn-signup">📝 S'inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- (Gardez les routes /signup-full, /search et /dashboard précédentes ici) ---

app.listen(port, () => { console.log('Genlove is LIVE on port ' + port); });
