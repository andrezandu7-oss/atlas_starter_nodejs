const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- LOGIQUE DE SÉCURITÉ GENLOVE ---
// Cette fonction sera utilisée pour filtrer les partenaires
const canMatch = (userGeno, partnerGeno) => {
    if (userGeno === 'SS' && partnerGeno === 'SS') return false; // BLOCAGE SS-SS
    return true;
};

// --- PAGE D'ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove - L'amour qui soigne</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
            h1 { font-size: 2.5rem; margin: 0; }
            .slogan { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
            .quote { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; font-style: italic; line-height: 1.5; margin-bottom: 40px; }
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; transition: 0.3s; box-sizing: border-box; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <div class="slogan">L’amour qui soigne 💙</div>
            <div class="quote">"L’amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides 💖"</div>
            <a href="#" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup" class="btn btn-signup">📝 S’inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- PAGE D'INSCRIPTION (ÉTAPE 2) ---
app.get('/signup', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inscription - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
            .form-card { background: white; padding: 30px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 90%; max-width: 400px; }
            h2 { color: #ff416c; text-align: center; }
            .progress-container { background: #eee; border-radius: 10px; height: 10px; margin: 20px 0; }
            .progress-bar { background: #4caf50; height: 100%; width: 40%; border-radius: 10px; }
            .score-text { text-align: center; font-weight: bold; color: #4caf50; font-size: 0.9rem; margin-bottom: 20px; }
            input, select { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; }
            .btn-submit { background: #ff416c; color: white; border: none; width: 100%; padding: 15px; border-radius: 50px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="form-card">
            <h2>Créer ton profil</h2>
            <div class="progress-container"><div class="progress-bar"></div></div>
            <div class="score-text">Score de Confiance actuel : 40% 🛡️</div>
            
            <form action="/complete" method="POST">
                <input type="text" placeholder="Ton Prénom" required>
                <select name="genotype" required>
                    <option value="">-- Choisis ton Génotype --</option>
                    <option value="AA">AA (Sain)</option>
                    <option value="AS">AS (Porteur)</option>
                    <option value="SS">SS (Drépanocytaire)</option>
                </select>
                <p style="font-size: 0.8rem; color: #666; text-align: center;">Note : Si vous êtes SS, vous ne verrez aucun profil SS pour votre sécurité.</p>
                <button type="submit" class="btn-submit">Continuer</button>
            </form>
        </div>
    </body>
    </html>
    `);
});

app.listen(port, () => {
    console.log('Genlove actif sur le port ' + port);
});
             
