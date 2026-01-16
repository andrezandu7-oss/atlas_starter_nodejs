const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- LOGIQUE DE SÉCURITÉ GENLOVE (Blocage SS) ---
const checkCompatibility = (userGenotype, partnerGenotype) => {
    if (userGenotype === 'SS' && partnerGenotype === 'SS') return false; 
    return true;
};

// --- ROUTE ÉCRAN D'ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove - L’amour qui soigne</title>
        <style>
            body { 
                font-family: 'Segoe UI', sans-serif; 
                background: linear-gradient(135deg, #ff416c, #ff4b2b); 
                height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; 
            }
            .card { 
                background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); 
                padding: 40px; border-radius: 30px; text-align: center; 
                width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3);
                box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            }
            h1 { font-size: 2.5rem; margin-bottom: 5px; }
            .slogan { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
            .quote { 
                background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; 
                font-style: italic; line-height: 1.5; margin-bottom: 40px;
            }
            .btn { 
                display: block; width: 100%; padding: 15px; margin: 10px 0; 
                border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; 
                cursor: pointer; text-decoration: none; transition: 0.3s;
            }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
            .footer { margin-top: 30px; font-size: 0.8rem; opacity: 0.8; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <div class="slogan">L’amour qui soigne 💙</div>
            
            <div class="quote">
                "L’amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides 💖"
            </div>

            <a href="#" class="btn btn-login">📌 Se connecter</a>
            <a href="#" class="btn btn-signup">📝 S’inscrire</a>

            <div class="footer">
                🔒 Vos données sont sécurisées et confidentielles
            </div>
        </div>
    </body>
    </html>
    `);
});

app.listen(port, () => {
    console.log('Genlove est lancé sur le port ' + port);
});
